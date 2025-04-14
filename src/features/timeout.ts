import { ColorResolvable, Colors, EmbedBuilder, GuildMember, inlineCode, TimestampStyles } from "discord.js";
import { getAuthorOptions, reasonField, userField } from "./moderation/embeds.js";

const timeoutEmbedColor: ColorResolvable = Colors.LuminousVividPink 


/**
 *
 * @param target
 * @param executor
 * @param createdAt
 * @param expiresAt
 * @param reason
 * @returns
 */
export function timeoutEmbed(target:GuildMember, executor:GuildMember, createdAt:Date, expiresAt:Date, reason:string = 'No Reason Given' ) {
	return new EmbedBuilder()
		.setTitle('Timeout')
		.setAuthor(getAuthorOptions(executor))
		.setThumbnail(target.displayAvatarURL({forceStatic: true}))
		.setDescription(`${target} ${inlineCode(target.user.username)} was timed out until ${expiresAt.toDiscordString(TimestampStyles.LongDateTime)}`)
		.setFields(
			reasonField(reason),
			userField('Action By',executor.user)
		)
		.setTimestamp(createdAt)
		.setColor(timeoutEmbedColor)
}
