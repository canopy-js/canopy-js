let jsonForProjectDirectory = require('./json_for_project_directory');
let dedent = require('dedent-js');
let chalk = require('chalk');

test('it creates a data directory', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': 'Idaho: Idaho is a midwestern state.\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(directoriesToEnsure).toEqual(['build/_data']);
});

test('it creates text tokens', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': 'Idaho: Idaho is a midwestern state.\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic": {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state.",
            "type":"text"
          }
        ]
      }
    }
  );
});

test('it matches local references', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. Idaho has a [[state capital]].

      State Capital: The state capital of Idaho is Boise.` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state. Idaho has a ",
            "type":"text"
          },
          {
            "text": "state capital",
            "type": "local",
            "targetSubtopic": "State Capital",
            "targetTopic": "Idaho",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "state capital",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ],

        "State Capital": [
          {
            "text" : "The state capital of Idaho is Boise.",
            "type":"text"
          }

        ]
      }
    }
  );
});

test('it matches local with question marks', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. [[Why choose Idaho for your business needs?]]

      Why choose Idaho for your business needs? This sentence also has a question mark - ?` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state. ",
            "type":"text"
          },
          {
            "text": "Why choose Idaho for your business needs?",
            "type": "local",
            "targetSubtopic": "Why choose Idaho for your business needs?",
            "targetTopic": "Idaho",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Why choose Idaho for your business needs?",
                 "type": "text",
               },
             ]
          }
        ],

        "Why choose Idaho for your business needs?": [
          {
            "text" : "This sentence also has a question mark - ?", // to ensure we match only the first ? as part of the key
            "type": "text"
          }

        ]
      }
    }
  );
});

test('it matches local references with commas', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. Idaho has a [[state capital, and governor]].

      State capital, and governor: The state capital of Idaho is Boise and it has a governor.` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state. Idaho has a ",
            "type":"text"
          },
          {
            "text": "state capital, and governor",
            "type": "local",
            "targetSubtopic": "State capital, and governor",
            "targetTopic": "Idaho",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "state capital, and governor",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ],

        "State capital, and governor": [ // commas are legal key characters
          {
            "text" : "The state capital of Idaho is Boise and it has a governor.",
            "type":"text"
          }

        ]
      }
    }
  );
});

test('it matches local references with periods not followed by spaces', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. Idaho has a [[capital.js]].

      Capital.js: The state capital of Idaho is Boise and it has a governor.` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state. Idaho has a ",
            "type":"text"
          },
          {
            "text": "capital.js",
            "type": "local",
            "targetSubtopic": "Capital.js",
            "targetTopic": "Idaho",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "capital.js",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ],

        "Capital.js": [ // commas are legal key characters
          {
            "text" : "The state capital of Idaho is Boise and it has a governor.",
            "type":"text"
          }

        ]
      }
    }
  );
});

test('it does not match local references with periods', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. Idaho has a [[State capital. and governor]].

      State capital. and governor: The state capital of Idaho is Boise and it has a governor.` + '\n'

  };
  expect(() => jsonForProjectDirectory(explFileData, 'Idaho', {})).toThrow(chalk.red(
    'Error: Reference [[State capital. and governor]] in [Idaho] matches no global, local, or import reference.\n' +
    'topics/Idaho/Idaho.expl:1:49'
  ));
});

test('it matches global references', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, like ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ]
      }
    }
  );

  expect(JSON.parse(filesToWrite['build/_data/Wyoming.json'])).toEqual(
    {
      "displayTopicName": "Wyoming",
      "topicTokens": [
         {
          "text": "Wyoming",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Wyoming": [
          {
            "text" : "Wyoming is a midwestern state.",
            "type":"text"
          }
        ]
      }
    }
  );
});

test('it matches global references using explicit syntax to override local reference creation', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, which contains [[Wyoming]] the small town, and is like [[Wyoming#Wyoming]] the US State.

    Wyoming: There is a small town in Idaho called Wyoming, which is different than the US state of Wyoming.`,

    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, which contains ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "local",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Idaho",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : " the small town, and is like ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : " the US State.",
            "type":"text"
          }
        ],

        "Wyoming": [
          {
            "text": "There is a small town in Idaho called Wyoming, which is different than the US state of Wyoming.",
            "type": "text",
          }
        ],
      }
    }
  );

  expect(JSON.parse(filesToWrite['build/_data/Wyoming.json'])).toEqual(
    {
      "displayTopicName": "Wyoming",
      "topicTokens": [
         {
          "text": "Wyoming",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Wyoming": [
          {
            "text" : "Wyoming is a midwestern state.",
            "type":"text"
          }
        ],
      }
    }
  );
});

