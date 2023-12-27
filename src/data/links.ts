import {
  type TraversalRoute,
  type ValidKey,
  type CommonKey
} from 'key-crawler'

/**
 * Provides information used by an html hyperlink.
 * @interface
 * @property {string} text - text to be shown to the user
 * @property {string} href - hyperlink reference to be followed
 * @property {string} target - window the link should be opened in
 */
export interface HyperlinkSummary {
  text: string
  href: string
  target?: string
}

/**
 * Provides conversion to and from a string and another data type.
 * @template T
 * @interface
 */
export interface ReversibleTextParser<T = any> {
  /**
   * Extracts the encoded data from a supplied string.
   * @function
   * @param {string} source - string to be parsed
   * @returns {T}
   */
  parse: (source: string) => T

  /**
   * Encodes the provided data to a string.
   * @function
   * @param {T} source - data to be encoded
   * @returns {string}
   */
  stringify: (source: T) => string
}

/**
 * Used to generate hyperlink summaries from a route.
 * @class
 * @property {(TraversalRoute) => string} getText - extracts display text from route
 * @property {(TraversalRoute) => string} getHref - extracts hyperlink reference from route
 * @property {string| undefined} linkTarget - window name to be attached to links
 */
export class RouteLinkFactory {
  readonly getText: (route: TraversalRoute) => string
  readonly getHref: (route: TraversalRoute) => string
  linkTarget?: string

  constructor (
    getText: (route: TraversalRoute) => string,
    getHref: (route: TraversalRoute) => string,
    linkTarget?: string
  ) {
    this.getText = getText
    this.getHref = getHref
    this.linkTarget = linkTarget
  }

  /**
   * Generates a HyperlinkSummary from the provided route.
   * @function
   * @param {TraversalRoute} route - route used to generate the link
   * @returns {HyperlinkSummary}
   */
  getRouteLink (route: TraversalRoute): HyperlinkSummary {
    const link: HyperlinkSummary = {
      text: this.getText(route),
      href: this.getHref(route)
    }
    if (this.linkTarget != null) {
      link.target = this.linkTarget
    }
    return link
  }
}

/**
 * RouteLinkFactory that will use the page title for the text or generate a title from the page's index if such a title does not exist.
 * @class
 * @extends RouteLinkFactory
 * @property {(number) => string} getIndexedTitle - callback to specify how titles based on page index are created
 */
export class PageLinkFactory extends RouteLinkFactory {
  readonly getIndexedTitle?: (index: number) => string

  constructor (
    getHref: (route: TraversalRoute) => string,
    getIndexedTitle?: (index: number) => string,
    linkTarget?: string
  ) {
    super(
      (route: TraversalRoute) => {
        if (
          typeof route.target === 'object' &&
          route.target != null &&
          'title' in route.target
        ) {
          return String(route.target.title)
        }
        const maxPathIndex = route.path.length - 1
        const lastStep = route.path[maxPathIndex]
        if (this.getIndexedTitle != null) {
          const childIndex = Number(lastStep)
          return this.getIndexedTitle(childIndex)
        }
        return String(lastStep)
      },
      getHref,
      linkTarget
    )
    this.getIndexedTitle = getIndexedTitle
  }
}

/**
 * Handles splitting and joining text with a designated delimiter character.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {string} delimiter - character used to mark substring breakpoints
 */
export class DelimitedPathParser implements ReversibleTextParser<string[]> {
  readonly delimiter: string

  constructor (delimiter = '.') {
    this.delimiter = delimiter
  }

  parse (source: string): string[] {
    const steps = source.split(this.delimiter)
    return steps
  }

  stringify (source: string[]): string {
    const pathText = source.join(this.delimiter)
    return pathText
  }
}

/**
 * Handles splitting and joining text where delimiters act as stand-ins for specific properties.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {Record<string, string>} delimiters - maps each delimiter character to it's associated property
 */
export class DelimiterEncodedPathParser implements ReversibleTextParser<string[]> {
  delimiters: Record<string, string>

  constructor (
    delimiters: Record<string, string>
  ) {
    this.delimiters = delimiters
  }

  parse (source: string): string[] {
    let path: string[] = [source]
    for (const key in this.delimiters) {
      const delimiter = this.delimiters[key]
      const parsedPath: string[] = []
      for (const step of path) {
        if (typeof step === 'string') {
          const terms = step.split(delimiter)
          if (terms.length > 0) {
            parsedPath.push(terms[0])
            for (let i = 1; i < terms.length; i++) {
              parsedPath.push(key)
              parsedPath.push(terms[i])
            }
          }
        } else {
          parsedPath.push(step)
        }
      }
      path = parsedPath
    }
    return path
  }

