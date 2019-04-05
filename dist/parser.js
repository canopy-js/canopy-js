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

/***/ "./src/parser/components/block_parsers.js":
/*!************************************************!*\
  !*** ./src/parser/components/block_parsers.js ***!
  \************************************************/
/*! exports provided: textBlockFor, codeBlockFor, quoteBlockFor, listBlockFor, tableBlockFor, footnoteBlockFor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "textBlockFor", function() { return textBlockFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "codeBlockFor", function() { return codeBlockFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "quoteBlockFor", function() { return quoteBlockFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "listBlockFor", function() { return listBlockFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tableBlockFor", function() { return tableBlockFor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "footnoteBlockFor", function() { return footnoteBlockFor; });
/* harmony import */ var _parse_clause__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse_clause */ "./src/parser/components/parse_clause.js");
/* harmony import */ var _helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/clauses_with_punctuation_of */ "./src/parser/helpers/clauses_with_punctuation_of.js");
/* harmony import */ var _tokens__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tokens */ "./src/parser/components/tokens.js");
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

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





function textBlockFor(lines, parsingContext) {
  var tokensByLine = lines.map(function (line) {
    return parseTokens(line, parsingContext);
  });
  return {
    type: 'text',
    tokensByLine: tokensByLine
  };
}

function codeBlockFor(lines) {
  var linesWithoutInitialPoundSigns = lines.map(function (line) {
    return line.match(/^\s*#\s?(.*)/)[1];
  });
  return {
    type: 'code',
    lines: linesWithoutInitialPoundSigns
  };
}

function quoteBlockFor(lines, parsingContext) {
  var modifiedParsingContext = _objectSpread({
    markdownOnly: true
  }, parsingContext);

  var tokensByLine = lines.map(function (line) {
    return line.match(/^\s*>\s?(.*)$/)[1];
  }).map(function (line) {
    return parseTokens(line, modifiedParsingContext);
  });
  return {
    type: 'quote',
    tokensByLine: tokensByLine
  };
}

function listBlockFor(lines, parsingContext) {
  var topLevelNodes = [];
  var lastNode;
  lines.forEach(function (line) {
    var initialWhitespace = line.match(/^(\s*)/)[1];
    var orderedListMatch = line.match(/^\s*(\S+)\.\s?(.*$)/);
    var unorderedListMatch = line.match(/^\s*([+*-])\s?(.*$)/);
    var match = orderedListMatch || unorderedListMatch;
    var ordinal = match[1];
    var lineContents = match[2];
    var tokensOfLine = parseTokens(lineContents, parsingContext);
    var newNode = {
      indentation: initialWhitespace.length,
      ordinal: ordinal,
      ordered: !!orderedListMatch,
      tokensOfLine: tokensOfLine,
      children: [],
      parentNode: null
    };

    if (!lastNode) {
      topLevelNodes.push(newNode);
    } else if (newNode.indentation > lastNode.indentation) {
      newNode.parentNode = lastNode;
      lastNode.children.push(newNode);
    } else if (newNode.indentation === lastNode.indentation) {
      if (topLevelNodes.includes(lastNode)) {
        topLevelNodes.push(newNode);
      } else {
        newNode.parentNode = lastNode.parentNode;
        lastNode.parentNode.children.push(newNode);
      }
    } else {
      var parentNode = lastNode;

      while (parentNode && newNode.indentation <= parentNode.indentation) {
        parentNode = parentNode.parentNode;
      }

      if (!parentNode) {
        topLevelNodes.push(newNode);
        newNode.parentNode = null;
      } else {
        newNode.parentNode = parentNode;
        parentNode.children.push(newNode);
      }
    }

    lastNode = newNode;
  });
  topLevelNodes.forEach(removeExtraKeys);
  return {
    type: 'list',
    topLevelNodes: topLevelNodes
  };
}

function removeExtraKeys(node) {
  delete node.parentNode;
  delete node.indentation;
  node.children.forEach(removeExtraKeys);
}

function tableBlockFor(lines, parsingContext) {
  var rows = lines.map(function (line) {
    return line.replace(/(?:^|([^\\]))\|/g, '$1||').split('||').slice(1, -1);
  });

  if (rows[1][0].match(/^\s*[=#-]+\s*$/)) {
    rows.splice(1, 1);
  }

  var tokensByCellByRow = rows.map(function (cellsOfRow) {
    return cellsOfRow.map(function (cell) {
      return Array.prototype.concat.apply([], parseTokens(cell, parsingContext));
    });
  });
  return {
    type: 'table',
    tokensByCellByRow: tokensByCellByRow
  };
}

function footnoteBlockFor(lines, parsingContext) {
  var footnoteObjects = lines.map(function (footnote) {
    var match = footnote.match(/^\[\^([^\]]+)]\:(.*$)/);
    var superscript = match[1];
    var text = match[2];
    var tokens = parseTokens(text, parsingContext);
    return {
      superscript: superscript,
      tokens: tokens
    };
  });
  return {
    type: 'footnote',
    footnoteObjects: footnoteObjects
  };
}

function parseTokens(line, parsingContext) {
  return Array.prototype.concat.apply([], Object(_helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_1__["default"])(line).map(function (clauseString) {
    return Object(_parse_clause__WEBPACK_IMPORTED_MODULE_0__["default"])(clauseString, parsingContext);
  }));
}



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
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");




function buildNamespaceObject(pathList) {
  var namespacesObject = {};
  pathList.forEach(function (path) {
    var paragraphsWithKeys = Object(helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__["default"])(path);
    var currentTopic = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_2__["removeMarkdownTokens"])(Object(helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__["default"])(paragraphsWithKeys[0]).key);
    namespacesObject[currentTopic] = {};
    paragraphsWithKeys.forEach(function (paragraphWithKey) {
      var key = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_2__["removeMarkdownTokens"])(paragraphWithKey.split(':')[0]);
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
/* harmony import */ var helpers_topic_key_of_file__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! helpers/topic_key_of_file */ "./src/parser/helpers/topic_key_of_file.js");
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");
/* harmony import */ var rimraf__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rimraf */ "rimraf");
/* harmony import */ var rimraf__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(rimraf__WEBPACK_IMPORTED_MODULE_7__);










function jsonForProjectDirectory(sourceDirectory, destinationBuildDirectory, noFolders) {
  var destinationDataDirectory = destinationBuildDirectory + '/_data';
  var dgsFilePaths = Object(helpers_list_dgs_files_recursive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(sourceDirectory);
  var namespaceObject = Object(components_build_namespace_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dgsFilePaths);
  rimraf__WEBPACK_IMPORTED_MODULE_7___default.a.sync(destinationDataDirectory);
  fs__WEBPACK_IMPORTED_MODULE_0___default.a.mkdirSync(destinationDataDirectory);
  dgsFilePaths.forEach(function (path) {
    var json = Object(components_json_for_dgs_file_js__WEBPACK_IMPORTED_MODULE_3__["default"])(path, namespaceObject);
    var dgsFileNameWithoutExtension = path.match(/\/(\w+)\.\w+$/)[1];

    if (dgsFileNameWithoutExtension.includes(' ')) {
      throw 'Data filenames may not contain spaces: ' + path;
    }

    var destinationPath = destinationDataDirectory + '/' + dgsFileNameWithoutExtension + '.json';
    console.log();
    console.log("WRITING TO " + destinationPath + ": " + json);
    fs__WEBPACK_IMPORTED_MODULE_0___default.a.writeFileSync(destinationPath, json);

    if (!noFolders) {
      var capitalizedKeySlug = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_6__["slugFor"])(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_6__["removeMarkdownTokens"])(Object(helpers_topic_key_of_file__WEBPACK_IMPORTED_MODULE_5__["default"])(path)));
      var topicFolderPath = destinationBuildDirectory + '/' + capitalizedKeySlug;
      rimraf__WEBPACK_IMPORTED_MODULE_7___default.a.sync(topicFolderPath);
      fs__WEBPACK_IMPORTED_MODULE_0___default.a.mkdirSync(destinationBuildDirectory + '/' + capitalizedKeySlug);
      console.log('Created directory: ' + topicFolderPath);
    }
  });
}

/* harmony default export */ __webpack_exports__["default"] = (jsonForProjectDirectory);

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
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");






function jsonForDgsFile(path, namespaceObject) {
  var paragraphsWithKeys = Object(helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_2__["default"])(path);
  var tokenizedParagraphsByKey = {};
  var displayTopicOfFile = Object(helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__["default"])(paragraphsWithKeys[0]).key;
  var topicOfFile = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_4__["removeMarkdownTokens"])(displayTopicOfFile);

  if (!topicOfFile) {
    return '';
  }

  paragraphsWithKeys.forEach(function (paragraphWithKey) {
    var paragraphData = Object(helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__["default"])(paragraphWithKey);

    if (!paragraphData.key) {
      return;
    }

    var currentSubtopic = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_4__["removeMarkdownTokens"])(paragraphData.key);
    var textWithoutKey = paragraphData.paragraph;
    var tokensOfParagraph = Object(components_parse_paragraph__WEBPACK_IMPORTED_MODULE_1__["default"])(textWithoutKey, namespaceObject, currentSubtopic, topicOfFile);
    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
  });
  var jsonObject = {
    topicDisplayName: displayTopicOfFile,
    paragraphsBySubtopic: tokenizedParagraphsByKey
  };
  return JSON.stringify(jsonObject, null, process.env.CANOPY_DEBUG ? 1 : 0);
}

