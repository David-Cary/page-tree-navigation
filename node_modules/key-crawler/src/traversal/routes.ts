import { type ValidKey, type AnyObject } from '../value-types'
import { type KeyValueVertex } from '../vertices/value-vertices'

/**
 * Tracks the vertices passed through to reach a particular value.
 * @interface
 * @property {ValidKey[]} path - list of keys used for each transition
 * @property {unknown} target - final value reached by the traversal
 * @property {KeyValueVertex[]} vertices - list of verices we passed through to reach the final value
 */
export interface TraversalRoute {
  path: ValidKey[]
  target: unknown
  vertices: KeyValueVertex[]
}

/**
 * Instaties a traversal route starting at a particular object.
 * @function
 * @param {AnyObject>} root - object the route initially targets
 * @returns {TraversalRoute}
 */
export function createRootRoute (root: AnyObject): TraversalRoute {
  return {
    path: [],
    target: root,
    vertices: []
  }
}

/**
 * Makes a semi-shallow copy of the provided route with it's own arrays but refering to the same objects as the original.
 * @function
 * @param {TraversalRoute>} source - route to be copied
 * @returns {TraversalRoute}
 */
export function cloneRoute (source: TraversalRoute): TraversalRoute {
  return {
    path: source.path.slice(),
    target: source.target,
    vertices: source.vertices.slice()
  }
}

/**
 * Retrieves all values visited along the course of a traversal route.
 * @function
 * @param {TraversalRoute} source - route to be evaluated
 * @returns {TraversalRoute}
 */
export function getRouteValues (source: TraversalRoute): unknown[] {
  const values: unknown[] = source.vertices.map(vertex => vertex.value)
  values.push(source.target)
  return values
}
