import {
  type ValidKey,
  type CommonKey,
  type TraversalRoute,
  ValueVertexFactory,
  type AnyObject,
  createRootRoute
} from 'key-crawler'
import {
  getValidContentNodeVertex
} from '../data/pages'
import {
  type ReversibleTextParser,
  DelimitedPathParser,
  PhasedPathParser,
  ValidKeyParser,
  NumericTextParser
} from '../data/links'
import {
  SearchPathResolver,
  PropertySearchFactory,
  type KeyValuePair
} from '../data/search'

/**
 * Supports searching by property or index within a content tree.
 * Note that this uses content node vertices by default, allowing searches for page content.
 * @class
 * @extends SearchPathResolver
 * @property {PropertySearchFactory} ruleFactory - generates the search term callbacks used by this resolver
 */
export class PageTreeSearchResolver extends SearchPathResolver {
  readonly ruleFactory: PropertySearchFactory

  constructor () {
    const ruleFactory = new PropertySearchFactory(
      new ValueVertexFactory([
        getValidContentNodeVertex
      ])
    )
    super([
      ruleFactory.getPropertySearch(),
      ruleFactory.getKeyCallback()
    ])
    this.ruleFactory = ruleFactory
  }
}

/**
 * Breaks routes to nested pages and their content into distinct parts.
 * @interface
 * @property {string | undefined} pageId - unique page identifier
 * @property {CommonKey[] | undefined} pagePath - remaining path steps after the identifier
 * @property {ValidKey[] | undefined} contentPath - path to nested content element of the target page
 */
export interface NamedPageRouteParameters {
  pageId?: string
  pagePath?: CommonKey[]
  contentPath?: ValidKey[]
}

/**
 * Generates name and id based path strings for page content routes.  This also supports reconstructing a route from such a string.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {ReversibleTextParser<CommonKey[]>} pathParser - breaks the pagePath string into it's component keys
 * @property {ReversibleTextParser<ValidKey[]>} contentParser - converts the contentPath string to a key array
 * @property {new PageTreeSearchResolver()} searchResolver - resolves the resulting search path to a route
 * @property {AnyObject} context - root object routes should be generated from
 */
export class NamedPageRouteParser implements ReversibleTextParser<TraversalRoute> {
  paramParser: ReversibleTextParser<Record<string, string>>
  pathParser: ReversibleTextParser<CommonKey[]>
  contentParser: ReversibleTextParser<ValidKey[]>
  searchResolver = new PageTreeSearchResolver()
  context: AnyObject

  constructor (
    paramParser: ReversibleTextParser<Record<string, string>>,
    contentParser: ReversibleTextParser<ValidKey[]> = new PhasedPathParser(
      undefined,
      new DelimitedPathParser(),
      new ValidKeyParser()
    ),
    pathParser: ReversibleTextParser<CommonKey[]> = new PhasedPathParser(
      undefined,
      new DelimitedPathParser(),
      new NumericTextParser()
    ),
    context: AnyObject = []
  ) {
    this.paramParser = paramParser
    this.pathParser = pathParser
    this.contentParser = contentParser
    this.context = context
  }

  parse (source: string): TraversalRoute {
    const strings = this.paramParser.parse(source)
    const params = this.parseRouteStrings(strings)
    const searchPath = this.getSearchPath(params)
    const search = this.searchResolver.resolve(
      this.context,
      searchPath,
      1
    )
    return search.results.length > 0
      ? search.results[0]
      : createRootRoute(this.context)
  }

  stringify (source: TraversalRoute): string {
    const strings = this.getRouteStrings(source)
    const pathText = this.paramParser.stringify(strings)
    return pathText
  }

  /**
   * Extracts pathing parameter strings from the provided route
   * @function
   * @param {TraversalRoute} route - route used to generate the strings
   * @returns {Record<string, string>}
   */
  getRouteStrings (route: TraversalRoute): Record<string, string> {
    const strings: Record<string, string> = {}
    const params = this.getRouteParameters(route)
    if (params.pageId != null) {
      strings.pageId = params.pageId
    }
    if (params.pagePath != null) {
      strings.pagePath = this.pathParser.stringify(params.pagePath)
    }
    if (params.contentPath != null) {
      strings.contentPath = this.contentParser.stringify(params.contentPath)
    }
    return strings
  }

  /**
   * Converts parameter strings to path arrays.
   * @function
   * @param {Record<string, string>} strings - string map to be evaluated
   * @returns {NamedPageRouteParameters}
   */
  parseRouteStrings (strings: Record<string, string>): NamedPageRouteParameters {
    const params: NamedPageRouteParameters = {}
    if (strings.pageId != null) {
      params.pageId = strings.pageId
    }
    if (strings.pagePath != null) {
      params.pagePath = this.pathParser.parse(strings.pagePath)
    }
    if (strings.contentPath != null) {
      params.contentPath = this.contentParser.parse(strings.contentPath)
    }
    return params
  }

  /**
   * Extracts pathing parameters from the provided route
   * @function
   * @param {TraversalRoute} route - route used to generate the strings
   * @returns {NamedPageRouteParameters}
   */
  getRouteParameters (route: TraversalRoute): NamedPageRouteParameters {
    const params: NamedPageRouteParameters = {}
    let basePath = route.path
    const contentIndex = basePath.indexOf('content')
    if (contentIndex >= 0) {
      params.contentPath = basePath.slice(contentIndex + 1)
      basePath = basePath.slice(0, contentIndex)
    }
    let noName = true
    for (let i = basePath.length - 1; i >= 0; i--) {
      const vertexIndex = i + 1
      const target = vertexIndex < route.vertices.length
        ? route.vertices[vertexIndex].value
        : route.target
      if (
        typeof target === 'object' &&
        target != null
      ) {
        if ('id' in target) {
          params.pageId = String(target.id)
          break
        }
        if ('localName' in target) {
          if (params.pagePath == null) {
            params.pagePath = []
          }
          params.pagePath.unshift(
            String(target.localName)
          )
          noName = false
        } else if (noName) {
          const key = basePath[i]
          if (typeof key === 'number') {
            if (params.pagePath == null) {
              params.pagePath = []
            }
            params.pagePath.unshift(key)
          }
        }
      }
    }
    return params
  }

  /**
   * Extracts a search path from the provided route parameters.
   * @function
   * @param {NamedPageRouteParameters} params - parameters to be evaluated
   * @returns {Array<KeyValuePair | ValidKey>}
   */
  getSearchPath (
    params: NamedPageRouteParameters
  ): Array<KeyValuePair | ValidKey> {
    let steps: Array<KeyValuePair | ValidKey> = []
    if (params.pageId != null) {
      steps.push({
        key: 'id',
        value: params.pageId
      })
    }
    if (params.pagePath != null) {
      for (const step of params.pagePath) {
        if (typeof step === 'string') {
          steps.push({
            key: 'localName',
            value: step
          })
        } else {
          if (steps.length > 0) {
            steps.push('children')
          }
          steps.push(step)
        }
      }
    }
    if (params.contentPath != null && params.contentPath.length > 0) {
      steps.push('content')
      steps = steps.concat(params.contentPath)
    }
    return steps
  }
}
