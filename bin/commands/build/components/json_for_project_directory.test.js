let jsonForProjectDirectory = require('./json_for_project_directory');
let dedent = require('dedent-js');

test('it creates a data directory', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': 'Idaho: Idaho is a midwestern state.'
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(directoriesToEnsure).toEqual(['/example/project/build/_data']);
});

test('it creates text tokens', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': 'Idaho: Idaho is a midwestern state.'
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
      "paragraphsBySubtopic": {
        "Idaho": [
          {
            "text" : "Idaho is a midwestern state.",
            "type":"text"
          }
        ]
      }
    }
  )
});

test('it matches local references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. Idaho has a [[state capital]].

      State Capital: The state capital of Idaho is Boise.`

  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
            "enclosingSubtopic" : "Idaho"
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

test('it matches global references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming]].`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.`

  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
              "enclosingSubtopic" : "Idaho"
            },
            {
              "text" : ".",
              "type":"text"
            },
          ]
        }
      }
    );

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Wyoming.json'])).toEqual(
    {
      "displayTopicName": "Wyoming",
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
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state, which contains [[Wyoming]] the small town, and is like [[Wyoming#Wyoming]] the US State.

    Wyoming: There is a small town in Idaho called Wyoming, which is different than the US state of Wyoming.`,

    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.`

  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
            "enclosingSubtopic" : "Idaho"
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
            "enclosingSubtopic" : "Idaho"
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

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Wyoming.json'])).toEqual(
    {
      "displayTopicName": "Wyoming",
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

test('it lets you give arbitrary names to references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming]].`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.`

  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
            "enclosingSubtopic" : "Idaho"
          },
          {
            "text" : ".",
            "type":"text"
          }
        ],
      }
    }
  );

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Wyoming.json'])).toEqual(
    {
      "displayTopicName": "Wyoming",
      "paragraphsBySubtopic" : {
        "Wyoming": [
          {
            "text" : "Wyoming is a midwestern state.",
            "type":"text"
          }
        ]
      }
    }
  )
});

test('it matches implicit import references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, like [[Wyoming|my favorite state]].`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.`

  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
                  "enclosingSubtopic" : "Idaho"
                },
                {
                  "text" : ".",
                  "type":"text"
                },
              ]
      }
    }
  )
});

test('it matches implicit import references in any order within a sentence', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Yellowstone National Park]] of [[Wyoming]].`,
    'topics/Wyoming/Wyoming.expl':
      dedent`Wyoming: Wyoming is a midwestern state. It contains [[Yellowstone National Park]]

      Yellowstone National Park: This is a large park.
      `
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
                  "enclosingSubtopic" : "Idaho"
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
                  "enclosingSubtopic" : "Idaho"
                },
                {
                  "text" : ".",
                  "type":"text"
                },
              ]
      }
    }
  )
});

