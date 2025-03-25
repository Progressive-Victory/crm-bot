import { ButtonInteraction, InteractionReplyOptions, MessageFlags } from 'discord.js';
import { Interaction } from '../../Classes/index.js';
import { dateDiffInDays } from '../../features/moderation/index.js';
import { warnSearch } from '../../features/moderation/WarnEmbed.js';
import { Warn } from '../../models/Warn.js';
import { WarningSearch } from '../../models/WarnSearch.js';
import { AddSplitCustomId } from '../../util/index.js';
import { warnModal } from '../modals/warn.js';

export const warnViewLeft = new Interaction<ButtonInteraction>({
	customIdPrefix:'wvl',
	run: async (interaction: ButtonInteraction) => {

		const {customId, client} = interaction

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_id, searchId] = customId.split(client.splitCustomIdOn!)

		interaction.update(await warnSearch(searchId, false))
	}
});

export const warnViewRight = new Interaction<ButtonInteraction>({
	customIdPrefix:'wvr',
	run: async (interaction: ButtonInteraction) => {

		const {customId, client} = interaction

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_id, searchId] = customId.split(client.splitCustomIdOn!)

		interaction.update(await warnSearch(searchId, true))

	}
});

export const warnIssueUpdate = new Interaction<ButtonInteraction>({
	customIdPrefix:'wiu',
	run: async (interaction: ButtonInteraction) => {
		const {customId, client} = interaction
		
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_id, warnId] = customId.split(client.splitCustomIdOn!)
		const record = await Warn.findById(warnId)
		if (!record) {
			interaction.update({
				content: 'Warning does not exist',
				embeds:[],
			})
			return;
		}
		const modal = warnModal(AddSplitCustomId('wu', warnId), 'Update Warning', record.reason, dateDiffInDays(new Date(), record.expireAt))
		
		interaction.showModal(modal)
	}
});

export const warnViewUser = new Interaction<ButtonInteraction>({
	customIdPrefix:'vuw',
	run: async (interaction: ButtonInteraction) => {
		const {user, customId} = interaction
		const targetId = customId.split(interaction.client.splitCustomIdOn!)[1]
		const search = await WarningSearch.create({
			searcher: {
				discordId: user.id,
				username: user.username
			},
			targetDiscordId: targetId
		})

		const reply:InteractionReplyOptions = await warnSearch(search,undefined,true)

		reply.flags = MessageFlags.Ephemeral

		interaction.reply(reply)
		
	}
})

