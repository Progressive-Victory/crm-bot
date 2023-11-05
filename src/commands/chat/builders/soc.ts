import { soc, socAutocomplete } from '@execution/soc';
import { ChatInputCommand } from '@progressive-victory/client';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName('soc')
			.setDescription('SOC state command')
			.setDMPermission(false)
			// .setDefaultMemberPermissions()
			.addSubcommandGroup((subcommandGroup) =>
				subcommandGroup
					.setName('statelead')
					.setDescription('statelead commands')
					.addSubcommand((subcommand) =>
						subcommand
							.setName('add')
							.setDescription('add member as state lead')
							.addUserOption((option) => option.setName('member').setDescription('Member to be added').setRequired(true))
							.addStringOption((option) =>
								option.setName('state').setDescription('State to add the lead to').setMaxLength(2).setAutocomplete(true).setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName('remove')
							.setDescription('add member as state lead')
							.addUserOption((option) => option.setName('member').setDescription('State Lead be remove').setRequired(true))
							.addStringOption((option) =>
								option
									.setName('state')
									.setDescription('State to remove the lead from')
									.setMinLength(2)
									.setMaxLength(2)
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
			)
	)
	.setGlobal(true)
	.setExecute(soc)
	.setAutocomplete(socAutocomplete);
