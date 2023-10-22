import { Interaction, PermissionFlagsBits } from 'discord.js';

export const basePermissionOverwrites = (interaction: Interaction) => [
	{
		id: interaction.client.user.id,
		allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels]
	},
	{
		id: interaction.guild.id,
		deny: [PermissionFlagsBits.ViewChannel]
	},
	{
		id: interaction.user.id,
		allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles]
	}
];
