import {
  type TraversalRoute,
  type AnyObject,
  type ValidKey
} from 'key-crawler'
import {
  type ContentNode,
  type Permissions,
  IndexedContentTreeCrawler,
  ContentPermissionsReader
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
 * @property {Permissions} permissions - indicates available actions for the target content node
 */
export interface TableOfContentsNode {
  link: HyperlinkSummary
  children: TableOfContentsNode[]
  permissions?: Permissions
}

/**
 * Generates a table of contents description from a content node tree.
 * @class
 * @property {RouteLinkFactory} linkFactory - generates links for each content node
 * @property {IndexedContentTreeCrawler} contentCrawler - traverses the content tree
 * @property {ContentPermissionsReader} permissionsReader - handles content locks
 */
export class TableOfContentsFactory {
  readonly linkFactory: RouteLinkFactory
  readonly contentCrawler = new IndexedContentTreeCrawler()
  readonly permissionsReader = new ContentPermissionsReader()

  constructor (
    linkFactory: RouteLinkFactory
  ) {
    this.linkFactory = linkFactory
  }

  /**
   * Checks whether a given object has a particular permission.
   * @function
   * @param {any} source - item to be evaluated
   * @param {string} key - name of the target permission
   * @param {boolean} defaultValue - permission value to use if not found
   * @returns {boolean}
   */
  checkNodePermission (
    source: any,
    key: string,
    defaultValue = false
  ): boolean {
    if (
      key !== '' &&
      typeof source === 'object' &&
      'permissions' in source
    ) {
      if (
        (
          typeof source.permissions === 'object' &&
          source.permissions != null
        ) ||
        typeof source.permissions === 'boolean'
      ) {
        return this.permissionsReader.getPermission(
          source.permissions,
          key,
          defaultValue
        )
      }
    }
    return true
  }

  /**
   * Converts a collection of content nodes to their matching table of contents entries.
   * @function
   * @param {ContentNode[]} source - nodes to be evaluated
   * @param {string[]} accessTokens - tokens to be applied to content locks
   * @param {string} viewPermission - name of the view permission
   * @returns {TableOfContentsNode[]}
   */
  mapContentNodes (
    source: ContentNode[],
    accessTokens: string[] = [],
    viewPermission = '',
    prune = true
  ): TableOfContentsNode[] {
    const results = this.contentCrawler.mapValue(
      source,
      (state) => {
        const value = this.mapRoute(state.route, accessTokens)
        if (!this.checkNodePermission(value, viewPermission, true)) {
          state.skipIteration = true
        }
        return value
      },
      (target, key, value) => {
        this.addNodeChild(target, key, value)
      }
    )
    if (Array.isArray(results)) {
      const rows = results as TableOfContentsNode[]
      if (prune) this.pruneHiddenNodes(rows, viewPermission)
      return rows
    }
    return []
  }

  /**
   * Tries to generate a table of contents node for a particular route.
   * @function
   * @param {TraversalRoute} route - route used to generate the node
   * @param {string[]} accessTokens - tokens to be applied to content locks
   * @returns {TableOfContentsNode}
   */
  mapRoute (
    route: TraversalRoute,
    accessTokens: string[] = []
  ): TableOfContentsNode | TableOfContentsNode[] {
    if (
      typeof route.target === 'object' &&
      route.target != null &&
      !Array.isArray(route.target)
    ) {
      const node: TableOfContentsNode = {
        link: this.linkFactory.getRouteLink(route),
        children: []
      }
      const lock = this.permissionsReader.getContentLockOf(route.target)
      if (lock != null) {
        node.permissions = this.permissionsReader.getContentLockPermissions(
          lock,
          accessTokens
        )
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

  /**
   * Removes any nodes that don't allow viewing from the tree.
   * @function
   * @param {TableOfContentsNode[]} nodes - node list to be checked
   * @param {string} viewPermission - name of the view permission
   */
  pruneHiddenNodes (
    nodes: TableOfContentsNode[],
    viewPermission = ''
  ): void {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (
        this.permissionsReader.getPermission(
          node.permissions,
          viewPermission,
          true
        )
      ) {
        this.pruneHiddenNodes(node.children, viewPermission)
      } else {
        nodes.splice(i, 1)
      }
    }
  }
}
