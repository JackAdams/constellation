Package.describe({
  name:    'constellation:console',
  summary: 'An extensible development console for Meteor',
  version: '1.4.11',
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
    "client/row_config/guide.html",
    "client/row_config/guide.js",
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
    "server/methods.js",
    "server/publications.js"
  ];
  
  var commonFiles = [
    "common/common.js",
    "common/utility_functions.js",
    "common/mutators.js",
    "common/methods.js"
  ];

  api.versionsFrom(['1.8.2', '2.3']);
  api.use(['templating@1.3.2','blaze@2.3.4','jquery@1.11.11', 'tracker', 'mongo', 'session', 'reactive-var', 'reactive-dict'], 'client');
  api.use(['check', 'random', 'underscore']);
  // api.use('aldeed:collection2@3.0.0', {weak: true}); // This must go before: api.use('dburles:mongo-collection-instances@0.3.4');
  api.use('dburles:mongo-collection-instances@0.3.5');
  api.use('gwendall:session-json@0.1.7', 'client');
  api.use('babrahams:editable-json@0.6.8');
  // api.use('accounts-base', {weak: true});

  api.addFiles(commonFiles);
  api.addFiles(clientFiles, "client");
  api.addFiles(serverFiles, "server");
  
  if (api.export) {
    api.export('API', 'client');
    api.export('Constellation');
  }

});
