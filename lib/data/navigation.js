"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearTreeNavigator = void 0;
var key_crawler_1 = require("key-crawler");
var LinearTreeNavigator = /** @class */ (function () {
    function LinearTreeNavigator(crawler) {
        this.crawler = crawler;
    }
    LinearTreeNavigator.prototype.getFirstNodeRoute = function (source) {
        var route = this.crawler.createRouteFrom(source, [0]);
        return route;
    };
    LinearTreeNavigator.prototype.getLastNodeRoute = function (source) {
        var route = this.crawler.createRouteFrom(source, []);
        this.goToLastDescendant(route);
        return route;
    };
    LinearTreeNavigator.prototype.goToNextNode = function (route) {
        // Try advancing to first child.
        var initialDepth = route.path.length;
        this.crawler.extendRouteByIndices(route, [0]);
        if (route.path.length > initialDepth)
            return;
        // Work our way up the tree looking for next page.
        while (route.path.length > 0) {
            // Check next sibling.
            var maxPathIndex = route.path.length - 1;
            var vertex = route.vertices[maxPathIndex];
            if (vertex != null && 'keyProvider' in vertex) {
                var keyedVertex = vertex;
                var childIndex = Number(route.path[maxPathIndex]);
                if (isNaN(childIndex))
                    break;
                var siblingKey = keyedVertex.getIndexedKey(childIndex + 1);
                if (siblingKey !== undefined) {
                    route.target = keyedVertex.getKeyValue(siblingKey);
                    if (route.target != null) {
                        route.path[maxPathIndex] = siblingKey;
                        return;
                    }
                }
            }
            else
                break;
            // Move up to parent to check it's sibling.
            this.crawler.revertRoute(route);
        }
        // We're at last page so clear target.
        route.target = null;
    };
    LinearTreeNavigator.prototype.getNextNodeRoute = function (route) {
        var cloned = (0, key_crawler_1.cloneRoute)(route);
        this.goToNextNode(cloned);
        return cloned;
    };
    LinearTreeNavigator.prototype.goToPreviousNode = function (route) {
        // If this is the first child, roll up to the parent.
        var maxPathIndex = route.path.length - 1;
        var lastKey = route.path[maxPathIndex];
        var lastIndex = Number(lastKey);
        if (lastIndex === 0) {
            this.crawler.revertRoute(route);
            // If this rolls us back to the root, clear the target.
            if (route.path.length <= 0) {
                route.target = null;
            }
        }
        else if (!isNaN(lastIndex)) {
            // If we have a prior sibling, use it's last descendant.
            var previousIndex = lastIndex - 1;
            this.crawler.revertRoute(route);
            this.crawler.extendRoute(route, [previousIndex]);
            this.goToLastDescendant(route);
        }
    };
    LinearTreeNavigator.prototype.getPreviousNodeRoute = function (route) {
        var cloned = (0, key_crawler_1.cloneRoute)(route);
        this.goToPreviousNode(cloned);
        return cloned;
    };
    LinearTreeNavigator.prototype.goToLastDescendant = function (route) {
        var priorDepth;
        do {
            priorDepth = route.path.length;
            this.crawler.extendRouteByIndices(route, [-1]);
        } while (route.path.length > priorDepth);
    };
    return LinearTreeNavigator;
}());
exports.LinearTreeNavigator = LinearTreeNavigator;
