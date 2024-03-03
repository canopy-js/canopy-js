import './playground.scss';

let playgroundContainer = document.createElement('DIV');
playgroundContainer.id = 'playground-container';
document.body.appendChild(playgroundContainer);

let editorContainer = document.createElement('DIV');
editorContainer.id = 'editor-container';
playgroundContainer.appendChild(editorContainer);

let editor = document.createElement('TEXTAREA');
editor.id = 'editor'; // Added class
editorContainer.appendChild(editor);

let consoleElement = document.createElement('DIV');
consoleElement.id = 'console';
editorContainer.appendChild(consoleElement);
consoleElement.innerText = defaultConsoleText();
function defaultConsoleText() { return 'Edit the text area and then deselect to rebuild project. Delete text to restore default.';}

let scrollableContainer = document.createElement('DIV');
scrollableContainer.id = 'scrollable-container';
playgroundContainer.appendChild(scrollableContainer);

let canopyContainer = document.createElement('DIV');
canopyContainer.id = '_canopy';
scrollableContainer.appendChild(canopyContainer);

let newBulkFileString = localStorage.getItem('data') || defaultText();

localStorage.setItem('data', newBulkFileString);

editor.value = newBulkFileString;
editor.addEventListener('blur', (e) => setTimeout(() => rebuildCanopy(!!e)));
editor.addEventListener('focus', () => {
  if (consoleElement.classList.contains('error')) return;
  consoleElement.innerText = defaultConsoleText();
});

let BulkFileParser = require('../cli/bulk/bulk_file_parser');
let Topic = require('../cli/shared/topic');
import REQUEST_CACHE from 'requests/request_cache';
fetch = (url) => console.log(`Fetch request for '${url}' canceled by plaground`) || Promise.reject();
let Block = require('../cli/shared/block');
let Path; // calls getters before _canopy element is ready

rebuildCanopy(); // initial build

function rebuildCanopy(edit) {
  Array.from(canopyContainer.children).forEach(child => {
    if (child.tagName === 'SECTION' || child.tagName === 'H1') {
      canopyContainer.removeChild(child);
    }
  });

  try {
    editor.value = editor.value || defaultText();
    localStorage.setItem('data', editor.value);
    let bulkFileParser = new BulkFileParser(editor.value);
    let { newFileSet, defaultTopicPath, defaultTopicKey } = bulkFileParser.generateFileSet();
    defaultTopicKey ||= editor.value.split('\n').map(line => Block.for(line.match(/^\*?\*? ?(.*)/)[1]).key).find(key => key);
    let defaultTopic = Topic.for(defaultTopicKey);

    canopyContainer.dataset.defaultTopic = defaultTopic.mixedCase;
    canopyContainer.dataset.hashUrls = true;
    canopyContainer.dataset.projectPathPrefix = '';

    let jsonForProjectDirectory = require('../cli/build/components/json_for_project_directory');

    let directoriesToEnsure, filesToWrite;
    ({ directoriesToEnsure, filesToWrite } = jsonForProjectDirectory(newFileSet.fileContentsByPath, null, defaultTopicKey));
    consoleElement.classList.remove('error');
    consoleElement.innerText = '';

    if (edit) { // Remove old data
      for (let key in REQUEST_CACHE) {
        if (REQUEST_CACHE.hasOwnProperty(key)) {
          delete REQUEST_CACHE[key];
        }
      }
    }

    // Copy new data into the cache
    Object.keys(filesToWrite).forEach(filePath => {
      let { displayTopicName } = JSON.parse(filesToWrite[filePath]);
      REQUEST_CACHE[Topic.for(displayTopicName).mixedCase] = Promise.resolve(JSON.parse(filesToWrite[filePath]));
    });

    // New data might invalidate old URL
    Path = require('models/path').default;
    let path = Path.for(window.location.hash.slice(2));
    let firstTopic = path.firstTopic;

    if (firstTopic && !REQUEST_CACHE.hasOwnProperty(firstTopic.mixedCase)) { // URL invalid
      history.replaceState(null, null, location.pathname + location.search); // clear fragment
    }

    if (edit) Path.initial.display({ scrollStyle: 'instant' });

    consoleElement.innerText = defaultConsoleText();

    require('../client/canopy.js');
  } catch(e) {
    consoleElement.innerText = e.message;
    consoleElement.classList.add('error');
    canopyContainer.innerHTML = '<h1> Error </h1>'
    history.replaceState(null, null, location.pathname + location.search); // clear fragment in case of invalid URL
    return;
  }
}

