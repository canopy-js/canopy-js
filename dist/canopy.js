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
exports.push([module.i, "#_canopy {\n  padding-top: 25px;\n  padding-bottom: 55px; }\n  #_canopy h1 {\n    text-align: center;\n    margin-top: 10px; }\n  #_canopy hr {\n    width: 20%; }\n  #_canopy p {\n    padding-top: 10px;\n    padding-bottom: 10px;\n    font-size: 23px;\n    width: 700px;\n    margin: auto;\n    line-height: 1.3;\n    letter-spacing: -.003em;\n    font-weight: 400; }\n  #_canopy a {\n    text-decoration: underline #F0F0F0;\n    color: black;\n    cursor: pointer;\n    /*\n    &.canopy-dfs-previously-selected-link {\n      color: #ff0000;\n    }\n\n    &.canopy-reverse-dfs-previously-selected-link {\n      color: #0000ff;\n    }\n    */ }\n    #_canopy a:hover {\n      text-decoration: underline; }\n    #_canopy a:focus {\n      outline: 0; }\n    #_canopy a.canopy-open-link {\n      text-decoration: underline; }\n    #_canopy a.canopy-selected-link {\n      text-shadow: .8px 0px 0px black; }\n      #_canopy a.canopy-selected-link.canopy-redundant-local-link {\n        text-decoration: underline black; }\n    #_canopy a.canopy-global-link:hover {\n      color: #4078c0; }\n    #_canopy a.canopy-global-link.canopy-selected-link {\n      text-decoration: underline #4078c0;\n      color: #4078c0; }\n    #_canopy a.canopy-global-link.canopy-open-link {\n      color: #4078c0; }\n", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/*!*************************************************!*\
  !*** ./node_modules/css-loader/lib/css-base.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module build failed (from ./node_modules/babel-loader/lib/index.js):\nError: ENOENT: no such file or directory, open '/Users/Allen/canopy/node_modules/css-loader/lib/css-base.js'");

/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!****************************************************!*\
  !*** ./node_modules/style-loader/lib/addStyles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/Users/Allen/canopy/node_modules/style-loader/lib/addStyles.js'");

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
/* harmony import */ var keys_register_key_listeners__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! keys/register_key_listeners */ "./src/client/keys/register_key_listeners.js");
/* harmony import */ var history_register_pop_state_listener__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! history/register_pop_state_listener */ "./src/client/history/register_pop_state_listener.js");
/* harmony import */ var path_parse_path_string__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! path/parse_path_string */ "./src/client/path/parse_path_string.js");





Object(keys_register_key_listeners__WEBPACK_IMPORTED_MODULE_2__["default"])();
Object(history_register_pop_state_listener__WEBPACK_IMPORTED_MODULE_3__["default"])();
Object(display_update_view__WEBPACK_IMPORTED_MODULE_1__["default"])(Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_4__["default"])(), history.state);

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
/* harmony import */ var display_reset_page__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! display/reset_page */ "./src/client/display/reset_page.js");
/* harmony import */ var display_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/helpers */ "./src/client/display/helpers.js");





var displayPath = function displayPath(pathArray, providedLinkToSelect, selectALink, originatesFromPopStateEvent, directionOfDfs) {
  var topicName = pathArray[0][0];
  var sectionElementOfCurrentPath = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["sectionElementOfPath"])(pathArray);

  if (!sectionElementOfCurrentPath) {
    throw "No section element found for path: " + pathArray;
  }

  if (!originatesFromPopStateEvent) {
    Object(path_set_path__WEBPACK_IMPORTED_MODULE_0__["default"])(pathArray);
  }

  document.title = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["documentTitleFor"])(topicName);
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_3__["createOrReplaceHeader"])(topicName);
  Object(display_reset_page__WEBPACK_IMPORTED_MODULE_2__["deselectAllLinks"])();
  Object(display_reset_page__WEBPACK_IMPORTED_MODULE_2__["clearDfsClasses"])(directionOfDfs);
  Object(display_reset_page__WEBPACK_IMPORTED_MODULE_2__["hideAllSectionElements"])();
  var linkToSelect = Object(display_helpers__WEBPACK_IMPORTED_MODULE_3__["determineLinkToSelect"])(providedLinkToSelect, selectALink, pathArray, sectionElementOfCurrentPath, directionOfDfs);
  var sectionElementToDisplay = Object(display_helpers__WEBPACK_IMPORTED_MODULE_3__["determineSectionElementToDisplay"])(linkToSelect, sectionElementOfCurrentPath);
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_3__["addSelectedLinkClass"])(linkToSelect);
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_3__["addOpenLinkClass"])(linkToSelect);
  displayPathTo(sectionElementToDisplay);
  window.scrollTo(0, helpers_getters__WEBPACK_IMPORTED_MODULE_1__["canopyContainer"].scrollHeight);
};

