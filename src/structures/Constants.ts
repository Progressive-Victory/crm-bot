import {
	ChannelType, Collection, Snowflake 
} from 'discord.js';
import { config } from 'dotenv';
import stateConfig from './states.json';

config();

export type StateAbbreviation =
	| 'al'
	| 'ak'
	| 'az'
	| 'as'
	| 'ca'
	| 'co'
	| 'ct'
	| 'de'
	| 'dc'
	| 'fl'
	| 'ga'
	| 'gu'
	| 'hi'
	| 'id'
	| 'il'
	| 'in'
	| 'ia'
	| 'ks'
	| 'ky'
	| 'la'
	| 'me'
	| 'md'
	| 'ma'
	| 'mi'
	| 'mn'
	| 'ms'
	| 'mo'
	| 'mt'
	| 'ne'
	| 'nv'
	| 'nh'
	| 'nj'
	| 'nm'
	| 'ny'
	| 'nc'
	| 'nd'
	| 'mp'
	| 'oh'
	| 'ok'
	| 'or'
	| 'pa'
	| 'pr'
	| 'ri'
	| 'sc'
	| 'sd'
	| 'tn'
	| 'tx'
	| 'ut'
	| 'vt'
	| 'va'
	| 'vi'
	| 'wa'
	| 'wv'
	| 'wi'
	| 'wy';

export interface state {
	name: string;
	abbreviation: string;
	roleId: string;
	channelId: string;
	channelType: ChannelType;
}

function stateGen() {
	const stateCollection = new Collection<StateAbbreviation, state>();
	stateConfig.states.map((s) => stateCollection.set(s.abbreviation.toLocaleLowerCase() as StateAbbreviation, s));
	return stateCollection;
}

export const States = stateGen();

export const VCChannelIDs = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',');

export const VCChannelNames = new Collection<Snowflake, string>();
VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});
