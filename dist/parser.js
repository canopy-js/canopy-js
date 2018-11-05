/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/parser/parser.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/node-libs-browser/mock/empty.js":
/*!******************************************************!*\
  !*** ./node_modules/node-libs-browser/mock/empty.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./node_modules/path-browserify/index.js":
/*!***********************************************!*\
  !*** ./node_modules/path-browserify/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;

  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];

    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  } // if the path is allowed to go above the root, restore leading ..s


  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
} // Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.


var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

var splitPath = function (filename) {
  return splitPathRe.exec(filename).slice(1);
}; // path.resolve([from ...], to)
// posix version


exports.resolve = function () {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd(); // Skip empty and invalid entries

    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  } // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)
  // Normalize the path


  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
    return !!p;
  }), !resolvedAbsolute).join('/');
  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
}; // path.normalize(path)
// posix version


exports.normalize = function (path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/'; // Normalize the path

  path = normalizeArray(filter(path.split('/'), function (p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }

  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
}; // posix version


exports.isAbsolute = function (path) {
  return path.charAt(0) === '/';
}; // posix version


exports.join = function () {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function (p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }

    return p;
  }).join('/'));
}; // path.relative(from, to)
// posix version


exports.relative = function (from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;

    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;

    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;

  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];

  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};

exports.basename = function (path, ext) {
  var f = splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?

  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }

  return f;
};

exports.extname = function (path) {
  return splitPath(path)[3];
};

function filter(xs, f) {
  if (xs.filter) return xs.filter(f);
  var res = [];

  for (var i = 0; i < xs.length; i++) {
    if (f(xs[i], i, xs)) res.push(xs[i]);
  }

  return res;
} // String.prototype.substr - negative index don't work in IE8


var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
  return str.substr(start, len);
} : function (str, start, len) {
  if (start < 0) start = str.length + start;
  return str.substr(start, len);
};
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};

/***/ }),

/***/ "./node_modules/recursive-readdir-sync/index.js":
/*!******************************************************!*\
  !*** ./node_modules/recursive-readdir-sync/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(/*! fs */ "./node_modules/node-libs-browser/mock/empty.js"),
    p = __webpack_require__(/*! path */ "./node_modules/path-browserify/index.js");

function recursiveReaddirSync(path) {
  var list = [],
      files = fs.readdirSync(path),
      stats;
  files.forEach(function (file) {
    stats = fs.lstatSync(p.join(path, file));

    if (stats.isDirectory()) {
      list = list.concat(recursiveReaddirSync(p.join(path, file)));
    } else {
      list.push(p.join(path, file));
    }
  });
  return list;
}

module.exports = recursiveReaddirSync;

/***/ }),

/***/ "./src/parser/components/build_namespace_object.js":
/*!*********************************************************!*\
  !*** ./src/parser/components/build_namespace_object.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/paragraphs_of_file */ "./src/parser/helpers/paragraphs_of_file.js");
/* harmony import */ var _helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/extract_key_and_paragraph */ "./src/parser/helpers/extract_key_and_paragraph.js");



function buildNamespaceObject(pathList) {
  var namespacesObject = {};
  pathList.forEach(function (path) {
    var paragraphsWithKeys = Object(_helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__["default"])(path);
    var currentTopic = Object(_helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__["default"])(paragraphsWithKeys[0]).key;
    namespacesObject[currentTopic] = {};
    paragraphsWithKeys.forEach(function (paragraphWithKey) {
      var key = paragraphWithKey.split(':')[0];
      namespacesObject[currentTopic][key] = true;
    });
  });
  return namespacesObject;
}

/* harmony default export */ __webpack_exports__["default"] = (buildNamespaceObject);

/***/ }),

/***/ "./src/parser/components/json_for_dgs_directory.js":
/*!*********************************************************!*\
  !*** ./src/parser/components/json_for_dgs_directory.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "./node_modules/node-libs-browser/mock/empty.js");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_list_dgs_files_recursive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/list_dgs_files_recursive.js */ "./src/parser/helpers/list_dgs_files_recursive.js");
/* harmony import */ var _build_namespace_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./build_namespace_object.js */ "./src/parser/components/build_namespace_object.js");
/* harmony import */ var _json_for_dgs_file_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./json_for_dgs_file.js */ "./src/parser/components/json_for_dgs_file.js");
/* harmony import */ var helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! helpers/extract_key_and_paragraph */ "./src/parser/helpers/extract_key_and_paragraph.js");






