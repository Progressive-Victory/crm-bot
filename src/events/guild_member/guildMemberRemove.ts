import { bold, Colors, EmbedBuilder, Events, TimestampStyles } from "discord.js";
import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";
import { getGuildChannel } from "../../util/index.js";

export const guildMemberRemove = new Event({
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
		let description = `${bold(member.displayName)} ${member.user.username}`
		const embed = new EmbedBuilder()
			.setAuthor({iconURL:icon ?? undefined, name:'Member Left'})
			.setDescription(`${bold(member.displayName)} ${member.user.username}`)
			.addFields(
				{name:'Joined:', value: `${member.joinedAt?.toDiscordString(TimestampStyles.LongDateTime)}`, inline:true},
			)
			.setThumbnail(icon)
			.setFooter({text:`User ID: ${member.id}`})
			.setTimestamp()
			.setColor(Colors.Red)
		if (member.pending === true) {
			description = description + `\n*Didn't agree to rules`
		} 
		embed.setDescription(description)

		leaveChannel.send({embeds:[embed]})
	}
})
