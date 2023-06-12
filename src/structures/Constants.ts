import {
	ChannelType,
	Collection, RoleResolvable, Snowflake
} from 'discord.js';
import { config } from 'dotenv';
import stateConfig from './states.json';

config();

export type State_Abbreviation =
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
	| 'tt'
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
	roleId?: RoleResolvable;
	channelId?: Snowflake;
	channelType?: ChannelType;
}

function stateGen() {
	const stateCollection = new Collection<State_Abbreviation, state>();
	stateConfig.states.map((s) => stateCollection.set(s.abbreviation.toLocaleLowerCase() as State_Abbreviation, s));
	return stateCollection;
}

export const States = stateGen();

export const VCChannelIDs = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',');

export const VCChannelNames = new Collection<Snowflake, string>();
VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});
