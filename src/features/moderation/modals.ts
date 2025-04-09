import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { defaultNumberOfDaysBeforeExpiration } from "./types.js"

/**
 * Create Modal for creating or updated warn
 * @param customId
 * @param title
 * @param reason
 * @param day
 * @returns
 */
export function warnModal(customId:string, title: string, reason?:string, day?: number) {

	const reasonInput = new TextInputBuilder()
		.setCustomId('reason')
		.setLabel('Reason for issuing this warning')
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true)
	
	const durationInput = new TextInputBuilder()
		.setCustomId('duration')
		.setLabel('Number of days till warning expires')
		.setPlaceholder(defaultNumberOfDaysBeforeExpiration.toString())
		.setMinLength(1)
		.setMaxLength(3)
		.setStyle(TextInputStyle.Short)
		.setRequired(false)

	if(reason)
		reasonInput.setValue(reason)

	if(day)
		durationInput.setValue(day.toString())

	const firstActionRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(reasonInput)
	const secondActionRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(durationInput)

	const modal = new ModalBuilder()
		.setTitle(title)
		.setCustomId(customId)
		.addComponents(firstActionRow,secondActionRow)

	return modal
}
