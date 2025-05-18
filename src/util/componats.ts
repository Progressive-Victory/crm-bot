import { Snowflake, subtext, TextDisplayBuilder } from "discord.js";

/**
 *
 * @param userId
 * @param joinedAt
 * @param id
 * @returns
 */
export function footer(userId:Snowflake, id?:number) {
	const text:string[] = [subtext(`User ID: ${userId}`)]
	const display = new TextDisplayBuilder()
	.setContent(text.join('\n'))
	if(id) display.setId(id)
	return display
}
