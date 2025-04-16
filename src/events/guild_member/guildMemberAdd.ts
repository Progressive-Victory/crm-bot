import { Events } from "discord.js";
import Event from "../../Classes/Event.js";

export const guildMemberAdd = new Event({
	name: Events.GuildMemberAdd,
	execute: async (member) => {
		member.client.emit(Events.Debug, `user ${member.id} "${member.user.username}"  joined at ${member.joinedTimestamp}`);
	}
})