// Custom link display texts

test('it lets you give arbitrary display names to references like [[a|b]]', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming|the Cowboy State]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, like ",
            "type":"text"
          },
          {
            "text": "the Cowboy State",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "the Cowboy State",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          }
        ],
      }
    }
  );
});

test('it lets you select an exclusive display substring like [[{the answer} to the question]]', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[the state of {Wyoming}]].\n`,
    'topics/Wyoming/The_state_of_Wyoming.expl': `The state of Wyoming: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, like ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "The state of Wyoming",
            "targetTopic": "The state of Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          }
        ],
      }
    }
  );
});

test('it lets you select multiple exclusive display substrings like [[{the }US {postal service}]]', () => {
  let explFileData = {
    'topics/US/Services.expl': `Services: Americans like [[{the }US {postal service}]].\n`,
    'topics/US/The_US_postal_service.expl': `The US postal service: The US has a postal service.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Services.json'])).toEqual(
    {
      "displayTopicName": "Services",
      "topicTokens": [
         {
          "text": "Services",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Services": [
          {
            "text" : "Americans like ",
            "type":"text"
          },
          {
            "text": "the postal service",
            "type": "global",
            "targetSubtopic": "The US postal service",
            "targetTopic": "The US postal service",
            "enclosingTopic": "Services",
            "enclosingSubtopic" : "Services",
            "tokens": [
              {
                 "text": "the postal service",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          }
        ],
      }
    }
  );
});

test('it lets you select multiple exclusive display substrings with interpolation like [[{the |a }US {postal service}]]', () => {
  let explFileData = {
    'topics/US/Services.expl': `Services: The US has [[{the |a }US {postal service}]].\n`,
    'topics/US/The_US_postal_service.expl': `The US postal service: The US has a postal service.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Services.json'])).toEqual(
    {
      "displayTopicName": "Services",
      "topicTokens": [
         {
          "text": "Services",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Services": [
          {
            "text" : "The US has ",
            "type":"text"
          },
          {
            "text": "a postal service",
            "type": "global",
            "targetSubtopic": "The US postal service",
            "targetTopic": "The US postal service",
            "enclosingTopic": "Services",
            "enclosingSubtopic" : "Services",
            "tokens": [
              {
                 "text": "a postal service",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          }
        ],
      }
    }
  );
});

test('it adds to the error message for manual display strings clarifying the resolved target', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[the state of {Wyoming}]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`

  };

  expect(() => jsonForProjectDirectory(explFileData, 'Idaho', {})).toThrow(chalk.red(
    `Error: Reference [[the state of {Wyoming}]] in [Idaho] referencing target [the state of Wyoming] matches no global, local, or import reference.\n` +
    `topics/Idaho/Idaho.expl:1:42`
  ));
});

test('it lets you set an exclusive target text like [[the state of {{Wyoming}}]]', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[the state of {{Wyoming}}]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, like ",
            "type":"text"
          },
          {
            "text": "the state of Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "the state of Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          }
        ],
      }
    }
  );
});

test('it lets you interpolate different values for display and target like [[harmon{y|ies}]]', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming territor{y|ies}]].\n`,
    'topics/Wyoming/Wyoming_territory.expl': `Wyoming territory: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, like ",
            "type":"text"
          },
          {
            "text": "Wyoming territories",
            "type": "global",
            "targetSubtopic": "Wyoming territory",
            "targetTopic": "Wyoming territory",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming territories",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          }
        ],
      }
    }
  );
});

test('it lets you select an exclusive display string with import references like [[Wyoming#{{Cheyenne}} city]]', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming#{Cheyenne} city]] of [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state whose capital is [[Cheyenne city]].\n\nCheyenne city: This is the capital.`
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
        {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic": {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, like ",
            "type":"text"
          },
          {
            "enclosingSubtopic": "Idaho",
            "enclosingTopic": "Idaho",
            "targetSubtopic": "Cheyenne city",
            "targetTopic": "Wyoming",
            "text": "Cheyenne",
            "tokens": [
              {
                "text": "Cheyenne",
                "type": "text",
              },
            ],
            "type": "import",
          },
          {
            "text": " of ",
            "type": "text",
          },
          {
            "enclosingSubtopic": "Idaho",
            "enclosingTopic": "Idaho",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "text": "Wyoming",
            "tokens": [
              {
                "text": "Wyoming",
                "type": "text",
              },
            ],
            "type": "global",
          },
          {
           "text": ".",
           "type": "text",
          }
        ]
      }
    }
  );

  expect(JSON.parse(filesToWrite['build/_data/Wyoming.json'])).toEqual(
    {
      "displayTopicName": "Wyoming",
      "topicTokens": [
         {
          "text": "Wyoming",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic": {
        "Cheyenne city": [
          {
            "text": "This is the capital.",
            "type": "text",
          },
        ],
        "Wyoming": [
          {
            "text": "Wyoming is a midwestern state whose capital is ",
            "type": "text",
          },
          {
            "enclosingSubtopic": "Wyoming",
            "enclosingTopic": "Wyoming",
            "targetSubtopic": "Cheyenne city",
            "targetTopic": "Wyoming",
            "text": "Cheyenne city",
            "tokens": [
              {
                "text": "Cheyenne city",
                "type": "text",
              },
            ],
            "type": "local",
          },
          {
            "text": ".",
            "type": "text",
          }
        ]
        }
      }
    );
});

