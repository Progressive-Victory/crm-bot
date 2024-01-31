import { ChatInputCommandInteraction } from 'discord.js';
import rules from './rules';

/**
 * Executes the admin command based on the subcommand and subcommand group provided in the interaction options.
 * @param interaction - The chat input command interaction object.
 */
export async function admin(interaction: ChatInputCommandInteraction<'cached'>) {
	const subcommand = interaction.options.getSubcommand(true);
	// const subcommandGroup = interaction.options.getSubcommandGroup();

	switch (subcommand) {
	case 'rules':
		return rules(interaction);
	default:
		throw Error('No Subcommand');
	}

	// Throw an error if the subcommand or subcommand group is not recognized.
}