function jsonForDgsDirectory(sourceDirectory, destinationDirectory) {
  var dgsFilePaths = Object(_helpers_list_dgs_files_recursive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(sourceDirectory);
  var namespaceObject = Object(_build_namespace_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dgsFilePaths);
  dgsFilePaths.forEach(function (path) {
    var json = Object(_json_for_dgs_file_js__WEBPACK_IMPORTED_MODULE_3__["default"])(path, namespaceObject);
    var dgsFileNameWithoutExtension = path.match(/\/(\w+)\.\w+$/)[1];

    if (!fs__WEBPACK_IMPORTED_MODULE_0___default.a.existsSync(destinationDirectory)) {
      fs__WEBPACK_IMPORTED_MODULE_0___default.a.mkdirSync(destinationDirectory);
    }

    if (dgsFileNameWithoutExtension.includes(' ')) {
      throw 'Data filenames may not contain spaces: ' + path;
    }

    var destinationPath = destinationDirectory + '/' + dgsFileNameWithoutExtension + '.json';
    console.log();
    console.log("WRITING TO " + destinationPath + ": " + json);
    fs__WEBPACK_IMPORTED_MODULE_0___default.a.writeFileSync(destinationPath, json);
  });
}

/* harmony default export */ __webpack_exports__["default"] = (jsonForDgsDirectory);

/***/ }),

/***/ "./src/parser/components/json_for_dgs_file.js":
/*!****************************************************!*\
  !*** ./src/parser/components/json_for_dgs_file.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(process) {/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "./node_modules/node-libs-browser/mock/empty.js");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _parse_block__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parse_block */ "./src/parser/components/parse_block.js");
/* harmony import */ var _helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../helpers/paragraphs_of_file */ "./src/parser/helpers/paragraphs_of_file.js");
/* harmony import */ var _helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../helpers/extract_key_and_paragraph */ "./src/parser/helpers/extract_key_and_paragraph.js");





function jsonForDgsFile(path, namespaceObject) {
  var paragraphsWithKeys = Object(_helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_2__["default"])(path);
  var tokenizedParagraphsByKey = {};
  var topicOfFile = Object(_helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__["default"])(paragraphsWithKeys[0]).key;

  if (!topicOfFile) {
    return '';
  }

  paragraphsWithKeys.forEach(function (paragraphWithKey) {
    var paragraphData = Object(_helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__["default"])(paragraphWithKey);

    if (!paragraphData.key) {
      return;
    }

    var currentSubtopic = paragraphData.key;
    var textWithoutKey = paragraphData.block;
    var tokensOfParagraph = Object(_parse_block__WEBPACK_IMPORTED_MODULE_1__["default"])(textWithoutKey, namespaceObject, currentSubtopic, topicOfFile);
    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
  });
  return JSON.stringify(tokenizedParagraphsByKey, null, process.env.CANOPY_DEBUG ? 1 : 0);
}

/* harmony default export */ __webpack_exports__["default"] = (jsonForDgsFile);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./src/parser/components/parse_block.js":
/*!**********************************************!*\
  !*** ./src/parser/components/parse_block.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/clauses_with_punctuation_of */ "./src/parser/helpers/clauses_with_punctuation_of.js");
/* harmony import */ var _parse_clause__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parse_clause */ "./src/parser/components/parse_clause.js");



function parseBlock(textWithoutKey, namespaceObject, currentSubtopic, currentTopic) {
  var lines = textWithoutKey.split(/\n/);
  var tokensOfBlock = [];
  lines.forEach(function (line) {
    var clausesOfParagraph = Object(_helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_0__["default"])(line);
    var avaliableNamespaces = [currentTopic];
    var tokensOfParagraphByClause = clausesOfParagraph.map(function (clause) {
      return Object(_parse_clause__WEBPACK_IMPORTED_MODULE_1__["default"])(clause, namespaceObject, currentTopic, currentSubtopic, avaliableNamespaces);
    });
    var tokensOfLine = [].concat.apply([], tokensOfParagraphByClause);
    tokensOfBlock.push(tokensOfLine);
  });
  return tokensOfBlock;
}

/* harmony default export */ __webpack_exports__["default"] = (parseBlock);

/***/ }),

/***/ "./src/parser/components/parse_clause.js":
/*!***********************************************!*\
  !*** ./src/parser/components/parse_clause.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_units_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/units_of */ "./src/parser/helpers/units_of.js");
/* harmony import */ var _helpers_capitalize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/capitalize */ "./src/parser/helpers/capitalize.js");



