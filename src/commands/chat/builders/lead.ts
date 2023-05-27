import { PermissionFlagsBits, ChannelType } from 'discord.js';
import { ChatInputCommand } from '../../../Client';
import { localization, t } from '../../../i18n';
import { lead, autoComplete } from '../execution/lead';

export const ns = 'lead';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels)
			.setDMPermission(false)
			.addSubcommandGroup((subcommandGroup) =>
				subcommandGroup
					.setName(t({ key: 'region-name', ns }))
					.setDescription(t({ key: 'region-description', ns }))
					.setNameLocalizations(localization('region-name', ns))
					.setDescriptionLocalizations(localization('region-description', ns))
					.addSubcommand((subcommand) =>
						subcommand
							.setName(t({ key: 'region-role-name', ns }))
							.setDescription(t({ key: 'region-role-description', ns }))
							.setNameLocalizations(localization('region-role-name', ns))
							.setDescriptionLocalizations(localization('region-role-description', ns))
							.addUserOption((option) =>
								option
									.setName(t({ key: 'region-role-user-name', ns }))
									.setDescription(t({ key: 'region-role-user-description', ns }))
									.setNameLocalizations(localization('region-role-user-name', ns))
									.setDescriptionLocalizations(localization('region-role-user-description', ns))
									.setRequired(true)
							)
					)
			)
			.addSubcommandGroup((subcommandGroup) =>
				subcommandGroup
					.setName(t({ key: 'vc-name', ns }))
					.setDescription(t({ key: 'vc-description', ns }))
					.setNameLocalizations(localization('vc-name', ns))
					.setDescriptionLocalizations(localization('vc-description', ns))
					.addSubcommand((subcommand) =>
						subcommand
							.setName(t({ key: 'vc-rename-name', ns }))
							.setDescription(t({ key: 'vc-rename-description', ns }))
							.setNameLocalizations(localization('vc-rename-name', ns))
							.setDescriptionLocalizations(localization('vc-rename-description', ns))
							.addChannelOption((options) =>
								options
									.setName(t({ key: 'vc-rename-channel-name', ns }))
									.setDescription(t({ key: 'vc-rename-channel-description', ns }))
									.setNameLocalizations(localization('vc-rename-channel-name', ns))
									.setDescriptionLocalizations(localization('vc-rename-channel-description', ns))
									.setRequired(true)
									.addChannelTypes(ChannelType.GuildVoice)
							)
							.addStringOption((option) =>
								option
									.setName(t({ key: 'vc-rename-name-name', ns }))
									.setDescription(t({ key: 'vc-rename-name-description', ns }))
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
