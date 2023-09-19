import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ButtonBuilder, ButtonStyle, Locale 
} from 'discord.js';

/**
 *
 * @param link URL for event
 * @param locale Locale of where the button
 * @returns Button to event modal
 */
export function eventLinkButton(link: string, locale: Locale) {
	return new ButtonBuilder()
		.setEmoji('🗓️')
		.setLabel(
			t({
				key: 'event-success-button-event',
				ns,
				locale
			})
		)
		.setURL(link)
		.setStyle(ButtonStyle.Link);
}

/**
 *
 * @param link URL for event
 * @param locale Locale of where the button
 * @returns Button to voice channel
 */
export function eventVCLinkButton(link: string, locale: Locale) {
	return new ButtonBuilder()
		.setEmoji('🗣️')
		.setLabel(
			t({
				key: 'event-success-button-vc',
				ns,
				locale
			})
		)
		.setURL(link)
		.setStyle(ButtonStyle.Link);
}

/**
 *
 * @param link URL for event
 * @param locale Locale of where the button
 * @returns Button to text channel
 */
export function eventChatLinkButton(link: string, locale: Locale) {
	return new ButtonBuilder()
		.setEmoji('💬')
		.setLabel(
			t({
				key: 'event-success-button-chat',
				ns,
				locale
			})
		)
		.setURL(link)
		.setStyle(ButtonStyle.Link);
}
