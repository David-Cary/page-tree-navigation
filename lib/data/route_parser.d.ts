import { type ValidKey, type CommonKey, type TraversalRoute, type AnyObject } from 'key-crawler';
import { type ReversibleTextParser } from '../data/links';
import { SearchPathResolver, PropertySearchFactory, type KeyValuePair } from '../data/search';
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
 * Breaks routes to nested pages and their content into distinct parts.
 * @interface
 * @property {string | undefined} pageId - unique page identifier
 * @property {CommonKey[] | undefined} pagePath - remaining path steps after the identifier
 * @property {ValidKey[] | undefined} contentPath - path to nested content element of the target page
 */
export interface NamedPageRouteParameters {
    pageId?: string;
    pagePath?: CommonKey[];
    contentPath?: ValidKey[];
}
/**
 * Generates name and id based path strings for page content routes.  This also supports reconstructing a route from such a string.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {ReversibleTextParser<CommonKey[]>} pathParser - breaks the pagePath string into it's component keys
 * @property {ReversibleTextParser<ValidKey[]>} contentParser - converts the contentPath string to a key array
 * @property {new PageTreeSearchResolver()} searchResolver - resolves the resulting search path to a route
 * @property {AnyObject} context - root object routes should be generated from
 */
export declare class NamedPageRouteParser implements ReversibleTextParser<TraversalRoute> {
    paramParser: ReversibleTextParser<Record<string, string>>;
    pathParser: ReversibleTextParser<CommonKey[]>;
    contentParser: ReversibleTextParser<ValidKey[]>;
    searchResolver: PageTreeSearchResolver;
    context: AnyObject;
    constructor(paramParser: ReversibleTextParser<Record<string, string>>, contentParser?: ReversibleTextParser<ValidKey[]>, pathParser?: ReversibleTextParser<CommonKey[]>, context?: AnyObject);
    parse(source: string): TraversalRoute;
    stringify(source: TraversalRoute): string;
    /**
     * Extracts pathing parameter strings from the provided route
     * @function
     * @param {TraversalRoute} route - route used to generate the strings
     * @returns {Record<string, string>}
     */
    getRouteStrings(route: TraversalRoute): Record<string, string>;
    /**
     * Converts parameter strings to path arrays.
     * @function
     * @param {Record<string, string>} strings - string map to be evaluated
     * @returns {NamedPageRouteParameters}
     */
    parseRouteStrings(strings: Record<string, string>): NamedPageRouteParameters;
    /**
     * Extracts pathing parameters from the provided route
     * @function
     * @param {TraversalRoute} route - route used to generate the strings
     * @returns {NamedPageRouteParameters}
     */
    getRouteParameters(route: TraversalRoute): NamedPageRouteParameters;
    /**
     * Extracts a search path from the provided route parameters.
     * @function
     * @param {NamedPageRouteParameters} params - parameters to be evaluated
     * @returns {Array<KeyValuePair | ValidKey>}
     */
    getSearchPath(params: NamedPageRouteParameters): Array<KeyValuePair | ValidKey>;
}
