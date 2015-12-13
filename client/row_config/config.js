Blaze.registerHelper('Constellation_guide', function () {
  return ConstellationDict.get("Constellation_guide");
});

var guideTab = function () {
  var tab = _.find(ConstellationDict.get('Constellation_tabs'), function (t) {
	return ConstellationDict.equals("Constellation_guide", t.id);
  });
  return tab;	
}

Template.Constellation_config_header.events({
  'click .Constellation_Close' : function (e) {
    e.stopPropagation();
    API.toggleConsole();  
  },
  'click .Constellation_FullScreen' : function (e) {
    e.stopPropagation();
    Constellation.toggleFullScreen();
  }
});

Template.Constellation_config_view.helpers({
  installedTabs: function () {
    return _.initial(ConstellationDict.get('Constellation_tabs'));
  },
  tabActive: function () {
    return this.id === 'constellation_plugin_config' || TabStates.get(this.id);
  },
  hotkey : function () {
    return String.fromCharCode(Constellation._keyCode);  
  },
  guide : function () {
	return guideTab()['guideContentTemplate'];  
  }
});

Template.Constellation_config_view.events({
  'change input.Constellation_config_tab_toggle' : function (evt, tmpl) {
    var key = this.id.replace(/_/g,"-");
    var value = evt.target.checked;
    TabStates.set(this.id, value);
    Meteor.defer(function() {
      localStorage[key] = value;
    });
  },
  'input .Constellation_hotkey_chooser' : function (evt, tmpl) {
    var letter = tmpl.$(evt.target).val().toUpperCase();
    if (letter.length === 1) {
      var keyCode = letter.charCodeAt(0);
      API.setKeyCode(keyCode);
      localStorage.constellation_hotkey = keyCode;
    }
  },
  'click .Constellation_show_guide' : function (evt, tmpl) {
	ConstellationDict.set('Constellation_guide', this.id);  
  }
});

Template.Constellation_config_menu.helpers({
  'pluginName' : function () {
	var tab = guideTab();
    return !tab['collection'] && tab['name'] || 'Collections';
  }
});

Template.Constellation_config_menu.events({

  'click .Constellation_config_all, click .Constellation_config_none' : function (evt, tmpl) {
    // Change the state of all collections
    var cdict = ConstellationDict.get('Constellation_tabs');
    var show = tmpl.$(evt.target).hasClass('Constellation_config_all');
    var collections = _.each(cdict, function (tab) {
      if (tab.collection) {
        var key = tab.id.replace(/_/g,"-");
        TabStates.set(tab.id, show);
        Meteor.defer(function() {
          localStorage[key] = show;
        });
      }
    });
  },
  'click .Constellation_close_guide' : function (evt, tmpl) {
    ConstellationDict.set('Constellation_guide', null);
  }

});