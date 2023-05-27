import { config } from 'dotenv';
import { Collection, Snowflake } from 'discord.js';

config();

export const REGION_ABBREVIATION_MAP = {
	california: 'CA',
	florida: 'FL',
	'new-york': 'NY',
	illinois: 'IL',
	pennsylvania: 'PA',
	ohio: 'OH',
	georgia: 'GA',
	'north-carolina': 'NC',
	michigan: 'MI',
	'new-jersey': 'NJ',
	virginia: 'VA',
	washington: 'WA',
	arizona: 'AZ',
	massachusetts: 'MA',
	tennessee: 'TN',
	indiana: 'IN',
	texas: 'TX',
	missouri: 'MO',
	maryland: 'MD',
	wisconsin: 'WI',
	colorado: 'CO',
	minnesota: 'MN',
	'south-carolina': 'SC',
	alabama: 'AL',
	louisiana: 'LA',
	kentucky: 'KY',
	oregon: 'OR',
	oklahoma: 'OK',
	connecticut: 'CT',
	utah: 'UT',
	iowa: 'IA',
	mississippi: 'MS',
	arkansas: 'AR',
	kansas: 'KS',
	nevada: 'NV',
	nebraska: 'NE',
	'new-mexico': 'NM',
	'west-virginia': 'WV',
	idaho: 'ID',
	hawaii: 'HI',
	'new-hampshire': 'NH',
	maine: 'ME',
	'rhode-island': 'RI',
	montana: 'MT',
	delaware: 'DE',
	'south-dakota': 'SD',
	'north-dakota': 'ND',
	alaska: 'AK',
	wyoming: 'WY',
	vermont: 'VT',
	'district-of-columbia': 'DC',
	'puerto-rico': 'PR'
};

export interface state {
	name: string;
	abbreviation: typeof REGION_ABBREVIATION_MAP;
}

export const States = new Collection<string, state>();

export const VCChannelIDs = process.env.STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',');

export const VCChannelNames = new Collection<Snowflake, string>();
VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});
