import { Guild, MessageFlags, ModalSubmitInteraction, quote, roleMention } from "discord.js";
import { Interaction } from "../../Classes/Interaction.js";
import { States } from "../../models/State.js";
import { isStateAbbreviations } from "../../util/states/types.js";

export const statePing = new Interaction<ModalSubmitInteraction>({
	customIdPrefix: 'sp',
	run: async (interaction) => {
		let guild:Guild;
		const {customId, client} = interaction

		const stateAbbreviation = customId.split(client.splitCustomIdOn!)[1]
		if(!isStateAbbreviations(stateAbbreviation)) return
		const state = await States.findOne({guildId: interaction.guildId, abbreviation: stateAbbreviation}).catch(console.error)
		if(!state || !state.roleId || !state.channelId) return	

		const content = interaction.fields.getTextInputValue('message')
		
		if(!interaction.channel || !interaction.channel.isSendable()) return

		/* const message = await */ interaction.channel.send({
			content: `${roleMention(state.roleId)}\n${quote(content)}\nSent by ${interaction.user}`
		})

		// const button = new ButtonBuilder()
		// 	.setStyle(ButtonStyle.Link)
		// 	.setURL(message.url)
		// 	.setLabel('Jump to Message')
		// const row = new ActionRowBuilder<ButtonBuilder>().setComponents(button)

		interaction.reply({
			flags:MessageFlags.Ephemeral,
			content:'Your message has been sent',
			// components:[row]
		})
	}}
)
