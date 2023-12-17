"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreadcrumbFactory = void 0;
var key_crawler_1 = require("key-crawler");
/**
 * Traverses through the children of each node in a content tree, by said child's index.
 * @class
 * @property {RouteLinkFactory} linkFactory - generates the link summaries for each step in the trail
 */
var BreadcrumbFactory = /** @class */ (function () {
    function BreadcrumbFactory(linkFactory) {
        this.linkFactory = linkFactory;
    }
    /**
     * Creates link data for every step along the provided route.
     * @function
     * @param {TraversalRoute} route - route to be processed
     * @returns {HyperlinkSummary[]}
     */
    BreadcrumbFactory.prototype.getRouteLinks = function (route) {
        var links = [];
        var currentRoute = (0, key_crawler_1.cloneRoute)(route);
        while (currentRoute.path.length > 0) {
            if (currentRoute.target != null &&
                typeof currentRoute.target === 'object' &&
                !Array.isArray(currentRoute.target)) {
                var link = this.linkFactory.getRouteLink(currentRoute);
                links.unshift(link);
            }
            // Move up to parent route.
            var maxIndex = currentRoute.path.length - 1;
            var lastVertex = currentRoute.vertices[maxIndex];
            if (lastVertex == null)
                break;
            currentRoute.target = lastVertex.value;
            currentRoute.vertices.pop();
            currentRoute.path.pop();
        }
        return links;
    };
    return BreadcrumbFactory;
}());
exports.BreadcrumbFactory = BreadcrumbFactory;
