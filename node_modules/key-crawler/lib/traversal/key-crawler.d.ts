import { type ValidKey, type AnyObject } from '../value-types';
import { ValueVertexFactory } from '../vertices/vertex-factory';
import { type TraversalRoute } from './routes';
import { type TraversalState, type TraversalStrategy } from './strategy';
/**
 * Contains all matching routes found during a given traversal.
 * @interface
 * @property {TraversalState} state - ending state of the target traversal
 * @property {TraversalRoute[]} results - all matching routes found the target traversal
 */
export interface SearchResponse {
    state: TraversalState;
    results: TraversalRoute[];
}
/**
 * Used for functions that assign object property values.
 * @type
 * @function
 * @param {AnyObject} target - object to be modified
 * @param {ValidKey} key - property name/index to be used
 * @param {any} value - value to be assigned
 */
export type SetChildCallback = (parent: AnyObject, key: ValidKey, child: any) => void;
/**
 * Utility object for performing graph traversals with a particular set of settings, as well as transformations on the resulting routes.
 * @class
 * @property {TraversalStrategy} traversalStrategy - specifies what approach should be taken to traversal calls
 * @property {ValueVertexFactory} vertexFactory - provides new vertices as needed during traversal and route extension
 */
export declare class KeyCrawler {
    traversalStrategy: TraversalStrategy;
    vertexFactory: ValueVertexFactory;
    /**
     * @param {TraversalStrategy} strategy - strategy to be used for traversal
     * @param {ValueVertexFactory} converter - lets you specify how vertices are created during traversal
     */
    constructor(strategy?: TraversalStrategy, converter?: ValueVertexFactory);
    /**
     * Invokes the instances traversal strategy to visit all connected value of the selected target,
     * @function
     * @param {AnyObject} root - start point for the traversal
     * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
     * @returns {TraversalState} results of the traversal
     */
    traverse(root: AnyObject, callback: (state: TraversalState) => void): TraversalState;
    /**
     * Tries to find all matching connected values from a target starting point.
     * @function
     * @param {AnyObject} root - start point for the search
     * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
     * @param {number} maxResults - optional limit on the number of search results before traversal is terminated
     * @returns {SearchResponse} matched value routes and final traversal state
     */
    search(root: AnyObject, callback: (state: TraversalState) => boolean, maxResults?: number): SearchResponse;
    /**
     * Converts the provided value and it's children to the target format.
     * @function
     * @param {any} source - value to be converted
     * @param {(state: TraversalState) => any} getValueFor - conversion to be applied for each value visited
     * @param {addChild} SetChildCallback - callback for linking resulting child to it's parent
     * @returns {any} converted value
     */
    mapValue(source: any, getValueFor: (state: TraversalState) => any, addChild?: SetChildCallback): any;
    /**
     * Provides default setter for javascipt objects and arrays.
     * @function
     * @param {AnyObject} target - object to be modified
     * @param {ValidKey} key - property name/index to be used
     * @param {any} value - value to be assigned
     */
    setChildValue(target: AnyObject, key: ValidKey, value: any): void;
    /**
     * Populates a traversal route from a given point along a provided path.
     * @function
     * @param {AnyObject} root - object the traversal initially targets
     * @param {ValidKey[]} path - keys to use for each step of the traversal
     * @returns {TraversalRoute}
     */
    createRouteFrom(root: AnyObject, path: ValidKey[]): TraversalRoute;
    /**
     * Tries to navigate futher along a traversal route given additional steps.
     * @function
     * @param {TraversalRoute} route - route to be modified
     * @param {ValidKey} steps - additional keys to be used to further the route
     * @returns {void}
     */
    extendRoute(route: TraversalRoute, steps: ValidKey[]): void;
    /**
     * Tries to navigate futher along a traversal route using the connections at a given key index.
     * @function
     * @param {TraversalRoute} route - route to be modified
     * @param {ValidKey} indices - zero-based positions of the keys to be used in each step of the traversal
     * @returns {void}
     */
    extendRouteByIndices(route: TraversalRoute, indices: number[]): void;
    /**
     * Tries rolling a traversal route back a certain number of steps.
     * @function
     * @param {TraversalRoute} route - route to be modified
     * @param {number} numSteps - how many traversal steps should be undone
     * @returns {void}
     */
    revertRoute(route: TraversalRoute, numSteps?: number): void;
    /**
     * Tries to create a child route based on the original with additional certain steps.
     * @function
     * @param {TraversalRoute} route - route to be copied
     * @param {ValidKey} steps - additional keys to be used to further the route
     * @returns {TraversalRoute} resulting newly created route
     */
    getSubroute(route: TraversalRoute, steps: ValidKey[]): TraversalRoute;
    /**
     * Tries to find the next connected value for a route given the key index of it's next value.
     * This is usually used when navigating trees to get the first or last branch of a node.
     * @function
     * @param {TraversalRoute} route - route to be copied
     * @param {number} index - zero-based position in key iteration of the target value
     * @returns {TraversalRoute} resulting newly created route
     */
    getChildRoute(route: TraversalRoute, index: number): TraversalRoute;
    /**
     * Retrieves the route for a previous value along the target route.
     * @function
     * @param {TraversalRoute} route - route to be copied
     * @param {number} numSteps - how many steps back we should go to get the target value
     * @returns {TraversalRoute} resulting newly created route
     */
    getParentRoute(route: TraversalRoute, numSteps?: number): TraversalRoute;
}
