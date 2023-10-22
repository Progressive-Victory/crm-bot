import { Collection, Snowflake } from 'discord.js';
import { config } from 'dotenv';

config();
const { STATE_LEAD_RENAMEABLE_CHANNELIDS } = process.env;

export const VCChannelIDs = STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',').filter((e) => !!e);

export const VCChannelNames = new Collection<Snowflake, string>();

VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});
