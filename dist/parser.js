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

/***/ "./node_modules/array.prototype.flat/implementation.js":
/*!*************************************************************!*\
  !*** ./node_modules/array.prototype.flat/implementation.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ES = __webpack_require__(/*! es-abstract/es2017 */ "es-abstract/es2017");

var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1; // eslint-disable-next-line max-params, max-statements

var FlattenIntoArray = function FlattenIntoArray(target, source, sourceLen, start, depth) {
  var targetIndex = start;
  var sourceIndex = 0;
  /*
  var mapperFunction;
  if (arguments.length > 5) {
  	mapperFunction = arguments[5];
  }
  */

  while (sourceIndex < sourceLen) {
    var P = ES.ToString(sourceIndex);
    var exists = ES.HasProperty(source, P);

    if (exists) {
      var element = ES.Get(source, P);
      /*
      if (typeof mapperFunction !== 'undefined') {
      	if (arguments.length <= 6) {
      		throw new TypeError('Assertion failed: thisArg is required when mapperFunction is provided');
      	}
      	element = ES.Call(mapperFunction, arguments[6], [element, sourceIndex, source]);
      }
      */

      var shouldFlatten = false;

      if (depth > 0) {
        shouldFlatten = ES.IsArray(element);
      }

      if (shouldFlatten) {
        var elementLen = ES.ToLength(ES.Get(element, 'length'));
        targetIndex = FlattenIntoArray(target, element, elementLen, targetIndex, depth - 1);
      } else {
        if (targetIndex >= MAX_SAFE_INTEGER) {
          throw new TypeError('index too large');
        }

        ES.CreateDataPropertyOrThrow(target, ES.ToString(targetIndex), element);
        targetIndex += 1;
      }
    }

    sourceIndex += 1;
  }

  return targetIndex;
};

module.exports = function flat() {
  var O = ES.ToObject(this);
  var sourceLen = ES.ToLength(ES.Get(O, 'length'));
  var depthNum = 1;

  if (arguments.length > 0 && typeof arguments[0] !== 'undefined') {
    depthNum = ES.ToInteger(arguments[0]);
  }

  var A = ES.ArraySpeciesCreate(O, 0);
  FlattenIntoArray(A, O, sourceLen, 0, depthNum);
  return A;
};

/***/ }),

/***/ "./node_modules/array.prototype.flat/index.js":
/*!****************************************************!*\
  !*** ./node_modules/array.prototype.flat/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var define = __webpack_require__(/*! define-properties */ "define-properties");

var bind = __webpack_require__(/*! function-bind */ "function-bind");

var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/array.prototype.flat/implementation.js");

var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/array.prototype.flat/polyfill.js");

var polyfill = getPolyfill();

var shim = __webpack_require__(/*! ./shim */ "./node_modules/array.prototype.flat/shim.js");

var boundFlat = bind.call(Function.call, polyfill);
define(boundFlat, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});
module.exports = boundFlat;

/***/ }),

/***/ "./node_modules/array.prototype.flat/polyfill.js":
/*!*******************************************************!*\
  !*** ./node_modules/array.prototype.flat/polyfill.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/array.prototype.flat/implementation.js");

module.exports = function getPolyfill() {
  return Array.prototype.flat || implementation;
};

/***/ }),

/***/ "./node_modules/array.prototype.flat/shim.js":
/*!***************************************************!*\
  !*** ./node_modules/array.prototype.flat/shim.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var define = __webpack_require__(/*! define-properties */ "define-properties");

var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/array.prototype.flat/polyfill.js");

module.exports = function shimFlat() {
  var polyfill = getPolyfill();
  define(Array.prototype, {
    flat: polyfill
  }, {
    flat: function () {
      return Array.prototype.flat !== polyfill;
    }
  });
  return polyfill;
};

/***/ }),

/***/ "./src/parser/components/build_namespace_object.js":
/*!*********************************************************!*\
  !*** ./src/parser/components/build_namespace_object.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/paragraphs_of_file */ "./src/parser/helpers/paragraphs_of_file.js");
