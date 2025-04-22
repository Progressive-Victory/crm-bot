import { APIEmbedField, ColorResolvable, EmbedAuthorOptions, EmbedBuilder, EmbedFooterOptions, Guild, GuildMember, ImageURLOptions, inlineCode, TimestampStyles, User } from "discord.js";
import { client } from "../../index.js";
import { WarningRecord } from "../../models/Warn.js";
import { getMember } from "../../util/index.js";
import { numberOfWarnEmbedsOnPage, WarnEmbedColor } from "./types.js";

/**
 *
 * @param record
 * @param moderator
 * @param target
 * @returns
 */
export function newWarnModEmbed(record: WarningRecord, moderator: GuildMember, target: GuildMember) {
	const embed = new EmbedBuilder()
		.setTitle('Warning Issued')
		.setColor(WarnEmbedColor.updated)
		.setThumbnail(target.displayAvatarURL({forceStatic: true}))
		.setFields(
			reasonField(record.reason),
			userField('Member', target.user),
			// userField('Moderator', moderator.user),
			expireAtField(record),
		)
		.setFooter(documentIdFooter(record))
	return embed
}

/**
 *
 * @param record
 * @param moderator
 * @param target
 * @param updater
 * @returns
 */
export function warnLogUpdateEmbed(record: WarningRecord, moderator: GuildMember, target: GuildMember, updater: GuildMember) {
	const embed = new EmbedBuilder()
		.setTitle('Warning updated')
		.setColor(WarnEmbedColor.issued)
		// .setThumbnail(target.displayAvatarURL({forceStatic: true}))
		.setFields(
			reasonField(record.reason),
			userField('Member', target.user),
			userField('Moderator', moderator.user),
			userField('Updated By', updater.user),

			expireAtField(record),
		)
		.setFooter(documentIdFooter(record))
		.setTimestamp()
		.setAuthor(getAuthorOptions(target))
	return embed
}

/**
 *
 * @param record
 * @param moderator
 * @param target
 * @returns
 */
export function warnIssueUpdateEmbed(record: WarningRecord, target: GuildMember) {
	const embed = new EmbedBuilder()
		.setTitle('Warning updated')
		.setColor(WarnEmbedColor.updated)
		.setThumbnail(target.displayAvatarURL({forceStatic: true}))
		.setFields(
			reasonField(record.reason),
			userField('Member', target.user),
			// userField('Moderator', moderator.user),
			expireAtField(record),
		)
		.setFooter(documentIdFooter(record))
	return embed
}

/**
 * Embed set to recipient of a warning over dm
 * @param record document of a warning
 * @param records
 * @param count
 * @param guild guild where warning was issued
 * @returns embedBuilder
 */
export function newWarningDmEmbed(record:WarningRecord, count:number, guild:Guild) {
	return new EmbedBuilder()
		.setTitle('You Have Received a Warning')
		.setColor(WarnEmbedColor.updated)
		.addFields(
			reasonField(record.reason, 'Reason for this warning'),
			activeWarningCountField(count)
		)
		.setAuthor({
			name: guild.name,
			iconURL: guild.iconURL({ forceStatic: true })
				?? undefined })
		.setFooter(documentIdFooter(record))
}

/**
 *
 * @param record
 * @param moderator
 * @param target
 * @returns
 */
export function newWarningLogEmbed(record: WarningRecord, moderator: GuildMember, target: GuildMember) {
	const embed = new EmbedBuilder()
		.setTitle('Warning Issued')
		.setColor(WarnEmbedColor.updated)
		.setAuthor(getAuthorOptions(moderator))
		.setThumbnail(target.displayAvatarURL({forceStatic:true}))
		.setFields(
			reasonField(record.reason),
			userField('Member', target.user),
			userField('Moderator', moderator.user),
			expireAtField(record),
		)
		.setFooter(documentIdFooter(record))
		.setTimestamp(record.createdAt)
	return embed
}

/**
 * Render records to an array of embed
 * @param records Array of Warn documents from search
 * @param isMod flag for if request is from a mod
 * @param start The idex location of were to start
 * @returns Array of EmbedBuilders
 */
export async function viewWarningEmbeds(records: WarningRecord[], isMod:boolean, start:number = 0) {

	const embeds: EmbedBuilder[] = [];
	// start indexing at start
	// Continue while number of embeds is less than numberOfWarnEmbedsOnPage and index is less than the warning documents
	// then increases index by one
	for (let index = start; embeds.length < numberOfWarnEmbedsOnPage && index < records.length; index++) {
		// get record located at index
		const record = records[index];

		// Embed color based on the status of the warning
		const color = record.expireAt > new Date() ? WarnEmbedColor.Active : WarnEmbedColor.Inactive
		
		// Render embed
		const embed = await viewWarningEmbed(record, isMod, color)
		
		// If embed is undefined is is not added to the embeds array
		if(!embed) continue;
		embeds.push(embed);
	}

	return embeds;
}

