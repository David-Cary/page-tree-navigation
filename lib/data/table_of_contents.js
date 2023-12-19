"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableOfContentsFactory = void 0;
var pages_1 = require("../data/pages");
/**
 * Generates a table of contents description from a content node tree.
 * @class
 * @property {RouteLinkFactory} linkFactory - generates links for each content node
 * @property {IndexedContentTreeCrawler} contentCrawler - traverses the content tree
 */
var TableOfContentsFactory = /** @class */ (function () {
    function TableOfContentsFactory(linkFactory) {
        this.contentCrawler = new pages_1.IndexedContentTreeCrawler();
        this.linkFactory = linkFactory;
    }
    /**
     * Converts a collection of content nodes to their matching table of contents entries.
     * @function
     * @param {ContentNode[]} source - nodes to be evaluated
     * @returns {TableOfContentsNode[]}
     */
    TableOfContentsFactory.prototype.mapContentNodes = function (source) {
        var _this = this;
        var results = this.contentCrawler.mapValue(source, function (state) { return _this.mapRoute(state.route); }, function (target, key, value) { _this.addNodeChild(target, key, value); });
        if (Array.isArray(results)) {
            return results;
        }
        return [];
    };
    /**
     * Tries to generate a table of contents node for a particular route.
     * @function
     * @param {TraversalRoute} route - route used to generate the node
     * @returns {TableOfContentsNode}
     */
    TableOfContentsFactory.prototype.mapRoute = function (route) {
        if (typeof route.target === 'object' &&
            route.target != null &&
            !Array.isArray(route.target)) {
            var node = {
                link: this.linkFactory.getRouteLink(route),
                children: []
            };
            return node;
        }
        return [];
    };
    /**
     * Utility function for adding a member to a node's child list.
     * @function
     * @param {AnyObject} target - node we're adding to
     * @param {ValidKey} key - target child index
     * @param {any} value - child node to be added
     */
    TableOfContentsFactory.prototype.addNodeChild = function (target, key, value) {
        if ('children' in target && Array.isArray(target.children)) {
            var index = Number(key);
            target.children[index] = value;
        }
        else {
            this.contentCrawler.setChildValue(target, key, value);
        }
    };
    return TableOfContentsFactory;
}());
exports.TableOfContentsFactory = TableOfContentsFactory;
