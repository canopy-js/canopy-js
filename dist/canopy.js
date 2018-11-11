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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/client/canopy.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/css-loader/index.js!./src/client/style/canopy.css":
/*!***************************************************************!*\
  !*** ./node_modules/css-loader!./src/client/style/canopy.css ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "// Copyright Greenhouse Software 2017\n\n#_canopy {\n  padding-top: 25px;\n}\n\n#_canopy > h1 {\n  text-align: center;\n  margin-top: 10px;\n}\n\n#_canopy > section:first-child {\n  padding-top: 5px;\n}\n\n#_canopy > section {\n  padding-top: 5px;\n}\n\n#_canopy p {\n  padding-bottom: 24px;\n  font-size: 23px;\n  width: 700px;\n  margin: auto;\n\n  line-height: 1.3;\n  letter-spacing: -.003em;\n  font-weight: 400;\n}\n\n#_canopy a {\n  text-decoration: underline #E0E0E0;\n  color: black;\n  cursor: pointer;\n}\n\n#_canopy a:hover {\n  text-decoration: underline;\n}\n\n#_canopy .canopy-global-link:hover {\n  color: #4078c0;\n}\n\n#_canopy .canopy-global-link.canopy-painted-global-link {\n  text-decoration: underline #E0E0E0;\n  color: black;\n}\n\n#_canopy .canopy-global-link.canopy-painted-global-link:hover {\n  text-decoration: underline black;\n  color: black;\n}\n\n#_canopy .canopy-selected-link.canopy-global-link.canopy-painted-global-link {\n  text-decoration: underline #E0E0E0;\n  color: black;\n}\n\n/*#_canopy .canopy-url-link {\n  overflow-wrap: break-word;\n  word-wrap: break-word;\n}\n\n#_canopy .canopy-url-link:hover {\n  color: #4078c0;\n}*/\n\n#_canopy .canopy-selected-link.canopy-global-link {\n  text-decoration: underline #4078c0;\n  color: #4078c0;\n}\n/*\n#_canopy .canopy-selected-link.canopy-url-link {\n  color: #4078c0;\n}*/\n\n#_canopy .canopy-open-link {\n  text-decoration: underline;\n}\n\n#_canopy .canopy-selected-link {\n  text-shadow: .8px 0px 0px black;\n}\n\na:focus {\n  outline:0;\n}\n", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/*!*************************************************!*\
  !*** ./node_modules/css-loader/lib/css-base.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media " + item[2] + "{" + content + "}";
      } else {
        return content;
      }
    }).join("");
  }; // import a list of modules into the list


  list.i = function (modules, mediaQuery) {
    if (typeof modules === "string") modules = [[null, modules, ""]];
    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      var id = this[i][0];
      if (typeof id === "number") alreadyImportedModules[id] = true;
    }

    for (i = 0; i < modules.length; i++) {
      var item = modules[i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      //  when a module is imported multiple times with different media queries.
      //  I hope this will never occur (Hey this way we have smaller bundles)

      if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || '';
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
  return '/*# ' + data + ' */';
}

/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!****************************************************!*\
  !*** ./node_modules/style-loader/lib/addStyles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target, parent) {
  if (parent){
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target, parent) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target, parent);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "./node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertAt.before, target);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	if(options.attrs.nonce === undefined) {
		var nonce = getNonce();
		if (nonce) {
			options.attrs.nonce = nonce;
		}
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function getNonce() {
	if (false) {}

	return __webpack_require__.nc;
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = typeof options.transform === 'function'
		 ? options.transform(obj.css) 
		 : options.transform.default(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "./node_modules/style-loader/lib/urls.js":
/*!***********************************************!*\
  !*** ./node_modules/style-loader/lib/urls.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */
module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  } // blank or null?


  if (!css || typeof css !== "string") {
    return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/"); // convert each url(...)

  /*
  This regular expression is just a way to recursively match brackets within
  a string.
  	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
     (  = Start a capturing group
       (?:  = Start a non-capturing group
           [^)(]  = Match anything that isn't a parentheses
           |  = OR
           \(  = Match a start parentheses
               (?:  = Start another non-capturing groups
                   [^)(]+  = Match anything that isn't a parentheses
                   |  = OR
                   \(  = Match a start parentheses
                       [^)(]*  = Match anything that isn't a parentheses
                   \)  = Match a end parentheses
               )  = End Group
               *\) = Match anything and then a close parens
           )  = Close non-capturing group
           *  = Match anything
        )  = Close capturing group
   \)  = Match a close parens
  	 /gi  = Get all matches, not the first.  Be case insensitive.
   */

  var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (fullMatch, origUrl) {
    // strip quotes (if they exist)
    var unquotedOrigUrl = origUrl.trim().replace(/^"(.*)"$/, function (o, $1) {
      return $1;
    }).replace(/^'(.*)'$/, function (o, $1) {
      return $1;
    }); // already a full url? no change

    if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
      return fullMatch;
    } // convert the url to a full url


    var newUrl;

    if (unquotedOrigUrl.indexOf("//") === 0) {
      //TODO: should we add protocol?
      newUrl = unquotedOrigUrl;
    } else if (unquotedOrigUrl.indexOf("/") === 0) {
      // path should be relative to the base url
      newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
    } else {
      // path should be relative to current directory
      newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
    } // send back the fixed url(...)


    return "url(" + JSON.stringify(newUrl) + ")";
  }); // send back the fixed css

  return fixedCss;
};

