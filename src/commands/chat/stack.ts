import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChannelType, ChatInputCommandInteraction, ComponentType, ContainerBuilder, GuildMember, Message, MessageFlags, SendableChannels, SeparatorBuilder, SeparatorSpacingSize, TextBasedChannel, TextDisplayBuilder } from 'discord.js';
import { Error } from 'mongoose';
import { ChatInputCommand } from '../../Classes/index.js';

// this probably SUCKS we should find a prettier way to do it
const stackStore = new Map<string, string>();

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName("stack")
		.setDescription("Talking over people wouldn't be very dark woke of you")
	)
	.setExecute(run);


/**
 *
 * @param interaction
 * @param invoker
 */
async function createStack(interaction: ChatInputCommandInteraction, invoker: GuildMember) {
	const theStack = new StackBox(interaction, invoker);
	theStack.run();
	await interaction.reply({content: "stack created!", flags: MessageFlags.Ephemeral});
}

/**
 *
 * @param interaction
 */
async function run(interaction: ChatInputCommandInteraction<CacheType>) {
	// probably unnecessary but making sure we don't cache miss
	let invoker!: GuildMember;
	if (interaction.inCachedGuild()) invoker = interaction.guild.members.cache.get(interaction.member.id) as GuildMember;
	else await interaction.guild?.members.fetch(interaction.user.id).then((m) => { invoker = m; });

	// first make sure we're in a voice channel
	if (interaction.channel?.type !== ChannelType.GuildVoice) {
		await interaction.reply({
			content: "use this in a voice channel",
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// is the user actually in the voice channel
	// const invoker = interaction.guild?.members.cache.get(interaction.member?.user.id as string);
	if (invoker.voice.channel?.id !== interaction.channelId) {
		await interaction.reply({
			content: "you need to be in the voice channel to use its stack",
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// no stack?
	const stackId = stackStore.get(interaction.channelId);
	if (!stackId) {
		await createStack(interaction, invoker);
	} else { // stack!!
		try {
			await interaction.channel.messages.fetch(stackId).then(async (msg) => {
				await interaction.reply({
					content: `here it is ${msg.url}`,
					flags:MessageFlags.Ephemeral
				});
			});
		} catch {
			// stack message was deleted and not accounted for
			stackStore.delete(interaction.channelId);
			await createStack(interaction, invoker); // making the new one
		}
	}
}

class StackBox {
	running: boolean;
	owner?: GuildMember;
	speaking?: GuildMember;
	channel: TextBasedChannel;
	message?: Message;
	queue: GuildMember[];
	speakerQueue: [GuildMember, boolean][]; // the member, and whether or not they've been marked time-sensitive
	lastUpdateUnix: number;

	constructor(interaction: ChatInputCommandInteraction, initialOwner: GuildMember) {
		this.running = false;
		this.owner = initialOwner;
		this.channel = interaction.channel!;
		this.queue = [];
		this.speakerQueue = [];
		this.lastUpdateUnix = 0;
	}

	async update() {
		await this.owner?.voice.fetch().then((voice) => {
			if (voice.channelId !== this.message?.channelId) this.owner = undefined;
		})

		this.lastUpdateUnix = Date.now();
	}

	async render() {
		const container = new ContainerBuilder()
			.setAccentColor(0x7289da)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent("im stackin it"))
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# Currently Speaking: ${!this.speaking?.id ? "nobody!" : `<@${this.speaking?.id}>`}`));
		let queueRendered = "Current queue:";
		this.speakerQueue.forEach((m) => {
			queueRendered += `\n- <@${m[0].id}>`
			if (m[1]) queueRendered += " ⏰";
		});
		container.addTextDisplayComponents(new TextDisplayBuilder().setContent(queueRendered))
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(`stack owner: `));

		const buttons = new ActionRowBuilder<ButtonBuilder>()
			.addComponents([
				new ButtonBuilder()
					.setStyle(ButtonStyle.Secondary)
					.setCustomId("addToQueue")
					.setLabel("➕"),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Secondary)
					.setCustomId("goNext")
					.setLabel("➡️")
			]);
		
		if (!this.message) {
			this.message = await (this.channel as SendableChannels).send({components: [container, buttons], flags: MessageFlags.IsComponentsV2});
			stackStore.set(this.channel.id, this.message.id);
		} else await this.message.edit({components: [container, buttons], flags: MessageFlags.IsComponentsV2});

		const collector = this.message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10_000 });
		collector.on("collect", async a => {
			// first make sure user is in the channel
			const member = a.guild!.members.cache.get(a.user.id)!;
			if ((await member.voice.fetch()).channelId !== this.channel.id) {
				a.reply({ content: "you need to be in the voice channel to use its stack", flags: MessageFlags.Ephemeral });
				return;
			}

			switch (a.customId) {
				case "addToQueue":
					await this.addToQueue(a);
					break;
				case "goNext":
					await this.nextInQueue(a);
					break;
				default:
					break;
			}
		})
	}

	async run() {
		this.running = true;
		for (;;) {
			if (!this.running) break;
			if (Date.now() - this.lastUpdateUnix >= 30000) await this.update();
			this.render();
			await new Promise(r => setTimeout(r, 10000))
		}
	}
	
	async nextInQueue(interaction: ButtonInteraction) {
		// simple front to back queue
		if (this.speakerQueue.length === 0) {
			interaction.reply({ content: "looks like the stack is empty!", flags: MessageFlags.Ephemeral });
		}
		else {
			this.speaking = this.speakerQueue.shift()![0]; // this looks so ugly i love it
			interaction.reply({ content: `<@${this.speaking.id}> is up!`});
		}
	}

	async addToQueue(interaction: ButtonInteraction) {
		if (!this.speakerQueue.find((s) => s[0].id == interaction.user.id)) {
			this.speakerQueue.push([interaction.guild!.members.cache.get(interaction.user.id)!, false]);
			await interaction.reply({content: "added! your entry will be reflected in the stack soon", flags: MessageFlags.Ephemeral});
		} else {
			await interaction.reply({content: "looks like you're already in the stack", flags: MessageFlags.Ephemeral});
		}
	}

	// TODO: do this
	toggleTimeSensitive(interaction: ButtonInteraction) {
		throw new Error("not implememted yet - how did this get called?");
	}
}
