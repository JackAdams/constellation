var insertDoc = function (ConstellationCollection, documentData) {
  if (!!Package['aldeed:simple-schema'] && !!Package['aldeed:collection2'] && _.isFunction(ConstellationCollection.simpleSchema) && ConstellationCollection._c2) {
    // This is to nullify the effects of SimpleSchema/Collection2
    newId = ConstellationCollection.insert(documentData, {
      filter: false,
      autoConvert: false,
      removeEmptyStrings: false,
      validate: false
    });
  }
  else {
    newId = ConstellationCollection.insert(documentData);
  }
  return newId;
}

Meteor.methods({

  Constellation_update: function (collectionName, documentData, originalDocumentData) {

    check(collectionName, String);
    check(documentData, Object);
    check(originalDocumentData, Object);

    var ConstellationCollection = Constellation.Collection(collectionName),
      documentID = documentData._id;

    var currentDbDoc = ConstellationCollection.findOne({
      _id: documentID
    }, {transform: null});

    if (!currentDbDoc) {
      // A document with this _id value is not in the db
      // Do an insert instead
      Meteor.call("Constellation_insert", collectionName, documentData);
      return;
    }

    delete documentData._id;
    delete originalDocumentData._id;
    delete currentDbDoc._id;

    var updatedDocumentData = Constellation.diffDocumentData(currentDbDoc, documentData, originalDocumentData);
    
    if (!!Package['aldeed:simple-schema'] && !!Package['aldeed:collection2'] && _.isFunction(ConstellationCollection.simpleSchema) && ConstellationCollection._c2) {
      
      // This is to nullify the effects of SimpleSchema/Collection2
      // Using `upsert` means that a user can change the _id value in the JSON
      // and then press the 'Update' button to create a duplicate (published keys/values only) with a different _id
      
      ConstellationCollection.update({
        _id: documentID
      }, {$set: updatedDocumentData}, {
        filter: false,
        autoConvert: false,
        removeEmptyStrings: false,
        validate: false
      });
      
      return;
    }

    // Run the magic
    ConstellationCollection.update({
        _id: documentID
      },
      updatedDocumentData
    );

  },
  
  Constellation_remove: function (collectionName, documentID) {

    check(collectionName, String);
    check(documentID, String);

    var ConstellationCollection = Constellation.Collection(collectionName);
    
    var docToBeRemoved = ConstellationCollection.findOne(documentID, {transform: null});

    ConstellationCollection.remove(documentID);
    
    return docToBeRemoved;

  },
  
  Constellation_duplicate: function (collectionName, documentID) {

    check(collectionName, String);
    check(documentID, String);

    var ConstellationCollection = Constellation.Collection(collectionName);
    var OriginalDoc = ConstellationCollection.findOne(documentID, {transform: null});

    if (OriginalDoc) {

      delete OriginalDoc._id;

      var NewDocumentId = insertDoc(ConstellationCollection, OriginalDoc);

      return NewDocumentId;
      
    }

  },
  
  Constellation_insert: function(collectionName, documentData) {

    check(collectionName, String);
    check(documentData, Object);

    var ConstellationCollection = Constellation.Collection(collectionName),
        newId = null;
        
    if (documentData._id && ConstellationCollection.findOne({_id: documentData._id})) {
      console.log('Duplicate _id found');
      return null;    
    }
        
    var newId = insertDoc(ConstellationCollection, documentData);
    
    return newId;

  }
  
});