/***/ }),

/***/ "./src/client/canopy.js":
/*!******************************!*\
  !*** ./src/client/canopy.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var render_render_topic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! render/render_topic */ "./src/client/render/render_topic.js");
/* harmony import */ var helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/url_parsers */ "./src/client/helpers/url_parsers.js");
/* harmony import */ var helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/set_path_and_fragment */ "./src/client/helpers/set_path_and_fragment.js");
/* harmony import */ var style_canopy_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! style/canopy.css */ "./src/client/style/canopy.css");
/* harmony import */ var style_canopy_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(style_canopy_css__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var keys_register_key_listener__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! keys/register_key_listener */ "./src/client/keys/register_key_listener.js");
/* harmony import */ var keys_register_alt_key_listener__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! keys/register_alt_key_listener */ "./src/client/keys/register_alt_key_listener.js");








if (!Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["topicNameFromUrl"])()) {
  Object(helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_3__["default"])(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["defaultTopic"], null);
} else {
  Object(render_render_topic__WEBPACK_IMPORTED_MODULE_1__["default"])(Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["topicNameFromUrl"])(), Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["subtopicNameFromUrl"])() || Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["topicNameFromUrl"])(), history.state);
}

Object(keys_register_key_listener__WEBPACK_IMPORTED_MODULE_5__["default"])();
Object(keys_register_alt_key_listener__WEBPACK_IMPORTED_MODULE_6__["default"])();
window.addEventListener('popstate', function (e) {
  var oldState = Object.assign(history.state || {}, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));
  history.replaceState(Object.assign(history.state || {}, oldState), document.title, window.location.href);
  var selectedLinkData = e.state && e.state.targetTopic ? e.state : null;
  Object(render_render_topic__WEBPACK_IMPORTED_MODULE_1__["default"])(Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["topicNameFromUrl"])(), Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["subtopicNameFromUrl"])() || Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["topicNameFromUrl"])(), selectedLinkData);
});

/***/ }),

/***/ "./src/client/display/display_path.js":
/*!********************************************!*\
  !*** ./src/client/display/display_path.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");
/* harmony import */ var helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/set_path_and_fragment */ "./src/client/helpers/set_path_and_fragment.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var display_reset_page__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/reset_page */ "./src/client/display/reset_page.js");
/* harmony import */ var helpers_relationships__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! helpers/relationships */ "./src/client/helpers/relationships.js");






var displayPath = function displayPath(topicName, subtopicName, linkToSelect, selectFirstLink) {
  var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["sectionElementOfTopic"])(topicName, subtopicName || topicName);

  if (!sectionElement) {
    return Object(helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_1__["default"])(topicName, topicName);
  } // Does this ever happen?


  Object(display_reset_page__WEBPACK_IMPORTED_MODULE_3__["moveSelectedSectionClass"])(sectionElement);
  Object(display_reset_page__WEBPACK_IMPORTED_MODULE_3__["hideAllSectionElements"])();
  Object(display_reset_page__WEBPACK_IMPORTED_MODULE_3__["deselectAllLinks"])();

  if (!linkToSelect && selectFirstLink) {
    linkToSelect = Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_4__["firstLinkOfSection"])(sectionElement);
  } else if (!linkToSelect) {
    linkToSelect = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["parentLinkOfSection"])(sectionElement) || null;
  }

  if (linkToSelect) {
    linkToSelect.classList.add('canopy-selected-link');
  }

  if (linkToSelect && linkToSelect.classList.contains('canopy-parent-link')) {
    linkToSelect.classList.add('canopy-open-link');
  }

  document.title = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["documentTitleFor"])(topicName, subtopicName);
  Object(helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_1__["default"])(topicName, subtopicName);
  displayPathTo(sectionElement);
  window.scrollTo(0, helpers_getters__WEBPACK_IMPORTED_MODULE_2__["canopyContainer"].scrollHeight);
};

