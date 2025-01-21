import { APIInteractionDataResolvedGuildMember, APIRole, GuildMember, Role } from 'discord.js';


/**
 * Check is full GuildMember object is present
 * @param data object to test
 * @returns If data is a GuildMember or no
 */
export function isGuildMember(data: GuildMember | APIInteractionDataResolvedGuildMember | null): data is GuildMember {
	return data instanceof GuildMember;
}
/**
 * Check is full GuildMember object is present
 * @param data object to test
 * @returns If data is a GuildMember or no
 */
export function isRole(data: Role | APIRole | null): data is Role {
	return data instanceof Role;
}