/* harmony import */ var helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/extract_key_and_paragraph */ "./src/parser/helpers/extract_key_and_paragraph.js");



function buildNamespaceObject(pathList) {
  var namespacesObject = {};
  pathList.forEach(function (path) {
    var paragraphsWithKeys = Object(helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__["default"])(path);
    var currentTopic = Object(helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__["default"])(paragraphsWithKeys[0]).key;
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
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var helpers_list_dgs_files_recursive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/list_dgs_files_recursive.js */ "./src/parser/helpers/list_dgs_files_recursive.js");
/* harmony import */ var components_build_namespace_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! components/build_namespace_object.js */ "./src/parser/components/build_namespace_object.js");
/* harmony import */ var components_json_for_dgs_file_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! components/json_for_dgs_file.js */ "./src/parser/components/json_for_dgs_file.js");
/* harmony import */ var helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! helpers/extract_key_and_paragraph */ "./src/parser/helpers/extract_key_and_paragraph.js");






function jsonForDgsDirectory(sourceDirectory, destinationDirectory) {
  var dgsFilePaths = Object(helpers_list_dgs_files_recursive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(sourceDirectory);
  var namespaceObject = Object(components_build_namespace_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dgsFilePaths);
  dgsFilePaths.forEach(function (path) {
    var json = Object(components_json_for_dgs_file_js__WEBPACK_IMPORTED_MODULE_3__["default"])(path, namespaceObject);
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
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var components_parse_paragraph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! components/parse_paragraph */ "./src/parser/components/parse_paragraph.js");
/* harmony import */ var helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/paragraphs_of_file */ "./src/parser/helpers/paragraphs_of_file.js");
/* harmony import */ var helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/extract_key_and_paragraph */ "./src/parser/helpers/extract_key_and_paragraph.js");





function jsonForDgsFile(path, namespaceObject) {
  var paragraphsWithKeys = Object(helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_2__["default"])(path);
  var tokenizedParagraphsByKey = {};
  var topicOfFile = Object(helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__["default"])(paragraphsWithKeys[0]).key;

  if (!topicOfFile) {
    return '';
  }

  paragraphsWithKeys.forEach(function (paragraphWithKey) {
    var paragraphData = Object(helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__["default"])(paragraphWithKey);

    if (!paragraphData.key) {
      return;
    }

    var currentSubtopic = paragraphData.key;
    var textWithoutKey = paragraphData.paragraph;
    var tokensOfParagraph = Object(components_parse_paragraph__WEBPACK_IMPORTED_MODULE_1__["default"])(textWithoutKey, namespaceObject, currentSubtopic, topicOfFile);
    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
  });
  return JSON.stringify(tokenizedParagraphsByKey, null, process.env.CANOPY_DEBUG ? 1 : 0);
}

/* harmony default export */ __webpack_exports__["default"] = (jsonForDgsFile);

/***/ }),

/***/ "./src/parser/components/parse_clause.js":
/*!***********************************************!*\
  !*** ./src/parser/components/parse_clause.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_units_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/units_of */ "./src/parser/helpers/units_of.js");
/* harmony import */ var helpers_capitalize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/capitalize */ "./src/parser/helpers/capitalize.js");
/* harmony import */ var components_tokens__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! components/tokens */ "./src/parser/components/tokens.js");




function parseClause(clauseWithPunctuation, topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces) {
  var units = Object(helpers_units_of__WEBPACK_IMPORTED_MODULE_0__["default"])(clauseWithPunctuation);
  return Object(components_tokens__WEBPACK_IMPORTED_MODULE_2__["consolidateTextTokens"])(tokensOfSuffix(units, topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces));
}

function tokensOfSuffix(units, topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces) {
  if (units.length === 0) {
    return [];
  }

  var prefixObjects = prefixesOf(units);
  var token = findAndReturnResult(prefixObjects, function (prefixObject) {
    return findAndReturnResult(Matchers, function (matcher) {
      return matcher(prefixObject, topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces);
    });
  });
  return [].concat(token, tokensOfSuffix(units.slice(token.units.length), topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces));
}

