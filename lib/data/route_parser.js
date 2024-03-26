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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamedPageRouteParser = exports.PageContentPathParser = exports.NamedPagePathParser = exports.getNamedPageSearch = exports.RouteSearchParser = exports.SearchPathParser = exports.KeyedPropertySearchParser = exports.PageTreeSearchResolver = void 0;
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
            ruleFactory.getPropertyItemAtCallback(['children', 'content']),
            ruleFactory.getKeyCallback()
        ]) || this;
        _this.ruleFactory = ruleFactory;
        return _this;
    }
    return PageTreeSearchResolver;
}(search_1.SearchPathResolver));
exports.PageTreeSearchResolver = PageTreeSearchResolver;
/**
 * Converts a string to key value pair where the value is the provided string.
 * @class
 * @extends ReversibleTextParser<ValueMap | string>
 * @property {string} key - key to be used in each generated key value pair
 * @property {((value: string) => boolean) | undefined} validate - optional function to check the provided value, resulting in string instead of a key value pair if that check fails
 */
var KeyedPropertySearchParser = /** @class */ (function () {
    function KeyedPropertySearchParser(key, validate) {
        this.key = key;
        this.validate = validate;
    }
    KeyedPropertySearchParser.prototype.parse = function (source) {
        if (this.validate == null || this.validate(source)) {
            var result = {
                key: this.key,
                value: source
            };
            return result;
        }
        return (0, links_1.parseIndexString)(source);
    };
    KeyedPropertySearchParser.prototype.stringify = function (source) {
        return typeof source === 'object' ? String(source.value) : String(source);
    };
    return KeyedPropertySearchParser;
}());
exports.KeyedPropertySearchParser = KeyedPropertySearchParser;
/**
 * Converts the provided search string to a series of search terms and vice versa.
 * @class
 * @extends ReversibleTextParser<Array<ValueMap | ValidKey>>
 * @property {ReversibleTextParser<ValueMap | string> | undefined} headParser - provides special handling to first section of the target path
 * @property {Array<PrefixedPathStepRule<ValueMap | string>>} rules - describes how to handle text segments based on the preceding delimiter
 */
var SearchPathParser = /** @class */ (function () {
    function SearchPathParser(rules, headParser) {
        if (rules === void 0) { rules = []; }
        this.headParser = headParser;
        this.rules = rules;
    }
    SearchPathParser.prototype.parse = function (source) {
        var steps = [];
        var activeRule;
        var priorText = '';
        var remainder = source;
        while (remainder !== '') {
            var matchingRule = this.rules.find(function (rule) { return remainder.startsWith(rule.prefix); });
            if (matchingRule != null) {
                if (activeRule != null) {
                    var substeps = this.parseVia(priorText, activeRule);
                    steps = steps.concat(substeps);
                }
                else if (priorText !== '') {
                    var substep = (this.headParser != null)
                        ? this.headParser.parse(priorText)
                        : (0, links_1.parseIndexString)(priorText);
                    steps.push(substep);
                }
                priorText = '';
                activeRule = matchingRule;
                remainder = remainder.substring(matchingRule.prefix.length);
            }
            else {
                priorText += remainder[0];
                remainder = remainder.substring(1);
            }
        }
        if (activeRule != null) {
            var substeps = this.parseVia(priorText, activeRule);
            steps = steps.concat(substeps);
        }
        else if (priorText !== '') {
            var step = (0, links_1.parseIndexString)(priorText);
            steps.push(step);
        }
        return steps;
    };
    SearchPathParser.prototype.parseVia = function (source, rule) {
        var results = [];
        if (rule.decodedPrefix != null) {
            results.push(rule.decodedPrefix);
        }
        if (rule.parser != null) {
            var term = rule.parser.parse(source);
            results.push(term);
        }
        else {
            var num = Number(source);
            var term = isNaN(num) ? source : num;
            results.push(term);
        }
        return results;
    };
    SearchPathParser.prototype.stringify = function (source) {
        var pathText = '';
        var delimiterRule = this.rules.find(function (rule) { return rule.check == null && rule.decodedPrefix == null; });
        var activeDelimiter;
        var _loop_1 = function (i) {
            var step = source[i];
            var term = typeof step === 'object' ? step : String(step);
            var matchingRule = this_1.rules.find(function (rule) { var _a, _b; return (_b = (_a = rule.check) === null || _a === void 0 ? void 0 : _a.call(rule, term)) !== null && _b !== void 0 ? _b : rule.decodedPrefix === term; });
            if (matchingRule != null) {
                pathText += matchingRule.prefix;
                if (matchingRule.parser != null) {
                    pathText += matchingRule.parser.stringify(term);
                    activeDelimiter = undefined;
                }
                else {
                    activeDelimiter = matchingRule.prefix;
                }
            }
            else if (this_1.headParser != null && i === 0) {
                pathText += this_1.headParser.stringify(term);
            }
            else {
                if (pathText !== '' &&
                    activeDelimiter == null &&
                    delimiterRule != null) {
                    pathText += delimiterRule.prefix;
                }
                pathText += String(step);
                activeDelimiter = undefined;
            }
        };
        var this_1 = this;
        for (var i = 0; i < source.length; i++) {
            _loop_1(i);
        }
        return pathText;
    };
    return SearchPathParser;
}());
exports.SearchPathParser = SearchPathParser;
/**
 * Resolves the provided search string to a traversal route and generates such strings from a route.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Array<ValueMap | ValidKey>>} pathParser - used to convert strings to search paths and vice versa
 * @property {SearchPathResolver} searchResolver - used to resolve a search path to a traversal route
 * @property {GetRouteSearchCallback} getSearch - generates a search path from a traversal route
 * @property {AnyObject} context - object the search should be performed on
 */
