import {
  type TraversalRoute,
  cloneRoute
} from 'key-crawler'
import {
  type HyperlinkSummary,
  type RouteLinkFactory
} from '../data/links'

/**
 * Traverses through the children of each node in a content tree, by said child's index.
 * @class
 * @property {RouteLinkFactory} linkFactory - generates the link summaries for each step in the trail
 */
export class BreadcrumbFactory {
  readonly linkFactory: RouteLinkFactory

  constructor (
    linkFactory: RouteLinkFactory
  ) {
    this.linkFactory = linkFactory
  }

  /**
   * Creates link data for every step along the provided route.
   * @function
   * @param {TraversalRoute} route - route to be processed
   * @returns {HyperlinkSummary[]}
   */
  getRouteLinks (route: TraversalRoute): HyperlinkSummary[] {
    const links: HyperlinkSummary[] = []
    const currentRoute = cloneRoute(route)
    while (currentRoute.path.length > 0) {
      if (
        currentRoute.target != null &&
        typeof currentRoute.target === 'object' &&
        !Array.isArray(currentRoute.target)
      ) {
        const link = this.linkFactory.getRouteLink(currentRoute)
        links.unshift(link)
      }
      // Move up to parent route.
      const maxIndex = currentRoute.path.length - 1
      const lastVertex = currentRoute.vertices[maxIndex]
      if (lastVertex == null) break
      currentRoute.target = lastVertex.value
      currentRoute.vertices.pop()
      currentRoute.path.pop()
    }
    return links
  }
}
