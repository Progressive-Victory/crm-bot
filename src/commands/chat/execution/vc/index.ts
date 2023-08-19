import { t } from '@i18n';
import { ChatInputCommandInteraction } from 'discord.js';

import { ns } from '@builders/vc';
import { Logger } from '@Client';
import { joinRequest } from './join';

export async function lead(interaction: ChatInputCommandInteraction<'cached'>) {
	const subcommand = interaction.options.getSubcommand(true);
	// const subcommandGroup = interaction.options.getSubcommandGroup();
	Logger.info(subcommand, t({ key: 'request-join-name', ns }));
	if (subcommand === t({ key: 'request-join-name', ns })) return joinRequest(interaction);

	// Throw an error if the subcommand or subcommand group is not recognized.
	throw Error;
}
