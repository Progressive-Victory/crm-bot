import {
	ChatInputCommandInteraction, GuildMember, InteractionResponse, Snowflake
} from 'discord.js';
import { State } from '../declarations/states';
import { Command } from '../structures/Command';

const regionLeadRoleID:Snowflake = process.env.STATE_LEAD_ROLE_ID;

function memberState(member:GuildMember) {
	return member.roles.cache.filter((role) => Object.values(State).includes(role.name as State));
}
function execute(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
	const target = interaction.options.getMember('user') as GuildMember;
	const stateLead = interaction.member as GuildMember;

	if (!memberState(stateLead).equals(memberState(target))) {
		return interaction.reply({ ephemeral: true, content: `You are not in the same state as ${target}` });
	}

	let reply = 'Error';
	switch (interaction.options.getSubcommand(true)) {
	case 'add':
		target.roles.add(regionLeadRoleID, `Regional Leads role added by ${stateLead}`);
		reply = `Regional Lead role added to ${target}`;
		break;

	case 'remove':
		target.roles.remove(regionLeadRoleID, `Regional Leads role removed by ${stateLead}`);
		reply = `Regional Lead role removed to ${target}`;
		break;

	default:
		break;
	}
	return interaction.reply({ ephemeral: true, content: reply });
}
export default new Command({
	execute
});
