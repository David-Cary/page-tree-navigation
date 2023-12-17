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
exports.IndexedContentTreeCrawler = exports.ContentCrawler = exports.getValidIndexedNodeVertex = exports.IndexedNodeVertex = exports.getValidContentNodeVertex = exports.ContentNodeVertex = void 0;
var key_crawler_1 = require("key-crawler");
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