function defaultText() {
  return `[Canopy/Playground]

* Playground: This is a demo of Canopy.js, a library for creating interactive explanations.
![Canopy.js Logo](./logo.png)
===
> [[Part 2|Okay]]
===

Part 2: Canopy generates interactive websites from an easy-to-use text format.
===
> [[Part 2-1|Okay]]
===

Part 2-1: This content is being generated from the text on the left, which can be edited live.
===
> [[Part 2-2|Cool]]
===

Part 2-2: In Canopy, selecting links adds more paragraphs to the page.
===
> [[Part 3|I see]]
===

Part 3: Paths in Canopy can go in multiple directions.
===
> [[Part 4|Like this]]
> [[Part 5|Or like this]]
> [[Part 6|Continue]]
===

Part 4: This is one direction. [[Part 4-1|Go deeper]].

Part 4-1: This is more info.

Part 5: This is another direction. [[Part 5-1|Go deeper]].

Part 5-1: This is even more info.

Part 6: Links and buttons can redirect the user to a different part of the tree.
===
> [[Part 6-1|Go here first]]
> [[Part 6-2|You'll be taken here]]
===

Part 6-1:
===
< [[Part 6-1-A|Go deeper]]
===

Part 6-1-A:
===
< [[Part 6-1-B|Go deeper]]
===

Part 6-1-B:
===
< [[Part 6-1-C|Go deeper]]
===

Part 6-1-C:
===
< [[#Part 6-2-C|Go somewhere else]]
===

Part 6-2:
===
> [[Part 6-2-A|Down]]
===

Part 6-2-A:
===
> [[Part 6-2-B|Down]]
===

Part 6-2-B:
===
> [[Part 6-2-C|Down]]
===

Part 6-2-C: Welcome to this other part!
===
> [[Part 7|Continue]]
===

Part 7: Why might you use Canopy?
===
> [[Part 7-1|Tell me!]]
===

Part 7-1: Canopy allows you to create explanations that are customized to each reader, like this:
===
> [[Part 7-2|I love detail]]
> [[Part 7-3|I hate detail!]]
===

Part 7-2: Here it is!

Part 7-3: You won't see any!
===
> [[Part 8|What else can it do?]]
===

Part 8: Canopy can help you create very large explanations.
===
> [[Part 8-1|What do you mean?]]
===

Part 8-1: Each paragraph here can mention several other ideas, like this:
- [[Idea \\#1]], [[idea \\#2]], [[idea \\#3]], [[idea \\#4]].
===
> [[Part 8-2|Okay]]
===

Idea #1: This is the first idea!

Idea #2: This is the second idea!

Idea #3: This is the third idea!

Idea #4: This is the fourth idea!

Part 8-2: And, each path can go very deep, like this: [[{idea \\#1}-2]]

Idea #1-2: And [[{idea \\#2}-2]]

Idea #2-2: And [[{idea \\#3}-2]]

Idea #3-2: And [[{idea \\#4}-2]]

Idea #4-2: That's very deep!
===
> [[Part 8-3|Okay]]
===

Part 8-3: So:
- Lets say each paragraph mentions four other ideas
- And, lets say a user can burrow down seven paragraphs in any direction
- How many paragraphs would that be total?
===
> [[Part 8-4|How many?]]
===

Part 8-4: That would be over 1,000,000 paragraphs!
===
> [[Part 8-5|That's a lot!]]
===

Part 8-5: It is! Now you can see how Canopy might help you organize very large explanations.
===
> [[Part 9|What else does it do?]]
===

Part 9: Canopy allows you to build explanations out of reusable components.
===
> [[Part 9-1|What does that mean?]]
===

Part 9-1: Here are two explanations that reference the same concept:
- [[Carbon]]
- [[Nitrogen]]
===
> [[Part 10|I'm finished]]
===

Carbon: Carbon is a [[chemical element]] that has the symbol \`C\` and the number 6.

Nitrogen: Nitrogen is a [[chemical element]] that has the symbol \`N\` and the number 7.

Part 10: Great! Now lets see how entirely different explanations  can end up using the same content.
===
> [[Part 10-1|Ok]]
===

Part 10-1: Here is an explanation of the [[Atlantic Ocean]].
- Try *holding the option or alt key* and clicking the link above.
===
> [[Part 11|I'm finished]]
===

Part 11: *Welcome back!* See, we've returned to where we started before all that Oceans business.
===
> [[Part 11-1|Great!]]
===

Part 11-1: So, now you've seen the main feature set of Canopy.
===
> [[Part 11-2|Correct]]
===

Part 11-2: So, you’re probably thinking, “Amazing! But, what would I actually use this for?”
===
> [[Part 11-3|True]]
===

Part 11-3: The answer is, Canopy is a good fit for any domain that is:
1. Detailed
2. Broad
3. Highly-interconnected
4. Where different users need meaningfully different information from the same corpus
===
> [[Part 12|Interesting]]
===

Part 12: Lets see some examples.
===
> [[Part 12-2|Okay]]
===

Part 12-2: *Example 1/7:* Canopy might be a good fit for interconnected historical information.
===
> [[World Wars|Let’s see]]
> [[Part 12-3|Next]]
===

Part 12-3: *Example 2/7:* Another application area is documenting large software projects.
===
> [[MailerApp|Let’s see]]
> [[Part 12-4|Next]]
===

Part 12-4: *Example 3/7:* Canopy could also be useful for large personal writing projects.
===
> [[Blogs|More]]
> [[Part 12-5|Next]]
===

Part 12-5: *Example 4/7:* Canopy could be useful for “merging” the points made in various primary sources.
===
> [[Noise pollution law|Let’s see]]
> [[Part 12-6|Next]]
===

Part 12-6: *Example 5/7:* Canopy could be used to organize information about cities.
===
> [[Cities|Let’s see]]
> [[Part 12-7|Next]]
===

Part 12-7: *Example 6/7:* Canopy could be used for memorization.
===
> [[Memorization|Let’s see]]
> [[Part 12-8|Next]]
===

Part 12-8: *Example 7/7:* Canopy could be used as a tool in libraries.
===
> [[Libraries|Let’s see]]
> [[Part 13|Finish]]
===

Part 13: 👋 That's all for now! Click here to [learn more about Canopy.js](https://github.com/canopy-js/canopy-js) or get in touch at \`hello at canopyjs dot org\`.

[MailerApp]

* MailerApp: “MailerApp” is a tool for managing email lists.
===
- [[History]]
- [[Features]]
- [[Patterns]]
- [[Code]]
===

History: MailCorp's history includes the [[1998 BigCorpCustomer Feature Request]].

1998 BigCorpCustomer Feature Request:
On May 1st 1998 BigCorpCustomer asked to be able to send emails, and so we decided to implement the [[{#|}{{message scheduling}} feature]]
===
> [[Playground#Part 12-4|Done]]
===

Features: A major feature of MailerApp is [[message scheduling]].

Message scheduling: Message scheduling is when a user logs in to the app, creates a message, and schedules it to be sent.
- This functionality is implemented using a [[#sending queue]]
- The message scheduling functionality was designed in response to the [[#1998 BigCorpCustomer Feature Request]]
===
> [[Playground#Part 12-4|Done]]
===

Patterns: The app uses certain design patterns to produce the feature set.
- One such pattern is the [[MailerApp {{sending queue}}]].

Sending queue: MailerApp uses a “sending queue” to allow a user to schedule emails to be sent.
- The job of the queue is to keep track of a list of messages the user has scheduled, and whether they have been sent yet.
- The queue must be checked periodically to see if there are unsent messages, and to send them.
- These concepts are implemented in the using [[#SendWorker class]] and the [[#PendingMessages database table]]
===
> [[Playground#Part 12-4|Done]]
===

Code: The code base has a [[\`SendWorker\` class]], and a [[\`PendingMessages\` database table]].

SendWorker class: The \`SendWorker\` class periodically checks the \`PendingMessages\` table of the database and makes a SMPT request when it sees a record with \`sent\` set to false.
- The \`SendWorker\` class relies on the [[#PendingMessages database table]].
- The \`SendWorker\` class is part of the implementation of the app's [[#sending queue]]
===
> [[Playground#Part 12-4|Done]]
===

PendingMessages database table: There is a \`PendingMessages\` database table:
- The \`PendingMessages\` table has a \`text\` field for the text of the email.
- The \`PendingMessages\` table has a \`sent\` boolean field to indicate whether the message has been sent yet.
- The PendingMessages table is used by the [[#SendWorker class]]
- The SendWorker class is part of the implementation of the app's [[#sending queue]]
===
> [[Playground#Part 12-4|Done]]
===


[Oceans]

* Atlantic Ocean: Now we have started a new explanation about the Atlantic Ocean!
- (The *second* time you see this text, click [[Part 10-3|here]].)
===
> [[Part 10-1|Click here first]]
===
![Atlantic Ocean](https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/1710_De_La_Feuille_Map_of_Africa_-_Geographicus_-_Africa-lafeuille-1710.jpg/1920px-1710_De_La_Feuille_Map_of_Africa_-_Geographicus_-_Africa-lafeuille-1710.jpg "Atlantic Ocean" "Credit Wikipedia")

Part 10-1: The Atlantic ocean connects via the Panama Canal to the [[Pacific Ocean]].
- Try clicking the link above normally.

Part 10-3: We went in a circle and ended up back where we started!
===
> [[Part 10-4|Wow!]]
===

Part 10-4: Explanations starting from different points can end up covering the same material!
- Click the button below for a dramatic return to our original location:
===
> [[Playground#Part 11|Great, now take me back]]
===


* Pacific Ocean: Now we have begun an explanation of the Pacific Ocean:
![Pacific Ocean](https://upload.wikimedia.org/wikipedia/commons/4/4e/Ortelius_-_Maris_Pacifici_1589.jpg "Atlantic Ocean" "Credit Wikipedia")
===
> [[Part 10-2|Great!]]
===

Part 10-2: Now lets start the explanation from [[Pacific Ocean]].
- The *second time* you see this, click [[Part 10-3|here]]
- Try clicking the above link *holding alt or option*.

Part 10-3: The Pacific ocean connects via the Panama Canal to the [[Atlantic Ocean]].
- Try clicking that link normally.


[NYC]

* Cities: Canopy can organize historical information geographically. Let’s see an example:
===
- [[New York City]]
===

* New York City: New York City has various neighborhoods.
===
- [[Greenwich Village]]
- [[Midtown Manhattan]]
===

* Greenwich Village: Greenwich Village has various historic landmarks.
===
- [[Jefferson Market Library]]
===

* Jefferson Market Library: Jefferson Market library is a library in [[Greenwich village]].
- Jefferson Market library is housed in the repurposed building of [[Jefferson Market Courthouse]].
===
> [[Playground#Part 13|Finish]]
===

* Midtown Manhattan: Midtown is a major neighborhood in Manhattan with various landmarks.
===
- [[Madison Square Garden]]
===

* Madison Square Garden: Madison Square Garden has been the name of three stadiums in [[midtown Manhattan]].
===
- [[“Second” Madison Square Garden]]
===

* “Second” Madison Square Garden: The second Madison Square garden was a Manhattan stadium operating 1890–1926.
![Second Madison Square Garden](https://upload.wikimedia.org/wikipedia/commons/a/af/Interior_of_Madison_Square_Garden_at_night%2C_from_Robert_N._Dennis_collection_of_stereoscopic_views_crop.jpg "Second Madison Square Garden" "1905, [Source](https://en.wikipedia.org/wiki/Madison_Square_Garden_(1890)#/media/File:Interior_of_Madison_Square_Garden_at_night,_from_Robert_N._Dennis_collection_of_stereoscopic_views_crop.jpg)")
- The second Madison Square Garden was built 26th Street and Madison Avenue of [[Midtown Manhattan]].
- The stadium was built by architect Stanford White.
- Madison Square Garden was also the site of [[Stanford White's death]].
===
> [[Playground#Part 13|Finish]]
===

* Stanford White’s death:
In 1906 Archetect Stanford White was shot by Harry Kendall Thaw.
- This was due to White’s relationship with Shaw’s wife Evelyn Nesbit.
- The attack occurred on the roof of the [[{{second Madison Square Garden}} building]].
- The trial was held in [[Jefferson Market Courthouse]].
- The story was adapted to novel and stage as Ragtime.
===
> [[Playground#Part 13|Finish]]
===

* Jefferson Market Courthouse: Jefferson Market Courthouse was a city court situated at 10th Street and 6th Avenue on the border of Greenwich Village, Manhattan.
![Jefferson Market Courthouse](https://www.nypap.org/wp-content/uploads/2016/04/JeffersonMarketCourthouse.jpg "Jefferson Market Courthouse" "1960, Cervin Robinson / Library of Congress, [Source](https://www.nypap.org/preservation-history/jefferson-market-courthouse/)")
- Jefferson Market Courthouse had jurisdiction over crimes occurring in [[Midtown Manhattan]].
- Jefferson Market Courthouse was the location of "the trial of the century" judicating [[Stanford White's death|the death of architect Stanford White]].


[Noise Pollution]

* Noise pollution law: The Townsville Herald has publishd three op-eds on the subject of the noise pollution law.
- [[Op-ed \\#1]]
- [[Op-ed \\#2]]
- [[Op-ed \\#3]]
Let’s take all the points these articles make and merge them into one tree.
===
> [[Noise pollution tree|See merger]]
> [[Playground#Part 12-6|Finished]]
===

Op-ed #1: This is op-ed #1, written by Coolidge Cunningham.
> To whom it may concern:
> It was with my great pleasure that I heard news of the city council's discussion of a noise pollution bill. As a long-time resident of Townsville, I have for many years been encumbered by the unpleasant musical selections of my neighbors.
> The playing of loud music disrupts sleep which costs the town valuable economic productivity. Moreover, it disrupts family meals and communal gatherings.
> It may be seen as an incursion on the freedoms of residents to ban loud music, however, it is mainly necessary during the town's busy holiday season, and residents can always use headphones.
> In my opinion, even music as quiet as that of speaking voice, around 60 decibels, should be banned, and it should be active at all times of day, as some people work night shifts and are asleep during that time.
>
> All the best,
> Mr\\. Coolidge Cunningham

Op-ed #2: This is op-ed #2, written by Jill Jamaica.
> Hello Townsville neighbors.
> I was very surprised to hear discussion of a music ban in the paper. In my view, this is a total non-issue. People who don't like music can always wear earplugs. This policy erodes the freedoms of Townsville residents, and is a slippery slope to police regulation of all private activity.
> Supports of the law are ignoring the importance of public music-playing in giving our town its distinctive cultural flavor.
> I don't think the policy is necessary, but if it is passed, I feel strongly that it should only apply very late at night, for example between 11PM and 5AM when most people are sleeping.
> Thanks, Jill

Op-ed #3: This is op-ed #3, written by Amble Orangutan.
> My thanks are due to the Townsville Herald for orchestrating such an interesting series of writings on the city noise bill!
> My feelings are mixed. On the one hand, I see the benefit of such a bill as benefiting early sleepers of Townsville.
> I second sentiments that the bill should focus on the summer tourist season, as during the spring harvest, it might hamper necessary agricultural activity that cannot be done in a quiet way. Additionally, I don't think we need private citizens to play music in order to produce a distinctive culture as we have many other distinctive features.
> Given that the police of Townsville are trusted members of the community and that it is such a small town, I do not think the legislation would expand into greater restrictions.
> Lastly, I think the bill should target only the loudest noises, such as in the 100 decibel range, as we do not have the police presence to regulate more than that.
> Yours, Amble

Noise pollution tree:
Townsville is considering a law to ban noise pollution.
===
- [[Arguments for the law]]
- [[Arguments against the law]]
- [[Discussion of details]]
===

Arguments for the law: Residents of Townsville have put forward various arguments for a noise pollution law.
- One suggested benefit of the ban regarded [[economics]].
- Another benefit mentioned regarded [[assemblies]].

Economics:
One benefit of the legislation mentioned involves economics:
- Mr. Cunningham lists economic productivity resulting from greater sleep as an argument for the law.
  - However, Mr. Orangutan points out that a broad noise ban might impede necessary agricultural work during the local harvest.
  - Additionally, Ms. Jamaica points out that affected persons can wear earplugs, protecting sleep without a ban.
  - The 11PM-5AM compromise mentioned by Ms. Jamaica might be sufficient to handle sleep-related concerns.
===
> [[Playground#Part 12-6|Finished]]
===

Assemblies:
One benefit of the legislation mentioned involves assemblies:
- Mr Cunningham mentions disruption of family meals and communal gatherings.
  - That would be an issue for which Ms. Jamaica's suggestion of earlugs would not suffice.
  - The 11PM-5AM compromise mentioned by Ms. Jamaica would not help for such get-togethers.
===
> [[Playground#Part 12-6|Finished]]
===

Arguments against the law: Residents of Townsville have put forward various arguments against a noise pollution law.
Residents of Townsville have put forward various arguments against a noise pollution law.
- One argument against the law regarded [[restriction of freedom]].
- Another argument against the law regarded [[town culture]].

Restriction of freedom:
One argument raised against the proposal is that it restricts the freedom of town residents:
- Ms. Jamaica mentions that the law might create a precedent for regulating the private lives of Townsville residents.
  - Mr. Orangutan opines that the small size of Townsville makes spiraling regulation less likely.
  - Mr. Orangutan mentions that close resident-police relationships also makes the concern less pressing.
  - Mr. Cunningham suggests that a narrow holiday-season ban would not be such a restriction on freedoms.
===
> [[Playground#Part 12-6|Finished]]
===

Town culture:
One argument raised against the proposal is that public music playing produces a distinctive town culture:
- Ms. Jamaica makes such an argument in her op-ed.
  - Mr. Orangutan suggests that public music-playing is not necessary to have a distinctive town culture due to the town's many other qualities.

Discussion of details: The residents of Townsville have argued about the details of the noise pollution law.
===
- [[Volume]]
- [[Time of day]]
- [[Seasons]]
===

Volume: Residents of Townsville have debated the ideal maximum volume of a noise pollution law.
- Mr. Cunningham wanted a wide-ranging ban of sounds louder than 60 decibels.
- Mr. Orangutan wanted a more limited ban of only noises over 100 decibels.
  - This was due to the suggestion that there aren't enough police to enforce a wider ban.
- Ms. Jamaica opposed a ban of any volume.
===
> [[Playground#Part 12-6|Finished]]
===

Time of day: Residents of Townsville have debated what time the noise pollution law should be active.
- Some supported [[an {{all-day ban}}]].
- Some suggested [[late-night-only ban]].

All-day ban:
Some Townsville residents support an all-day noise ban:
- Mr Cunningham suggested that the ban should cover all times of day.
  - This was because some people work night shifts and sleep during the day.
  - Additionally, Mr. Cunningham lists family meals and communal gatherings as a reason for the ban, and these occur at various times requiring a broad ban.

Late-night-only ban:
Some Townsville residents support only a late-night noise ban:
- Ms. Jamaica opposed any ban, but suggested a compromise of a ban covering only 11PM-5AM.
  - This would satisfy some of Mr. Cunningham's concern for disrupted sleep.
  - However, this would not assuage his concerns about noise disrupting family meals and communal get-togethers.
===
> [[Playground#Part 12-6|Finished]]
===

Seasons:
Residents of Townsville have debated what seasons of the year the noise pollution law should apply.
- Mr. Cunningham who supports a strong ban nevertheless only thinks one is necessary during the summer tourist season.
- Mr. Orangutan adds a reason for a summer-specific ban, namely that a ban in springtime might impede the loud but necessary agricultural harvest.
===
> [[Playground#Part 12-6|Finished]]
===

[World Wars]

* World wars:
For example:
- [[World War I]]
- [[World War II]]
===
> [[Playground#Part 12-3|Finished]]
===

World War I: World War I was a conflict that lasted from 1914–1918.
===
- [[Results of WWI]]
===

Results of WWI: The Treaty of Versailles which forced Germany to accept blame and financial obligations for the war, is cited as one of the [[#causes of WWII]]
===
> [[Playground#Part 12-3|Finished]]
===

World War II: World War II was a conflict that lasted from 1939-1945.
===
- [[Causes of WWII]]
===

Causes of WWII: A prime cause of WWII was the Treaty of Versailles, which heavily penalized Germany for its participation in WWI.
- The Treaty of Versailles was one of the major [[#results of WWI]]
===
> [[Playground#Part 12-3|Finished]]
===


[Blogs]

Blogs: The concept of a personal blog has become very common.
- However, an author may make the same point many times.
- Additionally, certain useful points might not merit a full article.
- Also, certain topic connections may be too dense to capture in an article.
- Finally, the author may have more to say than fits in a book.
===
> [[Blogs 2|Okay]]
===

Blogs 2: So, Canopy would let an author organize all of their views in one place.
- Each reader would get a customized trail through many points, like a conversation with the author.
- The author would only have to write each thing once, but many readers would see each point in different contexts.
- Canopy would enable new types of larger written work, eg an academic's summary of all the work in their field or discipline, better approximating the experience of having access to the given person.
===
> [[Blogs 3|Okay]]
===

Blogs 3: Let’s see an example. Blogger “Maynard” wants to explain daily news in light of economic theory.
===
> [[Maynard|Okay]]
> [[Playground#Part 12-5|I'm finished]]
===

* Maynard: Welcome to Maynard's Canopy blog, "The Main Yard."
===
- [[Read about news]]
- [[Read about concepts]]
===

* Read about news:
Here are some recent news stories:
===
- [[7\\/12: Townsville unveils recycling incentive]]
- [[7\\/5: Cat-themed toys selling at discount]]
- [[7\\/22: Bread prices rise in summer]]
===

* 7/12\\: Townsville unveils recycling incentive:
From the Townsville Herald (7/12):
> The city of Townsville recently unveiled a new incentive for residents to recycle.
> Starting Monday, residents who bring their used beer bottles to the department of public works will have the original cost of the beer fully covered.
> This incentive is expected to increase participation in the town's existing recycling initiatives.
===
- [[Commentary]]
===

Commentary:
Maynard: This would be a good time to learn about the concept of “incentives.”
- Specifically perverse incentives, where a reward for a certain behavior can increase that behavior more than the regulator intended.
- Here, Townsville thinks that they are incentivizing recycling, when in fact their incentive is so generous, they may increase the consumption of beer itself, causing a lot of unintended side-effects.
===
- [[Learn more about<br>{{incentives}}]]
- [[Maynard|Back to top]]
===

* 7/5\\: Cat-themed toys selling at discount:
From the Townsville Journal (7/5):
> Who would have ever predicted it? Last year at this time, we reported a surge in prices for cat-themed childrens’ toys. Backpacks, socks, dolls, anywhere a parent could look, this trend was dominating the market.
> This summer, however, these goods are being found for prices even less than unbranded merchandise.
> One might claim that this is due to a change in fads, but our reporters have documented that Townsville schools are as full of cat-themed clothing as ever.
> It would seem as though Townsville is experiencing a market-mystery.
===
- [[Commentary]]
===

Commentary:
Maynard: This mystery might be easily solved.
- Why might a good that is still popular go down in price? This might be a classic example of overproduction leading to oversupply.
- Even if demand has increased for cat-themed goods, if too many producers got in on the trend, it could be that the supply increased more than demand.
- This would cause prices to decrease despite the increase in demand.
===
- [[Learn more about<br>{{supply and demand}}]]
- [[Maynard|Back to top]]
===

* 7/22\\: Bread prices rise in summer:
From the Townsville Gazette (7/22):
> Bread prices in Townsville have reached an all-time high this summer, with a loaf of sourdough reaching $11, up from $4.50 last year at this time.
> Analysts have blamed the price increase of bread on underlying increases in the price of wheat, which is also rising to all-time highs this summer.
===
- [[Commentary]]
===

Commentary:
Maynard: And why might the price of wheat be increasing?
- Well, wheat can be used for bread or for beer. When Townsville recently increased its [[7\\/12\\: Townsville unveils recycling incentive|incentives for beer-bottle recycling]], it may have unwittingly increased demand for beer significantly.
- When demand increases for a product that requires a resource like wheat, all other products that use that resource also go up in price.
- So, this news story is a classic example of economic scarcity.
===
- [[Learn more about<br>economic {{scarcity}}]]
- [[Maynard|Back to top]]
===

* Read about concepts:
Here are some economic concepts and news stories that demonstrate them:
===
- [[Incentives]]
- [[Scarcity]]
- [[Supply and Demand]]
===

* Incentives: In economic theory, incentives are when a regulator or private actor offers a reward or punishment for another party to engage in a certain action.
- Incentives are a way of encouraging or discouraging a given behavior.
- Incentives can accidentally become [[perverse incentives]].

* Perverse Incentives:
Perverse incentives are a type of [[incentives|economic incentive]].
- Perverse incentives occur when a regulator encourages a behavior accidentally, resulting in behavior that goes counter to the regulator's goal.
- A classic example of a perverse incentive would be a town paying people to kill snakes, leading to the breeding of snakes to receive the incentive.
===
- [[{Examples in the news} of perverse incentives]]
===

Examples in the news of perverse incentives:
Here are examples in the news of perverse incentives:
- [[7\\/12: Townsville unveils recycling incentive]]

* Scarcity: Scarcity is the concept that many economic resources are limited, and decisions must be made regarding how to allocate them.
- A corollary of the concept of scarcity is that use of a resource for one application trades off with its use for other applications.
- An example would be that water can be used for household showers, or for agriculture, and if water is limited one might trade off with the other.
===
- [[{Examples in the news} of scarcity]]
===

Examples in the news of scarcity:
Here are examples in the news of scarcity:
- [[7\\/22: Bread prices rise in summer]]


* Supply and Demand: “Supply and demand” is a fundamental concept of economics.
- The theory of supply and demand suggests that prices are dictated by the interplay between how many people want to purchase a good and how many people have it to sell.
- Higher demand for a good allows producers to sell it for a higher price.
- Higher supply of a good allows buyers to find it for less money.
- Actual prices would be a result of these two market forces.
===
- [[{Examples in the news} of supply and demand]]
===

Examples in the news of supply and demand:
Here are examples in the news of supply and demand:
- [[7\\/5: Cat-themed toys selling at discount]]


[Memorization]

* Memorization: Canopy can help people memorize and retain information.
===
> [[Memorization 2|How so?]]
===

Memorization 2: This is because spatial memory is one of the strongest forms of memory, and Canopy organizes large quantities of information in spatial relation.
===
> [[Memorization 3|How so?]]
===

Memorization 3: Because Canopy organizes information in trees, millions of ideas can be visually presented within seven steps from one another.
===
> [[Memorization 4|Let’s see an example]]
===

Memorization 4: Let's try to remember some information, first without Canopy, and then with it.
===
- [[Without Canopy]]
- [[With Canopy]]
===

Without Canopy:
Please try to remember the following emoji sequence:<br><br>
<div style="font-size: 80px">☃️🌹⭐️🐠🧳☂️🕶🐶🦋👖🧣🧤🧦🩴🎒👟👑🎓🧢💍</div>
===
> [[Without Canopy 2|That’s hard]]
===

Without Canopy 2: Okay, well try it with Canopy.
===
> [[#With Canopy]]
===

With Canopy: Let’s divide the emojis into “spatial” subcategories.
|[[A|<div style="font-size: 60px">☃️</div>]]|[[B|<div style="font-size: 60px">🌹</div>]]|
|[[C|<div style="font-size: 60px">⭐️</div>]]|[[D|<div style="font-size: 60px">🐠</div>]]|

A:
|<div style="font-size: 80px">🧳</div>|<div style="font-size: 80px">☂️</div>|
|<div style="font-size: 80px">🕶</div>|<div style="font-size: 80px">🐶</div>|
Does that seem easier?
===
> [[Canopy Memorization|A bit]]
===

B:
|<div style="font-size: 80px">🦋</div>|<div style="font-size: 80px">👖</div>|
|<div style="font-size: 80px">🧣</div>|<div style="font-size: 80px">🧤</div>|
Does that seem easier?
===
> [[Canopy Memorization|A bit]]
===

C:
|<div style="font-size: 80px">🧦</div>|<div style="font-size: 80px">🩴</div>|
|<div style="font-size: 80px">🎒</div>|<div style="font-size: 80px">👟</div>|
Does that seem easier?
===
> [[Canopy Memorization|A bit]]
===

D:
|<div style="font-size: 80px">👑</div>|<div style="font-size: 80px">🎓</div>|
|<div style="font-size: 80px">🧢</div>|<div style="font-size: 80px">💍</div>|
Does that seem easier?
===
> [[Canopy Memorization|A bit]]
===

* Canopy Memorization: Well it’s still going to be work, but memorizing spatially related information is definitely easier than memorizing a regular list.
===
> [[Part 2|Ok]]
===

Part 2: When reading information in Canopy, information is presented spatially as a network of small bite-sized ideas.
- This makes it easier to internalize and recall, and to find something again later.
===
> [[Playground#Part 12-8|Got it]]
===

[Libraries]

* Libraries: Let’s look at an example.
===
- [[Science]]
- [[News]]
- [[Lifestyle]]
===

* Science:
===
- [[Neuroscience]]
===

Neuroscience:
===
- [[Brain Regions]]
===

Brain Regions:
===
- [[Amygdala]]
===

Amygdala:
===
- [[Functions of Amygdala]]
===

Functions of Amygdala:
===
- [[Amygdala as Pain Center]]
===

Amygdala as Pain Center:
The Amygdala is involved in pain perception.
- So much so, it is even active in the experience of social pain [[(Dewall 2010)]].

* News:
===
- [[Academic News]]
===

Academic News:
===
- [[Recent Publications]]
===

Recent Publications:
===
- [[Psychology Publications]]
===

Psychology Publications:
===
- [[Psychological Science journal]]
===

Psychological Science journal:
===
- [[Psychological Science {July 2010}]]
===

Psychological Science July 2010:
The July 2010 issue of the Association for Psychological Science's “Psychological Science” journal included:
- [[Dewall 2010|Dewall et al: Acetaminophen reduces social pain: behavioral and neural evidence]]


* Lifestyle:
===
- [[Lifehacks]]
===

Lifehacks:
===
- [[Dealing with negative emotions]]
===

Dealing with negative emotions:
===
- [[Dealing with social rejection]]
===

Dealing with social rejection:
Most individuals will experience social rejection at various points in life.
- Social rejection produces pain similar to physical pain.
- Long-term solutions involve finding supportive social groups and increasing personal resilience.
- In the short-term, research has shown that pain killers like acetaminophen used in moderation can reduce even socially-caused pain [[(Dewall 2010)]].


* Dewall 2010: Appearing in _Psychological Science_ July 2010, C Nathan Dewall and coauthors published “Acetaminophen reduces social pain: behavioral and neural evidence.” [(Link)](https://pubmed.ncbi.nlm.nih.gov/20548058)
<br><br>Abstract:
> Pain, whether caused by physical injury or social rejection, is an inevitable part of life. These two types of pain-physical and social-may rely on some of the same behavioral and neural mechanisms that register pain-related affect. To the extent that these pain processes overlap, acetaminophen, a physical pain suppressant that acts through central (rather than peripheral) neural mechanisms, may also reduce behavioral and neural responses to social rejection.
> In two experiments, participants took acetaminophen or placebo daily for 3 weeks. Doses of acetaminophen reduced reports of social pain on a daily basis (Experiment 1). We used functional magnetic resonance imaging to measure participants' brain activity (Experiment 2), and found that acetaminophen reduced neural responses to social rejection in brain regions previously associated with distress caused by social pain and the affective component of physical pain (dorsal anterior cingulate cortex, anterior insula).
> Thus, acetaminophen reduces behavioral and neural responses associated with the pain of social rejection, demonstrating substantial overlap between social and physical pain.
===
> [[Libraries|Try different path]]
> [[Playground#Part 13|Finish]]
===

[Chemistry]

* Chemical Element: A chemical element is a substance that cannot be broken down further by chemical reactions.`;
}
