import { ChatInputCommandInteraction, GuildMember, Snowflake } from 'discord.js';
import { State } from '../declarations/states';
import Command from '../structures/Command';

const stateLeadRoleID:Snowflake = '1017107350437498972';
const regionLeadRoleID:Snowflake = '1039114169552748555';
function memberState(member:GuildMember) {
	return member.roles.cache.filter((role) => Object.values(State).includes(role.name as State));
}
async function execute(interaction:ChatInputCommandInteraction) {
	const target = interaction.options.getMember('user') as GuildMember;
	const stateLead = interaction.member as GuildMember;

	if (!memberState(stateLead).equals(memberState(target)) && stateLead.roles.cache.has(stateLeadRoleID)) {
		interaction.reply({ ephemeral: true, content: `You are not in the same state as ${target}` });
		return;
	}

	let content = 'Error';
	switch (interaction.options.getSubcommand(true)) {
	case 'add':
		target.roles.add(regionLeadRoleID, `Regional Leads role added by ${stateLead}`);
		content = `Regional Lead role added to ${target}`;
		break;

	case 'remove':
		target.roles.remove(regionLeadRoleID, `Regional Leads role removed by ${stateLead}`);
		content = `Regional Lead role removed to ${target}`;
		break;

	default:
		break;
	}

	interaction.reply({ ephemeral: true, content: content });
}

export default new Command({
	execute
});
