Package.describe({
  name:    'constellation:console',
  summary: 'An extensible development console for Meteor',
  version: '1.3.0',
  git:     'https://github.com/JackAdams/constellation.git',
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function(api) {

  var clientFiles = [
    "client/lib/utils.js",
    "client/lib/api.js",
    "client/lib/setup.js",
    "client/row_fullscreen/fullscreen.html",
    "client/row_fullscreen/fullscreen.js",
    "client/row_config/config.html",
    "client/row_config/config.js",
    "client/row_account/account.html",
    "client/row_account/account.js",
    "client/row_account/accountViewer.html",
    "client/row_account/accountViewer.js",
    "client/row_collection/collections.html",
    "client/row_collection/collections.js",
    "client/row_collection/search.html",
    "client/row_collection/search.js",
    "client/row_collection/docViewer.html",
    "client/row_collection/docViewer.js",
    "client/row_collection/docInsert.html",
    "client/row_collection/docInsert.js",
    "client/row_collection/docControls.html",
    "client/row_collection/docControls.js",
    "client/row_actions/undoRedo.html",
    "client/row_actions/undoRedo.js",
    "client/row_actions/actions.html",
    "client/row_actions/actions.js",
    "client/Constellation.css",
    "client/Constellation.html",
    "client/Constellation.js"
  ];

  var serverFiles = [
    "server/methods.js"
  ];
  
  var commonFiles = [
    "common/common.js",
    "common/utility_functions.js",
    "common/mutators.js"
  ];

  api.versionsFrom('1.0');
  api.use(['templating','tracker','mongo','session','underscore','reactive-var','reactive-dict','blaze','jquery'], 'client');
  api.use('check');
  api.use('aldeed:collection2@2.5.0', {weak: true}); // This must go before: api.use('dburles:mongo-collection-instances@0.3.4');
  api.use('dburles:mongo-collection-instances@0.3.4');
  api.use('gwendall:session-json@0.1.7', 'client');
  api.use('babrahams:editable-json@0.6.1');
  api.use('accounts-base', {weak: true});

  api.add_files(commonFiles);
  api.add_files(clientFiles, "client");
  api.add_files(serverFiles, "server");
  
  if (api.export) {
    api.export('API','client');
    api.export('Constellation');
  }

});
