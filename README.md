# carnacki
A Phantom.js library designed to make scripting google searches easier.

## Quick Start
```javascript
carnacki = require('carnacki.js');

// Login and save an image of the loaded page
carnacki.addLastAction(carnacki.login, 'username', 'password');
carnacki.addLastAction(carnacki.savePage);

// Search for 'pizza' and save the page again
carnacki.addLastAction(carnacki.searchFor, 'pizza');
carnacki.addLastAction(carnacki.savePage);

// Go!
carnacki.go();
```

### Adding Actions
Instead of having to chain callbacks, carnacki maintains a list of sequentially executed 'actions' (functions) that can be accessed two different ways:
```javascript
// Add an action to execute after all others
carnacki.addLastAction(anyFunction);
// Or add one before all others 
carnacki.addNextAction(anyFunction);
```
After all actions are set up, they are executed sequentially with a call to
```javascript
carnacki.go();
```
Actions that will require arguments at runtime can be given arguments when they are added:
```javascript
carnacki.addLastAction(function(message) { return message; }, 'hello world');
```
