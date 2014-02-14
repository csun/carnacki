/* ====================================================================
 * ====================================================================
 * Authors:	Cameron Sun - cameron.csun@gmail.com
 * 
 * Goal: Make it easier to write scripts to search google for you
 * ====================================================================
 * ====================================================================
 */

 exports.setLoginInfo = setLoginInfo;
 exports.setLocation = setLocation;

 exports.setNextAction = setNextAction;
 exports.addAction = addAction;
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

var userData = {}
var actionQueue = [];


/*
* === setLoginInfo (Public) ===================================
* Sets username and password for login
*/
function setLoginInfo(username, password) {
	userData.username = username;
	userData.password = password;
}

/*
* setLocation (Public)
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
* === setNextAction (Public) ==================================
* Set the next action to be executed. Any arguments
* after the first will be passed to the action function at runtime
*/
function setNextAction(args) {
	actionQueue.unshift(argumentsToAction(arguments));
}

/*
* addAction (Public)
* Adds an action to be executed after all others. Any arguments
* after the first will be passed to the action function at runtime
*/
function addAction(args) {
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
function login() {
	log('Navigating to login path');
	setNextAction(onLogin);
	page.open(LOGIN_PATH);
}

/*
* onLogin
* Login to google with username and password
*/
function onLogin() {
	log('Logging in as ' + userData.username);

	injectJquery();
	page.evaluate(function(user, pass) { 
		$('#gaia_loginform input#Email').val(user);
		$('#gaia_loginform input#Passwd').val(pass);
		$('#gaia_loginform input#signIn').click();
	}, userData.username, userData.password);
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