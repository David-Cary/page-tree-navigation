import { type AnyObject } from '../value-types';
import { type ValueVertexFactory } from '../vertices/vertex-factory';
import { type TraversalRoute } from './routes';
/**
 * Tracks the state data of an ongoing or completed traversal.
 * @interface
 * @property {TraversalRoute} route - pathing from the original object to the current value
 * @property {AnyObject[]} visited - list of all objects visited; used to avoid circular references
 * @property {boolean} completed - used to trigger an immediate end to the traversal
 * @property {boolean} skipIteration - temporary signal that lets you avoid iterating over the current value's keys
 * @property {TraversalRoute[] | undefined} routeQueue - list of routes to be processed by the traversal
 */
export interface TraversalState {
    route: TraversalRoute;
    visited: AnyObject[];
    completed: boolean;
    skipIteration?: boolean;
    routeQueue?: TraversalRoute[];
}
/**
 * Instaties a traversal state starting at a particular object.
 * @function
 * @param {AnyObject>} root - object the traversal initially targets
 * @returns {TraversalRoute}
 */
export declare function createRootState(root: AnyObject): TraversalState;
/**
 * Specifies how a connected set of values should be traversed.
 * @interface
 */
export interface TraversalStrategy {
    /**
     * Tries to visit all directly and indirectly connected values from a given starting object.
     * @function
     * @param {AnyObject} root - start point for the traversal
     * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
     * @param {ValueVertexFactory} converter - specifies how the traversal should generate vertices
     * @returns {TraversalState} results of the traversal
     */
    traverse: (root: AnyObject, callback?: (state: TraversalState) => void, converter?: ValueVertexFactory) => TraversalState;
    /**
     * Continues processing an already initialized traversal attempt.
     * @function
     * @param {TraversalState} state - traversal state to be processed
     * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
     * @param {ValueVertexFactory} converter - specifies how the traversal should generate vertices
     * @returns {TraversalState} results of the traversal
     */
    extendTraversal: (state: TraversalState, callback?: (state: TraversalState) => void, converter?: ValueVertexFactory) => void;
}
