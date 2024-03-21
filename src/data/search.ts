import {
  type TraversalState,
  type AnyObject,
  type ValidKey,
  type SearchResponse,
  type ValueVertexFactory,
  type KeyValueVertex,
  DepthFirstSearch,
  cloneRoute,
  createRootState
} from 'key-crawler'

/**
 * Utility type for referencing a plain old javascript object.
 * @type
 */
export type ValueMap = Record<string, any>

/**
 * Callback to executed for a given search term at a particular point in a search traversal.
 * @type
 * @param {TraversalState} state - current traversal state
 * @param {ValueMap | ValidKey} term - search term to be used
 * @param {(state: TraversalState) => void} visit - callback to be executed on each descendant that matches the search
 * @returns {boolean} true if the callback knows how the handle the provided term
 */
export type SearchTermCallback = (
  state: TraversalState,
  term: ValueMap | ValidKey,
  visit: (state: TraversalState) => void
) => boolean

/**
 * Tries to find the route to a matching tree node given a series of search terms where each step referes to a descendant of the previous term's match.
 * @class
 * @property {SearchTermCallback[]} termRules - list of callbacks used to resolve each term in the path
 */
export class SearchPathResolver {
  termRules: SearchTermCallback[]

  constructor (
    termRules: SearchTermCallback[] = []
  ) {
    this.termRules = termRules
  }

  /**
   * Tries to retrieve the nodes matching the provided search path.
   * @function
   * @param {AnyObject} context - collection to perform the search on
   * @param {Array<ValueMap | ValidKey>} path - series of search terms to be applied
   * @param {number} maxResults - stop once we get this many matches
   * @returns {SearchResponse}
   */
  resolve (
    context: AnyObject,
    path: Array<ValueMap | ValidKey>,
    maxResults?: number
  ): SearchResponse {
    const search: SearchResponse = {
      state: createRootState(context),
      results: []
    }
    this.extendSearch(search, path, maxResults)
    return search
  }

  /**
   * Helper function used to resolve the remaining steps in a search path.
   * @function
   * @param {AnyObject} context - collection to perform the search on
   * @param {Array<ValueMap | ValidKey>} steps - remaining search terms to be processed
   * @param {number} maxResults - stop once we get this many matches
   */
  extendSearch (
    search: SearchResponse,
    steps: Array<ValueMap | ValidKey>,
    maxResults = Number.POSITIVE_INFINITY
  ): void {
    if (steps.length <= 0) return
    const step = steps[0]
    const substeps = steps.slice(1)
    const previouslyVisited = search.state.visited
    search.state.visited = []
    for (const callback of this.termRules) {
      const matched = callback(
        search.state,
        step,
        (state) => {
          if (substeps.length > 0) {
            this.extendSearch(
              search,
              substeps,
              maxResults
            )
          } else {
            const snapshot = cloneRoute(state.route)
            search.results.push(snapshot)
            if (search.results.length >= maxResults) {
              state.completed = true
            }
          }
        }
      )
      if (matched) break
    }
    search.state.visited = previouslyVisited
  }
}

/**
 * Callback for converting a search term to a state matching callback.
 * @type
 * @param {ValueMap | ValidKey} term - search term to be used
 * @returns {((state: TraversalState) => boolean) | undefined}
 */
export type SearchCheckCallback = (term: ValueMap | ValidKey) =>
((state: TraversalState) => boolean) | undefined

/**
 * Generates a particular type of SearchTermCallback.
 * @class
 * @property {ValueVertexFactory} vertexFactory - provides value vertices to traversal functions
 * @property {DepthFirstSearch} depthFirstSearch - provides basic traversal functionality
 */
export class SearchTermCallbackFactory {
  vertexFactory: ValueVertexFactory
  readonly depthFirstSearch = new DepthFirstSearch()

  constructor (
    vertexFactory: ValueVertexFactory
  ) {
    this.vertexFactory = vertexFactory
  }

  /**
   * Generates callbacks that traverse the current node's descendants and relay matches for each node that fits it's check function's criteria.
   * @function
   * @param {SearchCheckCallback} getCheck - generates a state evaluation callback if the term meets it's criteria
   * @param {boolean} shallow - if set to true the traversal will not extend to descendants of a matching node
   * @returns {SearchTermCallback}
   */
  getSearchCallback (
    getCheck: SearchCheckCallback,
    shallow = false
  ): SearchTermCallback {
    return (
      state: TraversalState,
      term: ValueMap | ValidKey,
      visit: (state: TraversalState) => void
    ) => {
      const check = getCheck(term)
      if (check == null) return false
      this.depthFirstSearch.extendTraversal(
        state,
        (state) => {
          const matched = check(state)
          if (matched) {
            visit(state)
            if (shallow) {
              state.skipIteration = true
            }
          }
        },
        this.vertexFactory
      )
      return true
    }
  }

