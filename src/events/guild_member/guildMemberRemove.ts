import { Colors, EmbedBuilder, Events, TimestampStyles } from "discord.js";
import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";

export const GuildMemberRemove = new Event({
	name: Events.GuildMemberRemove,
	execute: async (member) => {
		const {guild} = member
		const settings = await GuildSetting.findOne({guildId: guild.id})

		// check that leave channel ID is set
		const leaveChannelId = settings?.logging.leaveChannelId
		if(!leaveChannelId) return

		// check that Join channel exists in guild
		const leaveChannel = guild.channels.cache.get(leaveChannelId) ?? await guild.channels.fetch(leaveChannelId) ?? undefined
		if(!leaveChannel?.isSendable()) return

		leaveChannel.send({
			embeds:[new EmbedBuilder()
				.setTitle('Member Left')
				.setDescription(member.toString())
				.setFields(
					{name:'Joined At', value:`${member.joinedAt?.toDiscordString(TimestampStyles.LongDateTime)}`}
				)
				.setThumbnail(member.user.avatarURL({forceStatic:true}))
				.setTimestamp()
				.setColor(Colors.Red)
			]
		})

	}
})
