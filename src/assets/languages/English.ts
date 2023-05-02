import Language from 'src/declarations/languages';

const English: Language = {
	Objects: { Meeting: 'Meeting' },
	Generics: {
		NotImplemented: (command) => `${command} is not implemented.`,
		Error: () => 'An error occurred.',
		MissingConfiguration: (name) =>
			`The configuration \`${name}\` is missing. Please contact the bot owner(s).`,
		NoRole: (name) =>
			name
				? `A role with the name **${name}** was not found.`
				: 'No role found.'
	},
	Permissions: {
		NoCommandPermissions: (command, permissions, type, serverWideType) => {
			if (serverWideType) {
				return `${
					type === 'client' ? 'I' : 'You'
				} need the following **${
					serverWideType === type ? 'server-wide' : 'channel-wide'
				}** permissions: ${permissions} to execute the command \`${command}\`!`;
			}
			if (type) {
				return `${
					type === 'client' ? 'I' : 'You'
				} don't have enough permissions to execute the command \`${command}\`!`;
			}

			return `You do not have permissions to execute the command \`${command}\`.`;
		},
		BotOwners: (command) =>
			`Only the bot owners may use the \`${command}\` command!`,
		ServerOnly: (command) =>
			`The command \`${command}\` can only be used in a server.`,
		StateRegionMismatchUser: (user) =>
			`You are not in the same state as ${user}!`,
		StateRegionMismatchChannel: (name) =>
			`You do not have the corresponding region role ${name} to run this command.`,
		WrongRegionChannel: (channel, allowed) =>
			`You are not allowed to run this command in ${channel}. However, you can from one of the following channels: ${allowed
				.map((id) => `<#${id}>`)
				.join(', ')}.`,
		TrackingServer: (command) =>
			`The command \`${command}\` can only be used in the tracking server.`,
		MissingSMERole: (roles) =>
			`You are missing one of the following roles: ${roles
				.map((id) => `<@&${id}>`)
				.join(', ')}.`
	},
	Commands: {
		Pin: {
			Success: (message, pinned) =>
				`Successfully ${pinned ? '' : 'un'}pinned message ${
					message.url
				}.`,
			Error: (message) => `Failed to pin message ${message.url}.`,
			CannotPin: (message) => `Cannot pin message ${message.url}.`
		},
		Delete: {
			Success: () => 'Successfully deleted message.',
			Error: (message) => `Failed to delete message ${message.url}.`,
			CannotDelete: (message) => `Cannot delete message ${message.url}.`
		},
		Lead: {
			Region: {
				Role: {
					Success: (role, user, add) => {
						if (add) {
							return `Successfully gave ${role} to ${user.tag}.`;
						}
						return `Successfully removed removed ${role} from ${user.tag}.`;
					},
					Error: (role, user, add) => {
						if (add) {
							return `Failed to give ${role} to ${user.tag}.`;
						}
						return `Failed to remove ${role} from ${user.tag}.`;
					},
					AuditLog: (role, user, add) => {
						if (add) {
							return `${role.name} role added by ${user.tag}`;
						}
						return `${role.name} role removed by ${user.tag}`;
					}
				}
			},
			VC: {
				Rename: {
					Success: (channel) =>
						`Successfully renamed the channel ${channel}.`,
					Error: (channel) =>
						`Failed to rename the channel ${channel}.`,
					WrongChannel: (channel, allowed) =>
						`You are not allowed to rename ${channel}. However, you can rename any of the following channels: ${allowed
							.map((id) => `<#${id}>`)
							.join(', ')}.`,
					AuditLogRename: (channel, user) =>
						`Channel ${channel.name} renamed by ${user.tag}`,
					AuditLogUndo: () =>
						'Automatic undoing of meeting channel rename'
				}
			}
		},
		Metrics: {
			Title: () => 'Metrics',
			User: () => 'For User',
			VCJoins: () => 'VC Joins',
			VCLeaves: () => 'VC Leaves',
			Messages: () => 'Sent Messages',
			ServerJoins: () => 'Server Joins',
			ServerLeaves: () => 'Server Leaves',
			ConnectedForm: () => 'Connected for',
			Server: () => 'For Server',
			LeavesToMemberCount: () => 'Leaves/Members',
			UsersInServer: () => 'Users in Server',
			NotInServer: () => 'Users NOT in Server',
			Connected: () => 'Connected',
			NotConnected: () => 'NOT Connected'
		}
	}
};

export default English;
