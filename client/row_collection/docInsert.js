Template.Constellation_docInsert.events({
    
  'click .Constellation_menuContent_insert': function (evt,tmpl) {

    var CollectionName = String(this);
    var newDataID = "Constellation_" + CollectionName + "_newEntry";
    var newData = $('#' + newDataID)[0].textContent;
    var newObject = Constellation.parse(newData);
    var searchSelector = Constellation.searchSelector(CollectionName, 'exactMatch');
    _.extend(newObject, searchSelector);

    if (newObject) {
      Meteor.call('Constellation_insert', CollectionName, newObject, function (error, result) {
        if (!error && result) {
          // if successful, set the proper session variable value
          sessionKey = Constellation.sessKey(CollectionName);
          ConstellationDict.set(sessionKey, 0);
          var newDoc = Mongo.Collection.get(CollectionName).findOne(result._id, {transform: null});
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
      });
    }

  }
  
});