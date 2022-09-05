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

#### 1. Explanation is of a graph

Information in the mind is a graph.
But to send it we need a straight line.
We must straighten, the question is when.
Really the options are two.
The explainer can write a long list.
Or the explainer can capture their graph.
Then send the whole graph to the the reader.
And make explanations as-needed.

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
And then let each reader explore.

#### 3. Explanations can be very large

Explanations can't get very big.
Books can't really get very long.
Big collections are composed of small works.
Discussion of one thing crowds out another.
Yet people produce large explanations.
A professor can explain a whole course.
A researcher can explain a whole field.
But large explanations are unwieldy.
Unwieldy to write, and unwieldy to read.
We lack the tools that we need to produce them.
And we lack the tools we need to consume them.

#### 4. Every idea is a unique address

Currently, we speak about prose.
We speak about books, articles, chapters, and lectures.
Yet every idea is a thing.
Every idea has connections.
Every idea can itself be requested.
So give an idea an address.
And put at that address a page.
And put on the page explanation.
And have the explanation impart the idea.

#### 5. Explanations are mergable

An explanation is made up of points.
The same point is in multiple places.
Multiple points can regard the same thing.
Thus can explanations be merged.
Points about the same thing be collected.
A point in two places combined.
Keep track of sources, yet put like together.
This is what we do when we read.
We create a merged understanding.
An index from multiple sources.
So why only transmit the documents?
Transmit the index itself.

#### 6. In explanation, data is metadata

In a library, there are books and bookshelves.
The shelf is category and books go inside.
Yet it is not so in the mind.
Here is a claim and beside it is rebuttal.
There is a point and besides it is proof.
In the mind, there is no taxonomy.
Rather, the data is category.
Information is put at a place, and then becomes a place for more information.
The book is also a bookshelf.
We use speech to do navigation.
So organize explanation with itself.

#### 6. References are intended to import, not redirect

On the web, we find many links.
A link redirects to a new place.
Mention ten things, and I've sent you ten places.
But this is not so when we speak.
I mention that idea so you'll understand this one.
The reference is not redirection.
The reference is importation.
I am not referencing it to send you there.
I'm referencing it to bring it here.
So all of the time we see links.
And most often they should keep us here.

#### 7. Memory requires hierarchy, so data should be hierarchical

Most articles are lists.
One idea after another.
But this is all hard to remember.
It's hard to reconstruct what you read.
What is easy to remember are trees.
Things that have multiple parts.
Each thing brings to mind another.
The other becomes the next query.
Thus does understanding have hierarchy.
Experts are hierarchical.
They have categories, nicknames, and groupings.
But most of the time, they withhold it.
They reveal just a listing of facts.
But the listener hierarchy also.
Without the hierarchy, they wont recall.
So require that everything have structure.
Limit the size of long chunks.
Have each bit mention some others.
Don't let the author make lists.
Include index along with the data.

#### 8. Mastery requires dense graphs, but serialization removes them.

An expert doesn't just know many things.
Experts know many things with connections.
The mind of the expert is dense.
It is very hard to make straight.
Every point raises ten others.
Every point is used in ten places.
So how can you make a straight line?
So generally speaking, we cheat.
We list ideas, and let readers connect them.
We give chunks, and let readers digest them.
But many readers don't.
So they learn chunkings that were merely pragmatic.
Then can only recall things by grouping.
And connections become disconnected.
And the density of the expert is lost.

#### 9. Put pervasive concepts throughout

You might have a question on grammar.
But few people sit down and learn grammar.
A fact might be explained by equation.
But you don't want to learn all the equations.
Many domains are auxiliary.
We want them to understand something else.
We're interested in them when they help.
But we're not going to learn them front-to-back.
So put the background on the content.
Put language on words as they're used.
Put history on events as they happen.
Let the reader burrow right from their reading.
And go down into just what is key.
This requires the same thing in many places.
Which requires reusable pieces.
And pieces that are very specific.

#### 10. Visual memory is stronger than verbal

A person can remember many facts.
But it is easier to remember spaces.
Here is a room, and inside it a box.
Here is a box, and inside it a key.
But prose is just one long sequence.
There's a beginning, a middle, and an end.
That's not so easy to remember.
We could give explanations breadth.
An explanation could span a large surface.
Here one point and there another.
From this point here we go down.
This will much more stick into memory.
Even if it's all the same facts.

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
