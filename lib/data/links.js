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
exports.KeyedURLValuesParser = exports.PhasedPathParser = exports.ValidKeyParser = exports.NumericTextParser = exports.EnclosedTextParser = exports.DelimiterEncodedPathParser = exports.DelimitedPathParser = exports.PageLinkFactory = exports.RouteLinkFactory = void 0;
/**
 * Used to generate hyperlink summaries from a route.
 * @class
 * @property {(TraversalRoute) => string} getText - extracts display text from route
 * @property {(TraversalRoute) => string} getHref - extracts hyperlink reference from route
 * @property {string| undefined} linkTarget - window name to be attached to links
 */
var RouteLinkFactory = /** @class */ (function () {
    function RouteLinkFactory(getText, getHref, linkTarget) {
        this.getText = getText;
        this.getHref = getHref;
        this.linkTarget = linkTarget;
    }
    /**
     * Generates a HyperlinkSummary from the provided route.
     * @function
     * @param {TraversalRoute} route - route used to generate the link
     * @returns {HyperlinkSummary}
     */
    RouteLinkFactory.prototype.getRouteLink = function (route) {
        var link = {
            text: this.getText(route),
            href: this.getHref(route)
        };
        if (this.linkTarget != null) {
            link.target = this.linkTarget;
        }
        return link;
    };
    return RouteLinkFactory;
}());
exports.RouteLinkFactory = RouteLinkFactory;
/**
 * RouteLinkFactory that will use the page title for the text or generate a title from the page's index if such a title does not exist.
 * @class
 * @extends RouteLinkFactory
 * @property {(number) => string} getIndexedTitle - callback to specify how titles based on page index are created
 */
var PageLinkFactory = /** @class */ (function (_super) {
    __extends(PageLinkFactory, _super);
    function PageLinkFactory(getHref, getIndexedTitle, linkTarget) {
        var _this = _super.call(this, function (route) {
            if (typeof route.target === 'object' &&
                route.target != null &&
                'title' in route.target) {
                return String(route.target.title);
            }
            var maxPathIndex = route.path.length - 1;
            var lastStep = route.path[maxPathIndex];
            if (_this.getIndexedTitle != null) {
                var childIndex = Number(lastStep);
                return _this.getIndexedTitle(childIndex);
            }
            return String(lastStep);
        }, getHref, linkTarget) || this;
        _this.getIndexedTitle = getIndexedTitle;
        return _this;
    }
    return PageLinkFactory;
}(RouteLinkFactory));
exports.PageLinkFactory = PageLinkFactory;
/**
 * Handles splitting and joining text with a designated delimiter character.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {string} delimiter - character used to mark substring breakpoints
 */
var DelimitedPathParser = /** @class */ (function () {
    function DelimitedPathParser(delimiter) {
        if (delimiter === void 0) { delimiter = '.'; }
        this.delimiter = delimiter;
    }
    DelimitedPathParser.prototype.parse = function (source) {
        var steps = source.split(this.delimiter);
        return steps;
    };
    DelimitedPathParser.prototype.stringify = function (source) {
        var pathText = source.join(this.delimiter);
        return pathText;
    };
    return DelimitedPathParser;
}());
exports.DelimitedPathParser = DelimitedPathParser;
/**
 * Handles splitting and joining text where delimiters act as stand-ins for specific properties.
 * @class
 * @implements ReversibleTextParser<string[]>
 * @property {Record<string, string>} delimiters - maps each delimiter character to it's associated property
 */
