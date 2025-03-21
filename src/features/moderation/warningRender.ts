import { ColorResolvable, Colors, CommandInteraction, EmbedBuilder, GuildMember, inlineCode, TimestampStyles } from 'discord.js';
import { client } from '../../index.js';
import { WarningRecord } from '../../models/Warn.js';
import { WarmEmbedColor } from './types.js';

/**
 *
 * @param warns
 * @param start
 * @returns
 */
export async function viewWarningMessageRender(warns: WarningRecord[], start:number = 0) {
    const embeds: EmbedBuilder[] = [];

    for (let index = start; index < start + 3 && index < warns.length; index++) {
        const record = warns[index];
		const embed = await warningEmbed(record, record.expireAt > new Date() ? WarmEmbedColor.Active : WarmEmbedColor.Inactive)
		if(!embed) continue;
        embeds.push(embed);
    }

    return embeds;
}

/**
 *
 * @param warn
 * @param timeUpdated
 * @param embedColor
 * @returns
 */
export async function warningEmbed(warn: WarningRecord, embedColor: ColorResolvable = WarmEmbedColor.Issued) {

	const guild = client.guilds.cache.get(warn.guildId)
	if (!guild) return
	const target = guild.members.cache.get(warn.targetDiscordId) ?? await guild.members.fetch(warn.targetDiscordId)
	const moderator = guild.members.cache.get(warn.moderatorDiscordId) ?? await guild.members.fetch(warn.moderatorDiscordId)
	if(!target || !moderator) return


	const embed = new EmbedBuilder()
		.setTitle('Warn')
		.setDescription(`**Reason:** ${warn.reason}`)
		.addFields(
			{ name: 'Reason', value: warn.reason, inline: false},
			{ name: 'Member', value: `${target}\n${inlineCode(target.user.username)}`, inline: true },
			{ name: 'Moderator', value: `${moderator}\n${inlineCode(moderator.user.username)}`, inline: true },
			)

		.setColor(embedColor)
		.setThumbnail(target.avatarURL({forceStatic: true}) ?? target.user.avatarURL({forceStatic: true}))
		.setFooter({ text: `Warn ID: ${warn.id}` })
		.setTimestamp(warn.updaterDiscordId ? warn.updatedAt : warn.createdAt);
		if(warn.updaterDiscordId){
			const updater = guild.members.cache.get(warn.updaterDiscordId) ?? await guild.members.fetch(warn.updaterDiscordId)
			if (updater)
				embed.addFields({
					name: 'Updated By',
					value: `${updater}\n${inlineCode(updater.user.username)}`,
					inline: true
				})
		}
			
		embed.addFields({
			name: 'Expires',
			value: `${warn.expireAt.toDiscordString(TimestampStyles.RelativeTime)}:\n ${warn.expireAt.toDiscordString(TimestampStyles.LongDateTime)}`,
			inline: false })
		return embed
}

/**
 *
 * @param record
 * @param remover
 * @param deleted
 * @returns
 */
export function removeWarnEmbed(record:WarningRecord, remover:GuildMember, deleted: boolean = false) {
	const guild = client.guilds.cache.get(record.guildId)
	if (!guild) return
	const target = guild.members.cache.get(record.targetDiscordId)
	const moderator = guild.members.cache.get(record.moderatorDiscordId)
	if(!target || !moderator) return

    const embed = new EmbedBuilder()
        .setTitle(`Warn | ${deleted ? 'Deleted' : 'Removed'}`)
        .setDescription(`**Reason for Warning:** ${record.reason}`)
        .addFields(
            { name: 'Target', value: `${target}\n${target.user.username}`, inline: true },
            { name: 'Moderator', value: `<${moderator}>\n${moderator.user.username}`, inline: true },
            { name: 'Removed By', value: `${remover}\n${remover.user.username}`, inline: true })
        .setTimestamp();

    if (deleted) {
        return embed.setColor(WarmEmbedColor.Inactive);
    }
    else {
        return embed.setColor(WarmEmbedColor.Active).setFooter({ text: `ID: ${record.id}` });
    }
}

/**
 *
 * @param record
 * @param numberOfWarns
 */
export function dmEmbed(record:WarningRecord, numberOfWarns:number) {
    const { reason, expireAt } = record;
	const guild = client.guilds.cache.get(record.guildId)
	if (!guild) return
    const embed = new EmbedBuilder()
        .setTitle('Warning')
        .setDescription(`**Reason:** ${reason}`)
        .setColor(WarmEmbedColor.Issued)
        .addFields(
            { name: 'Number of active warning(s)', value: `${numberOfWarns}` },
            { name: 'Time till warn expiration', value: expireAt.toDiscordString(TimestampStyles.RelativeTime) })
        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ forceStatic: true })! })
        .setTimestamp(record.createdAt);
    return embed;
}
/**
 *
 * @param interaction
 * @param banReason
 * @param appealMessage
 * @returns
 */
export function banDmEmbed(interaction:CommandInteraction<"cached">, banReason:string, appealMessage?:string) {
	if(!interaction.inGuild()) {
		return
	}
    const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: true }) ?? undefined })
        .setTimestamp()
        .setTitle('Banned')
        .setDescription(banReason)
        .setColor(Colors.Red);
    if (appealMessage) embed.addFields({ name: 'Appeal Info', value: appealMessage });
    return embed;
}

