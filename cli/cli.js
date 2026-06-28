const { Command, Option } = require('commander');
const init = require('./init');
const build = require('./build');
const watch = require('./watch');
const utility = require('./utility');
const serve = require('./serve/serve');
const dev = require('./dev');
const note = require('./note');
const bulk = require('./bulk/bulk');
const electron = require('./electron');
const program = new Command();

function addBuildOptions(cmd) {
  return cmd
    .option('-s, --symlinks', 'builds symlinked topic folders for static assets server', false)
    .option('-h, --hash-urls', 'build site for use with hangbang URLs', false)
    .option('-p, --project-path-prefix <prefix>', 'for hosting on a domain with a subpath eg example.com/sub/', '')
    .option('-x, --replace-build-directory', 'Replace the build directory before building', false)
    .addOption(new Option('--cache', 'whether to build touched topics first')) // cache requires old files for time comparison
    .option('-m, --manual-html', 'Do not create an index.html but rather allow user to create one', false)
    .addOption(new Option('--file [output]', 'Also write a single-file HTML (default: build/file/<DefaultTopic>.html)').implies({ hashUrls: true }))
    .addOption(new Option('--skip-initial-build', 'Don\'t build JSON until bulk file change'))
    .addOption(new Option('--pretty', 'Pretty print JSON'));
}

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

addBuildOptions(
  program.command('build')
    .description('build the Canopy text files into JSON data')
    .option('-l, --logging', 'print logs', true)
    .option('-o, --orphans', 'Note which topics do not receive references from other parts of the project', false)
    .option('-r, --reciprocals', 'Note which topics reference topics that do not reference them back.', false)
    .option('-e, --error', 'Throw errors with trace for debugging', false)
).action((options) => {
  try {
    build(options);
  } catch (e) {
    if (options.error) throw e;
    console.error(e.message);
    process.exit(1);
  }
});

addBuildOptions(
  program.command('watch')
    .description('watch a Canopy project and rebuild JSON assets on text change')
    .option('-l, --logging', 'print logs', true)
).action((options) => {
  try {
    watch(options);
  } catch (e) {
    if (options.error) throw e;
    console.error(e.message);
    process.exit(1);
  }
});

addBuildOptions(
  program.command('dev')
    .description('watch a Canopy project and rebuild JSON assets on text change')
    .argument('[portArgument]', 'Additional way of specifying port', null) // serve options
    .addOption(new Option('-p, --port <number>', 'port number').env('PORT'))
    .option('--no-open', 'do not open link in browser', true)
    .option('-l, --logging', 'print logs', true)
).action((portArgument, options) => {
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

program.command('electron')
  .description('build and run an Electron app for a Canopy project')
  .option('--start', 'run the generated Electron app with electron-forge start')
  .option('--package', 'package the generated Electron app with electron-forge package')
  .option('--make', 'make distributable Electron artifacts with electron-forge make')
  .option('--scaffold-only', 'only write build/electron without installing or running Electron')
  .option('--no-install', 'skip npm install before running an Electron script')
  .option('-l, --logging', 'print logs', true)
  .action((options) => {
    try {
      electron(options);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

addBuildOptions(
  program.command('bulk')
    .description('watch a Canopy project and rebuild JSON assets on text change')
    .addOption(new Option('--start', 'choose file paths with fuzzy selector').conflicts('finish'))
    .addOption(new Option('--finish', 'import finished session from canopy_bulk_file').conflicts('start'))
    .addOption(new Option('--resume', 'resume editing existing dotfile').conflicts('start').conflicts('finish'))
    .addOption(new Option('-u, --use-existing', 'use existing bulk file if present'))
    .addOption(new Option('-b, --blank', 'start with a blank file').conflicts(['finish', 'pick', 'search', 'continue', 'git']))
    .addOption(new Option('-p, --pick', 'choose file paths with fuzzy selector'))
    .addOption(new Option('-f, --files', 'used in conjunction with --pick, allows user to select individual files').implies({ pick: true }))
    .addOption(new Option('-d, --directories', 'used in conjunction with --pick, allows the user to select directories of files').implies({ pick: true }))
    .addOption(new Option('-r, --recursive', 'used in conjunction with --pick, allows selection of recursive directory contents').implies({ pick: true }))
    .addOption(new Option('-g, --git', 'edit files edited on the git stage, and untracked files'))
    .addOption(new Option('-s, --search <string>', 'edit files matching a certain string case insensitive'))
    .addOption(new Option('--sync', 'create a bulk file and sync contents').conflicts('blank').conflicts('start').conflicts('finish'))
    .addOption(new Option('--all', 'Include all topics; in sync mode, keep watching for newly added ones').conflicts(['blank', 'start', 'resume']))
    .addOption(new Option('-n, --bulk-file-name <string>', 'give canopy bulk file custom name'))
    .addOption(new Option('--no-editor', 'use --sync without opening the default editor'))
    .addOption(new Option('--logging <boolean>', 'whether you want logging').default(true))
    .addOption(new Option('--port <number>', 'Which port to run the server on for sync mode').default(undefined).implies({sync: true}))
    .addOption(new Option('--error', 'Whether to throw errors'))
    .option('--no-open', 'do not open link in browser', true)
    .option('--no-backup', 'clear the backup file and do not write to it')
    .argument('[paths...]')
).action((paths, options) => {
  bulk(paths, options).catch((e) => {
    if (options.error) throw e;
    console.error(e.message);
    process.exit(1);
  });
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