function findAndReturnResult(array, callback) {
  var foundItem = array.find(function (item) {
    return callback(item);
  });
  return foundItem && callback(foundItem);
}

function prefixesOf(units) {
  var prefixObjects = [];

  for (var i = units.length - 1; i >= 0; i--) {
    var prefixUnits = units.slice(0, i + 1);
    var substring = prefixUnits.join('');
    var substringAsKey = Object(helpers_capitalize__WEBPACK_IMPORTED_MODULE_1__["default"])(substring);
    prefixObjects.push({
      units: prefixUnits,
      substring: substring,
      substringAsKey: substringAsKey
    });
  }

  return prefixObjects;
}

var Matchers = [function localReferenceMatcher(prefixObject, topicSubtopics, currentTopic, currentSubtopic) {
  if (topicSubtopics[currentTopic].hasOwnProperty(prefixObject.substringAsKey) && currentSubtopic !== prefixObject.substringAsKey && currentTopic !== prefixObject.substringAsKey) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_2__["LocalReferenceToken"](currentTopic, prefixObject.substringAsKey, currentTopic, currentSubtopic, prefixObject.substring, prefixObject.units);
  } else {
    return null;
  }

  ;
}, function globalReferenceMatcher(prefixObject, topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces) {
  if (topicSubtopics.hasOwnProperty(prefixObject.substringAsKey) && currentTopic !== prefixObject.substringAsKey) {
    avaliableNamespaces.push(prefixObject.substringAsKey);
    return new components_tokens__WEBPACK_IMPORTED_MODULE_2__["GlobalReferenceToken"](prefixObject.substringAsKey, prefixObject.substringAsKey, currentTopic, currentSubtopic, prefixObject.substring, prefixObject.units);
  } else {
    return null;
  }
}, function importReferenceMatcher(prefixObject, topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces) {
  return findAndReturnResult(avaliableNamespaces, function (namespaceNameAsKey) {
    if (topicSubtopics[namespaceNameAsKey].hasOwnProperty(prefixObject.substringAsKey)) {
      return new components_tokens__WEBPACK_IMPORTED_MODULE_2__["GlobalReferenceToken"](namespaceNameAsKey, prefixObject.substringAsKey, currentTopic, currentSubtopic, prefixObject.substring, prefixObject.units);
    }
  }) || null;
}, function textMatcher(prefixObject) {
  if (prefixObject.units.length !== 1) {
    return null;
  } else {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_2__["TextToken"](prefixObject.substring, prefixObject.units);
  }
}];
/* harmony default export */ __webpack_exports__["default"] = (parseClause);

/***/ }),

/***/ "./src/parser/components/parse_paragraph.js":
/*!**************************************************!*\
  !*** ./src/parser/components/parse_paragraph.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/clauses_with_punctuation_of */ "./src/parser/helpers/clauses_with_punctuation_of.js");
/* harmony import */ var components_parse_clause__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! components/parse_clause */ "./src/parser/components/parse_clause.js");



function parseParagraph(textWithoutKey, namespaceObject, currentSubtopic, currentTopic) {
  var lines = textWithoutKey.split(/\n/);
  var tokensOfParagraph = [];
  lines.forEach(function (line) {
    var clausesOfParagraph = Object(helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_0__["default"])(line);
    var avaliableNamespaces = [];
    var tokensOfParagraphByClause = clausesOfParagraph.map(function (clause) {
      return Object(components_parse_clause__WEBPACK_IMPORTED_MODULE_1__["default"])(clause, namespaceObject, currentTopic, currentSubtopic, avaliableNamespaces);
    });
    var tokensOfLine = [].concat.apply([], tokensOfParagraphByClause);
    tokensOfParagraph.push(tokensOfLine);
  });
  return tokensOfParagraph;
}

/* harmony default export */ __webpack_exports__["default"] = (parseParagraph);

/***/ }),

/***/ "./src/parser/components/tokens.js":
/*!*****************************************!*\
  !*** ./src/parser/components/tokens.js ***!
  \*****************************************/
