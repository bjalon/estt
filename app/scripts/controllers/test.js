var Prototype = {Version: '1.6.0.3', Browser: {IE: !!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1), Opera: navigator.userAgent.indexOf('Opera') > -1, WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1, Gecko: navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1, MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)}, BrowserFeatures: {XPath: !!document.evaluate, SelectorsAPI: !!document.querySelector, ElementExtensions: !!window.HTMLElement, SpecificElementExtensions: document.createElement('div')['__proto__'] && document.createElement('div')['__proto__'] !== document.createElement('form')['__proto__']}, ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>', JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/, emptyFunction: function () {
}, K: function (x) {
    return x
}};
if (Prototype.Browser.MobileSafari)
    Prototype.BrowserFeatures.SpecificElementExtensions = false;
var Class = {create: function () {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
        parent = properties.shift();
    function klass() {
        this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];
    if (parent) {
        var subclass = function () {
        };
        subclass.prototype = parent.prototype;
        klass.prototype = new subclass;
        parent.subclasses.push(klass);
    }
    for (var i = 0; i < properties.length; i++)
        klass.addMethods(properties[i]);
    if (!klass.prototype.initialize)
        klass.prototype.initialize = Prototype.emptyFunction;
    klass.prototype.constructor = klass;
    return klass;
}};
Class.Methods = {addMethods: function (source) {
    var ancestor = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);
    if (!Object.keys({toString: true}).length)
        properties.push("toString", "valueOf");
    for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];
        if (ancestor && Object.isFunction(value) && value.argumentNames().first() == "$super") {
            var method = value;
            value = (function (m) {
                return function () {
                    return ancestor[m].apply(this, arguments)
                };
            })(property).wrap(method);
            value.valueOf = method.valueOf.bind(method);
            value.toString = method.toString.bind(method);
        }
        this.prototype[property] = value;
    }
    return this;
}};
var Abstract = {};
Object.extend = function (destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
};
Object.extend(Object, {inspect: function (object) {
    try {
        if (Object.isUndefined(object))return'undefined';
        if (object === null)return'null';
        return object.inspect ? object.inspect() : String(object);
    } catch (e) {
        if (e instanceof RangeError)return'...';
        throw e;
    }
}, toJSON: function (object) {
    var type = typeof object;
    switch (type) {
        case'undefined':
        case'function':
        case'unknown':
            return;
        case'boolean':
            return object.toString();
    }
    if (object === null)return'null';
    if (object.toJSON)return object.toJSON();
    if (Object.isElement(object))return;
    var results = [];
    for (var property in object) {
        var value = Object.toJSON(object[property]);
        if (!Object.isUndefined(value))
            results.push(property.toJSON() + ': ' + value);
    }
    return'{' + results.join(', ') + '}';
}, toQueryString: function (object) {
    return $H(object).toQueryString();
}, toHTML: function (object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
}, keys: function (object) {
    var keys = [];
    for (var property in object)
        keys.push(property);
    return keys;
}, values: function (object) {
    var values = [];
    for (var property in object)
        values.push(object[property]);
    return values;
}, clone: function (object) {
    return Object.extend({}, object);
}, isElement: function (object) {
    return!!(object && object.nodeType == 1);
}, isArray: function (object) {
    return object != null && typeof object == "object" && 'splice'in object && 'join'in object;
}, isHash: function (object) {
    return object instanceof Hash;
}, isFunction: function (object) {
    return typeof object == "function";
}, isString: function (object) {
    return typeof object == "string";
}, isNumber: function (object) {
    return typeof object == "number";
}, isUndefined: function (object) {
    return typeof object == "undefined";
}});
Object.extend(Function.prototype, {argumentNames: function () {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1].replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
}, bind: function () {
    if (arguments.length < 2 && Object.isUndefined(arguments[0]))return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function () {
        return __method.apply(object, args.concat($A(arguments)));
    }
}, bindAsEventListener: function () {
    var __method = this, args = $A(arguments), object = args.shift();
    return function (event) {
        return __method.apply(object, [event || window.event].concat(args));
    }
}, curry: function () {
    if (!arguments.length)return this;
    var __method = this, args = $A(arguments);
    return function () {
        return __method.apply(this, args.concat($A(arguments)));
    }
}, delay: function () {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function () {
        return __method.apply(__method, args);
    }, timeout);
}, defer: function () {
    var args = [0.01].concat($A(arguments));
    return this.delay.apply(this, args);
}, wrap: function (wrapper) {
    var __method = this;
    return function () {
        return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
}, methodize: function () {
    if (this._methodized)return this._methodized;
    var __method = this;
    return this._methodized = function () {
        return __method.apply(null, [this].concat($A(arguments)));
    };
}});
Date.prototype.toJSON = function () {
    return'"' + this.getUTCFullYear() + '-' +
        (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
        this.getUTCDate().toPaddedString(2) + 'T' +
        this.getUTCHours().toPaddedString(2) + ':' +
        this.getUTCMinutes().toPaddedString(2) + ':' +
        this.getUTCSeconds().toPaddedString(2) + 'Z"';
};
var Try = {these: function () {
    var returnValue;
    for (var i = 0, length = arguments.length; i < length; i++) {
        var lambda = arguments[i];
        try {
            returnValue = lambda();
            break;
        } catch (e) {
        }
    }
    return returnValue;
}};
RegExp.prototype.match = RegExp.prototype.test;
RegExp.escape = function (str) {
    return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({initialize: function (callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;
    this.registerCallback();
}, registerCallback: function () {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
}, execute: function () {
    this.callback(this);
}, stop: function () {
    if (!this.timer)return;
    clearInterval(this.timer);
    this.timer = null;
}, onTimerEvent: function () {
    if (!this.currentlyExecuting) {
        try {
            this.currentlyExecuting = true;
            this.execute();
        } finally {
            this.currentlyExecuting = false;
        }
    }
}});
Object.extend(String, {interpret: function (value) {
    return value == null ? '' : String(value);
}, specialChar: {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '\\': '\\\\'}});
Object.extend(String.prototype, {gsub: function (pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);
    while (source.length > 0) {
        if (match = source.match(pattern)) {
            result += source.slice(0, match.index);
            result += String.interpret(replacement(match));
            source = source.slice(match.index + match[0].length);
        } else {
            result += source, source = '';
        }
    }
    return result;
}, sub: function (pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;
    return this.gsub(pattern, function (match) {
        if (--count < 0)return match[0];
        return replacement(match);
    });
}, scan: function (pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
}, truncate: function (length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ? this.slice(0, length - truncation.length) + truncation : String(this);
}, strip: function () {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
}, stripTags: function () {
    return this.replace(/<\/?[^>]+>/gi, '');
}, stripScripts: function () {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
}, extractScripts: function () {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return(this.match(matchAll) || []).map(function (scriptTag) {
        return(scriptTag.match(matchOne) || ['', ''])[1];
    });
}, evalScripts: function () {
    return this.extractScripts().map(function (script) {
        return eval(script)
    });
}, escapeHTML: function () {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
}, unescapeHTML: function () {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ? $A(div.childNodes).inject('', function (memo, node) {
        return memo + node.nodeValue
    }) : div.childNodes[0].nodeValue) : '';
}, toQueryParams: function (separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match)return{};
    return match[1].split(separator || '&').inject({}, function (hash, pair) {
        if ((pair = pair.split('='))[0]) {
            var key = decodeURIComponent(pair.shift());
            var value = pair.length > 1 ? pair.join('=') : pair[0];
            if (value != undefined)value = decodeURIComponent(value);
            if (key in hash) {
                if (!Object.isArray(hash[key]))hash[key] = [hash[key]];
                hash[key].push(value);
            }
            else hash[key] = value;
        }
        return hash;
    });
}, toArray: function () {
    return this.split('');
}, succ: function () {
    return this.slice(0, this.length - 1) +
        String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
}, times: function (count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
}, camelize: function () {
    var parts = this.split('-'), len = parts.length;
    if (len == 1)return parts[0];
    var camelized = this.charAt(0) == '-' ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];
    for (var i = 1; i < len; i++)
        camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
    return camelized;
}, capitalize: function () {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
}, underscore: function () {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/, '#{1}_#{2}').gsub(/([a-z\d])([A-Z])/, '#{1}_#{2}').gsub(/-/, '_').toLowerCase();
}, dasherize: function () {
    return this.gsub(/_/, '-');
}, inspect: function (useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function (match) {
        var character = String.specialChar[match[0]];
        return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes)return'"' + escapedString.replace(/"/g, '\\"') + '"';
    return"'" + escapedString.replace(/'/g, '\\\'') + "'";
}, toJSON: function () {
    return this.inspect(true);
}, unfilterJSON: function (filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
}, isJSON: function () {
    var str = this;
    if (str.blank())return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
}, evalJSON: function (sanitize) {
    var json = this.unfilterJSON();
    try {
        if (!sanitize || json.isJSON())return eval('(' + json + ')');
    } catch (e) {
    }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
}, include: function (pattern) {
    return this.indexOf(pattern) > -1;
}, startsWith: function (pattern) {
    return this.indexOf(pattern) === 0;
}, endsWith: function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
}, empty: function () {
    return this == '';
}, blank: function () {
    return/^\s*$/.test(this);
}, interpolate: function (object, pattern) {
    return new Template(this, pattern).evaluate(object);
}});
if (Prototype.Browser.WebKit || Prototype.Browser.IE)Object.extend(String.prototype, {escapeHTML: function () {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}, unescapeHTML: function () {
    return this.stripTags().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}});
String.prototype.gsub.prepareReplacement = function (replacement) {
    if (Object.isFunction(replacement))return replacement;
    var template = new Template(replacement);
    return function (match) {
        return template.evaluate(match)
    };
};
String.prototype.parseQuery = String.prototype.toQueryParams;
Object.extend(String.prototype.escapeHTML, {div: document.createElement('div'), text: document.createTextNode('')});
String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);
var Template = Class.create({initialize: function (template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
}, evaluate: function (object) {
    if (Object.isFunction(object.toTemplateReplacements))
        object = object.toTemplateReplacements();
    return this.template.gsub(this.pattern, function (match) {
        if (object == null)return'';
        var before = match[1] || '';
        if (before == '\\')return match[2];
        var ctx = object, expr = match[3];
        var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
        match = pattern.exec(expr);
        if (match == null)return before;
        while (match != null) {
            var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
            ctx = ctx[comp];
            if (null == ctx || '' == match[3])break;
            expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
            match = pattern.exec(expr);
        }
        return before + String.interpret(ctx);
    });
}});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
var $break = {};
var Enumerable = {each: function (iterator, context) {
    var index = 0;
    try {
        this._each(function (value) {
            iterator.call(context, value, index++);
        });
    } catch (e) {
        if (e != $break)throw e;
    }
    return this;
}, eachSlice: function (number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1)return array;
    while ((index += number) < array.length)
        slices.push(array.slice(index, index + number));
    return slices.collect(iterator, context);
}, all: function (iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function (value, index) {
        result = result && !!iterator.call(context, value, index);
        if (!result)throw $break;
    });
    return result;
}, any: function (iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function (value, index) {
        if (result = !!iterator.call(context, value, index))
            throw $break;
    });
    return result;
}, collect: function (iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function (value, index) {
        results.push(iterator.call(context, value, index));
    });
    return results;
}, detect: function (iterator, context) {
    var result;
    this.each(function (value, index) {
        if (iterator.call(context, value, index)) {
            result = value;
            throw $break;
        }
    });
    return result;
}, findAll: function (iterator, context) {
    var results = [];
    this.each(function (value, index) {
        if (iterator.call(context, value, index))
            results.push(value);
    });
    return results;
}, grep: function (filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    if (Object.isString(filter))
        filter = new RegExp(filter);
    this.each(function (value, index) {
        if (filter.match(value))
            results.push(iterator.call(context, value, index));
    });
    return results;
}, include: function (object) {
    if (Object.isFunction(this.indexOf))
        if (this.indexOf(object) != -1)return true;
    var found = false;
    this.each(function (value) {
        if (value == object) {
            found = true;
            throw $break;
        }
    });
    return found;
}, inGroupsOf: function (number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function (slice) {
        while (slice.length < number)slice.push(fillWith);
        return slice;
    });
}, inject: function (memo, iterator, context) {
    this.each(function (value, index) {
        memo = iterator.call(context, memo, value, index);
    });
    return memo;
}, invoke: function (method) {
    var args = $A(arguments).slice(1);
    return this.map(function (value) {
        return value[method].apply(value, args);
    });
}, max: function (iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function (value, index) {
        value = iterator.call(context, value, index);
        if (result == null || value >= result)
            result = value;
    });
    return result;
}, min: function (iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function (value, index) {
        value = iterator.call(context, value, index);
        if (result == null || value < result)
            result = value;
    });
    return result;
}, partition: function (iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function (value, index) {
        (iterator.call(context, value, index) ? trues : falses).push(value);
    });
    return[trues, falses];
}, pluck: function (property) {
    var results = [];
    this.each(function (value) {
        results.push(value[property]);
    });
    return results;
}, reject: function (iterator, context) {
    var results = [];
    this.each(function (value, index) {
        if (!iterator.call(context, value, index))
            results.push(value);
    });
    return results;
}, sortBy: function (iterator, context) {
    return this.map(function (value, index) {
        return{value: value, criteria: iterator.call(context, value, index)};
    }).sort(function (left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
}, toArray: function () {
    return this.map();
}, zip: function () {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
        iterator = args.pop();
    var collections = [this].concat(args).map($A);
    return this.map(function (value, index) {
        return iterator(collections.pluck(index));
    });
}, size: function () {
    return this.toArray().length;
}, inspect: function () {
    return'#<Enumerable:' + this.toArray().inspect() + '>';
}};
Object.extend(Enumerable, {map: Enumerable.collect, find: Enumerable.detect, select: Enumerable.findAll, filter: Enumerable.findAll, member: Enumerable.include, entries: Enumerable.toArray, every: Enumerable.all, some: Enumerable.any});
function $A(iterable) {
    if (!iterable)return[];
    if (iterable.toArray)return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--)results[length] = iterable[length];
    return results;
}
if (Prototype.Browser.WebKit) {
    $A = function (iterable) {
        if (!iterable)return[];
        if (!(typeof iterable === 'function' && typeof iterable.length === 'number' && typeof iterable.item === 'function') && iterable.toArray)
            return iterable.toArray();
        var length = iterable.length || 0, results = new Array(length);
        while (length--)results[length] = iterable[length];
        return results;
    };
}
Array.from = $A;
Object.extend(Array.prototype, Enumerable);
if (!Array.prototype._reverse)Array.prototype._reverse = Array.prototype.reverse;
Object.extend(Array.prototype, {_each: function (iterator) {
    for (var i = 0, length = this.length; i < length; i++)
        iterator(this[i]);
}, clear: function () {
    this.length = 0;
    return this;
}, first: function () {
    return this[0];
}, last: function () {
    return this[this.length - 1];
}, compact: function () {
    return this.select(function (value) {
        return value != null;
    });
}, flatten: function () {
    return this.inject([], function (array, value) {
        return array.concat(Object.isArray(value) ? value.flatten() : [value]);
    });
}, without: function () {
    var values = $A(arguments);
    return this.select(function (value) {
        return!values.include(value);
    });
}, reverse: function (inline) {
    return(inline !== false ? this : this.toArray())._reverse();
}, reduce: function () {
    return this.length > 1 ? this : this[0];
}, uniq: function (sorted) {
    return this.inject([], function (array, value, index) {
        if (0 == index || (sorted ? array.last() != value : !array.include(value)))
            array.push(value);
        return array;
    });
}, intersect: function (array) {
    return this.uniq().findAll(function (item) {
        return array.detect(function (value) {
            return item === value
        });
    });
}, clone: function () {
    return[].concat(this);
}, size: function () {
    return this.length;
}, inspect: function () {
    return'[' + this.map(Object.inspect).join(', ') + ']';
}, toJSON: function () {
    var results = [];
    this.each(function (object) {
        var value = Object.toJSON(object);
        if (!Object.isUndefined(value))results.push(value);
    });
    return'[' + results.join(', ') + ']';
}});
if (Object.isFunction(Array.prototype.forEach))
    Array.prototype._each = Array.prototype.forEach;
if (!Array.prototype.indexOf)Array.prototype.indexOf = function (item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0)i = length + i;
    for (; i < length; i++)
        if (this[i] === item)return i;
    return-1;
};
if (!Array.prototype.lastIndexOf)Array.prototype.lastIndexOf = function (item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return(n < 0) ? n : i - n - 1;
};
Array.prototype.toArray = Array.prototype.clone;
function $w(string) {
    if (!Object.isString(string))return[];
    string = string.strip();
    return string ? string.split(/\s+/) : [];
}
if (Prototype.Browser.Opera) {
    Array.prototype.concat = function () {
        var array = [];
        for (var i = 0, length = this.length; i < length; i++)array.push(this[i]);
        for (var i = 0, length = arguments.length; i < length; i++) {
            if (Object.isArray(arguments[i])) {
                for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
                    array.push(arguments[i][j]);
            } else {
                array.push(arguments[i]);
            }
        }
        return array;
    };
}
Object.extend(Number.prototype, {toColorPart: function () {
    return this.toPaddedString(2, 16);
}, succ: function () {
    return this + 1;
}, times: function (iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
}, toPaddedString: function (length, radix) {
    var string = this.toString(radix || 10);
    return'0'.times(length - string.length) + string;
}, toJSON: function () {
    return isFinite(this) ? this.toString() : 'null';
}});
$w('abs round ceil floor').each(function (method) {
    Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
    return new Hash(object);
};
var Hash = Class.create(Enumerable, (function () {
    function toQueryPair(key, value) {
        if (Object.isUndefined(value))return key;
        return key + '=' + encodeURIComponent(String.interpret(value));
    }

    return{initialize: function (object) {
        this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    }, _each: function (iterator) {
        for (var key in this._object) {
            var value = this._object[key], pair = [key, value];
            pair.key = key;
            pair.value = value;
            iterator(pair);
        }
    }, set: function (key, value) {
        return this._object[key] = value;
    }, get: function (key) {
        if (this._object[key] !== Object.prototype[key])
            return this._object[key];
    }, unset: function (key) {
        var value = this._object[key];
        delete this._object[key];
        return value;
    }, toObject: function () {
        return Object.clone(this._object);
    }, keys: function () {
        return this.pluck('key');
    }, values: function () {
        return this.pluck('value');
    }, index: function (value) {
        var match = this.detect(function (pair) {
            return pair.value === value;
        });
        return match && match.key;
    }, merge: function (object) {
        return this.clone().update(object);
    }, update: function (object) {
        return new Hash(object).inject(this, function (result, pair) {
            result.set(pair.key, pair.value);
            return result;
        });
    }, toQueryString: function () {
        return this.inject([],function (results, pair) {
            var key = encodeURIComponent(pair.key), values = pair.value;
            if (values && typeof values == 'object') {
                if (Object.isArray(values))
                    return results.concat(values.map(toQueryPair.curry(key)));
            } else results.push(toQueryPair(key, values));
            return results;
        }).join('&');
    }, inspect: function () {
        return'#<Hash:{' + this.map(function (pair) {
            return pair.map(Object.inspect).join(': ');
        }).join(', ') + '}>';
    }, toJSON: function () {
        return Object.toJSON(this.toObject());
    }, clone: function () {
        return new Hash(this);
    }}
})());
Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {initialize: function (start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
}, _each: function (iterator) {
    var value = this.start;
    while (this.include(value)) {
        iterator(value);
        value = value.succ();
    }
}, include: function (value) {
    if (value < this.start)
        return false;
    if (this.exclusive)
        return value < this.end;
    return value <= this.end;
}});
var $R = function (start, end, exclusive) {
    return new ObjectRange(start, end, exclusive);
};
var Ajax = {getTransport: function () {
    return Try.these(function () {
        return new XMLHttpRequest()
    }, function () {
        return new ActiveXObject('Msxml2.XMLHTTP')
    }, function () {
        return new ActiveXObject('Microsoft.XMLHTTP')
    }) || false;
}, activeRequestCount: 0};
Ajax.Responders = {responders: [], _each: function (iterator) {
    this.responders._each(iterator);
}, register: function (responder) {
    if (!this.include(responder))
        this.responders.push(responder);
}, unregister: function (responder) {
    this.responders = this.responders.without(responder);
}, dispatch: function (callback, request, transport, json) {
    this.each(function (responder) {
        if (Object.isFunction(responder[callback])) {
            try {
                responder[callback].apply(responder, [request, transport, json]);
            } catch (e) {
            }
        }
    });
}};
Object.extend(Ajax.Responders, Enumerable);
Ajax.Responders.register({onCreate: function () {
    Ajax.activeRequestCount++
}, onComplete: function () {
    Ajax.activeRequestCount--
}});
Ajax.Base = Class.create({initialize: function (options) {
    this.options = {method: 'post', asynchronous: true, contentType: 'application/x-www-form-urlencoded', encoding: 'UTF-8', parameters: '', evalJSON: true, evalJS: true};
    Object.extend(this.options, options || {});
    this.options.method = this.options.method.toLowerCase();
    if (Object.isString(this.options.parameters))
        this.options.parameters = this.options.parameters.toQueryParams(); else if (Object.isHash(this.options.parameters))
        this.options.parameters = this.options.parameters.toObject();
}});
Ajax.Request = Class.create(Ajax.Base, {_complete: false, initialize: function ($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
}, request: function (url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);
    if (!['get', 'post'].include(this.method)) {
        params['_method'] = this.method;
        this.method = 'post';
    }
    this.parameters = params;
    if (params = Object.toQueryString(params)) {
        if (this.method == 'get')
            this.url += (this.url.include('?') ? '&' : '?') + params; else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
            params += '&_=';
    }
    try {
        var response = new Ajax.Response(this);
        if (this.options.onCreate)this.options.onCreate(response);
        Ajax.Responders.dispatch('onCreate', this, response);
        this.transport.open(this.method.toUpperCase(), this.url, this.options.asynchronous);
        if (this.options.asynchronous)this.respondToReadyState.bind(this).defer(1);
        this.transport.onreadystatechange = this.onStateChange.bind(this);
        this.setRequestHeaders();
        this.body = this.method == 'post' ? (this.options.postBody || params) : null;
        this.transport.send(this.body);
        if (!this.options.asynchronous && this.transport.overrideMimeType)
            this.onStateChange();
    }
    catch (e) {
        this.dispatchException(e);
    }
}, onStateChange: function () {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
        this.respondToReadyState(this.transport.readyState);
}, setRequestHeaders: function () {
    var headers = {'X-Requested-With': 'XMLHttpRequest', 'X-Prototype-Version': Prototype.Version, 'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'};
    if (this.method == 'post') {
        headers['Content-type'] = this.options.contentType +
            (this.options.encoding ? '; charset=' + this.options.encoding : '');
        if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0, 2005])[1] < 2005)
            headers['Connection'] = 'close';
    }
    if (typeof this.options.requestHeaders == 'object') {
        var extras = this.options.requestHeaders;
        if (Object.isFunction(extras.push))
            for (var i = 0, length = extras.length; i < length; i += 2)
                headers[extras[i]] = extras[i + 1]; else
            $H(extras).each(function (pair) {
                headers[pair.key] = pair.value
            });
    }
    for (var name in headers)
        this.transport.setRequestHeader(name, headers[name]);
}, success: function () {
    var status = this.getStatus();
    return!status || (status >= 200 && status < 300) || status == 304 || status == 1223;
}, getStatus: function () {
    try {
        return this.transport.status || 0;
    } catch (e) {
        return 0
    }
}, respondToReadyState: function (readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);
    if (state == 'Complete') {
        try {
            this._complete = true;
            (this.options['on' + response.status] || this.options['on' + (this.success() ? 'Success' : 'Failure')] || Prototype.emptyFunction)(response, response.headerJSON);
        } catch (e) {
            this.dispatchException(e);
        }
        var contentType = response.getHeader('Content-type');
        if (this.options.evalJS == 'force' || (this.options.evalJS && this.isSameOrigin() && contentType && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
            this.evalResponse();
    }
    try {
        (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
        Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
        this.dispatchException(e);
    }
    if (state == 'Complete') {
        this.transport.onreadystatechange = Prototype.emptyFunction;
    }
}, isSameOrigin: function () {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return!m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({protocol: location.protocol, domain: document.domain, port: location.port ? ':' + location.port : ''}));
}, getHeader: function (name) {
    try {
        return this.transport.getResponseHeader(name) || null;
    } catch (e) {
        return null
    }
}, evalResponse: function () {
    try {
        return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
        this.dispatchException(e);
    }
}, dispatchException: function (exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
}});
Ajax.Request.Events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
Ajax.Response = Class.create({initialize: function (request) {
    this.request = request;
    var transport = this.transport = request.transport, readyState = this.readyState = transport.readyState;
    if ((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
        this.status = this.getStatus();
        this.statusText = this.getStatusText();
        this.responseText = String.interpret(transport.responseText);
        this.headerJSON = this._getHeaderJSON();
    }
    if (readyState == 4) {
        var xml = transport.responseXML;
        this.responseXML = Object.isUndefined(xml) ? null : xml;
        this.responseJSON = this._getResponseJSON();
    }
}, status: 0, statusText: '', getStatus: Ajax.Request.prototype.getStatus, getStatusText: function () {
    try {
        return this.transport.statusText || '';
    } catch (e) {
        return''
    }
}, getHeader: Ajax.Request.prototype.getHeader, getAllHeaders: function () {
    try {
        return this.getAllResponseHeaders();
    } catch (e) {
        return null
    }
}, getResponseHeader: function (name) {
    return this.transport.getResponseHeader(name);
}, getAllResponseHeaders: function () {
    return this.transport.getAllResponseHeaders();
}, _getHeaderJSON: function () {
    var json = this.getHeader('X-JSON');
    if (!json)return null;
    json = decodeURIComponent(escape(json));
    try {
        return json.evalJSON(this.request.options.sanitizeJSON || !this.request.isSameOrigin());
    } catch (e) {
        this.request.dispatchException(e);
    }
}, _getResponseJSON: function () {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' && !(this.getHeader('Content-type') || '').include('application/json')) || this.responseText.blank())
        return null;
    try {
        return this.responseText.evalJSON(options.sanitizeJSON || !this.request.isSameOrigin());
    } catch (e) {
        this.request.dispatchException(e);
    }
}});
Ajax.Updater = Class.create(Ajax.Request, {initialize: function ($super, container, url, options) {
    this.container = {success: (container.success || container), failure: (container.failure || (container.success ? null : container))};
    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function (response, json) {
        this.updateContent(response.responseText);
        if (Object.isFunction(onComplete))onComplete(response, json);
    }).bind(this);
    $super(url, options);
}, updateContent: function (responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'], options = this.options;
    if (!options.evalScripts)responseText = responseText.stripScripts();
    if (receiver = $(receiver)) {
        if (options.insertion) {
            if (Object.isString(options.insertion)) {
                var insertion = {};
                insertion[options.insertion] = responseText;
                receiver.insert(insertion);
            }
            else options.insertion(receiver, responseText);
        }
        else receiver.update(responseText);
    }
}});
Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {initialize: function ($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;
    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);
    this.updater = {};
    this.container = container;
    this.url = url;
    this.start();
}, start: function () {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
}, stop: function () {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
}, updateComplete: function (response) {
    if (this.options.decay) {
        this.decay = (response.responseText == this.lastText ? this.decay * this.options.decay : 1);
        this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
}, onTimerEvent: function () {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
}});
function $(element) {
    if (arguments.length > 1) {
        for (var i = 0, elements = [], length = arguments.length; i < length; i++)
            elements.push($(arguments[i]));
        return elements;
    }
    if (Object.isString(element))
        element = document.getElementById(element);
    return Element.extend(element);
}
if (Prototype.BrowserFeatures.XPath) {
    document._getElementsByXPath = function (expression, parentElement) {
        var results = [];
        var query = document.evaluate(expression, $(parentElement) || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, length = query.snapshotLength; i < length; i++)
            results.push(Element.extend(query.snapshotItem(i)));
        return results;
    };
}
if (!window.Node)var Node = {};
if (!Node.ELEMENT_NODE) {
    Object.extend(Node, {ELEMENT_NODE: 1, ATTRIBUTE_NODE: 2, TEXT_NODE: 3, CDATA_SECTION_NODE: 4, ENTITY_REFERENCE_NODE: 5, ENTITY_NODE: 6, PROCESSING_INSTRUCTION_NODE: 7, COMMENT_NODE: 8, DOCUMENT_NODE: 9, DOCUMENT_TYPE_NODE: 10, DOCUMENT_FRAGMENT_NODE: 11, NOTATION_NODE: 12});
}
(function () {
    var element = this.Element;
    this.Element = function (tagName, attributes) {
        attributes = attributes || {};
        tagName = tagName.toLowerCase();
        var cache = Element.cache;
        if (Prototype.Browser.IE && attributes.name) {
            tagName = '<' + tagName + ' name="' + attributes.name + '">';
            delete attributes.name;
            return Element.writeAttribute(document.createElement(tagName), attributes);
        }
        if (!cache[tagName])cache[tagName] = Element.extend(document.createElement(tagName));
        return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
    };
    Object.extend(this.Element, element || {});
    if (element)this.Element.prototype = element.prototype;
}).call(window);
Element.cache = {};
Element.Methods = {visible: function (element) {
    return $(element).style.display != 'none';
}, toggle: function (element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
}, hide: function (element) {
    element = $(element);
    element.style.display = 'none';
    return element;
}, show: function (element) {
    element = $(element);
    element.style.display = '';
    return element;
}, remove: function (element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
}, update: function (element, content) {
    element = $(element);
    if (content && content.toElement)content = content.toElement();
    if (Object.isElement(content))return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
}, replace: function (element, content) {
    element = $(element);
    if (content && content.toElement)content = content.toElement(); else if (!Object.isElement(content)) {
        content = Object.toHTML(content);
        var range = element.ownerDocument.createRange();
        range.selectNode(element);
        content.evalScripts.bind(content).defer();
        content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
}, insert: function (element, insertions) {
    element = $(element);
    if (Object.isString(insertions) || Object.isNumber(insertions) || Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
        insertions = {bottom: insertions};
    var content, insert, tagName, childNodes;
    for (var position in insertions) {
        content = insertions[position];
        position = position.toLowerCase();
        insert = Element._insertionTranslations[position];
        if (content && content.toElement)content = content.toElement();
        if (Object.isElement(content)) {
            insert(element, content);
            continue;
        }
        content = Object.toHTML(content);
        tagName = ((position == 'before' || position == 'after') ? element.parentNode : element).tagName.toUpperCase();
        childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
        if (position == 'top' || position == 'after')childNodes.reverse();
        childNodes.each(insert.curry(element));
        content.evalScripts.bind(content).defer();
    }
    return element;
}, wrap: function (element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
        $(wrapper).writeAttribute(attributes || {}); else if (Object.isString(wrapper))wrapper = new Element(wrapper, attributes); else wrapper = new Element('div', wrapper);
    if (element.parentNode)
        element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
}, inspect: function (element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function (pair) {
        var property = pair.first(), attribute = pair.last();
        var value = (element[property] || '').toString();
        if (value)result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
}, recursivelyCollect: function (element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
        if (element.nodeType == 1)
            elements.push(Element.extend(element));
    return elements;
}, ancestors: function (element) {
    return $(element).recursivelyCollect('parentNode');
}, descendants: function (element) {
    return $(element).select("*");
}, firstDescendant: function (element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1)element = element.nextSibling;
    return $(element);
}, immediateDescendants: function (element) {
    if (!(element = $(element).firstChild))return[];
    while (element && element.nodeType != 1)element = element.nextSibling;
    if (element)return[element].concat($(element).nextSiblings());
    return[];
}, previousSiblings: function (element) {
    return $(element).recursivelyCollect('previousSibling');
}, nextSiblings: function (element) {
    return $(element).recursivelyCollect('nextSibling');
}, siblings: function (element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
}, match: function (element, selector) {
    if (Object.isString(selector))
        selector = new Selector(selector);
    return selector.match($(element));
}, up: function (element, expression, index) {
    element = $(element);
    if (arguments.length == 1)return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] : Selector.findElement(ancestors, expression, index);
}, down: function (element, expression, index) {
    element = $(element);
    if (arguments.length == 1)return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] : Element.select(element, expression)[index || 0];
}, previous: function (element, expression, index) {
    element = $(element);
    if (arguments.length == 1)return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] : Selector.findElement(previousSiblings, expression, index);
}, next: function (element, expression, index) {
    element = $(element);
    if (arguments.length == 1)return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] : Selector.findElement(nextSiblings, expression, index);
}, select: function () {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
}, adjacent: function () {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
}, identify: function (element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id)return id;
    do {
        id = 'anonymous_element_' + self.counter++
    } while ($(id));
    element.writeAttribute('id', id);
    return id;
}, readAttribute: function (element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
        var t = Element._attributeTranslations.read;
        if (t.values[name])return t.values[name](element, name);
        if (t.names[name])name = t.names[name];
        if (name.include(':')) {
            return(!element.attributes || !element.attributes[name]) ? null : element.attributes[name].value;
        }
    }
    return element.getAttribute(name);
}, writeAttribute: function (element, name, value) {
    element = $(element);
    var attributes = {}, t = Element._attributeTranslations.write;
    if (typeof name == 'object')attributes = name; else attributes[name] = Object.isUndefined(value) ? true : value;
    for (var attr in attributes) {
        name = t.names[attr] || attr;
        value = attributes[attr];
        if (t.values[attr])name = t.values[attr](element, value);
        if (value === false || value === null)
            element.removeAttribute(name); else if (value === true)
            element.setAttribute(name, name); else element.setAttribute(name, value);
    }
    return element;
}, getHeight: function (element) {
    return $(element).getDimensions().height;
}, getWidth: function (element) {
    return $(element).getDimensions().width;
}, classNames: function (element) {
    return new Element.ClassNames(element);
}, hasClassName: function (element, className) {
    if (!(element = $(element)))return;
    var elementClassName = element.className;
    return(elementClassName.length > 0 && (elementClassName == className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
}, addClassName: function (element, className) {
    if (!(element = $(element)))return;
    if (!Element.hasClassName(element, className))
        element.className += (element.className ? ' ' : '') + className;
    return element;
}, removeClassName: function (element, className) {
    if (!(element = $(element)))return;
    element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
}, toggleClassName: function (element, className) {
    if (!(element = $(element)))return;
    return element[element.hasClassName(className) ? 'removeClassName' : 'addClassName'](className);
}, cleanWhitespace: function (element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
        var nextNode = node.nextSibling;
        if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
            element.removeChild(node);
        node = nextNode;
    }
    return element;
}, empty: function (element) {
    return $(element).innerHTML.blank();
}, descendantOf: function (element, ancestor) {
    element = $(element), ancestor = $(ancestor);
    if (element.compareDocumentPosition)
        return(element.compareDocumentPosition(ancestor) & 8) === 8;
    if (ancestor.contains)
        return ancestor.contains(element) && ancestor !== element;
    while (element = element.parentNode)
        if (element == ancestor)return true;
    return false;
}, scrollTo: function (element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
}, getStyle: function (element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css[style] : null;
    }
    if (style == 'opacity')return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
}, getOpacity: function (element) {
    return $(element).getStyle('opacity');
}, setStyle: function (element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
        element.style.cssText += ';' + styles;
        return styles.include('opacity') ? element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
        if (property == 'opacity')element.setOpacity(styles[property]); else
            elementStyle[(property == 'float' || property == 'cssFloat') ? (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') : property] = styles[property];
    return element;
}, setOpacity: function (element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
}, getDimensions: function (element) {
    element = $(element);
    var display = element.getStyle('display');
    if (display != 'none' && display != null)
        return{width: element.offsetWidth, height: element.offsetHeight};
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return{width: originalWidth, height: originalHeight};
}, makePositioned: function (element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
        element._madePositioned = true;
        element.style.position = 'relative';
        if (Prototype.Browser.Opera) {
            element.style.top = 0;
            element.style.left = 0;
        }
    }
    return element;
}, undoPositioned: function (element) {
    element = $(element);
    if (element._madePositioned) {
        element._madePositioned = undefined;
        element.style.position = element.style.top = element.style.left = element.style.bottom = element.style.right = '';
    }
    return element;
}, makeClipping: function (element) {
    element = $(element);
    if (element._overflow)return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
        element.style.overflow = 'hidden';
    return element;
}, undoClipping: function (element) {
    element = $(element);
    if (!element._overflow)return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
}, cumulativeOffset: function (element) {
    var valueT = 0, valueL = 0;
    do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
}, positionedOffset: function (element) {
    var valueT = 0, valueL = 0;
    do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
        if (element) {
            if (element.tagName.toUpperCase() == 'BODY')break;
            var p = Element.getStyle(element, 'position');
            if (p !== 'static')break;
        }
    } while (element);
    return Element._returnOffset(valueL, valueT);
}, absolutize: function (element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute')return element;
    var offsets = element.positionedOffset();
    var top = offsets[1];
    var left = offsets[0];
    var width = element.clientWidth;
    var height = element.clientHeight;
    element._originalLeft = left - parseFloat(element.style.left || 0);
    element._originalTop = top - parseFloat(element.style.top || 0);
    element._originalWidth = element.style.width;
    element._originalHeight = element.style.height;
    element.style.position = 'absolute';
    element.style.top = top + 'px';
    element.style.left = left + 'px';
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    return element;
}, relativize: function (element) {
    element = $(element);
    if (element.getStyle('position') == 'relative')return element;
    element.style.position = 'relative';
    var top = parseFloat(element.style.top || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);
    element.style.top = top + 'px';
    element.style.left = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width = element._originalWidth;
    return element;
}, cumulativeScrollOffset: function (element) {
    var valueT = 0, valueL = 0;
    do {
        valueT += element.scrollTop || 0;
        valueL += element.scrollLeft || 0;
        element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
}, getOffsetParent: function (element) {
    if (element.offsetParent)return $(element.offsetParent);
    if (element == document.body)return $(element);
    while ((element = element.parentNode) && element != document.body && Object.isElement(element))
        if (Element.getStyle(element, 'position') != 'static')
            return $(element);
    return $(document.body);
}, viewportOffset: function (forElement) {
    var valueT = 0, valueL = 0;
    var element = forElement;
    do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        if (element.offsetParent == document.body && Element.getStyle(element, 'position') == 'absolute')break;
    } while (element = element.offsetParent);
    element = forElement;
    do {
        if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
            valueT -= element.scrollTop || 0;
            valueL -= element.scrollLeft || 0;
        }
    } while (element = element.parentNode);
    return Element._returnOffset(valueL, valueT);
}, clonePosition: function (element, source) {
    var options = Object.extend({setLeft: true, setTop: true, setWidth: true, setHeight: true, offsetTop: 0, offsetLeft: 0}, arguments[2] || {});
    source = $(source);
    var p = source.viewportOffset();
    element = $(element);
    var delta = [0, 0];
    var parent = null;
    if (Element.getStyle(element, 'position') == 'absolute') {
        parent = element.getOffsetParent();
        delta = parent.viewportOffset();
    }
    if (parent == document.body) {
        delta[0] -= document.body.offsetLeft;
        delta[1] -= document.body.offsetTop;
    }
    if (options.setLeft)element.style.left = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)element.style.top = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)element.style.width = source.offsetWidth + 'px';
    if (options.setHeight)element.style.height = source.offsetHeight + 'px';
    return element;
}};
Element.Methods.identify.counter = 1;
Object.extend(Element.Methods, {getElementsBySelector: Element.Methods.select, childElements: Element.Methods.immediateDescendants});
Element._attributeTranslations = {write: {names: {className: 'class', htmlFor: 'for'}, values: {}}};
if (Prototype.Browser.Opera) {
    Element.Methods.getStyle = Element.Methods.getStyle.wrap(function (proceed, element, style) {
        switch (style) {
            case'left':
            case'top':
            case'right':
            case'bottom':
                if (proceed(element, 'position') === 'static')return null;
            case'height':
            case'width':
                if (!Element.visible(element))return null;
                var dim = parseInt(proceed(element, style), 10);
                if (dim !== element['offset' + style.capitalize()])
                    return dim + 'px';
                var properties;
                if (style === 'height') {
                    properties = ['border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width'];
                }
                else {
                    properties = ['border-left-width', 'padding-left', 'padding-right', 'border-right-width'];
                }
                return properties.inject(dim, function (memo, property) {
                    var val = proceed(element, property);
                    return val === null ? memo : memo - parseInt(val, 10);
                }) + 'px';
            default:
                return proceed(element, style);
        }
    });
    Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(function (proceed, element, attribute) {
        if (attribute === 'title')return element.title;
        return proceed(element, attribute);
    });
}
else if (Prototype.Browser.IE) {
    Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(function (proceed, element) {
        element = $(element);
        try {
            element.offsetParent
        }
        catch (e) {
            return $(document.body)
        }
        var position = element.getStyle('position');
        if (position !== 'static')return proceed(element);
        element.setStyle({position: 'relative'});
        var value = proceed(element);
        element.setStyle({position: position});
        return value;
    });
    $w('positionedOffset viewportOffset').each(function (method) {
        Element.Methods[method] = Element.Methods[method].wrap(function (proceed, element) {
            element = $(element);
            try {
                element.offsetParent
            }
            catch (e) {
                return Element._returnOffset(0, 0)
            }
            var position = element.getStyle('position');
            if (position !== 'static')return proceed(element);
            var offsetParent = element.getOffsetParent();
            if (offsetParent && offsetParent.getStyle('position') === 'fixed')
                offsetParent.setStyle({zoom: 1});
            element.setStyle({position: 'relative'});
            var value = proceed(element);
            element.setStyle({position: position});
            return value;
        });
    });
    Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(function (proceed, element) {
        try {
            element.offsetParent
        }
        catch (e) {
            return Element._returnOffset(0, 0)
        }
        return proceed(element);
    });
    Element.Methods.getStyle = function (element, style) {
        element = $(element);
        style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
        var value = element.style[style];
        if (!value && element.currentStyle)value = element.currentStyle[style];
        if (style == 'opacity') {
            if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
                if (value[1])return parseFloat(value[1]) / 100;
            return 1.0;
        }
        if (value == 'auto') {
            if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
                return element['offset' + style.capitalize()] + 'px';
            return null;
        }
        return value;
    };
    Element.Methods.setOpacity = function (element, value) {
        function stripAlpha(filter) {
            return filter.replace(/alpha\([^\)]*\)/gi, '');
        }

        element = $(element);
        var currentStyle = element.currentStyle;
        if ((currentStyle && !currentStyle.hasLayout) || (!currentStyle && element.style.zoom == 'normal'))
            element.style.zoom = 1;
        var filter = element.getStyle('filter'), style = element.style;
        if (value == 1 || value === '') {
            (filter = stripAlpha(filter)) ? style.filter = filter : style.removeAttribute('filter');
            return element;
        } else if (value < 0.00001)value = 0;
        style.filter = stripAlpha(filter) + 'alpha(opacity=' + (value * 100) + ')';
        return element;
    };
    Element._attributeTranslations = {read: {names: {'class': 'className', 'for': 'htmlFor'}, values: {_getAttr: function (element, attribute) {
        return element.getAttribute(attribute, 2);
    }, _getAttrNode: function (element, attribute) {
        var node = element.getAttributeNode(attribute);
        return node ? node.value : "";
    }, _getEv: function (element, attribute) {
        attribute = element.getAttribute(attribute);
        return attribute ? attribute.toString().slice(23, -2) : null;
    }, _flag: function (element, attribute) {
        return $(element).hasAttribute(attribute) ? attribute : null;
    }, style: function (element) {
        return element.style.cssText.toLowerCase();
    }, title: function (element) {
        return element.title;
    }}}};
    Element._attributeTranslations.write = {names: Object.extend({cellpadding: 'cellPadding', cellspacing: 'cellSpacing'}, Element._attributeTranslations.read.names), values: {checked: function (element, value) {
        element.checked = !!value;
    }, style: function (element, value) {
        element.style.cssText = value ? value : '';
    }}};
    Element._attributeTranslations.has = {};
    $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' + 'encType maxLength readOnly longDesc frameBorder').each(function (attr) {
        Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
        Element._attributeTranslations.has[attr.toLowerCase()] = attr;
    });
    (function (v) {
        Object.extend(v, {href: v._getAttr, src: v._getAttr, type: v._getAttr, action: v._getAttrNode, disabled: v._flag, checked: v._flag, readonly: v._flag, multiple: v._flag, onload: v._getEv, onunload: v._getEv, onclick: v._getEv, ondblclick: v._getEv, onmousedown: v._getEv, onmouseup: v._getEv, onmouseover: v._getEv, onmousemove: v._getEv, onmouseout: v._getEv, onfocus: v._getEv, onblur: v._getEv, onkeypress: v._getEv, onkeydown: v._getEv, onkeyup: v._getEv, onsubmit: v._getEv, onreset: v._getEv, onselect: v._getEv, onchange: v._getEv});
    })(Element._attributeTranslations.read.values);
}
else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
    Element.Methods.setOpacity = function (element, value) {
        element = $(element);
        element.style.opacity = (value == 1) ? 0.999999 : (value === '') ? '' : (value < 0.00001) ? 0 : value;
        return element;
    };
}
else if (Prototype.Browser.WebKit) {
    Element.Methods.setOpacity = function (element, value) {
        element = $(element);
        element.style.opacity = (value == 1 || value === '') ? '' : (value < 0.00001) ? 0 : value;
        if (value == 1)
            if (element.tagName.toUpperCase() == 'IMG' && element.width) {
                element.width++;
                element.width--;
            } else try {
                var n = document.createTextNode(' ');
                element.appendChild(n);
                element.removeChild(n);
            } catch (e) {
            }
        return element;
    };
    Element.Methods.cumulativeOffset = function (element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop || 0;
            valueL += element.offsetLeft || 0;
            if (element.offsetParent == document.body)
                if (Element.getStyle(element, 'position') == 'absolute')break;
            element = element.offsetParent;
        } while (element);
        return Element._returnOffset(valueL, valueT);
    };
}
if (Prototype.Browser.IE || Prototype.Browser.Opera) {
    Element.Methods.update = function (element, content) {
        element = $(element);
        if (content && content.toElement)content = content.toElement();
        if (Object.isElement(content))return element.update().insert(content);
        content = Object.toHTML(content);
        var tagName = element.tagName.toUpperCase();
        if (tagName in Element._insertionTranslations.tags) {
            $A(element.childNodes).each(function (node) {
                element.removeChild(node)
            });
            Element._getContentFromAnonymousElement(tagName, content.stripScripts()).each(function (node) {
                element.appendChild(node)
            });
        }
        else element.innerHTML = content.stripScripts();
        content.evalScripts.bind(content).defer();
        return element;
    };
}
if ('outerHTML'in document.createElement('div')) {
    Element.Methods.replace = function (element, content) {
        element = $(element);
        if (content && content.toElement)content = content.toElement();
        if (Object.isElement(content)) {
            element.parentNode.replaceChild(content, element);
            return element;
        }
        content = Object.toHTML(content);
        var parent = element.parentNode, tagName = parent.tagName.toUpperCase();
        if (Element._insertionTranslations.tags[tagName]) {
            var nextSibling = element.next();
            var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
            parent.removeChild(element);
            if (nextSibling)
                fragments.each(function (node) {
                    parent.insertBefore(node, nextSibling)
                }); else
                fragments.each(function (node) {
                    parent.appendChild(node)
                });
        }
        else element.outerHTML = content.stripScripts();
        content.evalScripts.bind(content).defer();
        return element;
    };
}
Element._returnOffset = function (l, t) {
    var result = [l, t];
    result.left = l;
    result.top = t;
    return result;
};
Element._getContentFromAnonymousElement = function (tagName, html) {
    var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
    if (t) {
        div.innerHTML = t[0] + html + t[1];
        t[2].times(function () {
            div = div.firstChild
        });
    } else div.innerHTML = html;
    return $A(div.childNodes);
};
Element._insertionTranslations = {before: function (element, node) {
    element.parentNode.insertBefore(node, element);
}, top: function (element, node) {
    element.insertBefore(node, element.firstChild);
}, bottom: function (element, node) {
    element.appendChild(node);
}, after: function (element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
}, tags: {TABLE: ['<table>', '</table>', 1], TBODY: ['<table><tbody>', '</tbody></table>', 2], TR: ['<table><tbody><tr>', '</tr></tbody></table>', 3], TD: ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4], SELECT: ['<select>', '</select>', 1]}};
(function () {
    Object.extend(this.tags, {THEAD: this.tags.TBODY, TFOOT: this.tags.TBODY, TH: this.tags.TD});
}).call(Element._insertionTranslations);
Element.Methods.Simulated = {hasAttribute: function (element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return!!(node && node.specified);
}};
Element.Methods.ByTag = {};
Object.extend(Element, Element.Methods);
if (!Prototype.BrowserFeatures.ElementExtensions && document.createElement('div')['__proto__']) {
    window.HTMLElement = {};
    window.HTMLElement.prototype = document.createElement('div')['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
}
Element.extend = (function () {
    if (Prototype.BrowserFeatures.SpecificElementExtensions)
        return Prototype.K;
    var Methods = {}, ByTag = Element.Methods.ByTag;
    var extend = Object.extend(function (element) {
        if (!element || element._extendedByPrototype || element.nodeType != 1 || element == window)return element;
        var methods = Object.clone(Methods), tagName = element.tagName.toUpperCase(), property, value;
        if (ByTag[tagName])Object.extend(methods, ByTag[tagName]);
        for (property in methods) {
            value = methods[property];
            if (Object.isFunction(value) && !(property in element))
                element[property] = value.methodize();
        }
        element._extendedByPrototype = Prototype.emptyFunction;
        return element;
    }, {refresh: function () {
        if (!Prototype.BrowserFeatures.ElementExtensions) {
            Object.extend(Methods, Element.Methods);
            Object.extend(Methods, Element.Methods.Simulated);
        }
    }});
    extend.refresh();
    return extend;
})();
Element.hasAttribute = function (element, attribute) {
    if (element.hasAttribute)return element.hasAttribute(attribute);
    return Element.Methods.Simulated.hasAttribute(element, attribute);
};
Element.addMethods = function (methods) {
    var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;
    if (!methods) {
        Object.extend(Form, Form.Methods);
        Object.extend(Form.Element, Form.Element.Methods);
        Object.extend(Element.Methods.ByTag, {"FORM": Object.clone(Form.Methods), "INPUT": Object.clone(Form.Element.Methods), "SELECT": Object.clone(Form.Element.Methods), "TEXTAREA": Object.clone(Form.Element.Methods)});
    }
    if (arguments.length == 2) {
        var tagName = methods;
        methods = arguments[1];
    }
    if (!tagName)Object.extend(Element.Methods, methods || {}); else {
        if (Object.isArray(tagName))tagName.each(extend); else extend(tagName);
    }
    function extend(tagName) {
        tagName = tagName.toUpperCase();
        if (!Element.Methods.ByTag[tagName])
            Element.Methods.ByTag[tagName] = {};
        Object.extend(Element.Methods.ByTag[tagName], methods);
    }

    function copy(methods, destination, onlyIfAbsent) {
        onlyIfAbsent = onlyIfAbsent || false;
        for (var property in methods) {
            var value = methods[property];
            if (!Object.isFunction(value))continue;
            if (!onlyIfAbsent || !(property in destination))
                destination[property] = value.methodize();
        }
    }

    function findDOMClass(tagName) {
        var klass;
        var trans = {"OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph", "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList", "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading", "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote", "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION": "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD": "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR": "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET": "FrameSet", "IFRAME": "IFrame"};
        if (trans[tagName])klass = 'HTML' + trans[tagName] + 'Element';
        if (window[klass])return window[klass];
        klass = 'HTML' + tagName + 'Element';
        if (window[klass])return window[klass];
        klass = 'HTML' + tagName.capitalize() + 'Element';
        if (window[klass])return window[klass];
        window[klass] = {};
        window[klass].prototype = document.createElement(tagName)['__proto__'];
        return window[klass];
    }

    if (F.ElementExtensions) {
        copy(Element.Methods, HTMLElement.prototype);
        copy(Element.Methods.Simulated, HTMLElement.prototype, true);
    }
    if (F.SpecificElementExtensions) {
        for (var tag in Element.Methods.ByTag) {
            var klass = findDOMClass(tag);
            if (Object.isUndefined(klass))continue;
            copy(T[tag], klass.prototype);
        }
    }
    Object.extend(Element, Element.Methods);
    delete Element.ByTag;
    if (Element.extend.refresh)Element.extend.refresh();
    Element.cache = {};
};
document.viewport = {getDimensions: function () {
    var dimensions = {}, B = Prototype.Browser;
    $w('width height').each(function (d) {
        var D = d.capitalize();
        if (B.WebKit && !document.evaluate) {
            dimensions[d] = self['inner' + D];
        } else if (B.Opera && parseFloat(window.opera.version()) < 9.5) {
            dimensions[d] = document.body['client' + D]
        } else {
            dimensions[d] = document.documentElement['client' + D];
        }
    });
    return dimensions;
}, getWidth: function () {
    return this.getDimensions().width;
}, getHeight: function () {
    return this.getDimensions().height;
}, getScrollOffsets: function () {
    return Element._returnOffset(window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
}};
var Selector = Class.create({initialize: function (expression) {
    this.expression = expression.strip();
    if (this.shouldUseSelectorsAPI()) {
        this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
        this.mode = 'xpath';
        this.compileXPathMatcher();
    } else {
        this.mode = "normal";
        this.compileMatcher();
    }
}, shouldUseXPath: function () {
    if (!Prototype.BrowserFeatures.XPath)return false;
    var e = this.expression;
    if (Prototype.Browser.WebKit && (e.include("-of-type") || e.include(":empty")))
        return false;
    if ((/(\[[\w-]*?:|:checked)/).test(e))
        return false;
    return true;
}, shouldUseSelectorsAPI: function () {
    if (!Prototype.BrowserFeatures.SelectorsAPI)return false;
    if (!Selector._div)Selector._div = new Element('div');
    try {
        Selector._div.querySelector(this.expression);
    } catch (e) {
        return false;
    }
    return true;
}, compileMatcher: function () {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers, c = Selector.criteria, le, p, m;
    if (Selector._cache[e]) {
        this.matcher = Selector._cache[e];
        return;
    }
    this.matcher = ["this.matcher = function(root) {", "var r = root, h = Selector.handlers, c = false, n;"];
    while (e && le != e && (/\S/).test(e)) {
        le = e;
        for (var i in ps) {
            p = ps[i];
            if (m = e.match(p)) {
                this.matcher.push(Object.isFunction(c[i]) ? c[i](m) : new Template(c[i]).evaluate(m));
                e = e.replace(m[0], '');
                break;
            }
        }
    }
    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
}, compileXPathMatcher: function () {
    var e = this.expression, ps = Selector.patterns, x = Selector.xpath, le, m;
    if (Selector._cache[e]) {
        this.xpath = Selector._cache[e];
        return;
    }
    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
        le = e;
        for (var i in ps) {
            if (m = e.match(ps[i])) {
                this.matcher.push(Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m));
                e = e.replace(m[0], '');
                break;
            }
        }
    }
    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
}, findElements: function (root) {
    root = root || document;
    var e = this.expression, results;
    switch (this.mode) {
        case'selectorsAPI':
            if (root !== document) {
                var oldId = root.id, id = $(root).identify();
                id = id.replace(/([\.:])/g, "\\$1");
                e = "#" + id + " " + e;
            }
            results = $A(root.querySelectorAll(e)).map(Element.extend);
            root.id = oldId;
            return results;
        case'xpath':
            return document._getElementsByXPath(this.xpath, root);
        default:
            return this.matcher(root);
    }
}, match: function (element) {
    this.tokens = [];
    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;
    while (e && le !== e && (/\S/).test(e)) {
        le = e;
        for (var i in ps) {
            p = ps[i];
            if (m = e.match(p)) {
                if (as[i]) {
                    this.tokens.push([i, Object.clone(m)]);
                    e = e.replace(m[0], '');
                } else {
                    return this.findElements(document).include(element);
                }
            }
        }
    }
    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
        name = token[0], matches = token[1];
        if (!Selector.assertions[name](element, matches)) {
            match = false;
            break;
        }
    }
    return match;
}, toString: function () {
    return this.expression;
}, inspect: function () {
    return"#<Selector:" + this.expression.inspect() + ">";
}});
Object.extend(Selector, {_cache: {}, xpath: {descendant: "//*", child: "/*", adjacent: "/following-sibling::*[1]", laterSibling: '/following-sibling::*', tagName: function (m) {
    if (m[1] == '*')return'';
    return"[local-name()='" + m[1].toLowerCase() + "' or local-name()='" + m[1].toUpperCase() + "']";
}, className: "[contains(concat(' ', @class, ' '), ' #{1} ')]", id: "[@id='#{1}']", attrPresence: function (m) {
    m[1] = m[1].toLowerCase();
    return new Template("[@#{1}]").evaluate(m);
}, attr: function (m) {
    m[1] = m[1].toLowerCase();
    m[3] = m[5] || m[6];
    return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
}, pseudo: function (m) {
    var h = Selector.xpath.pseudos[m[1]];
    if (!h)return'';
    if (Object.isFunction(h))return h(m);
    return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
}, operators: {'=': "[@#{1}='#{3}']", '!=': "[@#{1}!='#{3}']", '^=': "[starts-with(@#{1}, '#{3}')]", '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']", '*=': "[contains(@#{1}, '#{3}')]", '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]", '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"}, pseudos: {'first-child': '[not(preceding-sibling::*)]', 'last-child': '[not(following-sibling::*)]', 'only-child': '[not(preceding-sibling::* or following-sibling::*)]', 'empty': "[count(*) = 0 and (count(text()) = 0)]", 'checked': "[@checked]", 'disabled': "[(@disabled) and (@type!='hidden')]", 'enabled': "[not(@disabled) and (@type!='hidden')]", 'not': function (m) {
    var e = m[6], p = Selector.patterns, x = Selector.xpath, le, v;
    var exclusion = [];
    while (e && le != e && (/\S/).test(e)) {
        le = e;
        for (var i in p) {
            if (m = e.match(p[i])) {
                v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
                exclusion.push("(" + v.substring(1, v.length - 1) + ")");
                e = e.replace(m[0], '');
                break;
            }
        }
    }
    return"[not(" + exclusion.join(" and ") + ")]";
}, 'nth-child': function (m) {
    return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
}, 'nth-last-child': function (m) {
    return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
}, 'nth-of-type': function (m) {
    return Selector.xpath.pseudos.nth("position() ", m);
}, 'nth-last-of-type': function (m) {
    return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
}, 'first-of-type': function (m) {
    m[6] = "1";
    return Selector.xpath.pseudos['nth-of-type'](m);
}, 'last-of-type': function (m) {
    m[6] = "1";
    return Selector.xpath.pseudos['nth-last-of-type'](m);
}, 'only-of-type': function (m) {
    var p = Selector.xpath.pseudos;
    return p['first-of-type'](m) + p['last-of-type'](m);
}, nth: function (fragment, m) {
    var mm, formula = m[6], predicate;
    if (formula == 'even')formula = '2n+0';
    if (formula == 'odd')formula = '2n+1';
    if (mm = formula.match(/^(\d+)$/))
        return'[' + fragment + "= " + mm[1] + ']';
    if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
        if (mm[1] == "-")mm[1] = -1;
        var a = mm[1] ? Number(mm[1]) : 1;
        var b = mm[2] ? Number(mm[2]) : 0;
        predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " + "((#{fragment} - #{b}) div #{a} >= 0)]";
        return new Template(predicate).evaluate({fragment: fragment, a: a, b: b});
    }
}}}, criteria: {tagName: 'n = h.tagName(n, r, "#{1}", c);      c = false;', className: 'n = h.className(n, r, "#{1}", c);    c = false;', id: 'n = h.id(n, r, "#{1}", c);           c = false;', attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;', attr: function (m) {
    m[3] = (m[5] || m[6]);
    return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
}, pseudo: function (m) {
    if (m[6])m[6] = m[6].replace(/"/g, '\\"');
    return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
}, descendant: 'c = "descendant";', child: 'c = "child";', adjacent: 'c = "adjacent";', laterSibling: 'c = "laterSibling";'}, patterns: {laterSibling: /^\s*~\s*/, child: /^\s*>\s*/, adjacent: /^\s*\+\s*/, descendant: /^\s/, tagName: /^\s*(\*|[\w\-]+)(\b|$)?/, id: /^#([\w\-\*]+)(\b|$)/, className: /^\.([\w\-\*]+)(\b|$)/, pseudo: /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/, attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/, attr: /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/}, assertions: {tagName: function (element, matches) {
    return matches[1].toUpperCase() == element.tagName.toUpperCase();
}, className: function (element, matches) {
    return Element.hasClassName(element, matches[1]);
}, id: function (element, matches) {
    return element.id === matches[1];
}, attrPresence: function (element, matches) {
    return Element.hasAttribute(element, matches[1]);
}, attr: function (element, matches) {
    var nodeValue = Element.readAttribute(element, matches[1]);
    return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
}}, handlers: {concat: function (a, b) {
    for (var i = 0, node; node = b[i]; i++)
        a.push(node);
    return a;
}, mark: function (nodes) {
    var _true = Prototype.emptyFunction;
    for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
    return nodes;
}, unmark: function (nodes) {
    for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
    return nodes;
}, index: function (parentNode, reverse, ofType) {
    parentNode._countedByPrototype = Prototype.emptyFunction;
    if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
            var node = nodes[i];
            if (node.nodeType == 1 && (!ofType || node._countedByPrototype))node.nodeIndex = j++;
        }
    } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
            if (node.nodeType == 1 && (!ofType || node._countedByPrototype))node.nodeIndex = j++;
    }
}, unique: function (nodes) {
    if (nodes.length == 0)return nodes;
    var results = [], n;
    for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
            n._countedByPrototype = Prototype.emptyFunction;
            results.push(Element.extend(n));
        }
    return Selector.handlers.unmark(results);
}, descendant: function (nodes) {
    var h = Selector.handlers;
    for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
    return results;
}, child: function (nodes) {
    var h = Selector.handlers;
    for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
            if (child.nodeType == 1 && child.tagName != '!')results.push(child);
    }
    return results;
}, adjacent: function (nodes) {
    for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next)results.push(next);
    }
    return results;
}, laterSibling: function (nodes) {
    var h = Selector.handlers;
    for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
    return results;
}, nextElementSibling: function (node) {
    while (node = node.nextSibling)
        if (node.nodeType == 1)return node;
    return null;
}, previousElementSibling: function (node) {
    while (node = node.previousSibling)
        if (node.nodeType == 1)return node;
    return null;
}, tagName: function (nodes, root, tagName, combinator) {
    var uTagName = tagName.toUpperCase();
    var results = [], h = Selector.handlers;
    if (nodes) {
        if (combinator) {
            if (combinator == "descendant") {
                for (var i = 0, node; node = nodes[i]; i++)
                    h.concat(results, node.getElementsByTagName(tagName));
                return results;
            } else nodes = this[combinator](nodes);
            if (tagName == "*")return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
            if (node.tagName.toUpperCase() === uTagName)results.push(node);
        return results;
    } else return root.getElementsByTagName(tagName);
}, id: function (nodes, root, id, combinator) {
    var targetNode = $(id), h = Selector.handlers;
    if (!targetNode)return[];
    if (!nodes && root == document)return[targetNode];
    if (nodes) {
        if (combinator) {
            if (combinator == 'child') {
                for (var i = 0, node; node = nodes[i]; i++)
                    if (targetNode.parentNode == node)return[targetNode];
            } else if (combinator == 'descendant') {
                for (var i = 0, node; node = nodes[i]; i++)
                    if (Element.descendantOf(targetNode, node))return[targetNode];
            } else if (combinator == 'adjacent') {
                for (var i = 0, node; node = nodes[i]; i++)
                    if (Selector.handlers.previousElementSibling(targetNode) == node)
                        return[targetNode];
            } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
            if (node == targetNode)return[targetNode];
        return[];
    }
    return(targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
}, className: function (nodes, root, className, combinator) {
    if (nodes && combinator)nodes = this[combinator](nodes);
    return Selector.handlers.byClassName(nodes, root, className);
}, byClassName: function (nodes, root, className) {
    if (!nodes)nodes = Selector.handlers.descendant([root]);
    var needle = ' ' + className + ' ';
    for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0)continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
            results.push(node);
    }
    return results;
}, attrPresence: function (nodes, root, attr, combinator) {
    if (!nodes)nodes = root.getElementsByTagName("*");
    if (nodes && combinator)nodes = this[combinator](nodes);
    var results = [];
    for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr))results.push(node);
    return results;
}, attr: function (nodes, root, attr, value, operator, combinator) {
    if (!nodes)nodes = root.getElementsByTagName("*");
    if (nodes && combinator)nodes = this[combinator](nodes);
    var handler = Selector.operators[operator], results = [];
    for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null)continue;
        if (handler(nodeValue, value))results.push(node);
    }
    return results;
}, pseudo: function (nodes, name, value, root, combinator) {
    if (nodes && combinator)nodes = this[combinator](nodes);
    if (!nodes)nodes = root.getElementsByTagName("*");
    return Selector.pseudos[name](nodes, value, root);
}}, pseudos: {'first-child': function (nodes, value, root) {
    for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node))continue;
        results.push(node);
    }
    return results;
}, 'last-child': function (nodes, value, root) {
    for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node))continue;
        results.push(node);
    }
    return results;
}, 'only-child': function (nodes, value, root) {
    var h = Selector.handlers;
    for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
            results.push(node);
    return results;
}, 'nth-child': function (nodes, formula, root) {
    return Selector.pseudos.nth(nodes, formula, root);
}, 'nth-last-child': function (nodes, formula, root) {
    return Selector.pseudos.nth(nodes, formula, root, true);
}, 'nth-of-type': function (nodes, formula, root) {
    return Selector.pseudos.nth(nodes, formula, root, false, true);
}, 'nth-last-of-type': function (nodes, formula, root) {
    return Selector.pseudos.nth(nodes, formula, root, true, true);
}, 'first-of-type': function (nodes, formula, root) {
    return Selector.pseudos.nth(nodes, "1", root, false, true);
}, 'last-of-type': function (nodes, formula, root) {
    return Selector.pseudos.nth(nodes, "1", root, true, true);
}, 'only-of-type': function (nodes, formula, root) {
    var p = Selector.pseudos;
    return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
}, getIndices: function (a, b, total) {
    if (a == 0)return b > 0 ? [b] : [];
    return $R(1, total).inject([], function (memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0)memo.push(i);
        return memo;
    });
}, nth: function (nodes, formula, root, reverse, ofType) {
    if (nodes.length == 0)return[];
    if (formula == 'even')formula = '2n+0';
    if (formula == 'odd')formula = '2n+1';
    var h = Selector.handlers, results = [], indexed = [], m;
    h.mark(nodes);
    for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
            h.index(node.parentNode, reverse, ofType);
            indexed.push(node.parentNode);
        }
    }
    if (formula.match(/^\d+$/)) {
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
            if (node.nodeIndex == formula)results.push(node);
    } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
        if (m[1] == "-")m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
            for (var j = 0; j < l; j++)
                if (node.nodeIndex == indices[j])results.push(node);
        }
    }
    h.unmark(nodes);
    h.unmark(indexed);
    return results;
}, 'empty': function (nodes, value, root) {
    for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (node.tagName == '!' || node.firstChild)continue;
        results.push(node);
    }
    return results;
}, 'not': function (nodes, selector, root) {
    var h = Selector.handlers, selectorType, m;
    var exclusions = new Selector(selector).findElements(root);
    h.mark(exclusions);
    for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype)results.push(node);
    h.unmark(exclusions);
    return results;
}, 'enabled': function (nodes, value, root) {
    for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
            results.push(node);
    return results;
}, 'disabled': function (nodes, value, root) {
    for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled)results.push(node);
    return results;
}, 'checked': function (nodes, value, root) {
    for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked)results.push(node);
    return results;
}}, operators: {'=': function (nv, v) {
    return nv == v;
}, '!=': function (nv, v) {
    return nv != v;
}, '^=': function (nv, v) {
    return nv == v || nv && nv.startsWith(v);
}, '$=': function (nv, v) {
    return nv == v || nv && nv.endsWith(v);
}, '*=': function (nv, v) {
    return nv == v || nv && nv.include(v);
}, '$=': function (nv, v) {
    return nv.endsWith(v);
}, '*=': function (nv, v) {
    return nv.include(v);
}, '~=': function (nv, v) {
    return(' ' + nv + ' ').include(' ' + v + ' ');
}, '|=': function (nv, v) {
    return('-' + (nv || "").toUpperCase() + '-').include('-' + (v || "").toUpperCase() + '-');
}}, split: function (expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function (m) {
        expressions.push(m[1].strip());
    });
    return expressions;
}, matchElements: function (elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
        if (element._countedByPrototype)results.push(element);
    h.unmark(matches);
    return results;
}, findElement: function (elements, expression, index) {
    if (Object.isNumber(expression)) {
        index = expression;
        expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
}, findChildElements: function (element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
        selector = new Selector(expressions[i].strip());
        h.concat(results, selector.findElements(element));
    }
    return(l > 1) ? h.unique(results) : results;
}});
if (Prototype.Browser.IE) {
    Object.extend(Selector.handlers, {concat: function (a, b) {
        for (var i = 0, node; node = b[i]; i++)
            if (node.tagName !== "!")a.push(node);
        return a;
    }, unmark: function (nodes) {
        for (var i = 0, node; node = nodes[i]; i++)
            node.removeAttribute('_countedByPrototype');
        return nodes;
    }});
}
function $$() {
    return Selector.findChildElements(document, $A(arguments));
}
var Form = {reset: function (form) {
    $(form).reset();
    return form;
}, serializeElements: function (elements, options) {
    if (typeof options != 'object')options = {hash: !!options}; else if (Object.isUndefined(options.hash))options.hash = true;
    var key, value, submitted = false, submit = options.submit;
    var data = elements.inject({}, function (result, element) {
        if (!element.disabled && element.name) {
            key = element.name;
            value = $(element).getValue();
            if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted && submit !== false && (!submit || key == submit) && (submitted = true)))) {
                if (key in result) {
                    if (!Object.isArray(result[key]))result[key] = [result[key]];
                    result[key].push(value);
                }
                else result[key] = value;
            }
        }
        return result;
    });
    return options.hash ? data : Object.toQueryString(data);
}};
Form.Methods = {serialize: function (form, options) {
    return Form.serializeElements(Form.getElements(form), options);
}, getElements: function (form) {
    return $A($(form).getElementsByTagName('*')).inject([], function (elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
            elements.push(Element.extend(child));
        return elements;
    });
}, getInputs: function (form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');
    if (!typeName && !name)return $A(inputs).map(Element.extend);
    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
        var input = inputs[i];
        if ((typeName && input.type != typeName) || (name && input.name != name))
            continue;
        matchingInputs.push(Element.extend(input));
    }
    return matchingInputs;
}, disable: function (form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
}, enable: function (form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
}, findFirstElement: function (form) {
    var elements = $(form).getElements().findAll(function (element) {
        return'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function (element) {
        return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function (element) {
        return element.tabIndex
    }).first();
    return firstByIndex ? firstByIndex : elements.find(function (element) {
        return['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
}, focusFirstElement: function (form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
}, request: function (form, options) {
    form = $(form), options = Object.clone(options || {});
    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank())action = window.location.href;
    options.parameters = form.serialize(true);
    if (params) {
        if (Object.isString(params))params = params.toQueryParams();
        Object.extend(options.parameters, params);
    }
    if (form.hasAttribute('method') && !options.method)
        options.method = form.method;
    return new Ajax.Request(action, options);
}};
Form.Element = {focus: function (element) {
    $(element).focus();
    return element;
}, select: function (element) {
    $(element).select();
    return element;
}};
Form.Element.Methods = {serialize: function (element) {
    element = $(element);
    if (!element.disabled && element.name) {
        var value = element.getValue();
        if (value != undefined) {
            var pair = {};
            pair[element.name] = value;
            return Object.toQueryString(pair);
        }
    }
    return'';
}, getValue: function (element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
}, setValue: function (element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
}, clear: function (element) {
    $(element).value = '';
    return element;
}, present: function (element) {
    return $(element).value != '';
}, activate: function (element) {
    element = $(element);
    try {
        element.focus();
        if (element.select && (element.tagName.toLowerCase() != 'input' || !['button', 'reset', 'submit'].include(element.type)))
            element.select();
    } catch (e) {
    }
    return element;
}, disable: function (element) {
    element = $(element);
    element.disabled = true;
    return element;
}, enable: function (element) {
    element = $(element);
    element.disabled = false;
    return element;
}};
var Field = Form.Element;
var $F = Form.Element.Methods.getValue;
Form.Element.Serializers = {input: function (element, value) {
    switch (element.type.toLowerCase()) {
        case'checkbox':
        case'radio':
            return Form.Element.Serializers.inputSelector(element, value);
        default:
            return Form.Element.Serializers.textarea(element, value);
    }
}, inputSelector: function (element, value) {
    if (Object.isUndefined(value))return element.checked ? element.value : null; else element.checked = !!value;
}, textarea: function (element, value) {
    if (Object.isUndefined(value))return element.value; else element.value = value;
}, select: function (element, value) {
    if (Object.isUndefined(value))
        return this[element.type == 'select-one' ? 'selectOne' : 'selectMany'](element); else {
        var opt, currentValue, single = !Object.isArray(value);
        for (var i = 0, length = element.length; i < length; i++) {
            opt = element.options[i];
            currentValue = this.optionValue(opt);
            if (single) {
                if (currentValue == value) {
                    opt.selected = true;
                    return;
                }
            }
            else opt.selected = value.include(currentValue);
        }
    }
}, selectOne: function (element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
}, selectMany: function (element) {
    var values, length = element.length;
    if (!length)return null;
    for (var i = 0, values = []; i < length; i++) {
        var opt = element.options[i];
        if (opt.selected)values.push(this.optionValue(opt));
    }
    return values;
}, optionValue: function (opt) {
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
}};
Abstract.TimedObserver = Class.create(PeriodicalExecuter, {initialize: function ($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element = $(element);
    this.lastValue = this.getValue();
}, execute: function () {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ? this.lastValue != value : String(this.lastValue) != String(value)) {
        this.callback(this.element, value);
        this.lastValue = value;
    }
}});
Form.Element.Observer = Class.create(Abstract.TimedObserver, {getValue: function () {
    return Form.Element.getValue(this.element);
}});
Form.Observer = Class.create(Abstract.TimedObserver, {getValue: function () {
    return Form.serialize(this.element);
}});
Abstract.EventObserver = Class.create({initialize: function (element, callback) {
    this.element = $(element);
    this.callback = callback;
    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
        this.registerFormCallbacks(); else
        this.registerCallback(this.element);
}, onElementEvent: function () {
    var value = this.getValue();
    if (this.lastValue != value) {
        this.callback(this.element, value);
        this.lastValue = value;
    }
}, registerFormCallbacks: function () {
    Form.getElements(this.element).each(this.registerCallback, this);
}, registerCallback: function (element) {
    if (element.type) {
        switch (element.type.toLowerCase()) {
            case'checkbox':
            case'radio':
                Event.observe(element, 'click', this.onElementEvent.bind(this));
                break;
            default:
                Event.observe(element, 'change', this.onElementEvent.bind(this));
                break;
        }
    }
}});
Form.Element.EventObserver = Class.create(Abstract.EventObserver, {getValue: function () {
    return Form.Element.getValue(this.element);
}});
Form.EventObserver = Class.create(Abstract.EventObserver, {getValue: function () {
    return Form.serialize(this.element);
}});
if (!window.Event)var Event = {};
Object.extend(Event, {KEY_BACKSPACE: 8, KEY_TAB: 9, KEY_RETURN: 13, KEY_ESC: 27, KEY_LEFT: 37, KEY_UP: 38, KEY_RIGHT: 39, KEY_DOWN: 40, KEY_DELETE: 46, KEY_HOME: 36, KEY_END: 35, KEY_PAGEUP: 33, KEY_PAGEDOWN: 34, KEY_INSERT: 45, cache: {}, relatedTarget: function (event) {
    var element;
    switch (event.type) {
        case'mouseover':
            element = event.fromElement;
            break;
        case'mouseout':
            element = event.toElement;
            break;
        default:
            return null;
    }
    return Element.extend(element);
}});
Event.Methods = (function () {
    var isButton;
    if (Prototype.Browser.IE) {
        var buttonMap = {0: 1, 1: 4, 2: 2};
        isButton = function (event, code) {
            return event.button == buttonMap[code];
        };
    } else if (Prototype.Browser.WebKit) {
        isButton = function (event, code) {
            switch (code) {
                case 0:
                    return event.which == 1 && !event.metaKey;
                case 1:
                    return event.which == 1 && event.metaKey;
                default:
                    return false;
            }
        };
    } else {
        isButton = function (event, code) {
            return event.which ? (event.which === code + 1) : (event.button === code);
        };
    }
    return{isLeftClick: function (event) {
        return isButton(event, 0)
    }, isMiddleClick: function (event) {
        return isButton(event, 1)
    }, isRightClick: function (event) {
        return isButton(event, 2)
    }, element: function (event) {
        event = Event.extend(event);
        var node = event.target, type = event.type, currentTarget = event.currentTarget;
        if (currentTarget && currentTarget.tagName) {
            if (type === 'load' || type === 'error' || (type === 'click' && currentTarget.tagName.toLowerCase() === 'input' && currentTarget.type === 'radio'))
                node = currentTarget;
        }
        if (node.nodeType == Node.TEXT_NODE)node = node.parentNode;
        return Element.extend(node);
    }, findElement: function (event, expression) {
        var element = Event.element(event);
        if (!expression)return element;
        var elements = [element].concat(element.ancestors());
        return Selector.findElement(elements, expression, 0);
    }, pointer: function (event) {
        var docElement = document.documentElement, body = document.body || {scrollLeft: 0, scrollTop: 0};
        return{x: event.pageX || (event.clientX +
            (docElement.scrollLeft || body.scrollLeft) -
            (docElement.clientLeft || 0)), y: event.pageY || (event.clientY +
            (docElement.scrollTop || body.scrollTop) -
            (docElement.clientTop || 0))};
    }, pointerX: function (event) {
        return Event.pointer(event).x
    }, pointerY: function (event) {
        return Event.pointer(event).y
    }, stop: function (event) {
        Event.extend(event);
        event.preventDefault();
        event.stopPropagation();
        event.stopped = true;
    }};
})();
Event.extend = (function () {
    var methods = Object.keys(Event.Methods).inject({}, function (m, name) {
        m[name] = Event.Methods[name].methodize();
        return m;
    });
    if (Prototype.Browser.IE) {
        Object.extend(methods, {stopPropagation: function () {
            this.cancelBubble = true
        }, preventDefault: function () {
            this.returnValue = false
        }, inspect: function () {
            return"[object Event]"
        }});
        return function (event) {
            if (!event)return false;
            if (event._extendedByPrototype)return event;
            event._extendedByPrototype = Prototype.emptyFunction;
            var pointer = Event.pointer(event);
            Object.extend(event, {target: event.srcElement, relatedTarget: Event.relatedTarget(event), pageX: pointer.x, pageY: pointer.y});
            return Object.extend(event, methods);
        };
    } else {
        Event.prototype = Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
        Object.extend(Event.prototype, methods);
        return Prototype.K;
    }
})();
Object.extend(Event, (function () {
    var cache = Event.cache;

    function getEventID(element) {
        if (element._prototypeEventID)return element._prototypeEventID[0];
        arguments.callee.id = arguments.callee.id || 1;
        return element._prototypeEventID = [++arguments.callee.id];
    }

    function getDOMEventName(eventName) {
        if (eventName && eventName.include(':'))return"dataavailable";
        return eventName;
    }

    function getCacheForID(id) {
        return cache[id] = cache[id] || {};
    }

    function getWrappersForEventName(id, eventName) {
        var c = getCacheForID(id);
        return c[eventName] = c[eventName] || [];
    }

    function createWrapper(element, eventName, handler) {
        var id = getEventID(element);
        var c = getWrappersForEventName(id, eventName);
        if (c.pluck("handler").include(handler))return false;
        var wrapper = function (event) {
            if (!Event || !Event.extend || (event.eventName && event.eventName != eventName))
                return false;
            Event.extend(event);
            handler.call(element, event);
        };
        wrapper.handler = handler;
        c.push(wrapper);
        return wrapper;
    }

    function findWrapper(id, eventName, handler) {
        var c = getWrappersForEventName(id, eventName);
        return c.find(function (wrapper) {
            return wrapper.handler == handler
        });
    }

    function destroyWrapper(id, eventName, handler) {
        var c = getCacheForID(id);
        if (!c[eventName])return false;
        c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
    }

    function destroyCache() {
        for (var id in cache)
            for (var eventName in cache[id])
                cache[id][eventName] = null;
    }

    if (window.attachEvent) {
        window.attachEvent("onunload", destroyCache);
    }
    if (Prototype.Browser.WebKit) {
        window.addEventListener('unload', Prototype.emptyFunction, false);
    }
    return{observe: function (element, eventName, handler) {
        element = $(element);
        var name = getDOMEventName(eventName);
        var wrapper = createWrapper(element, eventName, handler);
        if (!wrapper)return element;
        if (element.addEventListener) {
            element.addEventListener(name, wrapper, false);
        } else {
            element.attachEvent("on" + name, wrapper);
        }
        return element;
    }, stopObserving: function (element, eventName, handler) {
        element = $(element);
        var id = getEventID(element), name = getDOMEventName(eventName);
        if (!handler && eventName) {
            getWrappersForEventName(id, eventName).each(function (wrapper) {
                element.stopObserving(eventName, wrapper.handler);
            });
            return element;
        } else if (!eventName) {
            Object.keys(getCacheForID(id)).each(function (eventName) {
                element.stopObserving(eventName);
            });
            return element;
        }
        var wrapper = findWrapper(id, eventName, handler);
        if (!wrapper)return element;
        if (element.removeEventListener) {
            element.removeEventListener(name, wrapper, false);
        } else {
            element.detachEvent("on" + name, wrapper);
        }
        destroyWrapper(id, eventName, handler);
        return element;
    }, fire: function (element, eventName, memo) {
        element = $(element);
        if (element == document && document.createEvent && !element.dispatchEvent)
            element = document.documentElement;
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("dataavailable", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "ondataavailable";
        }
        event.eventName = eventName;
        event.memo = memo || {};
        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent(event.eventType, event);
        }
        return Event.extend(event);
    }};
})());
Object.extend(Event, Event.Methods);
Element.addMethods({fire: Event.fire, observe: Event.observe, stopObserving: Event.stopObserving});
Object.extend(document, {fire: Element.Methods.fire.methodize(), observe: Element.Methods.observe.methodize(), stopObserving: Element.Methods.stopObserving.methodize(), loaded: false});
(function () {
    var timer;

    function fireContentLoadedEvent() {
        if (document.loaded)return;
        if (timer)window.clearInterval(timer);
        document.fire("dom:loaded");
        document.loaded = true;
    }

    if (document.addEventListener) {
        if (Prototype.Browser.WebKit) {
            timer = window.setInterval(function () {
                if (/loaded|complete/.test(document.readyState))
                    fireContentLoadedEvent();
            }, 0);
            Event.observe(window, "load", fireContentLoadedEvent);
        } else {
            document.addEventListener("DOMContentLoaded", fireContentLoadedEvent, false);
        }
    } else {
        document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
        $("__onDOMContentLoaded").onreadystatechange = function () {
            if (this.readyState == "complete") {
                this.onreadystatechange = null;
                fireContentLoadedEvent();
            }
        };
    }
})();
Hash.toQueryString = Object.toQueryString;
var Toggle = {display: Element.toggle};
Element.Methods.childOf = Element.Methods.descendantOf;
var Insertion = {Before: function (element, content) {
    return Element.insert(element, {before: content});
}, Top: function (element, content) {
    return Element.insert(element, {top: content});
}, Bottom: function (element, content) {
    return Element.insert(element, {bottom: content});
}, After: function (element, content) {
    return Element.insert(element, {after: content});
}};
var $continue = new Error('"throw $continue" is deprecated, use "return" instead');
var Position = {includeScrollOffsets: false, prepare: function () {
    this.deltaX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    this.deltaY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}, within: function (element, x, y) {
    if (this.includeScrollOffsets)
        return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);
    return(y >= this.offset[1] && y < this.offset[1] + element.offsetHeight && x >= this.offset[0] && x < this.offset[0] + element.offsetWidth);
}, withinIncludingScrolloffsets: function (element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);
    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);
    return(this.ycomp >= this.offset[1] && this.ycomp < this.offset[1] + element.offsetHeight && this.xcomp >= this.offset[0] && this.xcomp < this.offset[0] + element.offsetWidth);
}, overlap: function (mode, element) {
    if (!mode)return 0;
    if (mode == 'vertical')
        return((this.offset[1] + element.offsetHeight) - this.ycomp) / element.offsetHeight;
    if (mode == 'horizontal')
        return((this.offset[0] + element.offsetWidth) - this.xcomp) / element.offsetWidth;
}, cumulativeOffset: Element.Methods.cumulativeOffset, positionedOffset: Element.Methods.positionedOffset, absolutize: function (element) {
    Position.prepare();
    return Element.absolutize(element);
}, relativize: function (element) {
    Position.prepare();
    return Element.relativize(element);
}, realOffset: Element.Methods.cumulativeScrollOffset, offsetParent: Element.Methods.getOffsetParent, page: Element.Methods.viewportOffset, clone: function (source, target, options) {
    options = options || {};
    return Element.clonePosition(target, source, options);
}};
if (!document.getElementsByClassName)document.getElementsByClassName = function (instanceMethods) {
    function iter(name) {
        return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
    }

    instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ? function (element, className) {
        className = className.toString().strip();
        var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
        return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
    } : function (element, className) {
        className = className.toString().strip();
        var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
        if (!classNames && !className)return elements;
        var nodes = $(element).getElementsByTagName('*');
        className = ' ' + className + ' ';
        for (var i = 0, child, cn; child = nodes[i]; i++) {
            if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) || (classNames && classNames.all(function (name) {
                return!name.toString().blank() && cn.include(' ' + name + ' ');
            }))))
                elements.push(Element.extend(child));
        }
        return elements;
    };
    return function (className, parentElement) {
        return $(parentElement || document.body).getElementsByClassName(className);
    };
}(Element.Methods);
Element.ClassNames = Class.create();
Element.ClassNames.prototype = {initialize: function (element) {
    this.element = $(element);
}, _each: function (iterator) {
    this.element.className.split(/\s+/).select(function (name) {
        return name.length > 0;
    })._each(iterator);
}, set: function (className) {
    this.element.className = className;
}, add: function (classNameToAdd) {
    if (this.include(classNameToAdd))return;
    this.set($A(this).concat(classNameToAdd).join(' '));
}, remove: function (classNameToRemove) {
    if (!this.include(classNameToRemove))return;
    this.set($A(this).without(classNameToRemove).join(' '));
}, toString: function () {
    return $A(this).join(' ');
}};
Object.extend(Element.ClassNames.prototype, Enumerable);
Element.addMethods();
(function (window, undefined) {
    var document = window.document;
    var jQuery = (function () {
        var jQuery = function (selector, context) {
            return new jQuery.fn.init(selector, context);
        }, _jQuery = window.jQuery, _$ = window.$, rootjQuery, quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/, isSimple = /^.[^:#\[\.,]*$/, rnotwhite = /\S/, rwhite = /\s/, trimLeft = /^\s+/, trimRight = /\s+$/, rnonword = /\W/, rdigit = /\d/, rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/, rvalidchars = /^[\],:{}\s]*$/, rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g, rwebkit = /(webkit)[ \/]([\w.]+)/, ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/, rmsie = /(msie) ([\w.]+)/, rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/, userAgent = navigator.userAgent, browserMatch, readyBound = false, readyList = [], DOMContentLoaded, toString = Object.prototype.toString, hasOwn = Object.prototype.hasOwnProperty, push = Array.prototype.push, slice = Array.prototype.slice, trim = String.prototype.trim, indexOf = Array.prototype.indexOf, class2type = {};
        jQuery.fn = jQuery.prototype = {init: function (selector, context) {
            var match, elem, ret, doc;
            if (!selector) {
                return this;
            }
            if (selector.nodeType) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            }
            if (selector === "body" && !context && document.body) {
                this.context = document;
                this[0] = document.body;
                this.selector = "body";
                this.length = 1;
                return this;
            }
            if (typeof selector === "string") {
                match = quickExpr.exec(selector);
                if (match && (match[1] || !context)) {
                    if (match[1]) {
                        doc = (context ? context.ownerDocument || context : document);
                        ret = rsingleTag.exec(selector);
                        if (ret) {
                            if (jQuery.isPlainObject(context)) {
                                selector = [document.createElement(ret[1])];
                                jQuery.fn.attr.call(selector, context, true);
                            } else {
                                selector = [doc.createElement(ret[1])];
                            }
                        } else {
                            ret = jQuery.buildFragment([match[1]], [doc]);
                            selector = (ret.cacheable ? ret.fragment.cloneNode(true) : ret.fragment).childNodes;
                        }
                        return jQuery.merge(this, selector);
                    } else {
                        elem = document.getElementById(match[2]);
                        if (elem && elem.parentNode) {
                            if (elem.id !== match[2]) {
                                return rootjQuery.find(selector);
                            }
                            this.length = 1;
                            this[0] = elem;
                        }
                        this.context = document;
                        this.selector = selector;
                        return this;
                    }
                } else if (!context && !rnonword.test(selector)) {
                    this.selector = selector;
                    this.context = document;
                    selector = document.getElementsByTagName(selector);
                    return jQuery.merge(this, selector);
                } else if (!context || context.jquery) {
                    return(context || rootjQuery).find(selector);
                } else {
                    return jQuery(context).find(selector);
                }
            } else if (jQuery.isFunction(selector)) {
                return rootjQuery.ready(selector);
            }
            if (selector.selector !== undefined) {
                this.selector = selector.selector;
                this.context = selector.context;
            }
            return jQuery.makeArray(selector, this);
        }, selector: "", jquery: "1.4.4", length: 0, size: function () {
            return this.length;
        }, toArray: function () {
            return slice.call(this, 0);
        }, get: function (num) {
            return num == null ? this.toArray() : (num < 0 ? this.slice(num)[0] : this[num]);
        }, pushStack: function (elems, name, selector) {
            var ret = jQuery();
            if (jQuery.isArray(elems)) {
                push.apply(ret, elems);
            } else {
                jQuery.merge(ret, elems);
            }
            ret.prevObject = this;
            ret.context = this.context;
            if (name === "find") {
                ret.selector = this.selector + (this.selector ? " " : "") + selector;
            } else if (name) {
                ret.selector = this.selector + "." + name + "(" + selector + ")";
            }
            return ret;
        }, each: function (callback, args) {
            return jQuery.each(this, callback, args);
        }, ready: function (fn) {
            jQuery.bindReady();
            if (jQuery.isReady) {
                fn.call(document, jQuery);
            } else if (readyList) {
                readyList.push(fn);
            }
            return this;
        }, eq: function (i) {
            return i === -1 ? this.slice(i) : this.slice(i, +i + 1);
        }, first: function () {
            return this.eq(0);
        }, last: function () {
            return this.eq(-1);
        }, slice: function () {
            return this.pushStack(slice.apply(this, arguments), "slice", slice.call(arguments).join(","));
        }, map: function (callback) {
            return this.pushStack(jQuery.map(this, function (elem, i) {
                return callback.call(elem, i, elem);
            }));
        }, end: function () {
            return this.prevObject || jQuery(null);
        }, push: push, sort: [].sort, splice: [].splice};
        jQuery.fn.init.prototype = jQuery.fn;
        jQuery.extend = jQuery.fn.extend = function () {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }
            if (typeof target !== "object" && !jQuery.isFunction(target)) {
                target = {};
            }
            if (length === i) {
                target = this;
                --i;
            }
            for (; i < length; i++) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue;
                        }
                        if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && jQuery.isArray(src) ? src : [];
                            } else {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }
                            target[name] = jQuery.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        };
        jQuery.extend({noConflict: function (deep) {
            window.$ = _$;
            if (deep) {
                window.jQuery = _jQuery;
            }
            return jQuery;
        }, isReady: false, readyWait: 1, ready: function (wait) {
            if (wait === true) {
                jQuery.readyWait--;
            }
            if (!jQuery.readyWait || (wait !== true && !jQuery.isReady)) {
                if (!document.body) {
                    return setTimeout(jQuery.ready, 1);
                }
                jQuery.isReady = true;
                if (wait !== true && --jQuery.readyWait > 0) {
                    return;
                }
                if (readyList) {
                    var fn, i = 0, ready = readyList;
                    readyList = null;
                    while ((fn = ready[i++])) {
                        fn.call(document, jQuery);
                    }
                    if (jQuery.fn.trigger) {
                        jQuery(document).trigger("ready").unbind("ready");
                    }
                }
            }
        }, bindReady: function () {
            if (readyBound) {
                return;
            }
            readyBound = true;
            if (document.readyState === "complete") {
                return setTimeout(jQuery.ready, 1);
            }
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
                window.addEventListener("load", jQuery.ready, false);
            } else if (document.attachEvent) {
                document.attachEvent("onreadystatechange", DOMContentLoaded);
                window.attachEvent("onload", jQuery.ready);
                var toplevel = false;
                try {
                    toplevel = window.frameElement == null;
                } catch (e) {
                }
                if (document.documentElement.doScroll && toplevel) {
                    doScrollCheck();
                }
            }
        }, isFunction: function (obj) {
            return jQuery.type(obj) === "function";
        }, isArray: Array.isArray || function (obj) {
            return jQuery.type(obj) === "array";
        }, isWindow: function (obj) {
            return obj && typeof obj === "object" && "setInterval"in obj;
        }, isNaN: function (obj) {
            return obj == null || !rdigit.test(obj) || isNaN(obj);
        }, type: function (obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
        }, isPlainObject: function (obj) {
            if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
                return false;
            }
            if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
            var key;
            for (key in obj) {
            }
            return key === undefined || hasOwn.call(obj, key);
        }, isEmptyObject: function (obj) {
            for (var name in obj) {
                return false;
            }
            return true;
        }, error: function (msg) {
            throw msg;
        }, parseJSON: function (data) {
            if (typeof data !== "string" || !data) {
                return null;
            }
            data = jQuery.trim(data);
            if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
                return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))();
            } else {
                jQuery.error("Invalid JSON: " + data);
            }
        }, noop: function () {
        }, globalEval: function (data) {
            if (data && rnotwhite.test(data)) {
                var head = document.getElementsByTagName("head")[0] || document.documentElement, script = document.createElement("script");
                script.type = "text/javascript";
                if (jQuery.support.scriptEval) {
                    script.appendChild(document.createTextNode(data));
                } else {
                    script.text = data;
                }
                head.insertBefore(script, head.firstChild);
                head.removeChild(script);
            }
        }, nodeName: function (elem, name) {
            return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
        }, each: function (object, callback, args) {
            var name, i = 0, length = object.length, isObj = length === undefined || jQuery.isFunction(object);
            if (args) {
                if (isObj) {
                    for (name in object) {
                        if (callback.apply(object[name], args) === false) {
                            break;
                        }
                    }
                } else {
                    for (; i < length;) {
                        if (callback.apply(object[i++], args) === false) {
                            break;
                        }
                    }
                }
            } else {
                if (isObj) {
                    for (name in object) {
                        if (callback.call(object[name], name, object[name]) === false) {
                            break;
                        }
                    }
                } else {
                    for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]) {
                    }
                }
            }
            return object;
        }, trim: trim ? function (text) {
            return text == null ? "" : trim.call(text);
        } : function (text) {
            return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
        }, makeArray: function (array, results) {
            var ret = results || [];
            if (array != null) {
                var type = jQuery.type(array);
                if (array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow(array)) {
                    push.call(ret, array);
                } else {
                    jQuery.merge(ret, array);
                }
            }
            return ret;
        }, inArray: function (elem, array) {
            if (array.indexOf) {
                return array.indexOf(elem);
            }
            for (var i = 0, length = array.length; i < length; i++) {
                if (array[i] === elem) {
                    return i;
                }
            }
            return-1;
        }, merge: function (first, second) {
            var i = first.length, j = 0;
            if (typeof second.length === "number") {
                for (var l = second.length; j < l; j++) {
                    first[i++] = second[j];
                }
            } else {
                while (second[j] !== undefined) {
                    first[i++] = second[j++];
                }
            }
            first.length = i;
            return first;
        }, grep: function (elems, callback, inv) {
            var ret = [], retVal;
            inv = !!inv;
            for (var i = 0, length = elems.length; i < length; i++) {
                retVal = !!callback(elems[i], i);
                if (inv !== retVal) {
                    ret.push(elems[i]);
                }
            }
            return ret;
        }, map: function (elems, callback, arg) {
            var ret = [], value;
            for (var i = 0, length = elems.length; i < length; i++) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                    ret[ret.length] = value;
                }
            }
            return ret.concat.apply([], ret);
        }, guid: 1, proxy: function (fn, proxy, thisObject) {
            if (arguments.length === 2) {
                if (typeof proxy === "string") {
                    thisObject = fn;
                    fn = thisObject[proxy];
                    proxy = undefined;
                } else if (proxy && !jQuery.isFunction(proxy)) {
                    thisObject = proxy;
                    proxy = undefined;
                }
            }
            if (!proxy && fn) {
                proxy = function () {
                    return fn.apply(thisObject || this, arguments);
                };
            }
            if (fn) {
                proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
            }
            return proxy;
        }, access: function (elems, key, value, exec, fn, pass) {
            var length = elems.length;
            if (typeof key === "object") {
                for (var k in key) {
                    jQuery.access(elems, k, key[k], exec, fn, value);
                }
                return elems;
            }
            if (value !== undefined) {
                exec = !pass && exec && jQuery.isFunction(value);
                for (var i = 0; i < length; i++) {
                    fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
                }
                return elems;
            }
            return length ? fn(elems[0], key) : undefined;
        }, now: function () {
            return(new Date()).getTime();
        }, uaMatch: function (ua) {
            ua = ua.toLowerCase();
            var match = rwebkit.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [];
            return{browser: match[1] || "", version: match[2] || "0"};
        }, browser: {}});
        jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });
        browserMatch = jQuery.uaMatch(userAgent);
        if (browserMatch.browser) {
            jQuery.browser[browserMatch.browser] = true;
            jQuery.browser.version = browserMatch.version;
        }
        if (jQuery.browser.webkit) {
            jQuery.browser.safari = true;
        }
        if (indexOf) {
            jQuery.inArray = function (elem, array) {
                return indexOf.call(array, elem);
            };
        }
        if (!rwhite.test("\xA0")) {
            trimLeft = /^[\s\xA0]+/;
            trimRight = /[\s\xA0]+$/;
        }
        rootjQuery = jQuery(document);
        if (document.addEventListener) {
            DOMContentLoaded = function () {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                jQuery.ready();
            };
        } else if (document.attachEvent) {
            DOMContentLoaded = function () {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    jQuery.ready();
                }
            };
        }
        function doScrollCheck() {
            if (jQuery.isReady) {
                return;
            }
            try {
                document.documentElement.doScroll("left");
            } catch (e) {
                setTimeout(doScrollCheck, 1);
                return;
            }
            jQuery.ready();
        }

        return(window.jQuery = window.$ = jQuery);
    })();
    (function () {
        jQuery.support = {};
        var root = document.documentElement, script = document.createElement("script"), div = document.createElement("div"), id = "script" + jQuery.now();
        div.style.display = "none";
        div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
        var all = div.getElementsByTagName("*"), a = div.getElementsByTagName("a")[0], select = document.createElement("select"), opt = select.appendChild(document.createElement("option"));
        if (!all || !all.length || !a) {
            return;
        }
        jQuery.support = {leadingWhitespace: div.firstChild.nodeType === 3, tbody: !div.getElementsByTagName("tbody").length, htmlSerialize: !!div.getElementsByTagName("link").length, style: /red/.test(a.getAttribute("style")), hrefNormalized: a.getAttribute("href") === "/a", opacity: /^0.55$/.test(a.style.opacity), cssFloat: !!a.style.cssFloat, checkOn: div.getElementsByTagName("input")[0].value === "on", optSelected: opt.selected, deleteExpando: true, optDisabled: false, checkClone: false, scriptEval: false, noCloneEvent: true, boxModel: null, inlineBlockNeedsLayout: false, shrinkWrapBlocks: false, reliableHiddenOffsets: true};
        select.disabled = true;
        jQuery.support.optDisabled = !opt.disabled;
        script.type = "text/javascript";
        try {
            script.appendChild(document.createTextNode("window." + id + "=1;"));
        } catch (e) {
        }
        root.insertBefore(script, root.firstChild);
        if (window[id]) {
            jQuery.support.scriptEval = true;
            delete window[id];
        }
        try {
            delete script.test;
        } catch (e) {
            jQuery.support.deleteExpando = false;
        }
        root.removeChild(script);
        if (div.attachEvent && div.fireEvent) {
            div.attachEvent("onclick", function click() {
                jQuery.support.noCloneEvent = false;
                div.detachEvent("onclick", click);
            });
            div.cloneNode(true).fireEvent("onclick");
        }
        div = document.createElement("div");
        div.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
        var fragment = document.createDocumentFragment();
        fragment.appendChild(div.firstChild);
        jQuery.support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;
        jQuery(function () {
            var div = document.createElement("div");
            div.style.width = div.style.paddingLeft = "1px";
            document.body.appendChild(div);
            jQuery.boxModel = jQuery.support.boxModel = div.offsetWidth === 2;
            if ("zoom"in div.style) {
                div.style.display = "inline";
                div.style.zoom = 1;
                jQuery.support.inlineBlockNeedsLayout = div.offsetWidth === 2;
                div.style.display = "";
                div.innerHTML = "<div style='width:4px;'></div>";
                jQuery.support.shrinkWrapBlocks = div.offsetWidth !== 2;
            }
            div.innerHTML = "<table><tr><td style='padding:0;display:none'></td><td>t</td></tr></table>";
            var tds = div.getElementsByTagName("td");
            jQuery.support.reliableHiddenOffsets = tds[0].offsetHeight === 0;
            tds[0].style.display = "";
            tds[1].style.display = "none";
            jQuery.support.reliableHiddenOffsets = jQuery.support.reliableHiddenOffsets && tds[0].offsetHeight === 0;
            div.innerHTML = "";
            document.body.removeChild(div).style.display = "none";
            div = tds = null;
        });
        var eventSupported = function (eventName) {
            var el = document.createElement("div");
            eventName = "on" + eventName;
            var isSupported = (eventName in el);
            if (!isSupported) {
                el.setAttribute(eventName, "return;");
                isSupported = typeof el[eventName] === "function";
            }
            el = null;
            return isSupported;
        };
        jQuery.support.submitBubbles = eventSupported("submit");
        jQuery.support.changeBubbles = eventSupported("change");
        root = script = div = all = a = null;
    })();
    var windowData = {}, rbrace = /^(?:\{.*\}|\[.*\])$/;
    jQuery.extend({cache: {}, uuid: 0, expando: "jQuery" + jQuery.now(), noData: {"embed": true, "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000", "applet": true}, data: function (elem, name, data) {
        if (!jQuery.acceptData(elem)) {
            return;
        }
        elem = elem == window ? windowData : elem;
        var isNode = elem.nodeType, id = isNode ? elem[jQuery.expando] : null, cache = jQuery.cache, thisCache;
        if (isNode && !id && typeof name === "string" && data === undefined) {
            return;
        }
        if (!isNode) {
            cache = elem;
        } else if (!id) {
            elem[jQuery.expando] = id = ++jQuery.uuid;
        }
        if (typeof name === "object") {
            if (isNode) {
                cache[id] = jQuery.extend(cache[id], name);
            } else {
                jQuery.extend(cache, name);
            }
        } else if (isNode && !cache[id]) {
            cache[id] = {};
        }
        thisCache = isNode ? cache[id] : cache;
        if (data !== undefined) {
            thisCache[name] = data;
        }
        return typeof name === "string" ? thisCache[name] : thisCache;
    }, removeData: function (elem, name) {
        if (!jQuery.acceptData(elem)) {
            return;
        }
        elem = elem == window ? windowData : elem;
        var isNode = elem.nodeType, id = isNode ? elem[jQuery.expando] : elem, cache = jQuery.cache, thisCache = isNode ? cache[id] : id;
        if (name) {
            if (thisCache) {
                delete thisCache[name];
                if (isNode && jQuery.isEmptyObject(thisCache)) {
                    jQuery.removeData(elem);
                }
            }
        } else {
            if (isNode && jQuery.support.deleteExpando) {
                delete elem[jQuery.expando];
            } else if (elem.removeAttribute) {
                elem.removeAttribute(jQuery.expando);
            } else if (isNode) {
                delete cache[id];
            } else {
                for (var n in elem) {
                    delete elem[n];
                }
            }
        }
    }, acceptData: function (elem) {
        if (elem.nodeName) {
            var match = jQuery.noData[elem.nodeName.toLowerCase()];
            if (match) {
                return!(match === true || elem.getAttribute("classid") !== match);
            }
        }
        return true;
    }});
    jQuery.fn.extend({data: function (key, value) {
        var data = null;
        if (typeof key === "undefined") {
            if (this.length) {
                var attr = this[0].attributes, name;
                data = jQuery.data(this[0]);
                for (var i = 0, l = attr.length; i < l; i++) {
                    name = attr[i].name;
                    if (name.indexOf("data-") === 0) {
                        name = name.substr(5);
                        dataAttr(this[0], name, data[name]);
                    }
                }
            }
            return data;
        } else if (typeof key === "object") {
            return this.each(function () {
                jQuery.data(this, key);
            });
        }
        var parts = key.split(".");
        parts[1] = parts[1] ? "." + parts[1] : "";
        if (value === undefined) {
            data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);
            if (data === undefined && this.length) {
                data = jQuery.data(this[0], key);
                data = dataAttr(this[0], key, data);
            }
            return data === undefined && parts[1] ? this.data(parts[0]) : data;
        } else {
            return this.each(function () {
                var $this = jQuery(this), args = [parts[0], value];
                $this.triggerHandler("setData" + parts[1] + "!", args);
                jQuery.data(this, key, value);
                $this.triggerHandler("changeData" + parts[1] + "!", args);
            });
        }
    }, removeData: function (key) {
        return this.each(function () {
            jQuery.removeData(this, key);
        });
    }});
    function dataAttr(elem, key, data) {
        if (data === undefined && elem.nodeType === 1) {
            data = elem.getAttribute("data-" + key);
            if (typeof data === "string") {
                try {
                    data = data === "true" ? true : data === "false" ? false : data === "null" ? null : !jQuery.isNaN(data) ? parseFloat(data) : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                } catch (e) {
                }
                jQuery.data(elem, key, data);
            } else {
                data = undefined;
            }
        }
        return data;
    }

    jQuery.extend({queue: function (elem, type, data) {
        if (!elem) {
            return;
        }
        type = (type || "fx") + "queue";
        var q = jQuery.data(elem, type);
        if (!data) {
            return q || [];
        }
        if (!q || jQuery.isArray(data)) {
            q = jQuery.data(elem, type, jQuery.makeArray(data));
        } else {
            q.push(data);
        }
        return q;
    }, dequeue: function (elem, type) {
        type = type || "fx";
        var queue = jQuery.queue(elem, type), fn = queue.shift();
        if (fn === "inprogress") {
            fn = queue.shift();
        }
        if (fn) {
            if (type === "fx") {
                queue.unshift("inprogress");
            }
            fn.call(elem, function () {
                jQuery.dequeue(elem, type);
            });
        }
    }});
    jQuery.fn.extend({queue: function (type, data) {
        if (typeof type !== "string") {
            data = type;
            type = "fx";
        }
        if (data === undefined) {
            return jQuery.queue(this[0], type);
        }
        return this.each(function (i) {
            var queue = jQuery.queue(this, type, data);
            if (type === "fx" && queue[0] !== "inprogress") {
                jQuery.dequeue(this, type);
            }
        });
    }, dequeue: function (type) {
        return this.each(function () {
            jQuery.dequeue(this, type);
        });
    }, delay: function (time, type) {
        time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
        type = type || "fx";
        return this.queue(type, function () {
            var elem = this;
            setTimeout(function () {
                jQuery.dequeue(elem, type);
            }, time);
        });
    }, clearQueue: function (type) {
        return this.queue(type || "fx", []);
    }});
    var rclass = /[\n\t]/g, rspaces = /\s+/, rreturn = /\r/g, rspecialurl = /^(?:href|src|style)$/, rtype = /^(?:button|input)$/i, rfocusable = /^(?:button|input|object|select|textarea)$/i, rclickable = /^a(?:rea)?$/i, rradiocheck = /^(?:radio|checkbox)$/i;
    jQuery.props = {"for": "htmlFor", "class": "className", readonly: "readOnly", maxlength: "maxLength", cellspacing: "cellSpacing", rowspan: "rowSpan", colspan: "colSpan", tabindex: "tabIndex", usemap: "useMap", frameborder: "frameBorder"};
    jQuery.fn.extend({attr: function (name, value) {
        return jQuery.access(this, name, value, true, jQuery.attr);
    }, removeAttr: function (name, fn) {
        return this.each(function () {
            jQuery.attr(this, name, "");
            if (this.nodeType === 1) {
                this.removeAttribute(name);
            }
        });
    }, addClass: function (value) {
        if (jQuery.isFunction(value)) {
            return this.each(function (i) {
                var self = jQuery(this);
                self.addClass(value.call(this, i, self.attr("class")));
            });
        }
        if (value && typeof value === "string") {
            var classNames = (value || "").split(rspaces);
            for (var i = 0, l = this.length; i < l; i++) {
                var elem = this[i];
                if (elem.nodeType === 1) {
                    if (!elem.className) {
                        elem.className = value;
                    } else {
                        var className = " " + elem.className + " ", setClass = elem.className;
                        for (var c = 0, cl = classNames.length; c < cl; c++) {
                            if (className.indexOf(" " + classNames[c] + " ") < 0) {
                                setClass += " " + classNames[c];
                            }
                        }
                        elem.className = jQuery.trim(setClass);
                    }
                }
            }
        }
        return this;
    }, removeClass: function (value) {
        if (jQuery.isFunction(value)) {
            return this.each(function (i) {
                var self = jQuery(this);
                self.removeClass(value.call(this, i, self.attr("class")));
            });
        }
        if ((value && typeof value === "string") || value === undefined) {
            var classNames = (value || "").split(rspaces);
            for (var i = 0, l = this.length; i < l; i++) {
                var elem = this[i];
                if (elem.nodeType === 1 && elem.className) {
                    if (value) {
                        var className = (" " + elem.className + " ").replace(rclass, " ");
                        for (var c = 0, cl = classNames.length; c < cl; c++) {
                            className = className.replace(" " + classNames[c] + " ", " ");
                        }
                        elem.className = jQuery.trim(className);
                    } else {
                        elem.className = "";
                    }
                }
            }
        }
        return this;
    }, toggleClass: function (value, stateVal) {
        var type = typeof value, isBool = typeof stateVal === "boolean";
        if (jQuery.isFunction(value)) {
            return this.each(function (i) {
                var self = jQuery(this);
                self.toggleClass(value.call(this, i, self.attr("class"), stateVal), stateVal);
            });
        }
        return this.each(function () {
            if (type === "string") {
                var className, i = 0, self = jQuery(this), state = stateVal, classNames = value.split(rspaces);
                while ((className = classNames[i++])) {
                    state = isBool ? state : !self.hasClass(className);
                    self[state ? "addClass" : "removeClass"](className);
                }
            } else if (type === "undefined" || type === "boolean") {
                if (this.className) {
                    jQuery.data(this, "__className__", this.className);
                }
                this.className = this.className || value === false ? "" : jQuery.data(this, "__className__") || "";
            }
        });
    }, hasClass: function (selector) {
        var className = " " + selector + " ";
        for (var i = 0, l = this.length; i < l; i++) {
            if ((" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1) {
                return true;
            }
        }
        return false;
    }, val: function (value) {
        if (!arguments.length) {
            var elem = this[0];
            if (elem) {
                if (jQuery.nodeName(elem, "option")) {
                    var val = elem.attributes.value;
                    return!val || val.specified ? elem.value : elem.text;
                }
                if (jQuery.nodeName(elem, "select")) {
                    var index = elem.selectedIndex, values = [], options = elem.options, one = elem.type === "select-one";
                    if (index < 0) {
                        return null;
                    }
                    for (var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++) {
                        var option = options[i];
                        if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                            value = jQuery(option).val();
                            if (one) {
                                return value;
                            }
                            values.push(value);
                        }
                    }
                    return values;
                }
                if (rradiocheck.test(elem.type) && !jQuery.support.checkOn) {
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                }
                return(elem.value || "").replace(rreturn, "");
            }
            return undefined;
        }
        var isFunction = jQuery.isFunction(value);
        return this.each(function (i) {
            var self = jQuery(this), val = value;
            if (this.nodeType !== 1) {
                return;
            }
            if (isFunction) {
                val = value.call(this, i, self.val());
            }
            if (val == null) {
                val = "";
            } else if (typeof val === "number") {
                val += "";
            } else if (jQuery.isArray(val)) {
                val = jQuery.map(val, function (value) {
                    return value == null ? "" : value + "";
                });
            }
            if (jQuery.isArray(val) && rradiocheck.test(this.type)) {
                this.checked = jQuery.inArray(self.val(), val) >= 0;
            } else if (jQuery.nodeName(this, "select")) {
                var values = jQuery.makeArray(val);
                jQuery("option", this).each(function () {
                    this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                });
                if (!values.length) {
                    this.selectedIndex = -1;
                }
            } else {
                this.value = val;
            }
        });
    }});
    jQuery.extend({attrFn: {val: true, css: true, html: true, text: true, data: true, width: true, height: true, offset: true}, attr: function (elem, name, value, pass) {
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8) {
            return undefined;
        }
        if (pass && name in jQuery.attrFn) {
            return jQuery(elem)[name](value);
        }
        var notxml = elem.nodeType !== 1 || !jQuery.isXMLDoc(elem), set = value !== undefined;
        name = notxml && jQuery.props[name] || name;
        var special = rspecialurl.test(name);
        if (name === "selected" && !jQuery.support.optSelected) {
            var parent = elem.parentNode;
            if (parent) {
                parent.selectedIndex;
                if (parent.parentNode) {
                    parent.parentNode.selectedIndex;
                }
            }
        }
        if ((name in elem || elem[name] !== undefined) && notxml && !special) {
            if (set) {
                if (name === "type" && rtype.test(elem.nodeName) && elem.parentNode) {
                    jQuery.error("type property can't be changed");
                }
                if (value === null) {
                    if (elem.nodeType === 1) {
                        elem.removeAttribute(name);
                    }
                } else {
                    elem[name] = value;
                }
            }
            if (jQuery.nodeName(elem, "form") && elem.getAttributeNode(name)) {
                return elem.getAttributeNode(name).nodeValue;
            }
            if (name === "tabIndex") {
                var attributeNode = elem.getAttributeNode("tabIndex");
                return attributeNode && attributeNode.specified ? attributeNode.value : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : undefined;
            }
            return elem[name];
        }
        if (!jQuery.support.style && notxml && name === "style") {
            if (set) {
                elem.style.cssText = "" + value;
            }
            return elem.style.cssText;
        }
        if (set) {
            elem.setAttribute(name, "" + value);
        }
        if (!elem.attributes[name] && (elem.hasAttribute && !elem.hasAttribute(name))) {
            return undefined;
        }
        var attr = !jQuery.support.hrefNormalized && notxml && special ? elem.getAttribute(name, 2) : elem.getAttribute(name);
        return attr === null ? undefined : attr;
    }});
    var rnamespaces = /\.(.*)$/, rformElems = /^(?:textarea|input|select)$/i, rperiod = /\./g, rspace = / /g, rescape = /[^\w\s.|`]/g, fcleanup = function (nm) {
        return nm.replace(rescape, "\\$&");
    }, focusCounts = {focusin: 0, focusout: 0};
    jQuery.event = {add: function (elem, types, handler, data) {
        if (elem.nodeType === 3 || elem.nodeType === 8) {
            return;
        }
        if (jQuery.isWindow(elem) && (elem !== window && !elem.frameElement)) {
            elem = window;
        }
        if (handler === false) {
            handler = returnFalse;
        } else if (!handler) {
            return;
        }
        var handleObjIn, handleObj;
        if (handler.handler) {
            handleObjIn = handler;
            handler = handleObjIn.handler;
        }
        if (!handler.guid) {
            handler.guid = jQuery.guid++;
        }
        var elemData = jQuery.data(elem);
        if (!elemData) {
            return;
        }
        var eventKey = elem.nodeType ? "events" : "__events__", events = elemData[eventKey], eventHandle = elemData.handle;
        if (typeof events === "function") {
            eventHandle = events.handle;
            events = events.events;
        } else if (!events) {
            if (!elem.nodeType) {
                elemData[eventKey] = elemData = function () {
                };
            }
            elemData.events = events = {};
        }
        if (!eventHandle) {
            elemData.handle = eventHandle = function () {
                return typeof jQuery !== "undefined" && !jQuery.event.triggered ? jQuery.event.handle.apply(eventHandle.elem, arguments) : undefined;
            };
        }
        eventHandle.elem = elem;
        types = types.split(" ");
        var type, i = 0, namespaces;
        while ((type = types[i++])) {
            handleObj = handleObjIn ? jQuery.extend({}, handleObjIn) : {handler: handler, data: data};
            if (type.indexOf(".") > -1) {
                namespaces = type.split(".");
                type = namespaces.shift();
                handleObj.namespace = namespaces.slice(0).sort().join(".");
            } else {
                namespaces = [];
                handleObj.namespace = "";
            }
            handleObj.type = type;
            if (!handleObj.guid) {
                handleObj.guid = handler.guid;
            }
            var handlers = events[type], special = jQuery.event.special[type] || {};
            if (!handlers) {
                handlers = events[type] = [];
                if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                    if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandle, false);
                    } else if (elem.attachEvent) {
                        elem.attachEvent("on" + type, eventHandle);
                    }
                }
            }
            if (special.add) {
                special.add.call(elem, handleObj);
                if (!handleObj.handler.guid) {
                    handleObj.handler.guid = handler.guid;
                }
            }
            handlers.push(handleObj);
            jQuery.event.global[type] = true;
        }
        elem = null;
    }, global: {}, remove: function (elem, types, handler, pos) {
        if (elem.nodeType === 3 || elem.nodeType === 8) {
            return;
        }
        if (handler === false) {
            handler = returnFalse;
        }
        var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType, eventKey = elem.nodeType ? "events" : "__events__", elemData = jQuery.data(elem), events = elemData && elemData[eventKey];
        if (!elemData || !events) {
            return;
        }
        if (typeof events === "function") {
            elemData = events;
            events = events.events;
        }
        if (types && types.type) {
            handler = types.handler;
            types = types.type;
        }
        if (!types || typeof types === "string" && types.charAt(0) === ".") {
            types = types || "";
            for (type in events) {
                jQuery.event.remove(elem, type + types);
            }
            return;
        }
        types = types.split(" ");
        while ((type = types[i++])) {
            origType = type;
            handleObj = null;
            all = type.indexOf(".") < 0;
            namespaces = [];
            if (!all) {
                namespaces = type.split(".");
                type = namespaces.shift();
                namespace = new RegExp("(^|\\.)" +
                    jQuery.map(namespaces.slice(0).sort(), fcleanup).join("\\.(?:.*\\.)?") + "(\\.|$)");
            }
            eventType = events[type];
            if (!eventType) {
                continue;
            }
            if (!handler) {
                for (j = 0; j < eventType.length; j++) {
                    handleObj = eventType[j];
                    if (all || namespace.test(handleObj.namespace)) {
                        jQuery.event.remove(elem, origType, handleObj.handler, j);
                        eventType.splice(j--, 1);
                    }
                }
                continue;
            }
            special = jQuery.event.special[type] || {};
            for (j = pos || 0; j < eventType.length; j++) {
                handleObj = eventType[j];
                if (handler.guid === handleObj.guid) {
                    if (all || namespace.test(handleObj.namespace)) {
                        if (pos == null) {
                            eventType.splice(j--, 1);
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                    if (pos != null) {
                        break;
                    }
                }
            }
            if (eventType.length === 0 || pos != null && eventType.length === 1) {
                if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
                    jQuery.removeEvent(elem, type, elemData.handle);
                }
                ret = null;
                delete events[type];
            }
        }
        if (jQuery.isEmptyObject(events)) {
            var handle = elemData.handle;
            if (handle) {
                handle.elem = null;
            }
            delete elemData.events;
            delete elemData.handle;
            if (typeof elemData === "function") {
                jQuery.removeData(elem, eventKey);
            } else if (jQuery.isEmptyObject(elemData)) {
                jQuery.removeData(elem);
            }
        }
    }, trigger: function (event, data, elem) {
        var type = event.type || event, bubbling = arguments[3];
        if (!bubbling) {
            event = typeof event === "object" ? event[jQuery.expando] ? event : jQuery.extend(jQuery.Event(type), event) : jQuery.Event(type);
            if (type.indexOf("!") >= 0) {
                event.type = type = type.slice(0, -1);
                event.exclusive = true;
            }
            if (!elem) {
                event.stopPropagation();
                if (jQuery.event.global[type]) {
                    jQuery.each(jQuery.cache, function () {
                        if (this.events && this.events[type]) {
                            jQuery.event.trigger(event, data, this.handle.elem);
                        }
                    });
                }
            }
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8) {
                return undefined;
            }
            event.result = undefined;
            event.target = elem;
            data = jQuery.makeArray(data);
            data.unshift(event);
        }
        event.currentTarget = elem;
        var handle = elem.nodeType ? jQuery.data(elem, "handle") : (jQuery.data(elem, "__events__") || {}).handle;
        if (handle) {
            handle.apply(elem, data);
        }
        var parent = elem.parentNode || elem.ownerDocument;
        try {
            if (!(elem && elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()])) {
                if (elem["on" + type] && elem["on" + type].apply(elem, data) === false) {
                    event.result = false;
                    event.preventDefault();
                }
            }
        } catch (inlineError) {
        }
        if (!event.isPropagationStopped() && parent) {
            jQuery.event.trigger(event, data, parent, true);
        } else if (!event.isDefaultPrevented()) {
            var old, target = event.target, targetType = type.replace(rnamespaces, ""), isClick = jQuery.nodeName(target, "a") && targetType === "click", special = jQuery.event.special[targetType] || {};
            if ((!special._default || special._default.call(elem, event) === false) && !isClick && !(target && target.nodeName && jQuery.noData[target.nodeName.toLowerCase()])) {
                try {
                    if (target[targetType]) {
                        old = target["on" + targetType];
                        if (old) {
                            target["on" + targetType] = null;
                        }
                        jQuery.event.triggered = true;
                        target[targetType]();
                    }
                } catch (triggerError) {
                }
                if (old) {
                    target["on" + targetType] = old;
                }
                jQuery.event.triggered = false;
            }
        }
    }, handle: function (event) {
        var all, handlers, namespaces, namespace_re, events, namespace_sort = [], args = jQuery.makeArray(arguments);
        event = args[0] = jQuery.event.fix(event || window.event);
        event.currentTarget = this;
        all = event.type.indexOf(".") < 0 && !event.exclusive;
        if (!all) {
            namespaces = event.type.split(".");
            event.type = namespaces.shift();
            namespace_sort = namespaces.slice(0).sort();
            namespace_re = new RegExp("(^|\\.)" + namespace_sort.join("\\.(?:.*\\.)?") + "(\\.|$)");
        }
        event.namespace = event.namespace || namespace_sort.join(".");
        events = jQuery.data(this, this.nodeType ? "events" : "__events__");
        if (typeof events === "function") {
            events = events.events;
        }
        handlers = (events || {})[event.type];
        if (events && handlers) {
            handlers = handlers.slice(0);
            for (var j = 0, l = handlers.length; j < l; j++) {
                var handleObj = handlers[j];
                if (all || namespace_re.test(handleObj.namespace)) {
                    event.handler = handleObj.handler;
                    event.data = handleObj.data;
                    event.handleObj = handleObj;
                    var ret = handleObj.handler.apply(this, args);
                    if (ret !== undefined) {
                        event.result = ret;
                        if (ret === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                    if (event.isImmediatePropagationStopped()) {
                        break;
                    }
                }
            }
        }
        return event.result;
    }, props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "), fix: function (event) {
        if (event[jQuery.expando]) {
            return event;
        }
        var originalEvent = event;
        event = jQuery.Event(originalEvent);
        for (var i = this.props.length, prop; i;) {
            prop = this.props[--i];
            event[prop] = originalEvent[prop];
        }
        if (!event.target) {
            event.target = event.srcElement || document;
        }
        if (event.target.nodeType === 3) {
            event.target = event.target.parentNode;
        }
        if (!event.relatedTarget && event.fromElement) {
            event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
        }
        if (event.pageX == null && event.clientX != null) {
            var doc = document.documentElement, body = document.body;
            event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
        }
        if (event.which == null && (event.charCode != null || event.keyCode != null)) {
            event.which = event.charCode != null ? event.charCode : event.keyCode;
        }
        if (!event.metaKey && event.ctrlKey) {
            event.metaKey = event.ctrlKey;
        }
        if (!event.which && event.button !== undefined) {
            event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
        }
        return event;
    }, guid: 1E8, proxy: jQuery.proxy, special: {ready: {setup: jQuery.bindReady, teardown: jQuery.noop}, live: {add: function (handleObj) {
        jQuery.event.add(this, liveConvert(handleObj.origType, handleObj.selector), jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}));
    }, remove: function (handleObj) {
        jQuery.event.remove(this, liveConvert(handleObj.origType, handleObj.selector), handleObj);
    }}, beforeunload: {setup: function (data, namespaces, eventHandle) {
        if (jQuery.isWindow(this)) {
            this.onbeforeunload = eventHandle;
        }
    }, teardown: function (namespaces, eventHandle) {
        if (this.onbeforeunload === eventHandle) {
            this.onbeforeunload = null;
        }
    }}}};
    jQuery.removeEvent = document.removeEventListener ? function (elem, type, handle) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        }
    } : function (elem, type, handle) {
        if (elem.detachEvent) {
            elem.detachEvent("on" + type, handle);
        }
    };
    jQuery.Event = function (src) {
        if (!this.preventDefault) {
            return new jQuery.Event(src);
        }
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
        } else {
            this.type = src;
        }
        this.timeStamp = jQuery.now();
        this[jQuery.expando] = true;
    };
    function returnFalse() {
        return false;
    }

    function returnTrue() {
        return true;
    }

    jQuery.Event.prototype = {preventDefault: function () {
        this.isDefaultPrevented = returnTrue;
        var e = this.originalEvent;
        if (!e) {
            return;
        }
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    }, stopPropagation: function () {
        this.isPropagationStopped = returnTrue;
        var e = this.originalEvent;
        if (!e) {
            return;
        }
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.cancelBubble = true;
    }, stopImmediatePropagation: function () {
        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();
    }, isDefaultPrevented: returnFalse, isPropagationStopped: returnFalse, isImmediatePropagationStopped: returnFalse};
    var withinElement = function (event) {
        var parent = event.relatedTarget;
        try {
            while (parent && parent !== this) {
                parent = parent.parentNode;
            }
            if (parent !== this) {
                event.type = event.data;
                jQuery.event.handle.apply(this, arguments);
            }
        } catch (e) {
        }
    }, delegate = function (event) {
        event.type = event.data;
        jQuery.event.handle.apply(this, arguments);
    };
    jQuery.each({mouseenter: "mouseover", mouseleave: "mouseout"}, function (orig, fix) {
        jQuery.event.special[orig] = {setup: function (data) {
            jQuery.event.add(this, fix, data && data.selector ? delegate : withinElement, orig);
        }, teardown: function (data) {
            jQuery.event.remove(this, fix, data && data.selector ? delegate : withinElement);
        }};
    });
    if (!jQuery.support.submitBubbles) {
        jQuery.event.special.submit = {setup: function (data, namespaces) {
            if (this.nodeName.toLowerCase() !== "form") {
                jQuery.event.add(this, "click.specialSubmit", function (e) {
                    var elem = e.target, type = elem.type;
                    if ((type === "submit" || type === "image") && jQuery(elem).closest("form").length) {
                        e.liveFired = undefined;
                        return trigger("submit", this, arguments);
                    }
                });
                jQuery.event.add(this, "keypress.specialSubmit", function (e) {
                    var elem = e.target, type = elem.type;
                    if ((type === "text" || type === "password") && jQuery(elem).closest("form").length && e.keyCode === 13) {
                        e.liveFired = undefined;
                        return trigger("submit", this, arguments);
                    }
                });
            } else {
                return false;
            }
        }, teardown: function (namespaces) {
            jQuery.event.remove(this, ".specialSubmit");
        }};
    }
    if (!jQuery.support.changeBubbles) {
        var changeFilters, getVal = function (elem) {
            var type = elem.type, val = elem.value;
            if (type === "radio" || type === "checkbox") {
                val = elem.checked;
            } else if (type === "select-multiple") {
                val = elem.selectedIndex > -1 ? jQuery.map(elem.options,function (elem) {
                    return elem.selected;
                }).join("-") : "";
            } else if (elem.nodeName.toLowerCase() === "select") {
                val = elem.selectedIndex;
            }
            return val;
        }, testChange = function testChange(e) {
            var elem = e.target, data, val;
            if (!rformElems.test(elem.nodeName) || elem.readOnly) {
                return;
            }
            data = jQuery.data(elem, "_change_data");
            val = getVal(elem);
            if (e.type !== "focusout" || elem.type !== "radio") {
                jQuery.data(elem, "_change_data", val);
            }
            if (data === undefined || val === data) {
                return;
            }
            if (data != null || val) {
                e.type = "change";
                e.liveFired = undefined;
                return jQuery.event.trigger(e, arguments[1], elem);
            }
        };
        jQuery.event.special.change = {filters: {focusout: testChange, beforedeactivate: testChange, click: function (e) {
            var elem = e.target, type = elem.type;
            if (type === "radio" || type === "checkbox" || elem.nodeName.toLowerCase() === "select") {
                return testChange.call(this, e);
            }
        }, keydown: function (e) {
            var elem = e.target, type = elem.type;
            if ((e.keyCode === 13 && elem.nodeName.toLowerCase() !== "textarea") || (e.keyCode === 32 && (type === "checkbox" || type === "radio")) || type === "select-multiple") {
                return testChange.call(this, e);
            }
        }, beforeactivate: function (e) {
            var elem = e.target;
            jQuery.data(elem, "_change_data", getVal(elem));
        }}, setup: function (data, namespaces) {
            if (this.type === "file") {
                return false;
            }
            for (var type in changeFilters) {
                jQuery.event.add(this, type + ".specialChange", changeFilters[type]);
            }
            return rformElems.test(this.nodeName);
        }, teardown: function (namespaces) {
            jQuery.event.remove(this, ".specialChange");
            return rformElems.test(this.nodeName);
        }};
        changeFilters = jQuery.event.special.change.filters;
        changeFilters.focus = changeFilters.beforeactivate;
    }
    function trigger(type, elem, args) {
        args[0].type = type;
        return jQuery.event.handle.apply(elem, args);
    }

    if (document.addEventListener) {
        jQuery.each({focus: "focusin", blur: "focusout"}, function (orig, fix) {
            jQuery.event.special[fix] = {setup: function () {
                if (focusCounts[fix]++ === 0) {
                    document.addEventListener(orig, handler, true);
                }
            }, teardown: function () {
                if (--focusCounts[fix] === 0) {
                    document.removeEventListener(orig, handler, true);
                }
            }};
            function handler(e) {
                e = jQuery.event.fix(e);
                e.type = fix;
                return jQuery.event.trigger(e, null, e.target);
            }
        });
    }
    jQuery.each(["bind", "one"], function (i, name) {
        jQuery.fn[name] = function (type, data, fn) {
            if (typeof type === "object") {
                for (var key in type) {
                    this[name](key, data, type[key], fn);
                }
                return this;
            }
            if (jQuery.isFunction(data) || data === false) {
                fn = data;
                data = undefined;
            }
            var handler = name === "one" ? jQuery.proxy(fn, function (event) {
                jQuery(this).unbind(event, handler);
                return fn.apply(this, arguments);
            }) : fn;
            if (type === "unload" && name !== "one") {
                this.one(type, data, fn);
            } else {
                for (var i = 0, l = this.length; i < l; i++) {
                    jQuery.event.add(this[i], type, handler, data);
                }
            }
            return this;
        };
    });
    jQuery.fn.extend({unbind: function (type, fn) {
        if (typeof type === "object" && !type.preventDefault) {
            for (var key in type) {
                this.unbind(key, type[key]);
            }
        } else {
            for (var i = 0, l = this.length; i < l; i++) {
                jQuery.event.remove(this[i], type, fn);
            }
        }
        return this;
    }, delegate: function (selector, types, data, fn) {
        return this.live(types, data, fn, selector);
    }, undelegate: function (selector, types, fn) {
        if (arguments.length === 0) {
            return this.unbind("live");
        } else {
            return this.die(types, null, fn, selector);
        }
    }, trigger: function (type, data) {
        return this.each(function () {
            jQuery.event.trigger(type, data, this);
        });
    }, triggerHandler: function (type, data) {
        if (this[0]) {
            var event = jQuery.Event(type);
            event.preventDefault();
            event.stopPropagation();
            jQuery.event.trigger(event, data, this[0]);
            return event.result;
        }
    }, toggle: function (fn) {
        var args = arguments, i = 1;
        while (i < args.length) {
            jQuery.proxy(fn, args[i++]);
        }
        return this.click(jQuery.proxy(fn, function (event) {
            var lastToggle = (jQuery.data(this, "lastToggle" + fn.guid) || 0) % i;
            jQuery.data(this, "lastToggle" + fn.guid, lastToggle + 1);
            event.preventDefault();
            return args[lastToggle].apply(this, arguments) || false;
        }));
    }, hover: function (fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    }});
    var liveMap = {focus: "focusin", blur: "focusout", mouseenter: "mouseover", mouseleave: "mouseout"};
    jQuery.each(["live", "die"], function (i, name) {
        jQuery.fn[name] = function (types, data, fn, origSelector) {
            var type, i = 0, match, namespaces, preType, selector = origSelector || this.selector, context = origSelector ? this : jQuery(this.context);
            if (typeof types === "object" && !types.preventDefault) {
                for (var key in types) {
                    context[name](key, data, types[key], selector);
                }
                return this;
            }
            if (jQuery.isFunction(data)) {
                fn = data;
                data = undefined;
            }
            types = (types || "").split(" ");
            while ((type = types[i++]) != null) {
                match = rnamespaces.exec(type);
                namespaces = "";
                if (match) {
                    namespaces = match[0];
                    type = type.replace(rnamespaces, "");
                }
                if (type === "hover") {
                    types.push("mouseenter" + namespaces, "mouseleave" + namespaces);
                    continue;
                }
                preType = type;
                if (type === "focus" || type === "blur") {
                    types.push(liveMap[type] + namespaces);
                    type = type + namespaces;
                } else {
                    type = (liveMap[type] || type) + namespaces;
                }
                if (name === "live") {
                    for (var j = 0, l = context.length; j < l; j++) {
                        jQuery.event.add(context[j], "live." + liveConvert(type, selector), {data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType});
                    }
                } else {
                    context.unbind("live." + liveConvert(type, selector), fn);
                }
            }
            return this;
        };
    });
    function liveHandler(event) {
        var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret, elems = [], selectors = [], events = jQuery.data(this, this.nodeType ? "events" : "__events__");
        if (typeof events === "function") {
            events = events.events;
        }
        if (event.liveFired === this || !events || !events.live || event.button && event.type === "click") {
            return;
        }
        if (event.namespace) {
            namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
        }
        event.liveFired = this;
        var live = events.live.slice(0);
        for (j = 0; j < live.length; j++) {
            handleObj = live[j];
            if (handleObj.origType.replace(rnamespaces, "") === event.type) {
                selectors.push(handleObj.selector);
            } else {
                live.splice(j--, 1);
            }
        }
        match = jQuery(event.target).closest(selectors, event.currentTarget);
        for (i = 0, l = match.length; i < l; i++) {
            close = match[i];
            for (j = 0; j < live.length; j++) {
                handleObj = live[j];
                if (close.selector === handleObj.selector && (!namespace || namespace.test(handleObj.namespace))) {
                    elem = close.elem;
                    related = null;
                    if (handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave") {
                        event.type = handleObj.preType;
                        related = jQuery(event.relatedTarget).closest(handleObj.selector)[0];
                    }
                    if (!related || related !== elem) {
                        elems.push({elem: elem, handleObj: handleObj, level: close.level});
                    }
                }
            }
        }
        for (i = 0, l = elems.length; i < l; i++) {
            match = elems[i];
            if (maxLevel && match.level > maxLevel) {
                break;
            }
            event.currentTarget = match.elem;
            event.data = match.handleObj.data;
            event.handleObj = match.handleObj;
            ret = match.handleObj.origHandler.apply(match.elem, arguments);
            if (ret === false || event.isPropagationStopped()) {
                maxLevel = match.level;
                if (ret === false) {
                    stop = false;
                }
                if (event.isImmediatePropagationStopped()) {
                    break;
                }
            }
        }
        return stop;
    }

    function liveConvert(type, selector) {
        return(type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspace, "&");
    }

    jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error").split(" "), function (i, name) {
        jQuery.fn[name] = function (data, fn) {
            if (fn == null) {
                fn = data;
                data = null;
            }
            return arguments.length > 0 ? this.bind(name, data, fn) : this.trigger(name);
        };
        if (jQuery.attrFn) {
            jQuery.attrFn[name] = true;
        }
    });
    if (window.attachEvent && !window.addEventListener) {
        jQuery(window).bind("unload", function () {
            for (var id in jQuery.cache) {
                if (jQuery.cache[id].handle) {
                    try {
                        jQuery.event.remove(jQuery.cache[id].handle.elem);
                    } catch (e) {
                    }
                }
            }
        });
    }
    (function () {
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g, done = 0, toString = Object.prototype.toString, hasDuplicate = false, baseHasDuplicate = true;
        [0, 0].sort(function () {
            baseHasDuplicate = false;
            return 0;
        });
        var Sizzle = function (selector, context, results, seed) {
            results = results || [];
            context = context || document;
            var origContext = context;
            if (context.nodeType !== 1 && context.nodeType !== 9) {
                return[];
            }
            if (!selector || typeof selector !== "string") {
                return results;
            }
            var m, set, checkSet, extra, ret, cur, pop, i, prune = true, contextXML = Sizzle.isXML(context), parts = [], soFar = selector;
            do {
                chunker.exec("");
                m = chunker.exec(soFar);
                if (m) {
                    soFar = m[3];
                    parts.push(m[1]);
                    if (m[2]) {
                        extra = m[3];
                        break;
                    }
                }
            } while (m);
            if (parts.length > 1 && origPOS.exec(selector)) {
                if (parts.length === 2 && Expr.relative[parts[0]]) {
                    set = posProcess(parts[0] + parts[1], context);
                } else {
                    set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
                    while (parts.length) {
                        selector = parts.shift();
                        if (Expr.relative[selector]) {
                            selector += parts.shift();
                        }
                        set = posProcess(selector, set);
                    }
                }
            } else {
                if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {
                    ret = Sizzle.find(parts.shift(), context, contextXML);
                    context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
                }
                if (context) {
                    ret = seed ? {expr: parts.pop(), set: makeArray(seed)} : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
                    set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
                    if (parts.length > 0) {
                        checkSet = makeArray(set);
                    } else {
                        prune = false;
                    }
                    while (parts.length) {
                        cur = parts.pop();
                        pop = cur;
                        if (!Expr.relative[cur]) {
                            cur = "";
                        } else {
                            pop = parts.pop();
                        }
                        if (pop == null) {
                            pop = context;
                        }
                        Expr.relative[cur](checkSet, pop, contextXML);
                    }
                } else {
                    checkSet = parts = [];
                }
            }
            if (!checkSet) {
                checkSet = set;
            }
            if (!checkSet) {
                Sizzle.error(cur || selector);
            }
            if (toString.call(checkSet) === "[object Array]") {
                if (!prune) {
                    results.push.apply(results, checkSet);
                } else if (context && context.nodeType === 1) {
                    for (i = 0; checkSet[i] != null; i++) {
                        if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                            results.push(set[i]);
                        }
                    }
                } else {
                    for (i = 0; checkSet[i] != null; i++) {
                        if (checkSet[i] && checkSet[i].nodeType === 1) {
                            results.push(set[i]);
                        }
                    }
                }
            } else {
                makeArray(checkSet, results);
            }
            if (extra) {
                Sizzle(extra, origContext, results, seed);
                Sizzle.uniqueSort(results);
            }
            return results;
        };
        Sizzle.uniqueSort = function (results) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                results.sort(sortOrder);
                if (hasDuplicate) {
                    for (var i = 1; i < results.length; i++) {
                        if (results[i] === results[i - 1]) {
                            results.splice(i--, 1);
                        }
                    }
                }
            }
            return results;
        };
        Sizzle.matches = function (expr, set) {
            return Sizzle(expr, null, null, set);
        };
        Sizzle.matchesSelector = function (node, expr) {
            return Sizzle(expr, null, null, [node]).length > 0;
        };
        Sizzle.find = function (expr, context, isXML) {
            var set;
            if (!expr) {
                return[];
            }
            for (var i = 0, l = Expr.order.length; i < l; i++) {
                var match, type = Expr.order[i];
                if ((match = Expr.leftMatch[type].exec(expr))) {
                    var left = match[1];
                    match.splice(1, 1);
                    if (left.substr(left.length - 1) !== "\\") {
                        match[1] = (match[1] || "").replace(/\\/g, "");
                        set = Expr.find[type](match, context, isXML);
                        if (set != null) {
                            expr = expr.replace(Expr.match[type], "");
                            break;
                        }
                    }
                }
            }
            if (!set) {
                set = context.getElementsByTagName("*");
            }
            return{set: set, expr: expr};
        };
        Sizzle.filter = function (expr, set, inplace, not) {
            var match, anyFound, old = expr, result = [], curLoop = set, isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);
            while (expr && set.length) {
                for (var type in Expr.filter) {
                    if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
                        var found, item, filter = Expr.filter[type], left = match[1];
                        anyFound = false;
                        match.splice(1, 1);
                        if (left.substr(left.length - 1) === "\\") {
                            continue;
                        }
                        if (curLoop === result) {
                            result = [];
                        }
                        if (Expr.preFilter[type]) {
                            match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
                            if (!match) {
                                anyFound = found = true;
                            } else if (match === true) {
                                continue;
                            }
                        }
                        if (match) {
                            for (var i = 0; (item = curLoop[i]) != null; i++) {
                                if (item) {
                                    found = filter(item, match, i, curLoop);
                                    var pass = not ^ !!found;
                                    if (inplace && found != null) {
                                        if (pass) {
                                            anyFound = true;
                                        } else {
                                            curLoop[i] = false;
                                        }
                                    } else if (pass) {
                                        result.push(item);
                                        anyFound = true;
                                    }
                                }
                            }
                        }
                        if (found !== undefined) {
                            if (!inplace) {
                                curLoop = result;
                            }
                            expr = expr.replace(Expr.match[type], "");
                            if (!anyFound) {
                                return[];
                            }
                            break;
                        }
                    }
                }
                if (expr === old) {
                    if (anyFound == null) {
                        Sizzle.error(expr);
                    } else {
                        break;
                    }
                }
                old = expr;
            }
            return curLoop;
        };
        Sizzle.error = function (msg) {
            throw"Syntax error, unrecognized expression: " + msg;
        };
        var Expr = Sizzle.selectors = {order: ["ID", "NAME", "TAG"], match: {ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/, CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/, NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/, ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/, TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/, CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/, POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/, PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/}, leftMatch: {}, attrMap: {"class": "className", "for": "htmlFor"}, attrHandle: {href: function (elem) {
            return elem.getAttribute("href");
        }}, relative: {"+": function (checkSet, part) {
            var isPartStr = typeof part === "string", isTag = isPartStr && !/\W/.test(part), isPartStrNotTag = isPartStr && !isTag;
            if (isTag) {
                part = part.toLowerCase();
            }
            for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                if ((elem = checkSet[i])) {
                    while ((elem = elem.previousSibling) && elem.nodeType !== 1) {
                    }
                    checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part;
                }
            }
            if (isPartStrNotTag) {
                Sizzle.filter(part, checkSet, true);
            }
        }, ">": function (checkSet, part) {
            var elem, isPartStr = typeof part === "string", i = 0, l = checkSet.length;
            if (isPartStr && !/\W/.test(part)) {
                part = part.toLowerCase();
                for (; i < l; i++) {
                    elem = checkSet[i];
                    if (elem) {
                        var parent = elem.parentNode;
                        checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                    }
                }
            } else {
                for (; i < l; i++) {
                    elem = checkSet[i];
                    if (elem) {
                        checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part;
                    }
                }
                if (isPartStr) {
                    Sizzle.filter(part, checkSet, true);
                }
            }
        }, "": function (checkSet, part, isXML) {
            var nodeCheck, doneName = done++, checkFn = dirCheck;
            if (typeof part === "string" && !/\W/.test(part)) {
                part = part.toLowerCase();
                nodeCheck = part;
                checkFn = dirNodeCheck;
            }
            checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
        }, "~": function (checkSet, part, isXML) {
            var nodeCheck, doneName = done++, checkFn = dirCheck;
            if (typeof part === "string" && !/\W/.test(part)) {
                part = part.toLowerCase();
                nodeCheck = part;
                checkFn = dirNodeCheck;
            }
            checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
        }}, find: {ID: function (match, context, isXML) {
            if (typeof context.getElementById !== "undefined" && !isXML) {
                var m = context.getElementById(match[1]);
                return m && m.parentNode ? [m] : [];
            }
        }, NAME: function (match, context) {
            if (typeof context.getElementsByName !== "undefined") {
                var ret = [], results = context.getElementsByName(match[1]);
                for (var i = 0, l = results.length; i < l; i++) {
                    if (results[i].getAttribute("name") === match[1]) {
                        ret.push(results[i]);
                    }
                }
                return ret.length === 0 ? null : ret;
            }
        }, TAG: function (match, context) {
            return context.getElementsByTagName(match[1]);
        }}, preFilter: {CLASS: function (match, curLoop, inplace, result, not, isXML) {
            match = " " + match[1].replace(/\\/g, "") + " ";
            if (isXML) {
                return match;
            }
            for (var i = 0, elem; (elem = curLoop[i]) != null; i++) {
                if (elem) {
                    if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0)) {
                        if (!inplace) {
                            result.push(elem);
                        }
                    } else if (inplace) {
                        curLoop[i] = false;
                    }
                }
            }
            return false;
        }, ID: function (match) {
            return match[1].replace(/\\/g, "");
        }, TAG: function (match, curLoop) {
            return match[1].toLowerCase();
        }, CHILD: function (match) {
            if (match[1] === "nth") {
                var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
                match[2] = (test[1] + (test[2] || 1)) - 0;
                match[3] = test[3] - 0;
            }
            match[0] = done++;
            return match;
        }, ATTR: function (match, curLoop, inplace, result, not, isXML) {
            var name = match[1].replace(/\\/g, "");
            if (!isXML && Expr.attrMap[name]) {
                match[1] = Expr.attrMap[name];
            }
            if (match[2] === "~=") {
                match[4] = " " + match[4] + " ";
            }
            return match;
        }, PSEUDO: function (match, curLoop, inplace, result, not) {
            if (match[1] === "not") {
                if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
                    match[3] = Sizzle(match[3], null, null, curLoop);
                } else {
                    var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
                    if (!inplace) {
                        result.push.apply(result, ret);
                    }
                    return false;
                }
            } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                return true;
            }
            return match;
        }, POS: function (match) {
            match.unshift(true);
            return match;
        }}, filters: {enabled: function (elem) {
            return elem.disabled === false && elem.type !== "hidden";
        }, disabled: function (elem) {
            return elem.disabled === true;
        }, checked: function (elem) {
            return elem.checked === true;
        }, selected: function (elem) {
            elem.parentNode.selectedIndex;
            return elem.selected === true;
        }, parent: function (elem) {
            return!!elem.firstChild;
        }, empty: function (elem) {
            return!elem.firstChild;
        }, has: function (elem, i, match) {
            return!!Sizzle(match[3], elem).length;
        }, header: function (elem) {
            return(/h\d/i).test(elem.nodeName);
        }, text: function (elem) {
            return"text" === elem.type;
        }, radio: function (elem) {
            return"radio" === elem.type;
        }, checkbox: function (elem) {
            return"checkbox" === elem.type;
        }, file: function (elem) {
            return"file" === elem.type;
        }, password: function (elem) {
            return"password" === elem.type;
        }, submit: function (elem) {
            return"submit" === elem.type;
        }, image: function (elem) {
            return"image" === elem.type;
        }, reset: function (elem) {
            return"reset" === elem.type;
        }, button: function (elem) {
            return"button" === elem.type || elem.nodeName.toLowerCase() === "button";
        }, input: function (elem) {
            return(/input|select|textarea|button/i).test(elem.nodeName);
        }}, setFilters: {first: function (elem, i) {
            return i === 0;
        }, last: function (elem, i, match, array) {
            return i === array.length - 1;
        }, even: function (elem, i) {
            return i % 2 === 0;
        }, odd: function (elem, i) {
            return i % 2 === 1;
        }, lt: function (elem, i, match) {
            return i < match[3] - 0;
        }, gt: function (elem, i, match) {
            return i > match[3] - 0;
        }, nth: function (elem, i, match) {
            return match[3] - 0 === i;
        }, eq: function (elem, i, match) {
            return match[3] - 0 === i;
        }}, filter: {PSEUDO: function (elem, match, i, array) {
            var name = match[1], filter = Expr.filters[name];
            if (filter) {
                return filter(elem, i, match, array);
            } else if (name === "contains") {
                return(elem.textContent || elem.innerText || Sizzle.getText([elem]) || "").indexOf(match[3]) >= 0;
            } else if (name === "not") {
                var not = match[3];
                for (var j = 0, l = not.length; j < l; j++) {
                    if (not[j] === elem) {
                        return false;
                    }
                }
                return true;
            } else {
                Sizzle.error("Syntax error, unrecognized expression: " + name);
            }
        }, CHILD: function (elem, match) {
            var type = match[1], node = elem;
            switch (type) {
                case"only":
                case"first":
                    while ((node = node.previousSibling)) {
                        if (node.nodeType === 1) {
                            return false;
                        }
                    }
                    if (type === "first") {
                        return true;
                    }
                    node = elem;
                case"last":
                    while ((node = node.nextSibling)) {
                        if (node.nodeType === 1) {
                            return false;
                        }
                    }
                    return true;
                case"nth":
                    var first = match[2], last = match[3];
                    if (first === 1 && last === 0) {
                        return true;
                    }
                    var doneName = match[0], parent = elem.parentNode;
                    if (parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
                        var count = 0;
                        for (node = parent.firstChild; node; node = node.nextSibling) {
                            if (node.nodeType === 1) {
                                node.nodeIndex = ++count;
                            }
                        }
                        parent.sizcache = doneName;
                    }
                    var diff = elem.nodeIndex - last;
                    if (first === 0) {
                        return diff === 0;
                    } else {
                        return(diff % first === 0 && diff / first >= 0);
                    }
            }
        }, ID: function (elem, match) {
            return elem.nodeType === 1 && elem.getAttribute("id") === match;
        }, TAG: function (elem, match) {
            return(match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
        }, CLASS: function (elem, match) {
            return(" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1;
        }, ATTR: function (elem, match) {
            var name = match[1], result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name), value = result + "", type = match[2], check = match[4];
            return result == null ? type === "!=" : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false;
        }, POS: function (elem, match, i, array) {
            var name = match[2], filter = Expr.setFilters[name];
            if (filter) {
                return filter(elem, i, match, array);
            }
        }}};
        var origPOS = Expr.match.POS, fescape = function (all, num) {
            return"\\" + (num - 0 + 1);
        };
        for (var type in Expr.match) {
            Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
            Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
        }
        var makeArray = function (array, results) {
            array = Array.prototype.slice.call(array, 0);
            if (results) {
                results.push.apply(results, array);
                return results;
            }
            return array;
        };
        try {
            Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;
        } catch (e) {
            makeArray = function (array, results) {
                var i = 0, ret = results || [];
                if (toString.call(array) === "[object Array]") {
                    Array.prototype.push.apply(ret, array);
                } else {
                    if (typeof array.length === "number") {
                        for (var l = array.length; i < l; i++) {
                            ret.push(array[i]);
                        }
                    } else {
                        for (; array[i]; i++) {
                            ret.push(array[i]);
                        }
                    }
                }
                return ret;
            };
        }
        var sortOrder, siblingCheck;
        if (document.documentElement.compareDocumentPosition) {
            sortOrder = function (a, b) {
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }
                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };
        } else {
            sortOrder = function (a, b) {
                var al, bl, ap = [], bp = [], aup = a.parentNode, bup = b.parentNode, cur = aup;
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                } else if (aup === bup) {
                    return siblingCheck(a, b);
                } else if (!aup) {
                    return-1;
                } else if (!bup) {
                    return 1;
                }
                while (cur) {
                    ap.unshift(cur);
                    cur = cur.parentNode;
                }
                cur = bup;
                while (cur) {
                    bp.unshift(cur);
                    cur = cur.parentNode;
                }
                al = ap.length;
                bl = bp.length;
                for (var i = 0; i < al && i < bl; i++) {
                    if (ap[i] !== bp[i]) {
                        return siblingCheck(ap[i], bp[i]);
                    }
                }
                return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1);
            };
            siblingCheck = function (a, b, ret) {
                if (a === b) {
                    return ret;
                }
                var cur = a.nextSibling;
                while (cur) {
                    if (cur === b) {
                        return-1;
                    }
                    cur = cur.nextSibling;
                }
                return 1;
            };
        }
        Sizzle.getText = function (elems) {
            var ret = "", elem;
            for (var i = 0; elems[i]; i++) {
                elem = elems[i];
                if (elem.nodeType === 3 || elem.nodeType === 4) {
                    ret += elem.nodeValue;
                } else if (elem.nodeType !== 8) {
                    ret += Sizzle.getText(elem.childNodes);
                }
            }
            return ret;
        };
        (function () {
            var form = document.createElement("div"), id = "script" + (new Date()).getTime(), root = document.documentElement;
            form.innerHTML = "<a name='" + id + "'/>";
            root.insertBefore(form, root.firstChild);
            if (document.getElementById(id)) {
                Expr.find.ID = function (match, context, isXML) {
                    if (typeof context.getElementById !== "undefined" && !isXML) {
                        var m = context.getElementById(match[1]);
                        return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
                    }
                };
                Expr.filter.ID = function (elem, match) {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                    return elem.nodeType === 1 && node && node.nodeValue === match;
                };
            }
            root.removeChild(form);
            root = form = null;
        })();
        (function () {
            var div = document.createElement("div");
            div.appendChild(document.createComment(""));
            if (div.getElementsByTagName("*").length > 0) {
                Expr.find.TAG = function (match, context) {
                    var results = context.getElementsByTagName(match[1]);
                    if (match[1] === "*") {
                        var tmp = [];
                        for (var i = 0; results[i]; i++) {
                            if (results[i].nodeType === 1) {
                                tmp.push(results[i]);
                            }
                        }
                        results = tmp;
                    }
                    return results;
                };
            }
            div.innerHTML = "<a href='#'></a>";
            if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") {
                Expr.attrHandle.href = function (elem) {
                    return elem.getAttribute("href", 2);
                };
            }
            div = null;
        })();
        if (document.querySelectorAll) {
            (function () {
                var oldSizzle = Sizzle, div = document.createElement("div"), id = "__sizzle__";
                div.innerHTML = "<p class='TEST'></p>";
                if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                    return;
                }
                Sizzle = function (query, context, extra, seed) {
                    context = context || document;
                    query = query.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
                    if (!seed && !Sizzle.isXML(context)) {
                        if (context.nodeType === 9) {
                            try {
                                return makeArray(context.querySelectorAll(query), extra);
                            } catch (qsaError) {
                            }
                        } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                            var old = context.getAttribute("id"), nid = old || id;
                            if (!old) {
                                context.setAttribute("id", nid);
                            }
                            try {
                                return makeArray(context.querySelectorAll("#" + nid + " " + query), extra);
                            } catch (pseudoError) {
                            } finally {
                                if (!old) {
                                    context.removeAttribute("id");
                                }
                            }
                        }
                    }
                    return oldSizzle(query, context, extra, seed);
                };
                for (var prop in oldSizzle) {
                    Sizzle[prop] = oldSizzle[prop];
                }
                div = null;
            })();
        }
        (function () {
            var html = document.documentElement, matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector, pseudoWorks = false;
            try {
                matches.call(document.documentElement, "[test!='']:sizzle");
            } catch (pseudoError) {
                pseudoWorks = true;
            }
            if (matches) {
                Sizzle.matchesSelector = function (node, expr) {
                    expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
                    if (!Sizzle.isXML(node)) {
                        try {
                            if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
                                return matches.call(node, expr);
                            }
                        } catch (e) {
                        }
                    }
                    return Sizzle(expr, null, null, [node]).length > 0;
                };
            }
        })();
        (function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
                return;
            }
            div.lastChild.className = "e";
            if (div.getElementsByClassName("e").length === 1) {
                return;
            }
            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function (match, context, isXML) {
                if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                    return context.getElementsByClassName(match[1]);
                }
            };
            div = null;
        })();
        function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];
                if (elem) {
                    var match = false;
                    elem = elem[dir];
                    while (elem) {
                        if (elem.sizcache === doneName) {
                            match = checkSet[elem.sizset];
                            break;
                        }
                        if (elem.nodeType === 1 && !isXML) {
                            elem.sizcache = doneName;
                            elem.sizset = i;
                        }
                        if (elem.nodeName.toLowerCase() === cur) {
                            match = elem;
                            break;
                        }
                        elem = elem[dir];
                    }
                    checkSet[i] = match;
                }
            }
        }

        function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];
                if (elem) {
                    var match = false;
                    elem = elem[dir];
                    while (elem) {
                        if (elem.sizcache === doneName) {
                            match = checkSet[elem.sizset];
                            break;
                        }
                        if (elem.nodeType === 1) {
                            if (!isXML) {
                                elem.sizcache = doneName;
                                elem.sizset = i;
                            }
                            if (typeof cur !== "string") {
                                if (elem === cur) {
                                    match = true;
                                    break;
                                }
                            } else if (Sizzle.filter(cur, [elem]).length > 0) {
                                match = elem;
                                break;
                            }
                        }
                        elem = elem[dir];
                    }
                    checkSet[i] = match;
                }
            }
        }

        if (document.documentElement.contains) {
            Sizzle.contains = function (a, b) {
                return a !== b && (a.contains ? a.contains(b) : true);
            };
        } else if (document.documentElement.compareDocumentPosition) {
            Sizzle.contains = function (a, b) {
                return!!(a.compareDocumentPosition(b) & 16);
            };
        } else {
            Sizzle.contains = function () {
                return false;
            };
        }
        Sizzle.isXML = function (elem) {
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };
        var posProcess = function (selector, context) {
            var match, tmpSet = [], later = "", root = context.nodeType ? [context] : context;
            while ((match = Expr.match.PSEUDO.exec(selector))) {
                later += match[0];
                selector = selector.replace(Expr.match.PSEUDO, "");
            }
            selector = Expr.relative[selector] ? selector + "*" : selector;
            for (var i = 0, l = root.length; i < l; i++) {
                Sizzle(selector, root[i], tmpSet);
            }
            return Sizzle.filter(later, tmpSet);
        };
        jQuery.find = Sizzle;
        jQuery.expr = Sizzle.selectors;
        jQuery.expr[":"] = jQuery.expr.filters;
        jQuery.unique = Sizzle.uniqueSort;
        jQuery.text = Sizzle.getText;
        jQuery.isXMLDoc = Sizzle.isXML;
        jQuery.contains = Sizzle.contains;
    })();
    var runtil = /Until$/, rparentsprev = /^(?:parents|prevUntil|prevAll)/, rmultiselector = /,/, isSimple = /^.[^:#\[\.,]*$/, slice = Array.prototype.slice, POS = jQuery.expr.match.POS;
    jQuery.fn.extend({find: function (selector) {
        var ret = this.pushStack("", "find", selector), length = 0;
        for (var i = 0, l = this.length; i < l; i++) {
            length = ret.length;
            jQuery.find(selector, this[i], ret);
            if (i > 0) {
                for (var n = length; n < ret.length; n++) {
                    for (var r = 0; r < length; r++) {
                        if (ret[r] === ret[n]) {
                            ret.splice(n--, 1);
                            break;
                        }
                    }
                }
            }
        }
        return ret;
    }, has: function (target) {
        var targets = jQuery(target);
        return this.filter(function () {
            for (var i = 0, l = targets.length; i < l; i++) {
                if (jQuery.contains(this, targets[i])) {
                    return true;
                }
            }
        });
    }, not: function (selector) {
        return this.pushStack(winnow(this, selector, false), "not", selector);
    }, filter: function (selector) {
        return this.pushStack(winnow(this, selector, true), "filter", selector);
    }, is: function (selector) {
        return!!selector && jQuery.filter(selector, this).length > 0;
    }, closest: function (selectors, context) {
        var ret = [], i, l, cur = this[0];
        if (jQuery.isArray(selectors)) {
            var match, selector, matches = {}, level = 1;
            if (cur && selectors.length) {
                for (i = 0, l = selectors.length; i < l; i++) {
                    selector = selectors[i];
                    if (!matches[selector]) {
                        matches[selector] = jQuery.expr.match.POS.test(selector) ? jQuery(selector, context || this.context) : selector;
                    }
                }
                while (cur && cur.ownerDocument && cur !== context) {
                    for (selector in matches) {
                        match = matches[selector];
                        if (match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match)) {
                            ret.push({selector: selector, elem: cur, level: level});
                        }
                    }
                    cur = cur.parentNode;
                    level++;
                }
            }
            return ret;
        }
        var pos = POS.test(selectors) ? jQuery(selectors, context || this.context) : null;
        for (i = 0, l = this.length; i < l; i++) {
            cur = this[i];
            while (cur) {
                if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
                    ret.push(cur);
                    break;
                } else {
                    cur = cur.parentNode;
                    if (!cur || !cur.ownerDocument || cur === context) {
                        break;
                    }
                }
            }
        }
        ret = ret.length > 1 ? jQuery.unique(ret) : ret;
        return this.pushStack(ret, "closest", selectors);
    }, index: function (elem) {
        if (!elem || typeof elem === "string") {
            return jQuery.inArray(this[0], elem ? jQuery(elem) : this.parent().children());
        }
        return jQuery.inArray(elem.jquery ? elem[0] : elem, this);
    }, add: function (selector, context) {
        var set = typeof selector === "string" ? jQuery(selector, context || this.context) : jQuery.makeArray(selector), all = jQuery.merge(this.get(), set);
        return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ? all : jQuery.unique(all));
    }, andSelf: function () {
        return this.add(this.prevObject);
    }});
    function isDisconnected(node) {
        return!node || !node.parentNode || node.parentNode.nodeType === 11;
    }

    jQuery.each({parent: function (elem) {
        var parent = elem.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
    }, parents: function (elem) {
        return jQuery.dir(elem, "parentNode");
    }, parentsUntil: function (elem, i, until) {
        return jQuery.dir(elem, "parentNode", until);
    }, next: function (elem) {
        return jQuery.nth(elem, 2, "nextSibling");
    }, prev: function (elem) {
        return jQuery.nth(elem, 2, "previousSibling");
    }, nextAll: function (elem) {
        return jQuery.dir(elem, "nextSibling");
    }, prevAll: function (elem) {
        return jQuery.dir(elem, "previousSibling");
    }, nextUntil: function (elem, i, until) {
        return jQuery.dir(elem, "nextSibling", until);
    }, prevUntil: function (elem, i, until) {
        return jQuery.dir(elem, "previousSibling", until);
    }, siblings: function (elem) {
        return jQuery.sibling(elem.parentNode.firstChild, elem);
    }, children: function (elem) {
        return jQuery.sibling(elem.firstChild);
    }, contents: function (elem) {
        return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.makeArray(elem.childNodes);
    }}, function (name, fn) {
        jQuery.fn[name] = function (until, selector) {
            var ret = jQuery.map(this, fn, until);
            if (!runtil.test(name)) {
                selector = until;
            }
            if (selector && typeof selector === "string") {
                ret = jQuery.filter(selector, ret);
            }
            ret = this.length > 1 ? jQuery.unique(ret) : ret;
            if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) {
                ret = ret.reverse();
            }
            return this.pushStack(ret, name, slice.call(arguments).join(","));
        };
    });
    jQuery.extend({filter: function (expr, elems, not) {
        if (not) {
            expr = ":not(" + expr + ")";
        }
        return elems.length === 1 ? jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] : jQuery.find.matches(expr, elems);
    }, dir: function (elem, dir, until) {
        var matched = [], cur = elem[dir];
        while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
            if (cur.nodeType === 1) {
                matched.push(cur);
            }
            cur = cur[dir];
        }
        return matched;
    }, nth: function (cur, result, dir, elem) {
        result = result || 1;
        var num = 0;
        for (; cur; cur = cur[dir]) {
            if (cur.nodeType === 1 && ++num === result) {
                break;
            }
        }
        return cur;
    }, sibling: function (n, elem) {
        var r = [];
        for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
                r.push(n);
            }
        }
        return r;
    }});
    function winnow(elements, qualifier, keep) {
        if (jQuery.isFunction(qualifier)) {
            return jQuery.grep(elements, function (elem, i) {
                var retVal = !!qualifier.call(elem, i, elem);
                return retVal === keep;
            });
        } else if (qualifier.nodeType) {
            return jQuery.grep(elements, function (elem, i) {
                return(elem === qualifier) === keep;
            });
        } else if (typeof qualifier === "string") {
            var filtered = jQuery.grep(elements, function (elem) {
                return elem.nodeType === 1;
            });
            if (isSimple.test(qualifier)) {
                return jQuery.filter(qualifier, filtered, !keep);
            } else {
                qualifier = jQuery.filter(qualifier, filtered);
            }
        }
        return jQuery.grep(elements, function (elem, i) {
            return(jQuery.inArray(elem, qualifier) >= 0) === keep;
        });
    }

    var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g, rleadingWhitespace = /^\s+/, rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, rtagName = /<([\w:]+)/, rtbody = /<tbody/i, rhtml = /<|&#?\w+;/, rnocache = /<(?:script|object|embed|option|style)/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, raction = /\=([^="'>\s]+\/)>/g, wrapMap = {option: [1, "<select multiple='multiple'>", "</select>"], legend: [1, "<fieldset>", "</fieldset>"], thead: [1, "<table>", "</table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"], area: [1, "<map>", "</map>"], _default: [0, "", ""]};
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    if (!jQuery.support.htmlSerialize) {
        wrapMap._default = [1, "div<div>", "</div>"];
    }
    jQuery.fn.extend({text: function (text) {
        if (jQuery.isFunction(text)) {
            return this.each(function (i) {
                var self = jQuery(this);
                self.text(text.call(this, i, self.text()));
            });
        }
        if (typeof text !== "object" && text !== undefined) {
            return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(text));
        }
        return jQuery.text(this);
    }, wrapAll: function (html) {
        if (jQuery.isFunction(html)) {
            return this.each(function (i) {
                jQuery(this).wrapAll(html.call(this, i));
            });
        }
        if (this[0]) {
            var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
            if (this[0].parentNode) {
                wrap.insertBefore(this[0]);
            }
            wrap.map(function () {
                var elem = this;
                while (elem.firstChild && elem.firstChild.nodeType === 1) {
                    elem = elem.firstChild;
                }
                return elem;
            }).append(this);
        }
        return this;
    }, wrapInner: function (html) {
        if (jQuery.isFunction(html)) {
            return this.each(function (i) {
                jQuery(this).wrapInner(html.call(this, i));
            });
        }
        return this.each(function () {
            var self = jQuery(this), contents = self.contents();
            if (contents.length) {
                contents.wrapAll(html);
            } else {
                self.append(html);
            }
        });
    }, wrap: function (html) {
        return this.each(function () {
            jQuery(this).wrapAll(html);
        });
    }, unwrap: function () {
        return this.parent().each(function () {
            if (!jQuery.nodeName(this, "body")) {
                jQuery(this).replaceWith(this.childNodes);
            }
        }).end();
    }, append: function () {
        return this.domManip(arguments, true, function (elem) {
            if (this.nodeType === 1) {
                this.appendChild(elem);
            }
        });
    }, prepend: function () {
        return this.domManip(arguments, true, function (elem) {
            if (this.nodeType === 1) {
                this.insertBefore(elem, this.firstChild);
            }
        });
    }, before: function () {
        if (this[0] && this[0].parentNode) {
            return this.domManip(arguments, false, function (elem) {
                this.parentNode.insertBefore(elem, this);
            });
        } else if (arguments.length) {
            var set = jQuery(arguments[0]);
            set.push.apply(set, this.toArray());
            return this.pushStack(set, "before", arguments);
        }
    }, after: function () {
        if (this[0] && this[0].parentNode) {
            return this.domManip(arguments, false, function (elem) {
                this.parentNode.insertBefore(elem, this.nextSibling);
            });
        } else if (arguments.length) {
            var set = this.pushStack(this, "after", arguments);
            set.push.apply(set, jQuery(arguments[0]).toArray());
            return set;
        }
    }, remove: function (selector, keepData) {
        for (var i = 0, elem; (elem = this[i]) != null; i++) {
            if (!selector || jQuery.filter(selector, [elem]).length) {
                if (!keepData && elem.nodeType === 1) {
                    jQuery.cleanData(elem.getElementsByTagName("*"));
                    jQuery.cleanData([elem]);
                }
                if (elem.parentNode) {
                    elem.parentNode.removeChild(elem);
                }
            }
        }
        return this;
    }, empty: function () {
        for (var i = 0, elem; (elem = this[i]) != null; i++) {
            if (elem.nodeType === 1) {
                jQuery.cleanData(elem.getElementsByTagName("*"));
            }
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
        }
        return this;
    }, clone: function (events) {
        var ret = this.map(function () {
            if (!jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this)) {
                var html = this.outerHTML, ownerDocument = this.ownerDocument;
                if (!html) {
                    var div = ownerDocument.createElement("div");
                    div.appendChild(this.cloneNode(true));
                    html = div.innerHTML;
                }
                return jQuery.clean([html.replace(rinlinejQuery, "").replace(raction, '="$1">').replace(rleadingWhitespace, "")], ownerDocument)[0];
            } else {
                return this.cloneNode(true);
            }
        });
        if (events === true) {
            cloneCopyEvent(this, ret);
            cloneCopyEvent(this.find("*"), ret.find("*"));
        }
        return ret;
    }, html: function (value) {
        if (value === undefined) {
            return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(rinlinejQuery, "") : null;
        } else if (typeof value === "string" && !rnocache.test(value) && (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
            value = value.replace(rxhtmlTag, "<$1></$2>");
            try {
                for (var i = 0, l = this.length; i < l; i++) {
                    if (this[i].nodeType === 1) {
                        jQuery.cleanData(this[i].getElementsByTagName("*"));
                        this[i].innerHTML = value;
                    }
                }
            } catch (e) {
                this.empty().append(value);
            }
        } else if (jQuery.isFunction(value)) {
            this.each(function (i) {
                var self = jQuery(this);
                self.html(value.call(this, i, self.html()));
            });
        } else {
            this.empty().append(value);
        }
        return this;
    }, replaceWith: function (value) {
        if (this[0] && this[0].parentNode) {
            if (jQuery.isFunction(value)) {
                return this.each(function (i) {
                    var self = jQuery(this), old = self.html();
                    self.replaceWith(value.call(this, i, old));
                });
            }
            if (typeof value !== "string") {
                value = jQuery(value).detach();
            }
            return this.each(function () {
                var next = this.nextSibling, parent = this.parentNode;
                jQuery(this).remove();
                if (next) {
                    jQuery(next).before(value);
                } else {
                    jQuery(parent).append(value);
                }
            });
        } else {
            return this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value);
        }
    }, detach: function (selector) {
        return this.remove(selector, true);
    }, domManip: function (args, table, callback) {
        var results, first, fragment, parent, value = args[0], scripts = [];
        if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test(value)) {
            return this.each(function () {
                jQuery(this).domManip(args, table, callback, true);
            });
        }
        if (jQuery.isFunction(value)) {
            return this.each(function (i) {
                var self = jQuery(this);
                args[0] = value.call(this, i, table ? self.html() : undefined);
                self.domManip(args, table, callback);
            });
        }
        if (this[0]) {
            parent = value && value.parentNode;
            if (jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length) {
                results = {fragment: parent};
            } else {
                results = jQuery.buildFragment(args, this, scripts);
            }
            fragment = results.fragment;
            if (fragment.childNodes.length === 1) {
                first = fragment = fragment.firstChild;
            } else {
                first = fragment.firstChild;
            }
            if (first) {
                table = table && jQuery.nodeName(first, "tr");
                for (var i = 0, l = this.length; i < l; i++) {
                    callback.call(table ? root(this[i], first) : this[i], i > 0 || results.cacheable || this.length > 1 ? fragment.cloneNode(true) : fragment);
                }
            }
            if (scripts.length) {
                jQuery.each(scripts, evalScript);
            }
        }
        return this;
    }});
    function root(elem, cur) {
        return jQuery.nodeName(elem, "table") ? (elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody"))) : elem;
    }

    function cloneCopyEvent(orig, ret) {
        var i = 0;
        ret.each(function () {
            if (this.nodeName !== (orig[i] && orig[i].nodeName)) {
                return;
            }
            var oldData = jQuery.data(orig[i++]), curData = jQuery.data(this, oldData), events = oldData && oldData.events;
            if (events) {
                delete curData.handle;
                curData.events = {};
                for (var type in events) {
                    for (var handler in events[type]) {
                        jQuery.event.add(this, type, events[type][handler], events[type][handler].data);
                    }
                }
            }
        });
    }

    jQuery.buildFragment = function (args, nodes, scripts) {
        var fragment, cacheable, cacheresults, doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);
        if (args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document && !rnocache.test(args[0]) && (jQuery.support.checkClone || !rchecked.test(args[0]))) {
            cacheable = true;
            cacheresults = jQuery.fragments[args[0]];
            if (cacheresults) {
                if (cacheresults !== 1) {
                    fragment = cacheresults;
                }
            }
        }
        if (!fragment) {
            fragment = doc.createDocumentFragment();
            jQuery.clean(args, doc, fragment, scripts);
        }
        if (cacheable) {
            jQuery.fragments[args[0]] = cacheresults ? fragment : 1;
        }
        return{fragment: fragment, cacheable: cacheable};
    };
    jQuery.fragments = {};
    jQuery.each({appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith"}, function (name, original) {
        jQuery.fn[name] = function (selector) {
            var ret = [], insert = jQuery(selector), parent = this.length === 1 && this[0].parentNode;
            if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
                insert[original](this[0]);
                return this;
            } else {
                for (var i = 0, l = insert.length; i < l; i++) {
                    var elems = (i > 0 ? this.clone(true) : this).get();
                    jQuery(insert[i])[original](elems);
                    ret = ret.concat(elems);
                }
                return this.pushStack(ret, name, insert.selector);
            }
        };
    });
    jQuery.extend({clean: function (elems, context, fragment, scripts) {
        context = context || document;
        if (typeof context.createElement === "undefined") {
            context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
        }
        var ret = [];
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            if (typeof elem === "number") {
                elem += "";
            }
            if (!elem) {
                continue;
            }
            if (typeof elem === "string" && !rhtml.test(elem)) {
                elem = context.createTextNode(elem);
            } else if (typeof elem === "string") {
                elem = elem.replace(rxhtmlTag, "<$1></$2>");
                var tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(), wrap = wrapMap[tag] || wrapMap._default, depth = wrap[0], div = context.createElement("div");
                div.innerHTML = wrap[1] + elem + wrap[2];
                while (depth--) {
                    div = div.lastChild;
                }
                if (!jQuery.support.tbody) {
                    var hasBody = rtbody.test(elem), tbody = tag === "table" && !hasBody ? div.firstChild && div.firstChild.childNodes : wrap[1] === "<table>" && !hasBody ? div.childNodes : [];
                    for (var j = tbody.length - 1; j >= 0; --j) {
                        if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) {
                            tbody[j].parentNode.removeChild(tbody[j]);
                        }
                    }
                }
                if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                    div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                }
                elem = div.childNodes;
            }
            if (elem.nodeType) {
                ret.push(elem);
            } else {
                ret = jQuery.merge(ret, elem);
            }
        }
        if (fragment) {
            for (i = 0; ret[i]; i++) {
                if (scripts && jQuery.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) {
                    scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);
                } else {
                    if (ret[i].nodeType === 1) {
                        ret.splice.apply(ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))));
                    }
                    fragment.appendChild(ret[i]);
                }
            }
        }
        return ret;
    }, cleanData: function (elems) {
        var data, id, cache = jQuery.cache, special = jQuery.event.special, deleteExpando = jQuery.support.deleteExpando;
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) {
                continue;
            }
            id = elem[jQuery.expando];
            if (id) {
                data = cache[id];
                if (data && data.events) {
                    for (var type in data.events) {
                        if (special[type]) {
                            jQuery.event.remove(elem, type);
                        } else {
                            jQuery.removeEvent(elem, type, data.handle);
                        }
                    }
                }
                if (deleteExpando) {
                    delete elem[jQuery.expando];
                } else if (elem.removeAttribute) {
                    elem.removeAttribute(jQuery.expando);
                }
                delete cache[id];
            }
        }
    }});
    function evalScript(i, elem) {
        if (elem.src) {
            jQuery.ajax({url: elem.src, async: false, dataType: "script"});
        } else {
            jQuery.globalEval(elem.text || elem.textContent || elem.innerHTML || "");
        }
        if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    }

    var ralpha = /alpha\([^)]*\)/i, ropacity = /opacity=([^)]*)/, rdashAlpha = /-([a-z])/ig, rupper = /([A-Z])/g, rnumpx = /^-?\d+(?:px)?$/i, rnum = /^-?\d/, cssShow = {position: "absolute", visibility: "hidden", display: "block"}, cssWidth = ["Left", "Right"], cssHeight = ["Top", "Bottom"], curCSS, getComputedStyle, currentStyle, fcamelCase = function (all, letter) {
        return letter.toUpperCase();
    };
    jQuery.fn.css = function (name, value) {
        if (arguments.length === 2 && value === undefined) {
            return this;
        }
        return jQuery.access(this, name, value, true, function (elem, name, value) {
            return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
        });
    };
    jQuery.extend({cssHooks: {opacity: {get: function (elem, computed) {
        if (computed) {
            var ret = curCSS(elem, "opacity", "opacity");
            return ret === "" ? "1" : ret;
        } else {
            return elem.style.opacity;
        }
    }}}, cssNumber: {"zIndex": true, "fontWeight": true, "opacity": true, "zoom": true, "lineHeight": true}, cssProps: {"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"}, style: function (elem, name, value, extra) {
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
        }
        var ret, origName = jQuery.camelCase(name), style = elem.style, hooks = jQuery.cssHooks[origName];
        name = jQuery.cssProps[origName] || origName;
        if (value !== undefined) {
            if (typeof value === "number" && isNaN(value) || value == null) {
                return;
            }
            if (typeof value === "number" && !jQuery.cssNumber[origName]) {
                value += "px";
            }
            if (!hooks || !("set"in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                try {
                    style[name] = value;
                } catch (e) {
                }
            }
        } else {
            if (hooks && "get"in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                return ret;
            }
            return style[name];
        }
    }, css: function (elem, name, extra) {
        var ret, origName = jQuery.camelCase(name), hooks = jQuery.cssHooks[origName];
        name = jQuery.cssProps[origName] || origName;
        if (hooks && "get"in hooks && (ret = hooks.get(elem, true, extra)) !== undefined) {
            return ret;
        } else if (curCSS) {
            return curCSS(elem, name, origName);
        }
    }, swap: function (elem, options, callback) {
        var old = {};
        for (var name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
        }
        callback.call(elem);
        for (name in options) {
            elem.style[name] = old[name];
        }
    }, camelCase: function (string) {
        return string.replace(rdashAlpha, fcamelCase);
    }});
    jQuery.curCSS = jQuery.css;
    jQuery.each(["height", "width"], function (i, name) {
        jQuery.cssHooks[name] = {get: function (elem, computed, extra) {
            var val;
            if (computed) {
                if (elem.offsetWidth !== 0) {
                    val = getWH(elem, name, extra);
                } else {
                    jQuery.swap(elem, cssShow, function () {
                        val = getWH(elem, name, extra);
                    });
                }
                if (val <= 0) {
                    val = curCSS(elem, name, name);
                    if (val === "0px" && currentStyle) {
                        val = currentStyle(elem, name, name);
                    }
                    if (val != null) {
                        return val === "" || val === "auto" ? "0px" : val;
                    }
                }
                if (val < 0 || val == null) {
                    val = elem.style[name];
                    return val === "" || val === "auto" ? "0px" : val;
                }
                return typeof val === "string" ? val : val + "px";
            }
        }, set: function (elem, value) {
            if (rnumpx.test(value)) {
                value = parseFloat(value);
                if (value >= 0) {
                    return value + "px";
                }
            } else {
                return value;
            }
        }};
    });
    if (!jQuery.support.opacity) {
        jQuery.cssHooks.opacity = {get: function (elem, computed) {
            return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? (parseFloat(RegExp.$1) / 100) + "" : computed ? "1" : "";
        }, set: function (elem, value) {
            var style = elem.style;
            style.zoom = 1;
            var opacity = jQuery.isNaN(value) ? "" : "alpha(opacity=" + value * 100 + ")", filter = style.filter || "";
            style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : style.filter + ' ' + opacity;
        }};
    }
    if (document.defaultView && document.defaultView.getComputedStyle) {
        getComputedStyle = function (elem, newName, name) {
            var ret, defaultView, computedStyle;
            name = name.replace(rupper, "-$1").toLowerCase();
            if (!(defaultView = elem.ownerDocument.defaultView)) {
                return undefined;
            }
            if ((computedStyle = defaultView.getComputedStyle(elem, null))) {
                ret = computedStyle.getPropertyValue(name);
                if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
                    ret = jQuery.style(elem, name);
                }
            }
            return ret;
        };
    }
    if (document.documentElement.currentStyle) {
        currentStyle = function (elem, name) {
            var left, rsLeft, ret = elem.currentStyle && elem.currentStyle[name], style = elem.style;
            if (!rnumpx.test(ret) && rnum.test(ret)) {
                left = style.left;
                rsLeft = elem.runtimeStyle.left;
                elem.runtimeStyle.left = elem.currentStyle.left;
                style.left = name === "fontSize" ? "1em" : (ret || 0);
                ret = style.pixelLeft + "px";
                style.left = left;
                elem.runtimeStyle.left = rsLeft;
            }
            return ret === "" ? "auto" : ret;
        };
    }
    curCSS = getComputedStyle || currentStyle;
    function getWH(elem, name, extra) {
        var which = name === "width" ? cssWidth : cssHeight, val = name === "width" ? elem.offsetWidth : elem.offsetHeight;
        if (extra === "border") {
            return val;
        }
        jQuery.each(which, function () {
            if (!extra) {
                val -= parseFloat(jQuery.css(elem, "padding" + this)) || 0;
            }
            if (extra === "margin") {
                val += parseFloat(jQuery.css(elem, "margin" + this)) || 0;
            } else {
                val -= parseFloat(jQuery.css(elem, "border" + this + "Width")) || 0;
            }
        });
        return val;
    }

    if (jQuery.expr && jQuery.expr.filters) {
        jQuery.expr.filters.hidden = function (elem) {
            var width = elem.offsetWidth, height = elem.offsetHeight;
            return(width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css(elem, "display")) === "none");
        };
        jQuery.expr.filters.visible = function (elem) {
            return!jQuery.expr.filters.hidden(elem);
        };
    }
    var jsc = jQuery.now(), rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, rselectTextarea = /^(?:select|textarea)/i, rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i, rnoContent = /^(?:GET|HEAD)$/, rbracket = /\[\]$/, jsre = /\=\?(&|$)/, rquery = /\?/, rts = /([?&])_=[^&]*/, rurl = /^(\w+:)?\/\/([^\/?#]+)/, r20 = /%20/g, rhash = /#.*$/, _load = jQuery.fn.load;
    jQuery.fn.extend({load: function (url, params, callback) {
        if (typeof url !== "string" && _load) {
            return _load.apply(this, arguments);
        } else if (!this.length) {
            return this;
        }
        var off = url.indexOf(" ");
        if (off >= 0) {
            var selector = url.slice(off, url.length);
            url = url.slice(0, off);
        }
        var type = "GET";
        if (params) {
            if (jQuery.isFunction(params)) {
                callback = params;
                params = null;
            } else if (typeof params === "object") {
                params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                type = "POST";
            }
        }
        var self = this;
        jQuery.ajax({url: url, type: type, dataType: "html", data: params, complete: function (res, status) {
            if (status === "success" || status === "notmodified") {
                self.html(selector ? jQuery("<div>").append(res.responseText.replace(rscript, "")).find(selector) : res.responseText);
            }
            if (callback) {
                self.each(callback, [res.responseText, status, res]);
            }
        }});
        return this;
    }, serialize: function () {
        return jQuery.param(this.serializeArray());
    }, serializeArray: function () {
        return this.map(function () {
            return this.elements ? jQuery.makeArray(this.elements) : this;
        }).filter(function () {
            return this.name && !this.disabled && (this.checked || rselectTextarea.test(this.nodeName) || rinput.test(this.type));
        }).map(function (i, elem) {
            var val = jQuery(this).val();
            return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function (val, i) {
                return{name: elem.name, value: val};
            }) : {name: elem.name, value: val};
        }).get();
    }});
    jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (i, o) {
        jQuery.fn[o] = function (f) {
            return this.bind(o, f);
        };
    });
    jQuery.extend({get: function (url, data, callback, type) {
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = null;
        }
        return jQuery.ajax({type: "GET", url: url, data: data, success: callback, dataType: type});
    }, getScript: function (url, callback) {
        return jQuery.get(url, null, callback, "script");
    }, getJSON: function (url, data, callback) {
        return jQuery.get(url, data, callback, "json");
    }, post: function (url, data, callback, type) {
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = {};
        }
        return jQuery.ajax({type: "POST", url: url, data: data, success: callback, dataType: type});
    }, ajaxSetup: function (settings) {
        jQuery.extend(jQuery.ajaxSettings, settings);
    }, ajaxSettings: {url: location.href, global: true, type: "GET", contentType: "application/x-www-form-urlencoded", processData: true, async: true, xhr: function () {
        return new window.XMLHttpRequest();
    }, accepts: {xml: "application/xml, text/xml", html: "text/html", script: "text/javascript, application/javascript", json: "application/json, text/javascript", text: "text/plain", _default: "*/*"}}, ajax: function (origSettings) {
        var s = jQuery.extend(true, {}, jQuery.ajaxSettings, origSettings), jsonp, status, data, type = s.type.toUpperCase(), noContent = rnoContent.test(type);
        s.url = s.url.replace(rhash, "");
        s.context = origSettings && origSettings.context != null ? origSettings.context : s;
        if (s.data && s.processData && typeof s.data !== "string") {
            s.data = jQuery.param(s.data, s.traditional);
        }
        if (s.dataType === "jsonp") {
            if (type === "GET") {
                if (!jsre.test(s.url)) {
                    s.url += (rquery.test(s.url) ? "&" : "?") + (s.jsonp || "callback") + "=?";
                }
            } else if (!s.data || !jsre.test(s.data)) {
                s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
            }
            s.dataType = "json";
        }
        if (s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url))) {
            jsonp = s.jsonpCallback || ("jsonp" + jsc++);
            if (s.data) {
                s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
            }
            s.url = s.url.replace(jsre, "=" + jsonp + "$1");
            s.dataType = "script";
            var customJsonp = window[jsonp];
            window[jsonp] = function (tmp) {
                if (jQuery.isFunction(customJsonp)) {
                    customJsonp(tmp);
                } else {
                    window[jsonp] = undefined;
                    try {
                        delete window[jsonp];
                    } catch (jsonpError) {
                    }
                }
                data = tmp;
                jQuery.handleSuccess(s, xhr, status, data);
                jQuery.handleComplete(s, xhr, status, data);
                if (head) {
                    head.removeChild(script);
                }
            };
        }
        if (s.dataType === "script" && s.cache === null) {
            s.cache = false;
        }
        if (s.cache === false && noContent) {
            var ts = jQuery.now();
            var ret = s.url.replace(rts, "$1_=" + ts);
            s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
        }
        if (s.data && noContent) {
            s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
        }
        if (s.global && jQuery.active++ === 0) {
            jQuery.event.trigger("ajaxStart");
        }
        var parts = rurl.exec(s.url), remote = parts && (parts[1] && parts[1].toLowerCase() !== location.protocol || parts[2].toLowerCase() !== location.host);
        if (s.dataType === "script" && type === "GET" && remote) {
            var head = document.getElementsByTagName("head")[0] || document.documentElement;
            var script = document.createElement("script");
            if (s.scriptCharset) {
                script.charset = s.scriptCharset;
            }
            script.src = s.url;
            if (!jsonp) {
                var done = false;
                script.onload = script.onreadystatechange = function () {
                    if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                        done = true;
                        jQuery.handleSuccess(s, xhr, status, data);
                        jQuery.handleComplete(s, xhr, status, data);
                        script.onload = script.onreadystatechange = null;
                        if (head && script.parentNode) {
                            head.removeChild(script);
                        }
                    }
                };
            }
            head.insertBefore(script, head.firstChild);
            return undefined;
        }
        var requestDone = false;
        var xhr = s.xhr();
        if (!xhr) {
            return;
        }
        if (s.username) {
            xhr.open(type, s.url, s.async, s.username, s.password);
        } else {
            xhr.open(type, s.url, s.async);
        }
        try {
            if ((s.data != null && !noContent) || (origSettings && origSettings.contentType)) {
                xhr.setRequestHeader("Content-Type", s.contentType);
            }
            if (s.ifModified) {
                if (jQuery.lastModified[s.url]) {
                    xhr.setRequestHeader("If-Modified-Since", jQuery.lastModified[s.url]);
                }
                if (jQuery.etag[s.url]) {
                    xhr.setRequestHeader("If-None-Match", jQuery.etag[s.url]);
                }
            }
            if (!remote) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            }
            xhr.setRequestHeader("Accept", s.dataType && s.accepts[s.dataType] ? s.accepts[s.dataType] + ", */*; q=0.01" : s.accepts._default);
        } catch (headerError) {
        }
        if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
            if (s.global && jQuery.active-- === 1) {
                jQuery.event.trigger("ajaxStop");
            }
            xhr.abort();
            return false;
        }
        if (s.global) {
            jQuery.triggerGlobal(s, "ajaxSend", [xhr, s]);
        }
        var onreadystatechange = xhr.onreadystatechange = function (isTimeout) {
            if (!xhr || xhr.readyState === 0 || isTimeout === "abort") {
                if (!requestDone) {
                    jQuery.handleComplete(s, xhr, status, data);
                }
                requestDone = true;
                if (xhr) {
                    xhr.onreadystatechange = jQuery.noop;
                }
            } else if (!requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout")) {
                requestDone = true;
                xhr.onreadystatechange = jQuery.noop;
                status = isTimeout === "timeout" ? "timeout" : !jQuery.httpSuccess(xhr) ? "error" : s.ifModified && jQuery.httpNotModified(xhr, s.url) ? "notmodified" : "success";
                var errMsg;
                if (status === "success") {
                    try {
                        data = jQuery.httpData(xhr, s.dataType, s);
                    } catch (parserError) {
                        status = "parsererror";
                        errMsg = parserError;
                    }
                }
                if (status === "success" || status === "notmodified") {
                    if (!jsonp) {
                        jQuery.handleSuccess(s, xhr, status, data);
                    }
                } else {
                    jQuery.handleError(s, xhr, status, errMsg);
                }
                if (!jsonp) {
                    jQuery.handleComplete(s, xhr, status, data);
                }
                if (isTimeout === "timeout") {
                    xhr.abort();
                }
                if (s.async) {
                    xhr = null;
                }
            }
        };
        try {
            var oldAbort = xhr.abort;
            xhr.abort = function () {
                if (xhr) {
                    Function.prototype.call.call(oldAbort, xhr);
                }
                onreadystatechange("abort");
            };
        } catch (abortError) {
        }
        if (s.async && s.timeout > 0) {
            setTimeout(function () {
                if (xhr && !requestDone) {
                    onreadystatechange("timeout");
                }
            }, s.timeout);
        }
        try {
            xhr.send(noContent || s.data == null ? null : s.data);
        } catch (sendError) {
            jQuery.handleError(s, xhr, null, sendError);
            jQuery.handleComplete(s, xhr, status, data);
        }
        if (!s.async) {
            onreadystatechange();
        }
        return xhr;
    }, param: function (a, traditional) {
        var s = [], add = function (key, value) {
            value = jQuery.isFunction(value) ? value() : value;
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };
        if (traditional === undefined) {
            traditional = jQuery.ajaxSettings.traditional;
        }
        if (jQuery.isArray(a) || a.jquery) {
            jQuery.each(a, function () {
                add(this.name, this.value);
            });
        } else {
            for (var prefix in a) {
                buildParams(prefix, a[prefix], traditional, add);
            }
        }
        return s.join("&").replace(r20, "+");
    }});
    function buildParams(prefix, obj, traditional, add) {
        if (jQuery.isArray(obj) && obj.length) {
            jQuery.each(obj, function (i, v) {
                if (traditional || rbracket.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + "[" + (typeof v === "object" || jQuery.isArray(v) ? i : "") + "]", v, traditional, add);
                }
            });
        } else if (!traditional && obj != null && typeof obj === "object") {
            if (jQuery.isEmptyObject(obj)) {
                add(prefix, "");
            } else {
                jQuery.each(obj, function (k, v) {
                    buildParams(prefix + "[" + k + "]", v, traditional, add);
                });
            }
        } else {
            add(prefix, obj);
        }
    }

    jQuery.extend({active: 0, lastModified: {}, etag: {}, handleError: function (s, xhr, status, e) {
        if (s.error) {
            s.error.call(s.context, xhr, status, e);
        }
        if (s.global) {
            jQuery.triggerGlobal(s, "ajaxError", [xhr, s, e]);
        }
    }, handleSuccess: function (s, xhr, status, data) {
        if (s.success) {
            s.success.call(s.context, data, status, xhr);
        }
        if (s.global) {
            jQuery.triggerGlobal(s, "ajaxSuccess", [xhr, s]);
        }
    }, handleComplete: function (s, xhr, status) {
        if (s.complete) {
            s.complete.call(s.context, xhr, status);
        }
        if (s.global) {
            jQuery.triggerGlobal(s, "ajaxComplete", [xhr, s]);
        }
        if (s.global && jQuery.active-- === 1) {
            jQuery.event.trigger("ajaxStop");
        }
    }, triggerGlobal: function (s, type, args) {
        (s.context && s.context.url == null ? jQuery(s.context) : jQuery.event).trigger(type, args);
    }, httpSuccess: function (xhr) {
        try {
            return!xhr.status && location.protocol === "file:" || xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 1223;
        } catch (e) {
        }
        return false;
    }, httpNotModified: function (xhr, url) {
        var lastModified = xhr.getResponseHeader("Last-Modified"), etag = xhr.getResponseHeader("Etag");
        if (lastModified) {
            jQuery.lastModified[url] = lastModified;
        }
        if (etag) {
            jQuery.etag[url] = etag;
        }
        return xhr.status === 304;
    }, httpData: function (xhr, type, s) {
        var ct = xhr.getResponseHeader("content-type") || "", xml = type === "xml" || !type && ct.indexOf("xml") >= 0, data = xml ? xhr.responseXML : xhr.responseText;
        if (xml && data.documentElement.nodeName === "parsererror") {
            jQuery.error("parsererror");
        }
        if (s && s.dataFilter) {
            data = s.dataFilter(data, type);
        }
        if (typeof data === "string") {
            if (type === "json" || !type && ct.indexOf("json") >= 0) {
                data = jQuery.parseJSON(data);
            } else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                jQuery.globalEval(data);
            }
        }
        return data;
    }});
    if (window.ActiveXObject) {
        jQuery.ajaxSettings.xhr = function () {
            if (window.location.protocol !== "file:") {
                try {
                    return new window.XMLHttpRequest();
                } catch (xhrError) {
                }
            }
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } catch (activeError) {
            }
        };
    }
    jQuery.support.ajax = !!jQuery.ajaxSettings.xhr();
    var elemdisplay = {}, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = /^([+\-]=)?([\d+.\-]+)(.*)$/, timerId, fxAttrs = [
        ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
        ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
        ["opacity"]
    ];
    jQuery.fn.extend({show: function (speed, easing, callback) {
        var elem, display;
        if (speed || speed === 0) {
            return this.animate(genFx("show", 3), speed, easing, callback);
        } else {
            for (var i = 0, j = this.length; i < j; i++) {
                elem = this[i];
                display = elem.style.display;
                if (!jQuery.data(elem, "olddisplay") && display === "none") {
                    display = elem.style.display = "";
                }
                if (display === "" && jQuery.css(elem, "display") === "none") {
                    jQuery.data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                }
            }
            for (i = 0; i < j; i++) {
                elem = this[i];
                display = elem.style.display;
                if (display === "" || display === "none") {
                    elem.style.display = jQuery.data(elem, "olddisplay") || "";
                }
            }
            return this;
        }
    }, hide: function (speed, easing, callback) {
        if (speed || speed === 0) {
            return this.animate(genFx("hide", 3), speed, easing, callback);
        } else {
            for (var i = 0, j = this.length; i < j; i++) {
                var display = jQuery.css(this[i], "display");
                if (display !== "none") {
                    jQuery.data(this[i], "olddisplay", display);
                }
            }
            for (i = 0; i < j; i++) {
                this[i].style.display = "none";
            }
            return this;
        }
    }, _toggle: jQuery.fn.toggle, toggle: function (fn, fn2, callback) {
        var bool = typeof fn === "boolean";
        if (jQuery.isFunction(fn) && jQuery.isFunction(fn2)) {
            this._toggle.apply(this, arguments);
        } else if (fn == null || bool) {
            this.each(function () {
                var state = bool ? fn : jQuery(this).is(":hidden");
                jQuery(this)[state ? "show" : "hide"]();
            });
        } else {
            this.animate(genFx("toggle", 3), fn, fn2, callback);
        }
        return this;
    }, fadeTo: function (speed, to, easing, callback) {
        return this.filter(":hidden").css("opacity", 0).show().end().animate({opacity: to}, speed, easing, callback);
    }, animate: function (prop, speed, easing, callback) {
        var optall = jQuery.speed(speed, easing, callback);
        if (jQuery.isEmptyObject(prop)) {
            return this.each(optall.complete);
        }
        return this[optall.queue === false ? "each" : "queue"](function () {
            var opt = jQuery.extend({}, optall), p, isElement = this.nodeType === 1, hidden = isElement && jQuery(this).is(":hidden"), self = this;
            for (p in prop) {
                var name = jQuery.camelCase(p);
                if (p !== name) {
                    prop[name] = prop[p];
                    delete prop[p];
                    p = name;
                }
                if (prop[p] === "hide" && hidden || prop[p] === "show" && !hidden) {
                    return opt.complete.call(this);
                }
                if (isElement && (p === "height" || p === "width")) {
                    opt.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];
                    if (jQuery.css(this, "display") === "inline" && jQuery.css(this, "float") === "none") {
                        if (!jQuery.support.inlineBlockNeedsLayout) {
                            this.style.display = "inline-block";
                        } else {
                            var display = defaultDisplay(this.nodeName);
                            if (display === "inline") {
                                this.style.display = "inline-block";
                            } else {
                                this.style.display = "inline";
                                this.style.zoom = 1;
                            }
                        }
                    }
                }
                if (jQuery.isArray(prop[p])) {
                    (opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
                    prop[p] = prop[p][0];
                }
            }
            if (opt.overflow != null) {
                this.style.overflow = "hidden";
            }
            opt.curAnim = jQuery.extend({}, prop);
            jQuery.each(prop, function (name, val) {
                var e = new jQuery.fx(self, opt, name);
                if (rfxtypes.test(val)) {
                    e[val === "toggle" ? hidden ? "show" : "hide" : val](prop);
                } else {
                    var parts = rfxnum.exec(val), start = e.cur() || 0;
                    if (parts) {
                        var end = parseFloat(parts[2]), unit = parts[3] || "px";
                        if (unit !== "px") {
                            jQuery.style(self, name, (end || 1) + unit);
                            start = ((end || 1) / e.cur()) * start;
                            jQuery.style(self, name, start + unit);
                        }
                        if (parts[1]) {
                            end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
                        }
                        e.custom(start, end, unit);
                    } else {
                        e.custom(start, val, "");
                    }
                }
            });
            return true;
        });
    }, stop: function (clearQueue, gotoEnd) {
        var timers = jQuery.timers;
        if (clearQueue) {
            this.queue([]);
        }
        this.each(function () {
            for (var i = timers.length - 1; i >= 0; i--) {
                if (timers[i].elem === this) {
                    if (gotoEnd) {
                        timers[i](true);
                    }
                    timers.splice(i, 1);
                }
            }
        });
        if (!gotoEnd) {
            this.dequeue();
        }
        return this;
    }});
    function genFx(type, num) {
        var obj = {};
        jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function () {
            obj[this] = type;
        });
        return obj;
    }

    jQuery.each({slideDown: genFx("show", 1), slideUp: genFx("hide", 1), slideToggle: genFx("toggle", 1), fadeIn: {opacity: "show"}, fadeOut: {opacity: "hide"}, fadeToggle: {opacity: "toggle"}}, function (name, props) {
        jQuery.fn[name] = function (speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
        };
    });
    jQuery.extend({speed: function (speed, easing, fn) {
        var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {complete: fn || !fn && easing || jQuery.isFunction(speed) && speed, duration: speed, easing: fn && easing || easing && !jQuery.isFunction(easing) && easing};
        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
        opt.old = opt.complete;
        opt.complete = function () {
            if (opt.queue !== false) {
                jQuery(this).dequeue();
            }
            if (jQuery.isFunction(opt.old)) {
                opt.old.call(this);
            }
        };
        return opt;
    }, easing: {linear: function (p, n, firstNum, diff) {
        return firstNum + diff * p;
    }, swing: function (p, n, firstNum, diff) {
        return((-Math.cos(p * Math.PI) / 2) + 0.5) * diff + firstNum;
    }}, timers: [], fx: function (elem, options, prop) {
        this.options = options;
        this.elem = elem;
        this.prop = prop;
        if (!options.orig) {
            options.orig = {};
        }
    }});
    jQuery.fx.prototype = {update: function () {
        if (this.options.step) {
            this.options.step.call(this.elem, this.now, this);
        }
        (jQuery.fx.step[this.prop] || jQuery.fx.step._default)(this);
    }, cur: function () {
        if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
            return this.elem[this.prop];
        }
        var r = parseFloat(jQuery.css(this.elem, this.prop));
        return r && r > -10000 ? r : 0;
    }, custom: function (from, to, unit) {
        var self = this, fx = jQuery.fx;
        this.startTime = jQuery.now();
        this.start = from;
        this.end = to;
        this.unit = unit || this.unit || "px";
        this.now = this.start;
        this.pos = this.state = 0;
        function t(gotoEnd) {
            return self.step(gotoEnd);
        }

        t.elem = this.elem;
        if (t() && jQuery.timers.push(t) && !timerId) {
            timerId = setInterval(fx.tick, fx.interval);
        }
    }, show: function () {
        this.options.orig[this.prop] = jQuery.style(this.elem, this.prop);
        this.options.show = true;
        this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
        jQuery(this.elem).show();
    }, hide: function () {
        this.options.orig[this.prop] = jQuery.style(this.elem, this.prop);
        this.options.hide = true;
        this.custom(this.cur(), 0);
    }, step: function (gotoEnd) {
        var t = jQuery.now(), done = true;
        if (gotoEnd || t >= this.options.duration + this.startTime) {
            this.now = this.end;
            this.pos = this.state = 1;
            this.update();
            this.options.curAnim[this.prop] = true;
            for (var i in this.options.curAnim) {
                if (this.options.curAnim[i] !== true) {
                    done = false;
                }
            }
            if (done) {
                if (this.options.overflow != null && !jQuery.support.shrinkWrapBlocks) {
                    var elem = this.elem, options = this.options;
                    jQuery.each(["", "X", "Y"], function (index, value) {
                        elem.style["overflow" + value] = options.overflow[index];
                    });
                }
                if (this.options.hide) {
                    jQuery(this.elem).hide();
                }
                if (this.options.hide || this.options.show) {
                    for (var p in this.options.curAnim) {
                        jQuery.style(this.elem, p, this.options.orig[p]);
                    }
                }
                this.options.complete.call(this.elem);
            }
            return false;
        } else {
            var n = t - this.startTime;
            this.state = n / this.options.duration;
            var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
            var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");
            this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
            this.now = this.start + ((this.end - this.start) * this.pos);
            this.update();
        }
        return true;
    }};
    jQuery.extend(jQuery.fx, {tick: function () {
        var timers = jQuery.timers;
        for (var i = 0; i < timers.length; i++) {
            if (!timers[i]()) {
                timers.splice(i--, 1);
            }
        }
        if (!timers.length) {
            jQuery.fx.stop();
        }
    }, interval: 13, stop: function () {
        clearInterval(timerId);
        timerId = null;
    }, speeds: {slow: 600, fast: 200, _default: 400}, step: {opacity: function (fx) {
        jQuery.style(fx.elem, "opacity", fx.now);
    }, _default: function (fx) {
        if (fx.elem.style && fx.elem.style[fx.prop] != null) {
            fx.elem.style[fx.prop] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
        } else {
            fx.elem[fx.prop] = fx.now;
        }
    }}});
    if (jQuery.expr && jQuery.expr.filters) {
        jQuery.expr.filters.animated = function (elem) {
            return jQuery.grep(jQuery.timers,function (fn) {
                return elem === fn.elem;
            }).length;
        };
    }
    function defaultDisplay(nodeName) {
        if (!elemdisplay[nodeName]) {
            var elem = jQuery("<" + nodeName + ">").appendTo("body"), display = elem.css("display");
            elem.remove();
            if (display === "none" || display === "") {
                display = "block";
            }
            elemdisplay[nodeName] = display;
        }
        return elemdisplay[nodeName];
    }

    var rtable = /^t(?:able|d|h)$/i, rroot = /^(?:body|html)$/i;
    if ("getBoundingClientRect"in document.documentElement) {
        jQuery.fn.offset = function (options) {
            var elem = this[0], box;
            if (options) {
                return this.each(function (i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }
            if (!elem || !elem.ownerDocument) {
                return null;
            }
            if (elem === elem.ownerDocument.body) {
                return jQuery.offset.bodyOffset(elem);
            }
            try {
                box = elem.getBoundingClientRect();
            } catch (e) {
            }
            var doc = elem.ownerDocument, docElem = doc.documentElement;
            if (!box || !jQuery.contains(docElem, elem)) {
                return box || {top: 0, left: 0};
            }
            var body = doc.body, win = getWindow(doc), clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0, scrollTop = (win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop), scrollLeft = (win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft), top = box.top + scrollTop - clientTop, left = box.left + scrollLeft - clientLeft;
            return{top: top, left: left};
        };
    } else {
        jQuery.fn.offset = function (options) {
            var elem = this[0];
            if (options) {
                return this.each(function (i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }
            if (!elem || !elem.ownerDocument) {
                return null;
            }
            if (elem === elem.ownerDocument.body) {
                return jQuery.offset.bodyOffset(elem);
            }
            jQuery.offset.initialize();
            var computedStyle, offsetParent = elem.offsetParent, prevOffsetParent = elem, doc = elem.ownerDocument, docElem = doc.documentElement, body = doc.body, defaultView = doc.defaultView, prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle, top = elem.offsetTop, left = elem.offsetLeft;
            while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
                if (jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed") {
                    break;
                }
                computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                top -= elem.scrollTop;
                left -= elem.scrollLeft;
                if (elem === offsetParent) {
                    top += elem.offsetTop;
                    left += elem.offsetLeft;
                    if (jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName))) {
                        top += parseFloat(computedStyle.borderTopWidth) || 0;
                        left += parseFloat(computedStyle.borderLeftWidth) || 0;
                    }
                    prevOffsetParent = offsetParent;
                    offsetParent = elem.offsetParent;
                }
                if (jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
                    top += parseFloat(computedStyle.borderTopWidth) || 0;
                    left += parseFloat(computedStyle.borderLeftWidth) || 0;
                }
                prevComputedStyle = computedStyle;
            }
            if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
                top += body.offsetTop;
                left += body.offsetLeft;
            }
            if (jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed") {
                top += Math.max(docElem.scrollTop, body.scrollTop);
                left += Math.max(docElem.scrollLeft, body.scrollLeft);
            }
            return{top: top, left: left};
        };
    }
    jQuery.offset = {initialize: function () {
        var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat(jQuery.css(body, "marginTop")) || 0, html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
        jQuery.extend(container.style, {position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden"});
        container.innerHTML = html;
        body.insertBefore(container, body.firstChild);
        innerDiv = container.firstChild;
        checkDiv = innerDiv.firstChild;
        td = innerDiv.nextSibling.firstChild.firstChild;
        this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
        this.doesAddBorderForTableAndCells = (td.offsetTop === 5);
        checkDiv.style.position = "fixed";
        checkDiv.style.top = "20px";
        this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
        checkDiv.style.position = checkDiv.style.top = "";
        innerDiv.style.overflow = "hidden";
        innerDiv.style.position = "relative";
        this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);
        this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);
        body.removeChild(container);
        body = container = innerDiv = checkDiv = table = td = null;
        jQuery.offset.initialize = jQuery.noop;
    }, bodyOffset: function (body) {
        var top = body.offsetTop, left = body.offsetLeft;
        jQuery.offset.initialize();
        if (jQuery.offset.doesNotIncludeMarginInBodyOffset) {
            top += parseFloat(jQuery.css(body, "marginTop")) || 0;
            left += parseFloat(jQuery.css(body, "marginLeft")) || 0;
        }
        return{top: top, left: left};
    }, setOffset: function (elem, options, i) {
        var position = jQuery.css(elem, "position");
        if (position === "static") {
            elem.style.position = "relative";
        }
        var curElem = jQuery(elem), curOffset = curElem.offset(), curCSSTop = jQuery.css(elem, "top"), curCSSLeft = jQuery.css(elem, "left"), calculatePosition = (position === "absolute" && jQuery.inArray('auto', [curCSSTop, curCSSLeft]) > -1), props = {}, curPosition = {}, curTop, curLeft;
        if (calculatePosition) {
            curPosition = curElem.position();
        }
        curTop = calculatePosition ? curPosition.top : parseInt(curCSSTop, 10) || 0;
        curLeft = calculatePosition ? curPosition.left : parseInt(curCSSLeft, 10) || 0;
        if (jQuery.isFunction(options)) {
            options = options.call(elem, i, curOffset);
        }
        if (options.top != null) {
            props.top = (options.top - curOffset.top) + curTop;
        }
        if (options.left != null) {
            props.left = (options.left - curOffset.left) + curLeft;
        }
        if ("using"in options) {
            options.using.call(elem, props);
        } else {
            curElem.css(props);
        }
    }};
    jQuery.fn.extend({position: function () {
        if (!this[0]) {
            return null;
        }
        var elem = this[0], offsetParent = this.offsetParent(), offset = this.offset(), parentOffset = rroot.test(offsetParent[0].nodeName) ? {top: 0, left: 0} : offsetParent.offset();
        offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
        offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;
        parentOffset.top += parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0;
        parentOffset.left += parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0;
        return{top: offset.top - parentOffset.top, left: offset.left - parentOffset.left};
    }, offsetParent: function () {
        return this.map(function () {
            var offsetParent = this.offsetParent || document.body;
            while (offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static")) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent;
        });
    }});
    jQuery.each(["Left", "Top"], function (i, name) {
        var method = "scroll" + name;
        jQuery.fn[method] = function (val) {
            var elem = this[0], win;
            if (!elem) {
                return null;
            }
            if (val !== undefined) {
                return this.each(function () {
                    win = getWindow(this);
                    if (win) {
                        win.scrollTo(!i ? val : jQuery(win).scrollLeft(), i ? val : jQuery(win).scrollTop());
                    } else {
                        this[method] = val;
                    }
                });
            } else {
                win = getWindow(elem);
                return win ? ("pageXOffset"in win) ? win[i ? "pageYOffset" : "pageXOffset"] : jQuery.support.boxModel && win.document.documentElement[method] || win.document.body[method] : elem[method];
            }
        };
    });
    function getWindow(elem) {
        return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
    }

    jQuery.each(["Height", "Width"], function (i, name) {
        var type = name.toLowerCase();
        jQuery.fn["inner" + name] = function () {
            return this[0] ? parseFloat(jQuery.css(this[0], type, "padding")) : null;
        };
        jQuery.fn["outer" + name] = function (margin) {
            return this[0] ? parseFloat(jQuery.css(this[0], type, margin ? "margin" : "border")) : null;
        };
        jQuery.fn[type] = function (size) {
            var elem = this[0];
            if (!elem) {
                return size == null ? null : this;
            }
            if (jQuery.isFunction(size)) {
                return this.each(function (i) {
                    var self = jQuery(this);
                    self[type](size.call(this, i, self[type]()));
                });
            }
            if (jQuery.isWindow(elem)) {
                return elem.document.compatMode === "CSS1Compat" && elem.document.documentElement["client" + name] || elem.document.body["client" + name];
            } else if (elem.nodeType === 9) {
                return Math.max(elem.documentElement["client" + name], elem.body["scroll" + name], elem.documentElement["scroll" + name], elem.body["offset" + name], elem.documentElement["offset" + name]);
            } else if (size === undefined) {
                var orig = jQuery.css(elem, type), ret = parseFloat(orig);
                return jQuery.isNaN(ret) ? orig : ret;
            } else {
                return this.css(type, typeof size === "string" ? size : size + "px");
            }
        };
    });
})(window);
String.prototype.parseColor = function () {
    var color = '#';
    if (this.slice(0, 4) == 'rgb(') {
        var cols = this.slice(4, this.length - 1).split(',');
        var i = 0;
        do {
            color += parseInt(cols[i]).toColorPart()
        } while (++i < 3);
    } else {
        if (this.slice(0, 1) == '#') {
            if (this.length == 4)for (var i = 1; i < 4; i++)color += (this.charAt(i) + this.charAt(i)).toLowerCase();
            if (this.length == 7)color = this.toLowerCase();
        }
    }
    return(color.length == 7 ? color : (arguments[0] || this));
};
Element.collectTextNodes = function (element) {
    return $A($(element).childNodes).collect(function (node) {
        return(node.nodeType == 3 ? node.nodeValue : (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
    }).flatten().join('');
};
Element.collectTextNodesIgnoreClass = function (element, className) {
    return $A($(element).childNodes).collect(function (node) {
        return(node.nodeType == 3 ? node.nodeValue : ((node.hasChildNodes() && !Element.hasClassName(node, className)) ? Element.collectTextNodesIgnoreClass(node, className) : ''));
    }).flatten().join('');
};
Element.setContentZoom = function (element, percent) {
    element = $(element);
    element.setStyle({fontSize: (percent / 100) + 'em'});
    if (Prototype.Browser.WebKit)window.scrollBy(0, 0);
    return element;
};
Element.getInlineOpacity = function (element) {
    return $(element).style.opacity || '';
};
Element.forceRerendering = function (element) {
    try {
        element = $(element);
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
    } catch (e) {
    }
};
var Effect = {_elementDoesNotExistError: {name: 'ElementDoesNotExistError', message: 'The specified DOM element does not exist, but is required for this effect to operate'}, Transitions: {linear: Prototype.K, sinoidal: function (pos) {
    return(-Math.cos(pos * Math.PI) / 2) + 0.5;
}, reverse: function (pos) {
    return 1 - pos;
}, flicker: function (pos) {
    var pos = ((-Math.cos(pos * Math.PI) / 4) + 0.75) + Math.random() / 4;
    return pos > 1 ? 1 : pos;
}, wobble: function (pos) {
    return(-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
}, pulse: function (pos, pulses) {
    pulses = pulses || 5;
    return(((pos % (1 / pulses)) * pulses).round() == 0 ? ((pos * pulses * 2) - (pos * pulses * 2).floor()) : 1 - ((pos * pulses * 2) - (pos * pulses * 2).floor()));
}, spring: function (pos) {
    return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
}, none: function (pos) {
    return 0;
}, full: function (pos) {
    return 1;
}}, DefaultOptions: {duration: 1.0, fps: 100, sync: false, from: 0.0, to: 1.0, delay: 0.0, queue: 'parallel'}, tagifyText: function (element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE)tagifyStyle += ';zoom:1';
    element = $(element);
    $A(element.childNodes).each(function (child) {
        if (child.nodeType == 3) {
            child.nodeValue.toArray().each(function (character) {
                element.insertBefore(new Element('span', {style: tagifyStyle}).update(character == ' ' ? String.fromCharCode(160) : character), child);
            });
            Element.remove(child);
        }
    });
}, multiple: function (element, effect) {
    var elements;
    if (((typeof element == 'object') || Object.isFunction(element)) && (element.length))
        elements = element; else
        elements = $(element).childNodes;
    var options = Object.extend({speed: 0.1, delay: 0.0}, arguments[2] || {});
    var masterDelay = options.delay;
    $A(elements).each(function (element, index) {
        new effect(element, Object.extend(options, {delay: index * options.speed + masterDelay}));
    });
}, PAIRS: {'slide': ['SlideDown', 'SlideUp'], 'blind': ['BlindDown', 'BlindUp'], 'appear': ['Appear', 'Fade']}, toggle: function (element, effect) {
    element = $(element);
    effect = (effect || 'appear').toLowerCase();
    var options = Object.extend({queue: {position: 'end', scope: (element.id || 'global'), limit: 1}}, arguments[2] || {});
    Effect[element.visible() ? Effect.PAIRS[effect][1] : Effect.PAIRS[effect][0]](element, options);
}};
Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;
Effect.ScopedQueue = Class.create(Enumerable, {initialize: function () {
    this.effects = [];
    this.interval = null;
}, _each: function (iterator) {
    this.effects._each(iterator);
}, add: function (effect) {
    var timestamp = new Date().getTime();
    var position = Object.isString(effect.options.queue) ? effect.options.queue : effect.options.queue.position;
    switch (position) {
        case'front':
            this.effects.findAll(function (e) {
                return e.state == 'idle'
            }).each(function (e) {
                e.startOn += effect.finishOn;
                e.finishOn += effect.finishOn;
            });
            break;
        case'with-last':
            timestamp = this.effects.pluck('startOn').max() || timestamp;
            break;
        case'end':
            timestamp = this.effects.pluck('finishOn').max() || timestamp;
            break;
    }
    effect.startOn += timestamp;
    effect.finishOn += timestamp;
    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
        this.effects.push(effect);
    if (!this.interval)
        this.interval = setInterval(this.loop.bind(this), 15);
}, remove: function (effect) {
    this.effects = this.effects.reject(function (e) {
        return e == effect
    });
    if (this.effects.length == 0) {
        clearInterval(this.interval);
        this.interval = null;
    }
}, loop: function () {
    var timePos = new Date().getTime();
    for (var i = 0, len = this.effects.length; i < len; i++)
        this.effects[i] && this.effects[i].loop(timePos);
}});
Effect.Queues = {instances: $H(), get: function (queueName) {
    if (!Object.isString(queueName))return queueName;
    return this.instances.get(queueName) || this.instances.set(queueName, new Effect.ScopedQueue());
}};
Effect.Queue = Effect.Queues.get('global');
Effect.Base = Class.create({position: null, start: function (options) {
    function codeForEvent(options, eventName) {
        return((options[eventName + 'Internal'] ? 'this.options.' + eventName + 'Internal(this);' : '') +
            (options[eventName] ? 'this.options.' + eventName + '(this);' : ''));
    }

    if (options && options.transition === false)options.transition = Effect.Transitions.linear;
    this.options = Object.extend(Object.extend({}, Effect.DefaultOptions), options || {});
    this.currentFrame = 0;
    this.state = 'idle';
    this.startOn = this.options.delay * 1000;
    this.finishOn = this.startOn + (this.options.duration * 1000);
    this.fromToDelta = this.options.to - this.options.from;
    this.totalTime = this.finishOn - this.startOn;
    this.totalFrames = this.options.fps * this.options.duration;
    eval('this.render = function(pos){ ' + 'if (this.state=="idle"){this.state="running";' +
        codeForEvent(this.options, 'beforeSetup') +
        (this.setup ? 'this.setup();' : '') +
        codeForEvent(this.options, 'afterSetup') + '};if (this.state=="running"){' + 'pos=this.options.transition(pos)*' + this.fromToDelta + '+' + this.options.from + ';' + 'this.position=pos;' +
        codeForEvent(this.options, 'beforeUpdate') +
        (this.update ? 'this.update(pos);' : '') +
        codeForEvent(this.options, 'afterUpdate') + '}}');
    this.event('beforeStart');
    if (!this.options.sync)
        Effect.Queues.get(Object.isString(this.options.queue) ? 'global' : this.options.queue.scope).add(this);
}, loop: function (timePos) {
    if (timePos >= this.startOn) {
        if (timePos >= this.finishOn) {
            this.render(1.0);
            this.cancel();
            this.event('beforeFinish');
            if (this.finish)this.finish();
            this.event('afterFinish');
            return;
        }
        var pos = (timePos - this.startOn) / this.totalTime, frame = (pos * this.totalFrames).round();
        if (frame > this.currentFrame) {
            this.render(pos);
            this.currentFrame = frame;
        }
    }
}, cancel: function () {
    if (!this.options.sync)
        Effect.Queues.get(Object.isString(this.options.queue) ? 'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
}, event: function (eventName) {
    if (this.options[eventName + 'Internal'])this.options[eventName + 'Internal'](this);
    if (this.options[eventName])this.options[eventName](this);
}, inspect: function () {
    var data = $H();
    for (property in this)
        if (!Object.isFunction(this[property]))data.set(property, this[property]);
    return'#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
}});
Effect.Parallel = Class.create(Effect.Base, {initialize: function (effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
}, update: function (position) {
    this.effects.invoke('render', position);
}, finish: function (position) {
    this.effects.each(function (effect) {
        effect.render(1.0);
        effect.cancel();
        effect.event('beforeFinish');
        if (effect.finish)effect.finish(position);
        effect.event('afterFinish');
    });
}});
Effect.Tween = Class.create(Effect.Base, {initialize: function (object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(), options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) : Object.isFunction(object[method]) ? object[method].bind(object) : function (value) {
        object[method] = value
    };
    this.start(Object.extend({from: from, to: to}, options || {}));
}, update: function (position) {
    this.method(position);
}});
Effect.Event = Class.create(Effect.Base, {initialize: function () {
    this.start(Object.extend({duration: 0}, arguments[0] || {}));
}, update: Prototype.emptyFunction});
Effect.Opacity = Class.create(Effect.Base, {initialize: function (element) {
    this.element = $(element);
    if (!this.element)throw(Effect._elementDoesNotExistError);
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
        this.element.setStyle({zoom: 1});
    var options = Object.extend({from: this.element.getOpacity() || 0.0, to: 1.0}, arguments[1] || {});
    this.start(options);
}, update: function (position) {
    this.element.setOpacity(position);
}});
Effect.Move = Class.create(Effect.Base, {initialize: function (element) {
    this.element = $(element);
    if (!this.element)throw(Effect._elementDoesNotExistError);
    var options = Object.extend({x: 0, y: 0, mode: 'relative'}, arguments[1] || {});
    this.start(options);
}, setup: function () {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop = parseFloat(this.element.getStyle('top') || '0');
    if (this.options.mode == 'absolute') {
        this.options.x = this.options.x - this.originalLeft;
        this.options.y = this.options.y - this.originalTop;
    }
}, update: function (position) {
    this.element.setStyle({left: (this.options.x * position + this.originalLeft).round() + 'px', top: (this.options.y * position + this.originalTop).round() + 'px'});
}});
Effect.MoveBy = function (element, toTop, toLeft) {
    return new Effect.Move(element, Object.extend({x: toLeft, y: toTop}, arguments[3] || {}));
};
Effect.Scale = Class.create(Effect.Base, {initialize: function (element, percent) {
    this.element = $(element);
    if (!this.element)throw(Effect._elementDoesNotExistError);
    var options = Object.extend({scaleX: true, scaleY: true, scaleContent: true, scaleFromCenter: false, scaleMode: 'box', scaleFrom: 100.0, scaleTo: percent}, arguments[2] || {});
    this.start(options);
}, setup: function () {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');
    this.originalStyle = {};
    ['top', 'left', 'width', 'height', 'fontSize'].each(function (k) {
        this.originalStyle[k] = this.element.style[k];
    }.bind(this));
    this.originalTop = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;
    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em', 'px', '%', 'pt'].each(function (fontSizeType) {
        if (fontSize.indexOf(fontSizeType) > 0) {
            this.fontSize = parseFloat(fontSize);
            this.fontSizeType = fontSizeType;
        }
    }.bind(this));
    this.factor = (this.options.scaleTo - this.options.scaleFrom) / 100;
    this.dims = null;
    if (this.options.scaleMode == 'box')
        this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
        this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
        this.dims = [this.options.scaleMode.originalHeight, this.options.scaleMode.originalWidth];
}, update: function (position) {
    var currentScale = (this.options.scaleFrom / 100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
        this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType});
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
}, finish: function (position) {
    if (this.restoreAfterFinish)this.element.setStyle(this.originalStyle);
}, setDimensions: function (height, width) {
    var d = {};
    if (this.options.scaleX)d.width = width.round() + 'px';
    if (this.options.scaleY)d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
        var topd = (height - this.dims[0]) / 2;
        var leftd = (width - this.dims[1]) / 2;
        if (this.elementPositioning == 'absolute') {
            if (this.options.scaleY)d.top = this.originalTop - topd + 'px';
            if (this.options.scaleX)d.left = this.originalLeft - leftd + 'px';
        } else {
            if (this.options.scaleY)d.top = -topd + 'px';
            if (this.options.scaleX)d.left = -leftd + 'px';
        }
    }
    this.element.setStyle(d);
}});
Effect.Highlight = Class.create(Effect.Base, {initialize: function (element) {
    this.element = $(element);
    if (!this.element)throw(Effect._elementDoesNotExistError);
    var options = Object.extend({startcolor: '#ffff99'}, arguments[1] || {});
    this.start(options);
}, setup: function () {
    if (this.element.getStyle('display') == 'none') {
        this.cancel();
        return;
    }
    this.oldStyle = {};
    if (!this.options.keepBackgroundImage) {
        this.oldStyle.backgroundImage = this.element.getStyle('background-image');
        this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
        this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
        this.options.restorecolor = this.element.getStyle('background-color');
    this._base = $R(0, 2).map(function (i) {
        return parseInt(this.options.startcolor.slice(i * 2 + 1, i * 2 + 3), 16)
    }.bind(this));
    this._delta = $R(0, 2).map(function (i) {
        return parseInt(this.options.endcolor.slice(i * 2 + 1, i * 2 + 3), 16) - this._base[i]
    }.bind(this));
}, update: function (position) {
    this.element.setStyle({backgroundColor: $R(0, 2).inject('#', function (m, v, i) {
        return m + ((this._base[i] + (this._delta[i] * position)).round().toColorPart());
    }.bind(this))});
}, finish: function () {
    this.element.setStyle(Object.extend(this.oldStyle, {backgroundColor: this.options.restorecolor}));
}});
Effect.ScrollTo = function (element) {
    var options = arguments[1] || {}, scrollOffsets = document.viewport.getScrollOffsets(), elementOffsets = $(element).cumulativeOffset(), max = (window.height || document.body.scrollHeight) - document.viewport.getHeight();
    if (options.offset)elementOffsets[1] += options.offset;
    return new Effect.Tween(null, scrollOffsets.top, elementOffsets[1] > max ? max : elementOffsets[1], options, function (p) {
        scrollTo(scrollOffsets.left, p.round())
    });
};
Effect.Fade = function (element) {
    element = $(element);
    var oldOpacity = element.getInlineOpacity();
    var options = Object.extend({from: element.getOpacity() || 1.0, to: 0.0, afterFinishInternal: function (effect) {
        if (effect.options.to != 0)return;
        effect.element.hide().setStyle({opacity: oldOpacity});
    }}, arguments[1] || {});
    return new Effect.Opacity(element, options);
};
Effect.Appear = function (element) {
    element = $(element);
    var options = Object.extend({from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0), to: 1.0, afterFinishInternal: function (effect) {
        effect.element.forceRerendering();
    }, beforeSetup: function (effect) {
        effect.element.setOpacity(effect.options.from).show();
    }}, arguments[1] || {});
    return new Effect.Opacity(element, options);
};
Effect.Puff = function (element) {
    element = $(element);
    var oldStyle = {opacity: element.getInlineOpacity(), position: element.getStyle('position'), top: element.style.top, left: element.style.left, width: element.style.width, height: element.style.height};
    return new Effect.Parallel([new Effect.Scale(element, 200, {sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true}), new Effect.Opacity(element, {sync: true, to: 0.0})], Object.extend({duration: 1.0, beforeSetupInternal: function (effect) {
        Position.absolutize(effect.effects[0].element)
    }, afterFinishInternal: function (effect) {
        effect.effects[0].element.hide().setStyle(oldStyle);
    }}, arguments[1] || {}));
};
Effect.BlindUp = function (element) {
    element = $(element);
    element.makeClipping();
    return new Effect.Scale(element, 0, Object.extend({scaleContent: false, scaleX: false, restoreAfterFinish: true, afterFinishInternal: function (effect) {
        effect.element.hide().undoClipping();
    }}, arguments[1] || {}));
};
Effect.BlindDown = function (element) {
    element = $(element);
    var elementDimensions = element.getDimensions();
    return new Effect.Scale(element, 100, Object.extend({scaleContent: false, scaleX: false, scaleFrom: 0, scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width}, restoreAfterFinish: true, afterSetup: function (effect) {
        effect.element.makeClipping().setStyle({height: '0px'}).show();
    }, afterFinishInternal: function (effect) {
        effect.element.undoClipping();
    }}, arguments[1] || {}));
};
Effect.SwitchOff = function (element) {
    element = $(element);
    var oldOpacity = element.getInlineOpacity();
    return new Effect.Appear(element, Object.extend({duration: 0.4, from: 0, transition: Effect.Transitions.flicker, afterFinishInternal: function (effect) {
        new Effect.Scale(effect.element, 1, {duration: 0.3, scaleFromCenter: true, scaleX: false, scaleContent: false, restoreAfterFinish: true, beforeSetup: function (effect) {
            effect.element.makePositioned().makeClipping();
        }, afterFinishInternal: function (effect) {
            effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }})
    }}, arguments[1] || {}));
};
Effect.DropOut = function (element) {
    element = $(element);
    var oldStyle = {top: element.getStyle('top'), left: element.getStyle('left'), opacity: element.getInlineOpacity()};
    return new Effect.Parallel([new Effect.Move(element, {x: 0, y: 100, sync: true}), new Effect.Opacity(element, {sync: true, to: 0.0})], Object.extend({duration: 0.5, beforeSetup: function (effect) {
        effect.effects[0].element.makePositioned();
    }, afterFinishInternal: function (effect) {
        effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
    }}, arguments[1] || {}));
};
Effect.Shake = function (element) {
    element = $(element);
    var options = Object.extend({distance: 20, duration: 0.5}, arguments[1] || {});
    var distance = parseFloat(options.distance);
    var split = parseFloat(options.duration) / 10.0;
    var oldStyle = {top: element.getStyle('top'), left: element.getStyle('left')};
    return new Effect.Move(element, {x: distance, y: 0, duration: split, afterFinishInternal: function (effect) {
        new Effect.Move(effect.element, {x: -distance * 2, y: 0, duration: split * 2, afterFinishInternal: function (effect) {
            new Effect.Move(effect.element, {x: distance * 2, y: 0, duration: split * 2, afterFinishInternal: function (effect) {
                new Effect.Move(effect.element, {x: -distance * 2, y: 0, duration: split * 2, afterFinishInternal: function (effect) {
                    new Effect.Move(effect.element, {x: distance * 2, y: 0, duration: split * 2, afterFinishInternal: function (effect) {
                        new Effect.Move(effect.element, {x: -distance, y: 0, duration: split, afterFinishInternal: function (effect) {
                            effect.element.undoPositioned().setStyle(oldStyle);
                        }})
                    }})
                }})
            }})
        }})
    }});
};
Effect.SlideDown = function (element) {
    element = $(element).cleanWhitespace();
    var oldInnerBottom = element.down().getStyle('bottom');
    var elementDimensions = element.getDimensions();
    return new Effect.Scale(element, 100, Object.extend({scaleContent: false, scaleX: false, scaleFrom: window.opera ? 0 : 1, scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width}, restoreAfterFinish: true, afterSetup: function (effect) {
        effect.element.makePositioned();
        effect.element.down().makePositioned();
        if (window.opera)effect.element.setStyle({top: ''});
        effect.element.makeClipping().setStyle({height: '0px'}).show();
    }, afterUpdateInternal: function (effect) {
        effect.element.down().setStyle({bottom: (effect.dims[0] - effect.element.clientHeight) + 'px'});
    }, afterFinishInternal: function (effect) {
        effect.element.undoClipping().undoPositioned();
        effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }}, arguments[1] || {}));
};
Effect.SlideUp = function (element) {
    element = $(element).cleanWhitespace();
    var oldInnerBottom = element.down().getStyle('bottom');
    var elementDimensions = element.getDimensions();
    return new Effect.Scale(element, window.opera ? 0 : 1, Object.extend({scaleContent: false, scaleX: false, scaleMode: 'box', scaleFrom: 100, scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width}, restoreAfterFinish: true, afterSetup: function (effect) {
        effect.element.makePositioned();
        effect.element.down().makePositioned();
        if (window.opera)effect.element.setStyle({top: ''});
        effect.element.makeClipping().show();
    }, afterUpdateInternal: function (effect) {
        effect.element.down().setStyle({bottom: (effect.dims[0] - effect.element.clientHeight) + 'px'});
    }, afterFinishInternal: function (effect) {
        effect.element.hide().undoClipping().undoPositioned();
        effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }}, arguments[1] || {}));
};
Effect.Squish = function (element) {
    return new Effect.Scale(element, window.opera ? 1 : 0, {restoreAfterFinish: true, beforeSetup: function (effect) {
        effect.element.makeClipping();
    }, afterFinishInternal: function (effect) {
        effect.element.hide().undoClipping();
    }});
};
Effect.Grow = function (element) {
    element = $(element);
    var options = Object.extend({direction: 'center', moveTransition: Effect.Transitions.sinoidal, scaleTransition: Effect.Transitions.sinoidal, opacityTransition: Effect.Transitions.full}, arguments[1] || {});
    var oldStyle = {top: element.style.top, left: element.style.left, height: element.style.height, width: element.style.width, opacity: element.getInlineOpacity()};
    var dims = element.getDimensions();
    var initialMoveX, initialMoveY;
    var moveX, moveY;
    switch (options.direction) {
        case'top-left':
            initialMoveX = initialMoveY = moveX = moveY = 0;
            break;
        case'top-right':
            initialMoveX = dims.width;
            initialMoveY = moveY = 0;
            moveX = -dims.width;
            break;
        case'bottom-left':
            initialMoveX = moveX = 0;
            initialMoveY = dims.height;
            moveY = -dims.height;
            break;
        case'bottom-right':
            initialMoveX = dims.width;
            initialMoveY = dims.height;
            moveX = -dims.width;
            moveY = -dims.height;
            break;
        case'center':
            initialMoveX = dims.width / 2;
            initialMoveY = dims.height / 2;
            moveX = -dims.width / 2;
            moveY = -dims.height / 2;
            break;
    }
    return new Effect.Move(element, {x: initialMoveX, y: initialMoveY, duration: 0.01, beforeSetup: function (effect) {
        effect.element.hide().makeClipping().makePositioned();
    }, afterFinishInternal: function (effect) {
        new Effect.Parallel([new Effect.Opacity(effect.element, {sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition}), new Effect.Move(effect.element, {x: moveX, y: moveY, sync: true, transition: options.moveTransition}), new Effect.Scale(effect.element, 100, {scaleMode: {originalHeight: dims.height, originalWidth: dims.width}, sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})], Object.extend({beforeSetup: function (effect) {
            effect.effects[0].element.setStyle({height: '0px'}).show();
        }, afterFinishInternal: function (effect) {
            effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
        }}, options))
    }});
};
Effect.Shrink = function (element) {
    element = $(element);
    var options = Object.extend({direction: 'center', moveTransition: Effect.Transitions.sinoidal, scaleTransition: Effect.Transitions.sinoidal, opacityTransition: Effect.Transitions.none}, arguments[1] || {});
    var oldStyle = {top: element.style.top, left: element.style.left, height: element.style.height, width: element.style.width, opacity: element.getInlineOpacity()};
    var dims = element.getDimensions();
    var moveX, moveY;
    switch (options.direction) {
        case'top-left':
            moveX = moveY = 0;
            break;
        case'top-right':
            moveX = dims.width;
            moveY = 0;
            break;
        case'bottom-left':
            moveX = 0;
            moveY = dims.height;
            break;
        case'bottom-right':
            moveX = dims.width;
            moveY = dims.height;
            break;
        case'center':
            moveX = dims.width / 2;
            moveY = dims.height / 2;
            break;
    }
    return new Effect.Parallel([new Effect.Opacity(element, {sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition}), new Effect.Scale(element, window.opera ? 1 : 0, {sync: true, transition: options.scaleTransition, restoreAfterFinish: true}), new Effect.Move(element, {x: moveX, y: moveY, sync: true, transition: options.moveTransition})], Object.extend({beforeStartInternal: function (effect) {
        effect.effects[0].element.makePositioned().makeClipping();
    }, afterFinishInternal: function (effect) {
        effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle);
    }}, options));
};
Effect.Pulsate = function (element) {
    element = $(element);
    var options = arguments[1] || {};
    var oldOpacity = element.getInlineOpacity();
    var transition = options.transition || Effect.Transitions.sinoidal;
    var reverser = function (pos) {
        return transition(1 - Effect.Transitions.pulse(pos, options.pulses))
    };
    reverser.bind(transition);
    return new Effect.Opacity(element, Object.extend(Object.extend({duration: 2.0, from: 0, afterFinishInternal: function (effect) {
        effect.element.setStyle({opacity: oldOpacity});
    }}, options), {transition: reverser}));
};
Effect.Fold = function (element) {
    element = $(element);
    var oldStyle = {top: element.style.top, left: element.style.left, width: element.style.width, height: element.style.height};
    element.makeClipping();
    return new Effect.Scale(element, 5, Object.extend({scaleContent: false, scaleX: false, afterFinishInternal: function (effect) {
        new Effect.Scale(element, 1, {scaleContent: false, scaleY: false, afterFinishInternal: function (effect) {
            effect.element.hide().undoClipping().setStyle(oldStyle);
        }});
    }}, arguments[1] || {}));
};
Effect.Morph = Class.create(Effect.Base, {initialize: function (element) {
    this.element = $(element);
    if (!this.element)throw(Effect._elementDoesNotExistError);
    var options = Object.extend({style: {}}, arguments[1] || {});
    if (!Object.isString(options.style))this.style = $H(options.style); else {
        if (options.style.include(':'))
            this.style = options.style.parseStyle(); else {
            this.element.addClassName(options.style);
            this.style = $H(this.element.getStyles());
            this.element.removeClassName(options.style);
            var css = this.element.getStyles();
            this.style = this.style.reject(function (style) {
                return style.value == css[style.key];
            });
            options.afterFinishInternal = function (effect) {
                effect.element.addClassName(effect.options.style);
                effect.transforms.each(function (transform) {
                    effect.element.style[transform.style] = '';
                });
            }
        }
    }
    this.start(options);
}, setup: function () {
    function parseColor(color) {
        if (!color || ['rgba(0, 0, 0, 0)', 'transparent'].include(color))color = '#ffffff';
        color = color.parseColor();
        return $R(0, 2).map(function (i) {
            return parseInt(color.slice(i * 2 + 1, i * 2 + 3), 16)
        });
    }

    this.transforms = this.style.map(function (pair) {
        var property = pair[0], value = pair[1], unit = null;
        if (value.parseColor('#zzzzzz') != '#zzzzzz') {
            value = value.parseColor();
            unit = 'color';
        } else if (property == 'opacity') {
            value = parseFloat(value);
            if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
                this.element.setStyle({zoom: 1});
        } else if (Element.CSS_LENGTH.test(value)) {
            var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
            value = parseFloat(components[1]);
            unit = (components.length == 3) ? components[2] : null;
        }
        var originalValue = this.element.getStyle(property);
        return{style: property.camelize(), originalValue: unit == 'color' ? parseColor(originalValue) : parseFloat(originalValue || 0), targetValue: unit == 'color' ? parseColor(value) : value, unit: unit};
    }.bind(this)).reject(function (transform) {
            return((transform.originalValue == transform.targetValue) || (transform.unit != 'color' && (isNaN(transform.originalValue) || isNaN(transform.targetValue))))
        });
}, update: function (position) {
    var style = {}, transform, i = this.transforms.length;
    while (i--)
        style[(transform = this.transforms[i]).style] = transform.unit == 'color' ? '#' +
            (Math.round(transform.originalValue[0] +
                (transform.targetValue[0] - transform.originalValue[0]) * position)).toColorPart() +
            (Math.round(transform.originalValue[1] +
                (transform.targetValue[1] - transform.originalValue[1]) * position)).toColorPart() +
            (Math.round(transform.originalValue[2] +
                (transform.targetValue[2] - transform.originalValue[2]) * position)).toColorPart() : (transform.originalValue +
            (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
}});
Effect.Transform = Class.create({initialize: function (tracks) {
    this.tracks = [];
    this.options = arguments[1] || {};
    this.addTracks(tracks);
}, addTracks: function (tracks) {
    tracks.each(function (track) {
        track = $H(track);
        var data = track.values().first();
        this.tracks.push($H({ids: track.keys().first(), effect: Effect.Morph, options: {style: data}}));
    }.bind(this));
    return this;
}, play: function () {
    return new Effect.Parallel(this.tracks.map(function (track) {
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function (e) {
            return new effect(e, Object.extend({sync: true}, options))
        });
    }).flatten(), this.options);
}});
Element.CSS_PROPERTIES = $w('backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' + 'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' + 'borderRightColor borderRightStyle borderRightWidth borderSpacing ' + 'borderTopColor borderTopStyle borderTopWidth bottom clip color ' + 'fontSize fontWeight height left letterSpacing lineHeight ' + 'marginBottom marginLeft marginRight marginTop markerOffset maxHeight ' + 'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' + 'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' + 'right textIndent top width wordSpacing zIndex');
Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;
String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function () {
    var style, styleRules = $H();
    if (Prototype.Browser.WebKit)
        style = new Element('div', {style: this}).style; else {
        String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
        style = String.__parseStyleElement.childNodes[0].style;
    }
    Element.CSS_PROPERTIES.each(function (property) {
        if (style[property])styleRules.set(property, style[property]);
    });
    if (Prototype.Browser.IE && this.include('opacity'))
        styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);
    return styleRules;
};
if (document.defaultView && document.defaultView.getComputedStyle) {
    Element.getStyles = function (element) {
        var css = document.defaultView.getComputedStyle($(element), null);
        return Element.CSS_PROPERTIES.inject({}, function (styles, property) {
            styles[property] = css[property];
            return styles;
        });
    };
} else {
    Element.getStyles = function (element) {
        element = $(element);
        var css = element.currentStyle, styles;
        styles = Element.CSS_PROPERTIES.inject({}, function (results, property) {
            results[property] = css[property];
            return results;
        });
        if (!styles.opacity)styles.opacity = element.getOpacity();
        return styles;
    };
}
;
Effect.Methods = {morph: function (element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({style: style}, arguments[2] || {}));
    return element;
}, visualEffect: function (element, effect, options) {
    element = $(element)
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
}, highlight: function (element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
}};
$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown ' + 'pulsate shake puff squish switchOff dropOut').each(function (effect) {
    Effect.Methods[effect] = function (element, options) {
        element = $(element);
        Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
        return element;
    }
});
$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(function (f) {
    Effect.Methods[f] = Element[f];
});
Element.addMethods(Effect.Methods);
if (Object.isUndefined(Effect))
    throw("dragdrop.js requires including script.aculo.us' effects.js library");
var Droppables = {drops: [], remove: function (element) {
    this.drops = this.drops.reject(function (d) {
        return d.element == $(element)
    });
}, add: function (element) {
    element = $(element);
    var options = Object.extend({greedy: true, hoverclass: null, tree: false}, arguments[1] || {});
    if (options.containment) {
        options._containers = [];
        var containment = options.containment;
        if (Object.isArray(containment)) {
            containment.each(function (c) {
                options._containers.push($(c))
            });
        } else {
            options._containers.push($(containment));
        }
    }
    if (options.accept)options.accept = [options.accept].flatten();
    Element.makePositioned(element);
    options.element = element;
    this.drops.push(options);
}, findDeepestChild: function (drops) {
    deepest = drops[0];
    for (i = 1; i < drops.length; ++i)
        if (Element.isParent(drops[i].element, deepest.element))
            deepest = drops[i];
    return deepest;
}, isContained: function (element, drop) {
    var containmentNode;
    if (drop.tree) {
        containmentNode = element.treeNode;
    } else {
        containmentNode = element.parentNode;
    }
    return drop._containers.detect(function (c) {
        return containmentNode == c
    });
}, isAffected: function (point, element, drop) {
    return((drop.element != element) && ((!drop._containers) || this.isContained(element, drop)) && ((!drop.accept) || (Element.classNames(element).detect(function (v) {
        return drop.accept.include(v)
    }))) && Position.within(drop.element, point[0], point[1]));
}, deactivate: function (drop) {
    if (drop.hoverclass)
        Element.removeClassName(drop.element, drop.hoverclass);
    this.last_active = null;
}, activate: function (drop) {
    if (drop.hoverclass)
        Element.addClassName(drop.element, drop.hoverclass);
    this.last_active = drop;
}, show: function (point, element) {
    if (!this.drops.length)return;
    var drop, affected = [];
    this.drops.each(function (drop) {
        if (Droppables.isAffected(point, element, drop))
            affected.push(drop);
    });
    if (affected.length > 0)
        drop = Droppables.findDeepestChild(affected);
    if (this.last_active && this.last_active != drop)this.deactivate(this.last_active);
    if (drop) {
        Position.within(drop.element, point[0], point[1]);
        if (drop.onHover)
            drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));
        if (drop != this.last_active)Droppables.activate(drop);
    }
}, fire: function (event, element) {
    if (!this.last_active)return;
    Position.prepare();
    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
        if (this.last_active.onDrop) {
            this.last_active.onDrop(element, this.last_active.element, event);
            return true;
        }
}, reset: function () {
    if (this.last_active)
        this.deactivate(this.last_active);
}}
var Draggables = {drags: [], observers: [], register: function (draggable) {
    if (this.drags.length == 0) {
        this.eventMouseUp = this.endDrag.bindAsEventListener(this);
        this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
        this.eventKeypress = this.keyPress.bindAsEventListener(this);
        Event.observe(document, "mouseup", this.eventMouseUp);
        Event.observe(document, "mousemove", this.eventMouseMove);
        Event.observe(document, "keypress", this.eventKeypress);
    }
    this.drags.push(draggable);
}, unregister: function (draggable) {
    this.drags = this.drags.reject(function (d) {
        return d == draggable
    });
    if (this.drags.length == 0) {
        Event.stopObserving(document, "mouseup", this.eventMouseUp);
        Event.stopObserving(document, "mousemove", this.eventMouseMove);
        Event.stopObserving(document, "keypress", this.eventKeypress);
    }
}, activate: function (draggable) {
    if (draggable.options.delay) {
        this._timeout = setTimeout(function () {
            Draggables._timeout = null;
            window.focus();
            Draggables.activeDraggable = draggable;
        }.bind(this), draggable.options.delay);
    } else {
        window.focus();
        this.activeDraggable = draggable;
    }
}, deactivate: function () {
    this.activeDraggable = null;
}, updateDrag: function (event) {
    if (!this.activeDraggable)return;
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    if (this._lastPointer && (this._lastPointer.inspect() == pointer.inspect()))return;
    this._lastPointer = pointer;
    this.activeDraggable.updateDrag(event, pointer);
}, endDrag: function (event) {
    if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
    }
    if (!this.activeDraggable)return;
    this._lastPointer = null;
    this.activeDraggable.endDrag(event);
    this.activeDraggable = null;
}, keyPress: function (event) {
    if (this.activeDraggable)
        this.activeDraggable.keyPress(event);
}, addObserver: function (observer) {
    this.observers.push(observer);
    this._cacheObserverCallbacks();
}, removeObserver: function (element) {
    this.observers = this.observers.reject(function (o) {
        return o.element == element
    });
    this._cacheObserverCallbacks();
}, notify: function (eventName, draggable, event) {
    if (this[eventName + 'Count'] > 0)
        this.observers.each(function (o) {
            if (o[eventName])o[eventName](eventName, draggable, event);
        });
    if (draggable.options[eventName])draggable.options[eventName](draggable, event);
}, _cacheObserverCallbacks: function () {
    ['onStart', 'onEnd', 'onDrag'].each(function (eventName) {
        Draggables[eventName + 'Count'] = Draggables.observers.select(function (o) {
            return o[eventName];
        }).length;
    });
}}
var Draggable = Class.create({initialize: function (element) {
    var defaults = {handle: false, reverteffect: function (element, top_offset, left_offset) {
        var dur = Math.sqrt(Math.abs(top_offset ^ 2) + Math.abs(left_offset ^ 2)) * 0.02;
        new Effect.Move(element, {x: -left_offset, y: -top_offset, duration: dur, queue: {scope: '_draggable', position: 'end'}});
    }, endeffect: function (element) {
        var toOpacity = Object.isNumber(element._opacity) ? element._opacity : 1.0;
        new Effect.Opacity(element, {duration: 0.2, from: 0.7, to: toOpacity, queue: {scope: '_draggable', position: 'end'}, afterFinish: function () {
            Draggable._dragging[element] = false
        }});
    }, zindex: 1000, revert: false, quiet: false, scroll: false, scrollSensitivity: 20, scrollSpeed: 15, snap: false, delay: 0};
    if (!arguments[1] || Object.isUndefined(arguments[1].endeffect))
        Object.extend(defaults, {starteffect: function (element) {
            element._opacity = Element.getOpacity(element);
            Draggable._dragging[element] = true;
            new Effect.Opacity(element, {duration: 0.2, from: element._opacity, to: 0.7});
        }});
    var options = Object.extend(defaults, arguments[1] || {});
    this.element = $(element);
    if (options.handle && Object.isString(options.handle))
        this.handle = this.element.down('.' + options.handle, 0);
    if (!this.handle)this.handle = $(options.handle);
    if (!this.handle)this.handle = this.element;
    if (options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
        options.scroll = $(options.scroll);
        this._isScrollChild = Element.childOf(this.element, options.scroll);
    }
    Element.makePositioned(this.element);
    this.options = options;
    this.dragging = false;
    this.eventMouseDown = this.initDrag.bindAsEventListener(this);
    Event.observe(this.handle, "mousedown", this.eventMouseDown);
    Draggables.register(this);
}, destroy: function () {
    Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
    Draggables.unregister(this);
}, currentDelta: function () {
    return([parseInt(Element.getStyle(this.element, 'left') || '0'), parseInt(Element.getStyle(this.element, 'top') || '0')]);
}, initDrag: function (event) {
    if (!Object.isUndefined(Draggable._dragging[this.element]) && Draggable._dragging[this.element])return;
    if (Event.isLeftClick(event)) {
        var src = Event.element(event);
        if ((tag_name = src.tagName.toUpperCase()) && (tag_name == 'INPUT' || tag_name == 'SELECT' || tag_name == 'OPTION' || tag_name == 'BUTTON' || tag_name == 'TEXTAREA'))return;
        var pointer = [Event.pointerX(event), Event.pointerY(event)];
        var pos = Position.cumulativeOffset(this.element);
        this.offset = [0, 1].map(function (i) {
            return(pointer[i] - pos[i])
        });
        Draggables.activate(this);
        Event.stop(event);
    }
}, startDrag: function (event) {
    this.dragging = true;
    if (!this.delta)
        this.delta = this.currentDelta();
    if (this.options.zindex) {
        this.originalZ = parseInt(Element.getStyle(this.element, 'z-index') || 0);
        this.element.style.zIndex = this.options.zindex;
    }
    if (this.options.ghosting) {
        this._clone = this.element.cloneNode(true);
        this.element._originallyAbsolute = (this.element.getStyle('position') == 'absolute');
        if (!this.element._originallyAbsolute)
            Position.absolutize(this.element);
        this.element.parentNode.insertBefore(this._clone, this.element);
    }
    if (this.options.scroll) {
        if (this.options.scroll == window) {
            var where = this._getWindowScroll(this.options.scroll);
            this.originalScrollLeft = where.left;
            this.originalScrollTop = where.top;
        } else {
            this.originalScrollLeft = this.options.scroll.scrollLeft;
            this.originalScrollTop = this.options.scroll.scrollTop;
        }
    }
    Draggables.notify('onStart', this, event);
    if (this.options.starteffect)this.options.starteffect(this.element);
}, updateDrag: function (event, pointer) {
    if (!this.dragging)this.startDrag(event);
    if (!this.options.quiet) {
        Position.prepare();
        Droppables.show(pointer, this.element);
    }
    Draggables.notify('onDrag', this, event);
    this.draw(pointer);
    if (this.options.change)this.options.change(this);
    if (this.options.scroll) {
        this.stopScrolling();
        var p;
        if (this.options.scroll == window) {
            with (this._getWindowScroll(this.options.scroll)) {
                p = [left, top, left + width, top + height];
            }
        } else {
            p = Position.page(this.options.scroll);
            p[0] += this.options.scroll.scrollLeft + Position.deltaX;
            p[1] += this.options.scroll.scrollTop + Position.deltaY;
            p.push(p[0] + this.options.scroll.offsetWidth);
            p.push(p[1] + this.options.scroll.offsetHeight);
        }
        var speed = [0, 0];
        if (pointer[0] < (p[0] + this.options.scrollSensitivity))speed[0] = pointer[0] - (p[0] + this.options.scrollSensitivity);
        if (pointer[1] < (p[1] + this.options.scrollSensitivity))speed[1] = pointer[1] - (p[1] + this.options.scrollSensitivity);
        if (pointer[0] > (p[2] - this.options.scrollSensitivity))speed[0] = pointer[0] - (p[2] - this.options.scrollSensitivity);
        if (pointer[1] > (p[3] - this.options.scrollSensitivity))speed[1] = pointer[1] - (p[3] - this.options.scrollSensitivity);
        this.startScrolling(speed);
    }
    if (Prototype.Browser.WebKit)window.scrollBy(0, 0);
    Event.stop(event);
}, finishDrag: function (event, success) {
    this.dragging = false;
    if (this.options.quiet) {
        Position.prepare();
        var pointer = [Event.pointerX(event), Event.pointerY(event)];
        Droppables.show(pointer, this.element);
    }
    if (this.options.ghosting) {
        if (!this.element._originallyAbsolute)
            Position.relativize(this.element);
        delete this.element._originallyAbsolute;
        Element.remove(this._clone);
        this._clone = null;
    }
    var dropped = false;
    if (success) {
        dropped = Droppables.fire(event, this.element);
        if (!dropped)dropped = false;
    }
    if (dropped && this.options.onDropped)this.options.onDropped(this.element);
    Draggables.notify('onEnd', this, event);
    var revert = this.options.revert;
    if (revert && Object.isFunction(revert))revert = revert(this.element);
    var d = this.currentDelta();
    if (revert && this.options.reverteffect) {
        if (dropped == 0 || revert != 'failure')
            this.options.reverteffect(this.element, d[1] - this.delta[1], d[0] - this.delta[0]);
    } else {
        this.delta = d;
    }
    if (this.options.zindex)
        this.element.style.zIndex = this.originalZ;
    if (this.options.endeffect)
        this.options.endeffect(this.element);
    Draggables.deactivate(this);
    Droppables.reset();
}, keyPress: function (event) {
    if (event.keyCode != Event.KEY_ESC)return;
    this.finishDrag(event, false);
    Event.stop(event);
}, endDrag: function (event) {
    if (!this.dragging)return;
    this.stopScrolling();
    this.finishDrag(event, true);
    Event.stop(event);
}, draw: function (point) {
    var pos = Position.cumulativeOffset(this.element);
    if (this.options.ghosting) {
        var r = Position.realOffset(this.element);
        pos[0] += r[0] - Position.deltaX;
        pos[1] += r[1] - Position.deltaY;
    }
    var d = this.currentDelta();
    pos[0] -= d[0];
    pos[1] -= d[1];
    if (this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
        pos[0] -= this.options.scroll.scrollLeft - this.originalScrollLeft;
        pos[1] -= this.options.scroll.scrollTop - this.originalScrollTop;
    }
    var p = [0, 1].map(function (i) {
        return(point[i] - pos[i] - this.offset[i])
    }.bind(this));
    if (this.options.snap) {
        if (Object.isFunction(this.options.snap)) {
            p = this.options.snap(p[0], p[1], this);
        } else {
            if (Object.isArray(this.options.snap)) {
                p = p.map(function (v, i) {
                    return(v / this.options.snap[i]).round() * this.options.snap[i]
                }.bind(this))
            } else {
                p = p.map(function (v) {
                    return(v / this.options.snap).round() * this.options.snap
                }.bind(this))
            }
        }
    }
    var style = this.element.style;
    if ((!this.options.constraint) || (this.options.constraint == 'horizontal'))
        style.left = p[0] + "px";
    if ((!this.options.constraint) || (this.options.constraint == 'vertical'))
        style.top = p[1] + "px";
    if (style.visibility == "hidden")style.visibility = "";
}, stopScrolling: function () {
    if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
        Draggables._lastScrollPointer = null;
    }
}, startScrolling: function (speed) {
    if (!(speed[0] || speed[1]))return;
    this.scrollSpeed = [speed[0] * this.options.scrollSpeed, speed[1] * this.options.scrollSpeed];
    this.lastScrolled = new Date();
    this.scrollInterval = setInterval(this.scroll.bind(this), 10);
}, scroll: function () {
    var current = new Date();
    var delta = current - this.lastScrolled;
    this.lastScrolled = current;
    if (this.options.scroll == window) {
        with (this._getWindowScroll(this.options.scroll)) {
            if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
                var d = delta / 1000;
                this.options.scroll.scrollTo(left + d * this.scrollSpeed[0], top + d * this.scrollSpeed[1]);
            }
        }
    } else {
        this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
        this.options.scroll.scrollTop += this.scrollSpeed[1] * delta / 1000;
    }
    Position.prepare();
    Droppables.show(Draggables._lastPointer, this.element);
    Draggables.notify('onDrag', this);
    if (this._isScrollChild) {
        Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
        Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
        Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
        if (Draggables._lastScrollPointer[0] < 0)
            Draggables._lastScrollPointer[0] = 0;
        if (Draggables._lastScrollPointer[1] < 0)
            Draggables._lastScrollPointer[1] = 0;
        this.draw(Draggables._lastScrollPointer);
    }
    if (this.options.change)this.options.change(this);
}, _getWindowScroll: function (w) {
    var T, L, W, H;
    with (w.document) {
        if (w.document.documentElement && documentElement.scrollTop) {
            T = documentElement.scrollTop;
            L = documentElement.scrollLeft;
        } else if (w.document.body) {
            T = body.scrollTop;
            L = body.scrollLeft;
        }
        if (w.innerWidth) {
            W = w.innerWidth;
            H = w.innerHeight;
        } else if (w.document.documentElement && documentElement.clientWidth) {
            W = documentElement.clientWidth;
            H = documentElement.clientHeight;
        } else {
            W = body.offsetWidth;
            H = body.offsetHeight
        }
    }
    return{top: T, left: L, width: W, height: H};
}});
Draggable._dragging = {};
var SortableObserver = Class.create({initialize: function (element, observer) {
    this.element = $(element);
    this.observer = observer;
    this.lastValue = Sortable.serialize(this.element);
}, onStart: function () {
    this.lastValue = Sortable.serialize(this.element);
}, onEnd: function () {
    Sortable.unmark();
    if (this.lastValue != Sortable.serialize(this.element))
        this.observer(this.element)
}});
var Sortable = {SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/, sortables: {}, _findRootElement: function (element) {
    while (element.tagName.toUpperCase() != "BODY") {
        if (element.id && Sortable.sortables[element.id])return element;
        element = element.parentNode;
    }
}, options: function (element) {
    element = Sortable._findRootElement($(element));
    if (!element)return;
    return Sortable.sortables[element.id];
}, destroy: function (element) {
    var s = Sortable.options(element);
    if (s) {
        Draggables.removeObserver(s.element);
        s.droppables.each(function (d) {
            Droppables.remove(d)
        });
        s.draggables.invoke('destroy');
        delete Sortable.sortables[s.element.id];
    }
}, create: function (element) {
    element = $(element);
    var options = Object.extend({element: element, tag: 'li', dropOnEmpty: false, tree: false, treeTag: 'ul', overlap: 'vertical', constraint: 'vertical', containment: element, handle: false, only: false, delay: 0, hoverclass: null, ghosting: false, quiet: false, scroll: false, scrollSensitivity: 20, scrollSpeed: 15, format: this.SERIALIZE_RULE, elements: false, handles: false, onChange: Prototype.emptyFunction, onUpdate: Prototype.emptyFunction}, arguments[1] || {});
    this.destroy(element);
    var options_for_draggable = {revert: true, quiet: options.quiet, scroll: options.scroll, scrollSpeed: options.scrollSpeed, scrollSensitivity: options.scrollSensitivity, delay: options.delay, ghosting: options.ghosting, constraint: options.constraint, handle: options.handle};
    if (options.starteffect)
        options_for_draggable.starteffect = options.starteffect;
    if (options.reverteffect)
        options_for_draggable.reverteffect = options.reverteffect; else if (options.ghosting)options_for_draggable.reverteffect = function (element) {
        element.style.top = 0;
        element.style.left = 0;
    };
    if (options.endeffect)
        options_for_draggable.endeffect = options.endeffect;
    if (options.zindex)
        options_for_draggable.zindex = options.zindex;
    var options_for_droppable = {overlap: options.overlap, containment: options.containment, tree: options.tree, hoverclass: options.hoverclass, onHover: Sortable.onHover}
    var options_for_tree = {onHover: Sortable.onEmptyHover, overlap: options.overlap, containment: options.containment, hoverclass: options.hoverclass}
    Element.cleanWhitespace(element);
    options.draggables = [];
    options.droppables = [];
    if (options.dropOnEmpty || options.tree) {
        Droppables.add(element, options_for_tree);
        options.droppables.push(element);
    }
    (options.elements || this.findElements(element, options) || []).each(function (e, i) {
        var handle = options.handles ? $(options.handles[i]) : (options.handle ? $(e).select('.' + options.handle)[0] : e);
        options.draggables.push(new Draggable(e, Object.extend(options_for_draggable, {handle: handle})));
        Droppables.add(e, options_for_droppable);
        if (options.tree)e.treeNode = element;
        options.droppables.push(e);
    });
    if (options.tree) {
        (Sortable.findTreeElements(element, options) || []).each(function (e) {
            Droppables.add(e, options_for_tree);
            e.treeNode = element;
            options.droppables.push(e);
        });
    }
    this.sortables[element.id] = options;
    Draggables.addObserver(new SortableObserver(element, options.onUpdate));
}, findElements: function (element, options) {
    return Element.findChildren(element, options.only, options.tree ? true : false, options.tag);
}, findTreeElements: function (element, options) {
    return Element.findChildren(element, options.only, options.tree ? true : false, options.treeTag);
}, onHover: function (element, dropon, overlap) {
    if (Element.isParent(dropon, element))return;
    if (overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {
        return;
    } else if (overlap > 0.5) {
        Sortable.mark(dropon, 'before');
        if (dropon.previousSibling != element) {
            var oldParentNode = element.parentNode;
            element.style.visibility = "hidden";
            dropon.parentNode.insertBefore(element, dropon);
            if (dropon.parentNode != oldParentNode)
                Sortable.options(oldParentNode).onChange(element);
            Sortable.options(dropon.parentNode).onChange(element);
        }
    } else {
        Sortable.mark(dropon, 'after');
        var nextElement = dropon.nextSibling || null;
        if (nextElement != element) {
            var oldParentNode = element.parentNode;
            element.style.visibility = "hidden";
            dropon.parentNode.insertBefore(element, nextElement);
            if (dropon.parentNode != oldParentNode)
                Sortable.options(oldParentNode).onChange(element);
            Sortable.options(dropon.parentNode).onChange(element);
        }
    }
}, onEmptyHover: function (element, dropon, overlap) {
    var oldParentNode = element.parentNode;
    var droponOptions = Sortable.options(dropon);
    if (!Element.isParent(dropon, element)) {
        var index;
        var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});
        var child = null;
        if (children) {
            var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);
            for (index = 0; index < children.length; index += 1) {
                if (offset - Element.offsetSize(children[index], droponOptions.overlap) >= 0) {
                    offset -= Element.offsetSize(children[index], droponOptions.overlap);
                } else if (offset - (Element.offsetSize(children[index], droponOptions.overlap) / 2) >= 0) {
                    child = index + 1 < children.length ? children[index + 1] : null;
                    break;
                } else {
                    child = children[index];
                    break;
                }
            }
        }
        dropon.insertBefore(element, child);
        Sortable.options(oldParentNode).onChange(element);
        droponOptions.onChange(element);
    }
}, unmark: function () {
    if (Sortable._marker)Sortable._marker.hide();
}, mark: function (dropon, position) {
    var sortable = Sortable.options(dropon.parentNode);
    if (sortable && !sortable.ghosting)return;
    if (!Sortable._marker) {
        Sortable._marker = ($('dropmarker') || Element.extend(document.createElement('DIV'))).hide().addClassName('dropmarker').setStyle({position: 'absolute'});
        document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
    }
    var offsets = Position.cumulativeOffset(dropon);
    Sortable._marker.setStyle({left: offsets[0] + 'px', top: offsets[1] + 'px'});
    if (position == 'after')
        if (sortable.overlap == 'horizontal')
            Sortable._marker.setStyle({left: (offsets[0] + dropon.clientWidth) + 'px'}); else
            Sortable._marker.setStyle({top: (offsets[1] + dropon.clientHeight) + 'px'});
    Sortable._marker.show();
}, _tree: function (element, options, parent) {
    var children = Sortable.findElements(element, options) || [];
    for (var i = 0; i < children.length; ++i) {
        var match = children[i].id.match(options.format);
        if (!match)continue;
        var child = {id: encodeURIComponent(match ? match[1] : null), element: element, parent: parent, children: [], position: parent.children.length, container: $(children[i]).down(options.treeTag)}
        if (child.container)
            this._tree(child.container, options, child)
        parent.children.push(child);
    }
    return parent;
}, tree: function (element) {
    element = $(element);
    var sortableOptions = this.options(element);
    var options = Object.extend({tag: sortableOptions.tag, treeTag: sortableOptions.treeTag, only: sortableOptions.only, name: element.id, format: sortableOptions.format}, arguments[1] || {});
    var root = {id: null, parent: null, children: [], container: element, position: 0}
    return Sortable._tree(element, options, root);
}, _constructIndex: function (node) {
    var index = '';
    do {
        if (node.id)index = '[' + node.position + ']' + index;
    } while ((node = node.parent) != null);
    return index;
}, sequence: function (element) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[1] || {});
    return $(this.findElements(element, options) || []).map(function (item) {
        return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
    });
}, setSequence: function (element, new_sequence) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[2] || {});
    var nodeMap = {};
    this.findElements(element, options).each(function (n) {
        if (n.id.match(options.format))
            nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
        n.parentNode.removeChild(n);
    });
    new_sequence.each(function (ident) {
        var n = nodeMap[ident];
        if (n) {
            n[1].appendChild(n[0]);
            delete nodeMap[ident];
        }
    });
}, serialize: function (element) {
    element = $(element);
    var options = Object.extend(Sortable.options(element), arguments[1] || {});
    var name = encodeURIComponent((arguments[1] && arguments[1].name) ? arguments[1].name : element.id);
    if (options.tree) {
        return Sortable.tree(element, arguments[1]).children.map(function (item) {
            return[name + Sortable._constructIndex(item) + "[id]=" +
                encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
        }).flatten().join('&');
    } else {
        return Sortable.sequence(element, arguments[1]).map(function (item) {
            return name + "[]=" + encodeURIComponent(item);
        }).join('&');
    }
}}
Element.isParent = function (child, element) {
    if (!child.parentNode || child == element)return false;
    if (child.parentNode == element)return true;
    return Element.isParent(child.parentNode, element);
}
Element.findChildren = function (element, only, recursive, tagName) {
    if (!element.hasChildNodes())return null;
    tagName = tagName.toUpperCase();
    if (only)only = [only].flatten();
    var elements = [];
    $A(element.childNodes).each(function (e) {
        if (e.tagName && e.tagName.toUpperCase() == tagName && (!only || (Element.classNames(e).detect(function (v) {
            return only.include(v)
        }))))
            elements.push(e);
        if (recursive) {
            var grandchildren = Element.findChildren(e, only, recursive, tagName);
            if (grandchildren)elements.push(grandchildren);
        }
    });
    return(elements.length > 0 ? elements.flatten() : []);
}
Element.offsetSize = function (element, type) {
    return element['offset' + ((type == 'vertical' || type == 'height') ? 'Height' : 'Width')];
}
var Seam = new Object();
Seam.Remoting = new Object();
Seam.Component = new Object();
Seam.pageContext = new Object();
Seam.Component.components = new Array();
Seam.Component.instances = new Array();
Seam.Remoting.contextPath = '/nuxeo';
Seam.Component.newInstance = function (name) {
    for (var i = 0; i < Seam.Component.components.length; i++) {
        if (Seam.Component.components[i].__name == name)
            return new Seam.Component.components[i];
    }
}
Seam.Component.getInstance = function (name) {
    for (var i = 0; i < Seam.Component.components.length; i++) {
        if (Seam.Component.components[i].__name == name) {
            if (Seam.Component.components[i].__instance == null)
                Seam.Component.components[i].__instance = new Seam.Component.components[i]();
            return Seam.Component.components[i].__instance;
        }
    }
    return null;
}
Seam.Component.getComponentType = function (obj) {
    for (var i = 0; i < Seam.Component.components.length; i++) {
        if (obj instanceof Seam.Component.components[i])
            return Seam.Component.components[i];
    }
    return null;
}
Seam.Component.getComponentName = function (obj) {
    var componentType = Seam.Component.getComponentType(obj);
    return componentType ? componentType.__name : null;
}
Seam.Component.register = function (component) {
    for (var i = 0; i < Seam.Component.components.length; i++) {
        if (Seam.Component.components[i].__name == component.__name) {
            Seam.Component.components[i] = component;
            return;
        }
    }
    Seam.Component.components.push(component);
    component.__instance = null;
}
Seam.Component.isRegistered = function (name) {
    for (var i = 0; i < Seam.Component.components.length; i++) {
        if (Seam.Component.components[i].__name == name)
            return true;
    }
    return false;
}
Seam.Component.getMetadata = function (obj) {
    for (var i = 0; i < Seam.Component.components.length; i++) {
        if (obj instanceof Seam.Component.components[i])
            return Seam.Component.components[i].__metadata;
    }
    return null;
}
Seam.Remoting.extractEncodedSessionId = function (url) {
    var sessionId = null;
    if (url.indexOf(';jsessionid=') >= 0) {
        var qpos = url.indexOf('?');
        sessionId = url.substring(url.indexOf(';jsessionid=') + 12, qpos >= 0 ? qpos : url.length);
    }
    return sessionId;
}
Seam.Remoting.PATH_EXECUTE = "/execute";
Seam.Remoting.PATH_SUBSCRIPTION = "/subscription";
Seam.Remoting.PATH_POLL = "/poll";
Seam.Remoting.encodedSessionId = Seam.Remoting.extractEncodedSessionId(window.location.href);
Seam.Remoting.type = new Object();
Seam.Remoting.types = new Array();
Seam.Remoting.debug = false;
Seam.Remoting.debugWindow = null;
Seam.Remoting.setDebug = function (val) {
    Seam.Remoting.debug = val;
}
Seam.Remoting.log = function (msg) {
    if (!Seam.Remoting.debug)
        return;
    if (!Seam.Remoting.debugWindow || Seam.Remoting.debugWindow.document == null) {
        var attr = "left=400,top=400,resizable=yes,scrollbars=yes,width=400,height=400";
        Seam.Remoting.debugWindow = window.open("", "__seamDebugWindow", attr);
        if (Seam.Remoting.debugWindow) {
            Seam.Remoting.debugWindow.document.write("<html><head><title>Seam Debug Window</title></head><body></body></html>");
            var bodyTag = Seam.Remoting.debugWindow.document.getElementsByTagName("body").item(0);
            bodyTag.style.fontFamily = "arial";
            bodyTag.style.fontSize = "8pt";
        }
    }
    if (Seam.Remoting.debugWindow) {
        msg = msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        Seam.Remoting.debugWindow.document.write("<pre>" + (new Date()) + ": " + msg + "</pre><br/>");
    }
}
Seam.Remoting.createNamespace = function (namespace) {
    var parts = namespace.split(".");
    var base = Seam.Remoting.type;
    for (var i = 0; i < parts.length; i++) {
        if (typeof base[parts[i]] == "undefined")
            base[parts[i]] = new Object();
        base = base[parts[i]];
    }
}
Seam.Remoting.__Context = function () {
    this.conversationId = null;
    Seam.Remoting.__Context.prototype.setConversationId = function (conversationId) {
        this.conversationId = conversationId;
    }
    Seam.Remoting.__Context.prototype.getConversationId = function () {
        return this.conversationId;
    }
}
Seam.Remoting.Exception = function (msg) {
    this.message = msg;
    Seam.Remoting.Exception.prototype.getMessage = function () {
        return this.message;
    }
}
Seam.Remoting.context = new Seam.Remoting.__Context();
Seam.Remoting.getContext = function () {
    return Seam.Remoting.context;
}
Seam.Remoting.Map = function () {
    this.elements = new Array();
    Seam.Remoting.Map.prototype.size = function () {
        return this.elements.length;
    }
    Seam.Remoting.Map.prototype.isEmpty = function () {
        return this.elements.length == 0;
    }
    Seam.Remoting.Map.prototype.keySet = function () {
        var keySet = new Array();
        for (var i = 0; i < this.elements.length; i++)
            keySet[keySet.length] = this.elements[i].key;
        return keySet;
    }
    Seam.Remoting.Map.prototype.values = function () {
        var values = new Array();
        for (var i = 0; i < this.elements.length; i++)
            values[values.length] = this.elements[i].value;
        return values;
    }
    Seam.Remoting.Map.prototype.get = function (key) {
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == key)
                return this.elements[i].value;
        }
        return null;
    }
    Seam.Remoting.Map.prototype.put = function (key, value) {
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == key) {
                this.elements[i].value = value;
                return;
            }
        }
        this.elements.push({key: key, value: value});
    }
    Seam.Remoting.Map.prototype.remove = function (key) {
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == key)
                this.elements.splice(i, 1);
        }
    }
    Seam.Remoting.Map.prototype.contains = function (key) {
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == key)
                return true;
        }
        return false;
    }
}
Seam.Remoting.registerType = function (type) {
    for (var i = 0; i < Seam.Remoting.types.length; i++) {
        if (Seam.Remoting.types[i].__name == type.__name) {
            Seam.Remoting.types[i] = type;
            return;
        }
    }
    Seam.Remoting.types.push(type);
}
Seam.Remoting.createType = function (name) {
    for (var i = 0; i < Seam.Remoting.types.length; i++) {
        if (Seam.Remoting.types[i].__name == name)
            return new Seam.Remoting.types[i];
    }
}
Seam.Remoting.getType = function (obj) {
    for (var i = 0; i < Seam.Remoting.types.length; i++) {
        if (obj instanceof Seam.Remoting.types[i])
            return Seam.Remoting.types[i];
    }
    return null;
}
Seam.Remoting.getTypeName = function (obj) {
    var type = Seam.Remoting.getType(obj);
    return type ? type.__name : null;
}
Seam.Remoting.getMetadata = function (obj) {
    for (var i = 0; i < Seam.Remoting.types.length; i++) {
        if (obj instanceof Seam.Remoting.types[i])
            return Seam.Remoting.types[i].__metadata;
    }
    return null;
}
Seam.Remoting.serializeValue = function (value, type, refs) {
    if (value == null)
        return"<null/>"; else if (type) {
        switch (type) {
            case"bool":
                return"<bool>" + (value ? "true" : "false") + "</bool>";
            case"number":
                return"<number>" + value + "</number>";
            case"date":
                return Seam.Remoting.serializeDate(value);
            case"bean":
                return Seam.Remoting.getTypeRef(value, refs);
            case"bag":
                return Seam.Remoting.serializeBag(value, refs);
            case"map":
                return Seam.Remoting.serializeMap(value, refs);
            default:
                return"<str>" + encodeURIComponent(value) + "</str>";
        }
    }
    else {
        switch (typeof(value)) {
            case"number":
                return"<number>" + value + "</number>";
            case"boolean":
                return"<bool>" + (value ? "true" : "false") + "</bool>";
            case"object":
                if (value instanceof Array)
                    return Seam.Remoting.serializeBag(value, refs); else if (value instanceof Date)
                    return Seam.Remoting.serializeDate(value); else if (value instanceof Seam.Remoting.Map)
                    return Seam.Remoting.serializeMap(value, refs); else
                    return Seam.Remoting.getTypeRef(value, refs);
            default:
                return"<str>" + encodeURIComponent(value) + "</str>";
        }
    }
}
Seam.Remoting.serializeBag = function (value, refs) {
    var data = "<bag>";
    for (var i = 0; i < value.length; i++) {
        data += "<element>";
        data += Seam.Remoting.serializeValue(value[i], null, refs);
        data += "</element>";
    }
    data += "</bag>";
    return data;
}
Seam.Remoting.serializeMap = function (value, refs) {
    var data = "<map>";
    var keyset = value.keySet();
    for (var i = 0; i < keyset.length; i++) {
        data += "<element><k>";
        data += Seam.Remoting.serializeValue(keyset[i], null, refs);
        data += "</k><v>";
        data += Seam.Remoting.serializeValue(value.get(keyset[i]), null, refs);
        data += "</v></element>";
    }
    data += "</map>";
    return data;
}
Seam.Remoting.serializeDate = function (value) {
    var zeroPad = function (val, digits) {
        while (("" + val).length < digits)val = "0" + val;
        return val;
    };
    var data = "<date>";
    data += value.getFullYear();
    data += zeroPad(value.getMonth() + 1, 2);
    data += zeroPad(value.getDate(), 2);
    data += zeroPad(value.getHours(), 2);
    data += zeroPad(value.getMinutes(), 2);
    data += zeroPad(value.getSeconds(), 2);
    data += zeroPad(value.getMilliseconds(), 3);
    data += "</date>";
    return data;
}
Seam.Remoting.getTypeRef = function (obj, refs) {
    var refId = -1;
    for (var i = 0; i < refs.length; i++) {
        if (refs[i] == obj) {
            refId = i;
            break;
        }
    }
    if (refId == -1) {
        refId = refs.length;
        refs[refId] = obj;
    }
    return"<ref id=\"" + refId + "\"/>";
}
Seam.Remoting.serializeType = function (obj, refs) {
    var data = "<bean type=\"";
    var objType = Seam.Component.getComponentType(obj);
    var isComponent = objType != null;
    if (!isComponent)
        objType = Seam.Remoting.getType(obj);
    if (!objType) {
        alert("Unknown Type error.");
        return null;
    }
    data += objType.__name;
    data += "\">\n";
    var meta = isComponent ? Seam.Component.getMetadata(obj) : Seam.Remoting.getMetadata(obj);
    for (var i = 0; i < meta.length; i++) {
        data += "<member name=\"";
        data += meta[i].field;
        data += "\">";
        data += Seam.Remoting.serializeValue(obj[meta[i].field], meta[i].type, refs);
        data += "</member>\n";
    }
    data += "</bean>";
    return data;
}
Seam.Remoting.__callId = 0;
Seam.Remoting.createCall = function (component, methodName, params, callback, exceptionHandler) {
    var callId = "" + Seam.Remoting.__callId++;
    if (!callback)
        callback = component.__callback[methodName];
    var data = "<call component=\"";
    data += Seam.Component.getComponentType(component).__name;
    data += "\" method=\"";
    data += methodName;
    data += "\" id=\"";
    data += callId;
    data += "\">\n";
    data += "<params>";
    var refs = new Array();
    for (var i = 0; i < params.length; i++) {
        data += "<param>";
        data += Seam.Remoting.serializeValue(params[i], null, refs);
        data += "</param>";
    }
    data += "</params>";
    data += "<refs>";
    for (var i = 0; i < refs.length; i++) {
        data += "<ref id=\"" + i + "\">";
        data += Seam.Remoting.serializeType(refs[i], refs);
        data += "</ref>";
    }
    data += "</refs>";
    data += "</call>";
    return{data: data, id: callId, callback: callback, exceptionHandler: exceptionHandler};
}
Seam.Remoting.createHeader = function () {
    var header = "";
    header += "<context>";
    if (Seam.Remoting.getContext().getConversationId()) {
        header += "<conversationId>";
        header += Seam.Remoting.getContext().getConversationId();
        header += "</conversationId>";
    }
    header += "</context>";
    return header;
}
Seam.Remoting.createEnvelope = function (header, body) {
    var data = "<envelope>";
    if (header) {
        data += "<header>";
        data += header;
        data += "</header>";
    }
    if (body) {
        data += "<body>";
        data += body;
        data += "</body>";
    }
    data += "</envelope>";
    return data;
}
Seam.Remoting.pendingCalls = new Seam.Remoting.Map();
Seam.Remoting.inBatch = false;
Seam.Remoting.batchedCalls = new Array();
Seam.Remoting.startBatch = function () {
    Seam.Remoting.inBatch = true;
    Seam.Remoting.batchedCalls.length = 0;
}
Seam.Remoting.executeBatch = function () {
    if (!Seam.Remoting.inBatch)
        return;
    var data = "";
    for (var i = 0; i < Seam.Remoting.batchedCalls.length; i++) {
        Seam.Remoting.pendingCalls.put(Seam.Remoting.batchedCalls[i].id, Seam.Remoting.batchedCalls[i]);
        data += Seam.Remoting.batchedCalls[i].data;
    }
    var envelope = Seam.Remoting.createEnvelope(Seam.Remoting.createHeader(), data);
    Seam.Remoting.batchAsyncReq = Seam.Remoting.sendAjaxRequest(envelope, Seam.Remoting.PATH_EXECUTE, Seam.Remoting.processResponse, false);
    Seam.Remoting.inBatch = false;
}
Seam.Remoting.cancelBatch = function () {
    Seam.Remoting.inBatch = false;
    for (var i = 0; i < Seam.Remoting.batchedCalls.length; i++)
        Seam.Remoting.pendingCalls.remove(Seam.Remoting.batchedCalls[i].id);
}
Seam.Remoting.cancelCall = function (callId) {
    var call = Seam.Remoting.pendingCalls.get(callId);
    Seam.Remoting.pendingCalls.remove(callId);
    if (call && call.asyncReq) {
        if (Seam.Remoting.pendingCalls.isEmpty())
            Seam.Remoting.hideLoadingMessage();
        window.setTimeout(function () {
            call.asyncReq.onreadystatechange = function () {
            };
        }, 0);
        call.asyncReq.abort();
    }
}
Seam.Remoting.execute = function (component, methodName, params, callback, exceptionHandler) {
    var call = Seam.Remoting.createCall(component, methodName, params, callback, exceptionHandler);
    if (Seam.Remoting.inBatch) {
        Seam.Remoting.batchedCalls[Seam.Remoting.batchedCalls.length] = call;
    }
    else {
        var envelope = Seam.Remoting.createEnvelope(Seam.Remoting.createHeader(), call.data);
        Seam.Remoting.pendingCalls.put(call.id, call);
        Seam.Remoting.sendAjaxRequest(envelope, Seam.Remoting.PATH_EXECUTE, Seam.Remoting.processResponse, false);
    }
    return call;
}
Seam.Remoting.sendAjaxRequest = function (envelope, path, callback, silent) {
    Seam.Remoting.log("Request packet:\n" + envelope);
    if (!silent)
        Seam.Remoting.displayLoadingMessage();
    var asyncReq;
    if (window.XMLHttpRequest) {
        asyncReq = new XMLHttpRequest();
        if (asyncReq.overrideMimeType)
            asyncReq.overrideMimeType('text/xml');
    }
    else {
        asyncReq = new ActiveXObject("Microsoft.XMLHTTP");
    }
    asyncReq.onreadystatechange = function () {
        if (asyncReq.readyState == 4) {
            var inScope = typeof(Seam) == "undefined" ? false : true;
            if (inScope)Seam.Remoting.hideLoadingMessage();
            if (asyncReq.status == 200) {
                window.setTimeout(function () {
                    asyncReq.onreadystatechange = function () {
                    };
                }, 0);
                if (inScope)Seam.Remoting.log("Response packet:\n" + asyncReq.responseText);
                if (callback) {
                    try {
                        asyncReq.responseXML.documentElement;
                        callback(asyncReq.responseXML);
                    }
                    catch (ex) {
                        try {
                            var doc = new ActiveXObject("Microsoft.XMLDOM");
                            doc.async = "false";
                            doc.loadXML(asyncReq.responseText);
                            callback(doc);
                        }
                        catch (e) {
                            var parser = new DOMParser();
                            callback(parser.parseFromString(asyncReq.responseText, "text/xml"));
                        }
                    }
                }
            }
            else {
                Seam.Remoting.displayError(asyncReq.status);
            }
        }
    }
    if (Seam.Remoting.encodedSessionId) {
        path += ';jsessionid=' + Seam.Remoting.encodedSessionId;
    }
    asyncReq.open("POST", Seam.Remoting.resourcePath + path, true);
    asyncReq.send(envelope);
}
Seam.Remoting.displayError = function (code) {
    alert("There was an error processing your request.  Error code: " + code);
}
Seam.Remoting.setCallback = function (component, methodName, callback) {
    component.__callback[methodName] = callback;
}
Seam.Remoting.processResponse = function (doc) {
    var headerNode;
    var bodyNode;
    var inScope = typeof(Seam) == "undefined" ? false : true;
    if (!inScope)return;
    var context = new Seam.Remoting.__Context;
    if (doc.documentElement) {
        for (var i = 0; i < doc.documentElement.childNodes.length; i++) {
            var node = doc.documentElement.childNodes.item(i);
            if (node.tagName == "header")
                headerNode = node; else if (node.tagName == "body")
                bodyNode = node;
        }
    }
    if (headerNode) {
        var contextNode;
        for (var i = 0; i < headerNode.childNodes.length; i++) {
            var node = headerNode.childNodes.item(i);
            if (node.tagName == "context") {
                contextNode = node;
                break;
            }
        }
        if (contextNode && context) {
            Seam.Remoting.unmarshalContext(contextNode, context);
            if (context.getConversationId() && Seam.Remoting.getContext().getConversationId() == null)
                Seam.Remoting.getContext().setConversationId(context.getConversationId());
        }
    }
    if (bodyNode) {
        for (var i = 0; i < bodyNode.childNodes.length; i++) {
            var node = bodyNode.childNodes.item(i);
            if (node.tagName == "result")
                Seam.Remoting.processResult(node, context);
        }
    }
}
Seam.Remoting.processResult = function (result, context) {
    var callId = result.getAttribute("id");
    var call = Seam.Remoting.pendingCalls.get(callId);
    Seam.Remoting.pendingCalls.remove(callId);
    if (call && (call.callback || call.exceptionHandler)) {
        var valueNode = null;
        var refsNode = null;
        var exceptionNode = null;
        var children = result.childNodes;
        for (var i = 0; i < children.length; i++) {
            var tag = children.item(i).tagName;
            if (tag == "value")
                valueNode = children.item(i); else if (tag == "refs")
                refsNode = children.item(i); else if (tag == "exception")
                exceptionNode = children.item(i);
        }
        if (exceptionNode != null) {
            var msgNode = null;
            var children = exceptionNode.childNodes;
            for (var i = 0; i < children.length; i++) {
                var tag = children.item(i).tagName;
                if (tag == "message")
                    msgNode = children.item(i);
            }
            var msg = Seam.Remoting.unmarshalValue(msgNode.firstChild);
            var ex = new Seam.Remoting.Exception(msg);
            call.exceptionHandler(ex);
        }
        else {
            var refs = new Array();
            if (refsNode)
                Seam.Remoting.unmarshalRefs(refsNode, refs);
            var value = Seam.Remoting.unmarshalValue(valueNode.firstChild, refs);
            call.callback(value, context, callId);
        }
    }
}
Seam.Remoting.unmarshalContext = function (ctxNode, context) {
    for (var i = 0; i < ctxNode.childNodes.length; i++) {
        var tag = ctxNode.childNodes.item(i).tagName;
        if (tag == "conversationId")
            context.setConversationId(ctxNode.childNodes.item(i).firstChild.nodeValue);
    }
}
Seam.Remoting.unmarshalRefs = function (refsNode, refs) {
    var objs = new Array();
    for (var i = 0; i < refsNode.childNodes.length; i++) {
        if (refsNode.childNodes.item(i).tagName == "ref") {
            var refNode = refsNode.childNodes.item(i);
            var refId = parseInt(refNode.getAttribute("id"));
            var valueNode = refNode.firstChild;
            if (valueNode.tagName == "bean") {
                var obj = null;
                var typeName = valueNode.getAttribute("type");
                if (Seam.Component.isRegistered(typeName))
                    obj = Seam.Component.newInstance(typeName); else
                    obj = Seam.Remoting.createType(typeName);
                if (obj) {
                    refs[refId] = obj;
                    objs[objs.length] = {obj: obj, node: valueNode};
                }
            }
        }
    }
    for (var i = 0; i < objs.length; i++) {
        for (var j = 0; j < objs[i].node.childNodes.length; j++) {
            var child = objs[i].node.childNodes.item(j);
            if (child.tagName == "member") {
                var name = child.getAttribute("name");
                objs[i].obj[name] = Seam.Remoting.unmarshalValue(child.firstChild, refs);
            }
        }
    }
}
Seam.Remoting.unmarshalValue = function (element, refs) {
    var tag = element.tagName;
    switch (tag) {
        case"bool":
            return element.firstChild.nodeValue == "true";
        case"number":
            if (element.firstChild.nodeValue.indexOf(".") == -1)
                return parseInt(element.firstChild.nodeValue); else
                return parseFloat(element.firstChild.nodeValue);
        case"str":
            var data = "";
            for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes[i].nodeType == 3)
                    data += element.childNodes[i].nodeValue;
            }
            return decodeURIComponent(data);
        case"ref":
            return refs[parseInt(element.getAttribute("id"))];
        case"bag":
            var value = new Array();
            for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes.item(i).tagName == "element")
                    value[value.length] = Seam.Remoting.unmarshalValue(element.childNodes.item(i).firstChild, refs);
            }
            return value;
        case"map":
            var map = new Seam.Remoting.Map();
            for (var i = 0; i < element.childNodes.length; i++) {
                var childNode = element.childNodes.item(i);
                if (childNode.tagName == "element") {
                    var key = null
                    var value = null;
                    for (var j = 0; j < childNode.childNodes.length; j++) {
                        if (key == null && childNode.childNodes.item(j).tagName == "k")
                            key = Seam.Remoting.unmarshalValue(childNode.childNodes.item(j).firstChild, refs); else if (value == null && childNode.childNodes.item(j).tagName == "v")
                            value = Seam.Remoting.unmarshalValue(childNode.childNodes.item(j).firstChild, refs);
                    }
                    if (key != null)
                        map.put(key, value);
                }
            }
            return map;
        case"date":
            return Seam.Remoting.deserializeDate(element.firstChild.nodeValue);
        default:
            return null;
    }
}
Seam.Remoting.deserializeDate = function (val) {
    var dte = new Date();
    dte.setFullYear(parseInt(val.substring(0, 4), 10), parseInt(val.substring(4, 6), 10) - 1, parseInt(val.substring(6, 8), 10));
    dte.setHours(parseInt(val.substring(8, 10), 10));
    dte.setMinutes(parseInt(val.substring(10, 12), 10));
    dte.setSeconds(parseInt(val.substring(12, 14), 10));
    dte.setMilliseconds(parseInt(val.substring(14, 17), 10));
    return dte;
}
Seam.Remoting.loadingMsgDiv = null;
Seam.Remoting.loadingMessage = "Please wait...";
Seam.Remoting.displayLoadingMessage = function () {
    if (!Seam.Remoting.loadingMsgDiv) {
        Seam.Remoting.loadingMsgDiv = document.createElement('div');
        var msgDiv = Seam.Remoting.loadingMsgDiv;
        msgDiv.setAttribute('id', 'loadingMsg');
        msgDiv.style.position = "absolute";
        msgDiv.style.top = "0px";
        msgDiv.style.right = "0px";
        msgDiv.style.background = "red";
        msgDiv.style.color = "white";
        msgDiv.style.fontFamily = "Verdana,Helvetica,Arial";
        msgDiv.style.fontSize = "small";
        msgDiv.style.padding = "2px";
        msgDiv.style.border = "1px solid black";
        document.body.appendChild(msgDiv);
        var text = document.createTextNode(Seam.Remoting.loadingMessage);
        msgDiv.appendChild(text);
    }
    else {
        Seam.Remoting.loadingMsgDiv.innerHTML = Seam.Remoting.loadingMessage;
        Seam.Remoting.loadingMsgDiv.style.visibility = 'visible';
    }
}
Seam.Remoting.hideLoadingMessage = function () {
    if (Seam.Remoting.loadingMsgDiv)
        Seam.Remoting.loadingMsgDiv.style.visibility = 'hidden';
}
Seam.Remoting.pollInterval = 10;
Seam.Remoting.pollTimeout = 0;
Seam.Remoting.polling = false;
Seam.Remoting.setPollInterval = function (interval) {
    Seam.Remoting.pollInterval = interval;
}
Seam.Remoting.setPollTimeout = function (timeout) {
    Seam.Remoting.pollTimeout = timeout;
}
Seam.Remoting.subscriptionRegistry = new Array();
Seam.Remoting.subscribe = function (topicName, callback) {
    for (var i = 0; i < Seam.Remoting.subscriptionRegistry.length; i++) {
        if (Seam.Remoting.subscriptionRegistry[i].topic == topicName)
            return;
    }
    var body = "<subscribe topic=\"" + topicName + "\"/>";
    var env = Seam.Remoting.createEnvelope(null, body);
    Seam.Remoting.subscriptionRegistry.push({topic: topicName, callback: callback});
    Seam.Remoting.sendAjaxRequest(env, Seam.Remoting.PATH_SUBSCRIPTION, Seam.Remoting.subscriptionCallback, false);
}
Seam.Remoting.unsubscribe = function (topicName) {
    var token = null;
    for (var i = 0; i < Seam.Remoting.subscriptionRegistry.length; i++) {
        if (Seam.Remoting.subscriptionRegistry[i].topic == topicName) {
            token = Seam.Remoting.subscriptionRegistry[i].token;
            Seam.Remoting.subscriptionRegistry.splice(i, 1);
        }
    }
    if (token) {
        var body = "<unsubscribe token=\"" + token + "\"/>";
        var env = Seam.Remoting.createEnvelope(null, body);
        Seam.Remoting.sendAjaxRequest(env, Seam.Remoting.PATH_SUBSCRIPTION, null, false);
    }
}
Seam.Remoting.subscriptionCallback = function (doc) {
    var body = doc.documentElement.firstChild;
    for (var i = 0; i < body.childNodes.length; i++) {
        var node = body.childNodes.item(i);
        if (node.tagName == "subscription") {
            var topic = node.getAttribute("topic");
            var token = node.getAttribute("token");
            for (var i = 0; i < Seam.Remoting.subscriptionRegistry.length; i++) {
                if (Seam.Remoting.subscriptionRegistry[i].topic == topic) {
                    Seam.Remoting.subscriptionRegistry[i].token = token;
                    Seam.Remoting.poll();
                    break;
                }
            }
        }
    }
}
Seam.Remoting.pollTimeoutFunction = null;
Seam.Remoting.poll = function () {
    if (Seam.Remoting.polling)
        return;
    Seam.Remoting.polling = true;
    clearTimeout(Seam.Remoting.pollTimeoutFunction);
    var body = "";
    if (Seam.Remoting.subscriptionRegistry.length == 0) {
        Seam.Remoting.polling = false;
        return;
    }
    for (var i = 0; i < Seam.Remoting.subscriptionRegistry.length; i++) {
        body += "<poll token=\"" + Seam.Remoting.subscriptionRegistry[i].token + "\" ";
        body += "timeout=\"" + Seam.Remoting.pollTimeout + "\"/>";
    }
    var env = Seam.Remoting.createEnvelope(null, body);
    Seam.Remoting.sendAjaxRequest(env, Seam.Remoting.PATH_POLL, Seam.Remoting.pollCallback, true);
}
Seam.Remoting.pollCallback = function (doc) {
    Seam.Remoting.polling = false;
    var body = doc.documentElement.firstChild;
    for (var i = 0; i < body.childNodes.length; i++) {
        var node = body.childNodes.item(i);
        if (node.tagName == "messages")
            Seam.Remoting.processMessages(node); else if (node.tagName == "errors")
            Seam.Remoting.processPollErrors(node);
    }
    Seam.Remoting.pollTimeoutFunction = setTimeout("Seam.Remoting.poll()", Math.max(Seam.Remoting.pollInterval * 1000, 1000));
}
Seam.Remoting.processMessages = function (messages) {
    var token = messages.getAttribute("token");
    var callback = null;
    for (var i = 0; i < Seam.Remoting.subscriptionRegistry.length; i++) {
        if (Seam.Remoting.subscriptionRegistry[i].token == token) {
            callback = Seam.Remoting.subscriptionRegistry[i].callback;
            break;
        }
    }
    if (callback != null) {
        var messageNode = null;
        var children = messages.childNodes;
        for (var i = 0; i < children.length; i++) {
            if (children.item(i).tagName == "message") {
                messageNode = children.item(i);
                var messageType = messageNode.getAttribute("type");
                var valueNode = null;
                var refsNode = null;
                for (var j = 0; j < messageNode.childNodes.length; j++) {
                    var node = messageNode.childNodes.item(j);
                    if (node.tagName == "value")
                        valueNode = node; else if (node.tagName == "refs")
                        refsNode = node;
                }
                var refs = new Array();
                if (refsNode)
                    Seam.Remoting.unmarshalRefs(refsNode, refs);
                var value = Seam.Remoting.unmarshalValue(valueNode.firstChild, refs);
                callback(Seam.Remoting.createMessage(messageType, value));
            }
        }
    }
}
Seam.Remoting.processErrors = function (errors) {
    var token = errors.getAttribute("token");
    for (var i = 0; i < Seam.Remoting.subscriptionRegistry.length; i++) {
        if (Seam.Remoting.subscriptionRegistry[i].token == token) {
            Seam.Remoting.subscriptionRegistry.splice(i, 1);
            break;
        }
    }
    for (var i = 0; i < errors.childNodes.length; i++) {
        if (errors.childNodes.item(i).tagName == "error") {
            var errorNode = errors.childNodes.item(i);
            var code = errorNode.getAttribute("code");
            var message = errorNode.firstChild.nodeValue;
            if (Seam.Remoting.onPollError)
                Seam.Remoting.onPollError(code, message); else
                alert("A polling error occurred: " + code + " " + message);
        }
    }
}
Seam.Remoting.ObjectMessage = function () {
    this.value = null;
    Seam.Remoting.ObjectMessage.prototype.getValue = function () {
        return this.value;
    }
    Seam.Remoting.ObjectMessage.prototype.setValue = function (value) {
        this.value = value;
    }
}
Seam.Remoting.TextMessage = function () {
    this.text = null;
    Seam.Remoting.TextMessage.prototype.getText = function () {
        return this.text;
    }
    Seam.Remoting.TextMessage.prototype.setText = function (text) {
        this.text = text;
    }
}
Seam.Remoting.createMessage = function (messageType, value) {
    switch (messageType) {
        case"object":
            var msg = new Seam.Remoting.ObjectMessage();
            msg.setValue(value);
            return msg;
        case"text":
            var msg = new Seam.Remoting.TextMessage();
            msg.setText(value);
            return msg;
    }
    return null;
}
if (typeof(bsn) == "undefined")
    _b = bsn = {};
if (typeof(_b.Autosuggest) == "undefined")
    _b.Autosuggest = {}; else
    alert("Autosuggest is already set!");
_b.AutoSuggest = function (id, param) {
    if (!document.getElementById)
        return 0;
    this.fld = _b.DOM.gE(id);
    if (!this.fld)
        return 0;
    this.hiddenfld = _b.DOM.gE('hidden' + id);
    if (!this.hiddenfld)
        return 0;
    this.sInp = "";
    this.nInpC = 0;
    this.aSug = [];
    this.iHigh = 0;
    this.oP = param ? param : {};
    var k, def = {minchars: 1, varname: "input", className: "autosuggest", timeout: 2500, delay: 500, offsety: -5, shownoresults: true, noresults: "No results!", cache: true, maxentries: 25, directoryName: "", displayIdAndLabel: false, cacheDirectory: true, directoryValues: ""};
    for (k in def) {
        if (typeof(this.oP[k]) != typeof(def[k]))
            this.oP[k] = def[k];
    }
    var p = this;
    if (this.oP.cacheDirectory) {
        var initDirectory = function (result) {
            p.directoryValues = [];
            var jsondata = eval('(' + result + ')');
            for (var i = 0; i < jsondata.results.length; i++) {
                p.directoryValues.push({'id': jsondata.results[i].id, 'value': jsondata.results[i].value, 'info': jsondata.results[i].info});
            }
        }
        if (!this.oP.directoryValues) {
            Seam.Component.getInstance("suggestBox").getSuggestedValues(this.oP.directoryName, "", initDirectory);
        }
        else {
            initDirectory(this.oP.directoryValues.substring(1, this.oP.directoryValues.length - 1));
        }
    }
    this.fld.onkeypress = function (ev) {
        return p.onKeyPress(ev);
    };
    this.fld.onkeyup = function (ev) {
        return p.onKeyUp(ev);
    };
    this.fld.onblur = function (ev) {
        return p.onBlur(ev);
    };
    this.fld.onclick = function (ev) {
        return p.onClick(ev);
    };
    this.fld.setAttribute("autocomplete", "off");
};
_b.AutoSuggest.prototype.onClick = function (ev) {
    if (!this.fld.value) {
        var pointer = this;
        var input = this.sInp;
        clearTimeout(this.ajID);
        this.ajID = setTimeout(function () {
            pointer.doAjaxRequest(input)
        }, this.oP.delay);
    }
}
_b.AutoSuggest.prototype.onBlur = function (ev) {
    var bubble = 1;
    this.setHighlightedValue();
    return bubble;
}
_b.AutoSuggest.prototype.onKeyPress = function (ev) {
    var key = (window.event) ? window.event.keyCode : ev.keyCode;
    var RETURN = 13;
    var TAB = 9;
    var ESC = 27;
    var bubble = 1;
    switch (key) {
        case TAB:
            this.setHighlightedValue();
            bubble = 0;
            break;
        case RETURN:
            this.setHighlightedValue();
            bubble = 0;
            break;
        case ESC:
            this.sInp = this.hiddenfld.value = this.fld.value = "";
            this.clearSuggestions();
            bubble = 0;
            break;
    }
    return bubble;
};
_b.AutoSuggest.prototype.onKeyUp = function (ev) {
    var key = (window.event) ? window.event.keyCode : ev.keyCode;
    var pointer = this;
    var ARRUP = 38;
    var ARRDN = 40;
    var DELETE = 46;
    var BACKSPACE = 8;
    var bubble = 1;
    switch (key) {
        case ARRUP:
            pointer.changeHighlight(key);
            bubble = 0;
            break;
        case ARRDN:
            pointer.changeHighlight(key);
            bubble = 0;
            break;
        default:
            pointer.getSuggestions(this.fld.value);
    }
    return bubble;
};
_b.AutoSuggest.prototype.getSuggestions = function (val) {
    if ((val == this.sInp) && (val != 0))
        return 0;
    _b.DOM.remE(this.idAs);
    this.sInp = val;
    if ((val.length < this.oP.minchars)) {
        this.aSug = [];
        this.nInpC = val.length;
        return 0;
    }
    var ol = this.nInpC;
    this.nInpC = val.length ? val.length : 0;
    var l = this.aSug.length;
    if (this.nInpC > ol && l && l < this.oP.maxentries && this.oP.cache) {
        var arr = [];
        for (var i = 0; i < l; i++) {
            if (this.aSug[i].value.substr(0, val.length).toLowerCase() == val.toLowerCase())
                arr.push(this.aSug[i]);
        }
        this.aSug = arr;
        this.createList(this.aSug);
        return false;
    }
    else {
        var pointer = this;
        var input = this.sInp;
        clearTimeout(this.ajID);
        this.ajID = setTimeout(function () {
            pointer.doAjaxRequest(input)
        }, this.oP.delay);
    }
    return false;
};
_b.AutoSuggest.prototype.doAjaxRequest = function (input) {
    if (input != this.fld.value)
        return false;
    var pointer = this;
    var input = this.sInp;
    var directoryName = this.oP.directoryName;
    var completionCallback = function (result) {
        pointer.setSuggestions(input, result);
    };
    if (!this.oP.cacheDirectory) {
        Seam.Component.getInstance("suggestBox").getSuggestedValues(directoryName, input, completionCallback);
    } else {
        pointer.setSuggestions(input, result);
    }
};
_b.AutoSuggest.prototype.setSuggestions = function (input, result) {
    if (input != this.fld.value)
        return false;
    this.aSug = [];
    if (!this.oP.cacheDirectory) {
        var jsondata = eval('(' + result + ')');
        for (var i = 0; i < jsondata.results.length; i++) {
            this.aSug.push({'id': jsondata.results[i].id, 'value': jsondata.results[i].value, 'info': jsondata.results[i].info});
        }
    } else {
        var startsWith = function (string, input) {
            var taille = input.length;
            var subSection = string.substring(taille, 0);
            if (subSection == input) {
                return true;
            }
            else {
                return false;
            }
        };
        for (var i = 0; i < this.directoryValues.length; i++) {
            var label = this.directoryValues[i].value;
            if (label == "") {
                label = this.directoryValues[i].info;
            }
            if (startsWith(label.toLowerCase(), input.toLowerCase())) {
                this.aSug.push({'id': this.directoryValues[i].id, 'value': this.directoryValues[i].value, 'info': this.directoryValues[i].info});
            }
        }
    }
    this.idAs = "as_" + this.fld.id;
    this.createList(this.aSug);
};
_b.AutoSuggest.prototype.createList = function (arr) {
    var pointer = this;
    _b.DOM.remE(this.idAs);
    this.killTimeout();
    if (arr.length == 0 && !this.oP.shownoresults)
        return false;
    var div = _b.DOM.cE("div", {id: this.idAs, className: this.oP.className});
    var hcorner = _b.DOM.cE("div", {className: "as_corner"});
    var hbar = _b.DOM.cE("div", {className: "as_bar"});
    var header = _b.DOM.cE("div", {className: "as_header"});
    header.appendChild(hcorner);
    header.appendChild(hbar);
    div.appendChild(header);
    var ul = _b.DOM.cE("ul", {id: "as_ul"});
    for (var i = 0; i < arr.length; i++) {
        var val = arr[i].value;
        if (!val || val == "")val = arr[i].info;
        var st = val.toLowerCase().indexOf(this.sInp.toLowerCase());
        var output = val.substring(0, st) + "<em>" + val.substring(st, st + this.sInp.length) + "</em>" + val.substring(st + this.sInp.length);
        var span = _b.DOM.cE("span", {}, output, true);
        if ((arr[i].info != "") && (this.oP.displayIdAndLabel)) {
            var br = _b.DOM.cE("br", {});
            span.appendChild(br);
            var small = _b.DOM.cE("small", {}, arr[i].info);
            span.appendChild(small);
        }
        var a = _b.DOM.cE("a", {href: "#"});
        var tl = _b.DOM.cE("span", {className: "tl"}, " ");
        var tr = _b.DOM.cE("span", {className: "tr"}, " ");
        a.appendChild(tl);
        a.appendChild(tr);
        a.appendChild(span);
        a.name = i + 1;
        a.onclick = function () {
            pointer.setHighlightedValue();
            return false;
        };
        a.onmouseover = function () {
            pointer.setHighlight(this.name);
        };
        var li = _b.DOM.cE("li", {}, a);
        ul.appendChild(li);
    }
    if (arr.length == 0 && this.oP.shownoresults) {
        var li = _b.DOM.cE("li", {className: "as_warning"}, this.oP.noresults);
        ul.appendChild(li);
    }
    div.appendChild(ul);
    var fcorner = _b.DOM.cE("div", {className: "as_corner"});
    var fbar = _b.DOM.cE("div", {className: "as_bar"});
    var footer = _b.DOM.cE("div", {className: "as_footer"});
    footer.appendChild(fcorner);
    footer.appendChild(fbar);
    div.appendChild(footer);
    var pos = _b.DOM.getPos(this.fld);
    var fieldHeight = 25;
    if (this.oP.displayIdAndLabel)fieldHeight = 40;
    div.style.left = pos.x + "px";
    div.style.top = (pos.y + this.fld.offsetHeight + this.oP.offsety) + "px";
    div.style.width = this.fld.offsetWidth + "px";
    if (arr.length < 6) {
        if (arr.length == 0) {
            div.style.height = fieldHeight + "px";
        }
        else {
            div.style.height = fieldHeight * arr.length + "px";
        }
    }
    else {
        div.style.height = 150 + "px";
    }
    document.getElementsByTagName("body")[0].appendChild(div);
    this.iHigh = 0;
    var pointer = this;
    this.toID = setTimeout(function () {
        pointer.clearSuggestions()
    }, this.oP.timeout);
};
_b.AutoSuggest.prototype.changeHighlight = function (key) {
    var list = _b.DOM.gE("as_ul");
    if (!list)
        return false;
    var n;
    if (key == 40)
        n = this.iHigh + 1; else if (key == 38)
        n = this.iHigh - 1;
    if (n > list.childNodes.length)
        n = 1;
    if (n < 1)
        n = list.childNodes.length;
    this.setHighlight(n);
};
_b.AutoSuggest.prototype.setHighlight = function (n) {
    var list = _b.DOM.gE("as_ul");
    if (!list)
        return false;
    if (this.iHigh > 0)
        this.clearHighlight();
    this.iHigh = Number(n);
    list.childNodes[this.iHigh - 1].className = "as_highlight";
};
_b.AutoSuggest.prototype.clearHighlight = function () {
    var list = _b.DOM.gE("as_ul");
    if (!list)
        return false;
    if (this.iHigh > 0) {
        list.childNodes[this.iHigh - 1].className = "";
        this.iHigh = 0;
    }
};
_b.AutoSuggest.prototype.setHighlightedValue = function () {
    if (this.iHigh != 0 && this.aSug[this.iHigh - 1]) {
        this.sInp = this.fld.value = this.aSug[this.iHigh - 1].value;
        this.hiddenfld.value = this.aSug[this.iHigh - 1].info;
        this.fld.focus();
        if (this.fld.selectionStart)
            this.fld.setSelectionRange(this.sInp.length, this.sInp.length);
        this.clearSuggestions();
        if (typeof(this.oP.callback) == "function")
            this.oP.callback(this.aSug[this.iHigh - 1]);
    } else {
        this.clearSuggestions();
        this.sInp = this.fld.value = "";
    }
};
_b.AutoSuggest.prototype.killTimeout = function () {
    clearTimeout(this.toID);
};
_b.AutoSuggest.prototype.resetTimeout = function () {
    clearTimeout(this.toID);
    var pointer = this;
    this.toID = setTimeout(function () {
        pointer.clearSuggestions()
    }, 1000);
};
_b.AutoSuggest.prototype.clearSuggestions = function () {
    this.killTimeout();
    var ele = _b.DOM.gE(this.idAs);
    var pointer = this;
    if (ele) {
        _b.DOM.remE(pointer.idAs);
    }
};
if (typeof(_b.DOM) == "undefined")
    _b.DOM = {};
_b.DOM.cE = function (type, attr, cont, html) {
    var ne = document.createElement(type);
    if (!ne)
        return 0;
    for (var a in attr)
        ne[a] = attr[a];
    var t = typeof(cont);
    if (t == "string" && !html)
        ne.appendChild(document.createTextNode(cont)); else if (t == "string" && html)
        ne.innerHTML = cont; else if (t == "object")
        ne.appendChild(cont);
    return ne;
};
_b.DOM.gE = function (e) {
    var t = typeof(e);
    if (t == "undefined")
        return 0; else if (t == "string") {
        var re = document.getElementById(e);
        if (!re)
            return 0; else if (typeof(re.appendChild) != "undefined")
            return re; else
            return 0;
    }
    else if (typeof(e.appendChild) != "undefined")
        return e; else
        return 0;
};
_b.DOM.remE = function (ele) {
    var e = this.gE(ele);
    if (!e)
        return 0; else if (e.parentNode.removeChild(e))
        return true; else
        return 0;
};
_b.DOM.getPos = function (e) {
    var e = this.gE(e);
    var obj = e;
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    }
    else if (obj.x)
        curleft += obj.x;
    var obj = e;
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
        }
    }
    else if (obj.y)
        curtop += obj.y;
    return{x: curleft, y: curtop};
};
if (typeof(_b.Fader) == "undefined")
    _b.Fader = {};
_b.Fader = function (ele, from, to, fadetime, callback) {
    if (!ele)
        return 0;
    this.e = ele;
    this.from = from;
    this.to = to;
    this.cb = callback;
    this.nDur = fadetime;
    this.nInt = 50;
    this.nTime = 0;
    var p = this;
    this.nID = setInterval(function () {
        p._fade()
    }, this.nInt);
};
_b.Fader.prototype._fade = function () {
    this.nTime += this.nInt;
    var ieop = Math.round(this._tween(this.nTime, this.from, this.to, this.nDur) * 100);
    var op = ieop / 100;
    if (this.e.filters) {
        try {
            this.e.filters.item("DXImageTransform.Microsoft.Alpha").opacity = ieop;
        } catch (e) {
            this.e.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + ieop + ')';
        }
    }
    else {
        this.e.style.opacity = op;
    }
    if (this.nTime == this.nDur) {
        clearInterval(this.nID);
        if (this.cb != undefined)
            this.cb();
    }
};
_b.Fader.prototype._tween = function (t, b, c, d) {
    return b + ((c - b) * (t / d));
};
function toggleBox(toggleButton) {
    var title = toggleButton.parentNode;
    var body;
    if (title.nextSiblings)
        body = title.nextSiblings()[0]; else
        body = title.parentNode.children[1];
    if (Element.hasClassName(title, 'folded')) {
        title.className = 'unfolded';
    } else {
        title.className = 'folded';
    }
    Effect.toggle(body, 'blind', {duration: 0.2});
    return false;
}
var Window = Class.create();
Window.keepMultiModalWindow = false;
Window.hasEffectLib = String.prototype.parseColor != null;
Window.resizeEffectDuration = 0.4;
Window.prototype = {initialize: function () {
    var id;
    var optionIndex = 0;
    if (arguments.length > 0) {
        if (typeof arguments[0] == "string") {
            id = arguments[0];
            optionIndex = 1;
        }
        else
            id = arguments[0] ? arguments[0].id : null;
    }
    if (!id)
        id = "window_" + new Date().getTime();
    if ($(id))
        alert("Window " + id + " is already registered in the DOM! Make sure you use setDestroyOnClose() or destroyOnClose: true in the constructor");
    this.options = Object.extend({className: "dialog", minWidth: 100, minHeight: 20, resizable: true, closable: true, minimizable: true, maximizable: true, draggable: true, userData: null, showEffect: (Window.hasEffectLib ? Effect.Appear : Element.show), hideEffect: (Window.hasEffectLib ? Effect.Fade : Element.hide), showEffectOptions: {}, hideEffectOptions: {}, effectOptions: null, parent: document.body, title: "&nbsp;", url: null, onload: Prototype.emptyFunction, width: 200, height: 300, opacity: 1, recenterAuto: true, wiredDrag: false, closeCallback: null, destroyOnClose: false, gridX: 1, gridY: 1}, arguments[optionIndex] || {});
    if (typeof this.options.top == "undefined" && typeof this.options.bottom == "undefined")
        this.options.top = this._round(Math.random() * 500, this.options.gridY);
    if (typeof this.options.left == "undefined" && typeof this.options.right == "undefined")
        this.options.left = this._round(Math.random() * 500, this.options.gridX);
    if (this.options.effectOptions) {
        Object.extend(this.options.hideEffectOptions, this.options.effectOptions);
        Object.extend(this.options.showEffectOptions, this.options.effectOptions);
        if (this.options.showEffect == Element.Appear)
            this.options.showEffectOptions.to = this.options.opacity;
    }
    if (Window.hasEffectLib) {
        if (this.options.showEffect == Effect.Appear)
            this.options.showEffectOptions.to = this.options.opacity;
        if (this.options.hideEffect == Effect.Fade)
            this.options.hideEffectOptions.from = this.options.opacity;
    }
    if (this.options.hideEffect == Element.hide)
        this.options.hideEffect = function () {
            Element.hide(this.element);
            if (this.options.destroyOnClose)this.destroy();
        }.bind(this)
    if (this.options.parent != document.body)
        this.options.parent = $(this.options.parent);
    this.element = this._createWindow(id);
    this.eventMouseDown = this._initDrag.bindAsEventListener(this);
    this.eventMouseUp = this._endDrag.bindAsEventListener(this);
    this.eventMouseMove = this._updateDrag.bindAsEventListener(this);
    this.eventOnLoad = this._getWindowBorderSize.bindAsEventListener(this);
    this.eventMouseDownContent = this.toFront.bindAsEventListener(this);
    this.eventResize = this._recenter.bindAsEventListener(this);
    this.topbar = $(this.element.id + "_top");
    this.bottombar = $(this.element.id + "_bottom");
    this.content = $(this.element.id + "_content");
    Event.observe(this.topbar, "mousedown", this.eventMouseDown);
    Event.observe(this.bottombar, "mousedown", this.eventMouseDown);
    Event.observe(this.content, "mousedown", this.eventMouseDownContent);
    Event.observe(window, "load", this.eventOnLoad);
    Event.observe(window, "resize", this.eventResize);
    Event.observe(window, "scroll", this.eventResize);
    if (this.options.draggable) {
        var that = this;
        [this.topbar, this.topbar.up().previous(), this.topbar.up().next()].each(function (element) {
            element.observe("mousedown", that.eventMouseDown);
            element.addClassName("top_draggable");
        });
        [this.bottombar.up(), this.bottombar.up().previous(), this.bottombar.up().next()].each(function (element) {
            element.observe("mousedown", that.eventMouseDown);
            element.addClassName("bottom_draggable");
        });
    }
    if (this.options.resizable) {
        this.sizer = $(this.element.id + "_sizer");
        Event.observe(this.sizer, "mousedown", this.eventMouseDown);
    }
    this.useLeft = null;
    this.useTop = null;
    if (typeof this.options.left != "undefined") {
        this.element.setStyle({left: parseFloat(this.options.left) + 'px'});
        this.useLeft = true;
    }
    else {
        this.element.setStyle({right: parseFloat(this.options.right) + 'px'});
        this.useLeft = false;
    }
    if (typeof this.options.top != "undefined") {
        this.element.setStyle({top: parseFloat(this.options.top) + 'px'});
        this.useTop = true;
    }
    else {
        this.element.setStyle({bottom: parseFloat(this.options.bottom) + 'px'});
        this.useTop = false;
    }
    this.storedLocation = null;
    this.setOpacity(this.options.opacity);
    if (this.options.zIndex)
        this.setZIndex(this.options.zIndex)
    if (this.options.destroyOnClose)
        this.setDestroyOnClose(true);
    this._getWindowBorderSize();
    this.width = this.options.width;
    this.height = this.options.height;
    this.visible = false;
    this.constraint = false;
    this.constraintPad = {top: 0, left: 0, bottom: 0, right: 0};
    if (this.width && this.height)
        this.setSize(this.options.width, this.options.height);
    this.setTitle(this.options.title)
    Windows.register(this);
}, destroy: function () {
    this._notify("onDestroy");
    Event.stopObserving(this.topbar, "mousedown", this.eventMouseDown);
    Event.stopObserving(this.bottombar, "mousedown", this.eventMouseDown);
    Event.stopObserving(this.content, "mousedown", this.eventMouseDownContent);
    Event.stopObserving(window, "load", this.eventOnLoad);
    Event.stopObserving(window, "resize", this.eventResize);
    Event.stopObserving(window, "scroll", this.eventResize);
    Event.stopObserving(this.content, "load", this.options.onload);
    if (this._oldParent) {
        var content = this.getContent();
        var originalContent = null;
        for (var i = 0; i < content.childNodes.length; i++) {
            originalContent = content.childNodes[i];
            if (originalContent.nodeType == 1)
                break;
            originalContent = null;
        }
        if (originalContent)
            this._oldParent.appendChild(originalContent);
        this._oldParent = null;
    }
    if (this.sizer)
        Event.stopObserving(this.sizer, "mousedown", this.eventMouseDown);
    if (this.options.url)
        this.content.src = null
    if (this.iefix)
        Element.remove(this.iefix);
    Element.remove(this.element);
    Windows.unregister(this);
}, setCloseCallback: function (callback) {
    this.options.closeCallback = callback;
}, getContent: function () {
    return this.content;
}, setContent: function (id, autoresize, autoposition) {
    var element = $(id);
    if (null == element)throw"Unable to find element '" + id + "' in DOM";
    this._oldParent = element.parentNode;
    var d = null;
    var p = null;
    if (autoresize)
        d = Element.getDimensions(element);
    if (autoposition)
        p = Position.cumulativeOffset(element);
    var content = this.getContent();
    this.setHTMLContent("");
    content = this.getContent();
    content.appendChild(element);
    element.show();
    if (autoresize)
        this.setSize(d.width, d.height);
    if (autoposition)
        this.setLocation(p[1] - this.heightN, p[0] - this.widthW);
}, setHTMLContent: function (html) {
    if (this.options.url) {
        this.content.src = null;
        this.options.url = null;
        var content = "<div id=\"" + this.getId() + "_content\" class=\"" + this.options.className + "_content\"> </div>";
        $(this.getId() + "_table_content").innerHTML = content;
        this.content = $(this.element.id + "_content");
    }
    this.getContent().innerHTML = html;
}, setAjaxContent: function (url, options, showCentered, showModal) {
    this.showFunction = showCentered ? "showCenter" : "show";
    this.showModal = showModal || false;
    options = options || {};
    this.setHTMLContent("");
    this.onComplete = options.onComplete;
    if (!this._onCompleteHandler)
        this._onCompleteHandler = this._setAjaxContent.bind(this);
    options.onComplete = this._onCompleteHandler;
    new Ajax.Request(url, options);
    options.onComplete = this.onComplete;
}, _setAjaxContent: function (originalRequest) {
    Element.update(this.getContent(), originalRequest.responseText);
    if (this.onComplete)
        this.onComplete(originalRequest);
    this.onComplete = null;
    this[this.showFunction](this.showModal)
}, setURL: function (url) {
    if (this.options.url)
        this.content.src = null;
    this.options.url = url;
    var content = "<iframe frameborder='0' name='" + this.getId() + "_content'  id='" + this.getId() + "_content' src='" + url + "' width='" + this.width + "' height='" + this.height + "'> </iframe>";
    $(this.getId() + "_table_content").innerHTML = content;
    this.content = $(this.element.id + "_content");
}, getURL: function () {
    return this.options.url ? this.options.url : null;
}, refresh: function () {
    if (this.options.url)
        $(this.element.getAttribute('id') + '_content').src = this.options.url;
}, setCookie: function (name, expires, path, domain, secure) {
    name = name || this.element.id;
    this.cookie = [name, expires, path, domain, secure];
    var value = WindowUtilities.getCookie(name)
    if (value) {
        var values = value.split(',');
        var x = values[0].split(':');
        var y = values[1].split(':');
        var w = parseFloat(values[2]), h = parseFloat(values[3]);
        var mini = values[4];
        var maxi = values[5];
        this.setSize(w, h);
        if (mini == "true")
            this.doMinimize = true; else if (maxi == "true")
            this.doMaximize = true;
        this.useLeft = x[0] == "l";
        this.useTop = y[0] == "t";
        this.element.setStyle(this.useLeft ? {left: x[1]} : {right: x[1]});
        this.element.setStyle(this.useTop ? {top: y[1]} : {bottom: y[1]});
    }
}, getId: function () {
    return this.element.id;
}, setDestroyOnClose: function () {
    this.options.destroyOnClose = true;
}, setConstraint: function (bool, padding) {
    this.constraint = bool;
    this.constraintPad = Object.extend(this.constraintPad, padding || {});
    if (this.useTop && this.useLeft)
        this.setLocation(parseFloat(this.element.style.top), parseFloat(this.element.style.left));
}, _initDrag: function (event) {
    if (Event.element(event) == this.sizer && this.isMinimized())
        return;
    if (Event.element(event) != this.sizer && this.isMaximized())
        return;
    if (window.ie && this.heightN == 0)
        this._getWindowBorderSize();
    this.pointer = [this._round(Event.pointerX(event), this.options.gridX), this._round(Event.pointerY(event), this.options.gridY)];
    if (this.options.wiredDrag)
        this.currentDrag = this._createWiredElement(); else
        this.currentDrag = this.element;
    if (Event.element(event) == this.sizer) {
        this.doResize = true;
        this.widthOrg = this.width;
        this.heightOrg = this.height;
        this.bottomOrg = parseFloat(this.element.getStyle('bottom'));
        this.rightOrg = parseFloat(this.element.getStyle('right'));
        this._notify("onStartResize");
    }
    else {
        this.doResize = false;
        var closeButton = $(this.getId() + '_close');
        if (closeButton && Position.within(closeButton, this.pointer[0], this.pointer[1])) {
            this.currentDrag = null;
            return;
        }
        this.toFront();
        if (!this.options.draggable)
            return;
        this._notify("onStartMove");
    }
    Event.observe(document, "mouseup", this.eventMouseUp, false);
    Event.observe(document, "mousemove", this.eventMouseMove, false);
    WindowUtilities.disableScreen('__invisible__', '__invisible__', this.overlayOpacity);
    document.body.ondrag = function () {
        return false;
    };
    document.body.onselectstart = function () {
        return false;
    };
    this.currentDrag.show();
    Event.stop(event);
}, _round: function (val, round) {
    return round == 1 ? val : val = Math.floor(val / round) * round;
}, _updateDrag: function (event) {
    var pointer = [this._round(Event.pointerX(event), this.options.gridX), this._round(Event.pointerY(event), this.options.gridY)];
    var dx = pointer[0] - this.pointer[0];
    var dy = pointer[1] - this.pointer[1];
    if (this.doResize) {
        var w = this.widthOrg + dx;
        var h = this.heightOrg + dy;
        dx = this.width - this.widthOrg
        dy = this.height - this.heightOrg
        if (this.useLeft)
            w = this._updateWidthConstraint(w)
        else
            this.currentDrag.setStyle({right: (this.rightOrg - dx) + 'px'});
        if (this.useTop)
            h = this._updateHeightConstraint(h)
        else
            this.currentDrag.setStyle({bottom: (this.bottomOrg - dy) + 'px'});
        this.setSize(w, h);
        this._notify("onResize");
    }
    else {
        this.pointer = pointer;
        if (this.useLeft) {
            var left = parseFloat(this.currentDrag.getStyle('left')) + dx;
            var newLeft = this._updateLeftConstraint(left);
            this.pointer[0] += newLeft - left;
            this.currentDrag.setStyle({left: newLeft + 'px'});
        }
        else
            this.currentDrag.setStyle({right: parseFloat(this.currentDrag.getStyle('right')) - dx + 'px'});
        if (this.useTop) {
            var top = parseFloat(this.currentDrag.getStyle('top')) + dy;
            var newTop = this._updateTopConstraint(top);
            this.pointer[1] += newTop - top;
            this.currentDrag.setStyle({top: newTop + 'px'});
        }
        else
            this.currentDrag.setStyle({bottom: parseFloat(this.currentDrag.getStyle('bottom')) - dy + 'px'});
        this._notify("onMove");
    }
    if (this.iefix)
        this._fixIEOverlapping();
    this._removeStoreLocation();
    Event.stop(event);
}, _endDrag: function (event) {
    WindowUtilities.enableScreen('__invisible__');
    if (this.doResize)
        this._notify("onEndResize"); else
        this._notify("onEndMove");
    Event.stopObserving(document, "mouseup", this.eventMouseUp, false);
    Event.stopObserving(document, "mousemove", this.eventMouseMove, false);
    Event.stop(event);
    this._hideWiredElement();
    this._saveCookie()
    document.body.ondrag = null;
    document.body.onselectstart = null;
}, _updateLeftConstraint: function (left) {
    if (this.constraint && this.useLeft && this.useTop) {
        var width = this.options.parent == document.body ? WindowUtilities.getPageSize().windowWidth : this.options.parent.getDimensions().width;
        if (left < this.constraintPad.left)
            left = this.constraintPad.left;
        if (left + this.width + this.widthE + this.widthW > width - this.constraintPad.right)
            left = width - this.constraintPad.right - this.width - this.widthE - this.widthW;
    }
    return left;
}, _updateTopConstraint: function (top) {
    if (this.constraint && this.useLeft && this.useTop) {
        var height = this.options.parent == document.body ? WindowUtilities.getPageSize().windowHeight : this.options.parent.getDimensions().height;
        var h = this.height + this.heightN + this.heightS;
        if (top < this.constraintPad.top)
            top = this.constraintPad.top;
        if (top + h > height - this.constraintPad.bottom)
            top = height - this.constraintPad.bottom - h;
    }
    return top;
}, _updateWidthConstraint: function (w) {
    if (this.constraint && this.useLeft && this.useTop) {
        var width = this.options.parent == document.body ? WindowUtilities.getPageSize().windowWidth : this.options.parent.getDimensions().width;
        var left = parseFloat(this.element.getStyle("left"));
        if (left + w + this.widthE + this.widthW > width - this.constraintPad.right)
            w = width - this.constraintPad.right - left - this.widthE - this.widthW;
    }
    return w;
}, _updateHeightConstraint: function (h) {
    if (this.constraint && this.useLeft && this.useTop) {
        var height = this.options.parent == document.body ? WindowUtilities.getPageSize().windowHeight : this.options.parent.getDimensions().height;
        var top = parseFloat(this.element.getStyle("top"));
        if (top + h + this.heightN + this.heightS > height - this.constraintPad.bottom)
            h = height - this.constraintPad.bottom - top - this.heightN - this.heightS;
    }
    return h;
}, _createWindow: function (id) {
    var className = this.options.className;
    var win = document.createElement("div");
    win.setAttribute('id', id);
    win.className = "dialog";
    var content;
    if (this.options.url)
        content = "<iframe frameborder=\"0\" name=\"" + id + "_content\"  id=\"" + id + "_content\" src=\"" + this.options.url + "\"> </iframe>"; else
        content = "<div id=\"" + id + "_content\" class=\"" + className + "_content\"> </div>";
    var closeDiv = this.options.closable ? "<div class='" + className + "_close' id='" + id + "_close' onclick='Windows.close(\"" + id + "\", event)'> </div>" : "";
    var minDiv = this.options.minimizable ? "<div class='" + className + "_minimize' id='" + id + "_minimize' onclick='Windows.minimize(\"" + id + "\", event)'> </div>" : "";
    var maxDiv = this.options.maximizable ? "<div class='" + className + "_maximize' id='" + id + "_maximize' onclick='Windows.maximize(\"" + id + "\", event)'> </div>" : "";
    var seAttributes = this.options.resizable ? "class='" + className + "_sizer' id='" + id + "_sizer'" : "class='" + className + "_se'";
    var blank = "../themes/default/blank.gif";
    win.innerHTML = closeDiv + minDiv + maxDiv + "\
      <table id='" + id + "_row1' class=\"top table_window\">\
        <tr>\
          <td class='" + className + "_nw'></td>\
          <td class='" + className + "_n'><div id='" + id + "_top' class='" + className + "_title title_window'>" + this.options.title + "</div></td>\
          <td class='" + className + "_ne'></td>\
        </tr>\
      </table>\
      <table id='" + id + "_row2' class=\"mid table_window\">\
        <tr>\
          <td class='" + className + "_w'></td>\
            <td id='" + id + "_table_content' class='" + className + "_content' valign='top'>" + content + "</td>\
          <td class='" + className + "_e'></td>\
        </tr>\
      </table>\
        <table id='" + id + "_row3' class=\"bot table_window\">\
        <tr>\
          <td class='" + className + "_sw'></td>\
            <td class='" + className + "_s'><div id='" + id + "_bottom' class='status_bar'><span style='float:left; width:1px; height:1px'></span></div></td>\
            <td " + seAttributes + "></td>\
        </tr>\
      </table>\
    ";
    Element.hide(win);
    this.options.parent.insertBefore(win, this.options.parent.firstChild);
    Event.observe($(id + "_content"), "load", this.options.onload);
    return win;
}, changeClassName: function (newClassName) {
    var className = this.options.className;
    var id = this.getId();
    var win = this;
    $A(["_close", "_minimize", "_maximize", "_sizer", "_content"]).each(function (value) {
        win._toggleClassName($(id + value), className + value, newClassName + value)
    });
    $$("#" + id + " td").each(function (td) {
        td.className = td.className.sub(className, newClassName)
    });
    this.options.className = newClassName;
}, _toggleClassName: function (element, oldClassName, newClassName) {
    if (element) {
        element.removeClassName(oldClassName);
        element.addClassName(newClassName);
    }
}, setLocation: function (top, left) {
    top = this._updateTopConstraint(top);
    left = this._updateLeftConstraint(left);
    var e = this.currentDrag || this.element;
    e.setStyle({top: top + 'px'});
    e.setStyle({left: left + 'px'});
    this.useLeft = true;
    this.useTop = true;
}, getLocation: function () {
    var location = {};
    if (this.useTop)
        location = Object.extend(location, {top: this.element.getStyle("top")}); else
        location = Object.extend(location, {bottom: this.element.getStyle("bottom")});
    if (this.useLeft)
        location = Object.extend(location, {left: this.element.getStyle("left")}); else
        location = Object.extend(location, {right: this.element.getStyle("right")});
    return location;
}, getSize: function () {
    return{width: this.width, height: this.height};
}, setSize: function (width, height, useEffect) {
    width = parseFloat(width);
    height = parseFloat(height);
    if (!this.minimized && width < this.options.minWidth)
        width = this.options.minWidth;
    if (!this.minimized && height < this.options.minHeight)
        height = this.options.minHeight;
    if (this.options.maxHeight && height > this.options.maxHeight)
        height = this.options.maxHeight;
    if (this.options.maxWidth && width > this.options.maxWidth)
        width = this.options.maxWidth;
    if (this.useTop && this.useLeft && Window.hasEffectLib && Effect.ResizeWindow && useEffect) {
        new Effect.ResizeWindow(this, null, null, width, height, {duration: Window.resizeEffectDuration});
    } else {
        this.width = width;
        this.height = height;
        var e = this.currentDrag ? this.currentDrag : this.element;
        e.setStyle({width: width + this.widthW + this.widthE + "px"})
        e.setStyle({height: height + this.heightN + this.heightS + "px"})
        if (!this.currentDrag || this.currentDrag == this.element) {
            var content = $(this.element.id + '_content');
            content.setStyle({height: height + 'px'});
            content.setStyle({width: width + 'px'});
        }
    }
}, updateHeight: function () {
    this.setSize(this.width, this.content.scrollHeight, true);
}, updateWidth: function () {
    this.setSize(this.content.scrollWidth, this.height, true);
}, toFront: function () {
    if (this.element.style.zIndex < Windows.maxZIndex)
        this.setZIndex(Windows.maxZIndex + 1);
    this._notify("onFocus");
    if (this.iefix)
        this._fixIEOverlapping();
}, show: function (modal) {
    if (modal) {
        if (typeof this.overlayOpacity == "undefined") {
            var that = this;
            setTimeout(function () {
                that.show(modal)
            }, 10);
            return;
        }
        Windows.addModalWindow(this);
        this.modal = true;
        this.setZIndex(Windows.maxZIndex + 1);
        Windows.unsetOverflow(this);
    }
    else if (!this.element.style.zIndex)
        this.setZIndex(Windows.maxZIndex++ + 1);
    if (this.oldStyle)
        this.getContent().setStyle({overflow: this.oldStyle});
    if (!this.width || !this.height) {
        var size = WindowUtilities._computeSize(this.content.innerHTML, this.content.id, this.width, this.height, 0, this.options.className)
        if (this.height)
            this.width = size + 5
        else
            this.height = size + 5
    }
    this.setSize(this.width, this.height);
    if (this.centered)
        this._center(this.centerTop, this.centerLeft);
    this._notify("onBeforeShow");
    if (this.options.showEffect != Element.show && this.options.showEffectOptions)
        this.options.showEffect(this.element, this.options.showEffectOptions); else
        this.options.showEffect(this.element);
    this._checkIEOverlapping();
    this.visible = true;
    WindowUtilities.focusedWindow = this
    this._notify("onShow");
}, showCenter: function (modal, top, left) {
    this.centered = true;
    this.centerTop = top;
    this.centerLeft = left;
    this.show(modal);
}, isVisible: function () {
    return this.visible;
}, _center: function (top, left) {
    var windowScroll = WindowUtilities.getWindowScroll();
    var pageSize = WindowUtilities.getPageSize();
    if (typeof top == "undefined")
        top = (pageSize.windowHeight - (this.height + this.heightN + this.heightS)) / 2;
    top += windowScroll.top
    if (typeof left == "undefined")
        left = (pageSize.windowWidth - (this.width + this.widthW + this.widthE)) / 2;
    left += windowScroll.left
    this.setLocation(top, left);
    this.toFront();
}, _recenter: function (event) {
    if (this.centered) {
        var pageSize = WindowUtilities.getPageSize();
        if (this.pageSize && this.pageSize.windowWidth == pageSize.windowWidth && this.pageSize.windowHeight == pageSize.windowHeight)
            return;
        this.pageSize = pageSize;
        if ($('overlay_modal'))
            $('overlay_modal').setStyle({height: (pageSize.pageHeight + 'px')});
        if (this.options.recenterAuto)
            this._center(this.centerTop, this.centerLeft);
    }
}, hide: function () {
    this.visible = false;
    if (this.modal) {
        Windows.removeModalWindow(this);
        Windows.resetOverflow();
    }
    this.oldStyle = this.getContent().getStyle('overflow') || "auto"
    this.getContent().setStyle({overflow: "hidden"});
    this.options.hideEffect(this.element, this.options.hideEffectOptions);
    if (this.iefix)
        this.iefix.hide();
    if (!this.doNotNotifyHide)
        this._notify("onHide");
}, close: function () {
    if (this.visible) {
        if (this.options.closeCallback && !this.options.closeCallback(this))
            return;
        if (this.options.destroyOnClose) {
            var destroyFunc = this.destroy.bind(this);
            if (this.options.hideEffectOptions.afterFinish) {
                var func = this.options.hideEffectOptions.afterFinish;
                this.options.hideEffectOptions.afterFinish = function () {
                    func();
                    destroyFunc()
                }
            }
            else
                this.options.hideEffectOptions.afterFinish = function () {
                    destroyFunc()
                }
        }
        Windows.updateFocusedWindow();
        this.doNotNotifyHide = true;
        this.hide();
        this.doNotNotifyHide = false;
        this._notify("onClose");
    }
}, minimize: function () {
    if (this.resizing)
        return;
    var r2 = $(this.getId() + "_row2");
    if (!this.minimized) {
        this.minimized = true;
        var dh = r2.getDimensions().height;
        this.r2Height = dh;
        var h = this.element.getHeight() - dh;
        if (this.useLeft && this.useTop && Window.hasEffectLib && Effect.ResizeWindow) {
            new Effect.ResizeWindow(this, null, null, null, this.height - dh, {duration: Window.resizeEffectDuration});
        } else {
            this.height -= dh;
            this.element.setStyle({height: h + "px"});
            r2.hide();
        }
        if (!this.useTop) {
            var bottom = parseFloat(this.element.getStyle('bottom'));
            this.element.setStyle({bottom: (bottom + dh) + 'px'});
        }
    }
    else {
        this.minimized = false;
        var dh = this.r2Height;
        this.r2Height = null;
        if (this.useLeft && this.useTop && Window.hasEffectLib && Effect.ResizeWindow) {
            new Effect.ResizeWindow(this, null, null, null, this.height + dh, {duration: Window.resizeEffectDuration});
        }
        else {
            var h = this.element.getHeight() + dh;
            this.height += dh;
            this.element.setStyle({height: h + "px"})
            r2.show();
        }
        if (!this.useTop) {
            var bottom = parseFloat(this.element.getStyle('bottom'));
            this.element.setStyle({bottom: (bottom - dh) + 'px'});
        }
        this.toFront();
    }
    this._notify("onMinimize");
    this._saveCookie()
}, maximize: function () {
    if (this.isMinimized() || this.resizing)
        return;
    if (window.ie && this.heightN == 0)
        this._getWindowBorderSize();
    if (this.storedLocation != null) {
        this._restoreLocation();
        if (this.iefix)
            this.iefix.hide();
    }
    else {
        this._storeLocation();
        Windows.unsetOverflow(this);
        var windowScroll = WindowUtilities.getWindowScroll();
        var pageSize = WindowUtilities.getPageSize();
        var left = windowScroll.left;
        var top = windowScroll.top;
        if (this.options.parent != document.body) {
            windowScroll = {top: 0, left: 0, bottom: 0, right: 0};
            var dim = this.options.parent.getDimensions();
            pageSize.windowWidth = dim.width;
            pageSize.windowHeight = dim.height;
            top = 0;
            left = 0;
        }
        if (this.constraint) {
            pageSize.windowWidth -= Math.max(0, this.constraintPad.left) + Math.max(0, this.constraintPad.right);
            pageSize.windowHeight -= Math.max(0, this.constraintPad.top) + Math.max(0, this.constraintPad.bottom);
            left += Math.max(0, this.constraintPad.left);
            top += Math.max(0, this.constraintPad.top);
        }
        var width = pageSize.windowWidth - this.widthW - this.widthE;
        var height = pageSize.windowHeight - this.heightN - this.heightS;
        if (this.useLeft && this.useTop && Window.hasEffectLib && Effect.ResizeWindow) {
            new Effect.ResizeWindow(this, top, left, width, height, {duration: Window.resizeEffectDuration});
        }
        else {
            this.setSize(width, height);
            this.element.setStyle(this.useLeft ? {left: left} : {right: left});
            this.element.setStyle(this.useTop ? {top: top} : {bottom: top});
        }
        this.toFront();
        if (this.iefix)
            this._fixIEOverlapping();
    }
    this._notify("onMaximize");
    this._saveCookie()
}, isMinimized: function () {
    return this.minimized;
}, isMaximized: function () {
    return(this.storedLocation != null);
}, setOpacity: function (opacity) {
    if (Element.setOpacity)
        Element.setOpacity(this.element, opacity);
}, setZIndex: function (zindex) {
    this.element.setStyle({zIndex: zindex});
    Windows.updateZindex(zindex, this);
}, setTitle: function (newTitle) {
    if (!newTitle || newTitle == "")
        newTitle = "&nbsp;";
    Element.update(this.element.id + '_top', newTitle);
}, setStatusBar: function (element) {
    var statusBar = $(this.getId() + "_bottom");
    if (typeof(element) == "object") {
        if (this.bottombar.firstChild)
            this.bottombar.replaceChild(element, this.bottombar.firstChild); else
            this.bottombar.appendChild(element);
    }
    else
        this.bottombar.innerHTML = element;
}, _checkIEOverlapping: function () {
    if (!this.iefix && (navigator.appVersion.indexOf('MSIE') > 0) && (navigator.userAgent.indexOf('Opera') < 0) && (this.element.getStyle('position') == 'absolute')) {
        new Insertion.After(this.element.id, '<iframe id="' + this.element.id + '_iefix" ' + 'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' + 'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
        this.iefix = $(this.element.id + '_iefix');
    }
    if (this.iefix)
        setTimeout(this._fixIEOverlapping.bind(this), 50);
}, _fixIEOverlapping: function () {
    Position.clone(this.element, this.iefix);
    this.iefix.style.zIndex = this.element.style.zIndex - 1;
    this.iefix.show();
}, _getWindowBorderSize: function (event) {
    var div = this._createHiddenDiv(this.options.className + "_n")
    this.heightN = Element.getDimensions(div).height;
    div.parentNode.removeChild(div)
    var div = this._createHiddenDiv(this.options.className + "_s")
    this.heightS = Element.getDimensions(div).height;
    div.parentNode.removeChild(div)
    var div = this._createHiddenDiv(this.options.className + "_e")
    this.widthE = Element.getDimensions(div).width;
    div.parentNode.removeChild(div)
    var div = this._createHiddenDiv(this.options.className + "_w")
    this.widthW = Element.getDimensions(div).width;
    div.parentNode.removeChild(div);
    var div = document.createElement("div");
    div.className = "overlay_" + this.options.className;
    document.body.appendChild(div);
    var that = this;
    setTimeout(function () {
        that.overlayOpacity = ($(div).getStyle("opacity"));
        div.parentNode.removeChild(div);
    }, 10);
    if (window.ie) {
        this.heightS = $(this.getId() + "_row3").getDimensions().height;
        this.heightN = $(this.getId() + "_row1").getDimensions().height;
    }
    if (window.khtml && !window.webkit)
        this.setSize(this.width, this.height);
    if (this.doMaximize)
        this.maximize();
    if (this.doMinimize)
        this.minimize();
}, _createHiddenDiv: function (className) {
    var objBody = document.body;
    var win = document.createElement("div");
    win.setAttribute('id', this.element.id + "_tmp");
    win.className = className;
    win.style.display = 'none';
    win.innerHTML = '';
    objBody.insertBefore(win, objBody.firstChild);
    return win;
}, _storeLocation: function () {
    if (this.storedLocation == null) {
        this.storedLocation = {useTop: this.useTop, useLeft: this.useLeft, top: this.element.getStyle('top'), bottom: this.element.getStyle('bottom'), left: this.element.getStyle('left'), right: this.element.getStyle('right'), width: this.width, height: this.height};
    }
}, _restoreLocation: function () {
    if (this.storedLocation != null) {
        this.useLeft = this.storedLocation.useLeft;
        this.useTop = this.storedLocation.useTop;
        if (this.useLeft && this.useTop && Window.hasEffectLib && Effect.ResizeWindow)
            new Effect.ResizeWindow(this, this.storedLocation.top, this.storedLocation.left, this.storedLocation.width, this.storedLocation.height, {duration: Window.resizeEffectDuration}); else {
            this.element.setStyle(this.useLeft ? {left: this.storedLocation.left} : {right: this.storedLocation.right});
            this.element.setStyle(this.useTop ? {top: this.storedLocation.top} : {bottom: this.storedLocation.bottom});
            this.setSize(this.storedLocation.width, this.storedLocation.height);
        }
        Windows.resetOverflow();
        this._removeStoreLocation();
    }
}, _removeStoreLocation: function () {
    this.storedLocation = null;
}, _saveCookie: function () {
    if (this.cookie) {
        var value = "";
        if (this.useLeft)
            value += "l:" + (this.storedLocation ? this.storedLocation.left : this.element.getStyle('left'))
        else
            value += "r:" + (this.storedLocation ? this.storedLocation.right : this.element.getStyle('right'))
        if (this.useTop)
            value += ",t:" + (this.storedLocation ? this.storedLocation.top : this.element.getStyle('top'))
        else
            value += ",b:" + (this.storedLocation ? this.storedLocation.bottom : this.element.getStyle('bottom'))
        value += "," + (this.storedLocation ? this.storedLocation.width : this.width);
        value += "," + (this.storedLocation ? this.storedLocation.height : this.height);
        value += "," + this.isMinimized();
        value += "," + this.isMaximized();
        WindowUtilities.setCookie(value, this.cookie)
    }
}, _createWiredElement: function () {
    if (!this.wiredElement) {
        if (window.ie)
            this._getWindowBorderSize();
        var div = document.createElement("div");
        div.className = "wired_frame " + this.options.className + "_wired_frame";
        div.style.position = 'absolute';
        this.options.parent.insertBefore(div, this.options.parent.firstChild);
        this.wiredElement = $(div);
    }
    if (this.useLeft)
        this.wiredElement.setStyle({left: this.element.getStyle('left')}); else
        this.wiredElement.setStyle({right: this.element.getStyle('right')});
    if (this.useTop)
        this.wiredElement.setStyle({top: this.element.getStyle('top')}); else
        this.wiredElement.setStyle({bottom: this.element.getStyle('bottom')});
    var dim = this.element.getDimensions();
    this.wiredElement.setStyle({width: dim.width + "px", height: dim.height + "px"});
    this.wiredElement.setStyle({zIndex: Windows.maxZIndex + 30});
    return this.wiredElement;
}, _hideWiredElement: function () {
    if (!this.wiredElement || !this.currentDrag)
        return;
    if (this.currentDrag == this.element)
        this.currentDrag = null; else {
        if (this.useLeft)
            this.element.setStyle({left: this.currentDrag.getStyle('left')}); else
            this.element.setStyle({right: this.currentDrag.getStyle('right')});
        if (this.useTop)
            this.element.setStyle({top: this.currentDrag.getStyle('top')}); else
            this.element.setStyle({bottom: this.currentDrag.getStyle('bottom')});
        this.currentDrag.hide();
        this.currentDrag = null;
        if (this.doResize)
            this.setSize(this.width, this.height);
    }
}, _notify: function (eventName) {
    if (this.options[eventName])
        this.options[eventName](this); else
        Windows.notify(eventName, this);
}};
var Windows = {windows: [], modalWindows: [], observers: [], focusedWindow: null, maxZIndex: 0, overlayShowEffectOptions: {duration: 0.5}, overlayHideEffectOptions: {duration: 0.5}, addObserver: function (observer) {
    this.removeObserver(observer);
    this.observers.push(observer);
}, removeObserver: function (observer) {
    this.observers = this.observers.reject(function (o) {
        return o == observer
    });
}, notify: function (eventName, win) {
    this.observers.each(function (o) {
        if (o[eventName])o[eventName](eventName, win);
    });
}, getWindow: function (id) {
    return this.windows.detect(function (d) {
        return d.getId() == id
    });
}, getFocusedWindow: function () {
    return this.focusedWindow;
}, updateFocusedWindow: function () {
    this.focusedWindow = this.windows.length >= 2 ? this.windows[this.windows.length - 2] : null;
}, register: function (win) {
    this.windows.push(win);
}, addModalWindow: function (win) {
    if (this.modalWindows.length == 0)
        WindowUtilities.disableScreen(win.options.className, 'overlay_modal', win.overlayOpacity, win.getId()); else {
        if (Window.keepMultiModalWindow) {
            $('overlay_modal').style.zIndex = Windows.maxZIndex + 1;
            Windows.maxZIndex += 1;
            WindowUtilities._hideSelect(this.modalWindows.last().getId());
        }
        else
            this.modalWindows.last().element.hide();
        WindowUtilities._showSelect(win.getId());
    }
    this.modalWindows.push(win);
}, removeModalWindow: function (win) {
    this.modalWindows.pop();
    if (this.modalWindows.length == 0)
        WindowUtilities.enableScreen(); else {
        if (Window.keepMultiModalWindow) {
            this.modalWindows.last().toFront();
            WindowUtilities._showSelect(this.modalWindows.last().getId());
        }
        else
            this.modalWindows.last().element.show();
    }
}, register: function (win) {
    this.windows.push(win);
}, unregister: function (win) {
    this.windows = this.windows.reject(function (d) {
        return d == win
    });
}, closeAll: function () {
    this.windows.each(function (w) {
        Windows.close(w.getId())
    });
}, closeAllModalWindows: function () {
    WindowUtilities.enableScreen();
    this.modalWindows.each(function (win) {
        if (win)win.close()
    });
}, minimize: function (id, event) {
    var win = this.getWindow(id)
    if (win && win.visible)
        win.minimize();
    Event.stop(event);
}, maximize: function (id, event) {
    var win = this.getWindow(id)
    if (win && win.visible)
        win.maximize();
    Event.stop(event);
}, close: function (id, event) {
    var win = this.getWindow(id);
    if (win)
        win.close();
    if (event)
        Event.stop(event);
}, unsetOverflow: function (except) {
    this.windows.each(function (d) {
        d.oldOverflow = d.getContent().getStyle("overflow") || "auto";
        d.getContent().setStyle({overflow: "hidden"})
    });
    if (except && except.oldOverflow)
        except.getContent().setStyle({overflow: except.oldOverflow});
}, resetOverflow: function () {
    this.windows.each(function (d) {
        if (d.oldOverflow)d.getContent().setStyle({overflow: d.oldOverflow})
    });
}, updateZindex: function (zindex, win) {
    if (zindex > this.maxZIndex)
        this.maxZIndex = zindex;
    this.focusedWindow = win;
}};
var Dialog = {dialogId: null, onCompleteFunc: null, callFunc: null, parameters: null, confirm: function (content, parameters) {
    if (content && typeof content != "string") {
        Dialog._runAjaxRequest(content, parameters, Dialog.confirm);
        return
    }
    content = content || "";
    parameters = parameters || {};
    var okLabel = parameters.okLabel ? parameters.okLabel : "Ok";
    var cancelLabel = parameters.cancelLabel ? parameters.cancelLabel : "Cancel";
    parameters = Object.extend(parameters, parameters.windowParameters || {});
    parameters.windowParameters = parameters.windowParameters || {};
    parameters.className = parameters.className || "alert";
    var okButtonClass = "class ='" + (parameters.buttonClass ? parameters.buttonClass + " " : "") + " ok_button'"
    var cancelButtonClass = "class ='" + (parameters.buttonClass ? parameters.buttonClass + " " : "") + " cancel_button'"
    var content = "\
      <div class='" + parameters.className + "_message'>" + content + "</div>\
        <div class='" + parameters.className + "_buttons'>\
          <input type='button' value='" + okLabel + "' onclick='Dialog.okCallback()' " + okButtonClass + "/>\
          <input type='button' value='" + cancelLabel + "' onclick='Dialog.cancelCallback()' " + cancelButtonClass + "/>\
        </div>\
    ";
    return this._openDialog(content, parameters)
}, alert: function (content, parameters) {
    if (content && typeof content != "string") {
        Dialog._runAjaxRequest(content, parameters, Dialog.alert);
        return
    }
    content = content || "";
    parameters = parameters || {};
    var okLabel = parameters.okLabel ? parameters.okLabel : "Ok";
    parameters = Object.extend(parameters, parameters.windowParameters || {});
    parameters.windowParameters = parameters.windowParameters || {};
    parameters.className = parameters.className || "alert";
    var okButtonClass = "class ='" + (parameters.buttonClass ? parameters.buttonClass + " " : "") + " ok_button'"
    var content = "\
      <div class='" + parameters.className + "_message'>" + content + "</div>\
        <div class='" + parameters.className + "_buttons'>\
          <input type='button' value='" + okLabel + "' onclick='Dialog.okCallback()' " + okButtonClass + "/>\
        </div>";
    return this._openDialog(content, parameters)
}, info: function (content, parameters) {
    if (content && typeof content != "string") {
        Dialog._runAjaxRequest(content, parameters, Dialog.info);
        return
    }
    content = content || "";
    parameters = parameters || {};
    parameters = Object.extend(parameters, parameters.windowParameters || {});
    parameters.windowParameters = parameters.windowParameters || {};
    parameters.className = parameters.className || "alert";
    var content = "<div id='modal_dialog_message' class='" + parameters.className + "_message'>" + content + "</div>";
    if (parameters.showProgress)
        content += "<div id='modal_dialog_progress' class='" + parameters.className + "_progress'>  </div>";
    parameters.ok = null;
    parameters.cancel = null;
    return this._openDialog(content, parameters)
}, setInfoMessage: function (message) {
    $('modal_dialog_message').update(message);
}, closeInfo: function () {
    Windows.close(this.dialogId);
}, _openDialog: function (content, parameters) {
    var className = parameters.className;
    if (!parameters.height && !parameters.width) {
        parameters.width = WindowUtilities.getPageSize().pageWidth / 2;
    }
    if (parameters.id)
        this.dialogId = parameters.id; else {
        var t = new Date();
        this.dialogId = 'modal_dialog_' + t.getTime();
        parameters.id = this.dialogId;
    }
    if (!parameters.height || !parameters.width) {
        var size = WindowUtilities._computeSize(content, this.dialogId, parameters.width, parameters.height, 5, className)
        if (parameters.height)
            parameters.width = size + 5
        else
            parameters.height = size + 5
    }
    parameters.resizable = parameters.resizable || false;
    parameters.effectOptions = parameters.effectOptions;
    parameters.minimizable = false;
    parameters.maximizable = false;
    parameters.draggable = false;
    parameters.closable = false;
    var win = new Window(parameters);
    win.getContent().innerHTML = content;
    win.showCenter(true, parameters.top, parameters.left);
    win.setDestroyOnClose();
    win.cancelCallback = parameters.onCancel || parameters.cancel;
    win.okCallback = parameters.onOk || parameters.ok;
    return win;
}, _getAjaxContent: function (originalRequest) {
    Dialog.callFunc(originalRequest.responseText, Dialog.parameters)
}, _runAjaxRequest: function (message, parameters, callFunc) {
    if (message.options == null)
        message.options = {}
    Dialog.onCompleteFunc = message.options.onComplete;
    Dialog.parameters = parameters;
    Dialog.callFunc = callFunc;
    message.options.onComplete = Dialog._getAjaxContent;
    new Ajax.Request(message.url, message.options);
}, okCallback: function () {
    var win = Windows.focusedWindow;
    if (!win.okCallback || win.okCallback(win)) {
        $$("#" + win.getId() + " input").each(function (element) {
            element.onclick = null;
        })
        win.close();
    }
}, cancelCallback: function () {
    var win = Windows.focusedWindow;
    $$("#" + win.getId() + " input").each(function (element) {
        element.onclick = null
    })
    win.close();
    if (win.cancelCallback)
        win.cancelCallback(win);
}}
if (window.ActiveXObject)window.ie = window[window.XMLHttpRequest ? 'ie7' : 'ie6'] = true; else if (document.childNodes && !document.all && !navigator.taintEnabled)window.khtml = true; else if (document.getBoxObjectFor != null)window.gecko = true;
{
    var array = navigator.userAgent.match(new RegExp(/AppleWebKit\/([\d\.\+]*)/));
    window.webkit = array && array.length == 2 ? parseFloat(array[1]) >= 420 : false;
}
var WindowUtilities = {getWindowScroll: function () {
    var w = window;
    var T, L, W, H;
    L = window.pageXOffset || document.documentElement.scrollLeft;
    T = window.pageYOffset || document.documentElement.scrollTop;
    if (window.ie)
        W = Math.max(document.documentElement.offsetWidth, document.documentElement.scrollWidth); else if (window.khtml)
        W = document.body.scrollWidth; else
        W = document.documentElement.scrollWidth;
    if (window.ie)
        H = Math.max(document.documentElement.offsetHeight, document.documentElement.scrollHeight); else if (window.khtml)
        H = document.body.scrollHeight; else
        H = document.documentElement.scrollHeight;
    return{top: T, left: L, width: W, height: H};
}, getPageSize: function () {
    var xScroll, yScroll;
    if (window.innerHeight && window.scrollMaxY) {
        xScroll = document.body.scrollWidth;
        yScroll = window.innerHeight + window.scrollMaxY;
    } else if (document.body.scrollHeight > document.body.offsetHeight) {
        xScroll = document.body.scrollWidth;
        yScroll = document.body.scrollHeight;
    } else {
        xScroll = document.body.offsetWidth;
        yScroll = document.body.offsetHeight;
    }
    var windowWidth, windowHeight;
    if (self.innerHeight) {
        windowWidth = self.innerWidth;
        windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
        windowWidth = document.documentElement.clientWidth;
        windowHeight = document.documentElement.clientHeight;
    } else if (document.body) {
        windowWidth = document.body.clientWidth;
        windowHeight = document.body.clientHeight;
    }
    var pageHeight, pageWidth;
    if (yScroll < windowHeight) {
        pageHeight = windowHeight;
    } else {
        pageHeight = yScroll;
    }
    if (xScroll < windowWidth) {
        pageWidth = windowWidth;
    } else {
        pageWidth = xScroll;
    }
    return{pageWidth: pageWidth, pageHeight: pageHeight, windowWidth: windowWidth, windowHeight: windowHeight};
}, disableScreen: function (className, overlayId, overlayOpacity, contentId) {
    var that = this;
    WindowUtilities.initLightbox(overlayId, className, function () {
        that._disableScreen(className, overlayId, overlayOpacity, contentId)
    });
}, _disableScreen: function (className, overlayId, overlayOpacity, contentId) {
    var objBody = document.body;
    var objOverlay = $(overlayId);
    var pageSize = WindowUtilities.getPageSize();
    if (contentId && window.ie) {
        WindowUtilities._hideSelect();
        WindowUtilities._showSelect(contentId);
    }
    objOverlay.style.height = (pageSize.pageHeight + 'px');
    objOverlay.style.display = 'none';
    if (overlayId == "overlay_modal" && Window.hasEffectLib && Windows.overlayShowEffectOptions) {
        objOverlay.overlayOpacity = overlayOpacity;
        new Effect.Appear(objOverlay, Object.extend({from: 0, to: overlayOpacity}, Windows.overlayShowEffectOptions));
    }
    else
        objOverlay.style.display = "block";
}, enableScreen: function (id) {
    id = id || 'overlay_modal';
    var objOverlay = $(id);
    if (objOverlay) {
        if (id == "overlay_modal" && Window.hasEffectLib && Windows.overlayHideEffectOptions)
            new Effect.Fade(objOverlay, Object.extend({from: objOverlay.overlayOpacity, to: 0}, Windows.overlayHideEffectOptions)); else {
            objOverlay.style.display = 'none';
            objOverlay.parentNode.removeChild(objOverlay);
        }
        if (id != "__invisible__")
            WindowUtilities._showSelect();
    }
}, _hideSelect: function (id) {
    if (window.ie) {
        id = id == null ? "" : "#" + id + " ";
        $$(id + 'select').each(function (element) {
            if (!WindowUtilities.isDefined(element.oldVisibility)) {
                element.oldVisibility = element.style.visibility ? element.style.visibility : "visible";
                element.style.visibility = "hidden";
            }
        });
    }
}, _showSelect: function (id) {
    if (window.ie) {
        id = id == null ? "" : "#" + id + " ";
        $$(id + 'select').each(function (element) {
            if (WindowUtilities.isDefined(element.oldVisibility)) {
                try {
                    element.style.visibility = element.oldVisibility;
                } catch (e) {
                    element.style.visibility = "visible";
                }
                element.oldVisibility = null;
            }
            else {
                if (element.style.visibility)
                    element.style.visibility = "visible";
            }
        });
    }
}, isDefined: function (object) {
    return typeof(object) != "undefined" && object != null;
}, initLightbox: function (id, className, doneHandler) {
    if ($(id)) {
        Element.setStyle(id, {zIndex: Windows.maxZIndex + 1});
        Windows.maxZIndex++;
        doneHandler();
    }
    else {
        var objBody = document.body;
        var objOverlay = document.createElement("div");
        objOverlay.setAttribute('id', id);
        objOverlay.className = "overlay_" + className
        objOverlay.style.display = 'none';
        objOverlay.style.position = 'absolute';
        objOverlay.style.top = '0';
        objOverlay.style.left = '0';
        objOverlay.style.zIndex = Windows.maxZIndex + 1;
        Windows.maxZIndex++;
        objOverlay.style.width = '100%';
        objBody.insertBefore(objOverlay, objBody.firstChild);
        if (window.khtml && id == "overlay_modal") {
            setTimeout(function () {
                doneHandler()
            }, 10);
        }
        else
            doneHandler();
    }
}, setCookie: function (value, parameters) {
    document.cookie = parameters[0] + "=" + escape(value) +
        ((parameters[1]) ? "; expires=" + parameters[1].toGMTString() : "") +
        ((parameters[2]) ? "; path=" + parameters[2] : "") +
        ((parameters[3]) ? "; domain=" + parameters[3] : "") +
        ((parameters[4]) ? "; secure" : "");
}, getCookie: function (name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0)return null;
    } else {
        begin += 2;
    }
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
        end = dc.length;
    }
    return unescape(dc.substring(begin + prefix.length, end));
}, _computeSize: function (content, id, width, height, margin, className) {
    var objBody = document.body;
    var tmpObj = document.createElement("div");
    tmpObj.setAttribute('id', id);
    tmpObj.className = className + "_content";
    if (height)
        tmpObj.style.height = height + "px"
    else
        tmpObj.style.width = width + "px"
    tmpObj.style.position = 'absolute';
    tmpObj.style.top = '0';
    tmpObj.style.left = '0';
    tmpObj.style.display = 'none';
    tmpObj.innerHTML = content;
    objBody.insertBefore(tmpObj, objBody.firstChild);
    var size;
    if (height)
        size = $(id).getDimensions().width + margin; else
        size = $(id).getDimensions().height + margin;
    objBody.removeChild(tmpObj);
    return size;
}}
Effect.ResizeWindow = Class.create();
Object.extend(Object.extend(Effect.ResizeWindow.prototype, Effect.Base.prototype), {initialize: function (win, top, left, width, height) {
    this.window = win;
    this.window.resizing = true;
    var size = win.getSize();
    this.initWidth = parseFloat(size.width);
    this.initHeight = parseFloat(size.height);
    var location = win.getLocation();
    this.initTop = parseFloat(location.top);
    this.initLeft = parseFloat(location.left);
    this.width = width != null ? parseFloat(width) : this.initWidth;
    this.height = height != null ? parseFloat(height) : this.initHeight;
    this.top = top != null ? parseFloat(top) : this.initTop;
    this.left = left != null ? parseFloat(left) : this.initLeft;
    this.dx = this.left - this.initLeft;
    this.dy = this.top - this.initTop;
    this.dw = this.width - this.initWidth;
    this.dh = this.height - this.initHeight;
    this.r2 = $(this.window.getId() + "_row2");
    this.content = $(this.window.getId() + "_content");
    this.contentOverflow = this.content.getStyle("overflow") || "auto";
    this.content.setStyle({overflow: "hidden"});
    if (this.window.options.wiredDrag) {
        this.window.currentDrag = win._createWiredElement();
        this.window.currentDrag.show();
        this.window.element.hide();
    }
    this.start(arguments[5]);
}, update: function (position) {
    var width = Math.floor(this.initWidth + this.dw * position);
    var height = Math.floor(this.initHeight + this.dh * position);
    var top = Math.floor(this.initTop + this.dy * position);
    var left = Math.floor(this.initLeft + this.dx * position);
    if (window.ie) {
        if (Math.floor(height) == 0)
            this.r2.hide(); else if (Math.floor(height) > 1)
            this.r2.show();
    }
    this.r2.setStyle({height: height});
    this.window.setSize(width, height);
    this.window.setLocation(top, left);
}, finish: function (position) {
    if (this.window.options.wiredDrag) {
        this.window._hideWiredElement();
        this.window.element.show();
    }
    this.window.setSize(this.width, this.height);
    this.window.setLocation(this.top, this.left);
    this.r2.setStyle({height: null});
    this.content.setStyle({overflow: this.contentOverflow});
    this.window.resizing = false;
}});
Effect.ModalSlideDown = function (element) {
    var windowScroll = WindowUtilities.getWindowScroll();
    var height = element.getStyle("height");
    element.setStyle({top: -(parseFloat(height) - windowScroll.top) + "px"});
    element.show();
    return new Effect.Move(element, Object.extend({x: 0, y: parseFloat(height)}, arguments[1] || {}));
};
Effect.ModalSlideUp = function (element) {
    var height = element.getStyle("height");
    return new Effect.Move(element, Object.extend({x: 0, y: -parseFloat(height)}, arguments[1] || {}));
};
function openWaiter() {
    Dialog.info($('waiter').innerHTML, {className: "waiter", width: 250, height: 100, id: "wait-dlg"})
}
function updateWaiterDialog(message) {
    $('waiter_message').innerHTML = message;
}
function closeWaiter() {
    Windows.closeAllModalWindows();
    return true;
}
function disableCheckBoxesIn(name) {
    var table = document.getElementById(name);
    var listOfInputs = table.getElementsByTagName("input");
    var i;
    for (i = 0; i < listOfInputs.length; i++) {
        if (listOfInputs[i].type == "checkbox") {
            listOfInputs[i].disabled = true;
        }
    }
}
function enableCheckBoxesIn(name) {
    var table = document.getElementById(name);
    var listOfInputs = table.getElementsByTagName("input");
    var i;
    for (i = 0; i < listOfInputs.length; i++) {
        if (listOfInputs[i].type == "checkbox") {
            listOfInputs[i].disabled = false;
        }
    }
}
function isOneCheckBoxChecked(name) {
    var table = document.getElementById(name);
    if (table) {
        var listOfInputs = table.getElementsByTagName("input");
        var i;
        var se
        for (i = 0; i < listOfInputs.length; i++) {
            if (listOfInputs[i].type == "checkbox") {
                if (listOfInputs[i].checked)
                    return true;
            }
        }
        return false;
    }
    else
        return false;
}
function onSelectAllCheckboxClick(tableName, checked) {
    var table = document.getElementById(tableName);
    var listOfInputs = table.getElementsByTagName("input");
    var i;
    for (i = 0; i < listOfInputs.length; i++) {
        if (listOfInputs[i].type == "checkbox") {
            listOfInputs[i].disabled = true;
            listOfInputs[i].checked = checked;
        }
    }
}
function confirmAction(name) {
    var confirmBegin = "#{messages['label.documents.confirmActionBegin']} ";
    var confirmEnd = "#{messages['label.documents.confirmActionEnd']}";
    var finalStringConfirm = confirmBegin + name + confirmEnd;
    return confirm(finalStringConfirm);
}
function blankSuggestionInput(parent) {
    var children;
    if (typeof parent.children == 'undefined') {
        children = parent.childNodes;
    } else {
        children = parent.children;
    }
    children[0].value = '';
}
function trapEnter(evt, submitButtonId) {
    var keycode;
    if (evt); else if (window.event)
        evt = window.event; else if (event)
        evt = event; else
        return true;
    if (evt.charCode)
        keycode = evt.charCode; else if (evt.keyCode)
        keycode = evt.keyCode; else if (evt.which)
        keycode = evt.which; else
        keycode = 0;
    if (keycode == 13) {
        var button = document.getElementById(submitButtonId);
        if (button != null) {
            button.select();
        }
        return false;
    } else {
        return true;
    }
}
jQuery.noConflict();
(function (jQuery) {
    var menu, shadow, trigger, content, hash, currentTarget;
    var defaults = {eventPosX: 'pageX', eventPosY: 'pageY', shadow: true, onContextMenu: null, onShowMenu: null, bind: 'contextmenu', useFilter: true, anchor: 'body', ctxMenuStyle: 'ctxMenuStyle', ctxMenuItemHoverStyle: 'ctxMenuItemHoverStyle', ctxMenuItemStyle: 'ctxMenuItemStyle', ctxMenuImg: 'ctxMenuImg'};
    jQuery.fn.contextMenu = function (id, options) {
        if (!options)
            options = {};
        hash = hash || [];
        hash.push({id: id, bindings: options.bindings || null, shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow, onContextMenu: options.onContextMenu || defaults.onContextMenu, onShowMenu: options.onShowMenu || defaults.onShowMenu, eventPosX: options.eventPosX || defaults.eventPosX, eventPosY: options.eventPosY || defaults.eventPosY, bind: options.bind || defaults.bind, useFilter: options.useFilter || options.useFilter === false ? options.useFilter : defaults.useFilter, anchor: options.anchor || defaults.anchor, ctxMenuStyle: options.ctxMenuStyle || defaults.ctxMenuStyle, ctxMenuItemHoverStyle: options.ctxMenuItemHoverStyle || defaults.ctxMenuItemHoverStyle, ctxMenuItemStyle: options.ctxMenuItemStyle || defaults.ctxMenuItemStyle, ctxMenuImg: options.ctxMenuImg || defaults.ctxMenuImg});
        var index = hash.length - 1;
        if (!menu) {
            menu = jQuery('<div id="jqContextMenu"></div>').hide().css({position: 'absolute', zIndex: '500'}).appendTo(hash[index].anchor).bind('click', function (e) {
                e.stopPropagation();
            });
        }
        if (!shadow) {
            shadow = jQuery('<div></div>').addClass('ctxMenuShadow').appendTo(hash[index].anchor).hide();
        }
        jQuery(this).bind(hash[index].bind, function (e) {
            var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
            if (bShowContext)display(index, this, e, hash[index]);
            return false;
        });
        return this;
    };
    function display(index, trigger, e, options) {
        var cur = hash[index];
        content = jQuery('#' + cur.id).find('ul:first').clone(true);
        content.addClass(options.ctxMenuStyle);
        content.find('li').addClass(options.ctxMenuItemStyle).hover(function () {
            jQuery(this).toggleClass(options.ctxMenuItemHoverStyle);
            jQuery(this).toggleClass(options.ctxMenuItemStyle);
        },function () {
            jQuery(this).toggleClass(options.ctxMenuItemHoverStyle);
            jQuery(this).toggleClass(options.ctxMenuItemStyle);
        }).find('img').addClass(options.ctxMenuImg);
        content.find('li').bind('click', hide);
        menu.html(content);
        if (!!cur.onShowMenu)menu = cur.onShowMenu(e, menu);
        if (!cur.bindings) {
            cur.bindings = {};
            menuHtml = document.getElementById(cur.id);
            els = menuHtml.getElementsByTagName("li");
            for (i = 0; i < els.length; i++) {
                fct = els[i].getAttribute('action');
                if (fct) {
                    cur.bindings[els[i].id] = eval(fct);
                }
            }
        }
        jQuery.each(cur.bindings, function (id, func) {
            jQuery('#' + id, menu).bind('click', function (e) {
                hide();
                func(getDocRef(trigger), currentTarget, trigger);
            });
        });
        jQuery(document).one('click', hide);
        beforeDisplayCallBack(e, cur, menu, shadow, trigger, e.pageX, e.pageY, options.useFilter);
    }

    function show() {
        menu.show();
        shadow.show();
    }

    function hide() {
        menu.hide();
        shadow.hide();
    }

    jQuery.contextMenu = {defaults: function (userDefaults) {
        jQuery.each(userDefaults, function (i, val) {
            if (typeof val == 'object' && defaults[i]) {
                jQuery.extend(defaults[i], val);
            }
            else defaults[i] = val;
        });
    }};
})(jQuery);
jQuery(function () {
    jQuery('div.contextMenu').hide();
});
var currentMenuContext = {};
function getMenuItemsToHide(docRef) {
    Seam.Component.getInstance("popupHelper").getUnavailableActionId(docRef, getMenuItemsToHideCallBacks);
}
function getMenuItemsToHideCallBacks(actionsToRemove) {
    menu = currentMenuContext['menu'];
    shadow = currentMenuContext['shadow'];
    e = currentMenuContext['e'];
    cur = currentMenuContext['cur'];
    menuX = currentMenuContext['menuX'];
    menuY = currentMenuContext['menuY'];
    if (actionsToRemove) {
        var deleteQuery = null;
        for (i = 0; i < actionsToRemove.length; i++) {
            if (!deleteQuery)
                deleteQuery = '#ctxMenu_' + actionsToRemove[i]; else
                deleteQuery = deleteQuery + ',#ctxMenu_' + actionsToRemove[i];
        }
        if (actionsToRemove.length > 0)
            jQuery(deleteQuery, menu).remove();
    }
    menu.css({'left': menuX, 'top': menuY}).show();
    if (cur.shadow)shadow.css({width: menu.width(), height: menu.height(), left: menuX + 2, top: menuY + 2}).show();
    jQuery(document).one('click', hideMenu);
}
function getDocRef(trigger) {
    return trigger.getAttribute('docref');
}
function beforeDisplayCallBack(e, cur, menu, shadow, trigger, menuX, menuY, useFilter) {
    currentMenuContext = {'e': e, 'cur': cur, 'menu': menu, 'shadow': shadow, 'menuX': menuX, 'menuY': menuY};
    var docRef = getDocRef(trigger);
    if (useFilter) {
        getMenuItemsToHide(docRef);
    } else {
        getMenuItemsToHideCallBacks();
    }
}
function hideMenu() {
    menu = currentMenuContext['menu'];
    shadow = currentMenuContext['shadow'];
    menu.hide();
    shadow.hide();
}
function setupContextMenu(target, id, options) {
    var menuId;
    if (id)menuId = id; else menuId = "popupMenu";
    if (options) {
        if (options.bind)
            options.onContextMenu = function (e) {
                if (e.type == options.bind)
                    return true; else
                    return false;
            }
    }
    jQuery(document).ready(function () {
        jQuery(target).contextMenu(menuId, options);
    });
}

(function (f) {
    function p(a, b, c) {
        var h = c.relative ? a.position().top : a.offset().top, d = c.relative ? a.position().left : a.offset().left, i = c.position[0];
        h -= b.outerHeight() - c.offset[0];
        d += a.outerWidth() + c.offset[1];
        if (/iPad/i.test(navigator.userAgent))h -= f(window).scrollTop();
        var j = b.outerHeight() + a.outerHeight();
        if (i == "center")h += j / 2;
        if (i == "bottom")h += j;
        i = c.position[1];
        a = b.outerWidth() + a.outerWidth();
        if (i == "center")d -= a / 2;
        if (i == "left")d -= a;
        return{top: h, left: d}
    }

    function u(a, b) {
        var c = this, h = a.add(c), d, i = 0, j = 0, m = a.attr("title"), q = a.attr("data-tooltip"), r = o[b.effect], l, s = a.is(":input"), v = s && a.is(":checkbox, :radio, select, :button, :submit"), t = a.attr("type"), k = b.events[t] || b.events[s ? v ? "widget" : "input" : "def"];
        if (!r)throw'Nonexistent effect "' + b.effect + '"';
        k = k.split(/,\s*/);
        if (k.length != 2)throw"Tooltip: bad events configuration for " + t;
        a.bind(k[0],function (e) {
            clearTimeout(i);
            if (b.predelay)j = setTimeout(function () {
                c.show(e)
            }, b.predelay); else c.show(e)
        }).bind(k[1], function (e) {
            clearTimeout(j);
            if (b.delay)i = setTimeout(function () {
                c.hide(e)
            }, b.delay); else c.hide(e)
        });
        if (m && b.cancelDefault) {
            a.removeAttr("title");
            a.data("title", m)
        }
        f.extend(c, {show: function (e) {
            if (!d) {
                if (q)d = f(q); else if (b.tip)d = f(b.tip).eq(0); else if (m)d = f(b.layout).addClass(b.tipClass).appendTo(a.parent()).hide().append(m); else {
                    d = a.next();
                    d.length || (d = a.parent().next())
                }
                if (!d.length)throw"Cannot find tooltip for " + a;
            }
            if (c.isShown())return c;
            d.stop(true, true);
            var g = p(a, d, b);
            b.tip && d.html(a.data("title"));
            e = e || f.Event();
            e.type = "onBeforeShow";
            h.trigger(e, [g]);
            if (e.isDefaultPrevented())return c;
            g = p(a, d, b);
            d.css({position: "absolute", top: g.top, left: g.left});
            l = true;
            r[0].call(c, function () {
                e.type = "onShow";
                l = "full";
                h.trigger(e)
            });
            g = b.events.tooltip.split(/,\s*/);
            if (!d.data("__set")) {
                d.bind(g[0], function () {
                    clearTimeout(i);
                    clearTimeout(j)
                });
                g[1] && !a.is("input:not(:checkbox, :radio), textarea") && d.bind(g[1], function (n) {
                    n.relatedTarget != a[0] && a.trigger(k[1].split(" ")[0])
                });
                d.data("__set", true)
            }
            return c
        }, hide: function (e) {
            if (!d || !c.isShown())return c;
            e = e || f.Event();
            e.type = "onBeforeHide";
            h.trigger(e);
            if (!e.isDefaultPrevented()) {
                l = false;
                o[b.effect][1].call(c, function () {
                    e.type = "onHide";
                    h.trigger(e)
                });
                return c
            }
        }, isShown: function (e) {
            return e ? l == "full" : l
        }, getConf: function () {
            return b
        }, getTip: function () {
            return d
        }, getTrigger: function () {
            return a
        }});
        f.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","), function (e, g) {
            f.isFunction(b[g]) && f(c).bind(g, b[g]);
            c[g] = function (n) {
                n && f(c).bind(g, n);
                return c
            }
        })
    }

    f.tools = f.tools || {version: "1.2.5"};
    f.tools.tooltip = {conf: {effect: "toggle", fadeOutSpeed: "fast", predelay: 500, delay: 30, opacity: 1, tip: 0, position: ["top", "center"], offset: [0, 0], relative: false, cancelDefault: true, events: {def: "mouseenter,mouseleave", input: "focus,blur", widget: "focus mouseenter,blur mouseleave", tooltip: "mouseenter,mouseleave"}, layout: "<div/>", tipClass: "tooltip"}, addEffect: function (a, b, c) {
        o[a] = [b, c]
    }};
    var o = {toggle: [function (a) {
        var b = this.getConf(), c = this.getTip();
        b = b.opacity;
        b < 1 && c.css({opacity: b});
        c.show();
        a.call()
    }, function (a) {
        this.getTip().hide();
        a.call()
    }], fade: [function (a) {
        var b = this.getConf();
        this.getTip().fadeTo(b.fadeInSpeed, b.opacity, a)
    }, function (a) {
        this.getTip().fadeOut(this.getConf().fadeOutSpeed, a)
    }]};
    f.fn.tooltip = function (a) {
        var b = this.data("tooltip");
        if (b)return b;
        a = f.extend(true, {}, f.tools.tooltip.conf, a);
        if (typeof a.position == "string")a.position = a.position.split(/,?\s/);
        this.each(function () {
            b = new u(f(this), a);
            f(this).data("tooltip", b)
        });
        return a.api ? b : this
    }
})(jQuery);
jQuery(function () {
    jQuery('.header_admin_messages .actionHide').each(function () {
        if (jQuery.cookie(buildCookieName(jQuery(this)))) {
            jQuery(this).remove();
            return;
        }
        var hide = jQuery('<a><img src="icons/action_clipboard_remove.gif" alt="hide" /></a>').attr({href: '#'}).click(function () {
            var parent = jQuery(this).parent();
            parent.fadeOut();
            jQuery.cookie(buildCookieName(parent), true);
            return false;
        });
        hide.addClass('hideBtn')
        jQuery(this).append(hide)
    })
});
function buildCookieName(elt) {
    return'nuxeo.' + elt.attr('id') + '.cookie';
}
jQuery.cookie = function (name, value, options) {
    if (typeof value != 'undefined') {
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
;
(function (b) {
    var m, t, u, f, D, j, E, n, z, A, q = 0, e = {}, o = [], p = 0, d = {}, l = [], G = null, v = new Image, J = /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i, W = /[^\.]\.(swf)\s*$/i, K, L = 1, y = 0, s = "", r, i, h = false, B = b.extend(b("<div/>")[0], {prop: 0}), M = b.browser.msie && b.browser.version < 7 && !window.XMLHttpRequest, N = function () {
        t.hide();
        v.onerror = v.onload = null;
        G && G.abort();
        m.empty()
    }, O = function () {
        if (false === e.onError(o, q, e)) {
            t.hide();
            h = false
        } else {
            e.titleShow = false;
            e.width = "auto";
            e.height = "auto";
            m.html('<p id="fancybox-error">The requested content cannot be loaded.<br />Please try again later.</p>');
            F()
        }
    }, I = function () {
        var a = o[q], c, g, k, C, P, w;
        N();
        e = b.extend({}, b.fn.fancybox.defaults, typeof b(a).data("fancybox") == "undefined" ? e : b(a).data("fancybox"));
        w = e.onStart(o, q, e);
        if (w === false)h = false; else {
            if (typeof w == "object")e = b.extend(e, w);
            k = e.title || (a.nodeName ? b(a).attr("title") : a.title) || "";
            if (a.nodeName && !e.orig)e.orig = b(a).children("img:first").length ? b(a).children("img:first") : b(a);
            if (k === "" && e.orig && e.titleFromAlt)k = e.orig.attr("alt");
            c = e.href || (a.nodeName ? b(a).attr("href") : a.href) || null;
            if (/^(?:javascript)/i.test(c) || c == "#")c = null;
            if (e.type) {
                g = e.type;
                if (!c)c = e.content
            } else if (e.content)g = "html"; else if (c)g = c.match(J) ? "image" : c.match(W) ? "swf" : b(a).hasClass("iframe") ? "iframe" : c.indexOf("#") === 0 ? "inline" : "ajax";
            if (g) {
                if (g == "inline") {
                    a = c.substr(c.indexOf("#"));
                    g = b(a).length > 0 ? "inline" : "ajax"
                }
                e.type = g;
                e.href = c;
                e.title = k;
                if (e.autoDimensions)if (e.type == "html" || e.type == "inline" || e.type == "ajax") {
                    e.width = "auto";
                    e.height = "auto"
                } else e.autoDimensions = false;
                if (e.modal) {
                    e.overlayShow = true;
                    e.hideOnOverlayClick = false;
                    e.hideOnContentClick = false;
                    e.enableEscapeButton = false;
                    e.showCloseButton = false
                }
                e.padding = parseInt(e.padding, 10);
                e.margin = parseInt(e.margin, 10);
                m.css("padding", e.padding + e.margin);
                b(".fancybox-inline-tmp").unbind("fancybox-cancel").bind("fancybox-change", function () {
                    b(this).replaceWith(j.children())
                });
                switch (g) {
                    case"html":
                        m.html(e.content);
                        F();
                        break;
                    case"inline":
                        if (b(a).parent().is("#fancybox-content") === true) {
                            h = false;
                            break
                        }
                        b('<div class="fancybox-inline-tmp" />').hide().insertBefore(b(a)).bind("fancybox-cleanup",function () {
                            b(this).replaceWith(j.children())
                        }).bind("fancybox-cancel", function () {
                            b(this).replaceWith(m.children())
                        });
                        b(a).appendTo(m);
                        F();
                        break;
                    case"image":
                        h = false;
                        b.fancybox.showActivity();
                        v = new Image;
                        v.onerror = function () {
                            O()
                        };
                        v.onload = function () {
                            h = true;
                            v.onerror = v.onload = null;
                            e.width = v.width;
                            e.height = v.height;
                            b("<img />").attr({id: "fancybox-img", src: v.src, alt: e.title}).appendTo(m);
                            Q()
                        };
                        v.src = c;
                        break;
                    case"swf":
                        e.scrolling = "no";
                        C = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + e.width + '" height="' + e.height + '"><param name="movie" value="' + c + '"></param>';
                        P = "";
                        b.each(e.swf, function (x, H) {
                            C += '<param name="' + x + '" value="' + H + '"></param>';
                            P += " " + x + '="' + H + '"'
                        });
                        C += '<embed src="' + c + '" type="application/x-shockwave-flash" width="' + e.width + '" height="' + e.height + '"' + P + "></embed></object>";
                        m.html(C);
                        F();
                        break;
                    case"ajax":
                        h = false;
                        b.fancybox.showActivity();
                        e.ajax.win = e.ajax.success;
                        G = b.ajax(b.extend({}, e.ajax, {url: c, data: e.ajax.data || {}, error: function (x) {
                            x.status > 0 && O()
                        }, success: function (x, H, R) {
                            if ((typeof R == "object" ? R : G).status == 200) {
                                if (typeof e.ajax.win == "function") {
                                    w = e.ajax.win(c, x, H, R);
                                    if (w === false) {
                                        t.hide();
                                        return
                                    } else if (typeof w == "string" || typeof w == "object")x = w
                                }
                                m.html(x);
                                F()
                            }
                        }}));
                        break;
                    case"iframe":
                        Q()
                }
            } else O()
        }
    }, F = function () {
        var a = e.width, c = e.height;
        a = a.toString().indexOf("%") > -1 ? parseInt((b(window).width() - e.margin * 2) * parseFloat(a) / 100, 10) + "px" : a == "auto" ? "auto" : a + "px";
        c = c.toString().indexOf("%") > -1 ? parseInt((b(window).height() - e.margin * 2) * parseFloat(c) / 100, 10) + "px" : c == "auto" ? "auto" : c + "px";
        m.wrapInner('<div style="width:' + a + ";height:" + c + ";overflow: " + (e.scrolling == "auto" ? "auto" : e.scrolling == "yes" ? "scroll" : "hidden") + ';position:relative;"></div>');
        e.width = m.width();
        e.height = m.height();
        Q()
    }, Q = function () {
        var a, c;
        t.hide();
        if (f.is(":visible") && false === d.onCleanup(l, p, d)) {
            b.event.trigger("fancybox-cancel");
            h = false
        } else {
            h = true;
            b(j.add(u)).unbind();
            b(window).unbind("resize.fb scroll.fb");
            b(document).unbind("keydown.fb");
            f.is(":visible") && d.titlePosition !== "outside" && f.css("height", f.height());
            l = o;
            p = q;
            d = e;
            if (d.overlayShow) {
                u.css({"background-color": d.overlayColor, opacity: d.overlayOpacity, cursor: d.hideOnOverlayClick ? "pointer" : "auto", height: b(document).height()});
                if (!u.is(":visible")) {
                    M && b("select:not(#fancybox-tmp select)").filter(function () {
                        return this.style.visibility !== "hidden"
                    }).css({visibility: "hidden"}).one("fancybox-cleanup", function () {
                        this.style.visibility = "inherit"
                    });
                    u.show()
                }
            } else u.hide();
            i = X();
            s = d.title || "";
            y = 0;
            n.empty().removeAttr("style").removeClass();
            if (d.titleShow !== false) {
                if (b.isFunction(d.titleFormat))a = d.titleFormat(s, l, p, d); else a = s && s.length ? d.titlePosition == "float" ? '<table id="fancybox-title-float-wrap" cellpadding="0" cellspacing="0"><tr><td id="fancybox-title-float-left"></td><td id="fancybox-title-float-main">' + s + '</td><td id="fancybox-title-float-right"></td></tr></table>' : '<div id="fancybox-title-' + d.titlePosition + '">' + s + "</div>" : false;
                s = a;
                if (!(!s || s === "")) {
                    n.addClass("fancybox-title-" + d.titlePosition).html(s).appendTo("body").show();
                    switch (d.titlePosition) {
                        case"inside":
                            n.css({width: i.width - d.padding * 2, marginLeft: d.padding, marginRight: d.padding});
                            y = n.outerHeight(true);
                            n.appendTo(D);
                            i.height += y;
                            break;
                        case"over":
                            n.css({marginLeft: d.padding, width: i.width - d.padding * 2, bottom: d.padding}).appendTo(D);
                            break;
                        case"float":
                            n.css("left", parseInt((n.width() - i.width - 40) / 2, 10) * -1).appendTo(f);
                            break;
                        default:
                            n.css({width: i.width - d.padding * 2, paddingLeft: d.padding, paddingRight: d.padding}).appendTo(f)
                    }
                }
            }
            n.hide();
            if (f.is(":visible")) {
                b(E.add(z).add(A)).hide();
                a = f.position();
                r = {top: a.top, left: a.left, width: f.width(), height: f.height()};
                c = r.width == i.width && r.height == i.height;
                j.fadeTo(d.changeFade, 0.3, function () {
                    var g = function () {
                        j.html(m.contents()).fadeTo(d.changeFade, 1, S)
                    };
                    b.event.trigger("fancybox-change");
                    j.empty().removeAttr("filter").css({"border-width": d.padding, width: i.width - d.padding * 2, height: e.autoDimensions ? "auto" : i.height - y - d.padding * 2});
                    if (c)g(); else {
                        B.prop = 0;
                        b(B).animate({prop: 1}, {duration: d.changeSpeed, easing: d.easingChange, step: T, complete: g})
                    }
                })
            } else {
                f.removeAttr("style");
                j.css("border-width", d.padding);
                if (d.transitionIn == "elastic") {
                    r = V();
                    j.html(m.contents());
                    f.show();
                    if (d.opacity)i.opacity = 0;
                    B.prop = 0;
                    b(B).animate({prop: 1}, {duration: d.speedIn, easing: d.easingIn, step: T, complete: S})
                } else {
                    d.titlePosition == "inside" && y > 0 && n.show();
                    j.css({width: i.width - d.padding * 2, height: e.autoDimensions ? "auto" : i.height - y - d.padding * 2}).html(m.contents());
                    f.css(i).fadeIn(d.transitionIn == "none" ? 0 : d.speedIn, S)
                }
            }
        }
    }, Y = function () {
        if (d.enableEscapeButton || d.enableKeyboardNav)b(document).bind("keydown.fb", function (a) {
            if (a.keyCode == 27 && d.enableEscapeButton) {
                a.preventDefault();
                b.fancybox.close()
            } else if ((a.keyCode == 37 || a.keyCode == 39) && d.enableKeyboardNav && a.target.tagName !== "INPUT" && a.target.tagName !== "TEXTAREA" && a.target.tagName !== "SELECT") {
                a.preventDefault();
                b.fancybox[a.keyCode == 37 ? "prev" : "next"]()
            }
        });
        if (d.showNavArrows) {
            if (d.cyclic && l.length > 1 || p !== 0)z.show();
            if (d.cyclic && l.length > 1 || p != l.length - 1)A.show()
        } else {
            z.hide();
            A.hide()
        }
    }, S = function () {
        if (!b.support.opacity) {
            j.get(0).style.removeAttribute("filter");
            f.get(0).style.removeAttribute("filter")
        }
        e.autoDimensions && j.css("height", "auto");
        f.css("height", "auto");
        s && s.length && n.show();
        d.showCloseButton && E.show();
        Y();
        d.hideOnContentClick && j.bind("click", b.fancybox.close);
        d.hideOnOverlayClick && u.bind("click", b.fancybox.close);
        b(window).bind("resize.fb", b.fancybox.resize);
        d.centerOnScroll && b(window).bind("scroll.fb", b.fancybox.center);
        if (d.type == "iframe")b('<iframe id="fancybox-frame" name="fancybox-frame' + (new Date).getTime() + '" frameborder="0" hspace="0" ' + (b.browser.msie ? 'allowtransparency="true""' : "") + ' scrolling="' + e.scrolling + '" src="' + d.href + '"></iframe>').appendTo(j);
        f.show();
        h = false;
        b.fancybox.center();
        d.onComplete(l, p, d);
        var a, c;
        if (l.length - 1 > p) {
            a = l[p + 1].href;
            if (typeof a !== "undefined" && a.match(J)) {
                c = new Image;
                c.src = a
            }
        }
        if (p > 0) {
            a = l[p - 1].href;
            if (typeof a !== "undefined" && a.match(J)) {
                c = new Image;
                c.src = a
            }
        }
    }, T = function (a) {
        var c = {width: parseInt(r.width + (i.width - r.width) * a, 10), height: parseInt(r.height + (i.height - r.height) * a, 10), top: parseInt(r.top + (i.top - r.top) * a, 10), left: parseInt(r.left + (i.left - r.left) * a, 10)};
        if (typeof i.opacity !== "undefined")c.opacity = a < 0.5 ? 0.5 : a;
        f.css(c);
        j.css({width: c.width - d.padding * 2, height: c.height - y * a - d.padding * 2})
    }, U = function () {
        return[b(window).width() - d.margin * 2, b(window).height() - d.margin * 2, b(document).scrollLeft() + d.margin, b(document).scrollTop() + d.margin]
    }, X = function () {
        var a = U(), c = {}, g = d.autoScale, k = d.padding * 2;
        c.width = d.width.toString().indexOf("%") > -1 ? parseInt(a[0] * parseFloat(d.width) / 100, 10) : d.width + k;
        c.height = d.height.toString().indexOf("%") > -1 ? parseInt(a[1] * parseFloat(d.height) / 100, 10) : d.height + k;
        if (g && (c.width > a[0] || c.height > a[1]))if (e.type == "image" || e.type == "swf") {
            g = d.width / d.height;
            if (c.width > a[0]) {
                c.width = a[0];
                c.height = parseInt((c.width - k) / g + k, 10)
            }
            if (c.height > a[1]) {
                c.height = a[1];
                c.width = parseInt((c.height - k) * g + k, 10)
            }
        } else {
            c.width = Math.min(c.width, a[0]);
            c.height = Math.min(c.height, a[1])
        }
        c.top = parseInt(Math.max(a[3] - 20, a[3] + (a[1] - c.height - 40) * 0.5), 10);
        c.left = parseInt(Math.max(a[2] - 20, a[2] + (a[0] - c.width - 40) * 0.5), 10);
        return c
    }, V = function () {
        var a = e.orig ? b(e.orig) : false, c = {};
        if (a && a.length) {
            c = a.offset();
            c.top += parseInt(a.css("paddingTop"), 10) || 0;
            c.left += parseInt(a.css("paddingLeft"), 10) || 0;
            c.top += parseInt(a.css("border-top-width"), 10) || 0;
            c.left += parseInt(a.css("border-left-width"), 10) || 0;
            c.width = a.width();
            c.height = a.height();
            c = {width: c.width + d.padding * 2, height: c.height + d.padding * 2, top: c.top - d.padding - 20, left: c.left - d.padding - 20}
        } else {
            a = U();
            c = {width: d.padding * 2, height: d.padding * 2, top: parseInt(a[3] + a[1] * 0.5, 10), left: parseInt(a[2] + a[0] * 0.5, 10)}
        }
        return c
    }, Z = function () {
        if (t.is(":visible")) {
            b("div", t).css("top", L * -40 + "px");
            L = (L + 1) % 12
        } else clearInterval(K)
    };
    b.fn.fancybox = function (a) {
        if (!b(this).length)return this;
        b(this).data("fancybox", b.extend({}, a, b.metadata ? b(this).metadata() : {})).unbind("click.fb").bind("click.fb", function (c) {
            c.preventDefault();
            if (!h) {
                h = true;
                b(this).blur();
                o = [];
                q = 0;
                c = b(this).attr("rel") || "";
                if (!c || c == "" || c === "nofollow")o.push(this); else {
                    o = b("a[rel=" + c + "], area[rel=" + c + "]");
                    q = o.index(this)
                }
                I()
            }
        });
        return this
    };
    b.fancybox = function (a, c) {
        var g;
        if (!h) {
            h = true;
            g = typeof c !== "undefined" ? c : {};
            o = [];
            q = parseInt(g.index, 10) || 0;
            if (b.isArray(a)) {
                for (var k = 0, C = a.length; k < C; k++)if (typeof a[k] == "object")b(a[k]).data("fancybox", b.extend({}, g, a[k])); else a[k] = b({}).data("fancybox", b.extend({content: a[k]}, g));
                o = jQuery.merge(o, a)
            } else {
                if (typeof a == "object")b(a).data("fancybox", b.extend({}, g, a)); else a = b({}).data("fancybox", b.extend({content: a}, g));
                o.push(a)
            }
            if (q > o.length || q < 0)q = 0;
            I()
        }
    };
    b.fancybox.showActivity = function () {
        clearInterval(K);
        t.show();
        K = setInterval(Z, 66)
    };
    b.fancybox.hideActivity = function () {
        t.hide()
    };
    b.fancybox.next = function () {
        return b.fancybox.pos(p +
            1)
    };
    b.fancybox.prev = function () {
        return b.fancybox.pos(p - 1)
    };
    b.fancybox.pos = function (a) {
        if (!h) {
            a = parseInt(a);
            o = l;
            if (a > -1 && a < l.length) {
                q = a;
                I()
            } else if (d.cyclic && l.length > 1) {
                q = a >= l.length ? 0 : l.length - 1;
                I()
            }
        }
    };
    b.fancybox.cancel = function () {
        if (!h) {
            h = true;
            b.event.trigger("fancybox-cancel");
            N();
            e.onCancel(o, q, e);
            h = false
        }
    };
    b.fancybox.close = function () {
        function a() {
            u.fadeOut("fast");
            n.empty().hide();
            f.hide();
            b.event.trigger("fancybox-cleanup");
            j.empty();
            d.onClosed(l, p, d);
            l = e = [];
            p = q = 0;
            d = e = {};
            h = false
        }

        if (!(h || f.is(":hidden"))) {
            h = true;
            if (d && false === d.onCleanup(l, p, d))h = false; else {
                N();
                b(E.add(z).add(A)).hide();
                b(j.add(u)).unbind();
                b(window).unbind("resize.fb scroll.fb");
                b(document).unbind("keydown.fb");
                j.find("iframe").attr("src", M && /^https/i.test(window.location.href || "") ? "javascript:void(false)" : "about:blank");
                d.titlePosition !== "inside" && n.empty();
                f.stop();
                if (d.transitionOut == "elastic") {
                    r = V();
                    var c = f.position();
                    i = {top: c.top, left: c.left, width: f.width(), height: f.height()};
                    if (d.opacity)i.opacity = 1;
                    n.empty().hide();
                    B.prop = 1;
                    b(B).animate({prop: 0}, {duration: d.speedOut, easing: d.easingOut, step: T, complete: a})
                } else f.fadeOut(d.transitionOut == "none" ? 0 : d.speedOut, a)
            }
        }
    };
    b.fancybox.resize = function () {
        u.is(":visible") && u.css("height", b(document).height());
        b.fancybox.center(true)
    };
    b.fancybox.center = function (a) {
        var c, g;
        if (!h) {
            g = a === true ? 1 : 0;
            c = U();
            !g && (f.width() > c[0] || f.height() > c[1]) || f.stop().animate({top: parseInt(Math.max(c[3] - 20, c[3] + (c[1] - j.height() - 40) * 0.5 - d.padding)), left: parseInt(Math.max(c[2] - 20, c[2] + (c[0] - j.width() - 40) * 0.5 -
                d.padding))}, typeof a == "number" ? a : 200)
        }
    };
    b.fancybox.init = function () {
        if (!b("#fancybox-wrap").length) {
            b("body").append(m = b('<div id="fancybox-tmp"></div>'), t = b('<div id="fancybox-loading"><div></div></div>'), u = b('<div id="fancybox-overlay"></div>'), f = b('<div id="fancybox-wrap"></div>'));
            D = b('<div id="fancybox-outer"></div>').append('<div class="fancybox-bg" id="fancybox-bg-n"></div><div class="fancybox-bg" id="fancybox-bg-ne"></div><div class="fancybox-bg" id="fancybox-bg-e"></div><div class="fancybox-bg" id="fancybox-bg-se"></div><div class="fancybox-bg" id="fancybox-bg-s"></div><div class="fancybox-bg" id="fancybox-bg-sw"></div><div class="fancybox-bg" id="fancybox-bg-w"></div><div class="fancybox-bg" id="fancybox-bg-nw"></div>').appendTo(f);
            D.append(j = b('<div id="fancybox-content"></div>'), E = b('<a id="fancybox-close"></a>'), n = b('<div id="fancybox-title"></div>'), z = b('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'), A = b('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>'));
            E.click(b.fancybox.close);
            t.click(b.fancybox.cancel);
            z.click(function (a) {
                a.preventDefault();
                b.fancybox.prev()
            });
            A.click(function (a) {
                a.preventDefault();
                b.fancybox.next()
            });
            b.fn.mousewheel && f.bind("mousewheel.fb", function (a, c) {
                if (h)a.preventDefault(); else if (b(a.target).get(0).clientHeight == 0 || b(a.target).get(0).scrollHeight === b(a.target).get(0).clientHeight) {
                    a.preventDefault();
                    b.fancybox[c > 0 ? "prev" : "next"]()
                }
            });
            b.support.opacity || f.addClass("fancybox-ie");
            if (M) {
                t.addClass("fancybox-ie6");
                f.addClass("fancybox-ie6");
                b('<iframe id="fancybox-hide-sel-frame" src="' + (/^https/i.test(window.location.href || "") ? "javascript:void(false)" : "about:blank") + '" scrolling="no" border="0" frameborder="0" tabindex="-1"></iframe>').prependTo(D)
            }
        }
    };
    b.fn.fancybox.defaults = {padding: 10, margin: 40, opacity: false, modal: false, cyclic: false, scrolling: "auto", width: 560, height: 340, autoScale: true, autoDimensions: true, centerOnScroll: false, ajax: {}, swf: {wmode: "transparent"}, hideOnOverlayClick: true, hideOnContentClick: false, overlayShow: true, overlayOpacity: 0.7, overlayColor: "#777", titleShow: true, titlePosition: "float", titleFormat: null, titleFromAlt: false, transitionIn: "fade", transitionOut: "fade", speedIn: 300, speedOut: 300, changeSpeed: 300, changeFade: "fast", easingIn: "swing", easingOut: "swing", showCloseButton: true, showNavArrows: true, enableEscapeButton: true, enableKeyboardNav: true, onStart: function () {
    }, onCancel: function () {
    }, onComplete: function () {
    }, onCleanup: function () {
    }, onClosed: function () {
    }, onError: function () {
    }};
    b(document).ready(function () {
        b.fancybox.init()
    })
})(jQuery);
function paramIsNumber(value) {
    return!isNaN(value - 0) && value != null;
}
function showFancyBox(ele, width, height, scrolling) {
    width = width || "90%";
    height = height || "90%";
    scrolling = scrolling || "auto";
    if (paramIsNumber(width)) {
        width = parseInt(width);
    }
    if (paramIsNumber(height)) {
        height = parseInt(height);
    }
    var popupType = 'iframe';
    if (ele.indexOf("#") == 0) {
        popupType = 'inline';
    }
    jQuery('<a href="' + ele + '"></a>').fancybox({'autoScale': true, 'type': popupType, 'width': width, 'height': height, 'transitionIn': 'none', 'transitionOut': 'none', 'enableEscapeButton': true, 'centerOnScroll': true, 'scrolling': scrolling}).click();
}
(function (jQuery) {
    var types = ['text', 'search', 'tel', 'url', 'email', 'password', 'number'];
    jQuery.hotkeys = {version: "0.8", specialKeys: {8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause", 20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111: "/", 112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"}, shiftNums: {"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<", ".": ">", "/": "?", "\\": "|"}};
    function keyHandler(handleObj) {
        if (typeof handleObj.data !== "string") {
            return;
        }
        var origHandler = handleObj.handler, keys = handleObj.data.toLowerCase().split(" ");
        handleObj.handler = function (event) {
            if (this !== event.target && (/textarea|select/i.test(event.target.nodeName) || types.indexOf(event.target.type) >= 0)) {
                return;
            }
            var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[event.which], character = String.fromCharCode(event.which).toLowerCase(), key, modif = "", possible = {};
            if (event.altKey && special !== "alt") {
                modif += "alt+";
            }
            if (event.ctrlKey && special !== "ctrl") {
                modif += "ctrl+";
            }
            if (event.metaKey && !event.ctrlKey && special !== "meta") {
                modif += "meta+";
            }
            if (event.shiftKey && special !== "shift") {
                modif += "shift+";
            }
            if (special) {
                possible[modif + special] = true;
            } else {
                possible[modif + character] = true;
                possible[modif + jQuery.hotkeys.shiftNums[character]] = true;
                if (modif === "shift+") {
                    possible[jQuery.hotkeys.shiftNums[character]] = true;
                }
            }
            for (var i = 0, l = keys.length; i < l; i++) {
                if (possible[keys[i]]) {
                    return origHandler.apply(this, arguments);
                }
            }
        };
    }

    jQuery.each(["keydown", "keyup", "keypress"], function () {
        jQuery.event.special[this] = {add: keyHandler};
    });
})(jQuery);
(function ($) {
    $.fn.focusFirst = function () {
        var topElementId = $(this).get(0).getAttribute("id");

        function GetOffset(object, offset, topElement) {
            if (!object || object.getAttribute("id") == topElement)
                return;
            offset.x += object.offsetLeft;
            offset.y += object.offsetTop;
            GetOffset(object.parentNode, offset, topElement);
        }

        var elem = $('input:visible', this).get(0);
        var select = $('select:visible', this).get(0);
        if (select && elem) {
            var elemOffset = {'x': 0, 'y': 0};
            var selectOffset = {'x': 0, 'y': 0};
            GetOffset(elem, elemOffset, topElementId);
            GetOffset(select, selectOffset, topElementId);
            if (selectOffset.y < elemOffset.y) {
                elem = select;
            }
        }
        var textarea = $('textarea:visible', this).get(0);
        if (textarea && elem) {
            var elemOffset = {'x': 0, 'y': 0};
            var textOffset = {'x': 0, 'y': 0};
            GetOffset(elem, elemOffset, topElementId);
            GetOffset(textarea, textOffset, topElementId);
            if (textOffset.y < elemOffset.y) {
                elem = textarea;
            }
        }
        if (elem) {
            try {
                elem.focus();
            }
            catch (err) {
            }
        }
        return this;
    };
})(jQuery);
if (typeof Sarissa != 'undefined') {
    jQuery.ajaxSetup({xhr: function () {
        if (Sarissa.originalXMLHttpRequest) {
            return new Sarissa.originalXMLHttpRequest();
        } else if (typeof ActiveXObject != 'undefined') {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            return new XMLHttpRequest();
        }
    }});
}
function showAccessKeys() {
    if (jQuery(".accessKeyToolTip").size() > 0) {
        jQuery(".accessKeyToolTip").remove();
        return;
    }
    jQuery("[accesskey]").each(function () {
        var item = jQuery(this);
        var key = item.attr("accesskey");
        if (key != null && key != "" && this.innerHTML != "") {
            var tooltip = jQuery("<span>" + key + "</span>");
            jQuery(tooltip).css({"background-color": "#666666", "color": "white", "padding": "3px", "margin": "2px", "border-radius": "2px", "font-size": "9px"});
            jQuery(tooltip).addClass("accessKeyToolTip");
            item.append(tooltip);
        }
    });
}
jQuery(document).bind('keydown', 'Shift+h', showAccessKeys);
var gadgets = gadgets || {};
gadgets.config = function () {
    var A = [];
    return{register: function (D, C, B) {
        var E = A[D];
        if (!E) {
            E = [];
            A[D] = E
        }
        E.push({validators: C || {}, callback: B})
    }, get: function (B) {
        if (B) {
            return configuration[B] || {}
        }
        return configuration
    }, init: function (D, K) {
        configuration = D;
        for (var B in A) {
            if (A.hasOwnProperty(B)) {
                var C = A[B], H = D[B];
                for (var G = 0, F = C.length; G < F; ++G) {
                    var I = C[G];
                    if (H && !K) {
                        var E = I.validators;
                        for (var J in E) {
                            if (E.hasOwnProperty(J)) {
                                if (!E[J](H[J])) {
                                    throw new Error('Invalid config value "' + H[J] + '" for parameter "' + J + '" in component "' + B + '"')
                                }
                            }
                        }
                    }
                    if (I.callback) {
                        I.callback(D)
                    }
                }
            }
        }
    }, EnumValidator: function (E) {
        var D = [];
        if (arguments.length > 1) {
            for (var C = 0, B; (B = arguments[C]); ++C) {
                D.push(B)
            }
        } else {
            D = E
        }
        return function (G) {
            for (var F = 0, H; (H = D[F]); ++F) {
                if (G === D[F]) {
                    return true
                }
            }
        }
    }, RegExValidator: function (B) {
        return function (C) {
            return B.test(C)
        }
    }, ExistsValidator: function (B) {
        return typeof B !== "undefined"
    }, NonEmptyStringValidator: function (B) {
        return typeof B === "string" && B.length > 0
    }, BooleanValidator: function (B) {
        return typeof B === "boolean"
    }, LikeValidator: function (B) {
        return function (D) {
            for (var E in B) {
                if (B.hasOwnProperty(E)) {
                    var C = B[E];
                    if (!C(D[E])) {
                        return false
                    }
                }
            }
            return true
        }
    }}
}();
;
var gadgets = gadgets || {};
gadgets.log = function (A) {
    gadgets.log.logAtLevel(gadgets.log.INFO, A)
};
gadgets.warn = function (A) {
    gadgets.log.logAtLevel(gadgets.log.WARNING, A)
};
gadgets.error = function (A) {
    gadgets.log.logAtLevel(gadgets.log.ERROR, A)
};
gadgets.setLogLevel = function (A) {
    gadgets.log.logLevelThreshold_ = A
};
gadgets.log.logAtLevel = function (D, C) {
    if (D < gadgets.log.logLevelThreshold_ || !gadgets.log._console) {
        return
    }
    var B;
    var A = gadgets.log._console;
    if (D == gadgets.log.WARNING && A.warn) {
        A.warn(C)
    } else {
        if (D == gadgets.log.ERROR && A.error) {
            A.error(C)
        } else {
            if (A.log) {
                A.log(C)
            }
        }
    }
};
gadgets.log.INFO = 1;
gadgets.log.WARNING = 2;
gadgets.log.NONE = 4;
gadgets.log.logLevelThreshold_ = gadgets.log.INFO;
gadgets.log._console = window.console ? window.console : window.opera ? window.opera.postError : undefined;
;
var tamings___ = tamings___ || [];
tamings___.push(function (A) {
    ___.grantRead(gadgets.log, "INFO");
    ___.grantRead(gadgets.log, "WARNING");
    ___.grantRead(gadgets.log, "ERROR");
    ___.grantRead(gadgets.log, "NONE");
    caja___.whitelistFuncs([
        [gadgets, "log"],
        [gadgets, "warn"],
        [gadgets, "error"],
        [gadgets, "setLogLevel"],
        [gadgets.log, "logAtLevel"],
    ])
});
;
var gadgets = gadgets || {};
if (window.JSON && window.JSON.parse && window.JSON.stringify) {
    gadgets.json = {parse: function (B) {
        try {
            return window.JSON.parse(B)
        } catch (A) {
            return false
        }
    }, stringify: function (B) {
        try {
            return window.JSON.stringify(B)
        } catch (A) {
            return null
        }
    }}
} else {
    gadgets.json = function () {
        function f(n) {
            return n < 10 ? "0" + n : n
        }

        Date.prototype.toJSON = function () {
            return[this.getUTCFullYear(), "-", f(this.getUTCMonth() + 1), "-", f(this.getUTCDate()), "T", f(this.getUTCHours()), ":", f(this.getUTCMinutes()), ":", f(this.getUTCSeconds()), "Z"].join("")
        };
        var m = {"\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\"};

        function stringify(value) {
            var a, i, k, l, r = /["\\\x00-\x1f\x7f-\x9f]/g, v;
            switch (typeof value) {
                case"string":
                    return r.test(value) ? '"' + value.replace(r, function (a) {
                        var c = m[a];
                        if (c) {
                            return c
                        }
                        c = a.charCodeAt();
                        return"\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16)
                    }) + '"' : '"' + value + '"';
                case"number":
                    return isFinite(value) ? String(value) : "null";
                case"boolean":
                case"null":
                    return String(value);
                case"object":
                    if (!value) {
                        return"null"
                    }
                    a = [];
                    if (typeof value.length === "number" && !value.propertyIsEnumerable("length")) {
                        l = value.length;
                        for (i = 0; i < l; i += 1) {
                            a.push(stringify(value[i]) || "null")
                        }
                        return"[" + a.join(",") + "]"
                    }
                    for (k in value) {
                        if (k.match("___$")) {
                            continue
                        }
                        if (value.hasOwnProperty(k)) {
                            if (typeof k === "string") {
                                v = stringify(value[k]);
                                if (v) {
                                    a.push(stringify(k) + ":" + v)
                                }
                            }
                        }
                    }
                    return"{" + a.join(",") + "}"
            }
        }

        return{stringify: stringify, parse: function (text) {
            if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/b-u]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                return eval("(" + text + ")")
            }
            return false
        }}
    }()
}
;
;
var tamings___ = tamings___ || [];
tamings___.push(function (A) {
    caja___.whitelistFuncs([
        [gadgets.json, "parse"],
        [gadgets.json, "stringify"]
    ])
});
;
var gadgets = gadgets || {};
gadgets.util = function () {
    function G(L) {
        var M;
        var K = L;
        var I = K.indexOf("?");
        var J = K.indexOf("#");
        if (J === -1) {
            M = K.substr(I + 1)
        } else {
            M = [K.substr(I + 1, J - I - 1), "&", K.substr(J + 1)].join("")
        }
        return M.split("&")
    }

    var E = null;
    var D = {};
    var C = {};
    var F = [];
    var A = {0: false, 10: true, 13: true, 34: true, 39: true, 60: true, 62: true, 92: true, 8232: true, 8233: true};

    function B(I, J) {
        return String.fromCharCode(J)
    }

    function H(I) {
        D = I["core.util"] || {}
    }

    if (gadgets.config) {
        gadgets.config.register("core.util", null, H)
    }
    return{getUrlParameters: function (Q) {
        if (E !== null && typeof Q === "undefined") {
            return E
        }
        var M = {};
        E = {};
        var J = G(Q || document.location.href);
        var O = window.decodeURIComponent ? decodeURIComponent : unescape;
        for (var L = 0, K = J.length; L < K; ++L) {
            var N = J[L].indexOf("=");
            if (N === -1) {
                continue
            }
            var I = J[L].substring(0, N);
            var P = J[L].substring(N + 1);
            P = P.replace(/\+/g, " ");
            M[I] = O(P)
        }
        if (typeof Q === "undefined") {
            E = M
        }
        return M
    }, makeClosure: function (L, N, M) {
        var K = [];
        for (var J = 2, I = arguments.length; J < I; ++J) {
            K.push(arguments[J])
        }
        return function () {
            var O = K.slice();
            for (var Q = 0, P = arguments.length; Q < P; ++Q) {
                O.push(arguments[Q])
            }
            return N.apply(L, O)
        }
    }, makeEnum: function (J) {
        var L = {};
        for (var K = 0, I; (I = J[K]); ++K) {
            L[I] = I
        }
        return L
    }, getFeatureParameters: function (I) {
        return typeof D[I] === "undefined" ? null : D[I]
    }, hasFeature: function (I) {
        return typeof D[I] !== "undefined"
    }, getServices: function () {
        return C
    }, registerOnLoadHandler: function (I) {
        F.push(I)
    }, runOnLoadHandlers: function () {
        for (var J = 0, I = F.length; J < I; ++J) {
            F[J]()
        }
    }, escape: function (I, M) {
        if (!I) {
            return I
        } else {
            if (typeof I === "string") {
                return gadgets.util.escapeString(I)
            } else {
                if (typeof I === "array") {
                    for (var L = 0, J = I.length; L < J; ++L) {
                        I[L] = gadgets.util.escape(I[L])
                    }
                } else {
                    if (typeof I === "object" && M) {
                        var K = {};
                        for (var N in I) {
                            if (I.hasOwnProperty(N)) {
                                K[gadgets.util.escapeString(N)] = gadgets.util.escape(I[N], true)
                            }
                        }
                        return K
                    }
                }
            }
        }
        return I
    }, escapeString: function (M) {
        var J = [], L, N;
        for (var K = 0, I = M.length; K < I; ++K) {
            L = M.charCodeAt(K);
            N = A[L];
            if (N === true) {
                J.push("&#", L, ";")
            } else {
                if (N !== false) {
                    J.push(M.charAt(K))
                }
            }
        }
        return J.join("")
    }, unescapeString: function (I) {
        return I.replace(/&#([0-9]+);/g, B)
    }}
}();
gadgets.util.getUrlParameters();
;
var tamings___ = tamings___ || [];
tamings___.push(function (A) {
    caja___.whitelistFuncs([
        [gadgets.util, "escapeString"],
        [gadgets.util, "getFeatureParameters"],
        [gadgets.util, "hasFeature"],
        [gadgets.util, "registerOnLoadHandler"],
        [gadgets.util, "unescapeString"]
    ])
});
;
var gadgets = gadgets || {};
gadgets.rpctx = gadgets.rpctx || {};
gadgets.rpctx.wpm = function () {
    var A;
    return{getCode: function () {
        return"wpm"
    }, isParentVerifiable: function () {
        return true
    }, init: function (B, C) {
        A = C;
        var D = function (E) {
            B(gadgets.json.parse(E.data))
        };
        if (typeof window.addEventListener != "undefined") {
            window.addEventListener("message", D, false)
        } else {
            if (typeof window.attachEvent != "undefined") {
                window.attachEvent("onmessage", D)
            }
        }
        A("..", true);
        return true
    }, setup: function (C, B) {
        if (C === "..") {
            gadgets.rpc.call(C, gadgets.rpc.ACK)
        }
        return true
    }, call: function (C, F, E) {
        var D = C === ".." ? window.parent : window.frames[C];
        var B = gadgets.rpc.getOrigin(gadgets.rpc.getRelayUrl(C));
        if (B) {
            D.postMessage(gadgets.json.stringify(E), B)
        } else {
            gadgets.error("No relay set (used as window.postMessage targetOrigin), cannot send cross-domain message")
        }
        return true
    }}
}();
;
var gadgets = gadgets || {};
gadgets.rpctx = gadgets.rpctx || {};
gadgets.rpctx.frameElement = function () {
    var E = "__g2c_rpc";
    var B = "__c2g_rpc";
    var D;
    var C;

    function A(G, K, J) {
        try {
            if (K !== "..") {
                var F = window.frameElement;
                if (typeof F[E] === "function") {
                    if (typeof F[E][B] !== "function") {
                        F[E][B] = function (L) {
                            D(gadgets.json.parse(L))
                        }
                    }
                    F[E](gadgets.json.stringify(J));
                    return
                }
            } else {
                var I = document.getElementById(G);
                if (typeof I[E] === "function" && typeof I[E][B] === "function") {
                    I[E][B](gadgets.json.stringify(J));
                    return
                }
            }
        } catch (H) {
        }
        return true
    }

    return{getCode: function () {
        return"fe"
    }, isParentVerifiable: function () {
        return false
    }, init: function (F, G) {
        D = F;
        C = G;
        return true
    }, setup: function (J, F) {
        if (J !== "..") {
            try {
                var I = document.getElementById(J);
                I[E] = function (K) {
                    D(gadgets.json.parse(K))
                }
            } catch (H) {
                return false
            }
        }
        if (J === "..") {
            C("..", true);
            var G = function () {
                window.setTimeout(function () {
                    gadgets.rpc.call(J, gadgets.rpc.ACK)
                }, 500)
            };
            gadgets.util.registerOnLoadHandler(G)
        }
        return true
    }, call: function (F, H, G) {
        A(F, H, G)
    }}
}();
;
var gadgets = gadgets || {};
gadgets.rpctx = gadgets.rpctx || {};
gadgets.rpctx.nix = function () {
    var C = "GRPC____NIXVBS_wrapper";
    var D = "GRPC____NIXVBS_get_wrapper";
    var F = "GRPC____NIXVBS_handle_message";
    var B = "GRPC____NIXVBS_create_channel";
    var A = 10;
    var J = 500;
    var I = {};
    var H;
    var G = 0;

    function E() {
        var L = I[".."];
        if (L) {
            return
        }
        if (++G > A) {
            gadgets.warn("Nix transport setup failed, falling back...");
            H("..", false);
            return
        }
        if (!L && window.opener && "GetAuthToken"in window.opener) {
            L = window.opener;
            if (L.GetAuthToken() == gadgets.rpc.getAuthToken("..")) {
                var K = gadgets.rpc.getAuthToken("..");
                L.CreateChannel(window[D]("..", K), K);
                I[".."] = L;
                window.opener = null;
                H("..", true);
                return
            }
        }
        window.setTimeout(function () {
            E()
        }, J)
    }

    return{getCode: function () {
        return"nix"
    }, isParentVerifiable: function () {
        return false
    }, init: function (L, M) {
        H = M;
        if (typeof window[D] !== "unknown") {
            window[F] = function (O) {
                window.setTimeout(function () {
                    L(gadgets.json.parse(O))
                }, 0)
            };
            window[B] = function (O, Q, P) {
                if (gadgets.rpc.getAuthToken(O) === P) {
                    I[O] = Q;
                    H(O, true)
                }
            };
            var K = "Class " + C + "\n Private m_Intended\nPrivate m_Auth\nPublic Sub SetIntendedName(name)\n If isEmpty(m_Intended) Then\nm_Intended = name\nEnd If\nEnd Sub\nPublic Sub SetAuth(auth)\n If isEmpty(m_Auth) Then\nm_Auth = auth\nEnd If\nEnd Sub\nPublic Sub SendMessage(data)\n " + F + "(data)\nEnd Sub\nPublic Function GetAuthToken()\n GetAuthToken = m_Auth\nEnd Function\nPublic Sub CreateChannel(channel, auth)\n Call " + B + "(m_Intended, channel, auth)\nEnd Sub\nEnd Class\nFunction " + D + "(name, auth)\nDim wrap\nSet wrap = New " + C + "\nwrap.SetIntendedName name\nwrap.SetAuth auth\nSet " + D + " = wrap\nEnd Function";
            try {
                window.execScript(K, "vbscript")
            } catch (N) {
                return false
            }
        }
        return true
    }, setup: function (O, K) {
        if (O === "..") {
            E();
            return true
        }
        try {
            var M = document.getElementById(O);
            var N = window[D](O, K);
            M.contentWindow.opener = N
        } catch (L) {
            return false
        }
        return true
    }, call: function (K, N, M) {
        try {
            if (I[K]) {
                I[K].SendMessage(gadgets.json.stringify(M))
            }
        } catch (L) {
            return false
        }
        return true
    }}
}();
;
var gadgets = gadgets || {};
gadgets.rpctx = gadgets.rpctx || {};
gadgets.rpctx.rmr = function () {
    var G = 500;
    var E = 10;
    var H = {};
    var B;
    var I;

    function K(P, N, O, M) {
        var Q = function () {
            document.body.appendChild(P);
            P.src = "about:blank";
            if (M) {
                P.onload = function () {
                    L(M)
                }
            }
            P.src = N + "#" + O
        };
        if (document.body) {
            Q()
        } else {
            gadgets.util.registerOnLoadHandler(function () {
                Q()
            })
        }
    }

    function C(O) {
        if (typeof H[O] === "object") {
            return
        }
        var P = document.createElement("iframe");
        var M = P.style;
        M.position = "absolute";
        M.top = "0px";
        M.border = "0";
        M.opacity = "0";
        M.width = "10px";
        M.height = "1px";
        P.id = "rmrtransport-" + O;
        P.name = P.id;
        var N = gadgets.rpc.getOrigin(gadgets.rpc.getRelayUrl(O)) + "/robots.txt";
        H[O] = {frame: P, receiveWindow: null, relayUri: N, searchCounter: 0, width: 10, waiting: true, queue: [], sendId: 0, recvId: 0};
        if (O !== "..") {
            K(P, N, A(O))
        }
        D(O)
    }

    function D(N) {
        var P = null;
        H[N].searchCounter++;
        try {
            if (N === "..") {
                P = window.parent.frames["rmrtransport-" + gadgets.rpc.RPC_ID]
            } else {
                P = window.frames[N].frames["rmrtransport-.."]
            }
        } catch (O) {
        }
        var M = false;
        if (P) {
            M = F(N, P)
        }
        if (!M) {
            if (H[N].searchCounter > E) {
                return
            }
            window.setTimeout(function () {
                D(N)
            }, G)
        }
    }

    function J(N, P, T, S) {
        var O = null;
        if (T !== "..") {
            O = H[".."]
        } else {
            O = H[N]
        }
        if (O) {
            if (P !== gadgets.rpc.ACK) {
                O.queue.push(S)
            }
            if (O.waiting || (O.queue.length === 0 && !(P === gadgets.rpc.ACK && S && S.ackAlone === true))) {
                return true
            }
            if (O.queue.length > 0) {
                O.waiting = true
            }
            var M = O.relayUri + "#" + A(N);
            try {
                O.frame.contentWindow.location = M;
                var Q = O.width == 10 ? 20 : 10;
                O.frame.style.width = Q + "px";
                O.width = Q
            } catch (R) {
                return false
            }
        }
        return true
    }

    function A(N) {
        var O = H[N];
        var M = {id: O.sendId};
        if (O) {
            M.d = Array.prototype.slice.call(O.queue, 0);
            M.d.push({s: gadgets.rpc.ACK, id: O.recvId})
        }
        return gadgets.json.stringify(M)
    }

    function L(X) {
        var U = H[X];
        var Q = U.receiveWindow.location.hash.substring(1);
        var Y = gadgets.json.parse(decodeURIComponent(Q)) || {};
        var N = Y.d || [];
        var O = false;
        var T = false;
        var V = 0;
        var M = (U.recvId - Y.id);
        for (var P = 0; P < N.length; ++P) {
            var S = N[P];
            if (S.s === gadgets.rpc.ACK) {
                I(X, true);
                if (U.waiting) {
                    T = true
                }
                U.waiting = false;
                var R = Math.max(0, S.id - U.sendId);
                U.queue.splice(0, R);
                U.sendId = Math.max(U.sendId, S.id || 0);
                continue
            }
            O = true;
            if (++V <= M) {
                continue
            }
            ++U.recvId;
            B(S)
        }
        if (O || (T && U.queue.length > 0)) {
            var W = (X === "..") ? gadgets.rpc.RPC_ID : "..";
            J(X, gadgets.rpc.ACK, W, {ackAlone: O})
        }
    }

    function F(P, S) {
        var O = H[P];
        try {
            var N = false;
            N = "document"in S;
            if (!N) {
                return false
            }
            N = typeof S.document == "object";
            if (!N) {
                return false
            }
            var R = S.location.href;
            if (R === "about:blank") {
                return false
            }
        } catch (M) {
            return false
        }
        O.receiveWindow = S;
        function Q() {
            L(P)
        }

        if (typeof S.attachEvent === "undefined") {
            S.onresize = Q
        } else {
            S.attachEvent("onresize", Q)
        }
        if (P === "..") {
            K(O.frame, O.relayUri, A(P), P)
        } else {
            L(P)
        }
        return true
    }

    return{getCode: function () {
        return"rmr"
    }, isParentVerifiable: function () {
        return true
    }, init: function (M, N) {
        B = M;
        I = N;
        return true
    }, setup: function (O, M) {
        try {
            C(O)
        } catch (N) {
            gadgets.warn("Caught exception setting up RMR: " + N);
            return false
        }
        return true
    }, call: function (M, O, N) {
        return J(M, N.s, O, N)
    }}
}();
;
var gadgets = gadgets || {};
gadgets.rpctx = gadgets.rpctx || {};
gadgets.rpctx.ifpc = function () {
    var E = [];
    var D = 0;
    var C;

    function B(H) {
        var F = [];
        for (var I = 0, G = H.length; I < G; ++I) {
            F.push(encodeURIComponent(gadgets.json.stringify(H[I])))
        }
        return F.join("&")
    }

    function A(I) {
        var G;
        for (var F = E.length - 1; F >= 0; --F) {
            var J = E[F];
            try {
                if (J && (J.recyclable || J.readyState === "complete")) {
                    J.parentNode.removeChild(J);
                    if (window.ActiveXObject) {
                        E[F] = J = null;
                        E.splice(F, 1)
                    } else {
                        J.recyclable = false;
                        G = J;
                        break
                    }
                }
            } catch (H) {
            }
        }
        if (!G) {
            G = document.createElement("iframe");
            G.style.border = G.style.width = G.style.height = "0px";
            G.style.visibility = "hidden";
            G.style.position = "absolute";
            G.onload = function () {
                this.recyclable = true
            };
            E.push(G)
        }
        G.src = I;
        window.setTimeout(function () {
            document.body.appendChild(G)
        }, 0)
    }

    return{getCode: function () {
        return"ifpc"
    }, isParentVerifiable: function () {
        return true
    }, init: function (F, G) {
        C = G;
        C("..", true);
        return true
    }, setup: function (G, F) {
        C(G, true);
        return true
    }, call: function (F, K, I) {
        var J = gadgets.rpc.getRelayUrl(F);
        ++D;
        if (!J) {
            gadgets.warn("No relay file assigned for IFPC");
            return
        }
        var H = null;
        if (I.l) {
            var G = I.a;
            H = [J, "#", B([K, D, 1, 0, B([K, I.s, "", "", K].concat(G))])].join("")
        } else {
            H = [J, "#", F, "&", K, "@", D, "&1&0&", encodeURIComponent(gadgets.json.stringify(I))].join("")
        }
        A(H);
        return true
    }}
}();
;
var gadgets = gadgets || {};
gadgets.rpc = function () {
    var S = "__cb";
    var R = "";
    var G = "__ack";
    var Q = 500;
    var I = 10;
    var B = {};
    var C = {};
    var W = {};
    var J = {};
    var M = 0;
    var h = {};
    var V = {};
    var D = {};
    var e = {};
    var K = {};
    var U = {};
    var L = (window.top !== window.self);
    var N = window.name;
    var f = (function () {
        function i(j) {
            return function () {
                gadgets.log("gadgets.rpc." + j + "(" + gadgets.json.stringify(Array.prototype.slice.call(arguments)) + "): call ignored. [caller: " + document.location + ", isChild: " + L + "]")
            }
        }

        return{getCode: function () {
            return"noop"
        }, isParentVerifiable: function () {
            return true
        }, init: i("init"), setup: i("setup"), call: i("call")}
    })();
    if (gadgets.util) {
        e = gadgets.util.getUrlParameters()
    }
    var Z = (e.rpc_earlyq === "1");

    function A() {
        return typeof window.postMessage === "function" ? gadgets.rpctx.wpm : typeof window.postMessage === "object" ? gadgets.rpctx.wpm : window.ActiveXObject ? gadgets.rpctx.nix : navigator.userAgent.indexOf("WebKit") > 0 ? gadgets.rpctx.rmr : navigator.product === "Gecko" ? gadgets.rpctx.frameElement : gadgets.rpctx.ifpc
    }

    function a(o, m) {
        var k = b;
        if (!m) {
            k = f
        }
        K[o] = k;
        var j = U[o] || [];
        for (var l = 0; l < j.length; ++l) {
            var n = j[l];
            n.t = X(o);
            k.call(o, n.f, n)
        }
        U[o] = []
    }

    function T(j) {
        if (j && typeof j.s === "string" && typeof j.f === "string" && j.a instanceof Array) {
            if (J[j.f]) {
                if (J[j.f] !== j.t) {
                    throw new Error("Invalid auth token. " + J[j.f] + " vs " + j.t)
                }
            }
            if (j.s === G) {
                window.setTimeout(function () {
                    a(j.f, true)
                }, 0);
                return
            }
            if (j.c) {
                j.callback = function (k) {
                    gadgets.rpc.call(j.f, S, null, j.c, k)
                }
            }
            var i = (B[j.s] || B[R]).apply(j, j.a);
            if (j.c && typeof i !== "undefined") {
                gadgets.rpc.call(j.f, S, null, j.c, i)
            }
        }
    }

    function d(k) {
        if (!k) {
            return""
        }
        k = k.toLowerCase();
        if (k.indexOf("//") == 0) {
            k = window.location.protocol + k
        }
        if (k.indexOf("://") == -1) {
            k = window.location.protocol + "//" + k
        }
        var l = k.substring(k.indexOf("://") + 3);
        var i = l.indexOf("/");
        if (i != -1) {
            l = l.substring(0, i)
        }
        var n = k.substring(0, k.indexOf("://"));
        var m = "";
        var o = l.indexOf(":");
        if (o != -1) {
            var j = l.substring(o + 1);
            l = l.substring(0, o);
            if ((n === "http" && j !== "80") || (n === "https" && j !== "443")) {
                m = ":" + j
            }
        }
        return n + "://" + l + m
    }

    var b = A();
    B[R] = function () {
        gadgets.warn("Unknown RPC service: " + this.s)
    };
    B[S] = function (j, i) {
        var k = h[j];
        if (k) {
            delete h[j];
            k(i)
        }
    };
    function O(k, i) {
        if (V[k] === true) {
            return
        }
        if (typeof V[k] === "undefined") {
            V[k] = 0
        }
        var j = document.getElementById(k);
        if (k === ".." || j != null) {
            if (b.setup(k, i) === true) {
                V[k] = true;
                return
            }
        }
        if (V[k] !== true && V[k]++ < I) {
            window.setTimeout(function () {
                O(k, i)
            }, Q)
        } else {
            K[k] = f;
            V[k] = true
        }
    }

    function F(j, m) {
        if (typeof D[j] === "undefined") {
            D[j] = false;
            var l = gadgets.rpc.getRelayUrl(j);
            if (d(l) !== d(window.location.href)) {
                return false
            }
            var k = null;
            if (j === "..") {
                k = window.parent
            } else {
                k = window.frames[j]
            }
            try {
                D[j] = k.gadgets.rpc.receiveSameDomain
            } catch (i) {
                gadgets.error("Same domain call failed: parent= incorrectly set.")
            }
        }
        if (typeof D[j] === "function") {
            D[j](m);
            return true
        }
        return false
    }

    function H(j, i, k) {
        C[j] = i;
        W[j] = !!k
    }

    function X(i) {
        return J[i]
    }

    function E(i, j) {
        j = j || "";
        J[i] = String(j);
        O(i, j)
    }

    function P(i) {
        function k(n) {
            var p = n ? n.rpc : {};
            var m = p.parentRelayUrl;
            if (m.substring(0, 7) !== "http://" && m.substring(0, 8) !== "https://" && m.substring(0, 2) !== "//") {
                if (typeof e.parent === "string" && e.parent !== "") {
                    if (m.substring(0, 1) !== "/") {
                        var l = e.parent.lastIndexOf("/");
                        m = e.parent.substring(0, l + 1) + m
                    } else {
                        m = d(e.parent) + m
                    }
                }
            }
            var o = !!p.useLegacyProtocol;
            H("..", m, o);
            if (o) {
                b = gadgets.rpctx.ifpc;
                b.init(T, a)
            }
            E("..", i)
        }

        var j = {parentRelayUrl: gadgets.config.NonEmptyStringValidator};
        gadgets.config.register("rpc", j, k)
    }

    function Y(k, i) {
        var j = i || e.parent;
        if (j) {
            H("..", j);
            E("..", k)
        }
    }

    function c(i, m, o) {
        if (!gadgets.util) {
            return
        }
        var l = document.getElementById(i);
        if (!l) {
            throw new Error("Cannot set up gadgets.rpc receiver with ID: " + i + ", element not found.")
        }
        var j = m || l.src;
        H(i, j);
        var n = gadgets.util.getUrlParameters(l.src);
        var k = o || n.rpctoken;
        E(i, k)
    }

    function g(i, k, l) {
        if (i === "..") {
            var j = l || e.rpctoken || e.ifpctok || "";
            if (gadgets.config) {
                P(j)
            } else {
                Y(j, k)
            }
        } else {
            c(i, k, l)
        }
    }

    if (L) {
        g("..")
    }
    return{register: function (j, i) {
        if (j === S || j === G) {
            throw new Error("Cannot overwrite callback/ack service")
        }
        if (j === R) {
            throw new Error("Cannot overwrite default service: use registerDefault")
        }
        B[j] = i
    }, unregister: function (i) {
        if (i === S || i === G) {
            throw new Error("Cannot delete callback/ack service")
        }
        if (i === R) {
            throw new Error("Cannot delete default service: use unregisterDefault")
        }
        delete B[i]
    }, registerDefault: function (i) {
        B[R] = i
    }, unregisterDefault: function () {
        delete B[R]
    }, forceParentVerifiable: function () {
        if (!b.isParentVerifiable()) {
            b = gadgets.rpctx.ifpc
        }
    }, call: function (i, j, o, m) {
        i = i || "..";
        var n = "..";
        if (i === "..") {
            n = N
        }
        ++M;
        if (o) {
            h[M] = o
        }
        var l = {s: j, f: n, c: o ? M : 0, a: Array.prototype.slice.call(arguments, 3), t: J[i], l: W[i]};
        if (F(i, l)) {
            return
        }
        var k = K[i] ? K[i] : b;
        if (!k) {
            if (!U[i]) {
                U[i] = [l]
            } else {
                U[i].push(l)
            }
            return
        }
        if (W[i]) {
            k = gadgets.rpctx.ifpc
        }
        if (k.call(i, n, l) === false) {
            K[i] = f;
            b.call(i, n, l)
        }
    }, getRelayUrl: function (j) {
        var i = C[j];
        if (i && i.indexOf("//") == 0) {
            i = document.location.protocol + i
        }
        return i
    }, setRelayUrl: H, setAuthToken: E, setupReceiver: g, getAuthToken: X, getRelayChannel: function () {
        return b.getCode()
    }, receive: function (i) {
        if (i.length > 4) {
            T(gadgets.json.parse(decodeURIComponent(i[i.length - 1])))
        }
    }, receiveSameDomain: function (i) {
        i.a = Array.prototype.slice.call(i.a);
        window.setTimeout(function () {
            T(i)
        }, 0)
    }, getOrigin: d, init: function () {
        if (b.init(T, a) === false) {
            b = f
        }
    }, ACK: G, RPC_ID: N}
}();
gadgets.rpc.init();
;
Function.prototype.inherits = function (parentCtor) {
    function tempCtor() {
    };
    tempCtor.prototype = parentCtor.prototype;
    this.superClass_ = parentCtor.prototype;
    this.prototype = new tempCtor();
    this.prototype.constructor = this;
};
var gadgets = gadgets || {};
gadgets.errors = {};
gadgets.errors.SUBCLASS_RESPONSIBILITY = 'subclass responsibility';
gadgets.errors.TO_BE_DONE = 'to be done';
gadgets.callAsyncAndJoin = function (functions, continuation, opt_this) {
    var pending = functions.length;
    var results = [];
    for (var i = 0; i < functions.length; i++) {
        var wrapper = function (index) {
            functions[index].call(opt_this, function (result) {
                results[index] = result;
                if (--pending === 0) {
                    continuation(results);
                }
            });
        };
        wrapper(i);
    }
};
gadgets.Extensible = function () {
};
gadgets.Extensible.prototype.setDependencies = function (dependencies) {
    for (var p in dependencies) {
        this[p] = dependencies[p];
    }
};
gadgets.Extensible.prototype.getDependencies = function (name) {
    return this[name];
};
gadgets.UserPrefStore = function () {
};
gadgets.UserPrefStore.prototype.getPrefs = function (gadget) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.UserPrefStore.prototype.savePrefs = function (gadget) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.DefaultUserPrefStore = function () {
    gadgets.UserPrefStore.call(this);
};
gadgets.DefaultUserPrefStore.inherits(gadgets.UserPrefStore);
gadgets.DefaultUserPrefStore.prototype.getPrefs = function (gadget) {
};
gadgets.DefaultUserPrefStore.prototype.savePrefs = function (gadget) {
};
gadgets.GadgetService = function () {
};
gadgets.GadgetService.prototype.setHeight = function (elementId, height) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.GadgetService.prototype.setTitle = function (gadget, title) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.GadgetService.prototype.setUserPref = function (id) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.IfrGadgetService = function () {
    gadgets.GadgetService.call(this);
    gadgets.rpc.register('resize_iframe', this.setHeight);
    gadgets.rpc.register('set_pref', this.setUserPref);
    gadgets.rpc.register('set_title', this.setTitle);
    gadgets.rpc.register('requestNavigateTo', this.requestNavigateTo);
    gadgets.rpc.register('requestSendMessage', this.requestSendMessage);
};
gadgets.IfrGadgetService.inherits(gadgets.GadgetService);
gadgets.IfrGadgetService.prototype.setHeight = function (height) {
    if (height > gadgets.container.maxheight_) {
        height = gadgets.container.maxheight_;
    }
    var element = document.getElementById(this.f);
    if (element) {
        element.style.height = height + 'px';
    }
};
gadgets.IfrGadgetService.prototype.setTitle = function (title) {
    var element = document.getElementById(this.f + '_title');
    if (element) {
        element.innerHTML = title.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }
};
gadgets.IfrGadgetService.prototype.setUserPref = function (editToken, name, value) {
    var id = gadgets.container.gadgetService.getGadgetIdFromModuleId(this.f);
    var gadget = gadgets.container.getGadget(id);
    for (var i = 1, j = arguments.length; i < j; i += 2) {
        gadget.userPrefs[arguments[i]].value = arguments[i + 1];
    }
    gadget.saveUserPrefs();
};
gadgets.IfrGadgetService.prototype.requestSendMessage = function (recipients, message, opt_callback, opt_params) {
    if (opt_callback) {
        window.setTimeout(function () {
            opt_callback(new opensocial.ResponseItem(null, null, opensocial.ResponseItem.Error.NOT_IMPLEMENTED, null));
        }, 0);
    }
};
gadgets.IfrGadgetService.prototype.requestNavigateTo = function (view, opt_params) {
    var id = gadgets.container.gadgetService.getGadgetIdFromModuleId(this.f);
    var url = gadgets.container.gadgetService.getUrlForView(view);
    if (opt_params) {
        var paramStr = gadgets.json.stringify(opt_params);
        if (paramStr.length > 0) {
            url += '&appParams=' + encodeURIComponent(paramStr);
        }
    }
    if (url && document.location.href.indexOf(url) == -1) {
        document.location.href = url;
    }
};
gadgets.IfrGadgetService.prototype.getUrlForView = function (view) {
    if (view === 'canvas') {
        return'/canvas';
    } else if (view === 'profile') {
        return'/profile';
    } else {
        return null;
    }
};
gadgets.IfrGadgetService.prototype.getGadgetIdFromModuleId = function (moduleId) {
    return parseInt(moduleId.match(/_([0-9]+)$/)[1], 10);
};
gadgets.LayoutManager = function () {
};
gadgets.LayoutManager.prototype.getGadgetChrome = function (gadget) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.StaticLayoutManager = function () {
    gadgets.LayoutManager.call(this);
};
gadgets.StaticLayoutManager.inherits(gadgets.LayoutManager);
gadgets.StaticLayoutManager.prototype.setGadgetChromeIds = function (gadgetChromeIds) {
    this.gadgetChromeIds_ = gadgetChromeIds;
};
gadgets.StaticLayoutManager.prototype.pushGadgetChromeIds = function (gadgetChromeIds) {
    if (typeof this.gadgetChromeIds_ === 'undefined') {
        this.gadgetChromeIds_ = [];
    }
    this.gadgetChromeIds_ = this.gadgetChromeIds_.concat(gadgetChromeIds);
};
gadgets.StaticLayoutManager.prototype.getGadgetChrome = function (gadget) {
    var chromeId = this.gadgetChromeIds_[gadget.id];
    return chromeId ? document.getElementById(chromeId) : null;
};
gadgets.FloatLeftLayoutManager = function (layoutRootId) {
    gadgets.LayoutManager.call(this);
    this.layoutRootId_ = layoutRootId;
};
gadgets.FloatLeftLayoutManager.inherits(gadgets.LayoutManager);
gadgets.FloatLeftLayoutManager.prototype.getGadgetChrome = function (gadget) {
    var layoutRoot = document.getElementById(this.layoutRootId_);
    if (layoutRoot) {
        var chrome = document.createElement('div');
        chrome.className = 'gadgets-gadget-chrome';
        chrome.style.cssFloat = 'left';
        layoutRoot.appendChild(chrome);
        return chrome;
    } else {
        return null;
    }
};
gadgets.Gadget = function (params) {
    this.userPrefs = {};
    this.displayTitleBar = true;
    this.displayTitle = true;
    this.displayButtons = true;
    this.displaySettingsButton = true;
    this.displayToggleButton = true;
    if (params) {
        for (var name in params)if (params.hasOwnProperty(name)) {
            this[name] = params[name];
        }
    }
    if (!this.secureToken) {
        this.secureToken = 'john.doe:john.doe:appid:cont:url:0:default';
    }
};
gadgets.Gadget.prototype.getUserPrefs = function () {
    return this.userPrefs;
};
gadgets.Gadget.prototype.saveUserPrefs = function () {
    gadgets.container.userPrefStore.savePrefs(this);
};
gadgets.Gadget.prototype.getUserPrefValue = function (name) {
    var pref = this.userPrefs[name];
    return typeof(pref.value) != 'undefined' && pref.value != null ? pref.value : pref['default'];
};
gadgets.Gadget.prototype.render = function (chrome) {
    if (chrome) {
        var gadget = this;
        this.getContent(function (content) {
            chrome.innerHTML = content;
            window.frames[gadget.getIframeId()].location = gadget.getIframeUrl();
        });
    }
};
gadgets.Gadget.prototype.getContent = function (continuation) {
    gadgets.callAsyncAndJoin([this.getTitleBarContent, this.getUserPrefsDialogContent, this.getMainContent], function (results) {
        continuation(results.join(''));
    }, this);
};
gadgets.Gadget.prototype.getTitleBarContent = function (continuation) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.Gadget.prototype.getUserPrefsDialogContent = function (continuation) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.Gadget.prototype.getMainContent = function (continuation) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.Gadget.prototype.getAdditionalParams = function () {
    return'';
};
gadgets.IfrGadget = function (opt_params) {
    gadgets.Gadget.call(this, opt_params);
    this.serverBase_ = '../../';
};
gadgets.IfrGadget.inherits(gadgets.Gadget);
gadgets.IfrGadget.prototype.GADGET_IFRAME_PREFIX_ = 'remote_iframe_';
gadgets.IfrGadget.prototype.CONTAINER = 'default';
gadgets.IfrGadget.prototype.cssClassGadget = 'gadgets-gadget';
gadgets.IfrGadget.prototype.cssClassTitleBar = 'gadgets-gadget-title-bar';
gadgets.IfrGadget.prototype.cssClassTitle = 'gadgets-gadget-title';
gadgets.IfrGadget.prototype.cssClassTitleButtonBar = 'gadgets-gadget-title-button-bar';
gadgets.IfrGadget.prototype.cssClassGadgetUserPrefsDialog = 'gadgets-gadget-user-prefs-dialog';
gadgets.IfrGadget.prototype.cssClassGadgetUserPrefsDialogActionBar = 'gadgets-gadget-user-prefs-dialog-action-bar';
gadgets.IfrGadget.prototype.cssClassTitleButton = 'gadgets-gadget-title-button';
gadgets.IfrGadget.prototype.cssClassGadgetContent = 'gadgets-gadget-content';
gadgets.IfrGadget.prototype.rpcToken = (0x7FFFFFFF * Math.random()) | 0;
gadgets.IfrGadget.prototype.rpcRelay = 'files/container/rpc_relay.html';
gadgets.IfrGadget.prototype.getTitleBarContent = function (continuation) {
    if (!this.displayTitleBar) {
        return continuation();
    }
    var title = this.displayTitle ? '<span id="' +
        this.getIframeId() + '_title" class="' +
        this.cssClassTitle + '">' + (this.title ? this.title : 'Title') + '</span>' : '';
    var settingsButton = (this.hasViewablePrefs_() && this.displaySettingsButton) ? '<a href="#" onclick="gadgets.container.getGadget(' + this.id + ').handleOpenUserPrefsDialog();return false;" class="' + this.cssClassTitleButton + '">settings</a> ' : '';
    var toggleButton = this.displayToggleButton ? '<a href="#" onclick="gadgets.container.getGadget(' + this.id + ').handleToggle();return false;" class="' + this.cssClassTitleButton + '">toggle</a>' : '';
    var buttonBar = this.displayButtons ? '<span class="' +
        this.cssClassTitleButtonBar + '">' + settingsButton + toggleButton + '</span>' : '';
    continuation('<div id="' + this.cssClassTitleBar + '-' + this.id + '" class="' + this.cssClassTitleBar + '">' + title + buttonBar + '<div style="clear:both"></div></div>');
};
gadgets.IfrGadget.prototype.getUserPrefsDialogContent = function (continuation) {
    continuation('<div id="' + this.getUserPrefsDialogId() + '" class="' +
        this.cssClassGadgetUserPrefsDialog + '"></div>');
};
gadgets.IfrGadget.prototype.setServerBase = function (url) {
    this.serverBase_ = url;
};
gadgets.IfrGadget.prototype.getServerBase = function () {
    return this.serverBase_;
};
gadgets.IfrGadget.prototype.getMainContent = function (continuation) {
    var iframeId = this.getIframeId();
    gadgets.rpc.setRelayUrl(iframeId, this.serverBase_ + this.rpcRelay);
    gadgets.rpc.setAuthToken(iframeId, this.rpcToken);
    continuation('<div class="' + this.cssClassGadgetContent + '"><iframe id="' +
        iframeId + '" name="' + iframeId + '" class="' + this.cssClassGadget + '" src="about:blank' + '" frameborder="no" scrolling="no"' +
        (this.height ? ' height="' + this.height + '"' : '') +
        (this.width ? ' width="' + this.width + '"' : '') + '></iframe></div>');
};
gadgets.IfrGadget.prototype.getIframeId = function () {
    return this.GADGET_IFRAME_PREFIX_ + this.id;
};
gadgets.IfrGadget.prototype.getUserPrefsDialogId = function () {
    return this.getIframeId() + '_userPrefsDialog';
};
gadgets.IfrGadget.prototype.getIframeUrl = function () {
    return this.serverBase_ + 'ifr?' + 'container=' + this.CONTAINER + '&mid=' + this.id + '&nocache=' + gadgets.container.nocache_ + '&country=' + gadgets.container.country_ + '&lang=' + gadgets.container.language_ + '&view=' + gadgets.container.view_ +
        (this.specVersion ? '&v=' + this.specVersion : '') +
        (gadgets.container.parentUrl_ ? '&parent=' + encodeURIComponent(gadgets.container.parentUrl_) : '') +
        (this.debug ? '&debug=1' : '') +
        this.getAdditionalParams() +
        this.getUserPrefsParams() +
        (this.secureToken ? '&st=' + this.secureToken : '') + '&url=' + encodeURIComponent(this.specUrl) + '#rpctoken=' + this.rpcToken +
        (this.viewParams ? '&view-params=' + encodeURIComponent(gadgets.json.stringify(this.viewParams)) : '') +
        (this.hashData ? '&' + this.hashData : '');
};
gadgets.IfrGadget.prototype.getUserPrefsParams = function () {
    var params = '';
    for (var name in this.getUserPrefs()) {
        params += '&up_' + encodeURIComponent(name) + '=' +
            encodeURIComponent(this.getUserPrefValue(name));
    }
    return params;
};
gadgets.IfrGadget.prototype.handleToggle = function () {
    var gadgetIframe = document.getElementById(this.getIframeId());
    if (gadgetIframe) {
        var gadgetContent = gadgetIframe.parentNode;
        var display = gadgetContent.style.display;
        gadgetContent.style.display = display ? '' : 'none';
    }
};
gadgets.IfrGadget.prototype.hasViewablePrefs_ = function () {
    for (var name in this.getUserPrefs()) {
        var pref = this.userPrefs[name];
        if (pref.type != 'hidden') {
            return true;
        }
    }
    return false;
};
gadgets.IfrGadget.prototype.handleOpenUserPrefsDialog = function () {
    if (this.userPrefsDialogContentLoaded) {
        this.showUserPrefsDialog();
    } else {
        var gadget = this;
        var igCallbackName = 'ig_callback_' + this.id;
        window[igCallbackName] = function (userPrefsDialogContent) {
            gadget.userPrefsDialogContentLoaded = true;
            gadget.buildUserPrefsDialog(userPrefsDialogContent);
            gadget.showUserPrefsDialog();
        };
        var script = document.createElement('script');
        script.src = 'http://www.gmodules.com/ig/gadgetsettings?mid=' + this.id + '&output=js' + this.getUserPrefsParams() + '&url=' + this.specUrl;
        document.body.appendChild(script);
    }
};
gadgets.IfrGadget.prototype.buildUserPrefsDialog = function (content) {
    var userPrefsDialog = document.getElementById(this.getUserPrefsDialogId());
    userPrefsDialog.innerHTML = content + '<div class="' + this.cssClassGadgetUserPrefsDialogActionBar + '"><input type="button" value="Save" onclick="gadgets.container.getGadget(' +
        this.id + ').handleSaveUserPrefs()"> <input type="button" value="Cancel" onclick="gadgets.container.getGadget(' +
        this.id + ').handleCancelUserPrefs()"></div>';
    userPrefsDialog.childNodes[0].style.display = '';
};
gadgets.IfrGadget.prototype.showUserPrefsDialog = function (opt_show) {
    var userPrefsDialog = document.getElementById(this.getUserPrefsDialogId());
    userPrefsDialog.style.display = (opt_show || opt_show === undefined) ? '' : 'none';
};
gadgets.IfrGadget.prototype.hideUserPrefsDialog = function () {
    this.showUserPrefsDialog(false);
};
gadgets.IfrGadget.prototype.handleSaveUserPrefs = function () {
    this.hideUserPrefsDialog();
    var numFields = document.getElementById('m_' + this.id + '_numfields').value;
    for (var i = 0; i < numFields; i++) {
        var input = document.getElementById('m_' + this.id + '_' + i);
        var userPrefNamePrefix = 'm_' + this.id + '_up_';
        var userPrefName = input.name.substring(userPrefNamePrefix.length);
        var userPrefValue = input.value;
        this.userPrefs[userPrefName].value = userPrefValue;
    }
    this.saveUserPrefs();
    this.refresh();
};
gadgets.IfrGadget.prototype.handleCancelUserPrefs = function () {
    this.hideUserPrefsDialog();
};
gadgets.IfrGadget.prototype.refresh = function () {
    var iframeId = this.getIframeId();
    document.getElementById(iframeId).src = this.getIframeUrl();
};
gadgets.Container = function () {
    this.gadgets_ = {};
    this.parentUrl_ = 'http://' + document.location.host;
    this.country_ = 'ALL';
    this.language_ = 'ALL';
    this.view_ = 'default';
    this.nocache_ = 1;
    this.maxheight_ = 0x7FFFFFFF;
};
gadgets.Container.inherits(gadgets.Extensible);
gadgets.Container.prototype.gadgetClass = gadgets.Gadget;
gadgets.Container.prototype.userPrefStore = new gadgets.DefaultUserPrefStore();
gadgets.Container.prototype.gadgetService = new gadgets.GadgetService();
gadgets.Container.prototype.layoutManager = new gadgets.StaticLayoutManager();
gadgets.Container.prototype.setParentUrl = function (url) {
    this.parentUrl_ = url;
};
gadgets.Container.prototype.setCountry = function (country) {
    this.country_ = country;
};
gadgets.Container.prototype.setNoCache = function (nocache) {
    this.nocache_ = nocache;
};
gadgets.Container.prototype.setLanguage = function (language) {
    this.language_ = language;
};
gadgets.Container.prototype.setView = function (view) {
    this.view_ = view;
};
gadgets.Container.prototype.setMaxHeight = function (maxheight) {
    this.maxheight_ = maxheight;
};
gadgets.Container.prototype.getGadgetKey_ = function (instanceId) {
    return'gadget_' + instanceId;
};
gadgets.Container.prototype.getGadget = function (instanceId) {
    return this.gadgets_[this.getGadgetKey_(instanceId)];
};
gadgets.Container.prototype.createGadget = function (opt_params) {
    return new this.gadgetClass(opt_params);
};
gadgets.Container.prototype.addGadget = function (gadget) {
    gadget.id = this.getNextGadgetInstanceId();
    this.gadgets_[this.getGadgetKey_(gadget.id)] = gadget;
};
gadgets.Container.prototype.addGadgets = function (gadgets) {
    for (var i = 0; i < gadgets.length; i++) {
        this.addGadget(gadgets[i]);
    }
};
gadgets.Container.prototype.renderGadgets = function () {
    for (var key in this.gadgets_) {
        this.renderGadget(this.gadgets_[key]);
    }
};
gadgets.Container.prototype.renderGadget = function (gadget) {
    throw Error(gadgets.errors.SUBCLASS_RESPONSIBILITY);
};
gadgets.Container.prototype.nextGadgetInstanceId_ = 0;
gadgets.Container.prototype.getNextGadgetInstanceId = function () {
    return this.nextGadgetInstanceId_++;
};
gadgets.Container.prototype.refreshGadgets = function () {
    for (var key in this.gadgets_) {
        this.gadgets_[key].refresh();
    }
};
gadgets.IfrContainer = function () {
    gadgets.Container.call(this);
};
gadgets.IfrContainer.inherits(gadgets.Container);
gadgets.IfrContainer.prototype.gadgetClass = gadgets.IfrGadget;
gadgets.IfrContainer.prototype.gadgetService = new gadgets.IfrGadgetService();
gadgets.IfrContainer.prototype.setParentUrl = function (url) {
    if (!url.match(/^http[s]?:\/\//)) {
        url = document.location.href.match(/^[^?#]+\//)[0] + url;
    }
    this.parentUrl_ = url;
};
gadgets.IfrContainer.prototype.renderGadget = function (gadget) {
    var chrome = this.layoutManager.getGadgetChrome(gadget);
    gadget.render(chrome);
};
gadgets.container = new gadgets.IfrContainer();
var shindig = shindig || {};
shindig.cookies = shindig.cookies || {};
shindig.cookies.JsType_ = {UNDEFINED: 'undefined'};
shindig.cookies.isDef = function (val) {
    return typeof val != shindig.cookies.JsType_.UNDEFINED;
};
shindig.cookies.set = function (name, value, opt_maxAge, opt_path, opt_domain) {
    if (/;=/g.test(name)) {
        throw new Error('Invalid cookie name "' + name + '"');
    }
    if (/;/g.test(value)) {
        throw new Error('Invalid cookie value "' + value + '"');
    }
    if (!shindig.cookies.isDef(opt_maxAge)) {
        opt_maxAge = -1;
    }
    var domainStr = opt_domain ? ';domain=' + opt_domain : '';
    var pathStr = opt_path ? ';path=' + opt_path : '';
    var expiresStr;
    if (opt_maxAge < 0) {
        expiresStr = '';
    } else if (opt_maxAge === 0) {
        var pastDate = new Date(1970, 1, 1);
        expiresStr = ';expires=' + pastDate.toUTCString();
    } else {
        var futureDate = new Date((new Date).getTime() + opt_maxAge * 1000);
        expiresStr = ';expires=' + futureDate.toUTCString();
    }
    document.cookie = name + '=' + value + domainStr + pathStr + expiresStr;
};
shindig.cookies.get = function (name, opt_default) {
    var nameEq = name + "=";
    var cookie = String(document.cookie);
    for (var pos = -1; (pos = cookie.indexOf(nameEq, pos + 1)) >= 0;) {
        var i = pos;
        while (--i >= 0) {
            var ch = cookie.charAt(i);
            if (ch == ';') {
                i = -1;
                break;
            }
        }
        if (i == -1) {
            var end = cookie.indexOf(';', pos);
            if (end < 0) {
                end = cookie.length;
            }
            return cookie.substring(pos + nameEq.length, end);
        }
    }
    return opt_default;
};
shindig.cookies.remove = function (name, opt_path, opt_domain) {
    var rv = shindig.cookies.containsKey(name);
    shindig.cookies.set(name, '', 0, opt_path, opt_domain);
    return rv;
};
shindig.cookies.getKeyValues_ = function () {
    var cookie = String(document.cookie);
    var parts = cookie.split(/\s*;\s*/);
    var keys = [], values = [], index, part;
    for (var i = 0; part = parts[i]; i++) {
        index = part.indexOf('=');
        if (index == -1) {
            keys.push('');
            values.push(part);
        } else {
            keys.push(part.substring(0, index));
            values.push(part.substring(index + 1));
        }
    }
    return{keys: keys, values: values};
};
shindig.cookies.getKeys = function () {
    return shindig.cookies.getKeyValues_().keys;
};
shindig.cookies.getValues = function () {
    return shindig.cookies.getKeyValues_().values;
};
shindig.cookies.isEmpty = function () {
    return document.cookie === '';
};
shindig.cookies.getCount = function () {
    var cookie = String(document.cookie);
    if (cookie === '') {
        return 0;
    }
    var parts = cookie.split(/\s*;\s*/);
    return parts.length;
};
shindig.cookies.containsKey = function (key) {
    var sentinel = {};
    return shindig.cookies.get(key, sentinel) !== sentinel;
};
shindig.cookies.containsValue = function (value) {
    var values = shindig.cookies.getKeyValues_().values;
    for (var i = 0; i < values.length; i++) {
        if (values[i] == value) {
            return true;
        }
    }
    return false;
};
shindig.cookies.clear = function () {
    var keys = shindig.cookies.getKeyValues_().keys;
    for (var i = keys.length - 1; i >= 0; i--) {
        shindig.cookies.remove(keys[i]);
    }
};
shindig.cookies.MAX_COOKIE_LENGTH = 3950;
gadgets.CookieBasedUserPrefStore = function () {
    gadgets.UserPrefStore.call(this);
};
gadgets.CookieBasedUserPrefStore.inherits(gadgets.UserPrefStore);
gadgets.CookieBasedUserPrefStore.prototype.USER_PREFS_PREFIX = 'gadgetUserPrefs-';
gadgets.CookieBasedUserPrefStore.prototype.getPrefs = function (gadget) {
    var userPrefs = {};
    var cookieName = this.USER_PREFS_PREFIX + gadget.id;
    var cookie = shindig.cookies.get(cookieName);
    if (cookie) {
        var pairs = cookie.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var nameValue = pairs[i].split('=');
            var name = decodeURIComponent(nameValue[0]);
            var value = decodeURIComponent(nameValue[1]);
            userPrefs[name] = value;
        }
    }
    return userPrefs;
};
gadgets.CookieBasedUserPrefStore.prototype.savePrefs = function (gadget) {
    var pairs = [];
    for (var name in gadget.getUserPrefs()) {
        var value = gadget.getUserPref(name);
        var pair = encodeURIComponent(name) + '=' + encodeURIComponent(value);
        pairs.push(pair);
    }
    var cookieName = this.USER_PREFS_PREFIX + gadget.id;
    var cookieValue = pairs.join('&');
    shindig.cookies.set(cookieName, cookieValue);
};
gadgets.Container.prototype.userPrefStore = new gadgets.CookieBasedUserPrefStore();
(function ($) {
    var currentGlobalGadgetIdIndex = 0;
    $.fn.openSocialGadget = function (options) {
        var settings = {'baseURL': 'http://localhost:8080/nuxeo/', 'language': 'ALL', 'gadgetDefs': [], 'shindigServerSuffix': 'opensocial/gadgets/', 'secureTokenSuffix': 'site/gadgets/securetoken'};
        if (options) {
            $.extend(settings, options);
        }
        var elements = this;
        var currentGadgetIdIndex = currentGlobalGadgetIdIndex;
        currentGlobalGadgetIdIndex += settings.gadgetDefs.length;
        var gadgetSpecs = $.map(settings.gadgetDefs, function (value, index) {
            return value['specUrl'];
        });
        $.post(settings.baseURL + settings.secureTokenSuffix, {'gadgetSpecUrls[]': gadgetSpecs}, function (data) {
            function generateId() {
                return'opensocial-gadget-' + currentGadgetIdIndex++;
            }

            var secureTokens = data.split(",");
            var chromeIds = [];
            var createdGadgets = [];
            var index = 0;
            elements.each(function () {
                if (index >= gadgetSpecs.length) {
                    if (window.console) {
                        console.log("no more gadgetSpec available, check init parameters")
                    }
                    return this;
                }
                gadgets.container.setLanguage(settings.language);
                gadgets.container.setParentUrl(settings.baseURL);
                var gadget = gadgets.container.createGadget({specUrl: gadgetSpecs[index]});
                gadget.serverBase_ = settings.baseURL + settings.shindigServerSuffix;
                gadget.secureToken = secureTokens[index];
                var element = $(this);
                $.each(settings.gadgetDefs[index], function (name, value) {
                    if (name === 'displayBorder') {
                        if (!value) {
                            element.addClass('no-border')
                        }
                    } else if (name != 'specUrl') {
                        gadget[name] = value;
                    }
                });
                gadgets.container.addGadget(gadget);
                createdGadgets.push(gadget);
                var id = $(this).attr('id');
                if (id.length == 0) {
                    id = generateId();
                    $(this).attr('id', id);
                }
                chromeIds.push(id);
                index++;
            });
            gadgets.container.layoutManager.pushGadgetChromeIds(chromeIds);
            var length = createdGadgets.length;
            for (var i = 0; i < length; ++i) {
                gadgets.container.renderGadget(createdGadgets[i]);
            }
        });
        return this;
    };
})(jQuery);
function AutomationWrapper(operationId, opts) {
    this.operationId = operationId;
    this.opts = opts;
    AutomationWrapper.prototype.addParameter = function (name, value) {
        this.opts.automationParams.params[name] = value;
        return this;
    }
    AutomationWrapper.prototype.addParameters = function (params) {
        jQuery.extend(this.opts.automationParams.params, params);
        return this;
    }
    AutomationWrapper.prototype.context = function (name, value) {
        this.opts.automationParams.context[name] = value;
        return this;
    }
    AutomationWrapper.prototype.setContext = function (ctxParams) {
        jQuery.extend(this.opts.automationParams.context, ctxParams);
        return this;
    }
    AutomationWrapper.prototype.setTimeout = function (timeout) {
        this.opts.execTimeout = timeout;
        return this;
    }
    AutomationWrapper.prototype.execute = function (successCB, failureCB, voidOp) {
        var targetUrl = this.opts.url;
        if (targetUrl.indexOf("/", targetUrl.length - 1) == -1) {
            targetUrl = targetUrl + "/";
        }
        targetUrl = targetUrl + this.operationId;
        if (!voidOp) {
            voidOp = false;
        }
        var timeout = 5 + (this.opts.execTimeout / 1000) | 0;
        jQuery.ajax({type: 'POST', contentType: 'application/json+nxrequest', data: JSON.stringify(this.opts.automationParams), beforeSend: function (xhr) {
            xhr.setRequestHeader('X-NXVoidOperation', voidOp);
            xhr.setRequestHeader('Nuxeo-Transaction-Timeout', timeout);
        }, url: targetUrl, timeout: this.opts.execTimeout, error: function (xhr, status, e) {
            if (failureCB) {
                failureCB(xhr, status, "No Data");
            } else {
                log("Failed to execute");
                log("Error, Status =" + status);
            }
        }, success: function (data, status, xhr) {
            log("Executed OK");
            if (status == "success") {
                successCB(data, status, xhr);
            } else {
                if (failureCB) {
                    failureCB(xhr, status, "No Data");
                } else {
                    log("Error, Status =" + status);
                }
            }
        }})
    }
    AutomationWrapper.prototype.executeGetBlob = function (successCB, failureCB, blobOp) {
        var targetUrl = this.opts.url;
        if (targetUrl.indexOf("/", targetUrl.length - 1) == -1) {
            targetUrl = targetUrl + "/";
        }
        targetUrl = targetUrl + this.operationId;
        if (!blobOp) {
            voidOp = false;
        }
        var timeout = 5 + (this.opts.execTimeout / 1000) | 0;
        jQuery.ajax({type: 'POST', contentType: 'application/json+nxrequest', data: JSON.stringify(this.opts.automationParams), beforeSend: function (xhr) {
            xhr.setRequestHeader('CTYPE_MULTIPART_MIXED', blobOp);
            xhr.setRequestHeader('Nuxeo-Transaction-Timeout', timeout);
        }, url: targetUrl, timeout: this.opts.execTimeout, error: function (xhr, status, e) {
            if (failureCB) {
                failureCB(xhr, status, "No Data");
            } else {
                log("Failed to execute");
                log("Error, Status =" + status);
            }
        }, success: function (data, status, xhr) {
            log("Executed OK");
            if (status == "success") {
                successCB(data, status, xhr);
            } else {
                if (failureCB) {
                    failureCB(xhr, status, "No Data");
                } else {
                    log("Error, Status =" + status);
                }
            }
        }})
    }
    AutomationWrapper.prototype.log = function (msg) {
        if (window.console) {
        }
    }
    AutomationWrapper.prototype.batchExecute = function (batchId, successCB, failureCB, voidOp) {
        if (!voidOp) {
            voidOp = false;
        }
        this.addParameter("operationId", this.operationId);
        this.addParameter("batchId", batchId);
        var targetUrl = this.opts.url;
        var targetUrl = this.opts.url;
        if (targetUrl.indexOf("/", targetUrl.length - 1) == -1) {
            targetUrl = targetUrl + "/";
        }
        if (targetUrl.indexOf('/batch/execute') < 0) {
            targetUrl = targetUrl + 'batch/execute';
        }
        var timeout = 5 + (this.opts.execTimeout / 1000) | 0;
        jQuery.ajax({type: 'POST', contentType: 'application/json+nxrequest', data: JSON.stringify(this.opts.automationParams), beforeSend: function (xhr) {
            xhr.setRequestHeader('X-NXVoidOperation', voidOp);
            xhr.setRequestHeader('Nuxeo-Transaction-Timeout', timeout);
        }, url: targetUrl, timeout: this.opts.execTimeout, error: function (xhr, status, e) {
            log("Failed to execute");
            if (failureCB) {
                var errorMessage = null;
                if (xhr.response) {
                    errorMessage = xhr.response;
                    var parsedError = errorMessage;
                    try {
                        parsedError = JSON.parse(errorMessage);
                        errorMessage = parsedError.error
                    } catch (err) {
                    }
                }
                failureCB(xhr, status, errorMessage);
            } else {
                log("Error, Status =" + status);
            }
        }, success: function (data, status, xhr) {
            log("Executed OK : " + status);
            if (status == "success") {
                successCB(data, status, xhr);
            } else {
                console.log
                if (failureCB) {
                    failureCB(xhr, status, "No Data");
                } else {
                    log("Error, Status =" + status);
                }
            }
        }})
    }
}
(function ($) {
    $.fn.automation = function (operationId, options) {
        var opts = jQuery.extend({}, $.fn.automation.defaults, options);
        return new AutomationWrapper(operationId, opts);
    }
    $.fn.automation.defaults = {url: nxContextPath + "/site/automation", execTimeout: 30000, uploadTimeout: 30000, automationParams: {params: {}, context: {}}}
})(jQuery);
jsPlumbUtil = {isArray: function (b) {
    return Object.prototype.toString.call(b) === "[object Array]"
}, isString: function (a) {
    return typeof a === "string"
}, isObject: function (a) {
    return Object.prototype.toString.call(a) === "[object Object]"
}, convertStyle: function (b, a) {
    if ("transparent" === b) {
        return b
    }
    var g = b, f = function (h) {
        return h.length == 1 ? "0" + h : h
    }, c = function (h) {
        return f(Number(h).toString(16))
    }, d = /(rgb[a]?\()(.*)(\))/;
    if (b.match(d)) {
        var e = b.match(d)[2].split(",");
        g = "#" + c(e[0]) + c(e[1]) + c(e[2]);
        if (!a && e.length == 4) {
            g = g + c(e[3])
        }
    }
    return g
}, gradient: function (b, a) {
    b = jsPlumbUtil.isArray(b) ? b : [b.x, b.y];
    a = jsPlumbUtil.isArray(a) ? a : [a.x, a.y];
    return(a[1] - b[1]) / (a[0] - b[0])
}, normal: function (b, a) {
    return-1 / jsPlumbUtil.gradient(b, a)
}, lineLength: function (b, a) {
    b = jsPlumbUtil.isArray(b) ? b : [b.x, b.y];
    a = jsPlumbUtil.isArray(a) ? a : [a.x, a.y];
    return Math.sqrt(Math.pow(a[1] - b[1], 2) + Math.pow(a[0] - b[0], 2))
}, segment: function (b, a) {
    b = jsPlumbUtil.isArray(b) ? b : [b.x, b.y];
    a = jsPlumbUtil.isArray(a) ? a : [a.x, a.y];
    if (a[0] > b[0]) {
        return(a[1] > b[1]) ? 2 : 1
    } else {
        return(a[1] > b[1]) ? 3 : 4
    }
}, intersects: function (f, e) {
    var c = f.x, a = f.x + f.w, k = f.y, h = f.y + f.h, d = e.x, b = e.x + e.w, i = e.y, g = e.y + e.h;
    return((c <= d && d <= a) && (k <= i && i <= h)) || ((c <= b && b <= a) && (k <= i && i <= h)) || ((c <= d && d <= a) && (k <= g && g <= h)) || ((c <= b && d <= a) && (k <= g && g <= h)) || ((d <= c && c <= b) && (i <= k && k <= g)) || ((d <= a && a <= b) && (i <= k && k <= g)) || ((d <= c && c <= b) && (i <= h && h <= g)) || ((d <= a && c <= b) && (i <= h && h <= g))
}, segmentMultipliers: [null, [1, -1], [1, 1], [-1, 1], [-1, -1]], inverseSegmentMultipliers: [null, [-1, -1], [-1, 1], [1, 1], [1, -1]], pointOnLine: function (a, e, b) {
    var d = jsPlumbUtil.gradient(a, e), i = jsPlumbUtil.segment(a, e), h = b > 0 ? jsPlumbUtil.segmentMultipliers[i] : jsPlumbUtil.inverseSegmentMultipliers[i], c = Math.atan(d), f = Math.abs(b * Math.sin(c)) * h[1], g = Math.abs(b * Math.cos(c)) * h[0];
    return{x: a.x + g, y: a.y + f}
}, perpendicularLineTo: function (c, d, e) {
    var b = jsPlumbUtil.gradient(c, d), f = Math.atan(-1 / b), g = e / 2 * Math.sin(f), a = e / 2 * Math.cos(f);
    return[
        {x: d.x + a, y: d.y + g},
        {x: d.x - a, y: d.y - g}
    ]
}, findWithFunction: function (b, d) {
    if (b) {
        for (var c = 0; c < b.length; c++) {
            if (d(b[c])) {
                return c
            }
        }
    }
    return-1
}, indexOf: function (a, b) {
    return jsPlumbUtil.findWithFunction(a, function (c) {
        return c == b
    })
}, removeWithFunction: function (c, d) {
    var b = jsPlumbUtil.findWithFunction(c, d);
    if (b > -1) {
        c.splice(b, 1)
    }
    return b != -1
}, remove: function (b, c) {
    var a = jsPlumbUtil.indexOf(b, c);
    if (a > -1) {
        b.splice(a, 1)
    }
    return a != -1
}, addWithFunction: function (c, b, a) {
    if (jsPlumbUtil.findWithFunction(c, a) == -1) {
        c.push(b)
    }
}, addToList: function (d, b, c) {
    var a = d[b];
    if (a == null) {
        a = [], d[b] = a
    }
    a.push(c);
    return a
}, EventGenerator: function () {
    var c = {}, b = this;
    var a = ["ready"];
    this.bind = function (d, e) {
        jsPlumbUtil.addToList(c, d, e);
        return b
    };
    this.fire = function (g, h, d) {
        if (c[g]) {
            for (var f = 0; f < c[g].length; f++) {
                if (jsPlumbUtil.findWithFunction(a, function (i) {
                    return i === g
                }) != -1) {
                    c[g][f](h, d)
                } else {
                    try {
                        c[g][f](h, d)
                    } catch (k) {
                        jsPlumbUtil.log("jsPlumb: fire failed for event " + g + " : " + k)
                    }
                }
            }
        }
        return b
    };
    this.clearListeners = function (d) {
        if (d) {
            delete c[d]
        } else {
            delete c;
            c = {}
        }
        return b
    };
    this.getListener = function (d) {
        return c[d]
    }
}, logEnabled: true, log: function () {
    if (jsPlumbUtil.logEnabled && typeof console != "undefined") {
        try {
            var b = arguments[arguments.length - 1];
            console.log(b)
        } catch (a) {
        }
    }
}, group: function (a) {
    if (jsPlumbUtil.logEnabled && typeof console != "undefined") {
        console.group(a)
    }
}, groupEnd: function (a) {
    if (jsPlumbUtil.logEnabled && typeof console != "undefined") {
        console.groupEnd(a)
    }
}, time: function (a) {
    if (jsPlumbUtil.logEnabled && typeof console != "undefined") {
        console.time(a)
    }
}, timeEnd: function (a) {
    if (jsPlumbUtil.logEnabled && typeof console != "undefined") {
        console.timeEnd(a)
    }
}};
(function () {
    var A = !!document.createElement("canvas").getContext, e = !!window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"), b = function () {
        if (b.vml == undefined) {
            var L = document.body.appendChild(document.createElement("div"));
            L.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
            var K = L.firstChild;
            K.style.behavior = "url(#default#VML)";
            b.vml = K ? typeof K.adj == "object" : true;
            L.parentNode.removeChild(L)
        }
        return b.vml
    };
    var i = jsPlumbUtil.findWithFunction, J = jsPlumbUtil.indexOf, D = jsPlumbUtil.removeWithFunction, m = jsPlumbUtil.remove, u = jsPlumbUtil.addWithFunction, l = jsPlumbUtil.addToList, n = jsPlumbUtil.isArray, C = jsPlumbUtil.isString, w = jsPlumbUtil.isObject;
    if (!window.console) {
        window.console = {time: function () {
        }, timeEnd: function () {
        }, group: function () {
        }, groupEnd: function () {
        }, log: function () {
        }}
    }
    var x = null, d = function (K, L) {
        return p.CurrentLibrary.getAttribute(F(K), L)
    }, f = function (L, M, K) {
        p.CurrentLibrary.setAttribute(F(L), M, K)
    }, B = function (L, K) {
        p.CurrentLibrary.addClass(F(L), K)
    }, k = function (L, K) {
        return p.CurrentLibrary.hasClass(F(L), K)
    }, o = function (L, K) {
        p.CurrentLibrary.removeClass(F(L), K)
    }, F = function (K) {
        return p.CurrentLibrary.getElementObject(K)
    }, t = function (K) {
        return p.CurrentLibrary.getOffset(F(K))
    }, a = function (K) {
        return p.CurrentLibrary.getSize(F(K))
    }, q = jsPlumbUtil.log, I = jsPlumbUtil.group, h = jsPlumbUtil.groupEnd, H = jsPlumbUtil.time, v = jsPlumbUtil.timeEnd, r = function () {
        return"" + (new Date()).getTime()
    }, E = function (Z) {
        var U = this, aa = arguments, R = false, O = Z.parameters || {}, M = U.idPrefix, W = M + (new Date()).getTime(), V = null, ab = null;
        U._jsPlumb = Z._jsPlumb;
        U.getId = function () {
            return W
        };
        U.tooltip = Z.tooltip;
        U.hoverClass = Z.hoverClass || U._jsPlumb.Defaults.HoverClass || p.Defaults.HoverClass;
        jsPlumbUtil.EventGenerator.apply(this);
        this.clone = function () {
            var ac = new Object();
            U.constructor.apply(ac, aa);
            return ac
        };
        this.getParameter = function (ac) {
            return O[ac]
        }, this.getParameters = function () {
            return O
        }, this.setParameter = function (ac, ad) {
            O[ac] = ad
        }, this.setParameters = function (ac) {
            O = ac
        }, this.overlayPlacements = [];
        var N = Z.beforeDetach;
        this.isDetachAllowed = function (ac) {
            var ad = U._jsPlumb.checkCondition("beforeDetach", ac);
            if (N) {
                try {
                    ad = N(ac)
                } catch (ae) {
                    q("jsPlumb: beforeDetach callback failed", ae)
                }
            }
            return ad
        };
        var Q = Z.beforeDrop;
        this.isDropAllowed = function (ah, ae, af, ac, ad) {
            var ag = U._jsPlumb.checkCondition("beforeDrop", {sourceId: ah, targetId: ae, scope: af, connection: ac, dropEndpoint: ad});
            if (Q) {
                try {
                    ag = Q({sourceId: ah, targetId: ae, scope: af, connection: ac, dropEndpoint: ad})
                } catch (ai) {
                    q("jsPlumb: beforeDrop callback failed", ai)
                }
            }
            return ag
        };
        var X = function () {
            if (V && ab) {
                var ac = {};
                p.extend(ac, V);
                p.extend(ac, ab);
                delete U.hoverPaintStyle;
                if (ac.gradient && V.fillStyle) {
                    delete ac.gradient
                }
                ab = ac
            }
        };
        this.setPaintStyle = function (ac, ad) {
            V = ac;
            U.paintStyleInUse = V;
            X();
            if (!ad) {
                U.repaint()
            }
        };
        this.getPaintStyle = function () {
            return V
        };
        this.setHoverPaintStyle = function (ac, ad) {
            ab = ac;
            X();
            if (!ad) {
                U.repaint()
            }
        };
        this.getHoverPaintStyle = function () {
            return ab
        };
        this.setHover = function (ac, ae, ad) {
            if (!U._jsPlumb.currentlyDragging && !U._jsPlumb.isHoverSuspended()) {
                R = ac;
                if (U.hoverClass != null && U.canvas != null) {
                    if (ac) {
                        L.addClass(U.canvas, U.hoverClass)
                    } else {
                        L.removeClass(U.canvas, U.hoverClass)
                    }
                }
                if (ab != null) {
                    U.paintStyleInUse = ac ? ab : V;
                    ad = ad || r();
                    U.repaint({timestamp: ad, recalc: false})
                }
                if (U.getAttachedElements && !ae) {
                    Y(ac, r(), U)
                }
            }
        };
        this.isHover = function () {
            return R
        };
        var L = p.CurrentLibrary, K = ["click", "dblclick", "mouseenter", "mouseout", "mousemove", "mousedown", "mouseup", "contextmenu"], T = {mouseout: "mouseexit"}, P = function (ae, af, ad) {
            var ac = T[ad] || ad;
            L.bind(ae, ad, function (ag) {
                af.fire(ac, af, ag)
            })
        }, S = function (ae, ad) {
            var ac = T[ad] || ad;
            L.unbind(ae, ad)
        };
        this.attachListeners = function (ad, ae) {
            for (var ac = 0; ac < K.length; ac++) {
                P(ad, ae, K[ac])
            }
        };
        var Y = function (ag, af, ac) {
            var ae = U.getAttachedElements();
            if (ae) {
                for (var ad = 0; ad < ae.length; ad++) {
                    if (!ac || ac != ae[ad]) {
                        ae[ad].setHover(ag, true, af)
                    }
                }
            }
        };
        this.reattachListenersForElement = function (ad) {
            if (arguments.length > 1) {
                for (var ac = 0; ac < K.length; ac++) {
                    S(ad, K[ac])
                }
                for (var ac = 1; ac < arguments.length; ac++) {
                    U.attachListeners(ad, arguments[ac])
                }
            }
        }
    }, z = function (P) {
        E.apply(this, arguments);
        var U = this;
        this.overlays = [];
        var N = function (Z) {
            var X = null;
            if (n(Z)) {
                var W = Z[0], Y = p.extend({component: U, _jsPlumb: U._jsPlumb}, Z[1]);
                if (Z.length == 3) {
                    p.extend(Y, Z[2])
                }
                X = new p.Overlays[U._jsPlumb.getRenderMode()][W](Y);
                if (Y.events) {
                    for (var V in Y.events) {
                        X.bind(V, Y.events[V])
                    }
                }
            } else {
                if (Z.constructor == String) {
                    X = new p.Overlays[U._jsPlumb.getRenderMode()][Z]({component: U, _jsPlumb: U._jsPlumb})
                } else {
                    X = Z
                }
            }
            U.overlays.push(X)
        }, O = function (Z) {
            var V = U.defaultOverlayKeys || [], Y = Z.overlays, W = function (aa) {
                return U._jsPlumb.Defaults[aa] || p.Defaults[aa] || []
            };
            if (!Y) {
                Y = []
            }
            for (var X = 0; X < V.length; X++) {
                Y.unshift.apply(Y, W(V[X]))
            }
            return Y
        };
        var L = O(P);
        if (L) {
            for (var Q = 0; Q < L.length; Q++) {
                N(L[Q])
            }
        }
        var K = function (X) {
            var V = -1;
            for (var W = 0; W < U.overlays.length; W++) {
                if (X === U.overlays[W].id) {
                    V = W;
                    break
                }
            }
            return V
        };
        this.addOverlay = function (V) {
            N(V);
            U.repaint()
        };
        this.getOverlay = function (W) {
            var V = K(W);
            return V >= 0 ? U.overlays[V] : null
        };
        this.getOverlays = function () {
            return U.overlays
        };
        this.hideOverlay = function (W) {
            var V = U.getOverlay(W);
            if (V) {
                V.hide()
            }
        };
        this.hideOverlays = function () {
            for (var V = 0; V < U.overlays.length; V++) {
                U.overlays[V].hide()
            }
        };
        this.showOverlay = function (W) {
            var V = U.getOverlay(W);
            if (V) {
                V.show()
            }
        };
        this.showOverlays = function () {
            for (var V = 0; V < U.overlays.length; V++) {
                U.overlays[V].show()
            }
        };
        this.removeAllOverlays = function () {
            for (var V in U.overlays) {
                U.overlays[V].cleanup()
            }
            U.overlays.splice(0, U.overlays.length);
            U.repaint()
        };
        this.removeOverlay = function (W) {
            var V = K(W);
            if (V != -1) {
                var X = U.overlays[V];
                X.cleanup();
                U.overlays.splice(V, 1)
            }
        };
        this.removeOverlays = function () {
            for (var V = 0; V < arguments.length; V++) {
                U.removeOverlay(arguments[V])
            }
        };
        var M = "__label", T = function (X) {
            var V = {cssClass: X.cssClass, labelStyle: this.labelStyle, id: M, component: U, _jsPlumb: U._jsPlumb}, W = p.extend(V, X);
            return new p.Overlays[U._jsPlumb.getRenderMode()].Label(W)
        };
        if (P.label) {
            var R = P.labelLocation || U.defaultLabelLocation || 0.5, S = P.labelStyle || U._jsPlumb.Defaults.LabelStyle || p.Defaults.LabelStyle;
            this.overlays.push(T({label: P.label, location: R, labelStyle: S}))
        }
        this.setLabel = function (V) {
            var W = U.getOverlay(M);
            if (!W) {
                var X = V.constructor == String || V.constructor == Function ? {label: V} : V;
                W = T(X);
                this.overlays.push(W)
            } else {
                if (V.constructor == String || V.constructor == Function) {
                    W.setLabel(V)
                } else {
                    if (V.label) {
                        W.setLabel(V.label)
                    }
                    if (V.location) {
                        W.setLocation(V.location)
                    }
                }
            }
            U.repaint()
        };
        this.getLabel = function () {
            var V = U.getOverlay(M);
            return V != null ? V.getLabel() : null
        };
        this.getLabelOverlay = function () {
            return U.getOverlay(M)
        }
    }, G = function (M, K, L) {
        M.bind("click", function (N, O) {
            K.fire("click", K, O)
        });
        M.bind("dblclick", function (N, O) {
            K.fire("dblclick", K, O)
        });
        M.bind("contextmenu", function (N, O) {
            K.fire("contextmenu", K, O)
        });
        M.bind("mouseenter", function (N, O) {
            if (!K.isHover()) {
                L(true);
                K.fire("mouseenter", K, O)
            }
        });
        M.bind("mouseexit", function (N, O) {
            if (K.isHover()) {
                L(false);
                K.fire("mouseexit", K, O)
            }
        })
    };
    var g = 0, c = function () {
        var K = g + 1;
        g++;
        return K
    };
    var y = function (L) {
        this.Defaults = {Anchor: "BottomCenter", Anchors: [null, null], ConnectionsDetachable: true, ConnectionOverlays: [], Connector: "Bezier", Container: null, DragOptions: {}, DropOptions: {}, Endpoint: "Dot", EndpointOverlays: [], Endpoints: [null, null], EndpointStyle: {fillStyle: "#456"}, EndpointStyles: [null, null], EndpointHoverStyle: null, EndpointHoverStyles: [null, null], HoverPaintStyle: null, LabelStyle: {color: "black"}, LogEnabled: false, Overlays: [], MaxConnections: 1, PaintStyle: {lineWidth: 8, strokeStyle: "#456"}, RenderMode: "svg", Scope: "jsPlumb_DefaultScope"};
        if (L) {
            p.extend(this.Defaults, L)
        }
        this.logEnabled = this.Defaults.LogEnabled;
        jsPlumbUtil.EventGenerator.apply(this);
        var bn = this, aL = c(), aO = bn.bind, aC = {};
        for (var aB in this.Defaults) {
            aC[aB] = this.Defaults[aB]
        }
        this.bind = function (bw, bv) {
            if ("ready" === bw && M) {
                bv()
            } else {
                aO.apply(bn, [bw, bv])
            }
        };
        bn.importDefaults = function (bw) {
            for (var bv in bw) {
                bn.Defaults[bv] = bw[bv]
            }
        };
        bn.restoreDefaults = function () {
            bn.Defaults = p.extend({}, aC)
        };
        var P = null, ar = function () {
            p.repaintEverything()
        }, bp = true, aP = function () {
            if (bp) {
                ar()
            }
        }, be = null, M = false, aY = {}, aT = {}, aU = {}, ah = {}, br = {}, bf = {}, bm = {}, bu = [], ae = [], Q = this.Defaults.Scope, X = null, V = function (by, bw, bx) {
            var bv = by[bw];
            if (bv == null) {
                bv = [];
                by[bw] = bv
            }
            bv.push(bx);
            return bv
        }, aW = function (bw, bv) {
            if (bn.Defaults.Container) {
                p.CurrentLibrary.appendElement(bw, bn.Defaults.Container)
            } else {
                if (!bv) {
                    document.body.appendChild(bw)
                } else {
                    p.CurrentLibrary.appendElement(bw, bv)
                }
            }
        }, aD = 1, ak = function () {
            return"" + aD++
        }, aI = function (bv) {
            return bv._nodes ? bv._nodes : bv
        }, a6 = false, bg = function (bw, bv) {
            a6 = bw;
            if (bv) {
                bn.repaintEverything()
            }
        }, ba = function (bx, bz, by) {
            if (!a6) {
                var bA = d(bx, "id"), bv = bn.dragManager.getElementsForDraggable(bA);
                if (by == null) {
                    by = r()
                }
                bn.anchorManager.redraw(bA, bz, by);
                if (bv) {
                    for (var bw in bv) {
                        bn.anchorManager.redraw(bv[bw].id, bz, by, bv[bw].offset)
                    }
                }
            }
        }, aG = function (bw, by) {
            var bz = null;
            if (n(bw)) {
                bz = [];
                for (var bv = 0; bv < bw.length; bv++) {
                    var bx = F(bw[bv]), bA = d(bx, "id");
                    bz.push(by(bx, bA))
                }
            } else {
                var bx = F(bw), bA = d(bx, "id");
                bz = by(bx, bA)
            }
            return bz
        }, av = function (bv) {
            return aU[bv]
        }, bb = function (bz, bv, bC) {
            var bE = bv == null ? false : bv, bA = p.CurrentLibrary;
            if (bE) {
                if (bA.isDragSupported(bz) && !bA.isAlreadyDraggable(bz)) {
                    var bD = bC || bn.Defaults.DragOptions || p.Defaults.DragOptions;
                    bD = p.extend({}, bD);
                    var bB = bA.dragEvents.drag, bw = bA.dragEvents.stop, by = bA.dragEvents.start;
                    bD[by] = am(bD[by], function () {
                        bn.setHoverSuspended(true)
                    });
                    bD[bB] = am(bD[bB], function () {
                        var bF = bA.getUIPosition(arguments);
                        ba(bz, bF);
                        B(bz, "jsPlumb_dragged")
                    });
                    bD[bw] = am(bD[bw], function () {
                        var bF = bA.getUIPosition(arguments);
                        ba(bz, bF);
                        o(bz, "jsPlumb_dragged");
                        bn.setHoverSuspended(false)
                    });
                    var bx = K(bz);
                    bm[bx] = true;
                    var bE = bm[bx];
                    bD.disabled = bE == null ? false : !bE;
                    bA.initDraggable(bz, bD, false);
                    bn.dragManager.register(bz)
                }
            }
        }, aA = function (bB, bw) {
            var bv = p.extend({}, bB);
            if (bw) {
                p.extend(bv, bw)
            }
            if (bv.source && bv.source.endpoint) {
                bv.sourceEndpoint = bv.source
            }
            if (bv.source && bv.target.endpoint) {
                bv.targetEndpoint = bv.target
            }
            if (bB.uuids) {
                bv.sourceEndpoint = av(bB.uuids[0]);
                bv.targetEndpoint = av(bB.uuids[1])
            }
            if (bv.sourceEndpoint && bv.sourceEndpoint.isFull()) {
                q(bn, "could not add connection; source endpoint is full");
                return
            }
            if (bv.targetEndpoint && bv.targetEndpoint.isFull()) {
                q(bn, "could not add connection; target endpoint is full");
                return
            }
            if (bv.sourceEndpoint && bv.sourceEndpoint.connectorOverlays) {
                bv.overlays = bv.overlays || [];
                for (var bz = 0; bz < bv.sourceEndpoint.connectorOverlays.length; bz++) {
                    bv.overlays.push(bv.sourceEndpoint.connectorOverlays[bz])
                }
            }
            bv.tooltip = bB.tooltip;
            if (!bv.tooltip && bv.sourceEndpoint && bv.sourceEndpoint.connectorTooltip) {
                bv.tooltip = bv.sourceEndpoint.connectorTooltip
            }
            if (bv.target && !bv.target.endpoint && !bv.targetEndpoint && !bv.newConnection) {
                var bA = K(bv.target), bC = aZ[bA], bx = aH[bA];
                if (bC) {
                    if (!aj[bA]) {
                        return
                    }
                    var by = bx != null ? bx : bn.addEndpoint(bv.target, bC);
                    if (bh[bA]) {
                        aH[bA] = by
                    }
                    bv.targetEndpoint = by;
                    by._makeTargetCreator = true
                }
            }
            if (bv.source && !bv.source.endpoint && !bv.sourceEndpoint && !bv.newConnection) {
                var bA = K(bv.source), bC = az[bA], bx = a5[bA];
                if (bC) {
                    if (!ac[bA]) {
                        return
                    }
                    var by = bx != null ? bx : bn.addEndpoint(bv.source, bC);
                    if (a9[bA]) {
                        a5[bA] = by
                    }
                    bv.sourceEndpoint = by
                }
            }
            return bv
        }, ad = function (bz) {
            var by = bn.Defaults.ConnectionType || bn.getDefaultConnectionType(), bx = bn.Defaults.EndpointType || af, bw = p.CurrentLibrary.getParent;
            if (bz.container) {
                bz.parent = bz.container
            } else {
                if (bz.sourceEndpoint) {
                    bz.parent = bz.sourceEndpoint.parent
                } else {
                    if (bz.source.constructor == bx) {
                        bz.parent = bz.source.parent
                    } else {
                        bz.parent = bw(bz.source)
                    }
                }
            }
            bz._jsPlumb = bn;
            var bv = new by(bz);
            bv.id = "con_" + ak();
            bs("click", "click", bv);
            bs("dblclick", "dblclick", bv);
            bs("contextmenu", "contextmenu", bv);
            return bv
        }, bt = function (bw, bx, bv) {
            bx = bx || {};
            if (!bw.suspendedEndpoint) {
                V(aY, bw.scope, bw)
            }
            if (!bx.doNotFireConnectionEvent && bx.fireEvent !== false) {
                bn.fire("jsPlumbConnection", {connection: bw, source: bw.source, target: bw.target, sourceId: bw.sourceId, targetId: bw.targetId, sourceEndpoint: bw.endpoints[0], targetEndpoint: bw.endpoints[1]}, bv)
            }
            bn.anchorManager.newConnection(bw);
            ba(bw.source)
        }, bs = function (bv, bw, bx) {
            bx.bind(bv, function (bz, by) {
                bn.fire(bw, bx, by)
            })
        }, aw = function (bx) {
            if (bx.container) {
                return bx.container
            } else {
                var bv = p.CurrentLibrary.getTagName(bx.source), bw = p.CurrentLibrary.getParent(bx.source);
                if (bv && bv.toLowerCase() === "td") {
                    return p.CurrentLibrary.getParent(bw)
                } else {
                    return bw
                }
            }
        }, aF = function (bx) {
            var bw = bn.Defaults.EndpointType || af;
            bx.parent = aw(bx);
            bx._jsPlumb = bn;
            var bv = new bw(bx);
            bv.id = "ep_" + ak();
            bs("click", "endpointClick", bv);
            bs("dblclick", "endpointDblClick", bv);
            bs("contextmenu", "contextmenu", bv);
            return bv
        }, U = function (bx, bA, bz) {
            var bv = aT[bx];
            if (bv && bv.length) {
                for (var by = 0; by < bv.length; by++) {
                    for (var bw = 0; bw < bv[by].connections.length; bw++) {
                        var bB = bA(bv[by].connections[bw]);
                        if (bB) {
                            return
                        }
                    }
                    if (bz) {
                        bz(bv[by])
                    }
                }
            }
        }, Y = function (bw) {
            for (var bv in aT) {
                U(bv, bw)
            }
        }, au = function (bv, bw) {
            if (bv != null && bv.parentNode != null) {
                bv.parentNode.removeChild(bv)
            }
        }, aX = function (bx, bw) {
            for (var bv = 0; bv < bx.length; bv++) {
                au(bx[bv], bw)
            }
        }, bk = function (bw, bv) {
            return aG(bw, function (bx, by) {
                bm[by] = bv;
                if (p.CurrentLibrary.isDragSupported(bx)) {
                    p.CurrentLibrary.setDraggable(bx, bv)
                }
            })
        }, a3 = function (bx, by, bv) {
            by = by === "block";
            var bw = null;
            if (bv) {
                if (by) {
                    bw = function (bA) {
                        bA.setVisible(true, true, true)
                    }
                } else {
                    bw = function (bA) {
                        bA.setVisible(false, true, true)
                    }
                }
            }
            var bz = d(bx, "id");
            U(bz, function (bB) {
                if (by && bv) {
                    var bA = bB.sourceId === bz ? 1 : 0;
                    if (bB.endpoints[bA].isVisible()) {
                        bB.setVisible(true)
                    }
                } else {
                    bB.setVisible(by)
                }
            }, bw)
        }, bi = function (bv) {
            return aG(bv, function (bx, bw) {
                var by = bm[bw] == null ? false : bm[bw];
                by = !by;
                bm[bw] = by;
                p.CurrentLibrary.setDraggable(bx, by);
                return by
            })
        }, aQ = function (bv, bx) {
            var bw = null;
            if (bx) {
                bw = function (by) {
                    var bz = by.isVisible();
                    by.setVisible(!bz)
                }
            }
            U(bv, function (bz) {
                var by = bz.isVisible();
                bz.setVisible(!by)
            }, bw)
        }, W = function (bA) {
            var by = bA.timestamp, bv = bA.recalc, bz = bA.offset, bw = bA.elId;
            if (!bv) {
                if (by && by === br[bw]) {
                    return ah[bw]
                }
            }
            if (bv || !bz) {
                var bx = F(bw);
                if (bx != null) {
                    ae[bw] = a(bx);
                    ah[bw] = t(bx);
                    br[bw] = by
                }
            } else {
                ah[bw] = bz;
                if (ae[bw] == null) {
                    var bx = F(bw);
                    if (bx != null) {
                        ae[bw] = a(bx)
                    }
                }
            }
            if (ah[bw] && !ah[bw].right) {
                ah[bw].right = ah[bw].left + ae[bw][0];
                ah[bw].bottom = ah[bw].top + ae[bw][1];
                ah[bw].width = ae[bw][0];
                ah[bw].height = ae[bw][1];
                ah[bw].centerx = ah[bw].left + (ah[bw].width / 2);
                ah[bw].centery = ah[bw].top + (ah[bw].height / 2)
            }
            return ah[bw]
        }, aN = function (bv) {
            var bw = ah[bv];
            if (!bw) {
                bw = W({elId: bv})
            }
            return{o: bw, s: ae[bv]}
        }, K = function (bv, bw, by) {
            var bx = F(bv);
            var bz = d(bx, "id");
            if (!bz || bz == "undefined") {
                if (arguments.length == 2 && arguments[1] != undefined) {
                    bz = bw
                } else {
                    if (arguments.length == 1 || (arguments.length == 3 && !arguments[2])) {
                        bz = "jsPlumb_" + aL + "_" + ak()
                    }
                }
                f(bx, "id", bz)
            }
            return bz
        }, am = function (bx, bv, bw) {
            bx = bx || function () {
            };
            bv = bv || function () {
            };
            return function () {
                var by = null;
                try {
                    by = bv.apply(this, arguments)
                } catch (bz) {
                    q(bn, "jsPlumb function failed : " + bz)
                }
                if (bw == null || (by !== bw)) {
                    try {
                        bx.apply(this, arguments)
                    } catch (bz) {
                        q(bn, "wrapped function failed : " + bz)
                    }
                }
                return by
            }
        };
        this.connectorClass = "_jsPlumb_connector";
        this.endpointClass = "_jsPlumb_endpoint";
        this.overlayClass = "_jsPlumb_overlay";
        this.Anchors = {};
        this.Connectors = {canvas: {}, svg: {}, vml: {}};
        this.Endpoints = {canvas: {}, svg: {}, vml: {}};
        this.Overlays = {canvas: {}, svg: {}, vml: {}};
        this.addClass = function (bw, bv) {
            return p.CurrentLibrary.addClass(bw, bv)
        };
        this.removeClass = function (bw, bv) {
            return p.CurrentLibrary.removeClass(bw, bv)
        };
        this.hasClass = function (bw, bv) {
            return p.CurrentLibrary.hasClass(bw, bv)
        };
        this.addEndpoint = function (bx, by, bH) {
            bH = bH || {};
            var bw = p.extend({}, bH);
            p.extend(bw, by);
            bw.endpoint = bw.endpoint || bn.Defaults.Endpoint || p.Defaults.Endpoint;
            bw.paintStyle = bw.paintStyle || bn.Defaults.EndpointStyle || p.Defaults.EndpointStyle;
            bx = aI(bx);
            var bz = [], bC = bx.length && bx.constructor != String ? bx : [bx];
            for (var bA = 0; bA < bC.length; bA++) {
                var bF = F(bC[bA]), bv = K(bF);
                bw.source = bF;
                W({elId: bv});
                var bE = aF(bw);
                if (bw.parentAnchor) {
                    bE.parentAnchor = bw.parentAnchor
                }
                V(aT, bv, bE);
                var bD = ah[bv], bB = ae[bv];
                var bG = bE.anchor.compute({xy: [bD.left, bD.top], wh: bB, element: bE});
                bE.paint({anchorLoc: bG});
                bz.push(bE);
                bn.dragManager.endpointAdded(bF)
            }
            return bz.length == 1 ? bz[0] : bz
        };
        this.addEndpoints = function (bz, bw, bv) {
            var by = [];
            for (var bx = 0; bx < bw.length; bx++) {
                var bA = bn.addEndpoint(bz, bw[bx], bv);
                if (n(bA)) {
                    Array.prototype.push.apply(by, bA)
                } else {
                    by.push(bA)
                }
            }
            return by
        };
        this.animate = function (bx, bw, bv) {
            var by = F(bx), bB = d(bx, "id");
            bv = bv || {};
            var bA = p.CurrentLibrary.dragEvents.step;
            var bz = p.CurrentLibrary.dragEvents.complete;
            bv[bA] = am(bv[bA], function () {
                bn.repaint(bB)
            });
            bv[bz] = am(bv[bz], function () {
                bn.repaint(bB)
            });
            p.CurrentLibrary.animate(by, bw, bv)
        };
        this.checkCondition = function (bx, bz) {
            var bv = bn.getListener(bx);
            var by = true;
            if (bv && bv.length > 0) {
                try {
                    for (var bw = 0; bw < bv.length; bw++) {
                        by = by && bv[bw](bz)
                    }
                } catch (bA) {
                    q(bn, "cannot check condition [" + bx + "]" + bA)
                }
            }
            return by
        };
        this.connect = function (by, bw) {
            var bv = aA(by, bw);
            if (bv) {
                if (bv.deleteEndpointsOnDetach == null) {
                    bv.deleteEndpointsOnDetach = true
                }
                var bx = ad(bv);
                bt(bx, bv);
                return bx
            }
        };
        this.deleteEndpoint = function (bw) {
            var bB = (typeof bw == "string") ? aU[bw] : bw;
            if (bB) {
                var by = bB.getUuid();
                if (by) {
                    aU[by] = null
                }
                bB.detachAll();
                aX(bB.endpoint.getDisplayElements());
                bn.anchorManager.deleteEndpoint(bB);
                for (var bA in aT) {
                    var bv = aT[bA];
                    if (bv) {
                        var bz = [];
                        for (var bx = 0; bx < bv.length; bx++) {
                            if (bv[bx] != bB) {
                                bz.push(bv[bx])
                            }
                        }
                        aT[bA] = bz
                    }
                }
                bn.dragManager.endpointDeleted(bB)
            }
        };
        this.deleteEveryEndpoint = function () {
            for (var bx in aT) {
                var bv = aT[bx];
                if (bv && bv.length) {
                    for (var bw = 0; bw < bv.length; bw++) {
                        bn.deleteEndpoint(bv[bw])
                    }
                }
            }
            delete aT;
            aT = {};
            delete aU;
            aU = {}
        };
        var a7 = function (by, bA, bv) {
            var bx = bn.Defaults.ConnectionType || bn.getDefaultConnectionType(), bw = by.constructor == bx, bz = bw ? {connection: by, source: by.source, target: by.target, sourceId: by.sourceId, targetId: by.targetId, sourceEndpoint: by.endpoints[0], targetEndpoint: by.endpoints[1]} : by;
            if (bA) {
                bn.fire("jsPlumbConnectionDetached", bz, bv)
            }
            bn.anchorManager.connectionDetached(bz)
        }, a4 = function (bv) {
            bn.fire("connectionDrag", bv)
        }, aR = function (bv) {
            bn.fire("connectionDragStop", bv)
        };
        this.detach = function () {
            if (arguments.length == 0) {
                return
            }
            var bz = bn.Defaults.ConnectionType || bn.getDefaultConnectionType(), bA = arguments[0].constructor == bz, by = arguments.length == 2 ? bA ? (arguments[1] || {}) : arguments[0] : arguments[0], bD = (by.fireEvent !== false), bx = by.forceDetach, bw = bA ? arguments[0] : by.connection;
            if (bw) {
                if (bx || (bw.isDetachAllowed(bw) && bw.endpoints[0].isDetachAllowed(bw) && bw.endpoints[1].isDetachAllowed(bw))) {
                    if (bx || bn.checkCondition("beforeDetach", bw)) {
                        bw.endpoints[0].detach(bw, false, true, bD)
                    }
                }
            } else {
                var bv = p.extend({}, by);
                if (bv.uuids) {
                    av(bv.uuids[0]).detachFrom(av(bv.uuids[1]), bD)
                } else {
                    if (bv.sourceEndpoint && bv.targetEndpoint) {
                        bv.sourceEndpoint.detachFrom(bv.targetEndpoint)
                    } else {
                        var bC = K(bv.source), bB = K(bv.target);
                        U(bC, function (bE) {
                            if ((bE.sourceId == bC && bE.targetId == bB) || (bE.targetId == bC && bE.sourceId == bB)) {
                                if (bn.checkCondition("beforeDetach", bE)) {
                                    bE.endpoints[0].detach(bE, false, true, bD)
                                }
                            }
                        })
                    }
                }
            }
        };
        this.detachAllConnections = function (bx, by) {
            by = by || {};
            bx = F(bx);
            var bz = d(bx, "id"), bv = aT[bz];
            if (bv && bv.length) {
                for (var bw = 0; bw < bv.length; bw++) {
                    bv[bw].detachAll(by.fireEvent)
                }
            }
        };
        this.detachEveryConnection = function (bx) {
            bx = bx || {};
            for (var by in aT) {
                var bv = aT[by];
                if (bv && bv.length) {
                    for (var bw = 0; bw < bv.length; bw++) {
                        bv[bw].detachAll(bx.fireEvent)
                    }
                }
            }
            delete aY;
            aY = {}
        };
        this.draggable = function (bx, bv) {
            if (typeof bx == "object" && bx.length) {
                for (var bw = 0; bw < bx.length; bw++) {
                    var by = F(bx[bw]);
                    if (by) {
                        bb(by, true, bv)
                    }
                }
            } else {
                if (bx._nodes) {
                    for (var bw = 0; bw < bx._nodes.length; bw++) {
                        var by = F(bx._nodes[bw]);
                        if (by) {
                            bb(by, true, bv)
                        }
                    }
                } else {
                    var by = F(bx);
                    if (by) {
                        bb(by, true, bv)
                    }
                }
            }
        };
        this.extend = function (bw, bv) {
            return p.CurrentLibrary.extend(bw, bv)
        };
        this.getDefaultEndpointType = function () {
            return af
        };
        this.getDefaultConnectionType = function () {
            return ax
        };
        var bq = function (bz, by, bw, bv) {
            for (var bx = 0; bx < bz.length; bx++) {
                bz[bx][by].apply(bz[bx], bw)
            }
            return bv(bz)
        }, S = function (bz, by, bw) {
            var bv = [];
            for (var bx = 0; bx < bz.length; bx++) {
                bv.push([bz[bx][by].apply(bz[bx], bw), bz[bx]])
            }
            return bv
        }, an = function (bx, bw, bv) {
            return function () {
                return bq(bx, bw, arguments, bv)
            }
        }, ay = function (bw, bv) {
            return function () {
                return S(bw, bv, arguments)
            }
        };
        this.getConnections = function (bH, bw) {
            if (!bH) {
                bH = {}
            } else {
                if (bH.constructor == String) {
                    bH = {scope: bH}
                }
            }
            var bE = function (bI) {
                var bJ = [];
                if (bI) {
                    if (typeof bI == "string") {
                        if (bI === "*") {
                            return bI
                        }
                        bJ.push(bI)
                    } else {
                        bJ = bI
                    }
                }
                return bJ
            }, bF = bH.scope || bn.getDefaultScope(), bD = bE(bF), bv = bE(bH.source), bB = bE(bH.target), bx = function (bJ, bI) {
                if (bJ === "*") {
                    return true
                }
                return bJ.length > 0 ? J(bJ, bI) != -1 : true
            }, bA = (!bw && bD.length > 1) ? {} : [], bG = function (bJ, bK) {
                if (!bw && bD.length > 1) {
                    var bI = bA[bJ];
                    if (bI == null) {
                        bI = [];
                        bA[bJ] = bI
                    }
                    bI.push(bK)
                } else {
                    bA.push(bK)
                }
            };
            for (var bz in aY) {
                if (bx(bD, bz)) {
                    for (var by = 0; by < aY[bz].length; by++) {
                        var bC = aY[bz][by];
                        if (bx(bv, bC.sourceId) && bx(bB, bC.targetId)) {
                            bG(bz, bC)
                        }
                    }
                }
            }
            return bA
        };
        var aK = function (bv) {
            return{setHover: an(bv, "setHover", aK), removeAllOverlays: an(bv, "removeAllOverlays", aK), setLabel: an(bv, "setLabel", aK), addOverlay: an(bv, "addOverlay", aK), removeOverlay: an(bv, "removeOverlay", aK), removeOverlays: an(bv, "removeOverlays", aK), showOverlay: an(bv, "showOverlay", aK), hideOverlay: an(bv, "hideOverlay", aK), showOverlays: an(bv, "showOverlays", aK), hideOverlays: an(bv, "hideOverlays", aK), setPaintStyle: an(bv, "setPaintStyle", aK), setHoverPaintStyle: an(bv, "setHoverPaintStyle", aK), setDetachable: an(bv, "setDetachable", aK), setConnector: an(bv, "setConnector", aK), setParameter: an(bv, "setParameter", aK), setParameters: an(bv, "setParameters", aK), detach: function () {
                for (var bw = 0; bw < bv.length; bw++) {
                    bn.detach(bv[bw])
                }
            }, getLabel: ay(bv, "getLabel"), getOverlay: ay(bv, "getOverlay"), isHover: ay(bv, "isHover"), isDetachable: ay(bv, "isDetachable"), getParameter: ay(bv, "getParameter"), getParameters: ay(bv, "getParameters"), getPaintStyle: ay(bv, "getPaintStyle"), getHoverPaintStyle: ay(bv, "getHoverPaintStyle"), length: bv.length, each: function (bx) {
                for (var bw = 0; bw < bv.length; bw++) {
                    bx(bv[bw])
                }
                return aK(bv)
            }, get: function (bw) {
                return bv[bw]
            }}
        };
        this.select = function (bv) {
            bv = bv || {};
            bv.scope = bv.scope || "*";
            var bw = bn.getConnections(bv, true);
            return aK(bw)
        };
        this.getAllConnections = function () {
            return aY
        };
        this.getDefaultScope = function () {
            return Q
        };
        this.getEndpoint = av;
        this.getEndpoints = function (bv) {
            return aT[K(bv)]
        };
        this.getId = K;
        this.getOffset = function (bw) {
            var bv = ah[bw];
            return W({elId: bw})
        };
        this.getSelector = function (bv) {
            return p.CurrentLibrary.getSelector(bv)
        };
        this.getSize = function (bw) {
            var bv = ae[bw];
            if (!bv) {
                W({elId: bw})
            }
            return ae[bw]
        };
        this.appendElement = aW;
        var aS = false;
        this.isHoverSuspended = function () {
            return aS
        };
        this.setHoverSuspended = function (bv) {
            aS = bv
        };
        this.isCanvasAvailable = function () {
            return A
        };
        this.isSVGAvailable = function () {
            return e
        };
        this.isVMLAvailable = b;
        this.hide = function (bv, bw) {
            a3(bv, "none", bw)
        };
        this.idstamp = ak;
        this.init = function () {
            if (!M) {
                bn.setRenderMode(bn.Defaults.RenderMode);
                var bv = function (bw) {
                    p.CurrentLibrary.bind(document, bw, function (bC) {
                        if (!bn.currentlyDragging && X == p.CANVAS) {
                            for (var bB in aY) {
                                var bD = aY[bB];
                                for (var bz = 0; bz < bD.length; bz++) {
                                    var by = bD[bz].connector[bw](bC);
                                    if (by) {
                                        return
                                    }
                                }
                            }
                            for (var bA in aT) {
                                var bx = aT[bA];
                                for (var bz = 0; bz < bx.length; bz++) {
                                    if (bx[bz].endpoint[bw](bC)) {
                                        return
                                    }
                                }
                            }
                        }
                    })
                };
                bv("click");
                bv("dblclick");
                bv("mousemove");
                bv("mousedown");
                bv("mouseup");
                bv("contextmenu");
                M = true;
                bn.fire("ready")
            }
        };
        this.log = P;
        this.jsPlumbUIComponent = E;
        this.makeAnchor = function () {
            if (arguments.length == 0) {
                return null
            }
            var bA = arguments[0], bx = arguments[1], bw = arguments[2], by = null;
            if (bA.compute && bA.getOrientation) {
                return bA
            } else {
                if (typeof bA == "string") {
                    by = p.Anchors[arguments[0]]({elementId: bx, jsPlumbInstance: bn})
                } else {
                    if (n(bA)) {
                        if (n(bA[0]) || C(bA[0])) {
                            if (bA.length == 2 && C(bA[0]) && w(bA[1])) {
                                var bv = p.extend({elementId: bx, jsPlumbInstance: bn}, bA[1]);
                                by = p.Anchors[bA[0]](bv)
                            } else {
                                by = new aq(bA, null, bx)
                            }
                        } else {
                            var bz = {x: bA[0], y: bA[1], orientation: (bA.length >= 4) ? [bA[2], bA[3]] : [0, 0], offsets: (bA.length == 6) ? [bA[4], bA[5]] : [0, 0], elementId: bx};
                            by = new aa(bz);
                            by.clone = function () {
                                return new aa(bz)
                            }
                        }
                    }
                }
            }
            if (!by.id) {
                by.id = "anchor_" + ak()
            }
            return by
        };
        this.makeAnchors = function (by, bw, bv) {
            var bz = [];
            for (var bx = 0; bx < by.length; bx++) {
                if (typeof by[bx] == "string") {
                    bz.push(p.Anchors[by[bx]]({elementId: bw, jsPlumbInstance: bv}))
                } else {
                    if (n(by[bx])) {
                        bz.push(bn.makeAnchor(by[bx], bw, bv))
                    }
                }
            }
            return bz
        };
        this.makeDynamicAnchor = function (bv, bw) {
            return new aq(bv, bw)
        };
        var aZ = {}, aH = {}, bh = {}, ap = {}, ab = function (bv, bw) {
            bv.paintStyle = bv.paintStyle || bn.Defaults.EndpointStyles[bw] || bn.Defaults.EndpointStyle || p.Defaults.EndpointStyles[bw] || p.Defaults.EndpointStyle;
            bv.hoverPaintStyle = bv.hoverPaintStyle || bn.Defaults.EndpointHoverStyles[bw] || bn.Defaults.EndpointHoverStyle || p.Defaults.EndpointHoverStyles[bw] || p.Defaults.EndpointHoverStyle;
            bv.anchor = bv.anchor || bn.Defaults.Anchors[bw] || bn.Defaults.Anchor || p.Defaults.Anchors[bw] || p.Defaults.Anchor;
            bv.endpoint = bv.endpoint || bn.Defaults.Endpoints[bw] || bn.Defaults.Endpoint || p.Defaults.Endpoints[bw] || p.Defaults.Endpoint
        };
        this.makeTarget = function (by, bz, bF) {
            var bw = p.extend({_jsPlumb: bn}, bF);
            p.extend(bw, bz);
            ab(bw, 1);
            var bD = p.CurrentLibrary, bE = bw.scope || bn.Defaults.Scope, bA = !(bw.deleteEndpointsOnDetach === false), bx = bw.maxConnections || -1, bv = function (bK) {
                var bI = K(bK);
                aZ[bI] = bw;
                bh[bI] = bw.uniqueEndpoint, ap[bI] = bx, aj[bI] = true, proxyComponent = new E(bw);
                var bH = p.extend({}, bw.dropOptions || {}), bG = function () {
                    var bN = p.CurrentLibrary.getDropEvent(arguments), bP = bn.select({target: bI}).length;
                    if (!aj[bI] || ap[bI] > 0 && bP >= ap[bI]) {
                        console.log("target element " + bI + " is full.");
                        return false
                    }
                    bn.currentlyDragging = false;
                    var bZ = F(bD.getDragObject(arguments)), bO = d(bZ, "dragId"), bX = d(bZ, "originalScope"), bU = bf[bO], bM = bU.endpoints[0], bL = bw.endpoint ? p.extend({}, bw.endpoint) : {};
                    bM.anchor.locked = false;
                    if (bX) {
                        bD.setDragScope(bZ, bX)
                    }
                    var bS = proxyComponent.isDropAllowed(bU.sourceId, K(bK), bU.scope, bU, null);
                    if (bU.endpointsToDeleteOnDetach) {
                        if (bM === bU.endpointsToDeleteOnDetach[0]) {
                            bU.endpointsToDeleteOnDetach[0] = null
                        } else {
                            if (bM === bU.endpointsToDeleteOnDetach[1]) {
                                bU.endpointsToDeleteOnDetach[1] = null
                            }
                        }
                    }
                    if (bU.suspendedEndpoint) {
                        bU.targetId = bU.suspendedEndpoint.elementId;
                        bU.target = bD.getElementObject(bU.suspendedEndpoint.elementId);
                        bU.endpoints[1] = bU.suspendedEndpoint
                    }
                    if (bS) {
                        bM.detach(bU, false, true, false);
                        var bY = aH[bI] || bn.addEndpoint(bK, bw);
                        if (bw.uniqueEndpoint) {
                            aH[bI] = bY
                        }
                        bY._makeTargetCreator = true;
                        if (bY.anchor.positionFinder != null) {
                            var bV = bD.getUIPosition(arguments), bR = bD.getOffset(bK), bW = bD.getSize(bK), bQ = bY.anchor.positionFinder(bV, bR, bW, bY.anchor.constructorParams);
                            bY.anchor.x = bQ[0];
                            bY.anchor.y = bQ[1]
                        }
                        var bT = bn.connect({source: bM, target: bY, scope: bX, previousConnection: bU, container: bU.parent, deleteEndpointsOnDetach: bA, doNotFireConnectionEvent: bM.endpointWillMoveAfterConnection});
                        if (bU.endpoints[1]._makeTargetCreator && bU.endpoints[1].connections.length < 2) {
                            bn.deleteEndpoint(bU.endpoints[1])
                        }
                        if (bA) {
                            bT.endpointsToDeleteOnDetach = [bM, bY]
                        }
                        bT.repaint()
                    } else {
                        if (bU.suspendedEndpoint) {
                            if (bM.isReattach) {
                                bU.setHover(false);
                                bU.floatingAnchorIndex = null;
                                bU.suspendedEndpoint.addConnection(bU);
                                bn.repaint(bM.elementId)
                            } else {
                                bM.detach(bU, false, true, true, bN)
                            }
                        }
                    }
                };
                var bJ = bD.dragEvents.drop;
                bH.scope = bH.scope || bE;
                bH[bJ] = am(bH[bJ], bG);
                bD.initDroppable(bK, bH, true)
            };
            by = aI(by);
            var bC = by.length && by.constructor != String ? by : [by];
            for (var bB = 0; bB < bC.length; bB++) {
                bv(F(bC[bB]))
            }
            return bn
        };
        this.unmakeTarget = function (bw, bx) {
            bw = p.CurrentLibrary.getElementObject(bw);
            var bv = K(bw);
            if (!bx) {
                delete aZ[bv];
                delete bh[bv];
                delete ap[bv];
                delete aj[bv]
            }
            return bn
        };
        this.makeTargets = function (bx, by, bv) {
            for (var bw = 0; bw < bx.length; bw++) {
                bn.makeTarget(bx[bw], by, bv)
            }
        };
        var az = {}, a5 = {}, a9 = {}, ac = {}, N = {}, aj = {};
        this.makeSource = function (bz, bC, bv) {
            var bA = p.extend({}, bv);
            p.extend(bA, bC);
            ab(bA, 0);
            var by = p.CurrentLibrary, bB = function (bK) {
                var bE = K(bK), bL = bA.parent, bD = bL != null ? bn.getId(by.getElementObject(bL)) : bE;
                az[bD] = bA;
                a9[bD] = bA.uniqueEndpoint;
                ac[bD] = true;
                var bF = by.dragEvents.stop, bJ = by.dragEvents.drag, bM = p.extend({}, bA.dragOptions || {}), bH = bM.drag, bN = bM.stop, bO = null, bI = false;
                bM.scope = bM.scope || bA.scope;
                bM[bJ] = am(bM[bJ], function () {
                    if (bH) {
                        bH.apply(this, arguments)
                    }
                    bI = false
                });
                bM[bF] = am(bM[bF], function () {
                    if (bN) {
                        bN.apply(this, arguments)
                    }
                    bn.currentlyDragging = false;
                    if (bO.connections.length == 0) {
                        bn.deleteEndpoint(bO)
                    } else {
                        by.unbind(bO.canvas, "mousedown");
                        var bQ = bA.anchor || bn.Defaults.Anchor, bR = bO.anchor, bT = bO.connections[0];
                        bO.anchor = bn.makeAnchor(bQ, bE, bn);
                        if (bA.parent) {
                            var bS = by.getElementObject(bA.parent);
                            if (bS) {
                                var bP = bO.elementId;
                                bO.setElement(bS);
                                bO.endpointWillMoveAfterConnection = false;
                                bn.anchorManager.rehomeEndpoint(bP, bS);
                                bT.previousConnection = null;
                                D(aY[bT.scope], function (bU) {
                                    return bU.id === bT.id
                                });
                                bn.anchorManager.connectionDetached({sourceId: bT.sourceId, targetId: bT.targetId, connection: bT});
                                bt(bT)
                            }
                        }
                        bO.repaint();
                        bn.repaint(bO.elementId);
                        bn.repaint(bT.targetId)
                    }
                });
                var bG = function (bQ) {
                    if (!ac[bD]) {
                        return
                    }
                    var bV = W({elId: bE});
                    var bU = ((bQ.pageX || bQ.page.x) - bV.left) / bV.width, bT = ((bQ.pageY || bQ.page.y) - bV.top) / bV.height, bZ = bU, bY = bT;
                    if (bA.parent) {
                        var bS = p.CurrentLibrary.getElementObject(bA.parent), bR = K(bS);
                        bV = W({elId: bR});
                        bZ = ((bQ.pageX || bQ.page.x) - bV.left) / bV.width, bY = ((bQ.pageY || bQ.page.y) - bV.top) / bV.height
                    }
                    var bX = {};
                    p.extend(bX, bA);
                    bX.isSource = true;
                    bX.anchor = [bU, bT, 0, 0];
                    bX.parentAnchor = [bZ, bY, 0, 0];
                    bX.dragOptions = bM;
                    if (bA.parent) {
                        var bP = bX.container || bn.Defaults.Container;
                        if (bP) {
                            bX.container = bP
                        } else {
                            bX.container = p.CurrentLibrary.getParent(bA.parent)
                        }
                    }
                    bO = bn.addEndpoint(bE, bX);
                    bI = true;
                    bO.endpointWillMoveAfterConnection = bA.parent != null;
                    bO.endpointWillMoveTo = bA.parent ? by.getElementObject(bA.parent) : null;
                    var bW = function () {
                        if (bI) {
                            bn.deleteEndpoint(bO)
                        }
                    };
                    bn.registerListener(bO.canvas, "mouseup", bW);
                    bn.registerListener(bK, "mouseup", bW);
                    by.trigger(bO.canvas, "mousedown", bQ)
                };
                bn.registerListener(bK, "mousedown", bG);
                N[bE] = bG
            };
            bz = aI(bz);
            var bw = bz.length && bz.constructor != String ? bz : [bz];
            for (var bx = 0; bx < bw.length; bx++) {
                bB(F(bw[bx]))
            }
            return bn
        };
        this.unmakeSource = function (bw, bx) {
            bw = p.CurrentLibrary.getElementObject(bw);
            var by = K(bw), bv = N[by];
            if (bv) {
                bn.unregisterListener(_el, "mousedown", bv)
            }
            if (!bx) {
                delete az[by];
                delete a9[by];
                delete ac[by];
                delete N[by]
            }
            return bn
        };
        this.unmakeEverySource = function () {
            for (var bv in ac) {
                bn.unmakeSource(bv, true)
            }
            az = {};
            a9 = {};
            ac = {};
            N = {}
        };
        this.unmakeEveryTarget = function () {
            for (var bv in aj) {
                bn.unmakeTarget(bv, true)
            }
            aZ = {};
            bh = {};
            ap = {};
            aj = {};
            return bn
        };
        this.makeSources = function (bx, by, bv) {
            for (var bw = 0; bw < bx.length; bw++) {
                bn.makeSource(bx[bw], by, bv)
            }
            return bn
        };
        var aM = function (bz, by, bA, bv) {
            var bw = bz == "source" ? ac : aj;
            if (C(by)) {
                bw[by] = bv ? !bw[by] : bA
            } else {
                if (by.length) {
                    by = aI(by);
                    for (var bx = 0; bx < by.length; bx++) {
                        var bB = _el = p.CurrentLibrary.getElementObject(by[bx]), bB = K(_el);
                        bw[bB] = bv ? !bw[bB] : bA
                    }
                }
            }
            return bn
        };
        this.setSourceEnabled = function (bv, bw) {
            return aM("source", bv, bw)
        };
        this.toggleSourceEnabled = function (bv) {
            aM("source", bv, null, true);
            return bn.isSourceEnabled(bv)
        };
        this.isSource = function (bv) {
            bv = p.CurrentLibrary.getElementObject(bv);
            return ac[K(bv)] != null
        };
        this.isSourceEnabled = function (bv) {
            bv = p.CurrentLibrary.getElementObject(bv);
            return ac[K(bv)] === true
        };
        this.setTargetEnabled = function (bv, bw) {
            return aM("target", bv, bw)
        };
        this.toggleTargetEnabled = function (bv) {
            return aM("target", bv, null, true);
            return bn.isTargetEnabled(bv)
        };
        this.isTarget = function (bv) {
            bv = p.CurrentLibrary.getElementObject(bv);
            return aj[K(bv)] != null
        };
        this.isTargetEnabled = function (bv) {
            bv = p.CurrentLibrary.getElementObject(bv);
            return aj[K(bv)] === true
        };
        this.ready = function (bv) {
            bn.bind("ready", bv)
        }, this.repaint = function (bw) {
            var bx = function (by) {
                ba(F(by))
            };
            if (typeof bw == "object") {
                for (var bv = 0; bv < bw.length; bv++) {
                    bx(bw[bv])
                }
            } else {
                bx(bw)
            }
        };
        this.repaintEverything = function () {
            for (var bv in aT) {
                ba(F(bv), null, null)
            }
        };
        this.removeAllEndpoints = function (bx) {
            var bv = d(bx, "id"), by = aT[bv];
            if (by) {
                for (var bw = 0; bw < by.length; bw++) {
                    bn.deleteEndpoint(by[bw])
                }
            }
            aT[bv] = []
        };
        this.removeEveryEndpoint = this.deleteEveryEndpoint;
        this.removeEndpoint = function (bv, bw) {
            bn.deleteEndpoint(bw)
        };
        var ag = {}, bd = function () {
            for (var bw in ag) {
                for (var bv = 0; bv < ag[bw].length; bv++) {
                    var bx = ag[bw][bv];
                    p.CurrentLibrary.unbind(bx.el, bx.event, bx.listener)
                }
            }
            ag = {}
        };
        this.registerListener = function (bw, bv, bx) {
            p.CurrentLibrary.bind(bw, bv, bx);
            V(ag, bv, {el: bw, event: bv, listener: bx})
        };
        this.unregisterListener = function (bw, bv, bx) {
            p.CurrentLibrary.unbind(bw, bv, bx);
            D(ag, function (by) {
                return by.type == bv && by.listener == bx
            })
        };
        this.reset = function () {
            bn.deleteEveryEndpoint();
            bn.clearListeners();
            aZ = {};
            aH = {};
            bh = {};
            ap = {};
            az = {};
            a5 = {};
            a9 = {};
            bd();
            bn.anchorManager.reset();
            bn.dragManager.reset()
        };
        this.setDefaultScope = function (bv) {
            Q = bv
        };
        this.setDraggable = bk;
        this.setId = function (bz, bv, bB) {
            var bC = bz.constructor == String ? bz : bn.getId(bz), by = bn.getConnections({source: bC, scope: "*"}, true), bx = bn.getConnections({target: bC, scope: "*"}, true);
            bv = "" + bv;
            if (!bB) {
                bz = p.CurrentLibrary.getElementObject(bC);
                p.CurrentLibrary.setAttribute(bz, "id", bv)
            }
            bz = p.CurrentLibrary.getElementObject(bv);
            aT[bv] = aT[bC] || [];
            for (var bw = 0; bw < aT[bv].length; bw++) {
                aT[bv][bw].elementId = bv;
                aT[bv][bw].element = bz;
                aT[bv][bw].anchor.elementId = bv
            }
            delete aT[bC];
            bn.anchorManager.changeId(bC, bv);
            var bA = function (bG, bD, bF) {
                for (var bE = 0; bE < bG.length; bE++) {
                    bG[bE].endpoints[bD].elementId = bv;
                    bG[bE].endpoints[bD].element = bz;
                    bG[bE][bF + "Id"] = bv;
                    bG[bE][bF] = bz
                }
            };
            bA(by, 0, "source");
            bA(bx, 1, "target")
        };
        this.setIdChanged = function (bw, bv) {
            bn.setId(bw, bv, true)
        };
        this.setDebugLog = function (bv) {
            P = bv
        };
        this.setRepaintFunction = function (bv) {
            ar = bv
        };
        this.setSuspendDrawing = bg;
        this.CANVAS = "canvas";
        this.SVG = "svg";
        this.VML = "vml";
        this.setRenderMode = function (bv) {
            if (bv) {
                bv = bv.toLowerCase()
            } else {
                return
            }
            if (bv !== p.CANVAS && bv !== p.SVG && bv !== p.VML) {
                throw new Error("render mode must be one of jsPlumb.CANVAS, jsPlumb.SVG or jsPlumb.VML")
            }
            if (bv === p.CANVAS && A) {
                X = p.CANVAS
            } else {
                if (bv === p.SVG && e) {
                    X = p.SVG
                } else {
                    if (b()) {
                        X = p.VML
                    }
                }
            }
            return X
        };
        this.getRenderMode = function () {
            return X
        };
        this.show = function (bv, bw) {
            a3(bv, "block", bw)
        };
        this.sizeCanvas = function (bx, bv, bz, bw, by) {
            if (bx) {
                bx.style.height = by + "px";
                bx.height = by;
                bx.style.width = bw + "px";
                bx.width = bw;
                bx.style.left = bv + "px";
                bx.style.top = bz + "px"
            }
        };
        this.getTestHarness = function () {
            return{endpointsByElement: aT, endpointCount: function (bv) {
                var bw = aT[bv];
                return bw ? bw.length : 0
            }, connectionCount: function (bv) {
                bv = bv || Q;
                var bw = aY[bv];
                return bw ? bw.length : 0
            }, getId: K, makeAnchor: self.makeAnchor, makeDynamicAnchor: self.makeDynamicAnchor}
        };
        this.toggle = aQ;
        this.toggleVisible = aQ;
        this.toggleDraggable = bi;
        this.unload = function () {
        };
        this.wrap = am;
        this.addListener = this.bind;
        var bo = function (bA, bx) {
            var by = null, bv = bA;
            if (bx.tagName.toLowerCase() === "svg" && bx.parentNode) {
                by = bx.parentNode
            } else {
                if (bx.offsetParent) {
                    by = bx.offsetParent
                }
            }
            if (by != null) {
                var bw = by.tagName.toLowerCase() === "body" ? {left: 0, top: 0} : t(by), bz = by.tagName.toLowerCase() === "body" ? {left: 0, top: 0} : {left: by.scrollLeft, top: by.scrollTop};
                bv[0] = bA[0] - bw.left + bz.left;
                bv[1] = bA[1] - bw.top + bz.top
            }
            return bv
        };
        var aa = function (bz) {
            var bx = this;
            this.x = bz.x || 0;
            this.y = bz.y || 0;
            this.elementId = bz.elementId;
            var bw = bz.orientation || [0, 0];
            var by = null, bv = null;
            this.offsets = bz.offsets || [0, 0];
            bx.timestamp = null;
            this.compute = function (bE) {
                var bD = bE.xy, bA = bE.wh, bB = bE.element, bC = bE.timestamp;
                if (bC && bC === bx.timestamp) {
                    return bv
                }
                bv = [bD[0] + (bx.x * bA[0]) + bx.offsets[0], bD[1] + (bx.y * bA[1]) + bx.offsets[1]];
                bv = bo(bv, bB.canvas);
                bx.timestamp = bC;
                return bv
            };
            this.getOrientation = function (bA) {
                return bw
            };
            this.equals = function (bA) {
                if (!bA) {
                    return false
                }
                var bB = bA.getOrientation();
                var bC = this.getOrientation();
                return this.x == bA.x && this.y == bA.y && this.offsets[0] == bA.offsets[0] && this.offsets[1] == bA.offsets[1] && bC[0] == bB[0] && bC[1] == bB[1]
            };
            this.getCurrentLocation = function () {
                return bv
            }
        };
        var a1 = function (bB) {
            var bz = bB.reference, bA = bB.referenceCanvas, bx = a(F(bA)), bw = 0, bC = 0, bv = null, by = null;
            this.x = 0;
            this.y = 0;
            this.isFloating = true;
            this.compute = function (bG) {
                var bF = bG.xy, bE = bG.element, bD = [bF[0] + (bx[0] / 2), bF[1] + (bx[1] / 2)];
                bD = bo(bD, bE.canvas);
                by = bD;
                return bD
            };
            this.getOrientation = function (bE) {
                if (bv) {
                    return bv
                } else {
                    var bD = bz.getOrientation(bE);
                    return[Math.abs(bD[0]) * bw * -1, Math.abs(bD[1]) * bC * -1]
                }
            };
            this.over = function (bD) {
                bv = bD.getOrientation()
            };
            this.out = function () {
                bv = null
            };
            this.getCurrentLocation = function () {
                return by
            }
        };
        var aq = function (bx, bw, bC) {
            this.isSelective = true;
            this.isDynamic = true;
            var bF = [], bE = this, bD = function (bG) {
                return bG.constructor == aa ? bG : bn.makeAnchor(bG, bC, bn)
            };
            for (var bB = 0; bB < bx.length; bB++) {
                bF[bB] = bD(bx[bB])
            }
            this.addAnchor = function (bG) {
                bF.push(bD(bG))
            };
            this.getAnchors = function () {
                return bF
            };
            this.locked = false;
            var by = bF.length > 0 ? bF[0] : null, bA = bF.length > 0 ? 0 : -1, bE = this, bz = function (bI, bG, bM, bL, bH) {
                var bK = bL[0] + (bI.x * bH[0]), bJ = bL[1] + (bI.y * bH[1]);
                return Math.sqrt(Math.pow(bG - bK, 2) + Math.pow(bM - bJ, 2))
            }, bv = bw || function (bQ, bH, bI, bJ, bG) {
                var bL = bI[0] + (bJ[0] / 2), bK = bI[1] + (bJ[1] / 2);
                var bN = -1, bP = Infinity;
                for (var bM = 0; bM < bG.length; bM++) {
                    var bO = bz(bG[bM], bL, bK, bQ, bH);
                    if (bO < bP) {
                        bN = bM + 0;
                        bP = bO
                    }
                }
                return bG[bN]
            };
            this.compute = function (bK) {
                var bJ = bK.xy, bG = bK.wh, bI = bK.timestamp, bH = bK.txy, bL = bK.twh;
                if (bE.locked || bH == null || bL == null) {
                    return by.compute(bK)
                } else {
                    bK.timestamp = null
                }
                by = bv(bJ, bG, bH, bL, bF);
                bE.x = by.x;
                bE.y = by.y;
                return by.compute(bK)
            };
            this.getCurrentLocation = function () {
                return by != null ? by.getCurrentLocation() : null
            };
            this.getOrientation = function (bG) {
                return by != null ? by.getOrientation(bG) : [0, 0]
            };
            this.over = function (bG) {
                if (by != null) {
                    by.over(bG)
                }
            };
            this.out = function () {
                if (by != null) {
                    by.out()
                }
            }
        };
        var bj = {}, ai = {}, aJ = {}, T = {HORIZONTAL: "horizontal", VERTICAL: "vertical", DIAGONAL: "diagonal", IDENTITY: "identity"}, bl = function (bE, bF, bB, by) {
            if (bE === bF) {
                return{orientation: T.IDENTITY, a: ["top", "top"]}
            }
            var bw = Math.atan2((by.centery - bB.centery), (by.centerx - bB.centerx)), bz = Math.atan2((bB.centery - by.centery), (bB.centerx - by.centerx)), bA = ((bB.left <= by.left && bB.right >= by.left) || (bB.left <= by.right && bB.right >= by.right) || (bB.left <= by.left && bB.right >= by.right) || (by.left <= bB.left && by.right >= bB.right)), bG = ((bB.top <= by.top && bB.bottom >= by.top) || (bB.top <= by.bottom && bB.bottom >= by.bottom) || (bB.top <= by.top && bB.bottom >= by.bottom) || (by.top <= bB.top && by.bottom >= bB.bottom));
            if (!(bA || bG)) {
                var bD = null, bx = false, bv = false, bC = null;
                if (by.left > bB.left && by.top > bB.top) {
                    bD = ["right", "top"]
                } else {
                    if (by.left > bB.left && bB.top > by.top) {
                        bD = ["top", "left"]
                    } else {
                        if (by.left < bB.left && by.top < bB.top) {
                            bD = ["top", "right"]
                        } else {
                            if (by.left < bB.left && by.top > bB.top) {
                                bD = ["left", "top"]
                            }
                        }
                    }
                }
                return{orientation: T.DIAGONAL, a: bD, theta: bw, theta2: bz}
            } else {
                if (bA) {
                    return{orientation: T.HORIZONTAL, a: bB.top < by.top ? ["bottom", "top"] : ["top", "bottom"], theta: bw, theta2: bz}
                } else {
                    return{orientation: T.VERTICAL, a: bB.left < by.left ? ["right", "left"] : ["left", "right"], theta: bw, theta2: bz}
                }
            }
        }, a2 = function (bJ, bF, bD, bE, bK, bG, bx) {
            var bL = [], bw = bF[bK ? 0 : 1] / (bE.length + 1);
            for (var bH = 0; bH < bE.length; bH++) {
                var bM = (bH + 1) * bw, bv = bG * bF[bK ? 1 : 0];
                if (bx) {
                    bM = bF[bK ? 0 : 1] - bM
                }
                var bC = (bK ? bM : bv), bz = bD[0] + bC, bB = bC / bF[0], bA = (bK ? bv : bM), by = bD[1] + bA, bI = bA / bF[1];
                bL.push([bz, by, bB, bI, bE[bH][1], bE[bH][2]])
            }
            return bL
        }, a8 = function (bw, bv) {
            return bw[0] > bv[0] ? 1 : -1
        }, Z = function (bv) {
            return function (bx, bw) {
                var by = true;
                if (bv) {
                    if (bx[0][0] < bw[0][0]) {
                        by = true
                    } else {
                        by = bx[0][1] > bw[0][1]
                    }
                } else {
                    if (bx[0][0] > bw[0][0]) {
                        by = true
                    } else {
                        by = bx[0][1] > bw[0][1]
                    }
                }
                return by === false ? -1 : 1
            }
        }, O = function (bw, bv) {
            var by = bw[0][0] < 0 ? -Math.PI - bw[0][0] : Math.PI - bw[0][0], bx = bv[0][0] < 0 ? -Math.PI - bv[0][0] : Math.PI - bv[0][0];
            if (by > bx) {
                return 1
            } else {
                return bw[0][1] > bv[0][1] ? 1 : -1
            }
        }, a0 = {top: a8, right: Z(true), bottom: Z(true), left: O}, ao = function (bv, bw) {
            return bv.sort(bw)
        }, al = function (bw, bv) {
            var by = ae[bw], bz = ah[bw], bx = function (bG, bN, bC, bF, bL, bK, bB) {
                if (bF.length > 0) {
                    var bJ = ao(bF, a0[bG]), bH = bG === "right" || bG === "top", bA = a2(bG, bN, bC, bJ, bL, bK, bH);
                    var bO = function (bR, bQ) {
                        var bP = bo([bQ[0], bQ[1]], bR.canvas);
                        ai[bR.id] = [bP[0], bP[1], bQ[2], bQ[3]];
                        aJ[bR.id] = bB
                    };
                    for (var bD = 0; bD < bA.length; bD++) {
                        var bI = bA[bD][4], bM = bI.endpoints[0].elementId === bw, bE = bI.endpoints[1].elementId === bw;
                        if (bM) {
                            bO(bI.endpoints[0], bA[bD])
                        } else {
                            if (bE) {
                                bO(bI.endpoints[1], bA[bD])
                            }
                        }
                    }
                }
            };
            bx("bottom", by, [bz.left, bz.top], bv.bottom, true, 1, [0, 1]);
            bx("top", by, [bz.left, bz.top], bv.top, true, 0, [0, -1]);
            bx("left", by, [bz.left, bz.top], bv.left, false, 0, [-1, 0]);
            bx("right", by, [bz.left, bz.top], bv.right, false, 1, [1, 0])
        }, aE = function () {
            var bv = {}, bz = {}, bw = this, by = {};
            this.reset = function () {
                bv = {};
                bz = {};
                by = {}
            };
            this.newConnection = function (bD) {
                var bF = bD.sourceId, bC = bD.targetId, bA = bD.endpoints, bE = true, bB = function (bG, bH, bJ, bI, bK) {
                    if ((bF == bC) && bJ.isContinuous) {
                        p.CurrentLibrary.removeElement(bA[1].canvas);
                        bE = false
                    }
                    V(bz, bI, [bK, bH, bJ.constructor == aq])
                };
                bB(0, bA[0], bA[0].anchor, bC, bD);
                if (bE) {
                    bB(1, bA[1], bA[1].anchor, bF, bD)
                }
            };
            this.connectionDetached = function (bA) {
                var bB = bA.connection || bA;
                var bG = bB.sourceId, bH = bB.targetId, bK = bB.endpoints, bF = function (bL, bM, bO, bN, bP) {
                    if (bO.constructor == a1) {
                    } else {
                        D(bz[bN], function (bQ) {
                            return bQ[0].id == bP.id
                        })
                    }
                };
                bF(1, bK[1], bK[1].anchor, bG, bB);
                bF(0, bK[0], bK[0].anchor, bH, bB);
                var bC = bB.sourceId, bD = bB.targetId, bJ = bB.endpoints[0].id, bE = bB.endpoints[1].id, bI = function (bN, bL) {
                    if (bN) {
                        var bM = function (bO) {
                            return bO[4] == bL
                        };
                        D(bN.top, bM);
                        D(bN.left, bM);
                        D(bN.bottom, bM);
                        D(bN.right, bM)
                    }
                };
                bI(by[bC], bJ);
                bI(by[bD], bE);
                bw.redraw(bC);
                bw.redraw(bD)
            };
            this.add = function (bB, bA) {
                V(bv, bA, bB)
            };
            this.changeId = function (bB, bA) {
                bz[bA] = bz[bB];
                bv[bA] = bv[bB];
                delete bz[bB];
                delete bv[bB]
            };
            this.getConnectionsFor = function (bA) {
                return bz[bA] || []
            };
            this.getEndpointsFor = function (bA) {
                return bv[bA] || []
            };
            this.deleteEndpoint = function (bA) {
                D(bv[bA.elementId], function (bB) {
                    return bB.id == bA.id
                })
            };
            this.clearFor = function (bA) {
                delete bv[bA];
                bv[bA] = []
            };
            var bx = function (bU, bH, bP, bE, bK, bL, bN, bJ, bW, bM, bD, bT) {
                var bR = -1, bC = -1, bF = bE.endpoints[bN], bO = bF.id, bI = [1, 0][bN], bA = [
                    [bH, bP],
                    bE,
                    bK,
                    bL,
                    bO
                ], bB = bU[bW], bV = bF._continuousAnchorEdge ? bU[bF._continuousAnchorEdge] : null;
                if (bV) {
                    var bS = i(bV, function (bX) {
                        return bX[4] == bO
                    });
                    if (bS != -1) {
                        bV.splice(bS, 1);
                        for (var bQ = 0; bQ < bV.length; bQ++) {
                            u(bD, bV[bQ][1], function (bX) {
                                return bX.id == bV[bQ][1].id
                            });
                            u(bT, bV[bQ][1].endpoints[bN], function (bX) {
                                return bX.id == bV[bQ][1].endpoints[bN].id
                            })
                        }
                    }
                }
                for (var bQ = 0; bQ < bB.length; bQ++) {
                    if (bN == 1 && bB[bQ][3] === bL && bC == -1) {
                        bC = bQ
                    }
                    u(bD, bB[bQ][1], function (bX) {
                        return bX.id == bB[bQ][1].id
                    });
                    u(bT, bB[bQ][1].endpoints[bN], function (bX) {
                        return bX.id == bB[bQ][1].endpoints[bN].id
                    })
                }
                if (bR != -1) {
                    bB[bR] = bA
                } else {
                    var bG = bJ ? bC != -1 ? bC : 0 : bB.length;
                    bB.splice(bG, 0, bA)
                }
                bF._continuousAnchorEdge = bW
            };
            this.redraw = function (bP, bR, bC, bF) {
                var b0 = bv[bP] || [], bZ = bz[bP] || [], bB = [], bY = [], bD = [];
                bC = bC || r();
                bF = bF || {left: 0, top: 0};
                if (bR) {
                    bR = {left: bR.left + bF.left, top: bR.top + bF.top}
                }
                W({elId: bP, offset: bR, recalc: false, timestamp: bC});
                var bK = ah[bP], bG = ae[bP], bM = {};
                for (var bW = 0; bW < bZ.length; bW++) {
                    var bH = bZ[bW][0], bJ = bH.sourceId, bE = bH.targetId, bI = bH.endpoints[0].anchor.isContinuous, bO = bH.endpoints[1].anchor.isContinuous;
                    if (bI || bO) {
                        var bX = bJ + "_" + bE, bU = bE + "_" + bJ, bT = bM[bX], bN = bH.sourceId == bP ? 1 : 0;
                        if (bI && !by[bJ]) {
                            by[bJ] = {top: [], right: [], bottom: [], left: []}
                        }
                        if (bO && !by[bE]) {
                            by[bE] = {top: [], right: [], bottom: [], left: []}
                        }
                        if (bP != bE) {
                            W({elId: bE, timestamp: bC})
                        }
                        if (bP != bJ) {
                            W({elId: bJ, timestamp: bC})
                        }
                        var bL = aN(bE), bA = aN(bJ);
                        if (bE == bJ && (bI || bO)) {
                            bx(by[bJ], -Math.PI / 2, 0, bH, false, bE, 0, false, "top", bJ, bB, bY)
                        } else {
                            if (!bT) {
                                bT = bl(bJ, bE, bA.o, bL.o);
                                bM[bX] = bT
                            }
                            if (bI) {
                                bx(by[bJ], bT.theta, 0, bH, false, bE, 0, false, bT.a[0], bJ, bB, bY)
                            }
                            if (bO) {
                                bx(by[bE], bT.theta2, -1, bH, true, bJ, 1, true, bT.a[1], bE, bB, bY)
                            }
                        }
                        if (bI) {
                            u(bD, bJ, function (b1) {
                                return b1 === bJ
                            })
                        }
                        if (bO) {
                            u(bD, bE, function (b1) {
                                return b1 === bE
                            })
                        }
                        u(bB, bH, function (b1) {
                            return b1.id == bH.id
                        });
                        if ((bI && bN == 0) || (bO && bN == 1)) {
                            u(bY, bH.endpoints[bN], function (b1) {
                                return b1.id == bH.endpoints[bN].id
                            })
                        }
                    }
                }
                for (var bW = 0; bW < bD.length; bW++) {
                    al(bD[bW], by[bD[bW]])
                }
                for (var bW = 0; bW < b0.length; bW++) {
                    b0[bW].paint({timestamp: bC, offset: bK, dimensions: bG})
                }
                for (var bW = 0; bW < bY.length; bW++) {
                    bY[bW].paint({timestamp: bC, offset: bK, dimensions: bG})
                }
                for (var bW = 0; bW < bZ.length; bW++) {
                    var bQ = bZ[bW][1];
                    if (bQ.anchor.constructor == aq) {
                        bQ.paint({elementWithPrecedence: bP});
                        u(bB, bZ[bW][0], function (b1) {
                            return b1.id == bZ[bW][0].id
                        });
                        for (var bV = 0; bV < bQ.connections.length; bV++) {
                            if (bQ.connections[bV] !== bZ[bW][0]) {
                                u(bB, bQ.connections[bV], function (b1) {
                                    return b1.id == bQ.connections[bV].id
                                })
                            }
                        }
                    } else {
                        if (bQ.anchor.constructor == aa) {
                            u(bB, bZ[bW][0], function (b1) {
                                return b1.id == bZ[bW][0].id
                            })
                        }
                    }
                }
                var bS = bf[bP];
                if (bS) {
                    bS.paint({timestamp: bC, recalc: false, elId: bP})
                }
                for (var bW = 0; bW < bB.length; bW++) {
                    bB[bW].paint({elId: bP, timestamp: bC, recalc: false})
                }
            };
            this.rehomeEndpoint = function (bA, bE) {
                var bB = bv[bA] || [], bC = bn.getId(bE);
                for (var bD = 0; bD < bB.length; bD++) {
                    bw.add(bB[bD], bC)
                }
                bB.splice(0, bB.length)
            }
        };
        bn.anchorManager = new aE();
        bn.continuousAnchorFactory = {get: function (bw) {
            var bv = bj[bw.elementId];
            if (!bv) {
                bv = {type: "Continuous", compute: function (bx) {
                    return ai[bx.element.id] || [0, 0]
                }, getCurrentLocation: function (bx) {
                    return ai[bx.id] || [0, 0]
                }, getOrientation: function (bx) {
                    return aJ[bx.id] || [0, 0]
                }, isDynamic: true, isContinuous: true};
                bj[bw.elementId] = bv
            }
            return bv
        }};
        var aV = function () {
            var by = {}, bx = [], bw = {}, bv = {};
            this.register = function (bB) {
                var bA = p.CurrentLibrary;
                bB = bA.getElementObject(bB);
                var bD = bn.getId(bB), bz = bA.getDOMElement(bB);
                if (!by[bD]) {
                    by[bD] = bB;
                    bx.push(bB);
                    bw[bD] = {}
                }
                var bC = function (bH) {
                    var bK = bA.getElementObject(bH), bJ = bA.getOffset(bK);
                    for (var bE = 0; bE < bH.childNodes.length; bE++) {
                        if (bH.childNodes[bE].nodeType != 3) {
                            var bG = bA.getElementObject(bH.childNodes[bE]), bI = bn.getId(bG, null, true);
                            if (bI && bv[bI] && bv[bI] > 0) {
                                var bF = bA.getOffset(bG);
                                bw[bD][bI] = {id: bI, offset: {left: bF.left - bJ.left, top: bF.top - bJ.top}}
                            }
                        }
                    }
                };
                bC(bz)
            };
            this.endpointAdded = function (bB) {
                var bF = p.CurrentLibrary, bI = document.body, bz = bn.getId(bB), bH = bF.getDOMElement(bB), bA = bH.parentNode, bD = bA == bI;
                bv[bz] = bv[bz] ? bv[bz] + 1 : 1;
                while (bA != bI) {
                    var bE = bn.getId(bA);
                    if (by[bE]) {
                        var bK = -1, bG = bF.getElementObject(bA), bC = bF.getOffset(bG);
                        if (bw[bE][bz] == null) {
                            var bJ = p.CurrentLibrary.getOffset(bB);
                            bw[bE][bz] = {id: bz, offset: {left: bJ.left - bC.left, top: bJ.top - bC.top}}
                        }
                        break
                    }
                    bA = bA.parentNode
                }
            };
            this.endpointDeleted = function (bA) {
                if (bv[bA.elementId]) {
                    bv[bA.elementId]--;
                    if (bv[bA.elementId] <= 0) {
                        for (var bz in bw) {
                            delete bw[bz][bA.elementId]
                        }
                    }
                }
            };
            this.getElementsForDraggable = function (bz) {
                return bw[bz]
            };
            this.reset = function () {
                by = {};
                bx = [];
                bw = {};
                bv = {}
            }
        };
        bn.dragManager = new aV();
        var ax = function (bN) {
            var bG = this, bx = true;
            bG.idPrefix = "_jsplumb_c_";
            bG.defaultLabelLocation = 0.5;
            bG.defaultOverlayKeys = ["Overlays", "ConnectionOverlays"];
            this.parent = bN.parent;
            z.apply(this, arguments);
            this.isVisible = function () {
                return bx
            };
            this.setVisible = function (bP) {
                bx = bP;
                bG[bP ? "showOverlays" : "hideOverlays"]();
                if (bG.connector && bG.connector.canvas) {
                    bG.connector.canvas.style.display = bP ? "block" : "none"
                }
            };
            this.source = F(bN.source);
            this.target = F(bN.target);
            if (bN.sourceEndpoint) {
                this.source = bN.sourceEndpoint.endpointWillMoveTo || bN.sourceEndpoint.getElement()
            }
            if (bN.targetEndpoint) {
                this.target = bN.targetEndpoint.getElement()
            }
            bG.previousConnection = bN.previousConnection;
            var bD = bN.cost;
            bG.getCost = function () {
                return bD
            };
            bG.setCost = function (bP) {
                bD = bP
            };
            var bB = bN.bidirectional === false ? false : true;
            bG.isBidirectional = function () {
                return bB
            };
            this.sourceId = d(this.source, "id");
            this.targetId = d(this.target, "id");
            this.getAttachedElements = function () {
                return bG.endpoints
            };
            this.scope = bN.scope;
            this.endpoints = [];
            this.endpointStyles = [];
            var bM = function (bQ, bP) {
                if (bQ) {
                    return bn.makeAnchor(bQ, bP, bn)
                }
            }, bK = function (bP, bV, bQ, bS, bT, bR, bU) {
                if (bP) {
                    bG.endpoints[bV] = bP;
                    bP.addConnection(bG)
                } else {
                    if (!bQ.endpoints) {
                        bQ.endpoints = [null, null]
                    }
                    var b1 = bQ.endpoints[bV] || bQ.endpoint || bn.Defaults.Endpoints[bV] || p.Defaults.Endpoints[bV] || bn.Defaults.Endpoint || p.Defaults.Endpoint;
                    if (!bQ.endpointStyles) {
                        bQ.endpointStyles = [null, null]
                    }
                    if (!bQ.endpointHoverStyles) {
                        bQ.endpointHoverStyles = [null, null]
                    }
                    var bZ = bQ.endpointStyles[bV] || bQ.endpointStyle || bn.Defaults.EndpointStyles[bV] || p.Defaults.EndpointStyles[bV] || bn.Defaults.EndpointStyle || p.Defaults.EndpointStyle;
                    if (bZ.fillStyle == null && bR != null) {
                        bZ.fillStyle = bR.strokeStyle
                    }
                    if (bZ.outlineColor == null && bR != null) {
                        bZ.outlineColor = bR.outlineColor
                    }
                    if (bZ.outlineWidth == null && bR != null) {
                        bZ.outlineWidth = bR.outlineWidth
                    }
                    var bY = bQ.endpointHoverStyles[bV] || bQ.endpointHoverStyle || bn.Defaults.EndpointHoverStyles[bV] || p.Defaults.EndpointHoverStyles[bV] || bn.Defaults.EndpointHoverStyle || p.Defaults.EndpointHoverStyle;
                    if (bU != null) {
                        if (bY == null) {
                            bY = {}
                        }
                        if (bY.fillStyle == null) {
                            bY.fillStyle = bU.strokeStyle
                        }
                    }
                    var bX = bQ.anchors ? bQ.anchors[bV] : bQ.anchor ? bQ.anchor : bM(bn.Defaults.Anchors[bV], bT) || bM(p.Defaults.Anchors[bV], bT) || bM(bn.Defaults.Anchor, bT) || bM(p.Defaults.Anchor, bT), b0 = bQ.uuids ? bQ.uuids[bV] : null, bW = aF({paintStyle: bZ, hoverPaintStyle: bY, endpoint: b1, connections: [bG], uuid: b0, anchor: bX, source: bS, scope: bQ.scope, container: bQ.container, reattach: bQ.reattach, detachable: bQ.detachable});
                    bG.endpoints[bV] = bW;
                    if (bQ.drawEndpoints === false) {
                        bW.setVisible(false, true, true)
                    }
                    return bW
                }
            };
            var bI = bK(bN.sourceEndpoint, 0, bN, bG.source, bG.sourceId, bN.paintStyle, bN.hoverPaintStyle);
            if (bI) {
                V(aT, this.sourceId, bI)
            }
            var by = ((bG.sourceId == bG.targetId) && bN.targetEndpoint == null) ? bI : bN.targetEndpoint, bH = bK(by, 1, bN, bG.target, bG.targetId, bN.paintStyle, bN.hoverPaintStyle);
            if (bH) {
                V(aT, this.targetId, bH)
            }
            if (!this.scope) {
                this.scope = this.endpoints[0].scope
            }
            if (bN.deleteEndpointsOnDetach) {
                bG.endpointsToDeleteOnDetach = [bI, bH]
            }
            var bw = bn.Defaults.ConnectionsDetachable;
            if (bN.detachable === false) {
                bw = false
            }
            if (bG.endpoints[0].connectionsDetachable === false) {
                bw = false
            }
            if (bG.endpoints[1].connectionsDetachable === false) {
                bw = false
            }
            if (bD == null) {
                bD = bG.endpoints[0].getConnectionCost()
            }
            if (bN.bidirectional == null) {
                bB = bG.endpoints[0].areConnectionsBidirectional()
            }
            this.isDetachable = function () {
                return bw === true
            };
            this.setDetachable = function (bP) {
                bw = bP === true
            };
            var bO = p.extend({}, this.endpoints[0].getParameters());
            p.extend(bO, this.endpoints[1].getParameters());
            p.extend(bO, bG.getParameters());
            bG.setParameters(bO);
            var bE = bG.setHover;
            bG.setHover = function (bP) {
                bG.connector.setHover.apply(bG.connector, arguments);
                bE.apply(bG, arguments)
            };
            var bL = function (bP) {
                if (x == null) {
                    bG.setHover(bP, false)
                }
            };
            this.setConnector = function (bP, bQ) {
                if (bG.connector != null) {
                    aX(bG.connector.getDisplayElements(), bG.parent)
                }
                var bR = {_jsPlumb: bG._jsPlumb, parent: bN.parent, cssClass: bN.cssClass, container: bN.container, tooltip: bG.tooltip};
                if (C(bP)) {
                    this.connector = new p.Connectors[X][bP](bR)
                } else {
                    if (n(bP)) {
                        this.connector = new p.Connectors[X][bP[0]](p.extend(bP[1], bR))
                    }
                }
                bG.canvas = bG.connector.canvas;
                G(bG.connector, bG, bL);
                if (!bQ) {
                    bG.repaint()
                }
            };
            bG.setConnector(this.endpoints[0].connector || this.endpoints[1].connector || bN.connector || bn.Defaults.Connector || p.Defaults.Connector, true);
            this.setPaintStyle(this.endpoints[0].connectorStyle || this.endpoints[1].connectorStyle || bN.paintStyle || bn.Defaults.PaintStyle || p.Defaults.PaintStyle, true);
            this.setHoverPaintStyle(this.endpoints[0].connectorHoverStyle || this.endpoints[1].connectorHoverStyle || bN.hoverPaintStyle || bn.Defaults.HoverPaintStyle || p.Defaults.HoverPaintStyle, true);
            this.paintStyleInUse = this.getPaintStyle();
            this.moveParent = function (bS) {
                var bR = p.CurrentLibrary, bQ = bR.getParent(bG.connector.canvas);
                if (bG.connector.bgCanvas) {
                    bR.removeElement(bG.connector.bgCanvas, bQ);
                    bR.appendElement(bG.connector.bgCanvas, bS)
                }
                bR.removeElement(bG.connector.canvas, bQ);
                bR.appendElement(bG.connector.canvas, bS);
                for (var bP = 0; bP < bG.overlays.length; bP++) {
                    if (bG.overlays[bP].isAppendedAtTopLevel) {
                        bR.removeElement(bG.overlays[bP].canvas, bQ);
                        bR.appendElement(bG.overlays[bP].canvas, bS);
                        if (bG.overlays[bP].reattachListeners) {
                            bG.overlays[bP].reattachListeners(bG.connector)
                        }
                    }
                }
                if (bG.connector.reattachListeners) {
                    bG.connector.reattachListeners()
                }
            };
            W({elId: this.sourceId});
            W({elId: this.targetId});
            var bA = ah[this.sourceId], bz = ae[this.sourceId], bv = ah[this.targetId], bC = ae[this.targetId], bF = r(), bJ = this.endpoints[0].anchor.compute({xy: [bA.left, bA.top], wh: bz, element: this.endpoints[0], elementId: this.endpoints[0].elementId, txy: [bv.left, bv.top], twh: bC, tElement: this.endpoints[1], timestamp: bF});
            this.endpoints[0].paint({anchorLoc: bJ, timestamp: bF});
            bJ = this.endpoints[1].anchor.compute({xy: [bv.left, bv.top], wh: bC, element: this.endpoints[1], elementId: this.endpoints[1].elementId, txy: [bA.left, bA.top], twh: bz, tElement: this.endpoints[0], timestamp: bF});
            this.endpoints[1].paint({anchorLoc: bJ, timestamp: bF});
            this.paint = function (b6) {
                b6 = b6 || {};
                var bX = b6.elId, bY = b6.ui, bV = b6.recalc, bQ = b6.timestamp, bZ = false, b5 = bZ ? this.sourceId : this.targetId, bU = bZ ? this.targetId : this.sourceId, bR = bZ ? 0 : 1, b7 = bZ ? 1 : 0;
                var b8 = W({elId: bX, offset: bY, recalc: bV, timestamp: bQ}), bW = W({elId: b5, timestamp: bQ});
                var b1 = this.endpoints[b7], bP = this.endpoints[bR], bT = b1.anchor.getCurrentLocation(b1), b4 = bP.anchor.getCurrentLocation(bP);
                var bS = 0;
                for (var b3 = 0; b3 < bG.overlays.length; b3++) {
                    var b0 = bG.overlays[b3];
                    if (b0.isVisible()) {
                        bS = Math.max(bS, b0.computeMaxSize(bG.connector))
                    }
                }
                var b2 = this.connector.compute(bT, b4, this.endpoints[b7], this.endpoints[bR], this.endpoints[b7].anchor, this.endpoints[bR].anchor, bG.paintStyleInUse.lineWidth, bS, b8, bW);
                bG.connector.paint(b2, bG.paintStyleInUse);
                for (var b3 = 0; b3 < bG.overlays.length; b3++) {
                    var b0 = bG.overlays[b3];
                    if (b0.isVisible) {
                        bG.overlayPlacements[b3] = b0.draw(bG.connector, bG.paintStyleInUse, b2)
                    }
                }
            };
            this.repaint = function (bQ) {
                bQ = bQ || {};
                var bP = !(bQ.recalc === false);
                this.paint({elId: this.sourceId, recalc: bP, timestamp: bQ.timestamp})
            }
        };
        var bc = function (bw) {
            var bv = false;
            return{drag: function () {
                if (bv) {
                    bv = false;
                    return true
                }
                var bx = p.CurrentLibrary.getUIPosition(arguments), by = bw.element;
                if (by) {
                    p.CurrentLibrary.setOffset(by, bx);
                    ba(F(by), bx)
                }
            }, stopDrag: function () {
                bv = true
            }}
        };
        var at = function (bz, by, bA, bx, bv) {
            var bw = new a1({reference: by, referenceCanvas: bx});
            return aF({paintStyle: bz, endpoint: bA, anchor: bw, source: bv, scope: "__floating"})
        };
        var R = function (bx, bv) {
            var bz = document.createElement("div");
            bz.style.position = "absolute";
            var bw = F(bz);
            aW(bz, bv);
            var by = K(bw);
            W({elId: by});
            bx.id = by;
            bx.element = bw
        };
        var af = function (b0) {
            var bO = this;
            bO.idPrefix = "_jsplumb_e_";
            bO.defaultLabelLocation = [0.5, 0.5];
            bO.defaultOverlayKeys = ["Overlays", "EndpointOverlays"];
            this.parent = b0.parent;
            z.apply(this, arguments);
            b0 = b0 || {};
            var bA = true, by = !(b0.enabled === false);
            this.isVisible = function () {
                return bA
            };
            this.setVisible = function (b3, b6, b2) {
                bA = b3;
                if (bO.canvas) {
                    bO.canvas.style.display = b3 ? "block" : "none"
                }
                bO[b3 ? "showOverlays" : "hideOverlays"]();
                if (!b6) {
                    for (var b5 = 0; b5 < bO.connections.length; b5++) {
                        bO.connections[b5].setVisible(b3);
                        if (!b2) {
                            var b4 = bO === bO.connections[b5].endpoints[0] ? 1 : 0;
                            if (bO.connections[b5].endpoints[b4].connections.length == 1) {
                                bO.connections[b5].endpoints[b4].setVisible(b3, true, true)
                            }
                        }
                    }
                }
            };
            this.isEnabled = function () {
                return by
            };
            this.setEnabled = function (b2) {
                by = b2
            };
            var bN = b0.source, bH = b0.uuid, bY = null, bC = null;
            if (bH) {
                aU[bH] = bO
            }
            var bF = d(bN, "id");
            this.elementId = bF;
            this.element = bN;
            var bx = b0.connectionCost;
            this.getConnectionCost = function () {
                return bx
            };
            this.setConnectionCost = function (b2) {
                bx = b2
            };
            var bX = b0.connectionsBidirectional === false ? false : true;
            this.areConnectionsBidirectional = function () {
                return bX
            };
            this.setConnectionsBidirectional = function (b2) {
                bX = b2
            };
            bO.anchor = b0.anchor ? bn.makeAnchor(b0.anchor, bF, bn) : b0.anchors ? bn.makeAnchor(b0.anchors, bF, bn) : bn.makeAnchor("TopCenter", bF, bn);
            if (!b0._transient) {
                bn.anchorManager.add(bO, bF)
            }
            var bL = null, bQ = null;
            this.setEndpoint = function (b2) {
                var b3 = {_jsPlumb: bO._jsPlumb, parent: b0.parent, container: b0.container, tooltip: b0.tooltip, connectorTooltip: b0.connectorTooltip, endpoint: bO};
                if (C(b2)) {
                    bL = new p.Endpoints[X][b2](b3)
                } else {
                    if (n(b2)) {
                        b3 = p.extend(b2[1], b3);
                        bL = new p.Endpoints[X][b2[0]](b3)
                    } else {
                        bL = b2.clone()
                    }
                }
                var b4 = p.extend({}, b3);
                bL.clone = function () {
                    var b5 = new Object();
                    bL.constructor.apply(b5, [b4]);
                    return b5
                };
                bO.endpoint = bL;
                bO.type = bO.endpoint.type
            };
            this.setEndpoint(b0.endpoint || bn.Defaults.Endpoint || p.Defaults.Endpoint || "Dot");
            bQ = bL;
            var bM = bO.setHover;
            bO.setHover = function () {
                bO.endpoint.setHover.apply(bO.endpoint, arguments);
                bM.apply(bO, arguments)
            };
            var b1 = function (b2) {
                if (bO.connections.length > 0) {
                    bO.connections[0].setHover(b2, false)
                } else {
                    bO.setHover(b2)
                }
            };
            G(bO.endpoint, bO, b1);
            this.setPaintStyle(b0.paintStyle || b0.style || bn.Defaults.EndpointStyle || p.Defaults.EndpointStyle, true);
            this.setHoverPaintStyle(b0.hoverPaintStyle || bn.Defaults.EndpointHoverStyle || p.Defaults.EndpointHoverStyle, true);
            this.paintStyleInUse = this.getPaintStyle();
            var bJ = this.getPaintStyle();
            this.connectorStyle = b0.connectorStyle;
            this.connectorHoverStyle = b0.connectorHoverStyle;
            this.connectorOverlays = b0.connectorOverlays;
            this.connector = b0.connector;
            this.connectorTooltip = b0.connectorTooltip;
            this.isSource = b0.isSource || false;
            this.isTarget = b0.isTarget || false;
            var bU = b0.maxConnections || bn.Defaults.MaxConnections;
            this.getAttachedElements = function () {
                return bO.connections
            };
            this.canvas = this.endpoint.canvas;
            this.connections = b0.connections || [];
            this.scope = b0.scope || Q;
            this.timestamp = null;
            bO.isReattach = b0.reattach || false;
            bO.connectionsDetachable = bn.Defaults.ConnectionsDetachable;
            if (b0.connectionsDetachable === false || b0.detachable === false) {
                bO.connectionsDetachable = false
            }
            var bI = b0.dragAllowedWhenFull || true;
            this.computeAnchor = function (b2) {
                return bO.anchor.compute(b2)
            };
            this.addConnection = function (b2) {
                bO.connections.push(b2)
            };
            this.detach = function (b3, b8, b4, cb, b2) {
                var ca = i(bO.connections, function (cd) {
                    return cd.id == b3.id
                }), b9 = false;
                cb = (cb !== false);
                if (ca >= 0) {
                    if (b4 || b3._forceDetach || b3.isDetachable() || b3.isDetachAllowed(b3)) {
                        var cc = b3.endpoints[0] == bO ? b3.endpoints[1] : b3.endpoints[0];
                        if (b4 || b3._forceDetach || (bO.isDetachAllowed(b3))) {
                            bO.connections.splice(ca, 1);
                            if (!b8) {
                                cc.detach(b3, true, b4);
                                if (b3.endpointsToDeleteOnDetach) {
                                    for (var b7 = 0; b7 < b3.endpointsToDeleteOnDetach.length; b7++) {
                                        var b5 = b3.endpointsToDeleteOnDetach[b7];
                                        if (b5 && b5.connections.length == 0) {
                                            bn.deleteEndpoint(b5)
                                        }
                                    }
                                }
                            }
                            aX(b3.connector.getDisplayElements(), b3.parent);
                            D(aY[b3.scope], function (cd) {
                                return cd.id == b3.id
                            });
                            b9 = true;
                            var b6 = (!b8 && cb);
                            a7(b3, b6, b2)
                        }
                    }
                }
                return b9
            };
            this.detachAll = function (b3, b2) {
                while (bO.connections.length > 0) {
                    bO.detach(bO.connections[0], false, true, b3, b2)
                }
            };
            this.detachFrom = function (b5, b4, b2) {
                var b6 = [];
                for (var b3 = 0; b3 < bO.connections.length; b3++) {
                    if (bO.connections[b3].endpoints[1] == b5 || bO.connections[b3].endpoints[0] == b5) {
                        b6.push(bO.connections[b3])
                    }
                }
                for (var b3 = 0; b3 < b6.length; b3++) {
                    if (bO.detach(b6[b3], false, true, b4, b2)) {
                        b6[b3].setHover(false, false)
                    }
                }
            };
            this.detachFromConnection = function (b3) {
                var b2 = i(bO.connections, function (b4) {
                    return b4.id == b3.id
                });
                if (b2 >= 0) {
                    bO.connections.splice(b2, 1)
                }
            };
            this.getElement = function () {
                return bN
            };
            this.setElement = function (b4) {
                var b6 = K(b4);
                D(aT[bO.elementId], function (b7) {
                    return b7.id == bO.id
                });
                bN = F(b4);
                bF = K(bN);
                bO.elementId = bF;
                var b5 = aw({source: b6}), b3 = bz.getParent(bO.canvas);
                bz.removeElement(bO.canvas, b3);
                bz.appendElement(bO.canvas, b5);
                for (var b2 = 0; b2 < bO.connections.length; b2++) {
                    bO.connections[b2].moveParent(b5);
                    bO.connections[b2].sourceId = bF;
                    bO.connections[b2].source = bN
                }
                V(aT, b6, bO)
            };
            this.getUuid = function () {
                return bH
            };
            this.makeInPlaceCopy = function () {
                var b4 = bO.anchor.getCurrentLocation(bO), b3 = bO.anchor.getOrientation(bO), b2 = {compute: function () {
                    return[b4[0], b4[1]]
                }, getCurrentLocation: function () {
                    return[b4[0], b4[1]]
                }, getOrientation: function () {
                    return b3
                }};
                return aF({anchor: b2, source: bN, paintStyle: this.getPaintStyle(), endpoint: bL, _transient: true, scope: bO.scope})
            };
            this.isConnectedTo = function (b4) {
                var b3 = false;
                if (b4) {
                    for (var b2 = 0; b2 < bO.connections.length; b2++) {
                        if (bO.connections[b2].endpoints[1] == b4) {
                            b3 = true;
                            break
                        }
                    }
                }
                return b3
            };
            this.isFloating = function () {
                return bY != null
            };
            this.connectorSelector = function () {
                var b2 = bO.connections[0];
                if (bO.isTarget && b2) {
                    return b2
                } else {
                    return(bO.connections.length < bU) || bU == -1 ? null : b2
                }
            };
            this.isFull = function () {
                return!(bO.isFloating() || bU < 1 || bO.connections.length < bU)
            };
            this.setDragAllowedWhenFull = function (b2) {
                bI = b2
            };
            this.setStyle = bO.setPaintStyle;
            this.equals = function (b2) {
                return this.anchor.equals(b2.anchor)
            };
            var bK = function (b3) {
                var b2 = 0;
                if (b3 != null) {
                    for (var b4 = 0; b4 < bO.connections.length; b4++) {
                        if (bO.connections[b4].sourceId == b3 || bO.connections[b4].targetId == b3) {
                            b2 = b4;
                            break
                        }
                    }
                }
                return bO.connections[b2]
            };
            this.paint = function (b5) {
                b5 = b5 || {};
                var cb = b5.timestamp, ca = !(b5.recalc === false);
                if (!cb || bO.timestamp !== cb) {
                    W({elId: bF, timestamp: cb, recalc: ca});
                    var ch = b5.offset || ah[bF];
                    if (ch) {
                        var b8 = b5.anchorPoint, b6 = b5.connectorPaintStyle;
                        if (b8 == null) {
                            var b2 = b5.dimensions || ae[bF];
                            if (ch == null || b2 == null) {
                                W({elId: bF, timestamp: cb});
                                ch = ah[bF];
                                b2 = ae[bF]
                            }
                            var b4 = {xy: [ch.left, ch.top], wh: b2, element: bO, timestamp: cb};
                            if (ca && bO.anchor.isDynamic && bO.connections.length > 0) {
                                var ce = bK(b5.elementWithPrecedence), cg = ce.endpoints[0] == bO ? 1 : 0, b7 = cg == 0 ? ce.sourceId : ce.targetId, cd = ah[b7], cf = ae[b7];
                                b4.txy = [cd.left, cd.top];
                                b4.twh = cf;
                                b4.tElement = ce.endpoints[cg]
                            }
                            b8 = bO.anchor.compute(b4)
                        }
                        var cc = bL.compute(b8, bO.anchor.getOrientation(bO), bO.paintStyleInUse, b6 || bO.paintStyleInUse);
                        bL.paint(cc, bO.paintStyleInUse, bO.anchor);
                        bO.timestamp = cb;
                        for (var b9 = 0; b9 < bO.overlays.length; b9++) {
                            var b3 = bO.overlays[b9];
                            if (b3.isVisible) {
                                bO.overlayPlacements[b9] = b3.draw(bO.endpoint, bO.paintStyleInUse, cc)
                            }
                        }
                    }
                }
            };
            this.repaint = this.paint;
            this.removeConnection = this.detach;
            if (p.CurrentLibrary.isDragSupported(bN)) {
                var bT = {id: null, element: null}, bS = null, bw = false, bB = null, bv = bc(bT);
                var bD = function () {
                    bS = bO.connectorSelector();
                    var b2 = true;
                    if (!bO.isEnabled()) {
                        b2 = false
                    }
                    if (bS == null && !b0.isSource) {
                        b2 = false
                    }
                    if (b0.isSource && bO.isFull() && !bI) {
                        b2 = false
                    }
                    if (bS != null && !bS.isDetachable()) {
                        b2 = false
                    }
                    if (b2 === false) {
                        if (p.CurrentLibrary.stopDrag) {
                            p.CurrentLibrary.stopDrag()
                        }
                        bv.stopDrag();
                        return false
                    }
                    if (bS && !bO.isFull() && b0.isSource) {
                        bS = null
                    }
                    W({elId: bF});
                    bC = bO.makeInPlaceCopy();
                    bC.paint();
                    R(bT, bO.parent);
                    var b8 = F(bC.canvas), b6 = p.CurrentLibrary.getOffset(b8), b3 = bo([b6.left, b6.top], bC.canvas);
                    p.CurrentLibrary.setOffset(bT.element, {left: b3[0], top: b3[1]});
                    if (bO.parentAnchor) {
                        bO.anchor = bn.makeAnchor(bO.parentAnchor, bO.elementId, bn)
                    }
                    f(F(bO.canvas), "dragId", bT.id);
                    f(F(bO.canvas), "elId", bF);
                    if (b0.proxy) {
                        bO.setPaintStyle(b0.proxy.paintStyle)
                    }
                    bY = at(bO.getPaintStyle(), bO.anchor, bL, bO.canvas, bT.element);
                    if (bS == null) {
                        bO.anchor.locked = true;
                        bO.setHover(false, false);
                        bS = ad({sourceEndpoint: bO, targetEndpoint: bY, source: bO.endpointWillMoveTo || F(bN), target: bT.element, anchors: [bO.anchor, bY.anchor], paintStyle: b0.connectorStyle, hoverPaintStyle: b0.connectorHoverStyle, connector: b0.connector, overlays: b0.connectorOverlays})
                    } else {
                        bw = true;
                        bS.connector.setHover(false, false);
                        bE(F(bC.canvas), false, true);
                        var b5 = bS.endpoints[0].id == bO.id ? 0 : 1;
                        bS.floatingAnchorIndex = b5;
                        bO.detachFromConnection(bS);
                        var b9 = F(bO.canvas), b7 = p.CurrentLibrary.getDragScope(b9);
                        f(b9, "originalScope", b7);
                        var b4 = p.CurrentLibrary.getDropScope(b9);
                        p.CurrentLibrary.setDragScope(b9, b4);
                        if (b5 == 0) {
                            bB = [bS.source, bS.sourceId, bW, b7];
                            bS.source = bT.element;
                            bS.sourceId = bT.id
                        } else {
                            bB = [bS.target, bS.targetId, bW, b7];
                            bS.target = bT.element;
                            bS.targetId = bT.id
                        }
                        bS.endpoints[b5 == 0 ? 1 : 0].anchor.locked = true;
                        bS.suspendedEndpoint = bS.endpoints[b5];
                        bS.suspendedEndpoint.setHover(false);
                        bS.endpoints[b5] = bY;
                        a4(bS)
                    }
                    bf[bT.id] = bS;
                    bY.addConnection(bS);
                    V(aT, bT.id, bY);
                    bn.currentlyDragging = true
                };
                var bz = p.CurrentLibrary, bV = b0.dragOptions || {}, bP = p.extend({}, bz.defaultDragOptions), bR = bz.dragEvents.start, bZ = bz.dragEvents.stop, bG = bz.dragEvents.drag;
                bV = p.extend(bP, bV);
                bV.scope = bV.scope || bO.scope;
                bV[bR] = am(bV[bR], bD);
                bV[bG] = am(bV[bG], bv.drag);
                bV[bZ] = am(bV[bZ], function () {
                    var b3 = bz.getDropEvent(arguments);
                    bn.currentlyDragging = false;
                    D(aT[bT.id], function (b4) {
                        return b4.id == bY.id
                    });
                    aX([bT.element[0], bY.canvas], bN);
                    au(bC.canvas, bN);
                    bn.anchorManager.clearFor(bT.id);
                    var b2 = bS.floatingAnchorIndex == null ? 1 : bS.floatingAnchorIndex;
                    bS.endpoints[b2 == 0 ? 1 : 0].anchor.locked = false;
                    bO.setPaintStyle(bJ);
                    if (bS.endpoints[b2] == bY) {
                        if (bw && bS.suspendedEndpoint) {
                            if (b2 == 0) {
                                bS.source = bB[0];
                                bS.sourceId = bB[1]
                            } else {
                                bS.target = bB[0];
                                bS.targetId = bB[1]
                            }
                            p.CurrentLibrary.setDragScope(bB[2], bB[3]);
                            bS.endpoints[b2] = bS.suspendedEndpoint;
                            if (bO.isReattach || bS._forceDetach || !bS.endpoints[b2 == 0 ? 1 : 0].detach(bS, false, false, true, b3)) {
                                bS.setHover(false);
                                bS.floatingAnchorIndex = null;
                                bS.suspendedEndpoint.addConnection(bS);
                                bn.repaint(bB[1])
                            }
                            bS._forceDetach = null
                        } else {
                            aX(bS.connector.getDisplayElements(), bO.parent);
                            bO.detachFromConnection(bS)
                        }
                    }
                    bO.anchor.locked = false;
                    bO.paint({recalc: false});
                    bS.setHover(false, false);
                    aR(bS);
                    bS = null;
                    bC = null;
                    delete aT[bY.elementId];
                    bY.anchor = null;
                    bY = null;
                    bn.currentlyDragging = false
                });
                var bW = F(bO.canvas);
                p.CurrentLibrary.initDraggable(bW, bV, true)
            }
            var bE = function (b4, b9, b7, ca) {
                if ((b0.isTarget || b9) && p.CurrentLibrary.isDropSupported(bN)) {
                    var b5 = b0.dropOptions || bn.Defaults.DropOptions || p.Defaults.DropOptions;
                    b5 = p.extend({}, b5);
                    b5.scope = b5.scope || bO.scope;
                    var b3 = p.CurrentLibrary.dragEvents.drop, b8 = p.CurrentLibrary.dragEvents.over, b2 = p.CurrentLibrary.dragEvents.out, b6 = function () {
                        var cb = p.CurrentLibrary.getDropEvent(arguments), co = F(p.CurrentLibrary.getDragObject(arguments)), cc = d(co, "dragId"), cf = d(co, "elId"), cn = d(co, "originalScope"), ci = bf[cc];
                        if (ci != null) {
                            var ck = ci.floatingAnchorIndex == null ? 1 : ci.floatingAnchorIndex, cl = ck == 0 ? 1 : 0;
                            if (cn) {
                                p.CurrentLibrary.setDragScope(co, cn)
                            }
                            var cm = ca != null ? ca.isEnabled() : true;
                            if (!bO.isFull() && !(ck == 0 && !bO.isSource) && !(ck == 1 && !bO.isTarget) && cm) {
                                var cg = true;
                                if (ci.suspendedEndpoint && ci.suspendedEndpoint.id != bO.id) {
                                    if (ck == 0) {
                                        ci.source = ci.suspendedEndpoint.element;
                                        ci.sourceId = ci.suspendedEndpoint.elementId
                                    } else {
                                        ci.target = ci.suspendedEndpoint.element;
                                        ci.targetId = ci.suspendedEndpoint.elementId
                                    }
                                    if (!ci.isDetachAllowed(ci) || !ci.endpoints[ck].isDetachAllowed(ci) || !ci.suspendedEndpoint.isDetachAllowed(ci) || !bn.checkCondition("beforeDetach", ci)) {
                                        cg = false
                                    }
                                }
                                if (ck == 0) {
                                    ci.source = bO.element;
                                    ci.sourceId = bO.elementId
                                } else {
                                    ci.target = bO.element;
                                    ci.targetId = bO.elementId
                                }
                                cg = cg && bO.isDropAllowed(ci.sourceId, ci.targetId, ci.scope, ci, bO);
                                if (cg) {
                                    ci.endpoints[ck].detachFromConnection(ci);
                                    if (ci.suspendedEndpoint) {
                                        ci.suspendedEndpoint.detachFromConnection(ci)
                                    }
                                    ci.endpoints[ck] = bO;
                                    bO.addConnection(ci);
                                    var ce = bO.getParameters();
                                    for (var cj in ce) {
                                        ci.setParameter(cj, ce[cj])
                                    }
                                    if (!ci.suspendedEndpoint) {
                                        if (ce.draggable) {
                                            p.CurrentLibrary.initDraggable(bO.element, bV, true)
                                        }
                                    } else {
                                        var ch = ci.suspendedEndpoint.getElement(), cd = ci.suspendedEndpoint.elementId;
                                        a7({source: ck == 0 ? ch : ci.source, target: ck == 1 ? ch : ci.target, sourceId: ck == 0 ? cd : ci.sourceId, targetId: ck == 1 ? cd : ci.targetId, sourceEndpoint: ck == 0 ? ci.suspendedEndpoint : ci.endpoints[0], targetEndpoint: ck == 1 ? ci.suspendedEndpoint : ci.endpoints[1], connection: ci}, true, cb)
                                    }
                                    bt(ci, null, cb)
                                } else {
                                    if (ci.suspendedEndpoint) {
                                        ci.endpoints[ck] = ci.suspendedEndpoint;
                                        ci.setHover(false);
                                        ci._forceDetach = true;
                                        if (ck == 0) {
                                            ci.source = ci.suspendedEndpoint.element;
                                            ci.sourceId = ci.suspendedEndpoint.elementId
                                        } else {
                                            ci.target = ci.suspendedEndpoint.element;
                                            ci.targetId = ci.suspendedEndpoint.elementId
                                        }
                                        ci.suspendedEndpoint.addConnection(ci);
                                        ci.endpoints[0].repaint();
                                        ci.repaint();
                                        bn.repaint(ci.source.elementId);
                                        ci._forceDetach = false
                                    }
                                }
                                ci.floatingAnchorIndex = null
                            }
                            bn.currentlyDragging = false;
                            delete bf[cc]
                        }
                    };
                    b5[b3] = am(b5[b3], b6);
                    b5[b8] = am(b5[b8], function () {
                        if (bO.isTarget) {
                            var cc = p.CurrentLibrary.getDragObject(arguments), ce = d(F(cc), "dragId"), cd = bf[ce];
                            if (cd != null) {
                                var cb = cd.floatingAnchorIndex == null ? 1 : cd.floatingAnchorIndex;
                                cd.endpoints[cb].anchor.over(bO.anchor)
                            }
                        }
                    });
                    b5[b2] = am(b5[b2], function () {
                        if (bO.isTarget) {
                            var cc = p.CurrentLibrary.getDragObject(arguments), ce = d(F(cc), "dragId"), cd = bf[ce];
                            if (cd != null) {
                                var cb = cd.floatingAnchorIndex == null ? 1 : cd.floatingAnchorIndex;
                                cd.endpoints[cb].anchor.out()
                            }
                        }
                    });
                    p.CurrentLibrary.initDroppable(b4, b5, true, b7)
                }
            };
            bE(F(bO.canvas), true, !(b0._transient || bO.anchor.isFloating), bO);
            return bO
        }
    };
    var p = window.jsPlumb = new y();
    p.getInstance = function (L) {
        var K = new y(L);
        K.init();
        return K
    };
    var s = function (K, P, M, L, O, N) {
        return function (R) {
            R = R || {};
            var Q = R.jsPlumbInstance.makeAnchor([K, P, M, L, 0, 0], R.elementId, R.jsPlumbInstance);
            Q.type = O;
            if (N) {
                N(Q, R)
            }
            return Q
        }
    };
    p.Anchors.TopCenter = s(0.5, 0, 0, -1, "TopCenter");
    p.Anchors.BottomCenter = s(0.5, 1, 0, 1, "BottomCenter");
    p.Anchors.LeftMiddle = s(0, 0.5, -1, 0, "LeftMiddle");
    p.Anchors.RightMiddle = s(1, 0.5, 1, 0, "RightMiddle");
    p.Anchors.Center = s(0.5, 0.5, 0, 0, "Center");
    p.Anchors.TopRight = s(1, 0, 0, -1, "TopRight");
    p.Anchors.BottomRight = s(1, 1, 0, 1, "BottomRight");
    p.Anchors.TopLeft = s(0, 0, 0, -1, "TopLeft");
    p.Anchors.BottomLeft = s(0, 1, 0, 1, "BottomLeft");
    p.Defaults.DynamicAnchors = function (K) {
        return K.jsPlumbInstance.makeAnchors(["TopCenter", "RightMiddle", "BottomCenter", "LeftMiddle"], K.elementId, K.jsPlumbInstance)
    };
    p.Anchors.AutoDefault = function (L) {
        var K = L.jsPlumbInstance.makeDynamicAnchor(p.Defaults.DynamicAnchors(L));
        K.type = "AutoDefault";
        return K
    };
    p.Anchors.Assign = s(0, 0, 0, 0, "Assign", function (L, M) {
        var K = M.position || "Fixed";
        L.positionFinder = K.constructor == String ? M.jsPlumbInstance.AnchorPositionFinders[K] : K;
        L.constructorParams = M
    });
    p.Anchors.Continuous = function (K) {
        return K.jsPlumbInstance.continuousAnchorFactory.get(K)
    };
    p.AnchorPositionFinders = {Fixed: function (N, K, M, L) {
        return[(N.left - K.left) / M[0], (N.top - K.top) / M[1]]
    }, Grid: function (K, T, O, L) {
        var S = K.left - T.left, R = K.top - T.top, Q = O[0] / (L.grid[0]), P = O[1] / (L.grid[1]), N = Math.floor(S / Q), M = Math.floor(R / P);
        return[((N * Q) + (Q / 2)) / O[0], ((M * P) + (P / 2)) / O[1]]
    }}
})();
(function () {
    jsPlumb.DOMElementComponent = function (c) {
        jsPlumb.jsPlumbUIComponent.apply(this, arguments);
        this.mousemove = this.dblclick = this.click = this.mousedown = this.mouseup = function (d) {
        }
    };
    jsPlumb.Connectors.Straight = function () {
        this.type = "Straight";
        var r = this, i = null, e, k, p, n, l, f, q, h, g, d, c, o, m;
        this.compute = function (A, J, s, z, F, t, D, v) {
            var I = Math.abs(A[0] - J[0]), C = Math.abs(A[1] - J[1]), B = 0.45 * I, u = 0.45 * C;
            I *= 1.9;
            C *= 1.9;
            var G = Math.min(A[0], J[0]) - B;
            var E = Math.min(A[1], J[1]) - u;
            var H = Math.max(2 * D, v);
            if (I < H) {
                I = H;
                G = A[0] + ((J[0] - A[0]) / 2) - (H / 2);
                B = (I - Math.abs(A[0] - J[0])) / 2
            }
            if (C < H) {
                C = H;
                E = A[1] + ((J[1] - A[1]) / 2) - (H / 2);
                u = (C - Math.abs(A[1] - J[1])) / 2
            }
            h = A[0] < J[0] ? B : I - B;
            g = A[1] < J[1] ? u : C - u;
            d = A[0] < J[0] ? I - B : B;
            c = A[1] < J[1] ? C - u : u;
            i = [G, E, I, C, h, g, d, c];
            n = d - h, l = c - g;
            e = jsPlumbUtil.gradient({x: h, y: g}, {x: d, y: c}), k = -1 / e;
            p = -1 * ((e * h) - g);
            f = Math.atan(e);
            q = Math.atan(k);
            m = Math.sqrt((n * n) + (l * l));
            return i
        };
        this.pointOnPath = function (s) {
            if (s == 0) {
                return{x: h, y: g}
            } else {
                if (s == 1) {
                    return{x: d, y: c}
                } else {
                    return jsPlumbUtil.pointOnLine({x: h, y: g}, {x: d, y: c}, s * m)
                }
            }
        };
        this.gradientAtPoint = function (s) {
            return e
        };
        this.pointAlongPathFrom = function (s, v) {
            var u = r.pointOnPath(s), t = s == 1 ? {x: h + ((d - h) * 10), y: g + ((g - c) * 10)} : {x: d, y: c};
            return jsPlumbUtil.pointOnLine(u, t, v)
        }
    };
    jsPlumb.Connectors.Bezier = function (u) {
        var o = this;
        u = u || {};
        this.majorAnchor = u.curviness || 150;
        this.minorAnchor = 10;
        var s = null;
        this.type = "Bezier";
        this._findControlPoint = function (G, v, B, w, z, E, x) {
            var D = E.getOrientation(w), F = x.getOrientation(z), A = D[0] != F[0] || D[1] == F[1], y = [], H = o.majorAnchor, C = o.minorAnchor;
            if (!A) {
                if (D[0] == 0) {
                    y.push(v[0] < B[0] ? G[0] + C : G[0] - C)
                } else {
                    y.push(G[0] - (H * D[0]))
                }
                if (D[1] == 0) {
                    y.push(v[1] < B[1] ? G[1] + C : G[1] - C)
                } else {
                    y.push(G[1] + (H * F[1]))
                }
            } else {
                if (F[0] == 0) {
                    y.push(B[0] < v[0] ? G[0] + C : G[0] - C)
                } else {
                    y.push(G[0] + (H * F[0]))
                }
                if (F[1] == 0) {
                    y.push(B[1] < v[1] ? G[1] + C : G[1] - C)
                } else {
                    y.push(G[1] + (H * D[1]))
                }
            }
            return y
        };
        var p, l, f, n, m, f, e, r, q, t, d, h, g, k, i;
        this.compute = function (R, y, L, z, P, w, v, K) {
            v = v || 0;
            t = Math.abs(R[0] - y[0]) + v;
            d = Math.abs(R[1] - y[1]) + v;
            r = Math.min(R[0], y[0]) - (v / 2);
            q = Math.min(R[1], y[1]) - (v / 2);
            f = R[0] < y[0] ? t - (v / 2) : (v / 2);
            e = R[1] < y[1] ? d - (v / 2) : (v / 2);
            n = R[0] < y[0] ? (v / 2) : t - (v / 2);
            m = R[1] < y[1] ? (v / 2) : d - (v / 2);
            p = o._findControlPoint([f, e], R, y, L, z, P, w);
            l = o._findControlPoint([n, m], y, R, z, L, w, P);
            var J = Math.min(f, n), I = Math.min(p[0], l[0]), E = Math.min(J, I), Q = Math.max(f, n), N = Math.max(p[0], l[0]), B = Math.max(Q, N);
            if (B > t) {
                t = B
            }
            if (E < 0) {
                r += E;
                var G = Math.abs(E);
                t += G;
                p[0] += G;
                f += G;
                n += G;
                l[0] += G
            }
            var O = Math.min(e, m), M = Math.min(p[1], l[1]), A = Math.min(O, M), F = Math.max(e, m), D = Math.max(p[1], l[1]), x = Math.max(F, D);
            if (x > d) {
                d = x
            }
            if (A < 0) {
                q += A;
                var C = Math.abs(A);
                d += C;
                p[1] += C;
                e += C;
                m += C;
                l[1] += C
            }
            if (K && t < K) {
                var H = (K - t) / 2;
                t = K;
                r -= H;
                f = f + H;
                n = n + H;
                p[0] = p[0] + H;
                l[0] = l[0] + H
            }
            if (K && d < K) {
                var H = (K - d) / 2;
                d = K;
                q -= H;
                e = e + H;
                m = m + H;
                p[1] = p[1] + H;
                l[1] = l[1] + H
            }
            s = [r, q, t, d, f, e, n, m, p[0], p[1], l[0], l[1]];
            return s
        };
        var c = function () {
            return[
                {x: f, y: e},
                {x: p[0], y: p[1]},
                {x: l[0], y: l[1]},
                {x: n, y: m}
            ]
        };
        this.pointOnPath = function (v) {
            return jsBezier.pointOnCurve(c(), v)
        };
        this.gradientAtPoint = function (v) {
            return jsBezier.gradientAtPoint(c(), v)
        };
        this.pointAlongPathFrom = function (v, w) {
            return jsBezier.pointAlongCurveFrom(c(), v, w)
        }
    };
    jsPlumb.Connectors.Flowchart = function (k) {
        this.type = "Flowchart";
        k = k || {};
        var s = this, f = k.stub || k.minStubLength || 30, p = k.gap || 0, m = [], r = 0, o = [], e = [], q = [], h, g, d = 0, c = 0, l = function (v, u, z, y) {
            var x = 0;
            for (var w = 0; w < m.length; w++) {
                e[w] = m[w][5] / r;
                o[w] = [x, (x += (m[w][5] / r))]
            }
        }, t = function () {
            q.push(m.length);
            for (var u = 0; u < m.length; u++) {
                q.push(m[u][0]);
                q.push(m[u][1])
            }
        }, i = function (F, C, E, D, B, A) {
            var v = m.length == 0 ? E : m[m.length - 1][0], u = m.length == 0 ? D : m[m.length - 1][1], w = F == v ? Infinity : 0, z = Math.abs(F == v ? C - u : F - v);
            m.push([F, C, v, u, w, z]);
            r += z;
            d = Math.max(d, F);
            c = Math.max(c, C)
        }, n = function (w) {
            var u = o.length - 1, v = 1;
            for (var x = 0; x < o.length; x++) {
                if (o[x][1] >= w) {
                    u = x;
                    v = (w - o[x][0]) / e[x];
                    break
                }
            }
            return{segment: m[u], proportion: v, index: u}
        };
        this.compute = function (S, ag, u, M, aq, G, Q, L, al, ai) {
            m = [];
            o = [];
            r = 0;
            e = [];
            d = c = 0;
            h = ag[0] < S[0];
            g = ag[1] < S[1];
            var W = Q || 1, E = (W / 2) + (f * 2), C = (W / 2) + (f * 2), J = aq.orientation || aq.getOrientation(u), ar = G.orientation || G.getOrientation(M), af = h ? ag[0] : S[0], ae = g ? ag[1] : S[1], ah = Math.abs(ag[0] - S[0]) + 2 * E, ap = Math.abs(ag[1] - S[1]) + 2 * C;
            if (J[0] == 0 && J[1] == 0 || ar[0] == 0 && ar[1] == 0) {
                var Y = ah > ap ? 0 : 1, aa = [1, 0][Y];
                J = [];
                ar = [];
                J[Y] = S[Y] > ag[Y] ? -1 : 1;
                ar[Y] = S[Y] > ag[Y] ? 1 : -1;
                J[aa] = 0;
                ar[aa] = 0
            }
            if (ah < L) {
                E += (L - ah) / 2;
                ah = L
            }
            if (ap < L) {
                C += (L - ap) / 2;
                ap = L
            }
            var D = h ? (ah - E) + (p * J[0]) : E + (p * J[0]), B = g ? (ap - C) + (p * J[1]) : C + (p * J[1]), an = h ? E + (p * ar[0]) : (ah - E) + (p * ar[0]), am = g ? C + (p * ar[1]) : (ap - C) + (p * ar[1]), V = D + (J[0] * f), U = B + (J[1] * f), H = an + (ar[0] * f), F = am + (ar[1] * f), R = Math.abs(D - an) > 2 * f, T = Math.abs(B - am) > 2 * f, ad = V + ((H - V) / 2), ab = U + ((F - U) / 2), K = ((J[0] * ar[0]) + (J[1] * ar[1])), X = K == -1, Z = K == 0, v = K == 1;
            af -= E;
            ae -= C;
            q = [af, ae, ah, ap, D, B, an, am];
            var ak = [];
            i(V, U, D, B, an, am);
            var O = J[0] == 0 ? "y" : "x", I = X ? "opposite" : v ? "orthogonal" : "perpendicular", z = jsPlumbUtil.segment([D, B], [an, am]), ac = J[O == "x" ? 0 : 1] == -1, N = {x: [null, 4, 3, 2, 1], y: [null, 2, 1, 4, 3]};
            if (ac) {
                z = N[O][z]
            }
            var P = function (at, y, w, x) {
                return at + (y * ((1 - w) * x) + f)
            }, A = {oppositex: function () {
                if (u.elementId == M.elementId) {
                    var w = U + ((1 - aq.y) * al.height) + f;
                    return[
                        [V, w],
                        [H, w]
                    ]
                } else {
                    if (R && (z == 1 || z == 2)) {
                        return[
                            [ad, B],
                            [ad, am]
                        ]
                    } else {
                        return[
                            [V, ab],
                            [H, ab]
                        ]
                    }
                }
            }, orthogonalx: function () {
                if (z == 1 || z == 2) {
                    return[
                        [H, U]
                    ]
                } else {
                    return[
                        [V, F]
                    ]
                }
            }, perpendicularx: function () {
                var w = (am + B) / 2;
                if ((z == 1 && ar[1] == 1) || (z == 2 && ar[1] == -1)) {
                    if (Math.abs(an - D) > f) {
                        return[
                            [H, U]
                        ]
                    } else {
                        return[
                            [V, U],
                            [V, w],
                            [H, w]
                        ]
                    }
                } else {
                    if ((z == 3 && ar[1] == -1) || (z == 4 && ar[1] == 1)) {
                        return[
                            [V, w],
                            [H, w]
                        ]
                    } else {
                        if ((z == 3 && ar[1] == 1) || (z == 4 && ar[1] == -1)) {
                            return[
                                [V, F]
                            ]
                        } else {
                            if ((z == 1 && ar[1] == -1) || (z == 2 && ar[1] == 1)) {
                                if (Math.abs(an - D) > f) {
                                    return[
                                        [ad, U],
                                        [ad, F]
                                    ]
                                } else {
                                    return[
                                        [V, F]
                                    ]
                                }
                            }
                        }
                    }
                }
            }, oppositey: function () {
                if (u.elementId == M.elementId) {
                    var w = V + ((1 - aq.x) * al.width) + f;
                    return[
                        [w, U],
                        [w, F]
                    ]
                } else {
                    if (T && (z == 2 || z == 3)) {
                        return[
                            [D, ab],
                            [an, ab]
                        ]
                    } else {
                        return[
                            [ad, U],
                            [ad, F]
                        ]
                    }
                }
            }, orthogonaly: function () {
                if (z == 2 || z == 3) {
                    return[
                        [V, F]
                    ]
                } else {
                    return[
                        [H, U]
                    ]
                }
            }, perpendiculary: function () {
                var w = (an + D) / 2;
                if ((z == 2 && ar[0] == -1) || (z == 3 && ar[0] == 1)) {
                    if (Math.abs(an - D) > f) {
                        return[
                            [V, F]
                        ]
                    } else {
                        return[
                            [V, ab],
                            [H, ab]
                        ]
                    }
                } else {
                    if ((z == 1 && ar[0] == -1) || (z == 4 && ar[0] == 1)) {
                        var w = (an + D) / 2;
                        return[
                            [w, U],
                            [w, F]
                        ]
                    } else {
                        if ((z == 1 && ar[0] == 1) || (z == 4 && ar[0] == -1)) {
                            return[
                                [H, U]
                            ]
                        } else {
                            if ((z == 2 && ar[0] == 1) || (z == 3 && ar[0] == -1)) {
                                if (Math.abs(am - B) > f) {
                                    return[
                                        [V, ab],
                                        [H, ab]
                                    ]
                                } else {
                                    return[
                                        [H, U]
                                    ]
                                }
                            }
                        }
                    }
                }
            }};
            var aj = A[I + O]();
            if (aj) {
                for (var ao = 0; ao < aj.length; ao++) {
                    i(aj[ao][0], aj[ao][1], D, B, an, am)
                }
            }
            i(H, F, D, B, an, am);
            i(an, am, D, B, an, am);
            t();
            l(D, B, an, am);
            if (c > q[3]) {
                q[3] = c + (Q * 2)
            }
            if (d > q[2]) {
                q[2] = d + (Q * 2)
            }
            return q
        };
        this.pointOnPath = function (u) {
            return s.pointAlongPathFrom(u, 0)
        };
        this.gradientAtPoint = function (u) {
            return m[n(u)["index"]][4]
        };
        this.pointAlongPathFrom = function (x, B) {
            var y = n(x), w = y.segment, A = y.proportion, v = m[y.index][5], u = m[y.index][4];
            var z = {x: u == Infinity ? w[2] : w[2] > w[0] ? w[0] + ((1 - A) * v) - B : w[2] + (A * v) + B, y: u == 0 ? w[3] : w[3] > w[1] ? w[1] + ((1 - A) * v) - B : w[3] + (A * v) + B, segmentInfo: y};
            return z
        }
    };
    jsPlumb.Endpoints.Dot = function (d) {
        this.type = "Dot";
        var c = this;
        d = d || {};
        this.radius = d.radius || 10;
        this.defaultOffset = 0.5 * this.radius;
        this.defaultInnerRadius = this.radius / 3;
        this.compute = function (i, f, l, h) {
            var g = l.radius || c.radius, e = i[0] - g, k = i[1] - g;
            return[e, k, g * 2, g * 2, g]
        }
    };
    jsPlumb.Endpoints.Rectangle = function (d) {
        this.type = "Rectangle";
        var c = this;
        d = d || {};
        this.width = d.width || 20;
        this.height = d.height || 20;
        this.compute = function (k, g, m, i) {
            var h = m.width || c.width, f = m.height || c.height, e = k[0] - (h / 2), l = k[1] - (f / 2);
            return[e, l, h, f]
        }
    };
    var a = function (e) {
        jsPlumb.DOMElementComponent.apply(this, arguments);
        var c = this;
        var d = [];
        this.getDisplayElements = function () {
            return d
        };
        this.appendDisplayElement = function (f) {
            d.push(f)
        }
    };
    jsPlumb.Endpoints.Image = function (g) {
        this.type = "Image";
        a.apply(this, arguments);
        var l = this, f = false, e = g.width, d = g.height, i = null, c = g.endpoint;
        this.img = new Image();
        l.ready = false;
        this.img.onload = function () {
            l.ready = true;
            e = e || l.img.width;
            d = d || l.img.height;
            if (i) {
                i(l)
            }
        };
        c.setImage = function (m, o) {
            var n = m.constructor == String ? m : m.src;
            i = o;
            l.img.src = m;
            if (l.canvas != null) {
                l.canvas.setAttribute("src", m)
            }
        };
        c.setImage(g.src || g.url, g.onload);
        this.compute = function (o, m, p, n) {
            l.anchorPoint = o;
            if (l.ready) {
                return[o[0] - e / 2, o[1] - d / 2, e, d]
            } else {
                return[0, 0, 0, 0]
            }
        };
        l.canvas = document.createElement("img"), f = false;
        l.canvas.style.margin = 0;
        l.canvas.style.padding = 0;
        l.canvas.style.outline = 0;
        l.canvas.style.position = "absolute";
        var h = g.cssClass ? " " + g.cssClass : "";
        l.canvas.className = jsPlumb.endpointClass + h;
        if (e) {
            l.canvas.setAttribute("width", e)
        }
        if (d) {
            l.canvas.setAttribute("height", d)
        }
        jsPlumb.appendElement(l.canvas, g.parent);
        l.attachListeners(l.canvas, l);
        var k = function (p, o, n) {
            if (!f) {
                l.canvas.setAttribute("src", l.img.src);
                l.appendDisplayElement(l.canvas);
                f = true
            }
            var m = l.anchorPoint[0] - (e / 2), q = l.anchorPoint[1] - (d / 2);
            jsPlumb.sizeCanvas(l.canvas, m, q, e, d)
        };
        this.paint = function (o, n, m) {
            if (l.ready) {
                k(o, n, m)
            } else {
                window.setTimeout(function () {
                    l.paint(o, n, m)
                }, 200)
            }
        }
    };
    jsPlumb.Endpoints.Blank = function (d) {
        var c = this;
        this.type = "Blank";
        a.apply(this, arguments);
        this.compute = function (g, e, h, f) {
            return[g[0], g[1], 10, 0]
        };
        c.canvas = document.createElement("div");
        c.canvas.style.display = "block";
        c.canvas.style.width = "1px";
        c.canvas.style.height = "1px";
        c.canvas.style.background = "transparent";
        c.canvas.style.position = "absolute";
        c.canvas.className = c._jsPlumb.endpointClass;
        jsPlumb.appendElement(c.canvas, d.parent);
        this.paint = function (g, f, e) {
            jsPlumb.sizeCanvas(c.canvas, g[0], g[1], g[2], g[3])
        }
    };
    jsPlumb.Endpoints.Triangle = function (c) {
        this.type = "Triangle";
        c = c || {};
        c.width = c.width || 55;
        c.height = c.height || 55;
        this.width = c.width;
        this.height = c.height;
        this.compute = function (i, f, l, h) {
            var g = l.width || self.width, e = l.height || self.height, d = i[0] - (g / 2), k = i[1] - (e / 2);
            return[d, k, g, e]
        }
    };
    var b = function (e) {
        var d = true, c = this;
        this.isAppendedAtTopLevel = true;
        this.component = e.component;
        this.loc = e.location == null ? 0.5 : e.location;
        this.endpointLoc = e.endpointLocation == null ? [0.5, 0.5] : e.endpointLocation;
        this.setVisible = function (f) {
            d = f;
            c.component.repaint()
        };
        this.isVisible = function () {
            return d
        };
        this.hide = function () {
            c.setVisible(false)
        };
        this.show = function () {
            c.setVisible(true)
        };
        this.incrementLocation = function (f) {
            c.loc += f;
            c.component.repaint()
        };
        this.setLocation = function (f) {
            c.loc = f;
            c.component.repaint()
        };
        this.getLocation = function () {
            return c.loc
        }
    };
    jsPlumb.Overlays.Arrow = function (g) {
        this.type = "Arrow";
        b.apply(this, arguments);
        this.isAppendedAtTopLevel = false;
        g = g || {};
        var d = this;
        this.length = g.length || 20;
        this.width = g.width || 20;
        this.id = g.id;
        var f = (g.direction || 1) < 0 ? -1 : 1, e = g.paintStyle || {lineWidth: 1}, c = g.foldback || 0.623;
        this.computeMaxSize = function () {
            return d.width * 1.5
        };
        this.cleanup = function () {
        };
        this.draw = function (i, x, s) {
            var m, t, h, n, l;
            if (i.pointAlongPathFrom) {
                if (d.loc == 1) {
                    m = i.pointOnPath(d.loc);
                    t = i.pointAlongPathFrom(d.loc, -1);
                    h = jsPlumbUtil.pointOnLine(m, t, d.length)
                } else {
                    if (d.loc == 0) {
                        h = i.pointOnPath(d.loc);
                        t = i.pointAlongPathFrom(d.loc, 1);
                        m = jsPlumbUtil.pointOnLine(h, t, d.length)
                    } else {
                        m = i.pointAlongPathFrom(d.loc, f * d.length / 2), t = i.pointOnPath(d.loc), h = jsPlumbUtil.pointOnLine(m, t, d.length)
                    }
                }
                n = jsPlumbUtil.perpendicularLineTo(m, h, d.width);
                l = jsPlumbUtil.pointOnLine(m, h, c * d.length);
                var w = Math.min(m.x, n[0].x, n[1].x), q = Math.max(m.x, n[0].x, n[1].x), v = Math.min(m.y, n[0].y, n[1].y), p = Math.max(m.y, n[0].y, n[1].y);
                var o = {hxy: m, tail: n, cxy: l}, r = e.strokeStyle || x.strokeStyle, u = e.fillStyle || x.strokeStyle, k = e.lineWidth || x.lineWidth;
                d.paint(i, o, k, r, u, s);
                return[w, q, v, p]
            } else {
                return[0, 0, 0, 0]
            }
        }
    };
    jsPlumb.Overlays.PlainArrow = function (d) {
        d = d || {};
        var c = jsPlumb.extend(d, {foldback: 1});
        jsPlumb.Overlays.Arrow.call(this, c);
        this.type = "PlainArrow"
    };
    jsPlumb.Overlays.Diamond = function (e) {
        e = e || {};
        var c = e.length || 40, d = jsPlumb.extend(e, {length: c / 2, foldback: 2});
        jsPlumb.Overlays.Arrow.call(this, d);
        this.type = "Diamond"
    };
    jsPlumb.Overlays.Label = function (i) {
        this.type = "Label";
        jsPlumb.DOMElementComponent.apply(this, arguments);
        b.apply(this, arguments);
        this.labelStyle = i.labelStyle || jsPlumb.Defaults.LabelStyle;
        this.id = i.id;
        this.cachedDimensions = null;
        var e = i.label || "", c = this, f = false, k = document.createElement("div"), g = null;
        k.style.position = "absolute";
        var d = i._jsPlumb.overlayClass + " " + (c.labelStyle.cssClass ? c.labelStyle.cssClass : i.cssClass ? i.cssClass : "");
        k.className = d;
        jsPlumb.appendElement(k, i.component.parent);
        jsPlumb.getId(k);
        c.attachListeners(k, c);
        c.canvas = k;
        var h = c.setVisible;
        c.setVisible = function (l) {
            h(l);
            k.style.display = l ? "block" : "none"
        };
        this.getElement = function () {
            return k
        };
        this.cleanup = function () {
            if (k != null) {
                jsPlumb.CurrentLibrary.removeElement(k)
            }
        };
        this.setLabel = function (m) {
            e = m;
            g = null;
            c.component.repaint()
        };
        this.getLabel = function () {
            return e
        };
        this.paint = function (l, n, m) {
            if (!f) {
                l.appendDisplayElement(k);
                c.attachListeners(k, l);
                f = true
            }
            k.style.left = (m[0] + n.minx) + "px";
            k.style.top = (m[1] + n.miny) + "px"
        };
        this.getTextDimensions = function () {
            if (typeof e == "function") {
                var l = e(c);
                k.innerHTML = l.replace(/\r\n/g, "<br/>")
            } else {
                if (g == null) {
                    g = e;
                    k.innerHTML = g.replace(/\r\n/g, "<br/>")
                }
            }
            var n = jsPlumb.CurrentLibrary.getElementObject(k), m = jsPlumb.CurrentLibrary.getSize(n);
            return{width: m[0], height: m[1]}
        };
        this.computeMaxSize = function (l) {
            var m = c.getTextDimensions(l);
            return m.width ? Math.max(m.width, m.height) * 1.5 : 0
        };
        this.draw = function (m, n, o) {
            var q = c.getTextDimensions(m);
            if (q.width != null) {
                var p = {x: 0, y: 0};
                if (m.pointOnPath) {
                    p = m.pointOnPath(c.loc)
                } else {
                    var l = c.loc.constructor == Array ? c.loc : c.endpointLoc;
                    p = {x: l[0] * o[2], y: l[1] * o[3]}
                }
                minx = p.x - (q.width / 2), miny = p.y - (q.height / 2);
                c.paint(m, {minx: minx, miny: miny, td: q, cxy: p}, o);
                return[minx, minx + q.width, miny, miny + q.height]
            } else {
                return[0, 0, 0, 0]
            }
        };
        this.reattachListeners = function (l) {
            if (k) {
                c.reattachListenersForElement(k, c, l)
            }
        }
    };
    jsPlumb.Overlays.GuideLines = function () {
        var c = this;
        c.length = 50;
        c.lineWidth = 5;
        this.type = "GuideLines";
        b.apply(this, arguments);
        jsPlumb.jsPlumbUIComponent.apply(this, arguments);
        this.draw = function (e, l, k) {
            var i = e.pointAlongPathFrom(c.loc, c.length / 2), h = e.pointOnPath(c.loc), g = jsPlumbUtil.pointOnLine(i, h, c.length), f = jsPlumbUtil.perpendicularLineTo(i, g, 40), d = jsPlumbUtil.perpendicularLineTo(g, i, 20);
            c.paint(e, [i, g, f, d], c.lineWidth, "red", null, k);
            return[Math.min(i.x, g.x), Math.min(i.y, g.y), Math.max(i.x, g.x), Math.max(i.y, g.y)]
        };
        this.computeMaxSize = function () {
            return 50
        };
        this.cleanup = function () {
        }
    }
})();
(function () {
    var c = function (e, g, d, f) {
        this.m = (f - g) / (d - e);
        this.b = -1 * ((this.m * e) - g);
        this.rectIntersect = function (q, p, s, o) {
            var n = [];
            var k = (p - this.b) / this.m;
            if (k >= q && k <= (q + s)) {
                n.push([k, (this.m * k) + this.b])
            }
            var t = (this.m * (q + s)) + this.b;
            if (t >= p && t <= (p + o)) {
                n.push([(t - this.b) / this.m, t])
            }
            var k = ((p + o) - this.b) / this.m;
            if (k >= q && k <= (q + s)) {
                n.push([k, (this.m * k) + this.b])
            }
            var t = (this.m * q) + this.b;
            if (t >= p && t <= (p + o)) {
                n.push([(t - this.b) / this.m, t])
            }
            if (n.length == 2) {
                var m = (n[0][0] + n[1][0]) / 2, l = (n[0][1] + n[1][1]) / 2;
                n.push([m, l]);
                var i = m <= q + (s / 2) ? -1 : 1, r = l <= p + (o / 2) ? -1 : 1;
                n.push([i, r]);
                return n
            }
            return null
        }
    }, a = function (e, g, d, f) {
        if (e <= d && f <= g) {
            return 1
        } else {
            if (e <= d && g <= f) {
                return 2
            } else {
                if (d <= e && f >= g) {
                    return 3
                }
            }
        }
        return 4
    }, b = function (g, f, i, e, h, m, l, d, k) {
        if (d <= k) {
            return[g, f]
        }
        if (i == 1) {
            if (e[3] <= 0 && h[3] >= 1) {
                return[g + (e[2] < 0.5 ? -1 * m : m), f]
            } else {
                if (e[2] >= 1 && h[2] <= 0) {
                    return[g, f + (e[3] < 0.5 ? -1 * l : l)]
                } else {
                    return[g + (-1 * m), f + (-1 * l)]
                }
            }
        } else {
            if (i == 2) {
                if (e[3] >= 1 && h[3] <= 0) {
                    return[g + (e[2] < 0.5 ? -1 * m : m), f]
                } else {
                    if (e[2] >= 1 && h[2] <= 0) {
                        return[g, f + (e[3] < 0.5 ? -1 * l : l)]
                    } else {
                        return[g + (1 * m), f + (-1 * l)]
                    }
                }
            } else {
                if (i == 3) {
                    if (e[3] >= 1 && h[3] <= 0) {
                        return[g + (e[2] < 0.5 ? -1 * m : m), f]
                    } else {
                        if (e[2] <= 0 && h[2] >= 1) {
                            return[g, f + (e[3] < 0.5 ? -1 * l : l)]
                        } else {
                            return[g + (-1 * m), f + (-1 * l)]
                        }
                    }
                } else {
                    if (i == 4) {
                        if (e[3] <= 0 && h[3] >= 1) {
                            return[g + (e[2] < 0.5 ? -1 * m : m), f]
                        } else {
                            if (e[2] <= 0 && h[2] >= 1) {
                                return[g, f + (e[3] < 0.5 ? -1 * l : l)]
                            } else {
                                return[g + (1 * m), f + (-1 * l)]
                            }
                        }
                    }
                }
            }
        }
    };
    jsPlumb.Connectors.StateMachine = function (l) {
        var s = this, n = null, o, m, g, e, p = [], d = l.curviness || 10, k = l.margin || 5, q = l.proximityLimit || 80, f = l.orientation && l.orientation == "clockwise", i = l.loopbackRadius || 25, h = false;
        this.type = "StateMachine";
        l = l || {};
        this.compute = function (ab, F, U, G, aa, u, t, S) {
            var O = Math.abs(ab[0] - F[0]), W = Math.abs(ab[1] - F[1]), Q = 0.45 * O, Z = 0.45 * W;
            O *= 1.9;
            W *= 1.9;
            t = t || 1;
            var M = Math.min(ab[0], F[0]) - Q, K = Math.min(ab[1], F[1]) - Z;
            if (U.elementId != G.elementId) {
                h = false;
                o = ab[0] < F[0] ? Q : O - Q;
                m = ab[1] < F[1] ? Z : W - Z;
                g = ab[0] < F[0] ? O - Q : Q;
                e = ab[1] < F[1] ? W - Z : Z;
                if (ab[2] == 0) {
                    o -= k
                }
                if (ab[2] == 1) {
                    o += k
                }
                if (ab[3] == 0) {
                    m -= k
                }
                if (ab[3] == 1) {
                    m += k
                }
                if (F[2] == 0) {
                    g -= k
                }
                if (F[2] == 1) {
                    g += k
                }
                if (F[3] == 0) {
                    e -= k
                }
                if (F[3] == 1) {
                    e += k
                }
                var L = (o + g) / 2, J = (m + e) / 2, v = (-1 * L) / J, T = Math.atan(v), N = (v == Infinity || v == -Infinity) ? 0 : Math.abs(d / 2 * Math.sin(T)), P = (v == Infinity || v == -Infinity) ? 0 : Math.abs(d / 2 * Math.cos(T)), z = a(o, m, g, e), H = Math.sqrt(Math.pow(g - o, 2) + Math.pow(e - m, 2));
                p = b(L, J, z, ab, F, d, d, H, q);
                var E = Math.max(Math.abs(p[0] - o) * 3, Math.abs(p[0] - g) * 3, Math.abs(g - o), 2 * t, S), I = Math.max(Math.abs(p[1] - m) * 3, Math.abs(p[1] - e) * 3, Math.abs(e - m), 2 * t, S);
                if (O < E) {
                    var R = E - O;
                    M -= (R / 2);
                    o += (R / 2);
                    g += (R / 2);
                    O = E;
                    p[0] += (R / 2)
                }
                if (W < I) {
                    var Y = I - W;
                    K -= (Y / 2);
                    m += (Y / 2);
                    e += (Y / 2);
                    W = I;
                    p[1] += (Y / 2)
                }
                n = [M, K, O, W, o, m, g, e, p[0], p[1]]
            } else {
                h = true;
                var X = ab[0], V = ab[0], D = ab[1] - k, B = ab[1] - k, C = X, A = D - i;
                O = ((2 * t) + (4 * i)), W = ((2 * t) + (4 * i));
                M = C - i - t - i, K = A - i - t - i;
                n = [M, K, O, W, C - M, A - K, i, f, X - M, D - K, V - M, B - K]
            }
            return n
        };
        var r = function () {
            return[
                {x: g, y: e},
                {x: p[0], y: p[1]},
                {x: p[0] + 1, y: p[1] + 1},
                {x: o, y: m}
            ]
        };
        this.pointOnPath = function (v) {
            if (h) {
                if (v > 0 && v < 1) {
                    v = 1 - v
                }
                var w = (v * 2 * Math.PI) + (Math.PI / 2), u = n[4] + (n[6] * Math.cos(w)), t = n[5] + (n[6] * Math.sin(w));
                return{x: u, y: t}
            } else {
                return jsBezier.pointOnCurve(r(), v)
            }
        };
        this.gradientAtPoint = function (t) {
            if (h) {
                return Math.atan(t * 2 * Math.PI)
            } else {
                return jsBezier.gradientAtPoint(r(), t)
            }
        };
        this.pointAlongPathFrom = function (v, z) {
            if (h) {
                if (v > 0 && v < 1) {
                    v = 1 - v
                }
                var w = 2 * Math.PI * n[6], y = z / w * 2 * Math.PI, x = (v * 2 * Math.PI) - y + (Math.PI / 2), u = n[4] + (n[6] * Math.cos(x)), t = n[5] + (n[6] * Math.sin(x));
                return{x: u, y: t}
            }
            return jsBezier.pointAlongCurveFrom(r(), v, z)
        }
    };
    jsPlumb.Connectors.canvas.StateMachine = function (f) {
        f = f || {};
        var d = this, g = f.drawGuideline || true, e = f.avoidSelector;
        jsPlumb.Connectors.StateMachine.apply(this, arguments);
        jsPlumb.CanvasConnector.apply(this, arguments);
        this._paint = function (l) {
            if (l.length == 10) {
                d.ctx.beginPath();
                d.ctx.moveTo(l[4], l[5]);
                d.ctx.bezierCurveTo(l[8], l[9], l[8], l[9], l[6], l[7]);
                d.ctx.stroke()
            } else {
                d.ctx.save();
                d.ctx.beginPath();
                var k = 0, i = 2 * Math.PI, h = l[7];
                d.ctx.arc(l[4], l[5], l[6], 0, i, h);
                d.ctx.stroke();
                d.ctx.closePath();
                d.ctx.restore()
            }
        };
        this.createGradient = function (i, h) {
            return h.createLinearGradient(i[4], i[5], i[6], i[7])
        }
    };
    jsPlumb.Connectors.svg.StateMachine = function () {
        var d = this;
        jsPlumb.Connectors.StateMachine.apply(this, arguments);
        jsPlumb.SvgConnector.apply(this, arguments);
        this.getPath = function (e) {
            if (e.length == 10) {
                return"M " + e[4] + " " + e[5] + " C " + e[8] + " " + e[9] + " " + e[8] + " " + e[9] + " " + e[6] + " " + e[7]
            } else {
                return"M" + (e[8] + 4) + " " + e[9] + " A " + e[6] + " " + e[6] + " 0 1,0 " + (e[8] - 4) + " " + e[9]
            }
        }
    };
    jsPlumb.Connectors.vml.StateMachine = function () {
        jsPlumb.Connectors.StateMachine.apply(this, arguments);
        jsPlumb.VmlConnector.apply(this, arguments);
        var d = jsPlumb.vml.convertValue;
        this.getPath = function (k) {
            if (k.length == 10) {
                return"m" + d(k[4]) + "," + d(k[5]) + " c" + d(k[8]) + "," + d(k[9]) + "," + d(k[8]) + "," + d(k[9]) + "," + d(k[6]) + "," + d(k[7]) + " e"
            } else {
                var h = d(k[8] - k[6]), g = d(k[9] - (2 * k[6])), f = h + d(2 * k[6]), e = g + d(2 * k[6]), l = h + "," + g + "," + f + "," + e;
                var i = "ar " + l + "," + d(k[8]) + "," + d(k[9]) + "," + d(k[8]) + "," + d(k[9]) + " e";
                return i
            }
        }
    }
})();
(function () {
    var h = {"stroke-linejoin": "joinstyle", joinstyle: "joinstyle", endcap: "endcap", miterlimit: "miterlimit"}, c = null;
    if (document.createStyleSheet) {
        var m = [".jsplumb_vml", "jsplumb\\:textbox", "jsplumb\\:oval", "jsplumb\\:rect", "jsplumb\\:stroke", "jsplumb\\:shape", "jsplumb\\:group"], g = "behavior:url(#default#VML);position:absolute;";
        c = document.createStyleSheet();
        for (var r = 0; r < m.length; r++) {
            c.addRule(m[r], g)
        }
        document.namespaces.add("jsplumb", "urn:schemas-microsoft-com:vml")
    }
    jsPlumb.vml = {};
    var t = 1000, s = {}, a = function (u, i) {
        var w = jsPlumb.getId(u), v = s[w];
        if (!v) {
            v = f("group", [0, 0, t, t], {"class": i});
            v.style.backgroundColor = "red";
            s[w] = v;
            jsPlumb.appendElement(v, u)
        }
        return v
    }, e = function (v, w) {
        for (var u in w) {
            v[u] = w[u]
        }
    }, f = function (u, x, y, v, i) {
        y = y || {};
        var w = document.createElement("jsplumb:" + u);
        i.appendElement(w, v);
        w.className = (y["class"] ? y["class"] + " " : "") + "jsplumb_vml";
        k(w, x);
        e(w, y);
        return w
    }, k = function (u, i) {
        u.style.left = i[0] + "px";
        u.style.top = i[1] + "px";
        u.style.width = i[2] + "px";
        u.style.height = i[3] + "px";
        u.style.position = "absolute"
    }, p = jsPlumb.vml.convertValue = function (i) {
        return Math.floor(i * t)
    }, b = function (w, u, v, i) {
        if ("transparent" === u) {
            i.setOpacity(v, "0.0")
        } else {
            i.setOpacity(v, "1.0")
        }
    }, q = function (y, u, B, C) {
        var x = {};
        if (u.strokeStyle) {
            x.stroked = "true";
            var D = jsPlumbUtil.convertStyle(u.strokeStyle, true);
            x.strokecolor = D;
            b(x, D, "stroke", B);
            x.strokeweight = u.lineWidth + "px"
        } else {
            x.stroked = "false"
        }
        if (u.fillStyle) {
            x.filled = "true";
            var v = jsPlumbUtil.convertStyle(u.fillStyle, true);
            x.fillcolor = v;
            b(x, v, "fill", B)
        } else {
            x.filled = "false"
        }
        if (u.dashstyle) {
            if (B.strokeNode == null) {
                B.strokeNode = f("stroke", [0, 0, 0, 0], {dashstyle: u.dashstyle}, y, C)
            } else {
                B.strokeNode.dashstyle = u.dashstyle
            }
        } else {
            if (u["stroke-dasharray"] && u.lineWidth) {
                var E = u["stroke-dasharray"].indexOf(",") == -1 ? " " : ",", z = u["stroke-dasharray"].split(E), w = "";
                for (var A = 0; A < z.length; A++) {
                    w += (Math.floor(z[A] / u.lineWidth) + E)
                }
                if (B.strokeNode == null) {
                    B.strokeNode = f("stroke", [0, 0, 0, 0], {dashstyle: w}, y, C)
                } else {
                    B.strokeNode.dashstyle = w
                }
            }
        }
        e(y, x)
    }, n = function () {
        var i = this;
        jsPlumb.jsPlumbUIComponent.apply(this, arguments);
        this.opacityNodes = {stroke: null, fill: null};
        this.initOpacityNodes = function (v) {
            i.opacityNodes.stroke = f("stroke", [0, 0, 1, 1], {opacity: "0.0"}, v, i._jsPlumb);
            i.opacityNodes.fill = f("fill", [0, 0, 1, 1], {opacity: "0.0"}, v, i._jsPlumb)
        };
        this.setOpacity = function (v, x) {
            var w = i.opacityNodes[v];
            if (w) {
                w.opacity = "" + x
            }
        };
        var u = [];
        this.getDisplayElements = function () {
            return u
        };
        this.appendDisplayElement = function (w, v) {
            if (!v) {
                i.canvas.parentNode.appendChild(w)
            }
            u.push(w)
        }
    }, d = jsPlumb.VmlConnector = function (v) {
        var i = this;
        i.strokeNode = null;
        i.canvas = null;
        n.apply(this, arguments);
        var u = i._jsPlumb.connectorClass + (v.cssClass ? (" " + v.cssClass) : "");
        this.paint = function (A, x, z) {
            if (x != null) {
                var E = i.getPath(A), y = {path: E};
                if (x.outlineColor) {
                    var C = x.outlineWidth || 1, D = x.lineWidth + (2 * C), B = {strokeStyle: jsPlumbUtil.convertStyle(x.outlineColor), lineWidth: D};
                    for (var w in h) {
                        B[w] = x[w]
                    }
                    if (i.bgCanvas == null) {
                        y["class"] = u;
                        y.coordsize = (A[2] * t) + "," + (A[3] * t);
                        i.bgCanvas = f("shape", A, y, v.parent, i._jsPlumb);
                        k(i.bgCanvas, A);
                        i.appendDisplayElement(i.bgCanvas, true);
                        i.attachListeners(i.bgCanvas, i);
                        i.initOpacityNodes(i.bgCanvas, ["stroke"])
                    } else {
                        y.coordsize = (A[2] * t) + "," + (A[3] * t);
                        k(i.bgCanvas, A);
                        e(i.bgCanvas, y)
                    }
                    q(i.bgCanvas, B, i)
                }
                if (i.canvas == null) {
                    y["class"] = u;
                    y.coordsize = (A[2] * t) + "," + (A[3] * t);
                    if (i.tooltip) {
                        y.label = i.tooltip
                    }
                    i.canvas = f("shape", A, y, v.parent, i._jsPlumb);
                    i.appendDisplayElement(i.canvas, true);
                    i.attachListeners(i.canvas, i);
                    i.initOpacityNodes(i.canvas, ["stroke"])
                } else {
                    y.coordsize = (A[2] * t) + "," + (A[3] * t);
                    k(i.canvas, A);
                    e(i.canvas, y)
                }
                q(i.canvas, x, i, i._jsPlumb)
            }
        };
        this.reattachListeners = function () {
            if (i.canvas) {
                i.reattachListenersForElement(i.canvas, i)
            }
        }
    }, l = window.VmlEndpoint = function (y) {
        n.apply(this, arguments);
        var i = null, v = this, u = null, x = null;
        v.canvas = document.createElement("div");
        v.canvas.style.position = "absolute";
        var w = v._jsPlumb.endpointClass + (y.cssClass ? (" " + y.cssClass) : "");
        y._jsPlumb.appendElement(v.canvas, y.parent);
        if (v.tooltip) {
            v.canvas.setAttribute("label", v.tooltip)
        }
        this.paint = function (C, A, z) {
            var B = {};
            jsPlumb.sizeCanvas(v.canvas, C[0], C[1], C[2], C[3]);
            if (i == null) {
                B["class"] = w;
                i = v.getVml([0, 0, C[2], C[3]], B, z, v.canvas, v._jsPlumb);
                v.attachListeners(i, v);
                v.appendDisplayElement(i, true);
                v.appendDisplayElement(v.canvas, true);
                v.initOpacityNodes(i, ["fill"])
            } else {
                k(i, [0, 0, C[2], C[3]]);
                e(i, B)
            }
            q(i, A, v)
        };
        this.reattachListeners = function () {
            if (i) {
                v.reattachListenersForElement(i, v)
            }
        }
    };
    jsPlumb.Connectors.vml.Bezier = function () {
        jsPlumb.Connectors.Bezier.apply(this, arguments);
        d.apply(this, arguments);
        this.getPath = function (i) {
            return"m" + p(i[4]) + "," + p(i[5]) + " c" + p(i[8]) + "," + p(i[9]) + "," + p(i[10]) + "," + p(i[11]) + "," + p(i[6]) + "," + p(i[7]) + " e"
        }
    };
    jsPlumb.Connectors.vml.Straight = function () {
        jsPlumb.Connectors.Straight.apply(this, arguments);
        d.apply(this, arguments);
        this.getPath = function (i) {
            return"m" + p(i[4]) + "," + p(i[5]) + " l" + p(i[6]) + "," + p(i[7]) + " e"
        }
    };
    jsPlumb.Connectors.vml.Flowchart = function () {
        jsPlumb.Connectors.Flowchart.apply(this, arguments);
        d.apply(this, arguments);
        this.getPath = function (v) {
            var w = "m " + p(v[4]) + "," + p(v[5]) + " l";
            for (var u = 0; u < v[8]; u++) {
                w = w + " " + p(v[9 + (u * 2)]) + "," + p(v[10 + (u * 2)])
            }
            w = w + " " + p(v[6]) + "," + p(v[7]) + " e";
            return w
        }
    };
    jsPlumb.Endpoints.vml.Dot = function () {
        jsPlumb.Endpoints.Dot.apply(this, arguments);
        l.apply(this, arguments);
        this.getVml = function (w, x, u, v, i) {
            return f("oval", w, x, v, i)
        }
    };
    jsPlumb.Endpoints.vml.Rectangle = function () {
        jsPlumb.Endpoints.Rectangle.apply(this, arguments);
        l.apply(this, arguments);
        this.getVml = function (w, x, u, v, i) {
            return f("rect", w, x, v, i)
        }
    };
    jsPlumb.Endpoints.vml.Image = jsPlumb.Endpoints.Image;
    jsPlumb.Endpoints.vml.Blank = jsPlumb.Endpoints.Blank;
    jsPlumb.Overlays.vml.Label = jsPlumb.Overlays.Label;
    var o = function (x, v) {
        x.apply(this, v);
        n.apply(this, v);
        var u = this, w = null;
        u.canvas = null;
        u.isAppendedAtTopLevel = true;
        var i = function (z, y) {
            return"m " + p(z.hxy.x) + "," + p(z.hxy.y) + " l " + p(z.tail[0].x) + "," + p(z.tail[0].y) + " " + p(z.cxy.x) + "," + p(z.cxy.y) + " " + p(z.tail[1].x) + "," + p(z.tail[1].y) + " x e"
        };
        this.paint = function (B, G, F, H, L, K) {
            var z = {};
            if (H) {
                z.stroked = "true";
                z.strokecolor = jsPlumbUtil.convertStyle(H, true)
            }
            if (F) {
                z.strokeweight = F + "px"
            }
            if (L) {
                z.filled = "true";
                z.fillcolor = L
            }
            var y = Math.min(G.hxy.x, G.tail[0].x, G.tail[1].x, G.cxy.x), J = Math.min(G.hxy.y, G.tail[0].y, G.tail[1].y, G.cxy.y), C = Math.max(G.hxy.x, G.tail[0].x, G.tail[1].x, G.cxy.x), A = Math.max(G.hxy.y, G.tail[0].y, G.tail[1].y, G.cxy.y), I = Math.abs(C - y), E = Math.abs(A - J), D = [y, J, I, E];
            z.path = i(G, K);
            z.coordsize = (K[2] * t) + "," + (K[3] * t);
            D[0] = K[0];
            D[1] = K[1];
            D[2] = K[2];
            D[3] = K[3];
            if (u.canvas == null) {
                u.canvas = f("shape", D, z, B.canvas.parentNode, B._jsPlumb);
                B.appendDisplayElement(u.canvas, true);
                u.attachListeners(u.canvas, B);
                u.attachListeners(u.canvas, u)
            } else {
                k(u.canvas, D);
                e(u.canvas, z)
            }
        };
        this.reattachListeners = function () {
            if (u.canvas) {
                u.reattachListenersForElement(u.canvas, u)
            }
        };
        this.cleanup = function () {
            if (u.canvas != null) {
                jsPlumb.CurrentLibrary.removeElement(u.canvas)
            }
        }
    };
    jsPlumb.Overlays.vml.Arrow = function () {
        o.apply(this, [jsPlumb.Overlays.Arrow, arguments])
    };
    jsPlumb.Overlays.vml.PlainArrow = function () {
        o.apply(this, [jsPlumb.Overlays.PlainArrow, arguments])
    };
    jsPlumb.Overlays.vml.Diamond = function () {
        o.apply(this, [jsPlumb.Overlays.Diamond, arguments])
    }
})();
(function () {
    var l = {joinstyle: "stroke-linejoin", "stroke-linejoin": "stroke-linejoin", "stroke-dashoffset": "stroke-dashoffset", "stroke-linecap": "stroke-linecap"}, w = "stroke-dasharray", A = "dashstyle", e = "linearGradient", b = "radialGradient", c = "fill", a = "stop", z = "stroke", q = "stroke-width", h = "style", m = "none", t = "jsplumb_gradient_", o = "lineWidth", C = {svg: "http://www.w3.org/2000/svg", xhtml: "http://www.w3.org/1999/xhtml"}, g = function (F, D) {
        for (var E in D) {
            F.setAttribute(E, "" + D[E])
        }
    }, f = function (E, D) {
        var F = document.createElementNS(C.svg, E);
        D = D || {};
        D.version = "1.1";
        D.xmlns = C.xhtml;
        g(F, D);
        return F
    }, n = function (D) {
        return"position:absolute;left:" + D[0] + "px;top:" + D[1] + "px"
    }, i = function (E) {
        for (var D = 0; D < E.childNodes.length; D++) {
            if (E.childNodes[D].tagName == e || E.childNodes[D].tagName == b) {
                E.removeChild(E.childNodes[D])
            }
        }
    }, v = function (N, I, F, D, J) {
        var G = t + J._jsPlumb.idstamp();
        i(N);
        if (!F.gradient.offset) {
            var L = f(e, {id: G, gradientUnits: "userSpaceOnUse"});
            N.appendChild(L)
        } else {
            var L = f(b, {id: G});
            N.appendChild(L)
        }
        for (var K = 0; K < F.gradient.stops.length; K++) {
            var H = K;
            if (D.length == 8) {
                H = D[4] < D[6] ? K : F.gradient.stops.length - 1 - K
            } else {
                H = D[4] < D[6] ? F.gradient.stops.length - 1 - K : K
            }
            var M = jsPlumbUtil.convertStyle(F.gradient.stops[H][1], true);
            var O = f(a, {offset: Math.floor(F.gradient.stops[K][0] * 100) + "%", "stop-color": M});
            L.appendChild(O)
        }
        var E = F.strokeStyle ? z : c;
        I.setAttribute(h, E + ":url(#" + G + ")")
    }, x = function (K, G, E, D, H) {
        if (E.gradient) {
            v(K, G, E, D, H)
        } else {
            i(K);
            G.setAttribute(h, "")
        }
        G.setAttribute(c, E.fillStyle ? jsPlumbUtil.convertStyle(E.fillStyle, true) : m);
        G.setAttribute(z, E.strokeStyle ? jsPlumbUtil.convertStyle(E.strokeStyle, true) : m);
        if (E.lineWidth) {
            G.setAttribute(q, E.lineWidth)
        }
        if (E[A] && E[o] && !E[w]) {
            var L = E[A].indexOf(",") == -1 ? " " : ",", I = E[A].split(L), F = "";
            I.forEach(function (M) {
                F += (Math.floor(M * E.lineWidth) + L)
            });
            G.setAttribute(w, F)
        } else {
            if (E[w]) {
                G.setAttribute(w, E[w])
            }
        }
        for (var J in l) {
            if (E[J]) {
                G.setAttribute(l[J], E[J])
            }
        }
    }, B = function (F) {
        var D = /([0-9].)(p[xt])\s(.*)/;
        var E = F.match(D);
        return{size: E[1] + E[2], font: E[3]}
    }, r = function (I, J, E) {
        var K = E.split(" "), H = I.className, G = H.baseVal.split(" ");
        for (var F = 0; F < K.length; F++) {
            if (J) {
                if (G.indexOf(K[F]) == -1) {
                    G.push(K[F])
                }
            } else {
                var D = G.indexOf(K[F]);
                if (D != -1) {
                    G.splice(D, 1)
                }
            }
        }
        I.className.baseVal = G.join(" ")
    }, u = function (E, D) {
        r(E, true, D)
    }, k = function (E, D) {
        r(E, false, D)
    };
    jsPlumbUtil.svg = {addClass: u, removeClass: k, node: f, attr: g, pos: n};
    var s = function (H) {
        var D = this, G = H.pointerEventsSpec || "all";
        jsPlumb.jsPlumbUIComponent.apply(this, H.originalArgs);
        D.canvas = null, D.path = null, D.svg = null;
        var F = H.cssClass + " " + (H.originalArgs[0].cssClass || ""), I = {style: "", width: 0, height: 0, "pointer-events": G, position: "absolute"};
        if (D.tooltip) {
            I.title = D.tooltip
        }
        D.svg = f("svg", I);
        if (H.useDivWrapper) {
            D.canvas = document.createElement("div");
            D.canvas.style.position = "absolute";
            jsPlumb.sizeCanvas(D.canvas, 0, 0, 1, 1);
            D.canvas.className = F;
            if (D.tooltip) {
                D.canvas.setAttribute("title", D.tooltip)
            }
        } else {
            g(D.svg, {"class": F});
            D.canvas = D.svg
        }
        H._jsPlumb.appendElement(D.canvas, H.originalArgs[0]["parent"]);
        if (H.useDivWrapper) {
            D.canvas.appendChild(D.svg)
        }
        var E = [D.canvas];
        this.getDisplayElements = function () {
            return E
        };
        this.appendDisplayElement = function (J) {
            E.push(J)
        };
        this.paint = function (M, L, K) {
            if (L != null) {
                var J = M[0], N = M[1];
                if (H.useDivWrapper) {
                    jsPlumb.sizeCanvas(D.canvas, M[0], M[1], M[2], M[3]);
                    J = 0, N = 0
                }
                g(D.svg, {style: n([J, N, M[2], M[3]]), width: M[2], height: M[3]});
                D._paint.apply(this, arguments)
            }
        }
    };
    var d = jsPlumb.SvgConnector = function (E) {
        var D = this;
        s.apply(this, [
            {cssClass: E._jsPlumb.connectorClass, originalArgs: arguments, pointerEventsSpec: "none", tooltip: E.tooltip, _jsPlumb: E._jsPlumb}
        ]);
        this._paint = function (L, H) {
            var K = D.getPath(L), F = {d: K}, J = null;
            F["pointer-events"] = "all";
            if (H.outlineColor) {
                var I = H.outlineWidth || 1, G = H.lineWidth + (2 * I), J = jsPlumb.CurrentLibrary.extend({}, H);
                J.strokeStyle = jsPlumbUtil.convertStyle(H.outlineColor);
                J.lineWidth = G;
                if (D.bgPath == null) {
                    D.bgPath = f("path", F);
                    D.svg.appendChild(D.bgPath);
                    D.attachListeners(D.bgPath, D)
                } else {
                    g(D.bgPath, F)
                }
                x(D.svg, D.bgPath, J, L, D)
            }
            if (D.path == null) {
                D.path = f("path", F);
                D.svg.appendChild(D.path);
                D.attachListeners(D.path, D)
            } else {
                g(D.path, F)
            }
            x(D.svg, D.path, H, L, D)
        };
        this.reattachListeners = function () {
            if (D.bgPath) {
                D.reattachListenersForElement(D.bgPath, D)
            }
            if (D.path) {
                D.reattachListenersForElement(D.path, D)
            }
        }
    };
    jsPlumb.Connectors.svg.Bezier = function (D) {
        jsPlumb.Connectors.Bezier.apply(this, arguments);
        d.apply(this, arguments);
        this.getPath = function (F) {
            var E = "M " + F[4] + " " + F[5];
            E += (" C " + F[8] + " " + F[9] + " " + F[10] + " " + F[11] + " " + F[6] + " " + F[7]);
            return E
        }
    };
    jsPlumb.Connectors.svg.Straight = function (D) {
        jsPlumb.Connectors.Straight.apply(this, arguments);
        d.apply(this, arguments);
        this.getPath = function (E) {
            return"M " + E[4] + " " + E[5] + " L " + E[6] + " " + E[7]
        }
    };
    jsPlumb.Connectors.svg.Flowchart = function () {
        var D = this;
        jsPlumb.Connectors.Flowchart.apply(this, arguments);
        d.apply(this, arguments);
        this.getPath = function (F) {
            var G = "M " + F[4] + "," + F[5];
            for (var E = 0; E < F[8]; E++) {
                G = G + " L " + F[9 + (E * 2)] + " " + F[10 + (E * 2)]
            }
            G = G + " " + F[6] + "," + F[7];
            return G
        }
    };
    var y = window.SvgEndpoint = function (E) {
        var D = this;
        s.apply(this, [
            {cssClass: E._jsPlumb.endpointClass, originalArgs: arguments, pointerEventsSpec: "all", useDivWrapper: true, _jsPlumb: E._jsPlumb}
        ]);
        this._paint = function (H, G) {
            var F = jsPlumb.extend({}, G);
            if (F.outlineColor) {
                F.strokeWidth = F.outlineWidth;
                F.strokeStyle = jsPlumbUtil.convertStyle(F.outlineColor, true)
            }
            if (D.node == null) {
                D.node = D.makeNode(H, F);
                D.svg.appendChild(D.node);
                D.attachListeners(D.node, D)
            }
            x(D.svg, D.node, F, H, D);
            n(D.node, H)
        };
        this.reattachListeners = function () {
            if (D.node) {
                D.reattachListenersForElement(D.node, D)
            }
        }
    };
    jsPlumb.Endpoints.svg.Dot = function () {
        jsPlumb.Endpoints.Dot.apply(this, arguments);
        y.apply(this, arguments);
        this.makeNode = function (E, D) {
            return f("circle", {cx: E[2] / 2, cy: E[3] / 2, r: E[2] / 2})
        }
    };
    jsPlumb.Endpoints.svg.Rectangle = function () {
        jsPlumb.Endpoints.Rectangle.apply(this, arguments);
        y.apply(this, arguments);
        this.makeNode = function (E, D) {
            return f("rect", {width: E[2], height: E[3]})
        }
    };
    jsPlumb.Endpoints.svg.Image = jsPlumb.Endpoints.Image;
    jsPlumb.Endpoints.svg.Blank = jsPlumb.Endpoints.Blank;
    jsPlumb.Overlays.svg.Label = jsPlumb.Overlays.Label;
    var p = function (H, F) {
        H.apply(this, F);
        jsPlumb.jsPlumbUIComponent.apply(this, F);
        this.isAppendedAtTopLevel = false;
        var D = this, G = null;
        this.paint = function (J, M, I, N, K) {
            if (G == null) {
                G = f("path", {"pointer-events": "all"});
                J.svg.appendChild(G);
                D.attachListeners(G, J);
                D.attachListeners(G, D)
            }
            var L = F && (F.length == 1) ? (F[0].cssClass || "") : "";
            g(G, {d: E(M), "class": L, stroke: N ? N : null, fill: K ? K : null})
        };
        var E = function (I) {
            return"M" + I.hxy.x + "," + I.hxy.y + " L" + I.tail[0].x + "," + I.tail[0].y + " L" + I.cxy.x + "," + I.cxy.y + " L" + I.tail[1].x + "," + I.tail[1].y + " L" + I.hxy.x + "," + I.hxy.y
        };
        this.reattachListeners = function () {
            if (G) {
                D.reattachListenersForElement(G, D)
            }
        };
        this.cleanup = function () {
            if (G != null) {
                jsPlumb.CurrentLibrary.removeElement(G)
            }
        }
    };
    jsPlumb.Overlays.svg.Arrow = function () {
        p.apply(this, [jsPlumb.Overlays.Arrow, arguments])
    };
    jsPlumb.Overlays.svg.PlainArrow = function () {
        p.apply(this, [jsPlumb.Overlays.PlainArrow, arguments])
    };
    jsPlumb.Overlays.svg.Diamond = function () {
        p.apply(this, [jsPlumb.Overlays.Diamond, arguments])
    };
    jsPlumb.Overlays.svg.GuideLines = function () {
        var I = null, D = this, H = null, G, F;
        jsPlumb.Overlays.GuideLines.apply(this, arguments);
        this.paint = function (K, M, J, N, L) {
            if (I == null) {
                I = f("path");
                K.svg.appendChild(I);
                D.attachListeners(I, K);
                D.attachListeners(I, D);
                G = f("path");
                K.svg.appendChild(G);
                D.attachListeners(G, K);
                D.attachListeners(G, D);
                F = f("path");
                K.svg.appendChild(F);
                D.attachListeners(F, K);
                D.attachListeners(F, D)
            }
            g(I, {d: E(M[0], M[1]), stroke: "red", fill: null});
            g(G, {d: E(M[2][0], M[2][1]), stroke: "blue", fill: null});
            g(F, {d: E(M[3][0], M[3][1]), stroke: "green", fill: null})
        };
        var E = function (K, J) {
            return"M " + K.x + "," + K.y + " L" + J.x + "," + J.y
        }
    }
})();
(function () {
    var d = null, i = function (p, o) {
        return jsPlumb.CurrentLibrary.hasClass(a(p), o)
    }, a = function (o) {
        return jsPlumb.CurrentLibrary.getElementObject(o)
    }, m = function (o) {
        return jsPlumb.CurrentLibrary.getOffset(a(o))
    }, n = function (o) {
        return jsPlumb.CurrentLibrary.getPageXY(o)
    }, f = function (o) {
        return jsPlumb.CurrentLibrary.getClientXY(o)
    };
    var k = function () {
        var q = this;
        q.overlayPlacements = [];
        jsPlumb.jsPlumbUIComponent.apply(this, arguments);
        jsPlumbUtil.EventGenerator.apply(this, arguments);
        this._over = function (z) {
            var B = m(a(q.canvas)), D = n(z), u = D[0] - B.left, C = D[1] - B.top;
            if (u > 0 && C > 0 && u < q.canvas.width && C < q.canvas.height) {
                for (var v = 0; v < q.overlayPlacements.length; v++) {
                    var w = q.overlayPlacements[v];
                    if (w && (w[0] <= u && w[1] >= u && w[2] <= C && w[3] >= C)) {
                        return true
                    }
                }
                var A = q.canvas.getContext("2d").getImageData(parseInt(u), parseInt(C), 1, 1);
                return A.data[0] != 0 || A.data[1] != 0 || A.data[2] != 0 || A.data[3] != 0
            }
            return false
        };
        var p = false, o = false, t = null, s = false, r = function (v, u) {
            return v != null && i(v, u)
        };
        this.mousemove = function (x) {
            var z = n(x), w = f(x), v = document.elementFromPoint(w[0], w[1]), y = r(v, "_jsPlumb_overlay");
            var u = d == null && (r(v, "_jsPlumb_endpoint") || r(v, "_jsPlumb_connector"));
            if (!p && u && q._over(x)) {
                p = true;
                q.fire("mouseenter", q, x);
                return true
            } else {
                if (p && (!q._over(x) || !u) && !y) {
                    p = false;
                    q.fire("mouseexit", q, x)
                }
            }
            q.fire("mousemove", q, x)
        };
        this.click = function (u) {
            if (p && q._over(u) && !s) {
                q.fire("click", q, u)
            }
            s = false
        };
        this.dblclick = function (u) {
            if (p && q._over(u) && !s) {
                q.fire("dblclick", q, u)
            }
            s = false
        };
        this.mousedown = function (u) {
            if (q._over(u) && !o) {
                o = true;
                t = m(a(q.canvas));
                q.fire("mousedown", q, u)
            }
        };
        this.mouseup = function (u) {
            o = false;
            q.fire("mouseup", q, u)
        };
        this.contextmenu = function (u) {
            if (p && q._over(u) && !s) {
                q.fire("contextmenu", q, u)
            }
            s = false
        }
    };
    var c = function (p) {
        var o = document.createElement("canvas");
        p._jsPlumb.appendElement(o, p.parent);
        o.style.position = "absolute";
        if (p["class"]) {
            o.className = p["class"]
        }
        p._jsPlumb.getId(o, p.uuid);
        if (p.tooltip) {
            o.setAttribute("title", p.tooltip)
        }
        return o
    };
    var l = function (p) {
        k.apply(this, arguments);
        var o = [];
        this.getDisplayElements = function () {
            return o
        };
        this.appendDisplayElement = function (q) {
            o.push(q)
        }
    };
    var h = jsPlumb.CanvasConnector = function (r) {
        l.apply(this, arguments);
        var o = function (v, t) {
            p.ctx.save();
            jsPlumb.extend(p.ctx, t);
            if (t.gradient) {
                var u = p.createGradient(v, p.ctx);
                for (var s = 0; s < t.gradient.stops.length; s++) {
                    u.addColorStop(t.gradient.stops[s][0], t.gradient.stops[s][1])
                }
                p.ctx.strokeStyle = u
            }
            p._paint(v, t);
            p.ctx.restore()
        };
        var p = this, q = p._jsPlumb.connectorClass + " " + (r.cssClass || "");
        p.canvas = c({"class": q, _jsPlumb: p._jsPlumb, parent: r.parent, tooltip: r.tooltip});
        p.ctx = p.canvas.getContext("2d");
        p.appendDisplayElement(p.canvas);
        p.paint = function (w, t) {
            if (t != null) {
                jsPlumb.sizeCanvas(p.canvas, w[0], w[1], w[2], w[3]);
                if (t.outlineColor != null) {
                    var v = t.outlineWidth || 1, s = t.lineWidth + (2 * v), u = {strokeStyle: t.outlineColor, lineWidth: s};
                    o(w, u)
                }
                o(w, t)
            }
        }
    };
    var b = function (r) {
        var p = this;
        l.apply(this, arguments);
        var q = p._jsPlumb.endpointClass + " " + (r.cssClass || ""), o = {"class": q, _jsPlumb: p._jsPlumb, parent: r.parent, tooltip: p.tooltip};
        p.canvas = c(o);
        p.ctx = p.canvas.getContext("2d");
        p.appendDisplayElement(p.canvas);
        this.paint = function (x, u, s) {
            jsPlumb.sizeCanvas(p.canvas, x[0], x[1], x[2], x[3]);
            if (u.outlineColor != null) {
                var w = u.outlineWidth || 1, t = u.lineWidth + (2 * w);
                var v = {strokeStyle: u.outlineColor, lineWidth: t}
            }
            p._paint.apply(this, arguments)
        }
    };
    jsPlumb.Endpoints.canvas.Dot = function (r) {
        jsPlumb.Endpoints.Dot.apply(this, arguments);
        b.apply(this, arguments);
        var q = this, p = function (s) {
            try {
                return parseInt(s)
            } catch (t) {
                if (s.substring(s.length - 1) == "%") {
                    return parseInt(s.substring(0, s - 1))
                }
            }
        }, o = function (u) {
            var s = q.defaultOffset, t = q.defaultInnerRadius;
            u.offset && (s = p(u.offset));
            u.innerRadius && (t = p(u.innerRadius));
            return[s, t]
        };
        this._paint = function (A, t, x) {
            if (t != null) {
                var B = q.canvas.getContext("2d"), u = x.getOrientation(q);
                jsPlumb.extend(B, t);
                if (t.gradient) {
                    var v = o(t.gradient), y = u[1] == 1 ? v[0] * -1 : v[0], s = u[0] == 1 ? v[0] * -1 : v[0], z = B.createRadialGradient(A[4], A[4], A[4], A[4] + s, A[4] + y, v[1]);
                    for (var w = 0; w < t.gradient.stops.length; w++) {
                        z.addColorStop(t.gradient.stops[w][0], t.gradient.stops[w][1])
                    }
                    B.fillStyle = z
                }
                B.beginPath();
                B.arc(A[4], A[4], A[4], 0, Math.PI * 2, true);
                B.closePath();
                if (t.fillStyle || t.gradient) {
                    B.fill()
                }
                if (t.strokeStyle) {
                    B.stroke()
                }
            }
        }
    };
    jsPlumb.Endpoints.canvas.Rectangle = function (p) {
        var o = this;
        jsPlumb.Endpoints.Rectangle.apply(this, arguments);
        b.apply(this, arguments);
        this._paint = function (x, r, v) {
            var A = o.canvas.getContext("2d"), t = v.getOrientation(o);
            jsPlumb.extend(A, r);
            if (r.gradient) {
                var z = t[1] == 1 ? x[3] : t[1] == 0 ? x[3] / 2 : 0;
                var y = t[1] == -1 ? x[3] : t[1] == 0 ? x[3] / 2 : 0;
                var s = t[0] == 1 ? x[2] : t[0] == 0 ? x[2] / 2 : 0;
                var q = t[0] == -1 ? x[2] : t[0] == 0 ? x[2] / 2 : 0;
                var w = A.createLinearGradient(s, z, q, y);
                for (var u = 0; u < r.gradient.stops.length; u++) {
                    w.addColorStop(r.gradient.stops[u][0], r.gradient.stops[u][1])
                }
                A.fillStyle = w
            }
            A.beginPath();
            A.rect(0, 0, x[2], x[3]);
            A.closePath();
            if (r.fillStyle || r.gradient) {
                A.fill()
            }
            if (r.strokeStyle) {
                A.stroke()
            }
        }
    };
    jsPlumb.Endpoints.canvas.Triangle = function (p) {
        var o = this;
        jsPlumb.Endpoints.Triangle.apply(this, arguments);
        b.apply(this, arguments);
        this._paint = function (z, q, v) {
            var s = z[2], C = z[3], B = z[0], A = z[1], D = o.canvas.getContext("2d"), w = 0, u = 0, t = 0, r = v.getOrientation(o);
            if (r[0] == 1) {
                w = s;
                u = C;
                t = 180
            }
            if (r[1] == -1) {
                w = s;
                t = 90
            }
            if (r[1] == 1) {
                u = C;
                t = -90
            }
            D.fillStyle = q.fillStyle;
            D.translate(w, u);
            D.rotate(t * Math.PI / 180);
            D.beginPath();
            D.moveTo(0, 0);
            D.lineTo(s / 2, C / 2);
            D.lineTo(0, C);
            D.closePath();
            if (q.fillStyle || q.gradient) {
                D.fill()
            }
            if (q.strokeStyle) {
                D.stroke()
            }
        }
    };
    jsPlumb.Endpoints.canvas.Image = jsPlumb.Endpoints.Image;
    jsPlumb.Endpoints.canvas.Blank = jsPlumb.Endpoints.Blank;
    jsPlumb.Connectors.canvas.Bezier = function () {
        var o = this;
        jsPlumb.Connectors.Bezier.apply(this, arguments);
        h.apply(this, arguments);
        this._paint = function (q, p) {
            o.ctx.beginPath();
            o.ctx.moveTo(q[4], q[5]);
            o.ctx.bezierCurveTo(q[8], q[9], q[10], q[11], q[6], q[7]);
            o.ctx.stroke()
        };
        this.createGradient = function (r, p, q) {
            return o.ctx.createLinearGradient(r[6], r[7], r[4], r[5])
        }
    };
    jsPlumb.Connectors.canvas.Straight = function () {
        var p = this, o = [null, [1, -1], [1, 1], [-1, 1], [-1, -1]];
        jsPlumb.Connectors.Straight.apply(this, arguments);
        h.apply(this, arguments);
        this._paint = function (r, t) {
            p.ctx.beginPath();
            if (t.dashstyle && t.dashstyle.split(" ").length == 2) {
                var v = t.dashstyle.split(" ");
                if (v.length != 2) {
                    v = [2, 2]
                }
                var C = [v[0] * t.lineWidth, v[1] * t.lineWidth], y = (r[6] - r[4]) / (r[7] - r[5]), G = jsPlumbUtil.segment([r[4], r[5]], [r[6], r[7]]), x = o[G], u = Math.atan(y), z = Math.sqrt(Math.pow(r[6] - r[4], 2) + Math.pow(r[7] - r[5], 2)), B = Math.floor(z / (C[0] + C[1])), w = [r[4], r[5]];
                for (var A = 0; A < B; A++) {
                    p.ctx.moveTo(w[0], w[1]);
                    var q = w[0] + (Math.abs(Math.sin(u) * C[0]) * x[0]), F = w[1] + (Math.abs(Math.cos(u) * C[0]) * x[1]), E = w[0] + (Math.abs(Math.sin(u) * (C[0] + C[1])) * x[0]), D = w[1] + (Math.abs(Math.cos(u) * (C[0] + C[1])) * x[1]);
                    p.ctx.lineTo(q, F);
                    w = [E, D]
                }
                p.ctx.moveTo(w[0], w[1]);
                p.ctx.lineTo(r[6], r[7])
            } else {
                p.ctx.moveTo(r[4], r[5]);
                p.ctx.lineTo(r[6], r[7])
            }
            p.ctx.stroke()
        };
        this.createGradient = function (r, q) {
            return q.createLinearGradient(r[4], r[5], r[6], r[7])
        }
    };
    jsPlumb.Connectors.canvas.Flowchart = function () {
        var o = this;
        jsPlumb.Connectors.Flowchart.apply(this, arguments);
        h.apply(this, arguments);
        this._paint = function (r, q) {
            o.ctx.beginPath();
            o.ctx.moveTo(r[4], r[5]);
            for (var p = 0; p < r[8]; p++) {
                o.ctx.lineTo(r[9 + (p * 2)], r[10 + (p * 2)])
            }
            o.ctx.lineTo(r[6], r[7]);
            o.ctx.stroke()
        };
        this.createGradient = function (q, p) {
            return p.createLinearGradient(q[4], q[5], q[6], q[7])
        }
    };
    jsPlumb.Overlays.canvas.Label = jsPlumb.Overlays.Label;
    var g = function () {
        jsPlumb.jsPlumbUIComponent.apply(this, arguments)
    };
    var e = function (p, o) {
        p.apply(this, o);
        g.apply(this, o);
        this.paint = function (s, u, q, v, t) {
            var r = s.ctx;
            r.lineWidth = q;
            r.beginPath();
            r.moveTo(u.hxy.x, u.hxy.y);
            r.lineTo(u.tail[0].x, u.tail[0].y);
            r.lineTo(u.cxy.x, u.cxy.y);
            r.lineTo(u.tail[1].x, u.tail[1].y);
            r.lineTo(u.hxy.x, u.hxy.y);
            r.closePath();
            if (v) {
                r.strokeStyle = v;
                r.stroke()
            }
            if (t) {
                r.fillStyle = t;
                r.fill()
            }
        }
    };
    jsPlumb.Overlays.canvas.Arrow = function () {
        e.apply(this, [jsPlumb.Overlays.Arrow, arguments])
    };
    jsPlumb.Overlays.canvas.PlainArrow = function () {
        e.apply(this, [jsPlumb.Overlays.PlainArrow, arguments])
    };
    jsPlumb.Overlays.canvas.Diamond = function () {
        e.apply(this, [jsPlumb.Overlays.Diamond, arguments])
    }
})();
(function (a) {
    jsPlumb.CurrentLibrary = {addClass: function (c, b) {
        c = jsPlumb.CurrentLibrary.getElementObject(c);
        try {
            if (c[0].className.constructor == SVGAnimatedString) {
                jsPlumb.util.svg.addClass(c[0], b)
            }
        } catch (d) {
        }
        c.addClass(b)
    }, animate: function (d, c, b) {
        d.animate(c, b)
    }, appendElement: function (c, b) {
        jsPlumb.CurrentLibrary.getElementObject(b).append(c)
    }, ajax: function (b) {
        b = b || {};
        b.type = b.type || "get";
        a.ajax(b)
    }, bind: function (b, c, d) {
        b = jsPlumb.CurrentLibrary.getElementObject(b);
        b.bind(c, d)
    }, dragEvents: {start: "start", stop: "stop", drag: "drag", step: "step", over: "over", out: "out", drop: "drop", complete: "complete"}, extend: function (c, b) {
        return a.extend(c, b)
    }, getAttribute: function (b, c) {
        return b.attr(c)
    }, getClientXY: function (b) {
        return[b.clientX, b.clientY]
    }, getDocumentElement: function () {
        return document
    }, getDragObject: function (b) {
        return b[1].draggable
    }, getDragScope: function (b) {
        return b.draggable("option", "scope")
    }, getDropEvent: function (b) {
        return b[0]
    }, getDropScope: function (b) {
        return b.droppable("option", "scope")
    }, getDOMElement: function (b) {
        if (typeof(b) == "string") {
            return document.getElementById(b)
        } else {
            if (b.context) {
                return b[0]
            } else {
                return b
            }
        }
    }, getElementObject: function (b) {
        return typeof(b) == "string" ? a("#" + b) : a(b)
    }, getOffset: function (b) {
        return b.offset()
    }, getPageXY: function (b) {
        return[b.pageX, b.pageY]
    }, getParent: function (b) {
        return jsPlumb.CurrentLibrary.getElementObject(b).parent()
    }, getScrollLeft: function (b) {
        return b.scrollLeft()
    }, getScrollTop: function (b) {
        return b.scrollTop()
    }, getSelector: function (b) {
        return a(b)
    }, getSize: function (b) {
        return[b.outerWidth(), b.outerHeight()]
    }, getTagName: function (b) {
        var c = jsPlumb.CurrentLibrary.getElementObject(b);
        return c.length > 0 ? c[0].tagName : null
    }, getUIPosition: function (c) {
        if (c.length == 1) {
            ret = {left: c[0].pageX, top: c[0].pageY}
        } else {
            var d = c[1], b = d.offset;
            ret = b || d.absolutePosition
        }
        return ret
    }, hasClass: function (c, b) {
        return c.hasClass(b)
    }, initDraggable: function (c, b, d) {
        b = b || {};
        b.helper = null;
        if (d) {
            b.scope = b.scope || jsPlumb.Defaults.Scope
        }
        c.draggable(b)
    }, initDroppable: function (c, b) {
        b.scope = b.scope || jsPlumb.Defaults.Scope;
        c.droppable(b)
    }, isAlreadyDraggable: function (b) {
        b = jsPlumb.CurrentLibrary.getElementObject(b);
        return b.hasClass("ui-draggable")
    }, isDragSupported: function (c, b) {
        return c.draggable
    }, isDropSupported: function (c, b) {
        return c.droppable
    }, removeClass: function (c, b) {
        c = jsPlumb.CurrentLibrary.getElementObject(c);
        try {
            if (c[0].className.constructor == SVGAnimatedString) {
                jsPlumb.util.svg.removeClass(c[0], b)
            }
        } catch (d) {
        }
        c.removeClass(b)
    }, removeElement: function (b, c) {
        jsPlumb.CurrentLibrary.getElementObject(b).remove()
    }, setAttribute: function (c, d, b) {
        c.attr(d, b)
    }, setDraggable: function (c, b) {
        c.draggable("option", "disabled", !b)
    }, setDragScope: function (c, b) {
        c.draggable("option", "scope", b)
    }, setOffset: function (b, c) {
        jsPlumb.CurrentLibrary.getElementObject(b).offset(c)
    }, trigger: function (d, e, b) {
        var c = jQuery._data(jsPlumb.CurrentLibrary.getElementObject(d)[0], "handle");
        c(b)
    }, unbind: function (b, c, d) {
        b = jsPlumb.CurrentLibrary.getElementObject(b);
        b.unbind(c, d)
    }};
    a(document).ready(jsPlumb.init)
})(jQuery);
(function () {
    if ("undefined" == typeof Math.sgn) {
        Math.sgn = function (l) {
            return 0 == l ? 0 : 0 < l ? 1 : -1
        }
    }
    var d = {subtract: function (m, l) {
        return{x: m.x - l.x, y: m.y - l.y}
    }, dotProduct: function (m, l) {
        return m.x * l.x + m.y * l.y
    }, square: function (l) {
        return Math.sqrt(l.x * l.x + l.y * l.y)
    }, scale: function (m, l) {
        return{x: m.x * l, y: m.y * l}
    }}, f = Math.pow(2, -65), h = function (y, x) {
        for (var t = [], v = x.length - 1, r = 2 * v - 1, s = [], w = [], p = [], q = [], o = [
            [1, 0.6, 0.3, 0.1],
            [0.4, 0.6, 0.6, 0.4],
            [0.1, 0.3, 0.6, 1]
        ], u = 0; u <= v; u++) {
            s[u] = d.subtract(x[u], y)
        }
        for (u = 0; u <= v - 1; u++) {
            w[u] = d.subtract(x[u + 1], x[u]), w[u] = d.scale(w[u], 3)
        }
        for (u = 0; u <= v - 1; u++) {
            for (var l = 0; l <= v; l++) {
                p[u] || (p[u] = []), p[u][l] = d.dotProduct(w[u], s[l])
            }
        }
        for (u = 0; u <= r; u++) {
            q[u] || (q[u] = []), q[u].y = 0, q[u].x = parseFloat(u) / r
        }
        r = v - 1;
        for (s = 0; s <= v + r; s++) {
            u = Math.max(0, s - r);
            for (w = Math.min(s, v); u <= w; u++) {
                j = s - u, q[u + j].y += p[j][u] * o[j][u]
            }
        }
        v = x.length - 1;
        q = b(q, 2 * v - 1, t, 0);
        r = d.subtract(y, x[0]);
        p = d.square(r);
        for (u = o = 0; u < q; u++) {
            r = d.subtract(y, a(x, v, t[u], null, null)), r = d.square(r), r < p && (p = r, o = t[u])
        }
        r = d.subtract(y, x[v]);
        r = d.square(r);
        r < p && (p = r, o = 1);
        return{location: o, distance: p}
    }, b = function (C, B, x, z) {
        var v = [], w = [], A = [], t = [], u = 0, r, y;
        y = Math.sgn(C[0].y);
        for (var q = 1; q <= B; q++) {
            r = Math.sgn(C[q].y), r != y && u++, y = r
        }
        switch (u) {
            case 0:
                return 0;
            case 1:
                if (64 <= z) {
                    return x[0] = (C[0].x + C[B].x) / 2, 1
                }
                var p, u = C[0].y - C[B].y;
                r = C[B].x - C[0].x;
                y = C[0].x * C[B].y - C[B].x * C[0].y;
                q = max_distance_below = 0;
                for (p = 1; p < B; p++) {
                    var s = u * C[p].x + r * C[p].y + y;
                    s > q ? q = s : s < max_distance_below && (max_distance_below = s)
                }
                p = r;
                q = (1 * (y - q) - 0 * p) * (1 / (0 * p - 1 * u));
                p = r;
                u = (1 * (y - max_distance_below) - 0 * p) * (1 / (0 * p - 1 * u));
                r = Math.min(q, u);
                if (Math.max(q, u) - r < f) {
                    return A = C[B].x - C[0].x, t = C[B].y - C[0].y, x[0] = 0 + 1 * (A * (C[0].y - 0) - t * (C[0].x - 0)) * (1 / (0 * A - 1 * t)), 1
                }
        }
        a(C, B, 0.5, v, w);
        C = b(v, B, A, z + 1);
        B = b(w, B, t, z + 1);
        for (z = 0; z < C; z++) {
            x[z] = A[z]
        }
        for (z = 0; z < B; z++) {
            x[z + C] = t[z]
        }
        return C + B
    }, a = function (m, l, p, q, n) {
        for (var o = [
            []
        ], r = 0; r <= l; r++) {
            o[0][r] = m[r]
        }
        for (m = 1; m <= l; m++) {
            for (r = 0; r <= l - m; r++) {
                o[m] || (o[m] = []), o[m][r] || (o[m][r] = {}), o[m][r].x = (1 - p) * o[m - 1][r].x + p * o[m - 1][r + 1].x, o[m][r].y = (1 - p) * o[m - 1][r].y + p * o[m - 1][r + 1].y
            }
        }
        if (null != q) {
            for (r = 0; r <= l; r++) {
                q[r] = o[r][0]
            }
        }
        if (null != n) {
            for (r = 0; r <= l; r++) {
                n[r] = o[l - r][r]
            }
        }
        return o[l][0]
    }, g = {}, e = function (t) {
        var s = g[t];
        if (!s) {
            var s = [], p = function (u) {
                return function () {
                    return u
                }
            }, q = function () {
                return function (u) {
                    return u
                }
            }, n = function () {
                return function (u) {
                    return 1 - u
                }
            }, o = function (u) {
                return function (v) {
                    for (var x = 1, w = 0; w < u.length; w++) {
                        x *= u[w](v)
                    }
                    return x
                }
            };
            s.push(new function () {
                return function (u) {
                    return Math.pow(u, t)
                }
            });
            for (var r = 1; r < t; r++) {
                for (var l = [new p(t)], m = 0; m < t - r; m++) {
                    l.push(new q)
                }
                for (m = 0; m < r; m++) {
                    l.push(new n)
                }
                s.push(new o(l))
            }
            s.push(new function () {
                return function (u) {
                    return Math.pow(1 - u, t)
                }
            });
            g[t] = s
        }
        return s
    }, c = function (m, l) {
        for (var p = e(m.length - 1), q = 0, n = 0, o = 0; o < m.length; o++) {
            q += m[o].x * p[o](l), n += m[o].y * p[o](l)
        }
        return{x: q, y: n}
    }, k = function (m, l, p) {
        for (var q = c(m, l), n = 0, o = 0 < p ? 1 : -1, r = null; n < Math.abs(p);) {
            l += 0.005 * o, r = c(m, l), n += Math.sqrt(Math.pow(r.x - q.x, 2) + Math.pow(r.y - q.y, 2)), q = r
        }
        return{point: r, location: l}
    }, i = function (m, l) {
        var o = c(m, l), p = c(m.slice(0, m.length - 1), l), n = p.y - o.y, o = p.x - o.x;
        return 0 == n ? Infinity : Math.atan(n / o)
    };
    window.jsBezier = {distanceFromCurve: h, gradientAtPoint: i, gradientAtPointAlongCurveFrom: function (m, l, n) {
        l = k(m, l, n);
        if (1 < l.location) {
            l.location = 1
        }
        if (0 > l.location) {
            l.location = 0
        }
        return i(m, l.location)
    }, nearestPointOnCurve: function (m, l) {
        var n = h(m, l);
        return{point: a(l, l.length - 1, n.location, null, null), location: n.location}
    }, pointOnCurve: c, pointAlongCurveFrom: function (m, l, n) {
        return k(m, l, n).point
    }, perpendicularToCurveAt: function (m, l, n, o) {
        l = k(m, l, null == o ? 0 : o);
        m = i(m, l.location);
        o = Math.atan(-1 / m);
        m = n / 2 * Math.sin(o);
        n = n / 2 * Math.cos(o);
        return[
            {x: l.point.x + n, y: l.point.y + m},
            {x: l.point.x - n, y: l.point.y - m}
        ]
    }}
})();
var arrowCommon = {foldback: 0.7, fillStyle: "#F78181", width: 8};
var overlays = [
    ["Arrow", {location: 0.7}, arrowCommon]
];
function getConnectionOverlayLabel() {
    return{connector: ["Flowchart", {stub: 20}], overlays: overlays, anchors: ["TopCenter"]};
};
function sourceEndpointOptions() {
    return{isSource: true, connectorStyle: {strokeStyle: "#F78181"}, anchor: [0.5, 1, 0, 1], connector: ["StateMachine", {curviness: 20, proximityLimit: 200, margin: 10, loopbackRadius: 40}], isTarget: false, uniqueEndpoint: true};
};
function jsPlumbInitializeDefault() {
    jsPlumb.importDefaults({PaintStyle: {strokeStyle: "#F78181", lineWidth: 2}, Endpoint: ["Dot", {radius: 4}]});
};
function displayGraph(data, divContainerTargetId) {
    jQuery.each(data['nodes'], function () {
        var node = '<div class="node" id="' + this.id + '">' + this.title
            + '</div>';
        var x = (this.x - 100) <= 10 ? this.x : (this.x - 100);
        jQuery(node).appendTo('#' + divContainerTargetId).css('left', x).css('top', this.y).addClass('node_' + this.state);
        jsPlumb.makeSource(this.id, sourceEndpointOptions());
    });
    jQuery.each(data['transitions'], function () {
        jsPlumb.connect({source: this.nodeSourceId, target: this.nodeTargetId}, getConnectionOverlayLabel());
    });
};
function invokeGetGraphOp(routeId, currentLang, divContainerTargetId) {
    var ctx = {};
    var getGraphNodesExec = jQuery().automation('Document.Routing.GetGraph');
    getGraphNodesExec.setContext(ctx);
    getGraphNodesExec.addParameter("routeDocId", routeId);
    getGraphNodesExec.addParameter("language", currentLang);
    getGraphNodesExec.executeGetBlob(function (data, status, xhr) {
        displayGraph(data, divContainerTargetId);
    }, function (xhr, status, errorMessage) {
        jQuery('<div>Can not load graph </div>').appendTo('#' + divContainerTargetId);
    }, true);
};
function loadGraph(routeDocId, currentLang, divContainerTargetId) {
    jsPlumbInitializeDefault();
    invokeGetGraphOp(routeDocId, currentLang, divContainerTargetId);
};