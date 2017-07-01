Template.Constellation.helpers({
  rows: function () {
    return ConstellationDict.get('Constellation_tabs');
  },
  active: function () {
    if (ConstellationDict.get("Constellation_fullscreen")) {
      return "Constellation_fullscreen Constellation_expand";
    }
    var ConstellationCollection = ConstellationDict.get("Constellation_currentTab");
    if (ConstellationCollection) {
      return "Constellation_expand";
    }
    return '';
  },
  constellationActive: function () {
    return ConstellationDict.get('Constellation_active');
  },
  visible: function () {
    return TabStates.get(this.id);  
  },
  constellationClass: function () {
    return ConstellationDict.get('Constellation_baseClasses');
  }
});

Template.Constellation.events({
  'click .Constellation_row' : function (evt, tmpl) {
    if (!this.noOpen) {
      var targetCollection = this.id;
      var sessionKey = Constellation.sessKey(targetCollection);
  
      if (ConstellationDict.equals("Constellation_currentTab", targetCollection)) {
  
        // either do nothing or collapse the pane
        // comment out the line below for not collapsing the pane
        ConstellationDict.set("Constellation_currentTab", null);
  
      } else {
  
        ConstellationDict.set("Constellation_editMode", false);
  
        // If the collection doesn't have an index key set,
        // start it from the first document
        if (!ConstellationDict.get(sessionKey)) {
          ConstellationDict.set(sessionKey, 0);
        }
  
        ConstellationDict.set("Constellation_currentTab", targetCollection);
  
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

    if (ConstellationDict.equals("Constellation_currentTab", this.id)) {
      return "Constellation_row_expand";
    }

  }
});

Template.Constellation_headerContent.helpers({
  template: function () {
    return this.headerContentTemplate || null;
  }
});

Template.Constellation_rightHeaderContent.helpers({
  template: function () {
    return this.rightHeaderContentTemplate || null;
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

Template.Constellation_subMenuContent.helpers({
  template: function () {
    return this.subMenuContentTemplate || null;
  }
});