import { type AnyObject } from '../value-types';
import { ValueVertexFactory } from '../vertices/vertex-factory';
import { type TraversalState, type TraversalStrategy } from './strategy';
/**
 * Performs a breadth first search on the target graph.  This means processing all values a certain number of steps from the root before moving out to the next layer.
 * @class
 * @implements {TraversalStrategy}
 */
export declare class BreadthFirstSearch implements TraversalStrategy {
    traverse(root: AnyObject, callback?: (state: TraversalState) => void, converter?: ValueVertexFactory): TraversalState;
    extendTraversal(state: TraversalState, callback?: (state: TraversalState) => void, converter?: ValueVertexFactory): void;
}
