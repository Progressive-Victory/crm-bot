import { logger } from '@progressive-victory/client';
import { stateDb } from '@util/database';
import { StateAbbreviation } from '@util/state';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';

export async function add(interaction: ChatInputCommandInteraction) {
	const { options, guild } = interaction;

	const state = await stateDb.getStateFromAbbreviation(options.getString('state').toLowerCase() as StateAbbreviation, guild);

	const member = options.getMember('member') as GuildMember;

	if (!state.leads.includes(member)) {
		await state.addLead(member);
	}
	logger.info(`${member.user.username} has be added as a lead to ${state.name} by ${interaction.user.username}`);
	await interaction.reply({ content: 'member added to as lead', ephemeral: true });
}
