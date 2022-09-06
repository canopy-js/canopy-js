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

When an expert produces an explanation, they are taking their interconnected knowledge and producing a partial linearization of it for some specific audience and purpose.
This linearization can occur up-front, for example when writing a book. Or, the expert can answer questions, producing small linearizations in response to specific prompts. A customized explanation can include more clarification for a beginner, more detail for someone advanced, and connections from the material to the interests and prior knowledge of the listener. However, customization requires continued access to the explainer. The idea of many hypertext systems, and Canopy in particular, is that rather than producing a single text, the author might record the graph itself, and then the user could produce their own linearizations as desired.

#### 2. Explanations can be very large

There are practical limits to the length of a book, or the size of a lecture. But people can produce explanations much larger than this. A professor can explain the material of an entire course. A domain expert might be able to explain an entire field or discipline. Large explanations might have certain benefits. A single-author work would have a common vocabulary and approach, which might make it easier to assilimate. Yet dealing with large explanations presents a logistical difficulty. At the moment, they are hard to produce, and they are hard to consume. Beyond a certain scale, even indexes and tables of contents become too large to navigate. For this, however, we can borrow from computer science the concept of binary search. If we compose paragraphs that link a few other paragraphs, and follow the path like a tree, we could navigate a million paragraphs while only ever seeing ten paragraphs at once. This approach would enable new kinds of writing-in-the-large that haven't been previously possible.

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
