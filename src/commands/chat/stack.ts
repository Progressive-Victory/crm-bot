import { ApplicationCommandType, ChannelType, chatInputApplicationCommandMention, ChatInputCommandInteraction, GuildTextBasedChannel, InteractionContextType, MessageFlags, PermissionFlagsBits, subtext, TextDisplayBuilder, VoiceChannel } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';
import { sm } from '../../features/stack/index.js';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName("stack")
		.setDescription("Talking over people wouldn't be very dark woke of you")
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addSubcommand(subCommand => subCommand.setName('create')
			.setDescription('Create VC Stack')
		)
		.addSubcommand(subCommand => subCommand.setName('join')
			.setDescription('Join to the end of the line of the VC stack')
			.addBooleanOption(option => option.setName('priority')
				.setDescription('Time sensitive request to speak')
			)
		)
		.addSubcommand(subCommand => subCommand.setName('view')
			.setDescription('View VC stack')
			.addBooleanOption(option => option.setName('hide')
				.setDescription('hide message from other members'))
		)
		.addSubcommand(subCommand => subCommand.setName('leave')
			.setDescription('remove your self from VC stack')
		)
		.addSubcommand(subCommand => subCommand.setName('remove')
			.setDescription('remove a member from the stack')
			.addUserOption(option => option.setName('member')
				.setDescription('Mere to remove from queue')
			)
		)
	)
	.setExecute((interaction) => {
		if(!interaction.inCachedGuild()) return
		const { channel, channelId, member } = interaction
		const subCommand = interaction.options.getSubcommand(true)
		if(!isGuildVoiceChannel(channel))
			return interaction.reply({
				content:'Command can only be used in a voice channel',
				flags: MessageFlags.Ephemeral
			})
		if(channelId !== member.voice.channelId)
			return interaction.reply({
				content:'Command can only be used in a voice channel that you are in',
				flags: MessageFlags.Ephemeral
			})
		
		switch (subCommand) {
			case 'create':
				create(interaction, channel)
				break;
			case 'view':
				view(interaction, channel)
				break;
			case 'join':

				break;
			case 'leave':
				
				break;
			case 'remove':
				
				break;
		
			default:
				break;
		}	
	});

/**
 *
 * @param channel
 */
function isGuildVoiceChannel(channel: GuildTextBasedChannel | null): channel is VoiceChannel {
	return channel?.type === ChannelType.GuildVoice
}

/**
 *
 * @param interaction
 * @param channel
 */
function create(interaction: ChatInputCommandInteraction<"cached">, channel: VoiceChannel) {
	if(sm.stacks.has(channel.id)) {
		const message = sm.render(channel)
		message.components = message.components?.toSpliced(0,0, new TextDisplayBuilder({content: subtext('This stack has already been created')}))
		message.flags = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
		return interaction.reply(message)
	}
	sm.create(channel, interaction.member)
	const message = sm.render(channel)
	interaction.reply(message)
}

/**
 *
 * @param interaction
 * @param channel
 */
function view(interaction: ChatInputCommandInteraction<"cached">, channel: VoiceChannel) {
	if(sm.stacks.has(channel.id)) {
		const hide = interaction.options.getBoolean('hide', false) ?? false
		const message = sm.render(channel)
		message.flags = hide ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral : message.flags
		return interaction.reply(message)
	}
	interaction.reply({
		content: `No queue exist. To create one use ${chatInputApplicationCommandMention('stack','create', interaction.client.application.commands.cache.find((cmd) => cmd.type === ApplicationCommandType.ChatInput && cmd.name === 'stack')?.id ?? '')}`,
		flags: MessageFlags.Ephemeral
	})
}
