if (Constellation === undefined) {

  // Reserve this variable name across the package
  // In case we'd like to export it to give package users a simple api
  // e.g. when all collections have been matched by default, but the developer wants to suppress some
  // Constellation.hideCollection('posts');
  // Downside is that it pollutes the global namespace with `Constellation`, but most apps can probably live with that

  Constellation = {};

}

// Go through a variety of means of trying to return the correct collection

Constellation.Collection = function (collectionName) {
  
  if (!collectionName) {
    return null;  
  }

  return Mongo.Collection.get(collectionName)
    // This should automatically match all collections by default
    // including namespaced collections

  || ((Meteor.isServer) ? global[collectionName] : Meteor._get.apply(null,[window].concat((collectionName || '').split('.'))))
  // For user defined collection names
  // in the form of Meteor's Mongo.Collection names as strings

  || ((Meteor.isServer) ? global[firstToUpper(collectionName)] : Meteor._get.apply(null,[window].concat(firstToUpper((collectionName || '')).split('.'))))
  // For user defined collections where the user has typical upper-case collection names
  // but they've put actual mongodb collection names into the Constellation config instead of Meteor's Mongo.Collection names as strings

  || null;
  // If the user has gone for unconventional casing of collection names,
  // they'll have to get them right (i.e. Meteor's Mongo.Collection names as string) in the Constellation config manually


  // Changes the first character of a string to upper case

  function firstToUpper(text) {

    return text.charAt(0).toUpperCase() + text.substr(1);

  }
  
};

// Patches editable-json's collection detection with Constellation's more robust method
Package["babrahams:editable-json"].EditableJSON.collection = Constellation.Collection;