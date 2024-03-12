import { StateAbbreviation } from '@util/state/state-abbreviation';
import {
	Collection, GuildMember, Role 
} from 'discord.js';

const stateLeadRoleID = process.env.STATE_LEAD_ROLE_ID;
const stateOrganizingCommitteeRoleID = process.env.STATE_COMMITTEE_ROLE_ID;

export interface state {
	name: string;
	abbreviation: string;
}

export const statesConfig = [
	{ name: 'Alabama', abbreviation: 'AL' },
	{ name: 'Alaska', abbreviation: 'AK' },
	{ name: 'Arizona', abbreviation: 'AZ' },
	{ name: 'Arkansas', abbreviation: 'AR' },
	{ name: 'American Samoa', abbreviation: 'AS' },
	{ name: 'California', abbreviation: 'CA' },
	{ name: 'Colorado', abbreviation: 'CO' },
	{ name: 'Connecticut', abbreviation: 'CT' },
	{ name: 'Delaware', abbreviation: 'DE' },
	{ name: 'District of Columbia', abbreviation: 'DC' },
	{ name: 'Florida', abbreviation: 'FL' },
	{ name: 'Georgia', abbreviation: 'GA' },
	{ name: 'Guam', abbreviation: 'GU' },
	{ name: 'Hawaii', abbreviation: 'HI' },
	{ name: 'Idaho', abbreviation: 'ID' },
	{ name: 'Illinois', abbreviation: 'IL' },
	{ name: 'Indiana', abbreviation: 'IN' },
	{ name: 'Iowa', abbreviation: 'IA' },
	{ name: 'Kansas', abbreviation: 'KS' },
	{ name: 'Kentucky', abbreviation: 'KY' },
	{ name: 'Louisiana', abbreviation: 'LA' },
	{ name: 'Maine', abbreviation: 'ME' },
	{ name: 'Maryland', abbreviation: 'MD' },
	{ name: 'Massachusetts', abbreviation: 'MA' },
	{ name: 'Michigan', abbreviation: 'MI' },
	{ name: 'Minnesota', abbreviation: 'MN' },
	{ name: 'Mississippi', abbreviation: 'MS' },
	{ name: 'Missouri', abbreviation: 'MO' },
	{ name: 'Montana', abbreviation: 'MT' },
	{ name: 'Nebraska', abbreviation: 'NE' },
	{ name: 'Nevada', abbreviation: 'NV' },
	{ name: 'New Hampshire', abbreviation: 'NH' },
	{ name: 'New Jersey', abbreviation: 'NJ' },
	{ name: 'New Mexico', abbreviation: 'NM' },
	{ name: 'New York', abbreviation: 'NY' },
	{ name: 'North Carolina', abbreviation: 'NC' },
	{ name: 'North Dakota', abbreviation: 'ND' },
	{ name: 'Northern Mariana Islands', abbreviation: 'MP' },
	{ name: 'Ohio', abbreviation: 'OH' },
	{ name: 'Oklahoma', abbreviation: 'OK' },
	{ name: 'Oregon', abbreviation: 'OR' },
	{ name: 'Pennsylvania', abbreviation: 'PA' },
	{ name: 'Puerto Rico', abbreviation: 'PR' },
	{ name: 'Rhode Island', abbreviation: 'RI' },
	{ name: 'South Carolina', abbreviation: 'SC' },
	{ name: 'South Dakota', abbreviation: 'SD' },
	{ name: 'Tennessee', abbreviation: 'TN' },
	{ name: 'Texas', abbreviation: 'TX' },
	{ name: 'Utah', abbreviation: 'UT' },
	{ name: 'Vermont', abbreviation: 'VT' },
	{ name: 'Virginia', abbreviation: 'VA' },
	{ name: 'Virgin Islands', abbreviation: 'VI' },
	{ name: 'Washington', abbreviation: 'WA' },
	{ name: 'West Virginia', abbreviation: 'WV' },
	{ name: 'Wisconsin', abbreviation: 'WI' },
	{ name: 'Wyoming', abbreviation: 'WY' }
];

export const states = new Collection<StateAbbreviation, state>();
statesConfig.map((s) => states.set(s.abbreviation.toLocaleLowerCase() as StateAbbreviation, s));

export function isStateCommitteeMember(member: GuildMember) {
	if (!stateOrganizingCommitteeRoleID) throw Error('Missing STATE_COMMITTEE_ROLE_ID in .env');
	const bypassRole = member.guild.roles.cache.get(stateOrganizingCommitteeRoleID);
	if (!bypassRole) throw Error('STATE_COMMITTEE_ROLE_ID is not a valid role');
	return member.roles.cache.has(stateOrganizingCommitteeRoleID);
}

export function isMemberStateLead(member: GuildMember) {
	if (isStateCommitteeMember(member)) return true;
	if (!stateLeadRoleID) throw Error('Missing STATE_LEAD_ROLE_ID in .env');
	const role = member.guild.roles.cache.get(stateLeadRoleID);
	if (!role) throw Error('Invalid role ID please check STATE_LEAD_ROLE_ID in .env');
	return member.roles.cache.has(stateLeadRoleID);
}

export function isStateLeadRole(role: Role) {
	if (!stateLeadRoleID) throw Error('Missing Valid STATE_LEAD_ROLE_ID in .env');
	return role.id === stateLeadRoleID;
}

export function memberStates(member: GuildMember) {
	return member.roles.cache.filter((r) => states.has(r.name.toLowerCase() as StateAbbreviation));
}

export function hasStateRole(member: GuildMember, stateRole: Role) {
	return memberStates(member).some((r) => r.id === stateRole.id) || isStateCommitteeMember(member);
}
