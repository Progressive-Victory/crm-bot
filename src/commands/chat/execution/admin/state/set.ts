import { stateDb } from '@util/database';
import { ChatInputCommandInteraction } from 'discord.js';

export async function set(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const name = options.getString('name', true);
	const abbreviation = options.getString('abbreviation', true).toLowerCase();

	await stateDb.findOneAndUpdate(
		{ guildId, abbreviation },
		{
			name,
			guildId,
			abbreviation
		},
		{ upsert: true }
	);
	await interaction.reply({ content: 'State created', ephemeral: true });
}
