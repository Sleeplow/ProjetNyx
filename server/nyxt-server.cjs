"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target2, all) => {
  for (var name in all)
    __defProp(target2, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type2 = typeof val;
      if (type2 === "string" && val.length > 0) {
        return parse(val);
      } else if (type2 === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type2 = (match[2] || "ms").toLowerCase();
      switch (type2) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports2, module2) {
    function setup2(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug3(...args) {
          if (!debug3.enabled) {
            return;
          }
          const self = debug3;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug3.namespace = namespace;
        debug3.useColors = createDebug.useColors();
        debug3.color = createDebug.selectColor(namespace);
        debug3.extend = extend;
        debug3.destroy = createDebug.destroy;
        Object.defineProperty(debug3, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug3);
        }
        return debug3;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup2;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports2, module2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports2.storage.getItem("debug") || exports2.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports2, module2) {
    var tty = require("tty");
    var util = require("util");
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports2.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = require("supports-color");
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports2.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports2.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports2.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports2.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug3) {
      debug3.inspectOpts = {};
      const keys = Object.keys(exports2.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug3.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/detect-libc/lib/process.js
var require_process = __commonJS({
  "node_modules/detect-libc/lib/process.js"(exports2, module2) {
    "use strict";
    var isLinux = () => process.platform === "linux";
    var report = null;
    var getReport = () => {
      if (!report) {
        if (isLinux() && process.report) {
          const orig = process.report.excludeNetwork;
          process.report.excludeNetwork = true;
          report = process.report.getReport();
          process.report.excludeNetwork = orig;
        } else {
          report = {};
        }
      }
      return report;
    };
    module2.exports = { isLinux, getReport };
  }
});

// node_modules/detect-libc/lib/filesystem.js
var require_filesystem = __commonJS({
  "node_modules/detect-libc/lib/filesystem.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var LDD_PATH = "/usr/bin/ldd";
    var SELF_PATH = "/proc/self/exe";
    var MAX_LENGTH = 2048;
    var readFileSync = (path2) => {
      const fd = fs2.openSync(path2, "r");
      const buffer = Buffer.alloc(MAX_LENGTH);
      const bytesRead = fs2.readSync(fd, buffer, 0, MAX_LENGTH, 0);
      fs2.close(fd, () => {
      });
      return buffer.subarray(0, bytesRead);
    };
    var readFile = (path2) => new Promise((resolve, reject) => {
      fs2.open(path2, "r", (err, fd) => {
        if (err) {
          reject(err);
        } else {
          const buffer = Buffer.alloc(MAX_LENGTH);
          fs2.read(fd, buffer, 0, MAX_LENGTH, 0, (_, bytesRead) => {
            resolve(buffer.subarray(0, bytesRead));
            fs2.close(fd, () => {
            });
          });
        }
      });
    });
    module2.exports = {
      LDD_PATH,
      SELF_PATH,
      readFileSync,
      readFile
    };
  }
});

// node_modules/detect-libc/lib/elf.js
var require_elf = __commonJS({
  "node_modules/detect-libc/lib/elf.js"(exports2, module2) {
    "use strict";
    var interpreterPath = (elf) => {
      if (elf.length < 64) {
        return null;
      }
      if (elf.readUInt32BE(0) !== 2135247942) {
        return null;
      }
      if (elf.readUInt8(4) !== 2) {
        return null;
      }
      if (elf.readUInt8(5) !== 1) {
        return null;
      }
      const offset = elf.readUInt32LE(32);
      const size = elf.readUInt16LE(54);
      const count = elf.readUInt16LE(56);
      for (let i = 0; i < count; i++) {
        const headerOffset = offset + i * size;
        const type2 = elf.readUInt32LE(headerOffset);
        if (type2 === 3) {
          const fileOffset = elf.readUInt32LE(headerOffset + 8);
          const fileSize = elf.readUInt32LE(headerOffset + 32);
          return elf.subarray(fileOffset, fileOffset + fileSize).toString().replace(/\0.*$/g, "");
        }
      }
      return null;
    };
    module2.exports = {
      interpreterPath
    };
  }
});

// node_modules/detect-libc/lib/detect-libc.js
var require_detect_libc = __commonJS({
  "node_modules/detect-libc/lib/detect-libc.js"(exports2, module2) {
    "use strict";
    var childProcess = require("child_process");
    var { isLinux, getReport } = require_process();
    var { LDD_PATH, SELF_PATH, readFile, readFileSync } = require_filesystem();
    var { interpreterPath } = require_elf();
    var cachedFamilyInterpreter;
    var cachedFamilyFilesystem;
    var cachedVersionFilesystem;
    var command = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
    var commandOut = "";
    var safeCommand = () => {
      if (!commandOut) {
        return new Promise((resolve) => {
          childProcess.exec(command, (err, out) => {
            commandOut = err ? " " : out;
            resolve(commandOut);
          });
        });
      }
      return commandOut;
    };
    var safeCommandSync = () => {
      if (!commandOut) {
        try {
          commandOut = childProcess.execSync(command, { encoding: "utf8" });
        } catch (_err) {
          commandOut = " ";
        }
      }
      return commandOut;
    };
    var GLIBC = "glibc";
    var RE_GLIBC_VERSION = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i;
    var MUSL = "musl";
    var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
    var familyFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return GLIBC;
      }
      if (Array.isArray(report.sharedObjects)) {
        if (report.sharedObjects.some(isFileMusl)) {
          return MUSL;
        }
      }
      return null;
    };
    var familyFromCommand = (out) => {
      const [getconf, ldd1] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return GLIBC;
      }
      if (ldd1 && ldd1.includes(MUSL)) {
        return MUSL;
      }
      return null;
    };
    var familyFromInterpreterPath = (path2) => {
      if (path2) {
        if (path2.includes("/ld-musl-")) {
          return MUSL;
        } else if (path2.includes("/ld-linux-")) {
          return GLIBC;
        }
      }
      return null;
    };
    var getFamilyFromLddContent = (content) => {
      content = content.toString();
      if (content.includes("musl")) {
        return MUSL;
      }
      if (content.includes("GNU C Library")) {
        return GLIBC;
      }
      return null;
    };
    var familyFromFilesystem = async () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var familyFromFilesystemSync = () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var familyFromInterpreter = async () => {
      if (cachedFamilyInterpreter !== void 0) {
        return cachedFamilyInterpreter;
      }
      cachedFamilyInterpreter = null;
      try {
        const selfContent = await readFile(SELF_PATH);
        const path2 = interpreterPath(selfContent);
        cachedFamilyInterpreter = familyFromInterpreterPath(path2);
      } catch (e) {
      }
      return cachedFamilyInterpreter;
    };
    var familyFromInterpreterSync = () => {
      if (cachedFamilyInterpreter !== void 0) {
        return cachedFamilyInterpreter;
      }
      cachedFamilyInterpreter = null;
      try {
        const selfContent = readFileSync(SELF_PATH);
        const path2 = interpreterPath(selfContent);
        cachedFamilyInterpreter = familyFromInterpreterPath(path2);
      } catch (e) {
      }
      return cachedFamilyInterpreter;
    };
    var family = async () => {
      let family2 = null;
      if (isLinux()) {
        family2 = await familyFromInterpreter();
        if (!family2) {
          family2 = await familyFromFilesystem();
          if (!family2) {
            family2 = familyFromReport();
          }
          if (!family2) {
            const out = await safeCommand();
            family2 = familyFromCommand(out);
          }
        }
      }
      return family2;
    };
    var familySync = () => {
      let family2 = null;
      if (isLinux()) {
        family2 = familyFromInterpreterSync();
        if (!family2) {
          family2 = familyFromFilesystemSync();
          if (!family2) {
            family2 = familyFromReport();
          }
          if (!family2) {
            const out = safeCommandSync();
            family2 = familyFromCommand(out);
          }
        }
      }
      return family2;
    };
    var isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
    var isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;
    var versionFromFilesystem = async () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromFilesystemSync = () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return report.header.glibcVersionRuntime;
      }
      return null;
    };
    var versionSuffix = (s) => s.trim().split(/\s+/)[1];
    var versionFromCommand = (out) => {
      const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return versionSuffix(getconf);
      }
      if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
        return versionSuffix(ldd2);
      }
      return null;
    };
    var version = async () => {
      let version2 = null;
      if (isLinux()) {
        version2 = await versionFromFilesystem();
        if (!version2) {
          version2 = versionFromReport();
        }
        if (!version2) {
          const out = await safeCommand();
          version2 = versionFromCommand(out);
        }
      }
      return version2;
    };
    var versionSync = () => {
      let version2 = null;
      if (isLinux()) {
        version2 = versionFromFilesystemSync();
        if (!version2) {
          version2 = versionFromReport();
        }
        if (!version2) {
          const out = safeCommandSync();
          version2 = versionFromCommand(out);
        }
      }
      return version2;
    };
    module2.exports = {
      GLIBC,
      MUSL,
      family,
      familySync,
      isNonGlibcLinux,
      isNonGlibcLinuxSync,
      version,
      versionSync
    };
  }
});

// node_modules/node-gyp-build-optional-packages/node-gyp-build.js
var require_node_gyp_build = __commonJS({
  "node_modules/node-gyp-build-optional-packages/node-gyp-build.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var url = require("url");
    var os = require("os");
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    var vars = process.config && process.config.variables || {};
    var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
    var versions = process.versions;
    var abi = versions.modules;
    if (versions.deno || process.isBun) {
      abi = "unsupported";
    }
    var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
    var arch = process.env.npm_config_arch || os.arch();
    var platform = process.env.npm_config_platform || os.platform();
    var libc = process.env.LIBC || (isMusl(platform) ? "musl" : "glibc");
    var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
    var uv = (versions.uv || "").split(".")[0];
    module2.exports = load;
    function load(dir) {
      return runtimeRequire(load.resolve(dir));
    }
    load.resolve = load.path = function(dir) {
      dir = path2.resolve(dir || ".");
      var packageName = "";
      var packageNameError;
      try {
        packageName = runtimeRequire(path2.join(dir, "package.json")).name;
        var varName = packageName.toUpperCase().replace(/-/g, "_");
        if (process.env[varName + "_PREBUILD"]) dir = process.env[varName + "_PREBUILD"];
      } catch (err) {
        packageNameError = err;
      }
      if (!prebuildsOnly) {
        var release = getFirst(path2.join(dir, "build/Release"), matchBuild);
        if (release) return release;
        var debug3 = getFirst(path2.join(dir, "build/Debug"), matchBuild);
        if (debug3) return debug3;
      }
      var prebuild = resolve(dir);
      if (prebuild) return prebuild;
      var nearby = resolve(path2.dirname(process.execPath));
      if (nearby) return nearby;
      var platformPackage = (packageName[0] == "@" ? "" : "@" + packageName + "/") + packageName + "-" + platform + "-" + arch;
      var packageResolutionError;
      try {
        var prebuildPackage = path2.dirname(require("module").createRequire(url.pathToFileURL(path2.join(dir, "package.json"))).resolve(platformPackage));
        return resolveFile(prebuildPackage);
      } catch (error) {
        packageResolutionError = error;
      }
      var target2 = [
        "platform=" + platform,
        "arch=" + arch,
        "runtime=" + runtime,
        "abi=" + abi,
        "uv=" + uv,
        armv ? "armv=" + armv : "",
        "libc=" + libc,
        "node=" + process.versions.node,
        process.versions.electron ? "electron=" + process.versions.electron : "",
        typeof __webpack_require__ === "function" ? "webpack=true" : ""
        // eslint-disable-line
      ].filter(Boolean).join(" ");
      let errMessage = "No native build was found for " + target2 + "\n    attempted loading from: " + dir + " and package: " + platformPackage + "\n";
      if (packageNameError) {
        errMessage += "Error finding package.json: " + packageNameError.message + "\n";
      }
      if (packageResolutionError) {
        errMessage += "Error resolving package: " + packageResolutionError.message + "\n";
      }
      throw new Error(errMessage);
      function resolve(dir2) {
        var tuples = readdirSync(path2.join(dir2, "prebuilds")).map(parseTuple);
        var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
        if (!tuple) return;
        return resolveFile(path2.join(dir2, "prebuilds", tuple.name));
      }
      function resolveFile(prebuilds) {
        var parsed = readdirSync(prebuilds).map(parseTags);
        var candidates = parsed.filter(matchTags(runtime, abi));
        var winner = candidates.sort(compareTags(runtime))[0];
        if (winner) return path2.join(prebuilds, winner.file);
      }
    };
    function readdirSync(dir) {
      try {
        return fs2.readdirSync(dir);
      } catch (err) {
        return [];
      }
    }
    function getFirst(dir, filter) {
      var files = readdirSync(dir).filter(filter);
      return files[0] && path2.join(dir, files[0]);
    }
    function matchBuild(name) {
      return /\.node$/.test(name);
    }
    function parseTuple(name) {
      var arr = name.split("-");
      if (arr.length !== 2) return;
      var platform2 = arr[0];
      var architectures = arr[1].split("+");
      if (!platform2) return;
      if (!architectures.length) return;
      if (!architectures.every(Boolean)) return;
      return { name, platform: platform2, architectures };
    }
    function matchTuple(platform2, arch2) {
      return function(tuple) {
        if (tuple == null) return false;
        if (tuple.platform !== platform2) return false;
        return tuple.architectures.includes(arch2);
      };
    }
    function compareTuples(a, b) {
      return a.architectures.length - b.architectures.length;
    }
    function parseTags(file) {
      var arr = file.split(".");
      var extension2 = arr.pop();
      var tags = { file, specificity: 0 };
      if (extension2 !== "node") return;
      for (var i = 0; i < arr.length; i++) {
        var tag = arr[i];
        if (tag === "node" || tag === "electron" || tag === "node-webkit") {
          tags.runtime = tag;
        } else if (tag === "napi") {
          tags.napi = true;
        } else if (tag.slice(0, 3) === "abi") {
          tags.abi = tag.slice(3);
        } else if (tag.slice(0, 2) === "uv") {
          tags.uv = tag.slice(2);
        } else if (tag.slice(0, 4) === "armv") {
          tags.armv = tag.slice(4);
        } else if (tag === "glibc" || tag === "musl") {
          tags.libc = tag;
        } else {
          continue;
        }
        tags.specificity++;
      }
      return tags;
    }
    function matchTags(runtime2, abi2) {
      return function(tags) {
        if (tags == null) return false;
        if (tags.runtime !== runtime2 && !runtimeAgnostic(tags)) return false;
        if (tags.abi !== abi2 && !tags.napi) return false;
        if (tags.uv && tags.uv !== uv) return false;
        if (tags.armv && tags.armv !== armv) return false;
        if (tags.libc && tags.libc !== libc) return false;
        return true;
      };
    }
    function runtimeAgnostic(tags) {
      return tags.runtime === "node" && tags.napi;
    }
    function compareTags(runtime2) {
      return function(a, b) {
        if (a.runtime !== b.runtime) {
          return a.runtime === runtime2 ? -1 : 1;
        } else if (a.abi !== b.abi) {
          return a.abi ? -1 : 1;
        } else if (a.specificity !== b.specificity) {
          return a.specificity > b.specificity ? -1 : 1;
        } else {
          return 0;
        }
      };
    }
    function isNwjs() {
      return !!(process.versions && process.versions.nw);
    }
    function isElectron() {
      if (process.versions && process.versions.electron) return true;
      if (process.env.ELECTRON_RUN_AS_NODE) return true;
      return typeof window !== "undefined" && window.process && window.process.type === "renderer";
    }
    function isMusl(platform2) {
      if (platform2 !== "linux") return false;
      const { familySync, MUSL } = require_detect_libc();
      return familySync() === MUSL;
    }
    load.parseTags = parseTags;
    load.matchTags = matchTags;
    load.compareTags = compareTags;
    load.parseTuple = parseTuple;
    load.matchTuple = matchTuple;
    load.compareTuples = compareTuples;
  }
});

// node_modules/node-gyp-build-optional-packages/index.js
var require_node_gyp_build_optional_packages = __commonJS({
  "node_modules/node-gyp-build-optional-packages/index.js"(exports2, module2) {
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    if (typeof runtimeRequire.addon === "function") {
      module2.exports = runtimeRequire.addon.bind(runtimeRequire);
    } else {
      module2.exports = require_node_gyp_build();
    }
  }
});

// node_modules/msgpackr-extract/index.js
var require_msgpackr_extract = __commonJS({
  "node_modules/msgpackr-extract/index.js"(exports2, module2) {
    module2.exports = require_node_gyp_build_optional_packages()(__dirname);
  }
});

// node_modules/@colyseus/core/node_modules/nanoid/random.js
var require_random = __commonJS({
  "node_modules/@colyseus/core/node_modules/nanoid/random.js"(exports2, module2) {
    var crypto = require("crypto");
    if (crypto.randomFillSync) {
      buffers = {};
      module2.exports = function(bytes) {
        var buffer = buffers[bytes];
        if (!buffer) {
          buffer = Buffer.allocUnsafe(bytes);
          if (bytes <= 255) buffers[bytes] = buffer;
        }
        return crypto.randomFillSync(buffer);
      };
    } else {
      module2.exports = crypto.randomBytes;
    }
    var buffers;
  }
});

// node_modules/@colyseus/core/node_modules/nanoid/url.js
var require_url = __commonJS({
  "node_modules/@colyseus/core/node_modules/nanoid/url.js"(exports2, module2) {
    module2.exports = "-_";
    var i = 36;
    while (i--) {
      module2.exports += i.toString(36);
      i > 9 && (module2.exports += i.toString(36).toUpperCase());
    }
  }
});

// node_modules/@colyseus/core/node_modules/nanoid/index.js
var require_nanoid = __commonJS({
  "node_modules/@colyseus/core/node_modules/nanoid/index.js"(exports2, module2) {
    var random = require_random();
    var url = require_url();
    module2.exports = function(size) {
      size = size || 21;
      var bytes = random(size);
      var id = "";
      while (size--) {
        id += url[bytes[size] & 63];
      }
      return id;
    };
  }
});

// node_modules/@pm2/io/node_modules/debug/src/common.js
var require_common2 = __commonJS({
  "node_modules/@pm2/io/node_modules/debug/src/common.js"(exports2, module2) {
    function setup2(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug3(...args) {
          if (!debug3.enabled) {
            return;
          }
          const self = debug3;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug3.namespace = namespace;
        debug3.useColors = createDebug.useColors();
        debug3.color = createDebug.selectColor(namespace);
        debug3.extend = extend;
        debug3.destroy = createDebug.destroy;
        Object.defineProperty(debug3, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug3);
        }
        return debug3;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
      }
      function disable() {
        const namespaces = [
          ...createDebug.names.map(toNamespace),
          ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup2;
  }
});

// node_modules/@pm2/io/node_modules/debug/src/browser.js
var require_browser2 = __commonJS({
  "node_modules/@pm2/io/node_modules/debug/src/browser.js"(exports2, module2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports2.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common2()(exports2);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/@pm2/io/node_modules/debug/src/node.js
var require_node2 = __commonJS({
  "node_modules/@pm2/io/node_modules/debug/src/node.js"(exports2, module2) {
    var tty = require("tty");
    var util = require("util");
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports2.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = require("supports-color");
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports2.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports2.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports2.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports2.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug3) {
      debug3.inspectOpts = {};
      const keys = Object.keys(exports2.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug3.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common2()(exports2);
    var { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/@pm2/io/node_modules/debug/src/index.js
var require_src2 = __commonJS({
  "node_modules/@pm2/io/node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser2();
    } else {
      module2.exports = require_node2();
    }
  }
});

// node_modules/@pm2/io/build/main/serviceManager.js
var require_serviceManager = __commonJS({
  "node_modules/@pm2/io/build/main/serviceManager.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServiceManager = exports2.Service = void 0;
    var services = /* @__PURE__ */ new Map();
    var Service = class {
    };
    exports2.Service = Service;
    var ServiceManager = class {
      static get(serviceName) {
        return services.get(serviceName);
      }
      static set(serviceName, service) {
        return services.set(serviceName, service);
      }
      static reset(serviceName) {
        return services.delete(serviceName);
      }
    };
    exports2.ServiceManager = ServiceManager;
  }
});

// node_modules/@pm2/io/build/main/utils/autocast.js
var require_autocast = __commonJS({
  "node_modules/@pm2/io/build/main/utils/autocast.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Autocast = class {
      constructor() {
        this.commonStrings = {
          "true": true,
          "false": false,
          "undefined": void 0,
          "null": null,
          "NaN": NaN
        };
      }
      process(key, value, o) {
        if (typeof value === "object")
          return;
        o[key] = this._cast(value);
      }
      traverse(o, func) {
        for (let i in o) {
          func.apply(this, [i, o[i], o]);
          if (o[i] !== null && typeof o[i] === "object") {
            this.traverse(o[i], func);
          }
        }
      }
      autocast(s) {
        if (typeof s === "object") {
          this.traverse(s, this.process);
          return s;
        }
        return this._cast(s);
      }
      _cast(s) {
        let key;
        if (s instanceof Date)
          return s;
        if (typeof s === "boolean")
          return s;
        if (!isNaN(s))
          return Number(s);
        for (key in this.commonStrings) {
          if (s === key)
            return this.commonStrings[key];
        }
        return s;
      }
    };
    exports2.default = Autocast;
  }
});

// node_modules/@pm2/io/build/main/configuration.js
var require_configuration = __commonJS({
  "node_modules/@pm2/io/build/main/configuration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var debug_1 = require_src2();
    var debug3 = (0, debug_1.default)("axm:configuration");
    var serviceManager_1 = require_serviceManager();
    var autocast_1 = require_autocast();
    var path2 = require("path");
    var fs2 = require("fs");
    var Configuration = class _Configuration {
      static configureModule(opts) {
        if (serviceManager_1.ServiceManager.get("transport"))
          serviceManager_1.ServiceManager.get("transport").setOptions(opts);
      }
      static findPackageJson() {
        try {
          require.main = _Configuration.getMain();
        } catch (_e) {
        }
        if (!require.main) {
          return;
        }
        if (!require.main.paths) {
          return;
        }
        let pkgPath = path2.resolve(path2.dirname(require.main.filename), "package.json");
        try {
          fs2.statSync(pkgPath);
        } catch (e) {
          try {
            pkgPath = path2.resolve(path2.dirname(require.main.filename), "..", "package.json");
            fs2.statSync(pkgPath);
          } catch (e2) {
            debug3("Cannot find package.json");
            try {
              pkgPath = path2.resolve(path2.dirname(require.main.filename), "..", "..", "package.json");
              fs2.statSync(pkgPath);
            } catch (e3) {
              debug3("Cannot find package.json");
              return null;
            }
          }
          return pkgPath;
        }
        return pkgPath;
      }
      static init(conf, doNotTellPm2) {
        const packageFilepath = _Configuration.findPackageJson();
        let packageJson;
        if (!conf.module_conf) {
          conf.module_conf = {};
        }
        conf.apm = {
          type: "node",
          version: null
        };
        try {
          const prefix = __dirname.replace(/\\/g, "/").indexOf("/build/") >= 0 ? "../../" : "../";
          const pkg = require(prefix + "package.json");
          conf.apm.version = pkg.version || null;
        } catch (err) {
          debug3("Failed to fetch current apm version: ", err.message);
        }
        if (conf.isModule === true) {
          try {
            packageJson = require(packageFilepath || "");
            conf.module_version = packageJson.version;
            conf.module_name = packageJson.name;
            conf.description = packageJson.description;
            if (packageJson.config) {
              conf = Object.assign(conf, packageJson.config);
              conf.module_conf = packageJson.config;
            }
          } catch (e) {
            throw new Error(e);
          }
        } else {
          conf.module_name = process.env.name || "outside-pm2";
          try {
            packageJson = require(packageFilepath || "");
            conf.module_version = packageJson.version;
            if (packageJson.config) {
              conf = Object.assign(conf, packageJson.config);
              conf.module_conf = packageJson.config;
            }
          } catch (e) {
            debug3(e.message);
          }
        }
        try {
          if (process.env[conf.module_name]) {
            const castedConf = new autocast_1.default().autocast(JSON.parse(process.env[conf.module_name] || ""));
            conf = Object.assign(conf, castedConf);
            delete castedConf.probes;
            conf.module_conf = JSON.parse(JSON.stringify(Object.assign(conf.module_conf, castedConf)));
            Object.keys(conf.module_conf).forEach(function(key) {
              if ((key === "password" || key === "passwd") && conf.module_conf[key].length >= 1) {
                conf.module_conf[key] = "Password hidden";
              }
            });
          }
        } catch (e) {
          debug3(e);
        }
        if (doNotTellPm2 === true)
          return conf;
        _Configuration.configureModule(conf);
        return conf;
      }
      static getMain() {
        return require.main || { filename: "./somefile.js" };
      }
    };
    exports2.default = Configuration;
  }
});

// node_modules/eventemitter2/lib/eventemitter2.js
var require_eventemitter2 = __commonJS({
  "node_modules/eventemitter2/lib/eventemitter2.js"(exports2, module2) {
    !(function(undefined2) {
      var hasOwnProperty = Object.hasOwnProperty;
      var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      };
      var defaultMaxListeners = 10;
      var nextTickSupported = typeof process == "object" && typeof process.nextTick == "function";
      var symbolsSupported = typeof Symbol === "function";
      var reflectSupported = typeof Reflect === "object";
      var setImmediateSupported = typeof setImmediate === "function";
      var _setImmediate = setImmediateSupported ? setImmediate : setTimeout;
      var ownKeys = symbolsSupported ? reflectSupported && typeof Reflect.ownKeys === "function" ? Reflect.ownKeys : function(obj) {
        var arr = Object.getOwnPropertyNames(obj);
        arr.push.apply(arr, Object.getOwnPropertySymbols(obj));
        return arr;
      } : Object.keys;
      function init() {
        this._events = {};
        if (this._conf) {
          configure.call(this, this._conf);
        }
      }
      function configure(conf) {
        if (conf) {
          this._conf = conf;
          conf.delimiter && (this.delimiter = conf.delimiter);
          if (conf.maxListeners !== undefined2) {
            this._maxListeners = conf.maxListeners;
          }
          conf.wildcard && (this.wildcard = conf.wildcard);
          conf.newListener && (this._newListener = conf.newListener);
          conf.removeListener && (this._removeListener = conf.removeListener);
          conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);
          conf.ignoreErrors && (this.ignoreErrors = conf.ignoreErrors);
          if (this.wildcard) {
            this.listenerTree = {};
          }
        }
      }
      function logPossibleMemoryLeak(count, eventName) {
        var errorMsg = "(node) warning: possible EventEmitter memory leak detected. " + count + " listeners added. Use emitter.setMaxListeners() to increase limit.";
        if (this.verboseMemoryLeak) {
          errorMsg += " Event name: " + eventName + ".";
        }
        if (typeof process !== "undefined" && process.emitWarning) {
          var e = new Error(errorMsg);
          e.name = "MaxListenersExceededWarning";
          e.emitter = this;
          e.count = count;
          process.emitWarning(e);
        } else {
          console.error(errorMsg);
          if (console.trace) {
            console.trace();
          }
        }
      }
      var toArray = function(a, b, c) {
        var n = arguments.length;
        switch (n) {
          case 0:
            return [];
          case 1:
            return [a];
          case 2:
            return [a, b];
          case 3:
            return [a, b, c];
          default:
            var arr = new Array(n);
            while (n--) {
              arr[n] = arguments[n];
            }
            return arr;
        }
      };
      function toObject(keys, values) {
        var obj = {};
        var key;
        var len = keys.length;
        var valuesCount = values ? values.length : 0;
        for (var i = 0; i < len; i++) {
          key = keys[i];
          obj[key] = i < valuesCount ? values[i] : undefined2;
        }
        return obj;
      }
      function TargetObserver(emitter, target2, options) {
        this._emitter = emitter;
        this._target = target2;
        this._listeners = {};
        this._listenersCount = 0;
        var on, off;
        if (options.on || options.off) {
          on = options.on;
          off = options.off;
        }
        if (target2.addEventListener) {
          on = target2.addEventListener;
          off = target2.removeEventListener;
        } else if (target2.addListener) {
          on = target2.addListener;
          off = target2.removeListener;
        } else if (target2.on) {
          on = target2.on;
          off = target2.off;
        }
        if (!on && !off) {
          throw Error("target does not implement any known event API");
        }
        if (typeof on !== "function") {
          throw TypeError("on method must be a function");
        }
        if (typeof off !== "function") {
          throw TypeError("off method must be a function");
        }
        this._on = on;
        this._off = off;
        var _observers = emitter._observers;
        if (_observers) {
          _observers.push(this);
        } else {
          emitter._observers = [this];
        }
      }
      Object.assign(TargetObserver.prototype, {
        subscribe: function(event, localEvent, reducer) {
          var observer = this;
          var target2 = this._target;
          var emitter = this._emitter;
          var listeners = this._listeners;
          var handler = function() {
            var args = toArray.apply(null, arguments);
            var eventObj = {
              data: args,
              name: localEvent,
              original: event
            };
            if (reducer) {
              var result = reducer.call(target2, eventObj);
              if (result !== false) {
                emitter.emit.apply(emitter, [eventObj.name].concat(args));
              }
              return;
            }
            emitter.emit.apply(emitter, [localEvent].concat(args));
          };
          if (listeners[event]) {
            throw Error("Event '" + event + "' is already listening");
          }
          this._listenersCount++;
          if (emitter._newListener && emitter._removeListener && !observer._onNewListener) {
            this._onNewListener = function(_event) {
              if (_event === localEvent && listeners[event] === null) {
                listeners[event] = handler;
                observer._on.call(target2, event, handler);
              }
            };
            emitter.on("newListener", this._onNewListener);
            this._onRemoveListener = function(_event) {
              if (_event === localEvent && !emitter.hasListeners(_event) && listeners[event]) {
                listeners[event] = null;
                observer._off.call(target2, event, handler);
              }
            };
            listeners[event] = null;
            emitter.on("removeListener", this._onRemoveListener);
          } else {
            listeners[event] = handler;
            observer._on.call(target2, event, handler);
          }
        },
        unsubscribe: function(event) {
          var observer = this;
          var listeners = this._listeners;
          var emitter = this._emitter;
          var handler;
          var events2;
          var off = this._off;
          var target2 = this._target;
          var i;
          if (event && typeof event !== "string") {
            throw TypeError("event must be a string");
          }
          function clearRefs() {
            if (observer._onNewListener) {
              emitter.off("newListener", observer._onNewListener);
              emitter.off("removeListener", observer._onRemoveListener);
              observer._onNewListener = null;
              observer._onRemoveListener = null;
            }
            var index = findTargetIndex.call(emitter, observer);
            emitter._observers.splice(index, 1);
          }
          if (event) {
            handler = listeners[event];
            if (!handler) return;
            off.call(target2, event, handler);
            delete listeners[event];
            if (!--this._listenersCount) {
              clearRefs();
            }
          } else {
            events2 = ownKeys(listeners);
            i = events2.length;
            while (i-- > 0) {
              event = events2[i];
              off.call(target2, event, listeners[event]);
            }
            this._listeners = {};
            this._listenersCount = 0;
            clearRefs();
          }
        }
      });
      function resolveOptions(options, schema, reducers, allowUnknown) {
        var computedOptions = Object.assign({}, schema);
        if (!options) return computedOptions;
        if (typeof options !== "object") {
          throw TypeError("options must be an object");
        }
        var keys = Object.keys(options);
        var length = keys.length;
        var option, value;
        var reducer;
        function reject(reason) {
          throw Error('Invalid "' + option + '" option value' + (reason ? ". Reason: " + reason : ""));
        }
        for (var i = 0; i < length; i++) {
          option = keys[i];
          if (!allowUnknown && !hasOwnProperty.call(schema, option)) {
            throw Error('Unknown "' + option + '" option');
          }
          value = options[option];
          if (value !== undefined2) {
            reducer = reducers[option];
            computedOptions[option] = reducer ? reducer(value, reject) : value;
          }
        }
        return computedOptions;
      }
      function constructorReducer(value, reject) {
        if (typeof value !== "function" || !value.hasOwnProperty("prototype")) {
          reject("value must be a constructor");
        }
        return value;
      }
      function makeTypeReducer(types) {
        var message = "value must be type of " + types.join("|");
        var len = types.length;
        var firstType = types[0];
        var secondType = types[1];
        if (len === 1) {
          return function(v, reject) {
            if (typeof v === firstType) {
              return v;
            }
            reject(message);
          };
        }
        if (len === 2) {
          return function(v, reject) {
            var kind = typeof v;
            if (kind === firstType || kind === secondType) return v;
            reject(message);
          };
        }
        return function(v, reject) {
          var kind = typeof v;
          var i = len;
          while (i-- > 0) {
            if (kind === types[i]) return v;
          }
          reject(message);
        };
      }
      var functionReducer = makeTypeReducer(["function"]);
      var objectFunctionReducer = makeTypeReducer(["object", "function"]);
      function makeCancelablePromise(Promise2, executor, options) {
        var isCancelable;
        var callbacks;
        var timer = 0;
        var subscriptionClosed;
        var promise = new Promise2(function(resolve, reject, onCancel) {
          options = resolveOptions(options, {
            timeout: 0,
            overload: false
          }, {
            timeout: function(value, reject2) {
              value *= 1;
              if (typeof value !== "number" || value < 0 || !Number.isFinite(value)) {
                reject2("timeout must be a positive number");
              }
              return value;
            }
          });
          isCancelable = !options.overload && typeof Promise2.prototype.cancel === "function" && typeof onCancel === "function";
          function cleanup() {
            if (callbacks) {
              callbacks = null;
            }
            if (timer) {
              clearTimeout(timer);
              timer = 0;
            }
          }
          var _resolve = function(value) {
            cleanup();
            resolve(value);
          };
          var _reject = function(err) {
            cleanup();
            reject(err);
          };
          if (isCancelable) {
            executor(_resolve, _reject, onCancel);
          } else {
            callbacks = [function(reason) {
              _reject(reason || Error("canceled"));
            }];
            executor(_resolve, _reject, function(cb) {
              if (subscriptionClosed) {
                throw Error("Unable to subscribe on cancel event asynchronously");
              }
              if (typeof cb !== "function") {
                throw TypeError("onCancel callback must be a function");
              }
              callbacks.push(cb);
            });
            subscriptionClosed = true;
          }
          if (options.timeout > 0) {
            timer = setTimeout(function() {
              var reason = Error("timeout");
              reason.code = "ETIMEDOUT";
              timer = 0;
              promise.cancel(reason);
              reject(reason);
            }, options.timeout);
          }
        });
        if (!isCancelable) {
          promise.cancel = function(reason) {
            if (!callbacks) {
              return;
            }
            var length = callbacks.length;
            for (var i = 1; i < length; i++) {
              callbacks[i](reason);
            }
            callbacks[0](reason);
            callbacks = null;
          };
        }
        return promise;
      }
      function findTargetIndex(observer) {
        var observers = this._observers;
        if (!observers) {
          return -1;
        }
        var len = observers.length;
        for (var i = 0; i < len; i++) {
          if (observers[i]._target === observer) return i;
        }
        return -1;
      }
      function searchListenerTree(handlers2, type2, tree, i, typeLength) {
        if (!tree) {
          return null;
        }
        if (i === 0) {
          var kind = typeof type2;
          if (kind === "string") {
            var ns, n, l = 0, j = 0, delimiter = this.delimiter, dl = delimiter.length;
            if ((n = type2.indexOf(delimiter)) !== -1) {
              ns = new Array(5);
              do {
                ns[l++] = type2.slice(j, n);
                j = n + dl;
              } while ((n = type2.indexOf(delimiter, j)) !== -1);
              ns[l++] = type2.slice(j);
              type2 = ns;
              typeLength = l;
            } else {
              type2 = [type2];
              typeLength = 1;
            }
          } else if (kind === "object") {
            typeLength = type2.length;
          } else {
            type2 = [type2];
            typeLength = 1;
          }
        }
        var listeners = null, branch, xTree, xxTree, isolatedBranch, endReached, currentType = type2[i], nextType = type2[i + 1], branches, _listeners;
        if (i === typeLength) {
          if (tree._listeners) {
            if (typeof tree._listeners === "function") {
              handlers2 && handlers2.push(tree._listeners);
              listeners = [tree];
            } else {
              handlers2 && handlers2.push.apply(handlers2, tree._listeners);
              listeners = [tree];
            }
          }
        } else {
          if (currentType === "*") {
            branches = ownKeys(tree);
            n = branches.length;
            while (n-- > 0) {
              branch = branches[n];
              if (branch !== "_listeners") {
                _listeners = searchListenerTree(handlers2, type2, tree[branch], i + 1, typeLength);
                if (_listeners) {
                  if (listeners) {
                    listeners.push.apply(listeners, _listeners);
                  } else {
                    listeners = _listeners;
                  }
                }
              }
            }
            return listeners;
          } else if (currentType === "**") {
            endReached = i + 1 === typeLength || i + 2 === typeLength && nextType === "*";
            if (endReached && tree._listeners) {
              listeners = searchListenerTree(handlers2, type2, tree, typeLength, typeLength);
            }
            branches = ownKeys(tree);
            n = branches.length;
            while (n-- > 0) {
              branch = branches[n];
              if (branch !== "_listeners") {
                if (branch === "*" || branch === "**") {
                  if (tree[branch]._listeners && !endReached) {
                    _listeners = searchListenerTree(handlers2, type2, tree[branch], typeLength, typeLength);
                    if (_listeners) {
                      if (listeners) {
                        listeners.push.apply(listeners, _listeners);
                      } else {
                        listeners = _listeners;
                      }
                    }
                  }
                  _listeners = searchListenerTree(handlers2, type2, tree[branch], i, typeLength);
                } else if (branch === nextType) {
                  _listeners = searchListenerTree(handlers2, type2, tree[branch], i + 2, typeLength);
                } else {
                  _listeners = searchListenerTree(handlers2, type2, tree[branch], i, typeLength);
                }
                if (_listeners) {
                  if (listeners) {
                    listeners.push.apply(listeners, _listeners);
                  } else {
                    listeners = _listeners;
                  }
                }
              }
            }
            return listeners;
          } else if (tree[currentType]) {
            listeners = searchListenerTree(handlers2, type2, tree[currentType], i + 1, typeLength);
          }
        }
        xTree = tree["*"];
        if (xTree) {
          searchListenerTree(handlers2, type2, xTree, i + 1, typeLength);
        }
        xxTree = tree["**"];
        if (xxTree) {
          if (i < typeLength) {
            if (xxTree._listeners) {
              searchListenerTree(handlers2, type2, xxTree, typeLength, typeLength);
            }
            branches = ownKeys(xxTree);
            n = branches.length;
            while (n-- > 0) {
              branch = branches[n];
              if (branch !== "_listeners") {
                if (branch === nextType) {
                  searchListenerTree(handlers2, type2, xxTree[branch], i + 2, typeLength);
                } else if (branch === currentType) {
                  searchListenerTree(handlers2, type2, xxTree[branch], i + 1, typeLength);
                } else {
                  isolatedBranch = {};
                  isolatedBranch[branch] = xxTree[branch];
                  searchListenerTree(handlers2, type2, { "**": isolatedBranch }, i + 1, typeLength);
                }
              }
            }
          } else if (xxTree._listeners) {
            searchListenerTree(handlers2, type2, xxTree, typeLength, typeLength);
          } else if (xxTree["*"] && xxTree["*"]._listeners) {
            searchListenerTree(handlers2, type2, xxTree["*"], typeLength, typeLength);
          }
        }
        return listeners;
      }
      function growListenerTree(type2, listener, prepend) {
        var len = 0, j = 0, i, delimiter = this.delimiter, dl = delimiter.length, ns;
        if (typeof type2 === "string") {
          if ((i = type2.indexOf(delimiter)) !== -1) {
            ns = new Array(5);
            do {
              ns[len++] = type2.slice(j, i);
              j = i + dl;
            } while ((i = type2.indexOf(delimiter, j)) !== -1);
            ns[len++] = type2.slice(j);
          } else {
            ns = [type2];
            len = 1;
          }
        } else {
          ns = type2;
          len = type2.length;
        }
        if (len > 1) {
          for (i = 0; i + 1 < len; i++) {
            if (ns[i] === "**" && ns[i + 1] === "**") {
              return;
            }
          }
        }
        var tree = this.listenerTree, name;
        for (i = 0; i < len; i++) {
          name = ns[i];
          tree = tree[name] || (tree[name] = {});
          if (i === len - 1) {
            if (!tree._listeners) {
              tree._listeners = listener;
            } else {
              if (typeof tree._listeners === "function") {
                tree._listeners = [tree._listeners];
              }
              if (prepend) {
                tree._listeners.unshift(listener);
              } else {
                tree._listeners.push(listener);
              }
              if (!tree._listeners.warned && this._maxListeners > 0 && tree._listeners.length > this._maxListeners) {
                tree._listeners.warned = true;
                logPossibleMemoryLeak.call(this, tree._listeners.length, name);
              }
            }
            return true;
          }
        }
        return true;
      }
      function collectTreeEvents(tree, events2, root, asArray) {
        var branches = ownKeys(tree);
        var i = branches.length;
        var branch, branchName, path2;
        var hasListeners = tree["_listeners"];
        var isArrayPath;
        while (i-- > 0) {
          branchName = branches[i];
          branch = tree[branchName];
          if (branchName === "_listeners") {
            path2 = root;
          } else {
            path2 = root ? root.concat(branchName) : [branchName];
          }
          isArrayPath = asArray || typeof branchName === "symbol";
          hasListeners && events2.push(isArrayPath ? path2 : path2.join(this.delimiter));
          if (typeof branch === "object") {
            collectTreeEvents.call(this, branch, events2, path2, isArrayPath);
          }
        }
        return events2;
      }
      function recursivelyGarbageCollect(root) {
        var keys = ownKeys(root);
        var i = keys.length;
        var obj, key, flag;
        while (i-- > 0) {
          key = keys[i];
          obj = root[key];
          if (obj) {
            flag = true;
            if (key !== "_listeners" && !recursivelyGarbageCollect(obj)) {
              delete root[key];
            }
          }
        }
        return flag;
      }
      function Listener(emitter, event, listener) {
        this.emitter = emitter;
        this.event = event;
        this.listener = listener;
      }
      Listener.prototype.off = function() {
        this.emitter.off(this.event, this.listener);
        return this;
      };
      function setupListener(event, listener, options) {
        if (options === true) {
          promisify = true;
        } else if (options === false) {
          async = true;
        } else {
          if (!options || typeof options !== "object") {
            throw TypeError("options should be an object or true");
          }
          var async = options.async;
          var promisify = options.promisify;
          var nextTick = options.nextTick;
          var objectify = options.objectify;
        }
        if (async || nextTick || promisify) {
          var _listener = listener;
          var _origin = listener._origin || listener;
          if (nextTick && !nextTickSupported) {
            throw Error("process.nextTick is not supported");
          }
          if (promisify === undefined2) {
            promisify = listener.constructor.name === "AsyncFunction";
          }
          listener = function() {
            var args = arguments;
            var context = this;
            var event2 = this.event;
            return promisify ? nextTick ? Promise.resolve() : new Promise(function(resolve) {
              _setImmediate(resolve);
            }).then(function() {
              context.event = event2;
              return _listener.apply(context, args);
            }) : (nextTick ? process.nextTick : _setImmediate)(function() {
              context.event = event2;
              _listener.apply(context, args);
            });
          };
          listener._async = true;
          listener._origin = _origin;
        }
        return [listener, objectify ? new Listener(this, event, listener) : this];
      }
      function EventEmitter5(conf) {
        this._events = {};
        this._newListener = false;
        this._removeListener = false;
        this.verboseMemoryLeak = false;
        configure.call(this, conf);
      }
      EventEmitter5.EventEmitter2 = EventEmitter5;
      EventEmitter5.prototype.listenTo = function(target2, events2, options) {
        if (typeof target2 !== "object") {
          throw TypeError("target musts be an object");
        }
        var emitter = this;
        options = resolveOptions(options, {
          on: undefined2,
          off: undefined2,
          reducers: undefined2
        }, {
          on: functionReducer,
          off: functionReducer,
          reducers: objectFunctionReducer
        });
        function listen(events3) {
          if (typeof events3 !== "object") {
            throw TypeError("events must be an object");
          }
          var reducers = options.reducers;
          var index = findTargetIndex.call(emitter, target2);
          var observer;
          if (index === -1) {
            observer = new TargetObserver(emitter, target2, options);
          } else {
            observer = emitter._observers[index];
          }
          var keys = ownKeys(events3);
          var len = keys.length;
          var event;
          var isSingleReducer = typeof reducers === "function";
          for (var i = 0; i < len; i++) {
            event = keys[i];
            observer.subscribe(
              event,
              events3[event] || event,
              isSingleReducer ? reducers : reducers && reducers[event]
            );
          }
        }
        isArray(events2) ? listen(toObject(events2)) : typeof events2 === "string" ? listen(toObject(events2.split(/\s+/))) : listen(events2);
        return this;
      };
      EventEmitter5.prototype.stopListeningTo = function(target2, event) {
        var observers = this._observers;
        if (!observers) {
          return false;
        }
        var i = observers.length;
        var observer;
        var matched = false;
        if (target2 && typeof target2 !== "object") {
          throw TypeError("target should be an object");
        }
        while (i-- > 0) {
          observer = observers[i];
          if (!target2 || observer._target === target2) {
            observer.unsubscribe(event);
            matched = true;
          }
        }
        return matched;
      };
      EventEmitter5.prototype.delimiter = ".";
      EventEmitter5.prototype.setMaxListeners = function(n) {
        if (n !== undefined2) {
          this._maxListeners = n;
          if (!this._conf) this._conf = {};
          this._conf.maxListeners = n;
        }
      };
      EventEmitter5.prototype.getMaxListeners = function() {
        return this._maxListeners;
      };
      EventEmitter5.prototype.event = "";
      EventEmitter5.prototype.once = function(event, fn, options) {
        return this._once(event, fn, false, options);
      };
      EventEmitter5.prototype.prependOnceListener = function(event, fn, options) {
        return this._once(event, fn, true, options);
      };
      EventEmitter5.prototype._once = function(event, fn, prepend, options) {
        return this._many(event, 1, fn, prepend, options);
      };
      EventEmitter5.prototype.many = function(event, ttl, fn, options) {
        return this._many(event, ttl, fn, false, options);
      };
      EventEmitter5.prototype.prependMany = function(event, ttl, fn, options) {
        return this._many(event, ttl, fn, true, options);
      };
      EventEmitter5.prototype._many = function(event, ttl, fn, prepend, options) {
        var self = this;
        if (typeof fn !== "function") {
          throw new Error("many only accepts instances of Function");
        }
        function listener() {
          if (--ttl === 0) {
            self.off(event, listener);
          }
          return fn.apply(this, arguments);
        }
        listener._origin = fn;
        return this._on(event, listener, prepend, options);
      };
      EventEmitter5.prototype.emit = function() {
        if (!this._events && !this._all) {
          return false;
        }
        this._events || init.call(this);
        var type2 = arguments[0], ns, wildcard = this.wildcard;
        var args, l, i, j, containsSymbol;
        if (type2 === "newListener" && !this._newListener) {
          if (!this._events.newListener) {
            return false;
          }
        }
        if (wildcard) {
          ns = type2;
          if (type2 !== "newListener" && type2 !== "removeListener") {
            if (typeof type2 === "object") {
              l = type2.length;
              if (symbolsSupported) {
                for (i = 0; i < l; i++) {
                  if (typeof type2[i] === "symbol") {
                    containsSymbol = true;
                    break;
                  }
                }
              }
              if (!containsSymbol) {
                type2 = type2.join(this.delimiter);
              }
            }
          }
        }
        var al = arguments.length;
        var handler;
        if (this._all && this._all.length) {
          handler = this._all.slice();
          for (i = 0, l = handler.length; i < l; i++) {
            this.event = type2;
            switch (al) {
              case 1:
                handler[i].call(this, type2);
                break;
              case 2:
                handler[i].call(this, type2, arguments[1]);
                break;
              case 3:
                handler[i].call(this, type2, arguments[1], arguments[2]);
                break;
              default:
                handler[i].apply(this, arguments);
            }
          }
        }
        if (wildcard) {
          handler = [];
          searchListenerTree.call(this, handler, ns, this.listenerTree, 0, l);
        } else {
          handler = this._events[type2];
          if (typeof handler === "function") {
            this.event = type2;
            switch (al) {
              case 1:
                handler.call(this);
                break;
              case 2:
                handler.call(this, arguments[1]);
                break;
              case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
              default:
                args = new Array(al - 1);
                for (j = 1; j < al; j++) args[j - 1] = arguments[j];
                handler.apply(this, args);
            }
            return true;
          } else if (handler) {
            handler = handler.slice();
          }
        }
        if (handler && handler.length) {
          if (al > 3) {
            args = new Array(al - 1);
            for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          }
          for (i = 0, l = handler.length; i < l; i++) {
            this.event = type2;
            switch (al) {
              case 1:
                handler[i].call(this);
                break;
              case 2:
                handler[i].call(this, arguments[1]);
                break;
              case 3:
                handler[i].call(this, arguments[1], arguments[2]);
                break;
              default:
                handler[i].apply(this, args);
            }
          }
          return true;
        } else if (!this.ignoreErrors && !this._all && type2 === "error") {
          if (arguments[1] instanceof Error) {
            throw arguments[1];
          } else {
            throw new Error("Uncaught, unspecified 'error' event.");
          }
        }
        return !!this._all;
      };
      EventEmitter5.prototype.emitAsync = function() {
        if (!this._events && !this._all) {
          return false;
        }
        this._events || init.call(this);
        var type2 = arguments[0], wildcard = this.wildcard, ns, containsSymbol;
        var args, l, i, j;
        if (type2 === "newListener" && !this._newListener) {
          if (!this._events.newListener) {
            return Promise.resolve([false]);
          }
        }
        if (wildcard) {
          ns = type2;
          if (type2 !== "newListener" && type2 !== "removeListener") {
            if (typeof type2 === "object") {
              l = type2.length;
              if (symbolsSupported) {
                for (i = 0; i < l; i++) {
                  if (typeof type2[i] === "symbol") {
                    containsSymbol = true;
                    break;
                  }
                }
              }
              if (!containsSymbol) {
                type2 = type2.join(this.delimiter);
              }
            }
          }
        }
        var promises = [];
        var al = arguments.length;
        var handler;
        if (this._all) {
          for (i = 0, l = this._all.length; i < l; i++) {
            this.event = type2;
            switch (al) {
              case 1:
                promises.push(this._all[i].call(this, type2));
                break;
              case 2:
                promises.push(this._all[i].call(this, type2, arguments[1]));
                break;
              case 3:
                promises.push(this._all[i].call(this, type2, arguments[1], arguments[2]));
                break;
              default:
                promises.push(this._all[i].apply(this, arguments));
            }
          }
        }
        if (wildcard) {
          handler = [];
          searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
        } else {
          handler = this._events[type2];
        }
        if (typeof handler === "function") {
          this.event = type2;
          switch (al) {
            case 1:
              promises.push(handler.call(this));
              break;
            case 2:
              promises.push(handler.call(this, arguments[1]));
              break;
            case 3:
              promises.push(handler.call(this, arguments[1], arguments[2]));
              break;
            default:
              args = new Array(al - 1);
              for (j = 1; j < al; j++) args[j - 1] = arguments[j];
              promises.push(handler.apply(this, args));
          }
        } else if (handler && handler.length) {
          handler = handler.slice();
          if (al > 3) {
            args = new Array(al - 1);
            for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          }
          for (i = 0, l = handler.length; i < l; i++) {
            this.event = type2;
            switch (al) {
              case 1:
                promises.push(handler[i].call(this));
                break;
              case 2:
                promises.push(handler[i].call(this, arguments[1]));
                break;
              case 3:
                promises.push(handler[i].call(this, arguments[1], arguments[2]));
                break;
              default:
                promises.push(handler[i].apply(this, args));
            }
          }
        } else if (!this.ignoreErrors && !this._all && type2 === "error") {
          if (arguments[1] instanceof Error) {
            return Promise.reject(arguments[1]);
          } else {
            return Promise.reject("Uncaught, unspecified 'error' event.");
          }
        }
        return Promise.all(promises);
      };
      EventEmitter5.prototype.on = function(type2, listener, options) {
        return this._on(type2, listener, false, options);
      };
      EventEmitter5.prototype.prependListener = function(type2, listener, options) {
        return this._on(type2, listener, true, options);
      };
      EventEmitter5.prototype.onAny = function(fn) {
        return this._onAny(fn, false);
      };
      EventEmitter5.prototype.prependAny = function(fn) {
        return this._onAny(fn, true);
      };
      EventEmitter5.prototype.addListener = EventEmitter5.prototype.on;
      EventEmitter5.prototype._onAny = function(fn, prepend) {
        if (typeof fn !== "function") {
          throw new Error("onAny only accepts instances of Function");
        }
        if (!this._all) {
          this._all = [];
        }
        if (prepend) {
          this._all.unshift(fn);
        } else {
          this._all.push(fn);
        }
        return this;
      };
      EventEmitter5.prototype._on = function(type2, listener, prepend, options) {
        if (typeof type2 === "function") {
          this._onAny(type2, listener);
          return this;
        }
        if (typeof listener !== "function") {
          throw new Error("on only accepts instances of Function");
        }
        this._events || init.call(this);
        var returnValue = this, temp;
        if (options !== undefined2) {
          temp = setupListener.call(this, type2, listener, options);
          listener = temp[0];
          returnValue = temp[1];
        }
        if (this._newListener) {
          this.emit("newListener", type2, listener);
        }
        if (this.wildcard) {
          growListenerTree.call(this, type2, listener, prepend);
          return returnValue;
        }
        if (!this._events[type2]) {
          this._events[type2] = listener;
        } else {
          if (typeof this._events[type2] === "function") {
            this._events[type2] = [this._events[type2]];
          }
          if (prepend) {
            this._events[type2].unshift(listener);
          } else {
            this._events[type2].push(listener);
          }
          if (!this._events[type2].warned && this._maxListeners > 0 && this._events[type2].length > this._maxListeners) {
            this._events[type2].warned = true;
            logPossibleMemoryLeak.call(this, this._events[type2].length, type2);
          }
        }
        return returnValue;
      };
      EventEmitter5.prototype.off = function(type2, listener) {
        if (typeof listener !== "function") {
          throw new Error("removeListener only takes instances of Function");
        }
        var handlers2, leafs = [];
        if (this.wildcard) {
          var ns = typeof type2 === "string" ? type2.split(this.delimiter) : type2.slice();
          leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
          if (!leafs) return this;
        } else {
          if (!this._events[type2]) return this;
          handlers2 = this._events[type2];
          leafs.push({ _listeners: handlers2 });
        }
        for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
          var leaf = leafs[iLeaf];
          handlers2 = leaf._listeners;
          if (isArray(handlers2)) {
            var position3 = -1;
            for (var i = 0, length = handlers2.length; i < length; i++) {
              if (handlers2[i] === listener || handlers2[i].listener && handlers2[i].listener === listener || handlers2[i]._origin && handlers2[i]._origin === listener) {
                position3 = i;
                break;
              }
            }
            if (position3 < 0) {
              continue;
            }
            if (this.wildcard) {
              leaf._listeners.splice(position3, 1);
            } else {
              this._events[type2].splice(position3, 1);
            }
            if (handlers2.length === 0) {
              if (this.wildcard) {
                delete leaf._listeners;
              } else {
                delete this._events[type2];
              }
            }
            if (this._removeListener)
              this.emit("removeListener", type2, listener);
            return this;
          } else if (handlers2 === listener || handlers2.listener && handlers2.listener === listener || handlers2._origin && handlers2._origin === listener) {
            if (this.wildcard) {
              delete leaf._listeners;
            } else {
              delete this._events[type2];
            }
            if (this._removeListener)
              this.emit("removeListener", type2, listener);
          }
        }
        this.listenerTree && recursivelyGarbageCollect(this.listenerTree);
        return this;
      };
      EventEmitter5.prototype.offAny = function(fn) {
        var i = 0, l = 0, fns;
        if (fn && this._all && this._all.length > 0) {
          fns = this._all;
          for (i = 0, l = fns.length; i < l; i++) {
            if (fn === fns[i]) {
              fns.splice(i, 1);
              if (this._removeListener)
                this.emit("removeListenerAny", fn);
              return this;
            }
          }
        } else {
          fns = this._all;
          if (this._removeListener) {
            for (i = 0, l = fns.length; i < l; i++)
              this.emit("removeListenerAny", fns[i]);
          }
          this._all = [];
        }
        return this;
      };
      EventEmitter5.prototype.removeListener = EventEmitter5.prototype.off;
      EventEmitter5.prototype.removeAllListeners = function(type2) {
        if (type2 === undefined2) {
          !this._events || init.call(this);
          return this;
        }
        if (this.wildcard) {
          var leafs = searchListenerTree.call(this, null, type2, this.listenerTree, 0), leaf, i;
          if (!leafs) return this;
          for (i = 0; i < leafs.length; i++) {
            leaf = leafs[i];
            leaf._listeners = null;
          }
          this.listenerTree && recursivelyGarbageCollect(this.listenerTree);
        } else if (this._events) {
          this._events[type2] = null;
        }
        return this;
      };
      EventEmitter5.prototype.listeners = function(type2) {
        var _events = this._events;
        var keys, listeners, allListeners;
        var i;
        var listenerTree;
        if (type2 === undefined2) {
          if (this.wildcard) {
            throw Error("event name required for wildcard emitter");
          }
          if (!_events) {
            return [];
          }
          keys = ownKeys(_events);
          i = keys.length;
          allListeners = [];
          while (i-- > 0) {
            listeners = _events[keys[i]];
            if (typeof listeners === "function") {
              allListeners.push(listeners);
            } else {
              allListeners.push.apply(allListeners, listeners);
            }
          }
          return allListeners;
        } else {
          if (this.wildcard) {
            listenerTree = this.listenerTree;
            if (!listenerTree) return [];
            var handlers2 = [];
            var ns = typeof type2 === "string" ? type2.split(this.delimiter) : type2.slice();
            searchListenerTree.call(this, handlers2, ns, listenerTree, 0);
            return handlers2;
          }
          if (!_events) {
            return [];
          }
          listeners = _events[type2];
          if (!listeners) {
            return [];
          }
          return typeof listeners === "function" ? [listeners] : listeners;
        }
      };
      EventEmitter5.prototype.eventNames = function(nsAsArray) {
        var _events = this._events;
        return this.wildcard ? collectTreeEvents.call(this, this.listenerTree, [], null, nsAsArray) : _events ? ownKeys(_events) : [];
      };
      EventEmitter5.prototype.listenerCount = function(type2) {
        return this.listeners(type2).length;
      };
      EventEmitter5.prototype.hasListeners = function(type2) {
        if (this.wildcard) {
          var handlers2 = [];
          var ns = typeof type2 === "string" ? type2.split(this.delimiter) : type2.slice();
          searchListenerTree.call(this, handlers2, ns, this.listenerTree, 0);
          return handlers2.length > 0;
        }
        var _events = this._events;
        var _all = this._all;
        return !!(_all && _all.length || _events && (type2 === undefined2 ? ownKeys(_events).length : _events[type2]));
      };
      EventEmitter5.prototype.listenersAny = function() {
        if (this._all) {
          return this._all;
        } else {
          return [];
        }
      };
      EventEmitter5.prototype.waitFor = function(event, options) {
        var self = this;
        var type2 = typeof options;
        if (type2 === "number") {
          options = { timeout: options };
        } else if (type2 === "function") {
          options = { filter: options };
        }
        options = resolveOptions(options, {
          timeout: 0,
          filter: undefined2,
          handleError: false,
          Promise,
          overload: false
        }, {
          filter: functionReducer,
          Promise: constructorReducer
        });
        return makeCancelablePromise(options.Promise, function(resolve, reject, onCancel) {
          function listener() {
            var filter = options.filter;
            if (filter && !filter.apply(self, arguments)) {
              return;
            }
            self.off(event, listener);
            if (options.handleError) {
              var err = arguments[0];
              err ? reject(err) : resolve(toArray.apply(null, arguments).slice(1));
            } else {
              resolve(toArray.apply(null, arguments));
            }
          }
          onCancel(function() {
            self.off(event, listener);
          });
          self._on(event, listener, false);
        }, {
          timeout: options.timeout,
          overload: options.overload
        });
      };
      function once(emitter, name, options) {
        options = resolveOptions(options, {
          Promise,
          timeout: 0,
          overload: false
        }, {
          Promise: constructorReducer
        });
        var _Promise = options.Promise;
        return makeCancelablePromise(_Promise, function(resolve, reject, onCancel) {
          var handler;
          if (typeof emitter.addEventListener === "function") {
            handler = function() {
              resolve(toArray.apply(null, arguments));
            };
            onCancel(function() {
              emitter.removeEventListener(name, handler);
            });
            emitter.addEventListener(
              name,
              handler,
              { once: true }
            );
            return;
          }
          var eventListener = function() {
            errorListener && emitter.removeListener("error", errorListener);
            resolve(toArray.apply(null, arguments));
          };
          var errorListener;
          if (name !== "error") {
            errorListener = function(err) {
              emitter.removeListener(name, eventListener);
              reject(err);
            };
            emitter.once("error", errorListener);
          }
          onCancel(function() {
            errorListener && emitter.removeListener("error", errorListener);
            emitter.removeListener(name, eventListener);
          });
          emitter.once(name, eventListener);
        }, {
          timeout: options.timeout,
          overload: options.overload
        });
      }
      var prototype = EventEmitter5.prototype;
      Object.defineProperties(EventEmitter5, {
        defaultMaxListeners: {
          get: function() {
            return prototype._maxListeners;
          },
          set: function(n) {
            if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
              throw TypeError("n must be a non-negative number");
            }
            prototype._maxListeners = n;
          },
          enumerable: true
        },
        once: {
          value: once,
          writable: true,
          configurable: true
        }
      });
      Object.defineProperties(prototype, {
        _maxListeners: {
          value: defaultMaxListeners,
          writable: true,
          configurable: true
        },
        _observers: { value: null, writable: true, configurable: true }
      });
      if (typeof define === "function" && define.amd) {
        define(function() {
          return EventEmitter5;
        });
      } else if (typeof exports2 === "object") {
        module2.exports = EventEmitter5;
      } else {
        var _global = new Function("", "return this")();
        _global.EventEmitter2 = EventEmitter5;
      }
    })();
  }
});

// node_modules/@pm2/io/build/main/transports/IPCTransport.js
var require_IPCTransport = __commonJS({
  "node_modules/@pm2/io/build/main/transports/IPCTransport.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IPCTransport = void 0;
    var Debug = require_src2();
    var eventemitter2_1 = require_eventemitter2();
    var cluster = require("cluster");
    var IPCTransport = class extends eventemitter2_1.EventEmitter2 {
      constructor() {
        super(...arguments);
        this.initiated = false;
        this.logger = Debug("axm:transport:ipc");
      }
      init(config) {
        this.logger("Init new transport service");
        if (this.initiated === true) {
          console.error(`Trying to re-init the transport, please avoid`);
          return this;
        }
        this.initiated = true;
        this.logger("Agent launched");
        this.onMessage = (data) => {
          this.logger(`Received reverse message from IPC`);
          this.emit("data", data);
        };
        process.on("message", this.onMessage);
        if (cluster.isWorker === false) {
          this.autoExitHook();
        }
        return this;
      }
      autoExitHook() {
        this.autoExitHandle = setInterval(() => {
          let currentProcess = cluster.isWorker ? cluster.worker.process : process;
          if (currentProcess._getActiveHandles().length === 3) {
            let handlers2 = currentProcess._getActiveHandles().map((h) => h.constructor.name);
            if (handlers2.includes("Pipe") === true && handlers2.includes("Socket") === true) {
              process.removeListener("message", this.onMessage);
              let tmp = setTimeout((_) => {
                this.logger(`Still alive, listen back to IPC`);
                process.on("message", this.onMessage);
              }, 200);
              tmp.unref();
            }
          }
        }, 3e3);
        this.autoExitHandle.unref();
      }
      setMetrics(metrics) {
        const serializedMetric = metrics.reduce((object, metric) => {
          if (typeof metric.name !== "string")
            return object;
          object[metric.name] = {
            historic: metric.historic,
            unit: metric.unit,
            type: metric.id,
            value: metric.value
          };
          return object;
        }, {});
        this.send("axm:monitor", serializedMetric);
      }
      addAction(action) {
        this.logger(`Add action: ${action.name}:${action.type}`);
        this.send("axm:action", {
          action_name: action.name,
          action_type: action.type,
          arity: action.arity,
          opts: action.opts
        });
      }
      setOptions(options) {
        this.logger(`Set options: [${Object.keys(options).join(",")}]`);
        return this.send("axm:option:configuration", options);
      }
      send(channel, payload) {
        if (typeof process.send !== "function")
          return -1;
        if (process.connected === false) {
          console.error("Process disconnected from parent! (not connected)");
          return process.exit(1);
        }
        try {
          process.send({ type: channel, data: payload });
        } catch (err) {
          this.logger("Process disconnected from parent !");
          this.logger(err);
          return process.exit(1);
        }
      }
      destroy() {
        if (this.onMessage !== void 0) {
          process.removeListener("message", this.onMessage);
        }
        if (this.autoExitHandle !== void 0) {
          clearInterval(this.autoExitHandle);
        }
        this.logger("destroy");
      }
    };
    exports2.IPCTransport = IPCTransport;
  }
});

// node_modules/@pm2/io/build/main/services/transport.js
var require_transport = __commonJS({
  "node_modules/@pm2/io/build/main/services/transport.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TransportConfig = void 0;
    exports2.createTransport = createTransport;
    var IPCTransport_1 = require_IPCTransport();
    var TransportConfig = class {
    };
    exports2.TransportConfig = TransportConfig;
    function createTransport(name, config) {
      const transport = new IPCTransport_1.IPCTransport();
      transport.init(config);
      return transport;
    }
  }
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports2, module2) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports2, module2) {
    var debug3 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug3;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports2, module2) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug3 = require_debug();
    exports2 = module2.exports = {};
    var re = exports2.re = [];
    var safeRe = exports2.safeRe = [];
    var src2 = exports2.src = [];
    var t = exports2.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug3(name, index, value);
      t[name] = index;
      src2[index] = value;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src2[t.NUMERICIDENTIFIER]})\\.(${src2[t.NUMERICIDENTIFIER]})\\.(${src2[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src2[t.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src2[t.NUMERICIDENTIFIER]}|${src2[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src2[t.NUMERICIDENTIFIERLOOSE]}|${src2[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src2[t.PRERELEASEIDENTIFIER]}(?:\\.${src2[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src2[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src2[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src2[t.BUILDIDENTIFIER]}(?:\\.${src2[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src2[t.MAINVERSION]}${src2[t.PRERELEASE]}?${src2[t.BUILD]}?`);
    createToken("FULL", `^${src2[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src2[t.MAINVERSIONLOOSE]}${src2[t.PRERELEASELOOSE]}?${src2[t.BUILD]}?`);
    createToken("LOOSE", `^${src2[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src2[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src2[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src2[t.XRANGEIDENTIFIER]})(?:\\.(${src2[t.XRANGEIDENTIFIER]})(?:\\.(${src2[t.XRANGEIDENTIFIER]})(?:${src2[t.PRERELEASE]})?${src2[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src2[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t.XRANGEIDENTIFIERLOOSE]})(?:${src2[t.PRERELEASELOOSE]})?${src2[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src2[t.GTLT]}\\s*${src2[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src2[t.GTLT]}\\s*${src2[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCE", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`);
    createToken("COERCERTL", src2[t.COERCE], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src2[t.LONETILDE]}\\s+`, true);
    exports2.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src2[t.LONETILDE]}${src2[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src2[t.LONETILDE]}${src2[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src2[t.LONECARET]}\\s+`, true);
    exports2.caretTrimReplace = "$1^";
    createToken("CARET", `^${src2[t.LONECARET]}${src2[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src2[t.LONECARET]}${src2[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src2[t.GTLT]}\\s*(${src2[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src2[t.GTLT]}\\s*(${src2[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src2[t.GTLT]}\\s*(${src2[t.LOOSEPLAIN]}|${src2[t.XRANGEPLAIN]})`, true);
    exports2.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src2[t.XRANGEPLAIN]})\\s+-\\s+(${src2[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src2[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src2[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports2, module2) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports2, module2) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports2, module2) {
    var debug3 = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug3("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug3("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug3("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug3("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (!identifier && identifierBase === false) {
              throw new Error("invalid increment argument: identifier is empty");
            }
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports2, module2) {
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports2, module2) {
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports2, module2) {
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports2, module2) {
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports2, module2) {
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (highVersion.patch) {
          return "patch";
        }
        if (highVersion.minor) {
          return "minor";
        }
        return "major";
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports2, module2) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports2, module2) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports2, module2) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports2, module2) {
    var parse = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports2, module2) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports2, module2) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports2, module2) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports2, module2) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports2, module2) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports2, module2) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports2, module2) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports2, module2) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports2, module2) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports2, module2) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports2, module2) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports2, module2) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports2, module2) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports2, module2) {
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(re[t.COERCE]);
      } else {
        let next;
        while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
        }
        re[t.COERCERTL].lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      return parse(`${match[2]}.${match[3] || "0"}.${match[4] || "0"}`, options);
    };
    module2.exports = coerce;
  }
});

// node_modules/yallist/iterator.js
var require_iterator = __commonJS({
  "node_modules/yallist/iterator.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value;
        }
      };
    };
  }
});

// node_modules/yallist/yallist.js
var require_yallist = __commonJS({
  "node_modules/yallist/yallist.js"(exports2, module2) {
    "use strict";
    module2.exports = Yallist;
    Yallist.Node = Node;
    Yallist.create = Yallist;
    function Yallist(list) {
      var self = this;
      if (!(self instanceof Yallist)) {
        self = new Yallist();
      }
      self.tail = null;
      self.head = null;
      self.length = 0;
      if (list && typeof list.forEach === "function") {
        list.forEach(function(item) {
          self.push(item);
        });
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self.push(arguments[i]);
        }
      }
      return self;
    }
    Yallist.prototype.removeNode = function(node) {
      if (node.list !== this) {
        throw new Error("removing node which does not belong to this list");
      }
      var next = node.next;
      var prev = node.prev;
      if (next) {
        next.prev = prev;
      }
      if (prev) {
        prev.next = next;
      }
      if (node === this.head) {
        this.head = next;
      }
      if (node === this.tail) {
        this.tail = prev;
      }
      node.list.length--;
      node.next = null;
      node.prev = null;
      node.list = null;
      return next;
    };
    Yallist.prototype.unshiftNode = function(node) {
      if (node === this.head) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var head = this.head;
      node.list = this;
      node.next = head;
      if (head) {
        head.prev = node;
      }
      this.head = node;
      if (!this.tail) {
        this.tail = node;
      }
      this.length++;
    };
    Yallist.prototype.pushNode = function(node) {
      if (node === this.tail) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var tail = this.tail;
      node.list = this;
      node.prev = tail;
      if (tail) {
        tail.next = node;
      }
      this.tail = node;
      if (!this.head) {
        this.head = node;
      }
      this.length++;
    };
    Yallist.prototype.push = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.unshift = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.pop = function() {
      if (!this.tail) {
        return void 0;
      }
      var res = this.tail.value;
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.shift = function() {
      if (!this.head) {
        return void 0;
      }
      var res = this.head.value;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.forEach = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
      }
    };
    Yallist.prototype.forEachReverse = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
      }
    };
    Yallist.prototype.get = function(n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.getReverse = function(n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        walker = walker.prev;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.map = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.head; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
      }
      return res;
    };
    Yallist.prototype.mapReverse = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.tail; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
      }
      return res;
    };
    Yallist.prototype.reduce = function(fn, initial) {
      var acc;
      var walker = this.head;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i);
        walker = walker.next;
      }
      return acc;
    };
    Yallist.prototype.reduceReverse = function(fn, initial) {
      var acc;
      var walker = this.tail;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
      }
      return acc;
    };
    Yallist.prototype.toArray = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.next;
      }
      return arr;
    };
    Yallist.prototype.toArrayReverse = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.prev;
      }
      return arr;
    };
    Yallist.prototype.slice = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next;
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.sliceReverse = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev;
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
      if (start > this.length) {
        start = this.length - 1;
      }
      if (start < 0) {
        start = this.length + start;
      }
      for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
        walker = walker.next;
      }
      var ret = [];
      for (var i = 0; walker && i < deleteCount; i++) {
        ret.push(walker.value);
        walker = this.removeNode(walker);
      }
      if (walker === null) {
        walker = this.tail;
      }
      if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev;
      }
      for (var i = 0; i < nodes.length; i++) {
        walker = insert(this, walker, nodes[i]);
      }
      return ret;
    };
    Yallist.prototype.reverse = function() {
      var head = this.head;
      var tail = this.tail;
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
      }
      this.head = tail;
      this.tail = head;
      return this;
    };
    function insert(self, node, value) {
      var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
      if (inserted.next === null) {
        self.tail = inserted;
      }
      if (inserted.prev === null) {
        self.head = inserted;
      }
      self.length++;
      return inserted;
    }
    function push(self, item) {
      self.tail = new Node(item, self.tail, null, self);
      if (!self.head) {
        self.head = self.tail;
      }
      self.length++;
    }
    function unshift(self, item) {
      self.head = new Node(item, null, self.head, self);
      if (!self.tail) {
        self.tail = self.head;
      }
      self.length++;
    }
    function Node(value, prev, next, list) {
      if (!(this instanceof Node)) {
        return new Node(value, prev, next, list);
      }
      this.list = list;
      this.value = value;
      if (prev) {
        prev.next = this;
        this.prev = prev;
      } else {
        this.prev = null;
      }
      if (next) {
        next.prev = this;
        this.next = next;
      } else {
        this.next = null;
      }
    }
    try {
      require_iterator()(Yallist);
    } catch (er) {
    }
  }
});

// node_modules/lru-cache/index.js
var require_lru_cache = __commonJS({
  "node_modules/lru-cache/index.js"(exports2, module2) {
    "use strict";
    var Yallist = require_yallist();
    var MAX = /* @__PURE__ */ Symbol("max");
    var LENGTH = /* @__PURE__ */ Symbol("length");
    var LENGTH_CALCULATOR = /* @__PURE__ */ Symbol("lengthCalculator");
    var ALLOW_STALE = /* @__PURE__ */ Symbol("allowStale");
    var MAX_AGE = /* @__PURE__ */ Symbol("maxAge");
    var DISPOSE = /* @__PURE__ */ Symbol("dispose");
    var NO_DISPOSE_ON_SET = /* @__PURE__ */ Symbol("noDisposeOnSet");
    var LRU_LIST = /* @__PURE__ */ Symbol("lruList");
    var CACHE = /* @__PURE__ */ Symbol("cache");
    var UPDATE_AGE_ON_GET = /* @__PURE__ */ Symbol("updateAgeOnGet");
    var naiveLength = () => 1;
    var LRUCache = class {
      constructor(options) {
        if (typeof options === "number")
          options = { max: options };
        if (!options)
          options = {};
        if (options.max && (typeof options.max !== "number" || options.max < 0))
          throw new TypeError("max must be a non-negative number");
        const max = this[MAX] = options.max || Infinity;
        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
      }
      // resize the cache when the max changes.
      set max(mL) {
        if (typeof mL !== "number" || mL < 0)
          throw new TypeError("max must be a non-negative number");
        this[MAX] = mL || Infinity;
        trim(this);
      }
      get max() {
        return this[MAX];
      }
      set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale;
      }
      get allowStale() {
        return this[ALLOW_STALE];
      }
      set maxAge(mA) {
        if (typeof mA !== "number")
          throw new TypeError("maxAge must be a non-negative number");
        this[MAX_AGE] = mA;
        trim(this);
      }
      get maxAge() {
        return this[MAX_AGE];
      }
      // resize the cache when the lengthCalculator changes.
      set lengthCalculator(lC) {
        if (typeof lC !== "function")
          lC = naiveLength;
        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC;
          this[LENGTH] = 0;
          this[LRU_LIST].forEach((hit) => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
            this[LENGTH] += hit.length;
          });
        }
        trim(this);
      }
      get lengthCalculator() {
        return this[LENGTH_CALCULATOR];
      }
      get length() {
        return this[LENGTH];
      }
      get itemCount() {
        return this[LRU_LIST].length;
      }
      rforEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].tail; walker !== null; ) {
          const prev = walker.prev;
          forEachStep(this, fn, walker, thisp);
          walker = prev;
        }
      }
      forEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].head; walker !== null; ) {
          const next = walker.next;
          forEachStep(this, fn, walker, thisp);
          walker = next;
        }
      }
      keys() {
        return this[LRU_LIST].toArray().map((k) => k.key);
      }
      values() {
        return this[LRU_LIST].toArray().map((k) => k.value);
      }
      reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
          this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
        }
        this[CACHE] = /* @__PURE__ */ new Map();
        this[LRU_LIST] = new Yallist();
        this[LENGTH] = 0;
      }
      dump() {
        return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter((h) => h);
      }
      dumpLru() {
        return this[LRU_LIST];
      }
      set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];
        if (maxAge && typeof maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);
        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key));
            return false;
          }
          const node = this[CACHE].get(key);
          const item = node.value;
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET])
              this[DISPOSE](key, item.value);
          }
          item.now = now;
          item.maxAge = maxAge;
          item.value = value;
          this[LENGTH] += len - item.length;
          item.length = len;
          this.get(key);
          trim(this);
          return true;
        }
        const hit = new Entry(key, value, len, now, maxAge);
        if (hit.length > this[MAX]) {
          if (this[DISPOSE])
            this[DISPOSE](key, value);
          return false;
        }
        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true;
      }
      has(key) {
        if (!this[CACHE].has(key)) return false;
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit);
      }
      get(key) {
        return get(this, key, true);
      }
      peek(key) {
        return get(this, key, false);
      }
      pop() {
        const node = this[LRU_LIST].tail;
        if (!node)
          return null;
        del(this, node);
        return node.value;
      }
      del(key) {
        del(this, this[CACHE].get(key));
      }
      load(arr) {
        this.reset();
        const now = Date.now();
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l];
          const expiresAt = hit.e || 0;
          if (expiresAt === 0)
            this.set(hit.k, hit.v);
          else {
            const maxAge = expiresAt - now;
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge);
            }
          }
        }
      }
      prune() {
        this[CACHE].forEach((value, key) => get(this, key, false));
      }
    };
    var get = (self, key, doUse) => {
      const node = self[CACHE].get(key);
      if (node) {
        const hit = node.value;
        if (isStale(self, hit)) {
          del(self, node);
          if (!self[ALLOW_STALE])
            return void 0;
        } else {
          if (doUse) {
            if (self[UPDATE_AGE_ON_GET])
              node.value.now = Date.now();
            self[LRU_LIST].unshiftNode(node);
          }
        }
        return hit.value;
      }
    };
    var isStale = (self, hit) => {
      if (!hit || !hit.maxAge && !self[MAX_AGE])
        return false;
      const diff = Date.now() - hit.now;
      return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
    };
    var trim = (self) => {
      if (self[LENGTH] > self[MAX]) {
        for (let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null; ) {
          const prev = walker.prev;
          del(self, walker);
          walker = prev;
        }
      }
    };
    var del = (self, node) => {
      if (node) {
        const hit = node.value;
        if (self[DISPOSE])
          self[DISPOSE](hit.key, hit.value);
        self[LENGTH] -= hit.length;
        self[CACHE].delete(hit.key);
        self[LRU_LIST].removeNode(node);
      }
    };
    var Entry = class {
      constructor(key, value, length, now, maxAge) {
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
      }
    };
    var forEachStep = (self, fn, node, thisp) => {
      let hit = node.value;
      if (isStale(self, hit)) {
        del(self, node);
        if (!self[ALLOW_STALE])
          hit = void 0;
      }
      if (hit)
        fn.call(thisp, hit.value, hit.key, self);
    };
    module2.exports = LRUCache;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports2, module2) {
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.format();
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().split(/\s+/).join(" ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.format();
      }
      format() {
        this.range = this.set.map((comps) => comps.join(" ").trim()).join("||").trim();
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug3("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug3("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug3("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug3("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug3("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug3("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range;
    var LRU = require_lru_cache();
    var cache = new LRU({ max: 1e3 });
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug3 = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug3("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug3("caret", comp);
      comp = replaceTildes(comp, options);
      debug3("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug3("xrange", comp);
      comp = replaceStars(comp, options);
      debug3("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug3("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug3("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug3("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug3("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug3("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug3("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug3("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug3("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug3("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug3("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug3("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug3("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug3("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug3(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports2, module2) {
    var ANY = /* @__PURE__ */ Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug3("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug3("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug3("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug3 = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports2, module2) {
    var Range = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module2.exports = satisfies;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports2, module2) {
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports2, module2) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports2, module2) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports2, module2) {
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module2.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports2, module2) {
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module2.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports2, module2) {
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports2, module2) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports2, module2) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports2, module2) {
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers2 = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers2.compareIdentifiers,
      rcompareIdentifiers: identifiers2.rcompareIdentifiers
    };
  }
});

// node_modules/@pm2/io/build/main/utils/stackParser.js
var require_stackParser = __commonJS({
  "node_modules/@pm2/io/build/main/utils/stackParser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StackTraceParser = exports2.Cache = void 0;
    var Cache = class {
      constructor(opts) {
        this.cache = {};
        this.ttlCache = {};
        this.onMiss = opts.miss;
        this.tllTime = opts.ttl || -1;
        if (opts.ttl) {
          this.worker = setInterval(this.workerFn.bind(this), 1e3);
          this.worker.unref();
        }
      }
      workerFn() {
        let keys = Object.keys(this.ttlCache);
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          let value = this.ttlCache[key];
          if (Date.now() > value) {
            delete this.cache[key];
            delete this.ttlCache[key];
          }
        }
      }
      get(key) {
        if (!key)
          return null;
        let value = this.cache[key];
        if (value)
          return value;
        value = this.onMiss(key);
        if (value) {
          this.set(key, value);
        }
        return value;
      }
      set(key, value) {
        if (!key || !value)
          return false;
        this.cache[key] = value;
        if (this.tllTime > 0) {
          this.ttlCache[key] = Date.now() + this.tllTime;
        }
        return true;
      }
      reset() {
        this.cache = {};
        this.ttlCache = {};
      }
    };
    exports2.Cache = Cache;
    var StackTraceParser = class {
      constructor(options) {
        this.contextSize = 3;
        this.cache = options.cache;
        this.contextSize = options.contextSize;
      }
      isAbsolute(path2) {
        if (process.platform === "win32") {
          let splitDeviceRe = /^([a-zA-Z]:|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)?([\\/])?([\s\S]*?)$/;
          let result = splitDeviceRe.exec(path2);
          if (result === null)
            return path2.charAt(0) === "/";
          let device = result[1] || "";
          let isUnc = Boolean(device && device.charAt(1) !== ":");
          return Boolean(result[2] || isUnc);
        } else {
          return path2.charAt(0) === "/";
        }
      }
      parse(stack) {
        if (stack.length === 0)
          return null;
        const userFrame = stack.find((frame) => {
          const type2 = this.isAbsolute(frame.file_name) || frame.file_name[0] === "." ? "user" : "core";
          return type2 !== "core" && frame.file_name.indexOf("node_modules") < 0 && frame.file_name.indexOf("@pm2/io") < 0;
        });
        if (userFrame === void 0)
          return null;
        const context = this.cache.get(userFrame.file_name);
        const source = [];
        if (context === null || context.length === 0)
          return null;
        const preLine = userFrame.line_number - this.contextSize - 1;
        const start = preLine > 0 ? preLine : 0;
        context.slice(start, userFrame.line_number - 1).forEach(function(line) {
          source.push(line.replace(/\t/g, "  "));
        });
        if (context[userFrame.line_number - 1]) {
          source.push(context[userFrame.line_number - 1].replace(/\t/g, "  ").replace("  ", ">>"));
        }
        const postLine = userFrame.line_number + this.contextSize;
        context.slice(userFrame.line_number, postLine).forEach(function(line) {
          source.push(line.replace(/\t/g, "  "));
        });
        return {
          context: source.join("\n"),
          callsite: [userFrame.file_name, userFrame.line_number].join(":")
        };
      }
      retrieveContext(error) {
        if (error.stack === void 0)
          return null;
        const frameRegex = /(\/[^\\\n]*)/g;
        let tmp;
        let frames = [];
        while (tmp = frameRegex.exec(error.stack)) {
          frames.push(tmp[1]);
        }
        const stackFrames = frames.map((callsite) => {
          if (callsite[callsite.length - 1] === ")") {
            callsite = callsite.substr(0, callsite.length - 1);
          }
          let location = callsite.split(":");
          return {
            file_name: location[0],
            line_number: parseInt(location[1], 10)
          };
        });
        return this.parse(stackFrames);
      }
    };
    exports2.StackTraceParser = StackTraceParser;
  }
});

// node_modules/@pm2/io/build/main/features/notify.js
var require_notify = __commonJS({
  "node_modules/@pm2/io/build/main/features/notify.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NotifyFeature = exports2.ErrorContext = exports2.NotifyOptions = void 0;
    var configuration_1 = require_configuration();
    var serviceManager_1 = require_serviceManager();
    var debug_1 = require_src2();
    var semver = require_semver2();
    var stackParser_1 = require_stackParser();
    var fs2 = require("fs");
    var path2 = require("path");
    var NotifyOptions = class {
    };
    exports2.NotifyOptions = NotifyOptions;
    var ErrorContext = class {
    };
    exports2.ErrorContext = ErrorContext;
    var optionsDefault = {
      catchExceptions: true
    };
    var NotifyFeature = class {
      constructor() {
        this.logger = (0, debug_1.default)("axm:features:notify");
      }
      init(options) {
        if (options === void 0) {
          options = optionsDefault;
        }
        this.logger("init");
        this.transport = serviceManager_1.ServiceManager.get("transport");
        if (this.transport === void 0) {
          return this.logger(`Failed to load transporter service`);
        }
        configuration_1.default.configureModule({
          error: true
        });
        if (options.catchExceptions === false)
          return;
        this.logger("Registering hook to catch unhandled exception/rejection");
        this.cache = new stackParser_1.Cache({
          miss: (key) => {
            try {
              const content = fs2.readFileSync(path2.resolve(key));
              return content.toString().split(/\r?\n/);
            } catch (err) {
              this.logger("Error while trying to get file from FS : %s", err.message || err);
              return null;
            }
          },
          ttl: 30 * 60
        });
        this.stackParser = new stackParser_1.StackTraceParser({
          cache: this.cache,
          contextSize: 5
        });
        this.catchAll();
      }
      destroy() {
        process.removeListener("uncaughtException", this.onUncaughtException);
        process.removeListener("unhandledRejection", this.onUnhandledRejection);
        this.logger("destroy");
      }
      getSafeError(err) {
        if (err instanceof Error)
          return err;
        let message;
        try {
          message = `Non-error value: ${JSON.stringify(err)}`;
        } catch (e) {
          try {
            message = `Unserializable non-error value: ${String(e)}`;
          } catch (e2) {
            message = `Unserializable non-error value that cannot be converted to a string`;
          }
        }
        if (message.length > 1e3)
          message = message.substr(0, 1e3) + "...";
        return new Error(message);
      }
      notifyError(err, context) {
        if (typeof context !== "object") {
          context = {};
        }
        if (this.transport === void 0) {
          return this.logger(`Tried to send error without having transporter available`);
        }
        const safeError = this.getSafeError(err);
        let stackContext = null;
        if (err instanceof Error) {
          stackContext = this.stackParser.retrieveContext(err);
        }
        const payload = Object.assign({
          message: safeError.message,
          stack: safeError.stack,
          name: safeError.name,
          metadata: context
        }, stackContext === null ? {} : stackContext);
        return this.transport.send("process:exception", payload);
      }
      onUncaughtException(error) {
        if (semver.satisfies(process.version, "< 6")) {
          console.error(error.stack);
        } else {
          console.error(error);
        }
        const safeError = this.getSafeError(error);
        let stackContext = null;
        if (error instanceof Error) {
          stackContext = this.stackParser.retrieveContext(error);
        }
        const payload = Object.assign({
          message: safeError.message,
          stack: safeError.stack,
          name: safeError.name
        }, stackContext === null ? {} : stackContext);
        if (serviceManager_1.ServiceManager.get("transport")) {
          serviceManager_1.ServiceManager.get("transport").send("process:exception", payload);
        }
        if (process.listeners("uncaughtException").length === 1) {
          process.exit(1);
        }
      }
      onUnhandledRejection(error) {
        if (error === void 0)
          return;
        console.error(error);
        const safeError = this.getSafeError(error);
        let stackContext = null;
        if (error instanceof Error) {
          stackContext = this.stackParser.retrieveContext(error);
        }
        const payload = Object.assign({
          message: safeError.message,
          stack: safeError.stack,
          name: safeError.name
        }, stackContext === null ? {} : stackContext);
        if (serviceManager_1.ServiceManager.get("transport")) {
          serviceManager_1.ServiceManager.get("transport").send("process:exception", payload);
        }
      }
      catchAll() {
        if (process.env.exec_mode === "cluster_mode") {
          return false;
        }
        process.on("uncaughtException", this.onUncaughtException.bind(this));
        process.on("unhandledRejection", this.onUnhandledRejection.bind(this));
      }
      expressErrorHandler() {
        const self = this;
        configuration_1.default.configureModule({
          error: true
        });
        return function errorHandler(err, req, res, next) {
          const safeError = self.getSafeError(err);
          const payload = {
            message: safeError.message,
            stack: safeError.stack,
            name: safeError.name,
            metadata: {
              http: {
                url: req.url,
                params: req.params,
                method: req.method,
                query: req.query,
                body: req.body,
                path: req.path,
                route: req.route && req.route.path ? req.route.path : void 0
              },
              custom: {
                user: typeof req.user === "object" ? req.user.id : void 0
              }
            }
          };
          if (serviceManager_1.ServiceManager.get("transport")) {
            serviceManager_1.ServiceManager.get("transport").send("process:exception", payload);
          }
          return next(err);
        };
      }
      koaErrorHandler() {
        const self = this;
        configuration_1.default.configureModule({
          error: true
        });
        return function(ctx, next) {
          return __awaiter(this, void 0, void 0, function* () {
            try {
              yield next();
            } catch (err) {
              const safeError = self.getSafeError(err);
              const payload = {
                message: safeError.message,
                stack: safeError.stack,
                name: safeError.name,
                metadata: {
                  http: {
                    url: ctx.request.url,
                    params: ctx.params,
                    method: ctx.request.method,
                    query: ctx.request.query,
                    body: ctx.request.body,
                    path: ctx.request.path,
                    route: ctx._matchedRoute
                  },
                  custom: {
                    user: typeof ctx.user === "object" ? ctx.user.id : void 0
                  }
                }
              };
              if (serviceManager_1.ServiceManager.get("transport")) {
                serviceManager_1.ServiceManager.get("transport").send("process:exception", payload);
              }
              throw err;
            }
          });
        };
      }
    };
    exports2.NotifyFeature = NotifyFeature;
  }
});

// node_modules/@pm2/io/build/main/utils/module.js
var require_module = __commonJS({
  "node_modules/@pm2/io/build/main/utils/module.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fs2 = require("fs");
    var Debug = require_src2();
    var path2 = require("path");
    var debug3 = Debug("axm:utils:module");
    var ModuleUtils = class _ModuleUtils {
      static loadModule(modulePath, args) {
        let nodule;
        try {
          if (args) {
            nodule = require(modulePath).apply(this, args);
          } else {
            nodule = require(modulePath);
          }
          debug3(`Succesfully required module at path ${modulePath}`);
          return nodule;
        } catch (err) {
          debug3(`Failed to load module at path ${modulePath}: ${err.message}`);
          return err;
        }
      }
      static detectModule(moduleName) {
        const fakePath = ["./node_modules", "/node_modules"];
        if (!require.main) {
          return null;
        }
        const paths = typeof require.main.paths === "undefined" ? fakePath : require.main.paths;
        const requirePaths = paths.slice();
        return _ModuleUtils._lookForModule(requirePaths, moduleName);
      }
      static _lookForModule(requirePaths, moduleName) {
        const fsConstants = fs2.constants || fs2;
        for (let requirePath of requirePaths) {
          const completePath = path2.join(requirePath, moduleName);
          debug3(`Looking for module ${moduleName} in ${completePath}`);
          try {
            fs2.accessSync(completePath, fsConstants.R_OK);
            debug3(`Found module ${moduleName} in path ${completePath}`);
            return completePath;
          } catch (err) {
            debug3(`module ${moduleName} not found in path ${completePath}`);
            continue;
          }
        }
        return null;
      }
    };
    exports2.default = ModuleUtils;
  }
});

// node_modules/@pm2/io/build/main/utils/miscellaneous.js
var require_miscellaneous = __commonJS({
  "node_modules/@pm2/io/build/main/utils/miscellaneous.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var serviceManager_1 = require_serviceManager();
    var MiscUtils = class {
      static generateUUID() {
        return Math.random().toString(36).substr(2, 16);
      }
      static getValueFromDump(property, parentProperty) {
        if (!parentProperty) {
          parentProperty = "handles";
        }
        const dump = serviceManager_1.ServiceManager.get("eventLoopService").inspector.dump();
        return dump[parentProperty].hasOwnProperty(property) ? dump[parentProperty][property].length : 0;
      }
    };
    exports2.default = MiscUtils;
  }
});

// node_modules/@pm2/io/build/main/profilers/addonProfiler.js
var require_addonProfiler = __commonJS({
  "node_modules/@pm2/io/build/main/profilers/addonProfiler.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var module_1 = require_module();
    var configuration_1 = require_configuration();
    var serviceManager_1 = require_serviceManager();
    var miscellaneous_1 = require_miscellaneous();
    var Debug = require_src2();
    var CurrentProfile = class {
    };
    var AddonProfiler = class {
      constructor() {
        this.profiler = null;
        this.modules = ["v8-profiler-node8", "v8-profiler"];
        this.currentProfile = null;
        this.logger = Debug("axm:features:profiling:addon");
      }
      init() {
        for (const moduleName of this.modules) {
          let path2 = module_1.default.detectModule(moduleName);
          if (path2 === null)
            continue;
          let profiler = module_1.default.loadModule(moduleName);
          if (profiler instanceof Error)
            continue;
          this.profiler = profiler;
          break;
        }
        if (this.profiler === null) {
          configuration_1.default.configureModule({
            heapdump: false,
            "feature.profiler.heap_snapshot": false,
            "feature.profiler.heap_sampling": false,
            "feature.profiler.cpu_js": false
          });
          return this.logger(`Failed to require the profiler via addon, disabling profiling ...`);
        }
        this.logger("init");
        this.actionService = serviceManager_1.ServiceManager.get("actions");
        if (this.actionService === void 0) {
          return this.logger(`Fail to get action service`);
        }
        this.transport = serviceManager_1.ServiceManager.get("transport");
        if (this.transport === void 0) {
          return this.logger(`Fail to get transport service`);
        }
        configuration_1.default.configureModule({
          heapdump: true,
          "feature.profiler.heapsnapshot": true,
          "feature.profiler.heapsampling": false,
          "feature.profiler.cpu_js": true
        });
        this.register();
      }
      register() {
        if (this.actionService === void 0) {
          return this.logger(`Fail to get action service`);
        }
        this.logger("register");
        this.actionService.registerAction("km:heapdump", this.onHeapdump.bind(this));
        this.actionService.registerAction("km:cpu:profiling:start", this.onCPUProfileStart.bind(this));
        this.actionService.registerAction("km:cpu:profiling:stop", this.onCPUProfileStop.bind(this));
      }
      destroy() {
        this.logger("Addon Profiler destroyed !");
        if (this.profiler === null)
          return;
        this.profiler.deleteAllProfiles();
      }
      onCPUProfileStart(opts, cb) {
        if (typeof cb !== "function") {
          cb = opts;
          opts = {};
        }
        if (typeof opts !== "object" || opts === null) {
          opts = {};
        }
        if (this.currentProfile !== null) {
          return cb({
            err: "A profiling is already running",
            success: false
          });
        }
        this.currentProfile = new CurrentProfile();
        this.currentProfile.uuid = miscellaneous_1.default.generateUUID();
        this.currentProfile.startTime = Date.now();
        this.currentProfile.initiated = typeof opts.initiated === "string" ? opts.initiated : "manual";
        cb({ success: true, uuid: this.currentProfile.uuid });
        this.profiler.startProfiling();
        if (isNaN(parseInt(opts.timeout, 10)))
          return;
        const duration = parseInt(opts.timeout, 10);
        setTimeout((_) => {
          this.onCPUProfileStop((_2) => {
            return;
          });
        }, duration);
      }
      onCPUProfileStop(cb) {
        if (this.currentProfile === null) {
          return cb({
            err: "No profiling are already running",
            success: false
          });
        }
        if (this.transport === void 0) {
          return cb({
            err: "No profiling are already running",
            success: false
          });
        }
        const profile = this.profiler.stopProfiling();
        const data = JSON.stringify(profile);
        cb({ success: true, uuid: this.currentProfile.uuid });
        this.transport.send("profilings", {
          uuid: this.currentProfile.uuid,
          duration: Date.now() - this.currentProfile.startTime,
          at: this.currentProfile.startTime,
          data,
          dump_file_size: data.length,
          success: true,
          initiated: this.currentProfile.initiated,
          type: "cpuprofile",
          cpuprofile: true
        });
        this.currentProfile = null;
      }
      onHeapdump(opts, cb) {
        if (typeof cb !== "function") {
          cb = opts;
          opts = {};
        }
        if (typeof opts !== "object" || opts === null) {
          opts = {};
        }
        cb({ success: true });
        setTimeout(() => {
          const startTime = Date.now();
          this.takeSnapshot().then((data) => {
            return this.transport.send("profilings", {
              data,
              at: startTime,
              initiated: typeof opts.initiated === "string" ? opts.initiated : "manual",
              duration: Date.now() - startTime,
              type: "heapdump"
            });
          }).catch((err) => {
            return cb({
              success: err.message,
              err
            });
          });
        }, 200);
      }
      takeSnapshot() {
        return new Promise((resolve, reject) => {
          const snapshot = this.profiler.takeSnapshot();
          snapshot.export((err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
            snapshot.delete();
          });
        });
      }
    };
    exports2.default = AddonProfiler;
  }
});

// node_modules/@pm2/io/build/main/profilers/inspectorProfiler.js
var require_inspectorProfiler = __commonJS({
  "node_modules/@pm2/io/build/main/profilers/inspectorProfiler.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var configuration_1 = require_configuration();
    var serviceManager_1 = require_serviceManager();
    var miscellaneous_1 = require_miscellaneous();
    var Debug = require_src2();
    var semver = require_semver2();
    var CurrentProfile = class {
    };
    var InspectorProfiler = class {
      constructor() {
        this.profiler = void 0;
        this.currentProfile = null;
        this.logger = Debug("axm:features:profiling:inspector");
        this.isNode11 = semver.satisfies(semver.clean(process.version), ">11.x");
      }
      init() {
        this.profiler = serviceManager_1.ServiceManager.get("inspector");
        if (this.profiler === void 0) {
          configuration_1.default.configureModule({
            heapdump: false,
            "feature.profiler.heap_snapshot": false,
            "feature.profiler.heap_sampling": false,
            "feature.profiler.cpu_js": false
          });
          return console.error(`Failed to require the profiler via inspector, disabling profiling ...`);
        }
        this.profiler.getSession().post("Profiler.enable");
        this.profiler.getSession().post("HeapProfiler.enable");
        this.logger("init");
        this.actionService = serviceManager_1.ServiceManager.get("actions");
        if (this.actionService === void 0) {
          return this.logger(`Fail to get action service`);
        }
        this.transport = serviceManager_1.ServiceManager.get("transport");
        if (this.transport === void 0) {
          return this.logger(`Fail to get transport service`);
        }
        configuration_1.default.configureModule({
          heapdump: true,
          "feature.profiler.heapsnapshot": !this.isNode11,
          "feature.profiler.heapsampling": true,
          "feature.profiler.cpu_js": true
        });
        this.register();
      }
      register() {
        if (this.actionService === void 0) {
          return this.logger(`Fail to get action service`);
        }
        this.logger("register");
        this.actionService.registerAction("km:heapdump", this.onHeapdump.bind(this));
        this.actionService.registerAction("km:cpu:profiling:start", this.onCPUProfileStart.bind(this));
        this.actionService.registerAction("km:cpu:profiling:stop", this.onCPUProfileStop.bind(this));
        this.actionService.registerAction("km:heap:sampling:start", this.onHeapProfileStart.bind(this));
        this.actionService.registerAction("km:heap:sampling:stop", this.onHeapProfileStop.bind(this));
      }
      destroy() {
        this.logger("Inspector Profiler destroyed !");
        if (this.profiler === void 0)
          return;
        this.profiler.getSession().post("Profiler.disable");
        this.profiler.getSession().post("HeapProfiler.disable");
      }
      onHeapProfileStart(opts, cb) {
        if (typeof cb !== "function") {
          cb = opts;
          opts = {};
        }
        if (typeof opts !== "object" || opts === null) {
          opts = {};
        }
        if (this.profiler === void 0) {
          return cb({
            err: "Profiler not available",
            success: false
          });
        }
        if (this.currentProfile !== null) {
          return cb({
            err: "A profiling is already running",
            success: false
          });
        }
        this.currentProfile = new CurrentProfile();
        this.currentProfile.uuid = miscellaneous_1.default.generateUUID();
        this.currentProfile.startTime = Date.now();
        this.currentProfile.initiated = typeof opts.initiated === "string" ? opts.initiated : "manual";
        cb({ success: true, uuid: this.currentProfile.uuid });
        const defaultSamplingInterval = 16384;
        this.profiler.getSession().post("HeapProfiler.startSampling", {
          samplingInterval: typeof opts.samplingInterval === "number" ? opts.samplingInterval : defaultSamplingInterval
        });
        if (isNaN(parseInt(opts.timeout, 10)))
          return;
        const duration = parseInt(opts.timeout, 10);
        setTimeout((_) => {
          this.onHeapProfileStop((_2) => {
            return;
          });
        }, duration);
      }
      onHeapProfileStop(cb) {
        if (this.currentProfile === null) {
          return cb({
            err: "No profiling are already running",
            success: false
          });
        }
        if (this.profiler === void 0) {
          return cb({
            err: "Profiler not available",
            success: false
          });
        }
        cb({ success: true, uuid: this.currentProfile.uuid });
        this.profiler.getSession().post("HeapProfiler.stopSampling", (_, { profile }) => {
          if (this.currentProfile === null)
            return;
          if (this.transport === void 0)
            return;
          const data = JSON.stringify(profile);
          this.transport.send("profilings", {
            uuid: this.currentProfile.uuid,
            duration: Date.now() - this.currentProfile.startTime,
            at: this.currentProfile.startTime,
            data,
            success: true,
            initiated: this.currentProfile.initiated,
            type: "heapprofile",
            heapprofile: true
          });
          this.currentProfile = null;
        });
      }
      onCPUProfileStart(opts, cb) {
        if (typeof cb !== "function") {
          cb = opts;
          opts = {};
        }
        if (typeof opts !== "object" || opts === null) {
          opts = {};
        }
        if (this.profiler === void 0) {
          return cb({
            err: "Profiler not available",
            success: false
          });
        }
        if (this.currentProfile !== null) {
          return cb({
            err: "A profiling is already running",
            success: false
          });
        }
        this.currentProfile = new CurrentProfile();
        this.currentProfile.uuid = miscellaneous_1.default.generateUUID();
        this.currentProfile.startTime = Date.now();
        this.currentProfile.initiated = typeof opts.initiated === "string" ? opts.initiated : "manual";
        cb({ success: true, uuid: this.currentProfile.uuid });
        if (process.hasOwnProperty("_startProfilerIdleNotifier") === true) {
          process._startProfilerIdleNotifier();
        }
        this.profiler.getSession().post("Profiler.start");
        if (isNaN(parseInt(opts.timeout, 10)))
          return;
        const duration = parseInt(opts.timeout, 10);
        setTimeout((_) => {
          this.onCPUProfileStop((_2) => {
            return;
          });
        }, duration);
      }
      onCPUProfileStop(cb) {
        if (this.currentProfile === null) {
          return cb({
            err: "No profiling are already running",
            success: false
          });
        }
        if (this.profiler === void 0) {
          return cb({
            err: "Profiler not available",
            success: false
          });
        }
        cb({ success: true, uuid: this.currentProfile.uuid });
        if (process.hasOwnProperty("_stopProfilerIdleNotifier") === true) {
          process._stopProfilerIdleNotifier();
        }
        this.profiler.getSession().post("Profiler.stop", (_, res) => {
          if (this.currentProfile === null)
            return;
          if (this.transport === void 0)
            return;
          const profile = res.profile;
          const data = JSON.stringify(profile);
          this.transport.send("profilings", {
            uuid: this.currentProfile.uuid,
            duration: Date.now() - this.currentProfile.startTime,
            at: this.currentProfile.startTime,
            data,
            success: true,
            initiated: this.currentProfile.initiated,
            type: "cpuprofile",
            cpuprofile: true
          });
          this.currentProfile = null;
        });
      }
      onHeapdump(opts, cb) {
        if (typeof cb !== "function") {
          cb = opts;
          opts = {};
        }
        if (typeof opts !== "object" || opts === null) {
          opts = {};
        }
        if (this.profiler === void 0) {
          return cb({
            err: "Profiler not available",
            success: false
          });
        }
        cb({ success: true });
        setTimeout(() => {
          const startTime = Date.now();
          this.takeSnapshot().then((data) => {
            return this.transport.send("profilings", {
              data,
              at: startTime,
              initiated: typeof opts.initiated === "string" ? opts.initiated : "manual",
              duration: Date.now() - startTime,
              type: "heapdump"
            });
          }).catch((err) => {
            return cb({
              success: err.message,
              err
            });
          });
        }, 200);
      }
      takeSnapshot() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
          if (this.profiler === void 0)
            return reject(new Error(`Profiler not available`));
          const chunks = [];
          const chunkHandler = (raw) => {
            const data = raw.params;
            chunks.push(data.chunk);
          };
          this.profiler.getSession().on("HeapProfiler.addHeapSnapshotChunk", chunkHandler);
          yield this.profiler.getSession().post("HeapProfiler.takeHeapSnapshot", {
            reportProgress: false
          });
          this.profiler.getSession().removeListener("HeapProfiler.addHeapSnapshotChunk", chunkHandler);
          return resolve(chunks.join(""));
        }));
      }
    };
    exports2.default = InspectorProfiler;
  }
});

// node_modules/@pm2/io/build/main/constants.js
var require_constants2 = __commonJS({
  "node_modules/@pm2/io/build/main/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.canUseInspector = canUseInspector;
    var semver = require_semver2();
    exports2.default = {
      METRIC_INTERVAL: 990
    };
    function canUseInspector() {
      const isBun = typeof Bun !== "undefined";
      const isAboveNode10 = semver.satisfies(process.version, ">= 10.1.0");
      const isAboveNode8 = semver.satisfies(process.version, ">= 8.0.0");
      const canUseInNode8 = process.env.FORCE_INSPECTOR === "1" || process.env.FORCE_INSPECTOR === "true" || process.env.NODE_ENV === "production";
      return !isBun && (isAboveNode10 || isAboveNode8 && canUseInNode8);
    }
  }
});

// node_modules/@pm2/io/build/main/features/profiling.js
var require_profiling = __commonJS({
  "node_modules/@pm2/io/build/main/features/profiling.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProfilingFeature = exports2.ProfilingConfig = void 0;
    var addonProfiler_1 = require_addonProfiler();
    var inspectorProfiler_1 = require_inspectorProfiler();
    var constants_1 = require_constants2();
    var Debug = require_src2();
    var ProfilingConfig = class {
    };
    exports2.ProfilingConfig = ProfilingConfig;
    var defaultProfilingConfig = {
      cpuJS: true,
      heapSnapshot: true,
      heapSampling: true,
      implementation: "both"
    };
    var disabledProfilingConfig = {
      cpuJS: false,
      heapSnapshot: false,
      heapSampling: false,
      implementation: "none"
    };
    var ProfilingFeature = class {
      constructor() {
        this.logger = Debug("axm:features:profiling");
      }
      init(config) {
        if (config === true) {
          config = defaultProfilingConfig;
        } else if (config === false) {
          config = disabledProfilingConfig;
        } else if (config === void 0) {
          config = defaultProfilingConfig;
        }
        if (process.env.PM2_PROFILING_FORCE_FALLBACK === "true") {
          config.implementation = "addon";
        }
        if (config.implementation === void 0 || config.implementation === "both") {
          config.implementation = (0, constants_1.canUseInspector)() === true ? "inspector" : "addon";
        }
        switch (config.implementation) {
          case "inspector": {
            this.logger("using inspector implementation");
            this.profiler = new inspectorProfiler_1.default();
            break;
          }
          case "addon": {
            this.logger("using addon implementation");
            this.profiler = new addonProfiler_1.default();
            break;
          }
          default: {
            return this.logger(`Invalid profiler implementation choosen: ${config.implementation}`);
          }
        }
        this.logger("init");
        this.profiler.init();
      }
      destroy() {
        this.logger("destroy");
        if (this.profiler === void 0)
          return;
        this.profiler.destroy();
      }
    };
    exports2.ProfilingFeature = ProfilingFeature;
  }
});

// node_modules/@pm2/io/build/main/features/events.js
var require_events = __commonJS({
  "node_modules/@pm2/io/build/main/features/events.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventsFeature = void 0;
    var serviceManager_1 = require_serviceManager();
    var Debug = require_src2();
    var EventsFeature = class {
      constructor() {
        this.logger = Debug("axm:features:events");
      }
      init() {
        this.transport = serviceManager_1.ServiceManager.get("transport");
        this.logger("init");
      }
      emit(name, data) {
        if (typeof name !== "string") {
          console.error("event name must be a string");
          return console.trace();
        }
        if (typeof data !== "object") {
          console.error("event data must be an object");
          return console.trace();
        }
        if (data instanceof Array) {
          console.error(`event data cannot be an array`);
          return console.trace();
        }
        let inflightObj = {};
        try {
          inflightObj = JSON.parse(JSON.stringify(data));
        } catch (err) {
          return console.log("Failed to serialize the event data", err.message);
        }
        inflightObj.__name = name;
        if (this.transport === void 0) {
          return this.logger("Failed to send event as transporter isnt available");
        }
        this.transport.send("human:event", inflightObj);
      }
      destroy() {
        this.logger("destroy");
      }
    };
    exports2.EventsFeature = EventsFeature;
  }
});

// node_modules/@pm2/io/build/main/utils/units.js
var require_units = __commonJS({
  "node_modules/@pm2/io/build/main/utils/units.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var MILLISECONDS = 1;
    var SECONDS = 1e3 * MILLISECONDS;
    var MINUTES = 60 * SECONDS;
    var HOURS = 60 * MINUTES;
    exports2.default = {
      NANOSECONDS: 1 / (1e3 * 1e3),
      MICROSECONDS: 1 / 1e3,
      MILLISECONDS,
      SECONDS,
      MINUTES,
      HOURS,
      DAYS: 24 * HOURS
    };
  }
});

// node_modules/@pm2/io/build/main/utils/EWMA.js
var require_EWMA = __commonJS({
  "node_modules/@pm2/io/build/main/utils/EWMA.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var units_1 = require_units();
    var ExponentiallyWeightedMovingAverage = class {
      constructor(timePeriod, tickInterval) {
        this._count = 0;
        this._rate = 0;
        this.TICK_INTERVAL = 5 * units_1.default.SECONDS;
        this._timePeriod = timePeriod || 1 * units_1.default.MINUTES;
        this._tickInterval = tickInterval || this.TICK_INTERVAL;
        this._alpha = 1 - Math.exp(-this._tickInterval / this._timePeriod);
      }
      update(n) {
        this._count += n;
      }
      tick() {
        const instantRate = this._count / this._tickInterval;
        this._count = 0;
        this._rate += this._alpha * (instantRate - this._rate);
      }
      rate(timeUnit) {
        return (this._rate || 0) * timeUnit;
      }
    };
    exports2.default = ExponentiallyWeightedMovingAverage;
  }
});

// node_modules/@pm2/io/build/main/utils/metrics/meter.js
var require_meter = __commonJS({
  "node_modules/@pm2/io/build/main/utils/metrics/meter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var EWMA_1 = require_EWMA();
    var units_1 = require_units();
    var Meter = class {
      constructor(opts) {
        this.used = false;
        this.mark = function(n = 1) {
          this.used = true;
          this._rate.update(n);
        };
        this.val = function() {
          return Math.round(this._rate.rate(this._samples * units_1.default.SECONDS) * 100) / 100;
        };
        const self = this;
        if (typeof opts !== "object") {
          opts = {};
        }
        this._samples = opts.samples || opts.seconds || 1;
        this._timeframe = opts.timeframe || 60;
        this._tickInterval = opts.tickInterval || 5 * units_1.default.SECONDS;
        this._rate = new EWMA_1.default(this._timeframe * units_1.default.SECONDS, this._tickInterval);
        if (opts.debug && opts.debug === true) {
          return;
        }
        this._interval = setInterval(function() {
          self._rate.tick();
        }, this._tickInterval);
        this._interval.unref();
      }
      isUsed() {
        return this.used;
      }
    };
    exports2.default = Meter;
  }
});

// node_modules/@pm2/io/build/main/utils/metrics/counter.js
var require_counter = __commonJS({
  "node_modules/@pm2/io/build/main/utils/metrics/counter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Counter = class {
      constructor(opts) {
        this.used = false;
        opts = opts || {};
        this._count = opts.count || 0;
      }
      val() {
        return this._count;
      }
      inc(n) {
        this.used = true;
        this._count += n || 1;
      }
      dec(n) {
        this.used = true;
        this._count -= n || 1;
      }
      reset(count) {
        this._count = count || 0;
      }
      isUsed() {
        return this.used;
      }
    };
    exports2.default = Counter;
  }
});

// node_modules/@pm2/io/build/main/utils/BinaryHeap.js
var require_BinaryHeap = __commonJS({
  "node_modules/@pm2/io/build/main/utils/BinaryHeap.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var BinaryHeap = class _BinaryHeap {
      constructor(options) {
        options = options || {};
        this._elements = options.elements || [];
        this._score = options.score || this._score;
      }
      add() {
        for (let i = 0; i < arguments.length; i++) {
          const element = arguments[i];
          this._elements.push(element);
          this._bubble(this._elements.length - 1);
        }
      }
      first() {
        return this._elements[0];
      }
      removeFirst() {
        const root = this._elements[0];
        const last = this._elements.pop();
        if (this._elements.length > 0) {
          this._elements[0] = last;
          this._sink(0);
        }
        return root;
      }
      clone() {
        return new _BinaryHeap({
          elements: this.toArray(),
          score: this._score
        });
      }
      toSortedArray() {
        const array = [];
        const clone = this.clone();
        while (true) {
          const element = clone.removeFirst();
          if (element === void 0)
            break;
          array.push(element);
        }
        return array;
      }
      toArray() {
        return [].concat(this._elements);
      }
      size() {
        return this._elements.length;
      }
      _bubble(bubbleIndex) {
        const bubbleElement = this._elements[bubbleIndex];
        const bubbleScore = this._score(bubbleElement);
        while (bubbleIndex > 0) {
          const parentIndex = this._parentIndex(bubbleIndex);
          const parentElement = this._elements[parentIndex];
          const parentScore = this._score(parentElement);
          if (bubbleScore <= parentScore)
            break;
          this._elements[parentIndex] = bubbleElement;
          this._elements[bubbleIndex] = parentElement;
          bubbleIndex = parentIndex;
        }
      }
      _sink(sinkIndex) {
        const sinkElement = this._elements[sinkIndex];
        const sinkScore = this._score(sinkElement);
        const length = this._elements.length;
        while (true) {
          let swapIndex;
          let swapScore;
          let swapElement = null;
          const childIndexes = this._childIndexes(sinkIndex);
          for (let i = 0; i < childIndexes.length; i++) {
            const childIndex = childIndexes[i];
            if (childIndex >= length)
              break;
            const childElement = this._elements[childIndex];
            const childScore = this._score(childElement);
            if (childScore > sinkScore) {
              if (swapScore === void 0 || swapScore < childScore) {
                swapIndex = childIndex;
                swapScore = childScore;
                swapElement = childElement;
              }
            }
          }
          if (swapIndex === void 0)
            break;
          this._elements[swapIndex] = sinkElement;
          this._elements[sinkIndex] = swapElement;
          sinkIndex = swapIndex;
        }
      }
      _parentIndex(index) {
        return Math.floor((index - 1) / 2);
      }
      _childIndexes(index) {
        return [
          2 * index + 1,
          2 * index + 2
        ];
      }
      _score(element) {
        return element.valueOf();
      }
    };
    exports2.default = BinaryHeap;
  }
});

// node_modules/@pm2/io/build/main/utils/EDS.js
var require_EDS = __commonJS({
  "node_modules/@pm2/io/build/main/utils/EDS.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var BinaryHeap_1 = require_BinaryHeap();
    var units_1 = require_units();
    var ExponentiallyDecayingSample = class {
      constructor(options) {
        this.RESCALE_INTERVAL = 1 * units_1.default.HOURS;
        this.ALPHA = 0.015;
        this.SIZE = 1028;
        options = options || {};
        this._elements = new BinaryHeap_1.default({
          score: function(element) {
            return -element.priority;
          }
        });
        this._rescaleInterval = options.rescaleInterval || this.RESCALE_INTERVAL;
        this._alpha = options.alpha || this.ALPHA;
        this._size = options.size || this.SIZE;
        this._random = options.random || this._random;
        this._landmark = null;
        this._nextRescale = null;
        this._mean = null;
      }
      update(value, timestamp) {
        const now = Date.now();
        if (!this._landmark) {
          this._landmark = now;
          this._nextRescale = this._landmark + this._rescaleInterval;
        }
        timestamp = timestamp || now;
        const newSize = this._elements.size() + 1;
        const element = {
          priority: this._priority(timestamp - this._landmark),
          value
        };
        if (newSize <= this._size) {
          this._elements.add(element);
        } else if (element.priority > this._elements.first().priority) {
          this._elements.removeFirst();
          this._elements.add(element);
        }
        if (now >= this._nextRescale)
          this._rescale(now);
      }
      toSortedArray() {
        return this._elements.toSortedArray().map(function(element) {
          return element.value;
        });
      }
      toArray() {
        return this._elements.toArray().map(function(element) {
          return element.value;
        });
      }
      _weight(age) {
        return Math.exp(this._alpha * (age / 1e3));
      }
      _priority(age) {
        return this._weight(age) / this._random();
      }
      _random() {
        return Math.random();
      }
      _rescale(now) {
        now = now || Date.now();
        const self = this;
        const oldLandmark = this._landmark;
        this._landmark = now || Date.now();
        this._nextRescale = now + this._rescaleInterval;
        const factor = self._priority(-(self._landmark - oldLandmark));
        this._elements.toArray().forEach(function(element) {
          element.priority *= factor;
        });
      }
      avg(now) {
        let sum = 0;
        this._elements.toArray().forEach(function(element) {
          sum += element.value;
        });
        return sum / this._elements.size();
      }
    };
    exports2.default = ExponentiallyDecayingSample;
  }
});

// node_modules/@pm2/io/build/main/utils/metrics/histogram.js
var require_histogram = __commonJS({
  "node_modules/@pm2/io/build/main/utils/metrics/histogram.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var EDS_1 = require_EDS();
    var Histogram = class {
      constructor(opts) {
        this._sample = new EDS_1.default();
        this._count = 0;
        this._sum = 0;
        this._varianceM = 0;
        this._varianceS = 0;
        this._ema = 0;
        this.used = false;
        opts = opts || {};
        this._measurement = opts.measurement;
        this._callFn = null;
        const methods = {
          min: this.getMin,
          max: this.getMax,
          sum: this.getSum,
          count: this.getCount,
          variance: this._calculateVariance,
          mean: this._calculateMean,
          ema: this.getEma()
        };
        if (methods.hasOwnProperty(this._measurement)) {
          this._callFn = methods[this._measurement];
        } else {
          this._callFn = function() {
            const percentiles = this.percentiles([0.5, 0.75, 0.95, 0.99, 0.999]);
            const medians = {
              median: percentiles[0.5],
              p75: percentiles[0.75],
              p95: percentiles[0.95],
              p99: percentiles[0.99],
              p999: percentiles[0.999]
            };
            return medians[this._measurement];
          };
        }
      }
      update(value) {
        this.used = true;
        this._count++;
        this._sum += value;
        this._sample.update(value);
        this._updateMin(value);
        this._updateMax(value);
        this._updateVariance(value);
        this._updateEma(value);
      }
      percentiles(percentiles) {
        const values = this._sample.toArray().sort(function(a, b) {
          return a === b ? 0 : a - b;
        });
        const results = {};
        for (let i = 0; i < percentiles.length; i++) {
          const percentile = percentiles[i];
          if (!values.length) {
            results[percentile] = null;
            continue;
          }
          const pos = percentile * (values.length + 1);
          if (pos < 1) {
            results[percentile] = values[0];
          } else if (pos >= values.length) {
            results[percentile] = values[values.length - 1];
          } else {
            const lower = values[Math.floor(pos) - 1];
            const upper = values[Math.ceil(pos) - 1];
            results[percentile] = lower + (pos - Math.floor(pos)) * (upper - lower);
          }
        }
        return results;
      }
      val() {
        if (typeof this._callFn === "function") {
          return this._callFn();
        } else {
          return this._callFn;
        }
      }
      getMin() {
        return this._min;
      }
      getMax() {
        return this._max;
      }
      getSum() {
        return this._sum;
      }
      getCount() {
        return this._count;
      }
      getEma() {
        return this._ema;
      }
      fullResults() {
        const percentiles = this.percentiles([0.5, 0.75, 0.95, 0.99, 0.999]);
        return {
          min: this._min,
          max: this._max,
          sum: this._sum,
          variance: this._calculateVariance(),
          mean: this._calculateMean(),
          count: this._count,
          median: percentiles[0.5],
          p75: percentiles[0.75],
          p95: percentiles[0.95],
          p99: percentiles[0.99],
          p999: percentiles[0.999],
          ema: this._ema
        };
      }
      _updateMin(value) {
        if (this._min === void 0 || value < this._min) {
          this._min = value;
        }
      }
      _updateMax(value) {
        if (this._max === void 0 || value > this._max) {
          this._max = value;
        }
      }
      _updateVariance(value) {
        if (this._count === 1)
          return this._varianceM = value;
        const oldM = this._varianceM;
        this._varianceM += (value - oldM) / this._count;
        this._varianceS += (value - oldM) * (value - this._varianceM);
      }
      _updateEma(value) {
        if (this._count <= 1)
          return this._ema = this._calculateMean();
        const alpha = 2 / (1 + this._count);
        this._ema = value * alpha + this._ema * (1 - alpha);
      }
      _calculateMean() {
        return this._count === 0 ? 0 : this._sum / this._count;
      }
      _calculateVariance() {
        return this._count <= 1 ? null : this._varianceS / (this._count - 1);
      }
      isUsed() {
        return this.used;
      }
    };
    exports2.default = Histogram;
  }
});

// node_modules/@pm2/io/build/main/utils/metrics/gauge.js
var require_gauge = __commonJS({
  "node_modules/@pm2/io/build/main/utils/metrics/gauge.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Gauge = class {
      constructor() {
        this.value = 0;
        this.used = false;
      }
      val() {
        return this.value;
      }
      set(value) {
        this.used = true;
        this.value = value;
      }
      isUsed() {
        return this.used;
      }
    };
    exports2.default = Gauge;
  }
});

// node_modules/@pm2/io/build/main/services/metrics.js
var require_metrics = __commonJS({
  "node_modules/@pm2/io/build/main/services/metrics.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MetricService = exports2.HistogramOptions = exports2.MetricBulk = exports2.Metric = exports2.MetricMeasurements = exports2.MetricType = void 0;
    var meter_1 = require_meter();
    var counter_1 = require_counter();
    var histogram_1 = require_histogram();
    var serviceManager_1 = require_serviceManager();
    var constants_1 = require_constants2();
    var Debug = require_src2();
    var gauge_1 = require_gauge();
    var MetricType;
    (function(MetricType2) {
      MetricType2["meter"] = "meter";
      MetricType2["histogram"] = "histogram";
      MetricType2["counter"] = "counter";
      MetricType2["gauge"] = "gauge";
      MetricType2["metric"] = "metric";
    })(MetricType || (exports2.MetricType = MetricType = {}));
    var MetricMeasurements;
    (function(MetricMeasurements2) {
      MetricMeasurements2["min"] = "min";
      MetricMeasurements2["max"] = "max";
      MetricMeasurements2["sum"] = "sum";
      MetricMeasurements2["count"] = "count";
      MetricMeasurements2["variance"] = "variance";
      MetricMeasurements2["mean"] = "mean";
      MetricMeasurements2["stddev"] = "stddev";
      MetricMeasurements2["median"] = "median";
      MetricMeasurements2["p75"] = "p75";
      MetricMeasurements2["p95"] = "p95";
      MetricMeasurements2["p99"] = "p99";
      MetricMeasurements2["p999"] = "p999";
    })(MetricMeasurements || (exports2.MetricMeasurements = MetricMeasurements = {}));
    var Metric = class {
    };
    exports2.Metric = Metric;
    var MetricBulk = class extends Metric {
    };
    exports2.MetricBulk = MetricBulk;
    var HistogramOptions = class extends Metric {
    };
    exports2.HistogramOptions = HistogramOptions;
    var MetricService = class {
      constructor() {
        this.metrics = /* @__PURE__ */ new Map();
        this.timer = null;
        this.transport = null;
        this.logger = Debug("axm:services:metrics");
      }
      init() {
        this.transport = serviceManager_1.ServiceManager.get("transport");
        if (this.transport === null)
          return this.logger("Failed to init metrics service cause no transporter");
        this.logger("init");
        this.timer = setInterval(() => {
          if (this.transport === null)
            return this.logger("Abort metrics update since transport is not available");
          this.logger("refreshing metrics value");
          for (let metric of this.metrics.values()) {
            metric.value = metric.handler();
          }
          this.logger("sending update metrics value to transporter");
          const metricsToSend = Array.from(this.metrics.values()).filter((metric) => {
            if (metric === null || metric === void 0)
              return false;
            if (metric.value === void 0 || metric.value === null)
              return false;
            const isNumber = typeof metric.value === "number";
            const isString = typeof metric.value === "string";
            const isBoolean = typeof metric.value === "boolean";
            const isValidNumber = !isNaN(metric.value);
            return isString || isBoolean || isNumber && isValidNumber;
          });
          this.transport.setMetrics(metricsToSend);
        }, constants_1.default.METRIC_INTERVAL);
        this.timer.unref();
      }
      registerMetric(metric) {
        if (typeof metric.name !== "string") {
          console.error(`Invalid metric name declared: ${metric.name}`);
          return console.trace();
        } else if (typeof metric.type !== "string") {
          console.error(`Invalid metric type declared: ${metric.type}`);
          return console.trace();
        } else if (typeof metric.handler !== "function") {
          console.error(`Invalid metric handler declared: ${metric.handler}`);
          return console.trace();
        }
        if (typeof metric.historic !== "boolean") {
          metric.historic = true;
        }
        this.logger(`Registering new metric: ${metric.name}`);
        this.metrics.set(metric.name, metric);
      }
      meter(opts) {
        const metric = {
          name: opts.name,
          type: MetricType.meter,
          id: opts.id,
          historic: opts.historic,
          implementation: new meter_1.default(opts),
          unit: opts.unit,
          handler: function() {
            return this.implementation.isUsed() ? this.implementation.val() : NaN;
          }
        };
        this.registerMetric(metric);
        return metric.implementation;
      }
      counter(opts) {
        const metric = {
          name: opts.name,
          type: MetricType.counter,
          id: opts.id,
          historic: opts.historic,
          implementation: new counter_1.default(opts),
          unit: opts.unit,
          handler: function() {
            return this.implementation.isUsed() ? this.implementation.val() : NaN;
          }
        };
        this.registerMetric(metric);
        return metric.implementation;
      }
      histogram(opts) {
        if (opts.measurement === void 0 || opts.measurement === null) {
          opts.measurement = MetricMeasurements.mean;
        }
        const metric = {
          name: opts.name,
          type: MetricType.histogram,
          id: opts.id,
          historic: opts.historic,
          implementation: new histogram_1.default(opts),
          unit: opts.unit,
          handler: function() {
            return this.implementation.isUsed() ? Math.round(this.implementation.val() * 100) / 100 : NaN;
          }
        };
        this.registerMetric(metric);
        return metric.implementation;
      }
      metric(opts) {
        let metric;
        if (typeof opts.value === "function") {
          metric = {
            name: opts.name,
            type: MetricType.gauge,
            id: opts.id,
            implementation: void 0,
            historic: opts.historic,
            unit: opts.unit,
            handler: opts.value
          };
        } else {
          metric = {
            name: opts.name,
            type: MetricType.gauge,
            id: opts.id,
            historic: opts.historic,
            implementation: new gauge_1.default(),
            unit: opts.unit,
            handler: function() {
              return this.implementation.isUsed() ? this.implementation.val() : NaN;
            }
          };
        }
        this.registerMetric(metric);
        return metric.implementation;
      }
      deleteMetric(name) {
        return this.metrics.delete(name);
      }
      destroy() {
        if (this.timer !== null) {
          clearInterval(this.timer);
        }
        this.metrics.clear();
      }
    };
    exports2.MetricService = MetricService;
  }
});

// node_modules/@pm2/io/build/main/metrics/eventLoopMetrics.js
var require_eventLoopMetrics = __commonJS({
  "node_modules/@pm2/io/build/main/metrics/eventLoopMetrics.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventLoopMetricOption = void 0;
    var metrics_1 = require_metrics();
    var serviceManager_1 = require_serviceManager();
    var Debug = require_src2();
    var histogram_1 = require_histogram();
    var EventLoopMetricOption = class {
    };
    exports2.EventLoopMetricOption = EventLoopMetricOption;
    var defaultOptions2 = {
      eventLoopActive: true,
      eventLoopDelay: true
    };
    var EventLoopHandlesRequestsMetric = class {
      constructor() {
        this.logger = Debug("axm:features:metrics:eventloop");
        this.delayLoopInterval = 1e3;
      }
      init(config) {
        if (config === false)
          return;
        if (config === void 0) {
          config = defaultOptions2;
        }
        if (config === true) {
          config = defaultOptions2;
        }
        this.metricService = serviceManager_1.ServiceManager.get("metrics");
        if (this.metricService === void 0)
          return this.logger("Failed to load metric service");
        this.logger("init");
        if (typeof process._getActiveRequests === "function" && config.eventLoopActive === true) {
          const requestMetric = this.metricService.metric({
            name: "Active requests",
            id: "internal/libuv/requests",
            historic: true
          });
          this.requestTimer = setInterval((_) => {
            requestMetric.set(process._getActiveRequests().length);
          }, 1e3);
          this.requestTimer.unref();
        }
        if (typeof process._getActiveHandles === "function" && config.eventLoopActive === true) {
          const handleMetric = this.metricService.metric({
            name: "Active handles",
            id: "internal/libuv/handles",
            historic: true
          });
          this.handleTimer = setInterval((_) => {
            handleMetric.set(process._getActiveHandles().length);
          }, 1e3);
          this.handleTimer.unref();
        }
        if (config.eventLoopDelay === false)
          return;
        const histogram = new histogram_1.default();
        const uvLatencyp50 = {
          name: "Event Loop Latency",
          id: "internal/libuv/latency/p50",
          type: metrics_1.MetricType.histogram,
          historic: true,
          implementation: histogram,
          handler: function() {
            const percentiles = this.implementation.percentiles([0.5]);
            if (percentiles[0.5] === null)
              return null;
            return percentiles[0.5].toFixed(2);
          },
          unit: "ms"
        };
        const uvLatencyp95 = {
          name: "Event Loop Latency p95",
          id: "internal/libuv/latency/p95",
          type: metrics_1.MetricType.histogram,
          historic: true,
          implementation: histogram,
          handler: function() {
            const percentiles = this.implementation.percentiles([0.95]);
            if (percentiles[0.95] === null)
              return null;
            return percentiles[0.95].toFixed(2);
          },
          unit: "ms"
        };
        this.metricService.registerMetric(uvLatencyp50);
        this.metricService.registerMetric(uvLatencyp95);
        this.runtimeStatsService = serviceManager_1.ServiceManager.get("runtimeStats");
        if (this.runtimeStatsService === void 0) {
          this.logger("runtimeStats module not found, fallbacking into pure js method");
          let oldTime = process.hrtime();
          this.delayTimer = setInterval(() => {
            const newTime = process.hrtime();
            const delay = (newTime[0] - oldTime[0]) * 1e3 + (newTime[1] - oldTime[1]) / 1e6 - this.delayLoopInterval;
            oldTime = newTime;
            histogram.update(delay);
          }, this.delayLoopInterval);
          this.delayTimer.unref();
        } else {
          this.logger("using runtimeStats module as data source for event loop latency");
          this.handle = (stats) => {
            if (typeof stats !== "object" || !Array.isArray(stats.ticks))
              return;
            stats.ticks.forEach((tick) => {
              histogram.update(tick);
            });
          };
          this.runtimeStatsService.on("data", this.handle);
        }
      }
      destroy() {
        if (this.requestTimer !== void 0) {
          clearInterval(this.requestTimer);
        }
        if (this.handleTimer !== void 0) {
          clearInterval(this.handleTimer);
        }
        if (this.delayTimer !== void 0) {
          clearInterval(this.delayTimer);
        }
        if (this.runtimeStatsService !== void 0) {
          this.runtimeStatsService.removeListener("data", this.handle);
        }
        this.logger("destroy");
      }
    };
    exports2.default = EventLoopHandlesRequestsMetric;
  }
});

// node_modules/shimmer/index.js
var require_shimmer = __commonJS({
  "node_modules/shimmer/index.js"(exports2, module2) {
    "use strict";
    function isFunction(funktion) {
      return typeof funktion === "function";
    }
    var logger2 = console.error.bind(console);
    function defineProperty(obj, name, value) {
      var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
      Object.defineProperty(obj, name, {
        configurable: true,
        enumerable,
        writable: true,
        value
      });
    }
    function shimmer(options) {
      if (options && options.logger) {
        if (!isFunction(options.logger)) logger2("new logger isn't a function, not replacing");
        else logger2 = options.logger;
      }
    }
    function wrap(nodule, name, wrapper) {
      if (!nodule || !nodule[name]) {
        logger2("no original function " + name + " to wrap");
        return;
      }
      if (!wrapper) {
        logger2("no wrapper function");
        logger2(new Error().stack);
        return;
      }
      if (!isFunction(nodule[name]) || !isFunction(wrapper)) {
        logger2("original object and wrapper must be functions");
        return;
      }
      var original = nodule[name];
      var wrapped = wrapper(original, name);
      defineProperty(wrapped, "__original", original);
      defineProperty(wrapped, "__unwrap", function() {
        if (nodule[name] === wrapped) defineProperty(nodule, name, original);
      });
      defineProperty(wrapped, "__wrapped", true);
      defineProperty(nodule, name, wrapped);
      return wrapped;
    }
    function massWrap(nodules, names, wrapper) {
      if (!nodules) {
        logger2("must provide one or more modules to patch");
        logger2(new Error().stack);
        return;
      } else if (!Array.isArray(nodules)) {
        nodules = [nodules];
      }
      if (!(names && Array.isArray(names))) {
        logger2("must provide one or more functions to wrap on modules");
        return;
      }
      nodules.forEach(function(nodule) {
        names.forEach(function(name) {
          wrap(nodule, name, wrapper);
        });
      });
    }
    function unwrap(nodule, name) {
      if (!nodule || !nodule[name]) {
        logger2("no function to unwrap.");
        logger2(new Error().stack);
        return;
      }
      if (!nodule[name].__unwrap) {
        logger2("no original to unwrap to -- has " + name + " already been unwrapped?");
      } else {
        return nodule[name].__unwrap();
      }
    }
    function massUnwrap(nodules, names) {
      if (!nodules) {
        logger2("must provide one or more modules to patch");
        logger2(new Error().stack);
        return;
      } else if (!Array.isArray(nodules)) {
        nodules = [nodules];
      }
      if (!(names && Array.isArray(names))) {
        logger2("must provide one or more functions to unwrap on modules");
        return;
      }
      nodules.forEach(function(nodule) {
        names.forEach(function(name) {
          unwrap(nodule, name);
        });
      });
    }
    shimmer.wrap = wrap;
    shimmer.massWrap = massWrap;
    shimmer.unwrap = unwrap;
    shimmer.massUnwrap = massUnwrap;
    module2.exports = shimmer;
  }
});

// node_modules/@pm2/io/build/main/metrics/network.js
var require_network = __commonJS({
  "node_modules/@pm2/io/build/main/metrics/network.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NetworkTrafficConfig = void 0;
    var netModule = require("net");
    var metrics_1 = require_metrics();
    var Debug = require_src2();
    var meter_1 = require_meter();
    var shimmer = require_shimmer();
    var serviceManager_1 = require_serviceManager();
    var NetworkTrafficConfig = class {
    };
    exports2.NetworkTrafficConfig = NetworkTrafficConfig;
    var defaultConfig = {
      upload: false,
      download: false
    };
    var allEnabled = {
      upload: true,
      download: true
    };
    var NetworkMetric = class {
      constructor() {
        this.logger = Debug("axm:features:metrics:network");
      }
      init(config) {
        if (config === false)
          return;
        if (config === true) {
          config = allEnabled;
        }
        if (config === void 0) {
          config = defaultConfig;
        }
        this.metricService = serviceManager_1.ServiceManager.get("metrics");
        if (this.metricService === void 0) {
          return this.logger(`Failed to load metric service`);
        }
        if (config.download === true) {
          this.catchDownload();
        }
        if (config.upload === true) {
          this.catchUpload();
        }
        this.logger("init");
      }
      destroy() {
        if (this.timer !== void 0) {
          clearTimeout(this.timer);
        }
        if (this.socketProto !== void 0 && this.socketProto !== null) {
          shimmer.unwrap(this.socketProto, "read");
          shimmer.unwrap(this.socketProto, "write");
        }
        this.logger("destroy");
      }
      catchDownload() {
        if (this.metricService === void 0)
          return this.logger(`Failed to load metric service`);
        const downloadMeter = new meter_1.default({});
        this.metricService.registerMetric({
          name: "Network In",
          id: "internal/network/in",
          historic: true,
          type: metrics_1.MetricType.meter,
          implementation: downloadMeter,
          unit: "kb/s",
          handler: function() {
            return Math.floor(this.implementation.val() / 1024 * 1e3) / 1e3;
          }
        });
        setTimeout(() => {
          const property = netModule.Socket.prototype.read;
          const isWrapped = property && property.__wrapped === true;
          if (isWrapped) {
            return this.logger(`Already patched socket read, canceling`);
          }
          shimmer.wrap(netModule.Socket.prototype, "read", function(original) {
            return function() {
              this.on("data", (data) => {
                if (typeof data.length === "number") {
                  downloadMeter.mark(data.length);
                }
              });
              return original.apply(this, arguments);
            };
          });
        }, 500);
      }
      catchUpload() {
        if (this.metricService === void 0)
          return this.logger(`Failed to load metric service`);
        const uploadMeter = new meter_1.default();
        this.metricService.registerMetric({
          name: "Network Out",
          id: "internal/network/out",
          type: metrics_1.MetricType.meter,
          historic: true,
          implementation: uploadMeter,
          unit: "kb/s",
          handler: function() {
            return Math.floor(this.implementation.val() / 1024 * 1e3) / 1e3;
          }
        });
        setTimeout(() => {
          const property = netModule.Socket.prototype.write;
          const isWrapped = property && property.__wrapped === true;
          if (isWrapped) {
            return this.logger(`Already patched socket write, canceling`);
          }
          shimmer.wrap(netModule.Socket.prototype, "write", function(original) {
            return function(data) {
              if (typeof data.length === "number") {
                uploadMeter.mark(data.length);
              }
              return original.apply(this, arguments);
            };
          });
        }, 500);
      }
    };
    exports2.default = NetworkMetric;
  }
});

// node_modules/resolve/lib/homedir.js
var require_homedir = __commonJS({
  "node_modules/resolve/lib/homedir.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    module2.exports = os.homedir || function homedir() {
      var home = process.env.HOME;
      var user = process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
      if (process.platform === "win32") {
        return process.env.USERPROFILE || process.env.HOMEDRIVE && process.env.HOMEPATH && process.env.HOMEDRIVE + process.env.HOMEPATH || home || null;
      }
      if (process.platform === "darwin") {
        return home || (user ? "/Users/" + user : null);
      }
      if (process.platform === "linux") {
        return home || (process.getuid() === 0 ? "/root" : user ? "/home/" + user : null);
      }
      return home || null;
    };
  }
});

// node_modules/es-errors/index.js
var require_es_errors = __commonJS({
  "node_modules/es-errors/index.js"(exports2, module2) {
    "use strict";
    module2.exports = Error;
  }
});

// node_modules/resolve/lib/caller.js
var require_caller = __commonJS({
  "node_modules/resolve/lib/caller.js"(exports2, module2) {
    "use strict";
    var $Error = require_es_errors();
    module2.exports = function() {
      var origPrepareStackTrace = $Error.prepareStackTrace;
      $Error.prepareStackTrace = function(_, stack2) {
        return stack2;
      };
      var stack = new $Error().stack;
      $Error.prepareStackTrace = origPrepareStackTrace;
      return stack[2].getFileName();
    };
  }
});

// node_modules/path-parse/index.js
var require_path_parse = __commonJS({
  "node_modules/path-parse/index.js"(exports2, module2) {
    "use strict";
    var isWindows = process.platform === "win32";
    var splitWindowsRe = /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;
    var win32 = {};
    function win32SplitPath(filename) {
      return splitWindowsRe.exec(filename).slice(1);
    }
    win32.parse = function(pathString) {
      if (typeof pathString !== "string") {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString
        );
      }
      var allParts = win32SplitPath(pathString);
      if (!allParts || allParts.length !== 5) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      return {
        root: allParts[1],
        dir: allParts[0] === allParts[1] ? allParts[0] : allParts[0].slice(0, -1),
        base: allParts[2],
        ext: allParts[4],
        name: allParts[3]
      };
    };
    var splitPathRe = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;
    var posix = {};
    function posixSplitPath(filename) {
      return splitPathRe.exec(filename).slice(1);
    }
    posix.parse = function(pathString) {
      if (typeof pathString !== "string") {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString
        );
      }
      var allParts = posixSplitPath(pathString);
      if (!allParts || allParts.length !== 5) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      return {
        root: allParts[1],
        dir: allParts[0].slice(0, -1),
        base: allParts[2],
        ext: allParts[4],
        name: allParts[3]
      };
    };
    if (isWindows)
      module2.exports = win32.parse;
    else
      module2.exports = posix.parse;
    module2.exports.posix = posix.parse;
    module2.exports.win32 = win32.parse;
  }
});

// node_modules/resolve/lib/node-modules-paths.js
var require_node_modules_paths = __commonJS({
  "node_modules/resolve/lib/node-modules-paths.js"(exports2, module2) {
    var path2 = require("path");
    var parse = path2.parse || require_path_parse();
    var driveLetterRegex = /^([A-Za-z]:)/;
    var uncPathRegex = /^\\\\/;
    function getNodeModulesDirs(absoluteStart, modules) {
      var prefix = "/";
      if (driveLetterRegex.test(absoluteStart)) {
        prefix = "";
      } else if (uncPathRegex.test(absoluteStart)) {
        prefix = "\\\\";
      }
      var paths = [absoluteStart];
      var parsed = parse(absoluteStart);
      while (parsed.dir !== paths[paths.length - 1]) {
        paths.push(parsed.dir);
        parsed = parse(parsed.dir);
      }
      return paths.reduce(function(dirs, aPath) {
        return dirs.concat(modules.map(function(moduleDir) {
          return path2.resolve(prefix, aPath, moduleDir);
        }));
      }, []);
    }
    module2.exports = function nodeModulesPaths(start, opts, request) {
      var modules = opts && opts.moduleDirectory ? [].concat(opts.moduleDirectory) : ["node_modules"];
      if (opts && typeof opts.paths === "function") {
        return opts.paths(
          request,
          start,
          function() {
            return getNodeModulesDirs(start, modules);
          },
          opts
        );
      }
      var dirs = getNodeModulesDirs(start, modules);
      return opts && opts.paths ? dirs.concat(opts.paths) : dirs;
    };
  }
});

// node_modules/resolve/lib/normalize-options.js
var require_normalize_options = __commonJS({
  "node_modules/resolve/lib/normalize-options.js"(exports2, module2) {
    module2.exports = function(x, opts) {
      return opts || {};
    };
  }
});

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "node_modules/function-bind/implementation.js"(exports2, module2) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    };
    module2.exports = function bind(that) {
      var target2 = this;
      if (typeof target2 !== "function" || toStr.apply(target2) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target2);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target2.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target2.apply(
          that,
          concatty(args, arguments)
        );
      };
      var boundLength = max(0, target2.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target2.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target2.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "node_modules/function-bind/index.js"(exports2, module2) {
    "use strict";
    var implementation = require_implementation();
    module2.exports = Function.prototype.bind || implementation;
  }
});

// node_modules/hasown/index.js
var require_hasown = __commonJS({
  "node_modules/hasown/index.js"(exports2, module2) {
    "use strict";
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module2.exports = bind.call(call, $hasOwn);
  }
});

// node_modules/is-core-module/core.json
var require_core = __commonJS({
  "node_modules/is-core-module/core.json"(exports2, module2) {
    module2.exports = {
      assert: true,
      "node:assert": [">= 14.18 && < 15", ">= 16"],
      "assert/strict": ">= 15",
      "node:assert/strict": ">= 16",
      async_hooks: ">= 8",
      "node:async_hooks": [">= 14.18 && < 15", ">= 16"],
      buffer_ieee754: ">= 0.5 && < 0.9.7",
      buffer: true,
      "node:buffer": [">= 14.18 && < 15", ">= 16"],
      child_process: true,
      "node:child_process": [">= 14.18 && < 15", ">= 16"],
      cluster: ">= 0.5",
      "node:cluster": [">= 14.18 && < 15", ">= 16"],
      console: true,
      "node:console": [">= 14.18 && < 15", ">= 16"],
      constants: true,
      "node:constants": [">= 14.18 && < 15", ">= 16"],
      crypto: true,
      "node:crypto": [">= 14.18 && < 15", ">= 16"],
      _debug_agent: ">= 1 && < 8",
      _debugger: "< 8",
      dgram: true,
      "node:dgram": [">= 14.18 && < 15", ">= 16"],
      diagnostics_channel: [">= 14.17 && < 15", ">= 15.1"],
      "node:diagnostics_channel": [">= 14.18 && < 15", ">= 16"],
      dns: true,
      "node:dns": [">= 14.18 && < 15", ">= 16"],
      "dns/promises": ">= 15",
      "node:dns/promises": ">= 16",
      domain: ">= 0.7.12",
      "node:domain": [">= 14.18 && < 15", ">= 16"],
      events: true,
      "node:events": [">= 14.18 && < 15", ">= 16"],
      freelist: "< 6",
      fs: true,
      "node:fs": [">= 14.18 && < 15", ">= 16"],
      "fs/promises": [">= 10 && < 10.1", ">= 14"],
      "node:fs/promises": [">= 14.18 && < 15", ">= 16"],
      _http_agent: ">= 0.11.1",
      "node:_http_agent": [">= 14.18 && < 15", ">= 16"],
      _http_client: ">= 0.11.1",
      "node:_http_client": [">= 14.18 && < 15", ">= 16"],
      _http_common: ">= 0.11.1",
      "node:_http_common": [">= 14.18 && < 15", ">= 16"],
      _http_incoming: ">= 0.11.1",
      "node:_http_incoming": [">= 14.18 && < 15", ">= 16"],
      _http_outgoing: ">= 0.11.1",
      "node:_http_outgoing": [">= 14.18 && < 15", ">= 16"],
      _http_server: ">= 0.11.1",
      "node:_http_server": [">= 14.18 && < 15", ">= 16"],
      http: true,
      "node:http": [">= 14.18 && < 15", ">= 16"],
      http2: ">= 8.8",
      "node:http2": [">= 14.18 && < 15", ">= 16"],
      https: true,
      "node:https": [">= 14.18 && < 15", ">= 16"],
      inspector: ">= 8",
      "node:inspector": [">= 14.18 && < 15", ">= 16"],
      "inspector/promises": [">= 19"],
      "node:inspector/promises": [">= 19"],
      _linklist: "< 8",
      module: true,
      "node:module": [">= 14.18 && < 15", ">= 16"],
      net: true,
      "node:net": [">= 14.18 && < 15", ">= 16"],
      "node-inspect/lib/_inspect": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_client": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_repl": ">= 7.6 && < 12",
      os: true,
      "node:os": [">= 14.18 && < 15", ">= 16"],
      path: true,
      "node:path": [">= 14.18 && < 15", ">= 16"],
      "path/posix": ">= 15.3",
      "node:path/posix": ">= 16",
      "path/win32": ">= 15.3",
      "node:path/win32": ">= 16",
      perf_hooks: ">= 8.5",
      "node:perf_hooks": [">= 14.18 && < 15", ">= 16"],
      process: ">= 1",
      "node:process": [">= 14.18 && < 15", ">= 16"],
      punycode: ">= 0.5",
      "node:punycode": [">= 14.18 && < 15", ">= 16"],
      querystring: true,
      "node:querystring": [">= 14.18 && < 15", ">= 16"],
      readline: true,
      "node:readline": [">= 14.18 && < 15", ">= 16"],
      "readline/promises": ">= 17",
      "node:readline/promises": ">= 17",
      repl: true,
      "node:repl": [">= 14.18 && < 15", ">= 16"],
      "node:sea": [">= 20.12 && < 21", ">= 21.7"],
      smalloc: ">= 0.11.5 && < 3",
      "node:sqlite": [">= 22.13 && < 23", ">= 23.4"],
      _stream_duplex: ">= 0.9.4 && < 26",
      "node:_stream_duplex": [">= 14.18 && < 15", ">= 16 && < 26"],
      _stream_transform: ">= 0.9.4 && < 26",
      "node:_stream_transform": [">= 14.18 && < 15", ">= 16 && < 26"],
      _stream_wrap: ">= 1.4.1 && < 26",
      "node:_stream_wrap": [">= 14.18 && < 15", ">= 16 && < 26"],
      _stream_passthrough: ">= 0.9.4 && < 26",
      "node:_stream_passthrough": [">= 14.18 && < 15", ">= 16 && < 26"],
      _stream_readable: ">= 0.9.4 && < 26",
      "node:_stream_readable": [">= 14.18 && < 15", ">= 16 && < 26"],
      _stream_writable: ">= 0.9.4 && < 26",
      "node:_stream_writable": [">= 14.18 && < 15", ">= 16 && < 26"],
      stream: true,
      "node:stream": [">= 14.18 && < 15", ">= 16"],
      "stream/consumers": ">= 16.7",
      "node:stream/consumers": ">= 16.7",
      "stream/promises": ">= 15",
      "node:stream/promises": ">= 16",
      "stream/web": ">= 16.5",
      "node:stream/web": ">= 16.5",
      string_decoder: true,
      "node:string_decoder": [">= 14.18 && < 15", ">= 16"],
      sys: [">= 0.4 && < 0.7", ">= 0.8"],
      "node:sys": [">= 14.18 && < 15", ">= 16"],
      "test/reporters": ">= 19.9 && < 20.2",
      "node:test/reporters": [">= 18.17 && < 19", ">= 19.9", ">= 20"],
      "test/mock_loader": ">= 22.3 && < 22.7",
      "node:test/mock_loader": ">= 22.3 && < 22.7",
      "node:test": [">= 16.17 && < 17", ">= 18"],
      timers: true,
      "node:timers": [">= 14.18 && < 15", ">= 16"],
      "timers/promises": ">= 15",
      "node:timers/promises": ">= 16",
      _tls_common: ">= 0.11.13",
      "node:_tls_common": [">= 14.18 && < 15", ">= 16"],
      _tls_legacy: ">= 0.11.3 && < 10",
      _tls_wrap: ">= 0.11.3",
      "node:_tls_wrap": [">= 14.18 && < 15", ">= 16"],
      tls: true,
      "node:tls": [">= 14.18 && < 15", ">= 16"],
      trace_events: ">= 10",
      "node:trace_events": [">= 14.18 && < 15", ">= 16"],
      tty: true,
      "node:tty": [">= 14.18 && < 15", ">= 16"],
      url: true,
      "node:url": [">= 14.18 && < 15", ">= 16"],
      util: true,
      "node:util": [">= 14.18 && < 15", ">= 16"],
      "util/types": ">= 15.3",
      "node:util/types": ">= 16",
      "v8/tools/arguments": ">= 10 && < 12",
      "v8/tools/codemap": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/consarray": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/csvparser": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/logreader": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/profile_view": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/splaytree": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      v8: ">= 1",
      "node:v8": [">= 14.18 && < 15", ">= 16"],
      vm: true,
      "node:vm": [">= 14.18 && < 15", ">= 16"],
      wasi: [">= 13.4 && < 13.5", ">= 18.17 && < 19", ">= 20"],
      "node:wasi": [">= 18.17 && < 19", ">= 20"],
      worker_threads: ">= 11.7",
      "node:worker_threads": [">= 14.18 && < 15", ">= 16"],
      zlib: ">= 0.5",
      "node:zlib": [">= 14.18 && < 15", ">= 16"]
    };
  }
});

// node_modules/is-core-module/index.js
var require_is_core_module = __commonJS({
  "node_modules/is-core-module/index.js"(exports2, module2) {
    "use strict";
    var hasOwn = require_hasown();
    function specifierIncluded(current, specifier) {
      var nodeParts = current.split(".");
      var parts = specifier.split(" ");
      var op = parts.length > 1 ? parts[0] : "=";
      var versionParts = (parts.length > 1 ? parts[1] : parts[0]).split(".");
      for (var i = 0; i < 3; ++i) {
        var cur = parseInt(nodeParts[i] || 0, 10);
        var ver = parseInt(versionParts[i] || 0, 10);
        if (cur === ver) {
          continue;
        }
        if (op === "<") {
          return cur < ver;
        }
        if (op === ">=") {
          return cur >= ver;
        }
        return false;
      }
      return op === ">=";
    }
    function matchesRange(current, range) {
      var specifiers = range.split(/ ?&& ?/);
      if (specifiers.length === 0) {
        return false;
      }
      for (var i = 0; i < specifiers.length; ++i) {
        if (!specifierIncluded(current, specifiers[i])) {
          return false;
        }
      }
      return true;
    }
    function versionIncluded(nodeVersion, specifierValue) {
      if (typeof specifierValue === "boolean") {
        return specifierValue;
      }
      var current = typeof nodeVersion === "undefined" ? process.versions && process.versions.node : nodeVersion;
      if (typeof current !== "string") {
        throw new TypeError(typeof nodeVersion === "undefined" ? "Unable to determine current node version" : "If provided, a valid node version is required");
      }
      if (specifierValue && typeof specifierValue === "object") {
        for (var i = 0; i < specifierValue.length; ++i) {
          if (matchesRange(current, specifierValue[i])) {
            return true;
          }
        }
        return false;
      }
      return matchesRange(current, specifierValue);
    }
    var data = require_core();
    module2.exports = function isCore(x, nodeVersion) {
      return hasOwn(data, x) && versionIncluded(nodeVersion, data[x]);
    };
  }
});

// node_modules/es-errors/type.js
var require_type = __commonJS({
  "node_modules/es-errors/type.js"(exports2, module2) {
    "use strict";
    module2.exports = TypeError;
  }
});

// node_modules/resolve/lib/async.js
var require_async = __commonJS({
  "node_modules/resolve/lib/async.js"(exports2, module2) {
    var fs2 = require("fs");
    var getHomedir = require_homedir();
    var path2 = require("path");
    var caller = require_caller();
    var nodeModulesPaths = require_node_modules_paths();
    var normalizeOptions = require_normalize_options();
    var isCore = require_is_core_module();
    var $Error = require_es_errors();
    var $TypeError = require_type();
    var realpathFS = process.platform !== "win32" && fs2.realpath && typeof fs2.realpath.native === "function" ? fs2.realpath.native : fs2.realpath;
    var relativePathRegex = /^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/;
    var windowsDriveRegex = /^\w:[/\\]*$/;
    var nodeModulesRegex = /[/\\]node_modules[/\\]*$/;
    var homedir = getHomedir();
    function defaultPaths() {
      if (!homedir) return [];
      return [
        path2.join(homedir, ".node_modules"),
        path2.join(homedir, ".node_libraries")
      ];
    }
    var defaultIsFile = function isFile(file, cb) {
      fs2.stat(file, function(err, stat) {
        if (!err) {
          return cb(null, stat.isFile() || stat.isFIFO());
        }
        if (err.code === "ENOENT" || err.code === "ENOTDIR") return cb(null, false);
        return cb(err);
      });
    };
    var defaultIsDir = function isDirectory(dir, cb) {
      fs2.stat(dir, function(err, stat) {
        if (!err) {
          return cb(null, stat.isDirectory());
        }
        if (err.code === "ENOENT" || err.code === "ENOTDIR") return cb(null, false);
        return cb(err);
      });
    };
    var defaultRealpath = function realpath(x, cb) {
      realpathFS(x, function(realpathErr, realPath) {
        if (realpathErr && realpathErr.code !== "ENOENT") cb(realpathErr);
        else cb(null, realpathErr ? x : realPath);
      });
    };
    function maybeRealpath(realpath, x, opts, cb) {
      if (opts && opts.preserveSymlinks === false) {
        realpath(x, cb);
      } else {
        cb(null, x);
      }
    }
    function defaultReadPackage(readFile, pkgfile, cb) {
      readFile(pkgfile, function(readFileErr, body) {
        if (readFileErr) cb(readFileErr);
        else {
          try {
            var pkg = JSON.parse(body);
            cb(null, pkg);
          } catch (jsonErr) {
            cb(null);
          }
        }
      });
    }
    function getPackageCandidates(x, start, opts) {
      var dirs = nodeModulesPaths(start, opts, x);
      for (var i = 0; i < dirs.length; i++) {
        dirs[i] = path2.join(dirs[i], x);
      }
      return dirs;
    }
    module2.exports = function resolve(x, options, callback) {
      var cb = callback;
      var opts = options;
      if (typeof options === "function") {
        cb = opts;
        opts = {};
      }
      if (typeof x !== "string") {
        var err = new $TypeError("Path must be a string.");
        return process.nextTick(function() {
          cb(err);
        });
      }
      opts = normalizeOptions(x, opts);
      var isFile = opts.isFile || defaultIsFile;
      var isDirectory = opts.isDirectory || defaultIsDir;
      var readFile = opts.readFile || fs2.readFile;
      var realpath = opts.realpath || defaultRealpath;
      var readPackage = opts.readPackage || defaultReadPackage;
      if (opts.readFile && opts.readPackage) {
        var conflictErr = new $TypeError("`readFile` and `readPackage` are mutually exclusive.");
        return process.nextTick(function() {
          cb(conflictErr);
        });
      }
      var packageIterator = opts.packageIterator;
      var extensions2 = opts.extensions || [".js"];
      var includeCoreModules = opts.includeCoreModules !== false;
      var basedir = opts.basedir || path2.dirname(caller());
      var parent = opts.filename || basedir;
      opts.paths = opts.paths || defaultPaths();
      var absoluteStart = path2.resolve(basedir);
      maybeRealpath(
        realpath,
        absoluteStart,
        opts,
        function(err2, realStart) {
          if (err2) cb(err2);
          else init(realStart);
        }
      );
      var res;
      function init(basedir2) {
        if (relativePathRegex.test(x)) {
          res = path2.resolve(basedir2, x);
          if (x === "." || x === ".." || x.slice(-1) === "/") res += "/";
          if (x.slice(-1) === "/" && res === basedir2) {
            loadAsDirectory(res, opts.package, onfile);
          } else loadAsFile(res, opts.package, onfile);
        } else if (includeCoreModules && isCore(x)) {
          return cb(null, x);
        } else loadNodeModules(x, basedir2, function(err2, n, pkg) {
          if (err2) cb(err2);
          else if (n) {
            return maybeRealpath(realpath, n, opts, function(err3, realN) {
              if (err3) {
                cb(err3);
              } else {
                cb(null, realN, pkg);
              }
            });
          } else {
            var moduleError = new $Error("Cannot find module '" + x + "' from '" + parent + "'");
            moduleError.code = "MODULE_NOT_FOUND";
            cb(moduleError);
          }
        });
      }
      function onfile(err2, m, pkg) {
        if (err2) cb(err2);
        else if (m) cb(null, m, pkg);
        else loadAsDirectory(res, function(err3, d, pkg2) {
          if (err3) cb(err3);
          else if (d) {
            maybeRealpath(realpath, d, opts, function(err4, realD) {
              if (err4) {
                cb(err4);
              } else {
                cb(null, realD, pkg2);
              }
            });
          } else {
            var moduleError = new $Error("Cannot find module '" + x + "' from '" + parent + "'");
            moduleError.code = "MODULE_NOT_FOUND";
            cb(moduleError);
          }
        });
      }
      function loadAsFile(x2, thePackage, callback2) {
        var loadAsFilePackage = thePackage;
        var cb2 = callback2;
        if (typeof loadAsFilePackage === "function") {
          cb2 = loadAsFilePackage;
          loadAsFilePackage = void 0;
        }
        var exts = [""].concat(extensions2);
        load(exts, x2, loadAsFilePackage);
        function load(exts2, x3, loadPackage) {
          if (exts2.length === 0) return cb2(null, void 0, loadPackage);
          var file = x3 + exts2[0];
          var pkg = loadPackage;
          if (pkg) onpkg(null, pkg);
          else loadpkg(path2.dirname(file), onpkg);
          function onpkg(err2, pkg_, dir) {
            pkg = pkg_;
            if (err2) return cb2(err2);
            if (dir && pkg && opts.pathFilter) {
              var rfile = path2.relative(dir, file);
              var rel = rfile.slice(0, rfile.length - exts2[0].length);
              var r = opts.pathFilter(pkg, x3, rel);
              if (r) return load(
                [""].concat(extensions2),
                path2.resolve(dir, r),
                pkg
              );
            }
            isFile(file, onex);
          }
          function onex(err2, ex) {
            if (err2) return cb2(err2);
            if (ex) return cb2(null, file, pkg);
            load(exts2.slice(1), x3, pkg);
          }
        }
      }
      function loadpkg(dir, cb2) {
        if (dir === "" || dir === "/") return cb2(null);
        if (process.platform === "win32" && windowsDriveRegex.test(dir)) {
          return cb2(null);
        }
        if (nodeModulesRegex.test(dir)) return cb2(null);
        maybeRealpath(realpath, dir, opts, function(unwrapErr, pkgdir) {
          if (unwrapErr) return loadpkg(path2.dirname(dir), cb2);
          var pkgfile = path2.join(pkgdir, "package.json");
          isFile(pkgfile, function(err2, ex) {
            if (!ex) return loadpkg(path2.dirname(dir), cb2);
            readPackage(readFile, pkgfile, function(err3, pkgParam) {
              if (err3) {
                return cb2(err3);
              }
              var pkg = pkgParam;
              if (pkg && opts.packageFilter) {
                pkg = opts.packageFilter(pkg, pkgfile);
              }
              cb2(null, pkg, dir);
            });
          });
        });
      }
      function loadAsDirectory(x2, loadAsDirectoryPackage, callback2) {
        var cb2 = callback2;
        var fpkg = loadAsDirectoryPackage;
        if (typeof fpkg === "function") {
          cb2 = fpkg;
          fpkg = opts.package;
        }
        maybeRealpath(realpath, x2, opts, function(unwrapErr, pkgdir) {
          if (unwrapErr) return cb2(unwrapErr);
          var pkgfile = path2.join(pkgdir, "package.json");
          isFile(pkgfile, function(err2, ex) {
            if (err2) return cb2(err2);
            if (!ex) return loadAsFile(path2.join(x2, "index"), fpkg, cb2);
            readPackage(readFile, pkgfile, function(err3, pkgParam) {
              if (err3) return cb2(err3);
              var pkg = pkgParam;
              if (pkg && opts.packageFilter) {
                pkg = opts.packageFilter(pkg, pkgfile);
              }
              if (pkg && pkg.main) {
                if (typeof pkg.main !== "string") {
                  var mainError = new $TypeError("package \u201C" + pkg.name + "\u201D `main` must be a string");
                  mainError.code = "INVALID_PACKAGE_MAIN";
                  return cb2(mainError);
                }
                if (pkg.main === "." || pkg.main === "./") {
                  pkg.main = "index";
                }
                loadAsFile(path2.resolve(x2, pkg.main), pkg, function(err4, m, pkg2) {
                  if (err4) return cb2(err4);
                  if (m) return cb2(null, m, pkg2);
                  if (!pkg2) return loadAsFile(path2.join(x2, "index"), pkg2, cb2);
                  var dir = path2.resolve(x2, pkg2.main);
                  loadAsDirectory(dir, pkg2, function(err5, n, pkg3) {
                    if (err5) return cb2(err5);
                    if (n) return cb2(null, n, pkg3);
                    loadAsFile(path2.join(x2, "index"), pkg3, cb2);
                  });
                });
                return;
              }
              loadAsFile(path2.join(x2, "/index"), pkg, cb2);
            });
          });
        });
      }
      function processDirs(cb2, dirs) {
        if (dirs.length === 0) return cb2(null, void 0);
        var dir = dirs[0];
        isDirectory(path2.dirname(dir), isdir);
        function isdir(err2, isdir2) {
          if (err2) return cb2(err2);
          if (!isdir2) return processDirs(cb2, dirs.slice(1));
          loadAsFile(dir, opts.package, onfile2);
        }
        function onfile2(err2, m, pkg) {
          if (err2) return cb2(err2);
          if (m) return cb2(null, m, pkg);
          loadAsDirectory(dir, opts.package, ondir);
        }
        function ondir(err2, n, pkg) {
          if (err2) return cb2(err2);
          if (n) return cb2(null, n, pkg);
          processDirs(cb2, dirs.slice(1));
        }
      }
      function loadNodeModules(x2, start, cb2) {
        var thunk = function() {
          return getPackageCandidates(x2, start, opts);
        };
        processDirs(
          cb2,
          packageIterator ? packageIterator(x2, start, thunk, opts) : thunk()
        );
      }
    };
  }
});

// node_modules/resolve/lib/core.json
var require_core2 = __commonJS({
  "node_modules/resolve/lib/core.json"(exports2, module2) {
    module2.exports = {
      assert: true,
      "node:assert": [">= 14.18 && < 15", ">= 16"],
      "assert/strict": ">= 15",
      "node:assert/strict": ">= 16",
      async_hooks: ">= 8",
      "node:async_hooks": [">= 14.18 && < 15", ">= 16"],
      buffer_ieee754: ">= 0.5 && < 0.9.7",
      buffer: true,
      "node:buffer": [">= 14.18 && < 15", ">= 16"],
      child_process: true,
      "node:child_process": [">= 14.18 && < 15", ">= 16"],
      cluster: ">= 0.5",
      "node:cluster": [">= 14.18 && < 15", ">= 16"],
      console: true,
      "node:console": [">= 14.18 && < 15", ">= 16"],
      constants: true,
      "node:constants": [">= 14.18 && < 15", ">= 16"],
      crypto: true,
      "node:crypto": [">= 14.18 && < 15", ">= 16"],
      _debug_agent: ">= 1 && < 8",
      _debugger: "< 8",
      dgram: true,
      "node:dgram": [">= 14.18 && < 15", ">= 16"],
      diagnostics_channel: [">= 14.17 && < 15", ">= 15.1"],
      "node:diagnostics_channel": [">= 14.18 && < 15", ">= 16"],
      dns: true,
      "node:dns": [">= 14.18 && < 15", ">= 16"],
      "dns/promises": ">= 15",
      "node:dns/promises": ">= 16",
      domain: ">= 0.7.12",
      "node:domain": [">= 14.18 && < 15", ">= 16"],
      events: true,
      "node:events": [">= 14.18 && < 15", ">= 16"],
      freelist: "< 6",
      fs: true,
      "node:fs": [">= 14.18 && < 15", ">= 16"],
      "fs/promises": [">= 10 && < 10.1", ">= 14"],
      "node:fs/promises": [">= 14.18 && < 15", ">= 16"],
      _http_agent: ">= 0.11.1",
      "node:_http_agent": [">= 14.18 && < 15", ">= 16"],
      _http_client: ">= 0.11.1",
      "node:_http_client": [">= 14.18 && < 15", ">= 16"],
      _http_common: ">= 0.11.1",
      "node:_http_common": [">= 14.18 && < 15", ">= 16"],
      _http_incoming: ">= 0.11.1",
      "node:_http_incoming": [">= 14.18 && < 15", ">= 16"],
      _http_outgoing: ">= 0.11.1",
      "node:_http_outgoing": [">= 14.18 && < 15", ">= 16"],
      _http_server: ">= 0.11.1",
      "node:_http_server": [">= 14.18 && < 15", ">= 16"],
      http: true,
      "node:http": [">= 14.18 && < 15", ">= 16"],
      http2: ">= 8.8",
      "node:http2": [">= 14.18 && < 15", ">= 16"],
      https: true,
      "node:https": [">= 14.18 && < 15", ">= 16"],
      inspector: ">= 8",
      "node:inspector": [">= 14.18 && < 15", ">= 16"],
      "inspector/promises": [">= 19"],
      "node:inspector/promises": [">= 19"],
      _linklist: "< 8",
      module: true,
      "node:module": [">= 14.18 && < 15", ">= 16"],
      net: true,
      "node:net": [">= 14.18 && < 15", ">= 16"],
      "node-inspect/lib/_inspect": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_client": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_repl": ">= 7.6 && < 12",
      os: true,
      "node:os": [">= 14.18 && < 15", ">= 16"],
      path: true,
      "node:path": [">= 14.18 && < 15", ">= 16"],
      "path/posix": ">= 15.3",
      "node:path/posix": ">= 16",
      "path/win32": ">= 15.3",
      "node:path/win32": ">= 16",
      perf_hooks: ">= 8.5",
      "node:perf_hooks": [">= 14.18 && < 15", ">= 16"],
      process: ">= 1",
      "node:process": [">= 14.18 && < 15", ">= 16"],
      punycode: ">= 0.5",
      "node:punycode": [">= 14.18 && < 15", ">= 16"],
      querystring: true,
      "node:querystring": [">= 14.18 && < 15", ">= 16"],
      readline: true,
      "node:readline": [">= 14.18 && < 15", ">= 16"],
      "readline/promises": ">= 17",
      "node:readline/promises": ">= 17",
      repl: true,
      "node:repl": [">= 14.18 && < 15", ">= 16"],
      "node:sea": [">= 20.12 && < 21", ">= 21.7"],
      smalloc: ">= 0.11.5 && < 3",
      "node:sqlite": [">= 22.13 && < 23", ">= 23.4"],
      _stream_duplex: ">= 0.9.4",
      "node:_stream_duplex": [">= 14.18 && < 15", ">= 16"],
      _stream_transform: ">= 0.9.4",
      "node:_stream_transform": [">= 14.18 && < 15", ">= 16"],
      _stream_wrap: ">= 1.4.1",
      "node:_stream_wrap": [">= 14.18 && < 15", ">= 16"],
      _stream_passthrough: ">= 0.9.4",
      "node:_stream_passthrough": [">= 14.18 && < 15", ">= 16"],
      _stream_readable: ">= 0.9.4",
      "node:_stream_readable": [">= 14.18 && < 15", ">= 16"],
      _stream_writable: ">= 0.9.4",
      "node:_stream_writable": [">= 14.18 && < 15", ">= 16"],
      stream: true,
      "node:stream": [">= 14.18 && < 15", ">= 16"],
      "stream/consumers": ">= 16.7",
      "node:stream/consumers": ">= 16.7",
      "stream/promises": ">= 15",
      "node:stream/promises": ">= 16",
      "stream/web": ">= 16.5",
      "node:stream/web": ">= 16.5",
      string_decoder: true,
      "node:string_decoder": [">= 14.18 && < 15", ">= 16"],
      sys: [">= 0.4 && < 0.7", ">= 0.8"],
      "node:sys": [">= 14.18 && < 15", ">= 16"],
      "test/reporters": ">= 19.9 && < 20.2",
      "node:test/reporters": [">= 18.17 && < 19", ">= 19.9", ">= 20"],
      "test/mock_loader": ">= 22.3 && < 22.7",
      "node:test/mock_loader": ">= 22.3 && < 22.7",
      "node:test": [">= 16.17 && < 17", ">= 18"],
      timers: true,
      "node:timers": [">= 14.18 && < 15", ">= 16"],
      "timers/promises": ">= 15",
      "node:timers/promises": ">= 16",
      _tls_common: ">= 0.11.13",
      "node:_tls_common": [">= 14.18 && < 15", ">= 16"],
      _tls_legacy: ">= 0.11.3 && < 10",
      _tls_wrap: ">= 0.11.3",
      "node:_tls_wrap": [">= 14.18 && < 15", ">= 16"],
      tls: true,
      "node:tls": [">= 14.18 && < 15", ">= 16"],
      trace_events: ">= 10",
      "node:trace_events": [">= 14.18 && < 15", ">= 16"],
      tty: true,
      "node:tty": [">= 14.18 && < 15", ">= 16"],
      url: true,
      "node:url": [">= 14.18 && < 15", ">= 16"],
      util: true,
      "node:util": [">= 14.18 && < 15", ">= 16"],
      "util/types": ">= 15.3",
      "node:util/types": ">= 16",
      "v8/tools/arguments": ">= 10 && < 12",
      "v8/tools/codemap": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/consarray": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/csvparser": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/logreader": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/profile_view": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/splaytree": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      v8: ">= 1",
      "node:v8": [">= 14.18 && < 15", ">= 16"],
      vm: true,
      "node:vm": [">= 14.18 && < 15", ">= 16"],
      wasi: [">= 13.4 && < 13.5", ">= 18.17 && < 19", ">= 20"],
      "node:wasi": [">= 18.17 && < 19", ">= 20"],
      worker_threads: ">= 11.7",
      "node:worker_threads": [">= 14.18 && < 15", ">= 16"],
      zlib: ">= 0.5",
      "node:zlib": [">= 14.18 && < 15", ">= 16"]
    };
  }
});

// node_modules/resolve/lib/core.js
var require_core3 = __commonJS({
  "node_modules/resolve/lib/core.js"(exports2, module2) {
    "use strict";
    var isCoreModule = require_is_core_module();
    var data = require_core2();
    var core = {};
    for (mod in data) {
      if (Object.prototype.hasOwnProperty.call(data, mod)) {
        core[mod] = isCoreModule(mod);
      }
    }
    var mod;
    module2.exports = core;
  }
});

// node_modules/resolve/lib/is-core.js
var require_is_core = __commonJS({
  "node_modules/resolve/lib/is-core.js"(exports2, module2) {
    var isCoreModule = require_is_core_module();
    module2.exports = function isCore(x) {
      return isCoreModule(x);
    };
  }
});

// node_modules/resolve/lib/sync.js
var require_sync = __commonJS({
  "node_modules/resolve/lib/sync.js"(exports2, module2) {
    var isCore = require_is_core_module();
    var fs2 = require("fs");
    var path2 = require("path");
    var $Error = require_es_errors();
    var $TypeError = require_type();
    var getHomedir = require_homedir();
    var caller = require_caller();
    var nodeModulesPaths = require_node_modules_paths();
    var normalizeOptions = require_normalize_options();
    var realpathFS = process.platform !== "win32" && fs2.realpathSync && typeof fs2.realpathSync.native === "function" ? fs2.realpathSync.native : fs2.realpathSync;
    var relativePathRegex = /^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/;
    var windowsDriveRegex = /^\w:[/\\]*$/;
    var nodeModulesRegex = /[/\\]node_modules[/\\]*$/;
    var homedir = getHomedir();
    function defaultPaths() {
      if (!homedir) return [];
      return [
        path2.join(homedir, ".node_modules"),
        path2.join(homedir, ".node_libraries")
      ];
    }
    var defaultIsFile = function isFile(file) {
      try {
        var stat = fs2.statSync(file, { throwIfNoEntry: false });
      } catch (e) {
        if (e && (e.code === "ENOENT" || e.code === "ENOTDIR")) return false;
        throw e;
      }
      return !!stat && (stat.isFile() || stat.isFIFO());
    };
    var defaultIsDir = function isDirectory(dir) {
      try {
        var stat = fs2.statSync(dir, { throwIfNoEntry: false });
      } catch (e) {
        if (e && (e.code === "ENOENT" || e.code === "ENOTDIR")) return false;
        throw e;
      }
      return !!stat && stat.isDirectory();
    };
    var defaultRealpathSync = function realpathSync(x) {
      try {
        return realpathFS(x);
      } catch (realpathErr) {
        if (realpathErr.code !== "ENOENT") {
          throw realpathErr;
        }
      }
      return x;
    };
    function maybeRealpathSync(realpathSync, x, opts) {
      if (opts && opts.preserveSymlinks === false) {
        return realpathSync(x);
      }
      return x;
    }
    function defaultReadPackageSync(readFileSync, pkgfile) {
      var body = readFileSync(pkgfile);
      try {
        var pkg = JSON.parse(body);
        return pkg;
      } catch (jsonErr) {
      }
    }
    function getPackageCandidates(x, start, opts) {
      var dirs = nodeModulesPaths(start, opts, x);
      for (var i = 0; i < dirs.length; i++) {
        dirs[i] = path2.join(dirs[i], x);
      }
      return dirs;
    }
    module2.exports = function resolveSync(x, options) {
      if (typeof x !== "string") {
        throw new $TypeError("Path must be a string.");
      }
      var opts = normalizeOptions(x, options);
      var isFile = opts.isFile || defaultIsFile;
      var readFileSync = opts.readFileSync || fs2.readFileSync;
      var isDirectory = opts.isDirectory || defaultIsDir;
      var realpathSync = opts.realpathSync || defaultRealpathSync;
      var readPackageSync = opts.readPackageSync || defaultReadPackageSync;
      if (opts.readFileSync && opts.readPackageSync) {
        throw new $TypeError("`readFileSync` and `readPackageSync` are mutually exclusive.");
      }
      var packageIterator = opts.packageIterator;
      var extensions2 = opts.extensions || [".js"];
      var includeCoreModules = opts.includeCoreModules !== false;
      var basedir = opts.basedir || path2.dirname(caller());
      var parent = opts.filename || basedir;
      opts.paths = opts.paths || defaultPaths();
      var absoluteStart = maybeRealpathSync(realpathSync, path2.resolve(basedir), opts);
      if (relativePathRegex.test(x)) {
        var res = path2.resolve(absoluteStart, x);
        if (x === "." || x === ".." || x.slice(-1) === "/") res += "/";
        var m = loadAsFileSync(res) || loadAsDirectorySync(res);
        if (m) return maybeRealpathSync(realpathSync, m, opts);
      } else if (includeCoreModules && isCore(x)) {
        return x;
      } else {
        var n = loadNodeModulesSync(x, absoluteStart);
        if (n) return maybeRealpathSync(realpathSync, n, opts);
      }
      var err = new $Error("Cannot find module '" + x + "' from '" + parent + "'");
      err.code = "MODULE_NOT_FOUND";
      throw err;
      function loadAsFileSync(x2) {
        var pkg = loadpkg(path2.dirname(x2));
        if (pkg && pkg.dir && pkg.pkg && opts.pathFilter) {
          var rfile = path2.relative(pkg.dir, x2);
          var r = opts.pathFilter(pkg.pkg, x2, rfile);
          if (r) {
            x2 = path2.resolve(pkg.dir, r);
          }
        }
        if (isFile(x2)) {
          return x2;
        }
        for (var i = 0; i < extensions2.length; i++) {
          var file = x2 + extensions2[i];
          if (isFile(file)) {
            return file;
          }
        }
      }
      function loadpkg(dir) {
        if (dir === "" || dir === "/") return;
        if (process.platform === "win32" && windowsDriveRegex.test(dir)) {
          return;
        }
        if (nodeModulesRegex.test(dir)) return;
        var pkgfile = path2.join(maybeRealpathSync(realpathSync, dir, opts), "package.json");
        if (!isFile(pkgfile)) {
          return loadpkg(path2.dirname(dir));
        }
        var pkg = readPackageSync(readFileSync, pkgfile);
        if (pkg && opts.packageFilter) {
          pkg = opts.packageFilter(
            pkg,
            /*pkgfile,*/
            dir
          );
        }
        return { pkg, dir };
      }
      function loadAsDirectorySync(x2) {
        var pkgfile = path2.join(maybeRealpathSync(realpathSync, x2, opts), "/package.json");
        if (isFile(pkgfile)) {
          try {
            var pkg = readPackageSync(readFileSync, pkgfile);
          } catch (e) {
          }
          if (pkg && opts.packageFilter) {
            pkg = opts.packageFilter(
              pkg,
              /*pkgfile,*/
              x2
            );
          }
          if (pkg && pkg.main) {
            if (typeof pkg.main !== "string") {
              var mainError = new $TypeError("package \u201C" + pkg.name + "\u201D `main` must be a string");
              mainError.code = "INVALID_PACKAGE_MAIN";
              throw mainError;
            }
            if (pkg.main === "." || pkg.main === "./") {
              pkg.main = "index";
            }
            try {
              var m2 = loadAsFileSync(path2.resolve(x2, pkg.main));
              if (m2) return m2;
              var n2 = loadAsDirectorySync(path2.resolve(x2, pkg.main));
              if (n2) return n2;
            } catch (e) {
            }
          }
        }
        return loadAsFileSync(path2.join(x2, "/index"));
      }
      function loadNodeModulesSync(x2, start) {
        var thunk = function() {
          return getPackageCandidates(x2, start, opts);
        };
        var dirs = packageIterator ? packageIterator(x2, start, thunk, opts) : thunk();
        for (var i = 0; i < dirs.length; i++) {
          var dir = dirs[i];
          if (isDirectory(path2.dirname(dir))) {
            var m2 = loadAsFileSync(dir);
            if (m2) return m2;
            var n2 = loadAsDirectorySync(dir);
            if (n2) return n2;
          }
        }
      }
    };
  }
});

// node_modules/resolve/index.js
var require_resolve = __commonJS({
  "node_modules/resolve/index.js"(exports2, module2) {
    var async = require_async();
    async.core = require_core3();
    async.isCore = require_is_core();
    async.sync = require_sync();
    module2.exports = async;
  }
});

// node_modules/module-details-from-path/index.js
var require_module_details_from_path = __commonJS({
  "node_modules/module-details-from-path/index.js"(exports2, module2) {
    "use strict";
    var sep = require("path").sep;
    module2.exports = function(file) {
      var segments = file.split(sep);
      var index = segments.lastIndexOf("node_modules");
      if (index === -1) return;
      if (!segments[index + 1]) return;
      var scoped = segments[index + 1][0] === "@";
      var name = scoped ? segments[index + 1] + "/" + segments[index + 2] : segments[index + 1];
      var offset = scoped ? 3 : 2;
      var basedir = "";
      var lastBaseDirSegmentIndex = index + offset - 1;
      for (var i = 0; i <= lastBaseDirSegmentIndex; i++) {
        if (i === lastBaseDirSegmentIndex) {
          basedir += segments[i];
        } else {
          basedir += segments[i] + sep;
        }
      }
      var path2 = "";
      var lastSegmentIndex = segments.length - 1;
      for (var i2 = index + offset; i2 <= lastSegmentIndex; i2++) {
        if (i2 === lastSegmentIndex) {
          path2 += segments[i2];
        } else {
          path2 += segments[i2] + sep;
        }
      }
      return {
        name,
        basedir,
        path: path2
      };
    };
  }
});

// node_modules/require-in-the-middle/package.json
var require_package = __commonJS({
  "node_modules/require-in-the-middle/package.json"(exports2, module2) {
    module2.exports = {
      name: "require-in-the-middle",
      version: "5.2.0",
      description: "Module to hook into the Node.js require function",
      main: "index.js",
      dependencies: {
        debug: "^4.1.1",
        "module-details-from-path": "^1.0.3",
        resolve: "^1.22.1"
      },
      devDependencies: {
        "@babel/core": "^7.9.0",
        "@babel/preset-env": "^7.9.5",
        "@babel/preset-typescript": "^7.9.0",
        "@babel/register": "^7.9.0",
        "ipp-printer": "^1.0.0",
        patterns: "^1.0.3",
        roundround: "^0.2.0",
        semver: "^6.3.0",
        standard: "^14.3.1",
        tape: "^4.11.0"
      },
      scripts: {
        test: "npm run test:lint && npm run test:tape && npm run test:babel",
        "test:lint": "standard",
        "test:tape": "tape test/*.js",
        "test:babel": "node test/babel/babel-register.js"
      },
      repository: {
        type: "git",
        url: "git+https://github.com/elastic/require-in-the-middle.git"
      },
      keywords: [
        "require",
        "hook",
        "shim",
        "shimmer",
        "shimming",
        "patch",
        "monkey",
        "monkeypatch",
        "module",
        "load"
      ],
      files: [],
      author: "Thomas Watson Steen <w@tson.dk> (https://twitter.com/wa7son)",
      license: "MIT",
      bugs: {
        url: "https://github.com/elastic/require-in-the-middle/issues"
      },
      homepage: "https://github.com/elastic/require-in-the-middle#readme",
      engines: {
        node: ">=6"
      }
    };
  }
});

// node_modules/require-in-the-middle/index.js
var require_require_in_the_middle = __commonJS({
  "node_modules/require-in-the-middle/index.js"(exports2, module2) {
    "use strict";
    var path2 = require("path");
    var Module = require("module");
    var resolve = require_resolve();
    var debug3 = require_src()("require-in-the-middle");
    var parse = require_module_details_from_path();
    module2.exports = Hook;
    var isCore;
    if (Module.isBuiltin) {
      isCore = Module.isBuiltin;
    } else {
      isCore = (moduleName) => {
        return !!resolve.core[moduleName];
      };
    }
    var normalize2 = /([/\\]index)?(\.js)?$/;
    function Hook(modules, options, onrequire) {
      if (this instanceof Hook === false) return new Hook(modules, options, onrequire);
      if (typeof modules === "function") {
        onrequire = modules;
        modules = null;
        options = null;
      } else if (typeof options === "function") {
        onrequire = options;
        options = null;
      }
      if (typeof Module._resolveFilename !== "function") {
        console.error("Error: Expected Module._resolveFilename to be a function (was: %s) - aborting!", typeof Module._resolveFilename);
        console.error("Please report this error as an issue related to Node.js %s at %s", process.version, require_package().bugs.url);
        return;
      }
      this.cache = /* @__PURE__ */ new Map();
      this._unhooked = false;
      this._origRequire = Module.prototype.require;
      const self = this;
      const patching = /* @__PURE__ */ new Set();
      const internals = options ? options.internals === true : false;
      const hasWhitelist = Array.isArray(modules);
      debug3("registering require hook");
      this._require = Module.prototype.require = function(id) {
        if (self._unhooked === true) {
          debug3("ignoring require call - module is soft-unhooked");
          return self._origRequire.apply(this, arguments);
        }
        const core = isCore(id);
        let filename;
        if (core) {
          filename = id;
          if (id.startsWith("node:")) {
            const idWithoutPrefix = id.slice(5);
            if (isCore(idWithoutPrefix)) {
              filename = idWithoutPrefix;
            }
          }
        } else {
          filename = Module._resolveFilename(id, this);
        }
        let moduleName, basedir;
        debug3("processing %s module require('%s'): %s", core === true ? "core" : "non-core", id, filename);
        if (self.cache.has(filename) === true) {
          debug3("returning already patched cached module: %s", filename);
          return self.cache.get(filename);
        }
        const isPatching = patching.has(filename);
        if (isPatching === false) {
          patching.add(filename);
        }
        const exports3 = self._origRequire.apply(this, arguments);
        if (isPatching === true) {
          debug3("module is in the process of being patched already - ignoring: %s", filename);
          return exports3;
        }
        patching.delete(filename);
        if (core === true) {
          if (hasWhitelist === true && modules.includes(filename) === false) {
            debug3("ignoring core module not on whitelist: %s", filename);
            return exports3;
          }
          moduleName = filename;
        } else if (hasWhitelist === true && modules.includes(filename)) {
          const parsedPath = path2.parse(filename);
          moduleName = parsedPath.name;
          basedir = parsedPath.dir;
        } else {
          const stat = parse(filename);
          if (stat === void 0) {
            debug3("could not parse filename: %s", filename);
            return exports3;
          }
          moduleName = stat.name;
          basedir = stat.basedir;
          const fullModuleName = resolveModuleName(stat);
          debug3("resolved filename to module: %s (id: %s, resolved: %s, basedir: %s)", moduleName, id, fullModuleName, basedir);
          if (hasWhitelist === true && modules.includes(moduleName) === false) {
            if (modules.includes(fullModuleName) === false) return exports3;
            moduleName = fullModuleName;
          } else {
            let res;
            try {
              res = resolve.sync(moduleName, { basedir });
            } catch (e) {
              debug3("could not resolve module: %s", moduleName);
              return exports3;
            }
            if (res !== filename) {
              if (internals === true) {
                moduleName = moduleName + path2.sep + path2.relative(basedir, filename);
                debug3("preparing to process require of internal file: %s", moduleName);
              } else {
                debug3("ignoring require of non-main module file: %s", res);
                return exports3;
              }
            }
          }
        }
        if (self.cache.has(filename) === false) {
          self.cache.set(filename, exports3);
          debug3("calling require hook: %s", moduleName);
          self.cache.set(filename, onrequire(exports3, moduleName, basedir));
        }
        debug3("returning module: %s", moduleName);
        return self.cache.get(filename);
      };
    }
    Hook.prototype.unhook = function() {
      this._unhooked = true;
      if (this._require === Module.prototype.require) {
        Module.prototype.require = this._origRequire;
        debug3("unhook successful");
      } else {
        debug3("unhook unsuccessful");
      }
    };
    function resolveModuleName(stat) {
      const normalizedPath = path2.sep !== "/" ? stat.path.split(path2.sep).join("/") : stat.path;
      return path2.posix.join(stat.name, normalizedPath).replace(normalize2, "");
    }
  }
});

// node_modules/@pm2/io/build/main/metrics/httpMetrics.js
var require_httpMetrics = __commonJS({
  "node_modules/@pm2/io/build/main/metrics/httpMetrics.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HttpMetricsConfig = void 0;
    var shimmer = require_shimmer();
    var debug_1 = require_src2();
    var configuration_1 = require_configuration();
    var serviceManager_1 = require_serviceManager();
    var histogram_1 = require_histogram();
    var requireMiddle = require_require_in_the_middle();
    var metrics_1 = require_metrics();
    var HttpMetricsConfig = class {
    };
    exports2.HttpMetricsConfig = HttpMetricsConfig;
    var HttpMetrics = class {
      constructor() {
        this.defaultConf = {
          http: true
        };
        this.metrics = /* @__PURE__ */ new Map();
        this.logger = (0, debug_1.default)("axm:features:metrics:http");
        this.modules = {};
      }
      init(config) {
        if (config === false)
          return;
        if (config === void 0) {
          config = this.defaultConf;
        }
        if (typeof config !== "object") {
          config = this.defaultConf;
        }
        this.logger("init");
        configuration_1.default.configureModule({
          latency: true
        });
        this.metricService = serviceManager_1.ServiceManager.get("metrics");
        if (this.metricService === void 0)
          return this.logger(`Failed to load metric service`);
        this.logger("hooking to require");
        this.hookRequire();
      }
      registerHttpMetric() {
        if (this.metricService === void 0)
          return this.logger(`Failed to load metric service`);
        const histogram = new histogram_1.default();
        const p50 = {
          name: `HTTP Mean Latency`,
          id: "internal/http/builtin/latency/p50",
          type: metrics_1.MetricType.histogram,
          historic: true,
          implementation: histogram,
          unit: "ms",
          handler: () => {
            const percentiles = histogram.percentiles([0.5]);
            return percentiles[0.5];
          }
        };
        const p95 = {
          name: `HTTP P95 Latency`,
          id: "internal/http/builtin/latency/p95",
          type: metrics_1.MetricType.histogram,
          historic: true,
          implementation: histogram,
          handler: () => {
            const percentiles = histogram.percentiles([0.95]);
            return percentiles[0.95];
          },
          unit: "ms"
        };
        const meter = {
          name: "HTTP",
          historic: true,
          id: "internal/http/builtin/reqs",
          unit: "req/min"
        };
        this.metricService.registerMetric(p50);
        this.metricService.registerMetric(p95);
        this.metrics.set("http.latency", histogram);
        this.metrics.set("http.meter", this.metricService.meter(meter));
      }
      registerHttpsMetric() {
        if (this.metricService === void 0)
          return this.logger(`Failed to load metric service`);
        const histogram = new histogram_1.default();
        const p50 = {
          name: `HTTPS Mean Latency`,
          id: "internal/https/builtin/latency/p50",
          type: metrics_1.MetricType.histogram,
          historic: true,
          implementation: histogram,
          unit: "ms",
          handler: () => {
            const percentiles = histogram.percentiles([0.5]);
            return percentiles[0.5];
          }
        };
        const p95 = {
          name: `HTTPS P95 Latency`,
          id: "internal/https/builtin/latency/p95",
          type: metrics_1.MetricType.histogram,
          historic: true,
          implementation: histogram,
          handler: () => {
            const percentiles = histogram.percentiles([0.95]);
            return percentiles[0.95];
          },
          unit: "ms"
        };
        const meter = {
          name: "HTTPS",
          historic: true,
          id: "internal/https/builtin/reqs",
          unit: "req/min"
        };
        this.metricService.registerMetric(p50);
        this.metricService.registerMetric(p95);
        this.metrics.set("https.latency", histogram);
        this.metrics.set("https.meter", this.metricService.meter(meter));
      }
      destroy() {
        if (this.modules.http !== void 0) {
          this.logger("unwraping http module");
          shimmer.unwrap(this.modules.http, "emit");
          this.modules.http = void 0;
        }
        if (this.modules.https !== void 0) {
          this.logger("unwraping https module");
          shimmer.unwrap(this.modules.https, "emit");
          this.modules.https = void 0;
        }
        if (this.hooks) {
          this.hooks.unhook();
        }
        this.logger("destroy");
      }
      hookHttp(nodule, name) {
        if (nodule.Server === void 0 || nodule.Server.prototype === void 0)
          return;
        if (this.modules[name] !== void 0)
          return this.logger(`Module ${name} already hooked`);
        this.logger(`Hooking to ${name} module`);
        this.modules[name] = nodule.Server.prototype;
        if (name === "http") {
          this.registerHttpMetric();
        } else if (name === "https") {
          this.registerHttpsMetric();
        }
        const self = this;
        shimmer.wrap(nodule.Server.prototype, "emit", (original) => {
          return function(event, req, res) {
            if (event !== "request")
              return original.apply(this, arguments);
            const meter = self.metrics.get(`${name}.meter`);
            if (meter !== void 0) {
              meter.mark();
            }
            const latency = self.metrics.get(`${name}.latency`);
            if (latency === void 0)
              return original.apply(this, arguments);
            if (res === void 0 || res === null)
              return original.apply(this, arguments);
            const startTime = Date.now();
            res.once("finish", (_) => {
              latency.update(Date.now() - startTime);
            });
            return original.apply(this, arguments);
          };
        });
      }
      hookRequire() {
        this.hooks = requireMiddle(["http", "https"], (exports3, name) => {
          this.hookHttp(exports3, name);
          return exports3;
        });
      }
    };
    exports2.default = HttpMetrics;
  }
});

// node_modules/@pm2/io/build/main/metrics/v8.js
var require_v8 = __commonJS({
  "node_modules/@pm2/io/build/main/metrics/v8.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.V8MetricsConfig = void 0;
    var v8 = require("v8");
    var debug_1 = require_src2();
    var serviceManager_1 = require_serviceManager();
    var V8MetricsConfig = class {
    };
    exports2.V8MetricsConfig = V8MetricsConfig;
    var defaultOptions2 = {
      new_space: false,
      old_space: false,
      map_space: false,
      code_space: false,
      large_object_space: false,
      heap_total_size: true,
      heap_used_size: true,
      heap_used_percent: true
    };
    var V8Metric = class {
      constructor() {
        this.TIME_INTERVAL = 800;
        this.logger = (0, debug_1.default)("axm:features:metrics:v8");
        this.metricStore = /* @__PURE__ */ new Map();
        this.unitKB = "MiB";
        this.metricsDefinitions = {
          total_heap_size: {
            name: "Heap Size",
            id: "internal/v8/heap/total",
            unit: this.unitKB,
            historic: true
          },
          heap_used_percent: {
            name: "Heap Usage",
            id: "internal/v8/heap/usage",
            unit: "%",
            historic: true
          },
          used_heap_size: {
            name: "Used Heap Size",
            id: "internal/v8/heap/used",
            unit: this.unitKB,
            historic: true
          }
        };
      }
      init(config) {
        if (config === false)
          return;
        if (config === void 0) {
          config = defaultOptions2;
        }
        if (config === true) {
          config = defaultOptions2;
        }
        this.metricService = serviceManager_1.ServiceManager.get("metrics");
        if (this.metricService === void 0)
          return this.logger("Failed to load metric service");
        this.logger("init");
        if (!v8.hasOwnProperty("getHeapStatistics")) {
          return this.logger(`V8.getHeapStatistics is not available, aborting`);
        }
        for (let metricName in this.metricsDefinitions) {
          if (config[metricName] === false)
            continue;
          const isEnabled = config[metricName];
          if (isEnabled === false)
            continue;
          let metric = this.metricsDefinitions[metricName];
          this.metricStore.set(metricName, this.metricService.metric(metric));
        }
        this.timer = setInterval(() => {
          const stats = v8.getHeapStatistics();
          for (let metricName in this.metricsDefinitions) {
            if (typeof stats[metricName] !== "number")
              continue;
            const gauge = this.metricStore.get(metricName);
            if (gauge === void 0)
              continue;
            gauge.set(this.formatMiBytes(stats[metricName]));
          }
          const usage = (stats.used_heap_size / stats.total_heap_size * 100).toFixed(2);
          const usageMetric = this.metricStore.get("heap_used_percent");
          if (usageMetric !== void 0) {
            usageMetric.set(parseFloat(usage));
          }
        }, this.TIME_INTERVAL);
        this.timer.unref();
      }
      destroy() {
        if (this.timer !== void 0) {
          clearInterval(this.timer);
        }
        this.logger("destroy");
      }
      formatMiBytes(val) {
        return (val / 1024 / 1024).toFixed(2);
      }
    };
    exports2.default = V8Metric;
  }
});

// node_modules/@pm2/io/build/main/metrics/runtime.js
var require_runtime = __commonJS({
  "node_modules/@pm2/io/build/main/metrics/runtime.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RuntimeMetricsOptions = void 0;
    var metrics_1 = require_metrics();
    var serviceManager_1 = require_serviceManager();
    var Debug = require_src2();
    var histogram_1 = require_histogram();
    var RuntimeMetricsOptions = class {
    };
    exports2.RuntimeMetricsOptions = RuntimeMetricsOptions;
    var defaultOptions2 = {
      gcNewPause: true,
      gcOldPause: true,
      pageFaults: true,
      contextSwitchs: true
    };
    var RuntimeMetrics = class {
      constructor() {
        this.logger = Debug("axm:features:metrics:runtime");
        this.metrics = /* @__PURE__ */ new Map();
      }
      init(config) {
        if (config === false)
          return;
        if (config === void 0) {
          config = defaultOptions2;
        }
        if (config === true) {
          config = defaultOptions2;
        }
        this.metricService = serviceManager_1.ServiceManager.get("metrics");
        if (this.metricService === void 0)
          return this.logger("Failed to load metric service");
        this.runtimeStatsService = serviceManager_1.ServiceManager.get("runtimeStats");
        if (this.runtimeStatsService === void 0)
          return this.logger("Failed to load runtime stats service");
        this.logger("init");
        const newHistogram = new histogram_1.default();
        if (config.gcNewPause === true) {
          this.metricService.registerMetric({
            name: "GC New Space Pause",
            id: "internal/v8/gc/new/pause/p50",
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: newHistogram,
            unit: "ms",
            handler: function() {
              const percentiles = this.implementation.percentiles([0.5]);
              return percentiles[0.5];
            }
          });
          this.metricService.registerMetric({
            name: "GC New Space Pause p95",
            id: "internal/v8/gc/new/pause/p95",
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: newHistogram,
            unit: "ms",
            handler: function() {
              const percentiles = this.implementation.percentiles([0.95]);
              return percentiles[0.95];
            }
          });
        }
        const oldHistogram = new histogram_1.default();
        if (config.gcOldPause === true) {
          this.metricService.registerMetric({
            name: "GC Old Space Pause",
            id: "internal/v8/gc/old/pause/p50",
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: oldHistogram,
            unit: "ms",
            handler: function() {
              const percentiles = this.implementation.percentiles([0.5]);
              return percentiles[0.5];
            }
          });
          this.metricService.registerMetric({
            name: "GC Old Space Pause p95",
            id: "internal/v8/gc/old/pause/p95",
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: oldHistogram,
            unit: "ms",
            handler: function() {
              const percentiles = this.implementation.percentiles([0.95]);
              return percentiles[0.95];
            }
          });
        }
        if (config.contextSwitchs === true) {
          const volontarySwitchs = this.metricService.histogram({
            name: "Volontary CPU Context Switch",
            id: "internal/uv/cpu/contextswitch/volontary",
            measurement: metrics_1.MetricMeasurements.mean
          });
          const inVolontarySwitchs = this.metricService.histogram({
            name: "Involuntary CPU Context Switch",
            id: "internal/uv/cpu/contextswitch/involontary",
            measurement: metrics_1.MetricMeasurements.mean
          });
          this.metrics.set("inVolontarySwitchs", inVolontarySwitchs);
          this.metrics.set("volontarySwitchs", volontarySwitchs);
        }
        if (config.pageFaults === true) {
          const softPageFault = this.metricService.histogram({
            name: "Minor Page Fault",
            id: "internal/uv/memory/pagefault/minor",
            measurement: metrics_1.MetricMeasurements.mean
          });
          const hardPageFault = this.metricService.histogram({
            name: "Major Page Fault",
            id: "internal/uv/memory/pagefault/major",
            measurement: metrics_1.MetricMeasurements.mean
          });
          this.metrics.set("softPageFault", softPageFault);
          this.metrics.set("hardPageFault", hardPageFault);
        }
        this.handle = (stats) => {
          if (typeof stats !== "object" || typeof stats.gc !== "object")
            return;
          newHistogram.update(stats.gc.newPause);
          oldHistogram.update(stats.gc.oldPause);
          if (typeof stats.usage !== "object")
            return;
          const volontarySwitchs = this.metrics.get("volontarySwitchs");
          if (volontarySwitchs !== void 0) {
            volontarySwitchs.update(stats.usage.ru_nvcsw);
          }
          const inVolontarySwitchs = this.metrics.get("inVolontarySwitchs");
          if (inVolontarySwitchs !== void 0) {
            inVolontarySwitchs.update(stats.usage.ru_nivcsw);
          }
          const softPageFault = this.metrics.get("softPageFault");
          if (softPageFault !== void 0) {
            softPageFault.update(stats.usage.ru_minflt);
          }
          const hardPageFault = this.metrics.get("hardPageFault");
          if (hardPageFault !== void 0) {
            hardPageFault.update(stats.usage.ru_majflt);
          }
        };
        this.runtimeStatsService.on("data", this.handle);
      }
      destroy() {
        if (this.runtimeStatsService !== void 0) {
          this.runtimeStatsService.removeListener("data", this.handle);
        }
        this.logger("destroy");
      }
    };
    exports2.default = RuntimeMetrics;
  }
});

// node_modules/@pm2/io/build/main/features/metrics.js
var require_metrics2 = __commonJS({
  "node_modules/@pm2/io/build/main/features/metrics.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MetricsFeature = exports2.MetricConfig = exports2.defaultMetricConf = void 0;
    var debug_1 = require_src2();
    var featureManager_1 = require_featureManager();
    var eventLoopMetrics_1 = require_eventLoopMetrics();
    var network_1 = require_network();
    var httpMetrics_1 = require_httpMetrics();
    var v8_1 = require_v8();
    var runtime_1 = require_runtime();
    exports2.defaultMetricConf = {
      eventLoop: true,
      network: false,
      http: true,
      runtime: true,
      v8: true
    };
    var MetricConfig = class {
    };
    exports2.MetricConfig = MetricConfig;
    var availableMetrics = [
      {
        name: "eventloop",
        module: eventLoopMetrics_1.default,
        optionsPath: "eventLoop"
      },
      {
        name: "http",
        module: httpMetrics_1.default,
        optionsPath: "http"
      },
      {
        name: "network",
        module: network_1.default,
        optionsPath: "network"
      },
      {
        name: "v8",
        module: v8_1.default,
        optionsPath: "v8"
      },
      {
        name: "runtime",
        module: runtime_1.default,
        optionsPath: "runtime"
      }
    ];
    var MetricsFeature = class {
      constructor() {
        this.logger = (0, debug_1.default)("axm:features:metrics");
      }
      init(options) {
        if (typeof options !== "object")
          options = {};
        this.logger("init");
        for (let availableMetric of availableMetrics) {
          const metric = new availableMetric.module();
          let config = void 0;
          if (typeof availableMetric.optionsPath !== "string") {
            config = {};
          } else if (availableMetric.optionsPath === ".") {
            config = options;
          } else {
            config = (0, featureManager_1.getObjectAtPath)(options, availableMetric.optionsPath);
          }
          metric.init(config);
          availableMetric.instance = metric;
        }
      }
      get(name) {
        const metric = availableMetrics.find((metric2) => metric2.name === name);
        if (metric === void 0)
          return void 0;
        return metric.instance;
      }
      destroy() {
        this.logger("destroy");
        for (let availableMetric of availableMetrics) {
          if (availableMetric.instance === void 0)
            continue;
          availableMetric.instance.destroy();
        }
      }
    };
    exports2.MetricsFeature = MetricsFeature;
  }
});

// node_modules/@pm2/io/build/main/features/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/@pm2/io/build/main/features/dependencies.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DependenciesFeature = void 0;
    var serviceManager_1 = require_serviceManager();
    var Debug = require_src2();
    var configuration_1 = require_configuration();
    var fs_1 = require("fs");
    var DependenciesFeature = class {
      constructor() {
        this.logger = Debug("axm:features:dependencies");
      }
      init() {
        this.transport = serviceManager_1.ServiceManager.get("transport");
        this.logger("init");
        const pkgPath = configuration_1.default.findPackageJson();
        if (typeof pkgPath !== "string")
          return this.logger("failed to found pkg.json path");
        this.logger(`found pkg.json in ${pkgPath}`);
        (0, fs_1.readFile)(pkgPath, (err, data) => {
          if (err)
            return this.logger(`failed to read pkg.json`, err);
          try {
            const pkg = JSON.parse(data.toString());
            if (typeof pkg.dependencies !== "object") {
              return this.logger(`failed to find deps in pkg.json`);
            }
            const dependencies = Object.keys(pkg.dependencies).reduce((list, name) => {
              list[name] = { version: pkg.dependencies[name] };
              return list;
            }, {});
            this.logger(`collected ${Object.keys(dependencies).length} dependencies`);
            this.transport.send("application:dependencies", dependencies);
            this.logger("sent dependencies list");
          } catch (err2) {
            return this.logger(`failed to parse pkg.json`, err2);
          }
        });
      }
      destroy() {
        this.logger("destroy");
      }
    };
    exports2.DependenciesFeature = DependenciesFeature;
  }
});

// node_modules/@pm2/io/build/main/featureManager.js
var require_featureManager = __commonJS({
  "node_modules/@pm2/io/build/main/featureManager.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FeatureConfig = exports2.FeatureManager = void 0;
    exports2.getObjectAtPath = getObjectAtPath;
    var notify_1 = require_notify();
    var profiling_1 = require_profiling();
    var events_1 = require_events();
    var metrics_1 = require_metrics2();
    var dependencies_1 = require_dependencies();
    var Debug = require_src2();
    function getObjectAtPath(context, path2) {
      if (path2.indexOf(".") === -1 && path2.indexOf("[") === -1) {
        return context[path2];
      }
      let crumbs = path2.split(/\.|\[|\]/g);
      let i = -1;
      let len = crumbs.length;
      let result;
      while (++i < len) {
        if (i === 0)
          result = context;
        if (!crumbs[i])
          continue;
        if (result === void 0)
          break;
        result = result[crumbs[i]];
      }
      return result;
    }
    var availablesFeatures = [
      {
        name: "notify",
        optionsPath: ".",
        module: notify_1.NotifyFeature
      },
      {
        name: "profiler",
        optionsPath: "profiling",
        module: profiling_1.ProfilingFeature
      },
      {
        name: "events",
        module: events_1.EventsFeature
      },
      {
        name: "metrics",
        optionsPath: "metrics",
        module: metrics_1.MetricsFeature
      },
      {
        name: "dependencies",
        module: dependencies_1.DependenciesFeature
      }
    ];
    var FeatureManager = class {
      constructor() {
        this.logger = Debug("axm:features");
      }
      init(options) {
        for (let availableFeature of availablesFeatures) {
          this.logger(`Creating feature ${availableFeature.name}`);
          const feature = new availableFeature.module();
          let config = void 0;
          if (typeof availableFeature.optionsPath !== "string") {
            config = {};
          } else if (availableFeature.optionsPath === ".") {
            config = options;
          } else {
            config = getObjectAtPath(options, availableFeature.optionsPath);
          }
          this.logger(`Init feature ${availableFeature.name}`);
          feature.init(config);
          availableFeature.instance = feature;
        }
      }
      get(name) {
        const feature = availablesFeatures.find((feature2) => feature2.name === name);
        if (feature === void 0 || feature.instance === void 0) {
          throw new Error(`Tried to call feature ${name} which doesn't exist or wasn't initiated`);
        }
        return feature.instance;
      }
      destroy() {
        for (let availableFeature of availablesFeatures) {
          if (availableFeature.instance === void 0)
            continue;
          this.logger(`Destroy feature ${availableFeature.name}`);
          availableFeature.instance.destroy();
        }
      }
    };
    exports2.FeatureManager = FeatureManager;
    var FeatureConfig = class {
    };
    exports2.FeatureConfig = FeatureConfig;
  }
});

// node_modules/@pm2/io/build/main/services/actions.js
var require_actions = __commonJS({
  "node_modules/@pm2/io/build/main/services/actions.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ActionService = exports2.Action = void 0;
    var serviceManager_1 = require_serviceManager();
    var Debug = require_src2();
    var Action = class {
    };
    exports2.Action = Action;
    var ActionService = class {
      constructor() {
        this.timer = void 0;
        this.transport = void 0;
        this.actions = /* @__PURE__ */ new Map();
        this.logger = Debug("axm:services:actions");
      }
      listener(data) {
        this.logger(`Received new message from reverse`);
        if (!data)
          return false;
        const actionName = data.msg ? data.msg : data.action_name ? data.action_name : data;
        let action = this.actions.get(actionName);
        if (typeof action !== "object") {
          return this.logger(`Received action ${actionName} but failed to find the implementation`);
        }
        if (!action.isScoped) {
          this.logger(`Succesfully called custom action ${action.name} with arity ${action.handler.length}`);
          if (action.handler.length === 2) {
            let params = {};
            if (typeof data === "object") {
              params = data.opts;
            }
            return action.handler(params, action.callback);
          }
          return action.handler(action.callback);
        }
        if (data.uuid === void 0) {
          return this.logger(`Received scoped action ${action.name} but without uuid`);
        }
        const stream = {
          send: (dt) => {
            this.transport.send("axm:scoped_action:stream", {
              data: dt,
              uuid: data.uuid,
              action_name: actionName
            });
          },
          error: (dt) => {
            this.transport.send("axm:scoped_action:error", {
              data: dt,
              uuid: data.uuid,
              action_name: actionName
            });
          },
          end: (dt) => {
            this.transport.send("axm:scoped_action:end", {
              data: dt,
              uuid: data.uuid,
              action_name: actionName
            });
          }
        };
        this.logger(`Succesfully called scoped action ${action.name}`);
        return action.handler(data.opts || {}, stream);
      }
      init() {
        this.transport = serviceManager_1.ServiceManager.get("transport");
        if (this.transport === void 0) {
          return this.logger(`Failed to load transport service`);
        }
        this.actions.clear();
        this.transport.on("data", this.listener.bind(this));
      }
      destroy() {
        if (this.timer !== void 0) {
          clearInterval(this.timer);
        }
        if (this.transport !== void 0) {
          this.transport.removeListener("data", this.listener.bind(this));
        }
      }
      registerAction(actionName, opts, handler) {
        if (typeof opts === "function") {
          handler = opts;
          opts = void 0;
        }
        if (typeof actionName !== "string") {
          console.error(`You must define an name when registering an action`);
          return;
        }
        if (typeof handler !== "function") {
          console.error(`You must define an callback when registering an action`);
          return;
        }
        if (this.transport === void 0) {
          return this.logger(`Failed to load transport service`);
        }
        let type2 = "custom";
        if (actionName.indexOf("km:") === 0 || actionName.indexOf("internal:") === 0) {
          type2 = "internal";
        }
        const reply = (data) => {
          this.transport.send("axm:reply", {
            at: (/* @__PURE__ */ new Date()).getTime(),
            action_name: actionName,
            return: data
          });
        };
        const action = {
          name: actionName,
          callback: reply,
          handler,
          type: type2,
          isScoped: false,
          arity: handler.length,
          opts
        };
        this.logger(`Succesfully registered custom action ${action.name}`);
        this.actions.set(actionName, action);
        this.transport.addAction(action);
      }
      scopedAction(actionName, handler) {
        if (typeof actionName !== "string") {
          console.error(`You must define an name when registering an action`);
          return -1;
        }
        if (typeof handler !== "function") {
          console.error(`You must define an callback when registering an action`);
          return -1;
        }
        if (this.transport === void 0) {
          return this.logger(`Failed to load transport service`);
        }
        const action = {
          name: actionName,
          handler,
          type: "scoped",
          isScoped: true,
          arity: handler.length,
          opts: null
        };
        this.logger(`Succesfully registered scoped action ${action.name}`);
        this.actions.set(actionName, action);
        this.transport.addAction(action);
      }
    };
    exports2.ActionService = ActionService;
  }
});

// node_modules/@pm2/io/build/main/services/runtimeStats.js
var require_runtimeStats = __commonJS({
  "node_modules/@pm2/io/build/main/services/runtimeStats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RuntimeStatsService = void 0;
    var debug_1 = require_src2();
    var module_1 = require_module();
    var eventemitter2_1 = require_eventemitter2();
    var RuntimeStatsService = class extends eventemitter2_1.EventEmitter2 {
      constructor() {
        super(...arguments);
        this.logger = (0, debug_1.default)("axm:services:runtimeStats");
        this.enabled = false;
      }
      init() {
        this.logger("init");
        if (process.env.PM2_APM_DISABLE_RUNTIME_STATS === "true") {
          return this.logger("disabling service because of the environment flag");
        }
        const modulePath = module_1.default.detectModule("@pm2/node-runtime-stats");
        if (typeof modulePath !== "string")
          return;
        const RuntimeStats = module_1.default.loadModule(modulePath);
        if (RuntimeStats instanceof Error) {
          return this.logger(`Failed to require module @pm2/node-runtime-stats: ${RuntimeStats.message}`);
        }
        this.noduleInstance = new RuntimeStats({
          delay: 1e3
        });
        this.logger("starting runtime stats");
        this.noduleInstance.start();
        this.handle = (data) => {
          this.logger("received runtime stats", data);
          this.emit("data", data);
        };
        this.noduleInstance.on("sense", this.handle);
        this.enabled = true;
      }
      isEnabled() {
        return this.enabled;
      }
      destroy() {
        if (this.noduleInstance !== void 0 && this.noduleInstance !== null) {
          this.logger("removing listener on runtime stats service");
          this.noduleInstance.removeListener("sense", this.handle);
          this.noduleInstance.stop();
        }
        this.logger("destroy");
      }
    };
    exports2.RuntimeStatsService = RuntimeStatsService;
  }
});

// node_modules/@pm2/io/build/main/features/entrypoint.js
var require_entrypoint = __commonJS({
  "node_modules/@pm2/io/build/main/features/entrypoint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Entrypoint = void 0;
    var IO_KEY = /* @__PURE__ */ Symbol.for("@pm2/io");
    var Entrypoint = class {
      constructor() {
        try {
          this.io = global[IO_KEY].init(this.conf());
          this.onStart((err) => {
            if (err) {
              console.error(err);
              process.exit(1);
            }
            this.sensors();
            this.events();
            this.actuators();
            this.io.onExit((code, signal) => {
              this.onStop(err, () => {
                this.io.destroy();
              }, code, signal);
            });
            if (process && process.send)
              process.send("ready");
          });
        } catch (e) {
          if (this.io) {
            this.io.destroy();
          }
          throw e;
        }
      }
      events() {
        return;
      }
      sensors() {
        return;
      }
      actuators() {
        return;
      }
      onStart(cb) {
        throw new Error("Entrypoint onStart() not specified");
      }
      onStop(err, cb, code, signal) {
        return cb();
      }
      conf() {
        return void 0;
      }
    };
    exports2.Entrypoint = Entrypoint;
  }
});

// node_modules/@pm2/io/build/main/services/inspector.js
var require_inspector = __commonJS({
  "node_modules/@pm2/io/build/main/services/inspector.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InspectorService = void 0;
    var inspector = require("inspector");
    var debug_1 = require_src2();
    var InspectorService = class {
      constructor() {
        this.session = null;
        this.logger = (0, debug_1.default)("axm:services:inspector");
      }
      init() {
        this.logger(`Creating new inspector session`);
        this.session = new inspector.Session();
        this.session.connect();
        this.logger("Connected to inspector");
        this.session.post("Profiler.enable");
        this.session.post("HeapProfiler.enable");
        return this.session;
      }
      getSession() {
        if (this.session === null) {
          this.session = this.init();
          return this.session;
        } else {
          return this.session;
        }
      }
      destroy() {
        if (this.session !== null) {
          this.session.post("Profiler.disable");
          this.session.post("HeapProfiler.disable");
          this.session.disconnect();
          this.session = null;
        } else {
          this.logger("No open session");
        }
      }
    };
    exports2.InspectorService = InspectorService;
    module2.exports = InspectorService;
  }
});

// node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "node_modules/signal-exit/signals.js"(exports2, module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/signal-exit/index.js"(exports2, module2) {
    var process2 = global.process;
    var processOk = function(process3) {
      return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
    };
    if (!processOk(process2)) {
      module2.exports = function() {
        return function() {
        };
      };
    } else {
      assert = require("assert");
      signals2 = require_signals();
      isWin = /^win/i.test(process2.platform);
      EE = require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process2.__signal_exit_emitter__) {
        emitter = process2.__signal_exit_emitter__;
      } else {
        emitter = process2.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module2.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        };
        emitter.on(ev, cb);
        return remove;
      };
      unload = function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals2.forEach(function(sig) {
          try {
            process2.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process2.emit = originalProcessEmit;
        process2.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      };
      module2.exports.unload = unload;
      emit = function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      };
      sigListeners = {};
      signals2.forEach(function(sig) {
        sigListeners[sig] = function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process2.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process2.kill(process2.pid, sig);
          }
        };
      });
      module2.exports.signals = function() {
        return signals2;
      };
      loaded = false;
      load = function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals2 = signals2.filter(function(sig) {
          try {
            process2.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process2.emit = processEmit;
        process2.reallyExit = processReallyExit;
      };
      module2.exports.load = load;
      originalProcessReallyExit = process2.reallyExit;
      processReallyExit = function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process2.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        originalProcessReallyExit.call(process2, process2.exitCode);
      };
      originalProcessEmit = process2.emit;
      processEmit = function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process2.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process2.exitCode, null);
          emit("afterexit", process2.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      };
    }
    var assert;
    var signals2;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// node_modules/@pm2/io/build/main/pmx.js
var require_pmx = __commonJS({
  "node_modules/@pm2/io/build/main/pmx.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.defaultConfig = exports2.IOConfig = void 0;
    var configuration_1 = require_configuration();
    var debug_1 = require_src2();
    var serviceManager_1 = require_serviceManager();
    var transport_1 = require_transport();
    var featureManager_1 = require_featureManager();
    var actions_1 = require_actions();
    var metrics_1 = require_metrics();
    var constants_1 = require_constants2();
    var runtimeStats_1 = require_runtimeStats();
    var entrypoint_1 = require_entrypoint();
    var IOConfig = class {
      constructor() {
        this.catchExceptions = true;
        this.profiling = true;
        this.standalone = false;
      }
    };
    exports2.IOConfig = IOConfig;
    exports2.defaultConfig = {
      catchExceptions: true,
      profiling: true,
      metrics: {
        v8: true,
        network: false,
        eventLoop: true,
        runtime: true,
        http: true
      },
      standalone: false,
      apmOptions: void 0
    };
    var PMX = class {
      constructor() {
        this.featureManager = new featureManager_1.FeatureManager();
        this.transport = null;
        this.actionService = null;
        this.metricService = null;
        this.runtimeStatsService = null;
        this.logger = (0, debug_1.default)("axm:main");
        this.initialized = false;
        this.Entrypoint = entrypoint_1.Entrypoint;
      }
      init(config) {
        const callsite = (new Error().stack || "").split("\n")[2];
        if (callsite && callsite.length > 0) {
          this.logger(`init from ${callsite}`);
        }
        if (this.initialized === true) {
          this.logger(`Calling init but was already the case, destroying and recreating`);
          this.destroy();
        }
        if (config === void 0) {
          config = exports2.defaultConfig;
        }
        if (!config.standalone) {
          const autoStandalone = process.env.PM2_SECRET_KEY && process.env.PM2_PUBLIC_KEY && process.env.PM2_APP_NAME;
          config.standalone = !!autoStandalone;
          config.apmOptions = autoStandalone ? {
            secretKey: process.env.PM2_SECRET_KEY,
            publicKey: process.env.PM2_PUBLIC_KEY,
            appName: process.env.PM2_APP_NAME
          } : void 0;
        }
        this.transport = (0, transport_1.createTransport)(config.standalone === true ? "websocket" : "ipc", config.apmOptions);
        serviceManager_1.ServiceManager.set("transport", this.transport);
        if ((0, constants_1.canUseInspector)()) {
          const Inspector = require_inspector();
          const inspectorService = new Inspector();
          inspectorService.init();
          serviceManager_1.ServiceManager.set("inspector", inspectorService);
        }
        this.actionService = new actions_1.ActionService();
        this.actionService.init();
        serviceManager_1.ServiceManager.set("actions", this.actionService);
        this.metricService = new metrics_1.MetricService();
        this.metricService.init();
        serviceManager_1.ServiceManager.set("metrics", this.metricService);
        this.runtimeStatsService = new runtimeStats_1.RuntimeStatsService();
        this.runtimeStatsService.init();
        if (this.runtimeStatsService.isEnabled()) {
          serviceManager_1.ServiceManager.set("runtimeStats", this.runtimeStatsService);
        }
        this.featureManager.init(config);
        configuration_1.default.init(config);
        this.initialConfig = config;
        this.initialized = true;
        return this;
      }
      destroy() {
        this.logger("destroy");
        this.featureManager.destroy();
        if (this.actionService !== null) {
          this.actionService.destroy();
        }
        if (this.transport !== null) {
          this.transport.destroy();
        }
        if (this.metricService !== null) {
          this.metricService.destroy();
        }
        if (this.runtimeStatsService !== null) {
          this.runtimeStatsService.destroy();
        }
        const inspectorService = serviceManager_1.ServiceManager.get("inspector");
        if (inspectorService !== void 0) {
          inspectorService.destroy();
        }
      }
      getConfig() {
        return this.initialConfig;
      }
      notifyError(error, context) {
        const notify = this.featureManager.get("notify");
        return notify.notifyError(error, context);
      }
      metrics(metric) {
        const res = [];
        if (metric === void 0 || metric === null) {
          console.error(`Received empty metric to create`);
          console.trace();
          return [];
        }
        let metrics = !Array.isArray(metric) ? [metric] : metric;
        for (let metric2 of metrics) {
          if (typeof metric2.name !== "string") {
            console.error(`Trying to create a metrics without a name`, metric2);
            console.trace();
            res.push({});
            continue;
          }
          if (metric2.type === void 0) {
            metric2.type = metrics_1.MetricType.gauge;
          }
          switch (metric2.type) {
            case metrics_1.MetricType.counter: {
              res.push(this.counter(metric2));
              continue;
            }
            case metrics_1.MetricType.gauge: {
              res.push(this.gauge(metric2));
              continue;
            }
            case metrics_1.MetricType.histogram: {
              res.push(this.histogram(metric2));
              continue;
            }
            case metrics_1.MetricType.meter: {
              res.push(this.meter(metric2));
              continue;
            }
            case metrics_1.MetricType.metric: {
              res.push(this.gauge(metric2));
              continue;
            }
            default: {
              console.error(`Invalid metric type ${metric2.type} for metric ${metric2.name}`);
              console.trace();
              res.push({});
              continue;
            }
          }
        }
        return res;
      }
      histogram(config) {
        if (typeof config === "string") {
          config = {
            name: config,
            measurement: metrics_1.MetricMeasurements.mean
          };
        }
        if (this.metricService === null) {
          return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.histogram(config);
      }
      metric(config) {
        if (typeof config === "string") {
          config = {
            name: config
          };
        }
        if (this.metricService === null) {
          return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.metric(config);
      }
      gauge(config) {
        if (typeof config === "string") {
          config = {
            name: config
          };
        }
        if (this.metricService === null) {
          return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.metric(config);
      }
      counter(config) {
        if (typeof config === "string") {
          config = {
            name: config
          };
        }
        if (this.metricService === null) {
          return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.counter(config);
      }
      meter(config) {
        if (typeof config === "string") {
          config = {
            name: config
          };
        }
        if (this.metricService === null) {
          return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.meter(config);
      }
      action(name, opts, fn) {
        if (typeof name === "object") {
          const tmp = name;
          name = tmp.name;
          opts = tmp.options;
          fn = tmp.action;
        }
        if (this.actionService === null) {
          return console.trace(`Tried to register a action without initializing @pm2/io`);
        }
        return this.actionService.registerAction(name, opts, fn);
      }
      onExit(callback) {
        if (typeof callback === "function") {
          const onExit = require_signal_exit();
          return onExit(callback);
        }
      }
      emit(name, data) {
        const events2 = this.featureManager.get("events");
        return events2.emit(name, data);
      }
      initModule(opts, cb) {
        if (!opts)
          opts = {};
        if (opts.reference) {
          opts.name = opts.reference;
          delete opts.reference;
        }
        opts = Object.assign({
          widget: {}
        }, opts);
        opts.widget = Object.assign({
          type: "generic",
          logo: "https://app.keymetrics.io/img/logo/keymetrics-300.png",
          theme: ["#111111", "#1B2228", "#807C7C", "#807C7C"]
        }, opts.widget);
        opts.isModule = true;
        opts = configuration_1.default.init(opts);
        return typeof cb === "function" ? cb(null, opts) : opts;
      }
      expressErrorHandler() {
        const notify = this.featureManager.get("notify");
        return notify.expressErrorHandler();
      }
      koaErrorHandler() {
        const notify = this.featureManager.get("notify");
        return notify.koaErrorHandler();
      }
    };
    exports2.default = PMX;
  }
});

// node_modules/@pm2/io/build/main/index.js
var require_main = __commonJS({
  "node_modules/@pm2/io/build/main/index.js"(exports2, module2) {
    "use strict";
    var pmx_1 = require_pmx();
    var IO_KEY = /* @__PURE__ */ Symbol.for("@pm2/io");
    var isAlreadyHere = Object.getOwnPropertySymbols(global).indexOf(IO_KEY) > -1;
    var io = isAlreadyHere ? global[IO_KEY] : new pmx_1.default().init();
    global[IO_KEY] = io;
    module2.exports = io;
  }
});

// node_modules/ws/lib/constants.js
var require_constants3 = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants3();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target2 = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target2.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target2.buffer, target2.byteOffset, offset);
      }
      return target2;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants3();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants3();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants3();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants3();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions2, generateMask) {
        this._extensions = extensions2 || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge2 = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge2 = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target2 = Buffer.allocUnsafe(merge2 ? dataLength + offset : offset);
        target2[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target2[0] |= 64;
        target2[1] = payloadLength;
        if (payloadLength === 126) {
          target2.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target2[2] = target2[3] = 0;
          target2.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target2, data];
        target2[1] |= 128;
        target2[offset - 4] = mask[0];
        target2[offset - 3] = mask[1];
        target2[offset - 2] = mask[2];
        target2[offset - 1] = mask[3];
        if (skipMasking) return [target2, data];
        if (merge2) {
          applyMask(data, mask, target2, offset, dataLength);
          return [target2];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target2, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants3();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type2) {
        this[kTarget] = null;
        this[kType] = type2;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type2, options = {}) {
        super(type2);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type2, options = {}) {
        super(type2);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type2, options = {}) {
        super(type2);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type2, handler, options = {}) {
        for (const listener of this.listeners(type2)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type2 === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type2 === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type2 === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type2 === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type2, wrapper);
        } else {
          this.on(type2, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type2, handler) {
        for (const listener of this.listeners(type2)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type2, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions2) {
      return Object.keys(extensions2).map((extension2) => {
        let configurations = extensions2[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter5 = require("events");
    var https = require("https");
    var http3 = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL: URL3 } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants3();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter5 {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type2) {
        if (!BINARY_TYPES.includes(type2)) return;
        this._binaryType = type2;
        if (this._receiver) this._receiver._binaryType = type2;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL3) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL3(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http3.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL3(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions2;
          try {
            extensions2 = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions2);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions2[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter5 = require("events");
    var http3 = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants3();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter5 {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http3.createServer((req, res) => {
            const body = http3.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions2 = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions2[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions2,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions2, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions2, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions2[PerMessageDeflate2.extensionName]) {
          const params = extensions2[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions2;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map2) {
      for (const event of Object.keys(map2)) server.on(event, map2[event]);
      return function removeListeners() {
        for (const event of Object.keys(map2)) {
          server.removeListener(event, map2[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http3.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http3.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// server/index.ts
var import_http2 = __toESM(require("http"), 1);

// node_modules/@colyseus/timer/build/index.mjs
var Delayed = class {
  constructor(handler, args, time, type2) {
    this.active = true;
    this.paused = false;
    this.elapsedTime = 0;
    this.handler = handler;
    this.args = args;
    this.time = time;
    this.type = type2;
  }
  tick(deltaTime) {
    if (this.paused) {
      return;
    }
    this.elapsedTime += deltaTime;
    if (this.elapsedTime >= this.time) {
      this.execute();
    }
  }
  execute() {
    this.handler.apply(this, this.args);
    switch (this.type) {
      case 1:
      case 2:
        this.active = false;
        break;
      case 0:
        this.elapsedTime -= this.time;
        break;
    }
  }
  reset() {
    this.elapsedTime = 0;
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
  clear() {
    this.active = false;
  }
};
var TimerClearedError = class extends Error {
  constructor() {
    super("Timer has been cleared");
  }
};
var Clock = class {
  // number or NodeJS.Timer
  constructor(useInterval = false) {
    this.running = false;
    this.now = typeof window !== "undefined" && window.performance && window.performance.now && window.performance.now.bind(window.performance) || Date.now;
    this.start(useInterval);
  }
  start(useInterval = false) {
    this.deltaTime = 0;
    this.currentTime = this.now();
    this.elapsedTime = 0;
    this.running = true;
    if (useInterval) {
      this._interval = setInterval(this.tick.bind(this), 1e3 / 60);
    }
  }
  stop() {
    this.running = false;
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
  tick(newTime = this.now()) {
    this.deltaTime = newTime - this.currentTime;
    this.currentTime = newTime;
    this.elapsedTime += this.deltaTime;
  }
};
var ClockTimer = class extends Clock {
  constructor(autoStart = false) {
    super(autoStart);
    this.delayed = [];
  }
  /**
   * Re-evaluate all the scheduled timeouts and intervals and execute appropriate handlers.
   * Use this in your own context or not if your passed `autoStart` as `true` in the constructor.
   */
  tick() {
    super.tick();
    let delayedList = this.delayed;
    let i = delayedList.length;
    while (i--) {
      const delayed = delayedList[i];
      if (delayed.active) {
        delayed.tick(this.deltaTime);
      } else {
        delayedList.splice(i, 1);
        continue;
      }
    }
  }
  /**
   * Schedule a function to be called every `time` milliseconds.
   * This `time` minimum value will be tied to the `tick` method of the clock. This means if you use the default `autoStart` value from the constructor, the minimum value will be 16ms. Otherwise it will depend on your `tick` method call.
   *
   * Returns a {@link Delayed} object that can be used to clear the timeout or play around with it.
   */
  setInterval(handler, time, ...args) {
    const delayed = new Delayed(
      handler,
      args,
      time,
      0
      /* Interval */
    );
    this.delayed.push(delayed);
    return delayed;
  }
  /**
   * Schedule a function to be called after a delay.
   *
   * This `time` minimum value will be tied to the `tick` method of the clock. This means if you use the default `autoStart` value from the constructor, the minimum value will be 16ms. Otherwise it will depend on your `tick` method call.
   *
   * Returns a {@link Delayed} object that can be used to clear the timeout or play around with it.
   */
  setTimeout(handler, time, ...args) {
    const delayed = new Delayed(
      handler,
      args,
      time,
      1
      /* Timeout */
    );
    this.delayed.push(delayed);
    return delayed;
  }
  /**
   * A promise that schedule a timeout that will resolves after the given time.
   *
   * If the {@link Delayed} instance is cleared before the time, the promise will be rejected. This happens when the {@link ClockTimer.clear} method is called.
   *
   * For the sake of simplicity of this API, you can only cancel a timeout scheduled with this method with {@link ClockTimer.clear} method (which clears all scheduled timeouts and intervals).
   * If you need fine-tuned control over the timeout, use the {@link ClockTimer.setTimeout} method instead.
   *
   * @example **Inside an async function**
   * ```typescript
   * const timer = new Clock(true);
   * await timer.duration(1000);
   * console.log("1 second later");
   * ```
   *
   * @example **Using the promise**
   * ```typescript
   * const timer = new Clock(true);
   * timer.duration(1000).then(() => console.log("1 second later"));
   * ```
   *
   * @example **Using the promise with error**
   * ```typescript
   * const timer = new Clock(true);
   * timer.duration(1000).then(() => console.log("1 second later")).catch(() => console.log("Timer cleared"));
   * timer.clear();
   * ```
   *
   *
   * @param ms the duration in milliseconds in which the promise will be resolved
   */
  duration(ms) {
    return new Promise((resolve, reject) => {
      const delayed = new Delayed(
        resolve,
        void 0,
        ms,
        2
        /* Async */
      );
      delayed.clear = () => {
        delayed.active = false;
        reject(new TimerClearedError());
      };
      this.delayed.push(delayed);
    });
  }
  /**
   * Delete any scheduled timeout or interval. That will never be executed.
   *
   * If some of the timeouts/intervals are already executed, they will be removed from the list and callback will be garbage collected.
   * For timeout created with {@link ClockTimer.duration}, the promise will be rejected and therefore the unused resolving callback will be garbage collected.
   */
  clear() {
    let i = this.delayed.length;
    while (i--) {
      this.delayed[i].clear();
    }
    this.delayed = [];
  }
};
var src_default = ClockTimer;

// node_modules/@colyseus/greeting-banner/build/index.mjs
var index_default = process.env.COLYSEUS_CLOUD ? String.raw`
   ______      __                              ________                __
  / ____/___  / /_  __________  __  _______   / ____/ /___  __  ______/ /
 / /   / __ \/ / / / / ___/ _ \/ / / / ___/  / /   / / __ \/ / / / __  /
/ /___/ /_/ / / /_/ (__  )  __/ /_/ (__  )  / /___/ / /_/ / /_/ / /_/ /
\____/\____/_/\__, /____/\___/\__,_/____/   \____/_/\____/\__,_/\__,_/
             /____/

❓ Don't hesitate to contact support@colyseus.io if you have any issues.
🚀 Thank you for using Colyseus Cloud
` : String.raw`
       ___      _
      / __\___ | |_   _ ___  ___ _   _ ___
     / /  / _ \| | | | / __|/ _ \ | | / __|
    / /__| (_) | | |_| \__ \  __/ |_| \__ \
    \____/\___/|_|\__, |___/\___|\__,_|___/
                  |___/

     · Multiplayer Framework for Node.js ·

💖 Consider becoming a Sponsor on GitHub → https://github.com/sponsors/endel
🌟 Give us a star on GitHub → https://github.com/colyseus/colyseus
☁️  Deploy and scale your project on Colyseus Cloud → https://cloud.colyseus.io

`;

// node_modules/@colyseus/core/build/Debug.mjs
var import_debug = __toESM(require_src(), 1);

// node_modules/@colyseus/core/build/Logger.mjs
var logger = console;
function setLogger(instance) {
  logger = instance;
}

// node_modules/@colyseus/msgpackr/unpack.js
var decoder;
try {
  decoder = new TextDecoder();
} catch (error) {
}
var src;
var srcEnd;
var position = 0;
var EMPTY_ARRAY = [];
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
var C1Type = class {
};
var C1 = new C1Type();
C1.name = "MessagePack 0xC1";
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
var readStruct;
var onLoadedStructures;
var onSaveState;
try {
  new Function("");
} catch (error) {
  inlineObjectReadThreshold = Infinity;
}
var Unpackr = class _Unpackr {
  constructor(options) {
    if (options) {
      if (options.useRecords === false && options.mapsAsObjects === void 0)
        options.mapsAsObjects = true;
      if (options.sequential && options.trusted !== false) {
        options.trusted = true;
        if (!options.structures && options.useRecords != false) {
          options.structures = [];
          if (!options.maxSharedStructures)
            options.maxSharedStructures = 0;
        }
      }
      if (options.structures)
        options.structures.sharedLength = options.structures.length;
      else if (options.getStructures) {
        (options.structures = []).uninitialized = true;
        options.structures.sharedLength = 0;
      }
      if (options.int64AsNumber) {
        options.int64AsType = "number";
      }
    }
    Object.assign(this, options);
  }
  unpack(source, options) {
    if (src) {
      return saveState(() => {
        clearSource();
        return this ? this.unpack(source, options) : _Unpackr.prototype.unpack.call(defaultOptions, source, options);
      });
    }
    if (!source.buffer && source.constructor === ArrayBuffer)
      source = typeof Buffer !== "undefined" ? Buffer.from(source) : new Uint8Array(source);
    if (typeof options === "object") {
      srcEnd = options.end || source.length;
      position = options.start || 0;
    } else {
      position = 0;
      srcEnd = options > -1 ? options : source.length;
    }
    stringPosition = 0;
    srcStringEnd = 0;
    srcString = null;
    strings = EMPTY_ARRAY;
    bundledStrings = null;
    src = source;
    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error) {
      src = null;
      if (source instanceof Uint8Array)
        throw error;
      throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
    }
    if (this instanceof _Unpackr) {
      currentUnpackr = this;
      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead(options);
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentUnpackr = defaultOptions;
      if (!currentStructures || currentStructures.length > 0)
        currentStructures = [];
    }
    return checkedRead(options);
  }
  unpackMultiple(source, forEach) {
    let values, lastPosition = 0;
    try {
      sequentialMode = true;
      let size = source.length;
      let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
      if (forEach) {
        if (forEach(value, lastPosition, position) === false) return;
        while (position < size) {
          lastPosition = position;
          if (forEach(checkedRead(), lastPosition, position) === false) {
            return;
          }
        }
      } else {
        values = [value];
        while (position < size) {
          lastPosition = position;
          values.push(checkedRead());
        }
        return values;
      }
    } catch (error) {
      error.lastPosition = lastPosition;
      error.values = values;
      throw error;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }
  _mergeStructures(loadedStructures, existingStructures) {
    if (onLoadedStructures)
      loadedStructures = onLoadedStructures.call(this, loadedStructures);
    loadedStructures = loadedStructures || [];
    if (Object.isFrozen(loadedStructures))
      loadedStructures = loadedStructures.map((structure) => structure.slice(0));
    for (let i = 0, l = loadedStructures.length; i < l; i++) {
      let structure = loadedStructures[i];
      if (structure) {
        structure.isShared = true;
        if (i >= 32)
          structure.highByte = i - 32 >> 5;
      }
    }
    loadedStructures.sharedLength = loadedStructures.length;
    for (let id in existingStructures || []) {
      if (id >= 0) {
        let structure = loadedStructures[id];
        let existing = existingStructures[id];
        if (existing) {
          if (structure)
            (loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
          loadedStructures[id] = existing;
        }
      }
    }
    return this.structures = loadedStructures;
  }
  decode(source, options) {
    return this.unpack(source, options);
  }
};
function checkedRead(options) {
  try {
    if (!currentUnpackr.trusted && !sequentialMode) {
      let sharedLength = currentStructures.sharedLength || 0;
      if (sharedLength < currentStructures.length)
        currentStructures.length = sharedLength;
    }
    let result;
    if (currentUnpackr.randomAccessStructure && src[position] < 64 && src[position] >= 32 && readStruct) {
      result = readStruct(src, position, srcEnd, currentUnpackr);
      src = null;
      if (!(options && options.lazy) && result)
        result = result.toJSON();
      position = srcEnd;
    } else
      result = read();
    if (bundledStrings) {
      position = bundledStrings.postBundlePosition;
      bundledStrings = null;
    }
    if (sequentialMode)
      currentStructures.restoreStructures = null;
    if (position == srcEnd) {
      if (currentStructures && currentStructures.restoreStructures)
        restoreStructures();
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position > srcEnd) {
      throw new Error("Unexpected end of MessagePack data");
    } else if (!sequentialMode) {
      let jsonView;
      try {
        jsonView = JSON.stringify(result, (_, value) => typeof value === "bigint" ? `${value}n` : value).slice(0, 100);
      } catch (error) {
        jsonView = "(JSON view not available " + error + ")";
      }
      throw new Error("Data read, but end of buffer not reached " + jsonView);
    }
    return result;
  } catch (error) {
    if (currentStructures && currentStructures.restoreStructures)
      restoreStructures();
    clearSource();
    if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer") || position > srcEnd) {
      error.incomplete = true;
    }
    throw error;
  }
}
function restoreStructures() {
  for (let id in currentStructures.restoreStructures) {
    currentStructures[id] = currentStructures.restoreStructures[id];
  }
  currentStructures.restoreStructures = null;
}
function read() {
  let token = src[position++];
  if (token < 160) {
    if (token < 128) {
      if (token < 64)
        return token;
      else {
        let structure = currentStructures[token & 63] || currentUnpackr.getStructures && loadStructures()[token & 63];
        if (structure) {
          if (!structure.read) {
            structure.read = createStructureReader(structure, token & 63);
          }
          return structure.read();
        } else
          return token;
      }
    } else if (token < 144) {
      token -= 128;
      if (currentUnpackr.mapsAsObjects) {
        let object = {};
        for (let i = 0; i < token; i++) {
          let key = readKey();
          if (key === "__proto__")
            key = "__proto_";
          object[key] = read();
        }
        return object;
      } else {
        let map2 = /* @__PURE__ */ new Map();
        for (let i = 0; i < token; i++) {
          map2.set(read(), read());
        }
        return map2;
      }
    } else {
      token -= 144;
      let array = new Array(token);
      for (let i = 0; i < token; i++) {
        array[i] = read();
      }
      if (currentUnpackr.freezeData)
        return Object.freeze(array);
      return array;
    }
  } else if (token < 192) {
    let length = token - 160;
    if (srcStringEnd >= position) {
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
    }
    if (srcStringEnd == 0 && srcEnd < 140) {
      let string2 = length < 16 ? shortStringInJS(length) : longStringInJS(length);
      if (string2 != null)
        return string2;
    }
    return readFixedString(length);
  } else {
    let value;
    switch (token) {
      case 192:
        return null;
      case 193:
        if (bundledStrings) {
          value = read();
          if (value > 0)
            return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
          else
            return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 -= value);
        }
        return C1;
      // "never-used", return special object to denote that
      case 194:
        return false;
      case 195:
        return true;
      case 196:
        value = src[position++];
        if (value === void 0)
          throw new Error("Unexpected end of buffer");
        return readBin(value);
      case 197:
        value = dataView.getUint16(position);
        position += 2;
        return readBin(value);
      case 198:
        value = dataView.getUint32(position);
        position += 4;
        return readBin(value);
      case 199:
        return readExt(src[position++]);
      case 200:
        value = dataView.getUint16(position);
        position += 2;
        return readExt(value);
      case 201:
        value = dataView.getUint32(position);
        position += 4;
        return readExt(value);
      case 202:
        value = dataView.getFloat32(position);
        if (currentUnpackr.useFloat32 > 2) {
          let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
          position += 4;
          return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
        }
        position += 4;
        return value;
      case 203:
        value = dataView.getFloat64(position);
        position += 8;
        return value;
      // uint handlers
      case 204:
        return src[position++];
      case 205:
        value = dataView.getUint16(position);
        position += 2;
        return value;
      case 206:
        value = dataView.getUint32(position);
        position += 4;
        return value;
      case 207:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getUint32(position) * 4294967296;
          value += dataView.getUint32(position + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigUint64(position).toString();
        } else if (currentUnpackr.int64AsType === "auto") {
          value = dataView.getBigUint64(position);
          if (value <= BigInt(2) << BigInt(52)) value = Number(value);
        } else
          value = dataView.getBigUint64(position);
        position += 8;
        return value;
      // int handlers
      case 208:
        return dataView.getInt8(position++);
      case 209:
        value = dataView.getInt16(position);
        position += 2;
        return value;
      case 210:
        value = dataView.getInt32(position);
        position += 4;
        return value;
      case 211:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getInt32(position) * 4294967296;
          value += dataView.getUint32(position + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigInt64(position).toString();
        } else if (currentUnpackr.int64AsType === "auto") {
          value = dataView.getBigInt64(position);
          if (value >= BigInt(-2) << BigInt(52) && value <= BigInt(2) << BigInt(52)) value = Number(value);
        } else
          value = dataView.getBigInt64(position);
        position += 8;
        return value;
      case 212:
        value = src[position++];
        if (value == 114) {
          return recordDefinition(src[position++] & 63);
        } else {
          let extension2 = currentExtensions[value];
          if (extension2) {
            if (extension2.read) {
              position++;
              return extension2.read(read());
            } else if (extension2.noBuffer) {
              position++;
              return extension2();
            } else
              return extension2(src.subarray(position, ++position));
          } else
            throw new Error("Unknown extension " + value);
        }
      case 213:
        value = src[position];
        if (value == 114) {
          position++;
          return recordDefinition(src[position++] & 63, src[position++]);
        } else
          return readExt(2);
      case 214:
        return readExt(4);
      case 215:
        return readExt(8);
      case 216:
        return readExt(16);
      case 217:
        value = src[position++];
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString8(value);
      case 218:
        value = dataView.getUint16(position);
        position += 2;
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString16(value);
      case 219:
        value = dataView.getUint32(position);
        position += 4;
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString32(value);
      case 220:
        value = dataView.getUint16(position);
        position += 2;
        return readArray(value);
      case 221:
        value = dataView.getUint32(position);
        position += 4;
        return readArray(value);
      case 222:
        value = dataView.getUint16(position);
        position += 2;
        return readMap(value);
      case 223:
        value = dataView.getUint32(position);
        position += 4;
        return readMap(value);
      default:
        if (token >= 224)
          return token - 256;
        if (token === void 0) {
          let error = new Error("Unexpected end of MessagePack data");
          error.incomplete = true;
          throw error;
        }
        throw new Error("Unknown MessagePack token " + token);
    }
  }
}
var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure, firstId) {
  function readObject() {
    if (readObject.count++ > inlineObjectReadThreshold) {
      let readObject2 = structure.read = new Function("r", "return function(){return " + (currentUnpackr.freezeData ? "Object.freeze" : "") + "({" + structure.map((key) => key === "__proto__" ? "__proto_:r()" : validName.test(key) ? key + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "})}")(read);
      if (structure.highByte === 0)
        structure.read = createSecondByteReader(firstId, structure.read);
      return readObject2();
    }
    let object = {};
    for (let i = 0, l = structure.length; i < l; i++) {
      let key = structure[i];
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    if (currentUnpackr.freezeData)
      return Object.freeze(object);
    return object;
  }
  readObject.count = 0;
  if (structure.highByte === 0) {
    return createSecondByteReader(firstId, readObject);
  }
  return readObject;
}
var createSecondByteReader = (firstId, read0) => {
  return function() {
    let highByte = src[position++];
    if (highByte === 0)
      return read0();
    let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
    let structure = currentStructures[id] || loadStructures()[id];
    if (!structure) {
      throw new Error("Record id is not defined for " + id);
    }
    if (!structure.read)
      structure.read = createStructureReader(structure, firstId);
    return structure.read();
  };
};
function loadStructures() {
  let loadedStructures = saveState(() => {
    src = null;
    return currentUnpackr.getStructures();
  });
  return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures);
}
var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;
var isNativeAccelerationEnabled = false;
function setExtractor(extractStrings) {
  isNativeAccelerationEnabled = true;
  readFixedString = readString2(1);
  readString8 = readString2(2);
  readString16 = readString2(3);
  readString32 = readString2(5);
  function readString2(headerLength) {
    return function readString3(length) {
      let string2 = strings[stringPosition++];
      if (string2 == null) {
        if (bundledStrings)
          return readStringJS(length);
        let byteOffset = src.byteOffset;
        let extraction = extractStrings(position - headerLength + byteOffset, srcEnd + byteOffset, src.buffer);
        if (typeof extraction == "string") {
          string2 = extraction;
          strings = EMPTY_ARRAY;
        } else {
          strings = extraction;
          stringPosition = 1;
          srcStringEnd = 1;
          string2 = strings[0];
          if (string2 === void 0)
            throw new Error("Unexpected end of buffer");
        }
      }
      let srcStringLength = string2.length;
      if (srcStringLength <= length) {
        position += length;
        return string2;
      }
      srcString = string2;
      srcStringStart = position;
      srcStringEnd = position + srcStringLength;
      position += length;
      return string2.slice(0, length);
    };
  }
}
function readStringJS(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = "";
  while (position < end) {
    const byte1 = src[position++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const byte4 = src[position++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
}
function readString(source, start, length) {
  let existingSrc = src;
  src = source;
  position = start;
  try {
    return readStringJS(length);
  } finally {
    src = existingSrc;
  }
}
function readArray(length) {
  let array = new Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = read();
  }
  if (currentUnpackr.freezeData)
    return Object.freeze(array);
  return array;
}
function readMap(length) {
  if (currentUnpackr.mapsAsObjects) {
    let object = {};
    for (let i = 0; i < length; i++) {
      let key = readKey();
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    return object;
  } else {
    let map2 = /* @__PURE__ */ new Map();
    for (let i = 0; i < length; i++) {
      map2.set(read(), read());
    }
    return map2;
  }
}
var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
  let start = position;
  let bytes = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = src[position++];
    if ((byte & 128) > 0) {
      position = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
}
function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a = src[position++];
        if ((a & 128) > 1) {
          position -= 1;
          return;
        }
        return fromCharCode(a);
      }
    } else {
      let a = src[position++];
      let b = src[position++];
      if ((a & 128) > 0 || (b & 128) > 0) {
        position -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a, b);
      let c = src[position++];
      if ((c & 128) > 0) {
        position -= 3;
        return;
      }
      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position++];
    let b = src[position++];
    let c = src[position++];
    let d = src[position++];
    if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
      position -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a, b, c, d);
      else {
        let e = src[position++];
        if ((e & 128) > 0) {
          position -= 5;
          return;
        }
        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position++];
      let f = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0) {
        position -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a, b, c, d, e, f);
      let g = src[position++];
      if ((g & 128) > 0) {
        position -= 7;
        return;
      }
      return fromCharCode(a, b, c, d, e, f, g);
    } else {
      let e = src[position++];
      let f = src[position++];
      let g = src[position++];
      let h = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
        position -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a, b, c, d, e, f, g, h);
        else {
          let i = src[position++];
          if ((i & 128) > 0) {
            position -= 9;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0) {
          position -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a, b, c, d, e, f, g, h, i, j);
        let k = src[position++];
        if ((k & 128) > 0) {
          position -= 11;
          return;
        }
        return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
      } else {
        let i = src[position++];
        let j = src[position++];
        let k = src[position++];
        let l = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
          position -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
          else {
            let m = src[position++];
            if ((m & 128) > 0) {
              position -= 13;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position++];
          let n = src[position++];
          if ((m & 128) > 0 || (n & 128) > 0) {
            position -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
          let o = src[position++];
          if ((o & 128) > 0) {
            position -= 15;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
}
function readOnlyJSString() {
  let token = src[position++];
  let length;
  if (token < 192) {
    length = token - 160;
  } else {
    switch (token) {
      case 217:
        length = src[position++];
        break;
      case 218:
        length = dataView.getUint16(position);
        position += 2;
        break;
      case 219:
        length = dataView.getUint32(position);
        position += 4;
        break;
      default:
        throw new Error("Expected string");
    }
  }
  return readStringJS(length);
}
function readBin(length) {
  return currentUnpackr.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(src, position, position += length)
  ) : src.subarray(position, position += length);
}
function readExt(length) {
  let type2 = src[position++];
  if (currentExtensions[type2]) {
    let end;
    return currentExtensions[type2](src.subarray(position, end = position += length), (readPosition) => {
      position = readPosition;
      try {
        return read();
      } finally {
        position = end;
      }
    });
  } else
    throw new Error("Unknown extension type " + type2);
}
var keyCache = new Array(4096);
function readKey() {
  let length = src[position++];
  if (length >= 160 && length < 192) {
    length = length - 160;
    if (srcStringEnd >= position)
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
    else if (!(srcStringEnd == 0 && srcEnd < 180))
      return readFixedString(length);
  } else {
    position--;
    return asSafeString(read());
  }
  let key = (length << 5 ^ (length > 1 ? dataView.getUint16(position) : length > 0 ? src[position] : 0)) & 4095;
  let entry = keyCache[key];
  let checkPosition = position;
  let end = position + length - 3;
  let chunk;
  let i = 0;
  if (entry && entry.bytes == length) {
    while (checkPosition < end) {
      chunk = dataView.getUint32(checkPosition);
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
      checkPosition += 4;
    }
    end += 3;
    while (checkPosition < end) {
      chunk = src[checkPosition++];
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
    }
    if (checkPosition === end) {
      position = checkPosition;
      return entry.string;
    }
    end -= 3;
    checkPosition = position;
  }
  entry = [];
  keyCache[key] = entry;
  entry.bytes = length;
  while (checkPosition < end) {
    chunk = dataView.getUint32(checkPosition);
    entry.push(chunk);
    checkPosition += 4;
  }
  end += 3;
  while (checkPosition < end) {
    chunk = src[checkPosition++];
    entry.push(chunk);
  }
  let string2 = length < 16 ? shortStringInJS(length) : longStringInJS(length);
  if (string2 != null)
    return entry.string = string2;
  return entry.string = readFixedString(length);
}
function asSafeString(property) {
  if (typeof property === "string") return property;
  if (typeof property === "number" || typeof property === "boolean" || typeof property === "bigint") return property.toString();
  if (property == null) return property + "";
  if (currentUnpackr.allowArraysInMapKeys && Array.isArray(property) && property.flat().every((item) => ["string", "number", "boolean", "bigint"].includes(typeof item))) {
    return property.flat().toString();
  }
  throw new Error(`Invalid property type for record: ${typeof property}`);
}
var recordDefinition = (id, highByte) => {
  let structure = read().map(asSafeString);
  let firstByte = id;
  if (highByte !== void 0) {
    id = id < 32 ? -((highByte << 5) + id) : (highByte << 5) + id;
    structure.highByte = highByte;
  }
  let existingStructure = currentStructures[id];
  if (existingStructure && (existingStructure.isShared || sequentialMode)) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }
  currentStructures[id] = structure;
  structure.read = createStructureReader(structure, firstByte);
  return structure.read();
};
currentExtensions[0] = () => {
};
currentExtensions[0].noBuffer = true;
currentExtensions[66] = (data) => {
  let length = data.length;
  let value = BigInt(data[0] & 128 ? data[0] - 256 : data[0]);
  for (let i = 1; i < length; i++) {
    value <<= BigInt(8);
    value += BigInt(data[i]);
  }
  return value;
};
var errors = { Error, TypeError, ReferenceError };
currentExtensions[101] = () => {
  let data = read();
  return (errors[data[0]] || Error)(data[1], { cause: data[2] });
};
currentExtensions[105] = (data) => {
  if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
  let id = dataView.getUint32(position - 4);
  if (!referenceMap)
    referenceMap = /* @__PURE__ */ new Map();
  let token = src[position];
  let target2;
  if (token >= 144 && token < 160 || token == 220 || token == 221)
    target2 = [];
  else
    target2 = {};
  let refEntry = { target: target2 };
  referenceMap.set(id, refEntry);
  let targetProperties = read();
  if (refEntry.used)
    return Object.assign(target2, targetProperties);
  refEntry.target = targetProperties;
  return targetProperties;
};
currentExtensions[112] = (data) => {
  if (currentUnpackr.structuredClone === false) throw new Error("Structured clone extension is disabled");
  let id = dataView.getUint32(position - 4);
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};
currentExtensions[115] = () => new Set(read());
var typedArrays = ["Int8", "Uint8", "Uint8Clamped", "Int16", "Uint16", "Int32", "Uint32", "Float32", "Float64", "BigInt64", "BigUint64"].map((type2) => type2 + "Array");
var glbl = typeof globalThis === "object" ? globalThis : window;
currentExtensions[116] = (data) => {
  let typeCode = data[0];
  let typedArrayName = typedArrays[typeCode];
  if (!typedArrayName) {
    if (typeCode === 16) {
      let ab = new ArrayBuffer(data.length - 1);
      let u8 = new Uint8Array(ab);
      u8.set(data.subarray(1));
      return ab;
    }
    throw new Error("Could not find typed array for code " + typeCode);
  }
  return new glbl[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer);
};
currentExtensions[120] = () => {
  let data = read();
  return new RegExp(data[0], data[1]);
};
var TEMP_BUNDLE = [];
currentExtensions[98] = (data) => {
  let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
  let dataPosition = position;
  position += dataSize - data.length;
  bundledStrings = TEMP_BUNDLE;
  bundledStrings = [readOnlyJSString(), readOnlyJSString()];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
};
currentExtensions[255] = (data) => {
  if (data.length == 4)
    return new Date((data[0] * 16777216 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1e3);
  else if (data.length == 8)
    return new Date(
      ((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1e6 + ((data[3] & 3) * 4294967296 + data[4] * 16777216 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1e3
    );
  else if (data.length == 12)
    return new Date(
      ((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1e6 + ((data[4] & 128 ? -281474976710656 : 0) + data[6] * 1099511627776 + data[7] * 4294967296 + data[8] * 16777216 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1e3
    );
  else
    return /* @__PURE__ */ new Date("invalid");
};
function saveState(callback) {
  if (onSaveState)
    onSaveState();
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedStringPosition = stringPosition;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedStrings = strings;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
  let savedPackr = currentUnpackr;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  stringPosition = savedStringPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  strings = savedStrings;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
  currentUnpackr = savedPackr;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
var mult10 = new Array(147);
for (let i = 0; i < 256; i++) {
  mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
}
var defaultUnpackr = new Unpackr({ useRecords: false });
var unpack = defaultUnpackr.unpack;
var unpackMultiple = defaultUnpackr.unpackMultiple;
var decode = defaultUnpackr.unpack;
var FLOAT32_OPTIONS = {
  NEVER: 0,
  ALWAYS: 1,
  DECIMAL_ROUND: 3,
  DECIMAL_FIT: 4
};
var f32Array = new Float32Array(1);
var u8Array = new Uint8Array(f32Array.buffer, 0, 4);
function setReadStruct(updatedReadStruct, loadedStructs, saveState3) {
  readStruct = updatedReadStruct;
  onLoadedStructures = loadedStructs;
  onSaveState = saveState3;
}

// node_modules/@colyseus/msgpackr/pack.js
var textEncoder;
try {
  textEncoder = new TextEncoder();
} catch (error) {
}
var extensions;
var extensionClasses;
var hasNodeBuffer = typeof Buffer !== "undefined";
var ByteArrayAllocate = hasNodeBuffer ? function(length) {
  return Buffer.allocUnsafeSlow(length);
} : Uint8Array;
var ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
var target;
var keysTarget;
var targetView;
var position2 = 0;
var safeEnd;
var bundledStrings2 = null;
var writeStructSlots;
var MAX_BUNDLE_SIZE = 21760;
var hasNonLatin = /[\u0080-\uFFFF]/;
var RECORD_SYMBOL = /* @__PURE__ */ Symbol("record-id");
var Packr = class extends Unpackr {
  constructor(options) {
    super(options);
    this.offset = 0;
    let typeBuffer;
    let start;
    let hasSharedUpdate;
    let structures;
    let referenceMap2;
    let encodeUtf82 = ByteArray.prototype.utf8Write ? function(string2, position3) {
      return target.utf8Write(string2, position3, target.byteLength - position3);
    } : textEncoder && textEncoder.encodeInto ? function(string2, position3) {
      return textEncoder.encodeInto(string2, target.subarray(position3)).written;
    } : false;
    let packr2 = this;
    if (!options)
      options = {};
    let isSequential = options && options.sequential;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null)
      maxSharedStructures = hasSharedStructures ? 32 : 0;
    if (maxSharedStructures > 8160)
      throw new Error("Maximum maxSharedStructure is 8160");
    if (options.structuredClone && options.moreTypes == void 0) {
      this.moreTypes = true;
    }
    let maxOwnStructures = options.maxOwnStructures;
    if (maxOwnStructures == null)
      maxOwnStructures = hasSharedStructures ? 32 : 64;
    if (!this.structures && options.useRecords != false)
      this.structures = [];
    let useTwoByteRecords = maxSharedStructures > 32 || maxOwnStructures + maxSharedStructures > 64;
    let sharedLimitId = maxSharedStructures + 64;
    let maxStructureId = maxSharedStructures + maxOwnStructures + 64;
    if (maxStructureId > 8256) {
      throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");
    }
    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;
    this.pack = this.encode = function(value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, 8192));
        position2 = 0;
      }
      safeEnd = target.length - 10;
      if (safeEnd - position2 < 2048) {
        target = new ByteArrayAllocate(target.length);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, target.length));
        safeEnd = target.length - 10;
        position2 = 0;
      } else
        position2 = position2 + 7 & 2147483640;
      start = position2;
      if (encodeOptions & RESERVE_START_SPACE) position2 += encodeOptions & 255;
      referenceMap2 = packr2.structuredClone ? /* @__PURE__ */ new Map() : null;
      if (packr2.bundleStrings && typeof value !== "string") {
        bundledStrings2 = [];
        bundledStrings2.size = Infinity;
      } else
        bundledStrings2 = null;
      structures = packr2.structures;
      if (structures) {
        if (structures.uninitialized)
          structures = packr2._mergeStructures(packr2.getStructures());
        let sharedLength = structures.sharedLength || 0;
        if (sharedLength > maxSharedStructures) {
          throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to " + structures.sharedLength);
        }
        if (!structures.transitions) {
          structures.transitions = /* @__PURE__ */ Object.create(null);
          for (let i = 0; i < sharedLength; i++) {
            let keys = structures[i];
            if (!keys)
              continue;
            let nextTransition, transition = structures.transitions;
            for (let j = 0, l = keys.length; j < l; j++) {
              let key = keys[j];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              }
              transition = nextTransition;
            }
            transition[RECORD_SYMBOL] = i + 64;
          }
          this.lastNamedStructuresLength = sharedLength;
        }
        if (!isSequential) {
          structures.nextId = sharedLength + 64;
        }
      }
      if (hasSharedUpdate)
        hasSharedUpdate = false;
      let encodingError;
      try {
        if (packr2.randomAccessStructure && value && value.constructor && value.constructor === Object)
          writeStruct2(value);
        else
          pack2(value);
        let lastBundle = bundledStrings2;
        if (bundledStrings2)
          writeBundles(start, pack2, 0);
        if (referenceMap2 && referenceMap2.idsToInsert) {
          let idsToInsert = referenceMap2.idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
          let i = idsToInsert.length;
          let incrementPosition = -1;
          while (lastBundle && i > 0) {
            let insertionPoint = idsToInsert[--i].offset + start;
            if (insertionPoint < lastBundle.stringsPosition + start && incrementPosition === -1)
              incrementPosition = 0;
            if (insertionPoint > lastBundle.position + start) {
              if (incrementPosition >= 0)
                incrementPosition += 6;
            } else {
              if (incrementPosition >= 0) {
                targetView.setUint32(
                  lastBundle.position + start,
                  targetView.getUint32(lastBundle.position + start) + incrementPosition
                );
                incrementPosition = -1;
              }
              lastBundle = lastBundle.previous;
              i++;
            }
          }
          if (incrementPosition >= 0 && lastBundle) {
            targetView.setUint32(
              lastBundle.position + start,
              targetView.getUint32(lastBundle.position + start) + incrementPosition
            );
          }
          position2 += idsToInsert.length * 6;
          if (position2 > safeEnd)
            makeRoom(position2);
          packr2.offset = position2;
          let serialized = insertIds(target.subarray(start, position2), idsToInsert);
          referenceMap2 = null;
          return serialized;
        }
        packr2.offset = position2;
        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position2;
          return target;
        }
        return target.subarray(start, position2);
      } catch (error) {
        encodingError = error;
        throw error;
      } finally {
        if (structures) {
          resetStructures();
          if (hasSharedUpdate && packr2.saveStructures) {
            let sharedLength = structures.sharedLength || 0;
            let returnBuffer = target.subarray(start, position2);
            let newSharedData = prepareStructures(structures, packr2);
            if (!encodingError) {
              if (packr2.saveStructures(newSharedData, newSharedData.isCompatible) === false) {
                return packr2.pack(value, encodeOptions);
              }
              packr2.lastNamedStructuresLength = sharedLength;
              if (target.length > 1073741824) target = null;
              return returnBuffer;
            }
          }
        }
        if (target.length > 1073741824) target = null;
        if (encodeOptions & RESET_BUFFER_MODE)
          position2 = start;
      }
    };
    const resetStructures = () => {
      if (serializationsSinceTransitionRebuild < 10)
        serializationsSinceTransitionRebuild++;
      let sharedLength = structures.sharedLength || 0;
      if (structures.length > sharedLength && !isSequential)
        structures.length = sharedLength;
      if (transitionsCount > 1e4) {
        structures.transitions = null;
        serializationsSinceTransitionRebuild = 0;
        transitionsCount = 0;
        if (recordIdsToRemove.length > 0)
          recordIdsToRemove = [];
      } else if (recordIdsToRemove.length > 0 && !isSequential) {
        for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
          recordIdsToRemove[i][RECORD_SYMBOL] = 0;
        }
        recordIdsToRemove = [];
      }
    };
    const packArray = (value) => {
      var length = value.length;
      if (length < 16) {
        target[position2++] = 144 | length;
      } else if (length < 65536) {
        target[position2++] = 220;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 221;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      for (let i = 0; i < length; i++) {
        pack2(value[i]);
      }
    };
    const pack2 = (value) => {
      if (position2 > safeEnd)
        target = makeRoom(position2);
      var type2 = typeof value;
      var length;
      if (type2 === "string") {
        let strLength = value.length;
        if (bundledStrings2 && strLength >= 4 && strLength < 4096) {
          if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
            if (position2 + maxBytes2 > safeEnd)
              target = makeRoom(position2 + maxBytes2);
            let lastBundle;
            if (bundledStrings2.position) {
              lastBundle = bundledStrings2;
              target[position2] = 200;
              position2 += 3;
              target[position2++] = 98;
              extStart = position2 - start;
              position2 += 4;
              writeBundles(start, pack2, 0);
              targetView.setUint16(extStart + start - 3, position2 - start - extStart);
            } else {
              target[position2++] = 214;
              target[position2++] = 98;
              extStart = position2 - start;
              position2 += 4;
            }
            bundledStrings2 = ["", ""];
            bundledStrings2.previous = lastBundle;
            bundledStrings2.size = 0;
            bundledStrings2.position = extStart;
          }
          let twoByte = hasNonLatin.test(value);
          bundledStrings2[twoByte ? 0 : 1] += value;
          target[position2++] = 193;
          pack2(twoByte ? -strLength : strLength);
          return;
        }
        let headerSize;
        if (strLength < 32) {
          headerSize = 1;
        } else if (strLength < 256) {
          headerSize = 2;
        } else if (strLength < 65536) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }
        let maxBytes = strLength * 3;
        if (position2 + maxBytes > safeEnd)
          target = makeRoom(position2 + maxBytes);
        if (strLength < 64 || !encodeUtf82) {
          let i, c1, c2, strPosition = position2 + headerSize;
          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target[strPosition++] = c1;
            } else if (c1 < 2048) {
              target[strPosition++] = c1 >> 6 | 192;
              target[strPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              target[strPosition++] = c1 >> 18 | 240;
              target[strPosition++] = c1 >> 12 & 63 | 128;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            } else {
              target[strPosition++] = c1 >> 12 | 224;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            }
          }
          length = strPosition - position2 - headerSize;
        } else {
          length = encodeUtf82(value, position2 + headerSize);
        }
        if (length < 32) {
          target[position2++] = 160 | length;
        } else if (length < 256) {
          if (headerSize < 2) {
            target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
          }
          target[position2++] = 217;
          target[position2++] = length;
        } else if (length < 65536) {
          if (headerSize < 3) {
            target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
          }
          target[position2++] = 218;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
          }
          target[position2++] = 219;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        position2 += length;
      } else if (type2 === "number") {
        if (value >>> 0 === value) {
          if (value < 32 || value < 128 && this.useRecords === false || value < 64 && !this.randomAccessStructure) {
            target[position2++] = value;
          } else if (value < 256) {
            target[position2++] = 204;
            target[position2++] = value;
          } else if (value < 65536) {
            target[position2++] = 205;
            target[position2++] = value >> 8;
            target[position2++] = value & 255;
          } else {
            target[position2++] = 206;
            targetView.setUint32(position2, value);
            position2 += 4;
          }
        } else if (value >> 0 === value) {
          if (value >= -32) {
            target[position2++] = 256 + value;
          } else if (value >= -128) {
            target[position2++] = 208;
            target[position2++] = value + 256;
          } else if (value >= -32768) {
            target[position2++] = 209;
            targetView.setInt16(position2, value);
            position2 += 2;
          } else {
            target[position2++] = 210;
            targetView.setInt32(position2, value);
            position2 += 4;
          }
        } else {
          let useFloat32;
          if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
            target[position2++] = 202;
            targetView.setFloat32(position2, value);
            let xShifted;
            if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
              position2 += 4;
              return;
            } else
              position2--;
          }
          target[position2++] = 203;
          targetView.setFloat64(position2, value);
          position2 += 8;
        }
      } else if (type2 === "object" || type2 === "function") {
        if (!value)
          target[position2++] = 192;
        else {
          if (referenceMap2) {
            let referee = referenceMap2.get(value);
            if (referee) {
              if (!referee.id) {
                let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                referee.id = idsToInsert.push(referee);
              }
              target[position2++] = 214;
              target[position2++] = 112;
              targetView.setUint32(position2, referee.id);
              position2 += 4;
              return;
            } else
              referenceMap2.set(value, { offset: position2 - start });
          }
          let constructor = value.constructor;
          if (constructor === Object) {
            writeObject(value);
          } else if (constructor === Array) {
            packArray(value);
          } else if (constructor === Map) {
            if (this.mapAsEmptyObject) target[position2++] = 128;
            else {
              length = value.size;
              if (length < 16) {
                target[position2++] = 128 | length;
              } else if (length < 65536) {
                target[position2++] = 222;
                target[position2++] = length >> 8;
                target[position2++] = length & 255;
              } else {
                target[position2++] = 223;
                targetView.setUint32(position2, length);
                position2 += 4;
              }
              for (let [key, entryValue] of value) {
                pack2(key);
                pack2(entryValue);
              }
            }
          } else {
            for (let i = 0, l = extensions.length; i < l; i++) {
              let extensionClass = extensionClasses[i];
              if (value instanceof extensionClass) {
                let extension2 = extensions[i];
                if (extension2.write) {
                  if (extension2.type) {
                    target[position2++] = 212;
                    target[position2++] = extension2.type;
                    target[position2++] = 0;
                  }
                  let writeResult = extension2.write.call(this, value);
                  if (writeResult === value) {
                    if (Array.isArray(value)) {
                      packArray(value);
                    } else {
                      writeObject(value);
                    }
                  } else {
                    pack2(writeResult);
                  }
                  return;
                }
                let currentTarget = target;
                let currentTargetView = targetView;
                let currentPosition = position2;
                target = null;
                let result;
                try {
                  result = extension2.pack.call(this, value, (size) => {
                    target = currentTarget;
                    currentTarget = null;
                    position2 += size;
                    if (position2 > safeEnd)
                      makeRoom(position2);
                    return {
                      target,
                      targetView,
                      position: position2 - size
                    };
                  }, pack2);
                } finally {
                  if (currentTarget) {
                    target = currentTarget;
                    targetView = currentTargetView;
                    position2 = currentPosition;
                    safeEnd = target.length - 10;
                  }
                }
                if (result) {
                  if (result.length + position2 > safeEnd)
                    makeRoom(result.length + position2);
                  position2 = writeExtensionData(result, target, position2, extension2.type);
                }
                return;
              }
            }
            if (Array.isArray(value)) {
              packArray(value);
            } else {
              if (value.toJSON) {
                const json = value.toJSON();
                if (json !== value)
                  return pack2(json);
              }
              if (type2 === "function")
                return pack2(this.writeFunction && this.writeFunction(value));
              writeObject(value);
            }
          }
        }
      } else if (type2 === "boolean") {
        target[position2++] = value ? 195 : 194;
      } else if (type2 === "bigint") {
        if (value < BigInt(1) << BigInt(63) && value >= -(BigInt(1) << BigInt(63))) {
          target[position2++] = 211;
          targetView.setBigInt64(position2, value);
        } else if (value < BigInt(1) << BigInt(64) && value > 0) {
          target[position2++] = 207;
          targetView.setBigUint64(position2, value);
        } else {
          if (this.largeBigIntToFloat) {
            target[position2++] = 203;
            targetView.setFloat64(position2, Number(value));
          } else if (this.largeBigIntToString) {
            return pack2(value.toString());
          } else if (this.useBigIntExtension && value < BigInt(2) ** BigInt(1023) && value > -(BigInt(2) ** BigInt(1023))) {
            target[position2++] = 199;
            position2++;
            target[position2++] = 66;
            let bytes = [];
            let alignedSign;
            do {
              let byte = value & BigInt(255);
              alignedSign = (byte & BigInt(128)) === (value < BigInt(0) ? BigInt(128) : BigInt(0));
              bytes.push(byte);
              value >>= BigInt(8);
            } while (!((value === BigInt(0) || value === BigInt(-1)) && alignedSign));
            target[position2 - 2] = bytes.length;
            for (let i = bytes.length; i > 0; ) {
              target[position2++] = Number(bytes[--i]);
            }
            return;
          } else {
            throw new RangeError(value + " was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string");
          }
        }
        position2 += 8;
      } else if (type2 === "undefined") {
        if (this.encodeUndefinedAsNil)
          target[position2++] = 192;
        else {
          target[position2++] = 212;
          target[position2++] = 0;
          target[position2++] = 0;
        }
      } else {
        throw new Error("Unknown type: " + type2);
      }
    };
    const writePlainObject = this.variableMapSize || this.coercibleKeyAsNumber || this.skipValues ? (object) => {
      let keys;
      if (this.skipValues) {
        keys = [];
        for (let key2 in object) {
          if ((typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key2)) && !this.skipValues.includes(object[key2]))
            keys.push(key2);
        }
      } else {
        keys = Object.keys(object);
      }
      let length = keys.length;
      if (length < 16) {
        target[position2++] = 128 | length;
      } else if (length < 65536) {
        target[position2++] = 222;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 223;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      let key;
      if (this.coercibleKeyAsNumber) {
        for (let i = 0; i < length; i++) {
          key = keys[i];
          let num = Number(key);
          pack2(isNaN(num) ? key : num);
          pack2(object[key]);
        }
      } else {
        for (let i = 0; i < length; i++) {
          pack2(key = keys[i]);
          pack2(object[key]);
        }
      }
    } : (object) => {
      target[position2++] = 222;
      let objectOffset = position2 - start;
      position2 += 2;
      let size = 0;
      for (let key in object) {
        if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          pack2(key);
          pack2(object[key]);
          size++;
        }
      }
      if (size > 65535) {
        throw new Error('Object is too large to serialize with fast 16-bit map size, use the "variableMapSize" option to serialize this object');
      }
      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 255;
    };
    const writeRecord = this.useRecords === false ? writePlainObject : options.progressiveRecords && !useTwoByteRecords ? (
      // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
      (object) => {
        let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
        let objectOffset = position2++ - start;
        let wroteKeys;
        for (let key in object) {
          if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (nextTransition)
              transition = nextTransition;
            else {
              let keys = Object.keys(object);
              let lastTransition = transition;
              transition = structures.transitions;
              let newTransitions = 0;
              for (let i = 0, l = keys.length; i < l; i++) {
                let key2 = keys[i];
                nextTransition = transition[key2];
                if (!nextTransition) {
                  nextTransition = transition[key2] = /* @__PURE__ */ Object.create(null);
                  newTransitions++;
                }
                transition = nextTransition;
              }
              if (objectOffset + start + 1 == position2) {
                position2--;
                newRecord(transition, keys, newTransitions);
              } else
                insertNewRecord(transition, keys, objectOffset, newTransitions);
              wroteKeys = true;
              transition = lastTransition[key];
            }
            pack2(object[key]);
          }
        }
        if (!wroteKeys) {
          let recordId = transition[RECORD_SYMBOL];
          if (recordId)
            target[objectOffset + start] = recordId;
          else
            insertNewRecord(transition, Object.keys(object), objectOffset, 0);
        }
      }
    ) : (object) => {
      let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
      let newTransitions = 0;
      for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
        nextTransition = transition[key];
        if (!nextTransition) {
          nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
          newTransitions++;
        }
        transition = nextTransition;
      }
      let recordId = transition[RECORD_SYMBOL];
      if (recordId) {
        if (recordId >= 96 && useTwoByteRecords) {
          target[position2++] = ((recordId -= 96) & 31) + 96;
          target[position2++] = recordId >> 5;
        } else
          target[position2++] = recordId;
      } else {
        newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
      }
      for (let key in object)
        if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          pack2(object[key]);
        }
    };
    const checkUseRecords = typeof this.useRecords == "function" && this.useRecords;
    const writeObject = checkUseRecords ? (object) => {
      checkUseRecords(object) ? writeRecord(object) : writePlainObject(object);
    } : writeRecord;
    const makeRoom = (end) => {
      let newSize;
      if (end > 16777216) {
        if (end - start > MAX_BUFFER_SIZE)
          throw new Error("Packed buffer would be larger than maximum buffer size");
        newSize = Math.min(
          MAX_BUFFER_SIZE,
          Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
        );
      } else
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = newBuffer.dataView || (newBuffer.dataView = new DataView(newBuffer.buffer, 0, newSize));
      end = Math.min(end, target.length);
      if (target.copy)
        target.copy(newBuffer, 0, start, end);
      else
        newBuffer.set(target.slice(start, end));
      position2 -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    };
    const newRecord = (transition, keys, newTransitions) => {
      let recordId = structures.nextId;
      if (!recordId)
        recordId = 64;
      if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
        recordId = structures.nextOwnId;
        if (!(recordId < maxStructureId))
          recordId = sharedLimitId;
        structures.nextOwnId = recordId + 1;
      } else {
        if (recordId >= maxStructureId)
          recordId = sharedLimitId;
        structures.nextId = recordId + 1;
      }
      let highByte = keys.highByte = recordId >= 96 && useTwoByteRecords ? recordId - 96 >> 5 : -1;
      transition[RECORD_SYMBOL] = recordId;
      transition.__keys__ = keys;
      structures[recordId - 64] = keys;
      if (recordId < sharedLimitId) {
        keys.isShared = true;
        structures.sharedLength = recordId - 63;
        hasSharedUpdate = true;
        if (highByte >= 0) {
          target[position2++] = (recordId & 31) + 96;
          target[position2++] = highByte;
        } else {
          target[position2++] = recordId;
        }
      } else {
        if (highByte >= 0) {
          target[position2++] = 213;
          target[position2++] = 114;
          target[position2++] = (recordId & 31) + 96;
          target[position2++] = highByte;
        } else {
          target[position2++] = 212;
          target[position2++] = 114;
          target[position2++] = recordId;
        }
        if (newTransitions)
          transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
        if (recordIdsToRemove.length >= maxOwnStructures)
          recordIdsToRemove.shift()[RECORD_SYMBOL] = 0;
        recordIdsToRemove.push(transition);
        pack2(keys);
      }
    };
    const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
      let mainTarget = target;
      let mainPosition = position2;
      let mainSafeEnd = safeEnd;
      let mainStart = start;
      target = keysTarget;
      position2 = 0;
      start = 0;
      if (!target)
        keysTarget = target = new ByteArrayAllocate(8192);
      safeEnd = target.length - 10;
      newRecord(transition, keys, newTransitions);
      keysTarget = target;
      let keysPosition = position2;
      target = mainTarget;
      position2 = mainPosition;
      safeEnd = mainSafeEnd;
      start = mainStart;
      if (keysPosition > 1) {
        let newEnd = position2 + keysPosition - 1;
        if (newEnd > safeEnd)
          makeRoom(newEnd);
        let insertionPosition = insertionOffset + start;
        target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position2);
        target.set(keysTarget.slice(0, keysPosition), insertionPosition);
        position2 = newEnd;
      } else {
        target[insertionOffset + start] = keysTarget[0];
      }
    };
    const writeStruct2 = (object) => {
      let newPosition = writeStructSlots(object, target, start, position2, structures, makeRoom, (value, newPosition2, notifySharedUpdate) => {
        if (notifySharedUpdate)
          return hasSharedUpdate = true;
        position2 = newPosition2;
        let startTarget = target;
        pack2(value);
        resetStructures();
        if (startTarget !== target) {
          return { position: position2, targetView, target };
        }
        return position2;
      }, this);
      if (newPosition === 0)
        return writeObject(object);
      position2 = newPosition;
    };
  }
  useBuffer(buffer) {
    target = buffer;
    target.dataView || (target.dataView = new DataView(target.buffer, target.byteOffset, target.byteLength));
    targetView = target.dataView;
    position2 = 0;
  }
  set position(value) {
    position2 = value;
  }
  get position() {
    return position2;
  }
  set buffer(buffer) {
    target = buffer;
  }
  get buffer() {
    return target;
  }
  clearSharedData() {
    if (this.structures)
      this.structures = [];
    if (this.typedStructs)
      this.typedStructs = [];
  }
};
extensionClasses = [Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor, C1Type];
extensions = [{
  pack(date, allocateForWrite, pack2) {
    let seconds = date.getTime() / 1e3;
    if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(6);
      target2[position3++] = 214;
      target2[position3++] = 255;
      targetView2.setUint32(position3, seconds);
    } else if (seconds > 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(10);
      target2[position3++] = 215;
      target2[position3++] = 255;
      targetView2.setUint32(position3, date.getMilliseconds() * 4e6 + (seconds / 1e3 / 4294967296 >> 0));
      targetView2.setUint32(position3 + 4, seconds);
    } else if (isNaN(seconds)) {
      if (this.onInvalidDate) {
        allocateForWrite(0);
        return pack2(this.onInvalidDate());
      }
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(3);
      target2[position3++] = 212;
      target2[position3++] = 255;
      target2[position3++] = 255;
    } else {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(15);
      target2[position3++] = 199;
      target2[position3++] = 12;
      target2[position3++] = 255;
      targetView2.setUint32(position3, date.getMilliseconds() * 1e6);
      targetView2.setBigInt64(position3 + 4, BigInt(Math.floor(seconds)));
    }
  }
}, {
  pack(set, allocateForWrite, pack2) {
    if (this.setAsEmptyObject) {
      allocateForWrite(0);
      return pack2({});
    }
    let array = Array.from(set);
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 115;
      target2[position3++] = 0;
    }
    pack2(array);
  }
}, {
  pack(error, allocateForWrite, pack2) {
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 101;
      target2[position3++] = 0;
    }
    pack2([error.name, error.message, error.cause]);
  }
}, {
  pack(regex, allocateForWrite, pack2) {
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 120;
      target2[position3++] = 0;
    }
    pack2([regex.source, regex.flags]);
  }
}, {
  pack(arrayBuffer, allocateForWrite) {
    if (this.moreTypes)
      writeExtBuffer(arrayBuffer, 16, allocateForWrite);
    else
      writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
  }
}, {
  pack(typedArray, allocateForWrite) {
    let constructor = typedArray.constructor;
    if (constructor !== ByteArray && this.moreTypes)
      writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
    else
      writeBuffer(typedArray, allocateForWrite);
  }
}, {
  pack(c1, allocateForWrite) {
    let { target: target2, position: position3 } = allocateForWrite(1);
    target2[position3] = 193;
  }
}];
function writeExtBuffer(typedArray, type2, allocateForWrite, encode3) {
  let length = typedArray.byteLength;
  if (length + 1 < 256) {
    var { target: target2, position: position3 } = allocateForWrite(4 + length);
    target2[position3++] = 199;
    target2[position3++] = length + 1;
  } else if (length + 1 < 65536) {
    var { target: target2, position: position3 } = allocateForWrite(5 + length);
    target2[position3++] = 200;
    target2[position3++] = length + 1 >> 8;
    target2[position3++] = length + 1 & 255;
  } else {
    var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(7 + length);
    target2[position3++] = 201;
    targetView2.setUint32(position3, length + 1);
    position3 += 4;
  }
  target2[position3++] = 116;
  target2[position3++] = type2;
  if (!typedArray.buffer) typedArray = new Uint8Array(typedArray);
  target2.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position3);
}
function writeBuffer(buffer, allocateForWrite) {
  let length = buffer.byteLength;
  var target2, position3;
  if (length < 256) {
    var { target: target2, position: position3 } = allocateForWrite(length + 2);
    target2[position3++] = 196;
    target2[position3++] = length;
  } else if (length < 65536) {
    var { target: target2, position: position3 } = allocateForWrite(length + 3);
    target2[position3++] = 197;
    target2[position3++] = length >> 8;
    target2[position3++] = length & 255;
  } else {
    var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(length + 5);
    target2[position3++] = 198;
    targetView2.setUint32(position3, length);
    position3 += 4;
  }
  target2.set(buffer, position3);
}
function writeExtensionData(result, target2, position3, type2) {
  let length = result.length;
  switch (length) {
    case 1:
      target2[position3++] = 212;
      break;
    case 2:
      target2[position3++] = 213;
      break;
    case 4:
      target2[position3++] = 214;
      break;
    case 8:
      target2[position3++] = 215;
      break;
    case 16:
      target2[position3++] = 216;
      break;
    default:
      if (length < 256) {
        target2[position3++] = 199;
        target2[position3++] = length;
      } else if (length < 65536) {
        target2[position3++] = 200;
        target2[position3++] = length >> 8;
        target2[position3++] = length & 255;
      } else {
        target2[position3++] = 201;
        target2[position3++] = length >> 24;
        target2[position3++] = length >> 16 & 255;
        target2[position3++] = length >> 8 & 255;
        target2[position3++] = length & 255;
      }
  }
  target2[position3++] = type2;
  target2.set(result, position3);
  position3 += length;
  return position3;
}
function insertIds(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 6;
  let lastEnd = serialized.length - distanceToMove;
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    let id = nextId.id;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 6;
    let position3 = offset + distanceToMove;
    serialized[position3++] = 214;
    serialized[position3++] = 105;
    serialized[position3++] = id >> 24;
    serialized[position3++] = id >> 16 & 255;
    serialized[position3++] = id >> 8 & 255;
    serialized[position3++] = id & 255;
    lastEnd = offset;
  }
  return serialized;
}
function writeBundles(start, pack2, incrementPosition) {
  if (bundledStrings2.length > 0) {
    targetView.setUint32(bundledStrings2.position + start, position2 + incrementPosition - bundledStrings2.position - start);
    bundledStrings2.stringsPosition = position2 - start;
    let writeStrings = bundledStrings2;
    bundledStrings2 = null;
    pack2(writeStrings[0]);
    pack2(writeStrings[1]);
  }
}
function prepareStructures(structures, packr2) {
  structures.isCompatible = (existingStructures) => {
    let compatible = !existingStructures || (packr2.lastNamedStructuresLength || 0) === existingStructures.length;
    if (!compatible)
      packr2._mergeStructures(existingStructures);
    return compatible;
  };
  return structures;
}
function setWriteStructSlots(writeSlots, makeStructures) {
  writeStructSlots = writeSlots;
  prepareStructures = makeStructures;
}
var defaultPackr = new Packr({ useRecords: false });
var pack = defaultPackr.pack;
var encode = defaultPackr.pack;
var { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
var REUSE_BUFFER_MODE = 512;
var RESET_BUFFER_MODE = 1024;
var RESERVE_START_SPACE = 2048;

// node_modules/@colyseus/msgpackr/struct.js
var ASCII = 3;
var NUMBER = 0;
var UTF8 = 2;
var OBJECT_DATA = 1;
var DATE = 16;
var TYPE_NAMES = ["num", "object", "string", "ascii"];
TYPE_NAMES[DATE] = "date";
var float32Headers = [false, true, true, false, false, true, true, false];
var evalSupported;
try {
  new Function("");
  evalSupported = true;
} catch (error) {
}
var updatedPosition;
var hasNodeBuffer2 = typeof Buffer !== "undefined";
var textEncoder2;
var currentSource;
try {
  textEncoder2 = new TextEncoder();
} catch (error) {
}
var encodeUtf8 = hasNodeBuffer2 ? function(target2, string2, position3) {
  return target2.utf8Write(string2, position3, target2.byteLength - position3);
} : textEncoder2 && textEncoder2.encodeInto ? function(target2, string2, position3) {
  return textEncoder2.encodeInto(string2, target2.subarray(position3)).written;
} : false;
setWriteStructSlots(writeStruct, prepareStructures2);
function writeStruct(object, target2, encodingStart, position3, structures, makeRoom, pack2, packr2) {
  let typedStructs = packr2.typedStructs || (packr2.typedStructs = []);
  let targetView2 = target2.dataView;
  let refsStartPosition = (typedStructs.lastStringStart || 100) + position3;
  let safeEnd2 = target2.length - 10;
  let start = position3;
  if (position3 > safeEnd2) {
    target2 = makeRoom(position3);
    targetView2 = target2.dataView;
    position3 -= encodingStart;
    start -= encodingStart;
    refsStartPosition -= encodingStart;
    encodingStart = 0;
    safeEnd2 = target2.length - 10;
  }
  let refOffset, refPosition = refsStartPosition;
  let transition = typedStructs.transitions || (typedStructs.transitions = /* @__PURE__ */ Object.create(null));
  let nextId = typedStructs.nextId || typedStructs.length;
  let headerSize = nextId < 15 ? 1 : nextId < 240 ? 2 : nextId < 61440 ? 3 : nextId < 15728640 ? 4 : 0;
  if (headerSize === 0)
    return 0;
  position3 += headerSize;
  let queuedReferences = [];
  let usedAscii0;
  let keyIndex = 0;
  for (let key in object) {
    let value = object[key];
    let nextTransition = transition[key];
    if (!nextTransition) {
      transition[key] = nextTransition = {
        key,
        parent: transition,
        enumerationOffset: 0,
        ascii0: null,
        ascii8: null,
        num8: null,
        string16: null,
        object16: null,
        num32: null,
        float64: null,
        date64: null
      };
    }
    if (position3 > safeEnd2) {
      target2 = makeRoom(position3);
      targetView2 = target2.dataView;
      position3 -= encodingStart;
      start -= encodingStart;
      refsStartPosition -= encodingStart;
      refPosition -= encodingStart;
      encodingStart = 0;
      safeEnd2 = target2.length - 10;
    }
    switch (typeof value) {
      case "number":
        let number2 = value;
        if (nextId < 200 || !nextTransition.num64) {
          if (number2 >> 0 === number2 && number2 < 536870912 && number2 > -520093696) {
            if (number2 < 246 && number2 >= 0 && (nextTransition.num8 && !(nextId > 200 && nextTransition.num32) || number2 < 32 && !nextTransition.num32)) {
              transition = nextTransition.num8 || createTypeTransition(nextTransition, NUMBER, 1);
              target2[position3++] = number2;
            } else {
              transition = nextTransition.num32 || createTypeTransition(nextTransition, NUMBER, 4);
              targetView2.setUint32(position3, number2, true);
              position3 += 4;
            }
            break;
          } else if (number2 < 4294967296 && number2 >= -2147483648) {
            targetView2.setFloat32(position3, number2, true);
            if (float32Headers[target2[position3 + 3] >>> 5]) {
              let xShifted;
              if ((xShifted = number2 * mult10[(target2[position3 + 3] & 127) << 1 | target2[position3 + 2] >> 7]) >> 0 === xShifted) {
                transition = nextTransition.num32 || createTypeTransition(nextTransition, NUMBER, 4);
                position3 += 4;
                break;
              }
            }
          }
        }
        transition = nextTransition.num64 || createTypeTransition(nextTransition, NUMBER, 8);
        targetView2.setFloat64(position3, number2, true);
        position3 += 8;
        break;
      case "string":
        let strLength = value.length;
        refOffset = refPosition - refsStartPosition;
        if ((strLength << 2) + refPosition > safeEnd2) {
          target2 = makeRoom((strLength << 2) + refPosition);
          targetView2 = target2.dataView;
          position3 -= encodingStart;
          start -= encodingStart;
          refsStartPosition -= encodingStart;
          refPosition -= encodingStart;
          encodingStart = 0;
          safeEnd2 = target2.length - 10;
        }
        if (strLength > 65280 + refOffset >> 2) {
          queuedReferences.push(key, value, position3 - start);
          break;
        }
        let isNotAscii;
        let strStart = refPosition;
        if (strLength < 64) {
          let i, c1, c2;
          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target2[refPosition++] = c1;
            } else if (c1 < 2048) {
              isNotAscii = true;
              target2[refPosition++] = c1 >> 6 | 192;
              target2[refPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              isNotAscii = true;
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              target2[refPosition++] = c1 >> 18 | 240;
              target2[refPosition++] = c1 >> 12 & 63 | 128;
              target2[refPosition++] = c1 >> 6 & 63 | 128;
              target2[refPosition++] = c1 & 63 | 128;
            } else {
              isNotAscii = true;
              target2[refPosition++] = c1 >> 12 | 224;
              target2[refPosition++] = c1 >> 6 & 63 | 128;
              target2[refPosition++] = c1 & 63 | 128;
            }
          }
        } else {
          refPosition += encodeUtf8(target2, value, refPosition);
          isNotAscii = refPosition - strStart > strLength;
        }
        if (refOffset < 160 || refOffset < 246 && (nextTransition.ascii8 || nextTransition.string8)) {
          if (isNotAscii) {
            if (!(transition = nextTransition.string8)) {
              if (typedStructs.length > 10 && (transition = nextTransition.ascii8)) {
                transition.__type = UTF8;
                nextTransition.ascii8 = null;
                nextTransition.string8 = transition;
                pack2(null, 0, true);
              } else {
                transition = createTypeTransition(nextTransition, UTF8, 1);
              }
            }
          } else if (refOffset === 0 && !usedAscii0) {
            usedAscii0 = true;
            transition = nextTransition.ascii0 || createTypeTransition(nextTransition, ASCII, 0);
            break;
          } else if (!(transition = nextTransition.ascii8) && !(typedStructs.length > 10 && (transition = nextTransition.string8)))
            transition = createTypeTransition(nextTransition, ASCII, 1);
          target2[position3++] = refOffset;
        } else {
          transition = nextTransition.string16 || createTypeTransition(nextTransition, UTF8, 2);
          targetView2.setUint16(position3, refOffset, true);
          position3 += 2;
        }
        break;
      case "object":
        if (value) {
          if (value.constructor === Date) {
            transition = nextTransition.date64 || createTypeTransition(nextTransition, DATE, 8);
            targetView2.setFloat64(position3, value.getTime(), true);
            position3 += 8;
          } else {
            queuedReferences.push(key, value, keyIndex);
          }
          break;
        } else {
          nextTransition = anyType(nextTransition, position3, targetView2, -10);
          if (nextTransition) {
            transition = nextTransition;
            position3 = updatedPosition;
          } else queuedReferences.push(key, value, keyIndex);
        }
        break;
      case "boolean":
        transition = nextTransition.num8 || nextTransition.ascii8 || createTypeTransition(nextTransition, NUMBER, 1);
        target2[position3++] = value ? 249 : 248;
        break;
      case "undefined":
        nextTransition = anyType(nextTransition, position3, targetView2, -9);
        if (nextTransition) {
          transition = nextTransition;
          position3 = updatedPosition;
        } else queuedReferences.push(key, value, keyIndex);
        break;
      default:
        queuedReferences.push(key, value, keyIndex);
    }
    keyIndex++;
  }
  for (let i = 0, l = queuedReferences.length; i < l; ) {
    let key = queuedReferences[i++];
    let value = queuedReferences[i++];
    let propertyIndex = queuedReferences[i++];
    let nextTransition = transition[key];
    if (!nextTransition) {
      transition[key] = nextTransition = {
        key,
        parent: transition,
        enumerationOffset: propertyIndex - keyIndex,
        ascii0: null,
        ascii8: null,
        num8: null,
        string16: null,
        object16: null,
        num32: null,
        float64: null
      };
    }
    let newPosition;
    if (value) {
      let size;
      refOffset = refPosition - refsStartPosition;
      if (refOffset < 65280) {
        transition = nextTransition.object16;
        if (transition)
          size = 2;
        else if (transition = nextTransition.object32)
          size = 4;
        else {
          transition = createTypeTransition(nextTransition, OBJECT_DATA, 2);
          size = 2;
        }
      } else {
        transition = nextTransition.object32 || createTypeTransition(nextTransition, OBJECT_DATA, 4);
        size = 4;
      }
      newPosition = pack2(value, refPosition);
      if (typeof newPosition === "object") {
        refPosition = newPosition.position;
        targetView2 = newPosition.targetView;
        target2 = newPosition.target;
        refsStartPosition -= encodingStart;
        position3 -= encodingStart;
        start -= encodingStart;
        encodingStart = 0;
      } else
        refPosition = newPosition;
      if (size === 2) {
        targetView2.setUint16(position3, refOffset, true);
        position3 += 2;
      } else {
        targetView2.setUint32(position3, refOffset, true);
        position3 += 4;
      }
    } else {
      transition = nextTransition.object16 || createTypeTransition(nextTransition, OBJECT_DATA, 2);
      targetView2.setInt16(position3, value === null ? -10 : -9, true);
      position3 += 2;
    }
    keyIndex++;
  }
  let recordId = transition[RECORD_SYMBOL];
  if (recordId == null) {
    recordId = packr2.typedStructs.length;
    let structure = [];
    let nextTransition = transition;
    let key, type2;
    while ((type2 = nextTransition.__type) !== void 0) {
      let size = nextTransition.__size;
      nextTransition = nextTransition.__parent;
      key = nextTransition.key;
      let property = [type2, size, key];
      if (nextTransition.enumerationOffset)
        property.push(nextTransition.enumerationOffset);
      structure.push(property);
      nextTransition = nextTransition.parent;
    }
    structure.reverse();
    transition[RECORD_SYMBOL] = recordId;
    packr2.typedStructs[recordId] = structure;
    pack2(null, 0, true);
  }
  switch (headerSize) {
    case 1:
      if (recordId >= 16) return 0;
      target2[start] = recordId + 32;
      break;
    case 2:
      if (recordId >= 256) return 0;
      target2[start] = 56;
      target2[start + 1] = recordId;
      break;
    case 3:
      if (recordId >= 65536) return 0;
      target2[start] = 57;
      targetView2.setUint16(start + 1, recordId, true);
      break;
    case 4:
      if (recordId >= 16777216) return 0;
      targetView2.setUint32(start, (recordId << 8) + 58, true);
      break;
  }
  if (position3 < refsStartPosition) {
    if (refsStartPosition === refPosition)
      return position3;
    target2.copyWithin(position3, refsStartPosition, refPosition);
    refPosition += position3 - refsStartPosition;
    typedStructs.lastStringStart = position3 - start;
  } else if (position3 > refsStartPosition) {
    if (refsStartPosition === refPosition)
      return position3;
    typedStructs.lastStringStart = position3 - start;
    return writeStruct(object, target2, encodingStart, start, structures, makeRoom, pack2, packr2);
  }
  return refPosition;
}
function anyType(transition, position3, targetView2, value) {
  let nextTransition;
  if (nextTransition = transition.ascii8 || transition.num8) {
    targetView2.setInt8(position3, value, true);
    updatedPosition = position3 + 1;
    return nextTransition;
  }
  if (nextTransition = transition.string16 || transition.object16) {
    targetView2.setInt16(position3, value, true);
    updatedPosition = position3 + 2;
    return nextTransition;
  }
  if (nextTransition = transition.num32) {
    targetView2.setUint32(position3, 3758096640 + value, true);
    updatedPosition = position3 + 4;
    return nextTransition;
  }
  if (nextTransition = transition.num64) {
    targetView2.setFloat64(position3, NaN, true);
    targetView2.setInt8(position3, value);
    updatedPosition = position3 + 8;
    return nextTransition;
  }
  updatedPosition = position3;
  return;
}
function createTypeTransition(transition, type2, size) {
  let typeName = TYPE_NAMES[type2] + (size << 3);
  let newTransition = transition[typeName] || (transition[typeName] = /* @__PURE__ */ Object.create(null));
  newTransition.__type = type2;
  newTransition.__size = size;
  newTransition.__parent = transition;
  return newTransition;
}
function onLoadedStructures2(sharedData) {
  if (!(sharedData instanceof Map))
    return sharedData;
  let typed = sharedData.get("typed") || [];
  if (Object.isFrozen(typed))
    typed = typed.map((structure) => structure.slice(0));
  let named = sharedData.get("named");
  let transitions = /* @__PURE__ */ Object.create(null);
  for (let i = 0, l = typed.length; i < l; i++) {
    let structure = typed[i];
    let transition = transitions;
    for (let [type2, size, key] of structure) {
      let nextTransition = transition[key];
      if (!nextTransition) {
        transition[key] = nextTransition = {
          key,
          parent: transition,
          enumerationOffset: 0,
          ascii0: null,
          ascii8: null,
          num8: null,
          string16: null,
          object16: null,
          num32: null,
          float64: null,
          date64: null
        };
      }
      transition = createTypeTransition(nextTransition, type2, size);
    }
    transition[RECORD_SYMBOL] = i;
  }
  typed.transitions = transitions;
  this.typedStructs = typed;
  this.lastTypedStructuresLength = typed.length;
  return named;
}
var sourceSymbol = /* @__PURE__ */ Symbol.for("source");
function readStruct2(src2, position3, srcEnd2, unpackr) {
  let recordId = src2[position3++] - 32;
  if (recordId >= 24) {
    switch (recordId) {
      case 24:
        recordId = src2[position3++];
        break;
      // little endian:
      case 25:
        recordId = src2[position3++] + (src2[position3++] << 8);
        break;
      case 26:
        recordId = src2[position3++] + (src2[position3++] << 8) + (src2[position3++] << 16);
        break;
      case 27:
        recordId = src2[position3++] + (src2[position3++] << 8) + (src2[position3++] << 16) + (src2[position3++] << 24);
        break;
    }
  }
  let structure = unpackr.typedStructs && unpackr.typedStructs[recordId];
  if (!structure) {
    src2 = Uint8Array.prototype.slice.call(src2, position3, srcEnd2);
    srcEnd2 -= position3;
    position3 = 0;
    if (!unpackr.getStructures)
      throw new Error(`Reference to shared structure ${recordId} without getStructures method`);
    unpackr._mergeStructures(unpackr.getStructures());
    if (!unpackr.typedStructs)
      throw new Error("Could not find any shared typed structures");
    unpackr.lastTypedStructuresLength = unpackr.typedStructs.length;
    structure = unpackr.typedStructs[recordId];
    if (!structure)
      throw new Error("Could not find typed structure " + recordId);
  }
  var construct = structure.construct;
  if (!construct) {
    construct = structure.construct = function LazyObject() {
    };
    var prototype = construct.prototype;
    let properties = [];
    let currentOffset = 0;
    let lastRefProperty;
    for (let i = 0, l = structure.length; i < l; i++) {
      let definition = structure[i];
      let [type2, size, key, enumerationOffset] = definition;
      if (key === "__proto__")
        key = "__proto_";
      let property = {
        key,
        offset: currentOffset
      };
      if (enumerationOffset)
        properties.splice(i + enumerationOffset, 0, property);
      else
        properties.push(property);
      let getRef;
      switch (size) {
        // TODO: Move into a separate function
        case 0:
          getRef = () => 0;
          break;
        case 1:
          getRef = (source, position4) => {
            let ref = source.bytes[position4 + property.offset];
            return ref >= 246 ? toConstant(ref) : ref;
          };
          break;
        case 2:
          getRef = (source, position4) => {
            let src3 = source.bytes;
            let dataView2 = src3.dataView || (src3.dataView = new DataView(src3.buffer, src3.byteOffset, src3.byteLength));
            let ref = dataView2.getUint16(position4 + property.offset, true);
            return ref >= 65280 ? toConstant(ref & 255) : ref;
          };
          break;
        case 4:
          getRef = (source, position4) => {
            let src3 = source.bytes;
            let dataView2 = src3.dataView || (src3.dataView = new DataView(src3.buffer, src3.byteOffset, src3.byteLength));
            let ref = dataView2.getUint32(position4 + property.offset, true);
            return ref >= 4294967040 ? toConstant(ref & 255) : ref;
          };
          break;
      }
      property.getRef = getRef;
      currentOffset += size;
      let get;
      switch (type2) {
        case ASCII:
          if (lastRefProperty && !lastRefProperty.next)
            lastRefProperty.next = property;
          lastRefProperty = property;
          property.multiGetCount = 0;
          get = function(source) {
            let src3 = source.bytes;
            let position4 = source.position;
            let refStart = currentOffset + position4;
            let ref = getRef(source, position4);
            if (typeof ref !== "number") return ref;
            let end, next = property.next;
            while (next) {
              end = next.getRef(source, position4);
              if (typeof end === "number")
                break;
              else
                end = null;
              next = next.next;
            }
            if (end == null)
              end = source.bytesEnd - refStart;
            if (source.srcString) {
              return source.srcString.slice(ref, end);
            }
            return readString(src3, ref + refStart, end - ref);
          };
          break;
        case UTF8:
        case OBJECT_DATA:
          if (lastRefProperty && !lastRefProperty.next)
            lastRefProperty.next = property;
          lastRefProperty = property;
          get = function(source) {
            let position4 = source.position;
            let refStart = currentOffset + position4;
            let ref = getRef(source, position4);
            if (typeof ref !== "number") return ref;
            let src3 = source.bytes;
            let end, next = property.next;
            while (next) {
              end = next.getRef(source, position4);
              if (typeof end === "number")
                break;
              else
                end = null;
              next = next.next;
            }
            if (end == null)
              end = source.bytesEnd - refStart;
            if (type2 === UTF8) {
              return src3.toString("utf8", ref + refStart, end + refStart);
            } else {
              currentSource = source;
              try {
                return unpackr.unpack(src3, { start: ref + refStart, end: end + refStart });
              } finally {
                currentSource = null;
              }
            }
          };
          break;
        case NUMBER:
          switch (size) {
            case 4:
              get = function(source) {
                let src3 = source.bytes;
                let dataView2 = src3.dataView || (src3.dataView = new DataView(src3.buffer, src3.byteOffset, src3.byteLength));
                let position4 = source.position + property.offset;
                let value = dataView2.getInt32(position4, true);
                if (value < 536870912) {
                  if (value > -520093696)
                    return value;
                  if (value > -536870912)
                    return toConstant(value & 255);
                }
                let fValue = dataView2.getFloat32(position4, true);
                let multiplier = mult10[(src3[position4 + 3] & 127) << 1 | src3[position4 + 2] >> 7];
                return (multiplier * fValue + (fValue > 0 ? 0.5 : -0.5) >> 0) / multiplier;
              };
              break;
            case 8:
              get = function(source) {
                let src3 = source.bytes;
                let dataView2 = src3.dataView || (src3.dataView = new DataView(src3.buffer, src3.byteOffset, src3.byteLength));
                let value = dataView2.getFloat64(source.position + property.offset, true);
                if (isNaN(value)) {
                  let byte = src3[source.position + property.offset];
                  if (byte >= 246)
                    return toConstant(byte);
                }
                return value;
              };
              break;
            case 1:
              get = function(source) {
                let src3 = source.bytes;
                let value = src3[source.position + property.offset];
                return value < 246 ? value : toConstant(value);
              };
              break;
          }
          break;
        case DATE:
          get = function(source) {
            let src3 = source.bytes;
            let dataView2 = src3.dataView || (src3.dataView = new DataView(src3.buffer, src3.byteOffset, src3.byteLength));
            return new Date(dataView2.getFloat64(source.position + property.offset, true));
          };
          break;
      }
      property.get = get;
    }
    if (evalSupported) {
      let objectLiteralProperties = [];
      let args = [];
      let i = 0;
      let hasInheritedProperties;
      for (let property of properties) {
        if (unpackr.alwaysLazyProperty && unpackr.alwaysLazyProperty(property.key)) {
          hasInheritedProperties = true;
          continue;
        }
        Object.defineProperty(prototype, property.key, { get: withSource(property.get), enumerable: true });
        let valueFunction = "v" + i++;
        args.push(valueFunction);
        objectLiteralProperties.push("[" + JSON.stringify(property.key) + "]:" + valueFunction + "(s)");
      }
      if (hasInheritedProperties) {
        objectLiteralProperties.push("__proto__:this");
      }
      let toObject = new Function(...args, "return function(s){return{" + objectLiteralProperties.join(",") + "}}").apply(null, properties.map((prop) => prop.get));
      Object.defineProperty(prototype, "toJSON", {
        value(omitUnderscoredProperties) {
          return toObject.call(this, this[sourceSymbol]);
        }
      });
    } else {
      Object.defineProperty(prototype, "toJSON", {
        value(omitUnderscoredProperties) {
          let resolved = {};
          for (let i = 0, l = properties.length; i < l; i++) {
            let key = properties[i].key;
            resolved[key] = this[key];
          }
          return resolved;
        }
        // not enumerable or anything
      });
    }
  }
  var instance = new construct();
  instance[sourceSymbol] = {
    bytes: src2,
    position: position3,
    srcString: "",
    bytesEnd: srcEnd2
  };
  return instance;
}
function toConstant(code) {
  switch (code) {
    case 246:
      return null;
    case 247:
      return void 0;
    case 248:
      return false;
    case 249:
      return true;
  }
  throw new Error("Unknown constant");
}
function withSource(get) {
  return function() {
    return get(this[sourceSymbol]);
  };
}
function saveState2() {
  if (currentSource) {
    currentSource.bytes = Uint8Array.prototype.slice.call(currentSource.bytes, currentSource.position, currentSource.bytesEnd);
    currentSource.position = 0;
    currentSource.bytesEnd = currentSource.bytes.length;
  }
}
function prepareStructures2(structures, packr2) {
  if (packr2.typedStructs) {
    let structMap = /* @__PURE__ */ new Map();
    structMap.set("named", structures);
    structMap.set("typed", packr2.typedStructs);
    structures = structMap;
  }
  let lastTypedStructuresLength = packr2.lastTypedStructuresLength || 0;
  structures.isCompatible = (existing) => {
    let compatible = true;
    if (existing instanceof Map) {
      let named = existing.get("named") || [];
      if (named.length !== (packr2.lastNamedStructuresLength || 0))
        compatible = false;
      let typed = existing.get("typed") || [];
      if (typed.length !== lastTypedStructuresLength)
        compatible = false;
    } else if (existing instanceof Array || Array.isArray(existing)) {
      if (existing.length !== (packr2.lastNamedStructuresLength || 0))
        compatible = false;
    }
    if (!compatible)
      packr2._mergeStructures(existing);
    return compatible;
  };
  packr2.lastTypedStructuresLength = packr2.typedStructs && packr2.typedStructs.length;
  return structures;
}
setReadStruct(readStruct2, onLoadedStructures2, saveState2);

// node_modules/@colyseus/msgpackr/node-index.js
var import_module = require("module");
var import_meta = {};
var nativeAccelerationDisabled = process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED !== void 0 && process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED.toLowerCase() === "true";
if (!nativeAccelerationDisabled) {
  let extractor;
  try {
    if (typeof require == "function")
      extractor = require_msgpackr_extract();
    else
      extractor = (0, import_module.createRequire)(import_meta.url)("msgpackr-extract");
    if (extractor)
      setExtractor(extractor.extractStrings);
  } catch (error) {
  }
}

// node_modules/@colyseus/schema/build/esm/index.mjs
var SWITCH_TO_STRUCTURE = 255;
var TYPE_ID = 213;
var OPERATION;
(function(OPERATION2) {
  OPERATION2[OPERATION2["ADD"] = 128] = "ADD";
  OPERATION2[OPERATION2["REPLACE"] = 0] = "REPLACE";
  OPERATION2[OPERATION2["DELETE"] = 64] = "DELETE";
  OPERATION2[OPERATION2["DELETE_AND_MOVE"] = 96] = "DELETE_AND_MOVE";
  OPERATION2[OPERATION2["MOVE_AND_ADD"] = 160] = "MOVE_AND_ADD";
  OPERATION2[OPERATION2["DELETE_AND_ADD"] = 192] = "DELETE_AND_ADD";
  OPERATION2[OPERATION2["CLEAR"] = 10] = "CLEAR";
  OPERATION2[OPERATION2["REVERSE"] = 15] = "REVERSE";
  OPERATION2[OPERATION2["MOVE"] = 32] = "MOVE";
  OPERATION2[OPERATION2["DELETE_BY_REFID"] = 33] = "DELETE_BY_REFID";
  OPERATION2[OPERATION2["ADD_BY_REFID"] = 129] = "ADD_BY_REFID";
})(OPERATION || (OPERATION = {}));
Symbol.metadata ??= /* @__PURE__ */ Symbol.for("Symbol.metadata");
var $track = "~track";
var $encoder = "~encoder";
var $decoder = "~decoder";
var $filter = "~filter";
var $getByIndex = "~getByIndex";
var $deleteByIndex = "~deleteByIndex";
var $changes = "~changes";
var $childType = "~childType";
var $onEncodeEnd = "~onEncodeEnd";
var $onDecodeEnd = "~onDecodeEnd";
var $descriptors = "~descriptors";
var $numFields = "~__numFields";
var $refTypeFieldIndexes = "~__refTypeFieldIndexes";
var $viewFieldIndexes = "~__viewFieldIndexes";
var $fieldIndexesByViewTag = "$__fieldIndexesByViewTag";
var textEncoder3;
try {
  textEncoder3 = new TextEncoder();
} catch (e) {
}
var _convoBuffer$1 = new ArrayBuffer(8);
var _int32$1 = new Int32Array(_convoBuffer$1);
var _float32$1 = new Float32Array(_convoBuffer$1);
var _float64$1 = new Float64Array(_convoBuffer$1);
var _int64$1 = new BigInt64Array(_convoBuffer$1);
var hasBufferByteLength = typeof Buffer !== "undefined" && Buffer.byteLength;
var utf8Length = hasBufferByteLength ? Buffer.byteLength : function(str, _) {
  var c = 0, length = 0;
  for (var i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      length += 1;
    } else if (c < 2048) {
      length += 2;
    } else if (c < 55296 || c >= 57344) {
      length += 3;
    } else {
      i++;
      length += 4;
    }
  }
  return length;
};
function utf8Write(view, str, it) {
  var c = 0;
  for (var i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      view[it.offset++] = c;
    } else if (c < 2048) {
      view[it.offset] = 192 | c >> 6;
      view[it.offset + 1] = 128 | c & 63;
      it.offset += 2;
    } else if (c < 55296 || c >= 57344) {
      view[it.offset] = 224 | c >> 12;
      view[it.offset + 1] = 128 | c >> 6 & 63;
      view[it.offset + 2] = 128 | c & 63;
      it.offset += 3;
    } else {
      i++;
      c = 65536 + ((c & 1023) << 10 | str.charCodeAt(i) & 1023);
      view[it.offset] = 240 | c >> 18;
      view[it.offset + 1] = 128 | c >> 12 & 63;
      view[it.offset + 2] = 128 | c >> 6 & 63;
      view[it.offset + 3] = 128 | c & 63;
      it.offset += 4;
    }
  }
}
function int8$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
}
function uint8$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
}
function int16$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
  bytes[it.offset++] = value >> 8 & 255;
}
function uint16$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
  bytes[it.offset++] = value >> 8 & 255;
}
function int32$1(bytes, value, it) {
  bytes[it.offset++] = value & 255;
  bytes[it.offset++] = value >> 8 & 255;
  bytes[it.offset++] = value >> 16 & 255;
  bytes[it.offset++] = value >> 24 & 255;
}
function uint32$1(bytes, value, it) {
  const b4 = value >> 24;
  const b3 = value >> 16;
  const b2 = value >> 8;
  const b1 = value;
  bytes[it.offset++] = b1 & 255;
  bytes[it.offset++] = b2 & 255;
  bytes[it.offset++] = b3 & 255;
  bytes[it.offset++] = b4 & 255;
}
function int64$1(bytes, value, it) {
  const high = Math.floor(value / Math.pow(2, 32));
  const low = value >>> 0;
  uint32$1(bytes, low, it);
  uint32$1(bytes, high, it);
}
function uint64$1(bytes, value, it) {
  const high = value / Math.pow(2, 32) >> 0;
  const low = value >>> 0;
  uint32$1(bytes, low, it);
  uint32$1(bytes, high, it);
}
function bigint64$1(bytes, value, it) {
  _int64$1[0] = BigInt.asIntN(64, value);
  int32$1(bytes, _int32$1[0], it);
  int32$1(bytes, _int32$1[1], it);
}
function biguint64$1(bytes, value, it) {
  _int64$1[0] = BigInt.asIntN(64, value);
  int32$1(bytes, _int32$1[0], it);
  int32$1(bytes, _int32$1[1], it);
}
function float32$1(bytes, value, it) {
  _float32$1[0] = value;
  int32$1(bytes, _int32$1[0], it);
}
function float64$1(bytes, value, it) {
  _float64$1[0] = value;
  int32$1(bytes, _int32$1[0], it);
  int32$1(bytes, _int32$1[1], it);
}
function boolean$1(bytes, value, it) {
  bytes[it.offset++] = value ? 1 : 0;
}
function string$1(bytes, value, it) {
  if (!value) {
    value = "";
  }
  let length = utf8Length(value, "utf8");
  let size = 0;
  if (length < 32) {
    bytes[it.offset++] = length | 160;
    size = 1;
  } else if (length < 256) {
    bytes[it.offset++] = 217;
    bytes[it.offset++] = length % 255;
    size = 2;
  } else if (length < 65536) {
    bytes[it.offset++] = 218;
    uint16$1(bytes, length, it);
    size = 3;
  } else if (length < 4294967296) {
    bytes[it.offset++] = 219;
    uint32$1(bytes, length, it);
    size = 5;
  } else {
    throw new Error("String too long");
  }
  utf8Write(bytes, value, it);
  return size + length;
}
function number$1(bytes, value, it) {
  if (isNaN(value)) {
    return number$1(bytes, 0, it);
  } else if (!isFinite(value)) {
    return number$1(bytes, value > 0 ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER, it);
  } else if (value !== (value | 0)) {
    if (Math.abs(value) <= 34028235e31) {
      _float32$1[0] = value;
      if (Math.abs(Math.abs(_float32$1[0]) - Math.abs(value)) < 1e-4) {
        bytes[it.offset++] = 202;
        float32$1(bytes, value, it);
        return 5;
      }
    }
    bytes[it.offset++] = 203;
    float64$1(bytes, value, it);
    return 9;
  }
  if (value >= 0) {
    if (value < 128) {
      bytes[it.offset++] = value & 255;
      return 1;
    }
    if (value < 256) {
      bytes[it.offset++] = 204;
      bytes[it.offset++] = value & 255;
      return 2;
    }
    if (value < 65536) {
      bytes[it.offset++] = 205;
      uint16$1(bytes, value, it);
      return 3;
    }
    if (value < 4294967296) {
      bytes[it.offset++] = 206;
      uint32$1(bytes, value, it);
      return 5;
    }
    bytes[it.offset++] = 207;
    uint64$1(bytes, value, it);
    return 9;
  } else {
    if (value >= -32) {
      bytes[it.offset++] = 224 | value + 32;
      return 1;
    }
    if (value >= -128) {
      bytes[it.offset++] = 208;
      int8$1(bytes, value, it);
      return 2;
    }
    if (value >= -32768) {
      bytes[it.offset++] = 209;
      int16$1(bytes, value, it);
      return 3;
    }
    if (value >= -2147483648) {
      bytes[it.offset++] = 210;
      int32$1(bytes, value, it);
      return 5;
    }
    bytes[it.offset++] = 211;
    int64$1(bytes, value, it);
    return 9;
  }
}
var encode2 = {
  int8: int8$1,
  uint8: uint8$1,
  int16: int16$1,
  uint16: uint16$1,
  int32: int32$1,
  uint32: uint32$1,
  int64: int64$1,
  uint64: uint64$1,
  bigint64: bigint64$1,
  biguint64: biguint64$1,
  float32: float32$1,
  float64: float64$1,
  boolean: boolean$1,
  string: string$1,
  number: number$1,
  utf8Write,
  utf8Length
};
var _convoBuffer = new ArrayBuffer(8);
var _int32 = new Int32Array(_convoBuffer);
var _float32 = new Float32Array(_convoBuffer);
var _float64 = new Float64Array(_convoBuffer);
var _uint64 = new BigUint64Array(_convoBuffer);
var _int64 = new BigInt64Array(_convoBuffer);
function utf8Read(bytes, it, length) {
  if (length > bytes.length - it.offset) {
    length = bytes.length - it.offset;
  }
  var string2 = "", chr = 0;
  for (var i = it.offset, end = it.offset + length; i < end; i++) {
    var byte = bytes[i];
    if ((byte & 128) === 0) {
      string2 += String.fromCharCode(byte);
      continue;
    }
    if ((byte & 224) === 192) {
      string2 += String.fromCharCode((byte & 31) << 6 | bytes[++i] & 63);
      continue;
    }
    if ((byte & 240) === 224) {
      string2 += String.fromCharCode((byte & 15) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0);
      continue;
    }
    if ((byte & 248) === 240) {
      chr = (byte & 7) << 18 | (bytes[++i] & 63) << 12 | (bytes[++i] & 63) << 6 | (bytes[++i] & 63) << 0;
      if (chr >= 65536) {
        chr -= 65536;
        string2 += String.fromCharCode((chr >>> 10) + 55296, (chr & 1023) + 56320);
      } else {
        string2 += String.fromCharCode(chr);
      }
      continue;
    }
    console.error("decode.utf8Read(): Invalid byte " + byte + " at offset " + i + ". Skip to end of string: " + (it.offset + length));
    break;
  }
  it.offset += length;
  return string2;
}
function int8(bytes, it) {
  return uint8(bytes, it) << 24 >> 24;
}
function uint8(bytes, it) {
  return bytes[it.offset++];
}
function int16(bytes, it) {
  return uint16(bytes, it) << 16 >> 16;
}
function uint16(bytes, it) {
  return bytes[it.offset++] | bytes[it.offset++] << 8;
}
function int32(bytes, it) {
  return bytes[it.offset++] | bytes[it.offset++] << 8 | bytes[it.offset++] << 16 | bytes[it.offset++] << 24;
}
function uint32(bytes, it) {
  return int32(bytes, it) >>> 0;
}
function float32(bytes, it) {
  _int32[0] = int32(bytes, it);
  return _float32[0];
}
function float64(bytes, it) {
  _int32[0] = int32(bytes, it);
  _int32[1] = int32(bytes, it);
  return _float64[0];
}
function int64(bytes, it) {
  const low = uint32(bytes, it);
  const high = int32(bytes, it) * Math.pow(2, 32);
  return high + low;
}
function uint64(bytes, it) {
  const low = uint32(bytes, it);
  const high = uint32(bytes, it) * Math.pow(2, 32);
  return high + low;
}
function bigint64(bytes, it) {
  _int32[0] = int32(bytes, it);
  _int32[1] = int32(bytes, it);
  return _int64[0];
}
function biguint64(bytes, it) {
  _int32[0] = int32(bytes, it);
  _int32[1] = int32(bytes, it);
  return _uint64[0];
}
function boolean(bytes, it) {
  return uint8(bytes, it) > 0;
}
function string(bytes, it) {
  const prefix = bytes[it.offset++];
  let length;
  if (prefix < 192) {
    length = prefix & 31;
  } else if (prefix === 217) {
    length = uint8(bytes, it);
  } else if (prefix === 218) {
    length = uint16(bytes, it);
  } else if (prefix === 219) {
    length = uint32(bytes, it);
  }
  return utf8Read(bytes, it, length);
}
function number(bytes, it) {
  const prefix = bytes[it.offset++];
  if (prefix < 128) {
    return prefix;
  } else if (prefix === 202) {
    return float32(bytes, it);
  } else if (prefix === 203) {
    return float64(bytes, it);
  } else if (prefix === 204) {
    return uint8(bytes, it);
  } else if (prefix === 205) {
    return uint16(bytes, it);
  } else if (prefix === 206) {
    return uint32(bytes, it);
  } else if (prefix === 207) {
    return uint64(bytes, it);
  } else if (prefix === 208) {
    return int8(bytes, it);
  } else if (prefix === 209) {
    return int16(bytes, it);
  } else if (prefix === 210) {
    return int32(bytes, it);
  } else if (prefix === 211) {
    return int64(bytes, it);
  } else if (prefix > 223) {
    return (255 - prefix + 1) * -1;
  }
}
function stringCheck(bytes, it) {
  const prefix = bytes[it.offset];
  return (
    // fixstr
    prefix < 192 && prefix > 160 || // str 8
    prefix === 217 || // str 16
    prefix === 218 || // str 32
    prefix === 219
  );
}
var decode2 = {
  utf8Read,
  int8,
  uint8,
  int16,
  uint16,
  int32,
  uint32,
  float32,
  float64,
  int64,
  uint64,
  bigint64,
  biguint64,
  boolean,
  string,
  number,
  stringCheck
};
var registeredTypes = {};
var identifiers = /* @__PURE__ */ new Map();
function registerType(identifier, definition) {
  if (definition.constructor) {
    identifiers.set(definition.constructor, identifier);
    registeredTypes[identifier] = definition;
  }
  if (definition.encode) {
    encode2[identifier] = definition.encode;
  }
  if (definition.decode) {
    decode2[identifier] = definition.decode;
  }
}
function getType(identifier) {
  return registeredTypes[identifier];
}
var TypeContext = class _TypeContext {
  static {
    this.inheritedTypes = /* @__PURE__ */ new Map();
  }
  static {
    this.cachedContexts = /* @__PURE__ */ new Map();
  }
  static register(target2) {
    const parent = Object.getPrototypeOf(target2);
    if (parent !== Schema) {
      let inherits = _TypeContext.inheritedTypes.get(parent);
      if (!inherits) {
        inherits = /* @__PURE__ */ new Set();
        _TypeContext.inheritedTypes.set(parent, inherits);
      }
      inherits.add(target2);
    }
  }
  static cache(rootClass) {
    let context = _TypeContext.cachedContexts.get(rootClass);
    if (!context) {
      context = new _TypeContext(rootClass);
      _TypeContext.cachedContexts.set(rootClass, context);
    }
    return context;
  }
  constructor(rootClass) {
    this.types = {};
    this.schemas = /* @__PURE__ */ new Map();
    this.hasFilters = false;
    this.parentFiltered = {};
    if (rootClass) {
      this.discoverTypes(rootClass);
    }
  }
  has(schema) {
    return this.schemas.has(schema);
  }
  get(typeid) {
    return this.types[typeid];
  }
  add(schema, typeid = this.schemas.size) {
    if (this.schemas.has(schema)) {
      return false;
    }
    this.types[typeid] = schema;
    if (schema[Symbol.metadata] === void 0) {
      Metadata.initialize(schema);
    }
    this.schemas.set(schema, typeid);
    return true;
  }
  getTypeId(klass) {
    return this.schemas.get(klass);
  }
  discoverTypes(klass, parentType, parentIndex, parentHasViewTag) {
    if (parentHasViewTag) {
      this.registerFilteredByParent(klass, parentType, parentIndex);
    }
    if (!this.add(klass)) {
      return;
    }
    _TypeContext.inheritedTypes.get(klass)?.forEach((child) => {
      this.discoverTypes(child, parentType, parentIndex, parentHasViewTag);
    });
    let parent = klass;
    while ((parent = Object.getPrototypeOf(parent)) && parent !== Schema && // stop at root (Schema)
    parent !== Function.prototype) {
      this.discoverTypes(parent);
    }
    const metadata = klass[Symbol.metadata] ??= {};
    if (metadata[$viewFieldIndexes]) {
      this.hasFilters = true;
    }
    for (const fieldIndex in metadata) {
      const index = fieldIndex;
      const fieldType = metadata[index].type;
      const fieldHasViewTag = metadata[index].tag !== void 0;
      if (typeof fieldType === "string") {
        continue;
      }
      if (typeof fieldType === "function") {
        this.discoverTypes(fieldType, klass, index, parentHasViewTag || fieldHasViewTag);
      } else {
        const type2 = Object.values(fieldType)[0];
        if (typeof type2 === "string") {
          continue;
        }
        this.discoverTypes(type2, klass, index, parentHasViewTag || fieldHasViewTag);
      }
    }
  }
  /**
   * Keep track of which classes have filters applied.
   * Format: `${typeid}-${parentTypeid}-${parentIndex}`
   */
  registerFilteredByParent(schema, parentType, parentIndex) {
    const typeid = this.schemas.get(schema) ?? this.schemas.size;
    let key = `${typeid}`;
    if (parentType) {
      key += `-${this.schemas.get(parentType)}`;
    }
    key += `-${parentIndex}`;
    this.parentFiltered[key] = true;
  }
  debug() {
    let parentFiltered = "";
    for (const key in this.parentFiltered) {
      const keys = key.split("-").map(Number);
      const fieldIndex = keys.pop();
      parentFiltered += `
		`;
      parentFiltered += `${key}: ${keys.reverse().map((id, i) => {
        const klass = this.types[id];
        const metadata = klass[Symbol.metadata];
        let txt = klass.name;
        if (i === 0) {
          txt += `[${metadata[fieldIndex].name}]`;
        }
        return `${txt}`;
      }).join(" -> ")}`;
    }
    return `TypeContext ->
	Schema types: ${this.schemas.size}
	hasFilters: ${this.hasFilters}
	parentFiltered:${parentFiltered}`;
  }
};
function getNormalizedType(type2) {
  if (Array.isArray(type2)) {
    return { array: getNormalizedType(type2[0]) };
  } else if (typeof type2["type"] !== "undefined") {
    return type2["type"];
  } else if (isTSEnum(type2)) {
    return Object.keys(type2).every((key) => typeof type2[key] === "string") ? "string" : "number";
  } else if (typeof type2 === "object" && type2 !== null) {
    const collectionType = Object.keys(type2).find((k) => registeredTypes[k] !== void 0);
    if (collectionType) {
      type2[collectionType] = getNormalizedType(type2[collectionType]);
      return type2;
    }
  }
  return type2;
}
function isTSEnum(_enum) {
  if (typeof _enum === "function" && _enum[Symbol.metadata]) {
    return false;
  }
  const keys = Object.keys(_enum);
  const numericFields = keys.filter((k) => /\d+/.test(k));
  if (numericFields.length > 0 && numericFields.length === keys.length / 2 && _enum[_enum[numericFields[0]]] == numericFields[0]) {
    return true;
  }
  if (keys.length > 0 && keys.every((key) => typeof _enum[key] === "string" && _enum[key] === key)) {
    return true;
  }
  return false;
}
var Metadata = {
  addField(metadata, index, name, type2, descriptor) {
    if (index > 64) {
      throw new Error(`Can't define field '${name}'.
Schema instances may only have up to 64 fields.`);
    }
    metadata[index] = Object.assign(
      metadata[index] || {},
      // avoid overwriting previous field metadata (@owned / @deprecated)
      {
        type: getNormalizedType(type2),
        index,
        name
      }
    );
    Object.defineProperty(metadata, $descriptors, {
      value: metadata[$descriptors] || {},
      enumerable: false,
      configurable: true
    });
    if (descriptor) {
      metadata[$descriptors][name] = descriptor;
      metadata[$descriptors][`_${name}`] = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
      };
    } else {
      metadata[$descriptors][name] = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
      };
    }
    Object.defineProperty(metadata, $numFields, {
      value: index,
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(metadata, name, {
      value: index,
      enumerable: false,
      configurable: true
    });
    if (typeof metadata[index].type !== "string") {
      if (metadata[$refTypeFieldIndexes] === void 0) {
        Object.defineProperty(metadata, $refTypeFieldIndexes, {
          value: [],
          enumerable: false,
          configurable: true
        });
      }
      metadata[$refTypeFieldIndexes].push(index);
    }
  },
  setTag(metadata, fieldName, tag) {
    const index = metadata[fieldName];
    const field = metadata[index];
    field.tag = tag;
    if (!metadata[$viewFieldIndexes]) {
      Object.defineProperty(metadata, $viewFieldIndexes, {
        value: [],
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(metadata, $fieldIndexesByViewTag, {
        value: {},
        enumerable: false,
        configurable: true
      });
    }
    metadata[$viewFieldIndexes].push(index);
    if (!metadata[$fieldIndexesByViewTag][tag]) {
      metadata[$fieldIndexesByViewTag][tag] = [];
    }
    metadata[$fieldIndexesByViewTag][tag].push(index);
  },
  setFields(target2, fields) {
    const constructor = target2.prototype.constructor;
    TypeContext.register(constructor);
    const parentClass = Object.getPrototypeOf(constructor);
    const parentMetadata = parentClass && parentClass[Symbol.metadata];
    const metadata = Metadata.initialize(constructor);
    if (!constructor[$track]) {
      constructor[$track] = Schema[$track];
    }
    if (!constructor[$encoder]) {
      constructor[$encoder] = Schema[$encoder];
    }
    if (!constructor[$decoder]) {
      constructor[$decoder] = Schema[$decoder];
    }
    if (!constructor.prototype.toJSON) {
      constructor.prototype.toJSON = Schema.prototype.toJSON;
    }
    let fieldIndex = metadata[$numFields] ?? (parentMetadata && parentMetadata[$numFields]) ?? -1;
    fieldIndex++;
    for (const field in fields) {
      const type2 = getNormalizedType(fields[field]);
      const complexTypeKlass = typeof Object.keys(type2)[0] === "string" && getType(Object.keys(type2)[0]);
      const childType = complexTypeKlass ? Object.values(type2)[0] : type2;
      Metadata.addField(metadata, fieldIndex, field, type2, getPropertyDescriptor(`_${field}`, fieldIndex, childType, complexTypeKlass));
      fieldIndex++;
    }
    return target2;
  },
  isDeprecated(metadata, field) {
    return metadata[field].deprecated === true;
  },
  init(klass) {
    const metadata = {};
    klass[Symbol.metadata] = metadata;
    Object.defineProperty(metadata, $numFields, {
      value: 0,
      enumerable: false,
      configurable: true
    });
  },
  initialize(constructor) {
    const parentClass = Object.getPrototypeOf(constructor);
    const parentMetadata = parentClass[Symbol.metadata];
    let metadata = constructor[Symbol.metadata] ?? /* @__PURE__ */ Object.create(null);
    if (parentClass !== Schema && metadata === parentMetadata) {
      metadata = /* @__PURE__ */ Object.create(null);
      if (parentMetadata) {
        Object.setPrototypeOf(metadata, parentMetadata);
        Object.defineProperty(metadata, $numFields, {
          value: parentMetadata[$numFields],
          enumerable: false,
          configurable: true,
          writable: true
        });
        if (parentMetadata[$viewFieldIndexes] !== void 0) {
          Object.defineProperty(metadata, $viewFieldIndexes, {
            value: [...parentMetadata[$viewFieldIndexes]],
            enumerable: false,
            configurable: true,
            writable: true
          });
          Object.defineProperty(metadata, $fieldIndexesByViewTag, {
            value: { ...parentMetadata[$fieldIndexesByViewTag] },
            enumerable: false,
            configurable: true,
            writable: true
          });
        }
        if (parentMetadata[$refTypeFieldIndexes] !== void 0) {
          Object.defineProperty(metadata, $refTypeFieldIndexes, {
            value: [...parentMetadata[$refTypeFieldIndexes]],
            enumerable: false,
            configurable: true,
            writable: true
          });
        }
        Object.defineProperty(metadata, $descriptors, {
          value: { ...parentMetadata[$descriptors] },
          enumerable: false,
          configurable: true,
          writable: true
        });
      }
    }
    Object.defineProperty(constructor, Symbol.metadata, {
      value: metadata,
      writable: false,
      configurable: true
    });
    return metadata;
  },
  isValidInstance(klass) {
    return klass.constructor[Symbol.metadata] && Object.prototype.hasOwnProperty.call(klass.constructor[Symbol.metadata], $numFields);
  },
  getFields(klass) {
    const metadata = klass[Symbol.metadata];
    const fields = {};
    for (let i = 0; i <= metadata[$numFields]; i++) {
      fields[metadata[i].name] = metadata[i].type;
    }
    return fields;
  },
  hasViewTagAtIndex(metadata, index) {
    return metadata?.[$viewFieldIndexes]?.includes(index);
  }
};
function createChangeSet(queueRootNode) {
  return { indexes: {}, operations: [], queueRootNode };
}
function createChangeTreeList() {
  return { next: void 0, tail: void 0 };
}
function setOperationAtIndex(changeSet, index) {
  const operationsIndex = changeSet.indexes[index];
  if (operationsIndex === void 0) {
    changeSet.indexes[index] = changeSet.operations.push(index) - 1;
  } else {
    changeSet.operations[operationsIndex] = index;
  }
}
function deleteOperationAtIndex(changeSet, index) {
  let operationsIndex = changeSet.indexes[index];
  if (operationsIndex === void 0) {
    operationsIndex = Object.values(changeSet.indexes).at(-1);
    index = Object.entries(changeSet.indexes).find(([_, value]) => value === operationsIndex)?.[0];
  }
  changeSet.operations[operationsIndex] = void 0;
  delete changeSet.indexes[index];
}
var ChangeTree = class {
  constructor(ref) {
    this.isFiltered = false;
    this.indexedOperations = {};
    this.changes = { indexes: {}, operations: [] };
    this.allChanges = { indexes: {}, operations: [] };
    this.isNew = true;
    this.ref = ref;
    this.metadata = ref.constructor[Symbol.metadata];
    if (this.metadata?.[$viewFieldIndexes]) {
      this.allFilteredChanges = { indexes: {}, operations: [] };
      this.filteredChanges = { indexes: {}, operations: [] };
    }
  }
  setRoot(root) {
    this.root = root;
    const isNewChangeTree = this.root.add(this);
    this.checkIsFiltered(this.parent, this.parentIndex, isNewChangeTree);
    if (isNewChangeTree) {
      this.forEachChild((child, _) => {
        if (child.root !== root) {
          child.setRoot(root);
        } else {
          root.add(child);
        }
      });
    }
  }
  setParent(parent, root, parentIndex) {
    this.addParent(parent, parentIndex);
    if (!root) {
      return;
    }
    const isNewChangeTree = root.add(this);
    if (root !== this.root) {
      this.root = root;
      this.checkIsFiltered(parent, parentIndex, isNewChangeTree);
    }
    if (isNewChangeTree) {
      this.forEachChild((child, index) => {
        if (child.root === root) {
          root.add(child);
          root.moveNextToParent(child);
          return;
        }
        child.setParent(this.ref, root, index);
      });
    }
  }
  forEachChild(callback) {
    if (this.ref[$childType]) {
      if (typeof this.ref[$childType] !== "string") {
        for (const [key, value] of this.ref.entries()) {
          if (!value) {
            continue;
          }
          callback(value[$changes], this.indexes?.[key] ?? key);
        }
      }
    } else {
      for (const index of this.metadata?.[$refTypeFieldIndexes] ?? []) {
        const field = this.metadata[index];
        const value = this.ref[field.name];
        if (!value) {
          continue;
        }
        callback(value[$changes], index);
      }
    }
  }
  operation(op) {
    if (this.filteredChanges !== void 0) {
      this.filteredChanges.operations.push(-op);
      this.root?.enqueueChangeTree(this, "filteredChanges");
    } else {
      this.changes.operations.push(-op);
      this.root?.enqueueChangeTree(this, "changes");
    }
  }
  change(index, operation = OPERATION.ADD) {
    const isFiltered = this.isFiltered || this.metadata?.[index]?.tag !== void 0;
    const changeSet = isFiltered ? this.filteredChanges : this.changes;
    const previousOperation = this.indexedOperations[index];
    if (!previousOperation || previousOperation === OPERATION.DELETE) {
      const op = !previousOperation ? operation : previousOperation === OPERATION.DELETE ? OPERATION.DELETE_AND_ADD : operation;
      this.indexedOperations[index] = op;
    }
    setOperationAtIndex(changeSet, index);
    if (isFiltered) {
      setOperationAtIndex(this.allFilteredChanges, index);
      if (this.root) {
        this.root.enqueueChangeTree(this, "filteredChanges");
        this.root.enqueueChangeTree(this, "allFilteredChanges");
      }
    } else {
      setOperationAtIndex(this.allChanges, index);
      this.root?.enqueueChangeTree(this, "changes");
    }
  }
  shiftChangeIndexes(shiftIndex) {
    const changeSet = this.isFiltered ? this.filteredChanges : this.changes;
    const newIndexedOperations = {};
    const newIndexes = {};
    for (const index in this.indexedOperations) {
      newIndexedOperations[Number(index) + shiftIndex] = this.indexedOperations[index];
      newIndexes[Number(index) + shiftIndex] = changeSet.indexes[index];
    }
    this.indexedOperations = newIndexedOperations;
    changeSet.indexes = newIndexes;
    changeSet.operations = changeSet.operations.map((index) => index + shiftIndex);
  }
  shiftAllChangeIndexes(shiftIndex, startIndex = 0) {
    if (this.filteredChanges !== void 0) {
      this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allFilteredChanges);
      this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
    } else {
      this._shiftAllChangeIndexes(shiftIndex, startIndex, this.allChanges);
    }
  }
  _shiftAllChangeIndexes(shiftIndex, startIndex = 0, changeSet) {
    const newIndexes = {};
    let newKey = 0;
    for (const key in changeSet.indexes) {
      newIndexes[newKey++] = changeSet.indexes[key];
    }
    changeSet.indexes = newIndexes;
    for (let i = 0; i < changeSet.operations.length; i++) {
      const index = changeSet.operations[i];
      if (index > startIndex) {
        changeSet.operations[i] = index + shiftIndex;
      }
    }
  }
  indexedOperation(index, operation, allChangesIndex = index) {
    this.indexedOperations[index] = operation;
    if (this.filteredChanges !== void 0) {
      setOperationAtIndex(this.allFilteredChanges, allChangesIndex);
      setOperationAtIndex(this.filteredChanges, index);
      this.root?.enqueueChangeTree(this, "filteredChanges");
    } else {
      setOperationAtIndex(this.allChanges, allChangesIndex);
      setOperationAtIndex(this.changes, index);
      this.root?.enqueueChangeTree(this, "changes");
    }
  }
  getType(index) {
    return (
      //
      // Get the child type from parent structure.
      // - ["string"] => "string"
      // - { map: "string" } => "string"
      // - { set: "string" } => "string"
      //
      this.ref[$childType] || // ArraySchema | MapSchema | SetSchema | CollectionSchema
      this.metadata[index].type
    );
  }
  getChange(index) {
    return this.indexedOperations[index];
  }
  //
  // used during `.encode()`
  //
  getValue(index, isEncodeAll = false) {
    return this.ref[$getByIndex](index, isEncodeAll);
  }
  delete(index, operation, allChangesIndex = index) {
    if (index === void 0) {
      try {
        throw new Error(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index '${index}'`);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    const changeSet = this.filteredChanges !== void 0 ? this.filteredChanges : this.changes;
    this.indexedOperations[index] = operation ?? OPERATION.DELETE;
    setOperationAtIndex(changeSet, index);
    deleteOperationAtIndex(this.allChanges, allChangesIndex);
    const previousValue = this.getValue(index);
    if (previousValue && previousValue[$changes]) {
      this.root?.remove(previousValue[$changes]);
    }
    if (this.filteredChanges !== void 0) {
      deleteOperationAtIndex(this.allFilteredChanges, allChangesIndex);
      this.root?.enqueueChangeTree(this, "filteredChanges");
    } else {
      this.root?.enqueueChangeTree(this, "changes");
    }
    return previousValue;
  }
  endEncode(changeSetName) {
    this.indexedOperations = {};
    this[changeSetName] = createChangeSet();
    this.ref[$onEncodeEnd]?.();
    this.isNew = false;
  }
  discard(discardAll = false) {
    this.ref[$onEncodeEnd]?.();
    this.indexedOperations = {};
    this.changes = createChangeSet(this.changes.queueRootNode);
    if (this.filteredChanges !== void 0) {
      this.filteredChanges = createChangeSet(this.filteredChanges.queueRootNode);
    }
    if (discardAll) {
      this.allChanges = createChangeSet(this.allChanges.queueRootNode);
      if (this.allFilteredChanges !== void 0) {
        this.allFilteredChanges = createChangeSet(this.allFilteredChanges.queueRootNode);
      }
    }
  }
  /**
   * Recursively discard all changes from this, and child structures.
   * (Used in tests only)
   */
  discardAll() {
    const keys = Object.keys(this.indexedOperations);
    for (let i = 0, len = keys.length; i < len; i++) {
      const value = this.getValue(Number(keys[i]));
      if (value && value[$changes]) {
        value[$changes].discardAll();
      }
    }
    this.discard();
  }
  get changed() {
    return Object.entries(this.indexedOperations).length > 0;
  }
  checkIsFiltered(parent, parentIndex, isNewChangeTree) {
    if (this.root.types.hasFilters) {
      this._checkFilteredByParent(parent, parentIndex);
      if (this.filteredChanges !== void 0) {
        this.root?.enqueueChangeTree(this, "filteredChanges");
        if (isNewChangeTree) {
          this.root?.enqueueChangeTree(this, "allFilteredChanges");
        }
      }
    }
    if (!this.isFiltered) {
      this.root?.enqueueChangeTree(this, "changes");
      if (isNewChangeTree) {
        this.root?.enqueueChangeTree(this, "allChanges");
      }
    }
  }
  _checkFilteredByParent(parent, parentIndex) {
    if (!parent) {
      return;
    }
    const refType = Metadata.isValidInstance(this.ref) ? this.ref.constructor : this.ref[$childType];
    let parentChangeTree;
    let parentIsCollection = !Metadata.isValidInstance(parent);
    if (parentIsCollection) {
      parentChangeTree = parent[$changes];
      parent = parentChangeTree.parent;
      parentIndex = parentChangeTree.parentIndex;
    } else {
      parentChangeTree = parent[$changes];
    }
    const parentConstructor = parent.constructor;
    let key = `${this.root.types.getTypeId(refType)}`;
    if (parentConstructor) {
      key += `-${this.root.types.schemas.get(parentConstructor)}`;
    }
    key += `-${parentIndex}`;
    const fieldHasViewTag = Metadata.hasViewTagAtIndex(parentConstructor?.[Symbol.metadata], parentIndex);
    this.isFiltered = parent[$changes].isFiltered || this.root.types.parentFiltered[key] || fieldHasViewTag;
    if (this.isFiltered) {
      this.isVisibilitySharedWithParent = parentChangeTree.isFiltered && typeof refType !== "string" && !fieldHasViewTag && parentIsCollection;
      if (!this.filteredChanges) {
        this.filteredChanges = createChangeSet();
        this.allFilteredChanges = createChangeSet();
      }
      if (this.changes.operations.length > 0) {
        this.changes.operations.forEach((index) => setOperationAtIndex(this.filteredChanges, index));
        this.allChanges.operations.forEach((index) => setOperationAtIndex(this.allFilteredChanges, index));
        this.changes = createChangeSet();
        this.allChanges = createChangeSet();
      }
    }
  }
  /**
   * Get the immediate parent
   */
  get parent() {
    return this.parentChain?.ref;
  }
  /**
   * Get the immediate parent index
   */
  get parentIndex() {
    return this.parentChain?.index;
  }
  /**
   * Add a parent to the chain
   */
  addParent(parent, index) {
    if (this.hasParent((p, _) => p[$changes] === parent[$changes])) {
      this.parentChain.index = index;
      return;
    }
    this.parentChain = {
      ref: parent,
      index,
      next: this.parentChain
    };
  }
  /**
   * Remove a parent from the chain
   * @param parent - The parent to remove
   * @returns true if parent was removed
   */
  removeParent(parent = this.parent) {
    let current = this.parentChain;
    let previous = null;
    while (current) {
      if (current.ref[$changes] === parent[$changes]) {
        if (previous) {
          previous.next = current.next;
        } else {
          this.parentChain = current.next;
        }
        return true;
      }
      previous = current;
      current = current.next;
    }
    return this.parentChain === void 0;
  }
  /**
   * Find a specific parent in the chain
   */
  findParent(predicate) {
    let current = this.parentChain;
    while (current) {
      if (predicate(current.ref, current.index)) {
        return current;
      }
      current = current.next;
    }
    return void 0;
  }
  /**
   * Check if this ChangeTree has a specific parent
   */
  hasParent(predicate) {
    return this.findParent(predicate) !== void 0;
  }
  /**
   * Get all parents as an array (for debugging/testing)
   */
  getAllParents() {
    const parents = [];
    let current = this.parentChain;
    while (current) {
      parents.push({ ref: current.ref, index: current.index });
      current = current.next;
    }
    return parents;
  }
};
function encodeValue(encoder, bytes, type2, value, operation, it) {
  if (typeof type2 === "string") {
    encode2[type2]?.(bytes, value, it);
  } else if (type2[Symbol.metadata] !== void 0) {
    encode2.number(bytes, value[$changes].refId, it);
    if ((operation & OPERATION.ADD) === OPERATION.ADD) {
      encoder.tryEncodeTypeId(bytes, type2, value.constructor, it);
    }
  } else {
    encode2.number(bytes, value[$changes].refId, it);
  }
}
var encodeSchemaOperation = function(encoder, bytes, changeTree, index, operation, it, _, __, metadata) {
  bytes[it.offset++] = (index | operation) & 255;
  if (operation === OPERATION.DELETE) {
    return;
  }
  const ref = changeTree.ref;
  const field = metadata[index];
  encodeValue(encoder, bytes, metadata[index].type, ref[field.name], operation, it);
};
var encodeKeyValueOperation = function(encoder, bytes, changeTree, index, operation, it) {
  bytes[it.offset++] = operation & 255;
  encode2.number(bytes, index, it);
  if (operation === OPERATION.DELETE) {
    return;
  }
  const ref = changeTree.ref;
  if ((operation & OPERATION.ADD) === OPERATION.ADD) {
    if (typeof ref["set"] === "function") {
      const dynamicIndex = changeTree.ref["$indexes"].get(index);
      encode2.string(bytes, dynamicIndex, it);
    }
  }
  const type2 = ref[$childType];
  const value = ref[$getByIndex](index);
  encodeValue(encoder, bytes, type2, value, operation, it);
};
var encodeArray = function(encoder, bytes, changeTree, field, operation, it, isEncodeAll, hasView) {
  const ref = changeTree.ref;
  const useOperationByRefId = hasView && changeTree.isFiltered && typeof changeTree.getType(field) !== "string";
  let refOrIndex;
  if (useOperationByRefId) {
    const item = ref["tmpItems"][field];
    if (!item) {
      return;
    }
    refOrIndex = item[$changes].refId;
    if (operation === OPERATION.DELETE) {
      operation = OPERATION.DELETE_BY_REFID;
    } else if (operation === OPERATION.ADD) {
      operation = OPERATION.ADD_BY_REFID;
    }
  } else {
    refOrIndex = field;
  }
  bytes[it.offset++] = operation & 255;
  encode2.number(bytes, refOrIndex, it);
  if (operation === OPERATION.DELETE || operation === OPERATION.DELETE_BY_REFID) {
    return;
  }
  const type2 = changeTree.getType(field);
  const value = changeTree.getValue(field, isEncodeAll);
  encodeValue(encoder, bytes, type2, value, operation, it);
};
var DEFINITION_MISMATCH = -1;
function decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges) {
  const $root = decoder2.root;
  const previousValue = ref[$getByIndex](index);
  let value;
  if ((operation & OPERATION.DELETE) === OPERATION.DELETE) {
    const previousRefId = $root.refIds.get(previousValue);
    if (previousRefId !== void 0) {
      $root.removeRef(previousRefId);
    }
    if (operation !== OPERATION.DELETE_AND_ADD) {
      ref[$deleteByIndex](index);
    }
    value = void 0;
  }
  if (operation === OPERATION.DELETE) ;
  else if (Schema.is(type2)) {
    const refId = decode2.number(bytes, it);
    value = $root.refs.get(refId);
    if ((operation & OPERATION.ADD) === OPERATION.ADD) {
      const childType = decoder2.getInstanceType(bytes, it, type2);
      if (!value) {
        value = decoder2.createInstanceOfType(childType);
      }
      $root.addRef(refId, value, value !== previousValue || // increment ref count if value has changed
      operation === OPERATION.DELETE_AND_ADD && value === previousValue);
    }
  } else if (typeof type2 === "string") {
    value = decode2[type2](bytes, it);
  } else {
    const typeDef = getType(Object.keys(type2)[0]);
    const refId = decode2.number(bytes, it);
    const valueRef = $root.refs.has(refId) ? previousValue || $root.refs.get(refId) : new typeDef.constructor();
    value = valueRef.clone(true);
    value[$childType] = Object.values(type2)[0];
    if (previousValue) {
      let previousRefId = $root.refIds.get(previousValue);
      if (previousRefId !== void 0 && refId !== previousRefId) {
        const entries = previousValue.entries();
        let iter;
        while ((iter = entries.next()) && !iter.done) {
          const [key, value2] = iter.value;
          if (typeof value2 === "object") {
            previousRefId = $root.refIds.get(value2);
            $root.removeRef(previousRefId);
          }
          allChanges.push({
            ref: previousValue,
            refId: previousRefId,
            op: OPERATION.DELETE,
            field: key,
            value: void 0,
            previousValue: value2
          });
        }
      }
    }
    $root.addRef(refId, value, valueRef !== previousValue || operation === OPERATION.DELETE_AND_ADD && valueRef === previousValue);
  }
  return { value, previousValue };
}
var decodeSchemaOperation = function(decoder2, bytes, it, ref, allChanges) {
  const first_byte = bytes[it.offset++];
  const metadata = ref.constructor[Symbol.metadata];
  const operation = first_byte >> 6 << 6;
  const index = first_byte % (operation || 255);
  const field = metadata[index];
  if (field === void 0) {
    console.warn("@colyseus/schema: field not defined at", { index, ref: ref.constructor.name, metadata });
    return DEFINITION_MISMATCH;
  }
  const { value, previousValue } = decodeValue(decoder2, operation, ref, index, field.type, bytes, it, allChanges);
  if (value !== null && value !== void 0) {
    ref[field.name] = value;
  }
  if (previousValue !== value) {
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: operation,
      field: field.name,
      value,
      previousValue
    });
  }
};
var decodeKeyValueOperation = function(decoder2, bytes, it, ref, allChanges) {
  const operation = bytes[it.offset++];
  if (operation === OPERATION.CLEAR) {
    decoder2.removeChildRefs(ref, allChanges);
    ref.clear();
    return;
  }
  const index = decode2.number(bytes, it);
  const type2 = ref[$childType];
  let dynamicIndex;
  if ((operation & OPERATION.ADD) === OPERATION.ADD) {
    if (typeof ref["set"] === "function") {
      dynamicIndex = decode2.string(bytes, it);
      ref["setIndex"](index, dynamicIndex);
    } else {
      dynamicIndex = index;
    }
  } else {
    dynamicIndex = ref["getIndex"](index);
  }
  const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges);
  if (value !== null && value !== void 0) {
    if (typeof ref["set"] === "function") {
      ref["$items"].set(dynamicIndex, value);
    } else if (typeof ref["$setAt"] === "function") {
      ref["$setAt"](index, value, operation);
    } else if (typeof ref["add"] === "function") {
      const index2 = ref.add(value);
      if (typeof index2 === "number") {
        ref["setIndex"](index2, index2);
      }
    }
  }
  if (previousValue !== value) {
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: operation,
      field: "",
      // FIXME: remove this
      dynamicIndex,
      value,
      previousValue
    });
  }
};
var decodeArray = function(decoder2, bytes, it, ref, allChanges) {
  let operation = bytes[it.offset++];
  let index;
  if (operation === OPERATION.CLEAR) {
    decoder2.removeChildRefs(ref, allChanges);
    ref.clear();
    return;
  } else if (operation === OPERATION.REVERSE) {
    ref.reverse();
    return;
  } else if (operation === OPERATION.DELETE_BY_REFID) {
    const refId = decode2.number(bytes, it);
    const previousValue2 = decoder2.root.refs.get(refId);
    index = ref.findIndex((value2) => value2 === previousValue2);
    ref[$deleteByIndex](index);
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: OPERATION.DELETE,
      field: "",
      // FIXME: remove this
      dynamicIndex: index,
      value: void 0,
      previousValue: previousValue2
    });
    return;
  } else if (operation === OPERATION.ADD_BY_REFID) {
    const refId = decode2.number(bytes, it);
    const itemByRefId = decoder2.root.refs.get(refId);
    if (itemByRefId) {
      index = ref.findIndex((value2) => value2 === itemByRefId);
    }
    if (index === -1 || index === void 0) {
      index = ref.length;
    }
  } else {
    index = decode2.number(bytes, it);
  }
  const type2 = ref[$childType];
  let dynamicIndex = index;
  const { value, previousValue } = decodeValue(decoder2, operation, ref, index, type2, bytes, it, allChanges);
  if (value !== null && value !== void 0 && value !== previousValue) {
    ref["$setAt"](index, value, operation);
  }
  if (previousValue !== value) {
    allChanges.push({
      ref,
      refId: decoder2.currentRefId,
      op: operation,
      field: "",
      // FIXME: remove this
      dynamicIndex,
      value,
      previousValue
    });
  }
};
var EncodeSchemaError = class extends Error {
};
function assertType(value, type2, klass, field) {
  let typeofTarget;
  let allowNull = false;
  switch (type2) {
    case "number":
    case "int8":
    case "uint8":
    case "int16":
    case "uint16":
    case "int32":
    case "uint32":
    case "int64":
    case "uint64":
    case "float32":
    case "float64":
      typeofTarget = "number";
      if (isNaN(value)) {
        console.log(`trying to encode "NaN" in ${klass.constructor.name}#${field}`);
      }
      break;
    case "bigint64":
    case "biguint64":
      typeofTarget = "bigint";
      break;
    case "string":
      typeofTarget = "string";
      allowNull = true;
      break;
    case "boolean":
      return;
    default:
      return;
  }
  if (typeof value !== typeofTarget && (!allowNull || allowNull && value !== null)) {
    let foundValue = `'${JSON.stringify(value)}'${value && value.constructor && ` (${value.constructor.name})` || ""}`;
    throw new EncodeSchemaError(`a '${typeofTarget}' was expected, but ${foundValue} was provided in ${klass.constructor.name}#${field}`);
  }
}
function assertInstanceType(value, type2, instance, field) {
  if (!(value instanceof type2)) {
    throw new EncodeSchemaError(`a '${type2.name}' was expected, but '${value && value.constructor.name}' was provided in ${instance.constructor.name}#${field}`);
  }
}
var _a$4;
var _b$4;
var DEFAULT_SORT = (a, b) => {
  const A = a.toString();
  const B = b.toString();
  if (A < B)
    return -1;
  else if (A > B)
    return 1;
  else
    return 0;
};
var ArraySchema = class _ArraySchema {
  static {
    this[_a$4] = encodeArray;
  }
  static {
    this[_b$4] = decodeArray;
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_a$4 = $encoder, _b$4 = $decoder, $filter)](ref, index, view) {
    return !view || typeof ref[$childType] === "string" || view.isChangeTreeVisible(ref["tmpItems"][index]?.[$changes]);
  }
  static is(type2) {
    return (
      // type format: ["string"]
      Array.isArray(type2) || // type format: { array: "string" }
      type2["array"] !== void 0
    );
  }
  static from(iterable) {
    return new _ArraySchema(...Array.from(iterable));
  }
  constructor(...items) {
    this.items = [];
    this.tmpItems = [];
    this.deletedIndexes = {};
    this.isMovingItems = false;
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
    const proxy = new Proxy(this, {
      get: (obj, prop) => {
        if (typeof prop !== "symbol" && // FIXME: d8 accuses this as low performance
        !isNaN(prop)) {
          return this.items[prop];
        } else {
          return Reflect.get(obj, prop);
        }
      },
      set: (obj, key, setValue) => {
        if (typeof key !== "symbol" && !isNaN(key)) {
          if (setValue === void 0 || setValue === null) {
            obj.$deleteAt(key);
          } else {
            if (setValue[$changes]) {
              assertInstanceType(setValue, obj[$childType], obj, key);
              const previousValue = obj.items[key];
              if (!obj.isMovingItems) {
                obj.$changeAt(Number(key), setValue);
              } else {
                if (previousValue !== void 0) {
                  if (setValue[$changes].isNew) {
                    obj[$changes].indexedOperation(Number(key), OPERATION.MOVE_AND_ADD);
                  } else {
                    if ((obj[$changes].getChange(Number(key)) & OPERATION.DELETE) === OPERATION.DELETE) {
                      obj[$changes].indexedOperation(Number(key), OPERATION.DELETE_AND_MOVE);
                    } else {
                      obj[$changes].indexedOperation(Number(key), OPERATION.MOVE);
                    }
                  }
                } else if (setValue[$changes].isNew) {
                  obj[$changes].indexedOperation(Number(key), OPERATION.ADD);
                }
                setValue[$changes].setParent(this, obj[$changes].root, key);
              }
              if (previousValue !== void 0) {
                previousValue[$changes].root?.remove(previousValue[$changes]);
              }
            } else {
              obj.$changeAt(Number(key), setValue);
            }
            obj.items[key] = setValue;
            obj.tmpItems[key] = setValue;
          }
          return true;
        } else {
          return Reflect.set(obj, key, setValue);
        }
      },
      deleteProperty: (obj, prop) => {
        if (typeof prop === "number") {
          obj.$deleteAt(prop);
        } else {
          delete obj[prop];
        }
        return true;
      },
      has: (obj, key) => {
        if (typeof key !== "symbol" && !isNaN(Number(key))) {
          return Reflect.has(this.items, key);
        }
        return Reflect.has(obj, key);
      }
    });
    Object.defineProperty(this, $changes, {
      value: new ChangeTree(proxy),
      enumerable: false,
      writable: true
    });
    if (items.length > 0) {
      this.push(...items);
    }
    return proxy;
  }
  set length(newLength) {
    if (newLength === 0) {
      this.clear();
    } else if (newLength < this.items.length) {
      this.splice(newLength, this.length - newLength);
    } else {
      console.warn("ArraySchema: can't set .length to a higher value than its length.");
    }
  }
  get length() {
    return this.items.length;
  }
  push(...values) {
    let length = this.tmpItems.length;
    const changeTree = this[$changes];
    for (let i = 0, l = values.length; i < l; i++, length++) {
      const value = values[i];
      if (value === void 0 || value === null) {
        return;
      } else if (typeof value === "object" && this[$childType]) {
        assertInstanceType(value, this[$childType], this, i);
      }
      changeTree.indexedOperation(length, OPERATION.ADD, this.items.length);
      this.items.push(value);
      this.tmpItems.push(value);
      value[$changes]?.setParent(this, changeTree.root, length);
    }
    return length;
  }
  /**
   * Removes the last element from an array and returns it.
   */
  pop() {
    let index = -1;
    for (let i = this.tmpItems.length - 1; i >= 0; i--) {
      if (this.deletedIndexes[i] !== true) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return void 0;
    }
    this[$changes].delete(index, void 0, this.items.length - 1);
    this.deletedIndexes[index] = true;
    return this.items.pop();
  }
  at(index) {
    if (index < 0)
      index += this.length;
    return this.items[index];
  }
  // encoding only
  $changeAt(index, value) {
    if (value === void 0 || value === null) {
      console.error("ArraySchema items cannot be null nor undefined; Use `deleteAt(index)` instead.");
      return;
    }
    if (this.items[index] === value) {
      return;
    }
    const operation = this.items[index] !== void 0 ? typeof value === "object" ? OPERATION.DELETE_AND_ADD : OPERATION.REPLACE : OPERATION.ADD;
    const changeTree = this[$changes];
    changeTree.change(index, operation);
    value[$changes]?.setParent(this, changeTree.root, index);
  }
  // encoding only
  $deleteAt(index, operation) {
    this[$changes].delete(index, operation);
  }
  // decoding only
  $setAt(index, value, operation) {
    if (index === 0 && operation === OPERATION.ADD && this.items[index] !== void 0) {
      this.items.unshift(value);
    } else if (operation === OPERATION.DELETE_AND_MOVE) {
      this.items.splice(index, 1);
      this.items[index] = value;
    } else {
      this.items[index] = value;
    }
  }
  clear() {
    if (this.items.length === 0) {
      return;
    }
    const changeTree = this[$changes];
    changeTree.forEachChild((childChangeTree, _) => {
      changeTree.root?.remove(childChangeTree);
    });
    changeTree.discard(true);
    changeTree.operation(OPERATION.CLEAR);
    this.items.length = 0;
    this.tmpItems.length = 0;
  }
  /**
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array1.
   */
  // @ts-ignore
  concat(...items) {
    return new _ArraySchema(...this.items.concat(...items));
  }
  /**
   * Adds all the elements of an array separated by the specified separator string.
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator) {
    return this.items.join(separator);
  }
  /**
   * Reverses the elements in an Array.
   */
  // @ts-ignore
  reverse() {
    this[$changes].operation(OPERATION.REVERSE);
    this.items.reverse();
    this.tmpItems.reverse();
    return this;
  }
  /**
   * Removes the first element from an array and returns it.
   */
  shift() {
    if (this.items.length === 0) {
      return void 0;
    }
    const changeTree = this[$changes];
    const index = this.tmpItems.findIndex((item) => item === this.items[0]);
    const allChangesIndex = this.items.findIndex((item) => item === this.items[0]);
    changeTree.delete(index, OPERATION.DELETE, allChangesIndex);
    changeTree.shiftAllChangeIndexes(-1, allChangesIndex);
    this.deletedIndexes[index] = true;
    return this.items.shift();
  }
  /**
   * Returns a section of an array.
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(start, end) {
    const sliced = new _ArraySchema();
    sliced.push(...this.items.slice(start, end));
    return sliced;
  }
  /**
   * Sorts an array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if first argument is less than second argument, zero if they're equal and a positive
   * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
   * ```ts
   * [11,2,22,1].sort((a, b) => a - b)
   * ```
   */
  sort(compareFn = DEFAULT_SORT) {
    this.isMovingItems = true;
    const changeTree = this[$changes];
    const sortedItems = this.items.sort(compareFn);
    sortedItems.forEach((_, i) => changeTree.change(i, OPERATION.REPLACE));
    this.tmpItems.sort(compareFn);
    this.isMovingItems = false;
    return this;
  }
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @param insertItems Elements to insert into the array in place of the deleted elements.
   */
  splice(start, deleteCount, ...insertItems) {
    const changeTree = this[$changes];
    const itemsLength = this.items.length;
    const tmpItemsLength = this.tmpItems.length;
    const insertCount = insertItems.length;
    const indexes = [];
    for (let i = 0; i < tmpItemsLength; i++) {
      if (this.deletedIndexes[i] !== true) {
        indexes.push(i);
      }
    }
    if (itemsLength > start) {
      if (deleteCount === void 0) {
        deleteCount = itemsLength - start;
      }
      for (let i = start; i < start + deleteCount; i++) {
        const index = indexes[i];
        changeTree.delete(index, OPERATION.DELETE);
        this.deletedIndexes[index] = true;
      }
    } else {
      deleteCount = 0;
    }
    if (insertCount > 0) {
      if (insertCount > deleteCount) {
        console.error("Inserting more elements than deleting during ArraySchema#splice()");
        throw new Error("ArraySchema#splice(): insertCount must be equal or lower than deleteCount.");
      }
      for (let i = 0; i < insertCount; i++) {
        const addIndex = (indexes[start] ?? itemsLength) + i;
        changeTree.indexedOperation(addIndex, this.deletedIndexes[addIndex] ? OPERATION.DELETE_AND_ADD : OPERATION.ADD);
        insertItems[i][$changes]?.setParent(this, changeTree.root, addIndex);
      }
    }
    if (deleteCount > insertCount) {
      changeTree.shiftAllChangeIndexes(-(deleteCount - insertCount), indexes[start + insertCount]);
    }
    if (changeTree.filteredChanges !== void 0) {
      changeTree.root?.enqueueChangeTree(changeTree, "filteredChanges");
    } else {
      changeTree.root?.enqueueChangeTree(changeTree, "changes");
    }
    return this.items.splice(start, deleteCount, ...insertItems);
  }
  /**
   * Inserts new elements at the start of an array.
   * @param items  Elements to insert at the start of the Array.
   */
  unshift(...items) {
    const changeTree = this[$changes];
    changeTree.shiftChangeIndexes(items.length);
    if (changeTree.isFiltered) {
      setOperationAtIndex(changeTree.filteredChanges, this.items.length);
    } else {
      setOperationAtIndex(changeTree.allChanges, this.items.length);
    }
    items.forEach((_, index) => {
      changeTree.change(index, OPERATION.ADD);
    });
    this.tmpItems.unshift(...items);
    return this.items.unshift(...items);
  }
  /**
   * Returns the index of the first occurrence of a value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(searchElement, fromIndex) {
    return this.items.indexOf(searchElement, fromIndex);
  }
  /**
   * Returns the index of the last occurrence of a specified value in an array.
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  lastIndexOf(searchElement, fromIndex = this.length - 1) {
    return this.items.lastIndexOf(searchElement, fromIndex);
  }
  every(callbackfn, thisArg) {
    return this.items.every(callbackfn, thisArg);
  }
  /**
   * Determines whether the specified callback function returns true for any element of an array.
   * @param callbackfn A function that accepts up to three arguments. The some method calls
   * the callbackfn function for each element in the array until the callbackfn returns a value
   * which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  some(callbackfn, thisArg) {
    return this.items.some(callbackfn, thisArg);
  }
  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(callbackfn, thisArg) {
    return this.items.forEach(callbackfn, thisArg);
  }
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(callbackfn, thisArg) {
    return this.items.map(callbackfn, thisArg);
  }
  filter(callbackfn, thisArg) {
    return this.items.filter(callbackfn, thisArg);
  }
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(callbackfn, initialValue) {
    return this.items.reduce(callbackfn, initialValue);
  }
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(callbackfn, initialValue) {
    return this.items.reduceRight(callbackfn, initialValue);
  }
  /**
   * Returns the value of the first element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found, find
   * immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find(predicate, thisArg) {
    return this.items.find(predicate, thisArg);
  }
  /**
   * Returns the index of the first element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findIndex(predicate, thisArg) {
    return this.items.findIndex(predicate, thisArg);
  }
  /**
   * Returns the this object after filling the section identified by start and end with value
   * @param value value to fill array section with
   * @param start index to start filling the array at. If start is negative, it is treated as
   * length+start where length is the length of the array.
   * @param end index to stop filling the array at. If end is negative, it is treated as
   * length+end.
   */
  fill(value, start, end) {
    throw new Error("ArraySchema#fill() not implemented");
  }
  /**
   * Returns the this object after copying a section of the array identified by start and end
   * to the same array starting at position target
   * @param target If target is negative, it is treated as length+target where length is the
   * length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it
   * is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(target2, start, end) {
    throw new Error("ArraySchema#copyWithin() not implemented");
  }
  /**
   * Returns a string representation of an array.
   */
  toString() {
    return this.items.toString();
  }
  /**
   * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
   */
  toLocaleString() {
    return this.items.toLocaleString();
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
  static get [Symbol.species]() {
    return _ArraySchema;
  }
  /**
   * Returns an iterable of key, value pairs for every entry in the array
   */
  entries() {
    return this.items.entries();
  }
  /**
   * Returns an iterable of keys in the array
   */
  keys() {
    return this.items.keys();
  }
  /**
   * Returns an iterable of values in the array
   */
  values() {
    return this.items.values();
  }
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(searchElement, fromIndex) {
    return this.items.includes(searchElement, fromIndex);
  }
  //
  // ES2022
  //
  /**
   * Calls a defined callback function on each element of an array. Then, flattens the result into
   * a new array.
   * This is identical to a map followed by flat with depth 1.
   *
   * @param callback A function that accepts up to three arguments. The flatMap method calls the
   * callback function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callback function. If
   * thisArg is omitted, undefined is used as the this value.
   */
  // @ts-ignore
  flatMap(callback, thisArg) {
    throw new Error("ArraySchema#flatMap() is not supported.");
  }
  /**
   * Returns a new array with all sub-array elements concatenated into it recursively up to the
   * specified depth.
   *
   * @param depth The maximum recursion depth
   */
  // @ts-ignore
  flat(depth) {
    throw new Error("ArraySchema#flat() is not supported.");
  }
  findLast() {
    return this.items.findLast.apply(this.items, arguments);
  }
  findLastIndex(...args) {
    return this.items.findLastIndex.apply(this.items, arguments);
  }
  //
  // ES2023
  //
  with(index, value) {
    const copy2 = this.items.slice();
    if (index < 0)
      index += this.length;
    copy2[index] = value;
    return new _ArraySchema(...copy2);
  }
  toReversed() {
    return this.items.slice().reverse();
  }
  toSorted(compareFn) {
    return this.items.slice().sort(compareFn);
  }
  // @ts-ignore
  toSpliced(start, deleteCount, ...items) {
    return this.items.toSpliced.apply(copy, arguments);
  }
  shuffle() {
    return this.move((_) => {
      let currentIndex = this.items.length;
      while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
      }
    });
  }
  /**
   * Allows to move items around in the array.
   *
   * Example:
   *     state.cards.move((cards) => {
   *         [cards[4], cards[3]] = [cards[3], cards[4]];
   *         [cards[3], cards[2]] = [cards[2], cards[3]];
   *         [cards[2], cards[0]] = [cards[0], cards[2]];
   *         [cards[1], cards[1]] = [cards[1], cards[1]];
   *         [cards[0], cards[0]] = [cards[0], cards[0]];
   *     })
   *
   * @param cb
   * @returns
   */
  move(cb) {
    this.isMovingItems = true;
    cb(this);
    this.isMovingItems = false;
    return this;
  }
  [$getByIndex](index, isEncodeAll = false) {
    return isEncodeAll ? this.items[index] : this.deletedIndexes[index] ? this.items[index] : this.tmpItems[index] || this.items[index];
  }
  [$deleteByIndex](index) {
    this.items[index] = void 0;
    this.tmpItems[index] = void 0;
  }
  [$onEncodeEnd]() {
    this.tmpItems = this.items.slice();
    this.deletedIndexes = {};
  }
  [$onDecodeEnd]() {
    this.items = this.items.filter((item) => item !== void 0);
    this.tmpItems = this.items.slice();
  }
  toArray() {
    return this.items.slice(0);
  }
  toJSON() {
    return this.toArray().map((value) => {
      return typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
    });
  }
  //
  // Decoding utilities
  //
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = new _ArraySchema();
      cloned.push(...this.items);
    } else {
      cloned = new _ArraySchema(...this.map((item) => item[$changes] ? item.clone() : item));
    }
    return cloned;
  }
};
registerType("array", { constructor: ArraySchema });
var _a$3;
var _b$3;
var MapSchema = class _MapSchema {
  static {
    this[_a$3] = encodeKeyValueOperation;
  }
  static {
    this[_b$3] = decodeKeyValueOperation;
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_a$3 = $encoder, _b$3 = $decoder, $filter)](ref, index, view) {
    return !view || typeof ref[$childType] === "string" || view.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
  }
  static is(type2) {
    return type2["map"] !== void 0;
  }
  constructor(initialValues) {
    this.$items = /* @__PURE__ */ new Map();
    this.$indexes = /* @__PURE__ */ new Map();
    this.deletedItems = {};
    const changeTree = new ChangeTree(this);
    changeTree.indexes = {};
    Object.defineProperty(this, $changes, {
      value: changeTree,
      enumerable: false,
      writable: true
    });
    if (initialValues) {
      if (initialValues instanceof Map || initialValues instanceof _MapSchema) {
        initialValues.forEach((v, k) => this.set(k, v));
      } else {
        for (const k in initialValues) {
          this.set(k, initialValues[k]);
        }
      }
    }
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.$items[Symbol.iterator]();
  }
  get [Symbol.toStringTag]() {
    return this.$items[Symbol.toStringTag];
  }
  static get [Symbol.species]() {
    return _MapSchema;
  }
  set(key, value) {
    if (value === void 0 || value === null) {
      throw new Error(`MapSchema#set('${key}', ${value}): trying to set ${value} value on '${key}'.`);
    } else if (typeof value === "object" && this[$childType]) {
      assertInstanceType(value, this[$childType], this, key);
    }
    key = key.toString();
    const changeTree = this[$changes];
    const isRef = value[$changes] !== void 0;
    let index;
    let operation;
    if (typeof changeTree.indexes[key] !== "undefined") {
      index = changeTree.indexes[key];
      operation = OPERATION.REPLACE;
      const previousValue = this.$items.get(key);
      if (previousValue === value) {
        return;
      } else if (isRef) {
        operation = OPERATION.DELETE_AND_ADD;
        if (previousValue !== void 0) {
          previousValue[$changes].root?.remove(previousValue[$changes]);
        }
      }
      if (this.deletedItems[index]) {
        delete this.deletedItems[index];
      }
    } else {
      index = changeTree.indexes[$numFields] ?? 0;
      operation = OPERATION.ADD;
      this.$indexes.set(index, key);
      changeTree.indexes[key] = index;
      changeTree.indexes[$numFields] = index + 1;
    }
    this.$items.set(key, value);
    changeTree.change(index, operation);
    if (isRef) {
      value[$changes].setParent(this, changeTree.root, index);
    }
    return this;
  }
  get(key) {
    return this.$items.get(key);
  }
  delete(key) {
    if (!this.$items.has(key)) {
      return false;
    }
    const index = this[$changes].indexes[key];
    this.deletedItems[index] = this[$changes].delete(index);
    return this.$items.delete(key);
  }
  clear() {
    const changeTree = this[$changes];
    changeTree.discard(true);
    changeTree.indexes = {};
    changeTree.forEachChild((childChangeTree, _) => {
      changeTree.root?.remove(childChangeTree);
    });
    this.$indexes.clear();
    this.$items.clear();
    changeTree.operation(OPERATION.CLEAR);
  }
  has(key) {
    return this.$items.has(key);
  }
  forEach(callbackfn) {
    this.$items.forEach(callbackfn);
  }
  entries() {
    return this.$items.entries();
  }
  keys() {
    return this.$items.keys();
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  setIndex(index, key) {
    this.$indexes.set(index, key);
  }
  getIndex(index) {
    return this.$indexes.get(index);
  }
  [$getByIndex](index) {
    return this.$items.get(this.$indexes.get(index));
  }
  [$deleteByIndex](index) {
    const key = this.$indexes.get(index);
    this.$items.delete(key);
    this.$indexes.delete(index);
  }
  [$onEncodeEnd]() {
    const changeTree = this[$changes];
    for (const indexStr in this.deletedItems) {
      const index = parseInt(indexStr);
      const key = this.$indexes.get(index);
      delete changeTree.indexes[key];
      this.$indexes.delete(index);
    }
    this.deletedItems = {};
  }
  toJSON() {
    const map2 = {};
    this.forEach((value, key) => {
      map2[key] = typeof value["toJSON"] === "function" ? value["toJSON"]() : value;
    });
    return map2;
  }
  //
  // Decoding utilities
  //
  // @ts-ignore
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = Object.assign(new _MapSchema(), this);
    } else {
      cloned = new _MapSchema();
      this.forEach((value, key) => {
        if (value[$changes]) {
          cloned.set(key, value["clone"]());
        } else {
          cloned.set(key, value);
        }
      });
    }
    return cloned;
  }
};
registerType("map", { constructor: MapSchema });
var _a$2;
var _b$2;
var CollectionSchema = class _CollectionSchema {
  static {
    this[_a$2] = encodeKeyValueOperation;
  }
  static {
    this[_b$2] = decodeKeyValueOperation;
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_a$2 = $encoder, _b$2 = $decoder, $filter)](ref, index, view) {
    return !view || typeof ref[$childType] === "string" || view.isChangeTreeVisible((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
  }
  static is(type2) {
    return type2["collection"] !== void 0;
  }
  constructor(initialValues) {
    this.$items = /* @__PURE__ */ new Map();
    this.$indexes = /* @__PURE__ */ new Map();
    this.deletedItems = {};
    this.$refId = 0;
    this[$changes] = new ChangeTree(this);
    this[$changes].indexes = {};
    if (initialValues) {
      initialValues.forEach((v) => this.add(v));
    }
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  add(value) {
    const index = this.$refId++;
    const isRef = value[$changes] !== void 0;
    if (isRef) {
      value[$changes].setParent(this, this[$changes].root, index);
    }
    this[$changes].indexes[index] = index;
    this.$indexes.set(index, index);
    this.$items.set(index, value);
    this[$changes].change(index);
    return index;
  }
  at(index) {
    const key = Array.from(this.$items.keys())[index];
    return this.$items.get(key);
  }
  entries() {
    return this.$items.entries();
  }
  delete(item) {
    const entries = this.$items.entries();
    let index;
    let entry;
    while (entry = entries.next()) {
      if (entry.done) {
        break;
      }
      if (item === entry.value[1]) {
        index = entry.value[0];
        break;
      }
    }
    if (index === void 0) {
      return false;
    }
    this.deletedItems[index] = this[$changes].delete(index);
    this.$indexes.delete(index);
    return this.$items.delete(index);
  }
  clear() {
    const changeTree = this[$changes];
    changeTree.discard(true);
    changeTree.indexes = {};
    changeTree.forEachChild((childChangeTree, _) => {
      changeTree.root?.remove(childChangeTree);
    });
    this.$indexes.clear();
    this.$items.clear();
    changeTree.operation(OPERATION.CLEAR);
  }
  has(value) {
    return Array.from(this.$items.values()).some((v) => v === value);
  }
  forEach(callbackfn) {
    this.$items.forEach((value, key, _) => callbackfn(value, key, this));
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.$items.values();
  }
  setIndex(index, key) {
    this.$indexes.set(index, key);
  }
  getIndex(index) {
    return this.$indexes.get(index);
  }
  [$getByIndex](index) {
    return this.$items.get(this.$indexes.get(index));
  }
  [$deleteByIndex](index) {
    const key = this.$indexes.get(index);
    this.$items.delete(key);
    this.$indexes.delete(index);
  }
  [$onEncodeEnd]() {
    this.deletedItems = {};
  }
  toArray() {
    return Array.from(this.$items.values());
  }
  toJSON() {
    const values = [];
    this.forEach((value, key) => {
      values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
    });
    return values;
  }
  //
  // Decoding utilities
  //
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = Object.assign(new _CollectionSchema(), this);
    } else {
      cloned = new _CollectionSchema();
      this.forEach((value) => {
        if (value[$changes]) {
          cloned.add(value["clone"]());
        } else {
          cloned.add(value);
        }
      });
    }
    return cloned;
  }
};
registerType("collection", { constructor: CollectionSchema });
var _a$1;
var _b$1;
var SetSchema = class _SetSchema {
  static {
    this[_a$1] = encodeKeyValueOperation;
  }
  static {
    this[_b$1] = decodeKeyValueOperation;
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [(_a$1 = $encoder, _b$1 = $decoder, $filter)](ref, index, view) {
    return !view || typeof ref[$childType] === "string" || view.visible.has((ref[$getByIndex](index) ?? ref.deletedItems[index])[$changes]);
  }
  static is(type2) {
    return type2["set"] !== void 0;
  }
  constructor(initialValues) {
    this.$items = /* @__PURE__ */ new Map();
    this.$indexes = /* @__PURE__ */ new Map();
    this.deletedItems = {};
    this.$refId = 0;
    this[$changes] = new ChangeTree(this);
    this[$changes].indexes = {};
    if (initialValues) {
      initialValues.forEach((v) => this.add(v));
    }
    Object.defineProperty(this, $childType, {
      value: void 0,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  add(value) {
    if (this.has(value)) {
      return false;
    }
    const index = this.$refId++;
    if (value[$changes] !== void 0) {
      value[$changes].setParent(this, this[$changes].root, index);
    }
    const operation = this[$changes].indexes[index]?.op ?? OPERATION.ADD;
    this[$changes].indexes[index] = index;
    this.$indexes.set(index, index);
    this.$items.set(index, value);
    this[$changes].change(index, operation);
    return index;
  }
  entries() {
    return this.$items.entries();
  }
  delete(item) {
    const entries = this.$items.entries();
    let index;
    let entry;
    while (entry = entries.next()) {
      if (entry.done) {
        break;
      }
      if (item === entry.value[1]) {
        index = entry.value[0];
        break;
      }
    }
    if (index === void 0) {
      return false;
    }
    this.deletedItems[index] = this[$changes].delete(index);
    this.$indexes.delete(index);
    return this.$items.delete(index);
  }
  clear() {
    const changeTree = this[$changes];
    changeTree.discard(true);
    changeTree.indexes = {};
    this.$indexes.clear();
    this.$items.clear();
    changeTree.operation(OPERATION.CLEAR);
  }
  has(value) {
    const values = this.$items.values();
    let has = false;
    let entry;
    while (entry = values.next()) {
      if (entry.done) {
        break;
      }
      if (value === entry.value) {
        has = true;
        break;
      }
    }
    return has;
  }
  forEach(callbackfn) {
    this.$items.forEach((value, key, _) => callbackfn(value, key, this));
  }
  values() {
    return this.$items.values();
  }
  get size() {
    return this.$items.size;
  }
  /** Iterator */
  [Symbol.iterator]() {
    return this.$items.values();
  }
  setIndex(index, key) {
    this.$indexes.set(index, key);
  }
  getIndex(index) {
    return this.$indexes.get(index);
  }
  [$getByIndex](index) {
    return this.$items.get(this.$indexes.get(index));
  }
  [$deleteByIndex](index) {
    const key = this.$indexes.get(index);
    this.$items.delete(key);
    this.$indexes.delete(index);
  }
  [$onEncodeEnd]() {
    this.deletedItems = {};
  }
  toArray() {
    return Array.from(this.$items.values());
  }
  toJSON() {
    const values = [];
    this.forEach((value, key) => {
      values.push(typeof value["toJSON"] === "function" ? value["toJSON"]() : value);
    });
    return values;
  }
  //
  // Decoding utilities
  //
  clone(isDecoding) {
    let cloned;
    if (isDecoding) {
      cloned = Object.assign(new _SetSchema(), this);
    } else {
      cloned = new _SetSchema();
      this.forEach((value) => {
        if (value[$changes]) {
          cloned.add(value["clone"]());
        } else {
          cloned.add(value);
        }
      });
    }
    return cloned;
  }
};
registerType("set", { constructor: SetSchema });
var DEFAULT_VIEW_TAG = -1;
function type(type2, options) {
  return function(target2, field) {
    const constructor = target2.constructor;
    if (!type2) {
      throw new Error(`${constructor.name}: @type() reference provided for "${field}" is undefined. Make sure you don't have any circular dependencies.`);
    }
    type2 = getNormalizedType(type2);
    TypeContext.register(constructor);
    const parentClass = Object.getPrototypeOf(constructor);
    const parentMetadata = parentClass[Symbol.metadata];
    const metadata = Metadata.initialize(constructor);
    let fieldIndex = metadata[field];
    if (metadata[fieldIndex] !== void 0) {
      if (metadata[fieldIndex].deprecated) {
        return;
      } else if (metadata[fieldIndex].type !== void 0) {
        try {
          throw new Error(`@colyseus/schema: Duplicate '${field}' definition on '${constructor.name}'.
Check @type() annotation`);
        } catch (e) {
          const definitionAtLine = e.stack.split("\n")[4].trim();
          throw new Error(`${e.message} ${definitionAtLine}`);
        }
      }
    } else {
      fieldIndex = metadata[$numFields] ?? (parentMetadata && parentMetadata[$numFields]) ?? -1;
      fieldIndex++;
    }
    if (options && options.manual) {
      Metadata.addField(metadata, fieldIndex, field, type2, {
        // do not declare getter/setter descriptor
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      const complexTypeKlass = typeof Object.keys(type2)[0] === "string" && getType(Object.keys(type2)[0]);
      const childType = complexTypeKlass ? Object.values(type2)[0] : type2;
      Metadata.addField(metadata, fieldIndex, field, type2, getPropertyDescriptor(`_${field}`, fieldIndex, childType, complexTypeKlass));
    }
  };
}
function getPropertyDescriptor(fieldCached, fieldIndex, type2, complexTypeKlass) {
  return {
    get: function() {
      return this[fieldCached];
    },
    set: function(value) {
      const previousValue = this[fieldCached] ?? void 0;
      if (value === previousValue) {
        return;
      }
      if (value !== void 0 && value !== null) {
        if (complexTypeKlass) {
          if (complexTypeKlass.constructor === ArraySchema && !(value instanceof ArraySchema)) {
            value = new ArraySchema(...value);
          }
          if (complexTypeKlass.constructor === MapSchema && !(value instanceof MapSchema)) {
            value = new MapSchema(value);
          }
          value[$childType] = type2;
        } else if (typeof type2 !== "string") {
          assertInstanceType(value, type2, this, fieldCached.substring(1));
        } else {
          assertType(value, type2, this, fieldCached.substring(1));
        }
        const changeTree = this[$changes];
        if (previousValue !== void 0 && previousValue[$changes]) {
          changeTree.root?.remove(previousValue[$changes]);
          this.constructor[$track](changeTree, fieldIndex, OPERATION.DELETE_AND_ADD);
        } else {
          this.constructor[$track](changeTree, fieldIndex, OPERATION.ADD);
        }
        value[$changes]?.setParent(this, changeTree.root, fieldIndex);
      } else if (previousValue !== void 0) {
        this[$changes].delete(fieldIndex);
      }
      this[fieldCached] = value;
    },
    enumerable: true,
    configurable: true
  };
}
function defineTypes(target2, fields, options) {
  for (let field in fields) {
    type(fields[field], options)(target2.prototype, field);
  }
  return target2;
}
function getIndent(level) {
  return new Array(level).fill(0).map((_, i) => i === level - 1 ? `\u2514\u2500 ` : `   `).join("");
}
function dumpChanges(schema) {
  const $root = schema[$changes].root;
  const dump = {
    ops: {},
    refs: []
  };
  let current = $root.changes.next;
  while (current) {
    const changeTree = current.changeTree;
    if (changeTree === void 0) {
      current = current.next;
      continue;
    }
    const changes = changeTree.indexedOperations;
    dump.refs.push(`refId#${changeTree.refId}`);
    for (const index in changes) {
      const op = changes[index];
      const opName = OPERATION[op];
      if (!dump.ops[opName]) {
        dump.ops[opName] = 0;
      }
      dump.ops[OPERATION[op]]++;
    }
    current = current.next;
  }
  return dump;
}
var _a;
var _b;
var Schema = class _Schema {
  static {
    this[_a] = encodeSchemaOperation;
  }
  static {
    this[_b] = decodeSchemaOperation;
  }
  /**
   * Assign the property descriptors required to track changes on this instance.
   * @param instance
   */
  static initialize(instance) {
    Object.defineProperty(instance, $changes, {
      value: new ChangeTree(instance),
      enumerable: false,
      writable: true
    });
    Object.defineProperties(instance, instance.constructor[Symbol.metadata]?.[$descriptors] || {});
  }
  static is(type2) {
    return typeof type2[Symbol.metadata] === "object";
  }
  /**
   * Track property changes
   */
  static [(_a = $encoder, _b = $decoder, $track)](changeTree, index, operation = OPERATION.ADD) {
    changeTree.change(index, operation);
  }
  /**
   * Determine if a property must be filtered.
   * - If returns false, the property is NOT going to be encoded.
   * - If returns true, the property is going to be encoded.
   *
   * Encoding with "filters" happens in two steps:
   * - First, the encoder iterates over all "not owned" properties and encodes them.
   * - Then, the encoder iterates over all "owned" properties per instance and encodes them.
   */
  static [$filter](ref, index, view) {
    const metadata = ref.constructor[Symbol.metadata];
    const tag = metadata[index]?.tag;
    if (view === void 0) {
      return tag === void 0;
    } else if (tag === void 0) {
      return true;
    } else if (tag === DEFAULT_VIEW_TAG) {
      return view.isChangeTreeVisible(ref[$changes]);
    } else {
      const tags = view.tags?.get(ref[$changes]);
      return tags && tags.has(tag);
    }
  }
  // allow inherited classes to have a constructor
  constructor(arg) {
    _Schema.initialize(this);
    if (arg) {
      Object.assign(this, arg);
    }
  }
  assign(props) {
    Object.assign(this, props);
    return this;
  }
  /**
   * (Server-side): Flag a property to be encoded for the next patch.
   * @param instance Schema instance
   * @param property string representing the property name, or number representing the index of the property.
   * @param operation OPERATION to perform (detected automatically)
   */
  setDirty(property, operation) {
    const metadata = this.constructor[Symbol.metadata];
    this[$changes].change(metadata[metadata[property]].index, operation);
  }
  clone() {
    const cloned = Object.create(this.constructor.prototype);
    _Schema.initialize(cloned);
    const metadata = this.constructor[Symbol.metadata];
    for (const fieldIndex in metadata) {
      const field = metadata[fieldIndex].name;
      if (typeof this[field] === "object" && typeof this[field]?.clone === "function") {
        cloned[field] = this[field].clone();
      } else {
        cloned[field] = this[field];
      }
    }
    return cloned;
  }
  toJSON() {
    const obj = {};
    const metadata = this.constructor[Symbol.metadata];
    for (const index in metadata) {
      const field = metadata[index];
      const fieldName = field.name;
      if (!field.deprecated && this[fieldName] !== null && typeof this[fieldName] !== "undefined") {
        obj[fieldName] = typeof this[fieldName]["toJSON"] === "function" ? this[fieldName]["toJSON"]() : this[fieldName];
      }
    }
    return obj;
  }
  /**
   * Used in tests only
   * @internal
   */
  discardAllChanges() {
    this[$changes].discardAll();
  }
  [$getByIndex](index) {
    const metadata = this.constructor[Symbol.metadata];
    return this[metadata[index].name];
  }
  [$deleteByIndex](index) {
    const metadata = this.constructor[Symbol.metadata];
    this[metadata[index].name] = void 0;
  }
  /**
   * Inspect the `refId` of all Schema instances in the tree. Optionally display the contents of the instance.
   *
   * @param ref Schema instance
   * @param showContents display JSON contents of the instance
   * @returns
   */
  static debugRefIds(ref, showContents = false, level = 0, decoder2, keyPrefix = "") {
    const contents = showContents ? ` - ${JSON.stringify(ref.toJSON())}` : "";
    const changeTree = ref[$changes];
    const refId = decoder2 ? decoder2.root.refIds.get(ref) : changeTree.refId;
    const root = decoder2 ? decoder2.root : changeTree.root;
    const refCount = root?.refCount?.[refId] > 1 ? ` [\xD7${root.refCount[refId]}]` : "";
    let output = `${getIndent(level)}${keyPrefix}${ref.constructor.name} (refId: ${refId})${refCount}${contents}
`;
    changeTree.forEachChild((childChangeTree, indexOrKey) => {
      let key = indexOrKey;
      if (typeof indexOrKey === "number" && ref["$indexes"]) {
        key = ref["$indexes"].get(indexOrKey) ?? indexOrKey;
      }
      const keyPrefix2 = ref["forEach"] !== void 0 && key !== void 0 ? `["${key}"]: ` : "";
      output += this.debugRefIds(childChangeTree.ref, showContents, level + 1, decoder2, keyPrefix2);
    });
    return output;
  }
  static debugRefIdEncodingOrder(ref, changeSet = "allChanges") {
    let encodeOrder = [];
    let current = ref[$changes].root[changeSet].next;
    while (current) {
      if (current.changeTree) {
        encodeOrder.push(current.changeTree.refId);
      }
      current = current.next;
    }
    return encodeOrder;
  }
  static debugRefIdsFromDecoder(decoder2) {
    return this.debugRefIds(decoder2.state, false, 0, decoder2);
  }
  /**
   * Return a string representation of the changes on a Schema instance.
   * The list of changes is cleared after each encode.
   *
   * @param instance Schema instance
   * @param isEncodeAll Return "full encode" instead of current change set.
   * @returns
   */
  static debugChanges(instance, isEncodeAll = false) {
    const changeTree = instance[$changes];
    const changeSet = isEncodeAll ? changeTree.allChanges : changeTree.changes;
    const changeSetName = isEncodeAll ? "allChanges" : "changes";
    let output = `${instance.constructor.name} (${changeTree.refId}) -> .${changeSetName}:
`;
    function dumpChangeSet(changeSet2) {
      changeSet2.operations.filter((op) => op).forEach((index) => {
        const operation = changeTree.indexedOperations[index];
        output += `- [${index}]: ${OPERATION[operation]} (${JSON.stringify(changeTree.getValue(Number(index), isEncodeAll))})
`;
      });
    }
    dumpChangeSet(changeSet);
    if (!isEncodeAll && changeTree.filteredChanges && changeTree.filteredChanges.operations.filter((op) => op).length > 0) {
      output += `${instance.constructor.name} (${changeTree.refId}) -> .filteredChanges:
`;
      dumpChangeSet(changeTree.filteredChanges);
    }
    if (isEncodeAll && changeTree.allFilteredChanges && changeTree.allFilteredChanges.operations.filter((op) => op).length > 0) {
      output += `${instance.constructor.name} (${changeTree.refId}) -> .allFilteredChanges:
`;
      dumpChangeSet(changeTree.allFilteredChanges);
    }
    return output;
  }
  static debugChangesDeep(ref, changeSetName = "changes") {
    let output = "";
    const rootChangeTree = ref[$changes];
    const root = rootChangeTree.root;
    const changeTrees = /* @__PURE__ */ new Map();
    const instanceRefIds = [];
    let totalOperations = 0;
    for (const [refId, changes] of Object.entries(root[changeSetName])) {
      const changeTree = root.changeTrees[refId];
      if (!changeTree) {
        continue;
      }
      let includeChangeTree = false;
      let parentChangeTrees = [];
      let parentChangeTree = changeTree.parent?.[$changes];
      if (changeTree === rootChangeTree) {
        includeChangeTree = true;
      } else {
        while (parentChangeTree !== void 0) {
          parentChangeTrees.push(parentChangeTree);
          if (parentChangeTree.ref === ref) {
            includeChangeTree = true;
            break;
          }
          parentChangeTree = parentChangeTree.parent?.[$changes];
        }
      }
      if (includeChangeTree) {
        instanceRefIds.push(changeTree.refId);
        totalOperations += Object.keys(changes).length;
        changeTrees.set(changeTree, parentChangeTrees.reverse());
      }
    }
    output += "---\n";
    output += `root refId: ${rootChangeTree.refId}
`;
    output += `Total instances: ${instanceRefIds.length} (refIds: ${instanceRefIds.join(", ")})
`;
    output += `Total changes: ${totalOperations}
`;
    output += "---\n";
    const visitedParents = /* @__PURE__ */ new WeakSet();
    for (const [changeTree, parentChangeTrees] of changeTrees.entries()) {
      parentChangeTrees.forEach((parentChangeTree, level2) => {
        if (!visitedParents.has(parentChangeTree)) {
          output += `${getIndent(level2)}${parentChangeTree.ref.constructor.name} (refId: ${parentChangeTree.refId})
`;
          visitedParents.add(parentChangeTree);
        }
      });
      const changes = changeTree.indexedOperations;
      const level = parentChangeTrees.length;
      const indent = getIndent(level);
      const parentIndex = level > 0 ? `(${changeTree.parentIndex}) ` : "";
      output += `${indent}${parentIndex}${changeTree.ref.constructor.name} (refId: ${changeTree.refId}) - changes: ${Object.keys(changes).length}
`;
      for (const index in changes) {
        const operation = changes[index];
        output += `${getIndent(level + 1)}${OPERATION[operation]}: ${index}
`;
      }
    }
    return `${output}`;
  }
};
function __decorate(decorators, target2, key, desc) {
  var c = arguments.length, r = c < 3 ? target2 : desc === null ? desc = Object.getOwnPropertyDescriptor(target2, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target2, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target2, key, r) : d(target2, key)) || r;
  return c > 3 && r && Object.defineProperty(target2, key, r), r;
}
var Root = class {
  constructor(types) {
    this.types = types;
    this.nextUniqueId = 0;
    this.refCount = {};
    this.changeTrees = {};
    this.allChanges = createChangeTreeList();
    this.allFilteredChanges = createChangeTreeList();
    this.changes = createChangeTreeList();
    this.filteredChanges = createChangeTreeList();
  }
  getNextUniqueId() {
    return this.nextUniqueId++;
  }
  add(changeTree) {
    if (changeTree.refId === void 0) {
      changeTree.refId = this.getNextUniqueId();
    }
    const isNewChangeTree = this.changeTrees[changeTree.refId] === void 0;
    if (isNewChangeTree) {
      this.changeTrees[changeTree.refId] = changeTree;
    }
    const previousRefCount = this.refCount[changeTree.refId];
    if (previousRefCount === 0) {
      const ops = changeTree.allChanges.operations;
      let len = ops.length;
      while (len--) {
        changeTree.indexedOperations[ops[len]] = OPERATION.ADD;
        setOperationAtIndex(changeTree.changes, len);
      }
    }
    this.refCount[changeTree.refId] = (previousRefCount || 0) + 1;
    return isNewChangeTree;
  }
  remove(changeTree) {
    const refCount = this.refCount[changeTree.refId] - 1;
    if (refCount <= 0) {
      changeTree.root = void 0;
      delete this.changeTrees[changeTree.refId];
      this.removeChangeFromChangeSet("allChanges", changeTree);
      this.removeChangeFromChangeSet("changes", changeTree);
      if (changeTree.filteredChanges) {
        this.removeChangeFromChangeSet("allFilteredChanges", changeTree);
        this.removeChangeFromChangeSet("filteredChanges", changeTree);
      }
      this.refCount[changeTree.refId] = 0;
      changeTree.forEachChild((child, _) => {
        if (child.removeParent(changeTree.ref)) {
          if (child.parentChain === void 0 || // no parent, remove it
          child.parentChain && this.refCount[child.refId] > 0) {
            this.remove(child);
          } else if (child.parentChain) {
            this.moveNextToParent(child);
          }
        }
      });
    } else {
      this.refCount[changeTree.refId] = refCount;
      this.recursivelyMoveNextToParent(changeTree);
    }
    return refCount;
  }
  recursivelyMoveNextToParent(changeTree) {
    this.moveNextToParent(changeTree);
    changeTree.forEachChild((child, _) => this.recursivelyMoveNextToParent(child));
  }
  moveNextToParent(changeTree) {
    if (changeTree.filteredChanges) {
      this.moveNextToParentInChangeTreeList("filteredChanges", changeTree);
      this.moveNextToParentInChangeTreeList("allFilteredChanges", changeTree);
    } else {
      this.moveNextToParentInChangeTreeList("changes", changeTree);
      this.moveNextToParentInChangeTreeList("allChanges", changeTree);
    }
  }
  moveNextToParentInChangeTreeList(changeSetName, changeTree) {
    const changeSet = this[changeSetName];
    const node = changeTree[changeSetName].queueRootNode;
    if (!node)
      return;
    const parent = changeTree.parent;
    if (!parent || !parent[$changes])
      return;
    const parentNode = parent[$changes][changeSetName]?.queueRootNode;
    if (!parentNode || parentNode === node)
      return;
    const parentPosition = parentNode.position;
    const childPosition = node.position;
    if (childPosition > parentPosition)
      return;
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      changeSet.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      changeSet.tail = node.prev;
    }
    node.prev = parentNode;
    node.next = parentNode.next;
    if (parentNode.next) {
      parentNode.next.prev = node;
    } else {
      changeSet.tail = node;
    }
    parentNode.next = node;
    this.updatePositionsAfterMove(changeSet, node, parentPosition + 1);
  }
  enqueueChangeTree(changeTree, changeSet, queueRootNode = changeTree[changeSet].queueRootNode) {
    if (queueRootNode) {
      return;
    }
    changeTree[changeSet].queueRootNode = this.addToChangeTreeList(this[changeSet], changeTree);
  }
  addToChangeTreeList(list, changeTree) {
    const node = {
      changeTree,
      next: void 0,
      prev: void 0,
      position: list.tail ? list.tail.position + 1 : 0
    };
    if (!list.next) {
      list.next = node;
      list.tail = node;
    } else {
      node.prev = list.tail;
      list.tail.next = node;
      list.tail = node;
    }
    return node;
  }
  updatePositionsAfterRemoval(list, removedPosition) {
    let current = list.next;
    let position3 = 0;
    while (current) {
      if (position3 >= removedPosition) {
        current.position = position3;
      }
      current = current.next;
      position3++;
    }
  }
  updatePositionsAfterMove(list, node, newPosition) {
    let current = list.next;
    let position3 = 0;
    while (current) {
      current.position = position3;
      current = current.next;
      position3++;
    }
  }
  removeChangeFromChangeSet(changeSetName, changeTree) {
    const changeSet = this[changeSetName];
    const node = changeTree[changeSetName].queueRootNode;
    if (node && node.changeTree === changeTree) {
      const removedPosition = node.position;
      if (node.prev) {
        node.prev.next = node.next;
      } else {
        changeSet.next = node.next;
      }
      if (node.next) {
        node.next.prev = node.prev;
      } else {
        changeSet.tail = node.prev;
      }
      this.updatePositionsAfterRemoval(changeSet, removedPosition);
      changeTree[changeSetName].queueRootNode = void 0;
      return true;
    }
    return false;
  }
};
var Encoder2 = class _Encoder {
  static {
    this.BUFFER_SIZE = typeof Buffer !== "undefined" && Buffer.poolSize || 8 * 1024;
  }
  // 8KB
  constructor(state2) {
    this.sharedBuffer = Buffer.allocUnsafe(_Encoder.BUFFER_SIZE);
    this.context = TypeContext.cache(state2.constructor);
    this.root = new Root(this.context);
    this.setState(state2);
  }
  setState(state2) {
    this.state = state2;
    this.state[$changes].setRoot(this.root);
  }
  encode(it = { offset: 0 }, view, buffer = this.sharedBuffer, changeSetName = "changes", isEncodeAll = changeSetName === "allChanges", initialOffset = it.offset) {
    const hasView = view !== void 0;
    const rootChangeTree = this.state[$changes];
    let current = this.root[changeSetName];
    while (current = current.next) {
      const changeTree = current.changeTree;
      if (hasView) {
        if (!view.isChangeTreeVisible(changeTree)) {
          view.invisible.add(changeTree);
          continue;
        }
        view.invisible.delete(changeTree);
      }
      const changeSet = changeTree[changeSetName];
      const ref = changeTree.ref;
      const numChanges = changeSet.operations.length;
      if (numChanges === 0) {
        continue;
      }
      const ctor = ref.constructor;
      const encoder = ctor[$encoder];
      const filter = ctor[$filter];
      const metadata = ctor[Symbol.metadata];
      if (hasView || it.offset > initialOffset || changeTree !== rootChangeTree) {
        buffer[it.offset++] = SWITCH_TO_STRUCTURE & 255;
        encode2.number(buffer, changeTree.refId, it);
      }
      for (let j = 0; j < numChanges; j++) {
        const fieldIndex = changeSet.operations[j];
        if (fieldIndex < 0) {
          buffer[it.offset++] = Math.abs(fieldIndex) & 255;
          continue;
        }
        const operation = isEncodeAll ? OPERATION.ADD : changeTree.indexedOperations[fieldIndex];
        if (fieldIndex === void 0 || operation === void 0 || filter && !filter(ref, fieldIndex, view)) {
          continue;
        }
        encoder(this, buffer, changeTree, fieldIndex, operation, it, isEncodeAll, hasView, metadata);
      }
    }
    if (it.offset > buffer.byteLength) {
      const newSize = Math.ceil(it.offset / (Buffer.poolSize ?? 8 * 1024)) * (Buffer.poolSize ?? 8 * 1024);
      console.warn(`@colyseus/schema buffer overflow. Encoded state is higher than default BUFFER_SIZE. Use the following to increase default BUFFER_SIZE:

    import { Encoder } from "@colyseus/schema";
    Encoder.BUFFER_SIZE = ${Math.round(newSize / 1024)} * 1024; // ${Math.round(newSize / 1024)} KB
`);
      buffer = Buffer.alloc(newSize, buffer);
      if (buffer === this.sharedBuffer) {
        this.sharedBuffer = buffer;
      }
      return this.encode({ offset: initialOffset }, view, buffer, changeSetName, isEncodeAll);
    } else {
      return buffer.subarray(0, it.offset);
    }
  }
  encodeAll(it = { offset: 0 }, buffer = this.sharedBuffer) {
    return this.encode(it, void 0, buffer, "allChanges", true);
  }
  encodeAllView(view, sharedOffset, it, bytes = this.sharedBuffer) {
    const viewOffset = it.offset;
    this.encode(it, view, bytes, "allFilteredChanges", true, viewOffset);
    return Buffer.concat([
      bytes.subarray(0, sharedOffset),
      bytes.subarray(viewOffset, it.offset)
    ]);
  }
  encodeView(view, sharedOffset, it, bytes = this.sharedBuffer) {
    const viewOffset = it.offset;
    for (const [refId, changes] of view.changes) {
      const changeTree = this.root.changeTrees[refId];
      if (changeTree === void 0) {
        view.changes.delete(refId);
        continue;
      }
      const keys = Object.keys(changes);
      if (keys.length === 0) {
        continue;
      }
      const ref = changeTree.ref;
      const ctor = ref.constructor;
      const encoder = ctor[$encoder];
      const metadata = ctor[Symbol.metadata];
      bytes[it.offset++] = SWITCH_TO_STRUCTURE & 255;
      encode2.number(bytes, changeTree.refId, it);
      for (let i = 0, numChanges = keys.length; i < numChanges; i++) {
        const index = Number(keys[i]);
        const value = changeTree.ref[$getByIndex](index);
        const operation = value !== void 0 && changes[index] || OPERATION.DELETE;
        encoder(this, bytes, changeTree, index, operation, it, false, true, metadata);
      }
    }
    view.changes.clear();
    this.encode(it, view, bytes, "filteredChanges", false, viewOffset);
    return Buffer.concat([
      bytes.subarray(0, sharedOffset),
      bytes.subarray(viewOffset, it.offset)
    ]);
  }
  discardChanges() {
    let current = this.root.changes.next;
    while (current) {
      current.changeTree.endEncode("changes");
      current = current.next;
    }
    this.root.changes = createChangeTreeList();
    current = this.root.filteredChanges.next;
    while (current) {
      current.changeTree.endEncode("filteredChanges");
      current = current.next;
    }
    this.root.filteredChanges = createChangeTreeList();
  }
  tryEncodeTypeId(bytes, baseType, targetType, it) {
    const baseTypeId = this.context.getTypeId(baseType);
    const targetTypeId = this.context.getTypeId(targetType);
    if (targetTypeId === void 0) {
      console.warn(`@colyseus/schema WARNING: Class "${targetType.name}" is not registered on TypeRegistry - Please either tag the class with @entity or define a @type() field.`);
      return;
    }
    if (baseTypeId !== targetTypeId) {
      bytes[it.offset++] = TYPE_ID & 255;
      encode2.number(bytes, targetTypeId, it);
    }
  }
  get hasChanges() {
    return this.root.changes.next !== void 0 || this.root.filteredChanges.next !== void 0;
  }
};
function spliceOne(arr, index) {
  if (index === -1 || index >= arr.length) {
    return false;
  }
  const len = arr.length - 1;
  for (let i = index; i < len; i++) {
    arr[i] = arr[i + 1];
  }
  arr.length = len;
  return true;
}
var DecodingWarning = class extends Error {
  constructor(message) {
    super(message);
    this.name = "DecodingWarning";
  }
};
var ReferenceTracker = class {
  constructor() {
    this.refs = /* @__PURE__ */ new Map();
    this.refIds = /* @__PURE__ */ new WeakMap();
    this.refCount = {};
    this.deletedRefs = /* @__PURE__ */ new Set();
    this.callbacks = {};
    this.nextUniqueId = 0;
  }
  getNextUniqueId() {
    return this.nextUniqueId++;
  }
  // for decoding
  addRef(refId, ref, incrementCount = true) {
    this.refs.set(refId, ref);
    this.refIds.set(ref, refId);
    if (incrementCount) {
      this.refCount[refId] = (this.refCount[refId] || 0) + 1;
    }
    if (this.deletedRefs.has(refId)) {
      this.deletedRefs.delete(refId);
    }
  }
  // for decoding
  removeRef(refId) {
    const refCount = this.refCount[refId];
    if (refCount === void 0) {
      try {
        throw new DecodingWarning("trying to remove refId that doesn't exist: " + refId);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    if (refCount === 0) {
      try {
        const ref = this.refs.get(refId);
        throw new DecodingWarning(`trying to remove refId '${refId}' with 0 refCount (${ref.constructor.name}: ${JSON.stringify(ref)})`);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    if ((this.refCount[refId] = refCount - 1) <= 0) {
      this.deletedRefs.add(refId);
    }
  }
  clearRefs() {
    this.refs.clear();
    this.deletedRefs.clear();
    this.callbacks = {};
    this.refCount = {};
  }
  // for decoding
  garbageCollectDeletedRefs() {
    this.deletedRefs.forEach((refId) => {
      if (this.refCount[refId] > 0) {
        return;
      }
      const ref = this.refs.get(refId);
      if (ref.constructor[Symbol.metadata] !== void 0) {
        const metadata = ref.constructor[Symbol.metadata];
        for (const index in metadata) {
          const field = metadata[index].name;
          const childRefId = typeof ref[field] === "object" && this.refIds.get(ref[field]);
          if (childRefId && !this.deletedRefs.has(childRefId)) {
            this.removeRef(childRefId);
          }
        }
      } else {
        if (typeof ref[$childType] === "function") {
          Array.from(ref.values()).forEach((child) => {
            const childRefId = this.refIds.get(child);
            if (!this.deletedRefs.has(childRefId)) {
              this.removeRef(childRefId);
            }
          });
        }
      }
      this.refs.delete(refId);
      delete this.refCount[refId];
      delete this.callbacks[refId];
    });
    this.deletedRefs.clear();
  }
  addCallback(refId, fieldOrOperation, callback) {
    if (refId === void 0) {
      const name = typeof fieldOrOperation === "number" ? OPERATION[fieldOrOperation] : fieldOrOperation;
      throw new Error(`Can't addCallback on '${name}' (refId is undefined)`);
    }
    if (!this.callbacks[refId]) {
      this.callbacks[refId] = {};
    }
    if (!this.callbacks[refId][fieldOrOperation]) {
      this.callbacks[refId][fieldOrOperation] = [];
    }
    this.callbacks[refId][fieldOrOperation].push(callback);
    return () => this.removeCallback(refId, fieldOrOperation, callback);
  }
  removeCallback(refId, field, callback) {
    const index = this.callbacks?.[refId]?.[field]?.indexOf(callback);
    if (index !== void 0 && index !== -1) {
      spliceOne(this.callbacks[refId][field], index);
    }
  }
};
var Decoder2 = class {
  constructor(root, context) {
    this.currentRefId = 0;
    this.setState(root);
    this.context = context || new TypeContext(root.constructor);
  }
  setState(root) {
    this.state = root;
    this.root = new ReferenceTracker();
    this.root.addRef(0, root);
  }
  decode(bytes, it = { offset: 0 }, ref = this.state) {
    const allChanges = [];
    const $root = this.root;
    const totalBytes = bytes.byteLength;
    let decoder2 = ref["constructor"][$decoder];
    this.currentRefId = 0;
    while (it.offset < totalBytes) {
      if (bytes[it.offset] == SWITCH_TO_STRUCTURE) {
        it.offset++;
        ref[$onDecodeEnd]?.();
        const nextRefId = decode2.number(bytes, it);
        const nextRef = $root.refs.get(nextRefId);
        if (!nextRef) {
          console.error(`"refId" not found: ${nextRefId}`, { previousRef: ref, previousRefId: this.currentRefId });
          console.warn("Please report this issue to the developers.");
          this.skipCurrentStructure(bytes, it, totalBytes);
        } else {
          ref = nextRef;
          decoder2 = ref.constructor[$decoder];
          this.currentRefId = nextRefId;
        }
        continue;
      }
      const result = decoder2(this, bytes, it, ref, allChanges);
      if (result === DEFINITION_MISMATCH) {
        console.warn("@colyseus/schema: definition mismatch");
        this.skipCurrentStructure(bytes, it, totalBytes);
        continue;
      }
    }
    ref[$onDecodeEnd]?.();
    this.triggerChanges?.(allChanges);
    $root.garbageCollectDeletedRefs();
    return allChanges;
  }
  skipCurrentStructure(bytes, it, totalBytes) {
    const nextIterator = { offset: it.offset };
    while (it.offset < totalBytes) {
      if (bytes[it.offset] === SWITCH_TO_STRUCTURE) {
        nextIterator.offset = it.offset + 1;
        if (this.root.refs.has(decode2.number(bytes, nextIterator))) {
          break;
        }
      }
      it.offset++;
    }
  }
  getInstanceType(bytes, it, defaultType) {
    let type2;
    if (bytes[it.offset] === TYPE_ID) {
      it.offset++;
      const type_id = decode2.number(bytes, it);
      type2 = this.context.get(type_id);
    }
    return type2 || defaultType;
  }
  createInstanceOfType(type2) {
    return new type2();
  }
  removeChildRefs(ref, allChanges) {
    const needRemoveRef = typeof ref[$childType] !== "string";
    const refId = this.root.refIds.get(ref);
    ref.forEach((value, key) => {
      allChanges.push({
        ref,
        refId,
        op: OPERATION.DELETE,
        field: key,
        value: void 0,
        previousValue: value
      });
      if (needRemoveRef) {
        this.root.removeRef(this.root.refIds.get(value));
      }
    });
  }
};
var ReflectionField = class extends Schema {
};
__decorate([
  type("string")
], ReflectionField.prototype, "name", void 0);
__decorate([
  type("string")
], ReflectionField.prototype, "type", void 0);
__decorate([
  type("number")
], ReflectionField.prototype, "referencedType", void 0);
var ReflectionType = class extends Schema {
  constructor() {
    super(...arguments);
    this.fields = new ArraySchema();
  }
};
__decorate([
  type("number")
], ReflectionType.prototype, "id", void 0);
__decorate([
  type("number")
], ReflectionType.prototype, "extendsId", void 0);
__decorate([
  type([ReflectionField])
], ReflectionType.prototype, "fields", void 0);
var Reflection = class _Reflection extends Schema {
  constructor() {
    super(...arguments);
    this.types = new ArraySchema();
  }
  /**
   * Encodes the TypeContext of an Encoder into a buffer.
   *
   * @param encoder Encoder instance
   * @param it
   * @returns
   */
  static encode(encoder, it = { offset: 0 }) {
    const context = encoder.context;
    const reflection = new _Reflection();
    const reflectionEncoder = new Encoder2(reflection);
    const rootType = context.schemas.get(encoder.state.constructor);
    if (rootType > 0) {
      reflection.rootType = rootType;
    }
    const includedTypeIds = /* @__PURE__ */ new Set();
    const pendingReflectionTypes = {};
    const addType = (type2) => {
      if (type2.extendsId === void 0 || includedTypeIds.has(type2.extendsId)) {
        includedTypeIds.add(type2.id);
        reflection.types.push(type2);
        const deps = pendingReflectionTypes[type2.id];
        if (deps !== void 0) {
          delete pendingReflectionTypes[type2.id];
          deps.forEach((childType) => addType(childType));
        }
      } else {
        if (pendingReflectionTypes[type2.extendsId] === void 0) {
          pendingReflectionTypes[type2.extendsId] = [];
        }
        pendingReflectionTypes[type2.extendsId].push(type2);
      }
    };
    context.schemas.forEach((typeid, klass) => {
      const type2 = new ReflectionType();
      type2.id = Number(typeid);
      const inheritFrom = Object.getPrototypeOf(klass);
      if (inheritFrom !== Schema) {
        type2.extendsId = context.schemas.get(inheritFrom);
      }
      const metadata = klass[Symbol.metadata];
      if (metadata !== inheritFrom[Symbol.metadata]) {
        for (const fieldIndex in metadata) {
          const index = Number(fieldIndex);
          const fieldName = metadata[index].name;
          if (!Object.prototype.hasOwnProperty.call(metadata, fieldName)) {
            continue;
          }
          const reflectionField = new ReflectionField();
          reflectionField.name = fieldName;
          let fieldType;
          const field = metadata[index];
          if (typeof field.type === "string") {
            fieldType = field.type;
          } else {
            let childTypeSchema;
            if (Schema.is(field.type)) {
              fieldType = "ref";
              childTypeSchema = field.type;
            } else {
              fieldType = Object.keys(field.type)[0];
              if (typeof field.type[fieldType] === "string") {
                fieldType += ":" + field.type[fieldType];
              } else {
                childTypeSchema = field.type[fieldType];
              }
            }
            reflectionField.referencedType = childTypeSchema ? context.getTypeId(childTypeSchema) : -1;
          }
          reflectionField.type = fieldType;
          type2.fields.push(reflectionField);
        }
      }
      addType(type2);
    });
    for (const typeid in pendingReflectionTypes) {
      pendingReflectionTypes[typeid].forEach((type2) => reflection.types.push(type2));
    }
    const buf = reflectionEncoder.encodeAll(it);
    return buf.slice(0, it.offset);
  }
  /**
   * Decodes the TypeContext from a buffer into a Decoder instance.
   *
   * @param bytes Reflection.encode() output
   * @param it
   * @returns Decoder instance
   */
  static decode(bytes, it) {
    const reflection = new _Reflection();
    const reflectionDecoder = new Decoder2(reflection);
    reflectionDecoder.decode(bytes, it);
    const typeContext = new TypeContext();
    reflection.types.forEach((reflectionType) => {
      const parentClass = typeContext.get(reflectionType.extendsId) ?? Schema;
      const schema = class _ extends parentClass {
      };
      TypeContext.register(schema);
      typeContext.add(schema, reflectionType.id);
    }, {});
    const addFields = (metadata, reflectionType, parentFieldIndex) => {
      reflectionType.fields.forEach((field, i) => {
        const fieldIndex = parentFieldIndex + i;
        if (field.referencedType !== void 0) {
          let fieldType = field.type;
          let refType = typeContext.get(field.referencedType);
          if (!refType) {
            const typeInfo = field.type.split(":");
            fieldType = typeInfo[0];
            refType = typeInfo[1];
          }
          if (fieldType === "ref") {
            Metadata.addField(metadata, fieldIndex, field.name, refType);
          } else {
            Metadata.addField(metadata, fieldIndex, field.name, { [fieldType]: refType });
          }
        } else {
          Metadata.addField(metadata, fieldIndex, field.name, field.type);
        }
      });
    };
    reflection.types.forEach((reflectionType) => {
      const schema = typeContext.get(reflectionType.id);
      const metadata = Metadata.initialize(schema);
      const inheritedTypes = [];
      let parentType = reflectionType;
      do {
        inheritedTypes.push(parentType);
        parentType = reflection.types.find((t) => t.id === parentType.extendsId);
      } while (parentType);
      let parentFieldIndex = 0;
      inheritedTypes.reverse().forEach((reflectionType2) => {
        addFields(metadata, reflectionType2, parentFieldIndex);
        parentFieldIndex += reflectionType2.fields.length;
      });
    });
    const state2 = new (typeContext.get(reflection.rootType || 0))();
    return new Decoder2(state2, typeContext);
  }
};
__decorate([
  type([ReflectionType])
], Reflection.prototype, "types", void 0);
__decorate([
  type("number")
], Reflection.prototype, "rootType", void 0);
registerType("map", { constructor: MapSchema });
registerType("array", { constructor: ArraySchema });
registerType("set", { constructor: SetSchema });
registerType("collection", { constructor: CollectionSchema });

// node_modules/@colyseus/core/build/Protocol.mjs
var Protocol = /* @__PURE__ */ ((Protocol2) => {
  Protocol2[Protocol2["JOIN_ROOM"] = 10] = "JOIN_ROOM";
  Protocol2[Protocol2["ERROR"] = 11] = "ERROR";
  Protocol2[Protocol2["LEAVE_ROOM"] = 12] = "LEAVE_ROOM";
  Protocol2[Protocol2["ROOM_DATA"] = 13] = "ROOM_DATA";
  Protocol2[Protocol2["ROOM_STATE"] = 14] = "ROOM_STATE";
  Protocol2[Protocol2["ROOM_STATE_PATCH"] = 15] = "ROOM_STATE_PATCH";
  Protocol2[Protocol2["ROOM_DATA_BYTES"] = 17] = "ROOM_DATA_BYTES";
  Protocol2[Protocol2["WS_CLOSE_NORMAL"] = 1e3] = "WS_CLOSE_NORMAL";
  Protocol2[Protocol2["WS_CLOSE_GOING_AWAY"] = 1001] = "WS_CLOSE_GOING_AWAY";
  Protocol2[Protocol2["WS_CLOSE_CONSENTED"] = 4e3] = "WS_CLOSE_CONSENTED";
  Protocol2[Protocol2["WS_CLOSE_WITH_ERROR"] = 4002] = "WS_CLOSE_WITH_ERROR";
  Protocol2[Protocol2["WS_CLOSE_DEVMODE_RESTART"] = 4010] = "WS_CLOSE_DEVMODE_RESTART";
  Protocol2[Protocol2["WS_SERVER_DISCONNECT"] = 4201] = "WS_SERVER_DISCONNECT";
  Protocol2[Protocol2["WS_TOO_MANY_CLIENTS"] = 4202] = "WS_TOO_MANY_CLIENTS";
  return Protocol2;
})(Protocol || {});
var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2[ErrorCode2["MATCHMAKE_NO_HANDLER"] = 4210] = "MATCHMAKE_NO_HANDLER";
  ErrorCode2[ErrorCode2["MATCHMAKE_INVALID_CRITERIA"] = 4211] = "MATCHMAKE_INVALID_CRITERIA";
  ErrorCode2[ErrorCode2["MATCHMAKE_INVALID_ROOM_ID"] = 4212] = "MATCHMAKE_INVALID_ROOM_ID";
  ErrorCode2[ErrorCode2["MATCHMAKE_UNHANDLED"] = 4213] = "MATCHMAKE_UNHANDLED";
  ErrorCode2[ErrorCode2["MATCHMAKE_EXPIRED"] = 4214] = "MATCHMAKE_EXPIRED";
  ErrorCode2[ErrorCode2["AUTH_FAILED"] = 4215] = "AUTH_FAILED";
  ErrorCode2[ErrorCode2["APPLICATION_ERROR"] = 4216] = "APPLICATION_ERROR";
  ErrorCode2[ErrorCode2["INVALID_PAYLOAD"] = 4217] = "INVALID_PAYLOAD";
  return ErrorCode2;
})(ErrorCode || {});
var IpcProtocol = /* @__PURE__ */ ((IpcProtocol2) => {
  IpcProtocol2[IpcProtocol2["SUCCESS"] = 0] = "SUCCESS";
  IpcProtocol2[IpcProtocol2["ERROR"] = 1] = "ERROR";
  IpcProtocol2[IpcProtocol2["TIMEOUT"] = 2] = "TIMEOUT";
  return IpcProtocol2;
})(IpcProtocol || {});
var packr = new Packr({
  useRecords: false
  // increased compatibility with decoders other than "msgpackr"
});
packr.encode(void 0);
var getMessageBytes = {
  [
    10
    /* JOIN_ROOM */
  ]: (reconnectionToken, serializerId, handshake) => {
    const it = { offset: 1 };
    packr.buffer[0] = 10;
    packr.buffer[it.offset++] = Buffer.byteLength(reconnectionToken, "utf8");
    encode2.utf8Write(packr.buffer, reconnectionToken, it);
    packr.buffer[it.offset++] = Buffer.byteLength(serializerId, "utf8");
    encode2.utf8Write(packr.buffer, serializerId, it);
    let handshakeLength = handshake?.byteLength || 0;
    if (handshakeLength > packr.buffer.byteLength - it.offset) {
      packr.useBuffer(Buffer.alloc(it.offset + handshakeLength, packr.buffer));
    }
    if (handshakeLength > 0) {
      handshake.copy(packr.buffer, it.offset, 0, handshakeLength);
    }
    return Buffer.from(packr.buffer.subarray(0, it.offset + handshakeLength));
  },
  [
    11
    /* ERROR */
  ]: (code, message = "") => {
    const it = { offset: 1 };
    packr.buffer[0] = 11;
    encode2.number(packr.buffer, code, it);
    encode2.string(packr.buffer, message, it);
    return Buffer.from(packr.buffer.subarray(0, it.offset));
  },
  [
    14
    /* ROOM_STATE */
  ]: (bytes) => {
    return [14, ...bytes];
  },
  raw: (code, type2, message, rawMessage) => {
    const it = { offset: 1 };
    packr.buffer[0] = code;
    if (typeof type2 === "string") {
      encode2.string(packr.buffer, type2, it);
    } else {
      encode2.number(packr.buffer, type2, it);
    }
    if (message !== void 0) {
      packr.position = 0;
      if (process.env.NODE_ENV !== "production") {
        packr.useBuffer(packr.buffer);
      }
      const endOfBufferOffset = packr.pack(message, 2048 + it.offset).byteLength;
      return Buffer.from(packr.buffer.subarray(0, endOfBufferOffset));
    } else if (rawMessage !== void 0) {
      if (rawMessage.length + it.offset > packr.buffer.byteLength) {
        packr.useBuffer(Buffer.alloc(it.offset + rawMessage.length, packr.buffer));
      }
      packr.buffer.set(rawMessage, it.offset);
      return Buffer.from(packr.buffer.subarray(0, it.offset + rawMessage.byteLength));
    } else {
      return Buffer.from(packr.buffer.subarray(0, it.offset));
    }
  }
};

// node_modules/@colyseus/core/build/errors/ServerError.mjs
var ServerError = class _ServerError extends Error {
  constructor(code = ErrorCode.MATCHMAKE_UNHANDLED, message) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _ServerError);
    }
    this.name = "ServerError";
    this.code = code;
  }
};

// node_modules/@colyseus/core/build/Debug.mjs
var debugConnection = (0, import_debug.default)("colyseus:connection");
var debugDriver = (0, import_debug.default)("colyseus:driver");
var debugError = (0, import_debug.default)("colyseus:errors");
var debugMatchMaking = (0, import_debug.default)("colyseus:matchmaking");
var debugMessage = (0, import_debug.default)("colyseus:message");
var debugPatch = (0, import_debug.default)("colyseus:patch");
var debugPresence = (0, import_debug.default)("colyseus:presence");
var debugAndPrintError = (e) => {
  const message = e instanceof Error ? e.stack : e;
  if (!(e instanceof ServerError)) {
    logger.error(message);
  }
  debugError.call(debugError, message);
};

// node_modules/@colyseus/core/build/MatchMaker.mjs
var MatchMaker_exports = {};
__export(MatchMaker_exports, {
  MatchMakerState: () => MatchMakerState,
  accept: () => accept,
  controller: () => controller_default,
  create: () => create,
  createRoom: () => createRoom,
  defineRoomType: () => defineRoomType,
  disconnectAll: () => disconnectAll,
  driver: () => driver,
  findOneRoomAvailable: () => findOneRoomAvailable,
  getHandler: () => getHandler,
  getLocalRoomById: () => getLocalRoomById,
  getRoomById: () => getRoomById,
  getRoomClass: () => getRoomClass,
  gracefullyShutdown: () => gracefullyShutdown,
  handleCreateRoom: () => handleCreateRoom,
  hasHandler: () => hasHandler,
  healthCheckAllProcesses: () => healthCheckAllProcesses,
  healthCheckProcessId: () => healthCheckProcessId,
  join: () => join,
  joinById: () => joinById,
  joinOrCreate: () => joinOrCreate,
  onReady: () => onReady,
  presence: () => presence,
  processId: () => processId,
  publicAddress: () => publicAddress,
  query: () => query,
  reconnect: () => reconnect,
  remoteRoomCall: () => remoteRoomCall,
  removeRoomType: () => removeRoomType,
  reserveSeatFor: () => reserveSeatFor,
  selectProcessIdToCreateRoom: () => selectProcessIdToCreateRoom,
  setHealthChecksEnabled: () => setHealthChecksEnabled,
  setup: () => setup,
  state: () => state,
  stats: () => Stats_exports
});
var import_events4 = require("events");

// node_modules/@colyseus/core/build/utils/Utils.mjs
var import_nanoid = __toESM(require_nanoid(), 1);
var REMOTE_ROOM_SHORT_TIMEOUT = Number(process.env.COLYSEUS_PRESENCE_SHORT_TIMEOUT || 2e3);
var MAX_CONCURRENT_CREATE_ROOM_WAIT_TIME = Number(process.env.COLYSEUS_MAX_CONCURRENT_CREATE_ROOM_WAIT_TIME || 0.5);
function generateId(length = 9) {
  return (0, import_nanoid.default)(length);
}
function getBearerToken(authHeader) {
  return authHeader && authHeader.startsWith("Bearer ") && authHeader.substring(7, authHeader.length) || void 0;
}
var signals = ["SIGINT", "SIGTERM", "SIGUSR2"];
function registerGracefulShutdown(callback) {
  process.on("uncaughtException", (err) => {
    debugAndPrintError(err);
    callback(err);
  });
  signals.forEach((signal) => process.once(signal, () => callback()));
}
function retry(cb, maxRetries = 3, errorWhiteList = [], retries = 0) {
  return new Promise((resolve, reject) => {
    cb().then(resolve).catch((e) => {
      if (errorWhiteList.indexOf(e.constructor) !== -1 && retries++ < maxRetries) {
        setTimeout(() => {
          retry(cb, maxRetries, errorWhiteList, retries).then(resolve).catch((e2) => reject(e2));
        }, Math.floor(Math.random() * Math.pow(2, retries) * 400));
      } else {
        reject(e);
      }
    });
  });
}
function spliceOne2(arr, index) {
  if (index === -1 || index >= arr.length) {
    return false;
  }
  const len = arr.length - 1;
  for (let i = index; i < len; i++) {
    arr[i] = arr[i + 1];
  }
  arr.length = len;
  return true;
}
var Deferred = class _Deferred {
  constructor(promise) {
    this.promise = promise ?? new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  then(func) {
    return this.promise.then.apply(this.promise, arguments);
  }
  catch(func) {
    return this.promise.catch(func);
  }
  static reject(reason) {
    return new _Deferred(Promise.reject(reason));
  }
  static resolve(value) {
    return new _Deferred(Promise.resolve(value));
  }
};
function merge(a, ...objs) {
  for (let i = 0, len = objs.length; i < len; i++) {
    const b = objs[i];
    for (const key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
  }
  return a;
}
function wrapTryCatch(method, onError, exceptionClass, methodName, rethrow = false, ...additionalErrorArgs) {
  return (...args) => {
    try {
      const result = method(...args);
      if (typeof result?.catch === "function") {
        return result.catch((e) => {
          onError(new exceptionClass(e, e.message, ...args, ...additionalErrorArgs), methodName);
          if (rethrow) {
            throw e;
          }
        });
      }
      return result;
    } catch (e) {
      onError(new exceptionClass(e, e.message, ...args, ...additionalErrorArgs), methodName);
      if (rethrow) {
        throw e;
      }
    }
  };
}

// node_modules/@colyseus/core/build/IPC.mjs
async function requestFromIPC(presence2, publishToChannel, method, args, rejectionTimeout = REMOTE_ROOM_SHORT_TIMEOUT) {
  return new Promise(async (resolve, reject) => {
    let unsubscribeTimeout;
    const requestId = generateId();
    const channel = `ipc:${requestId}`;
    const unsubscribe = () => {
      presence2.unsubscribe(channel);
      clearTimeout(unsubscribeTimeout);
    };
    await presence2.subscribe(channel, (message) => {
      const [code, data] = message;
      if (code === IpcProtocol.SUCCESS) {
        resolve(data);
      } else if (code === IpcProtocol.ERROR) {
        let error = data;
        try {
          error = JSON.parse(data);
        } catch (e) {
        }
        if (typeof error === "string") {
          error = new Error(error);
        }
        reject(error);
      }
      unsubscribe();
    });
    presence2.publish(publishToChannel, [method, requestId, args]);
    unsubscribeTimeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("ipc_timeout"));
    }, rejectionTimeout);
  });
}
async function subscribeIPC(presence2, channel, replyCallback) {
  await presence2.subscribe(channel, (message) => {
    const [method, requestId, args] = message;
    const reply = (code, data) => {
      presence2.publish(`ipc:${requestId}`, [code, data]);
    };
    let response;
    try {
      response = replyCallback(method, args);
    } catch (e) {
      debugAndPrintError(e);
      const error = typeof e.code !== "undefined" ? { code: e.code, message: e.message } : e.message;
      return reply(IpcProtocol.ERROR, JSON.stringify(error));
    }
    if (!(response instanceof Promise)) {
      return reply(IpcProtocol.SUCCESS, response);
    }
    response.then((result) => reply(IpcProtocol.SUCCESS, result)).catch((e) => {
      const err = e && e.message || e;
      reply(IpcProtocol.ERROR, err);
    });
  });
}
function subscribeWithTimeout(presence2, channel, timeout) {
  return new Promise((resolve, reject) => {
    let timeoutHandle;
    let resolved = false;
    const unsubscribe = () => {
      presence2.unsubscribe(channel);
      clearTimeout(timeoutHandle);
    };
    presence2.subscribe(channel, (roomId) => {
      if (resolved) return;
      resolved = true;
      unsubscribe();
      resolve(roomId);
    });
    timeoutHandle = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      unsubscribe();
      reject(new Error("timeout"));
    }, timeout);
  });
}

// node_modules/@colyseus/core/build/utils/DevMode.mjs
var import_debug2 = __toESM(require_src(), 1);
var debugDevMode = (0, import_debug2.default)("colyseus:devmode");
var isDevMode = false;
function setDevMode(bool) {
  isDevMode = bool;
}
async function reloadFromCache() {
  const roomHistoryList = Object.entries(await presence.hgetall(getRoomRestoreListKey()));
  debugDevMode("rooms to restore: %i", roomHistoryList.length);
  for (const [roomId, value] of roomHistoryList) {
    const roomHistory = JSON.parse(value);
    debugDevMode("restoring room %s (%s)", roomHistory.roomName, roomId);
    const recreatedRoomListing = await handleCreateRoom(roomHistory.roomName, roomHistory.clientOptions, roomId);
    const recreatedRoom = getLocalRoomById(recreatedRoomListing.roomId);
    logger.debug(`\u{1F504} room '${roomId}' has been restored.`);
    if (roomHistory.hasOwnProperty("state")) {
      recreatedRoom.state.decode(roomHistory.state);
      recreatedRoom.setState(recreatedRoom.state.clone());
      logger.debug(`\u{1F4CB} room '${roomId}' state =>`, recreatedRoom.state.toJSON());
    }
    recreatedRoom.onRestoreRoom?.(roomHistory["cache"]);
    if (roomHistory.clients) {
      for (const previousSessionId of roomHistory.clients) {
        await remoteRoomCall(recreatedRoomListing.roomId, "_reserveSeat", [previousSessionId, {}, 20, false, true]);
      }
    }
  }
  if (roomHistoryList.length > 0) {
    logger.debug("\u2705", roomHistoryList.length, "room(s) have been restored.");
  }
}
async function cacheRoomHistory(rooms2) {
  for (const room of Object.values(rooms2)) {
    const roomHistoryResult = await presence.hget(getRoomRestoreListKey(), room.roomId);
    if (roomHistoryResult) {
      try {
        const roomHistory = JSON.parse(roomHistoryResult);
        roomHistory["cache"] = room.onCacheRoom?.();
        debugDevMode("caching room %s (%s)", room.roomName, room.roomId);
        if (room.state) {
          roomHistory["state"] = room.state.encodeAll();
        }
        roomHistory["clients"] = room.clients.map((client) => client.sessionId);
        for (const sessionId in room["reservedSeats"]) {
          roomHistory["clients"].push(sessionId);
        }
        await presence.hset(getRoomRestoreListKey(), room.roomId, JSON.stringify(roomHistory));
        logger.debug(`\u{1F4BE} caching room '${room.roomId}' (clients: ${room.clients.length}, state size: ${(roomHistory["state"] || []).length} bytes)`);
      } catch (e) {
        debugAndPrintError(`\u274C couldn't cache room '${room.roomId}', due to:
${e.stack}`);
      }
    }
  }
}
async function getPreviousProcessId(hostname) {
  return await presence.hget(getProcessRestoreKey(), hostname);
}
function getRoomRestoreListKey() {
  return "roomhistory";
}
function getProcessRestoreKey() {
  return "processhistory";
}

// node_modules/@colyseus/core/build/matchmaker/RegisteredHandler.mjs
var import_events = require("events");

// node_modules/@colyseus/core/build/matchmaker/Lobby.mjs
var LOBBY_CHANNEL = "$lobby";
function updateLobby(room, removed = false) {
  const listing = room.listing;
  if (listing.unlisted) return;
  if (removed) {
    presence.publish(LOBBY_CHANNEL, `${listing.roomId},1`);
  } else if (!listing.private) {
    presence.publish(LOBBY_CHANNEL, `${listing.roomId},0`);
  }
}

// node_modules/@colyseus/core/build/matchmaker/RegisteredHandler.mjs
var INVALID_OPTION_KEYS = [
  "clients",
  "locked",
  "private",
  // 'maxClients', - maxClients can be useful as filter options
  "metadata",
  "name",
  "processId",
  "roomId"
];
var RegisteredHandler = class extends import_events.EventEmitter {
  constructor(name, klass, options) {
    super();
    this.name = name;
    this.klass = klass;
    this.options = options;
    this.filterOptions = [];
    if (typeof klass !== "function") {
      logger.debug("You are likely not importing your room class correctly.");
      throw new Error(`class is expected but ${typeof klass} was provided.`);
    }
  }
  enableRealtimeListing() {
    this.on("create", (room) => updateLobby(room));
    this.on("lock", (room) => updateLobby(room));
    this.on("unlock", (room) => updateLobby(room));
    this.on("join", (room) => updateLobby(room));
    this.on("leave", (room, _, willDispose) => {
      if (!willDispose) {
        updateLobby(room);
      }
    });
    this.on("dispose", (room) => updateLobby(room, false));
    this.on("visibility-change", (room, isVisible) => updateLobby(room, isVisible));
    return this;
  }
  filterBy(options) {
    this.filterOptions = options;
    return this;
  }
  sortBy(options) {
    this.sortOptions = options;
    return this;
  }
  getFilterOptions(options) {
    return this.filterOptions.reduce((prev, curr, i, arr) => {
      const field = arr[i];
      if (options.hasOwnProperty(field)) {
        if (INVALID_OPTION_KEYS.indexOf(field) !== -1) {
          logger.warn(`option "${field}" has internal usage and is going to be ignored.`);
        } else {
          prev[field] = options[field];
        }
      }
      return prev;
    }, {});
  }
};

// node_modules/@colyseus/core/build/Room.mjs
var import_events2 = require("events");

// node_modules/@colyseus/core/build/serializer/NoneSerializer.mjs
var NoneSerializer = class {
  constructor() {
    this.id = "none";
  }
  reset(data) {
  }
  getFullState(client) {
    return null;
  }
  applyPatches(clients, state2) {
    return false;
  }
};

// node_modules/@colyseus/core/build/Transport.mjs
var Transport = class {
};
var ClientState = /* @__PURE__ */ ((ClientState2) => {
  ClientState2[ClientState2["JOINING"] = 0] = "JOINING";
  ClientState2[ClientState2["JOINED"] = 1] = "JOINED";
  ClientState2[ClientState2["RECONNECTED"] = 2] = "RECONNECTED";
  ClientState2[ClientState2["LEAVING"] = 3] = "LEAVING";
  ClientState2[ClientState2["CLOSED"] = 4] = "CLOSED";
  return ClientState2;
})(ClientState || {});
var ClientArray = class extends Array {
  getById(sessionId) {
    return this.find((client) => client.sessionId === sessionId);
  }
  delete(client) {
    return spliceOne2(this, this.indexOf(client));
  }
};

// node_modules/@colyseus/core/build/serializer/SchemaSerializer.mjs
var SHARED_VIEW = {};
var SchemaSerializer = class {
  constructor() {
    this.id = "schema";
    this.hasFilters = false;
    this.needFullEncode = true;
    this.fullEncodeBuffer = Buffer.allocUnsafe(Encoder2.BUFFER_SIZE);
    this.sharedOffsetCache = { offset: 0 };
  }
  reset(newState) {
    this.encoder = new Encoder2(newState);
    this.hasFilters = this.encoder.context.hasFilters;
    this.fullEncodeBuffer[0] = Protocol.ROOM_STATE;
    if (this.hasFilters) {
      this.encodedViews = /* @__PURE__ */ new Map();
    }
  }
  getFullState(client) {
    if (this.needFullEncode || this.encoder.root.changes.length > 0 || // TODO: remove this check on 0.17
    // @ts-ignore
    this.encoder.root.changes.next !== void 0) {
      this.sharedOffsetCache = { offset: 1 };
      this.fullEncodeCache = this.encoder.encodeAll(this.sharedOffsetCache, this.fullEncodeBuffer);
      this.needFullEncode = false;
    }
    if (this.hasFilters && client?.view) {
      return this.encoder.encodeAllView(
        client.view,
        this.sharedOffsetCache.offset,
        { ...this.sharedOffsetCache },
        this.fullEncodeBuffer
      );
    } else {
      return this.fullEncodeCache;
    }
  }
  applyPatches(clients) {
    let numClients = clients.length;
    if (numClients === 0) {
      this.encoder.discardChanges();
      return false;
    }
    if (!this.encoder.hasChanges) {
      if (this.hasFilters) {
        const clientsWithViewChange = clients.filter((client) => {
          return client.state === ClientState.JOINED && client.view?.changes.size > 0;
        });
        if (clientsWithViewChange.length > 0) {
          const it2 = { offset: 1 };
          const sharedOffset = it2.offset;
          this.encoder.sharedBuffer[0] = Protocol.ROOM_STATE_PATCH;
          clientsWithViewChange.forEach((client) => {
            client.raw(this.encoder.encodeView(client.view, sharedOffset, it2));
          });
        }
      }
      return false;
    }
    this.needFullEncode = true;
    if (debugPatch.enabled) {
      debugPatch.dumpChanges = dumpChanges(this.encoder.state);
    }
    const it = { offset: 1 };
    this.encoder.sharedBuffer[0] = Protocol.ROOM_STATE_PATCH;
    const encodedChanges = this.encoder.encode(it);
    if (!this.hasFilters) {
      while (numClients--) {
        const client = clients[numClients];
        if (client.state !== ClientState.JOINED) {
          continue;
        }
        client.raw(encodedChanges);
      }
    } else {
      const sharedOffset = it.offset;
      while (numClients--) {
        const client = clients[numClients];
        if (client.state !== ClientState.JOINED) {
          continue;
        }
        const view = client.view || SHARED_VIEW;
        let encodedView = this.encodedViews.get(view);
        if (encodedView === void 0) {
          encodedView = view === SHARED_VIEW ? encodedChanges : this.encoder.encodeView(client.view, sharedOffset, it);
          this.encodedViews.set(view, encodedView);
        }
        client.raw(encodedView);
      }
      this.encodedViews.clear();
    }
    this.encoder.discardChanges();
    if (debugPatch.enabled) {
      debugPatch(
        "%d bytes sent to %d clients, %j",
        encodedChanges.length,
        clients.length,
        debugPatch.dumpChanges
      );
    }
    return true;
  }
  handshake() {
    if (!this.handshakeCache) {
      this.handshakeCache = this.encoder.state && Reflection.encode(this.encoder);
    }
    return this.handshakeCache;
  }
};

// node_modules/@colyseus/core/build/errors/RoomExceptions.mjs
var OnCreateException = class extends Error {
  constructor(cause, message, options) {
    super(message, { cause });
    this.options = options;
    this.name = "OnCreateException";
  }
};
var OnAuthException = class extends Error {
  constructor(cause, message, client, options) {
    super(message, { cause });
    this.client = client;
    this.options = options;
    this.name = "OnAuthException";
  }
};
var OnJoinException = class extends Error {
  constructor(cause, message, client, options, auth) {
    super(message, { cause });
    this.client = client;
    this.options = options;
    this.auth = auth;
    this.name = "OnJoinException";
  }
};
var OnLeaveException = class extends Error {
  constructor(cause, message, client, consented) {
    super(message, { cause });
    this.client = client;
    this.consented = consented;
    this.name = "OnLeaveException";
  }
};
var OnDisposeException = class extends Error {
  constructor(cause, message) {
    super(message, { cause });
    this.name = "OnDisposeException";
  }
};
var OnMessageException = class extends Error {
  constructor(cause, message, client, payload, type2) {
    super(message, { cause });
    this.client = client;
    this.payload = payload;
    this.type = type2;
    this.name = "OnMessageException";
  }
};
var SimulationIntervalException = class extends Error {
  constructor(cause, message) {
    super(message, { cause });
    this.name = "SimulationIntervalException";
  }
};
var TimedEventException = class extends Error {
  constructor(cause, message, ...args) {
    super(message, { cause });
    this.name = "TimedEventException";
    this.args = args;
  }
};

// node_modules/@colyseus/core/build/Room.mjs
var DEFAULT_PATCH_RATE = 1e3 / 20;
var DEFAULT_SIMULATION_INTERVAL = 1e3 / 60;
var noneSerializer = new NoneSerializer();
var DEFAULT_SEAT_RESERVATION_TIME = Number(process.env.COLYSEUS_SEAT_RESERVATION_TIME || 15);
var RoomInternalState = /* @__PURE__ */ ((RoomInternalState2) => {
  RoomInternalState2[RoomInternalState2["CREATING"] = 0] = "CREATING";
  RoomInternalState2[RoomInternalState2["CREATED"] = 1] = "CREATED";
  RoomInternalState2[RoomInternalState2["DISPOSING"] = 2] = "DISPOSING";
  return RoomInternalState2;
})(RoomInternalState || {});
var Room = class _Room {
  constructor() {
    this.clock = new src_default();
    this.#_onLeaveConcurrent = 0;
    this.maxClients = Infinity;
    this.#_maxClientsReached = false;
    this.autoDispose = true;
    this.patchRate = DEFAULT_PATCH_RATE;
    this.clients = new ClientArray();
    this._events = new import_events2.EventEmitter();
    this.seatReservationTime = DEFAULT_SEAT_RESERVATION_TIME;
    this.reservedSeats = {};
    this.reservedSeatTimeouts = {};
    this._reconnections = {};
    this._reconnectingSessionId = /* @__PURE__ */ new Map();
    this.onMessageHandlers = {
      "__no_message_handler": {
        callback: (client, messageType, _) => {
          const errorMessage = `room onMessage for "${messageType}" not registered.`;
          debugAndPrintError(`${errorMessage} (roomId: ${this.roomId})`);
          if (isDevMode) {
            client.error(ErrorCode.INVALID_PAYLOAD, errorMessage);
          } else {
            client.leave(Protocol.WS_CLOSE_WITH_ERROR, errorMessage);
          }
        }
      }
    };
    this._serializer = noneSerializer;
    this._afterNextPatchQueue = [];
    this._internalState = 0;
    this._lockedExplicitly = false;
    this.#_locked = false;
    this._events.once("dispose", () => {
      this._dispose().catch((e) => debugAndPrintError(`onDispose error: ${e && e.stack || e.message || e || "promise rejected"} (roomId: ${this.roomId})`)).finally(() => this._events.emit("disconnect"));
    });
    if (this.onUncaughtException !== void 0) {
      this.#registerUncaughtExceptionHandlers();
    }
  }
  /**
   * This property will change on these situations:
   * - The maximum number of allowed clients has been reached (`maxClients`)
   * - You manually locked, or unlocked the room using lock() or `unlock()`.
   *
   * @readonly
   */
  get locked() {
    return this.#_locked;
  }
  get metadata() {
    return this.listing.metadata;
  }
  #_roomId;
  #_roomName;
  #_onLeaveConcurrent;
  #_maxClientsReached;
  #_maxClients;
  #_autoDispose;
  #_patchRate;
  #_patchInterval;
  #_state;
  #_locked;
  /**
   * This method is called by the MatchMaker before onCreate()
   * @internal
   */
  __init() {
    this.#_state = this.state;
    this.#_autoDispose = this.autoDispose;
    this.#_patchRate = this.patchRate;
    this.#_maxClients = this.maxClients;
    Object.defineProperties(this, {
      state: {
        enumerable: true,
        get: () => this.#_state,
        set: (newState) => {
          if (newState?.constructor[Symbol.metadata] !== void 0 || newState[$changes] !== void 0) {
            this.setSerializer(new SchemaSerializer());
          } else if ("_definition" in newState) {
            throw new Error("@colyseus/schema v2 compatibility currently missing (reach out if you need it)");
          } else if ($changes === void 0) {
            throw new Error("Multiple @colyseus/schema versions detected. Please make sure you don't have multiple versions of @colyseus/schema installed.");
          }
          this._serializer.reset(newState);
          this.#_state = newState;
        }
      },
      maxClients: {
        enumerable: true,
        get: () => this.#_maxClients,
        set: (value) => {
          this.#_maxClients = value;
          if (this._internalState === 1) {
            const hasReachedMaxClients = this.hasReachedMaxClients();
            if (!this._lockedExplicitly && this.#_maxClientsReached && !hasReachedMaxClients) {
              this.#_maxClientsReached = false;
              this.#_locked = false;
              this.listing.locked = false;
            }
            if (hasReachedMaxClients) {
              this.#_maxClientsReached = true;
              this.#_locked = true;
              this.listing.locked = true;
            }
            this.listing.maxClients = value;
            this.listing.save();
          }
        }
      },
      autoDispose: {
        enumerable: true,
        get: () => this.#_autoDispose,
        set: (value) => {
          if (value !== this.#_autoDispose && this._internalState !== 2) {
            this.#_autoDispose = value;
            this.resetAutoDisposeTimeout();
          }
        }
      },
      patchRate: {
        enumerable: true,
        get: () => this.#_patchRate,
        set: (milliseconds) => {
          this.#_patchRate = milliseconds;
          if (this.#_patchInterval) {
            clearInterval(this.#_patchInterval);
            this.#_patchInterval = void 0;
          }
          if (milliseconds !== null && milliseconds !== 0) {
            this.#_patchInterval = setInterval(() => this.broadcastPatch(), milliseconds);
          }
        }
      }
    });
    this.patchRate = this.#_patchRate;
    if (this.#_state) {
      this.state = this.#_state;
    }
    this.resetAutoDisposeTimeout(this.seatReservationTime);
    this.clock.start();
  }
  /**
   * The name of the room you provided as first argument for `gameServer.define()`.
   *
   * @returns roomName string
   */
  get roomName() {
    return this.#_roomName;
  }
  /**
   * Setting the name of the room. Overwriting this property is restricted.
   *
   * @param roomName
   */
  set roomName(roomName) {
    if (this.#_roomName) {
      throw new ServerError(ErrorCode.APPLICATION_ERROR, "'roomName' cannot be overwritten.");
    }
    this.#_roomName = roomName;
  }
  /**
   * A unique, auto-generated, 9-character-long id of the room.
   * You may replace `this.roomId` during `onCreate()`.
   *
   * @returns roomId string
   */
  get roomId() {
    return this.#_roomId;
  }
  /**
   * Setting the roomId, is restricted in room lifetime except upon room creation.
   *
   * @param roomId
   * @returns roomId string
   */
  set roomId(roomId) {
    if (this._internalState !== 0 && !isDevMode) {
      throw new ServerError(ErrorCode.APPLICATION_ERROR, "'roomId' can only be overridden upon room creation.");
    }
    this.#_roomId = roomId;
  }
  onAuth(client, options, context) {
    return true;
  }
  static async onAuth(token, options, context) {
    return true;
  }
  /**
   * This method is called during graceful shutdown of the server process
   * You may override this method to dispose the room in your own way.
   *
   * Once process reaches room count of 0, the room process will be terminated.
   */
  onBeforeShutdown() {
    this.disconnect(
      isDevMode ? Protocol.WS_CLOSE_DEVMODE_RESTART : Protocol.WS_CLOSE_CONSENTED
    );
  }
  /**
   * Returns whether the sum of connected clients and reserved seats exceeds maximum number of clients.
   *
   * @returns boolean
   */
  hasReachedMaxClients() {
    return this.clients.length + Object.keys(this.reservedSeats).length >= this.maxClients || this._internalState === 2;
  }
  /**
   * Set the number of seconds a room can wait for a client to effectively join the room.
   * You should consider how long your `onAuth()` will have to wait for setting a different seat reservation time.
   * The default value is 15 seconds. You may set the `COLYSEUS_SEAT_RESERVATION_TIME`
   * environment variable if you'd like to change the seat reservation time globally.
   *
   * @default 15 seconds
   *
   * @param seconds - number of seconds.
   * @returns The modified Room object.
   */
  setSeatReservationTime(seconds) {
    this.seatReservationTime = seconds;
    return this;
  }
  hasReservedSeat(sessionId, reconnectionToken) {
    const reservedSeat = this.reservedSeats[sessionId];
    if (reservedSeat === void 0) {
      return false;
    }
    if (reservedSeat[3]) {
      return reconnectionToken && this._reconnections[reconnectionToken]?.[0] === sessionId && this._reconnectingSessionId.has(sessionId);
    } else {
      return reservedSeat[2] === false;
    }
  }
  checkReconnectionToken(reconnectionToken) {
    const sessionId = this._reconnections[reconnectionToken]?.[0];
    const reservedSeat = this.reservedSeats[sessionId];
    if (reservedSeat && reservedSeat[3]) {
      this._reconnectingSessionId.set(sessionId, reconnectionToken);
      return sessionId;
    } else {
      return void 0;
    }
  }
  /**
   * (Optional) Set a simulation interval that can change the state of the game.
   * The simulation interval is your game loop.
   *
   * @default 16.6ms (60fps)
   *
   * @param onTickCallback - You can implement your physics or world updates here!
   *  This is a good place to update the room state.
   * @param delay - Interval delay on executing `onTickCallback` in milliseconds.
   */
  setSimulationInterval(onTickCallback, delay = DEFAULT_SIMULATION_INTERVAL) {
    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
    }
    if (onTickCallback) {
      if (this.onUncaughtException !== void 0) {
        onTickCallback = wrapTryCatch(onTickCallback, this.onUncaughtException.bind(this), SimulationIntervalException, "setSimulationInterval");
      }
      this._simulationInterval = setInterval(() => {
        this.clock.tick();
        onTickCallback(this.clock.deltaTime);
      }, delay);
    }
  }
  /**
   * @deprecated Use `.patchRate=` instead.
   */
  setPatchRate(milliseconds) {
    this.patchRate = milliseconds;
  }
  /**
   * @deprecated Use `.state =` instead.
   */
  setState(newState) {
    this.state = newState;
  }
  setSerializer(serializer) {
    this._serializer = serializer;
  }
  async setMetadata(meta) {
    if (!this.listing.metadata) {
      this.listing.metadata = meta;
    } else {
      for (const field in meta) {
        if (!meta.hasOwnProperty(field)) {
          continue;
        }
        this.listing.metadata[field] = meta[field];
      }
      if ("markModified" in this.listing) {
        this.listing.markModified("metadata");
      }
    }
    if (this._internalState === 1) {
      await this.listing.save();
    }
  }
  async setPrivate(bool = true) {
    if (this.listing.private === bool) return;
    this.listing.private = bool;
    if (this._internalState === 1) {
      await this.listing.save();
    }
    this._events.emit("visibility-change", bool);
  }
  /**
   * Locking the room will remove it from the pool of available rooms for new clients to connect to.
   */
  async lock() {
    this._lockedExplicitly = arguments[0] === void 0;
    if (this.#_locked) {
      return;
    }
    this.#_locked = true;
    await this.listing.updateOne({
      $set: { locked: this.#_locked }
    });
    this._events.emit("lock");
  }
  /**
   * Unlocking the room returns it to the pool of available rooms for new clients to connect to.
   */
  async unlock() {
    if (arguments[0] === void 0) {
      this._lockedExplicitly = false;
    }
    if (!this.#_locked) {
      return;
    }
    this.#_locked = false;
    await this.listing.updateOne({
      $set: { locked: this.#_locked }
    });
    this._events.emit("unlock");
  }
  send(client, messageOrType, messageOrOptions, options) {
    logger.warn("DEPRECATION WARNING: use client.send(...) instead of this.send(client, ...)");
    client.send(messageOrType, messageOrOptions, options);
  }
  broadcast(type2, message, options) {
    if (options && options.afterNextPatch) {
      delete options.afterNextPatch;
      this._afterNextPatchQueue.push(["broadcast", arguments]);
      return;
    }
    this.broadcastMessageType(type2, message, options);
  }
  /**
   * Broadcast bytes (UInt8Arrays) to a particular room
   */
  broadcastBytes(type2, message, options) {
    if (options && options.afterNextPatch) {
      delete options.afterNextPatch;
      this._afterNextPatchQueue.push(["broadcastBytes", arguments]);
      return;
    }
    this.broadcastMessageType(type2, message, options);
  }
  /**
   * Checks whether mutations have occurred in the state, and broadcast them to all connected clients.
   */
  broadcastPatch() {
    if (this.onBeforePatch) {
      this.onBeforePatch(this.state);
    }
    if (!this._simulationInterval) {
      this.clock.tick();
    }
    if (!this.state) {
      return false;
    }
    const hasChanges = this._serializer.applyPatches(this.clients, this.state);
    this._dequeueAfterPatchMessages();
    return hasChanges;
  }
  onMessage(messageType, callback, validate) {
    this.onMessageHandlers[messageType] = this.onUncaughtException !== void 0 ? { validate, callback: wrapTryCatch(callback, this.onUncaughtException.bind(this), OnMessageException, "onMessage", false, messageType) } : { validate, callback };
    return () => delete this.onMessageHandlers[messageType];
  }
  /**
   * Disconnect all connected clients, and then dispose the room.
   *
   * @param closeCode WebSocket close code (default = 4000, which is a "consented leave")
   * @returns Promise<void>
   */
  disconnect(closeCode = Protocol.WS_CLOSE_CONSENTED) {
    if (this._internalState === 2) {
      return Promise.resolve(`disconnect() ignored: room (${this.roomId}) is already disposing.`);
    } else if (this._internalState === 0) {
      throw new Error("cannot disconnect during onCreate()");
    }
    this._internalState = 2;
    this.listing.remove();
    this.#_autoDispose = true;
    const delayedDisconnection = new Promise((resolve) => this._events.once("disconnect", () => resolve()));
    for (const [_, reconnection] of Object.values(this._reconnections)) {
      reconnection.reject(new Error("disconnecting"));
    }
    let numClients = this.clients.length;
    if (numClients > 0) {
      while (numClients--) {
        this._forciblyCloseClient(this.clients[numClients], closeCode);
      }
    } else {
      this._events.emit("dispose");
    }
    return delayedDisconnection;
  }
  async ["_onJoin"](client, authContext) {
    const sessionId = client.sessionId;
    client.reconnectionToken = generateId();
    if (this.reservedSeatTimeouts[sessionId]) {
      clearTimeout(this.reservedSeatTimeouts[sessionId]);
      delete this.reservedSeatTimeouts[sessionId];
    }
    if (this._autoDisposeTimeout) {
      clearTimeout(this._autoDisposeTimeout);
      this._autoDisposeTimeout = void 0;
    }
    const [joinOptions, authData, isConsumed, isWaitingReconnection] = this.reservedSeats[sessionId];
    if (isConsumed) {
      throw new ServerError(ErrorCode.MATCHMAKE_EXPIRED, "already consumed");
    }
    this.reservedSeats[sessionId][2] = true;
    debugMatchMaking("consuming seat reservation, sessionId: '%s' (roomId: %s)", client.sessionId, this.roomId);
    client._afterNextPatchQueue = this._afterNextPatchQueue;
    client.ref["onleave"] = (_) => client.state = ClientState.LEAVING;
    client.ref.once("close", client.ref["onleave"]);
    if (isWaitingReconnection) {
      const previousReconnectionToken = this._reconnectingSessionId.get(sessionId);
      if (previousReconnectionToken) {
        this.clients.push(client);
        await this._reconnections[previousReconnectionToken]?.[1].resolve(client);
      } else {
        const errorMessage = process.env.NODE_ENV === "production" ? "already consumed" : "bad reconnection token";
        throw new ServerError(ErrorCode.MATCHMAKE_EXPIRED, errorMessage);
      }
    } else {
      try {
        if (authData) {
          client.auth = authData;
        } else if (this.onAuth !== _Room.prototype.onAuth) {
          try {
            client.auth = await this.onAuth(client, joinOptions, authContext);
            if (!client.auth) {
              throw new ServerError(ErrorCode.AUTH_FAILED, "onAuth failed");
            }
          } catch (e) {
            delete this.reservedSeats[sessionId];
            await this._decrementClientCount();
            throw e;
          }
        }
        if (client.state === ClientState.LEAVING) {
          throw new ServerError(Protocol.WS_CLOSE_GOING_AWAY, "already disconnected");
        }
        this.clients.push(client);
        Object.defineProperty(this.reservedSeats, sessionId, {
          value: this.reservedSeats[sessionId],
          enumerable: false
        });
        if (this.onJoin) {
          await this.onJoin(client, joinOptions, client.auth);
        }
        if (client.state === ClientState.LEAVING) {
          throw new Error("early_leave");
        } else {
          delete this.reservedSeats[sessionId];
          this._events.emit("join", client);
        }
      } catch (e) {
        await this._onLeave(client, Protocol.WS_CLOSE_GOING_AWAY);
        delete this.reservedSeats[sessionId];
        if (!e.code) {
          e.code = ErrorCode.APPLICATION_ERROR;
        }
        throw e;
      }
    }
    if (client.state === ClientState.JOINING) {
      client.ref.removeListener("close", client.ref["onleave"]);
      client.ref["onleave"] = this._onLeave.bind(this, client);
      client.ref.once("close", client.ref["onleave"]);
      client.ref.on("message", this._onMessage.bind(this, client));
      client.raw(getMessageBytes[Protocol.JOIN_ROOM](
        client.reconnectionToken,
        this._serializer.id,
        this._serializer.handshake && this._serializer.handshake()
      ));
    }
  }
  /**
   * Allow the specified client to reconnect into the room. Must be used inside `onLeave()` method.
   * If seconds is provided, the reconnection is going to be cancelled after the provided amount of seconds.
   *
   * @param previousClient - The client which is to be waiting until re-connection happens.
   * @param seconds - Timeout period on re-connection in seconds.
   *
   * @returns Deferred<Client> - The differed is a promise like type.
   *  This type can forcibly reject the promise by calling `.reject()`.
   */
  allowReconnection(previousClient, seconds) {
    if (previousClient._enqueuedMessages !== void 0) {
      return Promise.reject(new Error("not joined"));
    }
    if (seconds === void 0) {
      console.warn('DEPRECATED: allowReconnection() requires a second argument. Using "manual" mode.');
      seconds = "manual";
    }
    if (seconds === "manual") {
      seconds = Infinity;
    }
    if (this._internalState === 2) {
      return Promise.reject(new Error("disposing"));
    }
    const sessionId = previousClient.sessionId;
    const reconnectionToken = previousClient.reconnectionToken;
    this._reserveSeat(sessionId, true, previousClient.auth, seconds, true);
    const reconnection = new Deferred();
    this._reconnections[reconnectionToken] = [sessionId, reconnection];
    if (seconds !== Infinity) {
      this.reservedSeatTimeouts[sessionId] = setTimeout(() => reconnection.reject(false), seconds * 1e3);
    }
    const cleanup = () => {
      delete this._reconnections[reconnectionToken];
      delete this.reservedSeats[sessionId];
      delete this.reservedSeatTimeouts[sessionId];
      this._reconnectingSessionId.delete(sessionId);
    };
    reconnection.then((newClient) => {
      newClient.auth = previousClient.auth;
      newClient.userData = previousClient.userData;
      newClient.view = previousClient.view;
      previousClient.state = ClientState.RECONNECTED;
      previousClient.ref = newClient.ref;
      previousClient.reconnectionToken = newClient.reconnectionToken;
      clearTimeout(this.reservedSeatTimeouts[sessionId]);
      cleanup();
    }).catch(() => {
      cleanup();
      this.resetAutoDisposeTimeout();
    });
    return reconnection;
  }
  resetAutoDisposeTimeout(timeoutInSeconds = 1) {
    clearTimeout(this._autoDisposeTimeout);
    if (!this.#_autoDispose) {
      return;
    }
    this._autoDisposeTimeout = setTimeout(() => {
      this._autoDisposeTimeout = void 0;
      this._disposeIfEmpty();
    }, timeoutInSeconds * 1e3);
  }
  broadcastMessageType(type2, message, options = {}) {
    debugMessage("broadcast: %O (roomId: %s)", message, this.roomId);
    const encodedMessage = message instanceof Uint8Array ? getMessageBytes.raw(Protocol.ROOM_DATA_BYTES, type2, void 0, message) : getMessageBytes.raw(Protocol.ROOM_DATA, type2, message);
    const except = typeof options.except !== "undefined" ? Array.isArray(options.except) ? options.except : [options.except] : void 0;
    let numClients = this.clients.length;
    while (numClients--) {
      const client = this.clients[numClients];
      if (!except || !except.includes(client)) {
        client.enqueueRaw(encodedMessage);
      }
    }
  }
  sendFullState(client) {
    client.raw(this._serializer.getFullState(client));
  }
  _dequeueAfterPatchMessages() {
    const length = this._afterNextPatchQueue.length;
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        const [target2, args] = this._afterNextPatchQueue[i];
        if (target2 === "broadcast") {
          this.broadcast.apply(this, args);
        } else {
          target2.raw.apply(target2, args);
        }
      }
      this._afterNextPatchQueue.splice(0, length);
    }
  }
  async _reserveSeat(sessionId, joinOptions = true, authData = void 0, seconds = this.seatReservationTime, allowReconnection = false, devModeReconnection) {
    if (!allowReconnection && this.hasReachedMaxClients()) {
      return false;
    }
    this.reservedSeats[sessionId] = [joinOptions, authData, false, allowReconnection];
    if (!allowReconnection) {
      await this._incrementClientCount();
      this.reservedSeatTimeouts[sessionId] = setTimeout(async () => {
        delete this.reservedSeats[sessionId];
        delete this.reservedSeatTimeouts[sessionId];
        await this._decrementClientCount();
      }, seconds * 1e3);
      this.resetAutoDisposeTimeout(seconds);
    }
    if (devModeReconnection) {
      this._reconnectingSessionId.set(sessionId, sessionId);
    }
    return true;
  }
  _disposeIfEmpty() {
    const willDispose = this.#_onLeaveConcurrent === 0 && // no "onLeave" calls in progress
    this.#_autoDispose && this._autoDisposeTimeout === void 0 && this.clients.length === 0 && Object.keys(this.reservedSeats).length === 0;
    if (willDispose) {
      this._events.emit("dispose");
    }
    return willDispose;
  }
  async _dispose() {
    this._internalState = 2;
    this.listing.remove();
    let userReturnData;
    if (this.onDispose) {
      userReturnData = this.onDispose();
    }
    if (this.#_patchInterval) {
      clearInterval(this.#_patchInterval);
      this.#_patchInterval = void 0;
    }
    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
      this._simulationInterval = void 0;
    }
    if (this._autoDisposeTimeout) {
      clearInterval(this._autoDisposeTimeout);
      this._autoDisposeTimeout = void 0;
    }
    this.clock.clear();
    this.clock.stop();
    return await (userReturnData || Promise.resolve());
  }
  _onMessage(client, buffer) {
    if (client.state === ClientState.LEAVING) {
      return;
    }
    const it = { offset: 1 };
    const code = buffer[0];
    if (!buffer) {
      debugAndPrintError(`${this.roomName} (roomId: ${this.roomId}), couldn't decode message: ${buffer}`);
      return;
    }
    if (code === Protocol.ROOM_DATA) {
      const messageType = decode2.stringCheck(buffer, it) ? decode2.string(buffer, it) : decode2.number(buffer, it);
      const messageTypeHandler = this.onMessageHandlers[messageType];
      let message;
      try {
        message = buffer.byteLength > it.offset ? unpack(buffer.subarray(it.offset, buffer.byteLength)) : void 0;
        debugMessage("received: '%s' -> %j (roomId: %s)", messageType, message, this.roomId);
        if (messageTypeHandler?.validate !== void 0) {
          message = messageTypeHandler.validate(message);
        }
      } catch (e) {
        debugAndPrintError(e);
        client.leave(Protocol.WS_CLOSE_WITH_ERROR);
        return;
      }
      if (messageTypeHandler) {
        messageTypeHandler.callback(client, message);
      } else {
        (this.onMessageHandlers["*"] || this.onMessageHandlers["__no_message_handler"]).callback(client, messageType, message);
      }
    } else if (code === Protocol.ROOM_DATA_BYTES) {
      const messageType = decode2.stringCheck(buffer, it) ? decode2.string(buffer, it) : decode2.number(buffer, it);
      const messageTypeHandler = this.onMessageHandlers[messageType];
      let message = buffer.subarray(it.offset, buffer.byteLength);
      debugMessage("received: '%s' -> %j (roomId: %s)", messageType, message, this.roomId);
      if (messageTypeHandler?.validate !== void 0) {
        message = messageTypeHandler.validate(message);
      }
      if (messageTypeHandler) {
        messageTypeHandler.callback(client, message);
      } else {
        (this.onMessageHandlers["*"] || this.onMessageHandlers["__no_message_handler"]).callback(client, messageType, message);
      }
    } else if (code === Protocol.JOIN_ROOM && client.state === ClientState.JOINING) {
      client.state = ClientState.JOINED;
      client._joinedAt = this.clock.elapsedTime;
      if (this.state) {
        this.sendFullState(client);
      }
      if (client._enqueuedMessages.length > 0) {
        client._enqueuedMessages.forEach((enqueued) => client.raw(enqueued));
      }
      delete client._enqueuedMessages;
    } else if (code === Protocol.LEAVE_ROOM) {
      this._forciblyCloseClient(client, Protocol.WS_CLOSE_CONSENTED);
    }
  }
  _forciblyCloseClient(client, closeCode) {
    client.ref.removeAllListeners("message");
    client.ref.removeListener("close", client.ref["onleave"]);
    this._onLeave(client, closeCode).then(() => client.leave(closeCode));
  }
  async _onLeave(client, code) {
    debugMatchMaking("onLeave, sessionId: '%s' (close code: %d, roomId: %s)", client.sessionId, code, this.roomId);
    client.state = ClientState.LEAVING;
    if (!this.clients.delete(client)) {
      return;
    }
    if (this.onLeave) {
      try {
        this.#_onLeaveConcurrent++;
        await this.onLeave(client, code === Protocol.WS_CLOSE_CONSENTED);
      } catch (e) {
        debugAndPrintError(`onLeave error: ${e && e.message || e || "promise rejected"} (roomId: ${this.roomId})`);
      } finally {
        this.#_onLeaveConcurrent--;
      }
    }
    if (this._reconnections[client.reconnectionToken]) {
      this._reconnections[client.reconnectionToken][1].catch(async () => {
        await this._onAfterLeave(client);
      });
    } else if (client.state !== ClientState.RECONNECTED) {
      await this._onAfterLeave(client);
    }
  }
  async _onAfterLeave(client) {
    const willDispose = await this._decrementClientCount();
    if (this.reservedSeats[client.sessionId] === void 0) {
      this._events.emit("leave", client, willDispose);
    }
  }
  async _incrementClientCount() {
    if (!this.#_locked && this.hasReachedMaxClients()) {
      this.#_maxClientsReached = true;
      this.lock.call(this, true);
    }
    await this.listing.updateOne({
      $inc: { clients: 1 },
      $set: { locked: this.#_locked }
    });
  }
  async _decrementClientCount() {
    const willDispose = this._disposeIfEmpty();
    if (this._internalState === 2) {
      return true;
    }
    if (!willDispose) {
      if (this.#_maxClientsReached && !this._lockedExplicitly) {
        this.#_maxClientsReached = false;
        this.unlock.call(this, true);
      }
      await this.listing.updateOne({
        $inc: { clients: -1 },
        $set: { locked: this.#_locked }
      });
    }
    return willDispose;
  }
  #registerUncaughtExceptionHandlers() {
    const onUncaughtException = this.onUncaughtException.bind(this);
    const originalSetTimeout = this.clock.setTimeout;
    this.clock.setTimeout = (cb, timeout, ...args) => {
      return originalSetTimeout.call(this.clock, wrapTryCatch(cb, onUncaughtException, TimedEventException, "setTimeout"), timeout, ...args);
    };
    const originalSetInterval = this.clock.setInterval;
    this.clock.setInterval = (cb, timeout, ...args) => {
      return originalSetInterval.call(this.clock, wrapTryCatch(cb, onUncaughtException, TimedEventException, "setInterval"), timeout, ...args);
    };
    if (this.onCreate !== void 0) {
      this.onCreate = wrapTryCatch(this.onCreate.bind(this), onUncaughtException, OnCreateException, "onCreate", true);
    }
    if (this.onAuth !== void 0) {
      this.onAuth = wrapTryCatch(this.onAuth.bind(this), onUncaughtException, OnAuthException, "onAuth", true);
    }
    if (this.onJoin !== void 0) {
      this.onJoin = wrapTryCatch(this.onJoin.bind(this), onUncaughtException, OnJoinException, "onJoin", true);
    }
    if (this.onLeave !== void 0) {
      this.onLeave = wrapTryCatch(this.onLeave.bind(this), onUncaughtException, OnLeaveException, "onLeave", true);
    }
    if (this.onDispose !== void 0) {
      this.onDispose = wrapTryCatch(this.onDispose.bind(this), onUncaughtException, OnDisposeException, "onDispose");
    }
  }
};

// node_modules/@colyseus/core/build/presence/LocalPresence.mjs
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_events3 = require("events");
var DEVMODE_CACHE_FILE_PATH = import_path.default.resolve(".devmode.json");
var LocalPresence = class {
  constructor() {
    this.subscriptions = new import_events3.EventEmitter();
    this.data = {};
    this.hash = {};
    this.keys = {};
    this.timeouts = {};
    if (isDevMode && import_fs.default.existsSync(DEVMODE_CACHE_FILE_PATH)) {
      const cache = import_fs.default.readFileSync(DEVMODE_CACHE_FILE_PATH).toString("utf-8") || "{}";
      const parsed = JSON.parse(cache);
      if (parsed.data) {
        this.data = parsed.data;
      }
      if (parsed.hash) {
        this.hash = parsed.hash;
      }
      if (parsed.keys) {
        this.keys = parsed.keys;
      }
    }
  }
  subscribe(topic, callback) {
    this.subscriptions.on(topic, callback);
    return Promise.resolve(this);
  }
  unsubscribe(topic, callback) {
    if (callback) {
      this.subscriptions.removeListener(topic, callback);
    } else {
      this.subscriptions.removeAllListeners(topic);
    }
    return this;
  }
  publish(topic, data) {
    this.subscriptions.emit(topic, data);
    return this;
  }
  async channels(pattern) {
    let eventNames = this.subscriptions.eventNames();
    if (pattern) {
      const regexp = new RegExp(
        pattern.replaceAll(".", "\\.").replaceAll("$", "\\$").replaceAll("*", ".*").replaceAll("?", "."),
        "gi"
      );
      eventNames = eventNames.filter((eventName) => regexp.test(eventName));
    }
    return eventNames;
  }
  async exists(key) {
    return this.keys[key] !== void 0 || this.data[key] !== void 0 || this.hash[key] !== void 0;
  }
  set(key, value) {
    this.keys[key] = value;
  }
  setex(key, value, seconds) {
    this.keys[key] = value;
    this.expire(key, seconds);
  }
  expire(key, seconds) {
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
    }
    this.timeouts[key] = setTimeout(() => {
      delete this.keys[key];
      delete this.timeouts[key];
    }, seconds * 1e3);
  }
  get(key) {
    return this.keys[key];
  }
  del(key) {
    delete this.keys[key];
    delete this.data[key];
    delete this.hash[key];
  }
  sadd(key, value) {
    if (!this.data[key]) {
      this.data[key] = [];
    }
    if (this.data[key].indexOf(value) === -1) {
      this.data[key].push(value);
    }
  }
  async smembers(key) {
    return this.data[key] || [];
  }
  async sismember(key, field) {
    return this.data[key] && this.data[key].includes(field) ? 1 : 0;
  }
  srem(key, value) {
    if (this.data[key]) {
      spliceOne2(this.data[key], this.data[key].indexOf(value));
    }
  }
  scard(key) {
    return (this.data[key] || []).length;
  }
  async sinter(...keys) {
    const intersection = {};
    for (let i = 0, l = keys.length; i < l; i++) {
      (await this.smembers(keys[i])).forEach((member) => {
        if (!intersection[member]) {
          intersection[member] = 0;
        }
        intersection[member]++;
      });
    }
    return Object.keys(intersection).reduce((prev, curr) => {
      if (intersection[curr] > 1) {
        prev.push(curr);
      }
      return prev;
    }, []);
  }
  hset(key, field, value) {
    if (!this.hash[key]) {
      this.hash[key] = {};
    }
    this.hash[key][field] = value;
    return Promise.resolve(true);
  }
  hincrby(key, field, incrBy) {
    if (!this.hash[key]) {
      this.hash[key] = {};
    }
    let value = Number(this.hash[key][field] || "0");
    value += incrBy;
    this.hash[key][field] = value.toString();
    return Promise.resolve(value);
  }
  hincrbyex(key, field, incrBy, expireInSeconds) {
    if (!this.hash[key]) {
      this.hash[key] = {};
    }
    let value = Number(this.hash[key][field] || "0");
    value += incrBy;
    this.hash[key][field] = value.toString();
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
    }
    this.timeouts[key] = setTimeout(() => {
      delete this.hash[key];
      delete this.timeouts[key];
    }, expireInSeconds * 1e3);
    return Promise.resolve(value);
  }
  async hget(key, field) {
    return typeof this.hash[key] === "object" ? this.hash[key][field] ?? null : null;
  }
  async hgetall(key) {
    return this.hash[key] || {};
  }
  hdel(key, field) {
    const success = this.hash?.[key]?.[field] !== void 0;
    if (success) {
      delete this.hash[key][field];
    }
    return Promise.resolve(success);
  }
  async hlen(key) {
    return this.hash[key] && Object.keys(this.hash[key]).length || 0;
  }
  async incr(key) {
    if (!this.keys[key]) {
      this.keys[key] = 0;
    }
    this.keys[key]++;
    return Promise.resolve(this.keys[key]);
  }
  async decr(key) {
    if (!this.keys[key]) {
      this.keys[key] = 0;
    }
    this.keys[key]--;
    return Promise.resolve(this.keys[key]);
  }
  llen(key) {
    return Promise.resolve(this.data[key] && this.data[key].length || 0);
  }
  rpush(key, ...values) {
    if (!this.data[key]) {
      this.data[key] = [];
    }
    let lastLength = 0;
    values.forEach((value) => {
      lastLength = this.data[key].push(value);
    });
    return Promise.resolve(lastLength);
  }
  lpush(key, ...values) {
    if (!this.data[key]) {
      this.data[key] = [];
    }
    let lastLength = 0;
    values.forEach((value) => {
      lastLength = this.data[key].unshift(value);
    });
    return Promise.resolve(lastLength);
  }
  lpop(key) {
    return Promise.resolve(Array.isArray(this.data[key]) ? this.data[key].shift() : null);
  }
  rpop(key) {
    return Promise.resolve(this.data[key].pop());
  }
  brpop(...args) {
    const keys = args.slice(0, -1);
    const timeoutInSeconds = args[args.length - 1];
    const getFirstPopulated = () => {
      const keyWithValue = keys.find((key) => this.data[key] && this.data[key].length > 0);
      if (keyWithValue) {
        return [keyWithValue, this.data[keyWithValue].pop()];
      } else {
        return null;
      }
    };
    const firstPopulated = getFirstPopulated();
    if (firstPopulated) {
      return Promise.resolve(firstPopulated);
    } else {
      const maxRetries = timeoutInSeconds * 8;
      let tries = 0;
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          tries++;
          const firstPopulated2 = getFirstPopulated();
          if (firstPopulated2) {
            clearInterval(interval);
            return resolve(firstPopulated2);
          } else if (tries >= maxRetries) {
            clearInterval(interval);
            return resolve(null);
          }
        }, timeoutInSeconds * 1e3 / maxRetries);
      });
    }
  }
  setMaxListeners(number2) {
    this.subscriptions.setMaxListeners(number2);
  }
  shutdown() {
    if (isDevMode) {
      const cache = JSON.stringify({
        data: this.data,
        hash: this.hash,
        keys: this.keys
      });
      import_fs.default.writeFileSync(DEVMODE_CACHE_FILE_PATH, cache, { encoding: "utf-8" });
    }
  }
};

// node_modules/@colyseus/core/build/errors/SeatReservationError.mjs
var SeatReservationError = class extends Error {
  constructor(message) {
    super(message);
  }
};

// node_modules/@colyseus/core/build/matchmaker/driver/local/Query.mjs
var Query = class {
  constructor(rooms2, conditions) {
    this.$rooms = rooms2.slice(0);
    this.conditions = conditions;
  }
  sort(options) {
    this.$rooms = this.$rooms.sort((room1, room2) => {
      for (const field in options) {
        if (options.hasOwnProperty(field)) {
          const direction = options[field];
          const isAscending = direction === 1 || direction === "asc" || direction === "ascending";
          if (isAscending) {
            if (room1[field] > room2[field]) {
              return 1;
            }
            if (room1[field] < room2[field]) {
              return -1;
            }
          } else {
            if (room1[field] > room2[field]) {
              return -1;
            }
            if (room1[field] < room2[field]) {
              return 1;
            }
          }
        }
      }
    });
  }
  filter(conditions) {
    return this.$rooms.filter((room) => {
      for (const field in conditions) {
        if (conditions.hasOwnProperty(field) && room[field] !== conditions[field]) {
          return false;
        }
      }
      return true;
    });
  }
  then(resolve, reject) {
    const result = this.$rooms.find((room) => {
      for (const field in this.conditions) {
        if (this.conditions.hasOwnProperty(field) && room[field] !== this.conditions[field]) {
          return false;
        }
      }
      return true;
    });
    return resolve(result);
  }
};

// node_modules/@colyseus/core/build/matchmaker/driver/local/RoomData.mjs
var RoomData = class {
  constructor(initialValues, rooms2) {
    this.clients = 0;
    this.locked = false;
    this.private = false;
    this.maxClients = Infinity;
    this.unlisted = false;
    this.createdAt = /* @__PURE__ */ new Date();
    for (const field in initialValues) {
      if (initialValues.hasOwnProperty(field)) {
        this[field] = initialValues[field];
      }
    }
    Object.defineProperty(this, "$rooms", {
      value: rooms2,
      enumerable: false,
      writable: true
    });
  }
  save() {
    if (this.$rooms.indexOf(this) === -1) {
      this.$rooms.push(this);
    }
  }
  updateOne(operations) {
    if (operations.$set) {
      for (const field in operations.$set) {
        if (operations.$set.hasOwnProperty(field)) {
          this[field] = operations.$set[field];
        }
      }
    }
    if (operations.$inc) {
      for (const field in operations.$inc) {
        if (operations.$inc.hasOwnProperty(field)) {
          this[field] += operations.$inc[field];
        }
      }
    }
  }
  remove() {
    if (!this.$rooms) {
      return;
    }
    const roomIndex = this.$rooms.indexOf(this);
    if (roomIndex === -1) {
      return;
    }
    spliceOne2(this.$rooms, roomIndex);
    this.$rooms = null;
  }
};

// node_modules/@colyseus/core/build/matchmaker/driver/local/LocalDriver.mjs
var LocalDriver = class {
  constructor() {
    this.rooms = [];
  }
  createInstance(initialValues = {}) {
    return new RoomData(initialValues, this.rooms);
  }
  has(roomId) {
    return this.rooms.some((room) => room.roomId === roomId);
  }
  query(conditions, sortOptions) {
    const query2 = new Query(this.rooms, conditions);
    if (sortOptions) {
      query2.sort(sortOptions);
    }
    return query2.filter(conditions);
  }
  cleanup(processId2) {
    const cachedRooms = this.query({ processId: processId2 });
    debugMatchMaking("removing stale rooms by processId %s (%s rooms found)", processId2, cachedRooms.length);
    cachedRooms.forEach((room) => room.remove());
    return Promise.resolve();
  }
  findOne(conditions, sortOptions) {
    const query2 = new Query(this.rooms, conditions);
    if (sortOptions) {
      query2.sort(sortOptions);
    }
    return query2;
  }
  clear() {
    this.rooms = [];
  }
  shutdown() {
  }
};

// node_modules/@colyseus/core/build/matchmaker/controller.mjs
var controller_default = {
  DEFAULT_CORS_HEADERS: {
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Max-Age": "2592000"
    // ...
  },
  exposedMethods: ["joinOrCreate", "create", "join", "joinById", "reconnect"],
  allowedRoomNameChars: /([a-zA-Z_\-0-9]+)/gi,
  matchmakeRoute: "matchmake",
  /**
   * You can manually change the default corsHeaders by overwriting the `getCorsHeaders()` method:
   *    ```
   *    import { matchMaker } from "@colyseus/core";
   *    matchMaker.controller.getCorsHeaders = function(req) {
   *      if (req.headers.referer !== "xxx") {
   *      }
   *
   *      return {
   *        'Access-Control-Allow-Origin': 'safedomain.com',
   *      }
   *    }
   *    ```
   */
  getCorsHeaders(req) {
    const origin = req.headers && req.headers["origin"] || req.getHeader && req.getHeader("origin");
    return {
      ["Access-Control-Allow-Origin"]: origin || "*"
    };
  },
  async invokeMethod(method, roomName, clientOptions = {}, authOptions) {
    if (this.exposedMethods.indexOf(method) === -1) {
      throw new ServerError(ErrorCode.MATCHMAKE_NO_HANDLER, `invalid method "${method}"`);
    }
    try {
      return await MatchMaker_exports[method](roomName, clientOptions, authOptions);
    } catch (e) {
      throw new ServerError(e.code || ErrorCode.MATCHMAKE_UNHANDLED, e.message);
    }
  }
};

// node_modules/@colyseus/core/build/Stats.mjs
var Stats_exports = {};
__export(Stats_exports, {
  clearAutoPersistInterval: () => clearAutoPersistInterval,
  excludeProcess: () => excludeProcess,
  fetchAll: () => fetchAll,
  getGlobalCCU: () => getGlobalCCU,
  local: () => local,
  persist: () => persist,
  reset: () => reset,
  setAutoPersistInterval: () => setAutoPersistInterval
});
var local = {
  roomCount: 0,
  ccu: 0
};
async function fetchAll() {
  const allStats = [];
  const allProcesses = await presence.hgetall(getRoomCountKey());
  for (let remoteProcessId in allProcesses) {
    if (remoteProcessId === processId) {
      allStats.push({ processId, roomCount: local.roomCount, ccu: local.ccu });
    } else {
      const [roomCount, ccu] = allProcesses[remoteProcessId].split(",").map(Number);
      allStats.push({ processId: remoteProcessId, roomCount, ccu });
    }
  }
  return allStats;
}
var lastPersisted = 0;
var persistTimeout = void 0;
var persistInterval = 1e3;
function persist(forceNow = false) {
  if (state === MatchMakerState.SHUTTING_DOWN) {
    return;
  }
  const now = Date.now();
  if (forceNow || now - lastPersisted > persistInterval) {
    lastPersisted = now;
    return presence.hset(getRoomCountKey(), processId, `${local.roomCount},${local.ccu}`);
  } else {
    clearTimeout(persistTimeout);
    persistTimeout = setTimeout(persist, persistInterval);
  }
}
function reset(_persist = true) {
  local.roomCount = 0;
  local.ccu = 0;
  if (_persist) {
    lastPersisted = 0;
    clearTimeout(persistTimeout);
    persist();
  }
  Promise.resolve().then(() => __toESM(require_main(), 1)).then((io) => {
    io.default.metric({ id: "app/stats/ccu", name: "ccu", value: () => local.ccu });
    io.default.metric({ id: "app/stats/roomcount", name: "roomcount", value: () => local.roomCount });
  }).catch(() => {
  });
}
function excludeProcess(_processId) {
  return presence.hdel(getRoomCountKey(), _processId);
}
async function getGlobalCCU() {
  const allStats = await fetchAll();
  return allStats.reduce((prev, next) => prev + next.ccu, 0);
}
var autoPersistInterval = void 0;
function setAutoPersistInterval() {
  const interval = 60 * 1e3;
  autoPersistInterval = setInterval(() => {
    const now = Date.now();
    if (now - lastPersisted > interval) {
      persist();
    }
  }, interval);
}
function clearAutoPersistInterval() {
  clearInterval(autoPersistInterval);
}
function getRoomCountKey() {
  return "roomcount";
}

// node_modules/@colyseus/core/build/discovery/index.mjs
var NODES_SET = "colyseus:nodes";
var DISCOVERY_CHANNEL = "colyseus:nodes:discovery";
async function getHostname() {
  return process.env.SELF_HOSTNAME;
}
async function getNodeAddress(node) {
  const host = await getHostname();
  const port2 = process.env.SELF_PORT ?? node.port;
  return port2 ? `${node.processId}/${host}:${port2}` : `${node.processId}/${host}`;
}
async function registerNode(presence2, node) {
  const nodeAddress = await getNodeAddress(node);
  await presence2.sadd(NODES_SET, nodeAddress);
  await presence2.publish(DISCOVERY_CHANNEL, `add,${nodeAddress}`);
}
async function unregisterNode(presence2, node) {
  const nodeAddress = await getNodeAddress(node);
  await presence2.srem(NODES_SET, nodeAddress);
  await presence2.publish(DISCOVERY_CHANNEL, `remove,${nodeAddress}`);
}

// node_modules/@colyseus/core/build/matchmaker/driver/api.mjs
function getLockId(filterOptions) {
  return Object.keys(filterOptions).map((key) => `${key}:${filterOptions[key]}`).join("-");
}

// node_modules/@colyseus/core/build/MatchMaker.mjs
var handlers = {};
var rooms = {};
var events = new import_events4.EventEmitter();
var publicAddress;
var processId;
var presence;
var driver;
var selectProcessIdToCreateRoom;
var enableHealthChecks = true;
function setHealthChecksEnabled(value) {
  enableHealthChecks = value;
}
var onReady = new Deferred();
var MatchMakerState = /* @__PURE__ */ ((MatchMakerState2) => {
  MatchMakerState2[MatchMakerState2["INITIALIZING"] = 0] = "INITIALIZING";
  MatchMakerState2[MatchMakerState2["READY"] = 1] = "READY";
  MatchMakerState2[MatchMakerState2["SHUTTING_DOWN"] = 2] = "SHUTTING_DOWN";
  return MatchMakerState2;
})(MatchMakerState || {});
var state;
async function setup(_presence, _driver, _publicAddress, _selectProcessIdToCreateRoom) {
  if (onReady === void 0) {
    onReady = new Deferred();
  }
  state = 0;
  presence = _presence || new LocalPresence();
  driver = _driver || new LocalDriver();
  publicAddress = _publicAddress;
  reset(false);
  if (isDevMode) {
    processId = await getPreviousProcessId(await getHostname());
  }
  if (!processId) {
    processId = generateId();
  }
  selectProcessIdToCreateRoom = _selectProcessIdToCreateRoom || async function() {
    return (await fetchAll()).sort((p1, p2) => p1.roomCount > p2.roomCount ? 1 : -1)[0]?.processId || processId;
  };
  onReady.resolve();
}
async function accept() {
  await onReady;
  await subscribeIPC(presence, getProcessChannel(), (method, args) => {
    if (method === "healthcheck") {
      return true;
    } else {
      return handleCreateRoom.apply(void 0, args);
    }
  });
  if (enableHealthChecks) {
    await healthCheckAllProcesses();
    setAutoPersistInterval();
  }
  state = 1;
  await persist();
  if (isDevMode) {
    await reloadFromCache();
  }
}
async function joinOrCreate(roomName, clientOptions = {}, authContext) {
  return await retry(async () => {
    const authData = await callOnAuth(roomName, clientOptions, authContext);
    let room = await findOneRoomAvailable(roomName, clientOptions);
    if (!room) {
      const handler = getHandler(roomName);
      const filterOptions = handler.getFilterOptions(clientOptions);
      const concurrencyKey = getLockId(filterOptions);
      await concurrentJoinOrCreateRoomLock(handler, concurrencyKey, async (roomId) => {
        if (roomId) {
          room = await driver.findOne({ roomId });
        }
        if (!room || room.locked) {
          room = await findOneRoomAvailable(roomName, clientOptions);
        }
        if (!room) {
          room = await createRoom(roomName, clientOptions);
          presence.publish(`concurrent:${handler.name}:${concurrencyKey}`, room.roomId);
        }
        return room;
      });
    }
    return await reserveSeatFor(room, clientOptions, authData);
  }, 5, [SeatReservationError]);
}
async function create(roomName, clientOptions = {}, authContext) {
  const authData = await callOnAuth(roomName, clientOptions, authContext);
  const room = await createRoom(roomName, clientOptions);
  return reserveSeatFor(room, clientOptions, authData);
}
async function join(roomName, clientOptions = {}, authContext) {
  return await retry(async () => {
    const authData = await callOnAuth(roomName, clientOptions, authContext);
    const room = await findOneRoomAvailable(roomName, clientOptions);
    if (!room) {
      throw new ServerError(ErrorCode.MATCHMAKE_INVALID_CRITERIA, `no rooms found with provided criteria`);
    }
    return reserveSeatFor(room, clientOptions, authData);
  });
}
async function reconnect(roomId, clientOptions = {}) {
  const room = await driver.findOne({ roomId });
  if (!room) {
    if (process.env.NODE_ENV !== "production") {
      logger.info(`\u274C room "${roomId}" has been disposed. Did you miss .allowReconnection()?
\u{1F449} https://docs.colyseus.io/server/room/#allowreconnection-client-seconds`);
    }
    throw new ServerError(ErrorCode.MATCHMAKE_INVALID_ROOM_ID, `room "${roomId}" has been disposed.`);
  }
  const reconnectionToken = clientOptions.reconnectionToken;
  if (!reconnectionToken) {
    throw new ServerError(ErrorCode.MATCHMAKE_UNHANDLED, `'reconnectionToken' must be provided for reconnection.`);
  }
  const sessionId = await remoteRoomCall(room.roomId, "checkReconnectionToken", [reconnectionToken]);
  if (sessionId) {
    return { room, sessionId };
  } else {
    if (process.env.NODE_ENV !== "production") {
      logger.info(`\u274C reconnection token invalid or expired. Did you miss .allowReconnection()?
\u{1F449} https://docs.colyseus.io/server/room/#allowreconnection-client-seconds`);
    }
    throw new ServerError(ErrorCode.MATCHMAKE_EXPIRED, `reconnection token invalid or expired.`);
  }
}
async function joinById(roomId, clientOptions = {}, authContext) {
  const room = await driver.findOne({ roomId });
  if (!room) {
    throw new ServerError(ErrorCode.MATCHMAKE_INVALID_ROOM_ID, `room "${roomId}" not found`);
  } else if (room.locked) {
    throw new ServerError(ErrorCode.MATCHMAKE_INVALID_ROOM_ID, `room "${roomId}" is locked`);
  }
  const authData = await callOnAuth(room.name, clientOptions, authContext);
  return reserveSeatFor(room, clientOptions, authData);
}
async function query(conditions = {}, sortOptions) {
  return await driver.query(conditions, sortOptions);
}
async function findOneRoomAvailable(roomName, filterOptions, additionalSortOptions) {
  const handler = getHandler(roomName);
  const sortOptions = Object.assign({}, handler.sortOptions ?? {});
  if (additionalSortOptions) {
    Object.assign(sortOptions, additionalSortOptions);
  }
  return await driver.findOne({
    locked: false,
    name: roomName,
    private: false,
    ...handler.getFilterOptions(filterOptions)
  }, sortOptions);
}
async function remoteRoomCall(roomId, method, args, rejectionTimeout = REMOTE_ROOM_SHORT_TIMEOUT) {
  const room = rooms[roomId];
  if (!room) {
    try {
      return await requestFromIPC(presence, getRoomChannel(roomId), method, args, rejectionTimeout);
    } catch (e) {
      if (method === "_reserveSeat" && e.message === "ipc_timeout") {
        throw e;
      }
      const request = `${method}${args && " with args " + JSON.stringify(args) || ""}`;
      throw new ServerError(
        ErrorCode.MATCHMAKE_UNHANDLED,
        `remote room (${roomId}) timed out, requesting "${request}". (${rejectionTimeout}ms exceeded)`
      );
    }
  } else {
    return !args && typeof room[method] !== "function" ? room[method] : await room[method].apply(room, args && JSON.parse(JSON.stringify(args)));
  }
}
function defineRoomType(roomName, klass, defaultOptions2) {
  const registeredHandler = new RegisteredHandler(roomName, klass, defaultOptions2);
  handlers[roomName] = registeredHandler;
  if (klass.prototype["onAuth"] !== Room.prototype["onAuth"]) {
    if (klass["onAuth"] !== Room["onAuth"]) {
      logger.info(`\u274C "${roomName}"'s onAuth() defined at the instance level will be ignored.`);
    }
  }
  return registeredHandler;
}
function removeRoomType(roomName) {
  delete handlers[roomName];
}
function hasHandler(roomName) {
  logger.warn("hasHandler() is deprecated. Use getHandler() instead.");
  return handlers[roomName] !== void 0;
}
function getHandler(roomName) {
  const handler = handlers[roomName];
  if (!handler) {
    throw new ServerError(ErrorCode.MATCHMAKE_NO_HANDLER, `provided room name "${roomName}" not defined`);
  }
  return handler;
}
function getRoomClass(roomName) {
  return handlers[roomName]?.klass;
}
async function createRoom(roomName, clientOptions) {
  const selectedProcessId = state === 1 ? await selectProcessIdToCreateRoom(roomName, clientOptions) : processId;
  let room;
  if (selectedProcessId === void 0) {
    if (isDevMode && processId === void 0) {
      await onReady;
      return createRoom(roomName, clientOptions);
    } else {
      throw new ServerError(ErrorCode.MATCHMAKE_UNHANDLED, `no processId available to create room ${roomName}`);
    }
  } else if (selectedProcessId === processId) {
    room = await handleCreateRoom(roomName, clientOptions);
  } else {
    try {
      room = await requestFromIPC(
        presence,
        getProcessChannel(selectedProcessId),
        void 0,
        [roomName, clientOptions],
        REMOTE_ROOM_SHORT_TIMEOUT
      );
    } catch (e) {
      if (e.message === "ipc_timeout") {
        debugAndPrintError(`${e.message}: create room request timed out for ${roomName} on processId ${selectedProcessId}.`);
        if (enableHealthChecks) {
          await excludeProcess(selectedProcessId);
        }
        room = await handleCreateRoom(roomName, clientOptions);
      } else {
        throw e;
      }
    }
  }
  if (isDevMode) {
    presence.hset(getRoomRestoreListKey(), room.roomId, JSON.stringify({
      "clientOptions": clientOptions,
      "roomName": roomName,
      "processId": processId
    }));
  }
  return room;
}
async function handleCreateRoom(roomName, clientOptions, restoringRoomId) {
  const handler = getHandler(roomName);
  const room = new handler.klass();
  if (restoringRoomId && isDevMode) {
    room.roomId = restoringRoomId;
  } else {
    room.roomId = generateId();
  }
  room["__init"]();
  room.roomName = roomName;
  room.presence = presence;
  const additionalListingData = handler.getFilterOptions(clientOptions);
  if (publicAddress) {
    additionalListingData.publicAddress = publicAddress;
  }
  room.listing = driver.createInstance({
    name: roomName,
    processId,
    ...additionalListingData
  });
  if (room.onCreate) {
    try {
      await room.onCreate(merge({}, clientOptions, handler.options));
    } catch (e) {
      debugAndPrintError(e);
      throw new ServerError(
        e.code || ErrorCode.MATCHMAKE_UNHANDLED,
        e.message
      );
    }
  }
  room["_internalState"] = RoomInternalState.CREATED;
  room.listing.roomId = room.roomId;
  room.listing.maxClients = room.maxClients;
  debugMatchMaking("spawning '%s', roomId: %s, processId: %s", roomName, room.roomId, processId);
  local.roomCount++;
  persist();
  room._events.on("lock", lockRoom.bind(this, room));
  room._events.on("unlock", unlockRoom.bind(this, room));
  room._events.on("join", onClientJoinRoom.bind(this, room));
  room._events.on("leave", onClientLeaveRoom.bind(this, room));
  room._events.on("visibility-change", onVisibilityChange.bind(this, room));
  room._events.once("dispose", disposeRoom.bind(this, roomName, room));
  room._events.once("disconnect", () => {
    room._events.removeAllListeners("lock");
    room._events.removeAllListeners("unlock");
    room._events.removeAllListeners("visibility-change");
    room._events.removeAllListeners("dispose");
    if (local.roomCount <= 0) {
      events.emit("no-active-rooms");
    }
  });
  await createRoomReferences(room, true);
  if (state !== 2) {
    await room.listing.save();
  }
  handler.emit("create", room);
  return room.listing;
}
function getRoomById(roomId) {
  return driver.findOne({ roomId });
}
function getLocalRoomById(roomId) {
  return rooms[roomId];
}
function disconnectAll(closeCode) {
  const promises = [];
  for (const roomId in rooms) {
    if (!rooms.hasOwnProperty(roomId)) {
      continue;
    }
    promises.push(rooms[roomId].disconnect(closeCode));
  }
  return promises;
}
async function lockAndDisposeAll() {
  await excludeProcess(processId);
  if (enableHealthChecks) {
    clearAutoPersistInterval();
  }
  const noActiveRooms = new Deferred();
  if (local.roomCount <= 0) {
    noActiveRooms.resolve();
  } else {
    events.once("no-active-rooms", () => noActiveRooms.resolve());
  }
  for (const roomId in rooms) {
    if (!rooms.hasOwnProperty(roomId)) {
      continue;
    }
    const room = rooms[roomId];
    room.lock();
    room.onBeforeShutdown();
  }
  await noActiveRooms;
}
async function gracefullyShutdown() {
  if (state === 2) {
    return Promise.reject("already_shutting_down");
  }
  debugMatchMaking(`${processId} is shutting down!`);
  state = 2;
  onReady = void 0;
  await lockAndDisposeAll();
  if (isDevMode) {
    await cacheRoomHistory(rooms);
  }
  await removeRoomsByProcessId(processId);
  presence.unsubscribe(getProcessChannel());
  return Promise.all(disconnectAll(
    isDevMode ? Protocol.WS_CLOSE_DEVMODE_RESTART : void 0
  ));
}
async function reserveSeatFor(room, options, authData) {
  const sessionId = authData?.sessionId || generateId();
  debugMatchMaking(
    "reserving seat. sessionId: '%s', roomId: '%s', processId: '%s'",
    sessionId,
    room.roomId,
    processId
  );
  let successfulSeatReservation;
  try {
    successfulSeatReservation = await remoteRoomCall(
      room.roomId,
      "_reserveSeat",
      [sessionId, options, authData],
      REMOTE_ROOM_SHORT_TIMEOUT
    );
  } catch (e) {
    debugMatchMaking(e);
    if (e.message === "ipc_timeout" && !(enableHealthChecks && await healthCheckProcessId(room.processId))) {
      throw new SeatReservationError(`process ${room.processId} is not available.`);
    } else {
      successfulSeatReservation = false;
    }
  }
  if (!successfulSeatReservation) {
    throw new SeatReservationError(`${room.roomId} is already full.`);
  }
  const response = { room, sessionId };
  if (isDevMode) {
    response.devMode = isDevMode;
  }
  return response;
}
async function callOnAuth(roomName, clientOptions, authContext) {
  const roomClass = getRoomClass(roomName);
  if (roomClass && roomClass["onAuth"] && roomClass["onAuth"] !== Room["onAuth"]) {
    const result = await roomClass["onAuth"](authContext.token, clientOptions, authContext);
    if (!result) {
      throw new ServerError(ErrorCode.AUTH_FAILED, "onAuth failed");
    }
    return result;
  }
}
async function healthCheckAllProcesses() {
  const allStats = await fetchAll();
  const activeProcessChannels = typeof presence.channels === "function" ? (await presence.channels("p:*")).map((c) => c.substring(2)) : [];
  if (allStats.length > 0) {
    await Promise.all(
      allStats.filter((stat) => stat.processId !== processId && // skip current process
      !activeProcessChannels.includes(stat.processId)).map((stat) => healthCheckProcessId(stat.processId))
    );
  }
}
var _healthCheckByProcessId = {};
function healthCheckProcessId(processId2) {
  if (_healthCheckByProcessId[processId2] !== void 0) {
    return _healthCheckByProcessId[processId2];
  }
  _healthCheckByProcessId[processId2] = new Promise(async (resolve, reject) => {
    logger.debug(`> Performing health-check against processId: '${processId2}'...`);
    try {
      const requestTime = Date.now();
      await requestFromIPC(
        presence,
        getProcessChannel(processId2),
        "healthcheck",
        [],
        REMOTE_ROOM_SHORT_TIMEOUT
      );
      logger.debug(`\u2705 Process '${processId2}' successfully responded (${Date.now() - requestTime}ms)`);
      resolve(true);
    } catch (e) {
      logger.debug(`\u274C Process '${processId2}' failed to respond. Cleaning it up.`);
      const isProcessExcluded = await excludeProcess(processId2);
      if (isProcessExcluded && !isDevMode) {
        await removeRoomsByProcessId(processId2);
      }
      resolve(false);
    } finally {
      delete _healthCheckByProcessId[processId2];
    }
  });
  return _healthCheckByProcessId[processId2];
}
async function removeRoomsByProcessId(processId2) {
  await driver.cleanup(processId2);
}
async function createRoomReferences(room, init = false) {
  rooms[room.roomId] = room;
  if (init) {
    await subscribeIPC(
      presence,
      getRoomChannel(room.roomId),
      (method, args) => {
        return !args && typeof room[method] !== "function" ? room[method] : room[method].apply(room, args);
      }
    );
  }
  return true;
}
async function concurrentJoinOrCreateRoomLock(handler, concurrencyKey, callback) {
  return new Promise(async (resolve, reject) => {
    const hkey = getConcurrencyHashKey(handler.name);
    const concurrency = await presence.hincrbyex(
      hkey,
      concurrencyKey,
      1,
      // increment by 1
      MAX_CONCURRENT_CREATE_ROOM_WAIT_TIME * 2
      // expire in 2x the time of MAX_CONCURRENT_CREATE_ROOM_WAIT_TIME
    ) - 1;
    const fulfill = async (roomId) => {
      try {
        resolve(await callback(roomId));
      } catch (e) {
        reject(e);
      } finally {
        await presence.hincrbyex(hkey, concurrencyKey, -1, MAX_CONCURRENT_CREATE_ROOM_WAIT_TIME * 2);
      }
    };
    if (concurrency > 0) {
      debugMatchMaking(
        "receiving %d concurrent joinOrCreate for '%s' (%s)",
        concurrency,
        handler.name,
        concurrencyKey
      );
      try {
        const roomId = await subscribeWithTimeout(
          presence,
          `concurrent:${handler.name}:${concurrencyKey}`,
          (MAX_CONCURRENT_CREATE_ROOM_WAIT_TIME + Math.min(concurrency, 3) * 0.2) * 1e3
          // convert to milliseconds
        );
        return await fulfill(roomId);
      } catch (error) {
      }
    }
    return await fulfill();
  });
}
function onClientJoinRoom(room, client) {
  local.ccu++;
  persist();
  handlers[room.roomName].emit("join", room, client);
}
function onClientLeaveRoom(room, client, willDispose) {
  local.ccu--;
  persist();
  handlers[room.roomName].emit("leave", room, client, willDispose);
}
function lockRoom(room) {
  handlers[room.roomName].emit("lock", room);
}
async function unlockRoom(room) {
  if (await createRoomReferences(room)) {
    handlers[room.roomName].emit("unlock", room);
  }
}
function onVisibilityChange(room, isInvisible) {
  handlers[room.roomName].emit("visibility-change", room, isInvisible);
}
async function disposeRoom(roomName, room) {
  debugMatchMaking(
    "disposing '%s' (%s) on processId '%s' (graceful shutdown: %s)",
    roomName,
    room.roomId,
    processId,
    state === 2
    /* SHUTTING_DOWN */
  );
  room.listing.remove();
  local.roomCount--;
  if (state !== 2) {
    persist();
    if (isDevMode) {
      await presence.hdel(getRoomRestoreListKey(), room.roomId);
    }
  }
  handlers[roomName].emit("dispose", room);
  presence.unsubscribe(getRoomChannel(room.roomId));
  delete rooms[room.roomId];
}
function getRoomChannel(roomId) {
  return `$${roomId}`;
}
function getConcurrencyHashKey(roomName) {
  return `ch:${roomName}`;
}
function getProcessChannel(id = processId) {
  return `p:${id}`;
}

// node_modules/@colyseus/core/build/Server.mjs
var Server = class {
  constructor(options = {}) {
    this._originalRoomOnMessage = null;
    this.onShutdownCallback = () => Promise.resolve();
    this.onBeforeShutdownCallback = () => Promise.resolve();
    const { gracefullyShutdown: gracefullyShutdown2 = true, greet = true } = options;
    setDevMode(options.devMode === true);
    this.presence = options.presence || new LocalPresence();
    this.driver = options.driver || new LocalDriver();
    this.greet = greet;
    this.attach(options);
    setup(
      this.presence,
      this.driver,
      options.publicAddress,
      options.selectProcessIdToCreateRoom
    );
    if (gracefullyShutdown2) {
      registerGracefulShutdown((err) => this.gracefullyShutdown(true, err));
    }
    if (options.logger) {
      setLogger(options.logger);
    }
  }
  attach(options) {
    if (options.pingInterval !== void 0 || options.pingMaxRetries !== void 0 || options.server !== void 0 || options.verifyClient !== void 0) {
      logger.warn("DEPRECATION WARNING: 'pingInterval', 'pingMaxRetries', 'server', and 'verifyClient' Server options will be permanently moved to WebSocketTransport on v0.15");
      logger.warn(`new Server({
  transport: new WebSocketTransport({
    pingInterval: ...,
    pingMaxRetries: ...,
    server: ...,
    verifyClient: ...
  })
})`);
      logger.warn("\u{1F449} Documentation: https://docs.colyseus.io/server/transport/");
    }
    const transport = options.transport || this.getDefaultTransport(options);
    this.transport = transport;
    if (this.transport.server) {
      this.transport.server.once("listening", () => this.registerProcessForDiscovery());
      this.attachMatchMakingRoutes(this.transport.server);
    }
  }
  /**
   * Bind the server into the port specified.
   *
   * @param port
   * @param hostname
   * @param backlog
   * @param listeningListener
   */
  async listen(port2, hostname, backlog, listeningListener) {
    this.port = port2;
    await accept();
    if (this.greet) {
      console.log(index_default);
    }
    return new Promise((resolve, reject) => {
      this.transport.server?.on("error", (err) => reject(err));
      this.transport.listen(port2, hostname, backlog, (err) => {
        if (listeningListener) {
          listeningListener(err);
        }
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  async registerProcessForDiscovery() {
    await registerNode(this.presence, {
      port: this.port,
      processId
    });
  }
  define(nameOrHandler, handlerOrOptions, defaultOptions2) {
    const name = typeof nameOrHandler === "string" ? nameOrHandler : nameOrHandler.name;
    const roomClass = typeof nameOrHandler === "string" ? handlerOrOptions : nameOrHandler;
    const options = typeof nameOrHandler === "string" ? defaultOptions2 : handlerOrOptions;
    return defineRoomType(name, roomClass, options);
  }
  /**
   * Remove a room definition from matchmaking.
   * This method does not destroy any room. It only dissallows matchmaking
   */
  removeRoomType(name) {
    removeRoomType(name);
  }
  async gracefullyShutdown(exit = true, err) {
    if (state === MatchMakerState.SHUTTING_DOWN) {
      return;
    }
    await unregisterNode(this.presence, {
      port: this.port,
      processId
    });
    try {
      await this.onBeforeShutdownCallback();
      await gracefullyShutdown();
      this.transport.shutdown();
      this.presence.shutdown();
      this.driver.shutdown();
      await this.onShutdownCallback();
    } catch (e) {
      debugAndPrintError(`error during shutdown: ${e}`);
    } finally {
      if (exit) {
        process.exit(err && !isDevMode ? 1 : 0);
      }
    }
  }
  /**
   * Add simulated latency between client and server.
   * @param milliseconds round trip latency in milliseconds.
   */
  simulateLatency(milliseconds) {
    if (milliseconds > 0) {
      logger.warn(`\u{1F4F6}\uFE0F\u2757 Colyseus latency simulation enabled \u2192 ${milliseconds}ms latency for round trip.`);
    } else {
      logger.warn(`\u{1F4F6}\uFE0F\u2757 Colyseus latency simulation disabled.`);
    }
    const halfwayMS = milliseconds / 2;
    this.transport.simulateLatency(halfwayMS);
    if (this._originalRoomOnMessage == null) {
      this._originalRoomOnMessage = Room.prototype["_onMessage"];
    }
    const originalOnMessage = this._originalRoomOnMessage;
    Room.prototype["_onMessage"] = milliseconds <= Number.EPSILON ? originalOnMessage : function(client, buffer) {
      const cachedBuffer = Buffer.from(buffer);
      setTimeout(() => originalOnMessage.call(this, client, cachedBuffer), halfwayMS);
    };
  }
  /**
   * Register a callback that is going to be executed before the server shuts down.
   * @param callback
   */
  onShutdown(callback) {
    this.onShutdownCallback = callback;
  }
  onBeforeShutdown(callback) {
    this.onBeforeShutdownCallback = callback;
  }
  getDefaultTransport(_) {
    throw new Error("Please provide a 'transport' layer. Default transport not set.");
  }
  attachMatchMakingRoutes(server) {
    const listeners = server.listeners("request").slice(0);
    server.removeAllListeners("request");
    server.on("request", (req, res) => {
      if (req.url.indexOf(`/${controller_default.matchmakeRoute}`) !== -1) {
        debugMatchMaking("received matchmake request: %s", req.url);
        this.handleMatchMakeRequest(req, res);
      } else {
        for (let i = 0, l = listeners.length; i < l; i++) {
          listeners[i].call(server, req, res);
        }
      }
    });
  }
  async handleMatchMakeRequest(req, res) {
    if (state === MatchMakerState.SHUTTING_DOWN) {
      res.writeHead(503, {});
      res.end();
      return;
    }
    const headers = Object.assign(
      {},
      controller_default.DEFAULT_CORS_HEADERS,
      controller_default.getCorsHeaders.call(void 0, req)
    );
    if (req.method === "OPTIONS") {
      res.writeHead(204, headers);
      res.end();
    } else if (req.method === "POST") {
      const matchedParams = req.url.match(controller_default.allowedRoomNameChars);
      const matchmakeIndex = matchedParams.indexOf(controller_default.matchmakeRoute);
      const method = matchedParams[matchmakeIndex + 1];
      const roomName = matchedParams[matchmakeIndex + 2] || "";
      const data = [];
      req.on("data", (chunk) => data.push(chunk));
      req.on("end", async () => {
        headers["Content-Type"] = "application/json";
        res.writeHead(200, headers);
        try {
          const clientOptions = JSON.parse(Buffer.concat(data).toString());
          const response = await controller_default.invokeMethod(
            method,
            roomName,
            clientOptions,
            {
              token: getBearerToken(req.headers["authorization"]),
              headers: req.headers,
              ip: req.headers["x-real-ip"] ?? req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
              req
            }
          );
          if (this.transport.protocol !== void 0) {
            response.protocol = this.transport.protocol;
          }
          res.write(JSON.stringify(response));
        } catch (e) {
          res.write(JSON.stringify({ code: e.code, error: e.message }));
        }
        res.end();
      });
    } else if (req.method === "GET") {
      res.writeHead(404, headers);
      res.end();
    }
  }
};

// node_modules/@colyseus/core/build/rooms/RelayRoom.mjs
var Player = class extends Schema {
};
defineTypes(Player, {
  connected: "boolean",
  name: "string",
  sessionId: "string"
});
var State = class extends Schema {
  constructor() {
    super(...arguments);
    this.players = new MapSchema();
  }
};
defineTypes(State, {
  players: { map: Player }
});

// node_modules/ws/wrapper.mjs
var import_stream2 = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// node_modules/@colyseus/ws-transport/build/WebSocketClient.mjs
var SEND_OPTS = { binary: true };
var WebSocketClient = class {
  constructor(id, ref) {
    this.id = id;
    this.ref = ref;
    this.state = ClientState.JOINING;
    this._enqueuedMessages = [];
    this.sessionId = id;
  }
  sendBytes(type2, bytes, options) {
    debugMessage("send bytes(to %s): '%s' -> %j", this.sessionId, type2, bytes);
    this.enqueueRaw(
      getMessageBytes.raw(Protocol.ROOM_DATA_BYTES, type2, void 0, bytes),
      options
    );
  }
  send(messageOrType, messageOrOptions, options) {
    debugMessage("send(to %s): '%s' -> %j", this.sessionId, messageOrType, messageOrOptions);
    this.enqueueRaw(
      getMessageBytes.raw(Protocol.ROOM_DATA, messageOrType, messageOrOptions),
      options
    );
  }
  enqueueRaw(data, options) {
    if (options?.afterNextPatch) {
      this._afterNextPatchQueue.push([this, [data]]);
      return;
    }
    if (this.state === ClientState.JOINING) {
      this._enqueuedMessages.push(data);
      return;
    }
    this.raw(data, options);
  }
  raw(data, options, cb) {
    if (this.ref.readyState !== wrapper_default.OPEN) {
      return;
    }
    this.ref.send(data, SEND_OPTS, cb);
  }
  error(code, message = "", cb) {
    this.raw(getMessageBytes[Protocol.ERROR](code, message), void 0, cb);
  }
  get readyState() {
    return this.ref.readyState;
  }
  leave(code, data) {
    this.ref.close(code, data);
  }
  close(code, data) {
    logger.warn("DEPRECATION WARNING: use client.leave() instead of client.close()");
    try {
      throw new Error();
    } catch (e) {
      logger.info(e.stack);
    }
    this.leave(code, data);
  }
  toJSON() {
    return { sessionId: this.sessionId, readyState: this.readyState };
  }
};

// node_modules/@colyseus/ws-transport/build/WebSocketTransport.mjs
var import_http = __toESM(require("http"), 1);
var import_url = require("url");
function noop() {
}
function heartbeat() {
  this.pingCount = 0;
}
var WebSocketTransport = class extends Transport {
  constructor(options = {}) {
    super();
    this._originalSend = null;
    if (options.maxPayload === void 0) {
      options.maxPayload = 4 * 1024;
    }
    if (options.perMessageDeflate === void 0) {
      options.perMessageDeflate = false;
    }
    this.pingIntervalMS = options.pingInterval !== void 0 ? options.pingInterval : 3e3;
    this.pingMaxRetries = options.pingMaxRetries !== void 0 ? options.pingMaxRetries : 2;
    if (!options.server && !options.noServer) {
      options.server = import_http.default.createServer();
    }
    this.wss = new import_websocket_server.default(options);
    this.wss.on("connection", this.onConnection);
    this.wss.on("error", (err) => debugAndPrintError(err));
    this.server = options.server;
    if (this.pingIntervalMS > 0 && this.pingMaxRetries > 0) {
      this.server.on("listening", () => this.autoTerminateUnresponsiveClients(this.pingIntervalMS, this.pingMaxRetries));
      this.server.on("close", () => clearInterval(this.pingInterval));
    }
  }
  listen(port2, hostname, backlog, listeningListener) {
    this.server.listen(port2, hostname, backlog, listeningListener);
    return this;
  }
  shutdown() {
    this.wss.close();
    this.server.close();
  }
  simulateLatency(milliseconds) {
    if (this._originalSend == null) {
      this._originalSend = WebSocketClient.prototype.raw;
    }
    const originalSend = this._originalSend;
    WebSocketClient.prototype.raw = milliseconds <= Number.EPSILON ? originalSend : function(...args) {
      let [buf, ...rest] = args;
      buf = Array.from(buf);
      setTimeout(() => originalSend.apply(this, [buf, ...rest]), milliseconds);
    };
  }
  autoTerminateUnresponsiveClients(pingInterval, pingMaxRetries) {
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((client) => {
        if (client.pingCount >= pingMaxRetries) {
          debugConnection(`terminating unresponsive client`);
          return client.terminate();
        }
        client.pingCount++;
        client.ping(noop);
      });
    }, pingInterval);
  }
  async onConnection(rawClient, req) {
    rawClient.on("error", (err) => debugAndPrintError(err.message + "\n" + err.stack));
    rawClient.on("pong", heartbeat);
    const parsedURL = new import_url.URL(`ws://server/${req.url}`);
    const sessionId = parsedURL.searchParams.get("sessionId");
    const processAndRoomId = parsedURL.pathname.match(/\/[a-zA-Z0-9_\-]+\/([a-zA-Z0-9_\-]+)$/);
    const roomId = processAndRoomId && processAndRoomId[1];
    const room = MatchMaker_exports.getLocalRoomById(roomId);
    rawClient.pingCount = 0;
    const client = new WebSocketClient(sessionId, rawClient);
    try {
      if (!room || !room.hasReservedSeat(sessionId, parsedURL.searchParams.get("reconnectionToken"))) {
        throw new Error("seat reservation expired.");
      }
      await room._onJoin(client, {
        headers: req.headers,
        token: parsedURL.searchParams.get("_authToken") ?? getBearerToken(req.headers.authorization),
        ip: req.headers["x-real-ip"] ?? req.headers["x-forwarded-for"] ?? req.socket.remoteAddress
      });
    } catch (e) {
      debugAndPrintError(e);
      client.error(e.code, e.message, () => rawClient.close(Protocol.WS_CLOSE_WITH_ERROR));
    }
  }
};

// src/core/types.ts
function emptyInput() {
  return { moveX: 0, moveY: 0, aimX: 1, aimY: 0, attack: false, attackReleased: false, ultimate: false };
}

// src/config/soccer.ts
var PITCH = {
  width: 1960,
  height: 1180,
  /** Épaisseur des murs de contour (px). */
  wallThickness: 44,
  /** Hauteur de l'ouverture d'un but (px). */
  goalWidth: 360,
  /** Profondeur de la zone de but (px) — un ballon dont le centre y entre = but. */
  goalDepth: 44
};
var BALL = {
  radius: 20,
  /** Décroissance exponentielle de la vitesse par seconde (frottement du sol). */
  friction: 1.6,
  /** Vitesse d'un tir (px/s). */
  kickSpeed: 1050,
  /** Vitesse en dessous de laquelle la balle s'arrête net (px/s). */
  stopSpeed: 6,
  /** Rebond sur les murs (0 = amorti, 1 = parfait). */
  restitution: 0.62,
  /** Espace laissé devant le porteur (px). */
  carryOffset: 8,
  /** Le porteur se déplace un peu moins vite (0.9 = 90%). */
  carrySlowFactor: 0.9,
  /** Personne ne peut ramasser la balle juste après un tir (ms). */
  grabGraceMs: 130,
  /** Le tireur ne peut pas la reprendre pendant ce délai (ms). */
  kickerLockMs: 380,
  /** Tolérance de ramassage en plus des rayons (px). */
  grabPad: 6
};
var SOCCER = {
  /** Combattants par équipe. */
  teamSize: 3,
  /** Délai de réapparition après élimination (ms). */
  respawnMs: 3e3,
  /** Durée du temps réglementaire (ms) — 2 minutes. */
  matchMs: 12e4,
  /** Nombre de buts pour gagner directement. */
  goalsToWin: 2,
  /** Pause de célébration après un but avant l'engagement (ms). */
  goalCelebrateMs: 1500,
  /** Petit gel au coup d'envoi, le temps de se placer (ms). */
  kickoffFreezeMs: 900,
  /** Portée à laquelle un bot porteur tente sa frappe au but (px). */
  botShootRange: 560
};

// src/maps/pitchNyxt.ts
var W = PITCH.width;
var H = PITCH.height;
var T = PITCH.wallThickness;
var GAP = PITCH.goalWidth;
var gapTop = (H - GAP) / 2;
var gapBottom = (H + GAP) / 2;
var walls = [
  // Haut / bas : murs pleins sur toute la largeur.
  { x: 0, y: 0, w: W, h: T },
  { x: 0, y: H - T, w: W, h: T },
  // Gauche : deux segments laissant l'ouverture du but au milieu.
  { x: 0, y: 0, w: T, h: gapTop },
  { x: 0, y: gapBottom, w: T, h: H - gapBottom },
  // Droite : idem.
  { x: W - T, y: 0, w: T, h: gapTop },
  { x: W - T, y: gapBottom, w: T, h: H - gapBottom }
];
var cover = [
  { x: W / 2 - 45, y: H * 0.2, w: 90, h: 90 },
  { x: W / 2 - 45, y: H * 0.8 - 90, w: 90, h: 90 },
  { x: W * 0.3 - 45, y: H / 2 - 45, w: 90, h: 90 },
  { x: W * 0.7 - 45, y: H / 2 - 45, w: 90, h: 90 }
];
var map = {
  id: "pitch-nyxt",
  name: "Stade Nyxt",
  width: W,
  height: H,
  bushes: [],
  // foot pur : pas de buissons (pas de furtivité pour rester lisible)
  obstacles: [...walls, ...cover]
};
var PITCH_NYXT = {
  map,
  walls,
  leftGoal: { zone: { x: 0, y: gapTop, w: T, h: GAP }, centerX: T, centerY: H / 2 },
  rightGoal: { zone: { x: W - T, y: gapTop, w: T, h: GAP }, centerX: W - T, centerY: H / 2 },
  // Équipe 0 (attaque la droite) sur la moitié gauche.
  spawnsTeam0: [
    { x: W * 0.35, y: H * 0.5, role: "mid" },
    // emplacement du joueur (indice 0)
    { x: W * 0.19, y: H * 0.72, role: "defender" },
    { x: W * 0.3, y: H * 0.26, role: "forward" }
  ],
  // Équipe 1 (attaque la gauche) sur la moitié droite, en miroir.
  spawnsTeam1: [
    { x: W * 0.65, y: H * 0.5, role: "mid" },
    { x: W * 0.81, y: H * 0.28, role: "defender" },
    { x: W * 0.7, y: H * 0.74, role: "forward" }
  ],
  ballStart: { x: W / 2, y: H / 2 },
  centerX: W / 2,
  centerY: H / 2
};

// src/maps/portalArena.ts
var W2 = 2160;
var H2 = 1360;
var DIVIDER_X = 1558;
var DIVIDER_W = 44;
var REFUGE_MIN_X = DIVIDER_X + DIVIDER_W / 2;
var MAIN_RECT = { x: 0, y: 0, w: DIVIDER_X, h: H2 };
var REFUGE_RECT = { x: DIVIDER_X + DIVIDER_W, y: 0, w: W2 - (DIVIDER_X + DIVIDER_W), h: H2 };
var PORTAL_REGIONS = {
  main: MAIN_RECT,
  refuge: REFUGE_RECT,
  refugeMinX: REFUGE_MIN_X
};
var PORTAL_SPAWN_RING = { cx: 760, cy: H2 / 2, r: 520 };
var PORTAL_ARENA = {
  id: "arena-portal",
  name: "Chambre Nyxt",
  width: W2,
  height: H2,
  bushes: [
    { x: 640, y: 220, w: 200, h: 120 },
    { x: 640, y: 1010, w: 200, h: 120 },
    { x: 1160, y: 220, w: 220, h: 120 },
    { x: 1150, y: 1010, w: 220, h: 120 },
    { x: 900, y: 560, w: 200, h: 120 },
    // Refuge : un peu de couvert.
    { x: 1680, y: 200, w: 180, h: 120 },
    { x: 1900, y: 1040, w: 180, h: 120 }
  ],
  obstacles: [
    // Cloison pleine (bloque déplacements ET projectiles → refuge vraiment isolé).
    { x: DIVIDER_X, y: 0, w: DIVIDER_W, h: H2 },
    // Couverture — grande salle.
    { x: 760, y: 600, w: 120, h: 120 },
    { x: 1180, y: 560, w: 96, h: 96 },
    { x: 440, y: 660, w: 96, h: 96 },
    { x: 980, y: 240, w: 96, h: 96 },
    { x: 980, y: 1024, w: 96, h: 96 },
    { x: 180, y: 600, w: 90, h: 190 },
    // Couverture — refuge.
    { x: 1700, y: 560, w: 96, h: 96 },
    { x: 1980, y: 560, w: 96, h: 96 }
  ]
};
var PORTAL_PAIRS = [
  { color: "green", roaming: false, a: { x: 560, y: 360 }, b: { x: 1720, y: 360 }, aRegion: "main", bRegion: "refuge" },
  { color: "green", roaming: false, a: { x: 560, y: 1e3 }, b: { x: 2030, y: 1e3 }, aRegion: "main", bRegion: "refuge" },
  { color: "green", roaming: false, a: { x: 1340, y: 680 }, b: { x: 1880, y: 680 }, aRegion: "main", bRegion: "refuge" },
  { color: "blue", roaming: true, a: { x: 820, y: 360 }, b: { x: 1220, y: 940 }, aRegion: "main", bRegion: "main" },
  { color: "orange", roaming: true, a: { x: 360, y: 680 }, b: { x: 1300, y: 360 }, aRegion: "main", bRegion: "main" }
];
var PORTAL_CFG = {
  triggerRadius: 40,
  landingOffset: 72,
  cooldownMs: 750,
  relocateMs: 13e3
};
var NEURO_CFG = {
  graceMs: 9e3,
  mainBaseDps: 8,
  mainSlope: 1.6,
  finalMs: 55e3,
  refugeBaseDps: 6,
  refugeSlope: 1.4,
  refugeMinX: REFUGE_MIN_X
};

// src/shared/game/neurotoxin.ts
var NeurotoxinField = class {
  constructor(cfg) {
    this.cfg = cfg;
    this.elapsed = 0;
  }
  update(dtMs) {
    this.elapsed += dtMs;
  }
  /** Le gaz a-t-il commencé (grande salle) ? */
  get active() {
    return this.elapsed >= this.cfg.graceMs;
  }
  get phase() {
    if (this.elapsed < this.cfg.graceMs) return "grace";
    if (this.elapsed < this.cfg.finalMs) return "flooding";
    return "final";
  }
  isRefuge(x) {
    return x >= this.cfg.refugeMinX;
  }
  /** Dégâts/s actuels dans la grande salle. */
  get mainDps() {
    const t = (this.elapsed - this.cfg.graceMs) / 1e3;
    if (t <= 0) return 0;
    return this.cfg.mainBaseDps + this.cfg.mainSlope * t;
  }
  /** Dégâts/s actuels dans le refuge (0 tant que la phase finale n'a pas commencé). */
  get refugeDps() {
    const t = (this.elapsed - this.cfg.finalMs) / 1e3;
    if (t <= 0) return 0;
    return this.cfg.refugeBaseDps + this.cfg.refugeSlope * t;
  }
  /** Dégâts/s subis à une position donnée. */
  dpsAt(x, _y) {
    return this.isRefuge(x) ? this.refugeDps : this.mainDps;
  }
  isDanger(x, y) {
    return this.dpsAt(x, y) > 0;
  }
};

// src/shared/game/portals.ts
var COLOR_HEX = {
  green: 4644970,
  blue: 5092607,
  orange: 16751932
};
var PortalSystem = class {
  constructor(pairs, bounds, cfg, isFreeSpot) {
    this.bounds = bounds;
    this.cfg = cfg;
    this.isFreeSpot = isFreeSpot;
    this.endpoints = [];
    this.cooldowns = /* @__PURE__ */ new Map();
    this.relocTimer = 0;
    /** Accumulateur d'animation (rotation du tourbillon), lu par le rendu. */
    this.spin = 0;
    this.mainCenter = { x: bounds.main.x + bounds.main.w / 2, y: bounds.main.y + bounds.main.h / 2 };
    this.refugeCenter = { x: bounds.refuge.x + bounds.refuge.w / 2, y: bounds.refuge.y + bounds.refuge.h / 2 };
    pairs.forEach((p, pairId) => {
      const iA = this.endpoints.length;
      const iB = iA + 1;
      this.endpoints.push({ color: p.color, colorHex: COLOR_HEX[p.color], x: p.a.x, y: p.a.y, link: iB, region: p.aRegion, roaming: p.roaming, pair: pairId });
      this.endpoints.push({ color: p.color, colorHex: COLOR_HEX[p.color], x: p.b.x, y: p.b.y, link: iA, region: p.bRegion, roaming: p.roaming, pair: pairId });
    });
  }
  update(dtMs) {
    this.spin += dtMs / 1e3;
    for (const [id, cd] of this.cooldowns) {
      const next = cd - dtMs;
      if (next <= 0) this.cooldowns.delete(id);
      else this.cooldowns.set(id, next);
    }
    this.relocTimer += dtMs;
    if (this.relocTimer >= this.cfg.relocateMs) {
      this.relocTimer = 0;
      this.relocateRoaming();
    }
  }
  /** Tente de téléporter l'acteur s'il est sur un portail. Renvoie true si téléporté. */
  tryTeleport(actor) {
    if (!actor.alive) return false;
    if ((this.cooldowns.get(actor.id) ?? 0) > 0) return false;
    const trig = this.cfg.triggerRadius;
    for (const ep of this.endpoints) {
      const dx = actor.x - ep.x;
      const dy = actor.y - ep.y;
      if (dx * dx + dy * dy > trig * trig) continue;
      const dest = this.endpoints[ep.link];
      const center = dest.region === "refuge" ? this.refugeCenter : this.mainCenter;
      let nx = center.x - dest.x;
      let ny = center.y - dest.y;
      const l = Math.hypot(nx, ny);
      if (l < 1e-3) {
        nx = 0;
        ny = 1;
      } else {
        nx /= l;
        ny /= l;
      }
      const off = this.cfg.landingOffset;
      actor.x = dest.x + nx * off;
      actor.y = dest.y + ny * off;
      this.cooldowns.set(actor.id, this.cfg.cooldownMs);
      return true;
    }
    return false;
  }
  /** Portail vert le plus proche dans une région donnée (pour l'IA en fuite). */
  nearestGreenTo(x, y, region) {
    let best = null;
    let bestD = Infinity;
    for (const ep of this.endpoints) {
      if (ep.color !== "green" || ep.region !== region) continue;
      const d = (ep.x - x) ** 2 + (ep.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = { x: ep.x, y: ep.y };
      }
    }
    return best;
  }
  relocateRoaming() {
    const pairs = /* @__PURE__ */ new Map();
    for (const ep of this.endpoints) {
      if (!ep.roaming) continue;
      const arr = pairs.get(ep.pair) ?? [];
      arr.push(ep);
      pairs.set(ep.pair, arr);
    }
    for (const eps of pairs.values()) {
      if (eps.length !== 2) continue;
      const a = this.randSpotInMain();
      let b = this.randSpotInMain();
      let tries = 0;
      while ((b.x - a.x) ** 2 + (b.y - a.y) ** 2 < 520 * 520 && tries < 12) {
        b = this.randSpotInMain();
        tries++;
      }
      eps[0].x = a.x;
      eps[0].y = a.y;
      eps[1].x = b.x;
      eps[1].y = b.y;
    }
  }
  randSpotInMain() {
    const r = this.bounds.main;
    const margin = 70;
    for (let i = 0; i < 40; i++) {
      const x = r.x + margin + Math.random() * (r.w - margin * 2);
      const y = r.y + margin + Math.random() * (r.h - margin * 2);
      if (this.isFreeSpot(x, y, margin)) return { x, y };
    }
    return { x: this.mainCenter.x, y: this.mainCenter.y };
  }
};

// src/config/constants.ts
var COLORS = {
  background: 723738,
  arenaFloor: 1579058,
  arenaGrid: 2368586,
  bush: 2062909,
  bushEdge: 3124823,
  obstacle: 3816028,
  obstacleEdge: 5592447,
  zoneBorder: 10178047,
  zoneDanger: 4857210,
  powerCube: 6742271,
  poison: 8839258,
  playerAccent: 16769126,
  healthGood: 4641120,
  healthLow: 14698298,
  healthBack: 921116,
  ultReady: 16764723,
  textLight: 15921919,
  white: 16777215
};
var ZONE = {
  /** Délai avant le premier rétrécissement (ms). */
  startDelayMs: 8e3,
  /** Durée d'un palier de rétrécissement (ms). */
  shrinkStepMs: 12e3,
  /** Temps de pause entre deux rétrécissements (ms). */
  restBetweenMs: 5e3,
  /** Rayon final de la zone (px) — la zone ne descend jamais en dessous. */
  minRadius: 180,
  /** Dégâts par seconde hors zone (augmente à chaque palier). */
  baseDamagePerSecond: 6,
  damagePerSecondPerStep: 4
};
var POWER_CUBE = {
  /** Nombre de cubes dispersés au départ. */
  initialCount: 10,
  /** Bonus multiplicatif de PV max et de dégâts par cube (0.10 = +10%). */
  bonusPerCube: 0.1,
  /** Rayon de ramassage (px). */
  pickupRadius: 26,
  /** Rayon visuel du cube (px). */
  radius: 12,
  /** Un cube resté hors de la zone sûre disparaît après ce délai (ms). */
  outsideDespawnMs: 5e3,
  /** Délai avant que les cubes « en trop » d'un combattant mort réapparaissent au hasard (ms). */
  respawnDelayMs: 5e3
};
var REGEN = {
  /** Délai sans tirer ni subir de dégâts avant que la régén démarre (ms). */
  delayMs: 1500,
  /** Fraction des PV max régénérée par seconde une fois la régén active. */
  percentPerSecond: 0.05
};
var AI = {
  /** Portée de détection d'une cible (px). */
  visionRange: 620,
  /** Le bot recharge son ultimate puis l'utilise dès qu'un ennemi est à cette portée (px). */
  ultUseRange: 220,
  /** Sous ce ratio de PV, le bot fuit le combat. */
  fleeHealthRatio: 0.3,
  /** Marge intérieure de la zone visée par le bot pour rester en sécurité (px). */
  zoneSafetyMargin: 70,
  /** Intervalle de re-décision de l'IA (ms) — évite de recalculer chaque frame. */
  rethinkMs: 250
};

// src/zareks/zephyr.ts
var ZEPHYR = {
  id: "zephyr",
  name: "Zephyr",
  role: "sharpshooter",
  description: "Tireur agile. Projette des ondes sonores \xE0 moyenne port\xE9e. Ultimate : break dance qui repousse, pour reprendre ses distances et sniper.",
  color: 5101311,
  accent: 15400959,
  maxHealth: 900,
  moveSpeed: 230,
  radius: 22,
  attack: {
    kind: "projectile",
    label: "Ondes sonores",
    reloadMs: 550,
    count: 3,
    spreadDeg: 14,
    damage: 120,
    range: 460,
    speed: 620,
    projRadius: 9
  },
  ultimate: {
    kind: "shockwave",
    label: "Break Dance",
    damage: 300,
    radius: 210,
    knockback: 650,
    slowMs: 0,
    slowFactor: 1
  },
  ultChargePerDamage: 0.06,
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90,
    // même bake camera qu'Atlas → même calibration
    spin: -1,
    scale: 0.405,
    footY: 0,
    idle: { key: "zephyr_idle", cols: 1, frameRate: 1 },
    walk: { key: "zephyr_walk", cols: 8, frameRate: 10 }
  }
};

// src/zareks/atlas.ts
var ATLAS = {
  id: "atlas",
  name: "Atlas",
  role: "tank",
  description: "Tank r\xE9sistant. Frappe lourde \xE0 courte port\xE9e. Ultimate : s\xE9isme qui ralentit fortement (garde les ennemis \xE0 port\xE9e).",
  color: 16747069,
  accent: 16767411,
  maxHealth: 1800,
  moveSpeed: 175,
  radius: 30,
  attack: {
    kind: "projectile",
    label: "Impact",
    reloadMs: 850,
    count: 2,
    spreadDeg: 22,
    damage: 260,
    range: 240,
    speed: 480,
    projRadius: 15
  },
  ultimate: {
    kind: "shockwave",
    label: "S\xE9isme",
    damage: 420,
    radius: 260,
    knockback: 0,
    slowMs: 3e3,
    slowFactor: 0.4
  },
  ultChargePerDamage: 0.05,
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90,
    // calibré in-game : 0°(droite)→face captée à tort ; décalé pour que bas=face, haut=dos
    spin: -1,
    scale: 0.405,
    // -10% (retour utilisateur : trop gros à 0.45)
    footY: 0,
    idle: { key: "atlas_idle", cols: 1, frameRate: 1 },
    walk: { key: "atlas_walk", cols: 8, frameRate: 10 }
  }
};

// src/zareks/hecate.ts
var HECATE = {
  id: "hecate",
  name: "H\xE9cate",
  role: "mage",
  description: "Mage de contr\xF4le, fragile. Lance des potions qui cr\xE9ent des flaques de d\xE9g\xE2ts. Ultimate : aura qui ralentit et empoisonne (d\xE9g\xE2ts persistants).",
  color: 11561983,
  accent: 15125759,
  maxHealth: 800,
  moveSpeed: 215,
  radius: 22,
  attack: {
    kind: "potion",
    label: "Potion toxique",
    reloadMs: 1e3,
    count: 1,
    spreadDeg: 0,
    damage: 0,
    range: 340,
    speed: 520,
    projRadius: 11,
    aoeRadius: 90,
    aoeDurationMs: 2500,
    aoeDps: 170
  },
  ultimate: {
    kind: "aura",
    label: "Aura de poison",
    damage: 0,
    radius: 200,
    knockback: 0,
    slowMs: 800,
    slowFactor: 0.55,
    auraDurationMs: 4e3,
    poisonMs: 2500,
    poisonDps: 130
  },
  ultChargePerDamage: 0.06,
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90,
    spin: -1,
    scale: 0.405,
    footY: 0,
    idle: { key: "hecate_idle", cols: 1, frameRate: 1 },
    walk: { key: "hecate_walk", cols: 8, frameRate: 10 }
  }
};

// src/zareks/astrape.ts
var ASTRAPE = {
  id: "astrape",
  name: "Astrap\xE9",
  role: "mage",
  description: "Mage foudre, fragile. Attaque : \xE9clair instantan\xE9 sur l\u2019ennemi le plus proche. Ultimate : Surcharge \u2014 \xE9clair en cha\xEEne qui rebondit jusqu\u2019\xE0 4 ennemis (\u221225 % par rebond) avec une longue port\xE9e.",
  color: 16765503,
  accent: 16774064,
  maxHealth: 850,
  moveSpeed: 220,
  radius: 22,
  attack: {
    kind: "chain",
    label: "\xC9clair",
    reloadMs: 850,
    count: 1,
    spreadDeg: 0,
    damage: 140,
    // besoin de ~2 coups de plus qu'avant pour un même total
    range: 360,
    // portée de la cible
    speed: 0,
    // instantané (pas de projectile)
    projRadius: 0,
    chainMaxJumps: 0
    // touche uniquement le plus proche (aucun rebond)
  },
  ultimate: {
    kind: "chain",
    label: "Surcharge",
    damage: 140,
    // même dégât de base que l'attaque normale
    radius: 440,
    // portée de la première cible (plus longue que l'attaque)
    knockback: 0,
    slowMs: 900,
    slowFactor: 0.6,
    chainJumpRange: 400,
    // rebonds longue distance
    chainMaxJumps: 3,
    // 1ʳᵉ cible + 3 rebonds = jusqu'à 4 cibles
    chainFalloff: 0.75
    // −25 % par cible touchée
  },
  // Charge d'ult au rythme normal (comme les autres mages).
  ultChargePerDamage: 0.06,
  sprite: {
    dirs: 8,
    yawOffsetDeg: 90,
    spin: -1,
    scale: 0.405,
    footY: 0,
    idle: { key: "astrape_idle", cols: 1, frameRate: 1 },
    walk: { key: "astrape_walk", cols: 8, frameRate: 10 }
  }
};

// src/zareks/registry.ts
var ZAREKS = [ZEPHYR, ATLAS, HECATE, ASTRAPE];
var ZAREK_BY_ID = Object.fromEntries(
  ZAREKS.map((z) => [z.id, z])
);
function getZarek(id) {
  const z = ZAREK_BY_ID[id];
  if (!z) throw new Error(`Zarek inconnu : ${id}`);
  return z;
}

// src/core/geometry.ts
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
function normalize(x, y) {
  const l = Math.hypot(x, y);
  if (l < 1e-6) return { x: 0, y: 0 };
  return { x: x / l, y: y / l };
}
function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
function resolveCircleRect(cx, cy, radius, r) {
  const nearestX = clamp(cx, r.x, r.x + r.w);
  const nearestY = clamp(cy, r.y, r.y + r.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  const d2 = dx * dx + dy * dy;
  if (d2 >= radius * radius) return null;
  if (d2 > 1e-6) {
    const d = Math.sqrt(d2);
    const push = radius - d;
    return { x: cx + dx / d * push, y: cy + dy / d * push };
  }
  const left = cx - r.x;
  const right = r.x + r.w - cx;
  const top = cy - r.y;
  const bottom = r.y + r.h - cy;
  const minH = Math.min(left, right);
  const minV = Math.min(top, bottom);
  if (minH < minV) {
    return { x: left < right ? r.x - radius : r.x + r.w + radius, y: cy };
  }
  return { x: cx, y: top < bottom ? r.y - radius : r.y + r.h + radius };
}
function circleHitsRect(cx, cy, radius, r) {
  const nearestX = clamp(cx, r.x, r.x + r.w);
  const nearestY = clamp(cy, r.y, r.y + r.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

// src/ai/SoccerBot.ts
var SoccerBot = class {
  constructor(role) {
    this.rethink = 0;
    this.role = role;
  }
  update(self, world, dtMs) {
    const input = emptyInput();
    if (!self.alive || world.frozen) return input;
    this.rethink -= dtMs;
    if (this.rethink <= 0) this.rethink = AI.rethinkMs;
    const enemyGoal = self.team === 0 ? world.rightGoal : world.leftGoal;
    const ownGoal = self.team === 0 ? world.leftGoal : world.rightGoal;
    const ball = world.ball;
    const iCarry = ball.carrierId === self.id;
    let moveX = 0;
    let moveY = 0;
    let aimX = Math.cos(self.aimAngle);
    let aimY = Math.sin(self.aimAngle);
    if (iCarry) {
      const toGoal = normalize(enemyGoal.x - self.x, enemyGoal.y - self.y);
      moveX = toGoal.x;
      moveY = toGoal.y;
      aimX = toGoal.x;
      aimY = toGoal.y;
      const dGoal = dist(self.x, self.y, enemyGoal.x, enemyGoal.y);
      const pressed = this.nearestEnemy(self, world, 96) !== null;
      if (dGoal <= SOCCER.botShootRange || pressed) {
        input.attack = true;
        input.attackReleased = true;
      }
    } else {
      const carrier = ball.carrierId ? world.all.find((c) => c.id === ball.carrierId) : void 0;
      const target2 = this.movementTarget(self, world, ball, carrier, enemyGoal, ownGoal);
      const to = normalize(target2.x - self.x, target2.y - self.y);
      moveX = to.x;
      moveY = to.y;
      const foe = this.nearestEnemy(self, world, self.def.attack.range * 1.05);
      if (foe) {
        const d = dist(self.x, self.y, foe.x, foe.y);
        if (self.def.attack.kind === "potion") {
          aimX = foe.x - self.x;
          aimY = foe.y - self.y;
          input.attackReleased = d <= self.def.attack.range;
          input.attack = input.attackReleased;
        } else {
          const n = normalize(foe.x - self.x, foe.y - self.y);
          aimX = n.x;
          aimY = n.y;
          input.attack = d <= self.def.attack.range;
        }
        input.ultimate = self.ultReady && d <= AI.ultUseRange;
      } else {
        aimX = to.x || aimX;
        aimY = to.y || aimY;
      }
    }
    const av = this.avoid(self, moveX, moveY, world.obstacles);
    input.moveX = av.x;
    input.moveY = av.y;
    input.aimX = aimX;
    input.aimY = aimY;
    return input;
  }
  /**
   * Steering par « whiskers » : on sonde devant soi ; si c'est bloqué, on
   * essaie des directions de plus en plus déviées (gauche/droite) et on prend
   * la première dégagée. Le bot longe le mur au lieu de s'y écraser.
   */
  avoid(self, mx, my, obstacles) {
    if (mx === 0 && my === 0) return { x: 0, y: 0 };
    const base = Math.atan2(my, mx);
    const probe = self.def.radius + 46;
    const offsets = [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4, 1.9, -1.9];
    for (const off of offsets) {
      const a = base + off;
      const px = self.x + Math.cos(a) * probe;
      const py = self.y + Math.sin(a) * probe;
      if (!obstacles.some((o) => circleHitsRect(px, py, self.def.radius, o))) {
        return { x: Math.cos(a), y: Math.sin(a) };
      }
    }
    return { x: mx, y: my };
  }
  /** Où se déplacer quand je ne porte pas la balle, selon la situation et mon rôle. */
  movementTarget(self, world, ball, carrier, enemyGoal, ownGoal) {
    if (ball.free) {
      if (this.amClosestOnTeam(self, world, ball.x, ball.y)) return { x: ball.x, y: ball.y };
      return this.supportPoint(self, world, ball, enemyGoal, ownGoal);
    }
    if (carrier && carrier.team === self.team) {
      return this.supportPoint(self, world, ball, enemyGoal, ownGoal);
    }
    if (carrier) {
      if (this.role === "defender" || this.amClosestOnTeam(self, world, carrier.x, carrier.y)) {
        return { x: carrier.x, y: carrier.y };
      }
      return this.supportPoint(self, world, ball, enemyGoal, ownGoal);
    }
    return { x: ball.x, y: ball.y };
  }
  /** Point de placement quand on ne va pas directement à la balle. */
  supportPoint(self, world, ball, enemyGoal, ownGoal) {
    const lane = self.team === 0 ? 1 : -1;
    if (this.role === "defender") {
      return { x: (ownGoal.x + ball.x) / 2, y: (ownGoal.y + ball.y) / 2 };
    }
    if (this.role === "forward") {
      const spread = self.id.charCodeAt(self.id.length - 1) % 2 === 0 ? -180 : 180;
      return { x: enemyGoal.x - lane * 220, y: world.height / 2 + spread };
    }
    return { x: ball.x + lane * 120, y: ball.y };
  }
  amClosestOnTeam(self, world, x, y) {
    const my = dist(self.x, self.y, x, y);
    for (const c of world.all) {
      if (c.id === self.id || c.team !== self.team || !c.alive) continue;
      const d = dist(c.x, c.y, x, y);
      if (d < my || d === my && c.id < self.id) return false;
    }
    return true;
  }
  nearestEnemy(self, world, maxRange) {
    let best = null;
    let bestD = maxRange;
    for (const c of world.all) {
      if (c.team === self.team || !c.alive) continue;
      const d = dist(self.x, self.y, c.x, c.y);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }
};

// src/ai/BattleBot.ts
function norm(x, y) {
  const d = Math.hypot(x, y);
  return d < 1e-4 ? { x: 0, y: 0 } : { x: x / d, y: y / d };
}
var PERSONALITIES = [
  { name: "brawler", preferredRange: 0.45, strafe: 0.3, jitter: 0.15, fleeHp: 0.18, cubeGreed: 0.5 },
  { name: "sniper", preferredRange: 0.9, strafe: 0.6, jitter: 0.2, fleeHp: 0.35, cubeGreed: 0.4 },
  { name: "trickster", preferredRange: 0.65, strafe: 0.95, jitter: 0.35, fleeHp: 0.28, cubeGreed: 0.5 },
  { name: "farmer", preferredRange: 0.75, strafe: 0.4, jitter: 0.25, fleeHp: 0.4, cubeGreed: 0.95 },
  { name: "coward", preferredRange: 0.95, strafe: 0.7, jitter: 0.3, fleeHp: 0.5, cubeGreed: 0.6 }
];
var BattleBot = class {
  constructor(variant = Math.floor(Math.random() * PERSONALITIES.length)) {
    // +1 ou −1 : tourne dans un sens ou l'autre
    // Point d'errance mémorisé (rafraîchi périodiquement, pas chaque frame).
    this.wx = 0;
    this.wy = 0;
    this.wanderMs = 0;
    this.seeded = false;
    // Bruit de déplacement mémorisé (rafraîchi périodiquement pour rester organique).
    this.jx = 0;
    this.jy = 0;
    this.jitterMs = 0;
    this.p = PERSONALITIES[(variant % PERSONALITIES.length + PERSONALITIES.length) % PERSONALITIES.length];
    this.personality = this.p.name;
    this.strafeSign = Math.random() < 0.5 ? 1 : -1;
  }
  /** Cube vivant le plus proche + sa distance (Infinity si aucun). */
  nearestCube(self, world) {
    let cube = null;
    let cd = Infinity;
    for (const q of world.cubes) {
      if (!q.alive) continue;
      const d = Math.hypot(q.x - self.x, q.y - self.y);
      if (d < cd) {
        cd = d;
        cube = q;
      }
    }
    return { cube, d: cd };
  }
  update(self, world, dtMs) {
    const inp = emptyInput();
    inp.aimX = Math.cos(self.aimAngle);
    inp.aimY = Math.sin(self.aimAngle);
    let foe = null;
    let fd = Infinity;
    for (const o of world.all) {
      if (!o.alive || o.id === self.id || o.team === self.team) continue;
      const d = Math.hypot(o.x - self.x, o.y - self.y);
      if (d < fd) {
        fd = d;
        foe = o;
      }
    }
    const range = self.def.attack.range;
    const lowHp = self.healthRatio < this.p.fleeHp;
    this.jitterMs -= dtMs;
    if (this.jitterMs <= 0) {
      const a = Math.random() * Math.PI * 2;
      this.jx = Math.cos(a);
      this.jy = Math.sin(a);
      this.jitterMs = 500;
    }
    let outside = false;
    let retreat = null;
    if (world.danger) {
      if (world.danger.inDanger(self.x, self.y)) {
        retreat = world.danger.retreat(self.x, self.y);
        outside = retreat !== null;
      }
    } else {
      const distZone = Math.hypot(self.x - world.zone.x, self.y - world.zone.y);
      if (distZone > world.zone.r - 50) {
        outside = true;
        retreat = { x: world.zone.x, y: world.zone.y };
      }
    }
    this.wanderMs -= dtMs;
    if (!this.seeded || this.wanderMs <= 0) {
      const w = world.danger ? world.danger.wander(self.x, self.y) : { x: world.zone.x, y: world.zone.y };
      this.wx = w.x;
      this.wy = w.y;
      this.wanderMs = 1e3;
      this.seeded = true;
    }
    const move = (dx, dy) => {
      const n = norm(dx, dy);
      inp.moveX = n.x;
      inp.moveY = n.y;
    };
    const shootAt = (t) => {
      inp.aimX = t.x - self.x;
      inp.aimY = t.y - self.y;
      inp.attack = true;
      inp.attackReleased = true;
      if (self.ultReady) inp.ultimate = true;
    };
    if (outside && retreat) {
      move(retreat.x - self.x, retreat.y - self.y);
      if (foe && fd < range) shootAt(foe);
    } else if (lowHp && foe) {
      const away = norm(self.x - foe.x, self.y - foe.y);
      const perp = { x: -away.y * this.strafeSign, y: away.x * this.strafeSign };
      move(away.x + perp.x * 0.4 + this.jx * this.p.jitter, away.y + perp.y * 0.4 + this.jy * this.p.jitter);
      if (fd < range) shootAt(foe);
    } else if (foe) {
      const want = range * this.p.preferredRange;
      const margin = range * 0.12;
      const toFoe = norm(foe.x - self.x, foe.y - self.y);
      let radial = 0;
      if (fd > want + margin) radial = 1;
      else if (fd < want - margin) radial = -1;
      const perp = { x: -toFoe.y * this.strafeSign, y: toFoe.x * this.strafeSign };
      let mx = toFoe.x * radial + perp.x * this.p.strafe + this.jx * this.p.jitter;
      let my = toFoe.y * radial + perp.y * this.p.strafe + this.jy * this.p.jitter;
      const { cube, d: cd } = this.nearestCube(self, world);
      const oppReach = 90 + this.p.cubeGreed * 260;
      if (cube && cd < oppReach) {
        const toCube = norm(cube.x - self.x, cube.y - self.y);
        const pull = Math.max(0, 1 - cd / oppReach) * (0.7 + this.p.cubeGreed);
        mx += toCube.x * pull;
        my += toCube.y * pull;
      }
      move(mx, my);
      if (fd < range) shootAt(foe);
    } else {
      const { cube, d: cd } = this.nearestCube(self, world);
      const cubeReach = 120 + this.p.cubeGreed * 700;
      if (cube && cd < cubeReach) {
        move(cube.x - self.x + this.jx * this.p.jitter, cube.y - self.y + this.jy * this.p.jitter);
      } else if (Math.hypot(this.wx - self.x, this.wy - self.y) > 80) {
        move(this.wx - self.x + this.jx * this.p.jitter * 40, this.wy - self.y + this.jy * this.p.jitter * 40);
      } else {
        move(this.jx, this.jy);
      }
    }
    return inp;
  }
};

// src/shared/game/chain.ts
function resolveChain(sx, sy, nodes, firstRange, jumpRange, maxJumps) {
  const hits = [];
  const used = /* @__PURE__ */ new Set();
  let cx = sx;
  let cy = sy;
  let range = firstRange;
  for (let step = 0; step <= maxJumps; step++) {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      if (used.has(i)) continue;
      const n = nodes[i];
      const d = Math.hypot(n.x - cx, n.y - cy);
      if (d <= range + n.radius && d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best < 0) break;
    used.add(best);
    hits.push(best);
    cx = nodes[best].x;
    cy = nodes[best].y;
    range = jumpRange;
  }
  return hits;
}

// src/shared/game/MatchSim.ts
var LOBBY_MS = 3e4;
var KICKOFF_MS = 2200;
var TEAM_SIZE = SOCCER.teamSize;
var MAP = PITCH_NYXT.map;
var W3 = MAP.width;
var H3 = MAP.height;
var OBS = MAP.obstacles;
var BR_PLAYERS = 6;
var BR_MATCH_MS = 18e4;
var ZONE_MIN = 240;
var BR_SHRINK_MS = 78e3;
var TELEPORT_INVULN_MS = 1200;
var SimCube = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alive = true;
  }
};
var SimCombatant = class {
  constructor(id, name, team, zarekId, def, isBot, x, y) {
    this.id = id;
    this.name = name;
    this.team = team;
    this.zarekId = zarekId;
    this.def = def;
    this.isBot = isBot;
    this.x = x;
    this.y = y;
    this.aimAngle = 0;
    this.aimDist = 0;
    this.alive = true;
    this.reloadTimer = 0;
    this.ultCharge = 0;
    this.slowTimer = 0;
    this.slowFactor = 1;
    /** Invincibilité restante (ms) — bref répit à la sortie d'un portail (Portal). */
    this.invulnMs = 0;
    this.kbX = 0;
    this.kbY = 0;
    this.sinceCombatMs = 0;
    this.poisonMs = 0;
    this.poisonDps = 0;
    this.respawnMs = 0;
    /** Cubes de power-up ramassés (Battle Royale ; 0 au foot). */
    this.cubes = 0;
    /** Éliminé définitivement (Battle Royale : pas de réapparition). */
    this.eliminated = false;
    this.health = def.maxHealth;
  }
  get maxHealth() {
    return Math.round(this.def.maxHealth * (1 + POWER_CUBE.bonusPerCube * this.cubes));
  }
  get damageMult() {
    return 1 + POWER_CUBE.bonusPerCube * this.cubes;
  }
  /** Ramasse un cube : +PV max / +dégâts, petit soin partiel (le reste via régén). */
  pickCube() {
    const beforeMax = this.maxHealth;
    this.cubes += 1;
    const gained = this.maxHealth - beforeMax;
    this.health = Math.min(this.maxHealth, this.health + gained * 0.35);
  }
  get speed() {
    return this.def.moveSpeed * (this.slowTimer > 0 ? this.slowFactor : 1);
  }
  get healthRatio() {
    return Math.max(0, Math.min(1, this.health / this.maxHealth));
  }
  get ultReady() {
    return this.ultCharge >= 100;
  }
  grantInvuln(ms) {
    this.invulnMs = Math.max(this.invulnMs, ms);
  }
  takeDamage(amount) {
    if (!this.alive || this.invulnMs > 0) return 0;
    if (amount > 0) this.sinceCombatMs = 0;
    const before = this.health;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.alive = false;
    return before - this.health;
  }
  addUltCharge(dmg) {
    this.ultCharge = Math.max(0, Math.min(100, this.ultCharge + dmg * this.def.ultChargePerDamage));
  }
  consumeUlt() {
    this.ultCharge = 0;
  }
  applySlow(ms, factor) {
    if (ms <= 0) return;
    this.slowTimer = Math.max(this.slowTimer, ms);
    this.slowFactor = factor;
  }
  applyPoison(ms, dps) {
    if (ms <= 0) return;
    this.poisonMs = Math.max(this.poisonMs, ms);
    this.poisonDps = Math.max(this.poisonDps, dps);
  }
  tickPoison(dtMs) {
    if (this.poisonMs <= 0) return;
    this.takeDamage(this.poisonDps * (dtMs / 1e3));
    this.poisonMs -= dtMs;
    if (this.poisonMs <= 0) this.poisonDps = 0;
  }
  applyKnockback(dx, dy, force) {
    this.kbX += dx * force;
    this.kbY += dy * force;
  }
  tickTimers(dtMs) {
    if (this.reloadTimer > 0) this.reloadTimer -= dtMs;
    if (this.slowTimer > 0) this.slowTimer -= dtMs;
    if (this.invulnMs > 0) this.invulnMs -= dtMs;
    this.sinceCombatMs += dtMs;
  }
  noteAttack() {
    this.sinceCombatMs = 0;
  }
  regenerate(dtMs) {
    if (!this.alive || this.sinceCombatMs < REGEN.delayMs || this.health >= this.maxHealth) return;
    this.health = Math.min(this.maxHealth, this.health + this.maxHealth * REGEN.percentPerSecond * (dtMs / 1e3));
  }
  placeAt(x, y, fullHeal = true) {
    this.x = x;
    this.y = y;
    if (fullHeal) this.health = this.maxHealth;
    this.slowTimer = 0;
    this.slowFactor = 1;
    this.poisonMs = 0;
    this.poisonDps = 0;
    this.kbX = 0;
    this.kbY = 0;
    this.reloadTimer = 0;
    this.sinceCombatMs = REGEN.delayMs;
  }
  revive(x, y) {
    this.alive = true;
    this.respawnMs = 0;
    this.ultCharge = 0;
    this.placeAt(x, y, true);
  }
};
var SimProjectile = class {
  constructor(ownerId, x, y, vx, vy, damage, radius, range, color) {
    this.ownerId = ownerId;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.radius = radius;
    this.color = color;
    this.alive = true;
    this.landsInto = null;
    this.distanceLeft = range;
  }
  update(dtSec) {
    const sx = this.vx * dtSec;
    const sy = this.vy * dtSec;
    this.x += sx;
    this.y += sy;
    this.distanceLeft -= Math.hypot(sx, sy);
    if (this.distanceLeft <= 0) this.alive = false;
  }
  kill() {
    this.alive = false;
  }
};
var SimHazard = class {
  constructor(x, y, radius, ownerId, durationMs, dps, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.ownerId = ownerId;
    this.dps = dps;
    this.color = color;
    this.alive = true;
    this.slowFactor = 1;
    this.slowMs = 0;
    this.poisonMs = 0;
    this.poisonDps = 0;
    this.chargesUlt = false;
    this.life = durationMs;
  }
  update(dtMs) {
    this.life -= dtMs;
    if (this.life <= 0) this.alive = false;
  }
  contains(px, py, r) {
    return dist(px, py, this.x, this.y) <= this.radius + r;
  }
};
var SimBall = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = BALL.radius;
    this.carrierId = null;
    this.graceMs = 0;
    this.kickerLockMs = 0;
    this.kickerId = null;
  }
  get free() {
    return this.carrierId === null;
  }
  attachTo(px, py, aim, carrierRadius) {
    const maxD = carrierRadius + this.radius + BALL.carryOffset;
    const dx = Math.cos(aim);
    const dy = Math.sin(aim);
    let placedX = px;
    let placedY = py;
    for (let t = 6; t <= maxD; t += 6) {
      const cx = px + dx * t;
      const cy = py + dy * t;
      if (OBS.some((o) => circleHitsRect(cx, cy, this.radius, o))) break;
      placedX = cx;
      placedY = cy;
    }
    this.x = placedX;
    this.y = placedY;
    this.vx = 0;
    this.vy = 0;
  }
  kick(fromId, angle, speed) {
    this.carrierId = null;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.graceMs = BALL.grabGraceMs;
    this.kickerLockMs = BALL.kickerLockMs;
    this.kickerId = fromId;
  }
  drop(dx, dy) {
    const n = normalize(dx, dy);
    this.carrierId = null;
    this.kickerId = null;
    this.vx = n.x * 160;
    this.vy = n.y * 160;
    this.graceMs = BALL.grabGraceMs;
    this.kickerLockMs = 0;
  }
  update(dtSec, dtMs) {
    if (this.graceMs > 0) this.graceMs = Math.max(0, this.graceMs - dtMs);
    if (this.kickerLockMs > 0) this.kickerLockMs = Math.max(0, this.kickerLockMs - dtMs);
    if (!this.free) return;
    const distTot = Math.hypot(this.vx, this.vy) * dtSec;
    const steps = Math.max(1, Math.ceil(distTot / (this.radius * 0.8)));
    const sdt = dtSec / steps;
    for (let k = 0; k < steps; k++) {
      this.x += this.vx * sdt;
      this.y += this.vy * sdt;
      for (const ob of OBS) {
        if (!circleHitsRect(this.x, this.y, this.radius, ob)) continue;
        const res = resolveCircleRect(this.x, this.y, this.radius, ob);
        if (!res) continue;
        const n = normalize(res.x - this.x, res.y - this.y);
        this.x = res.x;
        this.y = res.y;
        const dot = this.vx * n.x + this.vy * n.y;
        if (dot < 0) {
          this.vx -= (1 + BALL.restitution) * dot * n.x;
          this.vy -= (1 + BALL.restitution) * dot * n.y;
        }
      }
      this.x = clamp(this.x, this.radius, W3 - this.radius);
      this.y = clamp(this.y, this.radius, H3 - this.radius);
    }
    const decay = Math.exp(-BALL.friction * dtSec);
    this.vx *= decay;
    this.vy *= decay;
    if (Math.hypot(this.vx, this.vy) < BALL.stopSpeed) {
      this.vx = 0;
      this.vy = 0;
    }
  }
};
function spawnsFor(team) {
  return team === 0 ? PITCH_NYXT.spawnsTeam0 : PITCH_NYXT.spawnsTeam1;
}
var MatchSim = class {
  constructor(mode = "brawl-ball") {
    this.mode = mode;
    this.combatants = [];
    this.bots = /* @__PURE__ */ new Map();
    this.inputs = /* @__PURE__ */ new Map();
    this.ball = new SimBall(PITCH_NYXT.ballStart.x, PITCH_NYXT.ballStart.y);
    this.projectiles = [];
    this.hazards = [];
    this.botSeq = 0;
    // Battle Royale
    this.teamSeq = 0;
    // équipe unique par joueur en FFA
    this.cubesArr = [];
    this.zoneRadius = 0;
    this.zoneElapsed = 0;
    this.brDeaths = 0;
    // nombre d'éliminés dans la manche (→ points de classement)
    // Leaderboard cumulatif de la session (SURVIT aux revanches). Clé stable :
    // humains par sessionId, bots par nom (« Bot 1 »…).
    this.board = /* @__PURE__ */ new Map();
    this.phase = "lobby";
    this.timer = LOBBY_MS;
    this.matchClock = SOCCER.matchMs;
    this.sudden = false;
    this.winner = -1;
    this.score = [0, 0];
    this.fx = [];
    const arena = this.isPortal ? PORTAL_ARENA : PITCH_NYXT.map;
    this.W = arena.width;
    this.H = arena.height;
    this.OBS = arena.obstacles;
    this.zoneCenter = { x: this.W / 2, y: this.H / 2 };
    this.zoneInit = Math.hypot(this.W / 2, this.H / 2) + 60;
    this.zoneRadius = this.zoneInit;
    if (this.isPortal) {
      this.neuro = new NeurotoxinField(NEURO_CFG);
      this.portals = new PortalSystem(
        PORTAL_PAIRS,
        { main: PORTAL_REGIONS.main, refuge: PORTAL_REGIONS.refuge },
        PORTAL_CFG,
        (x, y, margin) => this.isFreeSpot(x, y, margin)
      );
    }
  }
  /** Les deux variantes de Battle Royale (classic + Portal). */
  get isBR() {
    return this.mode !== "brawl-ball";
  }
  get isPortal() {
    return this.mode === "battle-royale-portal";
  }
  /** Emplacement libre (grande salle, hors obstacle) pour relocaliser les portails. */
  isFreeSpot(x, y, margin) {
    if (x < margin || y < margin || x > this.W - margin || y > this.H - margin) return false;
    return !this.OBS.some((o) => circleHitsRect(x, y, margin, o));
  }
  brSpawn(i, n) {
    const a = i / Math.max(1, n) * Math.PI * 2 - Math.PI / 2;
    if (this.isPortal) {
      return { x: PORTAL_SPAWN_RING.cx + Math.cos(a) * PORTAL_SPAWN_RING.r, y: PORTAL_SPAWN_RING.cy + Math.sin(a) * PORTAL_SPAWN_RING.r };
    }
    return { x: this.zoneCenter.x + Math.cos(a) * this.W * 0.34, y: this.zoneCenter.y + Math.sin(a) * this.H * 0.32 };
  }
  // ---------- Leaderboard cumulatif ----------
  /** Nom stable pour un bot (« Bot 1 », « Bot 2 »…), par ordre d'apparition. */
  nextBotName() {
    return `Bot ${this.combatants.filter((c) => c.isBot).length + 1}`;
  }
  boardKey(c) {
    return c.isBot ? `bot:${c.name}` : `me:${c.id}`;
  }
  awardBoard(c, pts) {
    const k = this.boardKey(c);
    const e = this.board.get(k) ?? { name: c.name, score: 0, isBot: c.isBot };
    e.score += pts;
    e.name = c.name;
    e.isBot = c.isBot;
    this.board.set(k, e);
  }
  /** Points de fin de manche (BR : classement ; foot : victoire/nul/défaite). */
  awardEndOfMatch(winnerTeam) {
    if (this.isBR) {
      for (const c of this.combatants) if (c.alive) this.awardBoard(c, this.brDeaths);
    } else {
      for (const c of this.combatants) {
        const pts = winnerTeam < 0 ? 1 : c.team === winnerTeam ? 3 : 0;
        this.awardBoard(c, pts);
      }
    }
  }
  // ---------- Joueurs (join / leave / équipe) ----------
  humanCount() {
    return this.combatants.filter((c) => !c.isBot).length;
  }
  teamHumanCount(team) {
    return this.combatants.filter((c) => !c.isBot && c.team === team).length;
  }
  pickTeam(preferred) {
    const t = preferred === 1 ? 1 : 0;
    if (this.teamHumanCount(t) < TEAM_SIZE) return t;
    const other = t === 0 ? 1 : 0;
    return this.teamHumanCount(other) < TEAM_SIZE ? other : t;
  }
  addPlayer(id, name, zarekId, preferredTeam) {
    const zid = ZAREK_BY_ID[zarekId] ? zarekId : ZAREKS[0].id;
    const def = getZarek(zid);
    if (this.isBR) {
      if (this.phase === "lobby") {
        const sp = this.brSpawn(this.combatants.length, BR_PLAYERS);
        this.combatants.push(new SimCombatant(id, name, this.teamSeq++, zid, def, false, sp.x, sp.y));
        return;
      }
      const b = this.combatants.find((c) => c.isBot);
      if (!b) return;
      this.bots.delete(b.id);
      this.inputs.delete(b.id);
      b.id = id;
      b.name = name;
      b.zarekId = zid;
      b.def = def;
      b.isBot = false;
      b.cubes = 0;
      b.alive = true;
      b.eliminated = false;
      b.respawnMs = 0;
      b.ultCharge = 0;
      b.health = b.maxHealth;
      return;
    }
    const team = this.pickTeam(preferredTeam);
    if (this.phase === "lobby") {
      const sp = spawnsFor(team)[this.combatants.filter((c) => c.team === team).length % TEAM_SIZE];
      this.combatants.push(new SimCombatant(id, name, team, zid, def, false, sp.x, sp.y));
      return;
    }
    const bot = this.combatants.find((c) => c.isBot && c.team === team) ?? this.combatants.find((c) => c.isBot);
    if (!bot) return;
    this.bots.delete(bot.id);
    this.inputs.delete(bot.id);
    this.reassignId(bot, id);
    bot.name = name;
    bot.zarekId = zid;
    bot.def = def;
    bot.isBot = false;
    bot.health = bot.maxHealth;
    bot.alive = true;
    bot.respawnMs = 0;
    bot.ultCharge = 0;
  }
  removePlayer(id) {
    const c = this.combatants.find((k) => k.id === id);
    if (!c) return;
    this.inputs.delete(id);
    if (this.phase === "lobby" || this.phase === "ended") {
      this.combatants = this.combatants.filter((k) => k.id !== id);
      if (this.humanCount() === 0) this.resetToLobby();
      return;
    }
    const botId = `bot${this.botSeq++}`;
    if (this.isBR) {
      c.id = botId;
      c.name = this.nextBotName();
      c.isBot = true;
      this.bots.set(botId, new BattleBot());
    } else {
      if (this.ball.carrierId === c.id) this.ball.drop(PITCH_NYXT.centerX - c.x, PITCH_NYXT.centerY - c.y);
      this.reassignId(c, botId);
      c.name = this.nextBotName();
      c.isBot = true;
      this.bots.set(botId, new SoccerBot(spawnsFor(c.team)[0].role));
    }
    if (this.humanCount() === 0) this.resetToLobby();
  }
  /** Change l'id d'un combattant en gardant cohérentes les références de balle. */
  reassignId(c, newId) {
    if (this.ball.carrierId === c.id) this.ball.carrierId = newId;
    if (this.ball.kickerId === c.id) this.ball.kickerId = newId;
    c.id = newId;
  }
  chooseTeam(id, team) {
    if (this.isBR) return;
    if (this.phase !== "lobby") return;
    const c = this.combatants.find((k) => k.id === id && !k.isBot);
    if (!c || c.team === team) return;
    if (this.teamHumanCount(team) >= TEAM_SIZE) return;
    c.team = team;
    const sp = spawnsFor(team)[(this.teamHumanCount(team) - 1) % TEAM_SIZE];
    c.placeAt(sp.x, sp.y, true);
  }
  setInput(id, input) {
    if (this.combatants.some((c) => c.id === id && !c.isBot)) this.inputs.set(id, input);
  }
  /**
   * Reconnexion — suspend un joueur déconnecté : sa place est jouée par un bot,
   * mais on GARDE son id (= sessionId) pour qu'il la reprenne en revenant. En
   * dehors d'un match (lobby / fin), on garde la place telle quelle (pas de bot).
   */
  suspendPlayer(id) {
    const c = this.combatants.find((k) => k.id === id && !k.isBot);
    if (!c) return;
    this.inputs.delete(id);
    if (this.phase === "lobby" || this.phase === "ended") return;
    c.isBot = true;
    this.bots.set(id, this.isBR ? new BattleBot() : new SoccerBot(spawnsFor(c.team)[0].role));
  }
  /** Reconnexion — rend le contrôle humain d'une place suspendue. */
  resumePlayer(id, name, zarekId) {
    const c = this.combatants.find((k) => k.id === id);
    if (!c) return;
    this.bots.delete(id);
    c.isBot = false;
    if (name) c.name = name;
    if (ZAREK_BY_ID[zarekId]) {
      c.zarekId = zarekId;
      c.def = getZarek(zarekId);
    }
  }
  requestStart() {
    if (this.phase === "lobby" && this.humanCount() > 0) this.startMatch();
  }
  requestRematch() {
    if (this.phase === "ended") this.resetToLobby();
  }
  // ---------- Cycle de vie ----------
  resetToLobby() {
    this.combatants = this.combatants.filter((c) => !c.isBot);
    this.bots.clear();
    this.projectiles = [];
    this.hazards = [];
    this.ball.carrierId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.x = PITCH_NYXT.ballStart.x;
    this.ball.y = PITCH_NYXT.ballStart.y;
    this.cubesArr = [];
    this.zoneRadius = this.zoneInit;
    this.zoneElapsed = 0;
    for (const c of this.combatants) {
      c.cubes = 0;
      c.eliminated = false;
      c.alive = true;
      c.respawnMs = 0;
    }
    this.score = [0, 0];
    this.sudden = false;
    this.winner = -1;
    this.phase = "lobby";
    this.timer = LOBBY_MS;
  }
  startMatch() {
    if (this.isBR) {
      this.startMatchBR();
      return;
    }
    for (const team of [0, 1]) {
      let members = this.combatants.filter((c) => c.team === team).length;
      while (members < TEAM_SIZE) {
        const sp = spawnsFor(team)[members];
        const def = ZAREKS[Math.floor(Math.random() * ZAREKS.length)];
        const id = `bot${this.botSeq++}`;
        this.combatants.push(new SimCombatant(id, this.nextBotName(), team, def.id, def, true, sp.x, sp.y));
        this.bots.set(id, new SoccerBot(sp.role));
        members++;
      }
    }
    this.score = [0, 0];
    this.sudden = false;
    this.winner = -1;
    this.projectiles = [];
    this.hazards = [];
    this.resetPositions(true);
    this.phase = "countdown";
    this.timer = KICKOFF_MS;
  }
  /** Démarrage d'une Battle Royale : complète à 6 avec des bots, place en cercle,
   *  sème les cubes, arme la zone. */
  startMatchBR() {
    while (this.combatants.length < BR_PLAYERS) {
      const def = ZAREKS[Math.floor(Math.random() * ZAREKS.length)];
      const id = `bot${this.botSeq++}`;
      this.combatants.push(new SimCombatant(id, this.nextBotName(), this.teamSeq++, def.id, def, true, 0, 0));
      this.bots.set(id, new BattleBot());
    }
    const n = this.combatants.length;
    this.combatants.forEach((c, i) => {
      const sp = this.brSpawn(i, n);
      c.cubes = 0;
      c.placeAt(sp.x, sp.y, true);
      c.alive = true;
      c.eliminated = false;
      c.respawnMs = 0;
      c.ultCharge = 0;
    });
    this.spawnCubes();
    this.zoneRadius = this.zoneInit;
    this.zoneElapsed = 0;
    this.brDeaths = 0;
    if (this.neuro) this.neuro.elapsed = 0;
    this.winner = -1;
    this.projectiles = [];
    this.hazards = [];
    this.phase = "countdown";
    this.timer = KICKOFF_MS;
  }
  spawnCubes() {
    this.cubesArr = [];
    const region = this.isPortal ? PORTAL_REGIONS.main : { x: 0, y: 0, w: this.W, h: this.H };
    const m = 120;
    let placed = 0;
    let tries = 0;
    while (placed < POWER_CUBE.initialCount && tries < 300) {
      tries++;
      const x = region.x + m + Math.random() * (region.w - m * 2);
      const y = region.y + m + Math.random() * (region.h - m * 2);
      if (this.OBS.some((o) => circleHitsRect(x, y, POWER_CUBE.radius + 8, o))) continue;
      this.cubesArr.push(new SimCube(x, y));
      placed++;
    }
  }
  updateZone(dtMs, dtSec) {
    this.zoneElapsed += dtMs;
    const t = clamp((this.zoneElapsed - ZONE.startDelayMs) / BR_SHRINK_MS, 0, 1);
    this.zoneRadius = this.zoneInit + (ZONE_MIN - this.zoneInit) * t;
    const dps = ZONE.baseDamagePerSecond + t * 18;
    for (const c of this.combatants) {
      if (!c.alive) continue;
      if (dist(c.x, c.y, this.zoneCenter.x, this.zoneCenter.y) > this.zoneRadius) c.takeDamage(dps * dtSec);
    }
  }
  /** Neurotoxine (Portal) : dégâts par région (gaz déjà avancé avant le déplacement). */
  applyNeuroDamage(dtSec) {
    const neuro = this.neuro;
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const d = neuro.dpsAt(c.x, c.y);
      if (d > 0) c.takeDamage(d * dtSec);
    }
  }
  updateCubes() {
    for (const cube of this.cubesArr) {
      if (!cube.alive) continue;
      for (const c of this.combatants) {
        if (!c.alive) continue;
        if (dist(c.x, c.y, cube.x, cube.y) <= POWER_CUBE.pickupRadius + c.def.radius) {
          c.pickCube();
          cube.alive = false;
          break;
        }
      }
    }
  }
  battleWorld() {
    return {
      all: this.combatants,
      cubes: this.cubesArr,
      zone: { x: this.zoneCenter.x, y: this.zoneCenter.y, r: this.zoneRadius },
      obstacles: this.OBS,
      width: this.W,
      height: this.H,
      danger: this.isPortal ? this.buildDanger() : void 0
    };
  }
  /** Stratégie de fuite pour l'IA en Portal : neurotoxine → portail vert / refuge. */
  buildDanger() {
    const neuro = this.neuro;
    const portals = this.portals;
    return {
      inDanger: (x, y) => neuro.isDanger(x, y),
      retreat: (x, y) => {
        if (!neuro.active) return null;
        if (neuro.isRefuge(x)) return null;
        if (neuro.mainDps <= 0) return null;
        return portals.nearestGreenTo(x, y, "main");
      },
      wander: (x) => {
        const r = neuro.isRefuge(x) ? PORTAL_REGIONS.refuge : PORTAL_REGIONS.main;
        const m = 100;
        return { x: r.x + m + Math.random() * (r.w - m * 2), y: r.y + m + Math.random() * (r.h - m * 2) };
      }
    };
  }
  /** Fin de BR dès qu'il ne reste qu'un survivant (ou personne = nul). */
  checkSurvivors() {
    if (this.phase !== "playing") return;
    const alive = this.combatants.filter((c) => c.alive);
    if (alive.length <= 1) this.endMatch(alive.length === 1 ? alive[0].team : -1);
  }
  resetPositions(resetUlt) {
    for (const team of [0, 1]) {
      const members = this.combatants.filter((c) => c.team === team);
      const sp = spawnsFor(team);
      members.forEach((c, i) => {
        c.placeAt(sp[i % sp.length].x, sp[i % sp.length].y, true);
        c.alive = true;
        c.respawnMs = 0;
        if (resetUlt) c.ultCharge = 0;
      });
    }
    this.ball.carrierId = null;
    this.ball.kickerId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.x = PITCH_NYXT.ballStart.x;
    this.ball.y = PITCH_NYXT.ballStart.y;
  }
  resetForKickoff() {
    this.projectiles = [];
    this.hazards = [];
    this.resetPositions(false);
    this.phase = "countdown";
    this.timer = KICKOFF_MS;
  }
  endMatch(winnerTeam) {
    this.winner = winnerTeam;
    this.phase = "ended";
    this.timer = 0;
    this.awardEndOfMatch(winnerTeam);
  }
  // ---------- Boucle ----------
  step(dtMs) {
    const dtSec = dtMs / 1e3;
    this.fx = [];
    switch (this.phase) {
      case "lobby":
        if (this.humanCount() === 0) {
          this.timer = LOBBY_MS;
        } else {
          this.timer -= dtMs;
          if (this.timer <= 0) this.startMatch();
        }
        break;
      case "countdown":
        this.timer -= dtMs;
        if (this.timer <= 0) {
          this.phase = "playing";
          this.matchClock = this.isBR ? BR_MATCH_MS : SOCCER.matchMs;
        }
        break;
      case "goal":
        this.timer -= dtMs;
        if (this.timer <= 0) this.resetForKickoff();
        break;
      case "playing":
        if (this.isBR) {
          this.matchClock -= dtMs;
          if (this.isPortal) {
            this.neuro.update(dtMs);
            this.portals.update(dtMs);
            this.simulate(dtMs, dtSec);
            this.applyNeuroDamage(dtSec);
            this.reapDead();
          } else {
            this.simulate(dtMs, dtSec);
            this.updateZone(dtMs, dtSec);
            this.reapDead();
          }
          this.updateCubes();
          this.checkSurvivors();
          if (this.phase === "playing" && this.matchClock <= 0) {
            const alive = this.combatants.filter((c) => c.alive);
            this.endMatch(alive.length ? alive[0].team : -1);
          }
        } else {
          this.tickMatchClock(dtMs);
          if (this.phase === "playing") {
            this.tickRespawns(dtMs);
            this.simulate(dtMs, dtSec);
            this.updateBall(dtSec, dtMs);
          }
        }
        break;
      case "ended":
        break;
    }
  }
  tickMatchClock(dtMs) {
    if (this.sudden) return;
    this.matchClock -= dtMs;
    if (this.matchClock > 0) return;
    this.matchClock = 0;
    if (this.score[0] === this.score[1]) this.sudden = true;
    else this.endMatch(this.score[0] > this.score[1] ? 0 : 1);
  }
  tickRespawns(dtMs) {
    for (const c of this.combatants) {
      if (c.alive || c.respawnMs <= 0) continue;
      c.respawnMs -= dtMs;
      if (c.respawnMs <= 0) {
        const sp = spawnsFor(c.team);
        const idx = this.combatants.filter((k) => k.team === c.team).indexOf(c);
        c.revive(sp[Math.max(0, idx) % sp.length].x, sp[Math.max(0, idx) % sp.length].y);
      }
    }
  }
  botWorld() {
    return {
      all: this.combatants,
      ball: { x: this.ball.x, y: this.ball.y, carrierId: this.ball.carrierId, free: this.ball.free },
      leftGoal: { x: PITCH_NYXT.leftGoal.centerX, y: PITCH_NYXT.leftGoal.centerY },
      rightGoal: { x: PITCH_NYXT.rightGoal.centerX, y: PITCH_NYXT.rightGoal.centerY },
      obstacles: this.OBS,
      width: this.W,
      height: this.H,
      frozen: false
    };
  }
  simulate(dtMs, dtSec) {
    const world = this.isBR ? null : this.botWorld();
    const bworld = this.isBR ? this.battleWorld() : null;
    const inputs = /* @__PURE__ */ new Map();
    for (const c of this.combatants) {
      if (!c.alive) continue;
      if (c.isBot) {
        const bot = this.bots.get(c.id);
        inputs.set(c.id, this.isBR ? bot.update(c, bworld, dtMs) : bot.update(c, world, dtMs));
      } else {
        inputs.set(c.id, this.inputs.get(c.id) ?? emptyInput());
      }
    }
    const kbDecay = Math.exp(-9 * dtSec);
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id);
      if (inp.aimX !== 0 || inp.aimY !== 0) c.aimAngle = Math.atan2(inp.aimY, inp.aimX);
      c.aimDist = Math.hypot(inp.aimX, inp.aimY);
      const mv = normalize(inp.moveX, inp.moveY);
      let spd = c.speed;
      if (this.ball.carrierId === c.id) spd *= BALL.carrySlowFactor;
      let nx = c.x + mv.x * spd * dtSec + c.kbX * dtSec;
      let ny = c.y + mv.y * spd * dtSec + c.kbY * dtSec;
      c.kbX *= kbDecay;
      c.kbY *= kbDecay;
      nx = clamp(nx, c.def.radius, this.W - c.def.radius);
      ny = clamp(ny, c.def.radius, this.H - c.def.radius);
      for (const ob of this.OBS) {
        const res = resolveCircleRect(nx, ny, c.def.radius, ob);
        if (res) {
          nx = res.x;
          ny = res.y;
        }
      }
      c.x = clamp(nx, c.def.radius, this.W - c.def.radius);
      c.y = clamp(ny, c.def.radius, this.H - c.def.radius);
    }
    this.separate();
    if (this.isPortal) {
      for (const c of this.combatants) {
        if (!c.alive) continue;
        if (this.portals.tryTeleport(c)) {
          c.x = clamp(c.x, c.def.radius, this.W - c.def.radius);
          c.y = clamp(c.y, c.def.radius, this.H - c.def.radius);
          c.grantInvuln(TELEPORT_INVULN_MS);
        }
      }
    }
    for (const c of this.combatants) {
      if (!c.alive) continue;
      const inp = inputs.get(c.id);
      if (this.ball.carrierId === c.id) {
        if (inp.attackReleased) this.kickBall(c);
        if (inp.ultimate && c.ultReady) this.fireUlt(c);
      } else {
        const wants = c.def.attack.kind === "potion" ? inp.attackReleased : inp.attack;
        if (wants && c.reloadTimer <= 0) this.fireAttack(c);
        if (inp.ultimate && c.ultReady) this.fireUlt(c);
      }
    }
    for (const c of this.combatants) if (c.alive) c.tickTimers(dtMs);
    this.updateProjectiles(dtSec);
    this.updateHazards(dtSec, dtMs);
    for (const c of this.combatants) if (c.alive) c.tickPoison(dtMs);
    for (const c of this.combatants) if (c.alive) c.regenerate(dtMs);
    this.reapDead();
  }
  /**
   * Traite les morts en attente (score BR, réapparition foot). Appelé en fin de
   * `simulate`, mais AUSSI après la neurotoxine : un joueur tué par le gaz doit
   * passer par `handleDeath` (points + `brDeaths`) AVANT `checkSurvivors`,
   * sinon la manche peut se terminer en oubliant de le classer.
   */
  reapDead() {
    for (const c of this.combatants) {
      if (c.alive) continue;
      if (this.isBR) {
        if (!c.eliminated) this.handleDeath(c);
      } else if (c.respawnMs <= 0) {
        this.handleDeath(c);
      }
    }
  }
  separate() {
    for (let i = 0; i < this.combatants.length; i++) {
      const a = this.combatants[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < this.combatants.length; j++) {
        const b = this.combatants[j];
        if (!b.alive) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const minD = a.def.radius + b.def.radius;
        if (d > 0 && d < minD) {
          const push = (minD - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          a.x = clamp(a.x - nx * push, a.def.radius, this.W - a.def.radius);
          a.y = clamp(a.y - ny * push, a.def.radius, this.H - a.def.radius);
          b.x = clamp(b.x + nx * push, b.def.radius, this.W - b.def.radius);
          b.y = clamp(b.y + ny * push, b.def.radius, this.H - b.def.radius);
        }
      }
    }
  }
  // ---------- Balle ----------
  kickBall(c) {
    this.ball.kick(c.id, c.aimAngle, BALL.kickSpeed);
    c.noteAttack();
    this.fx.push({ k: "kick", x: this.ball.x, y: this.ball.y });
  }
  updateBall(dtSec, dtMs) {
    if (!this.ball.free) {
      const carrier = this.combatants.find((c) => c.id === this.ball.carrierId);
      if (carrier && carrier.alive) this.ball.attachTo(carrier.x, carrier.y, carrier.aimAngle, carrier.def.radius);
      else this.ball.carrierId = null;
    }
    this.ball.update(dtSec, dtMs);
    if (this.ball.free && this.ball.graceMs <= 0) {
      let best = null;
      let bestD = Infinity;
      for (const c of this.combatants) {
        if (!c.alive) continue;
        if (c.id === this.ball.kickerId && this.ball.kickerLockMs > 0) continue;
        const d = dist(c.x, c.y, this.ball.x, this.ball.y);
        if (d <= c.def.radius + this.ball.radius + BALL.grabPad && d < bestD) {
          best = c;
          bestD = d;
        }
      }
      if (best) {
        this.ball.carrierId = best.id;
        this.ball.kickerId = null;
      }
    }
    if (pointInRect(this.ball.x, this.ball.y, PITCH_NYXT.leftGoal.zone)) this.onGoal(1);
    else if (pointInRect(this.ball.x, this.ball.y, PITCH_NYXT.rightGoal.zone)) this.onGoal(0);
  }
  onGoal(team) {
    this.score[team] += 1;
    this.ball.carrierId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.fx.push({ k: "goal", x: this.ball.x, y: this.ball.y, t: team });
    if (this.score[team] >= SOCCER.goalsToWin || this.sudden) {
      this.endMatch(team);
      return;
    }
    this.phase = "goal";
    this.timer = SOCCER.goalCelebrateMs;
  }
  // ---------- Combat ----------
  teamOf(id) {
    return this.combatants.find((c) => c.id === id)?.team ?? -1;
  }
  fireAttack(c) {
    const a = c.def.attack;
    if (a.kind === "chain") {
      this.fireChain(c);
      c.reloadTimer = a.reloadMs;
      c.noteAttack();
      return;
    }
    if (a.kind === "potion") {
      const dx = Math.cos(c.aimAngle);
      const dy = Math.sin(c.aimAngle);
      const range = a.range;
      const throwDist = c.aimDist > 40 ? clamp(c.aimDist, 90, range) : range;
      const muzzle = c.def.radius + 6;
      const p = new SimProjectile(c.id, c.x + dx * muzzle, c.y + dy * muzzle, dx * a.speed, dy * a.speed, 0, a.projRadius, throwDist, c.def.color);
      p.landsInto = { radius: a.aoeRadius ?? 80, durationMs: a.aoeDurationMs ?? 2500, dps: (a.aoeDps ?? 120) * c.damageMult };
      this.projectiles.push(p);
    } else {
      const spread = a.spreadDeg * Math.PI / 180;
      const dmg = a.damage * c.damageMult;
      const muzzle = c.def.radius + 6;
      for (let i = 0; i < a.count; i++) {
        const t = a.count === 1 ? 0 : i / (a.count - 1) - 0.5;
        const ang = c.aimAngle + t * spread;
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        this.projectiles.push(new SimProjectile(c.id, c.x + dx * muzzle, c.y + dy * muzzle, dx * a.speed, dy * a.speed, dmg, a.projRadius, a.range, c.def.color));
      }
    }
    c.reloadTimer = a.reloadMs;
    c.noteAttack();
  }
  /** Éclair en chaîne (serveur) : dégâts + segments d'éclair diffusés en fx. */
  fireChain(c) {
    const a = c.def.attack;
    const enemies = this.combatants.filter((o) => o.alive && o.team !== c.team);
    const idx = resolveChain(
      c.x,
      c.y,
      enemies.map((e) => ({ x: e.x, y: e.y, radius: e.def.radius })),
      a.range,
      a.chainJumpRange ?? 220,
      a.chainMaxJumps ?? 2
    );
    let dmg = a.damage * c.damageMult;
    let px = c.x;
    let py = c.y;
    for (const i of idx) {
      const e = enemies[i];
      const dealt = e.takeDamage(dmg);
      c.addUltCharge(dealt);
      this.fx.push({ k: "bolt", x: px, y: py, x2: e.x, y2: e.y, c: c.def.color });
      this.fx.push({ k: "hit", x: e.x, y: e.y, c: c.def.color });
      px = e.x;
      py = e.y;
      dmg *= a.chainFalloff ?? 0.7;
    }
  }
  /** Surcharge (serveur) : méga-chaîne, gros dégâts + étourdit (ralentit). */
  fireUltChain(c) {
    const u = c.def.ultimate;
    const enemies = this.combatants.filter((o) => o.alive && o.team !== c.team);
    const idx = resolveChain(
      c.x,
      c.y,
      enemies.map((e) => ({ x: e.x, y: e.y, radius: e.def.radius })),
      u.radius,
      u.chainJumpRange ?? 300,
      u.chainMaxJumps ?? 5
    );
    let dmg = u.damage * c.damageMult;
    this.fx.push({ k: "ult", x: c.x, y: c.y, r: 90, c: c.def.color });
    let px = c.x;
    let py = c.y;
    for (const i of idx) {
      const e = enemies[i];
      e.takeDamage(dmg);
      const dir = normalize(e.x - c.x, e.y - c.y);
      const kx = dir.x === 0 && dir.y === 0 ? 1 : dir.x;
      const ky = dir.x === 0 && dir.y === 0 ? 0 : dir.y;
      e.applyKnockback(kx, ky, u.knockback);
      e.applySlow(u.slowMs, u.slowFactor);
      this.fx.push({ k: "bolt", x: px, y: py, x2: e.x, y2: e.y, c: c.def.color });
      this.fx.push({ k: "hit", x: e.x, y: e.y, c: c.def.color });
      px = e.x;
      py = e.y;
      dmg *= u.chainFalloff ?? 1;
    }
  }
  updateProjectiles(dtSec) {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.update(dtSec);
      const isPotion = p.landsInto !== null;
      const ownerTeam = this.teamOf(p.ownerId);
      let landed = !p.alive;
      if (p.x < 0 || p.y < 0 || p.x > this.W || p.y > this.H) {
        p.kill();
        landed = true;
      } else {
        for (const ob of this.OBS) {
          if (circleHitsRect(p.x, p.y, p.radius, ob)) {
            p.kill();
            landed = true;
            break;
          }
        }
      }
      if (isPotion) {
        if (!landed) {
          for (const c of this.combatants) {
            if (!c.alive || c.team === ownerTeam) continue;
            if (dist(p.x, p.y, c.x, c.y) <= p.radius + c.def.radius) {
              p.kill();
              landed = true;
              break;
            }
          }
        }
        if (landed) this.spawnPuddle(p);
        continue;
      }
      if (!p.alive) continue;
      for (const c of this.combatants) {
        if (!c.alive || c.team === ownerTeam) continue;
        if (dist(p.x, p.y, c.x, c.y) <= p.radius + c.def.radius) {
          const dealt = c.takeDamage(p.damage);
          const owner = this.combatants.find((o) => o.id === p.ownerId);
          if (owner && owner.alive) owner.addUltCharge(dealt);
          this.fx.push({ k: "hit", x: p.x, y: p.y, c: c.def.color });
          p.kill();
          break;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }
  spawnPuddle(p) {
    const info = p.landsInto;
    if (!info) return;
    const h = new SimHazard(p.x, p.y, info.radius, p.ownerId, info.durationMs, info.dps, COLORS.poison);
    h.chargesUlt = true;
    this.hazards.push(h);
  }
  updateHazards(dtSec, dtMs) {
    for (const h of this.hazards) {
      h.update(dtMs);
      if (!h.alive) continue;
      const ownerTeam = this.teamOf(h.ownerId);
      for (const c of this.combatants) {
        if (!c.alive || c.team === ownerTeam) continue;
        if (!h.contains(c.x, c.y, c.def.radius)) continue;
        if (h.dps > 0) {
          const dealt = c.takeDamage(h.dps * dtSec);
          if (h.chargesUlt) {
            const owner = this.combatants.find((o) => o.id === h.ownerId);
            if (owner && owner.alive) owner.addUltCharge(dealt);
          }
        }
        if (h.slowFactor < 1) c.applySlow(h.slowMs, h.slowFactor);
        if (h.poisonMs > 0) c.applyPoison(h.poisonMs, h.poisonDps);
      }
    }
    this.hazards = this.hazards.filter((h) => h.alive);
  }
  fireUlt(c) {
    const u = c.def.ultimate;
    if (u.kind === "aura") {
      this.fx.push({ k: "ult", x: c.x, y: c.y, r: u.radius, c: COLORS.poison });
      const h = new SimHazard(c.x, c.y, u.radius, c.id, u.auraDurationMs ?? 4e3, 0, COLORS.poison);
      h.slowFactor = u.slowFactor;
      h.slowMs = u.slowMs;
      h.poisonMs = u.poisonMs ?? 2500;
      h.poisonDps = (u.poisonDps ?? 100) * c.damageMult;
      this.hazards.push(h);
    } else if (u.kind === "chain") {
      this.fireUltChain(c);
    } else {
      const dmg = u.damage * c.damageMult;
      this.fx.push({ k: "ult", x: c.x, y: c.y, r: u.radius, c: c.def.color });
      for (const other of this.combatants) {
        if (other === c || !other.alive || other.team === c.team) continue;
        if (dist(c.x, c.y, other.x, other.y) <= u.radius + other.def.radius) {
          other.takeDamage(dmg);
          const dir = normalize(other.x - c.x, other.y - c.y);
          const kx = dir.x === 0 && dir.y === 0 ? 1 : dir.x;
          const ky = dir.x === 0 && dir.y === 0 ? 0 : dir.y;
          other.applyKnockback(kx, ky, u.knockback);
          other.applySlow(u.slowMs, u.slowFactor);
        }
      }
    }
    c.consumeUlt();
  }
  handleDeath(c) {
    this.fx.push({ k: "death", x: c.x, y: c.y, c: c.def.color });
    if (this.isBR) {
      this.awardBoard(c, this.brDeaths);
      this.brDeaths++;
      c.eliminated = true;
      return;
    }
    if (this.ball.carrierId === c.id) this.ball.drop(PITCH_NYXT.centerX - c.x, PITCH_NYXT.centerY - c.y);
    c.respawnMs = SOCCER.respawnMs;
  }
  // ---------- Snapshot ----------
  snapshot() {
    const players = this.combatants.map((c) => ({
      i: c.id,
      n: c.name,
      t: c.team,
      z: c.zarekId,
      x: Math.round(c.x),
      y: Math.round(c.y),
      a: Math.round(c.aimAngle * 100) / 100,
      h: Math.round(c.health),
      hm: c.maxHealth,
      al: c.alive,
      uc: Math.round(c.ultCharge),
      carry: this.ball.carrierId === c.id,
      bot: c.isBot,
      rs: Math.max(0, Math.round(c.respawnMs)),
      cb: c.cubes
    }));
    const snap = {
      phase: this.phase,
      timer: Math.max(0, Math.round(this.phase === "playing" ? this.matchClock : this.timer)),
      score: [this.score[0], this.score[1]],
      sudden: this.sudden,
      winner: this.winner,
      players,
      ball: { x: Math.round(this.ball.x), y: Math.round(this.ball.y), carrier: this.ball.carrierId },
      proj: this.projectiles.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y), r: p.radius, c: p.color })),
      haz: this.hazards.map((h) => ({ x: Math.round(h.x), y: Math.round(h.y), r: h.radius, c: h.color })),
      fx: this.fx,
      mode: this.mode
    };
    if (this.isBR) {
      snap.cubes = this.cubesArr.filter((q) => q.alive).map((q) => ({ x: Math.round(q.x), y: Math.round(q.y), r: POWER_CUBE.radius, c: COLORS.powerCube }));
      snap.alive = this.combatants.filter((c) => c.alive).length;
      if (this.isPortal) {
        snap.portals = this.portals.endpoints.map((e) => ({ x: Math.round(e.x), y: Math.round(e.y), c: e.colorHex }));
        snap.gas = { m: Math.round(this.neuro.mainDps), r: Math.round(this.neuro.refugeDps) };
      } else {
        snap.zone = { x: this.zoneCenter.x, y: this.zoneCenter.y, r: Math.round(this.zoneRadius) };
      }
    }
    if (this.board.size) {
      snap.board = [...this.board.values()].sort((a, b) => b.score - a.score).map((e) => ({ n: e.name, s: e.score, b: e.isBot }));
    }
    return snap;
  }
};

// src/shared/version.ts
var PROTOCOL_VERSION = 1;

// server/GameRoom.ts
var TICK_MS = 1e3 / 30;
var MAX_ROOMS = 50;
var activeRooms = 0;
var MAX_MSGS_PER_SEC = 240;
var ERR_VERSION_MISMATCH = 4001;
var ERR_SERVER_FULL = 4002;
var RECONNECT_SECONDS = 20;
var RoomInfo = class extends Schema {
  constructor() {
    super(...arguments);
    this.mode = "brawl-ball";
  }
};
defineTypes(RoomInfo, { mode: "string" });
var GameRoom = class extends Room {
  constructor() {
    super(...arguments);
    this.maxClients = 6;
    /** Fenêtre glissante (1 s) du nombre de messages reçus par client. */
    this.msgWindow = /* @__PURE__ */ new Map();
    /** Pseudo + Zarek par session (pour restaurer la place à la reconnexion). */
    this.players = /* @__PURE__ */ new Map();
  }
  /** Vrai si le client n'a pas dépassé le plafond de messages sur la seconde en cours. */
  rateOk(client) {
    const now = Date.now();
    const w = this.msgWindow.get(client.sessionId);
    if (!w || now - w.start >= 1e3) {
      this.msgWindow.set(client.sessionId, { start: now, count: 1 });
      return true;
    }
    w.count += 1;
    return w.count <= MAX_MSGS_PER_SEC;
  }
  /**
   * Handshake de version : refuse un client dont la version de protocole diffère.
   * Tolérance transitoire — un client SANS version (d'avant le handshake, ex. la
   * prod pas encore redéployée) est accepté le temps que ça se propage. À durcir
   * (refuser aussi l'absence de `v`) une fois la prod à jour.
   */
  onAuth(_client, options) {
    const v = options?.v;
    if (typeof v === "number" && v !== PROTOCOL_VERSION) {
      throw new ServerError(ERR_VERSION_MISMATCH, "VERSION_MISMATCH");
    }
    return true;
  }
  async onCreate(options) {
    if (activeRooms >= MAX_ROOMS) throw new ServerError(ERR_SERVER_FULL, "SERVER_FULL");
    activeRooms++;
    const mode = options?.mode === "battle-royale" ? "battle-royale" : options?.mode === "battle-royale-portal" ? "battle-royale-portal" : "brawl-ball";
    this.sim = new MatchSim(mode);
    const info = new RoomInfo();
    info.mode = mode;
    this.setState(info);
    this.setMetadata({ mode });
    if (options?.private) await this.setPrivate(true);
    this.onMessage("input", (client, message) => {
      if (this.rateOk(client)) this.sim.setInput(client.sessionId, sanitize(message));
    });
    this.onMessage("team", (client, message) => {
      if (this.rateOk(client)) this.sim.chooseTeam(client.sessionId, message === 1 ? 1 : 0);
    });
    this.onMessage("start", (client) => {
      if (this.rateOk(client)) this.sim.requestStart();
    });
    this.onMessage("rematch", (client) => {
      if (this.rateOk(client)) this.sim.requestRematch();
    });
    this.setSimulationInterval((dt) => this.tick(dt), TICK_MS);
  }
  onDispose() {
    activeRooms = Math.max(0, activeRooms - 1);
  }
  onJoin(client, options) {
    const name = (options?.name ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 16) || "Joueur";
    const zarek = typeof options?.zarek === "string" ? options.zarek : "zephyr";
    const team = options?.team === 1 ? 1 : 0;
    this.players.set(client.sessionId, { name, zarek });
    this.sim.addPlayer(client.sessionId, name, zarek, team);
    console.log(`[${this.roomId}] join ${name} (${this.clients.length}/${this.maxClients})`);
  }
  /**
   * Départ d'un client. Deux cas :
   *  - `consented` (bouton Quitter) → on finalise tout de suite (place → bot).
   *  - déconnexion SUBIE (réseau mobile qui décroche) → on garde la place ~20 s,
   *    jouée par un bot, le temps que le joueur revienne (`allowReconnection`).
   */
  async onLeave(client, consented) {
    this.msgWindow.delete(client.sessionId);
    if (consented) {
      this.finalizeLeave(client.sessionId);
      return;
    }
    this.sim.suspendPlayer(client.sessionId);
    console.log(`[${this.roomId}] d\xE9connexion ${client.sessionId} (attente reconnexion\u2026)`);
    try {
      await this.allowReconnection(client, RECONNECT_SECONDS);
      const info = this.players.get(client.sessionId);
      this.sim.resumePlayer(client.sessionId, info?.name ?? "Joueur", info?.zarek ?? "zephyr");
      console.log(`[${this.roomId}] reconnexion ${client.sessionId}`);
    } catch {
      this.finalizeLeave(client.sessionId);
    }
  }
  /** Départ définitif : la place devient un bot (ou disparaît hors match). */
  finalizeLeave(id) {
    this.players.delete(id);
    this.sim.removePlayer(id);
    console.log(`[${this.roomId}] leave ${id}`);
  }
  tick(dtMs) {
    try {
      this.sim.step(dtMs);
      this.broadcast("snap", this.sim.snapshot());
    } catch (err) {
      console.error("Erreur de tick :", err);
    }
  }
};
function sanitize(msg) {
  const inp = emptyInput();
  if (!msg) return inp;
  const num = (v, min, max) => {
    const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
    return n < min ? min : n > max ? max : n;
  };
  inp.moveX = num(msg.moveX, -1, 1);
  inp.moveY = num(msg.moveY, -1, 1);
  inp.aimX = num(msg.aimX, -1e5, 1e5);
  inp.aimY = num(msg.aimY, -1e5, 1e5);
  inp.attack = !!msg.attack;
  inp.attackReleased = !!msg.attackReleased;
  inp.ultimate = !!msg.ultimate;
  return inp;
}

// server/index.ts
var port = Number(process.env.PORT) || 2567;
function isAllowedOrigin(origin) {
  if (!origin) return process.env.NYXT_ALLOW_NO_ORIGIN === "1";
  let host;
  try {
    host = new URL(origin).hostname;
  } catch {
    return false;
  }
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host === "sleeplow.ca" || host.endsWith(".sleeplow.ca")) return true;
  if (/^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  const extra = (process.env.NYXT_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return extra.includes(host);
}
var gameServer = new Server({
  // Arrêt gracieux (défaut Colyseus) : sur SIGTERM/SIGINT (ex. redémarrage
  // systemd), les salons sont fermés proprement avant de quitter.
  gracefullyShutdown: true,
  transport: new WebSocketTransport({
    // Les messages de jeu sont minuscules (intentions) : 16 Ko borne largement
    // les envois abusifs sans risque de couper une communication légitime.
    maxPayload: 16 * 1024,
    // Filtrage d'origine sur la poignée de main WebSocket.
    verifyClient: (info, next) => next(isAllowedOrigin(info.origin))
  })
});
gameServer.onShutdown(() => console.log("Arr\xEAt gracieux du serveur Nyxt\u2026"));
gameServer.define("nyxt", GameRoom).filterBy(["mode"]);
var healthPort = Number(process.env.HEALTH_PORT) || 2568;
import_http2.default.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, uptime: Math.round(process.uptime()), rss: process.memoryUsage().rss }));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(healthPort, "127.0.0.1", () => console.log(`\u{1FA7A} Sonde de sant\xE9 sur http://127.0.0.1:${healthPort}/health`));
gameServer.listen(port).then(() => console.log(`\u26BD Serveur Nyxt en \xE9coute sur ws://localhost:${port}`)).catch((err) => {
  console.error("\xC9chec du d\xE9marrage du serveur :", err);
  process.exit(1);
});
/*! Bundled license information:

eventemitter2/lib/eventemitter2.js:
  (*!
   * EventEmitter2
   * https://github.com/hij1nx/EventEmitter2
   *
   * Copyright (c) 2013 hij1nx
   * Licensed under the MIT license.
   *)
*/
