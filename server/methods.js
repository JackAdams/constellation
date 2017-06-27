Meteor.methods({
  
  Constellation_impersonate: function (userId) {

    check(userId, String);

    if (!(Meteor.users && Meteor.users.findOne(userId))) {
      throw new Meteor.Error(404, 'User not found');
    }

    this.setUserId(userId);

  },
  
  Constellation_clear_collection: function (collectionName) {

    check(collectionName, String);

    return Constellation.clearCollection(collectionName);

  },
  
  Constellation_findCollectionForDocumentId: function (documentId) {

    var found = null;

    var collections = Mongo.Collection.getAll();

    _.each(collections, function(collection) {
      if (found) {
        return false;
      }
      var doc = collection.instance.findOne({_id: documentId});
      if (doc) {
        found = {
		  collectionName: collection.name,
		  document: doc
		}
      }
    });

    return found;

  }
  
});
    