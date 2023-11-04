import { ChatInputCommandInteraction } from 'discord.js';
import { set } from './state/set';

export async function execute(interaction: ChatInputCommandInteraction) {
	switch (interaction.options.getSubcommand(true)) {
	case 'set':
		return set(interaction);

	default:
		break;
	}

	return null;
}
