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
exports.DOMNodeVertex = exports.MapVertex = exports.collapseNestedValuePath = exports.expandNestedValuePath = exports.ValueLookupVertex = exports.resolvePropertyLookup = exports.resolvePropertyRequest = exports.executePropertyCall = void 0;
var value_vertices_1 = require("./value-vertices");
/**
 * Performs a call to a function of a given object.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
function executePropertyCall(context, request) {
    if (request.name in context) {
        var value = context[request.name];
        if (typeof value === 'function') {
            return value.apply(null, request.args);
        }
    }
}
exports.executePropertyCall = executePropertyCall;
/**
 * Tries to get a certain property value or call an appropriate accessor to get such a value.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} request - includes the name of the property and may contain arguments if targetting a function
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
function resolvePropertyRequest(source, request) {
    if (typeof request === 'object') {
        return executePropertyCall(source, request);
    }
    return source[request];
}
exports.resolvePropertyRequest = resolvePropertyRequest;
/**
 * Tries to get nested property value by iterating over property references.
 * @function
 * @param {AnyObject} source - object we're trying to get the value from
 * @param {PropertyLookupStep[]} steps - list of steps to be performed as we iterate into the object's contents
 * @returns {unknown} retrieved value for the given request (may be undefined the request was invalid)
 */
function resolvePropertyLookup(source, steps) {
    var target = source;
    var maxIndex = steps.length - 1;
    for (var i = 0; i < maxIndex; i++) {
        var step = steps[i];
        var value = resolvePropertyRequest(source, step);
        if (typeof value === 'object' && value != null) {
            target = value;
        }
        else {
            return undefined;
        }
    }
    var finalStep = steps[maxIndex];
    return resolvePropertyRequest(target, finalStep);
}
exports.resolvePropertyLookup = resolvePropertyLookup;
/**
 * These vertices handle objects where key values are found by iterating into a nested property.
 * A good example would tree node style objects where each branch is stored in the object's 'children' property.
 * @class
 * @implements {KeyValueVertex}
 * @property {PropertyLookupStep[]} pathTemplate - use to create value paths by replacing key references
 * @property {string} keyAlias - value to be considered a key reference when parsing the path template
 * @property {IterableIterator<ValidKey>} createKeyIterator - generates iterable iterators for the target value's keys
 */
