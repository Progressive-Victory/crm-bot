import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionContextType, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenuCommand } from "../../Classes/index.js";
import { isGuildMember } from "../../util/index.js";

export const userProfile = new ContextMenuCommand<UserContextMenuCommandInteraction>({
	builder: new ContextMenuCommandBuilder()
		.setName('View Profile')
		.setContexts(InteractionContextType.Guild)
		.setType(ApplicationCommandType.User),
	execute: async (Interaction) => {

		const {member, targetMember} = Interaction

		if(!(isGuildMember(member) && isGuildMember(targetMember))) return
		
		if(member.permissions.has("ManageGuild", true)){
					// mod window
				}
		if (member === targetMember) {
			/* self profile */
		}
	}
})