/*! exports provided: LocalReferenceToken, GlobalReferenceToken, TextToken, consolidateTextTokens */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocalReferenceToken", function() { return LocalReferenceToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalReferenceToken", function() { return GlobalReferenceToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextToken", function() { return TextToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "consolidateTextTokens", function() { return consolidateTextTokens; });
/* harmony import */ var array_prototype_flat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! array.prototype.flat */ "./node_modules/array.prototype.flat/index.js");
/* harmony import */ var array_prototype_flat__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(array_prototype_flat__WEBPACK_IMPORTED_MODULE_0__);


function TextToken(text, units) {
  this.text = text;
  this.type = 'text';
  this.units = units;
}

function LocalReferenceToken(targetTopic, targetSubtopic, enclosingTopic, enclosingSubtopic, text, units) {
  this.text = text;
  this.type = 'local';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.units = units;
}

function GlobalReferenceToken(targetTopic, targetSubtopic, enclosingTopic, enclosingSubtopic, text, units) {
  this.text = text;
  this.type = 'global';
  this.targetTopic = targetTopic;
  this.targetSubtopic = targetSubtopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.units = units;
}

function consolidateTextTokens(tokenArray) {
  var newArray = [];

  for (var i = 0; i < tokenArray.length; i++) {
    var startToken = tokenArray[i]; // If the current token is the last token, take it

    if (i === tokenArray.length - 1) {
      newArray.push(startToken);
      break;
    } // If the current token is not a text token, take it


    if (startToken.type !== 'text') {
      newArray.push(startToken);
      continue;
    } // If the current token is a text token and the next one is not, take it


    if (tokenArray[i + 1].type !== 'text') {
      newArray.push(startToken);
      continue;
    } // If the current token is a text token and the next one is also,
    // look ahead until a non-text token or end-of-array is found,
    // then merge all consecutive text tokens into one.


    for (var j = i + 1; j < tokenArray.length; j++) {
      var tokenAfterEndOfSpan = tokenArray[j + 1];

      if (!tokenAfterEndOfSpan || tokenAfterEndOfSpan.type !== 'text') {
        newArray.push(new TextToken(tokenArray.slice(i, j + 1).map(function (token) {
          return token.text;
        }).join(''), array_prototype_flat__WEBPACK_IMPORTED_MODULE_0___default()(tokenArray.slice(i, j + 1).map(function (token) {
          return token.units;
        }))));
        i = j;
        break;
      }
    }
  }

  return newArray;
}



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
      paragraph: paragraphWithKey
    };
  }

  var key = match[1];
  var paragraphWithoutKey = paragraphWithKey.slice(match[0].length);
  return {
    key: key,
    paragraph: paragraphWithoutKey
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
var recursiveReadSync = __webpack_require__(/*! recursive-readdir-sync */ "recursive-readdir-sync");

var fs = __webpack_require__(/*! fs */ "fs");

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
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
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
/* harmony import */ var _components_json_for_dgs_directory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/json_for_dgs_directory */ "./src/parser/components/json_for_dgs_directory.js");


if (process.argv.length < 2) {
  console.log('Project directory argument required');
  console.log('Example Usage:');
  console.log('node dist/parser.js /Users/Me/project');
  throw 'Missing commandline argument';
}

var projectDir = process.argv[2].replace(/\/$/, '');
Object(_components_json_for_dgs_directory__WEBPACK_IMPORTED_MODULE_0__["default"])(projectDir + '/topics', projectDir + '/build/data');

/***/ }),

/***/ "define-properties":
/*!************************************!*\
  !*** external "define-properties" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("define-properties");

/***/ }),

/***/ "es-abstract/es2017":
/*!*************************************!*\
  !*** external "es-abstract/es2017" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("es-abstract/es2017");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "function-bind":
/*!********************************!*\
  !*** external "function-bind" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("function-bind");

/***/ }),

/***/ "recursive-readdir-sync":
/*!*****************************************!*\
  !*** external "recursive-readdir-sync" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("recursive-readdir-sync");

/***/ })

/******/ });