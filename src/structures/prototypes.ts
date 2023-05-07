import {
	AutocompleteInteraction, BaseInteraction, ChatInputCommandInteraction 
} from 'discord.js';

export default () => {
	Object.defineProperty(Date.prototype, 'discordTimestamp', {
		get: function get() {
			return `<t:${Math.floor(this.getTime() / 1000)}:t>`;
		}
	});

	Object.defineProperty(Date.prototype, 'discordDuration', {
		get: function get() {
			return `<t:${Math.floor(this.getTime() / 1000)}:R>`;
		}
	});

	Object.defineProperty(Date.prototype, 'discordDay', {
		get: function get() {
			return `<t:${Math.floor(this.getTime() / 1000)}:d>`;
		}
	});

	function getInteractionKey(this: ChatInputCommandInteraction<'cached'> | AutocompleteInteraction<'cached'>) {
		const name = this.commandName;

		const subCommand = this.options.getSubcommand(false);
		const subCommandGroup = this.options.getSubcommandGroup(false);

		let key = name;
		if (subCommandGroup) key += `-${subCommandGroup}`;
		if (subCommand) key += `-${subCommand}`;

		return key;
	}

	Object.defineProperty(BaseInteraction.prototype, 'key', {
		get() {
			return getInteractionKey.call(this);
		}
	});

	String.prototype.toTitleCase = function toTitleCase() {
		return this.split(' ')
			.map((a) => a[0].toUpperCase() + a.slice(1))
			.join(' ');
	};
};