//// Import references

test('it matches implicit import references', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming|my favorite state]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [

          {
            "text" : "Idaho is a midwestern state, like ",
            "type":"text"
          },
          {
            "text": "my favorite state",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "my favorite state",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ]
      }
    }
  );
});

test('it matches implicit import references in any order within a sentence', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Yellowstone National Park]] of [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl':
      dedent`Wyoming: Wyoming is a midwestern state. It contains [[Yellowstone National Park]]

      Yellowstone National Park: This is a large park.` + '\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [

          {
            "text" : "Idaho is a midwestern state, near ",
            "type":"text"
          },
          {
            "text": "Yellowstone National Park",
            "type": "import",
            "targetSubtopic": "Yellowstone National Park",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Yellowstone National Park",
                 "type": "text",
               },
             ]
          },
          {
            "text" : " of ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ]
      }
    }
  );
});

test('it requires explicit syntax if import could match multiple globals', () => {
  let explFileData = {
    'topics/England/England.expl':
      dedent`England: England is a European country. The largest city in England is [[London]].

      London: London is a large city in England.` + '\n',

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.` + '\n',
    'topics/Vacation/Vacation.expl':
      dedent`Vacation: I'd like to go to [[Columbus]], [[Ohio]], and [[London]], [[England]].` + '\n'
  };

  expect(() => jsonForProjectDirectory(explFileData, 'England', {})).toThrow(chalk.red(
    `Import reference [London] could belong to multiple global references: [Ohio, England].\n` +
    `Please use explicit import syntax eg [[Ohio#London]]\n` +
    `topics/Vacation/Vacation.expl:1:57`
  ));
});

