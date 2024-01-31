import { Event } from '@progressive-victory/client';
import {
	ButtonInteraction, Events, Interaction
} from 'discord.js';

import { generateEmbed } from '@execution/admin/rules';

async function onInteractionCreate(interaction: Interaction) {
	if (interaction instanceof ButtonInteraction) {
		const key = interaction.customId;
		const content = generateEmbed(key, true);

		if (!content) {
			await interaction.reply({ content: 'Invalid button', ephemeral: true });
		}

		await interaction.reply(content);
	}

	return null;
}

export default new Event().setName(Events.InteractionCreate).setExecute(onInteractionCreate);
