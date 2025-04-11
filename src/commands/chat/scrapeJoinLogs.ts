import { ChannelType, ChatInputCommandInteraction, InteractionContextType, Message, MessageFlags, MessageType, PermissionsBitField, Snowflake } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';

interface Record {
	username: string
	nickname: string
	date: string
	time: string
}


export default new ChatInputCommand()
    .setBuilder((builder) => builder
        .setName('scrape-join-logs')
        .setDescription('Scrapes join logs and exports to CSV')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .setContexts(InteractionContextType.Guild)
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('target channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true))
	)
    .setExecute(async (interaction: ChatInputCommandInteraction) => {

		const { guild, options} = interaction

        await interaction.deferReply({ flags: MessageFlags.Ephemeral});

        const joinLogsChannel = options.getChannel('channel',true, [ChannelType.GuildText])

		let messages: Message<true>[] = []
			.map((value) => value)
		let messageId: Snowflake | undefined 
		const endDate = new Date()
		endDate.setMonth(2,1)
		let date = new Date()
		let end = false

		while (date > endDate && !end) {

			const fetchBlock = (await joinLogsChannel.messages.fetch({ limit: 100, before: messageId })).map((value) => value)

			if(fetchBlock.length === 0) {
				end = true
				continue;
			}
			const lastMessage = fetchBlock[fetchBlock.length-1]
			messages = messages.concat(fetchBlock)
			messageId = lastMessage?.id
			date = lastMessage.createdAt
		}
		
		messages = messages.filter((message) => message.type === MessageType.UserJoin)

		const records:Record[] = [];

        try {
            for (const message of messages) {

				const member = guild?.members.cache.get(message.author.id) ?? await guild?.members.fetch(message.author.id)

                records.push({
                    nickname: (member?.nickname ?? member?.displayName) ?? '',
                    username: !member ? message.author.username : member.user.username,
                    date: message.createdAt.toISOString().split('T')[0],
                    time: message.createdAt.toLocaleTimeString('en-US', { hour12: false })
                });
            }

			// CSV TIME
            const csvContent = [
                'Server Nickname,Discord Name,Date,Time',
                ...records.map(r => 
                    `"${r.nickname.replace(/"/g, '""')}","${r.username.replace(/"/g, '""')}",${r.date},${r.time}`
                )
            ].join('\n');

            await interaction.editReply({
                content: 'Join logs exported:',
                files: [{
                    attachment: Buffer.from(csvContent, 'utf-8'),
                    name: 'join_logs.csv'
                }]
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while processing the command.');
        }
    });

	