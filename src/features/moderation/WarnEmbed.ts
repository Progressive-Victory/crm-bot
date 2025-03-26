import { ActionRowBuilder, ButtonBuilder, ColorResolvable, Colors, CommandInteraction, EmbedBuilder, Guild, GuildMember, inlineCode, italic, TimestampStyles } from 'discord.js';
import { FilterQuery, HydratedDocument } from 'mongoose';
import { client } from '../../index.js';
import { IWarn, Warn, WarningRecord } from '../../models/Warn.js';
import { IWarnSearch, WarningSearch } from '../../models/WarnSearch.js';
import { leftButton, pageNumber, rightButton } from './buttons.js';
import { numberOfWarnEmbedsOnPage, WarmEmbedColor } from './types.js';

/**
 * Render records to an array of embed
 * @param warns Array of Warn documents from search
 * @param start The idex location of were to start
 * @returns Array of EmbedBuilders
 */
export async function viewWarningMessageRender(warns: WarningRecord[], start:number = 0) {

    const embeds: EmbedBuilder[] = [];
	// start indexing at start
	// Continue while number of embeds is less than numberOfWarnEmbedsOnPage and index is less than the warning documents
	// then increases index by one
    for (let index = start; embeds.length < numberOfWarnEmbedsOnPage && index < warns.length; index++) {
		// get record located at index
        const record = warns[index];

		// Embed color based on the status of the warning
		const color = record.expireAt > new Date() ? WarmEmbedColor.Active : WarmEmbedColor.Inactive
		
		// Render embed
		const embed = await warningEmbed(record, color)
		
		// If embed is undefined is is not added to the embeds array
		if(!embed) continue;
		embeds.push(embed);
    }

    return embeds;
}

/**
 * Render warning embed
 * @param warn Warning document
 * @param embedColor color of the embed
 * @returns EmbedBuilder or undefined
 */
export async function warningEmbed(warn: WarningRecord, embedColor: ColorResolvable = WarmEmbedColor.Issued) {

	// Get guild from cache or fetch
	const guild = client.guilds.cache.get(warn.guildId) ?? await client.guilds.fetch(warn.guildId).catch(console.error)
	if(!guild) return

	// Get target from cache or fetch
	const target = guild.members.cache.get(warn.target.discordId) ?? await guild.members.fetch(warn.target.discordId).catch(console.error)
	
	// Get moderator from cache or fetch
	const moderator = guild.members.cache.get(warn.moderator.discordId) ?? await guild.members.fetch(warn.moderator.discordId).catch(console.error)


	const embed = new EmbedBuilder()
		.addFields(
			{ name: 'Reason', value: warn.reason, inline: false},
		)
		.setColor(embedColor)
	
	// Check if target present if target is not present uses username from warning document
	if(!target) {
		embed.addFields(
			{ name: 'Member', value: inlineCode(warn.target.username), inline: true }
		)
	// if target is present use GuildMember for username and avatar
	} else {
		embed.addFields(
			{ name: 'Member', value: `${target}\n${inlineCode(target.user.username)}`, inline: true },
		)
		// If user does not have a server avatar try user avatar
		.setThumbnail(target.avatarURL({forceStatic: true}) ?? target.user.avatarURL({forceStatic: true}))
	}

	// Check if target present if moderator is not present uses username from warning document
	if (!moderator) {
		embed.addFields(
			{ name: 'Moderator', value: inlineCode(warn.moderator.username), inline: true },

		)

	// if moderator is present use GuildMember for username
	} else {
		embed.addFields(
			{ name: 'Moderator', value: `${moderator}\n${inlineCode(moderator.user.username)}`, inline: true },
		)
	}

	// Check if warning document updater fields present
	if(warn.updater?.discordId && warn.updater?.username){

		// Get updater from cache or fetch
		const updater = guild.members.cache.get(warn.updater.discordId) ?? await guild.members.fetch(warn.updater.discordId).catch(console.error)
		
		// If updater is present add felid to embed
		if (updater)
			embed.addFields({
				name: 'Last Updated By',
				value: `${updater}\n${inlineCode(updater.user.username)}`,
				inline: true
			})
	}

	/**
	 * add Remaining Time and Created At field to embed using toDiscordString to use discord render
	 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
	 */
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

	return addDocumentIdFooter(warn,embed)
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
	const target = guild.members.cache.get(record.target.discordId) ?? await guild.members.fetch(record.target.discordId)
	const moderator = guild.members.cache.get(record.moderator.discordId) ?? await guild.members.fetch(record.moderator.discordId)
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
        return addDocumentIdFooter(record, embed.setColor(WarmEmbedColor.Active));
    }
}

/**
 * Embed set to recipient of a warning over dm
 * @param record document of a warning
 * @param guild guild where waring was issued
 * @returns embedBuilder
 */
