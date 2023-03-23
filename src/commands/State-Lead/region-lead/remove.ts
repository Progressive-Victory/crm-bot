import {
	ChatInputCommandInteraction,
	GuildMember,
	InteractionResponse,
	Snowflake
} from 'discord.js';
import { isStateLead } from '../../../structures/helpers';
import { State } from '../../../declarations/states';
import { Command } from '../../../structures/Command';
import Logger from '../../../structures/Logger';

const regionLeadRoleID: Snowflake = process.env.REGIONAL_ROLE_ID;

function memberState(member:GuildMember) {
	return member.roles.cache.filter((role) => Object.values(State).includes(role.name as State));
}
async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<InteractionResponse<boolean>> {
	const target = interaction.options.getMember('user') as GuildMember;
	const stateLead = interaction.member as GuildMember;

	const str = isStateLead(interaction);
	if (str !== true) return interaction.reply({ content: str, ephemeral: true });

	if (!memberState(stateLead).equals(memberState(target))) {
		return interaction.reply({ ephemeral: true, content: `You are not in the same state as ${target}` });
	}

	let reply = 'Error';
	try {
		await target.roles.remove(regionLeadRoleID, `Regional Leads role removed by ${stateLead}`);
		reply = `Regional Lead role removed from ${target}`;
	}
	catch (e) {
		reply = `Error removing Regional Lead role from ${target}`;
		Logger.error(e);
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

export default new Command({
	execute,
	name: 'state-lead',
	group: 'region-lead'
});