  stringify (source: string[]): string {
    let pathText = ''
    for (let i = 0; i < source.length; i++) {
      const step = source[i]
      pathText += (i % 2 === 1 && step in this.delimiters)
        ? this.delimiters[step]
        : step
    }
    return pathText
  }
}

/**
 * Handles wrapping text between prefix and suffix text, as well as extracting text so wrapped.
 * @class
 * @implements ReversibleTextParser<string>
 * @property {string} prefix - text added before the target text
 * @property {string} suffix - text added after the target text
 */
export class EnclosedTextParser implements ReversibleTextParser<string> {
  prefix: string
  suffix: string

  constructor (prefix = '', suffix = '') {
    this.prefix = prefix
    this.suffix = suffix
  }

  parse (source: string): string {
    const startIndex = this.prefix.length > 0 ? source.indexOf(this.prefix) : 0
    if (startIndex >= 0) {
      const targetIndex = startIndex + this.prefix.length
      const endIndex = this.suffix.length > 0
        ? source.indexOf(this.suffix, targetIndex)
        : -1
      if (endIndex >= 0) {
        return source.substring(targetIndex, endIndex)
      }
      return source.substring(targetIndex)
    }
    return source
  }

  stringify (text: string): string {
    return this.prefix + text + this.suffix
  }
}

/**
 * Tries to convert any number that's been strigified back to a number.
 * @class
 * @implements ReversibleTextParser<CommonKey>
 */
export class NumericTextParser implements ReversibleTextParser<CommonKey> {
  parse (source: string): CommonKey {
    const num = Number(source)
    return isNaN(num) ? source : num
  }

  stringify (source: CommonKey): string {
    return String(source)
  }
}

/**
 * Converts any valid key values to and from a string.
 * @class
 * @implements ReversibleTextParser<string>
 * @property {string} symbolPrefix - marker used to signify the target key string refers to a symbol
 */
export class ValidKeyParser implements ReversibleTextParser<ValidKey> {
  symbolPrefix: string

  constructor (
    symbolPrefix = ''
  ) {
    this.symbolPrefix = symbolPrefix
  }

  parse (source: string): ValidKey {
    if (
      this.symbolPrefix !== '' &&
      source.startsWith(this.symbolPrefix)
    ) {
      const symbolName = source.substring(this.symbolPrefix.length)
      return Symbol.for(symbolName)
    }
    const num = Number(source)
    return isNaN(num) ? source : num
  }

  stringify (source: ValidKey): string {
    if (
      this.symbolPrefix !== '' &&
      typeof source === 'symbol'
    ) {
      const key = Symbol.keyFor(source)
      if (key != null) {
        return this.symbolPrefix + key
      }
      if (source.description != null) {
        return this.symbolPrefix + source.description
      }
    }
    return String(source)
  }
}

/**
 * A utility class for handling complex conversions from date to string and back again.
 * @class
 * @implements ReversibleTextParser<Array<T | string>>
 * @property {ReversibleTextParser<string> | undefined} stringParser - Performs top-level processing on the data while it's still a single string
 * @property {ReversibleTextParser<string[]>} splitter - Handles breaking the string into substrings and reversing said process
 * @property {ReversibleTextParser<string> | undefined} stepParser - Converts substrings into the target data types
 */
export class PhasedPathParser<T = any> implements ReversibleTextParser<Array<T | string>> {
  readonly stringParser?: ReversibleTextParser<string>
  readonly splitter: ReversibleTextParser<string[]>
  readonly stepParser?: ReversibleTextParser<(T | string)>

  constructor (
    stringParser?: ReversibleTextParser<string>,
    splitter: ReversibleTextParser<string[]> = new DelimitedPathParser(),
    stepParser?: ReversibleTextParser<(T | string)>
  ) {
    this.stringParser = stringParser
    this.splitter = splitter
    this.stepParser = stepParser
  }

  parse (source: string): Array<T | string> {
    const extractedText = this.stringParser != null
      ? this.stringParser.parse(source)
      : source
    const stringPath = this.splitter.parse(extractedText)
    if (this.stepParser != null) {
      const stepParser = this.stepParser
      const parsedPath = stringPath.map(step => stepParser.parse(step))
      return parsedPath
    }
    return stringPath
  }

  stringify (source: Array<T | string>): string {
    let stringPath: string[]
    if (this.stepParser != null) {
      const stepParser = this.stepParser
      stringPath = source.map(step => stepParser.stringify(step))
    } else {
      stringPath = source.map(step => String(step))
    }
    const rawText = this.splitter.stringify(stringPath)
    const wrappedText = this.stringParser != null
      ? this.stringParser.stringify(rawText)
      : rawText
    return wrappedText
  }
}

