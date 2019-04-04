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
exports.push([module.i, "#_canopy {\n  padding-top: 15px;\n  padding-bottom: 55px; }\n  #_canopy h1 {\n    text-align: center;\n    margin: auto;\n    width: 40%;\n    margin-top: 10px; }\n  #_canopy hr {\n    width: 9%;\n    display: block;\n    height: 1px;\n    border: 0;\n    border-top: 5px solid #ccc;\n    margin: 0px auto;\n    padding-bottom: 30px; }\n  #_canopy section.canopy-topic-section {\n    padding-top: 40px; }\n  #_canopy section {\n    padding-top: 30px; }\n  #_canopy p {\n    font-size: 23px;\n    max-width: 700px;\n    margin: auto;\n    line-height: 1.3;\n    letter-spacing: -.003em;\n    font-weight: 400; }\n  #_canopy a.canopy-selectable-link {\n    text-decoration: underline #F0F0F0;\n    color: black;\n    cursor: pointer;\n    /*\n    &.canopy-dfs-previously-selected-link {\n      color: #ff0000;\n    }\n\n    &.canopy-reverse-dfs-previously-selected-link {\n      color: #0000ff;\n    }\n    */ }\n    #_canopy a.canopy-selectable-link:hover {\n      text-decoration: underline; }\n    #_canopy a.canopy-selectable-link:focus {\n      outline: 0; }\n    #_canopy a.canopy-selectable-link.canopy-open-link {\n      text-decoration: underline;\n      background-color: #f1f5fa; }\n    #_canopy a.canopy-selectable-link.canopy-selected-link {\n      text-shadow: .8px 0px 0px black; }\n      #_canopy a.canopy-selectable-link.canopy-selected-link.canopy-redundant-local-link {\n        text-decoration: underline black; }\n    #_canopy a.canopy-selectable-link.canopy-global-link:hover, #_canopy a.canopy-selectable-link.canopy-url-link:hover {\n      color: #4078c0; }\n    #_canopy a.canopy-selectable-link.canopy-global-link.canopy-selected-link, #_canopy a.canopy-selectable-link.canopy-url-link.canopy-selected-link {\n      text-decoration: underline #4078c0;\n      color: #4078c0; }\n    #_canopy a.canopy-selectable-link.canopy-global-link.canopy-open-link, #_canopy a.canopy-selectable-link.canopy-url-link.canopy-open-link {\n      color: #2f5689; }\n  #_canopy span.canopy-text-span {\n    display: block; }\n  #_canopy hr.footnote-rule {\n    width: 700px;\n    display: block;\n    height: 1px;\n    border: 0;\n    border-top: 1px solid #ccc;\n    margin: 12px 0;\n    padding: 0; }\n  #_canopy sup {\n    font-size: 60%;\n    padding: 2px; }\n  #_canopy .footnote-span {\n    font-size: 80%; }\n  #_canopy blockquote {\n    margin: 7px 10px;\n    background-color: #eff0f1;\n    padding: 5px;\n    font-size: 90%; }\n  #_canopy pre {\n    margin: 7px 10px;\n    background-color: #eff0f1;\n    padding: 5px;\n    font-size: 85%; }\n  #_canopy code {\n    background-color: #eff0f1;\n    font-size: 90%; }\n  #_canopy table {\n    margin: 7px auto;\n    table-layout: fixed;\n    width: 70%;\n    border-collapse: collapse;\n    border: 2px solid black; }\n    #_canopy table td, #_canopy table th {\n      border: 2px solid black;\n      text-align: center;\n      padding: 6px; }\n  #_canopy img {\n    max-width: 200px; }\n  #_canopy div.canopy-image-div {\n    float: right;\n    border: 1px solid #c8ccd1;\n    padding: 3px;\n    background-color: #f8f9fa;\n    font-size: 94%;\n    text-align: center;\n    overflow: hidden;\n    min-width: 172px;\n    min-height: 230px;\n    margin: 10px; }\n  #_canopy div.canopy-image-div > sup {\n    display: block; }\n  #_canopy .canopy-url-link-span > svg {\n    height: 15px;\n    width: 12px;\n    display: none; }\n  #_canopy .canopy-selected-link + svg, #_canopy .canopy-url-link-span:hover > svg {\n    display: inline;\n    vertical-align: middle; }\n  #_canopy ol, #_canopy ul {\n    margin: 7px 10px; }\n  #_canopy div.canopy-raw-html {\n    display: inline; }\n\n#_canopy > section.canopy-topic-section {\n  padding-top: 10px; }\n", ""]);

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

/***/ "./src/client/assets/external_link_icon/icon.svg":
/*!*******************************************************!*\
  !*** ./src/client/assets/external_link_icon/icon.svg ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<svg xmlns:svg=\"http://www.w3.org/2000/svg\"\n   xmlns=\"http://www.w3.org/2000/svg\"\n   version=\"1.0\"\n   width=\"12\"\n   height=\"12\"\n   id=\"svg2\">\n  <defs id=\"defs4\"></defs>\n  <rect\n     width=\"5.9999995\"\n     height=\"6\"\n     x=\"1.5\"\n     y=\"4.5\"\n     id=\"rect3170\"\n     style=\"fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#0066cc;stroke-width:0.99999994;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\"></rect>\n  <path\n     d=\"M 4,2.5 L 5,3.5 L 5.25,4.25 L 2.75,6.5 L 5.5,9.25 L 7.75,6.75 L 8.5,7 L 9.5,8 L 11,6.5 L 11,1 L 5.5,1 L 4,2.5 z\"\n     id=\"path2395\"\n     style=\"fill:#0066ff;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\"></path>\n  <path\n     d=\"M 6,2 L 10,2 L 10,6 L 9.5,6.75 L 8.25,4.75 L 5.25,8 L 4,6.75 L 7.25,3.75 L 5.25,2.5 L 6,2 z\"\n     id=\"path2398\"\n     style=\"fill:#ffffff;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1\" ></path>\n</svg>\n"

/***/ }),

/***/ "./src/client/canopy.js":
/*!******************************!*\
  !*** ./src/client/canopy.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var style_canopy_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! style/canopy.scss */ "./src/client/style/canopy.scss");
/* harmony import */ var style_canopy_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(style_canopy_scss__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var display_update_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! display/update_view */ "./src/client/display/update_view.js");
/* harmony import */ var path_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/helpers */ "./src/client/path/helpers.js");
/* harmony import */ var keys_register_key_listeners__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! keys/register_key_listeners */ "./src/client/keys/register_key_listeners.js");
/* harmony import */ var history_register_pop_state_listener__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! history/register_pop_state_listener */ "./src/client/history/register_pop_state_listener.js");
/* harmony import */ var history_helpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! history/helpers */ "./src/client/history/helpers.js");






Object(keys_register_key_listeners__WEBPACK_IMPORTED_MODULE_3__["default"])();
Object(history_register_pop_state_listener__WEBPACK_IMPORTED_MODULE_4__["default"])();
Object(display_update_view__WEBPACK_IMPORTED_MODULE_1__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathOrDefaultTopic"])(), {
  linkSelectionData: Object(history_helpers__WEBPACK_IMPORTED_MODULE_5__["priorLinkSelectionData"])()
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
/* harmony import */ var path_set_path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path/set_path */ "./src/client/path/set_path.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var display_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! display/helpers */ "./src/client/display/helpers.js");
/* harmony import */ var history_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! history/helpers */ "./src/client/history/helpers.js");





var displayPath = function displayPath(pathArray, displayOptions) {
  var topicName = pathArray[0][0];
  displayOptions.sectionElementOfCurrentPath = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["sectionElementOfPath"])(pathArray);

  if (!displayOptions.sectionElementOfCurrentPath) {
    throw "No section element found for path: " + pathArray;
  }

  if (!displayOptions.originatesFromPopStateEvent) {
    Object(path_set_path__WEBPACK_IMPORTED_MODULE_0__["default"])(pathArray);
  }

  document.title = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["documentTitleFor"])(topicName);
  var displayTopicName = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["sectionElementOfPath"])([[topicName, topicName]]).dataset.topicDisplayName;
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_2__["createOrReplaceHeader"])(displayTopicName);
  displayOptions.postDisplayCallback && displayOptions.postDisplayCallback();
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_2__["deselectAllLinks"])();
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_2__["hideAllSectionElements"])();
  var linkToSelect = Object(display_helpers__WEBPACK_IMPORTED_MODULE_2__["determineLinkToSelect"])(pathArray, displayOptions);
  var sectionElementToDisplay = Object(display_helpers__WEBPACK_IMPORTED_MODULE_2__["determineSectionElementToDisplay"])(linkToSelect, displayOptions);
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_2__["addSelectedLinkClass"])(linkToSelect);
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_2__["addOpenLinkClass"])(linkToSelect);
  Object(history_helpers__WEBPACK_IMPORTED_MODULE_3__["storeLinkSelectionInSession"])(linkToSelect);
  displayPathTo(sectionElementToDisplay);
  window.scrollTo(0, helpers_getters__WEBPACK_IMPORTED_MODULE_1__["canopyContainer"].scrollHeight);
};

