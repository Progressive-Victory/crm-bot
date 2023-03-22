import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('state-lead')
		.setDescription('Commands for state Leads to help manager there state')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels && PermissionFlagsBits.ManageChannels)
		.setDMPermission(false)
		.addSubcommandGroup((subcommandGroup) => subcommandGroup
			.setName('region-lead')
			.setDescription('add and remove Region Leads roles')
			.addSubcommand((subcommand) => subcommand
				.setName('add')
				.setDescription('Add regional leads role')
				.addUserOption((option) => option
					.setName('user')
					.setDescription('Target user')
					.setRequired(true)))
			.addSubcommand((subcommand) => subcommand
				.setName('remove')
				.setDescription('Remove regional leads role')
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
				.setDescription('Name to set the channel too')
				.setRequired(true)
				.setAutocomplete(true)
				.setMinLength(5)
				.setMaxLength(100)))

};
