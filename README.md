Constellation
=============

This is a fork of the open source part of the [msavin:mongol](https://github.com/msavin/Mongol) project.

The main difference is that Constellation provides an API for adding plugins (custom tabs) to the existing UI.

Usage
-----

	$ meteor add babrahams:constellation

After installation, press <strong>Control + M</strong> to toggle it.

Plugins
-------

Examples of plugins are:

- [babrahams:temple](https://github.com/JackAdams/temple) (for visualizing template information)
- [babrahams:constellation-session](https://github.com/JackAdams/constellation-session) (for viewing / manipulating data in the Session variable)
- [babrahams:constellation-subscriptions](https://github.com/JackAdams/constellation-subscriptions) (for viewing current subscriptions)
- [babrahams:constellation-autopublish](https://github.com/JackAdams/constellation-autopublish) (for toggling autopublish behaviour)

If you want to write a plugin, take a look at the source of the packages above.

Making plugins
--------------

Make a package with `api.use('babrahams:constellation@1.0.0', 'client')` in the `package.js` file. And put something like this in a js file on the client:

```
Package["babrahams:constellation"].API.addTab({
  name: 'Temple',
  mainContentTemplate: 'Constellation_temple_view',
  headerContentTemplate: 'Constellation_temple_header',
  menuContentTemplate: 'Constellation_temple_menu'
});
```

`name` is the only mandatory field, but if you want your package to have any visual presence in Constellation, you'll want to at least set the `mainContentTemplate` field to the name of a template that contains your plugin UI.

`headerContentTemplate` is rendered in the header bar of the Constellation UI, right before the name of your plugin (we're assuming you'll probably want this to `float: right;`).

`menuContentTemplate` is rendered in the strip at the top of the main content area of the tab that appears when the tab is open.

`mainContentTemplate` is rendered in the space for the main content when a tab is open.

You can set `active: false` in the object above if you don't want your plugin to be shown automatically (the user can make it visible through the "Config" tab).

`noOpen: true` means the tab won't open when clicked.

`callback: "myCallBack"` will fire the `"myCallBack"` function every time the tab header is clicked. `"myCallBack"` must be registered as shown in the API section below.

You can also set `id: "unique-id-for-my-tab"` if you like, but unless two plugins share the same name, this isn't going to be necessary.

__Note__: make sure you put `debugOnly: true` in your package's `Package.describe({ ... });`

API
---

All methods must be prefixed by `Package["babrahams:constellation"].API.` when using them in your plugin code, so write this at the top of your files that use the API
```
var Constellation = Package["babrahams:constellation"].API;
```
then you can write:

`Constellaton.isActive()` to check whether Constellation's UI is active or closed (i.e. has the user pressed __Control + M__ or not)

`Constellaton.addTab({name: "my-plugin"})` to register a new tab called "my-plugin" in Constellation's UI - see above for the fields the object can have when adding a tab

The `type` field/param in the three methods below will be:
 - `"collection"` for collection tabs
 - `"plugin"` for any tab added using `Constellation.addTab` - i.e. tabs added by plugin packages - and the default tabs, which are: "Fullscreen", "Account", "Actions", "Config"

`Constellaton.getCurrentTab()` to get the `id` and type of the currently selected tab in an object of the form {id: <tabId}, type: <tabType>}

`Constellaton.setCurrentTab("unique-id-of-my-tab", type)` to change tabs programatically (use either the `id` value set in `addTab({ ... })` or the `name` value if no id was set)

`Constellaton.tabVisible("unique-id-of-my-tab", type)` to check if this tab is currently enabled by the user via the "Config ..." panel (i.e. does it currently appear as a tab in the user's UI)

`Constellation.isFullScreen()` to see if Constellation is in fullscreen mode

`Constellaton.hideCollection('collectionName')` to hide collections programatically (collections hidden this way cannot be unhidden through the "Config" tab - they won't even appear there)

`Constellaton.showCollection('collectionName')` to show collections programatically

```
Constellaton.registerCallbacks({
  "myCallBack" : function () {
    console.log("Callback fired!");
  }
});
```