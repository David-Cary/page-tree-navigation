import { type TraversalRoute, type ValidKey, type CommonKey } from 'key-crawler';
/**
 * Provides information used by an html hyperlink.
 * @interface
 * @property {string} text - text to be shown to the user
 * @property {string} href - hyperlink reference to be followed
 * @property {string} target - window the link should be opened in
 */
export interface HyperlinkSummary {
    text: string;
    href: string;
    target?: string;
}
/**
 * Provides conversion to and from a string and another data type.
 * @template T
 * @interface
 */
export interface ReversibleTextParser<T = any> {
    /**
     * Extracts the encoded data from a supplied string.
     * @function
     * @param {string} source - string to be parsed
     * @returns {T}
     */
    parse: (source: string) => T;
    /**
     * Encodes the provided data to a string.
     * @function
     * @param {T} source - data to be encoded
     * @returns {string}
     */
    stringify: (source: T) => string;
}
/**
 * Used to generate hyperlink summaries from a route.
 * @class
 * @property {(TraversalRoute) => string} getText - extracts display text from route
 * @property {(TraversalRoute) => string} getHref - extracts hyperlink reference from route
 * @property {string| undefined} linkTarget - window name to be attached to links
 */
export declare class RouteLinkFactory {
    readonly getText: (route: TraversalRoute) => string;
    readonly getHref: (route: TraversalRoute) => string;
    linkTarget?: string;
    constructor(getText: (route: TraversalRoute) => string, getHref: (route: TraversalRoute) => string, linkTarget?: string);
    /**
     * Generates a HyperlinkSummary from the provided route.
     * @function
     * @param {TraversalRoute} route - route used to generate the link
     * @returns {HyperlinkSummary}
     */
    getRouteLink(route: TraversalRoute): HyperlinkSummary;
}
/**
 * RouteLinkFactory that will use the page title for the text or generate a title from the page's index if such a title does not exist.
 * @class
 * @extends RouteLinkFactory
 * @property {(number) => string} getIndexedTitle - callback to specify how titles based on page index are created
 */
export declare class PageLinkFactory extends RouteLinkFactory {
    readonly getIndexedTitle?: (index: number) => string;
    constructor(getHref: (route: TraversalRoute) => string, getIndexedTitle?: (index: number) => string, linkTarget?: string);
}
/**
 * Handles splitting and joining text with a designated delimiter character.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {string} delimiter - character used to mark substring breakpoints
 */
export declare class DelimitedPathParser implements ReversibleTextParser<string[]> {
    readonly delimiter: string;
    constructor(delimiter?: string);
    parse(source: string): string[];
    stringify(source: string[]): string;
}
/**
 * Handles splitting and joining text where delimiters act as stand-ins for specific properties.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {Record<string, string>} delimiters - maps each delimiter character to it's associated property
 */
export declare class DelimiterEncodedPathParser implements ReversibleTextParser<string[]> {
    delimiters: Record<string, string>;
    constructor(delimiters: Record<string, string>);
    parse(source: string): string[];
    stringify(source: string[]): string;
}
/**
 * Handles wrapping text between prefix and suffix text, as well as extracting text so wrapped.
 * @class
 * @implements ReversibleTextParser<string>
 * @property {string} prefix - text added before the target text
 * @property {string} suffix - text added after the target text
 */
export declare class EnclosedTextParser implements ReversibleTextParser<string> {
    prefix: string;
    suffix: string;
    constructor(prefix?: string, suffix?: string);
    parse(source: string): string;
    stringify(text: string): string;
}
/**
 * Tries to convert any number that's been strigified back to a number.
 * @class
 * @implements ReversibleTextParser<CommonKey>
 */
export declare class NumericTextParser implements ReversibleTextParser<CommonKey> {
    parse(source: string): CommonKey;
    stringify(source: CommonKey): string;
}
/**
 * Converts any valid key values to and from a string.
 * @class
 * @implements ReversibleTextParser<string>
 * @property {string} symbolPrefix - marker used to signify the target key string refers to a symbol
 */
export declare class ValidKeyParser implements ReversibleTextParser<ValidKey> {
    symbolPrefix: string;
    constructor(symbolPrefix?: string);
    parse(source: string): ValidKey;
    stringify(source: ValidKey): string;
}
/**
 * A utility class for handling complex conversions from date to string and back again.
 * @class
 * @implements ReversibleTextParser<Array<T | string>>
 * @property {ReversibleTextParser<string> | undefined} stringParser - Performs top-level processing on the data while it's still a single string
 * @property {ReversibleTextParser<string[]>} splitter - Handles breaking the string into substrings and reversing said process
 * @property {ReversibleTextParser<string> | undefined} stepParser - Converts substrings into the target data types
 */
export declare class PhasedPathParser<T = any> implements ReversibleTextParser<Array<T | string>> {
    readonly stringParser?: ReversibleTextParser<string>;
    readonly splitter: ReversibleTextParser<string[]>;
    readonly stepParser?: ReversibleTextParser<(T | string)>;
    constructor(stringParser?: ReversibleTextParser<string>, splitter?: ReversibleTextParser<string[]>, stepParser?: ReversibleTextParser<(T | string)>);
    parse(source: string): Array<T | string>;
    stringify(source: Array<T | string>): string;
}
/**
 * Handles splitting named segments using a particular delimiter.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {string} delimiter - character used to mark substring breakpoints
 */
export declare class KeyedSegmentsParser implements ReversibleTextParser<Record<string, string>> {
    readonly delimiter: string;
    keys: string[];
    constructor(keys?: string[], delimiter?: string);
    parse(source: string): Record<string, string>;
    stringify(source: Record<string, string>): string;
}
/**
 * Wraps a key in an object for easy identification.
 * @interface
 * @property {string} key - key being stored
 */
export interface KeyWrapper {
    key: string;
}
/**
 * Enables attaching an optional placeholder value to the key reference when there's no key value.
 * @interface
 * @extends KeyWrapper
 * @property {string | undefined} placeholder - value to be used in place of an empty string
 */
export interface PathTemplateToken extends KeyWrapper {
    placeholder?: string;
}
/**
 * Outlines how to create a url where certain parts may be replaced by specific key values.
 * @interface
 * @property {string} origin - base url to be used
 * @property {Array<PathTemplateToken | string>} path - text or token to use creating the url's path after the origin
 * @property {KeyWrapper | string | undefined} hash - text to show after the hash mark ('#')
 * @property {Record<string, KeyWrapper | string> | undefined} search - search query parameters to be attached to the url
 */
export interface KeyedURLTemplate {
    origin: string;
    path: Array<PathTemplateToken | string>;
    hash?: KeyWrapper | string;
    search?: Record<string, KeyWrapper | string>;
}
/**
 * Handles creating hypertext reference from given parameters and extracting said parameters from such a reference.
 * @class
 * @implements ReversibleTextParser<Record<string, string>>
 * @property {KeyedURLTemplate} template - details on where the parameters are used within a url
 * @property {string} basePath - base url to use if the provided url has no origin
 */
export declare class KeyedURLValuesParser implements ReversibleTextParser<Record<string, string>> {
    template: KeyedURLTemplate;
    basePath: string;
    constructor(template?: KeyedURLTemplate, basePath?: string);
    parse(source: string): Record<string, string>;
    stringify(source: Record<string, string>): string;
}
