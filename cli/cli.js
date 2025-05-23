const { Command, Option } = require('commander');
const init = require('./init');
const build = require('./build');
const watch = require('./watch');
const utility = require('./utility');
const serve = require('./serve/serve');
const dev = require('./dev');
const review = require('./review');
const note = require('./note');
const bulk = require('./bulk/bulk');
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
      console.error(e.message);
      process.exit(1);
    }
  });

program.command('build')
  .description('build the Canopy text files into JSON data')
  .option('-s, --symlinks', 'builds symlinked topic folders for static assets server', false)
  .option('-h, --hash-urls', 'build site for use with hangbang URLs', false)
  .option('-p, --project-path-prefix <prefix>', 'for hosting on a domain with a subpath eg example.com/sub/', '')
  .option('-k, --keep-build-directory', 'Do not create a new build directory, by default it is removed recursively', false)
  .addOption(new Option('--cache', 'whether to build touched topics first').implies({'keepBuildDirectory': true}))
  .option('-m, --manual-html', 'Do not create an index.html but rather allow user to create one', false)
  .option('-l, --logging', 'print logs', true)
  .option('-o, --orphans', 'Note which topics do not receive references from other parts of the project', false)
  .option('-r, --reciprocals', 'Note which topics reference topics that do not reference them back.', false)
  .option('-e, --error', 'Throw errors with trace for debugging', false)
  .addOption(new Option('--skip-initial-build', 'Don\'t build JSON until bulk file change').implies({'keepBuildDirectory': true}))
  .addOption(new Option('--pretty', 'Pretty print JSON'))
  .action((options) => {
    try {
      build(options);
    } catch (e) {
      if (options.error) throw e;
      console.error(e.message);
      process.exit(1);
    }
  });

program.command('watch')
  .description('watch a Canopy project and rebuild JSON assets on text change')
  .option('-s, --symlinks', 'builds symlinked topic folders for static assets server', false) //build options
  .option('-h, --hash-urls', 'build site for use with hangbang URLs', false)
  .option('-p, --project-path-prefix <prefix>', 'for hosting on a domain with a subpath eg example.com/subpath/', '')
  .option('-k, --keep-build-directory', 'Remove recursively the previous build directory and create new', false)
  .addOption(new Option('--cache', 'whether to build touched topics first').implies({'keepBuildDirectory': true}))
  .option('-m, --manual-html', 'Do not create an index.html but rather allow user to create one', false)
  .option('-l, --logging', 'print logs', true)
  .addOption(new Option('--pretty', 'Pretty print JSON'))
  .addOption(new Option('--skip-initial-build', 'Don\'t build JSON until bulk file change').implies({'keepBuildDirectory': true}))
  .action((options) => {
    try {
      watch(options);
    } catch (e) {
      if (options.error) throw e;
      console.error(e.message);
      process.exit(1);
    }
  });

program.command('dev')
  .description('watch a Canopy project and rebuild JSON assets on text change')
  .argument('[portArgument]', 'Additional way of specifying port', null) // serve options
  .addOption(new Option('-p, --port <number>', 'port number').env('PORT'))
  .option('--no-open', 'do not open link in browser', true)
  .option('-s, --symlinks', 'builds symlinked topic folders for static assets server', false) //build options
  .option('-h, --hash-urls', 'build site for use with hangbang URLs', false)
  .option('-p, --project-path-prefix <prefix>', 'for hosting on a domain with a subpath eg example.com/subpath/', '')
  .option('-k, --keep-build-directory', 'Remove recursively the previous build directory and create new', false)
  .addOption(new Option('--cache', 'whether to build touched topics first').implies({'keepBuildDirectory': true}))
  .option('-m, --manual-html', 'Do not create an index.html but rather allow user to create one', false)
  .option('-l, --logging', 'print logs', true)
  .addOption(new Option('--skip-initial-build', 'Don\'t build JSON until bulk file change').implies({'keepBuildDirectory': true}))
  .action((portArgument, options) => {
    try {
      options.port = options.port || Number(portArgument) || null;
      dev(options);
    } catch (e) {
      if (options.error) throw e;
      console.error(e.message);
      process.exit(1);
    }
  });

program.command('serve')
  .description('run a server for a Canopy project')
  .argument('[portArgument]', 'Additional way of specifying port', null)
  .addOption(new Option('-p, --port <number>', 'port number').env('PORT'))
  .option('--no-open', 'do not open link in browser', true)
  .addOption(new Option('--logging <boolean>', 'whether you want logging').default(true))
  .action((portArgument, options) => {
    options.port = options.port || Number(portArgument) || null;
    try {
      serve(options);
    } catch (e) {
      if (options.error) throw e;
      console.error(e.message);
      process.exit(1);
    }
  });