var displayPathTo = function displayPathTo(sectionElement) {
  sectionElement.style.display = 'block';

  if (sectionElement.parentNode === helpers_getters__WEBPACK_IMPORTED_MODULE_1__["canopyContainer"]) {
    return;
  }

  var parentLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_1__["parentLinkOfSection"])(sectionElement);
  parentLink.classList.add('canopy-open-link');
  Object(display_helpers__WEBPACK_IMPORTED_MODULE_3__["addOpenClassToRedundantSiblings"])(parentLink);
  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathTo(parentSectionElement);
};

/* harmony default export */ __webpack_exports__["default"] = (displayPath);

/***/ }),

/***/ "./src/client/display/helpers.js":
/*!***************************************!*\
  !*** ./src/client/display/helpers.js ***!
  \***************************************/
/*! exports provided: newNodeAlreadyPresent, determineLinkToSelect, determineSectionElementToDisplay, createOrReplaceHeader, displaySectionBelowLink, addSelectedLinkClass, addOpenLinkClass, addOpenClassToRedundantSiblings */
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
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");


function newNodeAlreadyPresent(anchorElement, domTree) {
  return Array.from(anchorElement.childNodes).filter(function (childNode) {
    return childNode.dataset && childNode.dataset.topicName === domTree.dataset.topicName && childNode.dataset.subtopicName === domTree.dataset.subtopicName;
  }).length > 0;
}

function determineLinkToSelect(providedLink, selectALink, pathArray, sectionElementOfCurrentPath, directionOfDfs) {
  if (providedLink) {
    return providedLink;
  }

  var nextChildLink;

  if (directionOfDfs === 1) {
    nextChildLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstLinkOfSectionElement"])(sectionElementOfCurrentPath);
  } else if (directionOfDfs === 2) {
    nextChildLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastLinkOfSectionElement"])(sectionElementOfCurrentPath);
  } else {
    nextChildLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstLinkOfSectionElement"])(sectionElementOfCurrentPath);
  }

  if (selectALink) {
    if (lastPathSegmentIsATopicRoot(pathArray)) {
      return nextChildLink || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(sectionElementOfCurrentPath);
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

  var headerTextNode = document.createTextNode(topicName);
  var headerDomElement = document.createElement('h1');
  headerDomElement.appendChild(headerTextNode);
  helpers_getters__WEBPACK_IMPORTED_MODULE_0__["canopyContainer"].prepend(headerDomElement);
}

;

function determineSectionElementToDisplay(linkToSelect, sectionElementOfCurrentPath) {
  if (linkToSelect && displaySectionBelowLink(linkToSelect)) {
    return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["childSectionElementOfParentLink"])(linkToSelect);
  } else {
    return sectionElementOfCurrentPath;
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
  Array.from(parentLink.parentNode.childNodes).filter(function (linkElement) {
    return linkElement.dataset && linkElement.dataset.targetTopic === parentLink.dataset.targetTopic && linkElement.dataset.targetSubtopic === parentLink.dataset.targetSubtopic;
  }).forEach(function (redundantParentLink) {
    redundantParentLink.classList.add('canopy-open-link');
  });
}



/***/ }),

/***/ "./src/client/display/reset_page.js":
/*!******************************************!*\
  !*** ./src/client/display/reset_page.js ***!
  \******************************************/
