import { type TraversalState, type AnyObject, type ValidKey, type SearchResponse, type ValueVertexFactory, DepthFirstSearch } from 'key-crawler';
export type ValueMap = Record<string, any>;
export type SearchTermCallback = (state: TraversalState, term: ValueMap | ValidKey, visit: (state: TraversalState) => void) => boolean;
export declare class SearchPathResolver {
    termRules: SearchTermCallback[];
    constructor(termRules?: SearchTermCallback[]);
    resolve(context: AnyObject, path: Array<ValueMap | ValidKey>, maxResults?: number): SearchResponse;
    extendSearch(search: SearchResponse, steps: Array<ValueMap | ValidKey>, maxResults?: number): void;
}
export type SearchCheckCallback = (term: ValueMap | ValidKey) => ((state: TraversalState) => boolean) | undefined;
export declare class SearchTermCallbackFactory {
    vertexFactory: ValueVertexFactory;
    readonly depthFirstSearch: DepthFirstSearch;
    constructor(vertexFactory: ValueVertexFactory);
    getSearchCallback(getCheck: SearchCheckCallback, shallow?: boolean): SearchTermCallback;
    getKeyCallback(): SearchTermCallback;
    resolveKey(state: TraversalState, term: ValueMap | ValidKey, visit: (state: TraversalState) => void): boolean;
}
export interface KeyValuePair {
    key: string;
    value: any;
}
export declare class PropertySearchFactory extends SearchTermCallbackFactory {
    getPropertyCheckFor(term: AnyObject | ValidKey): ((state: TraversalState) => boolean) | undefined;
    getPropertySearch(shallow?: boolean): SearchTermCallback;
}
