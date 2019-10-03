export enum EventPriority {
    NORMAL,
    HIGH,
}

export enum EVENTS {
    ACTOR_MOVED = 'EVENT_ACTOR_MOVED::',
    ASSET_LOADED = 'EVENT_ASSET_LOADED::',
    SHADER_LOADED = 'EVENT_SHADER_LOADED::',
}

export class Event {
    public constructor(public code: string, public sender: any, public context?: any, public priority: EventPriority = EventPriority.NORMAL) {
    }

}