test('it matches an implicit import reference to the closest candidate link', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/England/England.expl':
      dedent`England: England is a European country. The largest city in England is [[London]].

      London: London is a large city in England.`,

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.
      `,
    'topics/Vacation/Vacation.expl':
      dedent`Vacation: I'd like to go to [[Columbus]], [[Ohio]], and [[London]], [[England]].
      `
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'England', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Vacation.json'])).toEqual(
    {
      "displayTopicName": "Vacation",
      "paragraphsBySubtopic" : {
        "Vacation": [

                {
                  "text" : "I'd like to go to ",
                  "type":"text"
                },
                {
                  "text": "Columbus",
                  "type": "import",
                  "targetSubtopic": "Columbus",
                  "targetTopic": "Ohio",
                  "enclosingTopic": "Vacation",
                  "enclosingSubtopic" : "Vacation"
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
                  "enclosingTopic": "Vacation",
                  "enclosingSubtopic" : "Vacation"
                },
                {
                  "text" : ", and ",
                  "type":"text"
                },

                {
                  "text": "London",
                  "type": "import",
                  "targetSubtopic": "London",
                  "targetTopic": "England",
                  "enclosingTopic": "Vacation",
                  "enclosingSubtopic" : "Vacation"
                },
                {
                  "text" : ", ",
                  "type":"text"
                },
                {
                  "text": "England",
                  "type": "global",
                  "targetSubtopic": "England",
                  "targetTopic": "England",
                  "enclosingTopic": "Vacation",
                  "enclosingSubtopic" : "Vacation",
                },
                {
                  "text" : ".",
                  "type":"text"
                },
              ]
      }
    }
  )
});

test('it makes local references into import references if that resolves redundancy', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/England/England.expl':
      dedent`England: England is a European country. England has various [[cities]]. One of England's cities is [[London]].

      Cities: England has various cities, but none are so nice as [[London]], [[Ohio]].

      London: London is a large city in England.`,

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.
      `
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'England', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/England.json'])["paragraphsBySubtopic"]["England"]).toEqual(
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
        "enclosingSubtopic" : "England"
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
        "enclosingSubtopic" : "England"
      },
      {
        "text" : ".",
        "type":"text"
      },
    ]);

  expect(JSON.parse(filesToWrite['/example/project/build/_data/England.json'])["paragraphsBySubtopic"]["Cities"]).toEqual(
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
        "enclosingSubtopic" : "Cities"
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
        "enclosingSubtopic" : "Cities"
      },
      {
        "text" : ".",
        "type":"text"
      },
    ]);
});

test('it converts local references to import references if later found redundant', () => {
  let projectDir = '/example/project';
  let explFileData = { // first we think the first [[London]] is local, then we see later it isn't
    'topics/England/England.expl':
      dedent`England: England is a European country. England has various [[cities]]. I'd also like to go to [[London]], [[Ohio]].

      Cities: England has various cities, including its capital [[London]].

      London: London is a large city in England.`,

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.
      `
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'England', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/England.json'])["paragraphsBySubtopic"]["England"]).toEqual(
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
        "enclosingSubtopic" : "England"
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
        "enclosingSubtopic" : "England"
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
        "enclosingSubtopic" : "England"
      },
      {
        "text" : ".",
        "type":"text"
      },
    ]);
});

test('it converts local references within lists to import references if later found redundant', () => {
  let projectDir = '/example/project';
  let explFileData = { // first we think the first [[London]] is local, then we see later it isn't
    'topics/England/England.expl':
      dedent`England:
      1. England is a European country. England has various [[cities]].
      2. I'd also like to go to [[London]], [[Ohio]].

      Cities: England has various cities, including its capital [[London]].

      London: London is a large city in England.`,

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]].

      Columbus: Columbus is a large city in Ohio.

      London: London is a small city in Ohio.
      `
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'England', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/England.json'])["paragraphsBySubtopic"]["England"]).toEqual(
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
                "enclosingSubtopic": "England"
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
                "enclosingSubtopic": "England"
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
                "enclosingSubtopic": "England"
              },
              {
                "text": ".",
                "type": "text"
              }
            ],
            "children": []
          }
        ],
        "type": "list",
        "text": "1. England is a European country. England has various [[cities]].\n2. I'd also like to go to [[London]], [[Ohio]].\n"
      }
    ]
  );
});

test('it throws error for redundant local references where both could be import references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/England/England.expl':
      dedent`England: England is a European country. The largest city in England is [[London]].

      London: London is a large city in England.`,

    'topics/Ohio/Ohio.expl':
      dedent`Ohio: Ohio is a midwestern state. It contains [[Columbus]] and [[London]], which is also the name of a city in [[England]]

      Columbus: Columbus is a large city in Ohio, which is similar in character to [[London]] [[England]].

      London: London is a small city in Ohio.
      `,
  };

  let message = dedent`Error: Two local references exist in topic [Ohio] to subtopic [London]

    - One reference is in [Ohio, Ohio] - defined in topics/Ohio/Ohio.expl:1
    - One reference is in [Ohio, Columbus] - defined in topics/Ohio/Ohio.expl:2

    Multiple local references to the same subtopic are not permitted.
    Consider making one of these local references a self-import reference.
    That would look like using [[Ohio#London]] in the same paragraph as
    a reference to [[Ohio]].

    (It is also possible you meant one of these as an import reference, however,
    if both links could be either local or import references, you must clarify
    which is the import reference using explicit import syntax ie [[Other Topic#London]])`

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'England', {})
  ).toThrow(message);
});