test('it makes local references into import references if that resolves redundancy', () => {
  let explFileData = {
    'topics/England/England.expl':
      dedent`England: England is a European country. England has various [[cities]]. One of England's cities is [[London]].

      Cities: England has various cities, but none are so nice as [[London]], [[Ohio]].

      London: London is a large city in England.` + '\n',

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.` + '\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'England', {});

  expect(JSON.parse(filesToWrite['build/_data/England.json'])["paragraphsBySubtopic"]["England"]).toEqual(
    [
      {
        "text" : "England is a European country. England has various ",
        "type":"text"
      },
      {
        "text": "cities",
        "type": "local",
        "targetSubtopic": "Cities",
        "targetTopic": "England",
        "enclosingTopic": "England",
        "enclosingSubtopic" : "England",
        "tokens": [
          {
             "text": "cities",
             "type": "text",
           },
         ]
      },
      {
        "text" : ". One of England's cities is ",
        "type":"text"
      },
      {
        "text": "London",
        "type": "local",
        "targetSubtopic": "London",
        "targetTopic": "England",
        "enclosingTopic": "England",
        "enclosingSubtopic" : "England",
        "tokens": [
          {
             "text": "London",
             "type": "text",
           },
         ]
      },
      {
        "text" : ".",
        "type":"text"
      },
    ]);

  expect(JSON.parse(filesToWrite['build/_data/England.json'])["paragraphsBySubtopic"]["Cities"]).toEqual(
    [
      {
        "text" : "England has various cities, but none are so nice as ",
        "type":"text"
      },
      {
        "text": "London",
        "type": "import",
        "targetSubtopic": "London",
        "targetTopic": "Ohio",
        "enclosingTopic": "England",
        "enclosingSubtopic" : "Cities",
        "tokens": [
          {
             "text": "London",
             "type": "text",
           },
         ]
      },
      {
        "text" : ", ",
        "type":"text"
      },
      {
        "text": "Ohio",
        "type": "global",
        "targetSubtopic": "Ohio",
        "targetTopic": "Ohio",
        "enclosingTopic": "England",
        "enclosingSubtopic" : "Cities",
        "tokens": [
          {
             "text": "Ohio",
             "type": "text",
           },
         ]
      },
      {
        "text" : ".",
        "type":"text"
      },
    ]);
});

test('it converts local references to import references if later found redundant', () => {
  let explFileData = { // first we think the first [[London]] is local, then we see later it isn't
    'topics/England/England.expl':
      dedent`England: England is a European country. England has various [[cities]]. I'd also like to go to [[London]], [[Ohio]].

      Cities: England has various cities, including its capital [[London]].

      London: London is a large city in England.` + '\n',

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.` + '\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'England', {});

  expect(JSON.parse(filesToWrite['build/_data/England.json'])["paragraphsBySubtopic"]["England"]).toEqual(
    [
      {
        "text" : "England is a European country. England has various ",
        "type":"text"
      },
      {
        "text": "cities",
        "type": "local",
        "targetSubtopic": "Cities",
        "targetTopic": "England",
        "enclosingTopic": "England",
        "enclosingSubtopic" : "England",
        "tokens": [
          {
             "text": "cities",
             "type": "text",
           },
         ]
      },
      {
        "text" : ". I'd also like to go to ",
        "type":"text"
      },
      {
        "text": "London",
        "type": "import",
        "targetTopic": "Ohio",
        "targetSubtopic": "London",
        "enclosingTopic": "England",
        "enclosingSubtopic" : "England",
        "tokens": [
          {
             "text": "London",
             "type": "text",
           },
         ]
      },
      {
        "text" : ", ",
        "type":"text"
      },
      {
        "text": "Ohio",
        "type": "global",
        "targetTopic": "Ohio",
        "targetSubtopic": "Ohio",
        "enclosingTopic": "England",
        "enclosingSubtopic" : "England",
        "tokens": [
          {
             "text": "Ohio",
             "type": "text",
           },
         ]
      },
      {
        "text" : ".",
        "type":"text"
      },
    ]);
});

test('it converts local references within lists to import references if later found redundant', () => {
  let explFileData = { // first we think the first [[London]] is local, then we see later it isn't
    'topics/England/England.expl':
      dedent`England:
      1. England is a European country. England has various [[cities]].
      2. I'd also like to go to [[London]], [[Ohio]].

      Cities: England has various cities, including its capital [[London]].

      London: London is a large city in England.` + '\n',

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.` + '\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'England', {});

  expect(JSON.parse(filesToWrite['build/_data/England.json'])["paragraphsBySubtopic"]["England"]).toEqual(
    [
      {
        "topLevelNodes": [
          {
            "ordinal": "1",
            "ordered": true,
            "tokensOfLine": [
              {
                "text": "England is a European country. England has various ",
                "type": "text"
              },
              {
                "text": "cities",
                "type": "local",
                "targetTopic": "England",
                "targetSubtopic": "Cities",
                "enclosingTopic": "England",
                "enclosingSubtopic": "England",
                "tokens": [
                  {
                     "text": "cities",
                     "type": "text",
                   },
                 ]
              },
              {
                "text": ".",
                "type": "text"
              }
            ],
            "children": []
          },
          {
            "ordinal": "2",
            "ordered": true,
            "tokensOfLine": [
              {
                "text": "I'd also like to go to ",
                "type": "text"
              },
              {
                "text": "London",
                "type": "import",
                "targetTopic": "Ohio",
                "targetSubtopic": "London",
                "enclosingTopic": "England",
                "enclosingSubtopic": "England",
                "tokens": [
                  {
                     "text": "London",
                     "type": "text",
                   },
                 ]
              },
              {
                "text": ", ",
                "type": "text"
              },
              {
                "text": "Ohio",
                "type": "global",
                "targetTopic": "Ohio",
                "targetSubtopic": "Ohio",
                "enclosingTopic": "England",
                "enclosingSubtopic": "England",
                "tokens": [
                  {
                     "text": "Ohio",
                     "type": "text",
                   },
                 ]
              },
              {
                "text": ".",
                "type": "text"
              }
            ],
            "children": []
          }
        ],
        "type": "outline"
      }
    ]
  );
});

test('it throws error for redundant local references where both could be import references', () => {
  let explFileData = {
    'topics/England/England.expl':
      dedent`England: England is a European country. The largest city in England is [[London]].

      London: London is a large city in England.` + '\n',

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]], which is also the name of a city in [[England]]

      Columbus: Columbus is a large city in Ohio, which is similar in character to [[London]] [[England]].

      London: London is a small city in Ohio.` + '\n',
  };

  let message = dedent`Error: Two local references exist in topic [Ohio] to subtopic [London]

    - One reference is in [Ohio] - topics/Ohio/Ohio.expl:1
    - One reference is in [Columbus (Ohio)] - topics/Ohio/Ohio.expl:3

    Multiple local references to the same subtopic are not permitted.
    Consider making one of these local references a self-import reference.
    That would look like using [[Ohio#London]] in the same paragraph as
    a reference to [[Ohio]].

    (It is also possible you meant one of these as an import reference, however,
    if both links could be either local or import references, you must clarify
    which is the import reference using explicit import syntax ie [[Other Topic#London]])`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'England', {})
  ).toThrow(chalk.red(message));
});

