import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionContextType, MessageContextMenuCommandInteraction } from "discord.js";
import { ContextMenuCommand } from "../../Classes/index.js";

export const message = new ContextMenuCommand<MessageContextMenuCommandInteraction>({
	builder: new ContextMenuCommandBuilder()
		.setName('message')
		.setContexts(InteractionContextType.Guild)
		.setType(ApplicationCommandType.Message),
	execute: async (interaction) => {

		const {targetMessage} = interaction

		console.log(targetMessage.toJSON())

	}
})
