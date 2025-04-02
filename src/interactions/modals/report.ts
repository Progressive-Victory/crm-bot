import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, inlineCode, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { Interaction } from "../../Classes/Interaction.js";
import { getAuthorOptions } from "../../features/moderation/embeds.js";
import { reportModalPrefix } from "../../features/report.js";
import { GuildSetting } from "../../models/Setting.js";

export const userReport = new Interaction<ModalSubmitInteraction>({
	customIdPrefix: reportModalPrefix.userReport,

	run: async (interaction) => {
		
		if(!interaction.inGuild()) return
		
		const {guild, guildId, customId, client, member} = interaction

		const targetId = customId.split(client.splitCustomIdOn!)[1]
		const target = guild?.members.cache.get(targetId) ?? await guild?.members.fetch(targetId) ?? undefined
		if(!target) return

		const reporter = member instanceof GuildMember ? member : guild?.members.cache.get(member.user.id) ?? await guild?.members.fetch(member.user.id) ?? undefined
		if(!reporter) return
		
		const setting = await GuildSetting.findOne({guildId})

		const comment = interaction.fields.getTextInputValue('comment')

		if (setting?.report.logChannelId) {
			const logChannel = guild?.channels.cache.get(setting.report.logChannelId) ?? await guild?.channels.fetch(setting.report.logChannelId) ?? undefined
			if(!logChannel?.isSendable()) return
			logChannel.send({
				embeds:[
					new EmbedBuilder()
						.setTitle('User Report')
						.setDescription(`${target} was reported by ${interaction.member}`)
						.setFields({
							name:'Comment',
							value: comment.length === 0 ? 'No comment provided' : comment
						})
						.setAuthor(getAuthorOptions(reporter))
						.setColor('#9ad360')
				]
			})
		}

		interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: 'Your report has been received and will be reviewed. Thank you'
		})
	}
})

export const messageReport = new Interaction<ModalSubmitInteraction>({
	customIdPrefix: reportModalPrefix.messageReport,

	run: async (interaction) => {
		
		if(!interaction.inGuild()) return
		
		const {guild, guildId, customId, client, member} = interaction

		const channelId = customId.split(client.splitCustomIdOn!)[1]
		const channel = guild?.channels.cache.get(channelId) ?? await guild?.channels.fetch(channelId) ?? undefined
		if(!channel?.isSendable()) return

		const messageId = customId.split(client.splitCustomIdOn!)[2]
		const message = channel.messages.cache.get(messageId) ?? await channel.messages.fetch(messageId) ?? undefined
		if(!message) return

		const author = message.member ?? guild?.members.cache.get(message.author.id) ?? await guild?.members.fetch(message.author.id) ?? undefined

		if(!author) return

		const reporter = member instanceof GuildMember ? member : guild?.members.cache.get(member.user.id) ?? await guild?.members.fetch(member.user.id) ?? undefined
		if(!reporter) return
		
		const setting = await GuildSetting.findOne({guildId})

		const comment = interaction.fields.getTextInputValue('comment')

		if (setting?.report.logChannelId) {
			const logChannel = guild?.channels.cache.get(setting.report.logChannelId) ?? await guild?.channels.fetch(setting.report.logChannelId) ?? undefined
			if(!logChannel?.isSendable()) return
			const embed = new EmbedBuilder()
			.setTitle('Message Report')
			.setDescription(`${author}'s message was reported by ${interaction.member}`)
			.setAuthor(getAuthorOptions(reporter))
			.setColor('#f5f5dc')

			if(message.content.length > 0) {
				embed.addFields({
					name: 'Content',
					value: message.content
				})
			}
			if(message.attachments.size > 0) {
				embed.addFields({
					name: 'attachments',
					value: `Message has ${inlineCode(message.attachments.size.toString())} attachments`
				})
			}



			embed.addFields({
				name:'Comment',
				value: comment.length === 0 ? 'No comment provided' : comment
			})
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setURL(message.url)
					.setLabel('Jump to Message')
			)
			logChannel.send({
				embeds:[embed],
				components: [row]
			})
		}

		interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: 'Your report has been received and will be reviewed. Thank you'
		})

	}
})
