import { Locale, PermissionFlagsBits } from 'discord.js';
import { localization, t } from '../../../i18n';
import { ChatInputCommand } from '../../../Client';
import { execute } from '../execution/metrics';

const ns = 'metric';
const locale = Locale.EnglishUS;

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t('command-name', locale, ns))
			.setDescription(t('command-description', locale, ns))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addUserOption((option) =>
				option

					.setName(t('user-option-name', locale, ns))
					.setDescription(t('user-option-description', locale, ns))
					.setNameLocalizations(localization('user-option-name', ns))
					.setDescriptionLocalizations(localization('user-option-description', ns))
					.setRequired(false)
			)
	)
	.setGlobal(true)
	.setExecute(execute);
