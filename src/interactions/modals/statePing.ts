import { MessageCreateOptions, ModalSubmitInteraction } from "discord.js";
import { Interaction } from "../../Classes/Interaction.js";
import { legacyStateMessageCreate, stateMessageCreate, statePingReply } from "../../features/state/ping.js";
import { States } from "../../models/State.js";
import { isStateAbbreviations } from "../../util/states/types.js";

export const statePing = new Interaction<ModalSubmitInteraction>({
	customIdPrefix: 'sp',
	run: async (interaction) => {
		// let guild:Guild;
		const {customId, client} = interaction

		const args = customId.split(client.splitCustomIdOn!)
		
		const stateAbbreviation = args[1]
		const legacyOption = Boolean(args[2])
		if(!isStateAbbreviations(stateAbbreviation)) return
    
		const state = await States.findOne({guildId: interaction.guildId, abbreviation: stateAbbreviation}).catch(console.error)
		if(!state || !state.roleId || !state.channelId) return	

		const content = interaction.fields.getTextInputValue('message')
		const title = interaction.fields.getTextInputValue('title')
		
		if(!interaction.channel || !interaction.channel.isSendable() || !interaction.inGuild()) return
		
		let stateMessageCreateOptions: MessageCreateOptions
		
		if(legacyOption) stateMessageCreateOptions = legacyStateMessageCreate(state.roleId, interaction.user.id, content, title)
		else stateMessageCreateOptions = stateMessageCreate(state.roleId, interaction.user.id, content, title)
		
		const pingMessage = await interaction.channel.send(stateMessageCreateOptions)
		

		statePingReply(interaction, pingMessage)
	}}
)
