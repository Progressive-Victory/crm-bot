import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('state-lead')
		.setDescription('Commands for State Leads to help manage their state')
		// eslint-disable-next-line no-bitwise
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels)
		.setDMPermission(false)
		.addSubcommandGroup((subcommandGroup) => subcommandGroup
			.setName('region-lead')
			.setDescription('Add or remove Region Lead role')
			.addSubcommand((subcommand) => subcommand
				.setName('add')
				.setDescription('Add Regional Lead role')
				.addUserOption((option) => option
					.setName('user')
					.setDescription('Target user')
					.setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('remove')
				.setDescription('Remove Regional Lead role')
				.addUserOption((option) => option
					.setName('user')
					.setDescription('Target user')
					.setRequired(true))))
		.addSubcommand((subcommand) => subcommand
			.setName('rename-channel')
			.setDescription('Rename organizing voice channels')
			.addChannelOption((options) => options
				.setName('channel')
				.setDescription('The channel to rename')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildVoice))
			.addStringOption((option) => option
				.setName('name')
				.setDescription('Name to set the channel to')
				.setRequired(true)
				.setAutocomplete(true)
				.setMinLength(5)
				.setMaxLength(100)))
};
