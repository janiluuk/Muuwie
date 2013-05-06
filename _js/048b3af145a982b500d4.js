MooTools.More = {
    version: "1.4.0.1",
    build: "a4244edf2aa97ac8a196fc96082dd35af1abab87"
};
Class.Mutators.Binds = function (a) {
    this.prototype.initialize || this.implement("initialize", function () {});
    return Array.from(a).concat(this.prototype.Binds || [])
};
Class.Mutators.initialize = function (a) {
    return function () {
        Array.from(this.Binds).each(function (a) {
            var b = this[a];
            b && (this[a] = b.bind(this))
        }, this);
        return a.apply(this, arguments)
    }
};
(function () {
    var a = function (b, c) {
        var a = [];
        Object.each(c, function (c) {
            Object.each(c, function (c) {
                b.each(function (b) {
                    a.push(b + "-" + c + (b == "border" ? "-width" : ""))
                })
            })
        });
        return a
    }, d = function (b, c) {
        var a = 0;
        Object.each(c, function (c, d) {
            d.test(b) && (a += c.toInt())
        });
        return a
    };
    Element.implement({
        measure: function (b) {
            if (!this || this.offsetHeight || this.offsetWidth) return b.call(this);
            for (var c = this.getParent(), a = []; c && !c.offsetHeight && !c.offsetWidth && c != document.body;) a.push(c.expose()), c = c.getParent();
            c = this.expose();
            b = b.call(this);
            c();
            a.each(function (b) {
                b()
            });
            return b
        },
        expose: function () {
            if (this.getStyle("display") != "none") return function () {};
            var b = this.style.cssText;
            this.setStyles({
                display: "block",
                position: "absolute",
                visibility: "hidden"
            });
            return function () {
                this.style.cssText = b
            }.bind(this)
        },
        getDimensions: function (b) {
            var b = Object.merge({
                computeSize: !1
            }, b),
                a = {
                    x: 0,
                    y: 0
                }, d = this.getParent("body");
            if (d && this.getStyle("display") == "none") a = this.measure(function () {
                return b.computeSize ? this.getComputedSize(b) : this.getSize()
            });
            else if (d) try {
                a = b.computeSize ? this.getComputedSize(b) : this.getSize()
            } catch (e) {}
            return Object.append(a, a.x || a.x === 0 ? {
                width: a.x,
                height: a.y
            } : {
                x: a.width,
                y: a.height
            })
        },
        getComputedSize: function (b) {
            var b = Object.merge({
                styles: ["padding", "border"],
                planes: {
                    height: ["top", "bottom"],
                    width: ["left", "right"]
                },
                mode: "both"
            }, b),
                c = {}, g = {
                    width: 0,
                    height: 0
                }, e;
            b.mode == "vertical" ? (delete g.width, delete b.planes.width) : b.mode == "horizontal" && (delete g.height, delete b.planes.height);
            a(b.styles, b.planes).each(function (b) {
                c[b] = this.getStyle(b).toInt()
            }, this);
            Object.each(b.planes, function (b, a) {
                var f;
                var j = a.capitalize(),
                    i = this.getStyle(a);
                i == "auto" && !e && (e = this.getDimensions());
                f = c[a] = i == "auto" ? e[a] : i.toInt(), i = f;
                g["total" + j] = i;
                b.each(function (b) {
                    var a = d(b, c);
                    g["computed" + b.capitalize()] = a;
                    g["total" + j] += a
                })
            }, this);
            return Object.append(g, c)
        }
    })
})();
(function () {
    Fx.Scroll = new Class({
        Extends: Fx,
        options: {
            offset: {
                x: 0,
                y: 0
            },
            wheelStops: !0
        },
        initialize: function (a, d) {
            this.element = this.subject = document.id(a);
            this.parent(d);
            if (typeOf(this.element) != "element") this.element = document.id(this.element.getDocument().body);
            if (this.options.wheelStops) {
                var b = this.element,
                    c = this.cancel.pass(!1, this);
                this.addEvent("start", function () {
                    b.addEvent("mousewheel", c)
                }, !0);
                this.addEvent("complete", function () {
                    b.removeEvent("mousewheel", c)
                }, !0)
            }
        },
        set: function () {
            var a = Array.flatten(arguments);
            Browser.firefox && (a = [Math.round(a[0]), Math.round(a[1])]);
            this.element.scrollTo(a[0], a[1]);
            return this
        },
        compute: function (a, d, b) {
            return [0, 1].map(function (c) {
                return Fx.compute(a[c], d[c], b)
            })
        },
        start: function (a, d) {
            if (!this.check(a, d)) return this;
            var b = this.element.getScroll();
            return this.parent([b.x, b.y], [a, d])
        },
        calculateScroll: function (a, d) {
            var b = this.element,
                c = b.getScrollSize(),
                g = b.getScroll(),
                b = b.getSize(),
                e = this.options.offset,
                f = {
                    x: a,
                    y: d
                }, h;
            for (h in f)!f[h] && f[h] !== 0 && (f[h] = g[h]), typeOf(f[h]) != "number" && (f[h] = c[h] - b[h]), f[h] += e[h];
            return [f.x, f.y]
        },
        toTop: function () {
            return this.start.apply(this, this.calculateScroll(!1, 0))
        },
        toLeft: function () {
            return this.start.apply(this, this.calculateScroll(0, !1))
        },
        toRight: function () {
            return this.start.apply(this, this.calculateScroll("right", !1))
        },
        toBottom: function () {
            return this.start.apply(this, this.calculateScroll(!1, "bottom"))
        },
        toElement: function (a, d) {
            var d = d ? Array.from(d) : ["x", "y"],
                b = /^(?:body|html)$/i.test(this.element.tagName) ? {
                    x: 0,
                    y: 0
                } : this.element.getScroll(),
                c = Object.map(document.id(a).getPosition(this.element), function (a, c) {
                    return d.contains(c) ? a + b[c] : !1
                });
            return this.start.apply(this, this.calculateScroll(c.x, c.y))
        },
        toElementEdge: function (a, d, b) {
            var d = d ? Array.from(d) : ["x", "y"],
                a = document.id(a),
                c = {}, g = a.getPosition(this.element),
                a = a.getSize(),
                e = this.element.getScroll(),
                f = this.element.getSize(),
                h = {
                    x: g.x + a.x,
                    y: g.y + a.y
                };
            ["x", "y"].each(function (a) {
                d.contains(a) && (h[a] > e[a] + f[a] && (c[a] = h[a] - f[a]), g[a] < e[a] && (c[a] = g[a]));
                c[a] == null && (c[a] = e[a]);
                b && b[a] && (c[a] += b[a /**/ ])
            }, this);
            (c.x != e.x || c.y != e.y) && this.start(c.x, c.y);
            return this
        },
        toElementCenter: function (a, d, b) {
            var d = d ? Array.from(d) : ["x", "y"],
                a = document.id(a),
                c = {}, g = a.getPosition(this.element),
                e = a.getSize(),
                f = this.element.getScroll(),
                h = this.element.getSize();
            ["x", "y"].each(function (a) {
                d.contains(a) && (c[a] = g[a] - (h[a] - e[a]) / 2);
                c[a] == null && (c[a] = f[a]);
                b && b[a] && (c[a] += b[a])
            }, this);
            (c.x != f.x || c.y != f.y) && this.start(c.x, c.y);
            return this
        }
    })
})();
var Drag = new Class({
    Implements: [Events, Options],
    options: {
        snap: 6,
        unit: "px",
        grid: !1,
        style: !0,
        limit: !1,
        handle: !1,
        invert: !1,
        preventDefault: !1,
        stopPropagation: !1,
        modifiers: {
            x: "left",
            y: "top"
        }
    },
    initialize: function () {
        var a = Array.link(arguments, {
            options: Type.isObject,
            element: function (a) {
                return a != null
            }
        });
        this.element = document.id(a.element);
        this.document = this.element.getDocument();
        this.setOptions(a.options || {});
        a = typeOf(this.options.handle);
        this.handles = (a == "array" || a == "collection" ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
        this.mouse = {
            now: {},
            pos: {}
        };
        this.value = {
            start: {},
            now: {}
        };
        this.selection = Browser.ie ? "selectstart" : "mousedown";
        if (Browser.ie && !Drag.ondragstartFixed) document.ondragstart = Function.from(!1), Drag.ondragstartFixed = !0;
        this.bound = {
            start: this.start.bind(this),
            check: this.check.bind(this),
            drag: this.drag.bind(this),
            stop: this.stop.bind(this),
            cancel: this.cancel.bind(this),
            eventStop: Function.from(!1)
        };
        this.attach()
    },
    attach: function () {
        this.handles.addEvent("mousedown",
        this.bound.start);
        return this
    },
    detach: function () {
        this.handles.removeEvent("mousedown", this.bound.start);
        return this
    },
    start: function (a) {
        var d = this.options;
        if (!a.rightClick) {
            d.preventDefault && a.preventDefault();
            d.stopPropagation && a.stopPropagation();
            this.mouse.start = a.page;
            this.fireEvent("beforeStart", this.element);
            var b = d.limit;
            this.limit = {
                x: [],
                y: []
            };
            var c, g;
            for (c in d.modifiers) if (d.modifiers[c]) {
                var e = this.element.getStyle(d.modifiers[c]);
                e && !e.match(/px$/) && (g || (g = this.element.getCoordinates(this.element.getOffsetParent())),
                e = g[d.modifiers[c]]);
                this.value.now[c] = d.style ? (e || 0).toInt() : this.element[d.modifiers[c]];
                d.invert && (this.value.now[c] *= -1);
                this.mouse.pos[c] = a.page[c] - this.value.now[c];
                if (b && b[c]) for (e = 2; e--;) {
                    var f = b[c][e];
                    if (f || f === 0) this.limit[c][e] = typeof f == "function" ? f() : f
                }
            }
            if (typeOf(this.options.grid) == "number") this.options.grid = {
                x: this.options.grid,
                y: this.options.grid
            };
            a = {
                mousemove: this.bound.check,
                mouseup: this.bound.cancel
            };
            a[this.selection] = this.bound.eventStop;
            this.document.addEvents(a)
        }
    },
    check: function (a) {
        this.options.preventDefault && a.preventDefault();
        Math.round(Math.sqrt(Math.pow(a.page.x - this.mouse.start.x, 2) + Math.pow(a.page.y - this.mouse.start.y, 2))) > this.options.snap && (this.cancel(), this.document.addEvents({
            mousemove: this.bound.drag,
            mouseup: this.bound.stop
        }), this.fireEvent("start", [this.element, a]).fireEvent("snap", this.element))
    },
    drag: function (a) {
        var d = this.options;
        d.preventDefault && a.preventDefault();
        this.mouse.now = a.page;
        for (var b in d.modifiers) if (d.modifiers[b]) {
            this.value.now[b] = this.mouse.now[b] - this.mouse.pos[b];
            d.invert && (this.value.now[b] *= -1);
            if (d.limit && this.limit[b]) if ((this.limit[b][1] || this.limit[b][1] === 0) && this.value.now[b] > this.limit[b][1]) this.value.now[b] = this.limit[b][1];
            else if ((this.limit[b][0] || this.limit[b][0] === 0) && this.value.now[b] < this.limit[b][0]) this.value.now[b] = this.limit[b][0];
            d.grid[b] && (this.value.now[b] -= (this.value.now[b] - (this.limit[b][0] || 0)) % d.grid[b]);
            d.style ? this.element.setStyle(d.modifiers[b], this.value.now[b] + d.unit) : this.element[d.modifiers[b]] = this.value.now[b]
        }
        this.fireEvent("drag", [this.element, a])
    },
    cancel: function (a) {
        this.document.removeEvents({
            mousemove: this.bound.check,
            mouseup: this.bound.cancel
        });
        a && (this.document.removeEvent(this.selection, this.bound.eventStop), this.fireEvent("cancel", this.element))
    },
    stop: function (a) {
        var d = {
            mousemove: this.bound.drag,
            mouseup: this.bound.stop
        };
        d[this.selection] = this.bound.eventStop;
        this.document.removeEvents(d);
        a && this.fireEvent("complete", [this.element, a])
    }
});
Element.implement({
    makeResizable: function (a) {
        var d = new Drag(this, Object.merge({
            modifiers: {
                x: "width",
                y: "height"
            }
        }, a));
        this.store("resizer", d);
        return d.addEvent("drag", function () {
            this.fireEvent("resize", d)
        }.bind(this))
    }
});
window.JSON || (window.JSON = {});
(function () {
    function c(b) {
        return b < 10 ? "0" + b : b
    }
    function m(b) {
        return f.lastIndex = 0, f.test(b) ? '"' + b.replace(f, function (b) {
            var a = k[b];
            return typeof a == "string" ? a : "\\u" + ("0000" + b.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + b + '"'
    }
    function j(b, g) {
        var a, f, c, k, h = i,
            e, d = g[b];
        d && typeof d == "object" && typeof d.toJSON == "function" && (d = d.toJSON(b));
        typeof n == "function" && (d = n.call(g, b, d));
        switch (typeof d) {
            case "string":
                return m(d);
            case "number":
                return isFinite(d) ? String(d) : "null";
            case "boolean":
            case "null":
                return String(d);
            case "object":
                if (!d) return "null";
                i += o;
                e = [];
                if (Object.prototype.toString.apply(d) === "[object Array]") {
                    k = d.length;
                    for (a = 0; a < k; a += 1) e[a] = j(a, d) || "null";
                    return c = e.length === 0 ? "[]" : i ? "[\n" + i + e.join(",\n" + i) + "\n" + h + "]" : "[" + e.join(",") + "]", i = h, c
                }
                if (n && typeof n == "object") {
                    k = n.length;
                    for (a = 0; a < k; a += 1) f = n[a], typeof f == "string" && (c = j(f, d), c && e.push(m(f) + (i ? ": " : ":") + c))
                } else for (f in d) Object.hasOwnProperty.call(d, f) && (c = j(f, d), c && e.push(m(f) + (i ? ": " : ":") + c));
                return c = e.length === 0 ? "{}" : i ? "{\n" + i + e.join(",\n" + i) + "\n" + h + "}" : "{" + e.join(",") + "}",
                i = h, c
        }
    }
    typeof Date.prototype.toJSON != "function" && (Date.prototype.toJSON = function () {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + c(this.getUTCMonth() + 1) + "-" + c(this.getUTCDate()) + "T" + c(this.getUTCHours()) + ":" + c(this.getUTCMinutes()) + ":" + c(this.getUTCSeconds()) + "Z" : null
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
        return this.valueOf()
    });
    var b = window.JSON,
        g = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        f = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        i, o, k = {
            "\u0008": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\u000c": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, n;
    typeof b.stringify != "function" && (b.stringify = function (b, g, a) {
        var f;
        i = "";
        o = "";
        if (typeof a == "number") for (f = 0; f < a; f += 1) o += " ";
        else typeof a == "string" && (o = a);
        n = g;
        if (!g || typeof g == "function" || typeof g == "object" && typeof g.length == "number") return j("", {
            "": b
        });
        throw Error("JSON.stringify");
    });
    typeof b.parse != "function" && (b.parse = function (b, f) {
        function a(b, g) {
            var h, e, d = b[g];
            if (d && typeof d == "object") for (h in d) Object.hasOwnProperty.call(d, h) && (e = a(d, h), e !== void 0 ? d[h] = e : delete d[h]);
            return f.call(b, g, d)
        }
        var c;
        b = String(b);
        g.lastIndex = 0;
        g.test(b) && (b = b.replace(g, function (a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }));
        if (/^[\],:{}\s]*$/.test(b.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return c = eval("(" + b + ")"), typeof f == "function" ? a({
            "": c
        }, "") : c;
        throw new SyntaxError("JSON.parse");
    })
})();
(function (c, m) {
    var j = c.History = c.History || {}, b = c.Element;
    if (typeof j.Adapter != "undefined") throw Error("History.js Adapter has already been loaded...");
    Object.append(b.NativeEvents, {
        popstate: 2,
        hashchange: 2
    });
    j.Adapter = {
        bind: function (b, f, c) {
            (typeof b == "string" ? document.id(b) : b).addEvent(f, c)
        },
        trigger: function (b, f, c) {
            (typeof b == "string" ? document.id(b) : b).fireEvent(f, c)
        },
        extractEventData: function (b, c) {
            return c && c.event && c.event[b] || c && c[b] || m
        },
        onDomLoad: function (b) {
            c.addEvent("domready", b)
        }
    };
    typeof j.init !=
        "undefined" && j.init()
})(window);
(function (c) {
    var m = c.document,
        j = c.setInterval || j,
        b = c.History = c.History || {};
    if (typeof b.initHtml4 != "undefined") throw Error("History.js HTML4 Support has already been loaded...");
    b.initHtml4 = function () {
        if (typeof b.initHtml4.initialized != "undefined") return !1;
        b.initHtml4.initialized = !0;
        b.enabled = !0;
        b.savedHashes = [];
        b.isLastHash = function (c) {
            var f = b.getHashByIndex(),
                i;
            return i = c === f, i
        };
        b.saveHash = function (c) {
            return b.isLastHash(c) ? !1 : (b.savedHashes.push(c), !0)
        };
        b.getHashByIndex = function (c) {
            var f;
            return typeof c ==
                "undefined" ? f = b.savedHashes[b.savedHashes.length - 1] : c < 0 ? f = b.savedHashes[b.savedHashes.length + c] : f = b.savedHashes[c], null
        };
        b.discardedHashes = {};
        b.discardedStates = {};
        b.discardState = function (c, f, i) {
            var j = b.getHashByState(c),
                k;
            return k = {
                discardedState: c,
                backState: i,
                forwardState: f
            }, b.discardedStates[j] = k, !0
        };
        b.discardHash = function (c, f, i) {
            return b.discardedHashes[c] = {
                discardedHash: c,
                backState: i,
                forwardState: f
            }, !0
        };
        b.discardedState = function (c) {
            var c = b.getHashByState(c),
                f;
            return f = b.discardedStates[c] || !1,
            f
        };
        b.discardedHash = function (c) {
            return b.discardedHashes[c] || !1
        };
        b.recycleState = function (c) {
            var f = b.getHashByState(c);
            return b.discardedState(c) && delete b.discardedStates[f], !0
        };
        b.emulated.hashChange && (b.hashChangeInit = function () {
            b.checkerFunction = null;
            var g = "",
                f, i, o;
            return b.isInternetExplorer() ? (f = m.createElement("iframe"), f.setAttribute("id", "historyjs-iframe"), f.style.display = "none", m.body.appendChild(f), f.contentWindow.document.open(), f.contentWindow.document.close(), i = "", o = !1, b.checkerFunction = function () {
                if (o) return !1;
                o = !0;
                var k = b.getHash() || "",
                    j = b.unescapeHash(f.contentWindow.document.location.hash) || "";
                return k !== g ? (g = k, j !== k && (i = k, f.contentWindow.document.open(), f.contentWindow.document.close(), f.contentWindow.document.location.hash = b.escapeHash(k)), b.Adapter.trigger(c, "hashchange")) : j !== i && (i = j, b.setHash(j, !1)), o = !1, !0
            }) : b.checkerFunction = function () {
                var f = b.getHash();
                return f !== g && (g = f, b.Adapter.trigger(c, "hashchange")), !0
            }, b.intervalList.push(j(b.checkerFunction, b.options.hashChangeInterval)), !0
        }, b.Adapter.onDomLoad(b.hashChangeInit));
        b.emulated.pushState && (b.onHashChange = function (g) {
            var g = b.getHashByUrl(g && g.newURL || m.location.href),
                f = null,
                i;
            return b.isLastHash(g) ? (b.busy(!1), !1) : (b.doubleCheckComplete(), b.saveHash(g), g && b.isTraditionalAnchor(g) ? (b.Adapter.trigger(c, "anchorchange"), b.busy(!1), !1) : (f = b.extractState(b.getFullUrl(g || m.location.href, !1), !0), b.isLastSavedState(f) ? (b.busy(!1), !1) : (b.getHashByState(f), i = b.discardedState(f), i ? (b.getHashByIndex(-2) === b.getHashByState(i.forwardState) ? b.back(!1) : b.forward(!1), !1) : (b.pushState(f.data, f.title, f.url, !1), !0))))
        }, b.Adapter.bind(c, "hashchange", b.onHashChange), b.pushState = function (g, f, i, j) {
            if (b.getHashByUrl(i)) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (j !== !1 && b.busy()) return b.pushQueue({
                scope: b,
                callback: b.pushState,
                args: arguments,
                queue: j
            }), !1;
            b.busy(!0);
            var k = b.createStateObject(g, f, i),
                n = b.getHashByState(k),
                l = b.getState(!1),
                l = b.getHashByState(l),
                q = b.getHash();
            return b.storeState(k),
            b.expectedStateId = k.id, b.recycleState(k), b.setTitle(k), n === l ? (b.busy(!1), !1) : n !== q && n !== b.getShortUrl(m.location.href) ? (b.setHash(n, !1), !1) : (b.saveState(k), b.Adapter.trigger(c, "statechange"), b.busy(!1), !0)
        }, b.replaceState = function (c, f, i, j) {
            if (b.getHashByUrl(i)) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (j !== !1 && b.busy()) return b.pushQueue({
                scope: b,
                callback: b.replaceState,
                args: arguments,
                queue: j
            }), !1;
            b.busy(!0);
            var k = b.createStateObject(c, f, i),
                m = b.getState(!1),
                l = b.getStateByIndex(-2);
            return b.discardState(m, k, l), b.pushState(k.data, k.title, k.url, !1), !0
        });
        b.emulated.pushState && b.getHash() && !b.emulated.hashChange && b.Adapter.onDomLoad(function () {
            b.Adapter.trigger(c, "hashchange")
        })
    };
    typeof b.init != "undefined" && b.init()
})(window);
(function (c, m) {
    var j = c.console || m,
        b = c.document,
        g = c.navigator,
        f = c.sessionStorage || !1,
        i = c.setTimeout,
        o = c.clearTimeout,
        k = c.setInterval,
        n = c.clearInterval,
        l = c.JSON,
        q = c.alert,
        a = c.History = c.History || {}, p = c.history;
    l.stringify = l.stringify || l.encode;
    l.parse = l.parse || l.decode;
    if (typeof a.init != "undefined") throw Error("History.js Core has already been loaded...");
    a.init = function () {
        return typeof a.Adapter == "undefined" ? !1 : (typeof a.initCore != "undefined" && a.initCore(), typeof a.initHtml4 != "undefined" && a.initHtml4(), !0)
    };
    a.initCore = function () {
        if (typeof a.initCore.initialized != "undefined") return !1;
        a.initCore.initialized = !0;
        a.options = a.options || {};
        a.options.hashChangeInterval = a.options.hashChangeInterval || 100;
        a.options.safariPollInterval = a.options.safariPollInterval || 500;
        a.options.doubleCheckInterval = a.options.doubleCheckInterval || 500;
        a.options.storeInterval = a.options.storeInterval || 1E3;
        a.options.busyDelay = a.options.busyDelay || 250;
        a.options.debug = a.options.debug || !1;
        a.options.initialTitle = a.options.initialTitle || b.title;
        a.intervalList = [];
        a.clearAllIntervals = function () {
            var h, b = a.intervalList;
            if (typeof b != "undefined" && b !== null) {
                for (h = 0; h < b.length; h++) n(b[h]);
                a.intervalList = null
            }
        };
        a.debug = function () {
            a.options.debug && a.log.apply(a, arguments)
        };
        a.log = function () {
            var a = typeof j != "undefined" && typeof j.log != "undefined" && typeof j.log.apply != "undefined",
                e = b.getElementById("log"),
                d, c, f, g;
            a ? (c = Array.prototype.slice.call(arguments), d = c.shift(), typeof j.debug != "undefined" ? j.debug.apply(j, [d, c]) : j.log.apply(j, [d, c])) : d = "\n" + arguments[0] + "\n";
            for (c = 1, f = arguments.length; c < f; ++c) {
                g = arguments[c];
                if (typeof g == "object" && typeof l != "undefined") try {
                    g = l.stringify(g)
                } catch (i) {}
                d += "\n" + g + "\n"
            }
            return e ? (e.value += d + "\n-----\n", e.scrollTop = e.scrollHeight - e.clientHeight) : a || q(d), !0
        };
        a.getInternetExplorerMajorVersion = function () {
            return a.getInternetExplorerMajorVersion.cached = typeof a.getInternetExplorerMajorVersion.cached != "undefined" ? a.getInternetExplorerMajorVersion.cached : function () {
                for (var a = 3, e = b.createElement("div"), d = e.getElementsByTagName("i");
                (e.innerHTML =
                    "<\!--[if gt IE " + ++a + "]><i></i><![endif]--\>") && d[0];);
                return a > 4 ? a : !1
            }()
        };
        a.isInternetExplorer = function () {
            return a.isInternetExplorer.cached = typeof a.isInternetExplorer.cached != "undefined" ? a.isInternetExplorer.cached : Boolean(a.getInternetExplorerMajorVersion())
        };
        a.emulated = {
            pushState: !Boolean(c.history && c.history.pushState && c.history.replaceState && !/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i.test(g.userAgent) && !/AppleWebKit\/5([0-2]|3[0-2])/i.test(g.userAgent)),
            hashChange: Boolean(!("onhashchange" in c || "onhashchange" in b) || a.isInternetExplorer() && a.getInternetExplorerMajorVersion() < 8)
        };
        a.enabled = !a.emulated.pushState;
        a.bugs = {
            setHash: Boolean(!a.emulated.pushState && g.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(g.userAgent)),
            safariPoll: Boolean(!a.emulated.pushState && g.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(g.userAgent)),
            ieDoubleCheck: Boolean(a.isInternetExplorer() && a.getInternetExplorerMajorVersion() < 8),
            hashEscape: Boolean(a.isInternetExplorer() && a.getInternetExplorerMajorVersion() < 7)
        };
        a.isEmptyObject = function (a) {
            for (var b in a) return !1;
            return !0
        };
        a.cloneObject = function (a) {
            var b, d;
            return a ? (b = l.stringify(a), d = l.parse(b)) : d = {}, d
        };
        a.getRootUrl = function () {
            var a = b.location.protocol + "//" + (b.location.hostname || b.location.host);
            b.location.port && (a += ":" + b.location.port);
            return a += "/", a
        };
        a.getBaseHref = function () {
            var a = b.getElementsByTagName("base"),
                e = "";
            return a.length === 1 && (a = a[0], e = null.href.replace(/[^\/]+$/, "")), e = e.replace(/\/+$/, ""), e && (e += "/"),
            e
        };
        a.getBaseUrl = function () {
            return a.getBaseHref() || a.getBasePageUrl() || a.getRootUrl()
        };
        a.getPageUrl = function () {
            var h;
            return h = ((a.getState(!1, !1) || {}).url || b.location.href).replace(/\/+$/, "").replace(/[^\/]+$/, function (a) {
                return /\./.test(a) ? a : a + "/"
            }), h
        };
        a.getBasePageUrl = function () {
            return b.location.href.replace(/[#\?].*/, "").replace(/[^\/]+$/, function (a) {
                return /[^\/]$/.test(a) ? "" : a
            }).replace(/\/+$/, "") + "/"
        };
        a.getFullUrl = function (h, b) {
            var d = h,
                c = h.substring(0, 1);
            return b = typeof b == "undefined" ? !0 : b,
                /[a-z]+\:\/\//.test(h) || (c === "/" ? d = a.getRootUrl() + h.replace(/^\/+/, "") : c === "#" ? d = a.getPageUrl().replace(/#.*/, "") + h : c === "?" ? d = a.getPageUrl().replace(/[\?#].*/, "") + h : b ? d = a.getBaseUrl() + h.replace(/^(\.\/)+/, "") : d = a.getBasePageUrl() + h.replace(/^(\.\/)+/, "")), d.replace(/\#$/, "")
        };
        a.getShortUrl = function (b) {
            var e = a.getBaseUrl(),
                d = a.getRootUrl();
            return a.emulated.pushState && (b = b.replace(e, "")), b = b.replace(d, "/"), a.isTraditionalAnchor(b) && (b = "./" + b), b = b.replace(/^(\.\/)+/g, "./").replace(/\#$/, ""), b
        };
        a.store = {};
        a.idToState = a.idToState || {};
        a.stateToId = a.stateToId || {};
        a.urlToId = a.urlToId || {};
        a.storedStates = a.storedStates || [];
        a.savedStates = a.savedStates || [];
        a.normalizeStore = function () {
            a.store.idToState = a.store.idToState || {};
            a.store.urlToId = a.store.urlToId || {};
            a.store.stateToId = a.store.stateToId || {}
        };
        a.getState = function (b, e) {
            typeof b == "undefined" && (b = !0);
            typeof e == "undefined" && (e = !0);
            var d = a.getLastSavedState();
            return !d && e && (d = a.createStateObject()), b && (d = a.cloneObject(d), d.url = d.cleanUrl || d.url), d
        };
        a.getIdByState = function (b) {
            var e = a.extractId(b.url),
                d;
            if (!e) if (d = a.getStateString(b), typeof a.stateToId[d] != "undefined") e = a.stateToId[d];
            else if (typeof a.store.stateToId[d] != "undefined") e = a.store.stateToId[d];
            else {
                for (;;) if (e = (new Date).getTime() + String(Math.random()).replace(/\D/g, ""), typeof a.idToState[e] == "undefined" && typeof a.store.idToState[e] == "undefined") break;
                a.stateToId[d] = e;
                a.idToState[e] = b
            }
            return e
        };
        a.normalizeState = function (h) {
            var e;
            if (!h || typeof h != "object") h = {};
            if (typeof h.normalized != "undefined") return h;
            if (!h.data || typeof h.data != "object") h.data = {};
            e = {};
            e.normalized = !0;
            e.title = h.title || "";
            e.url = a.getFullUrl(a.unescapeString(h.url || b.location.href));
            e.hash = a.getShortUrl(e.url);
            e.data = a.cloneObject(h.data);
            e.id = a.getIdByState(e);
            e.cleanUrl = e.url.replace(/\??\&_suid.*/, "");
            e.url = e.cleanUrl;
            h = !a.isEmptyObject(e.data);
            if (e.title || h) e.hash = a.getShortUrl(e.url).replace(/\??\&_suid.*/, ""), /\?/.test(e.hash) || (e.hash += "?"), e.hash += "&_suid=" + e.id;
            return e.hashedUrl = a.getFullUrl(e.hash), (a.emulated.pushState || a.bugs.safariPoll) && a.hasUrlDuplicate(e) && (e.url = e.hashedUrl), e
        };
        a.createStateObject = function (b, e, d) {
            b = {
                data: b,
                title: e,
                url: d
            };
            return b = a.normalizeState(b), b
        };
        a.getStateById = function (b) {
            b = String(b);
            return a.idToState[b] || a.store.idToState[b] || m
        };
        a.getStateString = function (b) {
            var e, d, c;
            return e = a.normalizeState(b), d = {
                data: e.data,
                title: b.title,
                url: b.url
            }, c = l.stringify(d), c
        };
        a.getStateId = function (b) {
            var e, d;
            return e = a.normalizeState(b), d = e.id, d
        };
        a.getHashByState = function (b) {
            var e, d;
            return e = a.normalizeState(b),
            d = e.hash, d
        };
        a.extractId = function (a) {
            var b, d;
            return d = /(.*)\&_suid=([0-9]+)$/.exec(a), b = d ? String(d[2] || "") : "", b || !1
        };
        a.isTraditionalAnchor = function (a) {
            return !/[\/\?\.]/.test(a)
        };
        a.extractState = function (b, e) {
            var d = null,
                c, f;
            return e = e || !1, c = a.extractId(b), c && (d = a.getStateById(c)), d || (f = a.getFullUrl(b), c = a.getIdByUrl(f) || !1, c && (d = a.getStateById(c)), !d && e && !a.isTraditionalAnchor(b) && (d = a.createStateObject(null, null, f))), d
        };
        a.getIdByUrl = function (b) {
            return a.urlToId[b] || a.store.urlToId[b] || m
        };
        a.getLastSavedState = function () {
            return a.savedStates[a.savedStates.length - 1] || m
        };
        a.getLastStoredState = function () {
            return a.storedStates[a.storedStates.length - 1] || m
        };
        a.hasUrlDuplicate = function (b) {
            var e = !1,
                d;
            return d = a.extractState(b.url), e = d && d.id !== b.id, e
        };
        a.storeState = function (b) {
            return a.urlToId[b.url] = b.id, a.storedStates.push(a.cloneObject(b)), b
        };
        a.isLastSavedState = function (b) {
            var e, d, c;
            return a.savedStates.length && (e = b.id, d = a.getLastSavedState(), c = d.id, b = e === c), !1
        };
        a.saveState = function (b) {
            return a.isLastSavedState(b) ? !1 : (a.savedStates.push(a.cloneObject(b)), !0)
        };
        a.getStateByIndex = function (b) {
            var e;
            return typeof b == "undefined" ? e = a.savedStates[a.savedStates.length - 1] : b < 0 ? e = a.savedStates[a.savedStates.length + b] : e = a.savedStates[b], null
        };
        a.getHash = function () {
            return a.unescapeHash(b.location.hash)
        };
        a.unescapeString = function (a) {
            for (var b;;) {
                b = c.unescape(a);
                if (b === a) break;
                a = b
            }
            return a
        };
        a.unescapeHash = function (b) {
            b = a.normalizeHash(b);
            return b = a.unescapeString(b), b
        };
        a.normalizeHash = function (a) {
            return a.replace(/[^#]*#/,
                "").replace(/#.*/, "")
        };
        a.setHash = function (c, e) {
            var d, f, g;
            return e !== !1 && a.busy() ? (a.pushQueue({
                scope: a,
                callback: a.setHash,
                args: arguments,
                queue: e
            }), !1) : (d = a.escapeHash(c), a.busy(!0), f = a.extractState(c, !0), f && !a.emulated.pushState ? a.pushState(f.data, f.title, f.url, !1) : b.location.hash !== d && (a.bugs.setHash ? (g = a.getPageUrl(), a.pushState(null, null, g + "#" + d, !1)) : b.location.hash = d), a)
        };
        a.escapeHash = function (b) {
            b = a.normalizeHash(b);
            return b = c.escape(b), a.bugs.hashEscape || (b = b.replace(/\%21/g, "!").replace(/\%26/g,
                "&").replace(/\%3D/g, "=").replace(/\%3F/g, "?")), b
        };
        a.getHashByUrl = function (b) {
            b = String(b).replace(/([^#]*)#?([^#]*)#?(.*)/, "$2");
            return b = a.unescapeHash(b), b
        };
        a.setTitle = function (c) {
            var e = c.title,
                d;
            e || (d = a.getStateByIndex(0), d && d.url === c.url && (e = d.title || a.options.initialTitle));
            try {
                b.getElementsByTagName("title")[0].innerHTML = e.replace("<", "&lt;").replace(">", "&gt;").replace(" & ", " &amp; ")
            } catch (f) {}
            return b.title = e, a
        };
        a.queues = [];
        a.busy = function (b) {
            typeof b != "undefined" ? a.busy.flag = b : typeof a.busy.flag ==
                "undefined" && (a.busy.flag = !1);
            if (!a.busy.flag) {
                o(a.busy.timeout);
                var c = function () {
                    var b, h, f;
                    if (!a.busy.flag) for (b = a.queues.length - 1; b >= 0; --b) if (h = a.queues[b], h.length !== 0) f = h.shift(), a.fireQueueItem(f), a.busy.timeout = i(c, a.options.busyDelay)
                };
                a.busy.timeout = i(c, a.options.busyDelay)
            }
            return a.busy.flag
        };
        a.busy.flag = !1;
        a.fireQueueItem = function (b) {
            return b.callback.apply(b.scope || a, b.args || [])
        };
        a.pushQueue = function (b) {
            return a.queues[b.queue || 0] = a.queues[b.queue || 0] || [], a.queues[b.queue || 0].push(b), a
        };
        a.queue = function (b, c) {
            return typeof b == "function" && (b = {
                callback: b
            }), typeof c != "undefined" && (b.queue = c), a.busy() ? a.pushQueue(b) : a.fireQueueItem(b), a
        };
        a.clearQueue = function () {
            return a.busy.flag = !1, a.queues = [], a
        };
        a.stateChanged = !1;
        a.doubleChecker = !1;
        a.doubleCheckComplete = function () {
            return a.stateChanged = !0, a.doubleCheckClear(), a
        };
        a.doubleCheckClear = function () {
            return a.doubleChecker && (o(a.doubleChecker), a.doubleChecker = !1), a
        };
        a.doubleCheck = function (b) {
            return a.stateChanged = !1, a.doubleCheckClear(), a.bugs.ieDoubleCheck && (a.doubleChecker = i(function () {
                return a.doubleCheckClear(), a.stateChanged || b(), !0
            }, a.options.doubleCheckInterval)), a
        };
        a.safariStatePoll = function () {
            var f = a.extractState(b.location.href);
            if (!a.isLastSavedState(f)) return f || a.createStateObject(), a.Adapter.trigger(c, "popstate"), a
        };
        a.back = function (b) {
            return b !== !1 && a.busy() ? (a.pushQueue({
                scope: a,
                callback: a.back,
                args: arguments,
                queue: b
            }), !1) : (a.busy(!0), a.doubleCheck(function () {
                a.back(!1)
            }), p.go(-1), !0)
        };
        a.forward = function (b) {
            return b !== !1 && a.busy() ? (a.pushQueue({
                scope: a,
                callback: a.forward,
                args: arguments,
                queue: b
            }), !1) : (a.busy(!0), a.doubleCheck(function () {
                a.forward(!1)
            }), p.go(1), !0)
        };
        a.go = function (b, c) {
            var d;
            if (b > 0) for (d = 1; d <= b; ++d) a.forward(c);
            else {
                if (!(b < 0)) throw Error("History.go: History.go requires a positive or negative integer passed.");
                for (d = -1; d >= b; --d) a.back(c)
            }
            return a
        };
        if (a.emulated.pushState) {
            var r = function () {};
            a.pushState = a.pushState || r;
            a.replaceState = a.replaceState || r
        } else a.onPopState = function (f, e) {
            var d = !1,
                g = !1,
                i, j;
            return a.doubleCheckComplete(), i = a.getHash(), i ? (j = a.extractState(i || b.location.href, !0), j ? a.replaceState(j.data, j.title, j.url, !1) : (a.Adapter.trigger(c, "anchorchange"), a.busy(!1)), a.expectedStateId = !1, !1) : (d = a.Adapter.extractEventData("state", f, e) || !1, d ? g = a.getStateById(d) : a.expectedStateId ? g = a.getStateById(a.expectedStateId) : g = a.extractState(b.location.href), g || (g = a.createStateObject(null, null, b.location.href)), a.expectedStateId = !1, a.isLastSavedState(g) ? (a.busy(!1), !1) : (a.storeState(g), a.saveState(g), a.setTitle(g), a.Adapter.trigger(c,
                "statechange"), a.busy(!1), !0))
        }, a.Adapter.bind(c, "popstate", a.onPopState), a.pushState = function (b, e, d, f) {
            if (a.getHashByUrl(d) && a.emulated.pushState) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (f !== !1 && a.busy()) return a.pushQueue({
                scope: a,
                callback: a.pushState,
                args: arguments,
                queue: f
            }), !1;
            a.busy(!0);
            var g = a.createStateObject(b, e, d);
            return a.isLastSavedState(g) ? a.busy(!1) : (a.storeState(g), a.expectedStateId = g.id, p.pushState(g.id, g.title, g.url), a.Adapter.trigger(c,
                "popstate")), !0
        }, a.replaceState = function (b, e, d, f) {
            if (a.getHashByUrl(d) && a.emulated.pushState) throw Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (f !== !1 && a.busy()) return a.pushQueue({
                scope: a,
                callback: a.replaceState,
                args: arguments,
                queue: f
            }), !1;
            a.busy(!0);
            var g = a.createStateObject(b, e, d);
            return a.isLastSavedState(g) ? a.busy(!1) : (a.storeState(g), a.expectedStateId = g.id, p.replaceState(g.id, g.title, g.url), a.Adapter.trigger(c, "popstate")), !0
        };
        if (f) {
            try {
                a.store = l.parse(f.getItem("History.store")) || {}
            } catch (s) {
                a.store = {}
            }
            a.normalizeStore()
        } else a.store = {}, a.normalizeStore();
        a.Adapter.bind(c, "beforeunload", a.clearAllIntervals);
        a.Adapter.bind(c, "unload", a.clearAllIntervals);
        a.saveState(a.storeState(a.extractState(b.location.href, !0)));
        f && (a.onUnload = function () {
            var b, c;
            try {
                b = l.parse(f.getItem("History.store")) || {}
            } catch (d) {
                b = {}
            }
            b.idToState = b.idToState || {};
            b.urlToId = b.urlToId || {};
            b.stateToId = b.stateToId || {};
            for (c in a.idToState) a.idToState.hasOwnProperty(c) && (b.idToState[c] = a.idToState[c]);
            for (c in a.urlToId) a.urlToId.hasOwnProperty(c) && (b.urlToId[c] = a.urlToId[c]);
            for (c in a.stateToId) a.stateToId.hasOwnProperty(c) && (b.stateToId[c] = a.stateToId[c]);
            a.store = b;
            a.normalizeStore();
            f.setItem("History.store", l.stringify(b))
        }, a.intervalList.push(k(a.onUnload, a.options.storeInterval)), a.Adapter.bind(c, "beforeunload", a.onUnload), a.Adapter.bind(c, "unload", a.onUnload));
        if (!a.emulated.pushState && (a.bugs.safariPoll && a.intervalList.push(k(a.safariStatePoll, a.options.safariPollInterval)),
        g.vendor === "Apple Computer, Inc." || (g.appCodeName || "") === "Mozilla")) a.Adapter.bind(c, "hashchange", function () {
            a.Adapter.trigger(c, "popstate")
        }), a.getHash() && a.Adapter.onDomLoad(function () {
            a.Adapter.trigger(c, "hashchange")
        })
    };
    a.init()
})(window);
window.log = function () {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        var a = arguments;
        a.callee = a.callee.caller;
        a = [].slice.call(a);
        typeof console.log === "object" ? log.apply.call(console.log, console, a) : console.log.apply(console, a)
    }
};
(function (a) {
    function c() {}
    for (var d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), b; b = d.pop();) a[b] = a[b] || c
})(function () {
    try {
        return console.log(), window.console
    } catch (a) {
        return window.console = {}
    }
}());
var HistoryCtrl = new Class({
    Binds: ["update", "applyState"],
    name: "History Controller",
    filterType: "all",
    filterKey: "",
    filmKey: "",
    ignoreNextStateChange: !1,
    initialize: function () {
        window.History && window.History.enabled && (window.addEvent("history", this.update), window.History.Adapter.bind(window, "statechange", this.applyState))
    },
    update: function (a) {
        if (a && !(a.length != 2 || typeof a != "object")) {
            var b = !0;
            switch (a[0]) {
                case "film":
                    b = a[1] == this.filmKey ? !1 : !0;
                    this.filmKey = a[1];
                    break;
                default:
                    b = a[0] == this.filterType && a[1] == this.filterKey ? !1 : !0, this.filmKey = "", this.filterType = !a[0] ? "all" : a[0], this.filterKey = !a[1] ? "" : a[1]
            }
            b && this.updateURI()
        }
    },
    updateURI: function () {
        var a = [];
        this.filterType && this.filterType != "all" && a.push(this.filterType + "=" + this.filterKey);
        this.filmKey && a.push("film=" + this.filmKey);
        a = window.location.protocol.replace(/\:/g, "") + "://" + window.location.host + "/site/web/?" + a.join("&");
        this.ignoreNextStateChange = !0;
        window.History.pushState({
            filterType: this.filterType,
            filterKey: this.filterKey,
            filmKey: this.filmKey
        },
        document.title, a)
    },
    applyState: function () {
        if (this.ignoreNextStateChange) this.ignoreNextStateChange = !1;
        else if (window.History && window.History.enabled) {
            var a = window.History.getState().data;
            !a.filterType && !a.filterKey && !a.filmKey && window.History.getState().hash.lastIndexOf("?") >= 0 && (a = this.getDataFromHash());
            this.filterType = a.filterType ? a.filterType : "all";
            this.filterKey = a.filterKey;
            (this.filmKey = a.filmKey) ? window.player.start({
                movieKey: this.filmKey
            }, null) : window.player.hide();
            for (var b, a = 0; a < window.menuCtrl.menuEls.length; a++) if (b = window.menuCtrl.menuEls[a].getElementById("a_" + this.filterType + "_" + this.filterKey)) break;
            window.menuCtrl.menuObjs[window.menuCtrl.mode].updateHighlight([this.filterType, this.filterKey]);
            b = b ? b.get("text") : "";
            a = this.filmKey;
            window.grid.filterClips(this.filterType, this.filterKey, b, !1);
            this.filmKey = a;
            document.title = "Vifi.ee"
        }
    },
    getDataFromHash: function () {
        for (var a = window.History.getState().hash, b = a.lastIndexOf("?"), a = b < 0 ? "all=" : a.substr(b + 1), a = a.split("&"), b = {
            filterType: "all",
            filterKey: "",
            filmKey: ""
        }, c = [], d = 0; d < a.length; d++) switch (c = a[d].split("="), c[0]) {
            case "film":
                b.filmKey = c[1];
                break;
            default:
                b.filterType = !c[0] ? "all" : c[0], b.filterKey = !c[1] ? "" : c[1]
        }
        return b
    }
});
var Menu = new Class({
    Implements: [Events],
    Binds: ["click"],
    name: "Menu Base",
    controller: null,
    isActive: !1,
    menuSelected: null,
    selectedKeys: [],
    menuDefault: null,
    wrapperEl: null,
    menuEls: [],
    colNum: void 0,
    initialize: function (a, b, c) {
        this.wrapperEl = a;
        this.controller = c;
        this.updateHighlight(["all"]);
        b.each(function (a) {
            a.addEvent(Modernizr.touch && !window.isIphone ? "touchstart" : "click", this.click);
            this.menuEls.push(a.clone(!0, !0).cloneEvents(a))
        }, this)
    },
    activate: function (a) {
        if (!this.isActive) this.wrapperEl.empty(), this.menuEls.each(function (a) {
            this.wrapperEl.grab(a)
        },
        this), this._setHighlights(this.selectedKeys), this.isActive = !0, this.fireEvent("onActive"), a && this.restoreMenuState(a.get("id"))
    },
    deactivate: function () {
        if (this.isActive) this._setHighlights(), this.isActive = !1, this.fireEvent("onInactive")
    },
    update: function (a) {
        this.colNum = a;
        this.fireEvent("onUpdate")
    },
    click: function (a) {
        a.preventDefault();
        if (this.isActive) {
            var b = a.target.get("href");
            if (b && (b = b.substr(b.indexOf("/") + 1), b = b.split("/"), b[0] == "#navNew" && (b[0] = "genre", b[1] = "new"), b[0] == "all" || b[0] ==
                "director" || b[0] == "genre")) this.updateHighlight(b), window.grid.filterClips(b[0], b[1], a.target.get("text"))
        }
    },
    updateHighlight: function (a) {
        this._setHighlights();
        this._setHighlights(a);
        this.selectedKeys = a
    },
    _setHighlights: function (a) {
        var b = a ? "set" : "unset",
            a = a ? a : this.selectedKeys;
        a[0] == "genre" && a[1] == "new" && (a = ["genre_new"]);
        var c = "a";
        a.each(function (a) {
            c += "_" + a;
            for (var a = null, d = this.menuEls.length; a === null && d > 0;) d--, a = this.menuEls[d].getElementById(c);
            a && (b == "set" ? a.addClass.delay(1, a, "selected") : a.removeClass.delay(1, a, "selected"))
        }, this)
    },
    getHeights: function () {
        this.menuEls[0].setStyle("display", "block");
        var a = this.menuEls[0].getCoordinates();
        this.wrapperEl.getParent("header").getStyle("position") == "fixed" && (a.top -= window.getScroll().y);
        return {
            header: a.top,
            nav: a.height
        }
    },
    _getMenuLevel: function (a) {
        return !a ? null : parseInt(a.get("data-menulevel"))
    }
});
var MenuDesk = new Class({
    Extends: Menu,
    Binds: "onActive,onInactive,onUpdate,toggle,hoverDelay,executeQueuedEvent,showMenu,hideMenu,initMenu,lockOptions,unlockOptions".split(","),
    name: "Menu Desktop",
    menuSelected: null,
    hoverTimeout: null,
    queuedMenuEvent: null,
    optionsTimeout: null,
    optionsLocked: !1,
    initialize: function (a, b, c) {
        this.parent(a, b, c);
        this.menuEls.each(this.initMenu);
        this.addEvent("onActive", this.onActive);
        this.addEvent("onInactive", this.onInactive);
        this.addEvent("onUpdate", this.onUpdate)
    },
    initMenu: function (a,
    b) {
        this._getMenuLevel(a) == 1 ? this.menuDefault = a : a.setStyle("display", "none");
        a.getElements("li").each(this.initItem, this);
        a.itemsNum = a.getElements("li").length;
        this.menuEls[b] = a
    },
    updateMenu: function (a) {
        a.hasClass("options") && this.buildCols(a)
    },
    buildCols: function (a) {
        var b = a.getFirst("ul"),
            a = b.getElements("li");
        b.empty();
        var c = new Element('div[class="col"]'),
            d = a.length,
            e = parseInt(d / this.colNum),
            e = Math.max(2, e),
            i = Math.min(this.colNum, parseInt(d / e)),
            j = d % i,
            g = -1,
            h = 0,
            f;
        a.each(function (a, d) {
            parseInt((d - h) / e) > g && (g < j && h == g ? h++ : (f && b.grab(f), g++, f = c.clone()));
            f && f.grab(a)
        }, this);
        b.grab(f)
    },
    initItem: function (a) {
        if (a.hasClass("backlink")) a.destroy();
        else {
            var b = this.onToggleComplete.bind(this, a.getParent("nav"));
            a.set("morph", {
                duration: 500,
                transition: "quint:in:out",
                onComplete: b
            });
            a.getParent("nav").get("data-menulevel") == 1 && !Modernizr.touch ? (a.addEvent("mouseover", this.hoverDelay), a.addEvent("mouseout", this.hoverDelay)) : Modernizr.touch ? a.addEvent("touchstart", this.toggle) : a.addEvent("click", this.toggle)
        }
    },
    toggle: function (a) {
        a.preventDefault && a.preventDefault();
        var b = this.menuSelected,
            c = null,
            d = a.target.get("tag") == "a" ? a.target : a.target.getFirst("a"),
            e = d.href.lastIndexOf("#");
        if (e >= 0) {
            d = d.href.substr(e + 1);
            for (e = this.menuEls.length; c == null && e > 0;) e--, this.menuEls[e].get("id") == d && (c = this.menuEls[e])
        }
        this.menuSelected = c;
        d = 0;
        if (b == c) {
            if (!(a.type == "mouseover" || c == null)) this.hideMenu(this.menuSelected), this.menuSelected = null
        } else b != null && (d = window.isIpad ? 0 : 250, this.hideMenu(b)), this.showMenu.delay(d)
    },
    hoverDelay: function (a) {
        this.hoverTimeout && (clearTimeout(this.hoverTimeout), delete this.hoverTimeout);
        if (a.type == "mouseover") this.queuedMenuEvent = {
            target: a.target,
            type: a.type
        }, this.hoverTimeout = setTimeout(this.executeQueuedEvent, 250);
        else if (a.type == "mouseout") this.queuedMenuEvent = null
    },
    executeQueuedEvent: function () {
        this.hoverTimeout && (clearTimeout(this.hoverTimeout), delete this.hoverTimeout);
        this.queuedMenuEvent && this.toggle(this.queuedMenuEvent)
    },
    autoHideOptions: function () {
        this.optionsTimeout && (clearTimeout(this.optionsTimeout), delete this.optionsTimeout);
        if (!this.optionsLocked) this.optionsTimeout = setTimeout(this.hideMenu, 1E3)
    },
    lockOptions: function () {
        this.optionsLocked = !0
    },
    unlockOptions: function () {
        this.optionsLocked = !1;
        this.autoHideOptions()
    },
    restoreMenuState: function (a) {
        if (a) a == this.menuDefault.get("id") ? this.menuSelected = null : (this.menuEls.each(function (b) {
            if (b.get("id") == a) this.menuSelected = b
        }, this), this.wrapperEl.grab(this.menuSelected), this.menuSelected.getElements("li").each(function (a) {
            a.setStyles({
                opacity: 1,
                "margin-top": 0
            })
        }), this.menuSelected.setStyle("display",
            "block"))
    },
    showMenu: function () {
        if (this.menuSelected) {
            var a = this.menuSelected;
            this.wrapperEl.grab(a);
            if (!window.isIpad) a.completedNum = 0, a.getElements("li").each(function (a, c) {
                a.setStyles({
                    opacity: 0,
                    "margin-top": 20
                });
                a.morph.delay(c * 10, a, {
                    opacity: 1,
                    "margin-top": 0
                })
            });
            a.setStyle("display", "block")
        }
    },
    hideMenu: function (a) {
        if (!a || typeof a != "object") {
            if (this.optionsLocked) return;
            a = this.menuSelected;
            this.menuSelected = null;
            if (!a) return
        }
        window.isIpad ? a.setStyle("display", "none") : (a.completedNum = 0, a.getElements("li").each(function (a,
        c) {
            a.morph.delay(c * 10, a, {
                opacity: 0,
                "margin-top": 20
            })
        }))
    },
    onActive: function () {
        this.wrapperEl.empty();
        this.wrapperEl.setStyles({
            left: 0,
            height: 0
        });
        this.wrapperEl.grab(this.menuEls[0], "top");
        this.menuEls.each(function (a) {
            a.addEvent("mouseenter", this.lockOptions);
            a.addEvent("mouseleave", this.unlockOptions)
        }, this)
    },
    onInactive: function () {
        this.menuEls.each(function (a) {
            a.removeEvent("mouseenter", this.lockOptions);
            a.removeEvent("mouseleave", this.unlockOptions)
        }, this);
        this.menuSelected = this.menuSelected || this.menuDefault
    },
    onUpdate: function () {
        this.menuEls.each(this.updateMenu, this)
    },
    onToggleComplete: function (a) {
        ++a.completedNum == a.itemsNum && a != this.menuSelected && a.dispose()
    }
});
var MenuMob = new Class({
    Extends: Menu,
    Binds: ["onActive", "onInactive", "onUpdate", "toggle"],
    name: "Menu Mobile",
    menuLevelNum: 0,
    currentLevel: void 0,
    initialize: function (a, c, b) {
        this.parent(a, c, b);
        this.wrapperEl.set("tween", {
            duration: 150,
            transition: Fx.Transitions.QuintInOut,
            onComplete: this.onToggleComplete.bind(this)
        });
        this.menuEls.each(this.initMenu, this);
        this.addEvent("onActive", this.onActive);
        this.addEvent("onInactive", this.onInactive);
        this.addEvent("onUpdate", this.onUpdate)
    },
    initMenu: function (a, c) {
        var b = this._getMenuLevel(a);
        this.menuLevelNum = Math.max(b, this.menuLevelNum);
        b == 1 ? (this.menuDefault = this.menuSelected = a, this.currentLevel = b) : a.setStyle("display", "none");
        a.getElements("li").each(this.initItem, this);
        this.menuEls[c] = a
    },
    initItem: function (a) {
        a.addEvent("click", this.toggle)
    },
    updateMenu: function (a) {
        a.setStyles({
            width: this.width,
            left: (this._getMenuLevel(a) - 1) * this.width
        });
        this.wrapperEl.setStyle("left", this.width * -(this.currentLevel - 1))
    },
    toggle: function (a) {
        a.preventDefault();
        a = a.target.href;
        this._setMenuSelected($(a.substr(a.lastIndexOf("#") + 1)));
        this.menuSelected.setStyle("display", "block");
        this.wrapperEl.tween("left", this.width * -(this.currentLevel - 1))
    },
    restoreMenuState: function (a) {
        a && a != this.menuSelected.get("id") && (this.menuSelected && this.menuSelected.setStyle("display", "none"), this._setMenuSelected($(a)), this.menuSelected.setStyle("display", "block"), this.wrapperEl.setStyle("left", this.width * -(this.currentLevel - 1)))
    },
    onActive: function () {
        window.addEvent("resize", this.onUpdate);
        this.updateWrapperHeight()
    },
    onInactive: function () {
        window.removeEvent("resize",
        this.onUpdate)
    },
    onUpdate: function () {
        this.width = this.wrapperEl.getSize().x;
        this.menuEls.each(this.updateMenu, this)
    },
    updateWrapperHeight: function () {
        this.wrapperEl.setStyle("height", this.menuSelected.getSize().y)
    },
    onToggleComplete: function () {
        this.menuEls.each(function (a) {
            a.get("id") != this.menuSelected.get("id") ? a.setStyle("display", "none") : this.updateWrapperHeight()
        }, this)
    },
    _setMenuSelected: function (a) {
        a = a || this.menuDefault;
        this.currentLevel = parseInt(a.get("data-menulevel"));
        this.menuSelected = a
    }
});
var MenuCtrl = new Class({
    Binds: ["recalc"],
    name: "Menu Controller",
    wrapperEl: null,
    menuEls: [],
    menuObjs: {
        mobile: null,
        desktop: null
    },
    colNum: void 0,
    mode: null,
    initialize: function (a) {
        this.wrapperEl = a;
        this.menuEls = this.wrapperEl.getElements("nav");
        this.wrapperEl.setStyle("display", "block");
        this.recalc();
        window.addEvent("resize", this.recalc)
    },
    recalc: function () {
        var a = window.getSize().x;
        if (window.innerWidth && window.innerWidth > a) a = window.innerWidth;
        for (var d = 1, b = 0; b < window.menuGrid.length; b++) if (a >= window.menuGrid[b].minWidth) d = window.menuGrid[b].colNum;
        if (d != this.colNum) {
            var a = this._getMenuObj(this.colNum, !1),
                b = null,
                c = this._getMenuObj(d);
            if (a && c != a) a.deactivate(), c.selectedKeys = a.selectedKeys, b = a.menuSelected;
            this.colNum = d;
            c.activate(b);
            c.update(d)
        }
        grid.setOffset(this.menuObjs[this.mode].getHeights())
    },
    _getMenuObj: function (a, d) {
        if (!a) return null;
        var b = a == 1 ? "mobile" : "desktop",
            c = this.menuObjs[b];
        !c && d !== !1 && (c = b == "mobile" ? new MenuMob(this.wrapperEl, this.menuEls, this) : new MenuDesk(this.wrapperEl, this.menuEls, this), this.menuObjs[b] = c);
        this.mode = b;
        return this.menuObjs[b]
    }
});
var Tile = new Class({
    name: "Tile",
    grid: null,
    isActive: !0,
    inViewport: !1,
    size: {},
    wrapperEl: null,
    frameEl: null,
    thumbContEl: null,
    thumbImgEl: null,
    overlayEl: null,
    clip: null,
    flagEl: null,
    suppressFade: !1,
    Implements: [Events],
    Binds: "showOverlay,hideOverlay,playVideo,cleanup,_onBecomeVisible,_onResignVisible,_onOverlayTweenComplete,_onFlagTweenComplete,onLoadThumbComplete".split(","),
    initialize: function (a, b) {
        this.grid = b;
        this.wrapperEl = a;
        this.frameEl = a.getFirst(".frame");
        this.thumbContEl = this.frameEl.getFirst(".thumbCont");
        this.overlayEl = a.getFirst(".overlay");
        this.flagEl = this.wrapperEl.getFirst("span.thumbFlag");
        var c = this.thumbContEl.getFirst("a");
        this.thumbImgEl = c.getFirst("img.thumb");
        var d = this.overlayEl.getFirst("a");
        this.wrapperEl.addEvent("mouseup", this.playVideo);
        c.removeProperties("href", "title");
        d.removeProperty("href");
        this.overlayEl.set("tween", {
            duration: 150,
            transition: Fx.Transitions.QuintInOut,
            onComplete: this._onOverlayTweenComplete
        });
        this.scroller = new Fx.Scroll(this.frameEl, {
            transition: "sine:in:out",
            wheelStops: !1,
            link: "cancel"
        });
        this.scroller.addEvent("complete", this.cleanup);
        this.flagEl.set("tween", {
            duration: 250,
            transition: Fx.Transitions.QuintInOut,
            onComplete: this._onFlagTweenComplete
        });
        this.thumbContEl.set("tween", {
            duration: 200
        });
        window.isDesktop && !window.isIpad && (this.wrapperEl.addEvent("mouseover", this.showOverlay), this.wrapperEl.addEvent("mouseout", this.hideOverlay));
        this.thumbContEl.dispose();
        this.flagEl.dispose();
        this.overlayEl.dispose();
        this.addEvent("didBecomeVisible", this._onBecomeVisible);
        this.addEvent("didResignVisible", this._onResignVisible)
    },
    setDimensions: function (a, b) {
        this.size.x = a;
        this.size.y = b;
        this.overlayEl.setStyle("top", b);
        this.wrapperEl.setStyle("height", b);
        this.frameEl.setStyles({
            width: a - 1,
            height: b - 1
        });
        this._resize()
    },
    _resize: function () {
        var a = this.thumbContEl.getChildren("a");
        this.thumbContEl.setStyle("width", this.size.x * a.length);
        a.each(function (a) {
            a.setStyle("width", this.size.x - 1)
        }, this)
    },
    updateScroll: function (a) {
        a != this.inViewport && (a ? this.fireEvent("didBecomeVisible") : this.fireEvent("didResignVisible"));
        this.inViewport = a
    },
    _onBecomeVisible: function () {
        this.frameEl.grab(this.thumbContEl);
        this.clip && this.clip.isNew && this.wrapperEl.grab(this.flagEl);
        this.clip && this.grid.requestThumbLoad(this)
    },
    _onResignVisible: function () {
        this.thumbImgEl.set("src", "/_img/empty.gif");
        this.thumbContEl.dispose();
        this.flagEl.dispose();
        this.overlayEl.dispose();
        this.grid.cancelThumbLoadRequest(this)
    },
    _onOverlayTweenComplete: function () {
        this.overlayEl.getPosition(this.wrapperEl).y < this.size.y || this.overlayEl.dispose()
    },
    _onFlagTweenComplete: function () {
        (!this.clip || !this.clip.isNew) && this.flagEl.dispose()
    },
    loadThumb: function () {
        this.clip && this.clip.thumbLoadStat != "loaded" && this.thumbImgEl.addEvent("load", this.onLoadThumbComplete);
        if (this.clip && (this.clip.thumbLoadStat != "loaded" || window.isIos && !this.suppressFade)) this.thumbImgEl.setStyles({
            "-webkit-transition": "none",
            "-moz-transition": "none",
            "-o-transition": "none",
            "-ms-transition": "none",
            transition: "none"
        }), this.thumbImgEl.setStyle("opacity",
        0);
        this.thumbImgEl.set("src", this.clip ? this.clip.thumbSrc : "/_img/empty.gif");
        this.clip && this.clip.thumbLoadStat == "loaded" && window.isIos && !this.suppressFade && (this.thumbImgEl.setStyles({
            "-webkit-transition": "opacity .75s linear",
            transition: "opacity .75s linear"
        }), this.thumbImgEl.setStyle.delay(250 + Math.random() * 500, this.thumbImgEl, ["opacity", 1]));
        this.suppressFade = !1
    },
    onLoadThumbComplete: function () {
        if (this.clip) this.clip.thumbLoadStat = "loaded";
        this.thumbImgEl.removeEvents();
        this.thumbImgEl.setStyles({
            "-webkit-transition": "opacity .75s linear",
            "-moz-transition": "opacity .75s linear",
            "-o-transition": "opacity .75s linear",
            "-ms-transition": "opacity .75s linear",
            transition: "opacity .75s linear"
        });
        this.thumbImgEl.setStyle("opacity", 1);
        this.grid.thumbLoadComplete(this)
    },
    setClip: function (a) {
        var b = !a || !a.isNew ? -75 : 0;
        this.inViewport ? (this.flagEl.tween("right", b), a && a.isNew && this.wrapperEl.grab(this.flagEl)) : this.flagEl.setStyle("right", b);
        this.clip = a
    },
    updateContent: function (a, b) {
        for (var c = a.length - 1; c >= 0; c--) this._addThumb(a[c], c);
        this.overlayEl.empty();
        this.thumbImgEl = this.thumbContEl.getLast("a").getFirst("img.thumb");
        if (a[0]) {
            if (this.isActive = !0, this.movieSrc = a[0].movieSrc, this.overlayEl.grab(new Element("a[class=btn play]")), this._updateMeta("h1", ".director", a[0].directorStr), this._updateMeta("p", ".client", a[0].clientStr), this._updateMeta("p", ".title", a[0].titleStr), this.setClip(a[0]), this.wrapperEl.addClass("loading"), this.inViewport) {
                if (b) this.suppressFade = !0;
                this.grid.requestThumbLoad(this)
            }
        } else this.isActive = !1, this.setClip(null), this.wrapperEl.removeClass("loading");
        this._resize();
        var c = this.thumbContEl.getLast("a"),
            d = c.getPosition(this.thumbContEl);
        this.scroller.setOptions({
            duration: Math.sqrt(Math.abs(d.x + d.y)) * 25
        });
        b && this.inViewport ? this.scroller.toElement(c) : this.scroller.fireEvent("complete")
    },
    _addThumb: function (a) {
        var b = new Element("a"),
            a = new Element("img[class=thumb][src=" + (a && a.thumbLoadStat == "loaded" ? a.thumbSrc : "/_img/empty.gif") + "]");
        this.thumbContEl.grab(b.grab(a));
        b.addEvent("click", function (a) {
            a.preventDefault()
        })
    },
    _updateMeta: function (a, b, c) {
        c && (a = new Element(a + "[class=" + b + "]"), a.set("text", c), this.overlayEl.grab(a))
    },
    showOverlay: function () {
        this.grid.registerTileHover(this);
        this.isActive && (this.wrapperEl.grab(this.overlayEl), this.overlayEl.tween("top", this.size.y - this.overlayEl.getSize().y))
    },
    hideOverlay: function () {
        this.overlayEl.tween("top", this.size.y)
    },
    playVideo: function (a) {
        window.player && (a.preventDefault(), a.stopPropagation(), window.player.start(this.clip,a))

    },
    cleanup: function () {
        this.thumbContEl.getChildren("a").each(function (a, b, c) {
            b != c.length - 1 && a.dispose()
        });
        this.scroller.set(0, 0)
    }
});
var Infobox = new Class({
    name: "Infobox",
    isActive: !1,
    parentEl: null,
    wrapperEl: null,
    coords: null,
    filterCurrent: {
        type: null,
        key: null
    },
    filterApply: {
        type: null,
        key: null
    },
    initialize: function (a) {
        this.parentEl = a;
        this.bTweenComplete = this.tweenComplete.bind(this);
        this.bUpdateContent = this._updateContent.bind(this);
        this.build()
    },
    build: function () {
        var a = new Element("aside[class=infobox]"),
            b = new Element("div[class=container]"),
            c = new Element("img[class=portrait][src=/_img/directors/empty.gif]"),
            d = new Element("h1"),
            e = new Element("p");
        b.grab(c);
        b.grab(d);
        b.grab(e);
        a.grab(b);
        this.wrapperEl = a;
        this.wrapperEl.set("tween", {
            duration: 250,
            transition: Fx.Transitions.QuintInOut,
            onComplete: this.bTweenComplete
        });
        this.parentEl.grab(a)
    },
    switchContent: function (a, b) {
        this.filterApply = {
            type: a,
            key: b
        };
        this.isActive ? this.hide(!0) : (new Request.JSON({
            url: "/director/" + this.filterApply.key + "/",
            onSuccess: this.bUpdateContent
        })).get({
            output: "json"
        })
    },
    _updateContent: function (a) {
        if (this.filterApply.type == "director") {
            var b = this.wrapperEl.getFirst(".container"),
                c = a.portraitSrc ? a.portraitSrc : "empty.gif";
            b.getFirst("img.portrait").set("src", "/_img/directors/" + c);
            b.getFirst("h1").set("text", a.name);
            b.getFirst("p").set("text", a.description);
            this.filterCurrent = this.filterApply;
            this.filterApply = {
                type: null,
                key: null
            };
            this.show(!0)
        }
    },
    updateSize: function (a) {
        this.coords = a;
        this.wrapperEl.setStyles({
            left: this.isActive ? a.left : this.parentEl.getSize().x,
            top: a.top,
            bottom: a.bottom,
            width: a.width,
            height: a.height
        })
    },
    tweenComplete: function () {
        !this.isActive && this.filterApply.type && this.switchContent(this.filterApply.type, this.filterApply.key)
    },
    show: function (a) {
        this.isActive = !0;
        this.enable();
        a ? this.wrapperEl.tween("left", this.coords.left) : this.wrapperEl.setStyle("left", this.coords.left)
    },
    hide: function (a) {
        this.isActive = !1;
        a ? this.wrapperEl.tween("left", this.parentEl.getSize().x) : (this.wrapperEl.setStyle("left", this.parentEl.getSize().x), this.disable())
	
	

    },
    enable: function () {
        this.wrapperEl.setStyle("display", "block")
    },
    disable: function () {
        this.wrapperEl.setStyle("display", "none")
    }
});
var Grid = new Class({
    Binds: ["updateScrollToTopBtn", "scrollToTop", "loadController"],
    name: "Grid",
    wrapperEl: null,
    parentEl: null,
    footerEl: null,
    scrollToTopEl: null,
    scroller: null,
    clips: [],
    clipsSelected: [],
    clipsLoaded: [],
    loadRequests: [],
    loadQueue: [],
    loadMax: 2,
    loadControllerIntervalID: null,
    filter: {
        type: null,
        key: null,
        name: null
    },
    tiles: [],
    tileHovered: null,
    tileRatio: 16 / 9,
    tileSize: {},
    viewportSize: {},
    offset: 0,
    playerOffset: 0,
    scrollMemory: {
        x: 0,
        y: 0
    },
    colNum: null,
    infoboxFilters: ["director"],
    infoboxHeight: 3,
    isFirstInfobox: !0,
    resizeTimeout: null,
    initialize: function (a, b) {
        this.wrapperEl = a;
        this.parentEl = a.getParent();
        this.footerEl = b;
        this.wrapperEl.getElements("article").each(this.initTile.bind(this));
        this.clipsSelected = this.clips;
        this.wrapperEl.set("tween", {
            duration: 1E3,
            transition: Fx.Transitions.SineInOut
        });
        this.bUpdateInfoboxSize = this.updateInfoboxSize.bind(this);
        if (!window.isDesktop) this.scrollToTopEl = new Element("div[id=scrollToTopBtn]"), this.scrollToTopEl.store("isActive", !1), this.scroller = new Fx.Scroll(window, {
            transition: "sine:in:out",
            duration: 500,
            wheelStops: !1,
            link: "cancel"
        }), this.scrollToTopEl.addEvent(Modernizr.touch ? "touchstart" : "click", this.scrollToTop), this.wrapperEl.grab(this.scrollToTopEl);
        this.updateSize();
        window.addEvent("resize", this.updateSize.bind(this));
        window.addEvent("scroll", this.updateScroll.bind(this));
        window.isIos && window.scrollTo.delay(1, window, [0, 0])
    },
    initTile: function (a, b) {
        var c = a.getFirst(".frame .thumbCont"),
            d = a.getFirst(".overlay"),
            d = {
                index: b,
                directorKey: a.get("data-directorkey"),
                genreKey: a.get("data-genrekeys").split(","),
                directorStr: this._extractMeta(d, "director"),
                clientStr: this._extractMeta(d, "client"),
                titleStr: this._extractMeta(d, "title"),
                thumbSrc: c.getFirst("a img").get("data-src"),
                thumbLoadStat: "unloaded",
                movieKey: c.getFirst("a").get("href").split("/")[2],
                isNew: a.get("data-isNew").toInt()
            };
        a.removeProperties("data-directorkey", "data-genrekeys", "data-isnew");
        c.getFirst("a img").removeProperty("data-src");
        c = new Tile(a, this);
        c.setClip(d);
        this.clips.push(d);
        this.tiles.push(c)
    },
    updateSize: function () {
        this.tileSize.x = this.wrapperEl.getFirst("article").getSize().x;
        this.tileSize.y = parseInt(this.tileSize.x / this.tileRatio) - 1;
        this.viewportSize = window.getSize();
        if (window.innerWidth && window.innerWidth > this.viewportSize.x) this.viewportSize.x = window.innerWidth;
        for (var a = this.colNum, b = 1, c = 0; c < window.thumbGrid.length; c++) if (this.viewportSize.x >= window.thumbGrid[c].minWidth) b = window.thumbGrid[c].colNum;
        this.colNum = b;
        var d = this.colNum > 1 ? 0 : 1;
        this.tiles.each(function (a) {
            a.setDimensions(this.tileSize.x + d, this.tileSize.y)
        }, this);
        this.resizeTimeout ? (clearTimeout(this.resizeTimeout), delete this.resizeTimeout, b = 500) : b = 0;
        window.isIphone && (b = 0);
        window.infobox.disable();
        this.resizeTimeout = setTimeout(this.bUpdateInfoboxSize, b);
        this.colNum != a && this.infoboxFilters.contains(this.filter.type) ? this.updateContent(!1) : this.resizeWrapper(!1);
        !window.isDesktop && this.scrollToTopEl && this.scrollToTopEl.setStyle("left", this.viewportSize.x / 2 - 30);
        this.updateScroll()
    },
    updateInfoboxSize: function () {
        var a = {
            left: (this.colNum - 1) * this.tileSize.x,
            width: this.tileSize.x,
            height: this.tileSize.y * this.infoboxHeight - 1
        };
        this.colNum > 1 ? a.top = 0 : a.bottom = 0;
        window.infobox.updateSize(a);
        window.infobox.enable()
    },
    updateScroll: function () {
        var a = window.getScroll().y - this.offset,
            b = navigator.userAgent.match(/iPhone/i) && "standalone" in window.navigator && !window.navigator.standalone && !/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent) ? 60 : 0;
        this.tiles.each(function (c, d) {
            var e = parseInt(d / this.colNum);
            c.updateScroll((e + 1) * this.tileSize.y >= a && e * this.tileSize.y < this.viewportSize.y + a + b)
        }, this);
        window.isDesktop || this.updateScrollToTopBtn.delay(250, this, [a])
    },
    updateScrollToTopBtn: function (a) {
        if (this.scrollToTopEl) {
            var b = this.scrollToTopEl,
                c = b.retrieve("isActive");
            a >= 100 && !c ? (b.store("isActive", !0), b.setStyle("display", "block"), b.setStyle.delay(1, b, ["top", 0])) : a < 100 && c && (b.store("isActive", !1), b.setStyle("top", -40), b.setStyle.delay(250, b, ["display", "none"]))
        }
    },
    scrollToTop: function (a) {
        a.preventDefault();
        this.scroller && this.scroller.start(0, 0)
    },
    setOffset: function (a) {
        this.playerOffset = parseInt(a.header);
        this.offset = parseInt(a.header + a.nav);
        this.wrapperEl.setStyle("margin-top", this.offset - 1)
    },
    _extractMeta: function (a, b) {
        if (!a) return null;
        var c = a.getFirst("." + b);
        return !c ? null : c.get("text")
    },
    updateContent: function (a) {
        var b = 0,
            c = 0,
            d = 0,
            e = !1,
            j = !1;
        this.tiles.each(function (f, g) {
            d = g + c;
            if (f.isActive || !(d >= this.clipsSelected.length)) {
                e = !1;
                this.colNum > 1 && this.infoboxFilters.contains(this.filter.type) && (g + 1) % this.colNum == 0 && (g + 1) / this.colNum <= this.infoboxHeight && (e = j = !0, c--);
                b = !f.inViewport || e && !f.isActive ? 0 : Math.min(this.clipsLoaded.length, parseInt(Math.random() * 3));
                for (var k = [], h = 0; h <= b; h++) {
                    var i = null;
                    h == 0 && !e ? i = this.clipsSelected[d] : e || (i = this.clipsLoaded.getRandom());
                    k.push(i)
                }
                f.updateContent(k, a)
            }
        }, this);
        this.resizeWrapper(a);
        if (j && this.isFirstInfobox) this.isFirstInfobox = !1, this.updateSize();
        this.colNum == 1 && window.scrollTo(0, 0)
    },
    filterClips: function (a, b, c, d) {
        d = d === !1 ? !1 : !0;
        fireEvent("history", [
            [a, b]
        ]);
        switch (a) {
            case "all":
                this.clipsSelected = this.clips;
                break;
            default:
                this.clipsSelected = [], this.clips.each(function (c) {
                    var d = c[a + "Key"],
                        f = typeOf(d);
                    (f == "string" && d == b || f == "array" && d.contains(b)) && this.clipsSelected.push(c)
                }, this)
        }
        this.filter = {
            type: a,
            key: b,
            name: c
        };
        this.updateContent(d);
        this.infoboxFilters.contains(this.filter.type) ? ((!window.infobox.coords || window.infobox.coords.left == 0) && this.updateInfoboxSize(), window.infobox.switchContent(a, b)) : window.infobox.hide(d)
    },
    resizeWrapper: function (a) {
        var b = this.infoboxFilters.contains(this.filter.type) ? this.clipsSelected.length + this.infoboxHeight : this.clipsSelected.length,
            b = Math.max(Math.ceil(b / this.colNum), this.infoboxHeight),
            b = Math.max(this.tileSize.y * b, this.viewportSize.y - this.offset - this.footerEl.getSize().y);
        a && this.colNum > 1 ? this.wrapperEl.tween.delay(250, this.wrapperEl, ["height", b]) : this.wrapperEl.setStyle("height", b)
    },
    enable: function () {
        window.allowDisposeForPerformance && (this.parentEl.grab(this.wrapperEl, "top"), this.wrapperEl.setStyle("display", "block"));
        this.footerEl.setStyle("display", "block");
        this.restoreScroll();
        this.updateSize();
        window.addEvent("resize", this.updateSize.bind(this));
        window.addEvent("scroll", this.updateScroll.bind(this))
    },
    disable: function () {
        window.removeEvent("resize", this.updateSize.bind(this));
        window.removeEvent("scroll", this.updateScroll.bind(this));
        this.footerEl.setStyle("display", "none");
        this.resetScroll();
        window.allowDisposeForPerformance && (this.wrapperEl.setStyle("display", "none"), this.wrapperEl.dispose())
    },
    registerTileHover: function (a) {
        this.tileHovered && this.tileHovered.hideOverlay();
        this.tileHovered = a
    },
    requestThumbLoad: function (a) {
        if (a.clip) if (a.clip && a.clip.thumbLoadStat == "loaded") a.loadThumb();
        else if (this.loadRequests.push(a), !this.loadControllerIntervalID) this.loadControllerIntervalID = this.loadController.periodical(50)
    },
    cancelThumbLoadRequest: function (a) {
        this.loadRequests.erase(a)
    },
    thumbLoadComplete: function (a) {
        this.loadQueue.erase(a);
        a.clip && this.clipsLoaded.push(a.clip)
    },
    loadController: function () {
        if (this.loadRequests.length < 1 && this.loadQueue.length < 1) clearInterval(this.loadControllerIntervalID),
        this.loadControllerIntervalID = null;
        this.loadQueue.each(function (a) {
            a.clip && a.clip.thumbLoadStat == "loaded" && this.loadQueue.erase(a)
        }, this);
        if (!(this.loadQueue.length >= this.loadMax) && !(this.loadRequests.length <= 0)) {
            var a = this.loadRequests.getRandom();
            this.loadRequests.erase(a);
            a.clip && (this.loadQueue.push(a), a.loadThumb())
        }
    },
    saveScroll: function () {
        this.scrollMemory = window.getScroll()
    },
    resetScroll: function () {
        window.scrollTo(0, 0)
    },
    restoreScroll: function () {
        window.isDesktop ? window.scrollTo(this.scrollMemory.x,
        this.scrollMemory.y) : setTimeout(function () {
            window.scrollTo(this.scrollMemory.x, this.scrollMemory.y)
        }.bind(this), 1)
    }
});
var Player = new Class({
    name: "Player",
    vjs: null,
    vjsState: {
        play: !1,
        fullscreen: !1,
        autoloop: !1,
        quality: "HQ"
    },
    clipInitialKey: null,
    updateInitialKey: !1,
    positionJumpTo: 0,
    isReady: !1,
    wrapperEl: null,
    contentObj: null,
    updateTimeout: null,
    videoContEl: null,
    overlayEl: null,
    infoEl: null,
    currentFilmEl: null,
    movieDescriptionEl: null,
    movieBackgroundEl: null,
    movieImagesEl: null,
    videoEl: null,
    movieTrailerEl: null,
    movieCastEl: null,
    movieDetailsEl: null,
    movieBackground: null,
    controlsEl: null,
    timelineEl: null,
    btnCloseEl: null,
    throttleEl: null,
    throttle: null,
    autoStart: !0,
    overlayTimeout: null,
    overlayLocked: !1,
    currentFilm: null,
    viewport: {
        x: 0,
        y: 0
    },
    wrapperHeight: 0,
    offset: 0,
    Binds: "_updateContent,onFilminfoTweenComplete,recalc,hide,showOverlay,hideOverlay,onOverlayFadeComplete,onKeyUp,lockOverlay,unlockOverlay,toggleTooltip,startThrottleDrag,togglePlay,skipToPrev,skipToNext,toggleVolume,toggleAutoloop,toggleQuality,toggleFullscreen,timeupdate,timelineClick,onLoadedMetadata,onLoadeddata,onPlay,onPause,onFullscreenToggle,onProgress,onTimeupdate,onEnded,onBgFadeComplete,onToggleTooltipComplete".split(","),
    initialize: function (a) {

        this.wrapperEl = a;
        this.overlayEl = this.wrapperEl.getFirst("div.overlay");

        this.infoEl = this.wrapperEl.getFirst(".videocont  > div.top > div.description > div.info");
	this.movieDescriptionEl = this.wrapperEl.getFirst(".videocont >  div.top > div.description > div.overview");
	this.movieCastEl = this.wrapperEl.getFirst(".videocont > div.bottom > div#togglearea > div.cast > ul");
	this.movieDetailsEl = this.wrapperEl.getFirst(".videocont  > div.bottom > div#togglearea > div.details > ul");
	this.movieBackgroundEl = this.wrapperEl.getFirst(".videocont > div.top");
	this.movieImagesEl = this.wrapperEl.getFirst(".videocont  > div.bottom > div#togglearea > div.gallery");
	this.purchaselinkEl = this.wrapperEl.getFirst(".videocont  > div.top > div.wrapper > div.what > a#purchaselink");
        this.videoContEl = this.wrapperEl.getFirst("div.videocont");
        this.btnCloseEl = this.overlayEl.getFirst("a.btnClose");
        this.btnCloseEl.removeProperty("href");
	this.videoEl = this.wrapperEl.getElement("#bigscreen");
        this.controlsEl = this.overlayEl.getFirst("div.controls");
	this.btnNextEl = this.movieBackgroundEl.getFirst("a.btn.next");
	this.btnPrevEl = this.movieBackgroundEl.getFirst("a.btn.prev");



        Cookie.read("videoQuality") == "SQ" && (this.controlsEl.getFirst(".btn.quality").set("text", "HQ is off"), this.toggleQuality());
        this.toggleAutoloop();

        window.isDesktop ? (window.isIpad && (this.controlsEl.getFirst(".btn.quality").destroy(), this.controlsEl.getFirst(".btn.sound").destroy()), this.wrapperEl.setStyle("position", "fixed"), this.wrapperEl.set("tween", {
            duration: 250,
            transition: Fx.Transitions.QuintInOut,
            onComplete: this.onBgFadeComplete
        }), this.overlayEl.set("tween", {
            duration: 250,
            onComplete: this.onOverlayFadeComplete
        }), this.infoEl.set("tween", {
            duration: 250,
            transition: Fx.Transitions.QuintInOut,
            onComplete: this.onFilminfoTweenComplete
        }), this.timelineEl = this.controlsEl.getFirst("div.timeline"),
        this.throttleEl = this.timelineEl.getFirst("div.throttle"), this.throttle = new Drag(this.throttleEl, {
            limit: {
                x: [0, 123],
                y: [0, 0]
            },
            onStart: this.startThrottleDrag,
            onDrag: this.timeupdate,
            onComplete: this.timeupdate
        }), this.controlsEl.getChildren("a.btn").each(function (a) {
            a.removeProperty("href")
        }), 
			    this.controlsEl.getChildren("a.btn").each(function (a, c) {
				this.addTooltip(a, c); 
        }, this)) : (this.wrapperEl.grab(this.btnCloseEl, "top"), this.controlsEl.destroy(), this.overlayEl.destroy())
    },
    addTooltip: function (a, b) {
        var c = new Element("div", {
            "class": "tooltip " + a.get("class").substr(4),
            text: a.get("text")
        });
        c.setStyles({
            bottom: 89,
            opacity: 0,
            display: "none"
        });
        b > 0 && c.addClass("right");
        c.set("morph", {
            duration: 350,
            transition: "quint:in:out",
            onComplete: this.onToggleTooltipComplete
        });
        a.tooltipEl = c;
        this.controlsEl.grab(c)
    },
    enable: function () {
        window.allowDisposeForPerformance && $("main").grab(this.wrapperEl, "after")
    },
    disable: function () {
        window.allowDisposeForPerformance && this.wrapperEl.dispose()
    },
    libReady: function (a) {
        a.addEvent("loadedmetadata", this.onLoadedMetadata);
        a.addEvent("loadeddata", this.onLoadeddata);
        a.addEvent("play", this.onPlay);
        a.addEvent("pause", this.onPause);
        window.isDesktop && (a.addEvent("progress", this.onProgress), a.addEvent("timeupdate", this.onTimeupdate));
        a.addEvent("ended", this.onEnded);
        this.vjs = a;
        Cookie.read("isMuted") == "true" && this.toggleVolume();
        this.disable()
    },
    recalc: function () {
        this.viewport = window.getSize();
        this.offset = window.isDesktop ? window.grid.playerOffset : 0;
        "standalone" in window.navigator && window.navigator.standalone && window.isIpad && this.offset++;
        var a, b;
        a = Math.min(this.viewport.x, 960);
        b = Math.floor(a * 0.5625);
        var c = 0;
        window.isDesktop ? (this.wrapperHeight = Math.max(this.viewport.y - this.offset, b), c = (this.viewport.y - this.offset - b) / 2) : (this.wrapperHeight = Math.max(this.viewport.y, b + 70), c = this.viewport.y > b + 70 ? (this.viewport.y - 70 - b) / 2 : 0);
        this.wrapperEl.setStyles({
            top: this.offset,
            height: this.wrapperHeight
        });
        this.vjs && this.vjs.size(a, b);
	var element = this.overlayEl.getFirst(".btnFullWidth").getSize();
	if (element.y < 10)         this.videoContEl.setStyle("padding-top", "63px"); else
        this.videoContEl.setStyle("padding-top", element.y);
        if (window.isDesktop) a = this.controlsEl.getChildren(".btn").length,
        b = parseInt(this.controlsEl.getFirst("a.btn").getStyle("margin-right")), a = this.viewport.x - ((a + 1) * (41 + b) - 21), this.timelineEl.setStyle("width", a), this.throttle.options.limit = {
            x: [0, a - 4],
            y: [0, 0]
        }, this.controlsEl.getChildren("a.btn").each(function (a) {
            var b = a.measure(function () {
                return this.getCoordinates()
            });
            a.tooltipEl.hasClass("right") ? a.tooltipEl.setStyle("right", this.viewport.x - b.left - Math.ceil(b.width / 2)) : a.tooltipEl.setStyle("left", b.left)
        }, this)
    },
    start: function (a, b) {
        this.updateInitialKey = !0;
        this.enable();
        this.btnCloseEl.getFirst("span.label").set("html", window.grid.filter.key ? window.grid.filter.name : "&nbsp;");
        this.show(b ? !0 : !1);
        this.infoEl.setStyle("left", this.infoEl.getSize().x * -1);
        (new Request.JSON({
            url: "/api/film/" + a.movieKey + "/",
            onSuccess: this._updateContent
        })).get({
            api_key: "12345",
            output: "json",
            seed: window.filmseed
        })
    },
    _updateContent: function (a) {
        if (a) this.contentObj = a;
        this.updateTimeout && (clearTimeout(this.updateTimeout), delete this.updateTimeout);

        if (this.vjs) {
            if (this.updateInitialKey) this.clipInitialKey = this.contentObj.key,
            this.updateInitialKey = !1;
            else if (this.currentFilm && this.contentObj.key == this.clipInitialKey) {
                fireEvent("history", [
                    ["film", ""]
                ]);
                this.hide();
                return
            }
            this.currentFilm = this.contentObj;
            fireEvent("history", [
                ["film", this.contentObj.key]
            ]);
            this.vjs.options.poster = this.contentObj.poster;
            window.isDesktop ? (this.infoEl.tween("left", this.infoEl.getSize().x * -1), this.timelineEl.getFirst("div.buffer").setStyle("width", 0), this.throttleEl.setStyle("left", 0)) : this.updateFilminfo();
            this._updateSrc()
        } else this.updateTimeout = setTimeout(this._updateContent, 250)
    },
    _updateSrc: function () {
        if (this.vjs) {
            var a = this.getSrcKey(),
                b = [];
	    if (this.contentObj[a].mp4!= null) 
            this.contentObj[a].mp4 && b.push({
                type: "video/mp4",
                src: "/html5/winter.mp4" //this.contentObj[a].mp4
            });

            this.contentObj[a].ogg && b.push({
                type: "video/ogg",
                src: "/_video/" + this.contentObj[a].ogg
            });
            this.contentObj[a].webm && b.push({
                type: "video/webm",
                src: "/_video/" + this.contentObj[a].webm
            });
            this.vjs.src(b)
        }
    },
    onFilminfoTweenComplete: function () {
        parseInt(this.infoEl.getStyle("left")) >= 0 || this.updateFilminfo()
    },
    updateFilminfo: function (a) {
        this.infoEl.empty();
	this.movieDescriptionEl.empty();
	this.movieDetailsEl.empty();
	this.movieCastEl.empty();
	this.movieImagesEl.empty();

	if (this.currentFilm == null) return false;
	this.addDescription(this.currentFilm.overview);
	this.addCast(this.currentFilm.credits);
	this.currentFilmEl = this.currentFilm.id;
	this.addImages(this.currentFilm.images.backdrop);
	this.addDetails("Resissoor:", this.currentFilm.director);

	this.addDetails("Aasta:", this.currentFilm.year);
	this.addDetails("Kestvus:", this.currentFilm.runtime + " min");
	this.addDetails("IMDB:", this.currentFilm.imdbrating);
	

	this.addDetails("Kategooriad:", Array.join(this.currentFilm.genres,','),null,"right");
	this.addDetails("Keeled:", Array.join(this.currentFilm.languages,','),null);

	this.addDetails("Riik:", Array.join(this.currentFilm.countries,','),null);
	this.addDetails("Subtiitrid:", Array.join(this.currentFilm.subtitles,','),null);
	

	    
	    var trailerlink = $$("#trailerlink");
	    $('trailerlink').setAttribute("href", this.currentFilm.trailers[0]);

	this.purchaselinkEl.addEvent('click', this.watchFilm);
	

	this.movieBackgroundEl.setStyle('background-image', 'url('+this.currentFilm.poster+')');
        a || (this.addInfo(this.currentFilm.director_name, "h1"), this.addInfo(this.currentFilm.client_name), this.addInfo(this.currentFilm.name), this.addInfo(this.currentFilm.agency_name), window.isDesktop ? (this.infoEl.setStyle("left", this.infoEl.getSize().x * -1), this.infoEl.tween("left", 0)) : this.infoEl.setStyle("left", 0))
    },

    addDescription: function(a, b) {
        if (a) {
	    var div= new Element("div");
	    
	    var c = new Element(b || "p");
            c.set("text", a);
            this.movieDescriptionEl.grab(c)

	}

    },

    watchFilm: function(a) {
	a.preventDefault();

	
	var id = window.player.currentFilmEl;

	if (!id) return false;
	var myRequest = new Request({
	    url: '/site/watch/'+id,
	    method: 'get',
	    onRequest: function(){
		
	    },
	    onSuccess: function(responseText){


		
		

	    },

	    onFailure: function(){
		alert('Sorry, your request failed :(');
	    }
	});
	
	    myRequest.send(id);
	
	return false;
    },

    addCast: function(cast,b) {
	var movieCastEl = this.movieCastEl;
        if (cast) {

	    Array.each(cast, function(a) { 
	    var li = new Element("li");
		var name = new Element(b || "div.castitem").setStyle("display","block");

	    var img = new Element(b || "img");
		if (a.image != "" && a.image != null)
		    img.set("src", a.image);
		else
		    img.set("src", "/_img/nopic.jpg");
	    var div = new Element("div");

	    var char = new Element(b || "div");
            char.set("text", a.character);
            div.set("text", a.name);		
		name.adopt(img);
		name.adopt(div);
		li.adopt(name);
		
		movieCastEl.grab(li);
	    });

	}

    },
    addImages: function(images,b) {

        if (images) {
	    var movieImagesEl = this.movieImagesEl;
	    var currentMovie = this.currentFilm;
	    Array.each(images, function(a) { 
		var link = new Element(b || "a");
		link.setAttribute("rel", "diabox[covers]");
		link.setAttribute("title", currentMovie.title);
		link.setAttribute("href", a);
		movieImagesEl.setStyle("display", "none");
		var img = new Element(b || "img");
		if (a != "" && a != null)
		    img.set("src", a);
		else
		    img.set("src", "/_img/nopic.jpg");


		link.adopt(img);
		movieImagesEl.grab(link);
	    });

	    diabox_close();

	    
	}

    },


    addDetails: function(a,val,b,cls) {

	if (a) {
	    var c = new Element (b || "span.title");
	    c.set("text", a );
	    var d = new Element("span.value");
	    d.set("text", val);
	    if (cls) {	    var li = new Element("li."+cls); } else 
	    var li = new Element("li");
	    li.adopt(c);
	    li.adopt(d);
	    
	    this.movieDetailsEl.grab(li);
	}

	},

    addInfo: function (a, b) {
        if (a) {
            var c = new Element(b || "p");
            c.set("text", a);
            this.infoEl.grab(c)
        }
    },
    getSrcKey: function () {
        return window.isDesktop && !window.isIpad ? this.vjsState.quality == "HQ" ? "src_hq" :
            "src_sq" : window.screenSize.width * (window.devicePixelRatio ? window.devicePixelRatio : 1) >= 960 ? "src_ml" : "src_ms"
    },
    enableControls: function() {
	if (this.controlsEl) {
	var controls = this.controlsEl;

	    this.btnNextEl.fade('out');
	    this.btnPrevEl.fade('out');
	    controls.tween("display", "block").setStyle("z-index", "10");
	    this.lockOverlay();
	}
    },

    disableControls: function() {
	if (this.controlsEl) {
	var controls = this.controlsEl;
	    controls.fade('out').tween("display", "none");
	    this.btnNextEl.fade('in');
	    this.btnPrevEl.fade('in');

	    this.unlockOverlay();
	}
    },


    switchToVideo: function() {

	if (this.videoEl) {
	    var video = this.videoEl.parentNode;
	    
	    video.fade('in').setStyle("width", "100%").setStyle("height", "100%").setStyle("z-index", "6").tween("display", "block").setStyle("opacity", "1");
	    this.enableControls();
	}

    },

    switchToBrowser: function() {

	if (this.videoEl) {
	    var video = this.videoEl.parentNode;
	    video.fade('out').setStyle("z-index", "1").setStyle("display","none");
	    this.disableControls();
	}

    },

    unloadContent: function () {
        this.vjs && this.vjs.pause();
        this.clipInitialKey = this.currentFilm = null
    },
    show: function (a) {
        a = a === !1 ? !1 : !0;
        window.grid.saveScroll();
        this.autoStart = window.isDesktop ? !0 : !1;
        this.recalc();
        window.addEvent("resize", this.recalc);
        window.isDesktop ? (this.wrapperEl.setStyles({
            height: 0,
            display: "block"
        }), this.overlayEl.setStyle("opacity", 0), this.controlsEl.setStyle("opacity", 1), window.isIpad || !a ? (this.wrapperEl.setStyle("height", this.wrapperHeight), this.onBgFadeComplete()) : this.wrapperEl.tween("height", this.wrapperHeight)) : (this.wrapperEl.setStyles({
            height: this.wrapperHeight,
            display: "block"
        }), this.overlayEl.setStyle("display", "block"), window.scrollTo(0, 0), this.onBgFadeComplete())
    },
    hide: function (a) {
        a && a.preventDefault();
        this.vjs && this.vjs.pause();
        window.grid.enable();
        a && fireEvent("history", [
            ["film", ""]
        ]);
	this.switchToBrowser();
	console.log("Closing video..");

        window.isDesktop ? (this.controlsEl.setStyle("opacity", 0), window.isIpad ? (this.wrapperEl.setStyle("height",
        0), this.onBgFadeComplete()) : this.wrapperEl.tween("height", 0)) : (this.wrapperEl.setStyle("height", 0), this.onBgFadeComplete())
    },

    onBgFadeComplete: function () {
        (this.isReady = parseInt(this.wrapperEl.getStyle("height")) > 0) ? (window.grid.disable(), this.btnCloseEl.addEvent("click", this.hide), window.isDesktop && (this.wrapperEl.addEvent("mousemove", this.showOverlay), this.controlsEl.getFirst("a.btn.fullscreen").addEvent('click', this.toggleFullscreen),this.controlsEl.getFirst("a.btn.play").addEvent("click", this.togglePlay),this.movieBackgroundEl.getFirst("a.btn.prev").addEvent("click",this.skipToPrev),this.movieBackgroundEl.getFirst("a.btn.next").addEvent("click",this.skipToNext),this.timelineEl.addEvent("click", this.timelineClick), window.isIpad ? this.showOverlay() : (this.controlsEl.getFirst("a.btn.sound").addEvent("click", this.toggleVolume), this.controlsEl.getFirst("a.btn.quality").addEvent("click", this.toggleQuality), this.controlsEl.addEvents({
            mouseenter: this.lockOverlay,
            mouseleave: this.unlockOverlay
        }), this.btnCloseEl.addEvents({
            mouseenter: this.lockOverlay,
            mouseleave: this.unlockOverlay
        }), window.addEvent("keyup", this.onKeyUp), this.controlsEl.getFirst("a.btn.play").addEvents({
            mouseover: this.toggleTooltip,
            mouseout: this.toggleTooltip
        }), this.controlsEl.getFirst("a.btn.sound").addEvents({
            mouseover: this.toggleTooltip,
            mouseout: this.toggleTooltip
        }), this.movieBackgroundEl.getFirst("a.btn.prev").addEvents({
            mouseover: this.toggleTooltip,
            mouseout: this.toggleTooltip
        }), this.movieBackgroundEl.getFirst("a.btn.next").addEvents({
            mouseover: this.toggleTooltip,
            mouseout: this.toggleTooltip
        }), this.controlsEl.getFirst("a.btn.quality").addEvents({
            mouseover: this.toggleTooltip,
            mouseout: this.toggleTooltip
        })))) : (this.unloadContent(), this.updateFilminfo(!0),
        this.wrapperEl.setStyle("display", "none"), this.btnCloseEl.removeEvent("click", this.hide), window.removeEvent("resize", this.recalc), window.isDesktop && (this.unlockOverlay(), this.wrapperEl.removeEvent("mousemove", this.showOverlay), this.controlsEl.removeEvents(), this.btnCloseEl.removeEvents(), window.removeEvent("keyup", this.onKeyUp), this.controlsEl.getFirst("a.btn.play").removeEvents(), this.btnPrevEl.removeEvents(), this.btnNextEl.removeEvents(), this.timelineEl.removeEvents(),
        window.isIpad || (this.controlsEl.getFirst("a.btn.quality").removeEvents(), this.controlsEl.getFirst("a.btn.sound").removeEvents())), this.disable())
    },
    onKeyUp: function (a) {
        switch (a.key) {
            case "esc":
                this.hide(a);
                break;
            case "space":
                this.togglePlay(a);
                break;
            case "left":
                this.skipToPrev(a);
                break;
            case "right":
                this.skipToNext(a)
        }
    },
    showOverlay: function () {
        this.overlayEl.getStyle("opacity") > 0 || (this.overlayEl.setStyle("display", "block"), this.overlayEl.tween("opacity", 1), this.autoHideOverlay())
    },
    hideOverlay: function () {
        this.overlayLocked || this.overlayEl.tween("opacity", 0)
    },
    autoHideOverlay: function () {
        this.overlayTimeout && (clearTimeout(this.overlayTimeout), delete this.overlayTimeout);
        if (!this.overlayLocked) this.overlayTimeout = setTimeout(this.hideOverlay, window.isIpad ? 4E3 : 2E3)
    },
    onOverlayFadeComplete: function () {
        this.overlayEl.getStyle("opacity") <= 0 && this.overlayEl.setStyle("display", "none")
    },
    lockOverlay: function () {
        this.overlayLocked = !0
    },
    unlockOverlay: function () {
        this.overlayLocked = !1;
        this.autoHideOverlay()
    },
    toggleTooltip: function (a) {
        a.target.tooltipEl && (a.target.tooltipEl.setStyle("display", "block"), a.target.tooltipEl.morph({
            opacity: a.type == "mouseout" ? 0 : 1,
            bottom: a.type == "mouseout" ? 89 : 69
        }))
    },
    onToggleTooltipComplete: function (a) {
        a.getStyle("opacity") <= 0 && a.setStyle("display", "none")
    },
    startThrottleDrag: function () {
        this.vjs && this.vjs.pause();
        this.throttleEl.addClass("dragging")
    },
    togglePlay: function (a) {
        a && a.preventDefault();
        if (this.vjs) this.vjsState.play ? (this.vjs.pause(), this.autoStart = !1) : (this.vjs.play(), this.autoStart = !0)
    },
    skipToPrev: function (a) {
        a && a.preventDefault();
        if (this.vjs && this.vjs.currentTime() > 2) this.vjs.currentTime(0.1);
        else {
            if (this.currentFilm.key == this.clipInitialKey) this.updateInitialKey = !0;
            var a = window.grid.filter.type ? window.grid.filter.type : "all",
                b = window.grid.filter.key ? window.grid.filter.key : "null";
            (new Request.JSON({
                url: "/api/film/" + this.currentFilm.key + "/",
                onSuccess: this._updateContent
            })).get({
                filterType: a,
                filterKey: b,
                find: "prev",
                api_key: "12345",
                seed: window.filmseed,
                output: "json"
            })
        }
    },
    skipToNext: function (a) {
        a && a.preventDefault();
        this.autoStart = !0;
        var a = window.grid.filter.type ? window.grid.filter.type : "all",
            b = window.grid.filter.key ? window.grid.filter.key : "null";
        (new Request.JSON({
            url: "/api/film/" + this.currentFilm.key + "/",
            onSuccess: this._updateContent
        })).get({
            api_key: "12345",
            filterType: a,
            filterKey: b,
            find: "next",
            seed: window.filmseed,
            output: "json"
        })
    },
    toggleVolume: function (a) {
        a && a.preventDefault();
        this.vjs && (this.vjs.volume() > 0 ? (this.wrapperEl.addClass("isMuted"), this.vjs.volume(0)) : (this.wrapperEl.removeClass("isMuted"), this.vjs.volume(1)), Cookie.write("isMuted",
        this.vjs.volume() == 0, {
            duration: 180
        }))
    },
    toggleAutoloop: function (a) {
        a && a.preventDefault();
        this.vjsState.autoloop ? (this.wrapperEl.removeClass("isAutoLooped"), this.vjsState.autoloop = !1) : (this.wrapperEl.addClass("isAutoLooped"), this.vjsState.autoloop = !0)
    },
    toggleQuality: function (a) {
        a && a.preventDefault();
        a = "";
        this.vjsState.quality == "SQ" ? (this.wrapperEl.removeClass("isSq"), this.vjsState.quality = "HQ", a = "HQ is on") : (this.wrapperEl.addClass("isSq"), this.vjsState.quality = "SQ", a = "HQ is off");
        var b = this.controlsEl.getFirst("div.tooltip.quality");
        b && b.set("text", a);
        Cookie.write("videoQuality", this.vjsState.quality, {
            duration: 180
        });
        if (this.vjs) this.positionJumpTo = Math.max(this.vjs.currentTime(), 0.1), this._updateSrc()
    },
    toggleFullscreen: function (a) {
        a && a.preventDefault();
        this.vjs && (this.vjsState.fullscreen ? this.vjs.cancelFullScreen() : this.vjs.requestFullScreen())
    },
    timeupdate: function (a, b) {
        this.vjs && (this.vjs.currentTime((this.throttleEl.getPosition(this.timelineEl).x + 17) / (this.timelineEl.getSize().x - 4) * this.vjs.duration()), b.type == "mouseup" && (this.throttleEl.removeClass("dragging"),
        this.autoStart && this.vjs.play()))
    },
    timelineClick: function (a) {
        this.vjs && (a.target.hasClass("throttle") || this.vjs.currentTime((a.client.x - this.timelineEl.getPosition().x) / this.timelineEl.getSize().x * this.vjs.duration()))
    },
    onPlay: function () {
        this.wrapperEl.addClass("isPlaying");
        this.vjsState.play = !0;
        var a = this.controlsEl.getFirst("div.tooltip.play");
        a && a.set("text", "pause")
    },
    onLoadedMetadata: function () {
        this.positionJumpTo > 0 && this.vjs.currentTime(this.positionJumpTo);
        this.positionJumpTo = 0
    },
    onLoadeddata: function () {
        this.autoStart && this.vjs.play()
    },
    onPause: function () {
        this.wrapperEl.removeClass("isPlaying");
        this.vjsState.play = !1;
        var a = this.controlsEl.getFirst("div.tooltip.play");
        a && a.set("text", "play")
    },
    onFullscreenToggle: function () {
        this.vjsState.fullscreen = !this.vjsState.fullscreen
    },
    onProgress: function () {
        this.timelineEl.getFirst("div.buffer").setStyle("width", this.vjs.bufferedPercent() * 100 + "%")
    },
    onTimeupdate: function () {
        this.throttleEl.hasClass("dragging") || this.throttleEl.setStyle("left", this.vjs.currentTime() / this.vjs.duration() * 100 + "%")
    },
    onEnded: function () {
        this.vjsState.autoloop && (this.throttleEl.hasClass("dragging") || this.currentFilm && this.skipToNext())
    }
});
var CompanyScroller = new Class({
    name: "Company Scroller",
    contentEl: null,
    menuEls: null,
    menuElSelected: null,
    addressTimeout: null,
    isAutoScrolling: !1,
    contentScroller: null,
    contentOffset: 0,
    colNum: 1,
    Binds: ["scrollToSection", "scrollAddressTimer", "moveAddress", "contentScrollComplete", "recalc"],
    initialize: function (a, b) {
        this.contentEl = a;
        this.menuEls = b;
        this.addressEl = a.getFirst("div.col.second");
        this.contentScroller = new Fx.Scroll(window, {
            transition: "sine:in:out",
            duration: 250,
            wheelStops: !1,
            link: "cancel",
            onComplete: this.contentScrollComplete
        });
        this.addressEl.set("tween", {
            transition: "sine:in:out",
            duration: 250,
            link: "cancel"
        });
        this.menuEls.each(function (a) {
            a.addEvent("click", this.scrollToSection)
        }, this);
        this.recalc();
        window.addEvent("resize", this.recalc);
        window.addEvent("scroll", this.scrollAddressTimer)
    },
    scrollToSection: function (a) {
        a.preventDefault();
        this.menuElSelected && this.menuElSelected.removeClass("selected");
        this.menuElSelected = a.target;
        this.menuElSelected.addClass.delay(500, this.menuElSelected, "selected");
        this.isAutoScrolling = !0;
        a = $(a.target.get("href").substr(1)).getPosition().y;
        a -= this.viewportWidth >= window.menuGrid[1].minWidth ? this.contentOffset : 0;
        this.contentScroller.start(0, a);
        this.colNum < 2 || this.addressEl.tween("margin-top", a)
    },
    contentScrollComplete: function () {
        this.isAutoScrolling = !1
    },
    moveAddress: function () {
        if (this.colNum < 2) this.addressEl.setStyle("margin-top", 0);
        else {
            var a = parseInt(this.addressEl.getStyle("margin-top")) - window.getScroll().y,
                b = Math.max(0, window.getScroll().y);
            a > 0 && this.addressEl.tween("margin-top", b)
        }
    },
    scrollAddressTimer: function () {
        this.menuElSelected && this.menuElSelected.removeClass("selected");
        this.addressTimeout && (clearTimeout(this.addressTimeout), delete this.addressTimeout);
        if (!this.isAutoScrolling) this.addressTimeout = setTimeout(this.moveAddress, 100)
    },
    recalc: function () {
        var a = window.getSize().x;
        if (window.innerWidth && window.innerWidth > a) a = window.innerWidth;
        this.viewportWidth = a;
        for (var b = 1, c = 0; c < window.companyGrid.length; c++) if (a >= window.companyGrid[c].minWidth) b = window.companyGrid[c].colNum;
        this.colNum != b && b < 2 && (this.addressEl.setStyle("margin-top", 0), window.scrollTo(0, 0));
        this.colNum = b;
        this.contentOffset = parseInt(this.contentEl.getStyle("margin-top")) + 4
    }
});
var NewsletterCtrl = new Class({
    Implements: Options,
    options: {
        msgDelay: 3E3
    },
    initialize: function (a) {
        this.form = a;
        this.inputEmail = a.getFirst("div input[name=email]");
        this.inputValueDefault = "Your Email";
        this.msgEl = new Element("p", {
            id: "newsletterForm",
            "class": "usrMsg"
        });
        this.bHideMsg = this.hideMsg.bind(this);
        this.msgEl.addEvent("click", this.bHideMsg);
        this.timeOut = null;
        this.request = new Request({
            timeout: 15E3,
            url: "/newsletter/",
            onComplete: function (a) {
                this.ctrlRef.showMsg(a)
            },
            onCancel: function () {
                this.ctrlRef.showMsg("Request cancelled. Please try again.")
            },
            onSuccess: function () {
                this.ctrlRef.onSuccess()
            },
            onFailure: function () {
                this.ctrlRef.showMsg("Huston, we've had a problem. Please check your input and try again.")
            },
            onException: function () {
                this.ctrlRef.showMsg("Huston, we've had a problem. Please check your input and try again.")
            },
            onTimeout: function () {
                this.ctrlRef.showMsg("Time out. Please try again.")
            }
        });
        this.request.ctrlRef = this;
        this.bInputFocus = this.inputFocus.bind(this);
        this.inputEmail.addEvent("focus", this.bInputFocus);
        this.bInputBlur = this.inputBlur.bind(this);
        this.inputEmail.addEvent("blur", this.bInputBlur);
        this.bSubmit = this.submit.bind(this);
        this.form.addEvent("submit", this.bSubmit)
    },
    inputFocus: function (a) {
        a.target.get("value").clean() == this.inputValueDefault && a.target.set("value", "")
    },
    inputBlur: function (a) {
        a.target.get("value").clean() == "" && a.target.set("value", this.inputValueDefault)
    },
    submit: function (a) {
        a.stop();
        a.stopPropagation();
        a = this.inputEmail.get("value");
        if (!this.emailIsValid(a)) return this.showMsg("Email is invalid, please check!"), !1;
        this.msgEl.set("html",
            "Just a sec\u2026");
        this.msgEl.addClass("wait");
        this.msgEl.replaces($("newsletterForm"));
        this.request.send({
            data: {
                style: "ajax",
                action: "add",
                email: a
            }
        })
    },
    showMsg: function (a) {
        this.msgEl.set("html", a);
        this.msgEl.removeClass("wait");
        this.msgEl.replaces($("newsletterForm"));
        if (this.timeOut) this.timeOut = window.clearTimeout(this.timeOut);
        this.timeOut = window.setTimeout(this.hideMsg.bind(this), this.options.msgDelay)
    },
    hideMsg: function () {
        if (this.timeOut) this.timeOut = window.clearTimeout(this.timeOut);
        this.form.replaces(this.msgEl)
    },
    onSuccess: function () {
        this.inputEmail.set("value", this.inputValueDefault)
    },
    emailIsValid: function (a) {
        return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(a)
    }
});

function css_browser_selector(d) {
    var b = d.toLowerCase(),
        a = function (a) {
            return b.indexOf(a) > -1
        }, d = document.documentElement,
        a = [!/opera|webtv/i.test(b) && /msie\s(\d)/.test(b) ? "ie ie" + RegExp.$1 : a("firefox/2") ? "gecko ff2" : a("firefox/3.5") ? "gecko ff3 ff3_5" : a("firefox/3.6") ? "gecko ff3 ff3_6" : a("firefox/3") ? "gecko ff3" : a("gecko/") ? "gecko" : a("opera") ? "opera" + (/version\/(\d+)/.test(b) ? " opera" + RegExp.$1 : /opera(\s|\/)(\d+)/.test(b) ? " opera" + RegExp.$2 : "") : a("konqueror") ? "konqueror" : a("blackberry") ? "mobile blackberry" : a("android") ? "mobile android" : a("chrome") ? "webkit chrome" : a("iron") ? "webkit iron" : a("applewebkit/") ? "webkit safari" + (/version\/(\d+)/.test(b) ? " safari" + RegExp.$1 : "") : a("mozilla/") ? "gecko" : "", a("j2me") ? "mobile j2me" : a("iphone") ? "mobile iphone" : a("ipod") ? "mobile ipod" : a("ipad") ? "mobile ipad" : a("mac") ? "mac" : a("darwin") ? "mac" : a("webtv") ? "webtv" : a("win") ? "win" + (a("windows nt 6.0") ? " vista" : "") : a("freebsd") ? "freebsd" : a("x11") || a("linux") ? "linux" : "", "js"];
    c = a.join(" ");
    d.className += " " + c;
    window.clientTag = a;
    return c
}
css_browser_selector(navigator.userAgent);
window.allowDisposeForPerformance = window.clientTag[0] == "ie ie8" || window.clientTag[0] == "ie ie7" ? !1 : !0;
window.menuGrid = [{
    minWidth: 0,
    colNum: 1
}, {
    minWidth: 640,
    colNum: 2
}, {
    minWidth: 768,
    colNum: 3
}, {
    minWidth: 1200,
    colNum: 4
}, {
    minWidth: 1400,
    colNum: 5
}];
window.thumbGrid = [{
    minWidth: 0,
    colNum: 1
}, {
    minWidth: 600,
    colNum: 2
}, {
    minWidth: 900,
    colNum: 3
}, {
    minWidth: 1200,
    colNum: 4
}, {
    minWidth: 1600,
    colNum: 5
}];
window.companyGrid = [{
    minWidth: 0,
    colNum: 1
}, {
    minWidth: 768,
    colNum: 2
}];
window.addEvent("domready", function () {
    window.isDesktop = !(/android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|playbook|silk/i.test(navigator.userAgent || navigator.vendor || window.opera) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test((navigator.userAgent || navigator.vendor || window.opera).substr(0, 4)));
    window.isIpad = navigator.userAgent.match(/iPad/i);
    window.isIphone = navigator.userAgent.match(/iP(hone|od)/i);
    window.isIos = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
    window.screenSize = {
        width: Math.max(screen.width, screen.height),
        height: Math.min(screen.width, screen.height)
    };
    var d = null,
        b = $("logo-overlay"),
        a = function () {
            d && (clearTimeout(d), delete d);
            b.tween("opacity", 0)
        };
    window.removeLogo = function () {
        b.destroy()
    };
    Cookie.read("hideLogo") ? window.removeLogo() : (b.set("tween", {
        onComplete: window.removeLogo
    }), b.addEvent("click", a), $("logo-overlay").setStyle("display", "block"), d = setTimeout(a, 5E3), Cookie.write("hideLogo", "true", {
        duration: 0.04166666666667
    }));
    $(document.body).getElements("a").each(function (a) {
        a.getProperty("href") && a.getProperty("rel") == "external" && a.setProperty("target", "_blank")
    });
    navigator.userAgent.match(/iP(ad|hone|od)/i) && $("navTop").getElements("a").each(function (a) {
        a.addEventListener("click", function (b) {
            b.preventDefault();
            document.location.href = a.get("href")
        })
    })
});
window.log = function () {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        var a = arguments;
        a.callee = a.callee.caller;
        a = [].slice.call(a);
        typeof console.log === "object" ? log.apply.call(console.log, console, a) : console.log.apply(console, a)
    }
};
(function (a) {
    function c() {}
    for (var d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), b; b = d.pop();) a[b] = a[b] || c
})(function () {
    try {
        return console.log(), window.console
    } catch (a) {
        return window.console = {}
    }
}());

