import {
	AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, InteractionResponse, Snowflake, VoiceChannel
} from 'discord.js';
import { State } from '../../declarations/states';
import { Command } from '../../structures/Command';

async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<InteractionResponse<boolean>> {
	let reply:string;
	const allowedChannels:Snowflake[] = ['928709708188102686', '1019969298577506415', '928709708188102687'];
	const channel = interaction.options.getChannel('channel', true) as VoiceChannel;
	const name = interaction.options.getString('name', true);
	if (!allowedChannels.includes(channel.id)) {
		reply = `You are not allow to rename ${channel}`;
	}
	else {
		channel.setName(name, 'State Lead has renamed this channel');
		reply = `${channel} has been successful renamed`;
	}

	return interaction.reply({ ephemeral: true, content: reply });
}
async function autocomplete(interaction: AutocompleteInteraction) {
	const member = interaction.member as GuildMember;
	const stateRole = member.roles.valueOf().filter((role) => Object.values(State).includes(role.name as State)).first();
	const focusedOption = interaction.options.getFocused(true);
	const choices = [`${stateRole.name} Meeting`];

	const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
	return interaction.respond(
		filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 14)
	);
}
export default new Command({
	execute,
	autocomplete,
	name: 'state-lead'
});
