import { Events } from "discord.js";
import Event from "../../Classes/Event.js";

export const GuildMemberRemove = new Event({
	name: Events.GuildMemberRemove,
	execute: (member) => {
		
	}
})
