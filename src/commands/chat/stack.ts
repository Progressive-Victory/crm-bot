import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChannelType, ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, MessageFlags, TextDisplayBuilder, VoiceBasedChannel } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';
import { sm } from '../../features/stack/index.js';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName("stack")
		.setDescription("Talking over people wouldn't be very dark woke of you")
	)
	.setExecute(run);



/**
 *
 * @param interaction The interaction fed to the bot
 * @param invoker The owner of the interaction
 */
async function createStack(interaction: ChatInputCommandInteraction, invoker: GuildMember) {
	let channel: GuildTextBasedChannel
	if(interaction.inCachedGuild()) channel = interaction.channel ?? await interaction.guild.channels.fetch(interaction.channelId) as GuildTextBasedChannel
	else if(interaction.inRawGuild()) {
		const tc = await (await interaction.client.guilds.fetch(interaction.guildId)).channels.fetch(interaction.channelId)
		if(!tc) throw Error('channel null')
		if(!tc.isVoiceBased()) throw Error('channel null')
		channel = tc
	}
	else throw Error('Interaction not in guild')

	sm.create(channel as VoiceBasedChannel, invoker);
	void interaction.reply({content: "stack created!", flags: MessageFlags.Ephemeral});
}

/**
 *
 * @param interaction The interaction fed to the bot
 */
async function run(interaction: ChatInputCommandInteraction<CacheType>) {
	const invoker = await interaction.guild!.members.fetch(interaction.user.id);

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
			content: "You need to be in the voice channel to use its stack",
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// no stack?
	const theStack = sm.stacks.get(interaction.channelId);
	if (!theStack) {
		createStack(interaction, invoker);
	} else { // stack!!
		try {
			await interaction.deferReply({flags:MessageFlags.Ephemeral})
			void interaction.channel.messages.fetch(theStack.message!.id).then((msg) => {
				void interaction.editReply({
					components:[
						new TextDisplayBuilder({content: "There's already a stack!"}),
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setStyle(ButtonStyle.Link)
							.setLabel('Jump to Stack Message')
							.setURL(msg.url)
						)],
					flags: MessageFlags.IsComponentsV2
				});
			});
		} catch {
			// stack message was deleted and not accounted for
			sm.remove(interaction.channel as VoiceBasedChannel);
			createStack(interaction, invoker); // making the new one
		}
	}
}
