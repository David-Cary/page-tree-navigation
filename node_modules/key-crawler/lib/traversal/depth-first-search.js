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
exports.DepthFirstSearch = exports.SearchOrder = void 0;
var vertex_factory_1 = require("../vertices/vertex-factory");
var strategy_1 = require("./strategy");
/**
 * Types of search order execution.  Primarily used by depth first searches.
 * @enum {string}
 */
var SearchOrder;
(function (SearchOrder) {
    SearchOrder["PREORDER"] = "preorder";
    SearchOrder["POSTORDER"] = "postorder";
})(SearchOrder || (exports.SearchOrder = SearchOrder = {}));
/**
 * Performs a depth first search on the target graph.  This means recursively processing descendants before moving on their parent's siblings.
 * @class
 * @implements {TraversalStrategy}
 * @property {SearchOrder} order - signals what search order should be used by the traversal
 */
var DepthFirstSearch = /** @class */ (function () {
    function DepthFirstSearch(order) {
        if (order === void 0) { order = SearchOrder.PREORDER; }
        this.order = order;
    }
    DepthFirstSearch.prototype.traverse = function (root, callback, converter) {
        var state = (0, strategy_1.createRootState)(root);
        this.extendTraversal(state, callback, converter);
        state.completed = true;
        return state;
    };
    DepthFirstSearch.prototype.extendTraversal = function (state, callback, converter) {
        if (converter === void 0) { converter = new vertex_factory_1.ValueVertexFactory(); }
        if (this.order === SearchOrder.PREORDER) {
            this.extendPhasedTraversal(state, callback, undefined, converter);
        }
        else {
            this.extendPhasedTraversal(state, undefined, callback, converter);
        }
    };
    DepthFirstSearch.prototype.startPhasedTraversal = function (root, preIterate, postIterate, converter) {
        var state = (0, strategy_1.createRootState)(root);
        this.extendPhasedTraversal(state, preIterate, postIterate, converter);
        state.completed = true;
        return state;
    };
    DepthFirstSearch.prototype.extendPhasedTraversal = function (state, preIterate, postIterate, converter) {
        var e_1, _a;
        if (converter === void 0) { converter = new vertex_factory_1.ValueVertexFactory(); }
        if (state.completed) {
            return;
        }
        var targetValue = state.route.target;
        if (typeof targetValue === 'object' && targetValue !== null) {
            var targetObject = targetValue;
            if (state.visited.includes(targetObject)) {
                return;
            }
            state.visited.push(targetObject);
            if (preIterate != null) {
                preIterate(state);
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
                    state.route.vertices.push(keyedVertex);
                    try {
                        for (var _b = __values(keyedVertex.keyProvider), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var key = _c.value;
                            state.route.path.push(key);
                            state.route.target = keyedVertex.getKeyValue(key);
                            this.extendPhasedTraversal(state, preIterate, postIterate, converter);
                            if (state.completed) {
                                return;
                            }
                            state.route.path.pop();
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    state.route.vertices.pop();
                    state.route.target = targetObject;
                }
            }
            if (postIterate != null) {
                postIterate(state);
            }
        }
        else {
            if (preIterate != null) {
                preIterate(state);
                if (state.completed) {
                    return;
                }
            }
            if (postIterate != null) {
                postIterate(state);
            }
        }
    };
    return DepthFirstSearch;
}());
exports.DepthFirstSearch = DepthFirstSearch;
