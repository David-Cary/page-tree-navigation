import { type UntypedObject } from '../value-types';
import { type ValueVertex } from './value-vertices';
/**
 * These allow conditional creation of vertices, provided the supplied value meets the callback's criteria.
 * @type
 * @function
 * @param {T} source - value to be wrapped
 * @returns {ValueVertex | undefined} resulting vertex for the provided value, if valid
 */
export type VertexFactoryCallback<T = unknown> = (source: T) => ValueVertex | undefined;
/**
 * Wraps a provided value in an appropriate vertex given a certain set of rules.
 * @class
 * @property {Array<VertexFactoryCallback<UntypedObject>>} objectRules - rules for any objects that require special handling, in order of descending priority
 */
export declare class ValueVertexFactory {
    objectRules?: Array<VertexFactoryCallback<UntypedObject>>;
    /**
     * @param {Array<VertexFactoryCallback<UntypedObject>>} objectRules - rules to used by the factory for special object types
     */
    constructor(objectRules?: Array<VertexFactoryCallback<UntypedObject>>);
    createVertex(source: unknown): ValueVertex;
}
