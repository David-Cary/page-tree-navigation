import { type AnyObject } from '../value-types';
import { ValueVertexFactory } from '../vertices/vertex-factory';
import { type TraversalState, type TraversalStrategy } from './strategy';
/**
 * Types of search order execution.  Primarily used by depth first searches.
 * @enum {string}
 */
export declare enum SearchOrder {
    PREORDER = "preorder",
    POSTORDER = "postorder"
}
/**
 * Performs a depth first search on the target graph.  This means recursively processing descendants before moving on their parent's siblings.
 * @class
 * @implements {TraversalStrategy}
 * @property {SearchOrder} order - signals what search order should be used by the traversal
 */
export declare class DepthFirstSearch implements TraversalStrategy {
    order: SearchOrder;
    constructor(order?: SearchOrder);
    traverse(root: AnyObject, callback?: (state: TraversalState) => void, converter?: ValueVertexFactory): TraversalState;
    extendTraversal(state: TraversalState, callback?: (state: TraversalState) => void, converter?: ValueVertexFactory): void;
    startPhasedTraversal(root: AnyObject, preIterate?: (state: TraversalState) => void, postIterate?: (state: TraversalState) => void, converter?: ValueVertexFactory): TraversalState;
    extendPhasedTraversal(state: TraversalState, preIterate?: (state: TraversalState) => void, postIterate?: (state: TraversalState) => void, converter?: ValueVertexFactory): void;
}
