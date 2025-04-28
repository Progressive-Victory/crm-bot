import { codeBlock, ColorResolvable, EmbedBuilder, GuildMember, time, TimestampStyles } from "discord.js";
import { getAuthorOptions } from "./moderation/embeds.js";

/**
 *
 * @param member
 * @param colors
 * @returns
 */
export function memberInspectEmbed(member:GuildMember, colors: ColorResolvable) {
    const iconURL = member.displayAvatarURL();
    return new EmbedBuilder()
        .setAuthor(getAuthorOptions(member, { forceStatic: true, size: 4096 }))
        .setThumbnail(iconURL)
        .setColor(colors)
        .setFields(
            { name: 'Display name:', value: codeBlock(member.displayName), inline: true },
			{ name: 'Username:', value: codeBlock(member.user.username), inline: true },
            { name: 'User ID:', value: codeBlock(member.id), inline: true },
            { name: 'Created at:', value:time( member.user.createdAt, TimestampStyles.LongDateTime), inline: true },
            { name: 'Joined at:', value: time(member.joinedAt!, TimestampStyles.LongDateTime), inline: true },
        )
        .setImage(member.bannerURL({forceStatic: true}) ?? (member.user.bannerURL({ forceStatic: true }) ?? null));
}