function parseClause(clauseWithPunctuation, namespaceObject, currentTopic, currentSubtopic, avaliableNamespaces) {
  var tokens = [];
  var units = Object(_helpers_units_of__WEBPACK_IMPORTED_MODULE_0__["default"])(clauseWithPunctuation);
  var globalNamespace = namespaceObject;
  var textTokenBuffer = ''; // Find greatest suffix-prefix match

  while (units.length > 0) {
    for (var i = units.length - 1; i >= 0; i--) {
      if (units[0] === ' ') {
        break;
      }

      if (units[i] === ' ') {
        continue;
      }

      var substring = units.slice(0, i + 1).join('');
      var substringCapitalized = Object(_helpers_capitalize__WEBPACK_IMPORTED_MODULE_1__["default"])(substring);
      var continueFlag = false;

      for (var j = 0; j < avaliableNamespaces.length; j++) {
        var namespaceName = avaliableNamespaces[j];
        var currentNamespace = namespaceObject[namespaceName];

        if (currentNamespace.hasOwnProperty(substringCapitalized)) {
          if (substringCapitalized === currentSubtopic) {
            break;
          }

          if (textTokenBuffer) {
            var token = new TextToken(textTokenBuffer);
            tokens.push(token);
            textTokenBuffer = '';
          }

          var tokenType = currentTopic === namespaceName ? LocalReferenceToken : GlobalReferenceToken;
          var token = new tokenType(namespaceName, substringCapitalized, currentTopic, currentSubtopic, substring, clauseWithPunctuation);
          tokens.push(token);
          units = units.slice(i + 1, units.length);
          continueFlag = true;
        }
      }

      if (continueFlag) {
        continue;
      }

      if (globalNamespace.hasOwnProperty(substringCapitalized)) {
        if (textTokenBuffer) {
          var token = new TextToken(textTokenBuffer);
          tokens.push(token);
          textTokenBuffer = '';
        }

        if (substringCapitalized === currentTopic) {
          break; //Reject self-match
        }

        var token = new GlobalReferenceToken(substringCapitalized, substringCapitalized, currentTopic, currentSubtopic, substring, clauseWithPunctuation);
        tokens.push(token);
        avaliableNamespaces.push(substringCapitalized);
        units = units.slice(i + 1, units.length);
        continue;
      }
    }

    var firstUnit = units.slice(0, 1);
    textTokenBuffer += firstUnit;
    units = units.slice(1);
  }

  if (textTokenBuffer) {
    var token = new TextToken(textTokenBuffer);
    tokens.push(token);
  }

  return tokens;
}

function TextToken(text) {
  this.text = text;
  this.type = 'text';
}

function LocalReferenceToken(targetTopic, targetSubtopic, enclosingTopic, enclosingSubtopic, text) {
  this.type = 'local';
  this.text = text;
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function GlobalReferenceToken(targetTopic, targetSubtopic, enclosingTopic, enclosingSubtopic, text) {
  this.type = 'global';
  this.targetTopic = targetTopic;
  this.targetSubtopic = targetSubtopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.text = text;
}

/* harmony default export */ __webpack_exports__["default"] = (parseClause);

/***/ }),

/***/ "./src/parser/helpers/capitalize.js":
/*!******************************************!*\
  !*** ./src/parser/helpers/capitalize.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function capitalize(text) {
  return text[0].toUpperCase() + text.slice(1);
}

/* harmony default export */ __webpack_exports__["default"] = (capitalize);

/***/ }),

/***/ "./src/parser/helpers/clauses_with_punctuation_of.js":
/*!***********************************************************!*\
  !*** ./src/parser/helpers/clauses_with_punctuation_of.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function clausesWithPunctuationOf(string) {
  if (!string) {
    return [];
  }

  var clausesWithPunctuation = [];
  var buffer = '';

  while (string.length) {
    var indexOfNextStop = -1;

    for (var i = 0; i < string.length; i++) {
      var stops = ['.', '!', '?', ',', ';', ':'];

      if (stops.indexOf(string[i]) > -1) {
        indexOfNextStop = i;
        break;
      }
    }

    if (indexOfNextStop === -1) {
      clausesWithPunctuation.push(buffer + string);
      break;
    }

    var charactersThatFollowClauseBreaks = [undefined, ' ', ')', '"', "'"];
    var validClauseBreak = charactersThatFollowClauseBreaks.indexOf(string[indexOfNextStop + 1]) !== -1;

    if (validClauseBreak) {
      var clauseString = buffer + string.slice(0, indexOfNextStop + 1);
      var closingPunctuation = closingPunctuationOf(string.slice(indexOfNextStop + 1));
      clauseString += closingPunctuation;
      clausesWithPunctuation.push(clauseString);
      buffer = '';
      string = string.slice(indexOfNextStop + 1 + closingPunctuation.length);
    } else {
      buffer += string.slice(0, indexOfNextStop + 1);
      string = string.slice(indexOfNextStop + 1);
    }
  }

  return clausesWithPunctuation;
}

function closingPunctuationOf(string) {
  return (string.match(/^['")\]}]+/) || {})[0] || '';
}

/* harmony default export */ __webpack_exports__["default"] = (clausesWithPunctuationOf);

