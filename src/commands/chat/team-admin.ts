import {
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	Role,
	SlashCommandBuilder,
} from "discord.js";
import { ChatInputCommand } from "../../Classes/index.js";
import { ITeam, Team } from "../../models/Team.js";
import dbConnect from "../../util/libmongo.js";

export const teamAdmin = new ChatInputCommand({
  builder: new SlashCommandBuilder()
    .setName("team_admin")
    .setDescription("Team Management Commands")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subCommand) =>
      subCommand
        .setName("create")
        .setDescription("Create a new team")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the team to be created")
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName("team_role")
            .setDescription(
              "The role you want the team designation to refer to",
            )
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName("leader_role")
            .setDescription(
              "The role you want the team designation to consider a leader",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("delete")
        .setDescription("Delete a team")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Name of the team to delete")
            .setRequired(true),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("set_team_role")
        .setDescription("Set the discord role this team designation refers to")
        .addStringOption((option) =>
          option
            .setName("team_name")
            .setDescription(
              "The name of the team designation you want to change the team role of",
            )
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription(
              "The role you want the team designation to refer to",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("set_leader_role")
        .setDescription(
          "Set the discord role you want the team designation to consider a leader",
        )
        .addStringOption((option) =>
          option
            .setName("team_name")
            .setDescription(
              "The name of the team designation you want to change the team role of",
            )
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription(
              "The role you want the team designation to consider a leader",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("list")
        .setDescription("List existing teams")
        .addBooleanOption((option) =>
          option
            .setName("verbose")
            .setDescription("List assigned roles of each team?")
            .setRequired(false),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("inspect")
        .setDescription("Inspect a specific team")
        .addStringOption((option) =>
          option
            .setName("team_name")
            .setDescription("Name of the team you want to inspect")
            .setRequired(true),
        ),
	),
  execute: (interaction) => {
    const subCommand = interaction.options.getSubcommand(true);

    switch (subCommand) {
      case "create":
        createTeam(interaction);
        break;
      case "delete":
        deleteTeam(interaction);
        break;
      case "set_team_role":
        setTeamRole(interaction);
        break;
      case "set_leader_role":
        setLeaderRole(interaction);
        break;
      case "list":
        listTeams(interaction);
        break;
      case "inspect":
        inspectTeam(interaction);
        break;
      default:
        throw Error("Unexpected team subCommand");
    }

    return undefined;
  },
});

async function createTeam(interaction: ChatInputCommandInteraction) {
  const name: string = interaction.options.getString("name", true);
  const teamRole: Role = interaction.options.getRole("team_role", true) as Role;
  const leaderRole: Role = interaction.options.getRole(
    "leader_role",
    true,
  ) as Role;

  await dbConnect();
  const res = await Team.insertOne({
    name: name,
    teamRole: teamRole.id,
    leaderRole: leaderRole.id,
  });

  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    content: `Created "${res.name}" team successfully`,
  });
}

async function deleteTeam(interaction: ChatInputCommandInteraction) {
  const name: string = interaction.options.getString("name", true);

  await dbConnect();
  const res = await Team.deleteOne({ name: name });

  if (res.acknowledged && res.deletedCount > 0) {
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: `Deleted "${name}" team successfully`,
    });
  } else {
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: `Failed to delete "${name}" team`,
    });
  }
}

async function setTeamRole(interaction: ChatInputCommandInteraction) {
  const teamName: string = interaction.options.getString("team_name", true);
  const role: Role = interaction.options.getRole("role", true) as Role;

  await dbConnect();
  const team: ITeam = (await Team.findOne({ name: teamName }).exec()) as ITeam;

  if (!team) {
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: `Failed to find "${teamName}" team`,
    });
  } else {
    team.teamRole = role.id;
    await team.save();
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: `Successfully set "${teamName}" team role to: "${role.name}"`,
    });
  }
}

async function setLeaderRole(interaction: ChatInputCommandInteraction) {
  const teamName: string = interaction.options.getString("team_name", true);
  const role: Role = interaction.options.getRole("role", true) as Role;

  await dbConnect();
  const team: ITeam = (await Team.findOne({ name: teamName }).exec()) as ITeam;

  if (!team) {
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: `Failed to find "${teamName}" team`,
    });
  } else {
    team.leaderRole = role.id;
    await team.save();
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: `Successfully set "${teamName}" leader role to: "${role.name}"`,
    });
  }
}

async function listTeams(interaction: ChatInputCommandInteraction) {
  const verbose: boolean =
    interaction.options.getBoolean("verbose", false) ?? false;

  await dbConnect();
  const teams: ITeam[] = (await Team.find({}).exec()) as ITeam[];

  const teamsStr: string = (
    await Promise.all(
      teams.map(async (team) => {
        const teamRole: Role | null =
          (await interaction.guild?.roles.fetch(team.teamRole)) ?? null;
        if (!teamRole)
          throw Error(`Couldn't find role with id: ${team.teamRole}`);
        const leaderRole: Role | null =
          (await interaction.guild?.roles.fetch(team.leaderRole)) ?? null;
        if (!leaderRole)
          throw Error(`Couldn't find role with id: ${team.leaderRole}`);
        return (
          `- ${team.name}` +
          (verbose
            ? `:\n     Team Role: ${teamRole}\n     Leader Role: ${leaderRole}`
            : "")
        );
      }),
    )
  ).toString();

  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    content: teamsStr !== "" ? teamsStr : "None",
  });
}

async function inspectTeam(interaction: ChatInputCommandInteraction) {
  const name: string = interaction.options.getString("team_name", true);

  await dbConnect();
  const team: ITeam = (await Team.findOne({ name: name }).exec()) as ITeam;
  if (!team) throw Error(`Can't find team with name: ${name}`);

  const teamRole: Role | null =
    (await interaction.guild?.roles.fetch(team.teamRole)) ?? null;
  if (!teamRole) throw Error(`Can't find role with id: ${teamRole}`);

  const leaderRole: Role | null =
    (await interaction.guild?.roles.fetch(team.leaderRole)) ?? null;
  if (!leaderRole) throw Error(`Can't find role with id: ${leaderRole}`);

  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    content: `Name: ${team.name}\nTeam Role: ${teamRole}\nLeader Role: ${leaderRole}`,
  });
}
