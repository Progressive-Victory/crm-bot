import { ChatInputCommandInteraction, Snowflake } from 'discord.js';

import Logger from '../../../../../structures/Logger';
import { memberState } from '../../../../../structures/helpers';
import { t } from '../../../../../i18n';
import { ns } from '../index';

const regionLeadRoleID: Snowflake = process.env.REGIONAL_ROLE_ID;

/**
 * Function for toggling role on and off
 * @param interaction command interaction
 * @returns interaction response
 */
export default async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
	const { locale } = interaction;
	await interaction.deferReply({ ephemeral: true });

	const target = interaction.options.getMember('user');
	const stateLead = interaction.member;

	// If the state lead and the target member do not have the same state role
	if (!memberState(stateLead).some((role) => memberState(target).has(role.id))) {
		return interaction.followUp({
			content: t({
				key: 'role-region-mismatch',
				locale,
				ns,
				args: { user: target.toString() }
			})
		});
	}

	const regionLeadRole = stateLead.guild.roles.cache.get(regionLeadRoleID);
	if (!regionLeadRole) {
		return interaction.followUp({
			content: t({
				key: 'norole',
				locale,
				ns
			})
		});
	}

	const hasRegionLeadRole = target.roles.cache.has(regionLeadRole.id);
	let content: string = null;
	const auditReason = t({
		key: 'role-success-remove',
		locale,
		ns,
		args: { tag: target.user.tag }
	});

	try {
		if (!hasRegionLeadRole) {
			await target.roles.add(regionLeadRoleID, auditReason);
			content = t({
				key: 'role-success-add',
				locale,
				ns,
				args: {
					role: regionLeadRole.toString(),
					user: target.toString()
				}
			});
		}
		else {
			await target.roles.remove(regionLeadRoleID, auditReason);
			content = t({
				key: 'role-success-remove',
				locale,
				ns,
				args: {
					role: regionLeadRole.toString(),
					user: target.toString()
				}
			});
		}
	}
	catch (e) {
		content = t({
			key: 'role-error',
			locale,
			ns,
			args: { role: regionLeadRole.toString() }
		});
		Logger.error(e);
	}

	return interaction.editReply({ content });
}
