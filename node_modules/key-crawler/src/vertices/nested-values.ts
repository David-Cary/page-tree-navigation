import { type ValidKey, type AnyObject, type UntypedObject } from '../value-types'
import { type KeyValueVertex, getWrappedIndex } from './value-vertices'

/**
 * This interface describes calls to a named function.
 * @interface
 * @property {string} name - property name of the function to be executed
 * @property {unknown[]} args - arguments to be used when the function is executed
 */
export interface PropertyCallRequest {
  name: string
  args: unknown[]
}

/**
 * Performs a call to a function of a given object.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
export function executePropertyCall (
  context: AnyObject,
  request: PropertyCallRequest
): unknown {
  if (request.name in context) {
    const value = (context as UntypedObject)[request.name]
    if (typeof value === 'function') {
      return value.apply(null, request.args)
    }
  }
}

export type PropertyLookupStep = ValidKey | PropertyCallRequest

/**
 * Tries to get a certain property value or call an appropriate accessor to get such a value.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
export function resolvePropertyRequest (
  source: AnyObject,
  request: PropertyLookupStep
): unknown {
  if (typeof request === 'object') {
    return executePropertyCall(source, request)
  }
  return (source as UntypedObject)[request]
}

/**
 * Tries to get nested property value by iterating over property references.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} steps - list of steps to be performed as we iterate into the object's contents
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
export function resolvePropertyLookup (
  source: AnyObject,
  steps: PropertyLookupStep[]
): unknown {
  let target = source
  const maxIndex = steps.length - 1
  for (let i = 0; i < maxIndex; i++) {
    const step = steps[i]
    const value = resolvePropertyRequest(source, step)
    if (typeof value === 'object' && value != null) {
      target = value as AnyObject
    } else {
      return undefined
    }
  }
  const finalStep = steps[maxIndex]
  return resolvePropertyRequest(target, finalStep)
}

export type CreateIteratorCallback<T = unknown, K = ValidKey> = (value: T) => IterableIterator<K>

/**
 * This pairs an extracted property path with an associated key.
 * @interface
 * @property {ValidKey} key - key associated with the target path
 * @property {PropertyLookupStep[]} path - property path to the target value
 */
export interface KeyedPathResult {
  key: ValidKey
  path: PropertyLookupStep[]
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
export class ValueLookupVertex<T = AnyObject, K extends ValidKey = ValidKey, V = unknown> implements KeyValueVertex {
  readonly value: T
  readonly pathTemplate: PropertyLookupStep[]
  readonly keyAlias: string
  readonly createKeyIterator: () => IterableIterator<ValidKey>

  get keyProvider (): IterableIterator<ValidKey> {
    return this.createKeyIterator()
  }

  constructor (
    value: T,
    path: PropertyLookupStep[],
    alias = '$key',
    callback?: CreateIteratorCallback<T, K>
  ) {
    this.value = value
    this.pathTemplate = path
    this.keyAlias = alias
    this.createKeyIterator = (callback != null)
      ? () => callback(this.value)
      : () => this.createDefaultKeyIterator()
  }

  /**
   * This tries create an key generator for the target value using the given path.
   * It works best when the key reference in the path is it's own step.
   * When the key is callback argument if ends up making a best guess by iterating
   * up from 0 until it runs into an undefined values
   * @function
   * @returns {IterableIterator<ValidKey>} iterator for all valid keys
   */
  * createDefaultKeyIterator (): IterableIterator<ValidKey> {
    if (typeof this.value !== 'object') return
    let target: AnyObject = this.value as AnyObject
    for (const step of this.pathTemplate) {
      if (typeof step === 'object') {
        const keyIndex = step.args.indexOf(this.keyAlias)
        if (keyIndex >= 0) {
          const testRequest = {
            name: step.name,
            args: step.args.slice()
          }
          for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
            testRequest.args[keyIndex] = i
            const value = executePropertyCall(target, testRequest)
            if (value !== undefined) {
              yield i
            } else return
          }
          return
        }
        const value = executePropertyCall(target, step)
        if (typeof value === 'object' && value != null) {
          target = value as AnyObject
        } else return
      } else {
        if (step === this.keyAlias) {
          if (Array.isArray(target)) {
            for (let i = 0; i < target.length; i++) {
              yield i
            }
          } else {
            for (const key in target) {
              yield key
            }
          }
          return
        }
        const value = (target as UntypedObject)[step]
        if (typeof value === 'object' && value != null) {
          target = value as AnyObject
        } else return
      }
    }
  }

  getIndexedKey (index: number): ValidKey | undefined {
    const keys: ValidKey[] = []
    let count = 0
    for (const key of this.keyProvider) {
      if (count === index) {
        return key
      }
      count++
      keys.push(key)
    }
    const wrappedIndex = getWrappedIndex(index, keys.length)
    return keys[wrappedIndex]
  }

  getKeyValue (key: ValidKey): V | undefined {
    if (typeof this.value === 'object' && this.value != null) {
      const path = this.getValuePath(key)
      return resolvePropertyLookup(this.value as AnyObject, path) as (V | undefined)
    }
  }

  getKeyIndex (key: ValidKey): number | undefined {
    let count = 0
    for (const targetKey of this.keyProvider) {
      if (targetKey === key) {
        return count
      }
      count++
    }
  }