var RouteSearchParser = /** @class */ (function () {
    function RouteSearchParser(pathParser, searchResolver, getSearch, context) {
        if (pathParser === void 0) { pathParser = new SearchPathParser(); }
        if (searchResolver === void 0) { searchResolver = new search_1.SearchPathResolver(); }
        if (context === void 0) { context = []; }
        this.pathParser = pathParser;
        this.searchResolver = searchResolver;
        this.getSearch = getSearch;
        this.context = context;
    }
    RouteSearchParser.prototype.parse = function (source) {
        var path = this.pathParser.parse(source);
        var search = this.searchResolver.resolve(this.context, path, 1);
        if (search.results.length > 0) {
            return search.results[0];
        }
        return (0, key_crawler_1.createRootRoute)(this.context);
    };
    RouteSearchParser.prototype.stringify = function (source) {
        var searchPath = this.getSearch(source);
        var pathText = this.pathParser.stringify(searchPath);
        return pathText;
    };
    return RouteSearchParser;
}());
exports.RouteSearchParser = RouteSearchParser;
/**
 * Creates a unique search path to the content targeted to by a given traversal route.
 * @function
 * @param {TraversalRoute} route - traversal route to be evaluated
 * @returns {Array<ValueMap | ValidKey>}
 */
function getNamedPageSearch(route) {
    var steps = [];
    var noName = true;
    for (var i = route.path.length - 1; i >= 0; i--) {
        var vertexIndex = i + 1;
        var target = vertexIndex < route.vertices.length
            ? route.vertices[vertexIndex].value
            : route.target;
        if (typeof target === 'object' &&
            target != null) {
            if ('id' in target) {
                steps.unshift({
                    key: 'id',
                    value: target.id
                });
                break;
            }
            if ('localName' in target) {
                steps.unshift({
                    key: 'localName',
                    value: target.localName
                });
                noName = false;
                continue;
            }
        }
        if (noName) {
            var step = route.path[i];
            steps.unshift(step);
        }
    }
    return steps;
}
exports.getNamedPageSearch = getNamedPageSearch;
/**
 * Provides default handling for searches with path id and local name markers.
 * @class
 * @extends SearchPathParser
 */
