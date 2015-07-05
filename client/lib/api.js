// Exported API methods

API = {};

Constellation._tabs = [];
Constellation._callbacks = {};

// Lets external packages plug a tab into Constellation

API.addTab = function (tab) {
  Constellation._tabs.push(tab)
}

// Lets external packages hide collections

API.hideCollection = function (collectionName) {

  var ConstellationConfig = Session.get("Constellation") || {};
  
  var collections = _.without(ConstellationConfig.collections || {}, collectionName);

  ConstellationConfig.collections = collections;

  Session.set("Constellation", ConstellationConfig);
  
}

API.isActive = function () {
  return Session.get('Constellation_active');	
}

API.getCurrentTab = function () {
  return Session.get("Constellation_currentRow");	
}

API.setCurrentTab = function (id) {
  var tab = _.find(Session.get('Constellation_tabs'), function (tab) {
	return tab.id === id || tab.id === 'constellation_plugin_' + id; 
  });
  if (tab) {
	Session.set('Constellation_currentRow',tab.id);  
  }
}

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
