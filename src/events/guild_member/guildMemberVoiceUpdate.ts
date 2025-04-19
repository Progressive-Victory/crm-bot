import { Colors, EmbedBuilder, Events } from "discord.js";
import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";
import { getGuildChannel } from "../../util/index.js";

export const guildMemberVoiceUpdate = new Event({
	name: Events.VoiceStateUpdate,
	execute: async (oldState, newState) => {
		if (oldState.channel === null && newState.channel !== null) {
			const settings = await GuildSetting.findOne({guildId: newState.channel.guild.id})
			// check that logging channel ID is set
			const loggingChannelId = settings?.logging.voiceChannelUpdatesId
			if(!loggingChannelId) return

			// check that logging channel exists in guild
			const loggingChannel = await getGuildChannel(newState.channel.guild, loggingChannelId)
			if(!loggingChannel?.isSendable()) return

			const icon = newState.client.user.displayAvatarURL({forceStatic:true})
			const embed = new EmbedBuilder()
				.setAuthor({iconURL: icon, name: 'Joined Voice Channel'})
				.setDescription(`${newState.client.user} joined ${newState.channel}.`)
				.setColor(Colors.Green)
		} else if (oldState.channel !== null && newState.channel === null) {
			const settings = await GuildSetting.findOne({guildId: oldState.channel.guild.id})
			// check that logging channel ID is set
			const loggingChannelId = settings?.logging.voiceChannelUpdatesId
			if(!loggingChannelId) return

			// check that logging channel exists in guild
			const loggingChannel = await getGuildChannel(oldState.channel.guild, loggingChannelId)
			if(!loggingChannel?.isSendable()) return

			const icon = newState.client.user.displayAvatarURL({forceStatic:true})
			const embed = new EmbedBuilder()
				.setAuthor({iconURL: icon, name: 'Left Voice Channel'})
				.setDescription(`${oldState.client.user} left ${oldState.channel}.`)
				.setColor(Colors.Red)
		} else if (oldState.channel !== null && newState.channel !== null) {
			const settings = await GuildSetting.findOne({guildId: oldState.channel.guild.id})
			// check that logging channel ID is set
			const loggingChannelId = settings?.logging.voiceChannelUpdatesId
			if(!loggingChannelId) return

			// check that logging channel exists in guild
			const loggingChannel = await getGuildChannel(oldState.channel.guild, loggingChannelId)
			if(!loggingChannel?.isSendable()) return

			const icon = newState.client.user.displayAvatarURL({forceStatic:true})
			const embed = new EmbedBuilder()
				.setAuthor({iconURL: icon, name: 'Switched Voice Channel'})
				.setDescription(`${oldState.client.user} switched from ${oldState.channel} to ${newState.channel}.`)
				.setColor(Colors.Blue)
		}
	}
})
