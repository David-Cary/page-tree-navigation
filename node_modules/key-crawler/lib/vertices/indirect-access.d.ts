import { type ValidKey, type AnyObject } from '../value-types';
import { type KeyValueVertex, ObjectVertex } from './value-vertices';
/**
 * This interface gives you an easy way to refer to making call to a named function with a predefined set of arguments.
 *
 * @interface
 * @property {string} name - property name of the function to be executed
 * @property {unknown[]} args - arguments to be used when the function is executed
 */
export interface PropertyCallRequest {
    name: string;
    args: unknown[];
}
export type PropertyAccessStep = ValidKey | PropertyCallRequest;
/**
 * This interface helps with cases where a given value for a key might require multiple steps or function calls to access.
 *
 * @template K
 * @interface
 * @property {K} key - key used to lookup the value
 * @property {PropertyAccessStep[]} expansion - terms to be evaluated to perform the lookup
 */
export interface IndirectAccessPathing<K = ValidKey> {
    key: K;
    expansion: PropertyAccessStep[];
}
/**
 * Tries to get a certain property value or call an appropriate accessor to get such a value.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyAccessStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
export declare function resolvePropertyRequest(source: AnyObject, request: PropertyAccessStep): unknown;
/**
 * Tries to retrive a nested value from an object given a particular key path.
 * @function
 * @param {AnyObject} root - top level object we're trying to get the value from
 * @param {ValidKey[]} path - keys to iterate over to reach the target value
 * @returns {unknown} retrieved value for the given path (may be undefined the path was invalid)
 */
export declare function getNestedProperty(root: AnyObject, path: PropertyAccessStep[]): unknown;
/**
 * This interface provides special helper functions for objects whose key values can't normally be access through dot notation.
 *
 * @template T, K, V
 * @interface
 * @extends KeyValueVertex<T, K, V>
 */
export interface IndirectAccessVertex<T = unknown, K extends ValidKey = ValidKey, V = unknown> extends KeyValueVertex<T, K, V> {
    /**
     * Retrieves the steps needed to get a particular key value from this vertex's source.
     * @function
     * @param {K} key - key used to lookup the target value
     * @returns {PropertyAccessStep[]} path data for performing this lookup on the source value
     */
    getPathFor: (key: K) => PropertyAccessStep[];
}
/**
 * Tries to expand a vertex key based path into the terms that could be used to navigate those vertices values directly.
 * @function
 * @param {ValidKey[]} path - key based path to be converted
 * @param {KeyValueVertex[]} vertices - list of matching vertices for each key value
 * @returns {ValidKey[]} extrapolated direct access path
 */
export declare function getDirectAccessPath(path: ValidKey[], vertices: KeyValueVertex[]): PropertyAccessStep[];
/**
 * Tries to get the vertex key based path given the path needed to access the target directly through those vertiices' sources.
 * This can be used to decode the path provided by 'getDirectAccessPath'.
 * @function
 * @param {ValidKey[]} path - direct path to the target value within the source context
 * @param {KeyValueVertex[]} vertices - list of matching vertices for the primary objects along the target path
 * @returns {K | undefined} extrapolated vertex key path
 */
/**
 * These vertices handle objects where key value lookup are performed on a specific nested property.
 * A good example would tree node style objects where each branch is stored in the object's 'children' property.
 * @class
 * @implements {IndirectAccessVertex<AnyObject, ValidKey, unknown>}
 * @property {ValueVertexFactory} vertexFactory - vertex factory to be used to handle pathing through any nested contents of this vertex
 */
export declare class ValueLookupVertex extends ObjectVertex implements IndirectAccessVertex<AnyObject, ValidKey, unknown> {
    readonly pathTemplate: PropertyAccessStep[];
    readonly keyAlias: string;
    constructor(value: Record<ValidKey, unknown>, path: PropertyAccessStep[], alias?: string);
    getPathFor(key: ValidKey): PropertyAccessStep[];
}
/**
 * This covers the data needed to generate context specific property call requests.
 *
 * @interface
 @ @extends {PropertyCallRequest}
 * @property {Record<string, string> | undefined} aliases - provides placeholder values within the argument list for values within the expected context
 */
export interface PropertyCallTemplate extends PropertyCallRequest {
    argNames: Record<string, string>;
}
/**
 * These vertices handle objects where key value lookup are performed on a specific nested property.
 * A good example would tree node style objects where each branch is stored in the object's 'children' property.
 * @class
 * @implements {IndirectAccessVertex<AnyObject, ValidKey, unknown>}
 * @property {ValueVertexFactory} vertexFactory - vertex factory to be used to handle pathing through any nested contents of this vertex
 */
export declare class NestedCollectionVertex extends ObjectVertex implements IndirectAccessVertex<AnyObject, ValidKey, unknown> {
    readonly collectionPath: PropertyAccessStep[];
    constructor(value: Record<ValidKey, unknown>, path: PropertyAccessStep[]);
    createKeyIterator(): IterableIterator<ValidKey>;
    getIndexedKey(index: number): ValidKey | undefined;
    getKeyValue(key: ValidKey): unknown;
    getKeyIndex(key: ValidKey): number | undefined;
    getPathFor(key: ValidKey): IndirectAccessPathing;
    getSubpathFrom(path: ValidKey[], startPosition?: number): IndirectAccessPathing<ValidKey> | undefined;
}
/**
 * Acts as a vertex wrapper for javascript Maps.
 * @template K, V
 * @class
 * @implements {IndirectAccessVertex<Map<K, V>, K, V>}
 */
export declare class MapVertex<K extends ValidKey = ValidKey, V = unknown> implements IndirectAccessVertex<Map<K, V>, K, V> {
    readonly value: Map<K, V>;
    get keyProvider(): IterableIterator<K>;
    /**
       * @param {Record<ValidKey, V>} value - object to be wrapped by the vertex
       */
    constructor(value: Map<K, V>);
    createKeyIterator(): IterableIterator<K>;
    getIndexedKey(index: number): K | undefined;
    getKeyValue(key: ValidKey): V | undefined;
    getKeyIndex(key: ValidKey): number | undefined;
    getPathFor(key: ValidKey): IndirectAccessPathing;
    getSubpathFrom(path: ValidKey[], startPosition?: number): IndirectAccessPathing<ValidKey> | undefined;
}
/**
 * Checks if the target text follow the provided enclosure rules for a particular key.
 * @function
 * @param {string} target - text to be evaluated
 * @param {string} prefix - opening text for the enclosure
 * @param {string} suffix - closing text for the enclosure
 * @returns {IndirectAccessPathing | undefined} matching pathing data if the text matches the provided enclosures
 */
export declare function validateEnclosedKey(target: string, prefix: string, suffix: string): IndirectAccessPathing | undefined;
/**
 * Gets a copy of the provided text with certain characters added before specific character types.
 * This is mainly used for this like ensuring characters are properly encoded for things like use in a regular expression.
 * @function
 * @param {string} source - text to be copied
 * @param {string} characterSet - characters we should be looking for
 * @param {string} prefix - text to insert before each matching character
 * @returns {string} reformatted copy of the provided text
 */
export declare function injectCharacterPrefix(source: string, characterSet: string, prefix: string): string;