/* harmony default export */ __webpack_exports__["default"] = (jsonForDgsFile);

/***/ }),

/***/ "./src/parser/components/matchers.js":
/*!*******************************************!*\
  !*** ./src/parser/components/matchers.js ***!
  \*******************************************/
/*! exports provided: ReferenceMatchers, MarkdownMatchers, BaseMatchers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReferenceMatchers", function() { return ReferenceMatchers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MarkdownMatchers", function() { return MarkdownMatchers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BaseMatchers", function() { return BaseMatchers; });
/* harmony import */ var components_tokens__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! components/tokens */ "./src/parser/components/tokens.js");
/* harmony import */ var helpers_units_of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/units_of */ "./src/parser/helpers/units_of.js");


var ReferenceMatchers = [localReferenceMatcher, globalReferenceMatcher, importReferenceMatcher];
var MarkdownMatchers = [escapedCharacterMatcher, markdownFootnoteMatcher, markdownImageMatcher, markdownHyperlinkMatcher, markdownUrlMatcher, markdownLinkedImageMatcher, markdownHtmlMatcher];
var BaseMatchers = [textMatcher];

function localReferenceMatcher(prefixObject, parsingContext) {
  var topicSubtopics = parsingContext.topicSubtopics,
      currentTopic = parsingContext.currentTopic,
      currentSubtopic = parsingContext.currentSubtopic;

  if (topicSubtopics[currentTopic].hasOwnProperty(prefixObject.substringAsKey) && currentSubtopic !== prefixObject.substringAsKey && currentTopic !== prefixObject.substringAsKey) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["LocalReferenceToken"](currentTopic, prefixObject.substringAsKey, currentTopic, currentSubtopic, prefixObject.substring);
  }
}

