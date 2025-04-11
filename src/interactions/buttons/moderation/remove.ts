import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, GuildMember, inlineCode } from "discord.js";
import { Interaction } from "../../../Classes/Interaction.js";
import { modViewWarningHistory } from "../../../features/moderation/buttons.js";
import { getAuthorOptions, userField, warnLogUpdateEmbed } from "../../../features/moderation/embeds.js";
import { WarnButtonsPrefixes, WarnEmbedColor } from "../../../features/moderation/types.js";
import { GuildSetting } from "../../../models/Setting.js";
import { Warn } from "../../../models/Warn.js";

export const removeWarnYes = new Interaction<ButtonInteraction>({
	customIdPrefix: WarnButtonsPrefixes.removeWarnYes,
	run: async (interaction:ButtonInteraction) => {
		const record = await getWarnRecord(interaction)
		if (!record) return;
		const {user, member, guild, guildId} = interaction
		const target = guild?.members.cache.get(record.target.discordId) ?? await guild?.members.fetch(record.target.discordId) ?? undefined
		if(!target) return

		const mod = guild?.members.cache.get(record.moderator.discordId) ?? await guild?.members.fetch(record.moderator.discordId) ?? undefined
		if(!mod) return

		let updater = member ?? undefined
		if (!(updater instanceof GuildMember)) {
			updater  = guild?.members.cache.get(user.id) ?? await guild?.members.fetch(user.id) ?? undefined
		}
		if(!updater) {
			throw Error('undefined member some how')
		}
		
		record.updater = {
			discordId: user.id,
			username: user.username
		}
		record.expireAt = new Date()

		record.save()

		const embed = warnLogUpdateEmbed(record, mod, target, updater)

		const settings = await GuildSetting.findOne({guildId})

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(modViewWarningHistory(target.id))

		interaction.update({
			content: '',
			embeds:[embed.setAuthor(null)],
			components: [row]
		})

		if (settings?.warn.logChannelId) {
			const log = guild?.channels.cache.get(settings.warn.logChannelId) ?? await guild?.channels.fetch(settings.warn.logChannelId)
			if (log?.isSendable()) {
				
				log.send({
					embeds: [embed.setAuthor(getAuthorOptions(updater))],
					components: [row]
				})
			}
		}
		
		
	}
})


export const removeWarnNo = new Interaction<ButtonInteraction>({
	customIdPrefix: WarnButtonsPrefixes.removeWarnNo,
	run: async (interaction:ButtonInteraction) => {
		interaction.update({
			content: `No change has been made to warn id: ${inlineCode(interaction.customId.split(interaction.client.splitCustomIdOn!)[1])}`,
			embeds:[],
			components:[]
		})
	}
})

export const deleteWarnYes = new Interaction<ButtonInteraction>({
	customIdPrefix: WarnButtonsPrefixes.deleteWarnYes,
	run: async (interaction:ButtonInteraction) => {

		const record = await getWarnRecord(interaction)
		if(!record) return;
		
		const target = interaction.guild?.members.cache.get(record.target.discordId) ?? await interaction.guild?.members.fetch(record.target.discordId) ?? undefined
		if (!target) return

		const embed = new EmbedBuilder()
			.setTitle('Warning Deleted')
			.setDescription(`Warn deleted for ${target ?? record.target.username}`)
			.setColor(WarnEmbedColor.Inactive)
			.setFields(
				{
					name: 'Reason for warn',
					value: record.reason
				},
				userField('Action By', interaction.user)
			)
			.setTimestamp()
		if (target) {
			embed.setThumbnail(target.displayAvatarURL({forceStatic:true}))
		}
		
		const settings = await GuildSetting.findOne({guildId: interaction.guildId})
		
		record?.deleteOne()

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(modViewWarningHistory(target.id))
		
		interaction.update({
			content: '',
			embeds:[embed.setAuthor(null)],
			components: [row]
		})
		
		if (settings?.warn.logChannelId) {
			const log = interaction.guild?.channels.cache.get(settings.warn.logChannelId) ?? await interaction.guild?.channels.fetch(settings.warn.logChannelId)
			if (log?.isSendable()) {
				let member = interaction.member ?? undefined
				if (!(member instanceof GuildMember)) {
					member  = interaction.guild?.members.cache.get(interaction.user.id) ?? await interaction.guild?.members.fetch(interaction.user.id) ?? undefined
				}
				if(!member) {
					throw Error('undefined member some how')
				}
				log.send({
					embeds: [embed.setAuthor(getAuthorOptions(member))],
					components: [row]
				})
			}
		}
		
		

	}
})

export const deleteWarnNo = new Interaction<ButtonInteraction>({
	customIdPrefix: WarnButtonsPrefixes.deleteWarnNo,
	run: async (interaction:ButtonInteraction) => {
		interaction.update({
			content: `No change has been made to warn id: ${inlineCode(interaction.customId.split(interaction.client.splitCustomIdOn!)[1])}`,
			embeds:[],
			components:[]
		})
	}
})

/**
 * 
 * @param interaction button interaction
 * @returns warn document or undefined
 */
async function getWarnRecord(interaction:ButtonInteraction) {
	
	const {customId, client} = interaction

	const warnId = customId.split(client.splitCustomIdOn!)[1]

	// check that warning exists
	const record = await Warn.findById(warnId)
	if (!record) {
		interaction.update({
			content: `Unable to locate warning check warn Id: ${inlineCode(warnId)}.\nPlease notify an admin `,
			embeds:[],
		})
		return;
	}

	return record

}

