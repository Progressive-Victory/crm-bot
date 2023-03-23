/* eslint-disable no-case-declarations */
import {
	ApplicationCommandType, CommandInteraction, Interaction, InteractionType
} from 'discord.js';
import { Command } from '../structures/Command';
import Logger from '../structures/Logger';

export default async function onInteractionCreate(interaction: Interaction) {
	let interactionName:string;
	let key:string;
	try {
		switch (interaction.type) {
		case InteractionType.ApplicationCommand:

			switch (interaction.commandType) {
			// Chat Input Command
			case ApplicationCommandType.ChatInput:
				interactionName = interaction.commandName;
				const interactionData = interaction.client.interactions.get(interactionName);

				if (!interactionData) return;

				const subcommand = interaction.options.getSubcommand(false);
				const subcommandgroup = interaction.options.getSubcommandGroup(false);

				key = interactionName;
				if (subcommandgroup) key += `-${subcommandgroup}`;
				if (subcommand) key += `-${subcommand}`;

				const command = interaction.client.commands.get(key);

				if (!command) {
					await interaction.reply({ ephemeral: true, content: `Command \`${key}\` not found.` });
					return;
				}

				try {
					if (!interaction.inCachedGuild()) {
						await interaction.channel.guild.fetch();
					}

					const allowed = await Command.permissionsCheck(interaction as CommandInteraction<'cached'>, command);

					if (allowed !== true && allowed.error === true) {
						await interaction.reply(allowed.message);
						return;
					}

					await command.execute(interaction);
					Logger.debug(`Executed command ${command.name} by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`);
				}
				catch (error) {
					Logger.error(error);
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				}
				break;

				// Context Menu
			case ApplicationCommandType.Message:
			case ApplicationCommandType.User:
				const contextCommand = interaction.client.contextMenus.get(interaction.commandName);
				if (!contextCommand) {
					await interaction.reply({ content: 'Command not found.', ephemeral: true });
					return;
				}
				await contextCommand.execute(interaction);
				break;
			default:
				break;
			}
			break;
			// Component (Button | Select Menu)
			// case InteractionType.MessageComponent:

			// 	if (!client.config.interactions.receiveMessageComponents) return;
			// 	interactionName = client.config.interactions.splitCustomId ? interaction.customId.split('_')[0] : interaction.customId;

			// 	switch (interaction.componentType) {
			// 	case ComponentType.Button:
			// 		// Check if message components are enabled
			// 		if (!client.config.interactions.receiveMessageComponents) return;
			// 		client.buttons.get(interactionName)?.execute(client, interaction);
			// 		break;

			// 	case ComponentType.ChannelSelect:
			// 	case ComponentType.RoleSelect:
			// 	case ComponentType.UserSelect:
			// 	case ComponentType.MentionableSelect:
			// 	case ComponentType.StringSelect:
			// 		client.selectMenus.get(interactionName)?.execute(client, interaction);
			// 		break;
			// 	default:
			// 		break;
			// 	}

			// break;
			// ModalSubmit
		// case InteractionType.ModalSubmit:
		// 	// Check if modal interactions are enabled
		// 	if (!client.config.interactions.receiveModals) return;
		// 	interactionName = client.config.interactions.splitCustomId ? interaction.customId.split('_')[0] : interaction.customId;
		// 	client.modals.get(interactionName)?.execute(client, interaction);
		// 	break;
		case InteractionType.ApplicationCommandAutocomplete:
			// Check if autocomplete interactions are enabled
			// if (!client.config.interactions.receiveAutocomplete) return;
			interactionName = interaction.commandName;
			const subcommand = interaction.options.getSubcommand(false);
			const subcommandgroup = interaction.options.getSubcommandGroup(false);

			key = interactionName;
			if (subcommandgroup) key += `-${subcommandgroup}`;
			if (subcommand) key += `-${subcommand}`;

			// eslint-disable-next-line no-case-declarations
			const interactionData = interaction.client.commands.get(key);
			if (!interactionData) { console.warn(`[Warning] Autocomplete for ${interactionName} was not Setup`); }
			else { interactionData.autocomplete(interaction); }
			break;
		default:
			break;
		}
	}
	catch (error) {
		console.error(error);
	}
}