function globalReferenceMatcher(prefixObject, parsingContext) {
  var topicSubtopics = parsingContext.topicSubtopics,
      currentTopic = parsingContext.currentTopic,
      currentSubtopic = parsingContext.currentSubtopic,
      avaliableNamespaces = parsingContext.avaliableNamespaces;

  if (topicSubtopics.hasOwnProperty(prefixObject.substringAsKey) && currentTopic !== prefixObject.substringAsKey) {
    if (!avaliableNamespaces.includes(prefixObject.substringAsKey)) {
      avaliableNamespaces.push(prefixObject.substringAsKey);
      throw {
        name: 'clauseReparseRequired'
      };
    }

    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["GlobalReferenceToken"](prefixObject.substringAsKey, prefixObject.substringAsKey, currentTopic, currentSubtopic, prefixObject.substring);
  }
}

function importReferenceMatcher(prefixObject, parsingContext) {
  var topicSubtopics = parsingContext.topicSubtopics,
      currentTopic = parsingContext.currentTopic,
      currentSubtopic = parsingContext.currentSubtopic,
      avaliableNamespaces = parsingContext.avaliableNamespaces;

  for (var i = 0; i < avaliableNamespaces.length; i++) {
    var namespaceNameAsKey = avaliableNamespaces[i];

    if (topicSubtopics[namespaceNameAsKey].hasOwnProperty(prefixObject.substringAsKey)) {
      return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["GlobalReferenceToken"](namespaceNameAsKey, prefixObject.substringAsKey, currentTopic, currentSubtopic, prefixObject.substring);
    }
  }
}