test('it matches import references with explicit syntax and lets you rename the link', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming#Yellowstone National Park|my favorite park]] in [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl':
      dedent`Wyoming: Wyoming is a midwestern state. It contains [[Yellowstone National Park]]

      Yellowstone National Park: This is a large park.` + '\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, near ",
            "type":"text"
          },
          {
            "text": "my favorite park",
            "type": "import",
            "targetSubtopic": "Yellowstone National Park",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "my favorite park",
                 "type": "text",
               },
             ]
          },
          {
            "text" : " in ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ]
      }
    }
  );
});

test('it matches back-to-back global references', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]][[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, near ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          },
          {
            "text" : ".",
            "type":"text"
          },
        ]
      }
    }
  );
});

test('it matches global references at the end of strings', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]]\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state, near ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho",
            "tokens": [
              {
                 "text": "Wyoming",
                 "type": "text",
               },
             ]
          }
        ]
      }
    }
  );
});

test(`it skips category note files with keys that don't match the file name`, () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `This key doesn't match "Idaho": Idaho is a midwestern state.\n`,
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(Object.keys(filesToWrite)).toEqual([]);
});

test(`it doesn't skip files with keys that don't match filenames for non-category note files`, () => {
  let explFileData = {
    'topics/Idaho/Topic.expl': `Idaho: Idaho is a midwestern state.\n`, // this is a valid topic
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "topicTokens": [
         {
          "text": "Idaho",
          "type": "text",
        },
      ],
      "paragraphsBySubtopic" : {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state.",
            "type":"text"
          }
        ]
      }
    }
  );
});

////////////  Errors ///////////////

test('it throws error for unrecognized link', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]]\n`,
  };
  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(
    `Error: Reference [[Wyoming]] in [Idaho] matches no global, local, or import reference.\n` +
    `topics/Idaho/Idaho.expl:1:42`
  ));
});

test('it does not throw error for demarcated link', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, near [[Wyoming]]

                               Wyoming:` + '\n', // a writer might do this to create a placeholder
  };
  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).not.toThrow();
});

