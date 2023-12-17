import { type ValidKey, type CommonKey, type TraversalRoute, type AnyObject } from 'key-crawler';
import { type ReversibleTextParser } from '../data/links';
import { SearchPathResolver, PropertySearchFactory, type KeyValuePair } from '../data/search';
export declare class PageTreeSearchResolver extends SearchPathResolver {
    readonly ruleFactory: PropertySearchFactory;
    constructor();
}
export interface NamedPageRouteParameters {
    pageId?: string;
    pagePath?: CommonKey[];
    contentPath?: ValidKey[];
}
export declare class NamedPageRouteParser implements ReversibleTextParser<TraversalRoute> {
    paramParser: ReversibleTextParser<Record<string, string>>;
    pathParser: ReversibleTextParser<CommonKey[]>;
    contentParser: ReversibleTextParser<ValidKey[]>;
    searchResolver: PageTreeSearchResolver;
    context: AnyObject;
    constructor(paramParser: ReversibleTextParser<Record<string, string>>, contentParser?: ReversibleTextParser<ValidKey[]>, pathParser?: ReversibleTextParser<CommonKey[]>, context?: AnyObject);
    parse(source: string): TraversalRoute;
    stringify(source: TraversalRoute): string;
    getRouteStrings(route: TraversalRoute): Record<string, string>;
    parseRouteStrings(strings: Record<string, string>): NamedPageRouteParameters;
    getRouteParameters(route: TraversalRoute): NamedPageRouteParameters;
    getSearchPath(params: NamedPageRouteParameters): Array<KeyValuePair | ValidKey>;
}
