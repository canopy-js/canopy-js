const { Command, Option } = require('commander');
const init = require('./commands/init');
const build = require('./commands/build');
const watch = require('./commands/watch');
const serve = require('./commands/serve/serve');
const bulk = require('./commands/bulk/bulk');

const program = new Command();

program
  .name('canopy-js')
  .description('A library for creating explanation trees');

program.command('init')
  .description('Initialize a Canopy project')
  .action(() => {
    try {
      init();
    } catch (e) {
      console.error(e);
    }
  });

program.command('build')
  .description('build the Canopy text files into JSON data')
  .option('-s, --symlinks', 'builds symlinked topic folders for static assets server', false)
  .option('-h, --hash-urls', 'build site for use with hangbang URLs', false)
  .option('-p, --project-path-prefix <prefix>', 'for hosting on a domain with a subpath eg example.com/sub/', '')
  .option('-k, --keep-build-directory', 'Remove recursively the previous build directory and create new', false)
  .option('-m, --manual-html', 'Do not create an index.html but rather allow user to create one', false)
  .option('-l, --logging', 'print logs', false)
  .action((options) => {
    try {
      build(options);
    } catch (e) {
      console.error(e);
    }
  });

program.command('watch')
  .description('watch a Canopy project and rebuild JSON assets on text change')
  .option('-s, --symlinks', 'builds symlinked topic folders for static assets server', false) //build options
  .option('-h, --hashbang-urls', 'build site for use with hangbang URLs', false)
  .option('-p, --project-path-prefix <prefix>', 'for hosting on a domain with a subpath eg example.com/subpath/', '')
  .option('-k, --keep-build-directory', 'Remove recursively the previous build directory and create new', false)
  .option('-m, --manual-html', 'Do not create an index.html but rather allow user to create one', false)
  .option('-l, --logging', 'print logs', false)
  .action((options) => {
    watch(options);
  });

program.command('serve')
  .description('run a server for a Canopy project')
  .argument('[portArgument]', 'Additional way of specifying port', 8000)
  .addOption(new Option('-p, --port <number>', 'port number').env('PORT'))
  .option('-s, --static', 'run a static assets server instead of a node.js server', false)
  .action((portArgument, options) => {
    options.port = options.port || Number(portArgument) || 8000;
    try {
      serve(options);
    } catch (e) {
      console.error(e);
    }
  });

program.command('bulk')
  .description('watch a Canopy project and rebuild JSON assets on text change')
  .addOption(new Option('--start', 'choose file paths with fuzzy selector').conflicts('finish'))
  .addOption(new Option('--finish', 'import finished session from canopy_bulk_file').conflicts('start'))
  .addOption(new Option('-b, --blank', 'choose file paths with fuzzy selector').conflicts(['finish', 'pick', 'search', 'continue', 'git']))
  .addOption(new Option('-p, --pick', 'choose file paths with fuzzy selector').conflicts('finish'))
  .addOption(new Option('-f, --files', 'used in conjunction with --pick, allows user to select individual files').conflicts(['finish']).implies({ pick: true }))
  .addOption(new Option('-d, --directories', 'used in conjunction with --pick, allows the user to select directories of files').conflicts(['finish']).implies({ pick: true }))
  .addOption(new Option('-r, --recursive', 'used in conjunction with --pick, allows selection of recursive directory contents').conflicts(['finish']).implies({ pick: true }))
  .addOption(new Option('-g, --git', 'edit files edited on the git stage, and untracked files').conflicts('finish'))
  .addOption(new Option('-s, --search <string>', 'edit files matching a certain string case insensitive').conflicts('finish'))
  .addOption(new Option('-l, --last', 'retrieve files from last bulk session').conflicts('finish'))
  .option('-n, --no-backup', 'clear the backup file and do not write to it')
  .argument('[paths...]')
  .action((paths, options) => {
    bulk(paths, options).catch((e) => {
      if (e.message !== 'fzf exited with error code 130') {
        console.error(e);
      }
    });
  });

program.parse();
