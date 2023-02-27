import { BaseInteraction, CommandInteraction } from 'discord.js';
import Command from '../structures/Command';
import Logger from '../structures/Logger';

export default async function onInteractionCreate(interaction: BaseInteraction) {
	if (interaction.isChatInputCommand()) {
		const name = interaction.commandName;
		const interactionData = interaction.client.interactions.get(name);

		if (!interactionData) return;

		const subcommand = interaction.options.getSubcommand(false);
		const subcommandgroup = interaction.options.getSubcommandGroup(false);

		let key = name;
		if (subcommandgroup) key += `-${subcommandgroup}`;
		if (subcommand) key += `-${subcommand}`;

		const command = interaction.client.commands.get(key);

		if (!command) {
			await interaction.reply({ ephemeral: true, content: `Command \`${key}\` not found.` });
			return;
		}

		try {
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
	}
}