/*! exports provided: moveSelectedSectionClass, hideAllSectionElements, deselectAllLinks, clearDfsClasses */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveSelectedSectionClass", function() { return moveSelectedSectionClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hideAllSectionElements", function() { return hideAllSectionElements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deselectAllLinks", function() { return deselectAllLinks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearDfsClasses", function() { return clearDfsClasses; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");


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

function clearDfsClasses(directionToPreserveDfsClassesIn) {
  var preserveForwardDfsClass = directionToPreserveDfsClassesIn === 1;
  var preserveBackwardsDfsClass = directionToPreserveDfsClassesIn === 2;
  forEach(document.getElementsByTagName("a"), function (linkElement) {
    !preserveForwardDfsClass && linkElement.classList.remove('canopy-dfs-previously-selected-link');
    !preserveBackwardsDfsClass && linkElement.classList.remove('canopy-reverse-dfs-previously-selected-link');
  });
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





var updateView = function updateView(pathArray, selectedLinkData, selectALink, originatesFromPopStateEvent, directionOfDfs) {
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

    Object(display_display_path__WEBPACK_IMPORTED_MODULE_1__["default"])(pathArray, selectedLinkData && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_2__["findLinkFromMetadata"])(selectedLinkData), selectALink, originatesFromPopStateEvent, directionOfDfs);
  });
};

/* harmony default export */ __webpack_exports__["default"] = (updateView);

/***/ }),

/***/ "./src/client/helpers/booleans.js":
/*!****************************************!*\
  !*** ./src/client/helpers/booleans.js ***!
  \****************************************/
/*! exports provided: isInRootSection, isATopicRootSection, isTreeRootSection, sectionHasNoChildLinks, sectionElementOfPathVisible */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInRootSection", function() { return isInRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isATopicRootSection", function() { return isATopicRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTreeRootSection", function() { return isTreeRootSection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionHasNoChildLinks", function() { return sectionHasNoChildLinks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sectionElementOfPathVisible", function() { return sectionElementOfPathVisible; });
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
/*! exports provided: canopyContainer, defaultTopic, sectionElementOfPath, currentSection, currentRootSection, selectedLink, parentLinkOfSection, childSectionElementOfParentLink, sectionElementOfLink, metadataFromLink, documentTitleFor, findLinkFromMetadata, findLowestExtantSectionElementOfPath, openLinkOfSection, paragraphElementOfSection, linksOfSectionElement, linkAfter, linkBefore, firstChildLinkOfParentLink, lastChildLinkOfParentLink, firstLinkOfSectionElement, lastLinkOfSectionElement, enclosingTopicSectionOfLink, firstSiblingOf, lastSiblingOf, parentLinkOf, siblingOfLinkLike, linkOfSectionLike, linkOfSectionByTarget */
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
  if (!sectionElement) {
    return null;
  }

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

function firstChildLinkOfParentLink(linkElement) {
  if (linkElement === null) {
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
  if (linkElement === null) {
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
  return linksOfParagraph(paragraphElementOfSection(sectionElement));
}

function linksOfParagraph(paragraphElement) {
  return Array.from(paragraphElement.childNodes).filter(function (linkElement) {
    return linkElement.tagName === 'A';
  });
}

function firstLinkOfSectionElement(sectionElement) {
  if (sectionElement === null) {
    return null;
  }

  return linksOfSectionElement(sectionElement)[0] || null;
}

function lastLinkOfSectionElement(sectionElement) {
  if (sectionElement === null) {
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
  return linksOfSectionElement(sectionElement).find(condition);
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

/***/ "./src/client/history/helpers.js":
/*!***************************************!*\
  !*** ./src/client/history/helpers.js ***!
  \***************************************/
/*! exports provided: linkSelectionPresentInEvent, saveCurrentLinkSelectionInHistoryStack */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linkSelectionPresentInEvent", function() { return linkSelectionPresentInEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "saveCurrentLinkSelectionInHistoryStack", function() { return saveCurrentLinkSelectionInHistoryStack; });
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");


function linkSelectionPresentInEvent(e) {
  return e.state && e.state.targetTopic;
}

function saveCurrentLinkSelectionInHistoryStack(linkElement) {
  history.replaceState(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement), document.title, window.location.href);
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
/* harmony import */ var path_parse_path_string__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/parse_path_string */ "./src/client/path/parse_path_string.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");





function registerPopStateListener() {
  window.addEventListener('popstate', function (e) {
    Object(history_helpers__WEBPACK_IMPORTED_MODULE_0__["saveCurrentLinkSelectionInHistoryStack"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["selectedLink"])());
    var newLinkSelectionData = Object(history_helpers__WEBPACK_IMPORTED_MODULE_0__["linkSelectionPresentInEvent"])(e) ? e.state : null;
    Object(display_update_view__WEBPACK_IMPORTED_MODULE_1__["default"])(Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_2__["default"])(), newLinkSelectionData, null, true);
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
/* harmony import */ var path_path_for_section_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path/path_for_section_element */ "./src/client/path/path_for_section_element.js");
/* harmony import */ var display_update_view__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! display/update_view */ "./src/client/display/update_view.js");
/* harmony import */ var path_set_path__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! path/set_path */ "./src/client/path/set_path.js");
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");
/* harmony import */ var path_parse_path_string__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! path/parse_path_string */ "./src/client/path/parse_path_string.js");
/* harmony import */ var display_reset_page__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! display/reset_page */ "./src/client/display/reset_page.js");
/* harmony import */ var path_path_string_for__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! path/path_string_for */ "./src/client/path/path_string_for.js");










function moveUpward() {
  var pathArray = Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_6__["default"])();
  var linkElement;

  if (Object(helpers_booleans__WEBPACK_IMPORTED_MODULE_1__["isTreeRootSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()))) {
    var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
    pathArray = [[sectionElement.dataset.topicName, sectionElement.dataset.topicName]];
    linkElement = null;
  } else if (Object(helpers_booleans__WEBPACK_IMPORTED_MODULE_1__["isATopicRootSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()))) {
    pathArray.pop();
    linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
    var currentSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])();
    var sectionElementOfSelectedLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()); // Handle global link with inlined child with no links

    if (currentSectionElement !== sectionElementOfSelectedLink && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global') {
      linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
    }
  } else {
    linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
  }

  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement));
}

