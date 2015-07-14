TabStates = new ReactiveDict('Constellation_tab_states');
ConstellationDict = new ReactiveDict('Constellation_dict');

// In case these need to be available to packages
Constellation.TabStates = TabStates;
Constellation.ConstellationDict = ConstellationDict;
Constellation._keyCode = 67;

Meteor.startup(function() {

  // ********************************
  // Give user a means of toggling UI
  // ********************************

  $(document).keydown(function (e) {
    if (e.ctrlKey) {
      if (e.keyCode === Constellation._keyCode) {
        ConstellationDict.set('Constellation_active', !ConstellationDict.get('Constellation_active'));
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
    {name: 'Full screen', id: 'constellation_plugin_fullscreen', active:false, noOpen:true, onClick: "toggleFullScreen", headerContentTemplate: 'Constellation_fullscreen_header'},
    {name: 'Account', id: 'constellation_plugin_user_account', mainContentTemplate: 'Constellation_account_view', headerContentTemplate: 'Constellation_account_status', menuContentTemplate: 'Constellation_account_controls', active:false},
    {name: 'Actions', id: 'constellation_plugin_actions', mainContentTemplate:'Constellation_actions_main', headerContentTemplate: 'Constellation_actions_header', menuContentTemplate: 'Constellation_actions_menu', active:true}
  ];
  
  Tracker.autorun(function() {
    
    // Constellation._tabs can be set programatically by other packages that call Package['constellation:console'].Constellation.addTab({ ... }});
    
    Constellation.tabs = Constellation.defaultTabs.concat(_.map(Constellation._tabs, function (tab) { var id = tab.id || tab.name; var thisTab = _.clone(tab); return _.extend(thisTab, {id: 'constellation_plugin_' + id}) }) || []);
    
    var ConstellationConfig = ConstellationDict.get("Constellation");
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
         id: 'constellation_no_collections',
         mainContentTemplate: "Constellation_collections_notFound" 
      });
    }
    
    // Config goes at the bottom
    Constellation.tabs.push({name: 'Config ...', id: 'constellation_plugin_config', headerContentTemplate: 'Constellation_config_header', menuContentTemplate: 'Constellation_config_menu', mainContentTemplate: 'Constellation_config_view', active: true});

    var constellationClasses = '';

    _.each(Constellation.tabs, function (tab) {
      var key = tab.id.replace(/_/g,"-"); // All tabs already have namespaced id values beginning with constellation_ and a prefix
      var storedValue = localStorage[key]; // localStorage just does string values, not booleans
      var state = (typeof storedValue !== 'undefined') ? ((storedValue === "false") ? false : true) : ((typeof tab.active !== 'undefined') ? tab.active : true);
      TabStates.set(tab.id, state);
      if (tab.addBaseClass && _.isString(tab.addBaseClass)) {
        constellationClasses+= tab.addBaseClass + ' '; 
      }
    });

    ConstellationDict.set('Constellation_tabs', Constellation.tabs);
    ConstellationDict.set('Constellation_baseClasses', constellationClasses);

  
  });
  
  
  // ***********************
  // Auto detect collections
  // ***********************
  
  // If the user hasn't done a ConstellationDict.set('Constellation',{ ... });
  // set some default values

  var shownCollections = ConstellationDict.get("Constellation") && ConstellationDict.get("Constellation").collections || [];

  // Build a default config object
  // Build a default config object

  var collections = _.reduce(Mongo.Collection.getAll(), function (memo, collection) {

    // Note this returns the actual mongo collection name, not Meteor's Mongo.Collection name
    if (collection.name) {

      memo.push(collection.name);

    }
      
    return memo;

  }, []);

  var defaults = {
    'collections': _.difference(_.union(collections, shownCollections), Constellation._hiddenCollections),
  };

  ConstellationDict.set("Constellation", defaults);
  Tracker.flush();

  
  // *****************************
  // Set up EditableJSON collbacks
  // *****************************
  
  // Note: there is also an `EditableJSON.afterUpdate` callback in /client/row_actions/undoRedo.js
  
  EditableJSON.onUnpublishedFieldAdded(function (collection, field, value) {
    alert("Are you sure you the new field '" + field + "' is published?" + ((!Package["constellation:console-autopublish"]) ? "\n\nmeteor add constellation:console-autopublish\n\nwill allow you to switch autopublish on and off from the Constellation UI for easy checking." : "\n\nSwitch on autopublish to check."));
  });
  
});