/**
 * Render warning embed
 * @param warn Warning document
 * @param record
 * @param isMod
 * @param embedColor color of the embed
 * @returns EmbedBuilder or undefined
 */
export async function viewWarningEmbed(record: WarningRecord, isMod:boolean, embedColor: ColorResolvable = WarnEmbedColor.updated) {

	// Get guild from cache or fetch
	const guild = client.guilds.cache.get(record.guildId) ?? await client.guilds.fetch(record.guildId).catch(console.error)
	if(!guild) return

	

	const embed = new EmbedBuilder()
		.addFields(reasonField(record.reason))
		.setColor(embedColor)
		.setFooter(documentIdFooter(record))
	if (isMod) {
		// Get target from cache or fetch
		const target = await getMember(guild, record.target.discordId)
		
		// Get moderator from cache or fetch
		const moderator = await getMember(guild, record.moderator.discordId)

		const targetFieldName = 'Member'
		
		// Check if target present if target is not present uses username from warning document
		if(!target) embed.addFields(userField(targetFieldName, record.target.username))
		// if target is present use GuildMember for username and avatar
		else embed.addFields(userField(targetFieldName, target.user))
			// If user does not have a server avatar try user avatar
			.setThumbnail(target.displayAvatarURL({forceStatic: true}))
	

		const moderatorFieldName = 'Moderator'
		
		// Check if target present if moderator is not present uses username from warning document
		if (!moderator) embed.addFields(userField(moderatorFieldName, record.moderator.username))

		// if moderator is present use GuildMember for username
		else embed.addFields(userField(moderatorFieldName, moderator.user))

		// Check if warning document updater fields present
		if(record.updater?.discordId && record.updater?.username){

			// Get updater from cache or fetch
			const updater = await getMember(guild, record.updater.discordId)
			const updaterFieldName = 'Last Updated By'
			
			// If updater is present add felid to embed
			if (updater) embed.addFields(userField(updaterFieldName, updater.user))
			else embed.addFields(userField(updaterFieldName, record.updater.username))
		}
		embed.addFields(expireAtField(record))
			.setTimestamp(record.createdAt)
	} else {
		embed.setTimestamp(record.createdAt)
	}

	return embed
}


/**
 * Text for footed of embed 
 * @param record Warning record
 * @returns footer option
 */
export function documentIdFooter(record: WarningRecord): EmbedFooterOptions {
	return { text: `Warn Id: ${record.id}` }
}

/**
 *
 * @param record
 * @param inline
 * @returns
 */
export function expireAtField(record: WarningRecord, inline:boolean = false): APIEmbedField {
	return {
		name: 'Remaining Time',
		value: `Expire ${record.expireAt.toDiscordString(TimestampStyles.RelativeTime)} On ${record.expireAt.toDiscordString(TimestampStyles.LongDate)}`,
		inline
	}
	
}

/**
 *
 * @param record
 * @param inline
 * @returns
 */
// function createdAtField(record: WarningRecord, inline:boolean = false): APIEmbedField {
// 	return {
// 		name: 'Created At',
// 		value: `Issued ${record.createdAt.toDiscordString(TimestampStyles.RelativeTime)} On ${record.createdAt.toDiscordString(TimestampStyles.LongDate)}`,
// 		inline
// 	}
// }

/**
 *
 * @param user
 * @param name
 * @param inline
 * @returns
 */
export function userField(name:string, user:User | string, inline:boolean = true): APIEmbedField {
	let value:string

	if(typeof user === 'string') {
		value = inlineCode(user)
	} else {
		value = `${user.toString()}\n${inlineCode(user.username)}`
	}

	return {name, value, inline}
}
/**
 *
 * @param reason
 * @param title
 * @param inline
 * @returns
 */
export function reasonField(reason:string, title?:string, inline:boolean = false): APIEmbedField {
	return {
		name: title ?? 'Reason',
		value: reason,
		inline
	}
}

/**
 *
 * @param count
 * @param inline
 * @returns
 */
function activeWarningCountField(count:number, inline: boolean = false): APIEmbedField {
	return {
		name: 'Active warnings',
		value: `You have ${inlineCode(count.toString())} active Warnings`,
		inline
	}
	
}

/**
 * get the URL for the avatar of a guild member
 * @param member the member to get the avatar of
 * @param imageOptions additional options for the image
 * @returns URL of the image
 */
export function getAuthorOptions(member:GuildMember, imageOptions: ImageURLOptions = {forceStatic: true}): EmbedAuthorOptions  {
	return {
		name: member.displayName,
		iconURL: member.displayAvatarURL(imageOptions)
	}
}
