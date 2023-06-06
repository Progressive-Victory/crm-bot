import { ChatInputCommand } from 'Client';
import { PermissionFlagsBits } from 'discord.js';
import { localization, t } from 'i18n';
import { smeRole } from '../execution/sme-role-execution';

export const ns = 'sme';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
			.addUserOption((option) =>
				option
					.setName(t({ key: 'options-users', ns }))
					.setDescription(t({ key: 'user-descriptions', ns }))
					.setNameLocalizations(localization('options-role', ns))
					.setDescriptionLocalizations(localization('options-role', ns))
					.setRequired(true)
			)
			.addRoleOption((option) =>
				option
					.setName(t({ key: 'options-role', ns }))
					.setDescription(t({ key: 'role-description', ns }))
					.setNameLocalizations(localization('options-role', ns))
					.setDescriptionLocalizations(localization('role-description', ns))
					.setRequired(true)
			)
	)
	.setGlobal(true)
	.setExecute(smeRole);
