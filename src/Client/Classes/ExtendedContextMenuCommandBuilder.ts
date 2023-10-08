import {
	ContextMenuCommandBuilder, EmbedBuilder, Locale 
} from 'discord.js';

export class ExtendedContextMenuCommandBuilder extends ContextMenuCommandBuilder {
	public getHelpEmbed: (locale: Locale, baseEmbed?: EmbedBuilder) => EmbedBuilder;

	public setHelpEmbed(input: (locale: Locale, baseEmbed?: EmbedBuilder) => EmbedBuilder) {
		this.getHelpEmbed = input;
		return this;
	}
}
