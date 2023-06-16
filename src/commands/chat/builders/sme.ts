import { ChatInputCommand } from '@Client';
import { smeRole } from '@execution/sme';
import { localization, t } from '@i18n';

export const ns = 'sme';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			// .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
			.addUserOption((option) =>
				option
					.setName(t({ key: 'options-user', ns }))
					.setDescription(t({ key: 'options-user-description', ns }))
					.setNameLocalizations(localization('options-user', ns))
					.setDescriptionLocalizations(localization('options-user-description', ns))
					.setRequired(true)
			)
			.addRoleOption((option) =>
				option
					.setName(t({ key: 'options-role', ns }))
					.setDescription(t({ key: 'options-role-description', ns }))
					.setNameLocalizations(localization('options-role', ns))
					.setDescriptionLocalizations(localization('options-role-description', ns))
					.setRequired(true)
			)
	)
	.setGlobal(true)
	.setExecute(smeRole);
