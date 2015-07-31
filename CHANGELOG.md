Constellation
=============

### vNext

Factor out Accounts, Collections and Actions tabs into separate packages ???

### v1.2.1

- Fixed CSS for when the body element has text-align: center and for search selector margins
- Fixed bug with undoing changes to nested fields
- Fixed bugs with accounts tab when no accounts-base added
- Put tabindex="-1" on relevant inputs to stop display bug when clicking tab key
- Added default hotkey changer UI in "Config ..." tab
- Updated dependency on `babrahams:edtiable-json` to 0.6.0 (more robust and user-friendly version)
- Added API call
  - Constellation.getCollections()

### v1.2.0

First release that didn't need too much more glaringly obvious work on it

- Accounts tab with impersonate
- Improved editable-JSON
- API extensive enough to cover most package needs
- Core functionality (mostly) debugged