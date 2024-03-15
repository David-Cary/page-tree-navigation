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
exports.getDocumentAsPage = exports.getDocumentReference = exports.extendStyleRules = exports.getStyleRulesConflicts = exports.checkEquivalence = void 0;
function checkEquivalence(first, second) {
    if (first === second)
        return true;
    if (typeof first === 'object' && typeof second === 'object') {
        if (Array.isArray(first)) {
            if (Array.isArray(second)) {
                if (first.length !== second.length)
                    return false;
                for (var i = 0; i < first.length; i++) {
                    if (!checkEquivalence(first[i], second[i])) {
                        return false;
                    }
                }
                return true;
            }
        }
        else if (!Array.isArray(second)) {
            for (var key in first) {
                if (!checkEquivalence(first[key], second[key])) {
                    return false;
                }
            }
            for (var key in second) {
                if (key in first)
                    continue;
                return false;
            }
            return true;
        }
    }
    return false;
}
exports.checkEquivalence = checkEquivalence;
function getStyleRulesConflicts(first, second) {
    var e_1, _a, e_2, _b;
    var conflicts = [];
    try {
        for (var first_1 = __values(first), first_1_1 = first_1.next(); !first_1_1.done; first_1_1 = first_1.next()) {
            var firstItem = first_1_1.value;
            try {
                for (var second_1 = (e_2 = void 0, __values(second)), second_1_1 = second_1.next(); !second_1_1.done; second_1_1 = second_1.next()) {
                    var secondItem = second_1_1.value;
                    if (firstItem.selector !== secondItem.selector)
                        continue;
                    if (checkEquivalence(firstItem.values, secondItem.values)) {
                        continue;
                    }
                    conflicts.push([firstItem, secondItem]);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (second_1_1 && !second_1_1.done && (_b = second_1.return)) _b.call(second_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (first_1_1 && !first_1_1.done && (_a = first_1.return)) _a.call(first_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return conflicts;
}
exports.getStyleRulesConflicts = getStyleRulesConflicts;
function extendStyleRules() {
    var e_3, _a, e_4, _b;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var results = [];
    try {
        for (var args_1 = __values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
            var ruleset = args_1_1.value;
            var _loop_1 = function (rule) {
                var matchedIndex = results.findIndex(function (item) { return item.selector === rule.selector; });
                if (matchedIndex >= 0) {
                    results[matchedIndex] = rule;
                }
                else {
                    results.push(rule);
                }
            };
            try {
                for (var ruleset_1 = (e_4 = void 0, __values(ruleset)), ruleset_1_1 = ruleset_1.next(); !ruleset_1_1.done; ruleset_1_1 = ruleset_1.next()) {
                    var rule = ruleset_1_1.value;
                    _loop_1(rule);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (ruleset_1_1 && !ruleset_1_1.done && (_b = ruleset_1.return)) _b.call(ruleset_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (args_1_1 && !args_1_1.done && (_a = args_1.return)) _a.call(args_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return results;
}
exports.extendStyleRules = extendStyleRules;
function getDocumentReference(source) {
    if (source.published != null && source.published.length > 0) {
        var lastPublication = source.published[source.published.length - 1];
        return {
            id: lastPublication.as,
            by: lastPublication.by,
            version: lastPublication.version,
            on: lastPublication.on
        };
    }
    return {
        id: source.id,
        on: new Date()
    };
}
exports.getDocumentReference = getDocumentReference;
function getDocumentAsPage(source, content) {
    return {
        title: source.title,
        source: getDocumentReference(source),
        lock: source.lock,
        content: content,
        children: source.pages
    };
}
exports.getDocumentAsPage = getDocumentAsPage;
