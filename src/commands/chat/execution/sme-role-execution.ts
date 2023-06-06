import { ChatInputCommandInteraction } from 'discord.js';
import { t } from 'src/i18n';
import { ns } from '../builders/sme-role-builder';

const smeName = 'sme-role';

export async function smeRole(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });

	const member = interaction.options.getMember(t({ key: 'options-user', ns }));
	const role = interaction.options.getRole('smeName');

	if (member.roles.cache.some(() => role.name === smeName)) {
		member.roles.remove(
			smeName,
			t({
				key: 'auditlog-remove',
				ns,
				locale: interaction.guildLocale,
				args: { smeName: 'remove' }
			})
		);
	}
	else {
		member.roles.add(
			smeName,
			t({
				key: 'auditlog-add',
				ns,
				locale: interaction.guildLocale,
				args: { smeName: 'add' }
			})
		);
	}
}
