import {
	ChatInputCommandInteraction, GuildMember, role 
} from 'discord.js';
import guildMemberAdd from 'src/events/guildMemberAdd';
import { t } from '../../../../i18n';


const smeName = `sme-${role}`;

export async function smeRole(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });

	function roleManager(smeName, GuildMember) {
		/*
		the general idea

		if(GuildMember.role =/= smeName){
			GuildMember role smeName = true 
		}else{
			 GuildMember role smeName = false
		}
		*/
	}
}
