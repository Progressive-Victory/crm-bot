import { GuildMember, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { Interaction } from "../../../Classes/Interaction.js";
import { warnLogUpdateEmbed } from "../../../features/moderation/embeds.js";
import { WarnModalPrefixes } from "../../../features/moderation/types.js";
import { Warn, setDate } from "../../../models/Warn.js";

export const warnUpdatedById = new Interaction<ModalSubmitInteraction>({
	customIdPrefix: WarnModalPrefixes.updateById,

	run: async (interaction: ModalSubmitInteraction) => {

		 
		const {customId, client, guild} = interaction
		const  [warnId] = customId.split(client.splitCustomIdOn!)[1]
		const record = await Warn.findById(warnId)
		if (!record) return
		
		const numberRegex:RegExp = /^\d{1,3}$/is
		const target = guild?.members.cache.get(record.target.discordId) ?? await guild?.members.fetch(record.target.discordId);
		const mod = guild?.members.cache.get(record.moderator.discordId) ?? await guild?.members.fetch(record.moderator.discordId);

		if( !target || !mod) return
		let updater = interaction.member
		if (!(updater instanceof GuildMember)) {
			updater = guild?.members.cache.get(interaction.user.id) ?? await guild?.members.fetch(interaction.user.id) ?? null
			if (updater === null) return
		}

		const reason = interaction.fields.getTextInputValue('reason')

		record.reason = reason

		const modalDuration = interaction.fields.getTextInputValue('duration');
		let duration: number | undefined
		if(numberRegex.test(modalDuration)) {
			duration = Number(modalDuration)
			record.expireAt = setDate(duration)
		}
		record.updater = {
			discordId:interaction.user.id, 
			username:interaction.user.username
		}
		record.updatedAt = new Date()
		record.save()

		interaction.reply({
			flags: MessageFlags.Ephemeral,
			embeds:[warnLogUpdateEmbed(record, mod, target, updater)],
		})
	}
});




