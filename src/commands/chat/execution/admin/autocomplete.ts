import { statesConfig } from '@util/state/statesTypes';
import { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';

export function autocomplete(interaction: AutocompleteInteraction) {
	const focusedOption = interaction.options.getFocused(true);

	let choices: string[];
	let filtered: string[];
	let response: ApplicationCommandOptionChoiceData[];
	if (focusedOption.name === 'name') {
		choices = statesConfig.map((state) => state.name);
		filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
		response = filtered.map((choice) => ({ name: choice, value: choice }));
	}
	else if (focusedOption.name === 'abbreviation') {
		choices = statesConfig.map((state) => state.abbreviation);
		filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
		response = filtered.map((choice) => ({ name: choice, value: choice.toLowerCase() }));
	}

	// Respond with the filtered choices as an interaction response.
	return interaction.respond(response.slice(0, 14));
}
