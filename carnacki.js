/* ====================================================================
 * ====================================================================
 * Authors:	Cameron Sun - cameron.csun@gmail.com
 * 
 * Goal: Make it easier to write scripts to search google for you
 * ====================================================================
 * ====================================================================
 */

 exports.setLocation = setLocation;

 exports.addNextAction = addNextAction;
 exports.addLastAction = addLastAction;
 exports.go = go;

 exports.login = login;
 exports.searchFor = searchFor;
 exports.navigateTo = navigateTo;

 exports.savePage = savePage;
 exports.saveHtml = saveHtml;

/*
* === Variables ===============================================
*/

var LOGIN_PATH = 'https://accounts.google.com/ServiceLogin?hl=en&continue=https://www.google.com/';
var JQUERY_FILENAME = 'carnacki_jquery.js';
var JQUERY_DOWNLOAD_URL = 'http://code.jquery.com/jquery-1.11.0.min.js';

var debuggingEnabled = true;
var actionWait = 1000;

var fs = require('fs');
var page = require('webpage').create();
page.onLoadFinished = onLoadFinished;

var actionQueue = [];


/*
* === setLocation (Public) ====================================
* Sets the user's location to a given latitude and longitude
*/
function setLocation(lat, long) {
	
}


/*
* === onLoadFinished ==========================================
* Calls the next queued action after a certain amount of wait
*/
function onLoadFinished(status) {
	log('Load finished');
	checkStatus(status);
	doNextAction();
}


/*
* === addNextAction (Public) ==================================
* Adds an action to be executed before all others. Any arguments
* after the first will be passed to the action function at runtime
*/
function addNextAction(args) {
	actionQueue.unshift(argumentsToAction(arguments));
}

/*
* addLastAction (Public)
* Adds an action to be executed after all others. Any arguments
* after the first will be passed to the action function at runtime
*/
function addLastAction(args) {
	actionQueue.push(argumentsToAction(arguments));
}

/*
* argumentsToAction
* Format the specified arguments of a function as a stored action
*/
function argumentsToAction(args) {
	return {
		action: args[0],
		args: Array.prototype.slice.call(args,1)
	}
}

/*
* doNextAction
* Do the next queued up action, after a wait
*/
function doNextAction() {
	if(actionQueue.length == 0) phantom.exit();
	
	log('Starting next action -------------');
	setTimeout( function() {
		actionData = actionQueue.shift();
		actionData.action.apply(undefined, actionData.args);
	}, actionWait);
}

/*
* go (Public)
* Start performing queued actions
*/
function go() {
	log('STARTING SESSION =================');
	setUpJquery();
	doNextAction();
}

/*
* setUpJquery
* If no local copy of jquery exists in the current directory,
* download one
*/
function setUpJquery() {
	log('Setting up jQuery...');
	if(!fs.isFile(JQUERY_FILENAME)) {
		log('   jQuery file missing. Downloading...');
		addNextAction(saveJquery, JQUERY_FILENAME);
		addNextAction(navigateTo, JQUERY_DOWNLOAD_URL);
	}
	else {
		log('   jQuery already set up!');
	}
}

/*
* saveJquery
* Saves the current page as the carnacki jquery file
*/
function saveJquery() {
	log('   saving ' + JQUERY_FILENAME);
	fs.write(JQUERY_FILENAME, page.plainText, 'w');
	doNextAction();
}

/*
* === login (Public) ==========================================
* Login to google with pre set username and password
*/
function login(username, password) {
	log('Navigating to login path');
	addNextAction(onLogin, username, password);
	page.open(LOGIN_PATH);
}

/*
* onLogin
* Login to google with username and password
*/
function onLogin(username, password) {
	log('Logging in as ' + username);

	injectJquery();
	page.evaluate(function(user, pass) { 
		$('#gaia_loginform input#Email').val(user);
		$('#gaia_loginform input#Passwd').val(pass);
		$('#gaia_loginform input#signIn').click();
	}, username, password);
}

/*
* searchFor (Public)
* Search google with a given query.
*/
function searchFor(query) {
	log('Searching for ' + query);

	page.open('https://www.google.com/search?q=' + query);
}

/*
* navigateTo (Public)
* Navigate to a url
*/
function navigateTo(url) {
	log('Navigating to ' + url);

	page.open(url);
}

/*
* === log =====================================================
* If debugging is enabled, log a message to the console
*/
function log(msg) {
	if(debuggingEnabled) console.log(msg);
}

/*
* savePage (Public)
* Saves a picture of the page in /Results
*/
function savePage(filename) {
	if(!filename) {
		filename = page.title;
	}
	log('Saving page as ' + filename);
	page.render('Results/' + filename + '.png');

	doNextAction();
}

/*
* saveHtml (Public)
* Saves the html of the page in /Results
*/
function saveHtml(filename) {
	if(!filename) {
		filename = page.title;
	}
	log('Saving html as ' + filename);
	fs.write('Results/' + filename + '.html', page.content, 'w');

	doNextAction();
}


/*
* === checkStatus =============================================
* Checks if a page loaded correctly
*/
function checkStatus(status) {
	if(status == 'fail') {
		log('Load failed. Aborting.');
		phantom.exit();
	}
	log('   Success');
}

/*
* injectJquery
* inject the carnacki jQeury file into the page so it can be used
*/
function injectJquery() {
	if (!page.injectJs(JQUERY_FILENAME)) {
		log('Failed to inject jQuery.');
		phantom.exit();
	}
}