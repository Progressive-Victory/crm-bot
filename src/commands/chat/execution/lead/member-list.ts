import { ChatInputCommandInteraction } from 'discord.js';
import { join } from 'path';
import { appendFile, unlink } from 'fs/promises';
import { t } from '../../../../i18n';
import { ns } from '../../builders/lead';

/**
 * Executes a chat input command interaction to export role members to a CSV file.
 *
 * @param interaction - The chat input command interaction object.
 */
export async function memberList(interaction: ChatInputCommandInteraction<'cached'>) {
	// Defer the reply to indicate that the bot is processing the command.
	await interaction.deferReply({ ephemeral: true });

	// Fetches all members in the guild to ensure up-to-date data.
	await interaction.guild.members.fetch();

	// Extract the locale and options from the interaction.
	const { locale, options } = interaction;

	// Get the role option from the interaction's options, ensuring it is required.
	const role = options.getRole(t({ key: 'member-list-role-option-name', ns }), true);

	// Define the file path for the CSV file based on the role name and interaction ID.
	const path = join(process.cwd(), 'assets', 'csv', `${role.name.replace(' ', '-')}-${interaction.id}.csv`);

	// Create the CSV file and add the header row.
	await appendFile(path, 'displayName,username,id\n');

	// Iterate over each member in the role and add their details to the CSV file.
	for (const member of role.members.values()) {
		const csv = `${member.displayName},${member.user.username},${member.id}\n`;
		await appendFile(path, csv);
	}

	// Send a follow-up message with a content and the CSV file attached.
	await interaction.followUp({
		content: t({
			key: 'member-list-message-followup',
			locale,
			ns,
			args: { role: role.toString() }
		}),
		files: [path]
	});

	// Remove the CSV file after it has been sent.
	await unlink(path);
}