var displayPathTo = function displayPathTo(sectionElement) {
  sectionElement.style.display = 'block';

  if (sectionElement.parentNode === helpers_getters__WEBPACK_IMPORTED_MODULE_2__["canopyContainer"]) {
    sectionElement.classList.add('canopy-current-root-section');
    return;
  }

  var parentLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["parentLinkOfSection"])(sectionElement);
  parentLink.classList.add('canopy-open-link');
  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathTo(parentSectionElement);
};

/* harmony default export */ __webpack_exports__["default"] = (displayPath);

/***/ }),

/***/ "./src/client/display/reset_page.js":
/*!******************************************!*\
  !*** ./src/client/display/reset_page.js ***!
  \******************************************/
/*! exports provided: moveSelectedSectionClass, hideAllSectionElements, deselectAllLinks */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveSelectedSectionClass", function() { return moveSelectedSectionClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hideAllSectionElements", function() { return hideAllSectionElements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deselectAllLinks", function() { return deselectAllLinks; });
function forEach(list, callback) {
  for (var i = 0; i < list.length; i++) {
    callback(list[i]);
  }
}

function moveSelectedSectionClass(sectionElement) {
  forEach(document.getElementsByTagName("section"), function (sectionElement) {
    sectionElement.classList.remove('canopy-selected-section');
  });
  sectionElement.classList.add('canopy-selected-section');
}

function hideAllSectionElements() {
  forEach(document.getElementsByTagName("section"), function (sectionElement) {
    sectionElement.style.display = 'none';
    sectionElement.classList.remove('canopy-current-root-section');
  });
}

function deselectAllLinks() {
  forEach(document.getElementsByTagName("a"), function (linkElement) {
    linkElement.classList.remove('canopy-selected-link');
    linkElement.classList.remove('canopy-open-link');
  });
}

function hideSectionElement(sectionElement) {
  sectionElement.style.display = 'none';
}

function showSectionElement(sectionElement) {
  sectionElement.style.display = 'block';
}

function showSectionElementOfLink(linkElement) {
  showSectionElement(sectionElementOfLink(linkElement));
}

function underlineLink(linkElement) {
  linkElement.classList.add('canopy-open-link');
}



/***/ }),

/***/ "./src/client/helpers/getters.js":
/*!***************************************!*\
  !*** ./src/client/helpers/getters.js ***!
  \***************************************/
