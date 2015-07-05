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
        if (!error) {
          sessionKey = "Constellation_" + CollectionName;
          Session.set(sessionKey, 0);
          var newDoc = Mongo.Collection.get(CollectionName).findOne(result);
          UndoRedo.add(CollectionName, {
            action: 'insert',
            document: newDoc
          });
        } else {
          Constellation.error("insert");
        }
      });
      // if successful, set the proper session
    }

  }
});
