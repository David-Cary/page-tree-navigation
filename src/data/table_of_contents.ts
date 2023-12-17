import {
  type TraversalRoute,
  type AnyObject,
  type ValidKey
} from 'key-crawler'
import {
  type ContentNode,
  IndexedContentTreeCrawler
} from '../data/pages'
import {
  type HyperlinkSummary,
  type RouteLinkFactory
} from '../data/links'

/**
 * Describes a table of contents entry.
 * @interface
 * @property {HyperlinkSummary} link - hyperlink details for the element this node references
 * @property {TableOfContentsNode[]} children - child nodes for this entry
 */
export interface TableOfContentsNode {
  link: HyperlinkSummary
  children: TableOfContentsNode[]
}

/**
 * Generates a table of contents description from a content node tree.
 * @class
 * @property {RouteLinkFactory} linkFactory - generates links for each content node
 * @property {IndexedContentTreeCrawler} contentCrawler - traverses the content tree
 */
export class TableOfContentsFactory {
  readonly linkFactory: RouteLinkFactory
  readonly contentCrawler = new IndexedContentTreeCrawler()

  constructor (
    linkFactory: RouteLinkFactory
  ) {
    this.linkFactory = linkFactory
  }

  /**
   * Converts a collection of content nodes to their matching table of contents entries.
   * @function
   * @param {ContentNode[]} source - nodes to be evaluated
   * @returns {TableOfContentsNode[]}
   */
  mapContentNodes (source: ContentNode[]): TableOfContentsNode[] {
    const results = this.contentCrawler.mapValue(
      source,
      (state) => this.mapRoute(state.route),
      (target, key, value) => { this.addNodeChild(target, key, value) }
    )
    if (Array.isArray(results)) {
      return results as TableOfContentsNode[]
    }
    return []
  }

  /**
   * Tries to generate a table of contents node for a particular route.
   * @function
   * @param {TraversalRoute} route - route used to generate the node
   * @returns {TableOfContentsNode}
   */
  mapRoute (route: TraversalRoute): TableOfContentsNode | TableOfContentsNode[] {
    if (
      typeof route.target === 'object' &&
      route.target != null &&
      !Array.isArray(route.target)
    ) {
      const node: TableOfContentsNode = {
        link: this.linkFactory.getRouteLink(route),
        children: []
      }
      return node
    }
    return []
  }

  /**
   * Utility function for adding a member to a node's child list.
   * @function
   * @param {AnyObject} target - node we're adding to
   * @param {ValidKey} key - target child index
   * @param {any} value - child node to be added
   */
  addNodeChild (
    target: AnyObject,
    key: ValidKey,
    value: any
  ): void {
    if ('children' in target && Array.isArray(target.children)) {
      const index = Number(key)
      target.children[index] = value
    } else {
      this.contentCrawler.setChildValue(target, key, value)
    }
  }
}