var displayPathTo = function displayPathTo(sectionElement) {
  sectionElement.style.display = 'block';

  if (sectionElement.parentNode === helpers_getters__WEBPACK_IMPORTED_MODULE_1__["canopyContainer"]) {
    return;
  }

  var parentLinks = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["parentLinksOfSection"])(sectionElement);
  parentLinks.forEach(function (parentLink) {
    return parentLink.classList.add('canopy-open-link');
  });
  var parentSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["sectionElementOfLink"])(parentLinks[0]);
  displayPathTo(parentSectionElement);
};

/* harmony default export */ __webpack_exports__["default"] = (displayPath);

/***/ }),

/***/ "./src/client/display/helpers.js":
/*!***************************************!*\
  !*** ./src/client/display/helpers.js ***!
  \***************************************/
/*! exports provided: newNodeAlreadyPresent, determineLinkToSelect, determineSectionElementToDisplay, createOrReplaceHeader, displaySectionBelowLink, addSelectedLinkClass, addOpenLinkClass, addOpenClassToRedundantSiblings, moveSelectedSectionClass, hideAllSectionElements, deselectAllLinks, updateDfsClasses */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "newNodeAlreadyPresent", function() { return newNodeAlreadyPresent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determineLinkToSelect", function() { return determineLinkToSelect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determineSectionElementToDisplay", function() { return determineSectionElementToDisplay; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createOrReplaceHeader", function() { return createOrReplaceHeader; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "displaySectionBelowLink", function() { return displaySectionBelowLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addSelectedLinkClass", function() { return addSelectedLinkClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addOpenLinkClass", function() { return addOpenLinkClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addOpenClassToRedundantSiblings", function() { return addOpenClassToRedundantSiblings; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveSelectedSectionClass", function() { return moveSelectedSectionClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hideAllSectionElements", function() { return hideAllSectionElements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deselectAllLinks", function() { return deselectAllLinks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateDfsClasses", function() { return updateDfsClasses; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var render_render_styled_text__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! render/render_styled_text */ "./src/client/render/render_styled_text.js");



function newNodeAlreadyPresent(anchorElement, domTree) {
  return Array.from(anchorElement.childNodes).filter(function (childNode) {
    return childNode.dataset && childNode.dataset.topicName === domTree.dataset.topicName && childNode.dataset.subtopicName === domTree.dataset.subtopicName;
  }).length > 0;
}

function determineLinkToSelect(pathArray, displayOptions) {
  var linkSelectionData = displayOptions.linkSelectionData,
      selectALink = displayOptions.selectALink,
      sectionElementOfCurrentPath = displayOptions.sectionElementOfCurrentPath;

  if (linkSelectionData) {
    return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["findLinkFromMetadata"])(linkSelectionData);
  }

  if (selectALink) {
    if (lastPathSegmentIsATopicRoot(pathArray)) {
      return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstLinkOfSectionElement"])(sectionElementOfCurrentPath) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(sectionElementOfCurrentPath);
    } else {
      return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(sectionElementOfCurrentPath);
    }
  } else {
    return null;
  }
}

function lastPathSegmentIsATopicRoot(pathArray) {
  var lastPathSegment = pathArray[pathArray.length - 1];
  return lastPathSegment[0] === lastPathSegment[1];
}

function createOrReplaceHeader(topicName) {
  var existingHeader = document.querySelector('#_canopy h1');

  if (existingHeader) {
    existingHeader.remove();
  }

  var headerDomElement = document.createElement('h1');
  var styleElements = Object(render_render_styled_text__WEBPACK_IMPORTED_MODULE_1__["default"])(topicName);
  styleElements.forEach(function (element) {
    headerDomElement.appendChild(element);
  });
  helpers_getters__WEBPACK_IMPORTED_MODULE_0__["canopyContainer"].prepend(headerDomElement);
}

;

function determineSectionElementToDisplay(linkToSelect, displayOptions) {
  if (linkToSelect && displaySectionBelowLink(linkToSelect)) {
    return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["childSectionElementOfParentLink"])(linkToSelect);
  } else {
    return displayOptions.sectionElementOfCurrentPath;
  }
}

function displaySectionBelowLink(linkToSelect) {
  return linkToSelect && (linkToSelect.dataset.type === 'local' || redundantParentLinkInSameParagraphAsPrimary(linkToSelect));
}

function redundantParentLinkInSameParagraphAsPrimary(linkToSelect) {
  return linkToSelect && linkToSelect.dataset.type === 'redundant-local' && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["siblingOfLinkLike"])(linkToSelect, function (linkElement) {
    return linkElement.dataset && linkElement.dataset.targetTopic === linkToSelect.dataset.targetTopic && linkElement.dataset.targetSubtopic === linkToSelect.dataset.targetSubtopic;
  });
}

function addSelectedLinkClass(linkToSelect) {
  if (linkToSelect) {
    linkToSelect.classList.add('canopy-selected-link');
  }
}

function addOpenLinkClass(linkToSelect) {
  if (linkToSelect && linkToSelect.dataset.type === 'local') {
    linkToSelect.classList.add('canopy-open-link');
  }
}

function addOpenClassToRedundantSiblings(parentLink) {
  Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linksOfSectionLike"])(sectionElementOfLink(parentLink), function (linkElement) {
    return linkElement.dataset && linkElement.dataset.targetTopic === parentLink.dataset.targetTopic && linkElement.dataset.targetSubtopic === parentLink.dataset.targetSubtopic;
  }).forEach(function (redundantParentLink) {
    redundantParentLink.classList.add('canopy-open-link');
  });
}

function moveSelectedSectionClass(sectionElement) {
  Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["forEach"])(document.getElementsByTagName("section"), function (sectionElement) {
    sectionElement.classList.remove('canopy-selected-section');
  });
  sectionElement.classList.add('canopy-selected-section');
}

function hideAllSectionElements() {
  Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["forEach"])(document.getElementsByTagName("section"), function (sectionElement) {
    sectionElement.style.display = 'none';
  });
}

function deselectAllLinks() {
  Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["forEach"])(document.getElementsByTagName("a"), function (linkElement) {
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

/***/ "./src/client/display/update_view.js":
/*!*******************************************!*\
  !*** ./src/client/display/update_view.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var render_fetch_and_render_path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! render/fetch_and_render_path */ "./src/client/render/fetch_and_render_path.js");
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var display_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/helpers */ "./src/client/display/helpers.js");





var updateView = function updateView(pathArray, updateOptions) {
  var _findLowestExtantSect = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["findLowestExtantSectionElementOfPath"])(pathArray),
      lowestExtantSectionElementOfPath = _findLowestExtantSect.lowestExtantSectionElementOfPath,
      pathSuffixToRender = _findLowestExtantSect.pathSuffixToRender;

  var promisedDomTree = Object(render_fetch_and_render_path__WEBPACK_IMPORTED_MODULE_0__["default"])(pathSuffixToRender, pathArray.length - pathSuffixToRender.length);
  promisedDomTree.then(function (domTree) {
    if (domTree) {
      var anchorElement = lowestExtantSectionElementOfPath || helpers_getters__WEBPACK_IMPORTED_MODULE_2__["canopyContainer"];

      if (!Object(display_helpers__WEBPACK_IMPORTED_MODULE_3__["newNodeAlreadyPresent"])(anchorElement, domTree)) {
        anchorElement.appendChild(domTree);
      }
    }

    Object(display_display_path__WEBPACK_IMPORTED_MODULE_1__["default"])(pathArray, updateOptions);
  });
};

/* harmony default export */ __webpack_exports__["default"] = (updateView);

/***/ }),

