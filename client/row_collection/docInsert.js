var afterInsert = function (error, result, CollectionName) {
  if (!error && result) {
    // if successful, set the proper session variable value
    var sessionKey = Constellation.sessKey(CollectionName);
    ConstellationDict.set(sessionKey, 0);
    var newDoc = Constellation.Collection(CollectionName).findOne(result._id, {transform: null});
    UndoRedo.add(CollectionName, {
      action: 'insert',
      document: result
    });
    if (!newDoc) {
      alert("Insert was successful, but this document doesn't seem to be published." + ((!!Package["constellation:autopublish"]) ? '\n\nSwitch on autopublish to check.' : ''));  
    }
  } else {
    Constellation.error("insert");
  }
}

Template.Constellation_docInsert.helpers({
  account: function () {
    return API.isCurrentTab('user_account','plugin');  
  }
});

Template.Constellation_docInsert.events({
    
  'click .Constellation_menuContent_insert': function (evt,tmpl) {

    var CollectionName = String(this);
    var newDataID = "Constellation_" + CollectionName + "_newEntry";
    var newData = $('#' + newDataID)[0].textContent;
    var newObject = Constellation.parse(newData);
    var searchSelector = Constellation.searchSelector(CollectionName, 'exactMatch');
    _.extend(newObject, searchSelector);

    if (newObject) {
      if (Constellation.collectionIsLocal(CollectionName)) {
        // Just do the insert on the client
        var error = null;
        var result = null;
        try {
          result = Constellation.insertDocument(CollectionName, newObject);
        }
        catch (err) {
          error = err;    
        }
        afterInsert.call(null, error, result, CollectionName);
        return;
      }
      Meteor.call('Constellation_insert', CollectionName, newObject, function (error, result) {
        afterInsert.call(null, error, result, CollectionName);
      });
    }

  }
  
});