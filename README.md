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
  * [Usage](#usage)
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

Canopy JS is motivated by a series of observations.

#### 1. Explanation is a linear traversal of nonlinear information

Here is what that means.

#### 2. Explanations can be very large

Here is what that means.

#### 3. Different explanations are composed of the same reusable components

Here is what that means.

#### 4. Most references are intended to import, not redirect

Here is what that means.

#### 5. Memory is hierarchial, and so memorable information is also

Here is what that means.

#### 6. Memory retains exact adjacencies, but serialization removes them

Here is what that means.

#### 7. Every idea should have a unique address

Here is what that means.

#### 8. The state of the page should reflect the state of the explanation

Here is what that means.

#### 9. Specificity should be tailored to the reader

Here is what that means.

#### 10. Prerequisites should be clearly defined and directly reviewable

Because every idea should have a unique address, every URL should represent an idea, and everything necessary to understand that idea.

### Usage

Here's how you use it

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