/***/ "./src/client/helpers/booleans.js":
/*!****************************************!*\
  !*** ./src/client/helpers/booleans.js ***!
  \****************************************/
/*! exports provided: isInRootSection, isATopicRootSection, isPageRootSection, sectionHasNoChildLinks, sectionElementOfPathVisible */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInRootSection", function() { return isInRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isATopicRootSection", function() { return isATopicRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isPageRootSection", function() { return isPageRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionHasNoChildLinks", function() { return sectionHasNoChildLinks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionElementOfPathVisible", function() { return sectionElementOfPathVisible; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");



function isInRootSection(linkElement) {
  return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(linkElement) === Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentRootSection"])();
}

function isATopicRootSection(sectionElement) {
  return sectionElement.dataset.topicName === sectionElement.dataset.subtopicName;
}

function isPageRootSection(sectionElement) {
  return sectionElement.parentNode === helpers_getters__WEBPACK_IMPORTED_MODULE_0__["canopyContainer"];
}

function sectionHasNoChildLinks(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linksOfSectionElement"])(sectionElement).length === 0;
}



/***/ }),

/***/ "./src/client/helpers/getters.js":
/*!***************************************!*\
  !*** ./src/client/helpers/getters.js ***!
  \***************************************/
/*! exports provided: canopyContainer, defaultTopic, sectionElementOfPath, currentSection, currentRootSection, selectedLink, parentLinkOfSection, parentLinksOfSection, childSectionElementOfParentLink, sectionElementOfLink, metadataFromLink, documentTitleFor, findLinkFromMetadata, findLowestExtantSectionElementOfPath, openLinkOfSection, paragraphElementOfSection, linksOfSectionElement, linkAfter, linkBefore, firstChildLinkOfParentLink, lastChildLinkOfParentLink, firstLinkOfSectionElement, lastLinkOfSectionElement, enclosingTopicSectionOfLink, firstSiblingOf, lastSiblingOf, parentLinkOf, siblingOfLinkLike, linkOfSectionLike, linksOfSectionLike, linkOfSectionByTarget, linksOfSectionByTarget, parentElementOfLink, paragraphElementOfLink, forEach */
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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parentLinksOfSection", function() { return parentLinksOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "childSectionElementOfParentLink", function() { return childSectionElementOfParentLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionElementOfLink", function() { return sectionElementOfLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "metadataFromLink", function() { return metadataFromLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentTitleFor", function() { return documentTitleFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLinkFromMetadata", function() { return findLinkFromMetadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLowestExtantSectionElementOfPath", function() { return findLowestExtantSectionElementOfPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openLinkOfSection", function() { return openLinkOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "paragraphElementOfSection", function() { return paragraphElementOfSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linksOfSectionElement", function() { return linksOfSectionElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkAfter", function() { return linkAfter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkBefore", function() { return linkBefore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstChildLinkOfParentLink", function() { return firstChildLinkOfParentLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastChildLinkOfParentLink", function() { return lastChildLinkOfParentLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstLinkOfSectionElement", function() { return firstLinkOfSectionElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastLinkOfSectionElement", function() { return lastLinkOfSectionElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enclosingTopicSectionOfLink", function() { return enclosingTopicSectionOfLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "firstSiblingOf", function() { return firstSiblingOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastSiblingOf", function() { return lastSiblingOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parentLinkOf", function() { return parentLinkOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "siblingOfLinkLike", function() { return siblingOfLinkLike; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkOfSectionLike", function() { return linkOfSectionLike; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linksOfSectionLike", function() { return linksOfSectionLike; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkOfSectionByTarget", function() { return linkOfSectionByTarget; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linksOfSectionByTarget", function() { return linksOfSectionByTarget; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parentElementOfLink", function() { return parentElementOfLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "paragraphElementOfLink", function() { return paragraphElementOfLink; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return forEach; });
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
  return document.querySelector('a.canopy-selected-link');
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

var parentLinksOfSection = function parentLinksOfSection(sectionElement) {
  if (sectionElement.parentNode === canopyContainer) {
    return null;
  }

  return linksOfSectionByTarget(sectionElement.parentNode, sectionElement.dataset.topicName, sectionElement.dataset.subtopicName);
};

var childSectionElementOfParentLink = function childSectionElementOfParentLink(linkElement) {
  return Array.from(parentElementOfLink(linkElement, 'SECTION').childNodes).find(function (childElement) {
    return childElement.tagName === 'SECTION' && childElement.dataset.topicName === linkElement.dataset.targetTopic && childElement.dataset.subtopicName === linkElement.dataset.targetSubtopic;
  });
};

function sectionElementOfLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  var sectionElement = parentElementOfLink(linkElement, 'SECTION');
  return sectionElement;
}

function documentTitleFor(topicName) {
  return topicName;
}

function metadataFromLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  var sectionElement = sectionElementOfLink(linkElement);
  var relativeLinkNumber = Array.from(sectionElement.querySelectorAll(" a[data-text=\"".concat(linkElement.dataset.text, "\"]"))).indexOf(linkElement);
  return {
    sectionElementTopicName: sectionElement.dataset.topicName,
    sectionElementSubtopicName: sectionElement.dataset.subtopicName,
    sectionElementPathDepth: sectionElement.dataset.pathDepth,
    linkText: linkElement.dataset.text,
    relativeLinkNumber: relativeLinkNumber
  };
}

function findLinkFromMetadata(linkSelectionData) {
  return document.querySelectorAll("section[data-topic-name=\"".concat(linkSelectionData.sectionElementTopicName, "\"]") + "[data-subtopic-name=\"".concat(linkSelectionData.sectionElementSubtopicName, "\"]") + "[data-path-depth=\"".concat(linkSelectionData.sectionElementPathDepth, "\"]") + " a[data-text=\"".concat(linkSelectionData.linkText, "\"]"))[linkSelectionData.relativeLinkNumber];
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
  if (!sectionElement) {
    return null;
  }

  return linkOfSectionLike(sectionElement, function (linkElement) {
    return linkElement.classList.contains('canopy-open-link');
  });
}

function paragraphElementOfSection(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  return Array.from(sectionElement.childNodes).find(function (element) {
    return element.tagName === 'P';
  });
}

function linkAfter(linkElement) {
  if (!linkElement) {
    return null;
  }

  var paragraphElement = paragraphElementOfLink(linkElement);
  var links = paragraphElement.querySelectorAll('.canopy-selectable-link');

  if (linkElement !== links[links.length - 1]) {
    return links[Array.prototype.slice.call(links).indexOf(linkElement) + 1];
  } else {
    return null;
  }
}

function parentElementOfLink(linkElement, tagName) {
  var parentElement = linkElement.parentNode;

  while (parentElement.tagName !== tagName) {
    parentElement = parentElement.parentNode;
  }

  return parentElement;
}

function paragraphElementOfLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  return parentElementOfLink(linkElement, 'P');
}

function linkBefore(linkElement) {
  if (!linkElement) {
    return null;
  }

  var paragraphElement = paragraphElementOfLink(linkElement);
  var links = paragraphElement.querySelectorAll('a.canopy-selectable-link');

  if (linkElement !== links[0]) {
    return links[Array.prototype.slice.call(links).indexOf(linkElement) - 1];
  } else {
    return null;
  }
}

function firstChildLinkOfParentLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  var sectionElement = childSectionElementOfParentLink(linkElement);

  if (!sectionElement) {
    return null;
  }

  var array = linksOfSectionElement(sectionElement);
  return array[0];
}

function lastChildLinkOfParentLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  var sectionElement = childSectionElementOfParentLink(linkElement);

  if (!sectionElement) {
    return null;
  }

  var array = linksOfSectionElement(sectionElement);
  return array[array.length - 1];
}

function linksOfSectionElement(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  return linksOfParagraph(paragraphElementOfSection(sectionElement));
}

function linksOfParagraph(paragraphElement) {
  if (!paragraphElement) {
    return null;
  }

  return Array.from(paragraphElement.querySelectorAll('a.canopy-selectable-link'));
}

function firstLinkOfSectionElement(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  return linksOfSectionElement(sectionElement)[0] || null;
}

function lastLinkOfSectionElement(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  var array = linksOfSectionElement(sectionElement);
  return array[array.length - 1] || null;
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
  if (!linkElement) {
    return null;
  }

  var links = linksOfSectionElement(sectionElementOfLink(linkElement));
  return links[0] || linkElement;
}

function lastSiblingOf(linkElement) {
  if (!linkElement) {
    return null;
  }

  var links = linksOfSectionElement(sectionElementOfLink(linkElement));
  return links[links.length - 1] || null;
}

function parentLinkOf(linkElement) {
  if (!linkElement) {
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
  return linksOfSectionElement(sectionElement).find(condition);
}

function linksOfSectionLike(sectionElement, condition) {
  return linksOfSectionElement(sectionElement).filter(condition);
}

function linkOfSectionByTarget(sectionElement, topicName, subtopicName) {
  return linkOfSectionLike(sectionElement, function (linkElement) {
    return linkElement.dataset.targetTopic === topicName && linkElement.dataset.targetSubtopic === subtopicName;
  });
}

function linksOfSectionByTarget(sectionElement, topicName, subtopicName) {
  return linksOfSectionLike(sectionElement, function (linkElement) {
    return linkElement.dataset.targetTopic === topicName && linkElement.dataset.targetSubtopic === subtopicName;
  });
}

function forEach(list, callback) {
  for (var i = 0; i < list.length; i++) {
    callback(list[i]);
  }
}



/***/ }),

/***/ "./src/client/helpers/identifiers.js":
/*!*******************************************!*\
  !*** ./src/client/helpers/identifiers.js ***!
  \*******************************************/
/*! exports provided: slugFor, htmlIdFor, removeMarkdownTokens */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "slugFor", function() { return slugFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "htmlIdFor", function() { return htmlIdFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeMarkdownTokens", function() { return removeMarkdownTokens; });
var slugFor = function slugFor(string) {
  if (!string) {
    return string;
  }

  return string.replace(/ /g, '_');
};

var htmlIdFor = function htmlIdFor(topicName, subtopicName) {
  return '_canopy_' + slugFor(topicName + '_' + subtopicName);
};

function removeMarkdownTokens(string) {
  return string.replace(/([^\\]|^)_/g, '$1').replace(/([^\\]|^)\*/g, '$1').replace(/([^\\]|^)`/g, '$1').replace(/([^\\]|^)~/g, '$1');
}



/***/ }),

/***/ "./src/client/history/helpers.js":
/*!***************************************!*\
  !*** ./src/client/history/helpers.js ***!
  \***************************************/
/*! exports provided: linkSelectionPresentInEvent, saveCurrentLinkSelectionInHistoryStack, priorLinkSelectionDataFromSession, priorLinkSelectionData, storeLinkSelectionInSession */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkSelectionPresentInEvent", function() { return linkSelectionPresentInEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "saveCurrentLinkSelectionInHistoryStack", function() { return saveCurrentLinkSelectionInHistoryStack; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "priorLinkSelectionDataFromSession", function() { return priorLinkSelectionDataFromSession; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "priorLinkSelectionData", function() { return priorLinkSelectionData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "storeLinkSelectionInSession", function() { return storeLinkSelectionInSession; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var path_helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path/helpers */ "./src/client/path/helpers.js");



function saveCurrentLinkSelectionInHistoryStack(linkElement) {
  history.replaceState(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement), document.title, window.location.href);
}

function linkSelectionPresentInEvent(e) {
  return e.state && e.state.targetTopic;
}

function priorLinkSelectionDataFromSession() {
  return JSON.parse(sessionStorage.getItem(Object(path_helpers__WEBPACK_IMPORTED_MODULE_1__["pathStringFor"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_1__["parsePathString"])())));
}

function stateIfPresentInHistoryStack() {
  return history.state && history.state.targetTopic && history.state;
}

function priorLinkSelectionData() {
  return stateIfPresentInHistoryStack() || priorLinkSelectionDataFromSession();
}

function storeLinkSelectionInSession(linkElement) {
  var linkData = linkElement && JSON.stringify(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement));
  linkData && sessionStorage.setItem(location.pathname + location.hash, linkData);
}



/***/ }),

/***/ "./src/client/history/register_pop_state_listener.js":
/*!***********************************************************!*\
  !*** ./src/client/history/register_pop_state_listener.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var history_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! history/helpers */ "./src/client/history/helpers.js");
/* harmony import */ var display_update_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! display/update_view */ "./src/client/display/update_view.js");
/* harmony import */ var path_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/helpers */ "./src/client/path/helpers.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");






function registerPopStateListener() {
  window.addEventListener('popstate', function (e) {
    Object(history_helpers__WEBPACK_IMPORTED_MODULE_0__["saveCurrentLinkSelectionInHistoryStack"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["selectedLink"])());
    var newLinkSelectionData = Object(history_helpers__WEBPACK_IMPORTED_MODULE_0__["linkSelectionPresentInEvent"])(e) ? e.state : null;
    Object(display_update_view__WEBPACK_IMPORTED_MODULE_1__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["parsePathString"])(), {
      linkSelectionData: newLinkSelectionData || Object(history_helpers__WEBPACK_IMPORTED_MODULE_0__["priorLinkSelectionDataFromSession"])(),
      originatesFromPopStateEvent: true
    });
  });
}

/* harmony default export */ __webpack_exports__["default"] = (registerPopStateListener);

/***/ }),

/***/ "./src/client/keys/key_handlers.js":
/*!*****************************************!*\
  !*** ./src/client/keys/key_handlers.js ***!
  \*****************************************/
/*! exports provided: moveUpward, moveDownward, moveLeftward, moveRightward, moveDownOrRedirect, depthFirstSearch, reverseDepthFirstSearch, goToEnclosingTopic, goToParentOfEnclosingTopic */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveUpward", function() { return moveUpward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveDownward", function() { return moveDownward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveLeftward", function() { return moveLeftward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveRightward", function() { return moveRightward; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveDownOrRedirect", function() { return moveDownOrRedirect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "depthFirstSearch", function() { return depthFirstSearch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reverseDepthFirstSearch", function() { return reverseDepthFirstSearch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "goToEnclosingTopic", function() { return goToEnclosingTopic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "goToParentOfEnclosingTopic", function() { return goToParentOfEnclosingTopic; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var helpers_booleans__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/booleans */ "./src/client/helpers/booleans.js");
/* harmony import */ var path_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/helpers */ "./src/client/path/helpers.js");
/* harmony import */ var display_update_view__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/update_view */ "./src/client/display/update_view.js");
/* harmony import */ var path_set_path__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! path/set_path */ "./src/client/path/set_path.js");
/* harmony import */ var display_helpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! display/helpers */ "./src/client/display/helpers.js");








function moveUpward() {
  var pathArray = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["parsePathString"])();
  var linkElement;

  if (selectedLinkIsOpenGlobalLink()) {
    // Handle global link with inlined child with no links
    pathArray.pop();
    linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
  } else if (Object(helpers_booleans__WEBPACK_IMPORTED_MODULE_1__["isPageRootSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()))) {
    var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
    pathArray = [[sectionElement.dataset.topicName, sectionElement.dataset.topicName]];
    linkElement = null;
  } else if (Object(helpers_booleans__WEBPACK_IMPORTED_MODULE_1__["isATopicRootSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()))) {
    pathArray.pop();
    linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  } else {
    linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
  }

  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, {
    linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement)
  });
}

function selectedLinkIsOpenGlobalLink() {
  var currentSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])();
  var sectionElementOfSelectedLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  return currentSectionElement !== sectionElementOfSelectedLink && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global';
}

function moveDownward(cycle) {
  var pathArray = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["parsePathString"])();

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global') {
    // Handle open global link with no children
    if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.contains('canopy-open-link')) {
      return;
    }

    pathArray.push([Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic]);
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, {
      selectALink: true
    });
  }

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'local') {
    var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, {
      linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement)
    });
  }

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'redundant-local') {
    var _finalTuple = pathArray.pop();

    var _newTuple = [_finalTuple[0], Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic];
    pathArray.push(_newTuple);

    var _linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstLinkOfSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfPath"])(pathArray));

    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, {
      linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(_linkElement)
    });
  }
}

function moveLeftward() {
  var currentSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])();
  var sectionElementOfSelectedLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var pathArray = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["parsePathString"])(); // handle left on opened global link with no child links

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkBefore"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastSiblingOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);
  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, {
    linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement)
  });
}

function moveRightward() {
  var currentSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])();
  var sectionElementOfSelectedLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var pathArray = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["parsePathString"])(); // handle right on opened global link with no child links

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkAfter"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstSiblingOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);
  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, {
    linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement)
  });
}

function moveDownOrRedirect(newTab) {
  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'local' || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'redundant-parent') {
    return moveDownward(false);
  } else if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global') {
    var pathArray = [[Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic]];

    if (newTab) {
      var pathString = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathStringFor"])(pathArray);
      return window.open(location.origin + pathString, '_blank');
    }

    Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, {
      selectALink: true
    });
  } else if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'url') {
    if (newTab) {
      return window.open(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().href, '_blank');
    } else {
      window.location = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().href;
    }
  }
}

function depthFirstSearch(dfsDirectionInteger, enterGlobalLinks, closeGlobalLinks) {
  var previouslySelectedLinkClassName = dfsDirectionInteger === 1 ? 'canopy-dfs-previously-selected-link' : 'canopy-reverse-dfs-previously-selected-link';
  var previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName); // Enter a global link

  var lastChildLink = dfsDirectionInteger === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastLinkOfSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["childSectionElementOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])())) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstLinkOfSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["childSectionElementOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));
  var targetTopic = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic;
  var pathToCurrentLink = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));
  var newPathArray = pathToCurrentLink.concat([[targetTopic, targetTopic]]);
  var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfPath"])(pathToCurrentLink);
  var alreadyVisitedGlobalLinkIfChildren = !lastChildLink || !previouslySelectedLink || previouslySelectedLink !== lastChildLink;
  var alreadyVisitedGlobalLinkIfNoChildren = previouslySelectedLink !== Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
  var alreadyVisitedGlobalLink = alreadyVisitedGlobalLinkIfChildren && alreadyVisitedGlobalLinkIfNoChildren;
  var childSectionIsNotAlreadyVisible = !sectionElement || !Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["openLinkOfSection"])(sectionElement);
  var nextChildLink = dfsDirectionInteger === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstLinkOfSectionElement"])(sectionElement) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastLinkOfSectionElement"])(sectionElement);

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && enterGlobalLinks && alreadyVisitedGlobalLink && childSectionIsNotAlreadyVisible) {
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(newPathArray, {
      linkSelectionData: nextChildLink,
      postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
    });
  } // Close a global link with no children


  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && closeGlobalLinks && Object(helpers_booleans__WEBPACK_IMPORTED_MODULE_1__["sectionHasNoChildLinks"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["childSectionElementOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])())) && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.contains('canopy-open-link')) {
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["parsePathString"])().slice(0, -1), {
      linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()),
      postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
    });
  } // Enter a parent link


  var lastChildToVisit = dfsDirectionInteger === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var firstChildToVisit = dfsDirectionInteger === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());

  if (firstChildToVisit && (!previouslySelectedLink || previouslySelectedLink !== lastChildToVisit) && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type !== 'global' && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type !== 'redundant-local') {
    var nextLink = firstChildToVisit;
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(nextLink)), {
      linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(nextLink),
      postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
    });
  } // Move to the next sibling


  var nextSiblingToVisit = dfsDirectionInteger === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkAfter"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkBefore"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());

  if (nextSiblingToVisit) {
    var _nextLink = nextSiblingToVisit;
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(_nextLink)), {
      linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(_nextLink),
      postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
    });
  } // Move to parent


  var parentLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));

  if (parentLink && parentLink.dataset.type !== 'global') {
    var _nextLink2 = parentLink;
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(_nextLink2)), {
      linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(_nextLink2),
      postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
    });
  } // Move to parent link that is a global link


  var globalParentLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));

  if (globalParentLink && globalParentLink.dataset.type === 'global' && closeGlobalLinks) {
    var _nextLink3 = globalParentLink;
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(_nextLink3)), {
      linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(_nextLink3),
      postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
    });
  }
}

function updateDfsClassesCallback(dfsDirectionInteger) {
  return function () {
    var previouslySelectedLinkClassName = dfsDirectionInteger === 1 ? 'canopy-dfs-previously-selected-link' : 'canopy-reverse-dfs-previously-selected-link';
    var previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName);

    if (previouslySelectedLink) {
      previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
    }

    Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])() && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.add(previouslySelectedLinkClassName);
    var preserveForwardDfsClass = dfsDirectionInteger === 1;
    var preserveBackwardsDfsClass = dfsDirectionInteger === 2;
    Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["forEach"])(document.getElementsByTagName("a"), function (linkElement) {
      !preserveForwardDfsClass && linkElement.classList.remove('canopy-dfs-previously-selected-link');
      !preserveBackwardsDfsClass && linkElement.classList.remove('canopy-reverse-dfs-previously-selected-link');
    });
  };
}

function goToEnclosingTopic() {
  var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["enclosingTopicSectionOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["openLinkOfSection"])(sectionElement) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(sectionElement), {
    linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement)
  });
}

function goToParentOfEnclosingTopic() {
  var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["enclosingTopicSectionOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());

  if (sectionElement.parentNode !== helpers_getters__WEBPACK_IMPORTED_MODULE_0__["canopyContainer"]) {
    sectionElement = sectionElement.parentNode;
  }

  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["openLinkOfSection"])(sectionElement);
  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(sectionElement), {
    linkSelectionData: Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement)
  });
}



/***/ }),

/***/ "./src/client/keys/register_key_listeners.js":
/*!***************************************************!*\
  !*** ./src/client/keys/register_key_listeners.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! keys/key_handlers */ "./src/client/keys/key_handlers.js");
/* harmony import */ var display_update_view__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! display/update_view */ "./src/client/display/update_view.js");
/* harmony import */ var path_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! path/helpers */ "./src/client/path/helpers.js");





var registerKeyListeners = function registerKeyListeners() {
  window.addEventListener('keydown', function (e) {
    var modifiers = (e.metaKey ? 'command-' : '') + (e.altKey ? 'alt-' : '') + (e.ctrlKey ? 'ctrl-' : '') + (e.shiftKey ? 'shift-' : '');
    var keyName = keyNames[e.keyCode];
    var shortcutName = modifiers + keyName;

    if (keyName === 'tab') {
      e.preventDefault();
    }

    if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) {
      (shortcutRelationships[shortcutName] || function () {})();
    } else if (shortcutRelationships[shortcutName]) {
      Object(display_update_view__WEBPACK_IMPORTED_MODULE_2__["default"])(Object(path_helpers__WEBPACK_IMPORTED_MODULE_3__["parsePathString"])(), {
        selectALink: true
      });
    }
  });
};

var shortcutRelationships = {
  'left': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveLeftward"],
  'up': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveUpward"],
  'down': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveDownward"],
  'right': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveRightward"],
  'h': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveLeftward"],
  'j': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveDownward"],
  'k': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveUpward"],
  'l': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveRightward"],
  'escape': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["goToParentOfEnclosingTopic"],
  'shift-escape': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["goToEnclosingTopic"],
  'return': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveDownOrRedirect"],
  'command-return': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["moveDownOrRedirect"].bind(null, true),
  'tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 1, false, false),
  'alt-tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 1, true, true),
  '`': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 1, false, true),
  'shift-tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 2, false, false),
  'alt-shift-tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 2, true, true),
  'shift-`': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 2, false, true)
};
var keyNames = {
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
  13: 'return',
  9: 'tab',
  27: 'escape',
  192: '`',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5'
};
/* harmony default export */ __webpack_exports__["default"] = (registerKeyListeners);

/***/ }),

/***/ "./src/client/path/helpers.js":
/*!************************************!*\
  !*** ./src/client/path/helpers.js ***!
  \************************************/
/*! exports provided: pathOrDefaultTopic, pathForSectionElement, parsePathString, pathStringFor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pathOrDefaultTopic", function() { return pathOrDefaultTopic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pathForSectionElement", function() { return pathForSectionElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parsePathString", function() { return parsePathString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pathStringFor", function() { return pathStringFor; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");



function pathOrDefaultTopic() {
  var pathArray = parsePathString();

  if (pathArray.length > 0) {
    return pathArray;
  } else {
    return [[helpers_getters__WEBPACK_IMPORTED_MODULE_0__["defaultTopic"], helpers_getters__WEBPACK_IMPORTED_MODULE_0__["defaultTopic"]]];
  }
}

function pathForSectionElement(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  var pathArray = [];
  var currentElement = sectionElement;

  while (currentElement !== helpers_getters__WEBPACK_IMPORTED_MODULE_0__["canopyContainer"]) {
    var currentTopic = currentElement.dataset.topicName;
    pathArray.unshift([currentTopic, currentElement.dataset.subtopicName]);

    while (currentElement.dataset.topicName === currentTopic) {
      currentElement = currentElement.parentNode;
    }
  }

  return pathArray;
}

var parsePathString = function parsePathString(pathStringArg) {
  var pathString = pathStringArg || window.location.pathname + window.location.hash;
  var slashSeparatedUnits = pathString.replace(/_/g, ' ').split('/').filter(function (string) {
    return string !== '';
  });
  slashSeparatedUnits = fixAccidentalSeparationofTopicAndSubtopic(pathString, slashSeparatedUnits);
  return slashSeparatedUnits.map(function (slashSeparatedUnit) {
    var match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
    return [match[1] || match[2] || null, match[2] || match[1] || null];
  }).filter(function (tuple) {
    return tuple[0] !== null;
  });
};

function fixAccidentalSeparationofTopicAndSubtopic(pathString, slashSeparatedUnits) {
  // eg /Topic/#Subtopic/A#B  -> /Topic#Subtopic/A#B
  if (pathString.match(/\/#\w+/)) {
    for (var i = 1; i < slashSeparatedUnits.length; i++) {
      if (slashSeparatedUnits[i].match(/^#/)) {
        if (!slashSeparatedUnits[i - 1].match(/#/)) {
          // eg /Topic/#Subtopic -> /Topic#Subtopic
          var newItem = slashSeparatedUnits[i - 1] + slashSeparatedUnits[i];
          var newArray = slashSeparatedUnits.slice(0, i - 1).concat([newItem]).concat(slashSeparatedUnits.slice(i + 1));
          return newArray;
        } else {
          // eg /Topic#Subtopic/#Subtopic2 -> /Topic#Subtopic/Subtopic2
          var _newItem = slashSeparatedUnits[i].slice(1);

          var _newArray = slashSeparatedUnits.slice(0, i).concat([_newItem]).concat(slashSeparatedUnits.slice(i + 1));

          return _newArray;
        }
      }
    }
  }

  return slashSeparatedUnits;
}

function pathStringFor(pathArray) {
  return '/' + pathArray.map(function (tuple) {
    return Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_1__["slugFor"])(tuple[0]) + (tuple[1] && tuple[1] !== tuple[0] ? '#' + Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_1__["slugFor"])(tuple[1]) : '');
  }).join('/');
}



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
/* harmony import */ var path_helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path/helpers */ "./src/client/path/helpers.js");



var setPath = function setPath(newPathArray) {
  var oldPathArray = Object(path_helpers__WEBPACK_IMPORTED_MODULE_1__["parsePathString"])();
  var documentTitle = newPathArray[0][0];
  var historyApiFunction = Object(path_helpers__WEBPACK_IMPORTED_MODULE_1__["pathStringFor"])(newPathArray) === Object(path_helpers__WEBPACK_IMPORTED_MODULE_1__["pathStringFor"])(oldPathArray) ? replaceState : pushState;
  historyApiFunction(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()), documentTitle, Object(path_helpers__WEBPACK_IMPORTED_MODULE_1__["pathStringFor"])(newPathArray));
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

/***/ "./src/client/render/block_renderers.js":
/*!**********************************************!*\
  !*** ./src/client/render/block_renderers.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var render_render_token_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! render/render_token_element */ "./src/client/render/render_token_element.js");

var BlockRenderers = {
  'text': renderTextBlock,
  'code': renderCodeBlock,
  'quote': renderQuoteBlock,
  'list': renderListBlock,
  'table': renderTableBlock,
  'footnote': renderFootnoteBlock
};

function renderTextBlock(blockObject, renderContext) {
  var lineSpans = [];
  blockObject.tokensByLine.forEach(function (tokensOfLine, lineNumber) {
    var lineSpan = document.createElement('SPAN');
    lineSpan.classList.add('canopy-text-span');
    lineSpans.push(lineSpan);
    tokensOfLine.forEach(function (token) {
      var tokenElement = Object(render_render_token_element__WEBPACK_IMPORTED_MODULE_0__["default"])(token, renderContext);
      lineSpan.appendChild(tokenElement);
    });
  });
  return lineSpans;
}

function renderCodeBlock(blockObject, renderContext) {
  var preElement = document.createElement('PRE');
  var codeBlockElement = document.createElement('CODE');
  preElement.appendChild(codeBlockElement);
  blockObject.lines.forEach(function (lineText, lineNumber) {
    lineNumber > 0 && codeBlockElement.appendChild(document.createElement('BR'));
    var lineTextNode = document.createTextNode(lineText);
    codeBlockElement.appendChild(lineTextNode);
  });
  return [preElement];
}

function renderQuoteBlock(blockObject, renderContext) {
  var blockQuoteElement = document.createElement('BLOCKQUOTE');
  blockObject.tokensByLine.forEach(function (tokensOfLine, lineNumber) {
    lineNumber > 0 && blockQuoteElement.appendChild(document.createElement('br'));
    tokensOfLine.forEach(function (token) {
      var tokenElement = Object(render_render_token_element__WEBPACK_IMPORTED_MODULE_0__["default"])(token, renderContext);
      blockQuoteElement.appendChild(tokenElement);
    });
  });
  return [blockQuoteElement];
}

function renderListBlock(blockObject, renderContext) {
  return renderListNodes(blockObject.topLevelNodes);

  function renderListNodes(listNodeObjects) {
    var listElement = blockObject.topLevelNodes[0].ordered ? document.createElement('OL') : document.createElement('UL');
    listElement.setAttribute('type', listNodeObjects[0].ordinal);
    listNodeObjects.forEach(function (listNodeObject) {
      var listItemElement = document.createElement('LI');
      var tokenElementsOfLine = listNodeObject.tokensOfLine.forEach(function (token) {
        var tokenElement = Object(render_render_token_element__WEBPACK_IMPORTED_MODULE_0__["default"])(token, renderContext);
        listItemElement.appendChild(tokenElement);
      });

      if (listNodeObject.children.length > 0) {
        var childList = renderListNodes(listNodeObject.children);
        listItemElement.appendChild(childList);
      }

      listElement.appendChild(listItemElement);
    });
    return listElement;
  }
}

function renderTableBlock(blockObject, renderContext) {
  var tableElement = document.createElement('TABLE');
  blockObject.tokensByCellByRow.forEach(function (tokensByCellOfRow, rowIndex) {
    var tableRowElement = document.createElement('TR');
    tokensByCellOfRow.forEach(function (tokensOfCell) {
      var tableCellElement = document.createElement('TD');
      tokensOfCell.forEach(function (token) {
        var tokenElement = Object(render_render_token_element__WEBPACK_IMPORTED_MODULE_0__["default"])(token, renderContext);
        tableCellElement.appendChild(tokenElement);
      });
      tableRowElement.appendChild(tableCellElement);
    });
    tableElement.appendChild(tableRowElement);
  });
  return [tableElement];
}

function renderFootnoteBlock(blockObject, renderContext) {
  var horizonalRule = document.createElement('HR');
  horizonalRule.classList.add('footnote-rule');
  var footnoteSpans = Array.prototype.concat.apply([], blockObject.footnoteObjects.map(function (footnoteObject, index) {
    var footnoteSpan = document.createElement('SPAN');
    footnoteSpan.classList.add('footnote-span');
    var textNode = document.createTextNode(footnoteObject.superscript + '. ');
    footnoteSpan.appendChild(textNode);
    footnoteObject.tokens.forEach(function (token) {
      var tokenElement = Object(render_render_token_element__WEBPACK_IMPORTED_MODULE_0__["default"])(token, renderContext);
      footnoteSpan.appendChild(tokenElement);
    });
    var result = [];
    index > 0 && result.push(document.createElement('BR'));
    result.push(footnoteSpan);
    return result;
  }));
  return [horizonalRule].concat(footnoteSpans);
}

/* harmony default export */ __webpack_exports__["default"] = (BlockRenderers);

/***/ }),

/***/ "./src/client/render/click_handlers.js":
/*!*********************************************!*\
  !*** ./src/client/render/click_handlers.js ***!
  \*********************************************/
/*! exports provided: onParentLinkClick, onGlobalLinkClick */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onParentLinkClick", function() { return onParentLinkClick; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onGlobalLinkClick", function() { return onGlobalLinkClick; });
/* harmony import */ var display_update_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! display/update_view */ "./src/client/display/update_view.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var path_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/helpers */ "./src/client/path/helpers.js");




var onParentLinkClick = function onParentLinkClick(topicName, targetSubtopic, linkElement) {
  return function (e) {
    e.preventDefault(); // If the link's child is already selected, display the link's section

    var pathArray = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["sectionElementOfLink"])(linkElement));

    if (linkElement.classList.contains('canopy-open-link')) {
      pathArray.pop();
      var newTuple = [linkElement.dataset.enclosingTopic, linkElement.dataset.enclosingSubtopic];
      pathArray.push(newTuple);
      Object(display_update_view__WEBPACK_IMPORTED_MODULE_0__["default"])(pathArray);
    } else {
      pathArray.pop();
      var _newTuple = [topicName, targetSubtopic];
      pathArray.push(_newTuple);
      Object(display_update_view__WEBPACK_IMPORTED_MODULE_0__["default"])(pathArray);
    }
  };
};

var onGlobalLinkClick = function onGlobalLinkClick(targetTopic, targetSubtopic, linkElement) {
  return function (e) {
    e.preventDefault();

    if (e.altKey) {
      var pathArray = Object(path_helpers__WEBPACK_IMPORTED_MODULE_2__["pathForSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["sectionElementOfLink"])(linkElement));

      if (linkElement.classList.contains('canopy-open-link')) {
        return Object(display_update_view__WEBPACK_IMPORTED_MODULE_0__["default"])(pathArray);
      } else {
        pathArray.push([linkElement.dataset.targetTopic, linkElement.dataset.targetSubtopic]);
        return Object(display_update_view__WEBPACK_IMPORTED_MODULE_0__["default"])(pathArray);
      }
    } else {
      Object(display_update_view__WEBPACK_IMPORTED_MODULE_0__["default"])([[targetTopic, targetSubtopic]]);
    }
  };
};



/***/ }),

/***/ "./src/client/render/fetch_and_render_path.js":
/*!****************************************************!*\
  !*** ./src/client/render/fetch_and_render_path.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var render_render_dom_tree__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! render/render_dom_tree */ "./src/client/render/render_dom_tree.js");
