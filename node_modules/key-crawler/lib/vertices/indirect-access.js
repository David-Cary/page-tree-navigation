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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectCharacterPrefix = exports.validateEnclosedKey = exports.MapVertex = exports.NestedCollectionVertex = exports.ValueLookupVertex = exports.getDirectAccessPath = exports.getNestedProperty = exports.resolvePropertyRequest = void 0;
var value_vertices_1 = require("./value-vertices");
/**
 * Tries to get a certain property value or call an appropriate accessor to get such a value.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyAccessStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
function resolvePropertyRequest(source, request) {
    if (Array.isArray(source)) {
        var index = Number(request);
        return isNaN(index) ? undefined : source[index];
    }
    else {
        var sourceObject = source;
        if (typeof request === 'object') {
            if ('name' in request && 'args' in request) {
                var callRequest = request;
                var property = source[callRequest.name];
                if (typeof property === 'function') {
                    return property.apply(source, callRequest.args);
                }
            }
            return undefined;
        }
        return sourceObject[request];
    }
}
exports.resolvePropertyRequest = resolvePropertyRequest;
/**
 * Tries to retrive a nested value from an object given a particular key path.
 * @function
 * @param {AnyObject} root - top level object we're trying to get the value from
 * @param {ValidKey[]} path - keys to iterate over to reach the target value
 * @returns {unknown} retrieved value for the given path (may be undefined the path was invalid)
 */
function getNestedProperty(root, path) {
    var maxIndex = path.length - 1;
    if (maxIndex < 0)
        return root;
    var target = root;
    for (var i = 0; i < maxIndex; i++) {
        var key = path[i];
        var nextTarget = resolvePropertyRequest(target, key);
        if (typeof nextTarget === 'object') {
            target = nextTarget;
        }
        else {
            return undefined;
        }
    }
    var finalKey = path[maxIndex];
    return resolvePropertyRequest(target, finalKey);
}
exports.getNestedProperty = getNestedProperty;
/**
 * Tries to expand a vertex key based path into the terms that could be used to navigate those vertices values directly.
 * @function
 * @param {ValidKey[]} path - key based path to be converted
 * @param {KeyValueVertex[]} vertices - list of matching vertices for each key value
 * @returns {ValidKey[]} extrapolated direct access path
 */
function getDirectAccessPath(path, vertices) {
    var results = [];
    for (var i = 0; i < path.length; i++) {
        var key = path[i];
        var vertex = vertices[i];
        if (vertex != null && 'getPathFor' in vertex) {
            var indirectVertex = vertex;
            var subpath = indirectVertex.getPathFor(key);
            results = results.concat(subpath);
        }
        else {
            results.push(key);
        }
    }
    return results;
}
exports.getDirectAccessPath = getDirectAccessPath;
/**
 * Tries to get the vertex key based path given the path needed to access the target directly through those vertiices' sources.
 * This can be used to decode the path provided by 'getDirectAccessPath'.
 * @function
 * @param {ValidKey[]} path - direct path to the target value within the source context
 * @param {KeyValueVertex[]} vertices - list of matching vertices for the primary objects along the target path
 * @returns {K | undefined} extrapolated vertex key path
 */
/*
export function abbreviateDirectAccessPath (
  path: ValidKey[],
  vertices: KeyValueVertex[]
): ValidKey[] | undefined {
  const results: ValidKey[] = []
  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    const vertex = vertices[i]
    if ('getPathFor' in vertex) {
      const indirectVertex = vertex as IndirectAccessVertex
      const subpath = indirectVertex.getPathFor(path, i)
      if (subpath != null) {
        results.push(subpath.key)
        if (subpath.expansion.length > 1) {
          i += subpath.expansion.length - 1
        }
      } else return
    } else {
      results.push(key)
    }
  }
  return results
}
*/
/**
 * These vertices handle objects where key value lookup are performed on a specific nested property.
 * A good example would tree node style objects where each branch is stored in the object's 'children' property.
 * @class
 * @implements {IndirectAccessVertex<AnyObject, ValidKey, unknown>}
 * @property {ValueVertexFactory} vertexFactory - vertex factory to be used to handle pathing through any nested contents of this vertex
 */
