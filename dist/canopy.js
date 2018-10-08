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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/frontend/canopy.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/frontend/canopy.js":
/*!********************************!*\
  !*** ./src/frontend/canopy.js ***!
  \********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/frontend/helpers/getters.js");
/* harmony import */ var display_display_topic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! display/display_topic */ "./src/frontend/display/display_topic.js");
/* harmony import */ var helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! helpers/url_parsers */ "./src/frontend/helpers/url_parsers.js");
/* harmony import */ var helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/set_path_and_fragment */ "./src/frontend/helpers/set_path_and_fragment.js");





if (!Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["topicNameFromUrl"])()) {
  Object(helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_3__["default"])(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["defaultTopic"], null);
}

Object(display_display_topic__WEBPACK_IMPORTED_MODULE_1__["default"])(Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["topicNameFromUrl"])(), Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_2__["subtopicNameFromUrl"])());
window.addEventListener('hashchange', function (e) {});

/***/ }),

/***/ "./src/frontend/display/display_path_to.js":
/*!*************************************************!*\
  !*** ./src/frontend/display/display_path_to.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var displayPathTo = function displayPathTo(domElement) {};

/* harmony default export */ __webpack_exports__["default"] = (displayPathTo);

/***/ }),

/***/ "./src/frontend/display/display_topic.js":
/*!***********************************************!*\
  !*** ./src/frontend/display/display_topic.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var requests_request_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! requests/request_json */ "./src/frontend/requests/request_json.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/getters */ "./src/frontend/helpers/getters.js");
/* harmony import */ var render_render_dom_tree__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! render/render_dom_tree */ "./src/frontend/render/render_dom_tree.js");
/* harmony import */ var display_display_path_to__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/display_path_to */ "./src/frontend/display/display_path_to.js");
/* harmony import */ var display_eager_load_on_external_reference__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! display/eager_load_on_external_reference */ "./src/frontend/display/eager_load_on_external_reference.js");
/* harmony import */ var helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! helpers/set_path_and_fragment */ "./src/frontend/helpers/set_path_and_fragment.js");







var displayTopic = function displayTopic(topicName, subtopicName) {
  if (!topicName) {
    throw 'Topic name required';
  } // Check cache


  Object(helpers_set_path_and_fragment__WEBPACK_IMPORTED_MODULE_5__["default"])(topicName, subtopicName);
  Object(requests_request_json__WEBPACK_IMPORTED_MODULE_0__["default"])(topicName, function (dataObject) {
    var paragraphTokensBySubtopic = dataObject;
    var domTree = Object(render_render_dom_tree__WEBPACK_IMPORTED_MODULE_2__["default"])(topicName, paragraphTokensBySubtopic, display_eager_load_on_external_reference__WEBPACK_IMPORTED_MODULE_4__["default"]);
    helpers_getters__WEBPACK_IMPORTED_MODULE_1__["canopyContainer"].appendChild(domTree);
    var selectedElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["domElementOfTopic"])(topicName, subtopicName);
    Object(display_display_path_to__WEBPACK_IMPORTED_MODULE_3__["default"])(selectedElement);
  });
};

/* harmony default export */ __webpack_exports__["default"] = (displayTopic);

/***/ }),

/***/ "./src/frontend/display/eager_load_on_external_reference.js":
/*!******************************************************************!*\
  !*** ./src/frontend/display/eager_load_on_external_reference.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var eagerLoadOnExternalReference = function eagerLoadOnExternalReference() {};

/* harmony default export */ __webpack_exports__["default"] = (eagerLoadOnExternalReference);

/***/ }),

/***/ "./src/frontend/helpers/getters.js":
/*!*****************************************!*\
  !*** ./src/frontend/helpers/getters.js ***!
  \*****************************************/
/*! exports provided: canopyContainer, defaultTopic, domElementOfTopic */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "canopyContainer", function() { return canopyContainer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultTopic", function() { return defaultTopic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "domElementOfTopic", function() { return domElementOfTopic; });
var canopyContainer = document.getElementById('_canopy');

if (!canopyContainer) {
  throw new Error('Page must have an html element with id "_canopy"');
}

var defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;

if (!defaultTopic) {
  throw new Error('HTML element with id "_canopy" must have a default topic data attribute');
}

var domElementOfTopic = function domElementOfTopic(topicName) {
  return null;
};



/***/ }),

