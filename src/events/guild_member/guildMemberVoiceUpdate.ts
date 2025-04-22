import { ColorResolvable, Colors, EmbedBuilder, Events, GuildMember } from "discord.js";
import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";
import { getGuildChannel } from "../../util/index.js";

export const guildMemberVoiceUpdate = new Event({
	name: Events.VoiceStateUpdate,
	execute: async (oldState, newState) => {

		const {guild, member} = newState
		const settings = await GuildSetting.findOne({guildId: guild.id})
		// check that logging channel ID is set
		const loggingChannelId = settings?.logging.voiceUpdatesChannelId
		if(!loggingChannelId) return

		// check that logging channel exists in guild
		const loggingChannel = await getGuildChannel(guild, loggingChannelId)
		if(!loggingChannel?.isSendable()) return

		let embed:EmbedBuilder
		if (oldState.channel === null && newState.channel !== null) {
			embed = vcLogEmbed(member!, 'Joined Voice Channel',`${newState.client.user} joined ${newState.channel}.`,Colors.Green)
		} else if (oldState.channel !== null && newState.channel === null) {
			embed = vcLogEmbed(member!, 'Left Voice Channel',`${member} left ${oldState.channel}.`, Colors.Red)
		} else {
			embed = vcLogEmbed(member!, 'Switched Voice Channel', `${member} switched from ${oldState.channel} to ${newState.channel}.`, Colors.Blue)
		}

		loggingChannel.send({embeds:[embed]})
	}
})

/**
 *
 * @param newSate
 * @param member
 * @param title
 * @param description
 * @param color
 * @returns
 */
function vcLogEmbed(member:GuildMember, title:string, description:string, color:ColorResolvable ) {
	
	const icon = member?.user.displayAvatarURL({forceStatic:true})
	return new EmbedBuilder()
		.setAuthor({iconURL: icon, name: member?.displayName ?? 'error' })
		.setTitle(title)
		.setDescription(description)
		.setTimestamp()
		.setFooter({text:`ID: ${member.id}`})
		.setColor(color)

}
