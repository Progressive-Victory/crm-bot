import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('metrics')
		.setDescription('Shows general metrics for the server or a specific user.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addUserOption((option) => option.setName('user').setDescription('The user to get metrics for.').setRequired(false))
};