/*! exports provided: canopyContainer, defaultTopic, sectionElementOfTopic, currentSection, currentRootSection, selectedLink, parentLinkOfSection, childSectionElementOfParentLink, sectionElementOfLink, linkNumberOf, linkOfNumber, metadataFromLink, uniqueSubtopic, documentTitleFor, findLinkFromMetadata */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "canopyContainer", function() { return canopyContainer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultTopic", function() { return defaultTopic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionElementOfTopic", function() { return sectionElementOfTopic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "currentSection", function() { return currentSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "currentRootSection", function() { return currentRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectedLink", function() { return selectedLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parentLinkOfSection", function() { return parentLinkOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "childSectionElementOfParentLink", function() { return childSectionElementOfParentLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionElementOfLink", function() { return sectionElementOfLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkNumberOf", function() { return linkNumberOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkOfNumber", function() { return linkOfNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "metadataFromLink", function() { return metadataFromLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uniqueSubtopic", function() { return uniqueSubtopic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentTitleFor", function() { return documentTitleFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLinkFromMetadata", function() { return findLinkFromMetadata; });
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");

var canopyContainer = document.getElementById('_canopy');

if (!canopyContainer) {
  throw new Error('Page must have an html element with id "_canopy"');
}

var defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;

if (!defaultTopic) {
  throw new Error('HTML element with id "_canopy" must have a default topic data attribute');
}

var sectionElementOfTopic = function sectionElementOfTopic(topicName, subtopicName) {
  return document.querySelector('#_canopy #_canopy_' + Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(topicName) + '_' + Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(subtopicName));
};

var currentSection = function currentSection() {
  return document.querySelector('.canopy-selected-section');
};

var selectedLink = function selectedLink() {
  return document.querySelector('.canopy-selected-link');
};

var currentRootSection = function currentRootSection() {
  return document.querySelector('.canopy-current-root-section');
};

var parentLinkOfSection = function parentLinkOfSection(sectionElement) {
  return document.querySelector('#_canopy a.' + sectionElement.id);
};

var childSectionElementOfParentLink = function childSectionElementOfParentLink(linkElement) {
  return document.querySelector('#' + linkElement.dataset.childSectionId);
};

function sectionElementOfLink(linkElement) {
  if (linkElement === null) {
    return null;
  }

  return linkElement.parentNode.parentNode;
}

function uniqueSubtopic(topicName, subtopicName) {
  return subtopicName && subtopicName !== topicName;
}

function documentTitleFor(topicName, subtopicName) {
  return topicName + (subtopicName && subtopicName !== topicName ? ": ".concat(subtopicName) : '');
}

function metadataFromLink(linkElement) {
  if (!linkElement) {
    return {};
  }

  var relativeLinkNumber = Array.from(document.querySelectorAll('#' + sectionElementOfLink(linkElement).id + " a[data-target-topic=\"".concat(linkElement.dataset.targetTopic, "\"]") + "[data-target-subtopic=\"".concat(linkElement.dataset.targetSubtopic, "\"]"))).indexOf(linkElement);
  return {
    sectionElementid: sectionElementOfLink(linkElement).id,
    targetTopic: linkElement.dataset.targetTopic,
    targetSubtopic: linkElement.dataset.targetSubtopic,
    relativeLinkNumber: relativeLinkNumber
  };
}

function findLinkFromMetadata(linkSelectionData) {
  return document.querySelectorAll('#' + linkSelectionData.sectionElementid + " a[data-target-topic=\"".concat(linkSelectionData.targetTopic, "\"]") + "[data-target-subtopic=\"".concat(linkSelectionData.targetSubtopic, "\"]"))[linkSelectionData.relativeLinkNumber];
}



/***/ }),

/***/ "./src/client/helpers/identifiers.js":
/*!*******************************************!*\
  !*** ./src/client/helpers/identifiers.js ***!
  \*******************************************/
/*! exports provided: slugFor, htmlIdFor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "slugFor", function() { return slugFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "htmlIdFor", function() { return htmlIdFor; });
var slugFor = function slugFor(string) {
  if (!string) {
    return string;
  }

  return string.replace(/ /g, '_');
};

var htmlIdFor = function htmlIdFor(topicName, subtopicName) {
  return '_canopy_' + slugFor(topicName + '_' + subtopicName);
};



/***/ }),

/***/ "./src/client/helpers/relationships.js":
/*!*********************************************!*\
  !*** ./src/client/helpers/relationships.js ***!
  \*********************************************/
/*! exports provided: firstSiblingOf, lastSiblingOf, leftwardLink, rightwardLink, linkAfter, linkBefore, upwardLink, downwardLink, parentLinkOf, firstLinkOfSection, firstChildLinkOfParentLink */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstSiblingOf", function() { return firstSiblingOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastSiblingOf", function() { return lastSiblingOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "leftwardLink", function() { return leftwardLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rightwardLink", function() { return rightwardLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkAfter", function() { return linkAfter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkBefore", function() { return linkBefore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "upwardLink", function() { return upwardLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "downwardLink", function() { return downwardLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parentLinkOf", function() { return parentLinkOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstLinkOfSection", function() { return firstLinkOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstChildLinkOfParentLink", function() { return firstChildLinkOfParentLink; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");



function firstSiblingOf(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  return links[0] || linkElement;
}

function lastSiblingOf(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  return links[links.length - 1] || null;
}

function parentLinkOf(linkElement) {
  if (linkElement === null) {
    return null;
  }

  if (isInRootSection(linkElement)) {
    return null;
  }

  return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(linkElement));
}

function isInRootSection(linkElement) {
  return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(linkElement) === Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentRootSection"])();
}

function linkAfter(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');

  if (linkElement !== links[links.length - 1]) {
    return links[Array.prototype.slice.call(links).indexOf(linkElement) + 1];
  } else {
    return null;
  }
}

function linkBefore(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');

  if (linkElement !== links[0]) {
    return links[Array.prototype.slice.call(links).indexOf(linkElement) - 1];
  } else {
    return null;
  }
}

function firstChildLinkOfParentLink(linkElement) {
  if (linkElement === null) {
    return null;
  }

  if (!linkElement.classList.contains('canopy-parent-link')) {
    return null;
  }

  var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["childSectionElementOfParentLink"])(linkElement);
  return sectionElement.querySelectorAll('a')[0];
}

function firstLinkOfSection(sectionElement) {
  if (sectionElement === null) {
    return null;
  }

  return sectionElement.querySelectorAll('a')[0] || null;
}



/***/ }),

/***/ "./src/client/helpers/set_path_and_fragment.js":
/*!*****************************************************!*\
  !*** ./src/client/helpers/set_path_and_fragment.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");
/* harmony import */ var helpers_url_parsers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/url_parsers */ "./src/client/helpers/url_parsers.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");




var setPathAndFragment = function setPathAndFragment(topicName, subtopicName) {
  var replaceState = function replaceState(a, b, c) {
    history.replaceState(a, b, c);
  };

  var pushState = function pushState(a, b, c) {
    history.pushState(a, b, c);
  };

  var historyApiFunction = Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_1__["topicNameFromUrl"])() === topicName ? replaceState : pushState;
  historyApiFunction(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["metadataFromLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["selectedLink"])()), Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["documentTitleFor"])(topicName, subtopicName), pathFor(topicName, subtopicName));

  function pathFor(topicName, subtopicName) {
    return '/' + Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(topicName) + (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["uniqueSubtopic"])(topicName, subtopicName) ? "#".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(subtopicName)) : '');
  } // var popStateEvent = new PopStateEvent(
  //   'popstate',
  //   {
  //     state: nextLinkNumberAndLinkTypeAsObject(
  //       selectedLinkInParentSection,
  //       selectedLinkNumber
  //     )
  //   }
  // );
  // dispatchEvent(popStateEvent);

}; // function nextLinkNumberAndLinkTypeAsObject(selectedLinkInParentSection, selectedLinkNumber) {
//   return {
//     selectedLinkNumber,
//     selectedLinkInParentSection
//   };
// }


/* harmony default export */ __webpack_exports__["default"] = (setPathAndFragment);

/***/ }),

