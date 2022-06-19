const fs = require('fs-extra');
const dedent = require('dedent-js');
const readline = require('readline');

function init() {
	const rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout,
	});

	if (!fs.existsSync('./Topics')) fs.mkdirSync('./Topics');

	let gitignore = dedent`
		build/
		.canopy_bulk_file
		.canopy_bulk_backup_log
		canopy_bulk_file
		**/.DS_Store
		`

	fs.writeFileSync( '.gitignore', gitignore );

	const main = async () => {
	  await requestDefaultTopicName((defaultTopicName) => {
	  	if (!defaultTopicName) throw 'No default topic name given.';
	  	let defaultTopicNameSlug = defaultTopicName.replace(/ /g, '_');
			fs.writeFileSync('.canopy_default_topic', defaultTopicName + "\n");
			fs.ensureDirSync(`Topics/${defaultTopicNameSlug}`);
			fs.writeFileSync(`Topics/${defaultTopicNameSlug}/${defaultTopicNameSlug}.expl`, `${defaultTopicName}: Text here.\n`);
	  });

	  rl.close();
	}

	main();

	function requestDefaultTopicName(uponAnswerCallback) {
	  return new Promise((resolve, reject) => {
	  	console.log()
	  	console.log('Enter a default topic name.')
			console.log('This will be the header that users first see upon viewing your project.')
			console.log('It is typical to choose your project name or title as the default topic.')
			console.log();

	    rl.question('Default topic name: ', (answer) => {
	    	uponAnswerCallback(answer);
	      resolve();
	    })
	  })
	}

}

module.exports = init;
