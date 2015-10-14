// Mutator methods

insertDoc = function (ConstellationCollection, documentData) {
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

Constellation.insertDocument = function (collectionName, documentData) {
    
  var ConstellationCollection = Constellation.Collection(collectionName);
  var newId = null;
      
  if (documentData._id && ConstellationCollection.findOne({_id: documentData._id})) {
    console.log('Duplicate _id found');
    return null;    
  }
      
  var newId = insertDoc(ConstellationCollection, documentData);
  
  return ConstellationCollection.findOne({_id: newId});
}

Constellation.makeDuplicate = function (collectionName, documentID) {
    
  var ConstellationCollection = Constellation.Collection(collectionName);
  var OriginalDoc = ConstellationCollection.findOne(documentID, {transform: null});

  if (OriginalDoc) {

    delete OriginalDoc._id;

    var NewDocumentId = insertDoc(ConstellationCollection, OriginalDoc);

    return NewDocumentId;
    
  }    
}

Constellation.removeDocument = function (collectionName, documentID) {

  var ConstellationCollection = Constellation.Collection(collectionName);
    
  var docToBeRemoved = ConstellationCollection.findOne(documentID, {transform: null});

  ConstellationCollection.remove(documentID);
  
  return docToBeRemoved;
    
}

Constellation.updateDocument = function (collectionName, documentData, originalDocumentData) {

  var ConstellationCollection = Constellation.Collection(collectionName);
  var documentID = documentData._id;

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
  
	// I'm guessing we should only use the raw collection if oplog is enabled
	// The reason for using the raw collection is to sidestep collection2, which has a bug
	// when updating a document with a field with an empty string value like: {emptyField: ''}.
	// `emptyField` simply doesn't get added to the document, even
	// when `removeEmptyStrings` is set to false.
	// The problem with using the raw collection is that, without oplog, we're waiting for
	// a poll and diff, so updates might lag by up to 10s.
	// The below isn't ideal, as the presence of a MONGO_OPLOG_URL doesn't
	// guarantee that our observers are using the oplog.
	// This could result in some delayed responses in making updates.
	// The alternative is weird, buggy behaviour when making updates.
  
	if (Meteor.isServer && process.env.MONGO_OPLOG_URL) {
	  
	  ConstellationCollection.rawCollection().update({
		  _id: documentID
		},
		updatedDocumentData,
		function () {
		  // Apparently a callback is required
		  // Otherwise an error is thrown (something about `writeConcern` ...)
		}
	  );
	
	  return;
		
	}
    
    // This is to nullify the effects of SimpleSchema/Collection2
    
    ConstellationCollection.update({
      _id: documentID
    }, updatedDocumentData, {
      filter: false,
      autoConvert: false,
      removeEmptyStrings: false,
      validate: false
    });
    
    return;
  }
  
  ConstellationCollection.update({
      _id: documentID
    },
    updatedDocumentData
  );    

}