function moveDownward(cycle) {
  var pathArray = Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_6__["default"])();

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global') {
    // Handle open global link with no children
    if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.contains('canopy-open-link')) {
      return;
    }

    pathArray.push([Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic]);
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, null, true);
  }

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'local') {
    var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement));
  }

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'redundant-local') {
    var _finalTuple = pathArray.pop();

    var _newTuple = [_finalTuple[0], Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic];
    pathArray.push(_newTuple);

    var _linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstLinkOfSectionElement"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfPath"])(pathArray));

    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(_linkElement));
  }
}

function moveLeftward() {
  var currentSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])();
  var sectionElementOfSelectedLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var pathArray = Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_6__["default"])(); // handle left on inlined global with no child links

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkBefore"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastSiblingOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);
  Object(display_display_path__WEBPACK_IMPORTED_MODULE_5__["default"])(pathArray, linkElement);
}

function moveRightward() {
  var currentSectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["currentSection"])();
  var sectionElementOfSelectedLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var pathArray = Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_6__["default"])(); // handle left on inlined global with no child links

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkAfter"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstSiblingOf"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);
  Object(display_display_path__WEBPACK_IMPORTED_MODULE_5__["default"])(pathArray, linkElement);
}

function moveDownOrRedirect(newTab) {
  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'local' || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'redundant-parent') {
    return moveDownward(false);
  } else if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global') {
    var pathArray = [[Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic, Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetSubtopic]];

    if (newTab) {
      var pathString = Object(path_path_string_for__WEBPACK_IMPORTED_MODULE_8__["default"])(pathArray);
      return window.open(location.origin + pathString, '_blank');
    }

    Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(pathArray, null, true);
  }
}

