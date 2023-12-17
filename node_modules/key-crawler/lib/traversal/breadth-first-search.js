"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreadthFirstSearch = void 0;
var vertex_factory_1 = require("../vertices/vertex-factory");
var strategy_1 = require("./strategy");
/**
 * Performs a breadth first search on the target graph.  This means processing all values a certain number of steps from the root before moving out to the next layer.
 * @class
 * @implements {TraversalStrategy}
 */
var BreadthFirstSearch = /** @class */ (function () {
    function BreadthFirstSearch() {
    }
    BreadthFirstSearch.prototype.traverse = function (root, callback, converter) {
        var state = (0, strategy_1.createRootState)(root);
        state.routeQueue = [state.route];
        this.extendTraversal(state, callback, converter);
        state.completed = true;
        return state;
    };
    BreadthFirstSearch.prototype.extendTraversal = function (state, callback, converter) {
        var e_1, _a;
        if (converter === void 0) { converter = new vertex_factory_1.ValueVertexFactory(); }
        if (state.completed || state.routeQueue == null) {
            return;
        }
        while (state.routeQueue.length > 0) {
            var route = state.routeQueue.shift();
            if (route === undefined)
                continue;
            state.route = route;
            var targetValue = state.route.target;
            if (typeof targetValue === 'object' && targetValue !== null) {
                var targetObject = state.route.target;
                if (state.visited.includes(targetObject)) {
                    return;
                }
                state.visited.push(targetObject);
                if (callback != null) {
                    callback(state);
                    if (state.completed) {
                        return;
                    }
                }
                if (state.skipIteration === true) {
                    state.skipIteration = false;
                }
                else {
                    var vertex = converter.createVertex(targetObject);
                    if ('keyProvider' in vertex) {
                        var keyedVertex = vertex;
                        try {
                            for (var _b = (e_1 = void 0, __values(keyedVertex.keyProvider)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var key = _c.value;
                                var subroute = {
                                    path: state.route.path.slice(),
                                    vertices: state.route.vertices.slice(),
                                    target: keyedVertex.getKeyValue(key)
                                };
                                subroute.path.push(key);
                                subroute.vertices.push(keyedVertex);
                                state.routeQueue.push(subroute);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                }
            }
            else if (callback != null) {
                callback(state);
            }
        }
    };
    return BreadthFirstSearch;
}());
exports.BreadthFirstSearch = BreadthFirstSearch;
