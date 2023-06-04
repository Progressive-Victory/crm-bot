import {
	AutocompleteInteraction, ChatInputCommandInteraction, GuildMember 
} from 'discord.js';
import { State } from 'src/declarations/states';
import { REGION_ABBREVIATION_MAP } from 'src/structures/Constants';
import { states } from 'src/structures/helpers';
import { t } from 'src/i18n';
import rename from './vc/rename';
import ping from './ping';
import role from './region/role';
import { ns } from '../../builders/lead';
import { memberList } from './member-list';

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
	const member = interaction.member as GuildMember;
	const stateRole = member.roles.cache.find((r) => states.includes(r.name as State));
	const stateChannel = REGION_ABBREVIATION_MAP[interaction.channel.name];
	const focusedOption = interaction.options.getFocused(true);
	const meeting = t({
		key: 'meeting',
		locale: interaction.guildLocale,
		ns
	});
	const choices = [];

	if (stateChannel) choices.push(`${stateChannel} ${meeting}`);
	choices.push(`${stateRole.name} ${meeting}`);

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