var ValueLookupVertex = /** @class */ (function (_super) {
    __extends(ValueLookupVertex, _super);
    function ValueLookupVertex(value, path, alias) {
        if (alias === void 0) { alias = '$key'; }
        var _this = _super.call(this, value) || this;
        _this.pathTemplate = path;
        _this.keyAlias = alias;
        return _this;
    }
    ValueLookupVertex.prototype.getPathFor = function (key) {
        var _this = this;
        return this.pathTemplate.map(function (step) {
            switch (typeof step) {
                case 'string': {
                    if (step === _this.keyAlias) {
                        return key;
                    }
                    break;
                }
                case 'object': {
                    if (step != null && 'args' in step) {
                        var request = step;
                        return {
                            name: request.name,
                            args: request.args.map(function (arg) { return arg === _this.keyAlias ? key : arg; })
                        };
                    }
                }
            }
            return step;
        });
    };
    return ValueLookupVertex;
}(value_vertices_1.ObjectVertex));
exports.ValueLookupVertex = ValueLookupVertex;
/**
 * These vertices handle objects where key value lookup are performed on a specific nested property.
 * A good example would tree node style objects where each branch is stored in the object's 'children' property.
 * @class
 * @implements {IndirectAccessVertex<AnyObject, ValidKey, unknown>}
 * @property {ValueVertexFactory} vertexFactory - vertex factory to be used to handle pathing through any nested contents of this vertex
 */
