import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionReplyOptions
} from 'discord.js';
import guide from '../../../../../assets/guide.json';

const numberASCIIList = [
	'1️⃣',
	'2️⃣',
	'3️⃣',
	'4️⃣',
	'5️⃣',
	'6️⃣',
	'7️⃣',
	'8️⃣',
	'9️⃣',
	'1️⃣0️⃣'
];

export function generateEmbed(key = 'welcome', ephemeral = false): InteractionReplyOptions {
	const section = guide[key];

	if (!section) return null;
	if (typeof section === 'string') {
		return {
			ephemeral,
			embeds: [
				{ image: { url: section } }
			]
		};
	}

	const embeds = [];

	if (section.image) {
		embeds.push(new EmbedBuilder().setImage(section.image));
	}

	const buttons = [];
	if (section.buttons) {
		for (const k of section.buttons) {
			const buttonSection = guide[k];
			const builder = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(buttonSection.title)
				.setCustomId(k);
			buttons.push(builder);
		}
	}

	const embed = new EmbedBuilder()
		// TODO: If too long?
		.setDescription(section.numbered ? section.description.map((d, i) => d.startsWith('*') ? d.slice(1) : `${numberASCIIList[i]} ${d}`).join('\n\n') : section.description.join('\n\n'));

	if (section.showTitle) {
		embed.setTitle(section.title);
	}

	embeds.push(embed);

	const components = [];
	while (buttons.length) {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.splice(0, 5));
		components.push(row);
	}

	const out: InteractionReplyOptions = {
		ephemeral,
		embeds
	};

	if (components.length) {
		out.components = components;
	}

	return out;
}

/**
 * Executes the rules command to send a message to a channel.
 * @param interaction - The chat input command interaction object.
 */
export default async function rules(interaction: ChatInputCommandInteraction<'cached'>) {
	const { locale } = interaction;

	const content = generateEmbed();

	if (!content) {
		return interaction.reply(t({
			key: 'not-found',
			locale,
			ns
		}));
	}

	return interaction.reply(content);
}
