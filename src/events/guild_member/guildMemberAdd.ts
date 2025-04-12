import { Events } from "discord.js";
import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";

export const guildMemberAdd = new Event({
	name: Events.GuildMemberAdd,
	execute: async (member) => {
		const {guild} = member
		const settings = await GuildSetting.findOne({guildId: guild.id})
		
		// check that Join channel ID is set
		const joinChannelId = settings?.welcome.channelId
		if(!joinChannelId) return

		// check that Join channel exists in guild
		const joinChannel = guild.channels.cache.get(joinChannelId) ?? await guild.channels.fetch(joinChannelId) ?? undefined
		if(!joinChannel?.isSendable()) return

		joinChannel.send({
			content: `${member} has joined the server`,
			allowedMentions: {users: []}
		})

	}
})