test('it matches import references with explicit syntax and lets you rename the link', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming#Yellowstone National Park|my favorite park]] in [[Wyoming]].`,
    'topics/Wyoming/Wyoming.expl':
      dedent`Wyoming: Wyoming is a midwestern state. It contains [[Yellowstone National Park]]

      Yellowstone National Park: This is a large park.
      `
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
            "enclosingSubtopic" : "Idaho"
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
            "enclosingSubtopic" : "Idaho"
          },
          {
            "text" : ".",
            "type":"text"
          },
        ]
      }
    }
  )
});

test('it matches back-to-back global references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]][[Wyoming]].`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.`
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
            "enclosingSubtopic" : "Idaho"
          },
          {
            "text": "Wyoming",
            "type": "global",
            "targetSubtopic": "Wyoming",
            "targetTopic": "Wyoming",
            "enclosingTopic": "Idaho",
            "enclosingSubtopic" : "Idaho"
          },
          {
            "text" : ".",
            "type":"text"
          },
        ]
      }
    }
  )
});

test('it matches global references at the end of strings', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]]`,
    'topics/Wyoming/Wyoming.expl': `Wyoming: Wyoming is a midwestern state.`
  }
  let { filesToWrite, directoriesToEnsure } = jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {});

  expect(JSON.parse(filesToWrite['/example/project/build/_data/Idaho.json'])).toEqual(
    {
      "displayTopicName": "Idaho",
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
            "enclosingSubtopic" : "Idaho"
          }
        ]
      }
    }
  )
});

////////////  Errors ///////////////

test('it throws error for unrecognized link', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state, near [[Wyoming]]`,
  };
  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(`Error in topics/Idaho/Idaho.expl:1\nReference [[Wyoming]] in [Idaho, Idaho] matches no global, local, or import reference.`);
});

test('it throws error for redundant local references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl':
      dedent`Idaho: Idaho is a midwestern state. It contains [[Boise]]. It has a [[western half]].

      Western Half: Idaho's western half contains its capital [[Boise]].

      Boise: Boise is the capital of Idaho.`,
  };

  let message = dedent`Error: Two local references exist in topic [Idaho] to subtopic [Boise]

    - One reference is in [Idaho, Idaho] - defined in topics/Idaho/Idaho.expl:1
    - One reference is in [Idaho, Western Half] - defined in topics/Idaho/Idaho.expl:2

    Multiple local references to the same subtopic are not permitted.
    Consider making one of these local references a self-import reference.
    That would look like using [[Idaho#Boise]] in the same paragraph as
    a reference to [[Idaho]].

    (It is also possible you meant one of these as an import reference, however,
    if both links could be either local or import references, you must clarify
    which is the import reference using explicit import syntax ie [[Other Topic#Boise]])
    `

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it throws error for redundantly defined topics', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': `Idaho: Idaho is a midwestern state.`,
    'topics/United_States/Idaho.expl': `Idaho: Idaho is a midwetern state.`
  };

  let message = dedent`Error: Topic or similar appears twice in project: [Idaho]
    - One file is: topics/Idaho/Idaho.expl
    - Another file is: topics/United_States/Idaho.expl
  `;

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it throws error for redundantly defined subtopics', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. Its capital is [[Boise]]

    Boise: This is the capital.

    Boise: This is a good city.
    `,
  };

  let message =`Error: Subtopic [Boise] or similar appears twice in topic: [Idaho]\n` +
    `First definition: topics/Idaho/Idaho.expl:3\n` +
    `Second definition: topics/Idaho/Idaho.expl:2`;

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it does not throw error for redundantly defined subtopics that are not subsumed', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.

    Boise: This is the capital.

    Boise: This is a good city.
    `,
  };

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).not.toThrow();
});

