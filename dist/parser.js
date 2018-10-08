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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/backend/parser/parser.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/recursive-readdir-sync/index.js":
/*!******************************************************!*\
  !*** ./node_modules/recursive-readdir-sync/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(/*! fs */ "fs"),
    p = __webpack_require__(/*! path */ "path");

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

/***/ "./src/backend/parser/components/build_namespace_object.js":
/*!*****************************************************************!*\
  !*** ./src/backend/parser/components/build_namespace_object.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/paragraphs_of_file */ "./src/backend/parser/helpers/paragraphs_of_file.js");
/* harmony import */ var _helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/extract_key_and_paragraph */ "./src/backend/parser/helpers/extract_key_and_paragraph.js");



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

/***/ "./src/backend/parser/components/generate_json_files_from_dgs_directory.js":
/*!*********************************************************************************!*\
  !*** ./src/backend/parser/components/generate_json_files_from_dgs_directory.js ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_list_dgs_files_recursive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/list_dgs_files_recursive.js */ "./src/backend/parser/helpers/list_dgs_files_recursive.js");
/* harmony import */ var _build_namespace_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./build_namespace_object.js */ "./src/backend/parser/components/build_namespace_object.js");
/* harmony import */ var _generate_json_for_dgs_file_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./generate_json_for_dgs_file.js */ "./src/backend/parser/components/generate_json_for_dgs_file.js");
/* harmony import */ var helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! helpers/extract_key_and_paragraph */ "./src/backend/parser/helpers/extract_key_and_paragraph.js");






function generateJsonFilesFromDgsDirectory(sourceDirectory, destinationDirectory) {
  var dgsFilePaths = Object(_helpers_list_dgs_files_recursive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(sourceDirectory);
  var namespaceObject = Object(_build_namespace_object_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dgsFilePaths);
  dgsFilePaths.forEach(function (path) {
    var json = Object(_generate_json_for_dgs_file_js__WEBPACK_IMPORTED_MODULE_3__["default"])(path, namespaceObject);
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

/* harmony default export */ __webpack_exports__["default"] = (generateJsonFilesFromDgsDirectory);

/***/ }),

/***/ "./src/backend/parser/components/generate_json_for_dgs_file.js":
/*!*********************************************************************!*\
  !*** ./src/backend/parser/components/generate_json_for_dgs_file.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _parse_block__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parse_block */ "./src/backend/parser/components/parse_block.js");
/* harmony import */ var _helpers_paragraphs_of_file__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../helpers/paragraphs_of_file */ "./src/backend/parser/helpers/paragraphs_of_file.js");
/* harmony import */ var _helpers_extract_key_and_paragraph__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../helpers/extract_key_and_paragraph */ "./src/backend/parser/helpers/extract_key_and_paragraph.js");





function generateJsonForDgsFile(path, namespaceObject) {
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

    var currentTopic = paragraphData.key;
    var textWithoutKey = paragraphData.block;
    var tokensOfParagraph = Object(_parse_block__WEBPACK_IMPORTED_MODULE_1__["default"])(textWithoutKey, namespaceObject, topicOfFile);
    tokenizedParagraphsByKey[currentTopic] = tokensOfParagraph;
  });
  return JSON.stringify(tokenizedParagraphsByKey, null, process.env.CANOPY_DEBUG ? 1 : 0);
}

/* harmony default export */ __webpack_exports__["default"] = (generateJsonForDgsFile);

/***/ }),

/***/ "./src/backend/parser/components/parse_block.js":
/*!******************************************************!*\
  !*** ./src/backend/parser/components/parse_block.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/clauses_with_punctuation_of */ "./src/backend/parser/helpers/clauses_with_punctuation_of.js");
/* harmony import */ var _parse_clause__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parse_clause */ "./src/backend/parser/components/parse_clause.js");



function parseBlock(textWithoutKey, namespaceObject, currentTopic) {
  var lines = textWithoutKey.split(/\n/);
  var tokensOfBlock = [];
  lines.forEach(function (line) {
    var clausesOfParagraph = Object(_helpers_clauses_with_punctuation_of__WEBPACK_IMPORTED_MODULE_0__["default"])(line);
    var importedNamespaces = [];
    var tokensOfParagraphByClause = clausesOfParagraph.map(function (clause) {
      return Object(_parse_clause__WEBPACK_IMPORTED_MODULE_1__["default"])(clause, namespaceObject, currentTopic, importedNamespaces);
    });
    var tokensOfLine = [].concat.apply([], tokensOfParagraphByClause);
    tokensOfBlock.push(tokensOfLine);
  });
  return tokensOfBlock;
}

/* harmony default export */ __webpack_exports__["default"] = (parseBlock);

/***/ }),

