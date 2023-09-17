import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ActionRowBuilder, Locale, ModalBuilder, TextInputBuilder, TextInputStyle 
} from 'discord.js';

export function createEventModal(locale: Locale) {
	return new ModalBuilder()
		.setCustomId('event_create')
		.setTitle(
			t({
				key: 'modal-title-event-create',
				ns,
				locale
			})
		)
		.addComponents(
			// Name of Event
			new ActionRowBuilder<TextInputBuilder>().setComponents(
				new TextInputBuilder()
					.setCustomId('name')
					.setLabel(
						t({
							key: 'modal-label-event-create-name',
							ns,
							locale
						})
					)
					.setPlaceholder(
						t({
							key: 'modal-placeholder-event-create-name',
							ns,
							locale
						})
					)
					.setMinLength(1)
					.setMaxLength(100)
					.setRequired(true)
					.setStyle(TextInputStyle.Short)
			),
			// Description of event
			new ActionRowBuilder<TextInputBuilder>().setComponents(
				new TextInputBuilder()
					.setCustomId('description')
					.setLabel(
						t({
							key: 'modal-label-event-create-description',
							ns,
							locale
						})
					)
					.setPlaceholder(
						t({
							key: 'modal-placeholder-event-create-description',
							ns,
							locale
						})
					)
					.setMinLength(1)
					.setMaxLength(1000)
					.setRequired(false)
					.setStyle(TextInputStyle.Paragraph)
			),
			// Date of event
			new ActionRowBuilder<TextInputBuilder>().setComponents(
				new TextInputBuilder()
					.setCustomId('date')
					.setLabel(
						t({
							key: 'modal-label-event-create-date',
							ns,
							locale
						})
					)
					.setPlaceholder(
						t({
							key: 'modal-placeholder-event-create-date',
							ns,
							locale
						})
					)
					.setMinLength(10)
					.setMaxLength(10)
					.setRequired(true)
					.setStyle(TextInputStyle.Short)
			),
			// Time of event EST
			new ActionRowBuilder<TextInputBuilder>().setComponents(
				new TextInputBuilder()
					.setCustomId('time')
					.setLabel(
						t({
							key: 'modal-label-event-create-time',
							ns,
							locale
						})
					)
					.setPlaceholder(
						t({
							key: 'modal-placeholder-event-create-time',
							ns,
							locale
						})
					)
					.setMinLength(5)
					.setMaxLength(5)
					.setRequired(true)
					.setStyle(TextInputStyle.Short)
			)
		);
}