/***/ "./src/client/helpers/url_parsers.js":
/*!*******************************************!*\
  !*** ./src/client/helpers/url_parsers.js ***!
  \*******************************************/
/*! exports provided: topicNameFromUrl, subtopicNameFromUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "topicNameFromUrl", function() { return topicNameFromUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtopicNameFromUrl", function() { return subtopicNameFromUrl; });
var topicNameFromUrl = function topicNameFromUrl() {
  return window.location.pathname.replace('/', '').replace(/_/g, ' ');
};

var subtopicNameFromUrl = function subtopicNameFromUrl() {
  return window.location.hash.replace('#', '').replace(/_/g, ' ');
};



/***/ }),

/***/ "./src/client/keys/handlers.js":
/*!*************************************!*\
  !*** ./src/client/keys/handlers.js ***!
  \*************************************/
/*! exports provided: moveUpward, moveDownward, moveLeftward, moveRightward, moveDownOrRedirect, paintGlobalLinks, unpaintGlobalLinks */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveUpward", function() { return moveUpward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveDownward", function() { return moveDownward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveLeftward", function() { return moveLeftward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveRightward", function() { return moveRightward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveDownOrRedirect", function() { return moveDownOrRedirect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "paintGlobalLinks", function() { return paintGlobalLinks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unpaintGlobalLinks", function() { return unpaintGlobalLinks; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var helpers_relationships__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/relationships */ "./src/client/helpers/relationships.js");
/* harmony import */ var render_render_topic__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! render/render_topic */ "./src/client/render/render_topic.js");
/* harmony import */ var helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/set_path_and_fragment */ "./src/client/helpers/set_path_and_fragment.js");
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");






