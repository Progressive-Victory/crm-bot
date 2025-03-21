import { ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import { ContextMenuCommand } from '../../Classes/index.js';

export const reportUser = new ContextMenuCommand<UserContextMenuCommandInteraction>({
	builder: new ContextMenuCommandBuilder()
		.setName('Report User')
		.setType(ApplicationCommandType.User),
})

export const reportMessage = new ContextMenuCommand<MessageContextMenuCommandInteraction>({
	builder: new ContextMenuCommandBuilder()
		.setName('Report Message')
		.setType(ApplicationCommandType.Message)
})