/* harmony import */ var requests_request_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! requests/request_json */ "./src/client/requests/request_json.js");



var fetchAndRenderPath = function fetchAndRenderPath(pathArray, pathDepth) {
  if (pathArray.length === 0) {
    return Promise.resolve(null);
  }

  var topicName = pathArray[0][0];
  var uponResponsePromise = Object(requests_request_json__WEBPACK_IMPORTED_MODULE_1__["default"])(topicName);
  return uponResponsePromise.then(function (dataObject) {
    var paragraphsBySubtopic = dataObject.paragraphsBySubtopic,
        topicDisplayName = dataObject.topicDisplayName;
    return Object(render_render_dom_tree__WEBPACK_IMPORTED_MODULE_0__["default"])({
      topicName: pathArray[0][0],
      topicDisplayName: topicDisplayName,
      subtopicName: pathArray[0][0],
      pathArray: pathArray,
      paragraphsBySubtopic: paragraphsBySubtopic,
      subtopicsAlreadyRendered: {},
      pathDepth: pathDepth
    });
  });
};

/* harmony default export */ __webpack_exports__["default"] = (fetchAndRenderPath);

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
/* harmony import */ var path_set_path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/set_path */ "./src/client/path/set_path.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var render_fetch_and_render_path__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! render/fetch_and_render_path */ "./src/client/render/fetch_and_render_path.js");
/* harmony import */ var render_block_renderers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! render/block_renderers */ "./src/client/render/block_renderers.js");







