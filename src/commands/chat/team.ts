import { ChatInputCommandInteraction, GuildMember, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ChatInputCommand } from "../../Classes/index.js";
import { ITeam, Team } from "../../models/Team.js";
import dbConnect from "../../util/libmongo.js";

export const team = new ChatInputCommand({
	builder: new SlashCommandBuilder()
		.setName("team")
		.setDescription("Team Leader Commands")
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone)
		.addSubcommand((subCommand) =>
			subCommand
				.setName("ping")
				.setDescription("Ping your team")
				.addStringOption((option) =>
					option
						.setName("team_name")
						.setDescription("Name of the team to ping")
						.setRequired(true)
				)
		),
		execute: (interaction) => {
			const subCommand = interaction.options.getSubcommand(true)
			
			switch(subCommand) {
				case "ping":
					pingTeam(interaction)
					break
				default:
					throw Error("Unknown subCommand")
			}
		}
})

async function pingTeam(interaction: ChatInputCommandInteraction){
	const teamName: string = interaction.options.getString("team_name", true)
	const usr: GuildMember | null = interaction.member as GuildMember
	if(!usr) throw Error("Command has no associated user")

	await dbConnect()
	const team: ITeam = (await Team.findOne({ name: teamName }).exec()) as ITeam
	if(!team) throw Error(`Could not find team with name: ${teamName}`)

	const leaderRole = await interaction.guild?.roles.fetch(team.leaderRole)
	if(!leaderRole) throw Error(`Could not find (leader) role with id: ${team.leaderRole}`)

	const teamRole = await interaction.guild?.roles.fetch(team.teamRole)
	if(!teamRole) throw Error(`Could not find (team) role with id: ${team.teamRole}`)

	const authorized: boolean = usr.roles.cache.has(leaderRole.id)
	if(authorized){
		//return modal
	} else {
		await interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: "You lack the permissions to ping this team"
		})
	}
}
