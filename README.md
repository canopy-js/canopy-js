<div align="right">
<a href="https://en.wikipedia.org/wiki/Canopy_(biology)#/media/File:JigsawCanopy.jpg">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/JigsawCanopy.jpg/2560px-JigsawCanopy.jpg" title="The canopy in Sepilok Orangutan Rehabilitation Centre in the Malaysian Sabah District of North Borneo, 25 July 2010." alt="Forest Canopy" width="auto" height="auto"/></a>
<sub>
  <a rel="nofollow" class="external text" href="https://markfisher.photo">Mark Fisher - markfisher.photo</a>,
  <a href="https://creativecommons.org/licenses/by-sa/3.0" title="Creative Commons Attribution-Share Alike 3.0">CC BY-SA 3.0</a>,
  <a href="https://commons.wikimedia.org/w/index.php?curid=18189052">Link</a>
</sub>
</div>
<div align="center">
<br>

![Logo](./readme/logo.png)

<br>
</div>

# Table of Contents

- [Table of Contents](#table-of-contents)
  * [About Canopy JS](#about-canopy-js)
    + [What Canopy does](#what-canopy-does)
  * [Getting Started](#getting-started)
    + [Installation](#installation)
    + [Quick Start](#quick-start)
    + [Creating Content](#creating-content)
    + [CLI](#cli)
  * [Development](#development)
    + [Developer Installation](#developer-installation)
    + [Running Tests](#running-tests)
    + [Run Webpack](#run-webpack)

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
<br>
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
<br>
<br>
<br>
<br>
## Getting Started

### Installation

Install CLI:

```
npm install -g canopy-js
```

### Starting a project

To start a Canopy project, first create a project directory and enter it:
```
mkdir myProject
cd myProject
```
Then, run the `canopy init` command:
```
canopy init
```
You will be asked for a default topic name, this tells the web application what paragraph to show the user first. It will be stored in the `.canopy_default_topic` file in case you need to edit it later.

The init command should create a file like `myProject/topics/My_Default_topic.expl`.

A Canopy project is edited by creating new `expl` files in the project's `topics` directory.

### Quickstart



### Creating Topic Files



### Creating Links

### Using Markup

### Using Bulk Mode

The Canopy CLI has various commands

## Reference

### CLI

## Development

### Developer Installation

For development, clone the repo and run

```
npm install -g [PATH TO REPO]
```

Run tests:
```
npm run test
```
