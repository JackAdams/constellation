Template.Constellation.helpers({
  rows: function () {
    return Session.get('Constellation_tabs');
  },
  active: function () {
	if (Session.get("Constellation_fullscreen")) {
	  return "Constellation_fullscreen Constellation_expand";
	}
    var ConstellationCollection = Session.get("Constellation_currentRow");
    if (ConstellationCollection) {
      return "Constellation_expand";
    }
	return '';
  },
  constellationActive: function () {
	return Session.get('Constellation_active');
  },
  visible: function () {
	return TabStates.get(this.id);  
  }
});

Template.Constellation.events({
  'click .Constellation_row' : function (evt, tmpl) {
	if (!this.noOpen) {
	  var targetCollection = this.id;
	  var sessionKey = "Constellation_" + targetCollection;
  
	  if (Session.equals("Constellation_currentRow", targetCollection)) {
  
		// either do nothing or collapse the pane
		// comment out the line below for not collapsing the pane
		Session.set("Constellation_currentRow", null);
  
	  } else {
  
		Session.set("Constellation_editMode", false);
  
		// If the collection doesn't have an index key set,
		// start it from the first document
		if (!Session.get(sessionKey)) {
		  Session.set(sessionKey, 0);
		}
  
		Session.set("Constellation_currentRow", targetCollection);
  
	  }
	}
	if (this.onClick && _.isFunction(Constellation._callbacks[this.onClick])) {
	  Constellation._callbacks[this.onClick].call(this);	
	}
  },
  'click .Constellation_contentView': function(evt, tmpl) {
    evt.stopPropagation();
  }
});

Template.Constellation_row.helpers({
  active: function () {

    if (Session.equals("Constellation_currentRow", this.id)) {
      return "Constellation_row_expand";
    }

  }
});

Template.Constellation_headerContent.helpers({
  template: function () {
	return this.headerContentTemplate || null;
  }
});

Template.Constellation_searchContent.helpers({
  template: function () {
	return this.searchContentTemplate || null;
  }
});

Template.Constellation_menuContent.helpers({
  template: function () {
	return this.menuContentTemplate || null;
  }
});

Template.Constellation_mainContent.helpers({
  template: function () {
	return this.mainContentTemplate || null;
  }
});