import { GuildMember, ModalSubmitInteraction } from "discord.js";
import { Interaction } from "../../Classes/Interaction.js";
import { sendStatePing, statePingReply } from "../../features/state/ping.js";
import { States } from "../../models/State.js";
import { isStateAbbreviations } from "../../util/states/types.js";

export const statePing = new Interaction<ModalSubmitInteraction>({
	customIdPrefix: 'sp',
	run: async (interaction) => {
		// let guild:Guild;
		const {customId, client} = interaction
		
		const stateAbbreviation = customId.split(client.splitCustomIdOn!)[1]
		if(!isStateAbbreviations(stateAbbreviation)) return

		const state = await States.findOne({guildId: interaction.guildId, abbreviation: stateAbbreviation}).catch(console.error)
		if(!state || !state.roleId || !state.channelId) return	

		const content = interaction.fields.getTextInputValue('message')
		const title = interaction.fields.getTextInputValue('title')
		
		if(!interaction.channel || !interaction.channel.isSendable() || !interaction.inGuild()) return
		const member = interaction.member instanceof GuildMember ? interaction.member : interaction.member.user.id

		const pingMessage = await sendStatePing(interaction.channel, state.roleId,member, content, title)

		statePingReply(interaction, pingMessage)
	}}
)
