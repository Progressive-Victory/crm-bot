import { Events, MessageCreateOptions, Role } from "discord.js";
import { console } from "inspector";
import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";

export const guildMemberAdd = new Event({
	name: Events.GuildMemberAdd,
	execute: async (member) => {
		member.client.emit(Events.Debug, `user ${member.id} "${member.user.username}"  joined at ${member.joinedTimestamp}`)
		const {guild} = member
		const settings = await GuildSetting.findOne({guildId: guild.id})
		let message: MessageCreateOptions = {}
		
		// check that Join channel ID is set
		const joinChannelId = settings?.welcome.channelId
		// console.log(joinChannelId)
		if(!joinChannelId) return

		// check that Join channel exists in guild
		const joinChannel = guild.channels.cache.get(joinChannelId) ?? await guild.channels.fetch(joinChannelId) ?? undefined
		if(!joinChannel?.isSendable()) return

		let welcomeRole: Role | undefined = undefined
		const welcomeRoleId = settings?.welcome.roleId
		
		if(welcomeRoleId) welcomeRole = guild.roles.cache.get(welcomeRoleId) ?? await guild.roles.fetch(welcomeRoleId) ?? undefined


		console.log(welcomeRole)

		if (!welcomeRole) {
			message = {
				content: `new member ${member} has joined the server`,
				components:[], // add button for tacking team engagement
				allowedMentions: {users: []}
			}
		}
		else {
			message = {
				content: `${welcomeRole.toString()}, new member ${member} has joined the server`,
				components:[], // add button for tacking team engagement
				allowedMentions: {users: [], roles:[welcomeRole.id]}
			}
		}

		joinChannel.send(message)

	}
})
