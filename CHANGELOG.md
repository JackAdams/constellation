Constellation
=============

### vNext

- Add a test suite to ensure base functionality remains unbroken by future changes
- Change CSS for Chrome and Safari so that scroll bars show when content overflows pane (or full screen view)
- Factor out Accounts, Collections and Actions tabs into separate packages ???
- Standard way of persisting config for packages (provide API)
- Better search -- at least for user accounts, based on email address (not easy)

### v1.4.0

- Added support for COMMAND-click of foreign key `_id` type fields to jump instantly to the other document - a la [Dr Mongo](https://github.com/DrMongo/DrMongo)
- Added support for guide material for plugins

### v1.3.1

- Updated dependency on `babrahams:editable-json` to 0.6.2

### v1.3.0

- Click document number to clear collection
- Added support for dump and restore of collections

### v1.2.3

- Fixes webkitStorageInfo, webkitIndexedDB deprecation warnings on Chrome 

### v1.2.2

- Support for autopublish on a per-collection basis
- Updated dependency on `babrahams:editable-json` to 0.6.1
- Employed a rough workaround for a bug in `aldeed:collection2`

### v1.2.1

- Fixed CSS for when the body element has text-align: center and for search selector margins
- Fixed bug with undoing changes to nested fields
- Fixed bugs with accounts tab when no accounts-base added
- Put tabindex="-1" on relevant inputs to stop display bug when clicking tab key
- Added default hotkey changer UI in "Config ..." tab
- Updated dependency on `babrahams:editable-json` to 0.6.0 (more robust and user-friendly version)
- Added API call
  - Constellation.getCollections()

### v1.2.0

First release that didn't need too much more glaringly obvious work on it

- Accounts tab with impersonate
- Improved editable-JSON
- API extensive enough to cover most package needs
- Core functionality (mostly) debugged