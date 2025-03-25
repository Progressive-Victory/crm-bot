import { ActionRowBuilder, ButtonBuilder, ColorResolvable, Colors, CommandInteraction, EmbedBuilder, Guild, GuildMember, inlineCode, italic, TimestampStyles } from 'discord.js';
import { FilterQuery, HydratedDocument } from 'mongoose';
import { client } from '../../index.js';
import { Warn, WarningRecord } from '../../models/Warn.js';
import { IWarnSearch, WarningSearch } from '../../models/WarnSearch.js';
import { leftButton, pageNumber, rightButton } from './buttons.js';
import { numberOfWarnEmbedsOnPage } from './index.js';
import { WarmEmbedColor } from './types.js';

/**
 *
 * @param warns
 * @param start
 * @returns
 */
export async function viewWarningMessageRender(warns: WarningRecord[], start:number = 0) {

    const embeds: EmbedBuilder[] = [];

    for (let index = start; index < start + numberOfWarnEmbedsOnPage && index < warns.length; index++) {
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

	const guild = client.guilds.cache.get(warn.guildId) ?? await client.guilds.fetch(warn.guildId)
	const target = guild.members.cache.get(warn.targetDiscordId) ?? await guild.members.fetch(warn.targetDiscordId)
	const moderator = guild.members.cache.get(warn.moderatorDiscordId) ?? await guild.members.fetch(warn.moderatorDiscordId)
	if(!target || !moderator) return

	const embed = new EmbedBuilder()
		.addFields(
			{ name: 'Reason', value: warn.reason, inline: false},
		)

		.setColor(embedColor)
		.setThumbnail(target.avatarURL({forceStatic: true}) ?? target.user.avatarURL({forceStatic: true}))
		.setFooter({ text: `Warn ID: ${warn.id}` })

		if(!target) {
			embed.addFields(
				{ name: 'Member', value: inlineCode(warn.targetUsername), inline: true }
			)
		} else {
			embed.addFields(
				{ name: 'Member', value: `${target}\n${inlineCode(target.user.username)}`, inline: true },
			)
		}
		if (!moderator) {
			embed.addFields(
				{ name: 'Moderator', value: inlineCode(warn.moderatorUsername), inline: true },

			)
		} else {
			embed.addFields(
				{ name: 'Moderator', value: `${moderator}\n${inlineCode(moderator.user.username)}`, inline: true },

			)
		}

		if(warn.updaterDiscordId){
			const updater = guild.members.cache.get(warn.updaterDiscordId) ?? await guild.members.fetch(warn.updaterDiscordId)
			if (updater)
				embed.addFields({
					name: 'Last Updated By',
					value: `${updater}\n${inlineCode(updater.user.username)}`,
					inline: true
				})
		}
		embed.addFields(
			{
				name: 'Remaining Time',
				value: `Expire ${warn.expireAt.toDiscordString(TimestampStyles.RelativeTime)} On ${warn.expireAt.toDiscordString(TimestampStyles.LongDate)}`,
				inline: false
			},
			{
				name: 'Created At',
				value: `Issued ${warn.createdAt.toDiscordString(TimestampStyles.RelativeTime)} On ${warn.createdAt.toDiscordString(TimestampStyles.LongDate)}`,
				inline: false
			}
		)
		return embed
}

/**
 *
 * @param record
 * @param remover
 * @param deleted
 * @returns
 */
export async function removeWarnEmbed(record:WarningRecord, remover:GuildMember, deleted: boolean = false) {
	const guild = client.guilds.cache.get(record.guildId)
	if (!guild) return
	const target = guild.members.cache.get(record.targetDiscordId) ?? await guild.members.fetch(record.targetDiscordId)
	const moderator = guild.members.cache.get(record.moderatorDiscordId) ?? await guild.members.fetch(record.moderatorDiscordId)
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
 * @param guild
 * @returns
 */
export function dmEmbed(record:WarningRecord, guild:Guild) {
    const { reason, expireAt } = record
    const embed = new EmbedBuilder()
        .setTitle('Your Received a Waring')
        .setColor(WarmEmbedColor.Issued)
        .addFields(
			{ name: 'Reason for This warning', value: reason },
            { name: 'Time till warn expiration', value: expireAt.toDiscordString(TimestampStyles.RelativeTime) })
        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ forceStatic: true })! })
		.setFooter({text: `Warn Id: ${record.id}`})
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

/**
 *
 * 
 * @param searchId
 * @param record
 * @param isRightMove
 * @param isStart
 * @returns
 */
export async function warnSearch(record: HydratedDocument<IWarnSearch> | string, isRightMove: boolean = false, isStart:boolean = false) {
	
	let searchRecord: HydratedDocument<IWarnSearch> | null;
	
	if ((typeof record) === 'string')
		searchRecord = await WarningSearch.findById(record);
	else
		searchRecord = record

	if(!searchRecord) {
		throw Error(`Unknown searchRecord Id`)
	}

	const {expireAfter, moderatorDiscordId, targetDiscordId} = searchRecord
	const filter: FilterQuery<WarningRecord> = {}

	if (moderatorDiscordId)
		filter.moderatorDiscordId = moderatorDiscordId

	if (targetDiscordId)
		filter.targetDiscordId = targetDiscordId

	if (expireAfter)
		filter.expireAt = { $gte: expireAfter }
	
	if(!isStart){
		if(isRightMove)
			searchRecord.pageStart += numberOfWarnEmbedsOnPage
		else
			searchRecord.pageStart -= numberOfWarnEmbedsOnPage
	}
	searchRecord.save();
	
	const records = (await Warn.find(filter)).toSorted((a, b) => {
		const expired = b.expireAt.getTime() - Date.now();
		
		if (expired < 0) return expired
		
		return b.createdAt.getTime() - a.createdAt.getTime();
	} )

	return {
		content: italic('Sorted by Active Status and Date Created'),
		embeds: await viewWarningMessageRender(records, searchRecord.pageStart),
		components: records.length <= numberOfWarnEmbedsOnPage ? [] :
			[new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					leftButton(searchRecord),
					pageNumber((searchRecord.pageStart+numberOfWarnEmbedsOnPage)/numberOfWarnEmbedsOnPage, Math.ceil(records.length/numberOfWarnEmbedsOnPage)),
					rightButton(searchRecord, searchRecord.pageStart + numberOfWarnEmbedsOnPage > records.length))]
	}
	
}