function escapedCharacterMatcher(prefixObject) {
  var match = prefixObject.substring.match(/^(\\.)$/);

  if (match) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["TextToken"](match[1]);
  }
}

function markdownFootnoteMatcher(prefixObject) {
  var match = prefixObject.substring.match(/^\[\^([^\]]+)\]$/);

  if (match) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["markdownFootnoteToken"](match[1]);
  }
}

function markdownHyperlinkMatcher(prefixObject, parsingContext) {
  var match = prefixObject.substring.match(/^\[([^\s\]]+)\](?:\(([^)]*)\))$/);

  if (match) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["markdownUrlToken"](match[1], match[2], parsingContext.currentSubtopic);
  }
}

function markdownUrlMatcher(prefixObject, parsingContext) {
  var match = prefixObject.substring.match(/^(\S+:\/\/\S+[^.\s])$/);

  if (match) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["markdownUrlToken"](match[1], match[1], parsingContext.currentSubtopic);
  }
}

function markdownImageMatcher(prefixObject) {
  var match = prefixObject.substring.match(/^!\[([^\]]*)]\(([^\s]+)\s*(?:["']([^)]*)["'])?\)$/);

  if (match) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["markdownImageToken"](match[1], match[2], match[3]);
  }
}

function markdownLinkedImageMatcher(prefixObject) {
  var match = prefixObject.substring.match(/^\[!\[([^\]]*)]\(([^\s]+)\s*"([^)]*)"\)\]\(([^)]*)\)$/);

  if (match) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["markdownImageToken"](match[1], match[2], match[3], match[4]);
  }
}

function markdownHtmlMatcher(prefixObject) {
  var match = prefixObject.substring.match(/^<([^>]+)>[\s\S]*<\/([^>]+)>$/);

  if (match && match[1] === match[2]) {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["markdownHtmlToken"](prefixObject.substring);
  }
}

function textMatcher(prefixObject) {
  if (prefixObject.units.length !== 1) {
    return null;
  } else {
    return new components_tokens__WEBPACK_IMPORTED_MODULE_0__["TextToken"](prefixObject.substring);
  }
}



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
/* harmony import */ var helpers_consolidate_text_tokens__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/consolidate_text_tokens */ "./src/parser/helpers/consolidate_text_tokens.js");
/* harmony import */ var components_matchers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! components/matchers */ "./src/parser/components/matchers.js");
/* harmony import */ var helpers_identifiers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! helpers/identifiers */ "./src/client/helpers/identifiers.js");
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}







function parseClause(clauseWithPunctuation, parsingContext) {
  var units = Object(helpers_units_of__WEBPACK_IMPORTED_MODULE_0__["default"])(clauseWithPunctuation);
  return Object(helpers_consolidate_text_tokens__WEBPACK_IMPORTED_MODULE_2__["default"])(validateGlobalLinks(doWithBacktracking(function () {
    return [Object(helpers_units_of__WEBPACK_IMPORTED_MODULE_0__["default"])(clauseWithPunctuation), parsingContext];
  }, tokensOfSuffix)));
}

function doWithBacktracking(generateArguments, callback) {
  var result;

  while (!result) {
    try {
      var argumentsArray = generateArguments();
      result = callback.apply(null, argumentsArray);
    } catch (e) {
      if (e.name !== 'clauseReparseRequired') {
        throw e;
      }
    }
  }

  return result;
}

function tokensOfSuffix(units, parsingContext) {
  if (units.length === 0) {
    return [];
  }

  var prefixObjects = prefixesOf(units);

  var _findMatch = findMatch(prefixObjects, parsingContext),
      _findMatch2 = _slicedToArray(_findMatch, 2),
      token = _findMatch2[0],
      prefixObject = _findMatch2[1];

  return [].concat(token, tokensOfSuffix(units.slice(prefixObject.units.length), parsingContext));
}

