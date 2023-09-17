import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ButtonBuilder, ButtonStyle, Locale 
} from 'discord.js';

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
