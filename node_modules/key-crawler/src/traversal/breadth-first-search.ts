import { type AnyObject } from '../value-types'
import { type KeyValueVertex } from '../vertices/value-vertices'
import { ValueVertexFactory } from '../vertices/vertex-factory'
import { type TraversalRoute } from './routes'
import { type TraversalState, createRootState, type TraversalStrategy } from './strategy'

/**
 * Performs a breadth first search on the target graph.  This means processing all values a certain number of steps from the root before moving out to the next layer.
 * @class
 * @implements {TraversalStrategy}
 */
export class BreadthFirstSearch implements TraversalStrategy {
  traverse (
    root: AnyObject,
    callback?: (state: TraversalState) => void,
    converter?: ValueVertexFactory
  ): TraversalState {
    const state = createRootState(root)
    state.routeQueue = [state.route]
    this.extendTraversal(state, callback, converter)
    state.completed = true
    return state
  }

  extendTraversal (
    state: TraversalState,
    callback?: (state: TraversalState) => void,
    converter: ValueVertexFactory = new ValueVertexFactory()
  ): void {
    if (state.completed || state.routeQueue == null) {
      return
    }
    while (state.routeQueue.length > 0) {
      const route = state.routeQueue.shift()
      if (route === undefined) continue
      state.route = route
      const targetValue = state.route.target
      if (typeof targetValue === 'object' && targetValue !== null) {
        const targetObject = state.route.target as AnyObject
        if (state.visited.includes(targetObject)) {
          return
        }
        state.visited.push(targetObject)
        if (callback != null) {
          callback(state)
          if (state.completed) {
            return
          }
        }
        if (state.skipIteration === true) {
          state.skipIteration = false
        } else {
          const vertex = converter.createVertex(targetObject)
          if ('keyProvider' in vertex) {
            const keyedVertex = vertex as KeyValueVertex
            for (const key of keyedVertex.keyProvider) {
              const subroute: TraversalRoute = {
                path: state.route.path.slice(),
                vertices: state.route.vertices.slice(),
                target: keyedVertex.getKeyValue(key)
              }
              subroute.path.push(key)
              subroute.vertices.push(keyedVertex)
              state.routeQueue.push(subroute)
            }
          }
        }
      } else if (callback != null) {
        callback(state)
      }
    }
  }
}
