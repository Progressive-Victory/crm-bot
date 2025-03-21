import { ButtonBuilder, ButtonStyle } from "discord.js";
import { HydratedDocument } from "mongoose";
import { WarningRecord } from "../../models/Warn.js";
import { IWarnSearch } from "../../models/WarnSearch.js";
import { AddSplitCustomId } from "../../util/index.js";

export const warnButtons = {
    // viewWarnButton: viewbutton,
    updateIssueButton: updateIssueButton,
    removeButton: removeButton,
    leftButton: leftButton,
    rightButton: rightButton,
};

// /**
//  * Button to view the warnings of the target
//  * @param target user to view
//  * @param filter
//  * @returns ButtonBuilder object
//  */
// function viewbutton(filter:FilterQuery<WarningRecord>) {
//     return new ButtonBuilder()
//         .setCustomId(AddSplitCustomId('warn','v', filter.targetDiscordId, filter.moderatorDiscordId, filter))
//         .setLabel('View Warnings')
//         .setStyle(ButtonStyle.Secondary);
// }
/**
 * Button to update a Warning
 * @param warn the warning object witch to update
 * @returns ButtonBuilder object
 */
function updateIssueButton(warn:WarningRecord) {
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
function removeButton(warn:WarningRecord) {
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
function leftButton(searchRecord:HydratedDocument<IWarnSearch>) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('wvl', searchRecord.id))
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(searchRecord.pageStart > 0);
}

/**
 *
 * @param searchRecord
 * @param disabled
 * @returns
 */
function rightButton(searchRecord:HydratedDocument<IWarnSearch>, disabled:boolean = true) {
    return new ButtonBuilder()
        .setCustomId(AddSplitCustomId('wvr', searchRecord.id))
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
}