/**
 * Handles splitting named segments using a particular delimiter.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {string} delimiter - character used to mark substring breakpoints
 */
export class KeyedSegmentsParser implements ReversibleTextParser<Record<string, string>> {
  readonly delimiter: string
  keys: string[]

  constructor (
    keys: string[] = [],
    delimiter = '.'
  ) {
    this.keys = keys
    this.delimiter = delimiter
  }

  parse (source: string): Record<string, string> {
    const values: Record<string, string> = {}
    const steps = source.split(this.delimiter)
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i]
      values[key] = steps[i]
    }
    return values
  }

  stringify (source: Record<string, string>): string {
    const path: string[] = this.keys.map(
      key => source[key]
    )
    const pathText = path.join(this.delimiter)
    return pathText
  }
}

/**
 * Wraps a key in an object for easy identification.
 * @interface
 * @property {string} key - key being stored
 */
export interface KeyWrapper {
  key: string
}

/**
 * Enables attaching an optional placeholder value to the key reference when there's no key value.
 * @interface
 * @extends KeyWrapper
 * @property {string | undefined} placeholder - value to be used in place of an empty string
 */
export interface PathTemplateToken extends KeyWrapper {
  placeholder?: string
}

/**
 * Outlines how to create a url where certain parts may be replaced by specific key values.
 * @interface
 * @property {string} origin - base url to be used
 * @property {Array<PathTemplateToken | string>} path - text or token to use creating the url's path after the origin
 * @property {KeyWrapper | string | undefined} hash - text to show after the hash mark ('#')
 * @property {Record<string, KeyWrapper | string> | undefined} search - search query parameters to be attached to the url
 */
export interface KeyedURLTemplate {
  origin: string
  path: Array<PathTemplateToken | string>
  hash?: KeyWrapper | string
  search?: Record<string, KeyWrapper | string>
}

/**
 * Handles creating hypertext reference from given parameters and extracting said parameters from such a reference.
 * @class
 * @implements ReversibleTextParser<Record<string, string>>
 * @property {KeyedURLTemplate} template - details on where the parameters are used within a url
 * @property {string} basePath - base url to use if the provided url has no origin
 */
export class KeyedURLValuesParser implements ReversibleTextParser<Record<string, string>> {
  template: KeyedURLTemplate
  basePath: string

  constructor (
    template: KeyedURLTemplate = {
      origin: '',
      path: []
    },
    basePath = 'https://some.site'
  ) {
    this.template = template
    this.basePath = basePath
  }

  parse (source: string): Record<string, string> {
    const values: Record<string, string> = {}
    const url = new URL(source, this.basePath)
    const pathSteps = url.pathname.split('/')
    pathSteps.splice(0, 1) // ignore leading slash
    for (let i = 0; i < this.template.path.length; i++) {
      if (i >= pathSteps.length) break
      const templateStep = this.template.path[i]
      if (
        typeof templateStep === 'object' &&
        pathSteps[i] !== templateStep.placeholder
      ) {
        values[templateStep.key] = pathSteps[i]
      }
    }
    if (
      typeof this.template.hash === 'object' &&
      this.template.hash != null &&
      url.hash !== ''
    ) {
      values[this.template.hash.key] = url.hash.substring(1)
    }
    if (this.template.search != null) {
      for (const key in this.template.search) {
        const searchValue = this.template.search[key]
        if (typeof searchValue === 'object') {
          const paramValue = url.searchParams.get(key)
          if (paramValue != null) {
            values[searchValue.key] = paramValue
          }
        }
      }
    }
    return values
  }

  stringify (source: Record<string, string>): string {
    let urlPath = this.template.origin
    for (let i = 0; i < this.template.path.length; i++) {
      const templateStep = this.template.path[i]
      urlPath += typeof templateStep === 'object'
        ? `/${source[templateStep.key] ?? templateStep.placeholder ?? ''}`
        : `/${templateStep}`
    }
    const url = new URL(urlPath, this.basePath)
    if (this.template.hash != null) {
      if (typeof this.template.hash === 'object') {
        url.hash = source[this.template.hash.key] ?? ''
      } else {
        url.hash = this.template.hash
      }
    }
    if (this.template.search != null) {
      for (const key in this.template.search) {
        const searchValue = this.template.search[key]
        if (typeof searchValue === 'object') {
          const paramValue = source[searchValue.key]
          if (paramValue != null) {
            url.searchParams.set(key, paramValue)
          }
        } else {
          url.searchParams.set(key, searchValue)
        }
      }
    }
    if (this.template.origin === '') {
      return url.href.substring(url.origin.length)
    }
    return url.href
  }
}