  /**
   * Uses the path template to generate the expected value path for a given key.
   * @function
   * @param {ValidKey} key - key to be found
   * @returns {PropertyLookupStep[]} lookup path to the target value
   */
  getValuePath (key: ValidKey): PropertyLookupStep[] {
    return this.pathTemplate.map(step => {
      if (typeof step === 'object') {
        return {
          name: step.name,
          args: step.args.map(arg => arg === this.keyAlias ? key : arg)
        }
      }
      return step === this.keyAlias ? key : step
    })
  }

  /**
   * Checks if the property path matches our template at a given position.
   * @function
   * @param {PropertyLookupStep} source - path to be evaluated
   * @param {number} startPosition - index within the path to start our evaluation
   * @returns {KeyedPathResult | undefined} the matching path and it's key if a match is found
   */
  validateValuePath (
    source: PropertyLookupStep[],
    startPosition = 0
  ): KeyedPathResult | undefined {
    let key: ValidKey | undefined
    const path: PropertyLookupStep[] = []
    const keyTypes = ['string', 'number', 'symbol']
    for (let i = 0; i < this.pathTemplate.length; i++) {
      const step = this.pathTemplate[i]
      const sourceStep = source[i + startPosition]
      if (typeof step === 'object') {
        if (typeof sourceStep !== 'object' || sourceStep.name !== step.name) {
          return undefined
        }
        for (let argIndex = 0; argIndex < step.args.length; argIndex++) {
          const arg = step.args[argIndex]
          const sourceArg = sourceStep.args[argIndex]
          if (arg === this.keyAlias) {
            if (!keyTypes.includes(typeof sourceArg)) {
              return undefined
            }
            if (key === undefined) {
              key = sourceArg as ValidKey
            } else if (sourceArg !== key) {
              return undefined
            }
          }
        }
      } else if (step === this.keyAlias) {
        if (typeof sourceStep === 'object') {
          return undefined
        }
        if (key === undefined) {
          key = sourceStep
        } else if (sourceStep !== key) {
          return undefined
        }
      }
      path.push(sourceStep)
    }
    if (key !== undefined) {
      return {
        key,
        path
      }
    }
  }
}

/**
 * Converts a vertex key path to a full property lookup path.
 * @function
 * @param {KeyValueVertex} vertices - vertices used to generate the key path
 * @param {ValidKey[]} keys - key path to be evaluated
 * @returns {PropertyLookupStep[] | undefined} the resulting property path if no errors are encountered
 */
export function expandNestedValuePath (
  vertices: KeyValueVertex[],
  keys: ValidKey[]
): PropertyLookupStep[] | undefined {
  let results: PropertyLookupStep[] = []
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const vertex = vertices[i]
    if (vertex == null) return undefined
    if ('getValuePath' in vertex) {
      const container = vertex as ValueLookupVertex
      const subpath = container.getValuePath(key)
      results = results.concat(subpath)
    } else {
      results.push(key)
    }
  }
  return results
}

/**
 * Tries to determine the keys used to generate a full property lookup path.
 * @function
 * @param {KeyValueVertex} vertices - vertices used to generate the key path
 * @param {PropertyLookupStep[]} path - property path to be evaluated
 * @returns {ValidKey[] | undefined} expected keys if no errors were encountered
 */
export function collapseNestedValuePath (
  vertices: KeyValueVertex[],
  path: PropertyLookupStep[]
): ValidKey[] | undefined {
  const results: ValidKey[] = []
  let pathIndex = 0
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i]
    if ('getValuePath' in vertex) {
      const container = vertex as ValueLookupVertex
      const validation = container.validateValuePath(path, pathIndex)
      if (validation != null) {
        results.push(validation.key)
        pathIndex += validation.path.length
      } else return undefined
    } else {
      const step = path[pathIndex]
      if (typeof step === 'object') return undefined
      results.push(step)
      pathIndex++
    }
  }
  return results
}

/**
 * Provides key value handling for javascript Maps.
 * @class
 * @implements {ValueLookupVertex<Map<K, V>, K, V>}
 */
export class MapVertex<K extends ValidKey = ValidKey, V = unknown> extends ValueLookupVertex<Map<K, V>, K, V> {
  constructor (value: Map<K, V>) {
    super(
      value,
      [
        {
          name: 'get',
          args: ['$key']
        }
      ],
      '$key',
      function * (value: Map<K, V>) {
        for (const [key] of value) {
          yield key
        }
      }
    )
  }

  getKeyValue (key: ValidKey): V | undefined {
    return this.value.get(key as K)
  }
}

/**
 * Provides key value handling for Document Object Model nodes.
 * @class
 * @implements {ValueLookupVertex<Node, number, Node>}
 */
export class DOMNodeVertex extends ValueLookupVertex<Node, number, Node> {
  constructor (value: Node) {
    super(
      value,
      [
        'childNodes',
        '$key'
      ],
      '$key',
      function * (value: Node) {
        for (let i = 0; i < value.childNodes.length; i++) {
          yield i
        }
      }
    )
  }

  getKeyValue (key: ValidKey): Node | undefined {
    return this.value.childNodes[Number(key)]
  }
}
