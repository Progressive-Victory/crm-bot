import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	ContainerBuilder,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	Message,
	MessageFlags,
	PermissionsBitField,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	VoiceBasedChannel
} from "discord.js";
import { sm } from '../../index.js';

const containerColor = 0x7289da;

export class StackBox {
  running: boolean = false;
  speaking?: GuildMember;
  message?: Message;
  speakerQueue: [GuildMember, boolean][] = []; // the member, and whether or not they've been marked time-sensitive
  lastUpdateUnix = new Date();
  initialRendered = false;
  renderBatched = false;
  owner: GuildMember | null

  constructor(
    readonly channel: VoiceBasedChannel,
    owner: GuildMember,
  ) {
	this.owner = owner
  }

  async createMessage() {
	this.message = await this.channel.send({
		flags: MessageFlags.IsComponentsV2,
		components: this.render()
	})
	return this.message
  }

  async editMessage() {
	if(this.message === undefined) return this.createMessage();
	
	// other interactions can change the underlying data but we batch them into one edit
	// call so discord doesn't come to my house 
	if (!this.renderBatched) {
		this.renderBatched = true
		setTimeout(async () => {
			this.message = await this.message?.edit({
				flags: MessageFlags.IsComponentsV2,
				components: this.render()
			});
			this.renderBatched = false;
		}, 5*1000);
	}
	return this.message;
  }


getSpeakerIndex(member:GuildMember) {
	return this.speakerQueue.findIndex(
      (s) => s[0].id === member.id,
    );
}
//   async update() {
//     const voice = await this.owner?.voice.fetch()
// 	if (voice?.channelId !== this.message?.channelId) this.owner = undefined;
//     this.lastUpdateUnix = Date.now();
//   }

  private render() {
	const container = new ContainerBuilder()
		.setAccentColor(containerColor)
		.addTextDisplayComponents(
           new TextDisplayBuilder().setContent("Im stackin it"),
 		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setDivider(true)
				.setSpacing(SeparatorSpacingSize.Small)
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder()
				.setContent(`Currently Speaking: ${this.owner?.toString() ?? "nobody!"}`)
		);
	let queueRendered = "Current queue:";
	this.speakerQueue.forEach(q => {
		queueRendered += `\n- ${q[0].toString()}`;
		if (q[1]) queueRendered += " ⏰";
	});
	container.addTextDisplayComponents(new TextDisplayBuilder({content: queueRendered}));

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(this.channel.client.arrayToCustomId('stack','addToQueue'))
        .setEmoji("➕"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(this.channel.client.arrayToCustomId('stack','toggleTimeSensitive'))
        .setEmoji("⏰"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(this.channel.client.arrayToCustomId('stack','removeFromQueue'))
        .setEmoji("✖️"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(this.channel.client.arrayToCustomId('stack','goNext'))
        .setEmoji("➡️"),
    ]);
	return [container, row]
  }

/**
 * 
 * TODO: 
 * move this to stack button interaction file
 */
  
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
	  sm.update(interaction.channel as VoiceBasedChannel, {
		add: [await interaction.guild!.members.fetch(interaction.user.id)!, false]
	  });
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
      sm.update(interaction.channel as VoiceBasedChannel, {
		add: [await interaction.guild!.members.fetch(interaction.user.id), true]
	  });
      void interaction.editReply({
        content:
          "Added as time sensitive! Your entry will be reflected in the stack soon",
      });
    } else {
      sm.update(interaction.channel as VoiceBasedChannel, {
		urgent: spot // toggle the time sensitive marker
	  }); 
      void interaction.editReply({
        content: "Time-sensitive status toggled",
      });
    }
  }

  async removeFromQueue(interaction:ButtonInteraction) {
	void interaction.deferReply({flags: MessageFlags.Ephemeral});
	const spot = this.speakerQueue.findIndex(s => s[0].id === interaction.user.id);
	if (spot === -1) {
		void interaction.editReply({
			content: "You're already not on the stack!"
		});
	} else {
		sm.update(interaction.channel as VoiceBasedChannel, {
			remove: spot
		});
		void interaction.editReply({
			content: "Removed from the stack"
		});
	}
	
  }
}