function prefixesOf(units) {
  var prefixObjects = [];

  for (var i = units.length - 1; i >= 0; i--) {
    var prefixUnits = units.slice(0, i + 1);
    var substring = prefixUnits.join('');
    var substringAsKey = Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_4__["removeMarkdownTokens"])(Object(helpers_capitalize__WEBPACK_IMPORTED_MODULE_1__["default"])(substring));
    prefixObjects.push({
      units: prefixUnits,
      substring: substring,
      substringAsKey: substringAsKey
    });
  }

  return prefixObjects;
}

function findMatch(prefixObjects, parsingContext) {
  var Matchers = components_matchers__WEBPACK_IMPORTED_MODULE_3__["MarkdownMatchers"].concat(parsingContext.markdownOnly ? [] : components_matchers__WEBPACK_IMPORTED_MODULE_3__["ReferenceMatchers"]).concat(components_matchers__WEBPACK_IMPORTED_MODULE_3__["BaseMatchers"]);

  for (var i = 0; i < prefixObjects.length; i++) {
    for (var j = 0; j < Matchers.length; j++) {
      var matcher = Matchers[j];
      var prefixObject = prefixObjects[i];
      var token = matcher(prefixObject, parsingContext);
      if (token) return [token, prefixObject];
    }
  }
}

function validateGlobalLinks(tokenArray) {
  tokenArray.forEach(function (token1) {
    if (token1.type === 'global') {
      if (!tokenArray.find(function (token2) {
        return token2.type === 'global' && token1.targetTopic === token2.targetSubtopic;
      })) {
        throw "Import reference missing global link found";
      }
    }
  });
  return tokenArray;
}

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
/* harmony import */ var helpers_lines_by_block_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/lines_by_block_of */ "./src/parser/helpers/lines_by_block_of.js");
/* harmony import */ var components_tokens__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! components/tokens */ "./src/parser/components/tokens.js");
/* harmony import */ var components_block_parsers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! components/block_parsers */ "./src/parser/components/block_parsers.js");