var ValueLookupVertex = /** @class */ (function () {
    function ValueLookupVertex(value, path, alias, callback) {
        if (alias === void 0) { alias = '$key'; }
        var _this = this;
        this.value = value;
        this.pathTemplate = path;
        this.keyAlias = alias;
        this.createKeyIterator = (callback != null)
            ? function () { return callback(_this.value); }
            : function () { return _this.createDefaultKeyIterator(); };
    }
    Object.defineProperty(ValueLookupVertex.prototype, "keyProvider", {
        get: function () {
            return this.createKeyIterator();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * This tries create an key generator for the target value using the given path.
     * It works best when the key reference in the path is it's own step.
     * When the key is callback argument if ends up making a best guess by iterating
     * up from 0 until it runs into an undefined values
     * @function
     * @returns {IterableIterator<ValidKey>} iterator for all valid keys
     */
    ValueLookupVertex.prototype.createDefaultKeyIterator = function () {
        var target, _a, _b, step, keyIndex, testRequest, i, value_1, value, i, _c, _d, _e, _i, key, value, e_1_1;
        var e_1, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (typeof this.value !== 'object')
                        return [2 /*return*/];
                    target = this.value;
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 22, 23, 24]);
                    _a = __values(this.pathTemplate), _b = _a.next();
                    _g.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 21];
                    step = _b.value;
                    if (!(typeof step === 'object')) return [3 /*break*/, 9];
                    keyIndex = step.args.indexOf(this.keyAlias);
                    if (!(keyIndex >= 0)) return [3 /*break*/, 8];
                    testRequest = {
                        name: step.name,
                        args: step.args.slice()
                    };
                    i = 0;
                    _g.label = 3;
                case 3:
                    if (!(i < Number.MAX_SAFE_INTEGER)) return [3 /*break*/, 7];
                    testRequest.args[keyIndex] = i;
                    value_1 = executePropertyCall(target, testRequest);
                    if (!(value_1 !== undefined)) return [3 /*break*/, 5];
                    return [4 /*yield*/, i];
                case 4:
                    _g.sent();
                    return [3 /*break*/, 6];
                case 5: return [2 /*return*/];
                case 6:
                    i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/];
                case 8:
                    value = executePropertyCall(target, step);
                    if (typeof value === 'object' && value != null) {
                        target = value;
                    }
                    else
                        return [2 /*return*/];
                    return [3 /*break*/, 20];
                case 9:
                    if (!(step === this.keyAlias)) return [3 /*break*/, 19];
                    if (!Array.isArray(target)) return [3 /*break*/, 14];
                    i = 0;
                    _g.label = 10;
                case 10:
                    if (!(i < target.length)) return [3 /*break*/, 13];
                    return [4 /*yield*/, i];
                case 11:
                    _g.sent();
                    _g.label = 12;
                case 12:
                    i++;
                    return [3 /*break*/, 10];
                case 13: return [3 /*break*/, 18];
                case 14:
                    _c = target;
                    _d = [];
                    for (_e in _c)
                        _d.push(_e);
                    _i = 0;
                    _g.label = 15;
                case 15:
                    if (!(_i < _d.length)) return [3 /*break*/, 18];
                    _e = _d[_i];
                    if (!(_e in _c)) return [3 /*break*/, 17];
                    key = _e;
                    return [4 /*yield*/, key];
                case 16:
                    _g.sent();
                    _g.label = 17;
                case 17:
                    _i++;
                    return [3 /*break*/, 15];
                case 18: return [2 /*return*/];
                case 19:
                    value = target[step];
                    if (typeof value === 'object' && value != null) {
                        target = value;
                    }
                    else
                        return [2 /*return*/];
                    _g.label = 20;
                case 20:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 21: return [3 /*break*/, 24];
                case 22:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 24];
                case 23:
                    try {
                        if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 24: return [2 /*return*/];
            }
        });
    };
    ValueLookupVertex.prototype.getIndexedKey = function (index) {
        var e_2, _a;
        var keys = [];
        var count = 0;
        try {
            for (var _b = __values(this.keyProvider), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (count === index) {
                    return key;
                }
                count++;
                keys.push(key);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var wrappedIndex = (0, value_vertices_1.getWrappedIndex)(index, keys.length);
        return keys[wrappedIndex];
    };
    ValueLookupVertex.prototype.getKeyValue = function (key) {
        if (typeof this.value === 'object' && this.value != null) {
            var path = this.getValuePath(key);
            return resolvePropertyLookup(this.value, path);
        }
    };
    ValueLookupVertex.prototype.getKeyIndex = function (key) {
        var e_3, _a;
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
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    /**
     * Uses the path template to generate the expected value path for a given key.
     * @function
     * @param {ValidKey} key - key to be found
     * @returns {PropertyLookupStep[]} lookup path to the target value
     */
    ValueLookupVertex.prototype.getValuePath = function (key) {
        var _this = this;
        return this.pathTemplate.map(function (step) {
            if (typeof step === 'object') {
                return {
                    name: step.name,
                    args: step.args.map(function (arg) { return arg === _this.keyAlias ? key : arg; })
                };
            }
            return step === _this.keyAlias ? key : step;
        });
    };
    /**
     * Checks if the property path matches our template at a given position.
     * @function
     * @param {PropertyLookupStep} source - path to be evaluated
     * @param {number} startPosition - index within the path to start our evaluation
     * @returns {KeyedPathResult | undefined} the matching path and it's key if a match is found
     */
    ValueLookupVertex.prototype.validateValuePath = function (source, startPosition) {
        if (startPosition === void 0) { startPosition = 0; }
        var key;
        var path = [];
        var keyTypes = ['string', 'number', 'symbol'];
        for (var i = 0; i < this.pathTemplate.length; i++) {
            var step = this.pathTemplate[i];
            var sourceStep = source[i + startPosition];
            if (typeof step === 'object') {
                if (typeof sourceStep !== 'object' || sourceStep.name !== step.name) {
                    return undefined;
                }
                for (var argIndex = 0; argIndex < step.args.length; argIndex++) {
                    var arg = step.args[argIndex];
                    var sourceArg = sourceStep.args[argIndex];
                    if (arg === this.keyAlias) {
                        if (!keyTypes.includes(typeof sourceArg)) {
                            return undefined;
                        }
                        if (key === undefined) {
                            key = sourceArg;
                        }
                        else if (sourceArg !== key) {
                            return undefined;
                        }
                    }
                }
            }
            else if (step === this.keyAlias) {
                if (typeof sourceStep === 'object') {
                    return undefined;
                }
                if (key === undefined) {
                    key = sourceStep;
                }
                else if (sourceStep !== key) {
                    return undefined;
                }
            }
            path.push(sourceStep);
        }
        if (key !== undefined) {
            return {
                key: key,
                path: path
            };
        }
    };
    return ValueLookupVertex;
}());
exports.ValueLookupVertex = ValueLookupVertex;
/**
 * Converts a vertex key path to a full property lookup path.
 * @function
 * @param {KeyValueVertex} vertices - vertices used to generate the key path
 * @param {ValidKey[]} keys - key path to be evaluated
 * @returns {PropertyLookupStep[] | undefined} the resulting property path if no errors are encountered
 */
function expandNestedValuePath(vertices, keys) {
    var results = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var vertex = vertices[i];
        if (vertex == null)
            return undefined;
        if ('getValuePath' in vertex) {
            var container = vertex;
            var subpath = container.getValuePath(key);
            results = results.concat(subpath);
        }
        else {
            results.push(key);
        }
    }
    return results;
}
exports.expandNestedValuePath = expandNestedValuePath;
/**
 * Tries to determine the keys used to generate a full property lookup path.
 * @function
 * @param {KeyValueVertex} vertices - vertices used to generate the key path
 * @param {PropertyLookupStep[]} path - property path to be evaluated
 * @returns {ValidKey[] | undefined} expected keys if no errors were encountered
 */
