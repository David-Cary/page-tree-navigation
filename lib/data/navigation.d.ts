import { type KeyCrawler, type TraversalRoute, type AnyObject } from 'key-crawler';
export declare class LinearTreeNavigator {
    readonly crawler: KeyCrawler;
    constructor(crawler: KeyCrawler);
    getFirstNodeRoute(source: AnyObject): TraversalRoute;
    getLastNodeRoute(source: AnyObject): TraversalRoute;
    goToNextNode(route: TraversalRoute): void;
    getNextNodeRoute(route: TraversalRoute): TraversalRoute;
    goToPreviousNode(route: TraversalRoute): void;
    getPreviousNodeRoute(route: TraversalRoute): TraversalRoute;
    goToLastDescendant(route: TraversalRoute): void;
}