/***/ "./src/backend/parser/components/parse_clause.js":
/*!*******************************************************!*\
  !*** ./src/backend/parser/components/parse_clause.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_units_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/units_of */ "./src/backend/parser/helpers/units_of.js");
/* harmony import */ var _helpers_capitalize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/capitalize */ "./src/backend/parser/helpers/capitalize.js");



function parseClause(clauseWithPunctuation, namespaceObject, currentTopic, importedNamespaces) {
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

      if (i === 0) {
        continue;
      }

      var substring = units.slice(0, i + 1).join('');
      var substringCapitalized = Object(_helpers_capitalize__WEBPACK_IMPORTED_MODULE_1__["default"])(substring);

      if (globalNamespace.hasOwnProperty(substringCapitalized)) {
        var token = new TextToken(textTokenBuffer);
        tokens.push(token);
        textTokenBuffer = '';
        var token = new GlobalReferenceToken(substringCapitalized, substring);
        tokens.push(token);
        importedNamespaces.push(substringCapitalized);
        units = units.slice(i + 1, units.length);
        continue;
      }

      var avaliableNamespaces = Array.prototype.concat(importedNamespaces, currentTopic);
      var continueFlag = false;

      for (var j = 0; j < avaliableNamespaces.length; j++) {
        var namespaceName = avaliableNamespaces[j];
        var currentNamespace = namespaceObject[namespaceName];

        if (currentNamespace.hasOwnProperty(substringCapitalized)) {
          var token = new TextToken(textTokenBuffer);
          tokens.push(token);
          textTokenBuffer = '';
          var tokenType = currentTopic === namespaceName ? LocalReferenceToken : ImportReferenceToken;
          var token = new tokenType(substringCapitalized, substring, namespaceName);
          tokens.push(token);
          units = units.slice(i + 1, units.length);
          continueFlag = true;
        }
      }

      if (continueFlag) {
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

function LocalReferenceToken(key, text, contextName) {
  this.text = text;
  this.key = key;
  this.context = contextName;
  this.type = 'local';
}

function ImportReferenceToken(key, text, contextName) {
  this.text = text;
  this.key = key;
  this.context = contextName;
  this.type = 'import';
}

function GlobalReferenceToken(key, text) {
  this.text = text;
  this.key = key;
  this.type = 'global';
}

/* harmony default export */ __webpack_exports__["default"] = (parseClause);

/***/ }),

/***/ "./src/backend/parser/helpers/capitalize.js":
/*!**************************************************!*\
  !*** ./src/backend/parser/helpers/capitalize.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function capitalize(text) {
  return text[0].toUpperCase() + text.slice(1);
}

/* harmony default export */ __webpack_exports__["default"] = (capitalize);

/***/ }),

/***/ "./src/backend/parser/helpers/clauses_with_punctuation_of.js":
/*!*******************************************************************!*\
  !*** ./src/backend/parser/helpers/clauses_with_punctuation_of.js ***!
  \*******************************************************************/
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

/***/ "./src/backend/parser/helpers/extract_key_and_paragraph.js":
/*!*****************************************************************!*\
  !*** ./src/backend/parser/helpers/extract_key_and_paragraph.js ***!
  \*****************************************************************/
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

/***/ "./src/backend/parser/helpers/list_dgs_files_recursive.js":
/*!****************************************************************!*\
  !*** ./src/backend/parser/helpers/list_dgs_files_recursive.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var recursiveReadSync = __webpack_require__(/*! recursive-readdir-sync */ "./node_modules/recursive-readdir-sync/index.js");

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

/***/ "./src/backend/parser/helpers/paragraphs_of_file.js":
/*!**********************************************************!*\
  !*** ./src/backend/parser/helpers/paragraphs_of_file.js ***!
  \**********************************************************/
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

/***/ "./src/backend/parser/helpers/units_of.js":
/*!************************************************!*\
  !*** ./src/backend/parser/helpers/units_of.js ***!
  \************************************************/
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

/***/ "./src/backend/parser/parser.js":
/*!**************************************!*\
  !*** ./src/backend/parser/parser.js ***!
  \**************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_generate_json_files_from_dgs_directory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/generate_json_files_from_dgs_directory */ "./src/backend/parser/components/generate_json_files_from_dgs_directory.js");


if (process.argv.length < 3) {
  console.log('Project directory argument required');
  console.log('Example Usage:');
  console.log('node dist/parser.js /Users/Me/project');
  throw 'Missing commandline argument';
}

var projectDir = process.argv[2].replace(/\/$/, '');
Object(_components_generate_json_files_from_dgs_directory__WEBPACK_IMPORTED_MODULE_0__["default"])(projectDir + '/topics', projectDir + '/build/data');

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ })

/******/ });