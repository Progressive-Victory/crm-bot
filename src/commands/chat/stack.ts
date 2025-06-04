import { ChatInputCommandInteraction, InteractionContextType, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';

export const ns = 'state';

export const stack =  new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName('stack')
		.setDescription('KIANA GIVE A DESCRIPTION')
		// .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone)
		.setContexts(InteractionContextType.Guild)
		.addSubcommand(
			(subcommand) => subcommand.setName("start")
			.setDescription("start a stack system")
		).addSubcommand(
			(subcommand) => subcommand.setName("push")
			.setDescription("join the stack ")
			// should have topic parameter;
		).addSubcommand(
			(subcommand) => subcommand.setName("pop")
			.setDescription("join the stack ")
			// should have topic parameter;
		).addSubcommand(
			(subcommand) => subcommand.setName("view")
			.setDescription("join the stack ")
			// should have topic parameter;
		).addSubcommand(
			(subcommand) => subcommand.setName("clear")
			.setDescription("join the stack")
			// should have topic parameter;
		)
	)
	.setExecute((interaction) => {
		const subcommandName = interaction.options.getSubcommand(true);
		switch (subcommandName) {
			case 'start':
				stackStart(interaction)
				break;

			case 'push':
				stackPush(interaction)
				break;

			case 'pop':
				stackPop(interaction)
				break;
			case 'view':
				stackView(interaction)
				break;

			case 'clear':
				stackClear(interaction)
				break;
			default:
				break;
		}
	});
/**
 *
 * @param interaction
 */
function stackStart(interaction:ChatInputCommandInteraction) {
	interaction.reply({flags : MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,components:[
			new TextDisplayBuilder({content: `stack started!`})
		]})
}
/**
 *
 * @param interaction
 */
function stackPush(interaction:ChatInputCommandInteraction) {
	const u = interaction.user.displayName;
	interaction.reply({flags : MessageFlags.IsComponentsV2,components:[
			new TextDisplayBuilder({content: `${u} has been pushed into the stack`})
		]})
}

/**
 *
 * @param interaction
 */
function stackPop(interaction:ChatInputCommandInteraction) {
	const u = interaction.user.displayName;
	interaction.reply({flags : MessageFlags.IsComponentsV2,components:[
			new TextDisplayBuilder({content: `${u} has been popped into the stack`})
		]})
}

/**
 *
 * @param interaction
 */
function stackView(interaction:ChatInputCommandInteraction) {
	const u = interaction.user.displayName;
	interaction.reply({flags : MessageFlags.IsComponentsV2,components:[
			new TextDisplayBuilder({content: `there is one person in the stack: \n${u}`})
		]})
}
/**
 *
 * @param interaction
 */
function stackClear(interaction:ChatInputCommandInteraction) {
	interaction.reply({flags : MessageFlags.IsComponentsV2,components:[
			new TextDisplayBuilder({content: `stack is dead`})
		]})
}