/***/ }),

/***/ "./src/parser/helpers/extract_key_and_paragraph.js":
/*!*********************************************************!*\
  !*** ./src/parser/helpers/extract_key_and_paragraph.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function extractKeyAndParagraph(paragraphWithKey) {
  var match = paragraphWithKey.match(/^([^:.,;]+):\s+/);

  if (!match) {
    return {
      key: null,
      block: paragraphWithKey
    };
  }

  var key = match[1];
  var paragraphWithoutKey = paragraphWithKey.slice(match[0].length);
  return {
    key: key,
    block: paragraphWithoutKey
  };
}

/* harmony default export */ __webpack_exports__["default"] = (extractKeyAndParagraph);

/***/ }),

/***/ "./src/parser/helpers/list_dgs_files_recursive.js":
/*!********************************************************!*\
  !*** ./src/parser/helpers/list_dgs_files_recursive.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var recursiveReadSync = __webpack_require__(/*! recursive-readdir-sync */ "./node_modules/recursive-readdir-sync/index.js");

var fs = __webpack_require__(/*! fs */ "./node_modules/node-libs-browser/mock/empty.js");

function listDgsfilesRecursive(rootDirectory) {
  var filePaths = recursiveReadSync(rootDirectory);
  filePaths = filePaths.filter(function (path) {
    return path.endsWith('.dgs');
  });
  return filePaths;
}

/* harmony default export */ __webpack_exports__["default"] = (listDgsfilesRecursive);

/***/ }),

/***/ "./src/parser/helpers/paragraphs_of_file.js":
/*!**************************************************!*\
  !*** ./src/parser/helpers/paragraphs_of_file.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "./node_modules/node-libs-browser/mock/empty.js");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);


function paragraphsOfFile(path) {
  var fileContents = fs__WEBPACK_IMPORTED_MODULE_0___default.a.readFileSync(path, 'utf8');
  return fileContents.trim().split(/\n\n+/);
}

/* harmony default export */ __webpack_exports__["default"] = (paragraphsOfFile);

/***/ }),

/***/ "./src/parser/helpers/units_of.js":
/*!****************************************!*\
  !*** ./src/parser/helpers/units_of.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function unitsOf(string) {
  var units = [];
  var stops = ['.', '!', '?', ',', ';', ':'];
  var seperatingPunctuation = ['"', "'", '[', ']', '(', ')', '{', '}', '<', '>', '_', '`'];
  var start = 0;

  for (var i = 0; i < string.length; i++) {
    if (string[i] === ' ') {
      if (start !== i) {
        units.push(string.slice(start, i));
      }

      units.push(string.slice(i, i + 1));
      start = i + 1;
    } else if (seperatingPunctuation.indexOf(string[i]) !== -1) {
      if (string[i - 1] === ' ' || string[i + 1] === ' ' || string[i + 1] === undefined || seperatingPunctuation.indexOf(string[i + 1]) !== -1 || seperatingPunctuation.indexOf(string[i - 1]) !== -1) {
        if (start !== i) {
          units.push(string.slice(start, i));
        }

        units.push(string[i]);
        start = i + 1;
      }
    } else if (stops.indexOf(string[i]) !== -1) {
      if (string[i + 1] === ' ' || string[i + 1] === undefined) {
        if (start !== i) {
          units.push(string.slice(start, i));
        }

        units.push(string.slice(i, i + 1));
        start = i + 1;
      }
    } else if (string[i + 1] === undefined) {
      units.push(string.slice(start, i + 1));
    }
  }

  return units;
}

/* harmony default export */ __webpack_exports__["default"] = (unitsOf);

/***/ }),

/***/ "./src/parser/parser.js":
/*!******************************!*\
  !*** ./src/parser/parser.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(process) {/* harmony import */ var _components_json_for_dgs_directory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/json_for_dgs_directory */ "./src/parser/components/json_for_dgs_directory.js");


if (process.argv.length < 3) {
  console.log('Project directory argument required');
  console.log('Example Usage:');
  console.log('node dist/compiler.js /Users/Me/project');
  throw 'Missing commandline argument';
}

var projectDir = process.argv[2].replace(/\/$/, '');
Object(_components_json_for_dgs_directory__WEBPACK_IMPORTED_MODULE_0__["default"])(projectDir + '/topics', projectDir + '/build/data');
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ })

/******/ });