function moveUpward() {
  // TODO: If root, unselect link
  var linkElement = Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["parentLinkOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["firstLinkOfSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentRootSection"])());
  Object(display_display_path__WEBPACK_IMPORTED_MODULE_4__["default"])(linkElement.dataset.enclosingTopic, linkElement.dataset.urlSubtopic, linkElement);
}

function moveDownward(cycle) {
  // TODO handle redundant parent links
  var linkElement = Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["firstChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || (cycle ? Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["linkAfter"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : null) || (cycle ? Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["firstSiblingOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : null) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
  Object(display_display_path__WEBPACK_IMPORTED_MODULE_4__["default"])(linkElement.dataset.enclosingTopic, linkElement.dataset.urlSubtopic, linkElement);
}

function moveLeftward() {
  var linkElement = Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["linkBefore"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["lastSiblingOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  Object(display_display_path__WEBPACK_IMPORTED_MODULE_4__["default"])(linkElement.dataset.enclosingTopic, linkElement.dataset.urlSubtopic, linkElement);
}

function moveRightward() {
  var linkElement = Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["linkAfter"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_relationships__WEBPACK_IMPORTED_MODULE_1__["firstSiblingOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  Object(display_display_path__WEBPACK_IMPORTED_MODULE_4__["default"])(linkElement.dataset.enclosingTopic, linkElement.dataset.urlSubtopic, linkElement);
}

function moveDownOrRedirect() {
  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.contains('canopy-parent-link')) {
    moveDownward(false);
  } else if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.contains('canopy-global-link')) {
    Object(render_render_topic__WEBPACK_IMPORTED_MODULE_2__["default"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic, null, true);
  } else if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.contains('canopy-redundant-parent-link')) {
    Object(render_render_topic__WEBPACK_IMPORTED_MODULE_2__["default"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic);
  }
}

function paintGlobalLinks() {
  Array.from(document.getElementsByClassName('canopy-global-link')).forEach(function (el) {
    el.classList.add('canopy-painted-global-link');
  });
}

function unpaintGlobalLinks() {
  Array.from(document.getElementsByClassName('canopy-global-link')).forEach(function (el) {
    el.classList.remove('canopy-painted-global-link');
  });
}



/***/ }),

/***/ "./src/client/keys/register_alt_key_listener.js":
/*!******************************************************!*\
  !*** ./src/client/keys/register_alt_key_listener.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var keys_handlers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! keys/handlers */ "./src/client/keys/handlers.js");


function registerAltKeyListeners() {
  window.addEventListener('keydown', function (e) {
    if (e.altKey) {
      Object(keys_handlers__WEBPACK_IMPORTED_MODULE_0__["paintGlobalLinks"])();
    }
  });
  window.addEventListener('keyup', function (e) {
    if (e.key === 'Alt') {
      Object(keys_handlers__WEBPACK_IMPORTED_MODULE_0__["unpaintGlobalLinks"])();
    }
  });
}

/* harmony default export */ __webpack_exports__["default"] = (registerAltKeyListeners);

/***/ }),

/***/ "./src/client/keys/register_key_listener.js":
/*!**************************************************!*\
  !*** ./src/client/keys/register_key_listener.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var keys_handlers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! keys/handlers */ "./src/client/keys/handlers.js");
/* harmony import */ var helpers_relationships__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/relationships */ "./src/client/helpers/relationships.js");
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");
var _keyNames;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}




 // Copyright Greenhouse Software 2017

var registerKeyListener = function registerKeyListener() {
  window.addEventListener('keydown', function (e) {
    var modifiers = (e.metaKey ? 'command-' : '') + (e.altKey ? 'alt-' : '') + (e.ctrlKey ? 'ctrl-' : '') + (e.shiftKey ? 'shift-' : '');
    var keyName = keyNames[e.keyCode];
    var shortcutName = modifiers + keyName;
    var preventDefaultList = ['space', 'tab'];

    if (preventDefaultList.includes(keyName)) {
      e.preventDefault();
    }

    if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) {
      (shortcutRelationships[shortcutName] || function () {})();
    } else if (shortcutRelationships[shortcutName]) {
      Object(display_display_path__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])().dataset.topicName, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])().dataset.subtopicName, null, true); // displaySelectedLink(firstLinkOfSection(currentSection()));
    }
  });
}; // Pressing down on alias link should cause redirect


