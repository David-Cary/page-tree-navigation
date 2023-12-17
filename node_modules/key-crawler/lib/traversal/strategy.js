"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRootState = void 0;
var routes_1 = require("./routes");
/**
 * Instaties a traversal state starting at a particular object.
 * @function
 * @param {AnyObject>} root - object the traversal initially targets
 * @returns {TraversalRoute}
 */
function createRootState(root) {
    return {
        route: (0, routes_1.createRootRoute)(root),
        visited: [],
        completed: false
    };
}
exports.createRootState = createRootState;
