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

Canopy JS is motivated by several observations and design goals.

#### 1. Explanation is a traversal of a graph

When an expert produces an explanation, they are taking their interconnected knowledge and producing a partial linearization of it for some specific audience and purpose.
This linearization can occur up-front, for example when writing a book. Or, the expert can answer questions, producing small linearizations in response to specific prompts. A customized explanation can include more clarification for a beginner, more detail for someone advanced, and connections from the material to the interests and prior knowledge of the listener. However, customization requires continued access to the explainer. The idea of many hypertext systems, and Canopy in particular, is that rather than producing a single text, the author might record the graph itself, and then the user could produce their own linearizations as desired.

#### 2. Explanations can be very large

There are practical limits to the length of a book, or the size of a lecture. But people can produce explanations much larger than this. A professor can explain the material of an entire course. A domain expert might be able to explain an entire field or discipline. Large explanations might have certain benefits. A single-author work would have a common vocabulary and approach, which might make it easier to assilimate. Yet dealing with large explanations presents a logistical difficulty. At the moment, they are hard to produce, and they are hard to consume. Beyond a certain scale, even indexes and tables of contents become too large to navigate. For this, however, we can borrow from computer science the concept of binary search. If we compose paragraphs that link a few other paragraphs, and follow the path like a tree, we could navigate a million paragraphs while only ever seeing ten paragraphs at once. This approach would enable new kinds of writing in the large that haven't previously been possible.

#### 3. Explanations are mergable

When we read several books on the same subject, most of us would be hard pressed to recall the exact ordering of the original writings. However, most people would remember for a given point who said what. Thus, in the process of reading we are "merging" source texts, identifying points in common and facts about the same thing, and putting them together in our minds. An expert may have done this for all of the writings in a certain discipline. Yet capturing the result of such a process in writing is very difficult. It would be very large, and composed of small disjointed pieces, and one would have to make controversial decisions about which point or author to put first in each case. Graph approaches removes these difficulties, as graphs are already non-linear and can be merged, graphs inherently have no order or favoritism, and adding to one discussion doesn't remove attention from another. Thus graph mediums create the possibility for new types of source analysis and bibliography, fully digesting other works and putting them in conversation point by point, without taking sides through emphasis or priority.

#### 4. Every idea is a unique address

When we make references to text, we refer to books and articles, or specific chapters and sections. Yet every idea is an entity, and I might want to refer to it specifically, reference it, or send it to somebody. Every idea has its own connections and prerequisites for us to offer the reader. So the unit of explanation should be the single idea, and each idea should have a name and address, and when one navigates to that address, one should be given an explanation that will impart that idea and any prerequisites, and list other related points that are avaliable.

#### 5. Explanatory data is metadata

In a library, you have books and bookshelves. The bookshelves represent categories, and the books are the items being categorized. But in explanation, a certain point can play both roles. A point might be a "book", to be stored in a category among related points, but it is also a "shelf", becoming a "place" where additional information can be stored. This is how we speak to one another, using speech as both the content being requested, and also the means of navigation. Thus, to mimic the organizational scheme of the mind and of spoken explanation, the categories and classifications of the explanation would themselves be explanation.

#### 6. Memory requires hierarchy, so data should be hierarchical

Most writing takes the form of a list, one idea following another on a related theme. Yet lists are hard to remember. There is a limit to the size of what we can consider in working memory at any given time, and things that are not seen together in that window don't get related to one another, and so after hearing a list of ten things, a person might have understood every one of them, but have no way of recalling any one of them. What people do remember are trees. A box with a few items can be seen as a whole and remembered, and then I can zoom in on the item and see its parts, and their parts, and thereby I can store unlimited information while only ever dealing with one image at a time. Experts also have vast intermediary hierarchy, nicknames and groupings for things, but they usually omit these from their public explanations, thus depriving the audience of the very informational structure that they need to recall the data. To prevent this, we can disallow lists, and require that explanations be composed of small units, and if one gets too large, require it be broken into smaller pieces, and require that each new paragraph have been referenced by some prior one explicitly, such that the explanation forms a tree of paragraphs, descending from the general to the specific, providing the reader with a structure that can be internalized as-is.

#### 7. Mastery requires dense graphs, but serialization removes them.

Two people can know the same facts, but interact with them in varying degrees of comfort and flexibility. What distinguishes the expert is that they not only know many things, but they know many connections between those things, one fact requires another, one event preceeded another, and not only can they derive these relations, but very often they have already committed them to memory, often in multiple places, so that they can be recalled on the fly with no need for additional consideration. What results from this is a dense graph, where every node has many edges. Yet dense graphs are very difficult to serialize, especially in narrative which prefers forward-driving action rather than combinatorial interrelation. Additionally, when pressed for time or paper, authors have had to lean towards writing only the basic facts, and requiring the reader to "unpack" them, finding derivative points and enumerating interconnections. Yet, there are very many who would benefit from these rich edges who do not have the time or ability to derive them personally. Many probably don't do this unpacking, and end up retaining chunkings and shorthands that were intended as merely pragmatic. Thus, there is very likely a chronic undersupply of this interconnective data in existing explanatory mediums. One solution would be to have the expert capture and produce their internal graph itself, so that consumers have the ability to explore the redundant connections that form mastery.

#### 8. References are intended to import, not redirect

Most links on the internet redirect the user to a new "location", with a new address and visual context. Yet this does not seem like the intention of most natural language references. When I am speaking about a certain topic and reference something else, my intention is usually not to suggest we change the subject to that other thing, but rather to "import" that concept here, in order for me to make some point that requires it. This importation may happen to involve explaining the new thing in its own right, but only in so far as it helps my original point. Yet the user experience of the web doesn't capture this at all, sending me ten places for ten things that might be part of the same point. The alternative is to have the primary effect of hyperlinks in explanation be the addition of information to the current page, rather than redirection. This mimics the way in which a conversation "unfolds", staying moored to the original topic while wandering in different directions.

#### 9. The page represents the state of the explanation

When a newcomer enters a conversation already in progress and is "brought up to speed", we usually don't recount for them the entirety of what was said previously. For them to be able to follow, it is usually enough to trace through some smaller number of prior statements such that they understand the current topic. Thus does an explanation or conversation have "state", a particular configuration in its progress that is not the same thing as our position in its entirety. By representing every explanation as a series of narrow paragraphs that make one point and introduce several others, every position is expressed as a node in a tree. Paragraphs in books and articles are like this too, also only germane in so far as they address a thing mentioned in a previous paragraph, mentioned in a previous paragraph, etc. Yet because books have a dual-responsibility, both of communicating information clearly and also packing it together efficiently, sometimes one can lose the chain of how a particular point connects to the original question. Digital mediums give us the ability to decouple these traditional burdens, allowing the visible page to represent only the path from the original topic to the current one, without also having to represent the total set of points avaliable. Thus can we achieve a new level of clarity, allowing the path of relevance to be the physical structure of the page, drilling into the mind of the reader how we got to the point in question.

#### 10. Visual memory is stronger than verbal

It is possible to remember a large number of facts, but it is much easier to remember the contents of spaces. Visual memory is much quicker to internalize a fact, and much easier to recall from when needed. Yet prose explanation hardly takes advantange of this vast cognative resource, presenting what is visually a long one-dimensional list of points. Instead, by laying explanation out over multi-dimensional space, with this part connected to that part, with this point being the means to access another, we might greatly butress our ability to recall and navigate explanatory information.

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
