import {
	Events,
	GuildMember,
	InteractionContextType, MessageFlags, PermissionFlagsBits,
	TimestampStyles
} from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';
import { timeoutEmbed } from '../../features/timeout.js';
import { localize } from '../../i18n.js';
import { GuildSetting } from '../../models/Setting.js';
import { isGuildMember } from '../../util/index.js';

export const ns = 'timeout';

export const timeout = new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName('timeout')
		.setDescription('Custom Timeout Command')
		// .setNameLocalizations(localize.discordLocalizationRecord('name', ns))
		// .setNameLocalizations(localize.discordLocalizationRecord('description', ns))
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.setContexts(InteractionContextType.Guild)
		.addUserOption(option => option
			.setName('member')
			.setDescription('The user to timeout')
			// .setNameLocalizations(localize.discordLocalizationRecord('option_member_name', ns))
			// .setNameLocalizations(localize.discordLocalizationRecord('option_member_description', ns))
			.setRequired(true))
		.addNumberOption(option => option
			.setName('duration')
			.setDescription('How long the member should be timed out for')
			// .setNameLocalizations(localize.discordLocalizationRecord('option_duration_name', ns))
			// .setNameLocalizations(localize.discordLocalizationRecord('option_duration_description', ns))
			.setRequired(true)
			.setChoices(
				{ name: '60 secs', value: 60 },
				{ name: '5 mins', value: 300 },
				{ name: '10 mins', value: 600 },
				{ name: '30 mins', value: 1800 },
				{ name: '1 hour', value: 3600 },
				{ name: '2 hours', value: 7200 },
				{ name: '6 hours', value: 21600 },
				{ name: '12 hours', value: 43200 },
				{ name: '1 Day', value: 86400 },
				{ name: '3 Days', value: 259200 },
				{ name: '1 week', value: 604800 }))
		.addStringOption(option => option
			.setName('reason')
			.setDescription('The reason for timing them out')
			// .setNameLocalizations(localize.discordLocalizationRecord('option_reason_name', ns))
			// .setNameLocalizations(localize.discordLocalizationRecord('option_reason_description', ns))
			.setRequired(false)))
	.setExecute(async (interaction) => {
		const {
			options, locale, user, guild, member
		} = interaction;

		let target = options.getMember('member');

		if(!isGuildMember(target)) {
			interaction.client.emit(Events.Error, Error('received APIInteractionDataResolvedGuildMember when expecting guild member'));
			return interaction.reply({ content: localize.t('reply_error', ns, locale), flags: MessageFlags.Ephemeral });
		}

		const reason = options.getString('reason', false) ?? undefined;
		const duration = options.getNumber('duration', true);
		const endNumber = Math.floor(new Date().getTime() / 1000) + duration;

		target = await target.timeout(duration * 1000, `Member was timed out by ${user.username} for ${reason}`);


		interaction.reply({
			content: localize.t('reply_timeout', ns, locale, {
				member: target.toString(),
				endDate: `<t:${endNumber}:${TimestampStyles.LongDateTime}>`
			}),
			flags: MessageFlags.Ephemeral
		});

		const settings = await GuildSetting.findOne({guildId: interaction.guild?.id})
		if (!settings?.logging.timeoutChannelId) return

		const timeoutChannel = guild?.channels.cache.get(settings.logging.timeoutChannelId) ?? await guild?.channels.fetch(settings.logging.timeoutChannelId) ?? undefined
					
		if(!timeoutChannel?.isSendable() || !(member instanceof GuildMember)) return
					
		const embed = timeoutEmbed(target, member, new Date(), target.communicationDisabledUntil!, reason)
					
	timeoutChannel.send({embeds:[embed]})
	});
