import {
  type ValidKey,
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
  KeyedSegmentsParser,
  DelimitedPathParser
} from '../data/links'
import {
  SearchPathResolver,
  PropertySearchFactory,
  type ValueMap
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
 * Describes how a term should be resolved based on the associated prefix.
 * @interface
 * @template T
 * @property {string} prefix - preceeding characters that mark any matching text
 * @property {string | undefined} decodedPrefix - search term to be placed before the converted text
 * @property {((source: T) => boolean) | undefined} check - returns true if the target term should be parsed
 * @property {ReversibleTextParser<T>} parser - handles converting the target term to a string and vice versa
 */
export interface PrefixedPathStepRule<T> {
  prefix: string
  decodedPrefix?: string
  check?: (source: T) => boolean
  parser?: ReversibleTextParser<T>
}

/**
 * Converts a string to key value pair where the value is the provided string.
 * @class
 * @extends ReversibleTextParser<ValueMap | string>
 * @property {string} key - key to be used in each generated key value pair
 * @property {((value: string) => boolean) | undefined} validate - optional function to check the provided value, resulting in string instead of a key value pair if that check fails
 */
export class KeyedPropertySearchParser implements ReversibleTextParser<ValueMap | string> {
  key: string
  validate?: (value: string) => boolean

  constructor (
    key: string,
    validate?: (value: string) => boolean
  ) {
    this.key = key
    this.validate = validate
  }

  parse (source: string): (ValueMap | string) {
    if (this.validate == null || this.validate(source)) {
      const result = {
        key: this.key,
        value: source
      }
      return result
    }
    return source
  }

  stringify (source: (ValueMap | string)): string {
    return typeof source === 'object' ? String(source.value) : source
  }
}

/**
 * Converts the provided search string to a series of search terms and vice versa.
 * @class
 * @extends ReversibleTextParser<Array<ValueMap | ValidKey>>
 * @property {ReversibleTextParser<ValueMap | string> | undefined} headParser - provides special handling to first section of the target path
 * @property {Array<PrefixedPathStepRule<ValueMap | string>>} rules - describes how to handle text segments based on the preceding delimiter
 */
export class SearchPathParser implements ReversibleTextParser<Array<ValueMap | ValidKey>> {
  readonly headParser?: ReversibleTextParser<ValueMap | string>
  readonly rules: Array<PrefixedPathStepRule<ValueMap | string>>

  constructor (
    rules: Array<PrefixedPathStepRule<ValueMap | string>> = [],
    headParser?: ReversibleTextParser<ValueMap | string>
  ) {
    this.headParser = headParser
    this.rules = rules
  }

  parse (source: string): Array<ValueMap | ValidKey> {
    let steps: Array<ValueMap | ValidKey> = []
    let activeRule: PrefixedPathStepRule<ValueMap | string> | undefined
    let priorText = ''
    let remainder = source
    while (remainder !== '') {
      const matchingRule = this.rules.find(
        rule => remainder.startsWith(rule.prefix)
      )
      if (matchingRule != null) {
        if (activeRule != null) {
          const substeps = this.parseVia(priorText, activeRule)
          steps = steps.concat(substeps)
        } else if (priorText !== '') {
          const substep = (this.headParser != null)
            ? this.headParser.parse(priorText)
            : priorText
          steps.push(substep)
        }
        priorText = ''
        activeRule = matchingRule
        remainder = remainder.substring(matchingRule.prefix.length)
      } else {
        priorText += remainder[0]
        remainder = remainder.substring(1)
      }
    }
    if (activeRule != null) {
      const substeps = this.parseVia(priorText, activeRule)
      steps = steps.concat(substeps)
    }
    return steps
  }

  parseVia (
    source: string,
    rule: PrefixedPathStepRule<ValueMap | string>
  ): Array<ValueMap | ValidKey> {
    const results: Array<ValueMap | ValidKey> = []
    if (rule.decodedPrefix != null) {
      results.push(rule.decodedPrefix)
    }
    if (rule.parser != null) {
      const term = rule.parser.parse(source)
      results.push(term)
    } else {
      const num = Number(source)
      const term = isNaN(num) ? source : num
      results.push(term)
    }
    return results
  }

  stringify (source: Array<ValueMap | ValidKey>): string {
    let pathText = ''
    const delimiterRule = this.rules.find(
      rule => rule.check == null && rule.decodedPrefix == null
    )
    let activeDelimiter: string | undefined
    for (let i = 0; i < source.length; i++) {
      const step = source[i]
      const term = typeof step === 'object' ? step : String(step)
      const matchingRule = this.rules.find(
        rule => rule.check?.(term) ?? rule.decodedPrefix === term
      )
      if (matchingRule != null) {
        pathText += matchingRule.prefix
        if (matchingRule.parser != null) {
          pathText += matchingRule.parser.stringify(term)
          activeDelimiter = undefined
        } else {
          activeDelimiter = matchingRule.prefix
        }
      } else if (this.headParser != null && i === 0) {
        pathText += this.headParser.stringify(term)
      } else {
        if (activeDelimiter == null && delimiterRule != null) {
          pathText += delimiterRule.prefix
        }
        pathText += String(step)
        activeDelimiter = undefined
      }
    }
    return pathText
  }
}

/**
 * Callback for generating a search path that corresponds to the provided route.
 * @type
 * @param {TraversalRoute} route - traversal route to be evaluated
 * @returns {Array<ValueMap | ValidKey>}
 */
export type GetRouteSearchCallback = (route: TraversalRoute) => Array<ValueMap | ValidKey>

/**
 * Resolves the provided search string to a traversal route and generates such strings from a route.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Array<ValueMap | ValidKey>>} pathParser - used to convert strings to search paths and vice versa
 * @property {SearchPathResolver} searchResolver - used to resolve a search path to a traversal route
 * @property {GetRouteSearchCallback} getSearch - generates a search path from a traversal route
 * @property {AnyObject} context - object the search should be performed on
 */
export class RouteSearchParser implements ReversibleTextParser<TraversalRoute> {
  pathParser: ReversibleTextParser<Array<ValueMap | ValidKey>>
  searchResolver: SearchPathResolver
  getSearch: GetRouteSearchCallback
  context: AnyObject

  constructor (
    pathParser: ReversibleTextParser<Array<ValueMap | ValidKey>> = new SearchPathParser(),
    searchResolver = new SearchPathResolver(),
    getSearch: GetRouteSearchCallback,
    context: AnyObject = []
  ) {
    this.pathParser = pathParser
    this.searchResolver = searchResolver
    this.getSearch = getSearch
    this.context = context
  }

  parse (source: string): TraversalRoute {
    const path = this.pathParser.parse(source)
    const search = this.searchResolver.resolve(this.context, path, 1)
    if (search.results.length > 0) {
      return search.results[0]
    }
    return createRootRoute(this.context)
  }

  stringify (source: TraversalRoute): string {
    const searchPath = this.getSearch(source)
    const pathText = this.pathParser.stringify(searchPath)
    return pathText
  }
}

/**
 * Creates a unique search path to the content targeted to by a given traversal route.
 * @function
 * @param {TraversalRoute} route - traversal route to be evaluated
 * @returns {Array<ValueMap | ValidKey>}
 */
export function getNamedPageSearch (route: TraversalRoute): Array<ValueMap | ValidKey> {
  const steps: Array<ValueMap | ValidKey> = []
  let noName = true
  for (let i = route.path.length - 1; i >= 0; i--) {
    const vertexIndex = i + 1
    const target = vertexIndex < route.vertices.length
      ? route.vertices[vertexIndex].value
      : route.target
    if (
      typeof target === 'object' &&
      target != null
    ) {
      if ('id' in target) {
        steps.unshift({
          key: 'id',
          value: target.id
        })
        break
      }
      if ('localName' in target) {
        steps.unshift({
          key: 'localName',
          value: target.localName
        })
        noName = false
        continue
      }
    }
    if (noName) {
      const step = route.path[i]
      steps.unshift(step)
    }
  }
  return steps
}

/**
 * Provides default handling for searches with path id and local name markers.
 * @class
 * @extends SearchPathParser
 */
export class NamedPagePathParser extends SearchPathParser {
  constructor (expanded = false) {
    super(
      [
        {
          prefix: '.~',
          check: (source) => typeof source === 'object' && source.key === 'localName',
          parser: new KeyedPropertySearchParser('localName')
        },
        {
          prefix: '~',
          check: (source) => typeof source === 'object' && source.key === 'id',
          parser: new KeyedPropertySearchParser('id')
        },
        {
          prefix: '.'
        }
      ]
    )
    if (expanded) {
      this.rules[2].decodedPrefix = 'children'
    }
  }
}

/**
 * Handles pathing to page content, with the page path and the content subpath having their own parsers.
 * @class
 * @extends ReversibleTextParser<Array<ValueMap | ValidKey>>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {ReversibleTextParser<Array<ValueMap | ValidKey>>} pageParser - handles the page specific part of the path
 * @property {ReversibleTextParser<string[]>} contentParser - handles the subpath to the page's content
 */
export class PageContentPathParser implements ReversibleTextParser<Array<ValueMap | ValidKey>> {
  paramParser: ReversibleTextParser<Record<string, string>>
  pageParser: ReversibleTextParser<Array<ValueMap | ValidKey>>
  contentParser: ReversibleTextParser<string[]>

  constructor (
    paramParser: ReversibleTextParser<Record<string, string>> = new KeyedSegmentsParser(
      ['pagePath', 'contentPath'],
      '/'
    ),
    pageParser: ReversibleTextParser<Array<ValueMap | ValidKey>> = new NamedPagePathParser(true),
    contentParser: ReversibleTextParser<string[]> = new DelimitedPathParser('.')
  ) {
    this.paramParser = paramParser
    this.pageParser = pageParser
    this.contentParser = contentParser
  }

  parse (source: string): Array<ValueMap | ValidKey> {
    const params = this.paramParser.parse(source)
    const pagePath = params.pagePath != null
      ? this.pageParser.parse(params.pagePath)
      : []
    if (params.contentPath != null) {
      const contentPath = this.contentParser.parse(params.contentPath)
      contentPath.unshift('content')
      const fullPath = pagePath.concat(contentPath)
      return fullPath
    }
    return pagePath
  }

  stringify (source: Array<ValueMap | ValidKey>): string {
    const subpaths = this.getSubpaths(source)
    const params: Record<string, string> = {
      pagePath: this.pageParser.stringify(subpaths.pagePath)
    }
    if (subpaths.contentPath != null) {
      const contentPath = subpaths.contentPath.map(step => String(step))
      params.contentPath = this.contentParser.stringify(contentPath)
    }
    const resolvedPath = this.paramParser.stringify(params)
    return resolvedPath
  }

  getSubpaths (source: Array<ValueMap | ValidKey>): Record<string, Array<ValueMap | ValidKey>> {
    const subpaths: Record<string, Array<ValueMap | ValidKey>> = {}
    const contentIndex = source.indexOf('content')
    if (contentIndex >= 0) {
      subpaths.pagePath = source.slice(0, contentIndex)
      subpaths.contentPath = source.slice(contentIndex + 1)
    } else {
      subpaths.pagePath = source
    }
    return subpaths
  }
}

/**
 * Generates name and id based path strings for page content routes.  This also supports reconstructing a route from such a string.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {AnyObject} context - root object routes should be generated from
 */
export class NamedPageRouteParser extends RouteSearchParser {
  constructor (
    paramParser?: ReversibleTextParser<Record<string, string>>,
    context: AnyObject = []
  ) {
    super(
      new PageContentPathParser(paramParser),
      new PageTreeSearchResolver(),
      getNamedPageSearch,
      context
    )
  }
}