function renderDomTree(renderContext) {
  var subtopicName = renderContext.subtopicName,
      paragraphsBySubtopic = renderContext.paragraphsBySubtopic;
  var sectionElement = createNewSectionElement(renderContext);
  renderContext.subtopicsAlreadyRendered[subtopicName] = true;
  renderContext.promises = [];
  renderContext.parentLinkSubtreeCallback = generateParentLinkSubtreeCallback(sectionElement, renderContext);
  renderContext.globalLinkSubtreeCallback = generateGlobalLinkSubtreeCallback(sectionElement, renderContext);
  var blocksOfParagraph = paragraphsBySubtopic[subtopicName];
  var blockElements = renderElementsForBlocks(blocksOfParagraph, renderContext);
  blockElements.forEach(function (blockElement) {
    Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["paragraphElementOfSection"])(sectionElement).appendChild(blockElement);
  });
  return Promise.all(renderContext.promises).then(function (_) {
    return sectionElement;
  });
}

function generateIsSubtopicAlreadyRenderedCallback(subtopicsAlreadyRendered) {
  return function (targetSubtopic) {
    return subtopicsAlreadyRendered.hasOwnProperty(targetSubtopic);
  };
}

function generateParentLinkSubtreeCallback(sectionElement, renderContext) {
  return function (token) {
    var promisedSubtree = renderDomTree(Object.assign({}, renderContext, {
      subtopicName: token.targetSubtopic
    }));
    promisedSubtree.then(function (subtree) {
      sectionElement.appendChild(subtree);
    });
    renderContext.promises.push(promisedSubtree);
  };
}