var shortcutRelationships = {
  'left': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveLeftward"],
  'up': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveUpward"],
  'down': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveDownward"],
  'right': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveRightward"],
  'h': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveLeftward"],
  'j': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveDownward"],
  'k': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveUpward"],
  'l': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveRightward"],
  'return': keys_handlers__WEBPACK_IMPORTED_MODULE_1__["moveDownOrRedirect"]
};
var keyNames = (_keyNames = {
  37: 'left',
  39: 'right',
  38: 'up',
  40: 'down',
  71: 'g',
  72: 'h',
  75: 'k',
  74: 'j',
  76: 'l',
  186: ';',
  222: '\'',
  220: '\\',
  89: 'y',
  85: 'u',
  73: 'i',
  79: 'o',
  80: 'p',
  219: '[',
  221: ']',
  13: 'return',
  9: 'tab',
  27: 'escape',
  8: 'backspace',
  32: 'space',
  78: 'n',
  77: 'm',
  188: ',',
  190: '.',
  191: '/',
  192: '`',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  81: 'q',
  87: 'w',
  69: 'e',
  82: 'r',
  84: 't',
  65: 'a',
  83: 's',
  68: 'd',
  70: 'f'
}, _defineProperty(_keyNames, "71", 'g'), _defineProperty(_keyNames, 90, 'z'), _defineProperty(_keyNames, 88, 'x'), _defineProperty(_keyNames, 67, 'c'), _defineProperty(_keyNames, 86, 'v'), _defineProperty(_keyNames, 66, 'b'), _defineProperty(_keyNames, 55, '7'), _defineProperty(_keyNames, 56, '8'), _defineProperty(_keyNames, 57, '9'), _defineProperty(_keyNames, 48, '0'), _defineProperty(_keyNames, 189, '-'), _defineProperty(_keyNames, 187, '='), _keyNames);
/* harmony default export */ __webpack_exports__["default"] = (registerKeyListener);

/***/ }),

/***/ "./src/client/render/render_dom_tree.js":
/*!**********************************************!*\
  !*** ./src/client/render/render_dom_tree.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");
/* harmony import */ var helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/set_path_and_fragment */ "./src/client/helpers/set_path_and_fragment.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var render_render_topic__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! render/render_topic */ "./src/client/render/render_topic.js");







var renderDomTree = function renderDomTree(topicName, subtopicName, paragraphsBySubtopic, currentTopicStack, renderedSubtopics) {
  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');
  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.id = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["htmlIdFor"])(topicName, subtopicName);
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = subtopicName;
  var linesOfBlock = paragraphsBySubtopic[subtopicName];
  currentTopicStack.push(topicName);
  renderedSubtopics[subtopicName] = true;
  linesOfBlock.forEach(function (tokensOfLine, lineNumber) {
    if (lineNumber > 0) {
      paragraphElement.appendChild(document.createElement('br'));
    }

    tokensOfLine.forEach(function (token) {
      var tokenElement;
      var textElement = document.createTextNode(token.text);

      if (token.type === 'text' || currentTopicStack.includes(token.targetSubtopic)) {
        tokenElement = textElement;
      } else if (token.type === 'local') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);

        if (!renderedSubtopics.hasOwnProperty(token.targetSubtopic)) {
          var subtree = renderDomTree(topicName, token.targetSubtopic, paragraphsBySubtopic, currentTopicStack, renderedSubtopics);
          tokenElement.addEventListener('click', function (e) {
            e.preventDefault(); // If the link's child is already selected, display the link's section

            if (document.querySelector('.canopy-selected-section') === subtree) {
              Object(display_display_path__WEBPACK_IMPORTED_MODULE_1__["default"])(linkElement.dataset.topicName, linkElement.dataset.enclosingSubtopic);
            } else {
              Object(display_display_path__WEBPACK_IMPORTED_MODULE_1__["default"])(topicName, token.targetSubtopic);
            }
          });
          var id = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["htmlIdFor"])(topicName, token.targetSubtopic);
          tokenElement.classList.add(id);
          tokenElement.classList.add('canopy-parent-link');
          tokenElement.dataset.childSectionId = id;
          tokenElement.dataset.type = 'parent';
          tokenElement.dataset.targetTopic = topicName;
          tokenElement.dataset.targetSubtopic = token.targetSubtopic;
          tokenElement.dataset.urlSubtopic = token.targetSubtopic;
          tokenElement.dataset.enclosingTopic = token.enclosingTopic;
          tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
          tokenElement.dataset.clauseText = token.clause;
          tokenElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(topicName), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetSubtopic));
          sectionElement.appendChild(subtree);
        } else {
          tokenElement.classList.add('canopy-redundant-parent-link');
          tokenElement.dataset.type = 'redundant-parent';
          tokenElement.dataset.targetTopic = topicName;
          tokenElement.dataset.targetSubtopic = token.targetSubtopic;
          tokenElement.dataset.enclosingTopic = token.enclosingTopic;
          tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
          tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
          tokenElement.dataset.clauseText = token.clause;
          tokenElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(topicName), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.enclosingSubtopic));
          tokenElement.addEventListener('click', function (e) {
            e.preventDefault();
            Object(display_display_path__WEBPACK_IMPORTED_MODULE_1__["default"])(topicName, token.targetSubtopic);
          });
        }
      } else if (token.type === 'global') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.classList.add('canopy-global-link');
        tokenElement.dataset.type = 'global';
        tokenElement.dataset.targetTopic = token.targetTopic;
        tokenElement.dataset.targetSubtopic = token.targetSubtopic;
        tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
        tokenElement.dataset.enclosingTopic = token.enclosingTopic;
        tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
        tokenElement.dataset.clauseText = token.clause;
        tokenElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.topic), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.urlSubtopic));
        tokenElement.addEventListener('click', function (e) {
          e.preventDefault();
          Object(render_render_topic__WEBPACK_IMPORTED_MODULE_4__["default"])(token.targetTopic, token.targetSubtopic);
        });
      }

      paragraphElement.appendChild(tokenElement);
    });
  });
  currentTopicStack.pop(topicName);
  return sectionElement;
};

