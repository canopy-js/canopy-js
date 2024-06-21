let jsonForProjectDirectory = require('./json_for_project_directory');
let dedent = require('dedent-js');
let chalk = require('chalk');

test('it creates a data directory', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': 'Idaho: Idaho is a midwestern state.\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

  expect(directoriesToEnsure).toEqual(['build/_data']);
});

test('it creates text tokens', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': 'Idaho: Idaho is a midwestern state.\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
  expect(() => jsonForProjectDirectory(explFileData, null, 'Idaho', {})).toThrow(chalk.red(
    dedent`Error: Reference \"[[State capital. and governor]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [State capital. and governor].
    topics/Idaho/Idaho.expl:1:49`
  ));
});

test('it matches global references', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming",
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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming#Wyoming",
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

test('it matches global references using [[X#]] syntax to override local reference creation', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, which contains [[Wyoming]] the small town, and is like [[Wyoming#]] the US State.

    Wyoming: There is a small town in Idaho called Wyoming, which is different than the US state of Wyoming.`,

    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming",
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

test('it allows global self-subtopic-references using [[#X]] syntax to override local reference creation', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, which contains [[Wyoming]] the small town, [[#Wyoming]] the small town!

    Wyoming: There is a small town in Idaho called Wyoming, which is different than the US state of Wyoming.`,

    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "text" : " the small town, ",
            "type":"text"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "pathString": "Idaho#Wyoming",
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
            "text" : " the small town!",
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

test('Local references beat global for simple links', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, which contains [[Wyoming]] the small town.

    Wyoming: There is a small town in Idaho called Wyoming, which is different than the US state of Wyoming.`,

    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.` + '\n'

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "targetTopic": "Idaho",
            "targetSubtopic": "Wyoming",
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
            "text" : " the small town.",
            "type":"text"
          },
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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming",
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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "The_state_of_Wyoming",
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

test('it lets you select multiple exclusive display substrings like [[{the} US{ postal service}]]', () => {
  let explFileData = {
    'topics/US/Services.expl': `Services: Americans like [[{the }US {postal service}]].\n`,
    'topics/US/The_US_postal_service.expl': `The US postal service: The US has a postal service.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "The_US_postal_service",
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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "The_US_postal_service",
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

test('it lets you set an exclusive target text like [[the state of {{Wyoming}}]]', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[the state of {{Wyoming}}]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`

  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming",
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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming_territory",
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

test('it lets you select an exclusive display string with path references like [[Wyoming#{Cheyenne} city]]', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming#{Cheyenne} city]] of [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state whose capital is [[Cheyenne city]].\n\nCheyenne city: This is the capital.`
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming#Cheyenne_city",
            "text": "Cheyenne",
            "tokens": [
              {
                "text": "Cheyenne",
                "type": "text",
              },
            ],
            "type": "global",
          },
          {
            "text": " of ",
            "type": "text",
          },
          {
            "enclosingSubtopic": "Idaho",
            "enclosingTopic": "Idaho",
            "pathString": "Wyoming",
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

//// Path references

test('it matches path references with explicit syntax and lets you rename the link', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming#Yellowstone National Park|my favorite park]] in [[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl':
      dedent`Wyoming: Wyoming is a midwestern state. It contains [[Yellowstone National Park]]

      Yellowstone National Park: This is a large park.` + '\n'
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "type": "global",
            "pathString": "Wyoming#Yellowstone_National_Park",
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
            "pathString": "Wyoming",
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

test('it matches back-to-back global references', () => { // this was a bug in the parser that automatically added character after link to buffer
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]][[Wyoming]].\n`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.\n`
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming",
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
            "pathString": "Wyoming",
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
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

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
            "pathString": "Wyoming",
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


////////////  Errors ///////////////

test('it throws error for unrecognized link', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]]\n`,
  };
  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(dedent`Error: Reference \"[[Wyoming]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [Wyoming].
    topics/Idaho/Idaho.expl:1:42`));
});

test('it does not throw error for demarcated link', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, near [[Wyoming]]

                               Wyoming:` + '\n', // a writer might do this to create a placeholder
  };
  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).not.toThrow();
});

test('it throws error for regular redundant local references', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. It contains [[Boise]]. It has a [[western half]].

      Western Half: Idaho's western half contains its capital [[Boise]].

      Boise: Boise is the capital of Idaho.` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(dedent`Error: Two local references exist in topic [Idaho] to subtopic [Boise]

    One reference is in subtopic [Idaho]
    topics/Idaho/Idaho.expl:1

    One reference is in subtopic [Western Half (Idaho)]
    topics/Idaho/Idaho.expl:3

    Multiple local references to the same subtopic are not permitted.

    Consider making one of these local references a self path reference.
    That would look like using [[#Boise]].`));
});

test('it only throws error for regular redundant local references in subsumed paragraphs', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. It contains [[Boise]].

      Western Half: Idaho's western half contains its capital [[Boise]].

      Boise: Boise is the capital of Idaho.` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).not.toThrow();
});

test('it throws error for redundant local references where both could be global reference', () => {
  let explFileData = {
    'topics/England/England.expl':
      dedent`England: England is a European country. The largest city in England is [[London]]. England contains [[Essex]].

      Essex: Essex has been home to many individuals with the surname [[London]].

      London: London is a large city in England.` + '\n',

    'topics/England/London.expl': `London: London is a common family name.\n`
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'England', {})
  ).toThrow(chalk.red(dedent`Error: Two local references exist in topic [England] to subtopic [London]

    One reference is in subtopic [England]
    topics/England/England.expl:1

    One reference is in subtopic [Essex (England)]
    topics/England/England.expl:3

    Multiple local references to the same subtopic are not permitted.

    Consider making one of these local references a self path reference.
    That would look like using [[#London]].`));
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
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
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
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error for subtopic named after topic subtopic', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. Its capital is [[Boise]]

    Boise: This is the capital.

    Boise: This is a good city.` + '\n',
  };

  let message =`Error: Subtopic [Boise] or similar appears twice in topic: [Idaho]\n` +
    `First definition: topics/Idaho/Idaho.expl:3\n` +
    `Second definition: topics/Idaho/Idaho.expl:5`;

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it validates that topics of paths exist', () => {
  let explFileData = {
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state, similar to [[Idaho#Boise]]\n`
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(dedent`Error: Reference \"[[Idaho#Boise]]\" in subtopic [Wyoming, Wyoming] mentions nonexistent topic or subtopic [Idaho].
    topics/Wyoming/Wyoming.expl:1:52`));
});

test('it validates that subtopics of paths exist', () => {
  let explFileData = {
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state, similar to [[Idaho#Boise]]\n`,
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state.\n`
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(dedent`Error: Subtopic [Idaho, Boise] referenced in reference "[[Idaho#Boise]]" of paragraph [Wyoming, Wyoming] does not exist.
    topics/Wyoming/Wyoming.expl:1:52`));
});


test('it validates that subtopics of paths are subsumed by their topics', () => {
  let explFileData = {
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state, similar to [[Idaho#Boise]]\n`,
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.\n

    Boise: This is the capital.\n`,
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(dedent`Error: Subtopic [Idaho, Boise] referenced in reference "[[Idaho#Boise]]" of paragraph [Wyoming, Wyoming] exists but is not subsumed by given topic.
    topics/Wyoming/Wyoming.expl:1:52`));
});

test('it errors when path segments are not connected', () => {
  let explFileData = {
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state, similar to [[USA/Idaho#Boise]]\n`,
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, whose capital is [[Boise]]\n

    Boise: This is the capital.\n`,
    'topics/Idaho/USA.expl': dedent`USA: The USA is a country, which contains many states.\n

    Boise: This is the capital.\n`,
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(dedent`Error: Global reference "[[USA/Idaho#Boise]]" contains invalid adjacency.
    [USA, USA] does not reference [Idaho]
    topics/Wyoming/Wyoming.expl:1:52`));
});

test('it works when path segments of paths are connected', () => {
  let explFileData = {
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state, similar to [[USA/Idaho#Boise]]\n`,
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, whose capital is [[Boise]]\n

    Boise: This is the capital.\n`,
    'topics/Idaho/USA.expl': dedent`USA: The USA is a country, which contains [[Idaho]].`
  };
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(explFileData, null, 'Idaho', {});

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).not.toThrow();
});

/////// Error Line Numbers ////////

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
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
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
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
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
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(
    dedent`Error: Reference \"[[Boise]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [Boise].
    topics/Idaho/Idaho.expl:4:47`
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
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(
    dedent`Error: Reference \"[[Boise]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [Boise].
    topics/Idaho/Idaho.expl:5:16`
    ));
});

test('it handles character counting after token', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: [[Idaho|This is a good link]] followed by a [[Boise|bad link]]` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(
    dedent`Error: Reference \"[[Boise|bad link]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [Boise].
    topics/Idaho/Idaho.expl:1:52`
    ));
});

test('it gives correct line and character number for errors in tables', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho:
    | This | is | a | table |
    | with | many | cells | like [[non-existent topic]] |` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(
    dedent`Error: Reference \"[[non-existent topic]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [non-existent topic].
    topics/Idaho/Idaho.expl:3:30`
    ));
});

test('it gives correct line and character number for errors in lists', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho:
    1. This is a list.
    2. This is a bad link [[non-existent topic]]` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(
    dedent`Error: Reference \"[[non-existent topic]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [non-existent topic].
    topics/Idaho/Idaho.expl:3:23`
    ));
});

test('it gives correct line and character number for errors HTML inclusion', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho:
    <div style="background-color: green">
      This is a link to a non-existent topic: {{[[Nebraska]]}}
    </div>` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(
    dedent`Error: Reference \"[[Nebraska]]\" in subtopic [Idaho, Idaho] mentions nonexistent topic or subtopic [Nebraska].
    topics/Idaho/Idaho.expl:3:45`
    ));
});

test('it does not throw error for redundantly defined subtopics that are not subsumed', () => {
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.

    Boise: This is the capital.

    Boise: This is a good city.` + '\n',
  };

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).not.toThrow();
});

test('it throws error for topic name beginning with whitespace', () => {
  let explFileData = {
    'topics/Idaho/_Idaho.expl': ` Idaho: Idaho is a midwestern state.\n`
  };

  let message = `Error: Topic name [ Idaho] begins or ends with whitespace.\n` +
    `topics/Idaho/_Idaho.expl`;

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error for subtopic name beginning with whitespace', () => {
  let explFileData = {
    'topics/Idaho/_Idaho.expl': `Idaho: Idaho is a midwestern state. [[Hello world]].

      Hello world: abc.`
  };

  let message = dedent`Error: Subtopic name [      Hello world] in topic [Idaho] begins or ends with whitespace.

    topics/Idaho/_Idaho.expl:3`;

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
  ).toThrow(chalk.red(message));
});

test('it throws error for topic name ending with whitespace', () => {
  let explFileData = {
    'topics/Idaho/Idaho_.expl': `Idaho : Idaho is a midwestern state.\n`,
  };

  let message = `Error: Topic name [Idaho ] begins or ends with whitespace.\n` +
    `topics/Idaho/Idaho_.expl`;

  expect(
    () => jsonForProjectDirectory(explFileData, null, 'Idaho', {})
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

  jsonForProjectDirectory(explFileData, null, 'Idaho', { orphans: true });

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

  jsonForProjectDirectory(explFileData, null, 'Idaho', { orphans: true });

  let messagePresent = !!console.log.mock.calls.find(call => {
    return call[0] === message;
  })

  expect(messagePresent).toEqual(true);
  console.log = log;
});
