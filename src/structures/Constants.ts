import {
	Collection, Interaction, PermissionFlagsBits, Snowflake 
} from 'discord.js';
import { config } from 'dotenv';

config();

export const VCChannelIDs = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',').filter((e) => !!e);

export const VCChannelNames = new Collection<Snowflake, string>();

VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});

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
