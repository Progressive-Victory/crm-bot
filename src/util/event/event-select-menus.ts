import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ActionRowBuilder, Locale, MentionableSelectMenuBuilder, Snowflake 
} from 'discord.js';

export function createEventMemberaRoleSelectMenu(eventId: Snowflake, locale: Locale) {
	return new ActionRowBuilder<MentionableSelectMenuBuilder>().addComponents(
		new MentionableSelectMenuBuilder()
			.setCustomId(`vc_${eventId}`)
			.setPlaceholder(
				t({
					key: 'event-select-menu',
					ns,
					locale
				})
			)
			.setMinValues(1)
			.setMaxValues(20)
	);
}
