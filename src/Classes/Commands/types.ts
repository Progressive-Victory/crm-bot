import {
	ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandBuilder,
	ContextMenuCommandInteraction, InteractionResponse,
	Message, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { BaseCommand } from './BaseCommand.js';

export type builders = SlashCommandBuilder | ContextMenuCommandBuilder;

export type ReturnableInteraction = void | CommandInteraction | ContextMenuCommandInteraction | InteractionResponse<boolean> | Message<boolean>;

export type TypeCommand = BaseCommand<SlashCommandBuilder | ContextMenuCommandBuilder, ChatInputCommandInteraction | ContextMenuCommandInteraction>;

export type SlashCommandBuilders = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