  /**
   * Generates a callback that treats the provided search term as a traversal key, as per resolveKey.
   * @function
   * @returns {SearchTermCallback}
   */
  getKeyCallback (): SearchTermCallback {
    return (
      state: TraversalState,
      term: ValueMap | ValidKey,
      visit: (state: TraversalState) => void
    ) => this.resolveKey(state, term, visit)
  }

  /**
   * Treats the provided search term as a traversal key, meaning it only gets checked against the current node's children.
   * @function
   * @param {TraversalState} state - current traversal state
   * @param {ValueMap | ValidKey} term - search term to be used
   * @param {(state: TraversalState) => void} visit - callback to be executed on the matching child
   * @returns {boolean} true if term is a valid key
   */
  resolveKey (
    state: TraversalState,
    term: ValueMap | ValidKey,
    visit: (state: TraversalState) => void
  ): boolean {
    if (typeof term === 'object') return false
    const targetValue = state.route.target
    if (typeof targetValue === 'object' && targetValue !== null) {
      const targetObject = targetValue as AnyObject
      const vertex = this.vertexFactory.createVertex(targetObject)
      if ('keyProvider' in vertex) {
        const keyedVertex = vertex as KeyValueVertex
        const keyValue = keyedVertex.getKeyValue(term)
        if (keyValue !== undefined) {
          state.route.vertices.push(keyedVertex)
          state.route.path.push(term)
          state.route.target = keyValue
          visit(state)
        }
      }
    }
    return true
  }

  /**
   * Generates a callback for treating the term as an array property's index.
   * @function
   * @param {string[]} properties - properties to be checked for an array
   * @returns {SearchTermCallback}
   */
  getPropertyItemAtCallback (
    properties: string[]
  ): SearchTermCallback {
    return (
      state: TraversalState,
      term: ValueMap | ValidKey,
      visit: (state: TraversalState) => void
    ) => this.resolvePropertyItemAt(properties, state, term, visit)
  }

  /**
   * Visits the indexed item of the first named array property found.
   * @function
   * @param {string[]} properties - properties to be checked for an array
   * @param {TraversalState} state - current traversal state
   * @param {ValueMap | ValidKey} term - search term to be used
   * @param {(state: TraversalState) => void} visit - callback to be executed on the matching child
   * @returns {boolean} true if the rule applies
   */
  resolvePropertyItemAt (
    properties: string[],
    state: TraversalState,
    term: ValueMap | ValidKey,
    visit: (state: TraversalState) => void
  ): boolean {
    if (typeof term !== 'number') return false
    const targetValue = state.route.target
    if (typeof targetValue === 'object' && targetValue !== null) {
      if (Array.isArray(targetValue)) return false
      const parentObject = targetValue as ValueMap
      for (const property of properties) {
        const propertyValue = parentObject[property]
        if (Array.isArray(propertyValue)) {
          const collection = propertyValue
          const index = term >= 0
            ? term
            : Math.max(0, collection.length + term)
          state.route.vertices.push(
            this.vertexFactory.createVertex(parentObject) as KeyValueVertex,
            this.vertexFactory.createVertex(collection) as KeyValueVertex
          )
          state.route.path.push(
            property,
            index
          )
          state.route.target = collection[index]
          visit(state)
          return true
        }
      }
    }
    return false
  }
}

/**
 * Links a particular key to a given value.
 * @interface
 * @property {string} key - key used to reference the target value
 * @property {any} value - value associated with the provided key
 */
export interface KeyValuePair {
  key: string
  value: any
}

/**
 * Generates callbacks that search for nodes with a specified property value.
 * @class
 * @extends SearchTermCallbackFactory
 */
export class PropertySearchFactory extends SearchTermCallbackFactory {
  /**
   * Generates a property check callback so long as the provided term is a valid key value pair.
   * @function
   * @param {ValueMap | ValidKey} term - search term to be used
   * @returns {((state: TraversalState) => boolean) | undefined}
   */
  getPropertyCheckFor (
    term: AnyObject | ValidKey
  ): ((state: TraversalState) => boolean) | undefined {
    if (typeof term === 'object' && 'key' in term) {
      const key = String(term.key)
      return (state: TraversalState) => {
        const target = state.route.target
        return typeof target === 'object' &&
          target != null &&
          key in target &&
          (target as Record<string, any>)[key] === term.value
      }
    }
  }

  /**
   * Generates a search callback that relays a match for each node with the given property value.
   * @function
   * @param {boolean} shallow - if set to true the traversal will not extend to descendants of a matching node
   * @returns {SearchTermCallback}
   */
  getPropertySearch (
    shallow = false
  ): SearchTermCallback {
    return this.getSearchCallback(this.getPropertyCheckFor, shallow)
  }
}
