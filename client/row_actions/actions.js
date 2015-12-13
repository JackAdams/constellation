ConstellationDict.setDefault('Constellation_action_log', []);

var addStatus = function (stack, status) {
  return _.map(stack, function (action) { return _.extend(action, {status: status})})    
}

Tracker.autorun(function() {
  // Splice together all the actions taken and order by timestamp
  var memo = [];
  /*var collections = Mongo.Collection.getAll();
  var actions = _.reduce(collections, function (memo,collection) {
    var collectionName = collection.name;*/
    _.each(['done','undone'], function (status) {
      var stack = ConstellationDict.getJSON(UndoRedo.makeKey(null, status)); // collectionName
      if (stack) {
        memo = memo.concat(addStatus(stack, status));
      }
    });/*
    return memo;
  },[]);*/
  var sortedActions = _.sortBy(memo, function(action) { // actions instead of memo
    return action.timestamp;
  });
  ConstellationDict.set('Constellation_action_log', sortedActions.reverse());
});

Template.Constellation_actions_header.helpers({
  stack: function() {
    var stack = (addStatus(ConstellationDict.getJSON(UndoRedo.makeKey(null, 'undone')) || [],'undone').concat(addStatus(ConstellationDict.getJSON(UndoRedo.makeKey(null, 'done')) || [],'done'))).reverse();
    return stack;  
  }
});

Template.Constellation_actions_menu.events({
  'click .Constellation_log_purge' : function () {
    _.each(['done','undone'], function (status) {
      ConstellationDict.setJSON(UndoRedo.makeKey(null, status),[]);
    });
  }
});

Template.Constellation_actions_main.helpers({
    
  actions: function () {
    return ConstellationDict.get('Constellation_action_log');
  }
    
});

Template.Constellation_global_undo_redo.helpers({
  stack: function (type) {
    return _.find(this, function (action) { return action.status === ((type === 'redo') ? 'undone' : 'done'); });
  },
  json: function () {
    return JSON.stringify(this.updatedDocument || this.document);  
  }
});

Template.Constellation_global_undo_redo.events({
  'click .undo-button, click .redo-button' : function (evt, tmpl) {
    evt.stopPropagation();
    var type = (tmpl.$(evt.currentTarget).hasClass('redo-button')) ? 'redo' : 'undo';
    if (type === 'redo') {
      var redo = true;
      UndoRedo.undo(this, redo);
    }
    else {
      UndoRedo.undo(this);
    }
  }
});

Template.Constellation_action.helpers({
  time : function () {
    var time = (new Date(this.timestamp)).toTimeString();
    return time.substr(0,8);    
  },
  fullDoc : function () {
    return Blaze._templateInstance().showFullDocument.get();
  },
  singleAction : function () {
    return [this];  
  }
});

Template.Constellation_action.events({
  'click .Constellation_toggle_document' : function(evt,tmpl) {
    evt.preventDefault();
    evt.stopPropagation();
    var state = tmpl.showFullDocument;
    state.set(!state.get());
  }
});

Template.Constellation_action.onCreated(function () {
  this.showFullDocument = new ReactiveVar(false);
});

Template.Constellation_action_document.helpers({
  json : function (when) {
    var docToDisplay = (this.action === 'insert') ? ((when === 'before') ? this.updatedDocument : this.document) : ((when === 'after') ? this.updatedDocument : this.document);
    json_output = JSON.stringify(docToDisplay, null, 2),
    colorized = Constellation.colorize(json_output);
    return colorized;
  }
});

Template.Constellation_action_document.events(Constellation.foreignKeyLinkEvents);