import { ns } from '@builders/lead';
import { t } from '@i18n';
import { createEventMemberaRoleSelectMenu } from '@util/event';
import { ChannelType, ChatInputCommandInteraction } from 'discord.js';

const parentId = process.env.EVENT_CATEGORY_ID;

export async function updateEvent(interaction: ChatInputCommandInteraction<'cached'>) {
	const {
		locale, guild, options 
	} = interaction;

	const textChannel = options.getChannel(t({ key: 'event-option-channel', ns }), true, [ChannelType.GuildText]);
	const event = guild.scheduledEvents.cache.find((_e, k) => k === textChannel.topic.split(':')[1]);

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

	await interaction.reply({
		components: [createEventMemberaRoleSelectMenu(event.id, locale)],
		ephemeral: true
	});
}