function generateGlobalLinkSubtreeCallback(sectionElement, renderContext) {
  var pathArray = renderContext.pathArray,
      pathDepth = renderContext.pathDepth,
      promises = renderContext.promises;
  return function (token) {
    if (subtreeAlreadyRenderedForPriorGlobalLinkInParagraph(sectionElement, token)) {
      return;
    }

    var pathArrayForSubtree = pathArray.slice(1);
    var pathDepthOfSubtree = pathDepth + 1;
    var whenTopicTreeRenders = Object(render_fetch_and_render_path__WEBPACK_IMPORTED_MODULE_4__["default"])(pathArrayForSubtree, pathDepthOfSubtree);
    var whenTopicTreeAppended = whenTopicTreeRenders.then(function (topicTree) {
      sectionElement.appendChild(topicTree);
    });
    promises.push(whenTopicTreeAppended);
  };
}

function createNewSectionElement(renderContext) {
  var topicName = renderContext.topicName,
      subtopicName = renderContext.subtopicName,
      topicDisplayName = renderContext.topicDisplayName,
      pathDepth = renderContext.pathDepth;
  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');
  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.topicDisplayName = topicDisplayName;
  sectionElement.dataset.subtopicName = subtopicName;
  sectionElement.dataset.pathDepth = pathDepth;

  if (topicName === subtopicName) {
    pathDepth > 0 && sectionElement.prepend(document.createElement('hr'));
    sectionElement.classList.add('canopy-topic-section');
  }

  return sectionElement;
}

