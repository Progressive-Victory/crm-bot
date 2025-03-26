import { ButtonBuilder, ButtonStyle, Snowflake } from "discord.js";
import { HydratedDocument } from "mongoose";
import { IWarn, WarningRecord } from "../../models/Warn.js";
import { IWarnSearch } from "../../models/WarnSearch.js";
import { AddSplitCustomId } from "../../util/index.js";
import { numberOfWarnEmbedsOnPage } from "./types.js";

/**
 * Button to view the warnings of the target
 * @param targetId user to view
 * @param guildId uses if guild id is not useable at button press
 * @returns ButtonBuilder object
 */
export function viewUserWarns(targetId:Snowflake, guildId?: Snowflake) {

	const button = new ButtonBuilder()
		.setEmoji('🔎')
        .setLabel('View Warning History')
        .setStyle(ButtonStyle.Secondary);
	if (guildId) {
        button.setCustomId(AddSplitCustomId('vuw', targetId, guildId))
	} else {
		button.setCustomId(AddSplitCustomId('vuw', targetId))
	}

    return button
}
/**
 * Button to update a Warning
 * @param warn the warning object witch to update
 * @returns ButtonBuilder object
 */
export function updateIssueButton(warn:WarningRecord) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('wiu', warn.id))
		.setEmoji('📝')
        .setLabel('Update Reason')
        .setStyle(ButtonStyle.Secondary);
}
/**
 * Create Button builder to remove a warning
 * @param warn the warning to be removed
 * @returns new button builder
 */
export function removeButton(warn:WarningRecord) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('warn','r', warn.id))
        .setLabel('End Warning')
        .setStyle(ButtonStyle.Danger);
}

/**
 * Create move left button for viewing warnings
 * @param searchRecord Warning Search document
 * @returns ButtonBuilder for the move left button
 */
export function leftButton(searchRecord:HydratedDocument<IWarnSearch>) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('wvl', searchRecord.id))
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
        .setCustomId(AddSplitCustomId('wvr', searchRecord.id))
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
 * provide dm button for users to appeal warns
 * @param warn record of the warning
 * @returns ButtonBuilder
 */
export function appealDm(warn: WarningRecord) {
	return new ButtonBuilder()
		.setCustomId(AddSplitCustomId('wa',warn.id))
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
		.setCustomId('Hey real nice to meet you hear, but you should not be reading this')
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
export function updatedByIdButton(record: WarningRecord){
	return new ButtonBuilder()
		.setCustomId(AddSplitCustomId('ubi',record.id))
		.setLabel('Update Warning')
		.setEmoji('📝')
		.setStyle(ButtonStyle.Secondary)
}
