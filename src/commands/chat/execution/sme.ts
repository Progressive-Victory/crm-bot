import { ns } from '@builders/sme';
import { t } from '@i18n';
import { Logger } from 'discord-client';
import { ChatInputCommandInteraction } from 'discord.js';
import { SMERoleIDs } from 'src/structures';

export async function smeRole(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });

	const { locale } = interaction;
	const member = interaction.options.getMember(t({ key: 'options-user', ns }));
	const role = interaction.options.getRole(t({ key: 'options-role', ns }));
	let key: string;

	try {
		if (!SMERoleIDs.includes(role.id)) {
			key = 'not-sme-role';
		}
		else if (member.roles.cache.has(role.id)) {
			member.roles.remove(
				role,
				t({
					key: 'auditlog-remove',
					ns,
					locale: interaction.guildLocale,
					args: { role: role.name, member: interaction.member.displayName }
				})
			);
			key = 'sucess-remove';
		}
		else {
			member.roles.add(
				role,
				t({
					key: 'auditlog-add',
					ns,
					locale: interaction.guildLocale,
					args: { role: role.name, member: interaction.member.displayName }
				})
			);
			key = 'sucess-add';
		}
		interaction.followUp(
			t({
				key,
				ns,
				locale,
				args: { role: role.toString(), target: member.toString() }
			})
		);
	}
	catch (error) {
		Logger.error(error);
	}
}
