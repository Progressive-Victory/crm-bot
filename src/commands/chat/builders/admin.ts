import { execute } from '@execution/admin';
import { autocomplete } from '@execution/admin/autocomplete';
import { ChatInputCommand } from '@progressive-victory/client';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName('admin')
			.setDescription('Admin command')
			.setDMPermission(false)
			// .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.addSubcommandGroup((subcommandGroup) =>
				subcommandGroup
					.setName('state')
					.setDescription('state admin commands')
					.addSubcommand((subCommand) =>
						subCommand
							.setName('set')
							.setDescription('Add a state the state database')
							.addStringOption((option) => option.setName('name').setDescription('the name of the state').setAutocomplete(true).setRequired(true))
							.addStringOption((option) =>
								option.setName('abbreviation').setDescription('the abbreviation of the state').setAutocomplete(true).setRequired(true)
							)
					)
			)
	)
	.setAutocomplete(autocomplete)
	.setExecute(execute)
	.setGlobal(true);
