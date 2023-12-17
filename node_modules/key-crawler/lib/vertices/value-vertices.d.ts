import { type ValidKey } from '../value-types';
/**
 * Value vertices act as a generic wrapper for data values.
 *
 * @template T
 * @property {T} value - data the vertex represents
 */
export interface ValueVertex<T = unknown> {
    readonly value: T;
}
/**
 * These vertices have a set of one-way connections to other values where each connection has it's onw unique key.
 * Those connections function much like edges, though the thing they connect to need not be another vertex.
 *
 * @template T, K, V
 * @interface
 * @extends ValueVertex<T>
 * @property {IterableIterator<K>} keyProvider - allows iteration through all the vertex's jeys
 */
export interface KeyValueVertex<T = unknown, K extends ValidKey = ValidKey, V = unknown> extends ValueVertex<T> {
    get keyProvider(): IterableIterator<K>;
    /**
     * Tries to find the n-th key of the target value.
     * @function
     * @param {number} index - zero-based position of the target key
     * @returns {K | undefined} the key at the trarget position or undefined if the position is out of range
     */
    getIndexedKey: (index: number) => K | undefined;
    /**
     * Tries to retrieved the value associated with the provided key, if any.
     * @function
     * @param {ValidKey} key - identifier the target value is linked to
     * @returns {V | undefined} the associated value if one is found or undefined if there's no such value.
     */
    getKeyValue: (key: ValidKey) => V | undefined;
    /**
     * Tries to find the zero-based position of the target key within the iteration order.
     * @template K
     * @function
     * @param {K} key - key to be found
     * @returns {number | undefined} target position or undefined if the key was not in the iteration set
     */
    getKeyIndex: (key: K) => number | undefined;
}
/**
 * Acts as a vertex wrapper for primitive values.
 * @template T
 * @class
 * @implements {ValueVertex<T>}
 */
export declare class PrimitiveVertex<T = unknown> implements ValueVertex<T> {
    readonly value: T;
    /**
       * @param {Record<ValidKey, V>} value - value to be wrapped by the vertex
       */
    constructor(value: T);
}
/**
 * Acts as a vertex wrapper for arrays.
 * @template T
 * @class
 * @implements {KeyValueVertex<T[], number, T>}
 */
export declare class ArrayVertex<T = unknown> implements KeyValueVertex<T[], number, T> {
    readonly value: T[];
    get keyProvider(): IterableIterator<number>;
    /**
       * @param {Record<ValidKey, V>} value - array to be wrapped by the vertex
       */
    constructor(value: T[]);
    createKeyIterator(): IterableIterator<number>;
    getIndexedKey(index: number): number | undefined;
    getKeyValue(key: ValidKey): T | undefined;
    getKeyIndex(key: number): number | undefined;
}
export declare function getWrappedIndex(index: number, length: number, clamped?: boolean): number;
/**
 * Acts as a vertex wrapper for javascript objects.
 * @template V
 * @class
 * @implements {KeyValueVertex<Record<ValidKey, V>, ValidKey, V>}
 */
export declare class ObjectVertex<V = unknown> implements KeyValueVertex<Record<ValidKey, V>, ValidKey, V> {
    readonly value: Record<ValidKey, V>;
    get keyProvider(): IterableIterator<ValidKey>;
    /**
       * @param {Record<ValidKey, V>} value - object to be wrapped by the vertex
       */
    constructor(value: Record<ValidKey, V>);
    createKeyIterator(): IterableIterator<ValidKey>;
    getIndexedKey(index: number): ValidKey | undefined;
    getKeyValue(key: ValidKey): V | undefined;
    getKeyIndex(key: ValidKey): number | undefined;
}
/**
 * Provides a vertex that lets you specify what properties can be iterac.
 * @template V
 * @class
 * @implements {KeyValueVertex<Record<ValidKey, V>, ValidKey, V>}
 * @property {ValidKey[]} keys - list of property names the vertex can iterate over
 */
export declare class DefinedObjectVertex<V = unknown> extends ObjectVertex<V> {
    readonly keys: ValidKey[];
    /**
       * @param {Record<ValidKey, V>} value - object to be wrapped by the vertex
       * @param {ValidKey[]} keys - list of property names the vertex should use
       */
    constructor(value: Record<ValidKey, V>, keys: ValidKey[]);
    createKeyIterator(): IterableIterator<ValidKey>;
    getIndexedKey(index: number): ValidKey | undefined;
    getKeyIndex(key: ValidKey): number | undefined;
}
