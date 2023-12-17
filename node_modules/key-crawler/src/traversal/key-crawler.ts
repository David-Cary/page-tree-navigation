import { type ValidKey, type AnyObject, type UntypedObject } from '../value-types'
import { type KeyValueVertex } from '../vertices/value-vertices'
import { ValueVertexFactory } from '../vertices/vertex-factory'
import { type TraversalRoute, createRootRoute, cloneRoute } from './routes'
import { type TraversalState, type TraversalStrategy } from './strategy'
import { DepthFirstSearch } from './depth-first-search'

/**
 * Contains all matching routes found during a given traversal.
 * @interface
 * @property {TraversalState} state - ending state of the target traversal
 * @property {TraversalRoute[]} results - all matching routes found the target traversal
 */
export interface SearchResponse {
  state: TraversalState
  results: TraversalRoute[]
}

/**
 * Used for functions that assign object property values.
 * @type
 * @function
 * @param {AnyObject} target - object to be modified
 * @param {ValidKey} key - property name/index to be used
 * @param {any} value - value to be assigned
 */
export type SetChildCallback = (
  parent: AnyObject,
  key: ValidKey,
  child: any
) => void

/**
 * Utility object for performing graph traversals with a particular set of settings, as well as transformations on the resulting routes.
 * @class
 * @property {TraversalStrategy} traversalStrategy - specifies what approach should be taken to traversal calls
 * @property {ValueVertexFactory} vertexFactory - provides new vertices as needed during traversal and route extension
 */
export class KeyCrawler {
  traversalStrategy: TraversalStrategy
  vertexFactory: ValueVertexFactory

  /**
   * @param {TraversalStrategy} strategy - strategy to be used for traversal
   * @param {ValueVertexFactory} converter - lets you specify how vertices are created during traversal
   */
  constructor (
    strategy: TraversalStrategy = new DepthFirstSearch(),
    converter = new ValueVertexFactory()
  ) {
    this.traversalStrategy = strategy
    this.vertexFactory = converter
  }

  /**
   * Invokes the instances traversal strategy to visit all connected value of the selected target,
   * @function
   * @param {AnyObject} root - start point for the traversal
   * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
   * @returns {TraversalState} results of the traversal
   */
  traverse (
    root: AnyObject,
    callback: (state: TraversalState) => void
  ): TraversalState {
    return this.traversalStrategy.traverse(root, callback, this.vertexFactory)
  }

  /**
   * Tries to find all matching connected values from a target starting point.
   * @function
   * @param {AnyObject} root - start point for the search
   * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
   * @param {number} maxResults - optional limit on the number of search results before traversal is terminated
   * @returns {SearchResponse} matched value routes and final traversal state
   */
  search (
    root: AnyObject,
    callback: (state: TraversalState) => boolean,
    maxResults = Number.POSITIVE_INFINITY
  ): SearchResponse {
    const results: TraversalRoute[] = []
    const state = this.traversalStrategy.traverse(
      root,
      (state: TraversalState) => {
        const matched = callback(state)
        if (matched) {
          const route = cloneRoute(state.route)
          results.push(route)
          state.completed = results.length >= maxResults
        }
      },
      this.vertexFactory
    )
    return {
      state,
      results
    }
  }

  /**
   * Converts the provided value and it's children to the target format.
   * @function
   * @param {any} source - value to be converted
   * @param {(state: TraversalState) => any} getValueFor - conversion to be applied for each value visited
   * @param {addChild} SetChildCallback - callback for linking resulting child to it's parent
   * @returns {any} converted value
   */
  mapValue (
    source: any,
    getValueFor: (state: TraversalState) => any,
    addChild: SetChildCallback = this.setChildValue
  ): any {
    const valueMap = new Map<any, any>()
    this.traversalStrategy.traverse(
      source,
      (state: TraversalState) => {
        const value = getValueFor(state)
        valueMap.set(state.route.target, value)
        const maxPathIndex = state.route.path.length - 1
        if (maxPathIndex >= 0) {
          const maxVertexIndex = state.route.vertices.length - 1
          if (maxVertexIndex >= 0) {
            const lastVertex = state.route.vertices[maxVertexIndex]
            const parentValue = valueMap.get(lastVertex.value)
            if (parentValue != null && typeof parentValue === 'object') {
              const key = state.route.path[maxPathIndex]
              addChild(parentValue, key, value)
            }
          }
        }
      },
      this.vertexFactory
    )
    return valueMap.get(source)
  }

