import { type KeyCrawler, type TraversalRoute, type AnyObject } from 'key-crawler';
/**
 * Supports navigating to next / previous nodes in a tree as though it were a flattened depth first search.
 * @class
 * @property {KeyCrawler} crawler - key crawler that handles vertex creation
 */
export declare class LinearTreeNavigator {
    readonly crawler: KeyCrawler;
    constructor(crawler: KeyCrawler);
    /**
     * Retrieves the first child in the target collection.
     * @function
     * @param {AnyObject} source - collection to be evaluated
     * @returns {TraversalRoute}
     */
    getFirstNodeRoute(source: AnyObject): TraversalRoute;
    /**
     * Retrieves the last node visited in a preorder depth first traversal of the target collection.
     * @function
     * @param {AnyObject} source - collection to be evaluated
     * @returns {TraversalRoute}
     */
    getLastNodeRoute(source: AnyObject): TraversalRoute;
    /**
     * Advances to the next node visited in a preorder depth first traversal.
     * @function
     * @param {AnyObject} source - collection to be evaluated
     */
    goToNextNode(route: TraversalRoute): void;
    /**
     * Retrieves the route to the next node visited in a preorder depth first traversal.
     * @function
     * @param {AnyObject} source - collection to be evaluated
     * @returns {TraversalRoute}
     */
    getNextNodeRoute(route: TraversalRoute): TraversalRoute;
    /**
     * Reverts to the previous node visited in a preorder depth first traversal.
     * @function
     * @param {AnyObject} source - collection to be evaluated
     */
    goToPreviousNode(route: TraversalRoute): void;
    /**
     * Retrieves the route to the previous node visited in a preorder depth first traversal.
     * @function
     * @param {AnyObject} source - collection to be evaluated
     * @returns {TraversalRoute}
     */
    getPreviousNodeRoute(route: TraversalRoute): TraversalRoute;
    /**
     * Advances to the last node to be visited within the current node in a preorder depth first traversal.
     * @function
     * @param {AnyObject} source - collection to be evaluated
     */
    goToLastDescendant(route: TraversalRoute): void;
}
