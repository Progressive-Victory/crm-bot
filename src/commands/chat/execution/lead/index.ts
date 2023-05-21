import {
	AutocompleteInteraction, ChatInputCommandInteraction, GuildMember 
} from 'discord.js';
import { State } from '../../../../declarations/states';
import { REGION_ABBREVIATION_MAP } from '../../../../structures/Constants';
import { states } from '../../../../structures/helpers';
import { t } from '../../../../i18n';
import rename from './vc/rename';
import ping from './ping';
import role from './region/role';

export const ns = 'lead';

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
	}
	throw Error;
}

/**
 * responds to autocomplete requests
 * @param interaction command interaction
 * @returns interaction response
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

	const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
	return interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 14));
}

export default {
	ns,
	lead,
	autoComplete
};
