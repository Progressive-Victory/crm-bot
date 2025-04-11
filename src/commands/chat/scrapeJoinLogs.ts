import { ChannelType, ChatInputCommandInteraction, InteractionContextType, PermissionsBitField } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';

export default new ChatInputCommand()
    .setBuilder((builder) => builder
        .setName('scrapejoinlogs')
        .setDescription('Scrapes join logs and exports to CSV')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .setContexts(InteractionContextType.Guild)
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('target channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true)
		))
    .setExecute(async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.inGuild()) return;

		const { guild, options} = interaction

        await interaction.deferReply({ ephemeral: true });

        const joinLogsChannel = options.getChannel('channel',true, [ChannelType.GuildText])

        try {
            //get all needed details
            const messages = await joinLogsChannel.messages.fetch({ limit: 100 });
            await guild?.members.fetch();

            const records = [];

            for (const message of messages.values()) {
                //check message
                const content = message.content;
                const showedUpMatch = content.match(/^(.+) just showed up!$/);
                const goodToSeeYouMatch = content.match(/^Good to see you, (.+)\.$/);

                let username;
                if (showedUpMatch) username = showedUpMatch[1];
                else if (goodToSeeYouMatch) username = goodToSeeYouMatch[1];
                else continue;

                //find member with join time closest to join msg
                const potentialMembers = guild?.members.cache.filter(m => 
                    (m.user.username === username || m.nickname === username) &&
                    m.joinedAt &&
                    Math.abs(m.joinedAt.getTime() - message.createdAt.getTime()) < 10000
                );

                if (potentialMembers?.size === 0) continue;

                const closestMember = potentialMembers?.sort((a, b) => 
                    Math.abs(a.joinedAt!.getTime() - message.createdAt.getTime()) - 
                    Math.abs(b.joinedAt!.getTime() - message.createdAt.getTime())
                ).first()!;

                records.push({
                    nickname: closestMember.nickname || '',
                    username: closestMember.user.username,
                    date: message.createdAt.toISOString().split('T')[0],
                    time: message.createdAt.toLocaleTimeString('en-US', { hour12: false })
                });
            }

            if (records.length === 0) {
                return interaction.editReply('No valid join messages found.');
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

	