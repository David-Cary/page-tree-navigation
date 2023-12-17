"use strict";
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
exports.ValueVertexFactory = void 0;
var value_vertices_1 = require("./value-vertices");
/**
 * Wraps a provided value in an appropriate vertex given a certain set of rules.
 * @class
 * @property {Array<VertexFactoryCallback<UntypedObject>>} objectRules - rules for any objects that require special handling, in order of descending priority
 */
var ValueVertexFactory = /** @class */ (function () {
    /**
     * @param {Array<VertexFactoryCallback<UntypedObject>>} objectRules - rules to used by the factory for special object types
     */
    function ValueVertexFactory(objectRules) {
        this.objectRules = objectRules;
    }
    ValueVertexFactory.prototype.createVertex = function (source) {
        var e_1, _a;
        if (typeof source === 'object' && source != null) {
            if (Array.isArray(source)) {
                return new value_vertices_1.ArrayVertex(source);
            }
            var sourceObject = source;
            if (this.objectRules != null) {
                try {
                    for (var _b = __values(this.objectRules), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var callback = _c.value;
                        var vertex = callback(sourceObject);
                        if (vertex != null) {
                            return vertex;
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
            return new value_vertices_1.ObjectVertex(sourceObject);
        }
        return new value_vertices_1.PrimitiveVertex(source);
    };
    return ValueVertexFactory;
}());
exports.ValueVertexFactory = ValueVertexFactory;
