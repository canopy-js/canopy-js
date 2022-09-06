<div align="right">
<a href="https://en.wikipedia.org/wiki/Canopy_(biology)#/media/File:JigsawCanopy.jpg">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/JigsawCanopy.jpg/2560px-JigsawCanopy.jpg" title="The canopy in Sepilok Orangutan Rehabilitation Centre in the Malaysian Sabah District of North Borneo, 25 July 2010." alt="Forest Canopy" width="auto" height="auto"/></a>
<sub>
  By
  <a rel="nofollow" class="external text" href="https://markfisher.photo">Mark Fisher - markfisher.photo</a>,
  <a href="https://creativecommons.org/licenses/by-sa/3.0" title="Creative Commons Attribution-Share Alike 3.0">CC BY-SA 3.0</a>,
  <a href="https://commons.wikimedia.org/w/index.php?curid=18189052">Link</a>
</sub>
</div>
<div align="center">
<h1>Canopy.js</h1>
<p> Make interactive websites from your prose explanations. <b><a href="#">Demo</a></b></p>
</div>

# Table of Contents

- [About](#about-canopy-js)
  * [What it does](#what-it-does)
  * [Motivations](#motivations)
- [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Quickstart](#quickstart)
  * [Data Model](#data-model)
  * [CLI](#cli)
- [Development](#development)
  * [Developer Installation](#developer-installation)
  * [Running Tests](#running-tests)
  * [Run Webpack](#run-webpack)

## About Canopy JS

### What Canopy does

Canopy takes a set of text files like this:


```
United States: The United States is a country that contains [[New York]] and [[New Jersey]].

New York: New York is a northeastern American state whose capital is [[Albany]].
New York has 20.2 million people, and contains New York City.
New York covers a total area of 54,556 square miles.

Albany: Albany is a mid-sized American city in upstate New York.

New Jersey:   New Jersey is a northeastern American state whose capital is [[Trenton]].
New Jersey has 9.3 million residents. The state was a major site of the American Revolutionary War,
and later became a center of manufacturing and immigration.

Trenton: Trenton is a mid-sized American city in southern New Jersey.

```
And produces an interactive website like this:
<br>
<br>
<br>

![Demo 1](./readme/demo1.gif)

<br>
<br>
<br>
<br>
Traverse the same content in different directions:
<br>
<br>
<br>
<br>

![Demo 2](./readme/demo2.gif)

### Motivations

Canopy JS is motivated by a series of observations and design-goals.

#### 1. Explanation is a traversal of a graph

When a person gives many explanations of similar material, we find that the same ideas repeat but in different orderings and juxtapositions. One explanation is that knowledge is a graph, and each explanation is a traversal of it in a slightly different path. When an expert produces an explanation, they are taking their interconnected knowledge and producing a partial linearization of it for some specific audience and purpose. This linearization is necessary, because we can only listen to one word at a time. However, there are two options for when it can occur. The expert can produce a book or lecture, doing all the linearization at once, producing one long sequence. Or, the expert can answer questions, producing small linearizations in response to specific individuals. There are benefits to both methods. Long sequences can have narrative structure and local context that allow many points to be made in bulk more efficiently. Yet personalized responses from an expert obviously have a big advantage as well, which is that the expert can customize the explanation for the listener. More information can be added for a beginner, detail can be added for someone more advanced, and connections between the subject and the listener's own interests can be mentioned. However, the custom approach has the obvious downside of requiring continuing access to the explainer. The idea of many hypertext systems, and Canopy in particular, is that rather than producing a sequence, the expert might record their graph itself, and then the user could produce their own linearizations on the fly as desired.

#### 3. Explanations can be very large


#### 4. Every idea is a unique address


#### 5. Explanations are mergable


#### 6. Explanatory data is metadata


#### 7. Memory requires hierarchy, so data should be hierarchical


#### 8. Mastery requires dense graphs, but serialization removes them.


#### 9. References are intended to import, not redirect


#### 10. Visual memory is stronger than verbal


## Getting Started

### Installation

Install CLI:

```
npm install -g canopy-js
```

### Quickstart

Get your project going

### Data Model

There are categories, topics, and subtopics, and global references, local references, and import references.

### CLI

The Canopy CLI has various commands

## Development

### Developer Installation

For development, clone the repo and run

```
npm install -g [PATH TO REPO]
```

And for help remembering to increment the package.json version number when pushing tags, symlink the git push hook:
```
ln -s script/hooks/pre-push .git/hooks
```
### Running Tests

Run tests:
```
npm run test
```

For just unit tests:

```
npm run jest
```

For just Playwright:
```
npx playwright test
```

### Run Webpack

To build assets from the client codebase run:
```
npm run develop
```
