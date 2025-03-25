import { ButtonBuilder, ButtonStyle, Snowflake } from "discord.js";
import { HydratedDocument } from "mongoose";
import { WarningRecord } from "../../models/Warn.js";
import { IWarnSearch } from "../../models/WarnSearch.js";
import { AddSplitCustomId } from "../../util/index.js";

/**
 * Button to view the warnings of the target
 * @param targetId user to view
 * @returns ButtonBuilder object
 */
export function viewUserWarns(targetId:Snowflake ) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('vuw', targetId))
		.setEmoji('🔎')
        .setLabel('View Warning History')
        .setStyle(ButtonStyle.Secondary);
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
 * create move left button for viewing warnings
 * @param searchRecord
 * @returns
 */
export function leftButton(searchRecord:HydratedDocument<IWarnSearch>) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('wvl', searchRecord.id))
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(searchRecord.pageStart == 0);
}

/**
 *
 * @param searchRecord
 * @param disabled
 * @returns
 */
export function rightButton(searchRecord:HydratedDocument<IWarnSearch>, disabled:boolean = true) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('wvr', searchRecord.id))
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
}

/**
 *
 * @param current
 * @param total
 * @returns
 */
export function pageNumber(current: number, total:number) {
	return new ButtonBuilder()
	.setDisabled(true)
	.setCustomId('Button does not use ID')
	.setLabel(`${current}/${total}`)
	.setStyle(ButtonStyle.Primary)
}
