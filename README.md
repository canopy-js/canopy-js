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
<h1>Canopy.js</h1>
<p> Make interactive websites from your prose explanations. </p>
</div>

# Table of Contents

- [Table of Contents](#table-of-contents)
  * [About Canopy JS](#about-canopy-js)
    + [What Canopy does](#what-canopy-does)
    + [Motivations](#motivations)
      - [1. Explanation is the traversal of a graph](#1-explanation-is-the-traversal-of-a-graph)
      - [2. Explanations can be very large](#2-explanations-can-be-very-large)
      - [3. Mastery requires dense graphs, which are hard to serialize](#3-mastery-requires-dense-graphs--which-are-hard-to-serialize)
      - [4. Every idea is an entity](#4-every-idea-is-an-entity)
      - [5. Explanations are mergable](#5-explanations-are-mergable)
      - [6. Memory requires hierarchy, so data should be hierarchical](#6-memory-requires-hierarchy--so-data-should-be-hierarchical)
      - [7. Explanatory data is metadata](#7-explanatory-data-is-metadata)
      - [8. The page represents the state of the explanation](#8-the-page-represents-the-state-of-the-explanation)
      - [9. References are intended to import, not redirect](#9-references-are-intended-to-import--not-redirect)
      - [10. Visual memory is stronger than verbal](#10-visual-memory-is-stronger-than-verbal)
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

#### 1. Explanation is the traversal of a graph

When an expert produces an explanation, they are taking their interconnected knowledge and producing a partial linearization of it for some specific audience or purpose, creating a new composition from a set of reusable parts. This linearization can occur up-front, when the author produces a book or lecture. Or, the expert can do it on the fly, producing small linearizations in response to particular questions. This type of custom explanation can include more clarification for a beginner, more detail for someone advanced, or connections between the material and the particular interests of the listener. Customization, however, requires continued access to the explainer, which isn't always a possibility. So, rather than have the expert produce a single text, the author might instead record the graph itself, allowing the user to produce linearizations on their own, customized to their needs, without requiring continued access to the explainer.

#### 2. Explanations can be very large

There are practical limitations to the length of a book, or the size of a lecture, but experts have the ability produce explanations much larger. A professor can explain the material of an entire course. A domain expert can explain the content of an entire discipline. Producing large explanations like these as one unit might confer certain benefits. A singly-authored work would have a common vocabulary and consistent approach that might make it easier to assimilate the various pieces. Large works might have room to capture subdisciplines and connections between disciplines that get lost when discussing more popular topics. Such a work might also capture the subtle decisions an expert makes in choosing how to structure their understanding of the corpus as a whole. Yet dealing with large explanations presents logistical difficulty. At the moment, they are hard to produce, and they are also hard to consume. It would take too long to find things in them manually, and beyond a certain scale, even the indexes and tables of contents would become too large to navigate. Yet perhaps we can borrow a helpful finding from computer science, which is that trees scale much more gracefully than lists. By composing large explanations out of a graph of trees, even a set with millions of paragraphs could be navigated in just a handful of steps. And while in a text one thing trades off with another, in a graph there is unlimited space. It also takes less effort to produce a graph, as one doesn't have to find one perfect sequence for the whole thing, but can just start making pieces and connecting them as one goes. So, by making it tractable to consume such large explanations, we might find that new kinds of "writing in the large" become possible.

#### 3. Mastery requires dense graphs, which are hard to serialize

Two people can know the same facts, but may have varying degrees of comfort and flexibility interacting with them. What distinguishes the expert is that they not only know many things, but they have many connections between them – one fact proves another, one event preceded another – and not only can they derive these relations, but very often they have them committed to memory, often in multiple places, to be accessed instantly without leaving the subject at hand. What results from this is a dense graph where every node has many edges. Yet dense graphs are very difficult to serialize, especially in narrative which favors forward-driving action to combinatorial interrelation. Additionally, when pressed for time or paper, authors have had to write only the essential facts, requiring the reader to do the "unpacking", finding derivative points and enumerating interconnections. Yet, there are many who would benefit from these rich edges who do not have the time or ability to derive them personally. Thus, there is very likely a chronic under-supply of this interconnective data in existing explanatory mediums. A solution would be to have the expert capture and produce their underlying graph, so that consumers have the ability to explore the redundant connections that form mastery at their leisure, hopefully increasing the fidelity and easy with which complicated ideas can be transferred.

Learning things in a certain order memorizes them that way?

#### 4. Every idea is an entity

When we speak about texts, we refer to books and articles, or specific chapters and sections. Yet every idea is an entity, fitting to be referenced and to own its own connections individually. So, we can make the unit of explanation the single idea, giving each idea a name and address, and at that address, put an explanation that imparts just the idea, its prerequisites, and the existence of a few adjacent points. Thus would we increase the precision with which we can store and request explanations, and the precision with which explanations can make internal reference from one part to another. Making the idea be the unit of explanation has other benefits as well. Whereas in a book or lecture the author might reference anything they mentioned previously, or anything they expect is prior knowledge, creating confusion if one missed the given point, when the unit of explanation is small and the required prior knowledge is enumerated explicitly, there is no room for misunderstanding or unclear references. Books and lectures are great for people who want to learn all the material covered, but they are often produced in such a way that it is difficult to take just one point from them without having seen everything that was mentioned earlier, whereas bundling each idea as a unit would allow a la carte browsing for people who have different needs and interests.

#### 5. Explanations are mergable

When we read several books on the same subject, most of us would be hard pressed to recall the exact ordering of the original sources. Yet we would generally remember who said what regarding a specific point. Thus, in the process of reading, we are "merging" the source texts, identifying points in common and facts that regard the same thing, and putting them all together in our minds. An expert might have done this for all of the writings of their discipline. Having access to such a structure could give us the lay of the land for a wide domain without the exclusive bias of any single party. Yet capturing the result of such a process in writing would be difficult. It would be very large, composed of many nested back-and-forths, and given limited space, one would have to make controversial decisions about which points to give detail or mention first. Graph-based approaches don't have these limitations, as graphs are already non-linear, inherently have no order or favoritism, and adding to one topic doesn't remove space or attention from another. Thus, graph-based mediums create the possibility for new types of source analysis and bibliography, ones that could fully digest other works and put them in conversation point by point, without having to take sides through emphasis or priority, creating a richer awareness of the range of views available.

#### 6. Memory requires hierarchy, so data should be hierarchical

Most writing takes the form of a list, one idea following another on a related theme. Yet lists are hard to remember. There is a size-limit to what we can consider at one time in working memory, and things not seen together in that window don't get connected, and so, after hearing a list of ten things, a person might have understood every one of them, but have no way of recalling the list itself. What people do remember are trees – a container with a few items, an item with a few parts, a part that has a few relations, and thereby one can store unlimited information while only ever dealing with one image at a time. Experts also create vast internal hierarchies composed of small images, levels of summary and intermediary groupings, but usually they omit these from their public explanations, thus depriving the audience of the very information that they would need to recall the data. To prevent this, we can disallow lists, and require that explanations be composed of small units in the form of a tree, each one making a single point and introducing several others, forming one memorable chunk. Such a structure would be self-summarizing, as every earlier subset would form a summary of everything that is below, and one without time to consume the whole thing could rest assured that whatever subset they do see, if consumed top-down, will reflect the broadest conception possible given their time constraints, unlike a book or lecture where one cannot leave early. Hierarchy would give the reader greater confidence that the author is speaking exhaustively rather than just giving a subset of points for a local reason, and the author could speak more efficiently knowing they will have more room to immediately clarify potential misunderstandings. The hierarchical format might also have benefits for pedagogical materials, allowing hints to be given before revealing answers, letting the reader fully understand a small unit before giving them more information, and allowing the author to include much greater clarification without bothering those who don't need it.

#### 7. Explanatory data is metadata

In a library, you have books and bookshelves. A bookshelf represents a category, and the books are the items that get put in the category. But in explanation, a certain point can be both book and bookshelf, a "book", to be stored in a category among related points, but also a "shelf" to be a place where additional information can be stored. We see this occur in speech, where a topic might be mentioned both in order to discuss it, but also to navigate to related topics. Thus, we could mimic this approach and use explanation as the classification scheme for explanation, instead of an index or table of contents, using natural language descriptions of what is available. Graphs allow content to be at multiple "locations" because they can be adjacent to multiple other things. Additionally, whereas some mediums must artificially limit the length and scope of content in order to fit within a fixed category set, graph data is the opposite, having more surface area at which to store things as the total number of things increases. With that greater surface area comes the ability to include certain kinds of tangential analysis which are currently stored in separate places, etymologies for every word, historical context for every idea, motivation for each technical concept, allowing every particular point to tap into general reusable explanation stock. There may be basic points that bear upon well-known ideas that have never reached circulation because there has been no way to put them adjacent to the point in question, and no place in turn to put points bearing on them, and so on, suggesting the potential for a much deeper level of analysis than has currently been possible in the public sphere.

#### 8. The page represents the state of the explanation

When a newcomer enters a conversation that is already in progress and is "brought up to speed", we usually don't recount for them the entirety of what was said previously. For them to be able to follow, it is usually enough to trace through some smaller number of points in order for them to understand the current topic. Thus does an explanation or conversation have a "state", a particular point in its progress that is simpler than the sum of prior information. By representing the session as a traversal of graph, every point can be expressed as a node in a tree, relevant because of its connection to a previous point, which was connected to a previous point. Paragraphs in books and articles are like this too, only germane in so far as they expand on a thing mentioned previously. Yet because books have the dual-responsibility both of communicating information clearly and also packing it together efficiently, we do not see clearly the chain of how a particular point connects to the original question. Worse, sometimes a later point leaves my original impression unaffected, creating fragmented understandings of the material. Digital mediums give us the ability to decouple these traditional roles, allowing the visible page to represent only the path from the original topic to the current point, without also having to represent the total set of points available. Thus can we achieve a new level of clarity, allowing the path of relevance to be the physical structure of the page, drilling into the mind of the reader how we got to the point in question, and hopefully making it more recallable for them via that path in future.

#### 9. References are intended to import, not redirect

Most links on the internet redirect the user to a new location, with a new address and visual context. Yet this does not seem like the intention of most natural language references. When I am speaking about a certain topic and reference something else, I usually do not intend to suggest we change the subject, but rather wish to "import" that concept here, ensuring familiarity with it in order for me to make some local point. Yet the user experience of the web doesn't reflect this, sending a person ten different places for ten things that might all be part of the same point. The alternative is to have the primary effect of hyperlinks in explanation be additive, appending information to the current page, rather than causing redirection. Additionally, if links require redirection and assimilation of a new page, I can't assume the reader will follow them, and thus putting something behind a link doesn't guarantee that people will see it, falling short of the goal of creating a space adjacent to every point where commentary will be seen. Such an interface would mimic the way in which an explanation or conversation "unfolds", staying moored to the original topic while wandering at the edges in different directions.

#### 10. Visual memory is stronger than verbal

It is possible to remember a large number of facts, but it is much easier to remember the contents of a physical space. Visual memory is much quicker to internalize a fact, and it is much quicker to recall from when needed. Yet prose explanation hardly takes advantage of this vast cognitive resource, presenting what is visually a one-dimensional list of points. Instead, by laying explanation out over multi-dimensional space, with this point connected to that point, and with this point being the means to another, we might be able to double-encode our verbal knowledge as spatial information, and thus greatly buttress thereby our ability to recall and navigate explanation.

## Getting Started

### Installation

Install CLI:

```
npm install -g canopy-js
```

### Starting a project

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

Add `bin/canopyd` to your path.

And for help remembering to increment the package.json version number when pushing git tags, symlink the git push hook:
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

To build assets from the client codebase, run:
```
npm run develop
```
