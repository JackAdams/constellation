Template.Constellation_accountViewer.helpers({
  
  editContent: function () {

    var editMode = ConstellationDict.get("Constellation_editMode");

    if (editMode) {
      return "true";
    }

  },
  editStyle: function () {

    var editMode = ConstellationDict.get("Constellation_editMode");

    if (editMode) {
      return "Constellation_editable";
    }

  },
  accountData: function () {
    var docCurrent = !!Package["accounts-base"] && Meteor.user() || {};
    var json_output = JSON.stringify(docCurrent, null, 2), colorize;

    if (!(json_output === undefined)) {
      colorize = Constellation.colorize(json_output);
    }
    else {
      colorize = json_output;
    }

    return colorize;  
  }
  
});