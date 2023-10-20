import { ns } from '@builders/lead';
import { t } from '@i18n';
import { createEventMemberRoleSelectMenu } from '@util/event';
import { ChannelType, ChatInputCommandInteraction } from 'discord.js';

const parentId = process.env.EVENT_CATEGORY_ID;

export async function updateEvent(interaction: ChatInputCommandInteraction<'cached'>) {
	const {
		locale, guild, options 
	} = interaction;

	// Get Text channel related to event
	const textChannel = options.getChannel(t({ key: 'event-option-channel', ns }), true, [ChannelType.GuildText]);
	// Get Event ID
	const event = guild.scheduledEvents.cache.find((_e, k) => k === textChannel.topic.split(':')[1]);

	// check if it is an event channel
	if (!event || !(textChannel.parentId === parentId)) {
		await interaction.reply({
			content: t({
				key: 'event-channel-bad-category',
				ns,
				locale
			}),
			ephemeral: true
		});
		return;
	}

	// Send select Menu
	await interaction.reply({
		components: [createEventMemberRoleSelectMenu(event.id, locale)],
		ephemeral: true
	});
}
