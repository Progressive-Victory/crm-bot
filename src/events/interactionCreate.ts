/* eslint-disable no-case-declarations */

import {
	ApplicationCommandType,
	Interaction,
	InteractionType
} from 'discord.js';
import Languages from '../assets/languages';
import { isOwner } from '../structures/helpers';
import { Command } from '../structures/Command';
import Logger from '../structures/Logger';

export default async function onInteractionCreate(interaction: Interaction) {
	let interactionName: string;
	let key: string;

	try {
		switch (interaction.type) {
		case InteractionType.ApplicationCommand:
			switch (interaction.commandType) {
			// Chat Input Command
			case ApplicationCommandType.ChatInput:
				interactionName = interaction.commandName;
				const interactionData =
							interaction.client.interactions.get(
								interactionName
							);

				if (!interactionData) return;

				const command = interaction.client.commands.get(
					interaction.key
				);

				if (!command) {
					await interaction.reply({
						ephemeral: true,
						content:
									Languages[
										interaction.language
									].Generics.NotImplemented(key)
					});
					return;
				}

				try {
					if (!interaction.inCachedGuild()) {
						await interaction.channel.guild.fetch();
					}

					const allowed = await Command.permissionsCheck(
								interaction as Interaction<'cached'>,
								command
					);

					if (allowed !== true && allowed.error === true) {
						await interaction.reply({
							content: allowed.message,
							ephemeral: true
						});
						return;
					}

					await command.execute(interaction);
					Logger.debug(
						`Executed command ${command.name} by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`
					);
				}
				catch (error) {
					Logger.error(error);
					await interaction
						.followUp({
							content:
										Languages[
											interaction.language
										].Generics.Error(),
							ephemeral: true
						})
						.catch(() => null);
				}
				break;

				// Context Menu
			case ApplicationCommandType.Message:
			case ApplicationCommandType.User:
				const contextCommand =
							interaction.client.contextMenus.get(
								interaction.commandName
							);
				if (!contextCommand) {
					await interaction.reply({
						content: Languages[
							interaction.language
						].Generics.NotImplemented(
							interaction.commandName
						),
						ephemeral: true
					});
					return;
				}

				try {
					const allowed = await Command.permissionsCheck(
								interaction as Interaction<'cached'>,
								contextCommand
					);

					if (allowed !== true && allowed.error === true) {
						await interaction.reply({
							content: allowed.message,
							ephemeral: true
						});
						break;
					}

					await contextCommand.execute(interaction);
				}
				catch (error) {
					Logger.error(error);
					await interaction
						.followUp({
							content:
										Languages[
											interaction.language
										].Generics.Error(),
							ephemeral: true
						})
						.catch(() => null);
				}

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

			const interactionData = interaction.client.commands.get(
				interaction.key
			);
			if (!interactionData) {
				console.warn(
					`[Warning] Autocomplete for ${interaction.key} was not Setup`
				);
			}
			else {
				await interactionData.autocomplete(interaction);
			}
			break;
		default:
			break;
		}
	}
	catch (error) {
		console.error(error);
	}
}
