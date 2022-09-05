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

Canopy JS is motivated by a series of observations.

#### 1. Explanation is of a graph

Information in the mind is a graph.
But to send it we need a straight line.
We must straighten, the question is when.
Really the options are two.
The explainer can write a long list.
Or the explainer can capture their graph.
Then send the whole graph to the the reader.
And make explanations as is needed.

#### 2. Human explainers customize

Why might you prefer to send graph?
Explainers tailor for the reader.
They explain a bit more for beginners.
They add detail for someone advanced.
From one author come many traversals.
But we lose them by making a text.
A text must assume prior knowledge.
A text picks one level of detail.
Only the common is shared.
What interests the few is left out.
So capture the graph of the author.
And let every reader explore.

#### 3. Explanations can be very large

Explanations can't get very big.
Books can't really get very long.
Big collections are composed of small works.
One discussion crowds out every other.
Yet people produce large explanations.
A professor can explain a whole course.
A researcher can explain a whole field.
But large explanations are unwieldy.
Unwieldy to write, and unwieldy to read.
We lack the tools that we need to produce them.
And the tools that we need to consume.

#### 4. Every idea is a unique address

Currently, we speak about prose.
We speak about books, articles, chapters, and lectures.
Yet every idea is a thing.
Every idea has connections.
A single idea can be requested.
So give every idea a name.
And make every name an address.
And put at that address a page.
And put on the page explanation.
And have explanation impart the idea.

#### 5. Explanations are mergable

An explanation is made up of points.
A point is in multiple places.
Several points can regard the same thing.
Thus can explanations be merged.
Points on a thing can be marshaled.
A point in two places combined.
Track sources, yet put like together.
This is what we do when we read.
We produce a merged understanding.
An index from multiple sources.
So why only transmit the writing?
Transmit the index itself.

#### 6. In explanation, data is metadata

In a library, we have books and bookshelves.
The bookshelf for us forms a class.
Inside the class we put books.
Yet it is not so in the mind.
Here is a claim and beside it rebuttal.
There is a point and besides it is proof.
In the mind, there are no labels.
The book is also bookshelf.
The data itself is the class.
Information is put in a place.
And becomes a place for more information.
We use speech to navigate speech.
So organize speech with itself.

#### 7. References are intended to import, not redirect

On the web, we find many links.
A link sends me to a new place.
Mention ten things, and I've sent you ten places.
But this is not so when we speak.
I mention that thing to help explain this thing.
The reference is not redirection.
The reference is importation.
I am not referencing to send you there.
I'm referencing to bring it here.
So all of the time we see links.
And most often they should keep us here.

#### 8. Memory requires hierarchy, so data should be hierarchical

Most writing goes like a list.
One idea after another.
But this is all hard to remember.
It's hard to reconstruct what you read.
What is easy to remember are trees.
Things that have a few parts.
Each part might have a few fellows.
Thus each thing brings to mind several others.
Thus are Experts hierarchical.
They have categories, nicknames, and groups.
But most of the time, they withhold it.
They reveal just a listing of facts.
But the listener also needs hierarchy.
Without hierarchy, they wont recall.
So require that everything have structure.
Limit the size of the chunks.
Have each bit mention some few others.
Don't let the author make lists.
Include index along with the data.

#### 9. Mastery requires dense graphs, but serialization removes them.

An expert knows many things.
But also many things with many connections.
The mind of the expert is dense.
It is very hard to make straight.
Every point raises ten others.
Every point is used in ten places.
So how can you make a straight line?
Generally speaking, we cheat.
We list ideas, and let readers connect them.
We give chunks, and let readers digest them.
But many readers don't know how.
So they learn chunkings that were merely pragmatic.
Then can only recall things by grouping.
And connections become disconnected.
And the mind of the expert is lost.

#### 10. Visual memory is stronger than verbal

A person can remember many facts.
But it is easier to remember a space.
Here is a room, and inside it a box.
Here is a box, and inside it a key.
But prose is just one long sequence.
A beginning, a middle, and end.
That's not so easy to remember.
We could give explanations more breadth.
An explanation could span a large surface.
Here's one point adjacent another.
From this point here, we go down.
That would much more stick into memory.
Even if it's all the same facts.

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