test('it throws error for unrecognized link defined in category notes file', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]]\n`,
    'topics/Midwest/Midwest.expl': `Wyoming: Idaho is a midwestern state.\n`,
  };
  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(
    `Error: Reference [[Wyoming]] in [Idaho] matches no global, local, or import reference.\n` +
    `topics/Idaho/Idaho.expl:1:42`
  ));
});

test('it throws error for regular redundant local references', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. It contains [[Boise]]. It has a [[western half]].

      Western Half: Idaho's western half contains its capital [[Boise]].

      Boise: Boise is the capital of Idaho.` + '\n',
  };

  let message = dedent`Error: Two local references exist in topic [Idaho] to subtopic [Boise]

    - One reference is in [Idaho] - topics/Idaho/Idaho.expl:1
    - One reference is in [Western Half (Idaho)] - topics/Idaho/Idaho.expl:3

    Multiple local references to the same subtopic are not permitted.
    Consider making one of these local references a self-import reference.
    That would look like using [[Idaho#Boise]] in the same paragraph as
    a reference to [[Idaho]].

    (It is also possible you meant one of these as an import reference, however,
    if both links could be either local or import references, you must clarify
    which is the import reference using explicit import syntax ie [[Other Topic#Boise]])
    `;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error for redundantly defined topics', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state.\n`,
    'topics/United_States/Idaho.expl': `Idaho: Idaho is a midwetern state.\n`
  };

  let message = dedent`Error: Topic or similar appears twice in project: [Idaho]
    - One file is: topics/Idaho/Idaho.expl
    - Another file is: topics/United_States/Idaho.expl
  `;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error for redundantly defined subtopics', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. Its capital is [[Boise]]

    Boise: This is the capital.

    Boise: This is a good city.` + '\n',
  };

  let message =`Error: Subtopic [Boise] or similar appears twice in topic: [Idaho]\n` +
    `First definition: topics/Idaho/Idaho.expl:3\n` +
    `Second definition: topics/Idaho/Idaho.expl:5`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it counts blank lines in error line numbers', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. Its capital is [[Boise]]





    Boise: This is the capital.

    Boise: This is a good city.` + '\n',
  };

  let message =`Error: Subtopic [Boise] or similar appears twice in topic: [Idaho]\n` +
    `First definition: topics/Idaho/Idaho.expl:7\n` +
    `Second definition: topics/Idaho/Idaho.expl:9`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it handles odd-numbers of blank lines', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. Its capital is [[Boise]]




    Boise: This is the capital.

    Boise: This is a good city.` + '\n',
  };

  let message =`Error: Subtopic [Boise] or similar appears twice in topic: [Idaho]\n` +
    `First definition: topics/Idaho/Idaho.expl:6\n` +
    `Second definition: topics/Idaho/Idaho.expl:8`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it handles line counting within nested block', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho:
    >
    >
    > Idaho is a midwestern state. Its capital is [[Boise]]` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(
    `Error: Reference [[Boise]] in [Idaho] matches no global, local, or import reference.\n` +
    `topics/Idaho/Idaho.expl:4:47`
    ));
});

test('it handles lines counting after block', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho:
    >
    >
    > Idaho is a midwestern state.
    Its capital is [[Boise]]` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(
    `Error: Reference [[Boise]] in [Idaho] matches no global, local, or import reference.\n` +
    `topics/Idaho/Idaho.expl:5:16`
    ));
});

test('it handles character counting after token', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: [[Idaho|This is a good link]] followed by a [[Boise|bad link]]` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(
    `Error: Reference [[Boise|bad link]] in [Idaho] referencing target [Boise] matches no global, local, or import reference.\n` +
    `topics/Idaho/Idaho.expl:1:52`
    ));
});

