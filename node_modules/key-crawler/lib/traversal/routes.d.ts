import { type ValidKey, type AnyObject } from '../value-types';
import { type KeyValueVertex } from '../vertices/value-vertices';
/**
 * Tracks the vertices passed through to reach a particular value.
 * @interface
 * @property {ValidKey[]} path - list of keys used for each transition
 * @property {unknown} target - final value reached by the traversal
 * @property {KeyValueVertex[]} vertices - list of verices we passed through to reach the final value
 */
export interface TraversalRoute {
    path: ValidKey[];
    target: unknown;
    vertices: KeyValueVertex[];
}
/**
 * Instaties a traversal route starting at a particular object.
 * @function
 * @param {AnyObject>} root - object the route initially targets
 * @returns {TraversalRoute}
 */
export declare function createRootRoute(root: AnyObject): TraversalRoute;
/**
 * Makes a semi-shallow copy of the provided route with it's own arrays but refering to the same objects as the original.
 * @function
 * @param {TraversalRoute>} source - route to be copied
 * @returns {TraversalRoute}
 */
export declare function cloneRoute(source: TraversalRoute): TraversalRoute;
/**
 * Retrieves all values visited along the course of a traversal route.
 * @function
 * @param {TraversalRoute} source - route to be evaluated
 * @returns {TraversalRoute}
 */
export declare function getRouteValues(source: TraversalRoute): unknown[];
