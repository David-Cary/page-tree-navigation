"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteValues = exports.cloneRoute = exports.createRootRoute = void 0;
/**
 * Instaties a traversal route starting at a particular object.
 * @function
 * @param {AnyObject>} root - object the route initially targets
 * @returns {TraversalRoute}
 */
function createRootRoute(root) {
    return {
        path: [],
        target: root,
        vertices: []
    };
}
exports.createRootRoute = createRootRoute;
/**
 * Makes a semi-shallow copy of the provided route with it's own arrays but refering to the same objects as the original.
 * @function
 * @param {TraversalRoute>} source - route to be copied
 * @returns {TraversalRoute}
 */
function cloneRoute(source) {
    return {
        path: source.path.slice(),
        target: source.target,
        vertices: source.vertices.slice()
    };
}
exports.cloneRoute = cloneRoute;
/**
 * Retrieves all values visited along the course of a traversal route.
 * @function
 * @param {TraversalRoute} source - route to be evaluated
 * @returns {TraversalRoute}
 */
function getRouteValues(source) {
    var values = source.vertices.map(function (vertex) { return vertex.value; });
    values.push(source.target);
    return values;
}
exports.getRouteValues = getRouteValues;
