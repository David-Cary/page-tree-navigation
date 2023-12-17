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
exports.KeyCrawler = void 0;
var vertex_factory_1 = require("../vertices/vertex-factory");
var routes_1 = require("./routes");
var depth_first_search_1 = require("./depth-first-search");
/**
 * Utility object for performing graph traversals with a particular set of settings, as well as transformations on the resulting routes.
 * @class
 * @property {TraversalStrategy} traversalStrategy - specifies what approach should be taken to traversal calls
 * @property {ValueVertexFactory} vertexFactory - provides new vertices as needed during traversal and route extension
 */
var KeyCrawler = /** @class */ (function () {
    /**
     * @param {TraversalStrategy} strategy - strategy to be used for traversal
     * @param {ValueVertexFactory} converter - lets you specify how vertices are created during traversal
     */
    function KeyCrawler(strategy, converter) {
        if (strategy === void 0) { strategy = new depth_first_search_1.DepthFirstSearch(); }
        if (converter === void 0) { converter = new vertex_factory_1.ValueVertexFactory(); }
        this.traversalStrategy = strategy;
        this.vertexFactory = converter;
    }
    /**
     * Invokes the instances traversal strategy to visit all connected value of the selected target,
     * @function
     * @param {AnyObject} root - start point for the traversal
     * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
     * @returns {TraversalState} results of the traversal
     */
    KeyCrawler.prototype.traverse = function (root, callback) {
        return this.traversalStrategy.traverse(root, callback, this.vertexFactory);
    };
    /**
     * Tries to find all matching connected values from a target starting point.
     * @function
     * @param {AnyObject} root - start point for the search
     * @param {(state: TraversalState) => void} callback - function to be applied to each value visited
     * @param {number} maxResults - optional limit on the number of search results before traversal is terminated
     * @returns {SearchResponse} matched value routes and final traversal state
     */
    KeyCrawler.prototype.search = function (root, callback, maxResults) {
        if (maxResults === void 0) { maxResults = Number.POSITIVE_INFINITY; }
        var results = [];
        var state = this.traversalStrategy.traverse(root, function (state) {
            var matched = callback(state);
            if (matched) {
                var route = (0, routes_1.cloneRoute)(state.route);
                results.push(route);
                state.completed = results.length >= maxResults;
            }
        }, this.vertexFactory);
        return {
            state: state,
            results: results
        };
    };
    /**
     * Converts the provided value and it's children to the target format.
     * @function
     * @param {any} source - value to be converted
     * @param {(state: TraversalState) => any} getValueFor - conversion to be applied for each value visited
     * @param {addChild} SetChildCallback - callback for linking resulting child to it's parent
     * @returns {any} converted value
     */
    KeyCrawler.prototype.mapValue = function (source, getValueFor, addChild) {
        if (addChild === void 0) { addChild = this.setChildValue; }
        var valueMap = new Map();
        this.traversalStrategy.traverse(source, function (state) {
            var value = getValueFor(state);
            valueMap.set(state.route.target, value);
            var maxPathIndex = state.route.path.length - 1;
            if (maxPathIndex >= 0) {
                var maxVertexIndex = state.route.vertices.length - 1;
                if (maxVertexIndex >= 0) {
                    var lastVertex = state.route.vertices[maxVertexIndex];
                    var parentValue = valueMap.get(lastVertex.value);
                    if (parentValue != null && typeof parentValue === 'object') {
                        var key = state.route.path[maxPathIndex];
                        addChild(parentValue, key, value);
                    }
                }
            }
        }, this.vertexFactory);
        return valueMap.get(source);
    };
    /**
     * Provides default setter for javascipt objects and arrays.
     * @function
     * @param {AnyObject} target - object to be modified
     * @param {ValidKey} key - property name/index to be used
     * @param {any} value - value to be assigned
     */
    KeyCrawler.prototype.setChildValue = function (target, key, value) {
        if (Array.isArray(target)) {
            var index = Number(key);
            if (isNaN(index))
                return;
            target[index] = value;
        }
        else {
            var targetObject = target;
            targetObject[key] = value;
        }
    };
    /**
     * Populates a traversal route from a given point along a provided path.
     * @function
     * @param {AnyObject} root - object the traversal initially targets
     * @param {ValidKey[]} path - keys to use for each step of the traversal
     * @returns {TraversalRoute}
     */
    KeyCrawler.prototype.createRouteFrom = function (root, path) {
        var route = (0, routes_1.createRootRoute)(root);
        this.extendRoute(route, path);
        return route;
    };
    /**
     * Tries to navigate futher along a traversal route given additional steps.
     * @function
     * @param {TraversalRoute} route - route to be modified
     * @param {ValidKey} steps - additional keys to be used to further the route
     * @returns {void}
     */
    KeyCrawler.prototype.extendRoute = function (route, steps) {
        var e_1, _a;
        try {
            for (var steps_1 = __values(steps), steps_1_1 = steps_1.next(); !steps_1_1.done; steps_1_1 = steps_1.next()) {
                var key = steps_1_1.value;
                route.path.push(key);
                if (typeof route.target === 'object' && route.target !== null) {
                    var vertex = this.vertexFactory.createVertex(route.target);
                    if ('keyProvider' in vertex) {
                        var keyedVertex = vertex;
                        route.vertices.push(keyedVertex);
                        route.target = keyedVertex.getKeyValue(key);
                    }
                    else
                        break;
                }
                else
                    break;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (steps_1_1 && !steps_1_1.done && (_a = steps_1.return)) _a.call(steps_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Tries to navigate futher along a traversal route using the connections at a given key index.
     * @function
     * @param {TraversalRoute} route - route to be modified
     * @param {ValidKey} indices - zero-based positions of the keys to be used in each step of the traversal
     * @returns {void}
     */
    KeyCrawler.prototype.extendRouteByIndices = function (route, indices) {
        var e_2, _a;
        try {
            for (var indices_1 = __values(indices), indices_1_1 = indices_1.next(); !indices_1_1.done; indices_1_1 = indices_1.next()) {
                var index = indices_1_1.value;
                if (typeof route.target === 'object' && route.target !== null) {
                    var vertex = this.vertexFactory.createVertex(route.target);
                    if ('keyProvider' in vertex) {
                        var keyedVertex = vertex;
                        var key = keyedVertex.getIndexedKey(index);
                        if (key !== undefined) {
                            route.path.push(key);
                            route.vertices.push(keyedVertex);
                            route.target = keyedVertex.getKeyValue(key);
                        }
                        else
                            break;
                    }
                    else
                        break;
                }
                else
                    break;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (indices_1_1 && !indices_1_1.done && (_a = indices_1.return)) _a.call(indices_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    /**
     * Tries rolling a traversal route back a certain number of steps.
     * @function
     * @param {TraversalRoute} route - route to be modified
     * @param {number} numSteps - how many traversal steps should be undone
     * @returns {void}
     */
    KeyCrawler.prototype.revertRoute = function (route, numSteps) {
        if (numSteps === void 0) { numSteps = 1; }
        if (numSteps <= 0)
            return;
        var targetLength = route.path.length - numSteps;
        if (targetLength < 0) {
            targetLength = 0;
        }
        if (route.vertices.length > targetLength) {
            var lastVertex = route.vertices[targetLength];
            route.target = lastVertex.value;
        }
        else {
            route.target = undefined;
        }
        route.path.length = targetLength;
        route.vertices.length = targetLength;
    };
    /**
     * Tries to create a child route based on the original with additional certain steps.
     * @function
     * @param {TraversalRoute} route - route to be copied
     * @param {ValidKey} steps - additional keys to be used to further the route
     * @returns {TraversalRoute} resulting newly created route
     */
    KeyCrawler.prototype.getSubroute = function (route, steps) {
        var subroute = (0, routes_1.cloneRoute)(route);
        this.extendRoute(subroute, steps);
        return subroute;
    };
    /**
     * Tries to find the next connected value for a route given the key index of it's next value.
     * This is usually used when navigating trees to get the first or last branch of a node.
     * @function
     * @param {TraversalRoute} route - route to be copied
     * @param {number} index - zero-based position in key iteration of the target value
     * @returns {TraversalRoute} resulting newly created route
     */
    KeyCrawler.prototype.getChildRoute = function (route, index) {
        var subroute = (0, routes_1.cloneRoute)(route);
        this.extendRouteByIndices(subroute, [index]);
        return subroute;
    };
    /**
     * Retrieves the route for a previous value along the target route.
     * @function
     * @param {TraversalRoute} route - route to be copied
     * @param {number} numSteps - how many steps back we should go to get the target value
     * @returns {TraversalRoute} resulting newly created route
     */
    KeyCrawler.prototype.getParentRoute = function (route, numSteps) {
        if (numSteps === void 0) { numSteps = 1; }
        var subroute = (0, routes_1.cloneRoute)(route);
        this.revertRoute(subroute, numSteps);
        return subroute;
    };
    return KeyCrawler;
}());
exports.KeyCrawler = KeyCrawler;
