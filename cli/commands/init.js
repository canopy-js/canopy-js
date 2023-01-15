const fs = require('fs-extra');
const dedent = require('dedent-js');
const readline = require('readline');
let chalk = require('chalk');

function init() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (!fs.existsSync('./topics')) fs.mkdirSync('./topics');

  let gitignore = dedent`
    build/
    canopy_bulk_file
    **/.DS_Store
    .canopy_bulk_last_session_files
    .canopy_bulk_original_selection
    .canopy_bulk_backups/**
    ` + '\n';

  fs.writeFileSync( '.gitignore', gitignore );

  const main = async () => {
    await requestDefaultTopic((defaultTopic) => {
      if (!defaultTopic) throw new Error(chalk.red('No default topic name given.'));
      let defaultTopicSlug = defaultTopic.replace(/ /g, '_');
      fs.ensureDirSync(`topics/${defaultTopicSlug}`);
      let defaultTopicFilePath = `topics/${defaultTopicSlug}/${defaultTopicSlug}.expl`;
      fs.writeFileSync(defaultTopicFilePath,
        `${defaultTopic}: Text here. This is an example reference to a [[subtopic]].\n\n` +
        `Subtopic: This is a subtopic paragraph.`
      );
      fs.ensureDirSync(`topics/Inbox`);
      fs.writeFileSync(`topics/Inbox/Inbox.expl`, `This is for notes that don't yet have a category.\n`);
      fs.writeFileSync('canopy_default_topic', defaultTopicFilePath + "\n");
    });

    rl.close();
  };

  main();

  function requestDefaultTopic(uponAnswerCallback) {
    return new Promise((resolve) => {
      console.log();
      console.log('Enter a default topic name.');
      console.log('This will be the header that users first see upon viewing your project.');
      console.log('It is typical to choose your project name or title as the default topic.');
      console.log();

      rl.question('Default topic name: ', (answer) => {
        uponAnswerCallback(answer);
        resolve();
      });
    });
  }

}

module.exports = init;
