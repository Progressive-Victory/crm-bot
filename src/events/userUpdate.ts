import { Events } from "discord.js";
import Event from "../Classes/Event.js";

export const userUpdate = new Event({
	name: Events.UserUpdate,
	execute: (oldUser, newUser) => {
		if(oldUser.displayName !== newUser.displayName){
			// send diplayname
		}
	}
})
