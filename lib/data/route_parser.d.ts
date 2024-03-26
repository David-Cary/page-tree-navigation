import { type ValidKey, type TraversalRoute, type AnyObject, type CommonKey } from 'key-crawler';
import { type ReversibleTextParser } from '../data/links';
import { SearchPathResolver, PropertySearchFactory, type ValueMap } from '../data/search';
/**
 * Supports searching by property or index within a content tree.
 * Note that this uses content node vertices by default, allowing searches for page content.
 * @class
 * @extends SearchPathResolver
 * @property {PropertySearchFactory} ruleFactory - generates the search term callbacks used by this resolver
 */
export declare class PageTreeSearchResolver extends SearchPathResolver {
    readonly ruleFactory: PropertySearchFactory;
    constructor();
}
/**
 * Describes how a term should be resolved based on the associated prefix.
 * @interface
 * @template T
 * @property {string} prefix - preceeding characters that mark any matching text
 * @property {string | undefined} decodedPrefix - search term to be placed before the converted text
 * @property {((source: T) => boolean) | undefined} check - returns true if the target term should be parsed
 * @property {ReversibleTextParser<T>} parser - handles converting the target term to a string and vice versa
 */
export interface PrefixedPathStepRule<T> {
    name?: string;
    prefix: string;
    decodedPrefix?: string;
    check?: (source: T) => boolean;
    parser?: ReversibleTextParser<T>;
}
/**
 * Converts a string to key value pair where the value is the provided string.
 * @class
 * @extends ReversibleTextParser<ValueMap | string>
 * @property {string} key - key to be used in each generated key value pair
 * @property {((value: string) => boolean) | undefined} validate - optional function to check the provided value, resulting in string instead of a key value pair if that check fails
 */
export declare class KeyedPropertySearchParser implements ReversibleTextParser<ValueMap | CommonKey> {
    key: string;
    validate?: (value: string) => boolean;
    constructor(key: string, validate?: (value: string) => boolean);
    parse(source: string): (ValueMap | CommonKey);
    stringify(source: (ValueMap | CommonKey)): string;
}
/**
 * Converts the provided search string to a series of search terms and vice versa.
 * @class
 * @extends ReversibleTextParser<Array<ValueMap | ValidKey>>
 * @property {ReversibleTextParser<ValueMap | string> | undefined} headParser - provides special handling to first section of the target path
 * @property {Array<PrefixedPathStepRule<ValueMap | string>>} rules - describes how to handle text segments based on the preceding delimiter
 */
export declare class SearchPathParser implements ReversibleTextParser<Array<ValueMap | ValidKey>> {
    readonly headParser?: ReversibleTextParser<ValueMap | CommonKey>;
    readonly rules: Array<PrefixedPathStepRule<ValueMap | CommonKey>>;
    constructor(rules?: Array<PrefixedPathStepRule<ValueMap | CommonKey>>, headParser?: ReversibleTextParser<ValueMap | CommonKey>);
    parse(source: string): Array<ValueMap | ValidKey>;
    parseVia(source: string, rule: PrefixedPathStepRule<ValueMap | CommonKey>): Array<ValueMap | ValidKey>;
    stringify(source: Array<ValueMap | ValidKey>): string;
}
/**
 * Callback for generating a search path that corresponds to the provided route.
 * @type
 * @param {TraversalRoute} route - traversal route to be evaluated
 * @returns {Array<ValueMap | ValidKey>}
 */
export type GetRouteSearchCallback = (route: TraversalRoute) => Array<ValueMap | ValidKey>;
/**
 * Resolves the provided search string to a traversal route and generates such strings from a route.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Array<ValueMap | ValidKey>>} pathParser - used to convert strings to search paths and vice versa
 * @property {SearchPathResolver} searchResolver - used to resolve a search path to a traversal route
 * @property {GetRouteSearchCallback} getSearch - generates a search path from a traversal route
 * @property {AnyObject} context - object the search should be performed on
 */
export declare class RouteSearchParser implements ReversibleTextParser<TraversalRoute> {
    pathParser: ReversibleTextParser<Array<ValueMap | ValidKey>>;
    searchResolver: SearchPathResolver;
    getSearch: GetRouteSearchCallback;
    context: AnyObject;
    constructor(pathParser: ReversibleTextParser<(ValidKey | ValueMap)[]> | undefined, searchResolver: SearchPathResolver | undefined, getSearch: GetRouteSearchCallback, context?: AnyObject);
    parse(source: string): TraversalRoute;
    stringify(source: TraversalRoute): string;
}
/**
 * Creates a unique search path to the content targeted to by a given traversal route.
 * @function
 * @param {TraversalRoute} route - traversal route to be evaluated
 * @returns {Array<ValueMap | ValidKey>}
 */
export declare function getNamedPageSearch(route: TraversalRoute): Array<ValueMap | ValidKey>;
/**
 * Provides default handling for searches with path id and local name markers.
 * @class
 * @extends SearchPathParser
 */
export declare class NamedPagePathParser extends SearchPathParser {
    constructor(expanded?: boolean);
}
/**
 * Handles pathing to page content, with the page path and the content subpath having their own parsers.
 * @class
 * @extends ReversibleTextParser<Array<ValueMap | ValidKey>>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {ReversibleTextParser<Array<ValueMap | ValidKey>>} pageParser - handles the page specific part of the path
 * @property {ReversibleTextParser<string[]>} contentParser - handles the subpath to the page's content
 */
export declare class PageContentPathParser implements ReversibleTextParser<Array<ValueMap | ValidKey>> {
    paramParser: ReversibleTextParser<Record<string, string>>;
    pageParser: ReversibleTextParser<Array<ValueMap | ValidKey>>;
    contentParser: ReversibleTextParser<string[]>;
    constructor(paramParser?: ReversibleTextParser<Record<string, string>>, pageParser?: ReversibleTextParser<Array<ValueMap | ValidKey>>, contentParser?: ReversibleTextParser<string[]>);
    parse(source: string): Array<ValueMap | ValidKey>;
    stringify(source: Array<ValueMap | ValidKey>): string;
    getSubpaths(source: Array<ValueMap | ValidKey>): Record<string, Array<ValueMap | ValidKey>>;
}
/**
 * Generates name and id based path strings for page content routes.  This also supports reconstructing a route from such a string.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {AnyObject} context - root object routes should be generated from
 */
export declare class NamedPageRouteParser extends RouteSearchParser {
    constructor(paramParser?: ReversibleTextParser<Record<string, string>>, context?: AnyObject);
}