var NamedPagePathParser = /** @class */ (function (_super) {
    __extends(NamedPagePathParser, _super);
    function NamedPagePathParser(expanded) {
        if (expanded === void 0) { expanded = false; }
        var rules = [
            {
                name: 'localNameRule',
                prefix: '.~',
                check: function (source) { return typeof source === 'object' && source.key === 'localName'; },
                parser: new KeyedPropertySearchParser('localName')
            },
            {
                name: 'idRule',
                prefix: '~',
                check: function (source) { return typeof source === 'object' && source.key === 'id'; },
                parser: new KeyedPropertySearchParser('id')
            }
        ];
        if (expanded) {
            rules.push({
                name: 'childrenRule',
                prefix: '.',
                decodedPrefix: 'children'
            });
        }
        rules.push({
            name: 'separatorRule',
            prefix: '.'
        });
        return _super.call(this, rules) || this;
    }
    return NamedPagePathParser;
}(SearchPathParser));
exports.NamedPagePathParser = NamedPagePathParser;
/**
 * Handles pathing to page content, with the page path and the content subpath having their own parsers.
 * @class
 * @extends ReversibleTextParser<Array<ValueMap | ValidKey>>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {ReversibleTextParser<Array<ValueMap | ValidKey>>} pageParser - handles the page specific part of the path
 * @property {ReversibleTextParser<string[]>} contentParser - handles the subpath to the page's content
 */
var PageContentPathParser = /** @class */ (function () {
    function PageContentPathParser(paramParser, pageParser, contentParser) {
        if (paramParser === void 0) { paramParser = new links_1.KeyedSegmentsParser(['pagePath', 'contentPath'], '/'); }
        if (pageParser === void 0) { pageParser = new NamedPagePathParser(true); }
        if (contentParser === void 0) { contentParser = new links_1.DelimitedPathParser('.'); }
        this.paramParser = paramParser;
        this.pageParser = pageParser;
        this.contentParser = contentParser;
    }
    PageContentPathParser.prototype.parse = function (source) {
        var params = this.paramParser.parse(source);
        var pagePath = params.pagePath != null
            ? this.pageParser.parse(params.pagePath)
            : [];
        if (params.contentPath != null) {
            var contentPath = this.contentParser.parse(params.contentPath);
            contentPath.unshift('content');
            var fullPath = pagePath.concat(contentPath);
            return fullPath;
        }
        return pagePath;
    };
    PageContentPathParser.prototype.stringify = function (source) {
        var subpaths = this.getSubpaths(source);
        var params = {
            pagePath: this.pageParser.stringify(subpaths.pagePath)
        };
        if (subpaths.contentPath != null) {
            var contentPath = subpaths.contentPath.map(function (step) { return String(step); });
            params.contentPath = this.contentParser.stringify(contentPath);
        }
        var resolvedPath = this.paramParser.stringify(params);
        return resolvedPath;
    };
    PageContentPathParser.prototype.getSubpaths = function (source) {
        var subpaths = {};
        var contentIndex = source.indexOf('content');
        if (contentIndex >= 0) {
            subpaths.pagePath = source.slice(0, contentIndex);
            subpaths.contentPath = source.slice(contentIndex + 1);
        }
        else {
            subpaths.pagePath = source;
        }
        return subpaths;
    };
    return PageContentPathParser;
}());
exports.PageContentPathParser = PageContentPathParser;
/**
 * Generates name and id based path strings for page content routes.  This also supports reconstructing a route from such a string.
 * @class
 * @extends ReversibleTextParser<TraversalRoute>
 * @property {ReversibleTextParser<Record<string, string>>} paramParser - extracts route parameters from a string
 * @property {AnyObject} context - root object routes should be generated from
 */
var NamedPageRouteParser = /** @class */ (function (_super) {
    __extends(NamedPageRouteParser, _super);
    function NamedPageRouteParser(paramParser, context) {
        if (context === void 0) { context = []; }
        return _super.call(this, new PageContentPathParser(paramParser), new PageTreeSearchResolver(), getNamedPageSearch, context) || this;
    }
    return NamedPageRouteParser;
}(RouteSearchParser));
exports.NamedPageRouteParser = NamedPageRouteParser;