function depthFirstSearch(direction, enterGlobalLinks) {
  var nextLink;
  var previouslySelectedLinkClassName = direction === 1 ? 'canopy-dfs-previously-selected-link' : 'canopy-reverse-dfs-previously-selected-link';
  var previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName);
  var nextPreviouslySelectedLink; // Enter a global link

  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && enterGlobalLinks && previouslySelectedLink !== Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) {
    var targetTopic = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.targetTopic;
    var pathToCurrentLink = Object(path_path_for_section_element__WEBPACK_IMPORTED_MODULE_2__["default"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));
    var newPathArray = pathToCurrentLink.concat([[targetTopic, targetTopic]]);
    var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfPath"])(newPathArray);

    if (!sectionElement || !Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["openLinkOfSection"])(sectionElement)) {
      if (previouslySelectedLink) {
        previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
      }

      Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.add(previouslySelectedLinkClassName);
      return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(newPathArray, null, true, null, direction);
    }
  } // Close a global link with no children so selection never changes


  if (Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type === 'global' && Object(helpers_booleans__WEBPACK_IMPORTED_MODULE_1__["sectionHasNoChildLinks"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["childSectionElementOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])())) && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.contains('canopy-open-link')) {
    if (previouslySelectedLink) {
      previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
    }

    Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().classList.add(previouslySelectedLinkClassName);
    return Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_6__["default"])().slice(0, -1), Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()), false, null, direction);
  } // Enter a parent link


  var lastChildToVisit = direction === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var firstChildToVisit = direction === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["firstChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["lastChildLinkOfParentLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());

  if ((!previouslySelectedLink || previouslySelectedLink !== lastChildToVisit) && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type !== 'global' && Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])().dataset.type !== 'redundant-local') {
    nextLink = firstChildToVisit;
  } // Move to the next sibling


  var nextSiblingToVisit = direction === 1 ? Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkAfter"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()) : Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["linkBefore"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());

  if (!nextLink) {
    nextLink = nextSiblingToVisit;
  } // Move to parent


  var parentLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));

  if (!nextLink && parentLink && parentLink.dataset.type !== 'global') {
    nextLink = parentLink;
  } // Move to parent link that is a global link


  var globalParentLink = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["parentLinkOfSection"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()));

  if (!nextLink && parentLink.dataset.type === 'global' && enterGlobalLinks) {
    nextLink = globalParentLink;
    nextPreviouslySelectedLink = parentLink;
  } // Do nothing


  if (!nextLink) {
    return;
  } // Update "previous link"


  if (previouslySelectedLink) {
    previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
  }

  (nextPreviouslySelectedLink || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])()).classList.add(previouslySelectedLinkClassName); // Update the view

  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_path_for_section_element__WEBPACK_IMPORTED_MODULE_2__["default"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["sectionElementOfLink"])(nextLink)), Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(nextLink), null, null, direction);
}

function goToEnclosingTopic() {
  var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["enclosingTopicSectionOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());
  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["openLinkOfSection"])(sectionElement) || Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])();
  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_path_for_section_element__WEBPACK_IMPORTED_MODULE_2__["default"])(sectionElement), Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement));
}

function goToParentOfEnclosingTopic() {
  var sectionElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["enclosingTopicSectionOfLink"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["selectedLink"])());

  if (sectionElement.parentNode !== helpers_getters__WEBPACK_IMPORTED_MODULE_0__["canopyContainer"]) {
    sectionElement = sectionElement.parentNode;
  }

  var linkElement = Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["openLinkOfSection"])(sectionElement);
  Object(display_update_view__WEBPACK_IMPORTED_MODULE_3__["default"])(Object(path_path_for_section_element__WEBPACK_IMPORTED_MODULE_2__["default"])(sectionElement), Object(helpers_getters__WEBPACK_IMPORTED_MODULE_0__["metadataFromLink"])(linkElement));
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
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");
/* harmony import */ var path_parse_path_string__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! path/parse_path_string */ "./src/client/path/parse_path_string.js");
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






