import {
  type KeyCrawler,
  type TraversalRoute,
  type AnyObject,
  cloneRoute
} from 'key-crawler'

/**
 * Supports navigating to next / previous nodes in a tree as though it were a flattened depth first search.
 * @class
 * @property {KeyCrawler} crawler - key crawler that handles vertex creation
 */
export class LinearTreeNavigator {
  readonly crawler: KeyCrawler

  constructor (crawler: KeyCrawler) {
    this.crawler = crawler
  }

  /**
   * Retrieves the first child in the target collection.
   * @function
   * @param {AnyObject} source - collection to be evaluated
   * @returns {TraversalRoute}
   */
  getFirstNodeRoute (source: AnyObject): TraversalRoute {
    const route = this.crawler.createRouteFrom(source, [0])
    return route
  }

  /**
   * Retrieves the last node visited in a preorder depth first traversal of the target collection.
   * @function
   * @param {AnyObject} source - collection to be evaluated
   * @returns {TraversalRoute}
   */
  getLastNodeRoute (source: AnyObject): TraversalRoute {
    const route = this.crawler.createRouteFrom(source, [])
    this.goToLastDescendant(route)
    return route
  }

  /**
   * Advances to the next node visited in a preorder depth first traversal.
   * @function
   * @param {AnyObject} source - collection to be evaluated
   */
  goToNextNode (route: TraversalRoute): void {
    // Try advancing to first child.
    const initialDepth = route.path.length
    this.crawler.extendRouteByIndices(route, [0])
    if (route.path.length > initialDepth) return
    // Work our way up the tree looking for next page.
    while (route.path.length > 0) {
      // Check next sibling.
      const maxPathIndex = route.path.length - 1
      const vertex = route.vertices[maxPathIndex]
      if (vertex != null && 'keyProvider' in vertex) {
        const keyedVertex = vertex
        const childIndex = Number(route.path[maxPathIndex])
        if (isNaN(childIndex)) break
        const siblingKey = keyedVertex.getIndexedKey(childIndex + 1)
        if (siblingKey !== undefined) {
          route.target = keyedVertex.getKeyValue(siblingKey)
          if (route.target != null) {
            route.path[maxPathIndex] = siblingKey
            return
          }
        }
      } else break
      // Move up to parent to check it's sibling.
      this.crawler.revertRoute(route)
    }
    // We're at last page so clear target.
    route.target = null
  }

  /**
   * Retrieves the route to the next node visited in a preorder depth first traversal.
   * @function
   * @param {AnyObject} source - collection to be evaluated
   * @returns {TraversalRoute}
   */
  getNextNodeRoute (route: TraversalRoute): TraversalRoute {
    const cloned = cloneRoute(route)
    this.goToNextNode(cloned)
    return cloned
  }

  /**
   * Reverts to the previous node visited in a preorder depth first traversal.
   * @function
   * @param {AnyObject} source - collection to be evaluated
   */
  goToPreviousNode (route: TraversalRoute): void {
    // If this is the first child, roll up to the parent.
    const maxPathIndex = route.path.length - 1
    const lastKey = route.path[maxPathIndex]
    const lastIndex = Number(lastKey)
    if (lastIndex === 0) {
      this.crawler.revertRoute(route)
      // If this rolls us back to the root, clear the target.
      if (route.path.length <= 0) {
        route.target = null
      }
    } else if (!isNaN(lastIndex)) {
      // If we have a prior sibling, use it's last descendant.
      const previousIndex = lastIndex - 1
      this.crawler.revertRoute(route)
      this.crawler.extendRoute(route, [previousIndex])
      this.goToLastDescendant(route)
    }
  }

  /**
   * Retrieves the route to the previous node visited in a preorder depth first traversal.
   * @function
   * @param {AnyObject} source - collection to be evaluated
   * @returns {TraversalRoute}
   */
  getPreviousNodeRoute (route: TraversalRoute): TraversalRoute {
    const cloned = cloneRoute(route)
    this.goToPreviousNode(cloned)
    return cloned
  }

  /**
   * Advances to the last node to be visited within the current node in a preorder depth first traversal.
   * @function
   * @param {AnyObject} source - collection to be evaluated
   */
  goToLastDescendant (route: TraversalRoute): void {
    let priorDepth
    do {
      priorDepth = route.path.length
      this.crawler.extendRouteByIndices(route, [-1])
    } while (route.path.length > priorDepth)
  }
}
