import { t } from '@i18n';
import { ChatInputCommandInteraction } from 'discord.js';

import { ns } from '@builders/vc';
import { joinRequest } from './join';

export async function lead(interaction: ChatInputCommandInteraction<'cached'>) {
	const subcommand = interaction.options.getSubcommand(true);
	// const subcommandGroup = interaction.options.getSubcommandGroup();

	if (subcommand === t({ key: 'command-name', ns })) return joinRequest(interaction);

	// Throw an error if the subcommand or subcommand group is not recognized.
	throw Error;
}
