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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SamplePagePermissions = exports.SampleDocumentPermissions = exports.ContentPermissionsReader = exports.IndexedContentTreeCrawler = exports.ContentCrawler = exports.getValidIndexedNodeVertex = exports.IndexedNodeVertex = exports.getValidContentNodeVertex = exports.ContentNodeVertex = exports.getPagesById = exports.publishItem = void 0;
var key_crawler_1 = require("key-crawler");
function publishItem(item, author, version) {
    var entry = {
        as: item.id,
        by: author,
        on: new Date(),
        version: version
    };
    if (item.published != null) {
        item.published.push(entry);
    }
    else {
        item.published = [entry];
    }
}
exports.publishItem = publishItem;
/**
 * Retrieve a mapping of pages by their id property.
 * @function
 * @param {Array<PageTreeNode<CT>>} pages - list of pages to evaluate
 * @param {Record<string, Array<PageTreeNode<CT>>>} results - optional starting point for mapping
 * @returns {Record<string, Array<PageTreeNode<CT>>>}
 */
function getPagesById(pages, results) {
    var e_1, _a;
    if (results === void 0) { results = {}; }
    try {
        for (var pages_1 = __values(pages), pages_1_1 = pages_1.next(); !pages_1_1.done; pages_1_1 = pages_1.next()) {
            var page = pages_1_1.value;
            if (page.id != null && page.id !== '') {
                if (page.id in results) {
                    results[page.id].push(page);
                }
                else {
                    results[page.id] = [page];
                }
            }
            if (page.children != null) {
                getPagesById(page.children, results);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (pages_1_1 && !pages_1_1.done && (_a = pages_1.return)) _a.call(pages_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return results;
}
exports.getPagesById = getPagesById;
/**
 * Used to traverse through the children and content of a content node.
 * @class
 * @extends DefinedObjectVertex
 */
var ContentNodeVertex = /** @class */ (function (_super) {
    __extends(ContentNodeVertex, _super);
    function ContentNodeVertex(source) {
        return _super.call(this, source, ['content', 'children']) || this;
    }
    return ContentNodeVertex;
}(key_crawler_1.DefinedObjectVertex));
exports.ContentNodeVertex = ContentNodeVertex;
/**
 * Generates a ContentNodeVertex for objects with a content property.  Used as a VertexFactoryCallback.
 * @function
 * @param {UntypedObject} source - object the vertex is built around
 * @returns {ValueVertex | undefined}
 */
function getValidContentNodeVertex(source) {
    if ('content' in source) {
        return new ContentNodeVertex(source);
    }
}
exports.getValidContentNodeVertex = getValidContentNodeVertex;
/**
 * Used to traverse through the children of a content node by the child's index.
 * @class
 * @extends ValueLookupVertex<UntypedObject, number, UntypedObject>
 */
var IndexedNodeVertex = /** @class */ (function (_super) {
    __extends(IndexedNodeVertex, _super);
    function IndexedNodeVertex(source) {
        return _super.call(this, source, ['children', '$key']) || this;
    }
    return IndexedNodeVertex;
}(key_crawler_1.ValueLookupVertex));
exports.IndexedNodeVertex = IndexedNodeVertex;
/**
 * Generates a IndexedNodeVertex for objects with a content property.  Used as a VertexFactoryCallback.
 * @function
 * @param {UntypedObject} source - object the vertex is built around
 * @returns {ValueVertex | undefined}
 */
function getValidIndexedNodeVertex(source) {
    if ('content' in source) {
        return new IndexedNodeVertex(source);
    }
}
exports.getValidIndexedNodeVertex = getValidIndexedNodeVertex;
/**
 * Traverses through the children and contents of each node in a content tree.
 * @class
 * @extends KeyCrawler
 */
var ContentCrawler = /** @class */ (function (_super) {
    __extends(ContentCrawler, _super);
    function ContentCrawler(strategy) {
        var convertor = new key_crawler_1.ValueVertexFactory([
            getValidContentNodeVertex
        ]);
        return _super.call(this, strategy, convertor) || this;
    }
    return ContentCrawler;
}(key_crawler_1.KeyCrawler));
exports.ContentCrawler = ContentCrawler;
/**
 * Traverses through the children of each node in a content tree, by said child's index.
 * @class
 * @extends KeyCrawler
 */
var IndexedContentTreeCrawler = /** @class */ (function (_super) {
    __extends(IndexedContentTreeCrawler, _super);
    function IndexedContentTreeCrawler(strategy) {
        var convertor = new key_crawler_1.ValueVertexFactory([
            getValidIndexedNodeVertex
        ]);
        return _super.call(this, strategy, convertor) || this;
    }
    return IndexedContentTreeCrawler;
}(key_crawler_1.KeyCrawler));
exports.IndexedContentTreeCrawler = IndexedContentTreeCrawler;
/**
 * Handles determining permissions for LockableContent.
 * @class
 * @property {TextMatchCallback} matchTokens - matches access tokens to permission excption tokens
 */
var ContentPermissionsReader = /** @class */ (function () {
    function ContentPermissionsReader(matchTokens) {
        if (matchTokens === void 0) { matchTokens = function (a, b) { return a === b; }; }
        this.matchTokens = matchTokens;
    }
    /**
     * Extracts a given user's permissions for the target content lock.
     * @function
     * @param {ContentLock} lock - content lock to be checked
     * @param {string[]} accessTokens - tokens to be matched to the lock
     * @returns {Permissions}
     */
    ContentPermissionsReader.prototype.getContentLockPermissions = function (lock, accessTokens) {
        var e_2, _a;
        var _this = this;
        var permissions = lock.permissions != null
            ? (typeof lock.permissions === 'object'
                ? __assign({}, lock.permissions) : lock.permissions)
            : false;
        if (lock.exceptions != null) {
            var _loop_1 = function (exception) {
                var matched = accessTokens.some(function (token) { return _this.matchTokens(token, exception.token); });
                if (matched) {
                    if (typeof exception.changes === 'object') {
                        if (typeof permissions !== 'object') {
                            permissions = {};
                        }
                        Object.assign(permissions, exception.changes);
                    }
                    else {
                        permissions = exception.changes;
                        if (permissions)
                            return "break";
                    }
                }
            };
            try {
                for (var _b = __values(lock.exceptions), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var exception = _c.value;
                    var state_1 = _loop_1(exception);
                    if (state_1 === "break")
                        break;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return permissions;
    };
    /**
     * Extracts a given user's permissions for the target route's content.
     * @function
     * @param {TraversalRoute} route - route to the target contennt
     * @param {string[]} accessTokens - tokens to be matched to the lock
     * @returns {Permissions}
     */
    ContentPermissionsReader.prototype.getRoutePermissions = function (route, accessTokens) {
        var targetLock = this.getContentLockOf(route.target);
        if (targetLock != null) {
            return this.getContentLockPermissions(targetLock, accessTokens);
        }
        for (var i = route.vertices.length - 1; i >= 0; i--) {
            var vertex = route.vertices[i];
            var lock = this.getContentLockOf(vertex.value);
            if (lock != null) {
                return this.getContentLockPermissions(lock, accessTokens);
            }
        }
        return true;
    };
    /**
     * Extracts an object's content lock, if any.
     * @function
     * @param {any} source - item to be evaluated
     * @param {string} key - property to check for a lock
     * @returns {ContentLock | undefined}
     */
    ContentPermissionsReader.prototype.getContentLockOf = function (source, key) {
        if (key === void 0) { key = 'lock'; }
        if (typeof source === 'object' &&
            source != null &&
            key in source) {
            var lock = source[key];
            if (typeof lock === 'object') {
                return lock;
            }
        }
    };
    /**
     * Extracts a particular permission from permission set.
     * @function
     * @param {Permissions | undefined} permissions - source of target permission
     * @param {string} key - name of permission to check
     * @param {boolean} defaultValue - value to return if key does not apply
     * @returns {boolean}
     */
    ContentPermissionsReader.prototype.getPermission = function (permissions, key, defaultValue) {
        var _a;
        if (defaultValue === void 0) { defaultValue = false; }
        if (typeof permissions === 'object') {
            return (_a = permissions[key]) !== null && _a !== void 0 ? _a : defaultValue;
        }
        return permissions !== null && permissions !== void 0 ? permissions : defaultValue;
    };
    /**
     * Extracts specific permissions using a default value map.
     * @function
     * @param {Permissions | undefined} permissions - source of target permissions
     * @param {Record<string, boolean>} defaults - keys to return and their associated default values
     * @returns {Record<string, boolean>}
     */
    ContentPermissionsReader.prototype.getPermissionSubset = function (permissions, defaults) {
        var results = {};
        if (typeof permissions === 'object') {
            for (var key in defaults) {
                results[key] = key in permissions
                    ? permissions[key]
                    : defaults[key];
            }
        }
        else {
            var value = permissions === true;
            for (var key in defaults) {
                results[key] = value;
            }
        }
        return results;
    };
    return ContentPermissionsReader;
}());
exports.ContentPermissionsReader = ContentPermissionsReader;
var SampleDocumentPermissions;
(function (SampleDocumentPermissions) {
    SampleDocumentPermissions["EDIT_STYLE"] = "editStyle";
})(SampleDocumentPermissions || (exports.SampleDocumentPermissions = SampleDocumentPermissions = {}));
var SamplePagePermissions;
(function (SamplePagePermissions) {
    SamplePagePermissions["VIEW"] = "view";
    SamplePagePermissions["EDIT_CONTENT"] = "editContent";
    SamplePagePermissions["EDIT_CHILDREN"] = "editChildren";
    SamplePagePermissions["REMOVE"] = "remove";
    SamplePagePermissions["RENAME"] = "rename";
    SamplePagePermissions["PUBLISH"] = "publish";
    SamplePagePermissions["LOCK"] = "lock";
    SamplePagePermissions["UNLOCK"] = "unlock";
})(SamplePagePermissions || (exports.SamplePagePermissions = SamplePagePermissions = {}));
