import { codeBlock, ColorResolvable, EmbedBuilder, GuildMember, TimestampStyles } from "discord.js";

/**
 *
 * @param member
 * @param colors
 * @returns
 */
export function memberInspectEmbed(member:GuildMember, colors: ColorResolvable) {
    const iconURL = member.displayAvatarURL({ forceStatic: true, size: 4096 });
    return new EmbedBuilder()
        .setAuthor({ name: member.user.tag, iconURL: iconURL })
        .setThumbnail(iconURL)
        .setColor(colors)
        .setFields(
            { name: 'Display name:', value: codeBlock(member.displayName), inline: true },
			{ name: 'Username:', value: codeBlock(member.user.username), inline: true },
            { name: 'User ID:', value: codeBlock(member.id), inline: true },
            { name: 'Created at:', value: member.user.createdAt.toDiscordString(TimestampStyles.LongDateTime), inline: true },
            { name: 'Joined at:', value: member.joinedAt!.toDiscordString(TimestampStyles.LongDateTime), inline: true },
        )
        .setImage(member.bannerURL({forceStatic: true}) ?? (member.user.bannerURL({ forceStatic: true }) ?? null));
}
