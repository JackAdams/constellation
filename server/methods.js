Meteor.methods({

  Constellation_update: function (collectionName, documentData, originalDocumentData) {

    check(collectionName, String);
    check(documentData, Object);
    check(originalDocumentData, Object);

    Constellation.updateDocument(collectionName, documentData, originalDocumentData);

  },
  
  Constellation_remove: function (collectionName, documentID) {

    check(collectionName, String);
    check(documentID, String);

    return Constellation.removeDocument(collectionName, documentID);

  },
  
  Constellation_duplicate: function (collectionName, documentID) {

    check(collectionName, String);
    check(documentID, String);

    return Constellation.makeDuplicate(collectionName, documentID);

  },
  
  Constellation_insert: function(collectionName, documentData) {

    check(collectionName, String);
    check(documentData, Object);

    return Constellation.insertDocument(collectionName, documentData);

  },
  
  Constellation_impersonate: function(userId) {
    check(userId, String);

    if (!Meteor.users.findOne(userId))
      throw new Meteor.Error(404, 'User not found');

    this.setUserId(userId);
  }
  
});
