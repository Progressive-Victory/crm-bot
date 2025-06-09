import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	Collection,
	ContainerBuilder,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	heading,
	Message,
	MessageFlags,
	PermissionsBitField,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextBasedChannel,
	TextDisplayBuilder
} from "discord.js";
import { client } from "../index.js";

// this probably SUCKS we should find a prettier way to do it
export const stackStore = new Collection<string, StackBox>();

export class StackBox {
  running: boolean = false;
  speaking?: GuildMember;
  message?: Message;
  speakerQueue: [GuildMember, boolean][] = []; // the member, and whether or not they've been marked time-sensitive
  lastUpdateUnix: number = 0;
  initialRendered: boolean = false;
  renderLocked: boolean = false;

  constructor(
    readonly channel: TextBasedChannel,
    public owner?: GuildMember,
  ) {

  }

  async update() {
    const voice = await this.owner?.voice.fetch()
	if (voice?.channelId !== this.message?.channelId) this.owner = undefined;
    this.lastUpdateUnix = Date.now();
  }

  async render(): Promise<boolean> {
    const container = new ContainerBuilder()
      .setAccentColor(0x7289da)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Im stackin it"),
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(heading(`Currently Speaking: ${!this.speaking ? "nobody!" : this.speaking.toString()}`)),
      );
    let queueRendered = "Current queue:";
    this.speakerQueue.forEach((m) => {
      queueRendered += `\n- ${m[0].toString()}`;
      if (m[1]) queueRendered += " ⏰";
    });
    container
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(queueRendered),
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`stack owner: `),
      );

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`stack${client.splitCustomIdOn}addToQueue`)
        .setLabel("➕"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`stack${client.splitCustomIdOn}toggleTimeSensitive`)
        .setLabel("⏰"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`stack${client.splitCustomIdOn}removeFromQueue`)
        .setLabel("✖️"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`stack${client.splitCustomIdOn}goNext`)
        .setLabel("➡️"),
    ]);

    if (!this.message) {
      if (this.initialRendered) return false; // assume that if the stack message had been deleted, we can exit and let the stack go
      if (!this.channel.isSendable()) throw Error('Channel not sendable ')
	 
	  this.message = await this.channel.send({
        components: [container, buttons],
        flags: MessageFlags.IsComponentsV2,
      });
      stackStore.set(this.channel.id, this);
    } else
      void this.message.edit({
        components: [container, buttons],
        flags: MessageFlags.IsComponentsV2,
      });

    return true;
  }

  async run(): Promise<void> {
    this.running = true;
    for (;;) {
      if (!this.running) break;
      if (Date.now() - this.lastUpdateUnix >= 30000) await this.update();
      // if the stack message was deleted running will get unset and we'll break out
      this.render().then((r) => (this.running = r));
      await new Promise((r) => setTimeout(r, 10000));
    }
  }

  async onButton(interaction: ButtonInteraction) {
	void interaction.deferReply({flags: MessageFlags.Ephemeral})
	let guild: Guild | undefined
	let member: GuildMember
	let channel: GuildTextBasedChannel 
	if(interaction.inCachedGuild()) {
		guild = interaction.guild
		member = interaction.member
		channel = interaction.channel ?? await guild.channels.fetch(interaction.channelId) as GuildTextBasedChannel
	}
	else if (interaction.inRawGuild()) {
		guild = await interaction.client.guilds.fetch(interaction.guildId)
		member = await guild.members.fetch(interaction.user.id)
		channel = await guild.channels.fetch(interaction.channelId) as GuildTextBasedChannel

	}
	else throw Error('stack button used outside of guild')

	// first make sure user is in the channel
	const voice = member.voice
    if (voice.channelId !== channel.id && channel.type === ChannelType.GuildVoice) {
    	interaction.editReply({
          content: "You need to be in the voice channel to use its stack",
        });
        return;
    }

    switch (interaction.customId.split(interaction.client.splitCustomIdOn!)[1]) {
        case "addToQueue":
          await this.addToQueue(interaction);
          break;
        case "goNext":
          await this.nextInQueue(interaction);
          break;
        case "toggleTimeSensitive":
          await this.toggleTimeSensitive(interaction);
          break;
        case "removeFromQueue":
          this.removeFromQueue(interaction);
          break;
        default:
          break;
    }
  }

  async nextInQueue(interaction: ButtonInteraction) {
	void interaction.deferReply({flags: MessageFlags.Ephemeral})
    // does the stack have an owner?
    const invoker = await interaction.guild!.members.fetch(
      interaction.user.id,
    )!;
    if (!this.owner) this.owner = invoker; // now it does

    if (
      this.owner!.id !== interaction.user.id &&
      invoker
        .permissionsIn(interaction.channelId)
        .missing(PermissionsBitField.Flags.ManageMessages)
    ) {
      void interaction.editReply({
        content: "whoops can't do that",
      });
      return;
    }

    // simple front to back queue
    if (this.speakerQueue.length === 0) {
      void interaction.editReply({
        content: "Looks like the stack is empty!",
      });
    } else {
      this.speaking = this.speakerQueue.shift()![0]; // this looks so ugly i love it
      void interaction.editReply({ content: `${this.speaking.toString()} is up!` });
    }
  }

  async addToQueue(interaction: ButtonInteraction) {
	void interaction.deferReply({flags: MessageFlags.Ephemeral})
	
    if (!this.speakerQueue.find((s) => s[0].id == interaction.user.id)) {
      this.speakerQueue.push([
        await interaction.guild!.members.fetch(interaction.user.id)!,
        false,
      ]);
      void interaction.editReply({
        content: "Added! your entry will be reflected in the stack soon",
      });
    } else {
      void interaction.editReply({
        content: "Looks like you're already in the stack",
      });
    }
  }

  // TODO: do this
  async toggleTimeSensitive(interaction: ButtonInteraction) {
	void interaction.deferReply({flags: MessageFlags.Ephemeral})
    const spot = this.speakerQueue.findIndex(
      (s) => s[0].id === interaction.user.id,
    );
    if (spot === -1) {
      this.speakerQueue.push([
        await interaction.guild!.members.fetch(interaction.user.id)!,
        true,
      ]);
      void interaction.editReply({
        content:
          "Added as time sensitive! Your entry will be reflected in the stack soon",
      });
    } else {
      this.speakerQueue[spot][1] = !this.speakerQueue[spot][1]; // toggle the time sensitive marker
      void interaction.editReply({
        content: "Time-sensitive status toggled",
      });
    }
  }

  removeFromQueue(interaction: ButtonInteraction) {
    const spot = this.speakerQueue.findIndex(
      (s) => s[0].id === interaction.user.id,
    );
    if (spot === -1)
      void interaction.reply({
        content: "You're already not on the stack!",
        flags: MessageFlags.Ephemeral,
      });
    else {
      this.speakerQueue.splice(spot, 1);
      void interaction.reply({
        content: "Removed from stack!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