function collapseNestedValuePath(vertices, path) {
    var results = [];
    var pathIndex = 0;
    for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        if ('getValuePath' in vertex) {
            var container = vertex;
            var validation = container.validateValuePath(path, pathIndex);
            if (validation != null) {
                results.push(validation.key);
                pathIndex += validation.path.length;
            }
            else
                return undefined;
        }
        else {
            var step = path[pathIndex];
            if (typeof step === 'object')
                return undefined;
            results.push(step);
            pathIndex++;
        }
    }
    return results;
}
exports.collapseNestedValuePath = collapseNestedValuePath;
/**
 * Provides key value handling for javascript Maps.
 * @class
 * @implements {ValueLookupVertex<Map<K, V>, K, V>}
 */
var MapVertex = /** @class */ (function (_super) {
    __extends(MapVertex, _super);
    function MapVertex(value) {
        return _super.call(this, value, [
            {
                name: 'get',
                args: ['$key']
            }
        ], '$key', function (value) {
            var value_2, value_2_1, _a, key, e_4_1;
            var e_4, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, 6, 7]);
                        value_2 = __values(value), value_2_1 = value_2.next();
                        _c.label = 1;
                    case 1:
                        if (!!value_2_1.done) return [3 /*break*/, 4];
                        _a = __read(value_2_1.value, 1), key = _a[0];
                        return [4 /*yield*/, key];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        value_2_1 = value_2.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_4_1 = _c.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (value_2_1 && !value_2_1.done && (_b = value_2.return)) _b.call(value_2);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }) || this;
    }
    MapVertex.prototype.getKeyValue = function (key) {
        return this.value.get(key);
    };
    return MapVertex;
}(ValueLookupVertex));
exports.MapVertex = MapVertex;
/**
 * Provides key value handling for Document Object Model nodes.
 * @class
 * @implements {ValueLookupVertex<Node, number, Node>}
 */
var DOMNodeVertex = /** @class */ (function (_super) {
    __extends(DOMNodeVertex, _super);
    function DOMNodeVertex(value) {
        return _super.call(this, value, [
            'childNodes',
            '$key'
        ], '$key', function (value) {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < value.childNodes.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, i];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }) || this;
    }
    DOMNodeVertex.prototype.getKeyValue = function (key) {
        return this.value.childNodes[Number(key)];
    };
    return DOMNodeVertex;
}(ValueLookupVertex));
exports.DOMNodeVertex = DOMNodeVertex;
