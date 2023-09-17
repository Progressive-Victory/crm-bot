import { ChatInputCommand } from '@Client';
import { autoComplete, lead } from '@execution/lead';
import { localization, t } from '@i18n';
import { ChannelType, PermissionFlagsBits } from 'discord.js';

export const ns = 'lead';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageEvents)
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
			.addSubcommandGroup((subcommandGroup) =>
				subcommandGroup
					.setName(t({ key: 'event-name', ns }))
					.setDescription(t({ key: 'event-description', ns }))
					.setNameLocalizations(localization('event-name', ns))
					.setDescriptionLocalizations(localization('event-description', ns))
					.addSubcommand((subcommand) =>
						subcommand
							.setName(t({ key: 'event-create-name', ns }))
							.setDescription(t({ key: 'event-create-description', ns }))
							.setNameLocalizations(localization('event-create-name', ns))
							.setDescriptionLocalizations(localization('event-create-description', ns))
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName(t({ key: 'event-update', ns }))
							.setDescription(t({ key: 'event-update-description', ns }))
							.setNameLocalizations(localization('event-update', ns))
							.setDescriptionLocalizations(localization('event-update-description', ns))
							.addChannelOption((option) =>
								option
									.setName(t({ key: 'event-option-channel', ns }))
									.setDescription(t({ key: 'event-option-channel-description', ns }))
									.setNameLocalizations(localization('event-option-channel', ns))
									.setDescriptionLocalizations(localization('event-option-channel-description', ns))
									.addChannelTypes(ChannelType.GuildText)
									.setRequired(true)
							)
					)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName(t({ key: 'member-list-name', ns }))
					.setDescription(t({ key: 'member-list-description', ns }))
					.setNameLocalizations(localization('member-list-name', ns))
					.setDescriptionLocalizations(localization('member-list-description', ns))
					.addRoleOption((option) =>
						option
							.setName(t({ key: 'member-list-role-option-name', ns }))
							.setDescription(t({ key: 'member-list-role-option-description', ns }))
							.setNameLocalizations(localization('member-list-role-option-name', ns))
							.setDescriptionLocalizations(localization('member-list-role-option-description', ns))
							.setRequired(true)
					)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName(t({ key: 'ping-name', ns }))
					.setDescription(t({ key: 'ping-description', ns }))
					.setNameLocalizations(localization('ping-name', ns))
					.setDescriptionLocalizations(localization('ping-description', ns))
					.addRoleOption((option) =>
						option
							.setName(t({ key: 'role', ns }))
							.setDescription(t({ key: 'ping-role-description', ns }))
							.setNameLocalizations(localization('role', ns))
							.setDescriptionLocalizations(localization('ping-role-description', ns))
							.setRequired(true)
					)
					.addChannelOption((option) =>
						option
							.setName(t({ key: 'channel', ns }))
							.setDescription(t({ key: 'ping-channel-description', ns }))
							.setNameLocalizations(localization('channel', ns))
							.setDescriptionLocalizations(localization('ping-channel-description', ns))
							.addChannelTypes(ChannelType.GuildText)
							.setRequired(false)
					)
					.addStringOption((option) =>
						option
							.setName(t({ key: 'message', ns }))
							.setDescription(t({ key: 'ping-message-description', ns }))
							.setNameLocalizations(localization('message', ns))
							.setDescriptionLocalizations(localization('ping-message-description', ns))
							.setRequired(false)
					)
			)
	)
	.setGlobal(true)
	.setAutocomplete(autoComplete)
	.setExecute(lead);
