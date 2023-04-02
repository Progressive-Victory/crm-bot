import {
	ChatInputCommandInteraction,
	GuildMember,
	InteractionResponse,
	Snowflake
} from 'discord.js';
import Languages from '../../../assets/languages';
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

	if (!memberState(stateLead).some((role) => memberState(target).has(role.id))) {
		return interaction.reply({
			ephemeral: true,
			content: Languages[interaction.language].Generics.StateRegionMismatch(target.user)
		});
	}

	const regionLeadRole = stateLead.guild.roles.cache.get(regionLeadRoleID);
	if (!regionLeadRole) {
		return interaction.reply({
			ephemeral: true,
			content: Languages[interaction.language].Generics.NoRole()
		});
	}

	const addRole = !target.roles.cache.has(regionLeadRoleID);
	let reply: string = null;
	const auditReason: string = Languages[interaction.guild.preferredLanguage].Commands.Lead.Region.Role.AuditLog(regionLeadRole, interaction.user, addRole);

	try {
		if (addRole) {
			await target.roles.add(regionLeadRoleID, auditReason);
		}
		else {
			await target.roles.remove(regionLeadRoleID, auditReason);
		}

		reply = Languages[interaction.language].Commands.Lead.Region.Role.Success(regionLeadRole, target.user, addRole);
	}
	catch (e) {
		reply = Languages[interaction.language].Commands.Lead.Region.Role.Error(regionLeadRole, target.user, addRole);
		Logger.error(e);
	}

	return interaction.reply({ ephemeral: true, content: reply });
}

export default new Command({
	execute,
	name: 'lead',
	group: 'region',
	perms: { client: ['ManageRoles'] }
});