function parseParagraph(textWithoutKey, topicSubtopics, currentSubtopic, currentTopic) {
  var parsingContext = {
    topicSubtopics: topicSubtopics,
    currentSubtopic: currentSubtopic,
    currentTopic: currentTopic,
    avaliableNamespaces: [],
    markdownOnly: false
  };
  var linesContainerObjects = Object(helpers_lines_by_block_of__WEBPACK_IMPORTED_MODULE_0__["default"])(textWithoutKey);
  var blockObjects = linesContainerObjects.map(function (linesContainerObject) {
    if (linesContainerObject.type === 'text') {
      return Object(components_block_parsers__WEBPACK_IMPORTED_MODULE_2__["textBlockFor"])(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'code') {
      return Object(components_block_parsers__WEBPACK_IMPORTED_MODULE_2__["codeBlockFor"])(linesContainerObject.lines);
    } else if (linesContainerObject.type === 'quote') {
      return Object(components_block_parsers__WEBPACK_IMPORTED_MODULE_2__["quoteBlockFor"])(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'list') {
      return Object(components_block_parsers__WEBPACK_IMPORTED_MODULE_2__["listBlockFor"])(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'table') {
      return Object(components_block_parsers__WEBPACK_IMPORTED_MODULE_2__["tableBlockFor"])(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'footnote') {
      return Object(components_block_parsers__WEBPACK_IMPORTED_MODULE_2__["footnoteBlockFor"])(linesContainerObject.lines, parsingContext);
    }
  });
  return blockObjects;
}

/* harmony default export */ __webpack_exports__["default"] = (parseParagraph);

/***/ }),

/***/ "./src/parser/components/tokens.js":
/*!*****************************************!*\
  !*** ./src/parser/components/tokens.js ***!
  \*****************************************/
/*! exports provided: LocalReferenceToken, GlobalReferenceToken, TextToken, markdownUrlToken, markdownImageToken, markdownFootnoteToken, markdownHtmlToken */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocalReferenceToken", function() { return LocalReferenceToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalReferenceToken", function() { return GlobalReferenceToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextToken", function() { return TextToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "markdownUrlToken", function() { return markdownUrlToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "markdownImageToken", function() { return markdownImageToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "markdownFootnoteToken", function() { return markdownFootnoteToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "markdownHtmlToken", function() { return markdownHtmlToken; });
function TextToken(text) {
  this.text = text;
  this.type = 'text';
}

function LocalReferenceToken(targetTopic, targetSubtopic, enclosingTopic, enclosingSubtopic, text) {
  this.text = text;
  this.type = 'local';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function GlobalReferenceToken(targetTopic, targetSubtopic, enclosingTopic, enclosingSubtopic, text) {
  this.text = text;
  this.type = 'global';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function markdownUrlToken(url, text, urlSubtopic) {
  this.type = 'url';
  this.text = text || url;
  this.url = url;
  this.urlSubtopic = urlSubtopic;
}

function markdownImageToken(alt, resourceUrl, title, anchorUrl) {
  this.type = 'image';
  this.resourceUrl = resourceUrl;
  this.title = title || null;
  this.altText = alt || null;
  this.anchorUrl = anchorUrl || null;
}

function markdownFootnoteToken(superscript) {
  this.type = 'footnote';
  this.text = superscript;
}

function markdownHtmlToken(html) {
  this.type = 'html';
  this.html = html;
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
  return text.replace(/^\W*(\w)/, function (match) {
    return match.toUpperCase();
  });
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
  if (!string) return ['']; //
  //  This function takes a paragraph and divides it into an array of clauses.
  //
  //  Definitions:
  //
  //  [.,:;?!] = clause terminating punctuation
  //  ["'()<>{}[\]] = wrapping punctuation
  //
  //  Regex:
  //
  //
  //   /
  //     (?:
  //       .                      Match one or more characters
  //       (?!                    that are not followed by a clause termination sequence:
  //         [.,:;?!]+            clause-terminal punctuation
  //         ["'()<>{}[\]]*       that may be followed by wrapping punctuation
  //         (\s|$)               that is followed by space or end of line.
  //       )
  //     )+
  //     .                        Match the last character, that _is_ followed by clause termination sequence.
  //     \S+                      Match the clause terminal and wrapping punctuation until the space.
  //     (\s*$)?                  Include any terminal whitespace after all the clauses.
  //   /g
  //
  //

  return Array.from(string.match(/(?:.(?![.,:;?!]+["'()<>{}[\]]*(\s|$)))+.\S+(\s*$)?/g));
}

/* harmony default export */ __webpack_exports__["default"] = (clausesWithPunctuationOf);

/***/ }),

/***/ "./src/parser/helpers/consolidate_text_tokens.js":
/*!*******************************************************!*\
  !*** ./src/parser/helpers/consolidate_text_tokens.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var components_tokens__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! components/tokens */ "./src/parser/components/tokens.js");
/* harmony import */ var array_prototype_flat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! array.prototype.flat */ "array.prototype.flat");
/* harmony import */ var array_prototype_flat__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(array_prototype_flat__WEBPACK_IMPORTED_MODULE_1__);



function consolidateTextTokens(tokenArray) {
  if (tokenArray.length === 0) {
    return [];
  }

  var nextToken;
  var numberOfTokensProcessed;

  if (tokenArray[0].type !== 'text') {
    nextToken = tokenArray[0];
    numberOfTokensProcessed = 1;
  } else {
    var indexAfterLastTextToken = tokenArray.findIndex(function (item) {
      return item.type !== 'text';
    });
    numberOfTokensProcessed = indexAfterLastTextToken > -1 ? indexAfterLastTextToken : tokenArray.length;
    nextToken = new components_tokens__WEBPACK_IMPORTED_MODULE_0__["TextToken"](tokenArray.slice(0, numberOfTokensProcessed).map(function (token) {
      return token.text;
    }).join(''));
  }

  return array_prototype_flat__WEBPACK_IMPORTED_MODULE_1___default()([nextToken, consolidateTextTokens(tokenArray.slice(numberOfTokensProcessed))]);
}

/* harmony default export */ __webpack_exports__["default"] = (consolidateTextTokens);

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

/***/ "./src/parser/helpers/lines_by_block_of.js":
/*!*************************************************!*\
  !*** ./src/parser/helpers/lines_by_block_of.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_units_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/units_of */ "./src/parser/helpers/units_of.js");


function linesByBlockOf(string) {
  var lines = string.split(/\n/);
  var blocks = [];
  var footnoteLines = [];
  lines.forEach(function (line) {
    var lastBlock = blocks[blocks.length - 1];

    if (line.match(/^\s*#/)) {
      if (lastBlock && lastBlock.type === 'code') {
        lastBlock.lines.push(line);
      } else {
        blocks.push({
          type: 'code',
          lines: [line]
        });
      }
    } else if (line.match(/^\s*>/)) {
      if (lastBlock && lastBlock.type === 'quote') {
        lastBlock.lines.push(line);
      } else {
        blocks.push({
          type: 'quote',
          lines: [line]
        });
      }
    } else if (line.match(/^\s*(\S+\.|[+*-])\s+\S/)) {
      if (lastBlock && lastBlock.type === 'list') {
        lastBlock.lines.push(line);
      } else {
        blocks.push({
          type: 'list',
          lines: [line]
        });
      }
    } else if (line.match(/^\|([^|\n]*\|)+/)) {
      if (lastBlock && lastBlock.type === 'table') {
        lastBlock.lines.push(line);
      } else {
        blocks.push({
          type: 'table',
          lines: [line]
        });
      }
    } else if (line.match(/^\s*\[\^[^\]]+]\:/)) {
      footnoteLines.push(line);
    } else {
      if (lastBlock && lastBlock.type === 'text') {
        lastBlock.lines.push(line);
      } else {
        blocks.push({
          type: 'text',
          lines: [line]
        });
      }
    }
  });

  if (footnoteLines.length > 0) {
    blocks.push({
      type: 'footnote',
      lines: footnoteLines
    });
  }

  return blocks;
}

/* harmony default export */ __webpack_exports__["default"] = (linesByBlockOf);

/***/ }),

/***/ "./src/parser/helpers/list_dgs_files_recursive.js":
/*!********************************************************!*\
  !*** ./src/parser/helpers/list_dgs_files_recursive.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var recursive_readdir_sync__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! recursive-readdir-sync */ "recursive-readdir-sync");
/* harmony import */ var recursive_readdir_sync__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(recursive_readdir_sync__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);



function listDgsfilesRecursive(rootDirectory) {
  var filePaths = recursive_readdir_sync__WEBPACK_IMPORTED_MODULE_0___default()(rootDirectory);
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

/***/ "./src/parser/helpers/topic_key_of_file.js":
/*!*************************************************!*\
  !*** ./src/parser/helpers/topic_key_of_file.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/paragraphs_of_file */ "./src/parser/helpers/paragraphs_of_file.js");
/* harmony import */ var helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/extract_key_and_paragraph */ "./src/parser/helpers/extract_key_and_paragraph.js");



function topicKeyOfFile(path) {
  var paragraphsWithKeys = Object(helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__["default"])(path);
  return Object(helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__["default"])(paragraphsWithKeys[0]).key;
}

/* harmony default export */ __webpack_exports__["default"] = (topicKeyOfFile);

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
  if (!string) return [];
  return string.split(/\b|(?=\W)/);
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
Object(_components_json_for_dgs_directory__WEBPACK_IMPORTED_MODULE_0__["default"])(projectDir + '/topics', projectDir + '/build', process.env.CANOPY_BUILD_WITHOUT_FOLDERS);

/***/ }),

/***/ "array.prototype.flat":
/*!***************************************!*\
  !*** external "array.prototype.flat" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("array.prototype.flat");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "recursive-readdir-sync":
/*!*****************************************!*\
  !*** external "recursive-readdir-sync" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("recursive-readdir-sync");

/***/ }),

/***/ "rimraf":
/*!*************************!*\
  !*** external "rimraf" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("rimraf");

/***/ })

/******/ });