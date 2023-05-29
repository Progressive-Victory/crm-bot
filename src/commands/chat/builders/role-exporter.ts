import { PermissionFlagsBits } from 'discord.js';
import { ChatInputCommand } from '../../../Client';
import { localization, t } from '../../../i18n';
import { execute } from '../execution/role-exporter';

export const ns = 'expoter';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDMPermission(false)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addRoleOption((option) =>
				option
					.setName(t({ key: 'role-option-name', ns }))
					.setDescription(t({ key: 'role-option-description', ns }))
					.setNameLocalizations(localization('role-option-name', ns))
					.setDescriptionLocalizations(localization('role-option-description', ns))
					.setRequired(true)
			)
	)
	.setGlobal(true)
	.setExecute(execute);

/*
 *command name: retrive memmbers (or something along those lines)
 *It to the best of my knowleage should be a function
 */
