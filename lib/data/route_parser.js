"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.NamedPageRouteParser = exports.PageTreeSearchResolver = void 0;
var key_crawler_1 = require("key-crawler");
var pages_1 = require("../data/pages");
var links_1 = require("../data/links");
var search_1 = require("../data/search");
/**
 * Supports searching by property or index within a content tree.
 * Note that this uses content node vertices by default, allowing searches for page content.
 * @class
 * @extends SearchPathResolver
 * @property {PropertySearchFactory} ruleFactory - generates the search term callbacks used by this resolver
 */
var PageTreeSearchResolver = /** @class */ (function (_super) {
    __extends(PageTreeSearchResolver, _super);
    function PageTreeSearchResolver() {
        var _this = this;
        var ruleFactory = new search_1.PropertySearchFactory(new key_crawler_1.ValueVertexFactory([
            pages_1.getValidContentNodeVertex
        ]));
        _this = _super.call(this, [
            ruleFactory.getPropertySearch(),
            ruleFactory.getKeyCallback()
        ]) || this;
        _this.ruleFactory = ruleFactory;
        return _this;
    }
    return PageTreeSearchResolver;
}(search_1.SearchPathResolver));
exports.PageTreeSearchResolver = PageTreeSearchResolver;
/**
 * Generates name and id based path strings for page content routes.  This also supports reconstructing a route from such a string.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {ReversibleTextParser<CommonKey[]>} pathParser - breaks the pagePath string into it's component keys
 * @property {ReversibleTextParser<ValidKey[]>} contentParser - converts the contentPath string to a key array
 * @property {new PageTreeSearchResolver()} searchResolver - resolves the resulting search path to a route
 * @property {AnyObject} context - root object routes should be generated from
 */
var NamedPageRouteParser = /** @class */ (function () {
    function NamedPageRouteParser(paramParser, contentParser, pathParser, context) {
        if (contentParser === void 0) { contentParser = new links_1.PhasedPathParser(undefined, new links_1.DelimitedPathParser(), new links_1.ValidKeyParser()); }
        if (pathParser === void 0) { pathParser = new links_1.PhasedPathParser(undefined, new links_1.DelimitedPathParser(), new links_1.NumericTextParser()); }
        if (context === void 0) { context = []; }
        this.searchResolver = new PageTreeSearchResolver();
        this.paramParser = paramParser;
        this.pathParser = pathParser;
        this.contentParser = contentParser;
        this.context = context;
    }
    NamedPageRouteParser.prototype.parse = function (source) {
        var strings = this.paramParser.parse(source);
        var params = this.parseRouteStrings(strings);
        var searchPath = this.getSearchPath(params);
        var search = this.searchResolver.resolve(this.context, searchPath, 1);
        return search.results.length > 0
            ? search.results[0]
            : (0, key_crawler_1.createRootRoute)(this.context);
    };
    NamedPageRouteParser.prototype.stringify = function (source) {
        var strings = this.getRouteStrings(source);
        var pathText = this.paramParser.stringify(strings);
        return pathText;
    };
    /**
     * Extracts pathing parameter strings from the provided route
     * @function
     * @param {TraversalRoute} route - route used to generate the strings
     * @returns {Record<string, string>}
     */
    NamedPageRouteParser.prototype.getRouteStrings = function (route) {
        var strings = {};
        var params = this.getRouteParameters(route);
        if (params.pageId != null) {
            strings.pageId = params.pageId;
        }
        if (params.pagePath != null) {
            strings.pagePath = this.pathParser.stringify(params.pagePath);
        }
        if (params.contentPath != null) {
            strings.contentPath = this.contentParser.stringify(params.contentPath);
        }
        return strings;
    };
    /**
     * Converts parameter strings to path arrays.
     * @function
     * @param {Record<string, string>} strings - string map to be evaluated
     * @returns {NamedPageRouteParameters}
     */
    NamedPageRouteParser.prototype.parseRouteStrings = function (strings) {
        var params = {};
        if (strings.pageId != null) {
            params.pageId = strings.pageId;
        }
        if (strings.pagePath != null) {
            params.pagePath = this.pathParser.parse(strings.pagePath);
        }
        if (strings.contentPath != null) {
            params.contentPath = this.contentParser.parse(strings.contentPath);
        }
        return params;
    };
    /**
     * Extracts pathing parameters from the provided route
     * @function
     * @param {TraversalRoute} route - route used to generate the strings
     * @returns {NamedPageRouteParameters}
     */
    NamedPageRouteParser.prototype.getRouteParameters = function (route) {
        var params = {};
        var basePath = route.path;
        var contentIndex = basePath.indexOf('content');
        if (contentIndex >= 0) {
            params.contentPath = basePath.slice(contentIndex + 1);
            basePath = basePath.slice(0, contentIndex);
        }
        var noName = true;
        for (var i = basePath.length - 1; i >= 0; i--) {
            var vertexIndex = i + 1;
            var target = vertexIndex < route.vertices.length
                ? route.vertices[vertexIndex].value
                : route.target;
            if (typeof target === 'object' &&
                target != null) {
                if ('id' in target) {
                    params.pageId = String(target.id);
                    break;
                }
                if ('localName' in target) {
                    if (params.pagePath == null) {
                        params.pagePath = [];
                    }
                    params.pagePath.unshift(String(target.localName));
                    noName = false;
                }
                else if (noName) {
                    var key = basePath[i];
                    if (typeof key === 'number') {
                        if (params.pagePath == null) {
                            params.pagePath = [];
                        }
                        params.pagePath.unshift(key);
                    }
                }
            }
        }
        return params;
    };
    /**
     * Extracts a search path from the provided route parameters.
     * @function
     * @param {NamedPageRouteParameters} params - parameters to be evaluated
     * @returns {Array<KeyValuePair | ValidKey>}
     */
    NamedPageRouteParser.prototype.getSearchPath = function (params) {
        var e_1, _a;
        var steps = [];
        if (params.pageId != null) {
            steps.push({
                key: 'id',
                value: params.pageId
            });
        }
        if (params.pagePath != null) {
            try {
                for (var _b = __values(params.pagePath), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var step = _c.value;
                    if (typeof step === 'string') {
                        steps.push({
                            key: 'localName',
                            value: step
                        });
                    }
                    else {
                        if (steps.length > 0) {
                            steps.push('children');
                        }
                        steps.push(step);
                    }
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
        if (params.contentPath != null && params.contentPath.length > 0) {
            steps.push('content');
            steps = steps.concat(params.contentPath);
        }
        return steps;
    };
    return NamedPageRouteParser;
}());
exports.NamedPageRouteParser = NamedPageRouteParser;
