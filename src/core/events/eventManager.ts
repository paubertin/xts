import * as std from 'tstl';
import { IEventHandler } from './iEventHandler';
import { EventSubscriptionNode } from './eventSubscriptionNode';
import { Logger } from '../utils/log'
import { Event, EventPriority } from './event';
import { TimeStep } from '../utils/timestep';

export class EventManager {

    public static init(): void {
        if (EventManager._instance) {
            throw new Error('EventManager already instanciated');
        }
        EventManager._instance = new EventManager();

    }

    public static subscribe(code: string, handler: IEventHandler): void {
        return EventManager.addSubscription(code, handler);
    }

    public static addSubscription(code: string, handler: IEventHandler): void {
        if (!EventManager.instance._subscriptions.has(code)) {
            EventManager.instance._subscriptions.set(code, []);
        }
        if (EventManager.instance._subscriptions.get(code).includes(handler)) {
            Logger.warn(`Attempting to add a duplicate handler to code: ${code}. Subscription not added.`);
        }
        else {
            EventManager.instance._subscriptions.get(code).push(handler);
        }
    }

    public static removeSubscription(code: string, handler: IEventHandler): void {
        if (!EventManager.instance._subscriptions.has(code)) {
            Logger.warn(`Cannot unsubscribe from code: ${code}.`);
            return;
        }
        const idx = EventManager.instance._subscriptions.get(code).indexOf(handler);
        if (idx !== -1) {
            EventManager.instance._subscriptions.get(code).splice(idx, 1);
        }
    }

    public static post(code: string, sender: any, context?: any): void;
    public static post(event: Event): void;
    public static post(event: Event | string, sender?: any, context?: any): void {
        if (!(event instanceof Event)) {
            event = new Event(event, sender, context, EventPriority.NORMAL);
        }
        Logger.info('Event posted:', event);
        if (!EventManager.instance._subscriptions.has(event.code)) {
            return;
        }
        const handlers = EventManager.instance._subscriptions.get(event.code);
        for (let h of handlers) {
            if (event.priority === EventPriority.HIGH) {
                h.onEvent(event);
            }
            else {
                EventManager.instance._normalEventsQueue.push(new EventSubscriptionNode(event, h));
            }
        }
    }

    public static update(step: TimeStep): void {
        const length = EventManager.instance._normalEventsQueue.length;
        if (length === 0) return;

        const limit = Math.min(EventManager._normalQueueEventsPerUpdate, length);

        for (let i = 0; i < limit; ++i) {
            const node = <EventSubscriptionNode>(EventManager.instance._normalEventsQueue.pop());
            node.handler.onEvent(node.event);
        }
    }

    /*
        Private
    */
    private static _instance: EventManager;
    private static _normalQueueEventsPerUpdate: number = 10;
    private _normalEventsQueue: EventSubscriptionNode[] = [];
    private _subscriptions: std.HashMap<string, IEventHandler[]> = new std.HashMap<string, IEventHandler[]>();

    private constructor() {
    }

    private static get instance(): EventManager {
        if (!EventManager._instance) {
            throw new Error('EventManager not instanciated');
        }
        return EventManager._instance;
    }

}