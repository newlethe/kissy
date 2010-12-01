/*
 * @module kissy
 * @author lifesinger@gmail.com
 */
(function(S, undefined) {

    var meta = {
        /**
         * Copies all the properties of s to r.
         * @return {Object} the augmented object
         */
        mix: function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (ov === undefined) ov = true;
            var i, p, l;

            if (wl && (l = wl.length)) {
                for (i = 0; i < l; i++) {
                    p = wl[i];
                    if (p in s) {
                        if (ov || !(p in r)) {
                            r[p] = s[p];
                        }
                    }
                }
            } else {
                for (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }
            return r;
        }
    };
    
    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
    var host = this, seed = host[S], guid = 0,
        S = (seed && seed.mix) ? seed : meta.mix(seed || (host[S]={}), meta, false, ['mix']), // shortcut
        EMPTY = '';

    S.mix(S, {
        /**
         * S.app() with these members.
         */
        __APP_MEMBERS: ['__init', 'namespace'],
        __APP_HOST: host,

        /**
         * The version of the library.
         * @type {String}
         */
        version: '@VERSION@',

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge: function() {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; ++i) {
                S.mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment: function(/*r, s1, s2, ..., ov, wl*/) {
            var args = arguments, len = args.length - 2,
                r = args[0], ov = args[len], wl = args[len + 1],
                i = 1;

            if (!S.isArray(wl)) {
                ov = wl;
                wl = undefined;
                len++;
            }

            if (!S.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for (; i < len; i++) {
                S.mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                    function F() {
                    }

                    F.prototype = o;
                    return new F();
                },
                sp = s.prototype,
                rp = O(sp);

            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                S.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                S.mix(r, sx);
            }

            return r;
        },

/****************************************************************************************

 *                            The kissy system framework.                               *

 ****************************************************************************************/

        /**
         * Debug is off by defult.
         */
        Config: { debug: false },

        /**
         * Initializes KISSY environment.
         */
        __init: function() {
            this.Env = {
                mods: { }, // all mods
                _loadQueue: { } // infomation for mods
            };
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * S.namespace('TB.app.Shop', true); // returns TB.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace: function() {
            var args = arguments, l = args.length,
                o = null, i, j, p,
                global = (args[l - 1] === true && l--);

            for (i = 0; i < l; ++i) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app: function(name, sx) {
            var isStr = S.isString(name),
                O = isStr ? host[name] || { } : name;

            S.mix(O, this, true, S.__APP_MEMBERS);
            O.__init();

            S.mix(O, S.isFunction(sx) ? sx() : sx);
            isStr && (host[name] = O);

            return O;
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         */
        log: function(msg, cat, src) {
            if (S.Config.debug) {
                if (src) {
                    msg = src + ': ' + msg;
                }
                if (host['console'] !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
        },

        /**
         * Throws error message.
         */
        error: function(msg) {
            if (S.Config.debug) {
                throw msg;
            }
        },

        /*
         * Generate a global unique id.
         * @param pre {String} optional guid prefix
         * @return {String} the guid
         */
        guid: function(pre) {
            return (pre || EMPTY) + guid++; 
        }
    });

    S.__init();

})('KISSY');

/**
 * NOTES:
 *
 * 2010/12
 *  - 周爱民老师（aimingoo）对
 *
 * 2010/08
 *  - 将 loader 功能独立到 loader.js 中
 *
 * 2010/07
 *  - 增加 available 和 guid 方法
 *
 * 2010/04
 *  - 移除掉 weave 方法，鸡肋
 *
 * 2010/01
 *  - add 方法决定内部代码的基本组织方式（用 module 和 submodule 来组织代码）
 *  - ready, available 方法决定外部代码的基本调用方式，提供了一个简单的弱沙箱
 *  - S.mix, merge, augment, extend 方法，决定了类库代码的基本实现方式，充分利用 mixin 特性和 prototype 方式来实现代码
 *  - namespace, app 方法，决定子库的实现和代码的整体组织
 *  - log, error 方法，简单的调试工具和报错机制
 *  - guid 方法，全局辅助方法
 *  - 考虑简单够用和 2/8 原则，去掉对 YUI3 沙箱的模拟。（archives/2009 r402）
 *
 */