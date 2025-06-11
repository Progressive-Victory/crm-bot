import { ButtonInteraction } from "discord.js";
import { Interaction } from "../../Classes/Interaction.js";

// if we got a stack button, just let that stack handle it so this doesn't get cluttered
export const stack = new Interaction<ButtonInteraction>({
	customIdPrefix: 'stack',
	run: async (interaction: ButtonInteraction) => {
		if(stackStore.has(interaction.channelId)) stackStore.get(interaction.channelId)?.onButton(interaction);
	}
});	
