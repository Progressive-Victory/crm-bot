import {
	PermissionFlagsBits, ChannelType, Locale 
} from 'discord.js';
import { ChatInputCommand } from '../../../Client';
import { localization, t } from '../../../i18n';
import { lead, autoComplete } from '../execution/lead';

export const ns = 'lead';
const locale = Locale.EnglishUS;

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t('command-name', locale, ns))
			.setDescription(t('command-description', locale, ns))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels)
			.setDMPermission(false)
			.addSubcommandGroup((subcommandGroup) =>
				subcommandGroup
					.setName(t('region-name', locale, ns))
					.setDescription(t('region-description', locale, ns))
					.setNameLocalizations(localization('region-name', ns))
					.setDescriptionLocalizations(localization('region-description', ns))
					.addSubcommand((subcommand) =>
						subcommand
							.setName(t('region-role-name', locale, ns))
							.setDescription(t('region-role-description', locale, ns))
							.setNameLocalizations(localization('region-role-name', ns))
							.setDescriptionLocalizations(localization('region-role-description', ns))
							.addUserOption((option) =>
								option
									.setName(t('region-role-user-name', locale, ns))
									.setDescription(t('region-role-user-description', locale, ns))
									.setNameLocalizations(localization('region-role-user-name', ns))
									.setDescriptionLocalizations(localization('region-role-user-description', ns))
									.setRequired(true)
							)
					)
			)
			.addSubcommandGroup((subcommandGroup) =>
				subcommandGroup
					.setName(t('vc-name', locale, ns))
					.setDescription(t('vc-description', locale, ns))
					.setNameLocalizations(localization('vc-name', ns))
					.setDescriptionLocalizations(localization('vc-description', ns))
					.addSubcommand((subcommand) =>
						subcommand
							.setName(t('vc-rename-name', locale, ns))
							.setDescription(t('vc-rename-description', locale, ns))
							.setNameLocalizations(localization('vc-rename-name', ns))
							.setDescriptionLocalizations(localization('vc-rename-description', ns))
							.addChannelOption((options) =>
								options
									.setName(t('vc-rename-channel-name', locale, ns))
									.setDescription(t('vc-rename-channel-description', locale, ns))
									.setNameLocalizations(localization('vc-rename-channel-name', ns))
									.setDescriptionLocalizations(localization('vc-rename-channel-description', ns))
									.setRequired(true)
									.addChannelTypes(ChannelType.GuildVoice)
							)
							.addStringOption((option) =>
								option
									.setName(t('vc-rename-name-name', locale, ns))
									.setDescription(t('vc-rename-name-description', locale, ns))
									.setNameLocalizations(localization('vc-rename-name-name', ns))
									.setDescriptionLocalizations(localization('vc-rename-name-description', ns))
									.setRequired(true)
									.setAutocomplete(true)
									.setMinLength(5)
									.setMaxLength(100)
							)
					)
			)
	)
	.setGlobal(true)
	.setAutocomplete(autoComplete)
	.setExecute(lead);
