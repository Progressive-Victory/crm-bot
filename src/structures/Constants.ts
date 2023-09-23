import {
	Collection, Guild, PermissionFlagsBits, Snowflake 
} from 'discord.js';
import { config } from 'dotenv';

config();

export const VCChannelIDs = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',');

export const VCChannelNames = new Collection<Snowflake, string>();

VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});

export const basePermissionOverwrites = (guild: Guild) => [
	{
		id: guild.client.user.id,
		allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels]
	},
	{
		id: guild.id,
		deny: [PermissionFlagsBits.ViewChannel]
	}
];
