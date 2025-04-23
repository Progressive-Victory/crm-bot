import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	MessageFlags,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { States } from '../../models/State.js';
import { AddSplitCustomId } from '../../util/index.js';
import { isStateAbbreviations } from '../../util/states/types.js';

/**
 * Executes the ping command to send a message to a channel.
 * @param interaction - The chat input command interaction object.
 * @returns interaction
 */
export default async function ping(interaction: ChatInputCommandInteraction) {
	let guild:Guild;
	let member:GuildMember
	const {client, options} = interaction

	// interaction.deferReply({flags:MessageFlags.Ephemeral})

	if(interaction.inCachedGuild()) {
		guild = interaction.guild
		member = interaction.member
	} else if(interaction.inRawGuild()){
		try {
			guild = await client.guilds.fetch(interaction.guildId)
			member = await guild.members.fetch(interaction.user)
		} catch (error) {
			console.log(error)
			interaction.reply({
				flags: MessageFlags.Ephemeral,
				content:'An Error has occurred, contact your administrator'
			})
			return
		}
	}else {
		throw Error('ping not in guild')
	}
	const stateAbbreviation = options.getString('state', true)

	if(!isStateAbbreviations(stateAbbreviation)) return
	
	const state = await States.findOne({guildId: interaction.guildId, abbreviation: stateAbbreviation}).catch(console.error)
	if(!state || !state.roleId || !state.channelId) return	
	
	// check to see if the person trying to use the command has the role being pinged
	if (!member.roles.cache.has(state.roleId) || interaction.channelId !== state.channelId) {
		interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: 'You are not allowed to run this command in this channel'
		})
		return
	}
	const message = new TextInputBuilder()
		.setCustomId('message')
		.setLabel('Message')
		.setPlaceholder(`Your message to ${state.name} member`)
		.setMaxLength(2000)
		.setRequired(true)
		.setStyle(TextInputStyle.Paragraph)

	const firstRow = new ActionRowBuilder<TextInputBuilder>()
		.setComponents(message)

	const modal = new ModalBuilder()
		.setCustomId(AddSplitCustomId('sp',stateAbbreviation))
		.setTitle('State Ping Message')
		.setComponents(firstRow)

	interaction.showModal(modal)
}
