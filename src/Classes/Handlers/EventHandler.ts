import { Client, ClientEvents, Collection } from 'discord.js';
import { Event } from '../Event.js';

export class EventHandler {
    readonly client: Client;

    protected events = new Collection<string, Event<keyof ClientEvents>>();

    /**
     * Add Event to Event handler
     * @param event event to add to handler
     */
    add(event: Event<keyof ClientEvents>) {
        if (event.once) this.client.once(event.name, event.execute);
        else this.client.on(event.name, event.execute);
        this.events.set(event.name, event);
    }

    get size() {
        return this.events.size;
    }

    constructor(client: Client) {
        this.client = client;
    }
}
