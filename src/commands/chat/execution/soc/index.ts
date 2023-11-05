import { statesConfig } from '@util/state/statesTypes';
import {
	ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction 
} from 'discord.js';
import { add } from './statelead/add';
import { remove } from './statelead/remove';

export async function soc(interaction: ChatInputCommandInteraction) {
	const subcommandGroup = interaction.options.getSubcommandGroup(true);
	const subcommand = interaction.options.getSubcommand(true);

	if (subcommandGroup === 'statelead') {
		if (subcommand === 'add') return add(interaction);
		if (subcommand === 'remove') return remove(interaction);
	}
	return null;
}

export async function socAutocomplete(interaction: AutocompleteInteraction) {
	const focusedOption = interaction.options.getFocused(true);

	if (focusedOption.name !== 'state') return;

	const choices: ApplicationCommandOptionChoiceData[] = statesConfig
		.filter((state) => state.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
		.map((state) => ({ name: state.name, value: state.abbreviation }))
		.slice(0, 14);

	interaction.respond(choices);
}
