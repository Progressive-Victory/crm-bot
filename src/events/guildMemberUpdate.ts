import { Events, GuildMember } from 'discord.js';
import { Event } from '../Client';
import Logger from '../structures/Logger';

async function onGuildMemberUpdate(before: GuildMember, after: GuildMember) {
	if (after.guild.id !== process.env.TRACKING_GUILD) return;
	if (before.roles.cache.size === after.roles.cache.size) return;

	if (!after.guild.members.me.permissions.has('ManageRoles')) {
		Logger.warn('Missing permissions to manage roles');
		return;
	}

	// Checks if users currently do or don't have roles like the website form filled, altdentifier pending, and pending rules roles
	let hasWebForm = false;
	let hasRulePending = false;
	let hasAltDentifierPending = false;
	let justFinishedAltDentifier = false;

	const websiteFormFilledRole = after.guild.roles.cache.get(process.env.WEBSITE_FORM_FILLED_ROLE_ID);
	const pendingRulesRole = after.guild.roles.cache.get(process.env.PENDING_RULES_AGREEMENT_ROLE_ID);
	const altDentifierRole = after.guild.roles.cache.get(process.env.ALTDENTIFIER_ROLE_ID);
	const verifiedRole = after.guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);

	if (!websiteFormFilledRole || !pendingRulesRole || !altDentifierRole || !verifiedRole) {
		Logger.warn('Missing one of the verification related roles');
		return;
	}

	after.roles.cache.forEach((role) => {
		if (role.name === websiteFormFilledRole.name) {
			hasWebForm = true;
		}
		else if (role.name === pendingRulesRole.name) {
			hasRulePending = true;
		}
		else if (role.name === altDentifierRole.name) {
			hasAltDentifierPending = true;
		}
	});

	// If the user has the "Website Form Filled" role, but not the other two roles, Verify them
	if (hasWebForm && !hasRulePending && !hasAltDentifierPending) {
		await after.roles.add(verifiedRole);
		await after.roles.remove(websiteFormFilledRole);
	}

	// AltDentifier will not apply the website form filled role after verification--
	// If a user just got their AltDentifier role removed, add the Website Form Filled role back to them
	before.roles.cache.forEach((role) => {
		if (role.name === altDentifierRole.name) {
			justFinishedAltDentifier = true;
		}
	});

	if (!hasWebForm && hasRulePending && !hasAltDentifierPending && justFinishedAltDentifier) {
		await after.roles.add(websiteFormFilledRole);
	}
}

export default new Event().setName(Events.GuildMemberUpdate).setExecute(onGuildMemberUpdate);
