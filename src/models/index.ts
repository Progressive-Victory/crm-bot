import { Snowflake } from "discord.js";

export interface IUser {
	discordId: Snowflake
	username: string
}

/**
 *
 * @param required
 * @param immutable
 * @returns
 */
export function user(required:boolean = false, immutable:boolean = false) {
	return {
		discordId: {
			type: String,
			required,
			immutable
		},
		username: {
			type: String,
			required,
			immutable
		},
	} 
}
