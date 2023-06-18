import { GuildMember, Role } from 'discord.js';

export const SMERoleIDs = process.env.SME_ROLE_IDS.split(',');

export function getSMERoles(member: GuildMember) {
	if (!SMERoleIDs) throw new Error('SME_ROLE_IDS not present in .env');

	return member.roles.cache.filter((_r, id) => SMERoleIDs.includes(id));
}

export function hasSMERole(member: GuildMember) {
	if (!SMERoleIDs) throw new Error('SME_ROLE_IDS not present in .env');
	return SMERoleIDs.some((id) => member.roles.cache.has(id));
}

export function isSMERole(role: Role) {
	return SMERoleIDs.includes(role.id);
}
