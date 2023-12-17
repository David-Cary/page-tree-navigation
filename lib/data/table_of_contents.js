"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableOfContentsFactory = void 0;
var pages_1 = require("../data/pages");
var TableOfContentsFactory = /** @class */ (function () {
    function TableOfContentsFactory(linkFactory) {
        this.contentCrawler = new pages_1.IndexedContentTreeCrawler();
        this.linkFactory = linkFactory;
    }
    TableOfContentsFactory.prototype.mapContentNodes = function (source) {
        var _this = this;
        var results = this.contentCrawler.mapValue(source, function (state) { return _this.mapRoute(state.route); }, function (target, key, value) { _this.addNodeChild(target, key, value); });
        if (Array.isArray(results)) {
            return results;
        }
        return [];
    };
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
