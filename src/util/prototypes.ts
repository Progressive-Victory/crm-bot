declare global {
	interface String {
		toTitleCase(): string;
	}
}

export default () => {
	String.prototype.toTitleCase = function toTitleCase() {
		return this.split(' ')
			.map((a) => a[0].toUpperCase() + a.slice(1))
			.join(' ');
	};
};
