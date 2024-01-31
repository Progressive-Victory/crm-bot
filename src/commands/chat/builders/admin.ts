import { admin } from '@execution/admin';
import { localization, t } from '@i18n';
import { ChatInputCommand } from '@progressive-victory/client';
import { PermissionFlagsBits } from 'discord.js';

export const ns = 'admin';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setDMPermission(false)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.addSubcommand((subcommand) =>
				subcommand
					.setName(t({ key: 'subcommand-name', ns }))
					.setDescription(t({ key: 'subcommand-description', ns }))
					.setNameLocalizations(localization('subcommand-name', ns))
					.setDescriptionLocalizations(localization('subcommand-description', ns))
			)
	)
	.setGlobal(true)
	.setExecute(admin);
