import { createEventModal } from '@util/event';
import {
	CategoryChannel, ChannelType, ChatInputCommandInteraction 
} from 'discord.js';

export async function createEvent(interaction: ChatInputCommandInteraction<'cached'>) {
	const { guild, locale } = interaction;

	// Find event category
	const eventCategory = guild.channels.cache.find((c, k) => k === process.env.EVENT_CATEGORY_ID && c.type === ChannelType.GuildCategory) as CategoryChannel;
	if (!eventCategory) {
		throw Error('Faild to find Event Channel Please check .env.EVENT_CATEGORY_ID');
	}

	// Create and send modal
	const create = createEventModal(locale);
	await interaction.showModal(create);
}