test('it throws error for redundant local references', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. It has various [[cities]]. Its capital is [[Boise]]

    Cities: Idaho contains various cities such as [[Boise]].

    Boise: This is the capital.
    `,
  };

  let message = dedent`Error: Two local references exist in topic [Idaho] to subtopic [Boise]

    - One reference is in [Idaho, Idaho] - defined in topics/Idaho/Idaho.expl:1
    - One reference is in [Idaho, Cities] - defined in topics/Idaho/Idaho.expl:2

    Multiple local references to the same subtopic are not permitted.
    Consider making one of these local references a self-import reference.
    That would look like using [[Idaho#Boise]] in the same paragraph as
    a reference to [[Idaho]].

    (It is also possible you meant one of these as an import reference, however,
    if both links could be either local or import references, you must clarify
    which is the import reference using explicit import syntax ie [[Other Topic#Boise]])
    `

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it throws error if import reference lacks matching global reference', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. Its capital is [[Boise]]

    Boise: This is the capital.
    `,
    'topics/Wyoming/Wyoming.expl': dedent`Wyoming: Wyoming is a midwestern state. It is near [[Boise]] [[Idaho]].

    Idaho: This subtopic makes Idaho above a local reference and so the link to Boise shouldn't be a valid import reference.
    `,
  };

  let message = `Error: topics/Wyoming/Wyoming.expl:4\n`+
    `Import reference to [Idaho, Boise] in [Wyoming, Wyoming] lacks global reference to topic [Idaho].`;

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it throws error if import reference is to unsubsumed subtopic of target topic', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.

    Boise: This is the capital.
    `,
    'topics/Wyoming/Wyoming.expl': dedent`Wyoming: Wyoming is a midwestern state. It is near [[Boise]] [[Idaho]].
    `,
  };

  let message = `Error: topics/Wyoming/Wyoming.expl:3\n` +
    `Import reference in [Wyoming, Wyoming] is refering to unsubsumed subtopic [Idaho, Boise]`;

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it throws error if import reference is to non-existant topic', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.
    `,
    'topics/Wyoming/Wyoming.expl': dedent`Wyoming: Wyoming is a midwestern state. It is near [[England#London]] [[England]].
    `,
  };

  let message = `Error: Reference [[England#London]] in topic [Wyoming] refers to non-existant topic [England]`;

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it throws error if import reference is to non-existant subtopic', () => {
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.
    `,
    'topics/Wyoming/Wyoming.expl': dedent`Wyoming: Wyoming is a midwestern state. It is near [[Idaho#Boise]] [[Idaho]].
    `,
  };

  let message = `Error: Reference [[Idaho#Boise]] in topic [Wyoming] refers to non-existant subtopic of [Idaho]`;

  expect(
    () => jsonForProjectDirectory(projectDir, explFileData, 'Idaho', {})
  ).toThrow(message);
});

test('it logs global orphan topics', () => {
  console.log = jest.fn();
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state. It is near [[Montana]].
    `,
    'topics/Montana/Montana.expl': dedent`Montana: Montana is a midwestern state.
    `,
    'topics/Wyoming/Wyoming.expl': dedent`Wyoming: Wyoming is a midwestern state.
    `,
  };

  let message = `Global Orphan: Topic [Wyoming] is not connected to the default topic [Idaho]`;

  jsonForProjectDirectory(projectDir, explFileData, 'Idaho', { logging: true });

  expect(console.log).toHaveBeenCalledWith(message);
});


test('it logs local orphan subtopics', () => {
  console.log = jest.fn();
  let projectDir = '/example/project';
  let explFileData = {
    'topics/Idaho/Idaho.expl': dedent`Idaho: Idaho is a midwestern state.

    Boise: Boise is the capital of Idaho.
    `,
  };

  let message = `Local Orphan: Subtopic [Boise] lacks a connection to its topic [Idaho]`;

  jsonForProjectDirectory(projectDir, explFileData, 'Idaho', { logging: true });

  expect(console.log).toHaveBeenCalledWith(message);
});