export function issueWarningDm(record:WarningRecord, guild:Guild) {
    const { reason, expireAt } = record
    const embed = new EmbedBuilder()
        .setTitle('Your Received a Waring')
        .setColor(WarmEmbedColor.Issued)
        .addFields(
			{ name: 'Reason for This warning', value: reason },
            { name: 'Time till warn expiration', value: expireAt.toDiscordString(TimestampStyles.RelativeTime) })
        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ forceStatic: true }) ?? undefined })
        // .setTimestamp(record.createdAt);
    return addDocumentIdFooter(record,embed);
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
 * Render message for search of warnings
 * @param record warning search document or document Id as a string
 * @param isRightMove was the right move button pressed
 * @param isStart is this the initiation of a search
 * @returns partial message object compatible with Interaction reply and update
 */
export async function warnSearch(record: HydratedDocument<IWarnSearch> | string, isRightMove: boolean = false, isStart:boolean = false) {

	let searchRecord: HydratedDocument<IWarnSearch> | null;
	
	// check if record is a string and resolve it to a document
	if ((typeof record) === 'string')
		searchRecord = await WarningSearch.findById(record);
	else
		searchRecord = record

	// if document is found show message to user. Message will not be shown under normal conditions
	if(!searchRecord) {
		return {
			content: 'No search record found. Please let an admin know if you see this message'
		}
	}

	const {expireAfter, moderatorDiscordId, targetDiscordId} = searchRecord
	const filter: FilterQuery<WarningRecord> = {}

	// check for search conditions then add them to the filter
	if (moderatorDiscordId)
		filter['moderator.discordId'] =  moderatorDiscordId

	if (targetDiscordId)
		filter['target.discordId'] = targetDiscordId

	if (expireAfter)
		filter.expireAt = { $gte: expireAfter }
	
	// update the pageStart value based on isRightMove
	// if isStart is true not change is made
	if(!isStart){
		if(isRightMove)
			searchRecord.pageStart += numberOfWarnEmbedsOnPage
		else
			searchRecord.pageStart -= numberOfWarnEmbedsOnPage
	}
	// save search record
	searchRecord.save();
	
	// Find and sort warning documents 
	const records = (await Warn.find(filter)).toSorted((a, b) => {
		
		// checks if on of the records has expired
		const aExpired = a.expireAt.getTime() - Date.now();
		const bExpired = b.expireAt.getTime() - Date.now();
		if(aExpired > 0 && bExpired > 0) return 1
		else if (aExpired < 0 && bExpired > 0) return -1
		
		// if none or both records are expired compare createdAt
		return b.createdAt.getTime() - a.createdAt.getTime();
	} )

	return {
		content: italic('Sorted by Active Status and Date Created'),
		embeds: await viewWarningMessageRender(records, searchRecord.pageStart),
		components: records.length <= numberOfWarnEmbedsOnPage ? [] :
			[new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					leftButton(searchRecord),
					pageNumber( searchRecord, records),
					rightButton(searchRecord, records))]
	}
	
}

/**
 *
 * @param record
 * @param moderator
 * @param target
 * @returns
 */
export function warnLog(record: HydratedDocument<IWarn>, moderator: GuildMember, target: GuildMember) {
	const embed = new EmbedBuilder()
		.setTitle('Warning Issued')
		.setColor(WarmEmbedColor.Issued)
		.setAuthor({name: moderator.displayName, iconURL: (moderator.avatarURL({forceStatic: true}) ?? moderator.user.avatarURL({forceStatic: true}) ?? undefined)})
		.setThumbnail((target.avatarURL({forceStatic: true}) ?? target.user.avatarURL({forceStatic: true})))
		.setFields(
			{ name: 'Reason', value: record.reason, inline: false},
			{ name: 'Member', value: `${target}\n${inlineCode(target.user.username)}`, inline: true },
			{ name: 'Moderator', value: `${moderator}\n${inlineCode(moderator.user.username)}`, inline: true },
			{
				name: 'Remaining Time',
				value: `Expire ${record.expireAt.toDiscordString(TimestampStyles.RelativeTime)} On ${record.expireAt.toDiscordString(TimestampStyles.LongDate)}`,
				inline: false
			},
			{
				name: 'Created At',
				value: `Issued ${record.createdAt.toDiscordString(TimestampStyles.RelativeTime)} On ${record.createdAt.toDiscordString(TimestampStyles.LongDate)}`,
				inline: false
			}
		)

	return addDocumentIdFooter(record,embed)
}

/**
 *
 * @param record
 * @param embed
 */
function addDocumentIdFooter(record:  HydratedDocument<IWarn>, embed:EmbedBuilder) {
	embed.setFooter({ text: `Warn Id: ${record.id}` })
	return embed
}
