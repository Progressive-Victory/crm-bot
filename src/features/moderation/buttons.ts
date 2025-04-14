import { ButtonBuilder, ButtonStyle, Guild, Snowflake } from "discord.js";
import { HydratedDocument } from "mongoose";
import { IWarn, WarningRecord } from "../../models/Warn.js";
import { IWarnSearch } from "../../models/WarnSearch.js";
import { AddSplitCustomId } from "../../util/index.js";
import { numberOfWarnEmbedsOnPage, WarnButtonsPrefixes } from "./types.js";

/**
 * Create move left button for viewing warnings
 * @param searchRecord Warning Search document
 * @returns ButtonBuilder for the move left button
 */
export function leftButton(searchRecord:HydratedDocument<IWarnSearch>) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId(WarnButtonsPrefixes.viewWarningsLeft, searchRecord.id))
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(searchRecord.pageStart === 0);
}

/**
 * Create move right button for viewing warnings
 * @param searchRecord Warning Search document
 * @param records Array of warn documents
 * @returns ButtonBuilder
 */
export function rightButton(searchRecord:HydratedDocument<IWarnSearch>, records:HydratedDocument<IWarn>[]) {
	
	// button is disabled if the start page plus the number of warn embeds on page is greater than the number of records
	const isDisabled = searchRecord.pageStart + numberOfWarnEmbedsOnPage >= records.length
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId(WarnButtonsPrefixes.viewWarningsRight, searchRecord.id))
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(isDisabled);
}

/**
 * Creates button for viewing page number
 * @param searchRecord warn search document
 * @param records Array of warn documents
 * @returns ButtonBuilder
 */
export function pageNumber(searchRecord:HydratedDocument<IWarnSearch>, records:HydratedDocument<IWarn>[]) {
	
	const currentPage = (searchRecord.pageStart+numberOfWarnEmbedsOnPage)/numberOfWarnEmbedsOnPage

	// round up the record length divided by the number of warn embeds on page
	const totalPages = Math.ceil(records.length/numberOfWarnEmbedsOnPage)
	
	return new ButtonBuilder()
		.setDisabled(true)
		.setCustomId('Button does not use ID')
		.setLabel(`${currentPage}/${totalPages}`)
		.setStyle(ButtonStyle.Primary)
}

/**
 * Button to view the warnings of the target
 * @param targetId user to view
 * @returns ButtonBuilder object
 */
export function modViewWarningHistory(targetId:Snowflake) {
	return viewWarnHistory()
		.setCustomId(
			AddSplitCustomId(WarnButtonsPrefixes.modViewWarningHistory,
				targetId
			)
		)

}

/**
 *
 * @param targetId
 * @param guild
 * @returns
 */
export function userViewWarnHistory(targetId:Snowflake, guild:Guild) {
	return viewWarnHistory()
		.setCustomId(
			AddSplitCustomId(WarnButtonsPrefixes.userViewWarningHistory,
				targetId,
				guild.id
			)
		)
}
/**
 *
 * @param targetId
 * @param code
 * @returns
 */
function viewWarnHistory() {

	return new ButtonBuilder()
		.setEmoji('🔎')
        .setLabel('View Warning History')
        .setStyle(ButtonStyle.Secondary)
}


/**
 * Button to update a Warning
 * @param record the warning object witch to update
 * @returns ButtonBuilder object
 */
export function warnUpdateFromIssue(record:WarningRecord) {
    return updateWarn(record, WarnButtonsPrefixes.updateWarnById)
}

/**
 * Button to update a Warning
 * @param record the warning object witch to update
 * @returns ButtonBuilder object
 */
export function warnUpdateFromLog(record:WarningRecord) {
    return updateWarn(record, WarnButtonsPrefixes.updateWarnById)
}


/**
 *
 * @param record
 * @param code
 * @returns
 */
function updateWarn(record: WarningRecord, code: WarnButtonsPrefixes) {
	return new ButtonBuilder()
		.setCustomId(AddSplitCustomId(code, record.id))
		.setEmoji('📝')
		.setLabel('Update Reason')
		.setStyle(ButtonStyle.Secondary);
}

/**
 * provide dm button for users to appeal warns
 * @param record record of the warning
 * @returns ButtonBuilder
 */
export function appealWarn(record: WarningRecord) {
	return new ButtonBuilder()
		.setCustomId(AddSplitCustomId(WarnButtonsPrefixes.appealWarn, record.id))
		.setLabel('Appeal')
		.setEmoji('📜')
		.setStyle(ButtonStyle.Danger)
}

/**
 * update for DM appeal to give user feedback that appeal was submitted
 * @returns ButtonBuilder
 */
export function appealDmSubmitted() {
	return new ButtonBuilder()
		.setCustomId('Button does not use ID')
		.setLabel('Appeal Submitted')
		.setEmoji('📫')
		.setDisabled(true)
		.setStyle(ButtonStyle.Success)
}

/**
 *
 * @param record
 * @returns
 */
export function updateWarnById(record: WarningRecord){
	return new ButtonBuilder()
		.setCustomId(AddSplitCustomId(WarnButtonsPrefixes.updateWarnById, record.id))
		.setLabel('Update Warning')
		.setEmoji('📝')
		.setStyle(ButtonStyle.Secondary)
}
