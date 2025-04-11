import { APIInteractionDataResolvedGuildMember, APIRole, GuildMember, Role } from 'discord.js';
import { Types } from 'mongoose';
import { client } from '../index.js';


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

/**
 * 
 * @param args strings 
 * @returns string with arguments separated by client.splitCustomIdOn
 */
export function AddSplitCustomId(...args: (string | number | boolean | Types.ObjectId)[]) {
	if (!client.splitCustomIdOn) {
		throw Error('client.splitCustomIdOn not set in index')
	}
	let output = args[0].toString();
	for (let index = 1; index < args.length; index++) {
		output = output.concat(client.splitCustomIdOn, args[index].toString())
	}
	return output
}
