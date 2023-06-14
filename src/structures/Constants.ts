import { Collection, Snowflake } from 'discord.js';
import { config } from 'dotenv';
import {
	StateAbbreviation, state, states 
} from './states';

config();

function stateGen() {
	const stateCollection = new Collection<StateAbbreviation, state>();
	states.map((s) => stateCollection.set(s.abbreviation.toLocaleLowerCase() as StateAbbreviation, s));
	return stateCollection;
}

export const States = stateGen();

export const VCChannelIDs = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',');

export const VCChannelNames = new Collection<Snowflake, string>();
VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});
