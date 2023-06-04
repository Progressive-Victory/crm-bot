import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';
import { t } from 'src/i18n';
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

	// Create a CSV attachment using the AttachmentBuilder class.
	const csv = new AttachmentBuilder(
		// Construct the CSV content using the role's members.
		Buffer.from(`Display Name,Username,Id\n${role.members.map((member) => `${member.displayName},${member.user.username},${member.id}\n`).join('')}`),
		// Set the file name for the CSV attachment based on the role name and interaction ID.
		{ name: `${role.name.replace(' ', '-')}.csv` }
	);

	// Send a follow-up message with a content and the CSV file attached.
	await interaction.followUp({
		content: t({
			key: 'member-list-message-followup',
			locale,
			ns,
			args: { role: role.toString() }
		}),
		files: [csv]
	});
}
