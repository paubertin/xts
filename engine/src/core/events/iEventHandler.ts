import { Event } from './event';

export interface IEventHandler {
    onEvent(event: Event): void;
}