var registerKeyListeners = function registerKeyListeners() {
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
      Object(display_display_path__WEBPACK_IMPORTED_MODULE_2__["default"])(Object(path_parse_path_string__WEBPACK_IMPORTED_MODULE_3__["default"])(), null, true);
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
  'tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 1),
  'alt-tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 1, true),
  'shift-tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 2),
  'alt-shift-tab': keys_key_handlers__WEBPACK_IMPORTED_MODULE_1__["depthFirstSearch"].bind(null, 2, true)
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
/* harmony default export */ __webpack_exports__["default"] = (registerKeyListeners);

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
  if (pathString.match(/\/\w+\/#\w+\/?/)) {
    var newLastItem = slashSeparatedUnits[slashSeparatedUnits.length - 2] + slashSeparatedUnits[slashSeparatedUnits.length - 1];
    var newArray = slashSeparatedUnits.slice(0, slashSeparatedUnits.length - 2);
    newArray.push(newLastItem);
    return newArray;
  }

  return slashSeparatedUnits;
}

/* harmony default export */ __webpack_exports__["default"] = (parsePathString);

/***/ }),

/***/ "./src/client/path/path_for_section_element.js":
/*!*****************************************************!*\
  !*** ./src/client/path/path_for_section_element.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");


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

/* harmony default export */ __webpack_exports__["default"] = (pathForSectionElement);

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
  var historyApiFunction = Object(path_path_string_for__WEBPACK_IMPORTED_MODULE_2__["default"])(newPathArray) === Object(path_path_string_for__WEBPACK_IMPORTED_MODULE_2__["default"])(oldPathArray) ? replaceState : pushState;
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
/* harmony import */ var path_parse_path_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path/parse_path_string */ "./src/client/path/parse_path_string.js");
/* harmony import */ var display_display_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! display/display_path */ "./src/client/display/display_path.js");
/* harmony import */ var display_update_view__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! display/update_view */ "./src/client/display/update_view.js");
/* harmony import */ var helpers_getters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! helpers/getters */ "./src/client/helpers/getters.js");
/* harmony import */ var path_path_for_section_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! path/path_for_section_element */ "./src/client/path/path_for_section_element.js");






var onParentLinkClick = function onParentLinkClick(topicName, targetSubtopic, linkElement) {
  return function (e) {
    e.preventDefault(); // If the link's child is already selected, display the link's section

    var pathArray = Object(path_path_for_section_element__WEBPACK_IMPORTED_MODULE_4__["default"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["sectionElementOfLink"])(linkElement));

    if (linkElement.classList.contains('canopy-open-link')) {
      pathArray.pop();
      var newTuple = [linkElement.dataset.enclosingTopic, linkElement.dataset.enclosingSubtopic];
      pathArray.push(newTuple);
      Object(display_display_path__WEBPACK_IMPORTED_MODULE_1__["default"])(pathArray);
    } else {
      pathArray.pop();
      var _newTuple = [topicName, targetSubtopic];
      pathArray.push(_newTuple);
      Object(display_display_path__WEBPACK_IMPORTED_MODULE_1__["default"])(pathArray);
    }
  };
};