function subtreeAlreadyRenderedForPriorGlobalLinkInParagraph(sectionElement, token) {
  return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["linkOfSectionByTarget"])(sectionElement, token.targetTopic, token.targetSubtopic);
}

function renderElementsForBlocks(blocksOfParagraph, renderContext) {
  var elementArray = [];
  blocksOfParagraph.forEach(function (blockObject) {
    var renderer = render_block_renderers__WEBPACK_IMPORTED_MODULE_5__["default"][blockObject.type];
    var blockElements = renderer(blockObject, renderContext);
    elementArray = elementArray.concat(blockElements);
  });
  return elementArray;
}

/* harmony default export */ __webpack_exports__["default"] = (renderDomTree);

/***/ }),

/***/ "./src/client/render/render_styled_text.js":
/*!*************************************************!*\
  !*** ./src/client/render/render_styled_text.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function renderStyledText(text) {
  var buffer = '';
  var escaped = false;
  var styles = {
    B: false,
    I: false,
    S: false,
    CODE: false
  };
  var stylesByText = {
    '_': 'I',
    '*': 'B',
    '~': 'S',
    '`': 'CODE'
  };
  var elements = [];

  for (var i = 0; i < text.length; i++) {
    if (!escaped && ['_', '*', '~', '`'].includes(text[i])) {
      (function () {
        var textNode = document.createTextNode(buffer);
        buffer = '';
        var styleElementHead = void 0;
        var styleElementTail = void 0;
        Object.keys(styles).forEach(function (styleKey) {
          if (styles[styleKey]) {
            var element = document.createElement(styleKey);
            styleElementTail && styleElementTail.appendChild(element);
            styleElementHead = styleElementHead || element;
            styleElementTail = element;
          }
        });

        if (styleElementTail) {
          styleElementTail.appendChild(textNode);
          elements.push(styleElementHead);
        } else {
          elements.push(textNode);
        }

        styles[stylesByText[text[i]]] = !styles[stylesByText[text[i]].toUpperCase()];
      })();
    } else if (!escaped && text[i] === '\\') {
      escaped = true;
    } else {
      buffer += text[i];
      escaped = false;
    }
  }

  if (buffer) {
    var textNode = document.createTextNode(buffer);
    elements.push(textNode);
  }

  return elements;
}

/* harmony default export */ __webpack_exports__["default"] = (renderStyledText);

