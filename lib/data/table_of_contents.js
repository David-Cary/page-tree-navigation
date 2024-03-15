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
        this.permissionsReader = new pages_1.ContentPermissionsReader();
        this.linkFactory = linkFactory;
    }
    TableOfContentsFactory.prototype.checkNodePermission = function (source, key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = false; }
        if (key !== '' &&
            typeof source === 'object' &&
            'permissions' in source) {
            if ((typeof source.permissions === 'object' &&
                source.permissions != null) ||
                typeof source.permissions === 'boolean') {
                return this.permissionsReader.getPermission(source.permissions, key, defaultValue);
            }
        }
        return true;
    };
    /**
     * Converts a collection of content nodes to their matching table of contents entries.
     * @function
     * @param {ContentNode[]} source - nodes to be evaluated
     * @returns {TableOfContentsNode[]}
     */
    TableOfContentsFactory.prototype.mapContentNodes = function (source, accessTokens, viewPermission) {
        var _this = this;
        if (accessTokens === void 0) { accessTokens = []; }
        if (viewPermission === void 0) { viewPermission = ''; }
        var results = this.contentCrawler.mapValue(source, function (state) {
            var value = _this.mapRoute(state.route, accessTokens);
            if (!_this.checkNodePermission(value, viewPermission, true)) {
                state.skipIteration = true;
            }
            return value;
        }, function (target, key, value) {
            _this.addNodeChild(target, key, value);
        });
        if (Array.isArray(results)) {
            var rows = results;
            this.pruneHiddenNodes(rows, viewPermission);
            return rows;
        }
        return [];
    };
    /**
     * Tries to generate a table of contents node for a particular route.
     * @function
     * @param {TraversalRoute} route - route used to generate the node
     * @returns {TableOfContentsNode}
     */
    TableOfContentsFactory.prototype.mapRoute = function (route, accessTokens) {
        if (accessTokens === void 0) { accessTokens = []; }
        if (typeof route.target === 'object' &&
            route.target != null &&
            !Array.isArray(route.target)) {
            var node = {
                link: this.linkFactory.getRouteLink(route),
                children: []
            };
            var lock = this.permissionsReader.getContentLockOf(route.target);
            if (lock != null) {
                node.permissions = this.permissionsReader.getContentLockPermissions(lock, accessTokens);
            }
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
    TableOfContentsFactory.prototype.pruneHiddenNodes = function (nodes, viewPermission) {
        if (viewPermission === void 0) { viewPermission = ''; }
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = nodes[i];
            if (this.permissionsReader.getPermission(node.permissions, viewPermission, true)) {
                this.pruneHiddenNodes(node.children, viewPermission);
            }
            else {
                nodes.splice(i, 1);
            }
        }
    };
    return TableOfContentsFactory;
}());
exports.TableOfContentsFactory = TableOfContentsFactory;
