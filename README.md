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

[babrahams:temple](https://github.com/JackAdams/temple) (for visualizing template information)
[babrahams:constellation-session](https://github.com/JackAdams/constellation-session) (for viewing / manipulating data in the Session variable)
[babrahams:constellation-subscriptions](https://github.com/JackAdams/constellation-subscriptions) (for viewing current subscriptions)

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

'menuContentTemplate` is rendered in the strip at the top of the main content area of the tab that appears when the tab is open.

`mainContentTemplate` is rendered in the space for the main content when a tab is open.

You can set `active: false` in the object above if you don't want your plugin to be shown automatically (the user can make it visible through the "Config" tab).

You can also set `id: "unique-id-for-my-tab"` if you like, but unless two plugins share the same name, this isn't going to be a problem.

__Note__: make sure you put `debugOnly: true` in your package's `Package.describe({ ... });`

API
---

All of these must be prefixed by `Package["babrahams:constellation"].API.` when using then in your plugin code.

`addTab({name: "my-plugin"})` registers a new tab called "my-plugin" in Constellation's UI - see above for the fields the object can have when adding a tab

`isActive` lets you check whether Constellation's UI is active or closed

`hideCollection('collectionName')` allows you to hide collections programatically (collections hidden this way cannot be unhidden through the "Config" tab)

`getCurrentTab()` gets the id of the currently selected tab

`setCurrentTab("unique-id-for-my-tab")` allows you to change tabs programatically (use either the `id` value set in the `addTab({ ... })` call or the `name` value)