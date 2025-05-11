import { ActionRowBuilder, APIContainerComponent, ButtonBuilder, ButtonStyle, Colors, ContainerBuilder, GuildMember, heading, HeadingLevel, SectionBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder } from "discord.js"


/**
 *
 * @param member
 */
function headingSection(member:GuildMember) {
	const welcome = new TextDisplayBuilder()
		.setContent(`${heading('Member Joined')}\n${member.toString()} ${member.user.username}`)

	const memberIcon = new ThumbnailBuilder()
		.setURL(member.displayAvatarURL({ forceStatic: true }))
		.setDescription('Member Icon')

	return new SectionBuilder()
		.addTextDisplayComponents(welcome)
		.setThumbnailAccessory(memberIcon)

}
 
/**
 *
 * @param welcomed
 * @returns
 */
function buttonRow(welcomed:boolean = false) {
	const row = new ActionRowBuilder<ButtonBuilder>()
	if (welcomed) row.addComponents(new ButtonBuilder()
		.setCustomId('unwelcomed')
		// .setEmoji('👋')
		.setLabel('Remove Welcome')
		.setStyle(ButtonStyle.Danger))
	else row.addComponents(new ButtonBuilder()
		.setCustomId('welcomed')
		// .setEmoji('👋')
		.setLabel('Confirm Welcome')
		.setStyle(ButtonStyle.Secondary))
	return row
}

/**
 *
 * @param member
 * @param welcomed
 * @returns
 */
export function baseWelcomeContainer(member:GuildMember) {
	
	const container = new ContainerBuilder()
		.setAccentColor(Colors.Blue)
		.addSectionComponents(headingSection(member))
		.addSeparatorComponents(separator => separator
			.setDivider(true)
			.setSpacing(SeparatorSpacingSize.Small)
		)
		.addActionRowComponents(buttonRow(false))
					
	return container
}

/**
 *
 * @param data
 * @param Welcomer
 * @param remove
 */
export function updateWelcomeContainer(data:APIContainerComponent, Welcomer:GuildMember, remove = false) {
	const updateText = new TextDisplayBuilder()
		.setContent(`${heading('Welcomed by',HeadingLevel.Three)}\n ${Welcomer.toString()}`)
	const container = new ContainerBuilder(data)
	container.components.splice(0, 0, updateText)
	container.components.splice(-1, 1, buttonRow(true))
	
	return container
}
