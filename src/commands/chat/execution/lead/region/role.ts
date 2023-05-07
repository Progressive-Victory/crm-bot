import { ChatInputCommandInteraction, Snowflake } from 'discord.js';
import i18n from 'i18next';

import { ChatInputCommand } from '../../../structures/Command';
import Logger from '../../../structures/Logger';
import { memberState } from '../../../structures/helpers';

const regionLeadRoleID: Snowflake = process.env.REGIONAL_ROLE_ID;

/**
 * Function for toggling regoinlead role on and off
 * @param interaction command interaction
 * @returns interaction response
 */
async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });

	const target = interaction.options.getMember('user');
	const stateLead = interaction.member;

	// If the state lead and the target member do not have the same state role
	if (!memberState(stateLead).some((role) => memberState(target).has(role.id))) {
		return interaction.editReply({
			content: i18n.t('role-region-mismatch', {
				lng: interaction.locale,
				ns: interaction.commandName,
				user: target.toString()
			})
		});
	}

	const regionLeadRole = stateLead.guild.roles.cache.get(regionLeadRoleID);
	if (!regionLeadRole) {
		return interaction.editReply({
			content: i18n.t('norole', {
				lng: interaction.locale,
				ns: interaction.commandName
			})
		});
	}

	const hasRegionLeadRole = target.roles.cache.has(regionLeadRole.id);
	let content: string = null;
	const auditReason = i18n.t('role-success-remove', {
		lng: interaction.locale,
		ns: interaction.commandName,
		tag: target.user.tag
	});

	try {
		if (!hasRegionLeadRole) {
			await target.roles.add(regionLeadRoleID, auditReason);
			content = i18n.t('role-success-add', {
				lng: interaction.locale,
				ns: interaction.commandName,
				role: regionLeadRole.toString(),
				user: target.toString()
			});
		}
		else {
			await target.roles.remove(regionLeadRoleID, auditReason);
			content = i18n.t('role-success-remove', {
				lng: interaction.locale,
				ns: interaction.commandName,
				role: regionLeadRole.toString(),
				user: target.toString()
			});
		}
	}
	catch (e) {
		content = i18n.t('role-error', {
			lng: interaction.locale,
			ns: interaction.commandName,
			role: regionLeadRole.toString()
		});
		Logger.error(e);
	}

	return interaction.editReply({ content });
}

export default new ChatInputCommand({
	execute,
	name: 'lead',
	group: 'region',
	perms: { client: ['ManageRoles'] }
});
