import { IEventHandler } from "./iEventHandler";
import { Event } from './event';

export class EventSubscriptionNode {

    public constructor(public event: Event, public handler: IEventHandler) {}
}