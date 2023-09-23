import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ActionRowBuilder, Locale, MentionableSelectMenuBuilder, Snowflake 
} from 'discord.js';

/**
 *
 * @param eventId ID of an event which is being referenced
 * @param locale Locale to use for placeholder
 * @returns Action row with Mentionable Select Menu Builder
 */
export function createEventMemberRoleSelectMenu(eventId: Snowflake, locale: Locale) {
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
