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

 exports.savePage = savePage;

/*
* === Variables ===============================================
*/
var LOGIN_PATH = "https://accounts.google.com/ServiceLogin?hl=en&continue=https://www.google.com/";

var debuggingEnabled = true;
var actionWait = 1000;

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
* Do the next queued up action, after a wait.
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
	log("STARTING SESSION =================");
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
function savePage() {
	log("Saving page...");
	page.render('Results/' + page.title + '.png');

	doNextAction();
}


/*
* === checkStatus =============================================
* Checks if a page loaded correctly
*/
function checkStatus(status) {
	if(status == 'fail') {
		log("Load failed. Aborting.");
		phantom.exit();
	}
	log('   Success');
}

function injectJquery() {
	if (!page.injectJs("jQuery-1.9.1.js")) {
		log("Failed to inject jQuery. Make sure that jQuery-1.9.1.js is accessible from this directory.");
		phantom.exit();
	}
}