test('it does not throw error for redundantly defined subtopics that are not subsumed', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.

    Boise: This is the capital.

    Boise: This is a good city.` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).not.toThrow();
});

test('it throws error if import reference lacks matching global reference', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. Its capital is [[Boise]]

    Boise: This is the capital.` + '\n',
    'topics/Wyoming/Wyoming.expl': dedent`Wyoming: Wyoming is a midwestern state. It is near [[Boise]] [[Idaho]].

    Idaho: This subtopic makes Idaho above a local reference and so the link to Boise shouldn't be a valid import reference.` + '\n',
  };

  let message = `Error: Import reference to [Boise (Idaho)] in [Wyoming] lacks global reference to topic [Idaho].\n` +
    `topics/Wyoming/Wyoming.expl:1\n`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error if import reference is to unsubsumed subtopic of target topic', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.

    Boise: This is the capital.` + '\n',

    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state. It is near [[Boise]] [[Idaho]].\n`,
  };

  let message = `Error: Import reference in [Wyoming] is referring to unsubsumed subtopic [Boise (Idaho)]\n` +
    `topics/Wyoming/Wyoming.expl:1\n`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error if import reference is to non-existent topic', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state.\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state. It is near [[England#London]] [[England]].\n`,
  };

  let message = `Error: Reference [[England#London]] in topic [Wyoming] refers to non-existent topic [England]\n` +
    `topics/Wyoming/Wyoming.expl:1:52`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error if import reference is to non-existent subtopic', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state.\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state. It is near [[Idaho#Boise]] [[Idaho]].\n`,
  };

  let message = `Error: Reference [[Idaho#Boise]] in topic [Wyoming] refers to non-existent subtopic of [Idaho], [Boise]\n` +
    `topics/Wyoming/Wyoming.expl:1:52`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error for topic name beginning with whitespace', () => {
  let explFileData = {
    'topics/Idaho/_Idaho.expl': ` Idaho: Idaho is a midwestern state.\n`
  };

  let message = `Error: Topic name [ Idaho] begins or ends with whitespace.\n` +
    `topics/Idaho/_Idaho.expl`;

  expect(
    () => console.log(jsonForProjectDirectory(explFileData, 'Idaho', {}))
  ).toThrow(chalk.red(message));
});

test('it throws error for topic name ending with whitespace', () => {
  let explFileData = {
    'topics/Idaho/Idaho_.expl': `Idaho : Idaho is a midwestern state.\n`,
  };

  let message = `Error: Topic name [Idaho ] begins or ends with whitespace.\n` +
    `topics/Idaho/Idaho_.expl`;

  expect(
    () => jsonForProjectDirectory(explFileData, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it logs global orphan topics', () => {
  let log = console.log;

  console.log = jest.fn();
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state. It is near [[Montana]].\n`,
    'topics/Montana/Montana.expl': `Montana: Montana is a midwestern state.\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`,
  };

  let message = chalk.magenta(`Warning: Global Orphan\n` +
    `Topic [Wyoming] is not connected to the default topic [Idaho]\n` +
    `topics/Wyoming/Wyoming.expl\n`);

  jsonForProjectDirectory(explFileData, 'Idaho', { orphans: true });

  let messagePresent = !!console.log.mock.calls.find(call => {
    return call[0] === message;
  })

  expect(messagePresent).toEqual(true);
  console.log = log;
});


test('it logs local orphan subtopics', () => {
  let log = console.log;
  console.log = jest.fn();
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.

    Boise: Boise is the capital of Idaho.` + '\n',
  };

  let message = chalk.magenta(`Warning: Local Orphan\n` +
    `Subtopic [Boise] lacks a connection to its topic [Idaho]\n` +
    `topics/Idaho/Idaho.expl:3\n`);

  jsonForProjectDirectory(explFileData, 'Idaho', { orphans: true });

  let messagePresent = !!console.log.mock.calls.find(call => {
    return call[0] === message;
  })

  expect(messagePresent).toEqual(true);
  console.log = log;
});

test('it logs non-reciprocal global references', () => {
  let log = console.log;
  console.log = jest.fn();
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state near [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`
  };

  let message = chalk.magenta('Warning: Nonreciprocal Global Reference\n' +
    'Global reference in [Idaho] exists to topic [Wyoming] with no reciprocal reference.\n' +
    'topics/Idaho/Idaho.expl:1\n' +
    'Try creating a global reference from [Wyoming] to [Idaho]\n' +
    'topics/Wyoming/Wyoming.expl\n');

  jsonForProjectDirectory(explFileData, 'Idaho', { reciprocals: true });

  let messagePresent = !!console.log.mock.calls.find(call => {
    return call[0] === message;
  })

  expect(messagePresent).toEqual(true);
  console.log = log;
});