/* harmony default export */ __webpack_exports__["default"] = (renderDomTree);

/***/ }),

/***/ "./src/client/render/render_topic.js":
/*!*******************************************!*\
  !*** ./src/client/render/render_topic.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var requests_request_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! requests/request_json */ "./src/client/requests/request_json.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var render_render_dom_tree__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! render/render_dom_tree */ "./src/client/render/render_dom_tree.js");
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");
/* harmony import */ var helpers_relationships__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! helpers/relationships */ "./src/client/helpers/relationships.js");
/* harmony import */ var helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! helpers/set_path_and_fragment */ "./src/client/helpers/set_path_and_fragment.js");









var renderTopic = function renderTopic(topicName, selectedSubtopicName, selectedLinkData, selectFirstLink) {
  var existingSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["sectionElementOfTopic"])(topicName, selectedSubtopicName);

  if (existingSectionElement) {
    createOrReplaceHeader(topicName);
    return Object(display_display_path__WEBPACK_IMPORTED_MODULE_3__["default"])(topicName, selectedSubtopicName, selectedLinkData && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["findLinkFromMetadata"])(selectedLinkData), selectFirstLink);
  }

  Object(requests_request_json__WEBPACK_IMPORTED_MODULE_0__["default"])(topicName, function (dataObject) {
    var paragraphsBySubtopic = dataObject;
    createOrReplaceHeader(topicName);
    var domTree = Object(render_render_dom_tree__WEBPACK_IMPORTED_MODULE_2__["default"])(topicName, topicName, paragraphsBySubtopic, [], {});
    helpers_getters__WEBPACK_IMPORTED_MODULE_1__["canopyContainer"].appendChild(domTree);
    Object(display_display_path__WEBPACK_IMPORTED_MODULE_3__["default"])(topicName, selectedSubtopicName, selectedLinkData && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["findLinkFromMetadata"])(selectedLinkData), selectFirstLink);
  }, function (e) {
    Object(helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_5__["default"])(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["defaultTopic"], null);
  });
};

function createOrReplaceHeader(topicName) {
  var existingHeader = document.querySelector('#_canopy h1');

  if (existingHeader) {
    existingHeader.remove();
  }

  var headerTextNode = document.createTextNode(topicName);
  var headerDomElement = document.createElement('h1');
  headerDomElement.appendChild(headerTextNode);
  helpers_getters__WEBPACK_IMPORTED_MODULE_1__["canopyContainer"].prepend(headerDomElement);
}

;
/* harmony default export */ __webpack_exports__["default"] = (renderTopic);

/***/ }),

/***/ "./src/client/requests/request_json.js":
/*!*********************************************!*\
  !*** ./src/client/requests/request_json.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");


var requestJson = function requestJson(topicName, success, error) {
  fetch('data/' + Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(topicName.toLowerCase()) + '.json').then(function (res) {
    return res.json();
  }).catch(function (e) {
    error(e);
  }).then(function (json) {
    if (json) {
      success(json);
    }
  });
};

/* harmony default export */ __webpack_exports__["default"] = (requestJson);

/***/ }),

/***/ "./src/client/style/canopy.css":
/*!*************************************!*\
  !*** ./src/client/style/canopy.css ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../../node_modules/css-loader!./canopy.css */ "./node_modules/css-loader/index.js!./src/client/style/canopy.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ })

/******/ });
//# sourceMappingURL=canopy.js.map