program.command('bulk')
  .description('watch a Canopy project and rebuild JSON assets on text change')
  .addOption(new Option('--start', 'choose file paths with fuzzy selector').conflicts('finish'))
  .addOption(new Option('--finish', 'import finished session from canopy_bulk_file').conflicts('start'))
  .addOption(new Option('--resume', 'resume editing existing dotfile').conflicts('start').conflicts('finish'))
  .addOption(new Option('-u, --use-existing', 'use existing bulk file if present'))
  .addOption(new Option('-b, --blank', 'start with a blank file').conflicts(['finish', 'pick', 'search', 'continue', 'git']))
  .addOption(new Option('-p, --pick', 'choose file paths with fuzzy selector').conflicts('finish'))
  .addOption(new Option('-f, --files', 'used in conjunction with --pick, allows user to select individual files').conflicts(['finish']).implies({ pick: true }))
  .addOption(new Option('-d, --directories', 'used in conjunction with --pick, allows the user to select directories of files').conflicts(['finish']).implies({ pick: true }))
  .addOption(new Option('-r, --recursive', 'used in conjunction with --pick, allows selection of recursive directory contents').conflicts(['finish']).implies({ pick: true }))
  .addOption(new Option('-g, --git', 'edit files edited on the git stage, and untracked files').conflicts('finish'))
  .addOption(new Option('-s, --search <string>', 'edit files matching a certain string case insensitive').conflicts('finish'))
  .addOption(new Option('--sync', 'create a bulk file and sync contents').conflicts('blank').conflicts('start').conflicts('finish'))
  .addOption(new Option('-n, --bulk-file-name <string>', 'give canopy bulk file custom name'))
  .addOption(new Option('--no-editor', 'use --sync without opening the default editor'))
  .addOption(new Option('--logging <boolean>', 'whether you want logging').default(true))
  .addOption(new Option('--port <number>', 'Which port to run the server on for sync mode').default(undefined).implies({sync: true}))
  .addOption(new Option('--error', 'Whether to throw errors'))
  .addOption(new Option('--pretty', 'Pretty print JSON'))
  .addOption(new Option('--skip-initial-build', 'Don\'t build JSON until bulk file change').implies({'keepBuildDirectory': true}))
  .option('--no-open', 'do not open link in browser', true)
  .option('--no-backup', 'clear the backup file and do not write to it')
  .option('-k, --keep-build-directory', 'Do not create a new build directory, by default it is removed recursively', false)
  .addOption(new Option('--cache', 'whether to build touched topics first').implies({'keepBuildDirectory': true}))
  .argument('[paths...]')
  .action((paths, options) => {
    bulk(paths, options).catch((e) => {
      if (options.error) throw e;
      console.error(e.message);
      process.exit(1);
    });
  });

program.command('review')
  .description('Review and edit expl files using spaced repitition')
  .addOption(new Option('-l, --list [count]', 'show expl files and due dates, optionally limited to a number').argParser(val => isNaN(parseInt(val)) ? true : parseInt(val)))
  .addOption(new Option('-a, --all [count]', 'show all due files in one bulk session').argParser(val => isNaN(parseInt(val)) ? true : parseInt(val)))
  .addOption(new Option('-u, --undo', 'revert to previous backup dotfile'))
  .addOption(new Option('-x, --exclude <paths...>', 'Ignore paths containing string'))
  .addOption(new Option('-s, --select <paths...>', 'Only paths containing string'))
  .addOption(new Option('-p, --pick', 'Pick from due reviews').implies({ all: true }))
  .addOption(new Option('--status', 'Log status of all reviews'))
  .addOption(new Option('-t, --touch', 'Touch files as edited today'))
  .addOption(new Option('-r, --reset', 'Reset files to previous state'))
  .action((options) => {
    review(options);
  });

program.command('utility')
  .description('Print values and conversions for scripting')
  .addOption(new Option('--categories', 'print newline separated categories'))
  .addOption(new Option('--topics', 'print newline separated topic names'))
  .action((options) => {
    utility(options);
  });

program
  .command('note [categoryPath] [noteText]')
  .description('Add one line to a new or existing expl file')
  .action((categoryPath, noteText) => {
    note([categoryPath, noteText]).catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
  });

program.parse();
