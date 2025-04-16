import { ButtonInteraction, Colors, EmbedBuilder } from "discord.js";
import { Interaction } from "../../Classes/index.js";

export const welcomed = new Interaction<ButtonInteraction>({
	customIdPrefix: 'welcomed',
	run: (interaction) => {
		const embed = new EmbedBuilder(interaction.message.embeds[0].data)
		embed.setColor(Colors.Green)
			.addFields(
				{name:'Welcomed By:', value:`${interaction.member}`}
			)
		interaction.update({embeds:[embed], components:[]})
	}
})
