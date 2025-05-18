import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ContainerBuilder, EmbedBuilder, Events, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";

import Event from "../../Classes/Event.js";
import { GuildSetting } from "../../models/Setting.js";
import { footer } from "../../util/componats.js";
import { getGuildChannel } from "../../util/index.js";

export const guildMemberUpdate = new Event({
	name: Events.GuildMemberUpdate,
	execute: async (oldMember, newMember) => {
		if (oldMember.pending && oldMember.pending !== newMember.pending) {
			const { guild } = newMember
			const settings = await GuildSetting.findOne({ guildId: guild.id })
			// check that Join channel ID is set
			const joinChannelId = settings?.welcome.channelId
			if (!joinChannelId) return

			// check that Join channel exists in guild
			const joinChannel = await getGuildChannel(guild, joinChannelId)
			if(!joinChannel?.isSendable()) return
			
			const joinedAt = newMember.joinedAt ? newMember.joinedAt : new Date()

			const text = [
				heading('Member Joined'),
				`${newMember.toString()} ${newMember.user.username}`,
				`Joined: ${time(joinedAt,TimestampStyles.RelativeTime)}`,
			]
			if(newMember.flags.has(GuildMemberFlags.DidRejoin))
				text.push('Member rejoined the server')

			const display = new TextDisplayBuilder().setContent(text.join('\n'))

			const avatarURL = newMember.displayAvatarURL({forceStatic:true})
			const thumbnail = new ThumbnailBuilder().setURL(avatarURL)
				.setDescription(`Display Avatar for ${newMember.user.username}`)

			const section = new SectionBuilder().addTextDisplayComponents(display)
				.setThumbnailAccessory(thumbnail)
			
			const welcomeButton = new ButtonBuilder()
				.setCustomId('welcomed')
				// .setEmoji('👋')
				.setLabel('Confirm Welcome')
				.setStyle(ButtonStyle.Secondary)
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(welcomeButton)
      
      const container = new ContainerBuilder()
				.addSectionComponents(section)
				.addSeparatorComponents(
					new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
				.addTextDisplayComponents(footer(newMember.id))
				.addActionRowComponents(row.setId(1))
				.setAccentColor(Colors.Blue)

			joinChannel.send({flags: MessageFlags.IsComponentsV2, components:[container]})
      
		if (oldMember.nickname !== newMember.nickname) {
			const { guild } = newMember
			const settings = await GuildSetting.findOne({ guildId: guild.id })

			const nicknameUpdatesChannelId = settings?.logging.nicknameUpdatesChannelId
			if (!nicknameUpdatesChannelId) return
			let nicknameLogChannel
			try {
				nicknameLogChannel = await getGuildChannel(guild, nicknameUpdatesChannelId)
			} catch (error) {
				return
			}
			if (nicknameLogChannel?.isSendable()) {
				const title = `Nickname Changed`
				const description = `${newMember} ${newMember.user.username} changed their nickname from ${oldMember.nickname!==null?oldMember.nickname:newMember.user.globalName} to ${newMember.nickname}`
				const icon = newMember.displayAvatarURL({ forceStatic: true })
				const embed = new EmbedBuilder()
					.setAuthor({iconURL: icon, name: title})
					.setDescription(description)
					.setTimestamp()
					.setFooter({text:`User ID: ${newMember.user.id}`})
					.setColor(2804223)
				nicknameLogChannel.send({embeds:[embed]})
			}
		}
	}
})
