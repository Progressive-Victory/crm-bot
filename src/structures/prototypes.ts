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
};
