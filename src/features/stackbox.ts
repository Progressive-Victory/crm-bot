import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	ContainerBuilder,
	GuildMember,
	Message,
	MessageFlags,
	PermissionsBitField,
	SendableChannels,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextBasedChannel,
	TextDisplayBuilder
} from "discord.js";

// this probably SUCKS we should find a prettier way to do it
export const stackStore = new Map<string, StackBox>();

export class StackBox {
  running: boolean = false;
  owner?: GuildMember;
  speaking?: GuildMember;
  channel: TextBasedChannel;
  message?: Message;
  speakerQueue: [GuildMember, boolean][] = []; // the member, and whether or not they've been marked time-sensitive
  lastUpdateUnix: number = 0;
  initialRendered: boolean = false;
  renderLocked: boolean = false;

  constructor(
    interaction: ChatInputCommandInteraction,
    initialOwner: GuildMember,
  ) {
    this.owner = initialOwner;
    this.channel = interaction.channel!;
  }

  async update() {
    await this.owner?.voice.fetch().then((voice) => {
      if (voice.channelId !== this.message?.channelId) this.owner = undefined;
    });

    this.lastUpdateUnix = Date.now();
  }

  async render(): Promise<boolean> {
    const container = new ContainerBuilder()
      .setAccentColor(0x7289da)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("im stackin it"),
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# Currently Speaking: ${!this.speaking?.id ? "nobody!" : `<@${this.speaking?.id}>`}`,
        ),
      );
    let queueRendered = "Current queue:";
    this.speakerQueue.forEach((m) => {
      queueRendered += `\n- <@${m[0].id}>`;
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
        .setCustomId("stack-addToQueue")
        .setLabel("➕"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("stack-toggleTimeSensitive")
        .setLabel("⏰"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId("stack-removeFromQueue")
        .setLabel("✖️"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("stack-goNext")
        .setLabel("➡️"),
    ]);

    if (!this.message) {
      if (this.initialRendered) return false; // assume that if the stack message had been deleted, we can exit and let the stack go
      this.message = await (this.channel as SendableChannels).send({
        components: [container, buttons],
        flags: MessageFlags.IsComponentsV2,
      });
      stackStore.set(this.channel.id, this);
    } else
      await this.message.edit({
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
	// first make sure user is in the channel
    const member = await interaction.guild!.members.fetch(interaction.user.id)!;
	const voice = await member.voice.fetch().catch(() => { return undefined; });
    if (!voice || voice.channelId !== interaction.channelId) {
    	interaction.reply({
          content: "you need to be in the voice channel to use its stack",
          flags: MessageFlags.Ephemeral,
        });
        return;
    }

    switch (interaction.customId) {
        case "stack-addToQueue":
          await this.addToQueue(interaction);
          break;
        case "stack-goNext":
          await this.nextInQueue(interaction);
          break;
        case "stack-toggleTimeSensitive":
          await this.toggleTimeSensitive(interaction);
          break;
        case "stack-removeFromQueue":
          await this.removeFromQueue(interaction);
          break;
        default:
          break;
    }
  }

  async nextInQueue(interaction: ButtonInteraction) {
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
      await interaction.reply({
        content: "whoops can't do that",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // simple front to back queue
    if (this.speakerQueue.length === 0) {
      interaction.reply({
        content: "looks like the stack is empty!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      this.speaking = this.speakerQueue.shift()![0]; // this looks so ugly i love it
      interaction.reply({ content: `<@${this.speaking.id}> is up!` });
    }
  }

  async addToQueue(interaction: ButtonInteraction) {
    if (!this.speakerQueue.find((s) => s[0].id == interaction.user.id)) {
      this.speakerQueue.push([
        await interaction.guild!.members.fetch(interaction.user.id)!,
        false,
      ]);
      await interaction.reply({
        content: "added! your entry will be reflected in the stack soon",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "looks like you're already in the stack",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  // TODO: do this
  async toggleTimeSensitive(interaction: ButtonInteraction) {
    const spot = this.speakerQueue.findIndex(
      (s) => s[0].id === interaction.user.id,
    );
    if (spot === -1) {
      this.speakerQueue.push([
        await interaction.guild!.members.fetch(interaction.user.id)!,
        true,
      ]);
      await interaction.reply({
        content:
          "added as time sensitive! your entry will be reflected in the stack soon",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      this.speakerQueue[spot][1] = !this.speakerQueue[spot][1]; // toggle the time sensitive marker
      await interaction.reply({
        content: "time-sensititve status toggled",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async removeFromQueue(interaction: ButtonInteraction) {
    const spot = this.speakerQueue.findIndex(
      (s) => s[0].id === interaction.user.id,
    );
    if (spot === -1)
      await interaction.reply({
        content: "you're already not on the stack!",
        flags: MessageFlags.Ephemeral,
      });
    else {
      this.speakerQueue.splice(spot, 1);
      await interaction.reply({
        content: "removed from stack!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
