import {
	GuildMember, PermissionFlagsBits,role 
} from 'discord.js';
import { localization, t } from '../../../i18n';
import { sme } from 'locles'
import { ChatInputCommand } from '../../../Client';
import { execute } from '../execution/sme-role-execution';

const ns = 'sme-role';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'sme', ns }))
			.setDescription(t({ key: 'sme-description', ns }))
			.setNameLocalizations(localization('sme', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDefaultMemberPermissions(GuildMember)
			.addUserOption((option) =>
				option
					.setName(t({ key: 'sme-options', ns }))
					.setDescription(t({ key: 'sme-Odescription', ns }))
					.setNameLocalizations(localization('sme-role', ns))
					.setDescriptionLocalizations(localization('sme-Odescription', ns))
					.setRequired(true)
			)
	)
	.setGlobal(true)
    .setExecute(execute);