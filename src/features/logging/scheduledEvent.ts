import { ButtonBuilder, ButtonStyle, ChannelType, ContainerBuilder, DiscordAPIError, Guild, MessageFlags, RESTJSONErrorCodes, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { client } from "../../index.js";
import { IScheduledEvent } from "../../models/ScheduledEvent.js";
import { GuildSetting } from "../../models/Setting.js";
import dbConnect from "../../util/libmongo.js";
import { ScheduledEventWrapper } from "../../util/scheduledEventWrapper.js";

/**
 *
 * @param event
 * @param guild
 */
export async function logScheduledEvent(event: IScheduledEvent) {
	await dbConnect()
	const guild: Guild = await client.guilds.fetch(event.guildId)
	const settings = await GuildSetting.findOne({ guildId: guild.id }).exec()

	const logChannelId = settings?.logging.eventLogChannelId
	console.log(logChannelId)
	if(!logChannelId)
		return
	let logChannel = guild.channels.cache.get(logChannelId)
	if (!logChannel) {
		logChannel = await guild.channels.fetch(logChannelId) ?? undefined
	}
	
	if (logChannel?.type !== ChannelType.GuildText) return
	let existingPost = undefined
	if(event.logMessageId) {
		existingPost = logChannel.messages.cache.get(event.logMessageId)
		if (!existingPost) {
			existingPost = await logChannel.messages.fetch(event.logMessageId).catch(e => {
				if (e instanceof DiscordAPIError && e.code === RESTJSONErrorCodes.UnknownMessage) {
					return undefined
				}
				throw e
			})
		}
	}

	if(existingPost) {
		const container = logContainer(event)
		await existingPost.edit({
			components:[await container],
			flags: MessageFlags.IsComponentsV2
		})
	} else {
		const container = logContainer(event)
		
		const post = await logChannel.send({
			components:[await container],
			flags: MessageFlags.IsComponentsV2
		})
		await dbConnect()
		event.logMessageId = post.id
		await event.save()
	}
}

/**
 *
 * @param event
 */
async function logContainer(event: IScheduledEvent) {
	const wrapper = new ScheduledEventWrapper(event)
	const attendees = await wrapper.attendees()
	const attendeesCount = attendees.length
	const attendeesStr = attendees.length > 0 ? attendees.map((usr) => {return `\n- <@${usr.id}>`}).toString() : ""
	return new ContainerBuilder()
		.setAccentColor(5763719)
		.addSectionComponents(
			new SectionBuilder()
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(wrapper.thumbnail())
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent("### " + wrapper.name()),
					new TextDisplayBuilder().setContent("Date: " + wrapper.startDate()),
					new TextDisplayBuilder().setContent(`Time: ${wrapper.startTime()} - ${wrapper.endTime()}`),
				),
		)
		.addSeparatorComponents(
			new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent("Description:\n" + wrapper.description()),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent("Attendees: " + attendeesStr),
		)
		.addSeparatorComponents(
			new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
		)
		.addSectionComponents(
			new SectionBuilder()
				.setButtonAccessory(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel("Event Link")
						.setURL(wrapper.eventLink())
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(`${wrapper.duration()} Minutes • ${attendeesCount} Attendees • ${wrapper.recurrence()}`),
				),
		)		
}