var onGlobalLinkClick = function onGlobalLinkClick(targetTopic, targetSubtopic, linkElement) {
  return function (e) {
    e.preventDefault();

    if (e.altKey) {
      var pathArray = Object(path_path_for_section_element__WEBPACK_IMPORTED_MODULE_4__["default"])(Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["sectionElementOfLink"])(linkElement));

      if (linkElement.classList.contains('canopy-open-link')) {
        return Object(display_update_view__WEBPACK_IMPORTED_MODULE_2__["default"])(pathArray);
      } else {
        pathArray.push([linkElement.dataset.targetTopic, linkElement.dataset.targetSubtopic]);
        return Object(display_update_view__WEBPACK_IMPORTED_MODULE_2__["default"])(pathArray);
      }
    } else {
      Object(display_update_view__WEBPACK_IMPORTED_MODULE_2__["default"])([[targetTopic, targetSubtopic]]);
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
  var promisedDomTree = uponResponsePromise.then(function (paragraphsBySubtopic) {
    return Object(render_render_dom_tree__WEBPACK_IMPORTED_MODULE_0__["default"])(pathArray[0][0], pathArray, paragraphsBySubtopic, {}, pathDepth);
  });
  return promisedDomTree.then(function (domTree) {
    pathDepth > 0 && domTree.prepend(document.createElement('hr'));
    return domTree;
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
/* harmony import */ var render_click_handlers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! render/click_handlers */ "./src/client/render/click_handlers.js");








function renderDomTree(currentSubtopicName, pathArray, paragraphsBySubtopic, renderedSubtopics, pathDepth) {
  var topicName = pathArray[0][0];
  var sectionElement = createNewSectionElement(topicName, currentSubtopicName, pathDepth);
  var linesOfParagraph = paragraphsBySubtopic[currentSubtopicName];
  var promises = [];
  renderedSubtopics[currentSubtopicName] = true;
  var tokenElements = renderElementsForTokens(linesOfParagraph, pathArray, currentSubtopicName, promises, subtopicAlreadyRenderedCallback(renderedSubtopics), generateOnParentLinkTokenRequiringSubtreeCallback(pathArray, paragraphsBySubtopic, renderedSubtopics, pathDepth, sectionElement, promises), generateOnGlobalLinkTokenRequiringSubtreeCallback(pathArray, pathDepth, sectionElement, promises));
  tokenElements.forEach(function (tokenElement) {
    Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["paragraphElementOfSection"])(sectionElement).appendChild(tokenElement);
  });
  return Promise.all(promises).then(function (_) {
    return sectionElement;
  });
}

function subtopicAlreadyRenderedCallback(renderedSubtopics) {
  return function (targetSubtopic) {
    return renderedSubtopics.hasOwnProperty(targetSubtopic);
  };
}

function generateOnParentLinkTokenRequiringSubtreeCallback(pathArray, paragraphsBySubtopic, renderedSubtopics, pathDepth, sectionElement, promises) {
  return function (token) {
    var promisedSubtree = renderDomTree(token.targetSubtopic, pathArray, paragraphsBySubtopic, renderedSubtopics, pathDepth);
    promisedSubtree.then(function (subtree) {
      sectionElement.appendChild(subtree);
    });
    promises.push(promisedSubtree);
  };
}

function generateOnGlobalLinkTokenRequiringSubtreeCallback(pathArray, pathDepth, sectionElement, promises) {
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

function createNewSectionElement(topicName, currentSubtopicName, pathDepth) {
  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');
  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = currentSubtopicName;
  sectionElement.dataset.pathDepth = pathDepth;
  return sectionElement;
}

function subtreeAlreadyRenderedForPriorGlobalLinkInParagraph(sectionElement, token) {
  return Object(helpers_getters__WEBPACK_IMPORTED_MODULE_3__["linkOfSectionByTarget"])(sectionElement, token.targetTopic, token.targetSubtopic);
}

function renderElementsForTokens(linesOfParagraph, pathArray, currentSubtopicName, promises, subtopicAlreadyRendered, onParentLinkTokenRequiringSubtree, onGlobalLinkTokenRequiringSubtree) {
  var tokenArray = [];
  linesOfParagraph.forEach(function (tokensOfLine, lineNumber) {
    lineNumber > 0 && tokenArray.push(document.createElement('br'));
    var newElements = tokensOfLine.map(function (token) {
      return generateTokenElement(token, pathArray, currentSubtopicName, promises, subtopicAlreadyRendered, onParentLinkTokenRequiringSubtree, onGlobalLinkTokenRequiringSubtree);
    });
    tokenArray = tokenArray.concat(newElements);
  });
  return tokenArray;
}

function generateTokenElement(token, pathArray, currentSubtopicName, promises, subtopicAlreadyRendered, onParentLinkTokenRequiringSubtree, onGlobalLinkTokenRequiringSubtree) {
  if (token.type === 'text') {
    return document.createTextNode(token.text);
  } else if (token.type === 'local') {
    return generateParentLink(token, subtopicAlreadyRendered, onParentLinkTokenRequiringSubtree);
  } else if (token.type === 'global') {
    return generateGlobalLink(token, pathArray, currentSubtopicName, onGlobalLinkTokenRequiringSubtree);
  }
}

function generateParentLink(token, subtopicAlreadyRendered, onParentLinkTokenRequiringSubtree) {
  if (!subtopicAlreadyRendered(token.targetSubtopic)) {
    onParentLinkTokenRequiringSubtree(token);
    return generateRegularParentLink(token);
  } else {
    return generateRedundantParentLink(token);
  }
}

function generateRegularParentLink(token) {
  var tokenElement = generateSharedParentLinkBase(token);
  tokenElement.classList.add('canopy-local-link');
  tokenElement.dataset.type = 'local';
  tokenElement.dataset.targetTopic = token.targetTopic;
  tokenElement.dataset.targetSubtopic = token.targetSubtopic;
  tokenElement.dataset.urlSubtopic = token.targetSubtopic;
  tokenElement.dataset.enclosingTopic = token.enclosingTopic;
  tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  tokenElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetTopic), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetSubtopic));
  return tokenElement;
}