var DelimiterEncodedPathParser = /** @class */ (function () {
    function DelimiterEncodedPathParser(delimiters) {
        this.delimiters = delimiters;
    }
    DelimiterEncodedPathParser.prototype.parse = function (source) {
        var e_1, _a;
        var path = [source];
        for (var key in this.delimiters) {
            var delimiter = this.delimiters[key];
            var parsedPath = [];
            try {
                for (var path_1 = (e_1 = void 0, __values(path)), path_1_1 = path_1.next(); !path_1_1.done; path_1_1 = path_1.next()) {
                    var step = path_1_1.value;
                    if (typeof step === 'string') {
                        var terms = step.split(delimiter);
                        if (terms.length > 0) {
                            parsedPath.push(terms[0]);
                            for (var i = 1; i < terms.length; i++) {
                                parsedPath.push(key);
                                parsedPath.push(terms[i]);
                            }
                        }
                    }
                    else {
                        parsedPath.push(step);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (path_1_1 && !path_1_1.done && (_a = path_1.return)) _a.call(path_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            path = parsedPath;
        }
        return path;
    };
    DelimiterEncodedPathParser.prototype.stringify = function (source) {
        var pathText = '';
        for (var i = 0; i < source.length; i++) {
            var step = source[i];
            pathText += (i % 2 === 1 && step in this.delimiters)
                ? this.delimiters[step]
                : step;
        }
        return pathText;
    };
    return DelimiterEncodedPathParser;
}());
exports.DelimiterEncodedPathParser = DelimiterEncodedPathParser;
/**
 * Handles wrapping text between prefix and suffix text, as well as extracting text so wrapped.
 * @class
 * @implements ReversibleTextParser<string>
 * @property {string} prefix - text added before the target text
 * @property {string} suffix - text added after the target text
 */
var EnclosedTextParser = /** @class */ (function () {
    function EnclosedTextParser(prefix, suffix) {
        if (prefix === void 0) { prefix = ''; }
        if (suffix === void 0) { suffix = ''; }
        this.prefix = prefix;
        this.suffix = suffix;
    }
    EnclosedTextParser.prototype.parse = function (source) {
        var startIndex = this.prefix.length > 0 ? source.indexOf(this.prefix) : 0;
        if (startIndex >= 0) {
            var targetIndex = startIndex + this.prefix.length;
            var endIndex = this.suffix.length > 0
                ? source.indexOf(this.suffix, targetIndex)
                : -1;
            if (endIndex >= 0) {
                return source.substring(targetIndex, endIndex);
            }
            return source.substring(targetIndex);
        }
        return source;
    };
    EnclosedTextParser.prototype.stringify = function (text) {
        return this.prefix + text + this.suffix;
    };
    return EnclosedTextParser;
}());
exports.EnclosedTextParser = EnclosedTextParser;
/**
 * Tries to convert any number that's been strigified back to a number.
 * @class
 * @implements ReversibleTextParser<CommonKey>
 */
var NumericTextParser = /** @class */ (function () {
    function NumericTextParser() {
    }
    NumericTextParser.prototype.parse = function (source) {
        var num = Number(source);
        return isNaN(num) ? source : num;
    };
    NumericTextParser.prototype.stringify = function (source) {
        return String(source);
    };
    return NumericTextParser;
}());
exports.NumericTextParser = NumericTextParser;
/**
 * Converts any valid key values to and from a string.
 * @class
 * @implements ReversibleTextParser<string>
 * @property {string} symbolPrefix - marker used to signify the target key string refers to a symbol
 */
var ValidKeyParser = /** @class */ (function () {
    function ValidKeyParser(symbolPrefix) {
        if (symbolPrefix === void 0) { symbolPrefix = ''; }
        this.symbolPrefix = symbolPrefix;
    }
    ValidKeyParser.prototype.parse = function (source) {
        if (this.symbolPrefix !== '' &&
            source.startsWith(this.symbolPrefix)) {
            var symbolName = source.substring(this.symbolPrefix.length);
            return Symbol.for(symbolName);
        }
        var num = Number(source);
        return isNaN(num) ? source : num;
    };
    ValidKeyParser.prototype.stringify = function (source) {
        if (this.symbolPrefix !== '' &&
            typeof source === 'symbol') {
            var key = Symbol.keyFor(source);
            if (key != null) {
                return this.symbolPrefix + key;
            }
            if (source.description != null) {
                return this.symbolPrefix + source.description;
            }
        }
        return String(source);
    };
    return ValidKeyParser;
}());
exports.ValidKeyParser = ValidKeyParser;
/**
 * A utility class for handling complex conversions from date to string and back again.
 * @class
 * @implements ReversibleTextParser<Array<T | string>>
 * @property {ReversibleTextParser<string> | undefined} stringParser - Performs top-level processing on the data while it's still a single string
 * @property {ReversibleTextParser<string[]>} splitter - Handles breaking the string into substrings and reversing said process
 * @property {ReversibleTextParser<string> | undefined} stepParser - Converts substrings into the target data types
 */
var PhasedPathParser = /** @class */ (function () {
    function PhasedPathParser(stringParser, splitter, stepParser) {
        if (splitter === void 0) { splitter = new DelimitedPathParser(); }
        this.stringParser = stringParser;
        this.splitter = splitter;
        this.stepParser = stepParser;
    }
    PhasedPathParser.prototype.parse = function (source) {
        var extractedText = this.stringParser != null
            ? this.stringParser.parse(source)
            : source;
        var stringPath = this.splitter.parse(extractedText);
        if (this.stepParser != null) {
            var stepParser_1 = this.stepParser;
            var parsedPath = stringPath.map(function (step) { return stepParser_1.parse(step); });
            return parsedPath;
        }
        return stringPath;
    };
    PhasedPathParser.prototype.stringify = function (source) {
        var stringPath;
        if (this.stepParser != null) {
            var stepParser_2 = this.stepParser;
            stringPath = source.map(function (step) { return stepParser_2.stringify(step); });
        }
        else {
            stringPath = source.map(function (step) { return String(step); });
        }
        var rawText = this.splitter.stringify(stringPath);
        var wrappedText = this.stringParser != null
            ? this.stringParser.stringify(rawText)
            : rawText;
        return wrappedText;
    };
    return PhasedPathParser;
}());
exports.PhasedPathParser = PhasedPathParser;
/**
 * Handles creating hypertext reference from given parameters and extracting said parameters from such a reference.
 * @class
 * @implements ReversibleTextParser<Record<string, string>>
 * @property {KeyedURLTemplate} template - details on where the parameters are used within a url
 * @property {string} basePath - base url to use if the provided url has no origin
 */
var KeyedURLValuesParser = /** @class */ (function () {
    function KeyedURLValuesParser(template, basePath) {
        if (template === void 0) { template = {
            origin: '',
            path: []
        }; }
        if (basePath === void 0) { basePath = 'https://some.site'; }
        this.template = template;
        this.basePath = basePath;
    }
    KeyedURLValuesParser.prototype.parse = function (source) {
        var values = {};
        var url = new URL(source, this.basePath);
        var pathSteps = url.pathname.split('/');
        pathSteps.splice(0, 1); // ignore leading slash
        for (var i = 0; i < this.template.path.length; i++) {
            if (i >= pathSteps.length)
                break;
            var templateStep = this.template.path[i];
            if (typeof templateStep === 'object' &&
                pathSteps[i] !== templateStep.placeholder) {
                values[templateStep.key] = pathSteps[i];
            }
        }
        if (typeof this.template.hash === 'object' &&
            this.template.hash != null &&
            url.hash !== '') {
            values[this.template.hash.key] = url.hash.substring(1);
        }
        if (this.template.search != null) {
            for (var key in this.template.search) {
                var searchValue = this.template.search[key];
                if (typeof searchValue === 'object') {
                    var paramValue = url.searchParams.get(key);
                    if (paramValue != null) {
                        values[searchValue.key] = paramValue;
                    }
                }
            }
        }
        return values;
    };
    KeyedURLValuesParser.prototype.stringify = function (source) {
        var _a, _b, _c;
        var urlPath = this.template.origin;
        for (var i = 0; i < this.template.path.length; i++) {
            var templateStep = this.template.path[i];
            urlPath += typeof templateStep === 'object'
                ? "/".concat((_b = (_a = source[templateStep.key]) !== null && _a !== void 0 ? _a : templateStep.placeholder) !== null && _b !== void 0 ? _b : '')
                : "/".concat(templateStep);
        }
        var url = new URL(urlPath, this.basePath);
        if (this.template.hash != null) {
            if (typeof this.template.hash === 'object') {
                url.hash = (_c = source[this.template.hash.key]) !== null && _c !== void 0 ? _c : '';
            }
            else {
                url.hash = this.template.hash;
            }
        }
        if (this.template.search != null) {
            for (var key in this.template.search) {
                var searchValue = this.template.search[key];
                if (typeof searchValue === 'object') {
                    var paramValue = source[searchValue.key];
                    if (paramValue != null) {
                        url.searchParams.set(key, paramValue);
                    }
                }
                else {
                    url.searchParams.set(key, searchValue);
                }
            }
        }
        return url.href;
    };
    return KeyedURLValuesParser;
}());
exports.KeyedURLValuesParser = KeyedURLValuesParser;
