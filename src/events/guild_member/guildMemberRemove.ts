import { bold, Colors, EmbedBuilder, Events, TimestampStyles } from "discord.js";
import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";
import { getGuildChannel } from "../../util/index.js";

export const GuildMemberRemove = new Event({
	name: Events.GuildMemberRemove,
	execute: async (member) => {
		const {guild} = member
		const settings = await GuildSetting.findOne({guildId: guild.id})

		// check that leave channel ID is set
		const leaveChannelId = settings?.logging.leaveChannelId
		if(!leaveChannelId) return

		// check that Join channel exists in guild
		const leaveChannel = await getGuildChannel(guild, leaveChannelId)
		if(!leaveChannel?.isSendable()) return
		const icon = member.user.avatarURL({forceStatic:true})
		leaveChannel.send({
			embeds:[new EmbedBuilder()
				.setAuthor({iconURL:icon ?? undefined, name:`${member.displayName} Left`})
				.setDescription(`${member.toString()} ${member.user.username}\n${bold('Joined At:')} ${member.joinedAt?.toDiscordString(TimestampStyles.LongDateTime)}\n${bold('Agreed to Rules:')} ${member.pending?.valueOf() ?? false}`)
				.setThumbnail(icon)
				.setFooter({text:`ID: ${member.id}`})
				.setTimestamp()
				.setColor(Colors.Red)
			]
		})

	}
})
