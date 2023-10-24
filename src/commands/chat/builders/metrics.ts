import { execute } from '@execution/metrics';
import { localization, t } from '@i18n';
import { ChatInputCommand } from 'discord-client';
import { PermissionFlagsBits } from 'discord.js';

export const ns = 'metric';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addUserOption((option) =>
				option
					.setName(t({ key: 'user-option-name', ns }))
					.setDescription(t({ key: 'user-option-description', ns }))
					.setNameLocalizations(localization('user-option-name', ns))
					.setDescriptionLocalizations(localization('user-option-description', ns))
					.setRequired(false)
			)
	)
	.setGlobal(true)
	.setExecute(execute);
