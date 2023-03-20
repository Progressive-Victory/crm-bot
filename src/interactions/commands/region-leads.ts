import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('region-leads')
		.setDescription('add and remove Region Leads roles')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addSubcommand((subcommand) => subcommand
			.setName('add')
			.setDescription('Add regonal leads role')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Traget user')
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('remove')
			.setDescription('Remove regonal leads role')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Traget user')
				.setRequired(true)))

};
