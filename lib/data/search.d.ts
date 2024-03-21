import { type TraversalState, type AnyObject, type ValidKey, type SearchResponse, type ValueVertexFactory, DepthFirstSearch } from 'key-crawler';
/**
 * Utility type for referencing a plain old javascript object.
 * @type
 */
export type ValueMap = Record<string, any>;
/**
 * Callback to executed for a given search term at a particular point in a search traversal.
 * @type
 * @param {TraversalState} state - current traversal state
 * @param {ValueMap | ValidKey} term - search term to be used
 * @param {(state: TraversalState) => void} visit - callback to be executed on each descendant that matches the search
 * @returns {boolean} true if the callback knows how the handle the provided term
 */
export type SearchTermCallback = (state: TraversalState, term: ValueMap | ValidKey, visit: (state: TraversalState) => void) => boolean;
/**
 * Tries to find the route to a matching tree node given a series of search terms where each step referes to a descendant of the previous term's match.
 * @class
 * @property {SearchTermCallback[]} termRules - list of callbacks used to resolve each term in the path
 */
export declare class SearchPathResolver {
    termRules: SearchTermCallback[];
    constructor(termRules?: SearchTermCallback[]);
    /**
     * Tries to retrieve the nodes matching the provided search path.
     * @function
     * @param {AnyObject} context - collection to perform the search on
     * @param {Array<ValueMap | ValidKey>} path - series of search terms to be applied
     * @param {number} maxResults - stop once we get this many matches
     * @returns {SearchResponse}
     */
    resolve(context: AnyObject, path: Array<ValueMap | ValidKey>, maxResults?: number): SearchResponse;
    /**
     * Helper function used to resolve the remaining steps in a search path.
     * @function
     * @param {AnyObject} context - collection to perform the search on
     * @param {Array<ValueMap | ValidKey>} steps - remaining search terms to be processed
     * @param {number} maxResults - stop once we get this many matches
     */
    extendSearch(search: SearchResponse, steps: Array<ValueMap | ValidKey>, maxResults?: number): void;
}
/**
 * Callback for converting a search term to a state matching callback.
 * @type
 * @param {ValueMap | ValidKey} term - search term to be used
 * @returns {((state: TraversalState) => boolean) | undefined}
 */
export type SearchCheckCallback = (term: ValueMap | ValidKey) => ((state: TraversalState) => boolean) | undefined;
/**
 * Generates a particular type of SearchTermCallback.
 * @class
 * @property {ValueVertexFactory} vertexFactory - provides value vertices to traversal functions
 * @property {DepthFirstSearch} depthFirstSearch - provides basic traversal functionality
 */
export declare class SearchTermCallbackFactory {
    vertexFactory: ValueVertexFactory;
    readonly depthFirstSearch: DepthFirstSearch;
    constructor(vertexFactory: ValueVertexFactory);
    /**
     * Generates callbacks that traverse the current node's descendants and relay matches for each node that fits it's check function's criteria.
     * @function
     * @param {SearchCheckCallback} getCheck - generates a state evaluation callback if the term meets it's criteria
     * @param {boolean} shallow - if set to true the traversal will not extend to descendants of a matching node
     * @returns {SearchTermCallback}
     */
    getSearchCallback(getCheck: SearchCheckCallback, shallow?: boolean): SearchTermCallback;
    /**
     * Generates a callback that treats the provided search term as a traversal key, as per resolveKey.
     * @function
     * @returns {SearchTermCallback}
     */
    getKeyCallback(): SearchTermCallback;
    /**
     * Treats the provided search term as a traversal key, meaning it only gets checked against the current node's children.
     * @function
     * @param {TraversalState} state - current traversal state
     * @param {ValueMap | ValidKey} term - search term to be used
     * @param {(state: TraversalState) => void} visit - callback to be executed on the matching child
     * @returns {boolean} true if term is a valid key
     */
    resolveKey(state: TraversalState, term: ValueMap | ValidKey, visit: (state: TraversalState) => void): boolean;
    /**
     * Generates a callback for treating the term as an array property's index.
     * @function
     * @param {string[]} properties - properties to be checked for an array
     * @returns {SearchTermCallback}
     */
    getPropertyItemAtCallback(properties: string[]): SearchTermCallback;
    /**
     * Visits the indexed item of the first named array property found.
     * @function
     * @param {string[]} properties - properties to be checked for an array
     * @param {TraversalState} state - current traversal state
     * @param {ValueMap | ValidKey} term - search term to be used
     * @param {(state: TraversalState) => void} visit - callback to be executed on the matching child
     * @returns {boolean} true if the rule applies
     */
    resolvePropertyItemAt(properties: string[], state: TraversalState, term: ValueMap | ValidKey, visit: (state: TraversalState) => void): boolean;
}
/**
 * Links a particular key to a given value.
 * @interface
 * @property {string} key - key used to reference the target value
 * @property {any} value - value associated with the provided key
 */
export interface KeyValuePair {
    key: string;
    value: any;
}
/**
 * Generates callbacks that search for nodes with a specified property value.
 * @class
 * @extends SearchTermCallbackFactory
 */
export declare class PropertySearchFactory extends SearchTermCallbackFactory {
    /**
     * Generates a property check callback so long as the provided term is a valid key value pair.
     * @function
     * @param {ValueMap | ValidKey} term - search term to be used
     * @returns {((state: TraversalState) => boolean) | undefined}
     */
    getPropertyCheckFor(term: AnyObject | ValidKey): ((state: TraversalState) => boolean) | undefined;
    /**
     * Generates a search callback that relays a match for each node with the given property value.
     * @function
     * @param {boolean} shallow - if set to true the traversal will not extend to descendants of a matching node
     * @returns {SearchTermCallback}
     */
    getPropertySearch(shallow?: boolean): SearchTermCallback;
}
