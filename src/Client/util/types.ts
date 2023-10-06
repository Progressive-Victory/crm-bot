import {
	ChatInputCommandInteraction,
	CommandInteraction,
	ContextMenuCommandBuilder,
	ContextMenuCommandInteraction,
	InteractionResponse,
	Message,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { Command } from '../Command';

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export declare const ExtraColor: {
	EmbedGray: 0x2b2d31;
};

export type ChatInputCommandBuilders =
	| SlashCommandBuilder
	| SlashCommandSubcommandsOnlyBuilder
	| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type ReturnableInteraction = void | CommandInteraction | ContextMenuCommandInteraction | InteractionResponse | Message;

export type TypeCommand = Command<ChatInputCommandBuilders | ContextMenuCommandBuilder, ChatInputCommandInteraction | ContextMenuCommandInteraction>;

export type TimeStyle = 'd' | 'D' | 't' | 'T' | 'f' | 'F' | 'R';
