import {
	Collection, GuildMember, Role, Snowflake 
} from 'discord.js';
import smeConfig from '../sme.json';

export const SMERoleIDs = process.env.SME_ROLE_IDS.split(',').filter((e) => !!e);

export function getSMERoles(member: GuildMember) {
	if (!SMERoleIDs) throw new Error('SME_ROLE_IDS not present in .env');

	const SMERoles = new Collection<Snowflake, Role>();

	SMERoleIDs.forEach((id) => {
		if (member.roles.cache.has(id)) SMERoles.set(id, member.roles.cache.get(id));
	});

	return SMERoles;
}

export function hasSMERole(member: GuildMember) {
	if (!SMERoleIDs) throw new Error('SME_ROLE_IDS not present in .env');
	return SMERoleIDs.some((id) => member.roles.cache.has(id));
}

export function isSMERole(role: Role) {
	return SMERoleIDs.includes(role.id);
}

export async function getSMELeads(role: Role): Promise<GuildMember[]> {
	return Promise.all(smeConfig[role.id].map((id: string) => role.guild.members.fetch(id)));
}