  /**
   * Provides default setter for javascipt objects and arrays.
   * @function
   * @param {AnyObject} target - object to be modified
   * @param {ValidKey} key - property name/index to be used
   * @param {any} value - value to be assigned
   */
  setChildValue (
    target: AnyObject,
    key: ValidKey,
    value: any
  ): void {
    if (Array.isArray(target)) {
      const index = Number(key)
      if (isNaN(index)) return
      target[index] = value
    } else {
      const targetObject = target as UntypedObject
      targetObject[key] = value
    }
  }

  /**
   * Populates a traversal route from a given point along a provided path.
   * @function
   * @param {AnyObject} root - object the traversal initially targets
   * @param {ValidKey[]} path - keys to use for each step of the traversal
   * @returns {TraversalRoute}
   */
  createRouteFrom (
    root: AnyObject,
    path: ValidKey[]
  ): TraversalRoute {
    const route = createRootRoute(root)
    this.extendRoute(route, path)
    return route
  }

  /**
   * Tries to navigate futher along a traversal route given additional steps.
   * @function
   * @param {TraversalRoute} route - route to be modified
   * @param {ValidKey} steps - additional keys to be used to further the route
   * @returns {void}
   */
  extendRoute (
    route: TraversalRoute,
    steps: ValidKey[]
  ): void {
    for (const key of steps) {
      route.path.push(key)
      if (typeof route.target === 'object' && route.target !== null) {
        const vertex = this.vertexFactory.createVertex(route.target as AnyObject)
        if ('keyProvider' in vertex) {
          const keyedVertex = vertex as KeyValueVertex
          route.vertices.push(keyedVertex)
          route.target = keyedVertex.getKeyValue(key)
        } else break
      } else break
    }
  }

  /**
   * Tries to navigate futher along a traversal route using the connections at a given key index.
   * @function
   * @param {TraversalRoute} route - route to be modified
   * @param {ValidKey} indices - zero-based positions of the keys to be used in each step of the traversal
   * @returns {void}
   */
  extendRouteByIndices (
    route: TraversalRoute,
    indices: number[]
  ): void {
    for (const index of indices) {
      if (typeof route.target === 'object' && route.target !== null) {
        const vertex = this.vertexFactory.createVertex(route.target as AnyObject)
        if ('keyProvider' in vertex) {
          const keyedVertex = vertex as KeyValueVertex
          const key = keyedVertex.getIndexedKey(index)
          if (key !== undefined) {
            route.path.push(key)
            route.vertices.push(keyedVertex)
            route.target = keyedVertex.getKeyValue(key)
          } else break
        } else break
      } else break
    }
  }

  /**
   * Tries rolling a traversal route back a certain number of steps.
   * @function
   * @param {TraversalRoute} route - route to be modified
   * @param {number} numSteps - how many traversal steps should be undone
   * @returns {void}
   */
  revertRoute (
    route: TraversalRoute,
    numSteps = 1
  ): void {
    if (numSteps <= 0) return
    let targetLength = route.path.length - numSteps
    if (targetLength < 0) {
      targetLength = 0
    }
    if (route.vertices.length > targetLength) {
      const lastVertex = route.vertices[targetLength]
      route.target = lastVertex.value
    } else {
      route.target = undefined
    }
    route.path.length = targetLength
    route.vertices.length = targetLength
  }

  /**
   * Tries to create a child route based on the original with additional certain steps.
   * @function
   * @param {TraversalRoute} route - route to be copied
   * @param {ValidKey} steps - additional keys to be used to further the route
   * @returns {TraversalRoute} resulting newly created route
   */
  getSubroute (
    route: TraversalRoute,
    steps: ValidKey[]
  ): TraversalRoute {
    const subroute = cloneRoute(route)
    this.extendRoute(subroute, steps)
    return subroute
  }

  /**
   * Tries to find the next connected value for a route given the key index of it's next value.
   * This is usually used when navigating trees to get the first or last branch of a node.
   * @function
   * @param {TraversalRoute} route - route to be copied
   * @param {number} index - zero-based position in key iteration of the target value
   * @returns {TraversalRoute} resulting newly created route
   */
  getChildRoute (
    route: TraversalRoute,
    index: number
  ): TraversalRoute {
    const subroute = cloneRoute(route)
    this.extendRouteByIndices(subroute, [index])
    return subroute
  }

  /**
   * Retrieves the route for a previous value along the target route.
   * @function
   * @param {TraversalRoute} route - route to be copied
   * @param {number} numSteps - how many steps back we should go to get the target value
   * @returns {TraversalRoute} resulting newly created route
   */
  getParentRoute (
    route: TraversalRoute,
    numSteps = 1
  ): TraversalRoute {
    const subroute = cloneRoute(route)
    this.revertRoute(subroute, numSteps)
    return subroute
  }
}
