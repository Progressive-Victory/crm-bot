import {
	ChatInputCommandInteraction,
	GuildMember,
	InteractionResponse,
	Snowflake
} from 'discord.js';
import { State } from '../../../declarations/states';
import { Command } from '../../../structures/Command';
import Logger from '../../../structures/Logger';

const regionLeadRoleID: Snowflake = process.env.REGIONAL_ROLE_ID;

function memberState(member: GuildMember) {
	return member.roles.cache.filter((role) => Object.values(State).includes(role.name as State));
}

async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<InteractionResponse<boolean>> {
	const target = interaction.options.getMember('user');
	const stateLead = interaction.member;

	// Check if memberState of stateLead has any matching roles with memberState of target
	if (!memberState(stateLead).some((role) => memberState(target).has(role.id))) {
		return interaction.reply({ ephemeral: true, content: `You are not in the same state as ${target}!` });
	}

	const regionLeadRole = stateLead.guild.roles.cache.get(regionLeadRoleID);
	if (!regionLeadRole) {
		return interaction.reply({ ephemeral: true, content: 'Regional Lead role not found.' });
	}

	const addRole = !target.roles.cache.has(regionLeadRoleID);
	let reply = 'Error';

	try {
		if (addRole) {
			await target.roles.add(regionLeadRoleID, `${regionLeadRole.name} role added by ${stateLead.user.tag}`);
			reply = `${regionLeadRole} added to ${target}.`;
		}
		else {
			await target.roles.remove(regionLeadRoleID, `${regionLeadRole.name} role removed by ${stateLead.user.tag}`);
			reply = `${regionLeadRole} removed from ${target}.`;
		}
	}
	catch (e) {
		if (addRole) {
			reply = `Error adding ${regionLeadRole} to ${target}.`;
		}
		else {
			reply = `Error removing ${regionLeadRole} from ${target}.`;
		}

		Logger.error(e);
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

export default new Command({
	execute,
	name: 'lead',
	group: 'region'
});