var NestedCollectionVertex = /** @class */ (function (_super) {
    __extends(NestedCollectionVertex, _super);
    function NestedCollectionVertex(value, path) {
        var _this = _super.call(this, value) || this;
        _this.collectionPath = path;
        return _this;
    }
    NestedCollectionVertex.prototype.createKeyIterator = function () {
        var collection, _a, _b, _c, _i, key;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    collection = getNestedProperty(this.value, this.collectionPath);
                    _a = collection;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _d.label = 1;
                case 1:
                    if (!(_i < _b.length)) return [3 /*break*/, 4];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 3];
                    key = _c;
                    return [4 /*yield*/, key];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    NestedCollectionVertex.prototype.getIndexedKey = function (index) {
        var e_1, _a;
        if (index >= 0) {
            var count = 0;
            try {
                for (var _b = __values(this.keyProvider), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (count === index) {
                        return key;
                    }
                    count++;
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
        var keys = Object.keys(this.value);
        var wrappedIndex = (0, value_vertices_1.getWrappedIndex)(index, keys.length);
        return keys[wrappedIndex];
    };
    NestedCollectionVertex.prototype.getKeyValue = function (key) {
        var collection = getNestedProperty(this.value, this.collectionPath);
        if (typeof collection === 'object' && collection != null) {
            if (Array.isArray(collection)) {
                var index = Number(key);
                return collection[index];
            }
            return collection[key];
        }
    };
    NestedCollectionVertex.prototype.getKeyIndex = function (key) {
        var e_2, _a;
        var count = 0;
        try {
            for (var _b = __values(this.keyProvider), _c = _b.next(); !_c.done; _c = _b.next()) {
                var targetKey = _c.value;
                if (targetKey === key) {
                    return count;
                }
                count++;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    NestedCollectionVertex.prototype.getPathFor = function (key) {
        return {
            key: key,
            expansion: this.collectionPath.concat([key])
        };
    };
    NestedCollectionVertex.prototype.getSubpathFrom = function (path, startPosition) {
        if (startPosition === void 0) { startPosition = 0; }
        var expansion = [];
        for (var i = 0; i < this.collectionPath.length; i++) {
            var key_1 = this.collectionPath[i];
            var offsetIndex_1 = startPosition + i;
            var step = path[offsetIndex_1];
            if (typeof step === 'object') {
                if (typeof key_1 !== 'object' || step.name !== (key_1 === null || key_1 === void 0 ? void 0 : key_1.name)) {
                    return;
                }
            }
            else {
                if (path[offsetIndex_1] !== key_1)
                    return;
            }
            expansion.push(key_1);
        }
        var offsetIndex = startPosition + this.collectionPath.length;
        var key = path[offsetIndex];
        expansion.push(key);
        return {
            key: key,
            expansion: expansion
        };
    };
    return NestedCollectionVertex;
}(value_vertices_1.ObjectVertex));
exports.NestedCollectionVertex = NestedCollectionVertex;
/**
 * Acts as a vertex wrapper for javascript Maps.
 * @template K, V
 * @class
 * @implements {IndirectAccessVertex<Map<K, V>, K, V>}
 */
var MapVertex = /** @class */ (function () {
    /**
       * @param {Record<ValidKey, V>} value - object to be wrapped by the vertex
       */
    function MapVertex(value) {
        this.value = value;
    }
    Object.defineProperty(MapVertex.prototype, "keyProvider", {
        get: function () {
            return this.createKeyIterator();
        },
        enumerable: false,
        configurable: true
    });
    MapVertex.prototype.createKeyIterator = function () {
        var _a, _b, _c, key, e_3_1;
        var e_3, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 5, 6, 7]);
                    _a = __values(this.value), _b = _a.next();
                    _e.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 4];
                    _c = __read(_b.value, 1), key = _c[0];
                    return [4 /*yield*/, key];
                case 2:
                    _e.sent();
                    _e.label = 3;
                case 3:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_3_1 = _e.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    };
    MapVertex.prototype.getIndexedKey = function (index) {
        var e_4, _a;
        var wrappedIndex = (0, value_vertices_1.getWrappedIndex)(index, this.value.size);
        var count = 0;
        try {
            for (var _b = __values(this.value), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 1), key = _d[0];
                if (count === wrappedIndex) {
                    return key;
                }
                count++;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    MapVertex.prototype.getKeyValue = function (key) {
        return this.value.get(key);
    };
    MapVertex.prototype.getKeyIndex = function (key) {
        var e_5, _a;
        var count = 0;
        try {
            for (var _b = __values(this.value), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 1), targetKey = _d[0];
                if (targetKey === key) {
                    return count;
                }
                count++;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    MapVertex.prototype.getPathFor = function (key) {
        var keyString = typeof key === 'string' ? "'".concat(key, "'") : String(key);
        return {
            key: key,
            expansion: ["get(".concat(keyString, ")")]
        };
    };
    MapVertex.prototype.getSubpathFrom = function (path, startPosition) {
        if (startPosition === void 0) { startPosition = 0; }
        if (path.length > startPosition) {
            var text = String(path[startPosition]);
            return validateEnclosedKey(text, 'get(', ')');
        }
        return undefined;
    };
    return MapVertex;
}());
exports.MapVertex = MapVertex;
/**
 * Checks if the target text follow the provided enclosure rules for a particular key.
 * @function
 * @param {string} target - text to be evaluated
 * @param {string} prefix - opening text for the enclosure
 * @param {string} suffix - closing text for the enclosure
 * @returns {IndirectAccessPathing | undefined} matching pathing data if the text matches the provided enclosures
 */
function validateEnclosedKey(target, prefix, suffix) {
    var formattedPrefix = injectCharacterPrefix(prefix, '()[]{}', '\\');
    var formattedSuffix = injectCharacterPrefix(suffix, '()[]{}', '\\');
    var regExp = new RegExp("".concat(formattedPrefix, "('?(\\w+)'?)").concat(formattedSuffix));
    var match = target.match(regExp);
    if (match != null) {
        var _a = __read(match, 3), expression = _a[0], keyString = _a[1], innerString = _a[2];
        if (expression === target) {
            var key = void 0;
            if (keyString === "'".concat(innerString, "'")) {
                key = innerString;
            }
            else {
                var num = Number(innerString);
                key = isNaN(num) ? innerString : num;
            }
            return {
                key: key,
                expansion: [expression]
            };
        }
    }
}
exports.validateEnclosedKey = validateEnclosedKey;
/**
 * Gets a copy of the provided text with certain characters added before specific character types.
 * This is mainly used for this like ensuring characters are properly encoded for things like use in a regular expression.
 * @function
 * @param {string} source - text to be copied
 * @param {string} characterSet - characters we should be looking for
 * @param {string} prefix - text to insert before each matching character
 * @returns {string} reformatted copy of the provided text
 */
function injectCharacterPrefix(source, characterSet, prefix) {
    var copy = '';
    for (var i = 0; i < source.length; i++) {
        var character = source[i];
        if (characterSet.includes(character)) {
            copy += prefix;
        }
        copy += character;
    }
    return copy;
}
exports.injectCharacterPrefix = injectCharacterPrefix;
