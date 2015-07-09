// Exported API methods

API = {};

Constellation._tabs = [];
Constellation._callbacks = {};

// Lets external packages plug a tab into Constellation

API.addTab = function (tab) {
  Constellation._tabs.push(tab)
}

// Get and set tab that is currently open in the UI

API.getCurrentTab = function () {
  var tabName = ConstellationDict.get("Constellation_currentTab");
  if (!tabName) {
	return null;  
  }
  var tabData = tabName.split('_');
  if (tabData[0] === 'constellation' && tabData[1] === 'plugin') {
    return {
      id: tabName.replace(/constellation_plugin_/,''),
      type: 'plugin'
    };
  }
  else {
    return {
      id: tabName,
      type: "collection"
    };
  }
}

API.setCurrentTab = function (id, type) {
  var tabId = (type === 'collection') ? id : 'constellation_plugin_' + id;
  var tab = _.find(ConstellationDict.get('Constellation_tabs'), function (tab) {
    return tab.id === tabId; 
  });
  if (tab) {
    ConstellationDict.set('Constellation_currentTab', tab.id);  
  }
}

// Check whether a tab is available via the user's UI (have they closed it via the "Config ..." panel or not)

API.tabVisible = function (id, type) {
  var tabId = (type === 'collection') ? id : 'constellation_plugin_' + id;
  return TabStates.get(tabId);
}

// Check whether constellation is in fullscreen mode or not
API.isFullScreen = function () {
  return ConstellationDict.get('Constellation_fullscreen');    
}

// Lets external packages hide collections

API.hideCollection = function (collectionName) {

  var ConstellationConfig = ConstellationDict.get("Constellation") || {};
  
  var collections = _.without(ConstellationConfig.collections || [], collectionName);

  ConstellationConfig.collections = collections;

  ConstellationDict.set("Constellation", ConstellationConfig);
  
}

// Lets external packages show collections

API.showCollection = function (collectionName) {

  // In case a collection does not get detected, like a local one
  var ConstellationConfig = ConstellationDict.get("Constellation") || {};
  
  var collections = ConstellationConfig.collections || [];

  collections.push(collectionName);
  
  ConstellationDict.set("Constellation", ConstellationConfig);

}

// Lets external packages know whether the Constellation console is open or not

API.isActive = function () {
  return ConstellationDict.get('Constellation_active');    
}

// Register callbacks to be fired on toggling certain tabs
// Name the callback here (field name) and when adding the tab using { ..., "callback" : fieldName, ... }

API.registerCallbacks = function(obj) {
  if (_.isObject(obj)) {
    _.each(obj,function(val,key) {
      if (_.isFunction(val)) {
        Constellation._callbacks[key] = val;
      }
      else {
        throw new Meteor.Error('Callbacks need to be functions. You passed a ' + typeof(val) + '.');    
      }
    });
  }
  else {
    throw new Meteor.Error('You must pass an object to register callbacks');  
  }
}
    