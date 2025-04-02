import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export enum reportModalPrefix {
	userReport = 'ur',
	messageReport = 'mr'
}



const comment = new TextInputBuilder()
	.setCustomId('comment')
	.setLabel('📬 Comment')
	.setPlaceholder('Spam, etc')
	.setStyle(TextInputStyle.Paragraph)
	.setMaxLength(500)
	.setRequired(false)


export const reportModel = new ModalBuilder()
	.setTitle('Report')
	.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(comment))
