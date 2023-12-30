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
exports.PropertySearchFactory = exports.SearchTermCallbackFactory = exports.SearchPathResolver = void 0;
var key_crawler_1 = require("key-crawler");
/**
 * Tries to find the route to a matching tree node given a series of search terms where each step referes to a descendant of the previous term's match.
 * @class
 * @property {SearchTermCallback[]} termRules - list of callbacks used to resolve each term in the path
 */
var SearchPathResolver = /** @class */ (function () {
    function SearchPathResolver(termRules) {
        if (termRules === void 0) { termRules = []; }
        this.termRules = termRules;
    }
    /**
     * Tries to retrieve the nodes matching the provided search path.
     * @function
     * @param {AnyObject} context - collection to perform the search on
     * @param {Array<ValueMap | ValidKey>} path - series of search terms to be applied
     * @param {number} maxResults - stop once we get this many matches
     * @returns {SearchResponse}
     */
    SearchPathResolver.prototype.resolve = function (context, path, maxResults) {
        var search = {
            state: (0, key_crawler_1.createRootState)(context),
            results: []
        };
        this.extendSearch(search, path, maxResults);
        return search;
    };
    /**
     * Helper function used to resolve the remaining steps in a search path.
     * @function
     * @param {AnyObject} context - collection to perform the search on
     * @param {Array<ValueMap | ValidKey>} steps - remaining search terms to be processed
     * @param {number} maxResults - stop once we get this many matches
     */
    SearchPathResolver.prototype.extendSearch = function (search, steps, maxResults) {
        var e_1, _a;
        var _this = this;
        if (maxResults === void 0) { maxResults = Number.POSITIVE_INFINITY; }
        if (steps.length <= 0)
            return;
        var step = steps[0];
        var substeps = steps.slice(1);
        var previouslyVisited = search.state.visited;
        search.state.visited = [];
        try {
            for (var _b = __values(this.termRules), _c = _b.next(); !_c.done; _c = _b.next()) {
                var callback = _c.value;
                var matched = callback(search.state, step, function (state) {
                    if (substeps.length > 0) {
                        _this.extendSearch(search, substeps, maxResults);
                    }
                    else {
                        var snapshot = (0, key_crawler_1.cloneRoute)(state.route);
                        search.results.push(snapshot);
                        if (search.results.length >= maxResults) {
                            state.completed = true;
                        }
                    }
                });
                if (matched)
                    break;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        search.state.visited = previouslyVisited;
    };
    return SearchPathResolver;
}());
exports.SearchPathResolver = SearchPathResolver;
/**
 * Generates a particular type of SearchTermCallback.
 * @class
 * @property {ValueVertexFactory} vertexFactory - provides value vertices to traversal functions
 * @property {DepthFirstSearch} depthFirstSearch - provides basic traversal functionality
 */
var SearchTermCallbackFactory = /** @class */ (function () {
    function SearchTermCallbackFactory(vertexFactory) {
        this.depthFirstSearch = new key_crawler_1.DepthFirstSearch();
        this.vertexFactory = vertexFactory;
    }
    /**
     * Generates callbacks that traverse the current node's descendants and relay matches for each node that fits it's check function's criteria.
     * @function
     * @param {SearchCheckCallback} getCheck - generates a state evaluation callback if the term meets it's criteria
     * @param {boolean} shallow - if set to true the traversal will not extend to descendants of a matching node
     * @returns {SearchTermCallback}
     */
    SearchTermCallbackFactory.prototype.getSearchCallback = function (getCheck, shallow) {
        var _this = this;
        if (shallow === void 0) { shallow = false; }
        return function (state, term, visit) {
            var check = getCheck(term);
            if (check == null)
                return false;
            _this.depthFirstSearch.extendTraversal(state, function (state) {
                var matched = check(state);
                if (matched) {
                    visit(state);
                    if (shallow) {
                        state.skipIteration = true;
                    }
                }
            }, _this.vertexFactory);
            return true;
        };
    };
    /**
     * Generates a callback that treats the provided search term as a traversal key, as per resolveKey.
     * @function
     * @returns {SearchTermCallback}
     */
    SearchTermCallbackFactory.prototype.getKeyCallback = function () {
        var _this = this;
        return function (state, term, visit) { return _this.resolveKey(state, term, visit); };
    };
    /**
     * Treats the provided search term as a traversal key, meaning it only gets checked against the current node's children.
     * @function
     * @param {TraversalState} state - current traversal state
     * @param {ValueMap | ValidKey} term - search term to be used
     * @param {(state: TraversalState) => void} visit - callback to be executed on the matching child
     * @returns {boolean} true if term is a valid key
     */
    SearchTermCallbackFactory.prototype.resolveKey = function (state, term, visit) {
        if (typeof term === 'object')
            return false;
        var targetValue = state.route.target;
        if (typeof targetValue === 'object' && targetValue !== null) {
            var targetObject = targetValue;
            var vertex = this.vertexFactory.createVertex(targetObject);
            if ('keyProvider' in vertex) {
                var keyedVertex = vertex;
                state.route.vertices.push(keyedVertex);
                state.route.path.push(term);
                state.route.target = keyedVertex.getKeyValue(term);
                if (state.route.target !== undefined) {
                    visit(state);
                }
            }
        }
        return true;
    };
    return SearchTermCallbackFactory;
}());
exports.SearchTermCallbackFactory = SearchTermCallbackFactory;
/**
 * Generates callbacks that search for nodes with a specified property value.
 * @class
 * @extends SearchTermCallbackFactory
 */
var PropertySearchFactory = /** @class */ (function (_super) {
    __extends(PropertySearchFactory, _super);
    function PropertySearchFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Generates a property check callback so long as the provided term is a valid key value pair.
     * @function
     * @param {ValueMap | ValidKey} term - search term to be used
     * @returns {((state: TraversalState) => boolean) | undefined}
     */
    PropertySearchFactory.prototype.getPropertyCheckFor = function (term) {
        if (typeof term === 'object' && 'key' in term) {
            var key_1 = String(term.key);
            return function (state) {
                var target = state.route.target;
                return typeof target === 'object' &&
                    target != null &&
                    key_1 in target &&
                    target[key_1] === term.value;
            };
        }
    };
    /**
     * Generates a search callback that relays a match for each node with the given property value.
     * @function
     * @param {boolean} shallow - if set to true the traversal will not extend to descendants of a matching node
     * @returns {SearchTermCallback}
     */
    PropertySearchFactory.prototype.getPropertySearch = function (shallow) {
        if (shallow === void 0) { shallow = false; }
        return this.getSearchCallback(this.getPropertyCheckFor, shallow);
    };
    return PropertySearchFactory;
}(SearchTermCallbackFactory));
exports.PropertySearchFactory = PropertySearchFactory;
