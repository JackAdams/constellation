TabStates = new ReactiveDict('Constellation_tab_states');

Meteor.startup(function() {

  // ********************************
  // Give user a means of toggling UI
  // ********************************

  $(document).keydown(function (e) {
    if (e.ctrlKey) {
      if (e.keyCode === 77) {
        Session.set('Constellation_active', !Session.get('Constellation_active'));
      }
      if (e.keyCode === 70) {
        Constellation.toggleFullScreen();
      }
    }
  });


  // **************************
  // Set up the installed tabs
  // **************************

  API.registerCallbacks({
    toggleFullScreen : function () {
      Constellation.toggleFullScreen();
    }
  });

  Constellation.defaultTabs = [
    {name: 'Full screen', id: 'constellation_fullscreen', active:false, noOpen:true, onClick: "toggleFullScreen", headerContentTemplate: 'Constellation_fullscreen_header'},
    {name: 'Account', id: 'constellation_user_account', mainContentTemplate: 'Constellation_account_view', headerContentTemplate: 'Constellation_account_status', menuContentTemplate: 'Constellation_account_controls', active:false},
    {name: 'Actions', id: 'constellation_actions', mainContentTemplate:'Constellation_actions_main', headerContentTemplate: 'Constellation_actions_header', menuContentTemplate: 'Constellation_actions_menu', active:true},
  ];
  
  Tracker.autorun(function() {
    
    // Constellation._tabs can be set programatically by other packages that call Package['babrahams:constellation'].Constellation.addTab({ ... }});
    
    Constellation.tabs = Constellation.defaultTabs.concat(_.map(Constellation._tabs, function (tab) { var id = tab.id || tab.name; var thisTab = _.clone(tab); return _.extend(thisTab, {id: 'constellation_plugin_' + id}) }) || []);
    
    var ConstellationConfig = Session.get("Constellation");
    var collections = ConstellationConfig && _.without(ConstellationConfig.collections, null) || [];
    
    if (collections.length) {
      _.each(collections, function (collection) {
        Constellation.tabs.push({
          name: collection,
          id: collection,
          headerContentTemplate: "Constellation_collection_count",
          menuContentTemplate: "Constellation_docControls",
          mainContentTemplate: "Constellation_docViewer",
          searchContentTemplate: "Constellation_search",
          active: true,
          collection: true
        }); 
      });
    }
    else {
      Constellation.tabs.push({
         name: "No collections found",
         mainContentTemplate: "Constellation_collections_notFound" 
      });
    }
    
    // Config goes at the bottom
    Constellation.tabs.push({name: 'Config ...', id: 'constellation_config', headerContentTemplate: 'Constellation_config_header', menuContentTemplate: 'Constellation_config_menu', mainContentTemplate: 'Constellation_config_view', active: true});
    
    _.each(Constellation.tabs, function (tab) {
      var key = ('Constellation_' + tab.id).replace(/_/g,"-");
      var storedValue = localStorage[key]; // localStorage just does string values, not booleans
      var state = (typeof storedValue !== 'undefined') ? ((storedValue === "false") ? false : true) : ((typeof tab.active !== 'undefined') ? tab.active : true);
      TabStates.set(tab.id, state);
    });
    
    Session.set('Constellation_tabs', Constellation.tabs);
  
  });
  
  
  // ***********************
  // Auto detect collections
  // ***********************
  
  // If the user hasn't done a Session.set('Constellation',{ ... });
  // set some default values
  if (Session.get('Constellation') === undefined) {

  // Build a default config object
  // Build a default config object

    var collections = _.map(Mongo.Collection.getAll(), function (collection) {

      // Note this returns the actual mongo collection name, not Meteor's Mongo.Collection name
      return collection.name;

    });

    var defaults = {
      'collections': collections,
    };

    Session.set("Constellation", defaults);

  }
  
});