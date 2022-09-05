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
We must straighten, but the question is when.
Really the options are two.
The explainer can write a long list.
Or the explainer can capture their graph.
Then we can serialize for the client as-needed.

#### 2. Human explainers customize explanations

Why might you prefer to send graph?
Explainers can customize for the reader.
They explain a bit more for beginners.
They add detail for someone advanced.
From the explainer, many explanations are possible.
But we lose them by making a document.
A document assumes prior knowledge.
A document picks one level of detail.
There is much that the explainer has.
And things that the reader wants.
But serialization gets in the way.
So capture the graph of the author, and then let each listener explore.

#### 3. Explanations can be very large

At the moment, explanations can't get very big.
Books can't really get very long.
Big collections are composed of small works.
Yet a person can produce large explanations.
A professor can explain the material of a semester.
An expert can explain a whole discipline.
But dealing with large explanations is difficult.
Large explanations are unweildy to wirite, and unweildy to read.
We lack the tools to produce large explanations, and we lack the tools that we need to consume them.

#### 4. Every idea has a unique address

Every idea is a unique entity.
Currently, we speak about chunks of prose.
We speak about books, articles, chapters, and lectures.
Yet every idea is an entity.
Every idea has associations.
Every idea can be requested individually.
An idea has prerequisites.
The prerequisites have prerequisites.
The sum total imparts the idea.
So give an idea an address.
Put at the address a page.
And put on the page that which imparts the idea.

#### 5. Explanations are mergable

An explanation is composed of points.
Sometimes the same point is in multiple explanations.
Sometimes multiple points regard the same entity.
Thus explanations are mergable.
Points about the same thing can be collected.
A point in two explanations can be merged.
We can keep track of sources, yet put like ones together.
Discussion of one aspect doesn't block discussion of another.
This is what we do when we read.
We create a merged understanding that indexes multiple sources.
So why only transmit the documents?
We can transmit the index.

#### 6. In explanation, data is metadata

In a library, there are books and bookshelves.
The bookshelf is the category, and the books go inside.
Yet it is not so in the mind.
Here is a point, and here is its rebuttal.
Here is a claim, and here is its evidence.
In the mind, there is no taxonomy.
Rather, data is categry.
A book is a bookshelf.
Information is put at a place, and then becomes a place for more information.
To find one's way in an explanation, one uses explanation.
So organize explanation with explanation.

#### 6. References are intended to import, not redirect

On the web, many references are hyperlinks.
A hyperlink redirects to a new place.
Mention ten things, and I've sent you ten places.
But this is not so in an explanation.
I need you to understand that idea, so that you can understand this one.
The reference is an import.
I am not referencing it to send you there.
I'm referencing it to bring it here.
So most hyperlinks should import, not redirect.

#### 7. Memory requires hierarchy, so data should be hierarchial

Most articles are lists.
One idea, and another idea.
But it is hard to remember lists.
When you read, it's hard to reconstruct what you read.
What is easy to remember? Hierarchy.
Here is a thing. It has a few parts. Here is a part. It has a few parts.
Each entity brings to mind another, which becomes the next query.
This is heirarchy.
Experts have vast hierarchy.
They have categories and nicknames and groupings.
But most of the time, they withhold it, and just give facts.
But the listener needs that hierarchy also.
Without the hierarchy, they can't organize the information.
So require hierarchy.
Limit the size of chunks.
One chunk can introduces several others.
Don't let the author make lists.
Include with information the means to recall the information.

#### 8. Mastery requires dense graphs, but serialization removes them.

An expert doesn't just know many things.
They knows many things with many connections.
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
And connected thoughts are disconnected.
And the density of the expert is lost.

#### 9. Put pervasive concepts throughout

You might be reading and have a question on grammar.
But few people sit down and learn grammer.
A fact might be explained by equation.
But you don't want to learn all equations.
Many domains are auxiliary.
We want them to understand something else.
We're interested in them when they help.
But we're not going to learn front-to-back.
So put the background on the content.
Put etymology on words as they're used.
Put history on events as they happen.
Let the reader burrow from reading.
And go to just what is relevant.
This requires reusable pieces.
And pieces that are very specific.

#### 10. Visual memory is stronger than verbal

A person can remember many facts.
But it is easier to remember spaces.
Here is a room, and inside it a box.
Here is a box, and inside it a key.
But prose is just one long sequence.
There's a beggining, a middle, and an end.
But that's not easy to remember.
We could give explanations breadth.
An explanation could span a large surface.
This point is to the left of that one.
From this point here we go down.
This will much more stick in memory.
Even if its all the same facts.

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
