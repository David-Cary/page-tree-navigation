import { type ValidKey, type AnyObject } from '../value-types';
import { type KeyValueVertex } from './value-vertices';
/**
 * This interface describes calls to a named function.
 * @interface
 * @property {string} name - property name of the function to be executed
 * @property {unknown[]} args - arguments to be used when the function is executed
 */
export interface PropertyCallRequest {
    name: string;
    args: unknown[];
}
/**
 * Performs a call to a function of a given object.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
export declare function executePropertyCall(context: AnyObject, request: PropertyCallRequest): unknown;
export type PropertyLookupStep = ValidKey | PropertyCallRequest;
/**
 * Tries to get a certain property value or call an appropriate accessor to get such a value.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
export declare function resolvePropertyRequest(source: AnyObject, request: PropertyLookupStep): unknown;
/**
 * Tries to get nested property value by iterating over property references.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} steps - list of steps to be performed as we iterate into the object's contents
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
export declare function resolvePropertyLookup(source: AnyObject, steps: PropertyLookupStep[]): unknown;
export type CreateIteratorCallback<T = unknown, K = ValidKey> = (value: T) => IterableIterator<K>;
/**
 * This pairs an extracted property path with an associated key.
 * @interface
 * @property {ValidKey} key - key associated with the target path
 * @property {PropertyLookupStep[]} path - property path to the target value
 */
export interface KeyedPathResult {
    key: ValidKey;
    path: PropertyLookupStep[];
}
/**
 * These vertices handle objects where key values are found by iterating into a nested property.
 * A good example would tree node style objects where each branch is stored in the object's 'children' property.
 * @class
 * @implements {KeyValueVertex}
 * @property {PropertyLookupStep[]} pathTemplate - use to create value paths by replacing key references
 * @property {string} keyAlias - value to be considered a key reference when parsing the path template
 * @property {IterableIterator<ValidKey>} createKeyIterator - generates iterable iterators for the target value's keys
 */
export declare class ValueLookupVertex<T = AnyObject, K extends ValidKey = ValidKey, V = unknown> implements KeyValueVertex {
    readonly value: T;
    readonly pathTemplate: PropertyLookupStep[];
    readonly keyAlias: string;
    readonly createKeyIterator: () => IterableIterator<ValidKey>;
    get keyProvider(): IterableIterator<ValidKey>;
    constructor(value: T, path: PropertyLookupStep[], alias?: string, callback?: CreateIteratorCallback<T, K>);
    /**
     * This tries create an key generator for the target value using the given path.
     * It works best when the key reference in the path is it's own step.
     * When the key is callback argument if ends up making a best guess by iterating
     * up from 0 until it runs into an undefined values
     * @function
     * @returns {IterableIterator<ValidKey>} iterator for all valid keys
     */
    createDefaultKeyIterator(): IterableIterator<ValidKey>;
    getIndexedKey(index: number): ValidKey | undefined;
    getKeyValue(key: ValidKey): V | undefined;
    getKeyIndex(key: ValidKey): number | undefined;
    /**
     * Uses the path template to generate the expected value path for a given key.
     * @function
     * @param {ValidKey} key - key to be found
     * @returns {PropertyLookupStep[]} lookup path to the target value
     */
    getValuePath(key: ValidKey): PropertyLookupStep[];
    /**
     * Checks if the property path matches our template at a given position.
     * @function
     * @param {PropertyLookupStep} source - path to be evaluated
     * @param {number} startPosition - index within the path to start our evaluation
     * @returns {KeyedPathResult | undefined} the matching path and it's key if a match is found
     */
    validateValuePath(source: PropertyLookupStep[], startPosition?: number): KeyedPathResult | undefined;
}
/**
 * Converts a vertex key path to a full property lookup path.
 * @function
 * @param {KeyValueVertex} vertices - vertices used to generate the key path
 * @param {ValidKey[]} keys - key path to be evaluated
 * @returns {PropertyLookupStep[] | undefined} the resulting property path if no errors are encountered
 */
export declare function expandNestedValuePath(vertices: KeyValueVertex[], keys: ValidKey[]): PropertyLookupStep[] | undefined;
/**
 * Tries to determine the keys used to generate a full property lookup path.
 * @function
 * @param {KeyValueVertex} vertices - vertices used to generate the key path
 * @param {PropertyLookupStep[]} path - property path to be evaluated
 * @returns {ValidKey[] | undefined} expected keys if no errors were encountered
 */
export declare function collapseNestedValuePath(vertices: KeyValueVertex[], path: PropertyLookupStep[]): ValidKey[] | undefined;
/**
 * Provides key value handling for javascript Maps.
 * @class
 * @implements {ValueLookupVertex<Map<K, V>, K, V>}
 */
export declare class MapVertex<K extends ValidKey = ValidKey, V = unknown> extends ValueLookupVertex<Map<K, V>, K, V> {
    constructor(value: Map<K, V>);
    getKeyValue(key: ValidKey): V | undefined;
}
/**
 * Provides key value handling for Document Object Model nodes.
 * @class
 * @implements {ValueLookupVertex<Node, number, Node>}
 */
export declare class DOMNodeVertex extends ValueLookupVertex<Node, number, Node> {
    constructor(value: Node);
    getKeyValue(key: ValidKey): Node | undefined;
}