/***/ "./src/frontend/helpers/id_generators.js":
/*!***********************************************!*\
  !*** ./src/frontend/helpers/id_generators.js ***!
  \***********************************************/
/*! exports provided: toSlug, htmlIdFor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toSlug", function() { return toSlug; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "htmlIdFor", function() { return htmlIdFor; });
var toSlug = function toSlug(string) {
  if (!string) {
    return string;
  }

  return string.replace(' ', '_');
};

var htmlIdFor = function htmlIdFor(string) {
  return '_canopy_' + toSlug(string);
};



/***/ }),

/***/ "./src/frontend/helpers/set_path_and_fragment.js":
/*!*******************************************************!*\
  !*** ./src/frontend/helpers/set_path_and_fragment.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_id_generators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/id_generators */ "./src/frontend/helpers/id_generators.js");
/* harmony import */ var helpers_url_parsers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! helpers/url_parsers */ "./src/frontend/helpers/url_parsers.js");



var setPathAndFragment = function setPathAndFragment(topicName, subtopicName) {
  if (Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_1__["topicNameFromUrl"])() === Object(helpers_id_generators__WEBPACK_IMPORTED_MODULE_0__["toSlug"])(topicName) && Object(helpers_url_parsers__WEBPACK_IMPORTED_MODULE_1__["subtopicNameFromUrl"])() === Object(helpers_id_generators__WEBPACK_IMPORTED_MODULE_0__["toSlug"])(subtopicName)) {
    return;
  }

  window.location.pathname = '/' + Object(helpers_id_generators__WEBPACK_IMPORTED_MODULE_0__["toSlug"])(topicName);

  if (subtopicName) {
    window.location.href = '#' + Object(helpers_id_generators__WEBPACK_IMPORTED_MODULE_0__["toSlug"])(subtopicName);
  }
};

/* harmony default export */ __webpack_exports__["default"] = (setPathAndFragment);

/***/ }),

/***/ "./src/frontend/helpers/url_parsers.js":
/*!*********************************************!*\
  !*** ./src/frontend/helpers/url_parsers.js ***!
  \*********************************************/
/*! exports provided: topicNameFromUrl, subtopicNameFromUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "topicNameFromUrl", function() { return topicNameFromUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtopicNameFromUrl", function() { return subtopicNameFromUrl; });
var topicNameFromUrl = function topicNameFromUrl() {
  return window.location.pathname.replace('/', '');
};

var subtopicNameFromUrl = function subtopicNameFromUrl() {
  return window.location.hash.replace('#', '');
};



/***/ }),

/***/ "./src/frontend/render/render_dom_tree.js":
/*!************************************************!*\
  !*** ./src/frontend/render/render_dom_tree.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var renderDomTree = function renderDomTree(topicName, paragraphTokensBySubtopic, onExternalReference) {
  var sectionElement = document.createElement('sectionElement');
  var paragraphElement = document.createElement('p');
  sectionElement.appendChild(paragraphElement); // sectionElement.style.display = 'none';

  var linesOfFirstBlock = paragraphTokensBySubtopic[topicName];
  linesOfFirstBlock.forEach(function (tokensOfLine) {
    tokensOfLine.forEach(function (token) {
      var textNode = document.createTextNode(token.text);
      paragraphElement.appendChild(textNode);
    });
    paragraphElement.appendChild(document.createElement('br'));
  });
  return sectionElement;
};

/* harmony default export */ __webpack_exports__["default"] = (renderDomTree);

/***/ }),

/***/ "./src/frontend/requests/request_json.js":
/*!***********************************************!*\
  !*** ./src/frontend/requests/request_json.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_id_generators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/id_generators */ "./src/frontend/helpers/id_generators.js");


var requestJson = function requestJson(topicName, success) {
  fetch('data/' + Object(helpers_id_generators__WEBPACK_IMPORTED_MODULE_0__["toSlug"])(topicName.toLowerCase()) + '.json').then(function (res) {
    return res.json();
  }).then(function (json) {
    success(json);
  });
};

/* harmony default export */ __webpack_exports__["default"] = (requestJson);

/***/ })

/******/ });
//# sourceMappingURL=canopy.js.map