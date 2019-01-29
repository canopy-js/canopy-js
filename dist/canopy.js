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

/***/ "./node_modules/css-loader/index.js!./node_modules/sass-loader/lib/loader.js!./src/client/style/canopy.scss":
/*!*********************************************************************************************************!*\
  !*** ./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js!./src/client/style/canopy.scss ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "#_canopy {\n  padding-top: 25px;\n  padding-bottom: 55px; }\n  #_canopy h1 {\n    text-align: center;\n    margin-top: 10px; }\n  #_canopy hr {\n    width: 20%; }\n  #_canopy p {\n    padding-top: 10px;\n    padding-bottom: 10px;\n    font-size: 23px;\n    width: 700px;\n    margin: auto;\n    line-height: 1.3;\n    letter-spacing: -.003em;\n    font-weight: 400; }\n  #_canopy a {\n    text-decoration: underline #F0F0F0;\n    color: black;\n    cursor: pointer;\n    /*\n    &.canopy-dfs-previously-selected-link {\n      color: #ff0000;\n    }\n\n    &.canopy-reverse-dfs-previously-selected-link {\n      color: #0000ff;\n    }*/ }\n    #_canopy a:hover {\n      text-decoration: underline; }\n    #_canopy a:focus {\n      outline: 0; }\n    #_canopy a.canopy-open-link {\n      text-decoration: underline; }\n    #_canopy a.canopy-selected-link {\n      text-shadow: .8px 0px 0px black; }\n      #_canopy a.canopy-selected-link.canopy-redundant-parent-link {\n        text-decoration: underline black; }\n    #_canopy a.canopy-global-link:hover {\n      color: #4078c0; }\n    #_canopy a.canopy-global-link.canopy-selected-link {\n      text-decoration: underline #4078c0;\n      color: #4078c0; }\n    #_canopy a.canopy-global-link.canopy-open-link {\n      color: #4078c0; }\n", ""]);

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
!(function webpackMissingModule() { var e = new Error("Cannot find module 'render/update_view'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());
/* harmony import */ var path_set_path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/set_path */ "./src/client/path/set_path.js");
/* harmony import */ var style_canopy_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! style/canopy.scss */ "./src/client/style/canopy.scss");
/* harmony import */ var style_canopy_scss__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(style_canopy_scss__WEBPACK_IMPORTED_MODULE_3__);
!(function webpackMissingModule() { var e = new Error("Cannot find module 'keys/register_key_listener'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());
/* harmony import */ var path_parse_path_string__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! path/parse_path_string */ "./src/client/path/parse_path_string.js");





 // history.state.paths = {};
// if (!parsePathString()[0]) {
//   setPathAndFragment(defaultTopic, null);
// } else {

!(function webpackMissingModule() { var e = new Error("Cannot find module 'render/update_view'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_4__["default"])(), history.state, null); // }

!(function webpackMissingModule() { var e = new Error("Cannot find module 'keys/register_key_listener'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())();
window.addEventListener('popstate', function (e) {
  var oldState = Object.assign(history.state || {}, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));
  history.replaceState(Object.assign(history.state || {}, oldState), document.title, window.location.href);
  var selectedLinkData = e.state && e.state.targetTopic ? e.state : null;
  !(function webpackMissingModule() { var e = new Error("Cannot find module 'render/update_view'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_4__["default"])(), selectedLinkData, null, true);
});

/***/ }),

/***/ "./src/client/helpers/booleans.js":
/*!****************************************!*\
  !*** ./src/client/helpers/booleans.js ***!
  \****************************************/
/*! exports provided: isInRootSection, isATopicRootSection, isTreeRootSection */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInRootSection", function() { return isInRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isATopicRootSection", function() { return isATopicRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTreeRootSection", function() { return isTreeRootSection; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");



function isInRootSection(linkElement) {
  return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(linkElement) === Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentRootSection"])();
}

function isATopicRootSection(sectionElement) {
  return sectionElement.dataset.topicName === sectionElement.dataset.subtopicName;
}

function isTreeRootSection(sectionElement) {
  return sectionElement.parentNode === helpers_getters__WEBPACK_IMPORTED_MODULE_0__["canopyContainer"];
}



/***/ }),

/***/ "./src/client/helpers/getters.js":
/*!***************************************!*\
  !*** ./src/client/helpers/getters.js ***!
  \***************************************/
/*! exports provided: canopyContainer, defaultTopic, sectionElementOfPath, currentSection, currentRootSection, selectedLink, parentLinkOfSection, childSectionElementOfParentLink, sectionElementOfLink, metadataFromLink, documentTitleFor, findLinkFromMetadata, findLowestExtantSectionElementOfPath, openLinkOfSection, paragraphElementOfSection, linkAfter, linkBefore, firstChildLinkOfParentLink, lastChildLinkOfParentLink, firstLinkOfSection, enclosingTopicSectionOfLink, firstSiblingOf, lastSiblingOf, parentLinkOf, siblingOfLinkLike, linkOfSectionLike, linkOfSectionByTarget */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "canopyContainer", function() { return canopyContainer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultTopic", function() { return defaultTopic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionElementOfPath", function() { return sectionElementOfPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "currentSection", function() { return currentSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "currentRootSection", function() { return currentRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectedLink", function() { return selectedLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parentLinkOfSection", function() { return parentLinkOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "childSectionElementOfParentLink", function() { return childSectionElementOfParentLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionElementOfLink", function() { return sectionElementOfLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "metadataFromLink", function() { return metadataFromLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentTitleFor", function() { return documentTitleFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLinkFromMetadata", function() { return findLinkFromMetadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLowestExtantSectionElementOfPath", function() { return findLowestExtantSectionElementOfPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openLinkOfSection", function() { return openLinkOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "paragraphElementOfSection", function() { return paragraphElementOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkAfter", function() { return linkAfter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkBefore", function() { return linkBefore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstChildLinkOfParentLink", function() { return firstChildLinkOfParentLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastChildLinkOfParentLink", function() { return lastChildLinkOfParentLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstLinkOfSection", function() { return firstLinkOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enclosingTopicSectionOfLink", function() { return enclosingTopicSectionOfLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstSiblingOf", function() { return firstSiblingOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastSiblingOf", function() { return lastSiblingOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parentLinkOf", function() { return parentLinkOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "siblingOfLinkLike", function() { return siblingOfLinkLike; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkOfSectionLike", function() { return linkOfSectionLike; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkOfSectionByTarget", function() { return linkOfSectionByTarget; });
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");
/* harmony import */ var helpers_booleans__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/booleans */ "./src/client/helpers/booleans.js");


var canopyContainer = document.getElementById('_canopy');

if (!canopyContainer) {
  throw new Error('Page must have an html element with id "_canopy"');
}

var defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;

if (!defaultTopic) {
  throw new Error('HTML element with id "_canopy" must have a default topic data attribute');
}

var sectionElementOfPath = function sectionElementOfPath(pathArray) {
  var currentNode = canopyContainer;

  for (var i = 0; i < pathArray.length; i++) {
    if (!currentNode) {
      return null;
    }

    var topicName = pathArray[i][0];
    var subtopicName = pathArray[i][1];
    currentNode = currentNode.querySelector("[data-topic-name=\"".concat(topicName, "\"]") + "[data-subtopic-name=\"".concat(subtopicName, "\"]") + "[data-path-depth=\"".concat(i, "\"]"));
  }

  return currentNode;
};

var currentSection = function currentSection() {
  var nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[nodeList.length - 1];
};

var selectedLink = function selectedLink() {
  return document.querySelector('.canopy-selected-link');
};

var currentRootSection = function currentRootSection() {
  var nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[0];
};

var parentLinkOfSection = function parentLinkOfSection(sectionElement) {
  if (sectionElement.parentNode === canopyContainer) {
    return null;
  }

  return linkOfSectionByTarget(sectionElement.parentNode, sectionElement.dataset.topicName, sectionElement.dataset.subtopicName);
};

var childSectionElementOfParentLink = function childSectionElementOfParentLink(linkElement) {
  return Array.from(linkElement.parentNode.parentNode.childNodes).find(function (sectionElement) {
    return sectionElement.dataset.topicName === linkElement.dataset.targetTopic && sectionElement.dataset.subtopicName === linkElement.dataset.targetSubtopic;
  });
};

function sectionElementOfLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  return linkElement.parentNode.parentNode;
}

function documentTitleFor(topicName) {
  return topicName;
}

function metadataFromLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  var sectionElement = sectionElementOfLink(linkElement);
  var relativeLinkNumber = Array.from(sectionElement.querySelectorAll(" a[data-target-topic=\"".concat(linkElement.dataset.targetTopic, "\"]") + "[data-target-subtopic=\"".concat(linkElement.dataset.targetSubtopic, "\"]"))).indexOf(linkElement);
  return {
    sectionElementTopicName: sectionElement.dataset.topicName,
    sectionElementSubtopicName: sectionElement.dataset.subtopicName,
    sectionElementPathDepth: sectionElement.dataset.pathDepth,
    targetTopic: linkElement.dataset.targetTopic,
    targetSubtopic: linkElement.dataset.targetSubtopic,
    relativeLinkNumber: relativeLinkNumber
  };
}

function findLinkFromMetadata(linkSelectionData) {
  return document.querySelectorAll("section[data-topic-name=\"".concat(linkSelectionData.sectionElementTopicName, "\"]") + "[data-subtopic-name=\"".concat(linkSelectionData.sectionElementSubtopicName, "\"]") + "[data-path-depth=\"".concat(linkSelectionData.sectionElementPathDepth, "\"]") + " a[data-target-topic=\"".concat(linkSelectionData.targetTopic, "\"]") + "[data-target-subtopic=\"".concat(linkSelectionData.targetSubtopic, "\"]"))[linkSelectionData.relativeLinkNumber];
}

function findLowestExtantSectionElementOfPath(pathArray) {
  var lowestExtantSectionElementOfPath = null;
  var pathSuffixToRender = [];

  for (var i = 0; i < pathArray.length; i++) {
    var pathSegment = pathArray.slice(0, i + 1);
    var sectionElement = sectionElementOfPath(pathSegment);

    if (sectionElement) {
      lowestExtantSectionElementOfPath = sectionElementOfPath(pathSegment);
    } else {
      pathSuffixToRender = pathArray.slice(i);
      break;
    }
  }

  return {
    lowestExtantSectionElementOfPath: lowestExtantSectionElementOfPath,
    pathSuffixToRender: pathSuffixToRender
  };
}

function openLinkOfSection(sectionElement) {
  return linkOfSectionLike(sectionElement, function (linkElement) {
    return linkElement.classList.contains('canopy-open-link');
  });
}

function paragraphElementOfSection(sectionElement) {
  return Array.from(sectionElement.childNodes).find(function (element) {
    return element.tagName === 'P';
  });
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

function firstOrLastChildOfParentLink(linkElement, first) {
  if (linkElement === null) {
    return null;
  }

  var sectionElement = childSectionElementOfParentLink(linkElement);

  if (!sectionElement) {
    return null;
  }

  var array = Array.from(sectionElement.firstElementChild.childNodes).filter(function (node) {
    return node.tagName === 'A';
  });

  if (first) {
    return array[0];
  } else {
    return array[array.length - 1];
  }
}

function firstChildLinkOfParentLink(linkElement) {
  return firstOrLastChildOfParentLink(linkElement, true);
}

function lastChildLinkOfParentLink(linkElement) {
  return firstOrLastChildOfParentLink(linkElement, false);
}

function firstLinkOfSection(sectionElement) {
  if (sectionElement === null) {
    return null;
  }

  return sectionElement.querySelectorAll('a')[0] || null;
}

function enclosingTopicSectionOfLink(linkElement) {
  var sectionElement = sectionElementOfLink(linkElement);

  if (sectionElement.dataset.pathDepth === "0") {
    return currentRootSection();
  }

  var currentSectionElement = sectionElement;

  while (currentSectionElement.parentNode.dataset.pathDepth === sectionElement.dataset.pathDepth) {
    currentSectionElement = currentSectionElement.parentNode;
  }

  return currentSectionElement;
}

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

  if (Object(helpers_booleans__WEBPACK_IMPORTED_MODULE_1__["isInRootSection"])(linkElement)) {
    return null;
  }

  return parentLinkOfSection(sectionElementOfLink(linkElement));
}

function siblingOfLinkLike(linkElementArg, condition) {
  return Array.from(linkElementArg.parentNode.childNodes).find(function (linkElement) {
    return condition(linkElement) && linkElement !== linkElementArg;
  });
}

function linkOfSectionLike(sectionElement, condition) {
  var paragraphElement = paragraphElementOfSection(sectionElement);
  return Array.from(paragraphElement.childNodes).find(function (linkElement) {
    return linkElement.tagName === 'A' && condition(linkElement);
  });
}

function linkOfSectionByTarget(sectionElement, topicName, subtopicName) {
  return linkOfSectionLike(sectionElement, function (linkElement) {
    return linkElement.dataset.targetTopic === topicName && linkElement.dataset.targetSubtopic === subtopicName;
  });
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

/***/ "./src/client/path/parse_path_string.js":
/*!**********************************************!*\
  !*** ./src/client/path/parse_path_string.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var parsePathString = function parsePathString(pathStringArg) {
  var pathString = pathStringArg || window.location.pathname + window.location.hash;
  var slashSeparatedUnits = pathString.replace(/_/g, ' ').split('/').filter(function (string) {
    return string !== '';
  });
  return slashSeparatedUnits.map(function (slashSeparatedUnit) {
    var match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
    return [match[1] || match[2] || null, match[2] || match[1] || null];
  }).filter(function (tuple) {
    return tuple[0] !== null;
  });
};

/* harmony default export */ __webpack_exports__["default"] = (parsePathString);

/***/ }),

/***/ "./src/client/path/path_string_for.js":
/*!********************************************!*\
  !*** ./src/client/path/path_string_for.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");


function pathStringFor(pathArray) {
  return '/' + pathArray.map(function (tuple) {
    return Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(tuple[0]) + (tuple[1] && tuple[1] !== tuple[0] ? '#' + Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(tuple[1]) : '');
  }).join('/');
}

/* harmony default export */ __webpack_exports__["default"] = (pathStringFor);

/***/ }),

/***/ "./src/client/path/set_path.js":
/*!*************************************!*\
  !*** ./src/client/path/set_path.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var path_parse_path_string__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path/parse_path_string */ "./src/client/path/parse_path_string.js");
/* harmony import */ var path_path_string_for__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/path_string_for */ "./src/client/path/path_string_for.js");




var setPath = function setPath(newPathArray) {
  var oldPathArray = Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_1__["default"])();
  var documentTitle = newPathArray[0][0];
  var historyApiFunction = newPathArray === oldPathArray ? // always false
  replaceState : pushState;
  historyApiFunction(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()), documentTitle, Object(path_path_string_for__WEBPACK_IMPORTED_MODULE_2__["default"])(newPathArray));
};

function replaceState(a, b, c) {
  history.replaceState(a, b, c);
}

;

function pushState(a, b, c) {
  history.pushState(a, b, c);
}

;
/* harmony default export */ __webpack_exports__["default"] = (setPath);

/***/ }),

/***/ "./src/client/style/canopy.scss":
/*!**************************************!*\
  !*** ./src/client/style/canopy.scss ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../../node_modules/css-loader!../../../node_modules/sass-loader/lib/loader.js!./canopy.scss */ "./node_modules/css-loader/index.js!./node_modules/sass-loader/lib/loader.js!./src/client/style/canopy.scss");

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