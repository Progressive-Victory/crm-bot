import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('region-leads')
		.setDescription('add and remove Region Leads roles')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
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
				.setRequired(true)))

};