/***/ }),

/***/ "./src/client/render/render_token_element.js":
/*!***************************************************!*\
  !*** ./src/client/render/render_token_element.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");
/* harmony import */ var render_click_handlers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! render/click_handlers */ "./src/client/render/click_handlers.js");
/* harmony import */ var assets_external_link_icon_icon_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! assets/external_link_icon/icon.svg */ "./src/client/assets/external_link_icon/icon.svg");
/* harmony import */ var assets_external_link_icon_icon_svg__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(assets_external_link_icon_icon_svg__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var render_render_styled_text__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! render/render_styled_text */ "./src/client/render/render_styled_text.js");





function renderTokenElement(token, renderContext) {
  if (token.type === 'text') {
    return renderTextToken(token);
  } else if (token.type === 'local') {
    return renderParentLink(token, renderContext);
  } else if (token.type === 'global') {
    return renderGlobalLink(token, renderContext);
  } else if (token.type === 'url') {
    return renderLinkLiteral(token);
  } else if (token.type === 'image') {
    return renderImage(token);
  } else if (token.type === 'html') {
    return renderHtml(token);
  } else if (token.type === 'footnote') {
    return renderFootnoteSymbol(token);
  }
}

function renderTextToken(token) {
  var spanElement = document.createElement('SPAN');
  var styleElements = Object(render_render_styled_text__WEBPACK_IMPORTED_MODULE_3__["default"])(token.text);
  appendElementsToParent(styleElements, spanElement);
  return spanElement;
}

function renderParentLink(token, renderContext) {
  var subtopicsAlreadyRendered = renderContext.subtopicsAlreadyRendered,
      parentLinkSubtreeCallback = renderContext.parentLinkSubtreeCallback;

  if (!subtopicsAlreadyRendered.hasOwnProperty(token.targetSubtopic)) {
    parentLinkSubtreeCallback(token);
    return renderRegularParentLink(token);
  } else {
    return renderRedundantParentLink(token);
  }
}

function renderRegularParentLink(token) {
  var linkElement = renderSharedParentLinkBase(token);
  linkElement.classList.add('canopy-local-link');
  linkElement.dataset.type = 'local';
  linkElement.dataset.urlSubtopic = token.targetSubtopic;
  linkElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetTopic), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetSubtopic));
  return linkElement;
}

function renderRedundantParentLink(token) {
  var linkElement = renderSharedParentLinkBase(token);
  linkElement.classList.add('canopy-redundant-local-link');
  linkElement.dataset.type = 'redundant-local';
  linkElement.dataset.urlSubtopic = token.enclosingSubtopic;
  linkElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.enclosingTopic), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.enclosingSubtopic));
  return linkElement;
}

function renderSharedParentLinkBase(token) {
  var styleElements = Object(render_render_styled_text__WEBPACK_IMPORTED_MODULE_3__["default"])(token.text);
  var linkElement = document.createElement('a');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;
  appendElementsToParent(styleElements, linkElement);
  linkElement.addEventListener('click', Object(render_click_handlers__WEBPACK_IMPORTED_MODULE_1__["onParentLinkClick"])(token.targetTopic, token.targetSubtopic, linkElement));
  return linkElement;
}

function renderGlobalLink(token, renderContext) {
  var pathArray = renderContext.pathArray,
      subtopicName = renderContext.subtopicName,
      globalLinkSubtreeCallback = renderContext.globalLinkSubtreeCallback;
  var linkElement = createGlobalLinkElement(token, pathArray);

  if (globalLinkIsOpen(linkElement, pathArray, subtopicName)) {
    globalLinkSubtreeCallback(token);
  }

  return linkElement;
}

function createGlobalLinkElement(token) {
  var styleElements = Object(render_render_styled_text__WEBPACK_IMPORTED_MODULE_3__["default"])(token.text);
  var linkElement = document.createElement('a');
  appendElementsToParent(styleElements, linkElement);
  linkElement.classList.add('canopy-global-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'global';
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.urlSubtopic = token.enclosingSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;
  linkElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetTopic), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetSubtopic));
  linkElement.addEventListener('click', Object(render_click_handlers__WEBPACK_IMPORTED_MODULE_1__["onGlobalLinkClick"])(token.targetTopic, token.targetSubtopic, linkElement));
  return linkElement;
}

function globalLinkIsOpen(linkElement, pathArray, subtopicName) {
  var subtopicContainingOpenGlobalReference = pathArray[0][1];
  var openGlobalLinkExists = pathArray[1];
  var openGlobalLinkTargetTopic = pathArray[1] && pathArray[1][0];
  var openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;
  return openGlobalLinkExists && linkElement.dataset.targetTopic === openGlobalLinkTargetTopic && linkElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic && subtopicName === subtopicContainingOpenGlobalReference;
}

function renderLinkLiteral(token) {
  var linkSpan = document.createElement('SPAN');
  var linkElement = document.createElement('a');
  linkSpan.classList.add('canopy-url-link-span');
  linkElement.classList.add('canopy-url-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.setAttribute('href', token.url);
  var styleElements = Object(render_render_styled_text__WEBPACK_IMPORTED_MODULE_3__["default"])(token.text);
  appendElementsToParent(styleElements, linkElement);
  linkElement.dataset.type = 'url';
  linkElement.dataset.text = token.text;
  linkElement.dataset.urlSubtopic = token.urlSubtopic;
  linkSpan.appendChild(linkElement);
  linkSpan.innerHTML += assets_external_link_icon_icon_svg__WEBPACK_IMPORTED_MODULE_2___default.a.replace(/\r?\n|\r/g, '');
  return linkSpan;
}

function renderImage(token) {
  var divElement = document.createElement('DIV');
  divElement.classList.add('canopy-image-div');
  var imageElement = document.createElement('IMG');
  divElement.appendChild(imageElement);
  imageElement.setAttribute('src', token.resourceUrl);
  var anchorElement = document.createElement('A');
  anchorElement.setAttribute('href', token.anchorUrl || token.resourceUrl);
  anchorElement.appendChild(imageElement);
  divElement.appendChild(anchorElement);

  if (token.title) {
    imageElement.setAttribute('title', token.title);
    var captionElement = document.createElement('SUP');
    var captionDiv = document.createElement('DIV');
    captionElement.appendChild(document.createTextNode(token.title));
    captionElement.classList.add('canopy-image-caption');
    captionDiv.classList.add('canopy-caption-div');
    divElement.appendChild(captionElement);
  } else {
    divElement.appendChild(anchorElement);
  }

  if (token.altText) {
    imageElement.setAttribute('alt', token.altText);
  }

  return divElement;
}

function renderHtml(token) {
  var divElement = document.createElement('DIV');
  divElement.innerHTML = token.html;
  divElement.classList.add('canopy-raw-html');
  return divElement;
}

function renderFootnoteSymbol(token) {
  var superscriptElement = document.createElement('SUP');
  var textNode = document.createTextNode(token.text);
  superscriptElement.appendChild(textNode);
  return superscriptElement;
}

function appendElementsToParent(collection, parent) {
  collection.forEach(function (item) {
    parent.appendChild(item);
  });
}

/* harmony default export */ __webpack_exports__["default"] = (renderTokenElement);

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

var cache = {};

var requestJson = function requestJson(topicName) {
  if (cache[topicName]) {
    return Promise.resolve(cache[topicName]);
  }

  var dataPath = '/_data/' + Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(topicName.toLowerCase()) + '.json';
  return fetch(dataPath).then(function (res) {
    return res.json().then(function (json) {
      cache[topicName] = json;
      return json;
    });
  }).catch(function (e) {
    if (canopyContainer.childNodes.length === 0) {
      return updateView([[defaultTopic, defaultTopic]]);
    }
  });
};

/* harmony default export */ __webpack_exports__["default"] = (requestJson);

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