function generateRedundantParentLink(token) {
  var tokenElement = generateSharedParentLinkBase(token);
  tokenElement.classList.add('canopy-redundant-local-link');
  tokenElement.dataset.type = 'redundant-local';
  tokenElement.dataset.targetTopic = token.targetTopic;
  tokenElement.dataset.targetSubtopic = token.targetSubtopic;
  tokenElement.dataset.enclosingTopic = token.enclosingTopic;
  tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
  tokenElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.enclosingTopic), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.enclosingSubtopic));
  return tokenElement;
}

function generateSharedParentLinkBase(token) {
  var textElement = document.createTextNode(token.text);
  var tokenElement = document.createElement('a');
  tokenElement.appendChild(textElement);
  tokenElement.addEventListener('click', Object(render_click_handlers__WEBPACK_IMPORTED_MODULE_5__["onParentLinkClick"])(token.targetTopic, token.targetSubtopic, tokenElement));
  return tokenElement;
}

function generateGlobalLink(token, pathArray, currentSubtopicName, onGlobalLinkTokenRequiringSubtree) {
  var tokenElement = createGlobalLinkElement(token, pathArray);

  if (globalLinkIsOpen(tokenElement, pathArray, currentSubtopicName)) {
    onGlobalLinkTokenRequiringSubtree(token);
  }

  return tokenElement;
}

function createGlobalLinkElement(token) {
  var textElement = document.createTextNode(token.text);
  var tokenElement = document.createElement('a');
  tokenElement.appendChild(textElement);
  tokenElement.dataset.type = 'global';
  tokenElement.dataset.targetTopic = token.targetTopic;
  tokenElement.dataset.targetSubtopic = token.targetSubtopic;
  tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
  tokenElement.dataset.enclosingTopic = token.enclosingTopic;
  tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  tokenElement.classList.add('canopy-global-link');
  tokenElement.href = "/".concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetTopic), "#").concat(Object(helpers_identifiers__WEBPACK_IMPORTED_MODULE_0__["slugFor"])(token.targetSubtopic));
  tokenElement.addEventListener('click', Object(render_click_handlers__WEBPACK_IMPORTED_MODULE_5__["onGlobalLinkClick"])(token.targetTopic, token.targetSubtopic, tokenElement));
  return tokenElement;
}

function globalLinkIsOpen(tokenElement, pathArray, currentSubtopicName) {
  var subtopicContainingOpenGlobalReference = pathArray[0][1];
  var openGlobalLinkExists = pathArray[1];
  var openGlobalLinkTargetTopic = pathArray[1] && pathArray[1][0];
  var openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;
  return openGlobalLinkExists && tokenElement.dataset.targetTopic === openGlobalLinkTargetTopic && tokenElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic && currentSubtopicName === subtopicContainingOpenGlobalReference;
}

/* harmony default export */ __webpack_exports__["default"] = (renderDomTree);

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