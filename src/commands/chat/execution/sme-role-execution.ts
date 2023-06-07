import { ns } from '@builders/sme-role-builder';
import { t } from '@i18n';
import { ChatInputCommandInteraction } from 'discord.js';

const smeName = 'sme-role';
const smeRoleIds = process.env.SME_ROLE_IDS.split(',');

export async function smeRole(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });

	const { locale } = interaction;
	const member = interaction.options.getMember(t({ key: 'options-user', ns }));
	const role = interaction.options.getRole(t({ key: 'options-role', ns }));

	if (!smeRoleIds.includes(role.id)) {
		interaction.followUp({
			content: t({
				key: 'not-sme-role',
				ns,
				locale,
				args: { role: role.toString() }
			})
		});
	}
	else if (member.roles.cache.has(role.id)) {
		member.roles.remove(
			smeName,
			t({
				key: 'auditlog-remove',
				ns,
				locale: interaction.guildLocale,
				args: { smeRole: role.name, member: interaction.member.displayName }
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
				args: { smeRole: role.name, member: interaction.member.displayName }
			})
		);
	}
}
