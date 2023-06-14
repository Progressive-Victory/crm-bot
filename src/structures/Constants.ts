import { Collection, Snowflake } from 'discord.js';
import { config } from 'dotenv';

config();

export const VCChannelIDs = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',');

export const VCChannelNames = new Collection<Snowflake, string>();
VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});
