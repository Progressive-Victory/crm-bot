import { Events } from "discord.js";
import Event from "../../Classes/Event.js";
import { joinLog } from "../../features/welcome/joinLog.js";
import { GuildSetting } from "../../models/Setting.js";
import { getGuildChannel } from "../../util/index.js";

export const guildMemberUpdate = new Event({
	name: Events.GuildMemberUpdate,
	execute: async (oldMember, newMember) => {
		if(oldMember.pending && oldMember.pending !== newMember.pending) {
			const {guild} = newMember
			const settings = await GuildSetting.findOne({guildId: guild.id})
			
			// check that Join channel ID is set
			const joinChannelId = settings?.welcome.channelId
			if(!joinChannelId) return
	
			// check that Join channel exists in guild
			const joinChannel = await getGuildChannel(guild, joinChannelId)
			if(!joinChannel?.isSendable()) return

			joinLog(newMember, joinChannel)
		}
	}
})

