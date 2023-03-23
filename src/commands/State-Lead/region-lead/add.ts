import {
	ChatInputCommandInteraction, GuildMember, InteractionResponse, Snowflake
} from 'discord.js';
import { isStateLead } from '../../../structures/helpers';
import Logger from '../../../structures/Logger';
import { State } from '../../../declarations/states';
import { Command } from '../../../structures/Command';

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
		await target.roles.add(regionLeadRoleID, `Regional Leads role added by ${stateLead}`);
		reply = `Regional Lead role added to ${target}`;
	}
	catch (e) {
		reply = `Error adding Regional Lead role to ${target}`;
		Logger.error(e);
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

export default new Command({
	execute,
	name: 'state-lead',
	group: 'region-lead'
});
