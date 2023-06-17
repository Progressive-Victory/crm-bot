import { ns } from '@builders/lead';
import { t } from '@i18n';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { states } from 'src/structures';
import { memberList } from './member-list';
import ping from './ping';
import role from './region/role';
import rename from './vc/rename';

/**
 * Executes the lead command based on the subcommand and subcommand group provided in the interaction options.
 * @param interaction - The chat input command interaction object.
 */
export async function lead(interaction: ChatInputCommandInteraction<'cached'>) {
	const subcommand = interaction.options.getSubcommand(true);
	const subcommandGroup = interaction.options.getSubcommandGroup();

	switch (subcommandGroup) {
	case 'vc':
		if (subcommand === 'rename') return rename(interaction);
		break;
	case 'region':
		if (subcommand === 'role') return role(interaction);
		break;
	default:
		if (subcommand === 'ping') return ping(interaction);
		if (subcommand === 'member-list') return memberList(interaction);
	}

	// Throw an error if the subcommand or subcommand group is not recognized.
	throw Error;
}

/**
 * Responds to autocomplete requests by providing suggestions based on the interaction options.
 * @param interaction - The autocomplete interaction object.
 * @returns The interaction response.
 */
export function autoComplete(interaction: AutocompleteInteraction<'cached'>) {
	const { member } = interaction;
	const stateConfig = states.find((s) => member.roles.cache.find((r) => r.name === s.abbreviation));
	const focusedOption = interaction.options.getFocused(true);
	const meeting = t({
		key: 'meeting',
		locale: interaction.guildLocale,
		ns
	});

	const choices = [`${stateConfig.name} ${meeting}`, `${stateConfig.abbreviation} ${meeting}`];

	// Filter the choices based on the focused option.
	const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));

	// Respond with the filtered choices as an interaction response.
	return interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 14));
}

// Export the lead and autoComplete functions as properties of the exported object.
export default {
	lead,
	autoComplete
};
