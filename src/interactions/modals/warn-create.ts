import { ModalSubmitInteraction } from 'discord.js';
import { Interaction } from '../../Classes/index.js';
import { Warn } from '../../models/Warn.js';

export const warnCreate = new Interaction<ModalSubmitInteraction>({
	customIdPrefix:'warn',
	run: async (interaction: ModalSubmitInteraction) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_id, action, targetId] = interaction.customId.split(interaction.client.splitCustomIdOn!)
		if(action == 'create') {
			const mod = interaction.user;
			const reason = interaction.fields.getTextInputValue('reason')
			Warn.create({
				guildId: interaction.guildId,
				targetDiscordId: targetId,
				moderatorDiscordId: mod.id,
				updaterDiscordId:mod.id,
				reason,
				updatedAt: new Date
			})

			
		}
		
	}
});
