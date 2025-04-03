import { ChannelType, inlineCode, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, SlashCommandChannelOption } from "discord.js";
import { UpdateQuery } from "mongoose";
import { ChatInputCommand } from "../../Classes/index.js";
import { GuildSetting, ISettings } from "../../models/Setting.js";


const channel = new SlashCommandChannelOption()
	.setName('channel')
	.setDescription('target channel')
	.addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread)
	.setRequired(true)

export const settings = new ChatInputCommand({
	builder: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('settings for the bot')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setContexts(InteractionContextType.Guild)
		.addSubcommandGroup(subcommandGroup => subcommandGroup
			.setName('warn')
			.setDescription('configure wanning system')
			.addSubcommand(subCommand => subCommand
				.setName('channels')
				.setDescription('configure channels for warn system')
				.addStringOption(option => option
					.setName('setting')
					.setDescription('Setting to edit')
					.setChoices(
						{ name: 'log', value: 'warn.logChannelId' },
						// { name: 'appeal', value: 'warn.appealChannelId' },
					)
					.setRequired(true)
				)
				.addChannelOption(channel)
			)
		)
		.addSubcommandGroup(subcommandGroup => subcommandGroup
			.setName('report')
			.setDescription('Config user report')
			.addSubcommand(subCommand => subCommand
				.setName('channels')
				.setDescription('configure channels for report system')
				.addStringOption(option => option
					.setName('setting')
					.setDescription('Setting to edit')
					.setChoices(
						{name: 'log', value: 'report.logChannelId'},
					)
					.setRequired(true)
				)
				.addChannelOption(channel)
			)
		)
		.addSubcommandGroup(subcommandGroup => subcommandGroup
			.setName('logging')
			.setDescription('Config logs')
			.addSubcommand(subCommand => subCommand
				.setName('channels')
				.setDescription('configure channels for log system')
				.addStringOption(option => option
					.setName('setting')
					.setDescription('Setting to edit')
					.setChoices(
						{name: 'timeout', value: 'logging.timeoutChannelId'},
					)
					.setRequired(true)
				)
				.addChannelOption(channel)
			)
		),
	execute: async (interaction) => {

		const subCommand = interaction.options.getSubcommand(true)

		if(subCommand === 'channels') {
			const setting = interaction.options.getString('setting', true)
			const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText, ChannelType.PublicThread])

			const update: UpdateQuery<ISettings> = {}
			update[setting] = channel.id
			
			await GuildSetting.findOneAndUpdate({guildId: interaction.guildId}, update)

			interaction.reply({
				flags: MessageFlags.Ephemeral,
				content: `${inlineCode(setting)} has been updated to ${channel}`
			})
		}
	}
})
