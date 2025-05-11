import { ButtonInteraction, Colors, ContainerBuilder, ContainerComponent, EmbedBuilder, Guild, GuildMember, MessageFlags } from "discord.js";
import { Interaction } from "../../Classes/index.js";
import { baseWelcomeContainer, updateWelcomeContainer } from "../../features/welcome/component.js";
import { getMember } from "../../util/index.js";

export const welcomed = new Interaction<ButtonInteraction>({
	customIdPrefix: 'welcomed',
	run: async (interaction) => {
		let guild:Guild
		if (interaction.inCachedGuild()) guild = interaction.guild
		else if(interaction.inRawGuild()) guild = await interaction.client.guilds.fetch(interaction.guildId)
		else return

		const message = interaction.message
		const welcomer = interaction.member instanceof GuildMember ? interaction.member : await guild.members.fetch(interaction.user.id).catch(console.error)

		if (!message.flags.has(MessageFlags.IsComponentsV2)) {
			const userId = message.embeds[0].footer?.text.split(': ')[1] || ''
			if(!welcomer) {
				interaction.update({
					content: 'Member no longer in server',
					embeds: [],
					components: []
				})
				return
			}
			const con = updateWelcomeContainer(baseWelcomeContainer(welcomer).data, welcomer)

			interaction.update({
				content: null,
				embeds: [],
				flags: MessageFlags.IsComponentsV2,
				components:[con]
			})
		}
		else {
			const component = interaction.message.components[0]
			if (!(component instanceof ContainerComponent)) return
			const container = updateWelcomeContainer(component, interaction.member.)
		}



		const embed = new EmbedBuilder(interaction.message.embeds[0].data)
		embed.setColor(Colors.Green)
			.addFields(
				{name:'Welcomed By:', value:`${interaction.member}`}
			)
		interaction.update({embeds:[embed], components:[]})
	}
})

export const unwelcome = new Interaction<ButtonInteraction>({
	customIdPrefix: 'unwelcomed',
	run: (interaction) => {
		
	}
})
