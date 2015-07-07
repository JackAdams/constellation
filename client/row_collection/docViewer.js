Template.Constellation_docViewer.helpers({
  activeDocument: function () {
    var collectionName = String(this);
    var currentCollection = Constellation.Collection(collectionName);
    var documents = currentCollection.find(Constellation.searchSelector(collectionName), {transform: null}).fetch();
    var sessionKey = "Constellation_" + String(this);
    var docNumber = Session.get(sessionKey);
    var docCurrent = documents[docNumber];
    return docCurrent;
  },
  documentJSON: function () {
    var docCurrent = this;
    var json_output = JSON.stringify(docCurrent, null, 2), colorize;

    if (!(json_output === undefined)) {
      colorize = Constellation.colorize(json_output);
    } else {
      colorize = json_output;
    }

    return colorize;

  },
  editContent: function () {

    var editMode = Session.get("Constellation_editMode");

    if (editMode) {
      return "true";
    }

  },
  editStyle: function () {

    var editMode = Session.get("Constellation_editMode");

    if (editMode) {
      return "Constellation_editable";
    }

  },
  noInlineEditing: function () {
    return Session.get('Constellation_noInlineEditing');  
  }
});