// Strip out functions in case documents have had methods added to them

Constellation.validateDocument = function (doc) {
  var validatedDoc = {};
  _.each(doc, function (val, key) {
    if (_.isFunction(val)) {
      return;
    }
    validatedDoc[key] = val;
  });
  return validatedDoc;
}

Constellation.inlineEditingTimer = null;

Constellation.resetInlineEditingTimer = function() {
  if (Constellation.inlineEditingTimer) {
	Meteor.clearTimeout(Constellation.inlineEditingTimer);
  }
  Session.set('Constellation_noInlineEditing', true);
  Constellation.inlineEditingTimer = Meteor.setTimeout(function () {
    Session.set('Constellation_noInlineEditing', false);  
  },300);
}

Template.Constellation_docControls.events({
  'click .Constellation_m_new': function() {

    var CollectionName = Session.get("Constellation_currentRow"),
      DocumentPosition = Session.get("Constellation_" + String(this)),
      CurrentCollection = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName)).fetch(),
      CollectionCount = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName)).count();

    var CurrentDocument = CurrentCollection[DocumentPosition],
      DocumentID = CurrentDocument._id,
      sessionKey = "Constellation_" + String(this);

    var ValidatedCurrentDocument = Constellation.validateDocument(CurrentDocument);

    Meteor.call("Constellation_duplicate", CollectionName, ValidatedCurrentDocument._id, function(error, result) {
      if (!error) {

        var newDoc = Constellation.Collection(CollectionName).findOne(result);

        if (newDoc) {

          // Get position of new document
          var list = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName)).fetch();
          var docID = result;

          docIndex = _.reduce(list, function(memo, obj, index) {
            if (obj._id == docID) {
              memo = index;
            }
			return memo;
          },0);

          Session.set(sessionKey, docIndex);  
		
		  UndoRedo.add(CollectionName, {
			action: 'insert',
			document: newDoc
		  });
		  
        }

      } else {
        Constellation.error("duplicate");
      }
    });



  },
  'click .Constellation_m_edit': function() {
    Session.set("Constellation_editMode", true);
  },
  'click .Constellation_m_delete': function() {

    var CollectionName = Session.get("Constellation_currentRow"),
      sessionKey = "Constellation_" + String(this);
      DocumentPosition = Session.get(sessionKey),
      CurrentCollection = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName)).fetch(),
      CollectionCount = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName)).count(),
	  self = this;

    var CurrentDocument = CurrentCollection[DocumentPosition],
      DocumentID = CurrentDocument._id;


    Meteor.call('Constellation_remove', CollectionName, DocumentID, function(error, result) {

      if (!error) {
        // Log the action
        console.log("Removed " + DocumentID + " from " + CollectionName + ". Back-up below:");
        console.log(result);

        // Adjust the position
        if (DocumentPosition >= CollectionCount - 1) {
          newPosition = DocumentPosition - 1;
          Session.set(sessionKey, newPosition);
        }

        if (Session.get(sessionKey) === -1) {
          Session.set(sessionKey, 0);
        }
		
        UndoRedo.add(String(self), {
		  action: 'remove',
		  document: result
		});

      } else {
        Constellation.error("remove");
      }

    });



  },
  'click .Constellation_m_right': function(evt, tmpl) {
    // Verify that the button is not disabled
    if (!tmpl.$('.Constellation_m_right').hasClass('Constellation_m_disabled')) {
      
      // Disable inline editing for 0.3s for quick flick to next doc
      Constellation.resetInlineEditingTimer();
	  
      // Grab the key
      sessionKey = "Constellation_" + String(this);

      // Go forward one doc
      var ConstellationDocNumber = Session.get(sessionKey) + 1;
      Session.set(sessionKey, ConstellationDocNumber);
      // console.log("right" + this);
    }
  },
  'click .Constellation_m_left': function(evt, tmpl) {

    // Verify that the button is not disabled
    if (!tmpl.$('.Constellation_m_left').hasClass('Constellation_m_disabled')) {

      // Disable inline editing for 0.3s for quick flick to next doc
      Constellation.resetInlineEditingTimer();
      
      // Grab the key
      sessionKey = "Constellation_" + String(this);

      // Go back one doc
      var ConstellationDocNumber = Session.get(sessionKey) - 1;
      Session.set(sessionKey, ConstellationDocNumber);
      // console.log("left" + this);
    }

  },
  'click .Constellation_edit_save': function(evt,tmpl) {

    // Get current document to get its current state
    // We need to send this to the server so we know which fields are up for change
    // when applying the diffing algorithm

    var collectionName = (Session.equals("Constellation_currentRow", "constellation_user_account")) ? "users" : String(this);
	
    var newData = tmpl.$(evt.target).closest('.Constellation_row').find('.Constellation_documentViewer pre').text(); // Constellation.getDocumentUpdate(collectionName);

    if (Session.equals("Constellation_currentRow", "constellation_user_account")) {
      // var newData = Constellation.getDocumentUpdate("constellation_user_account");
      var newObject = Constellation.parse(newData);
      var oldObject = Meteor.user();
      // console.log(targetCollection);
      // console.log(newData);
      // console.log(newObject);
    } else {
      var sessionKey = "Constellation_" + collectionName;
      DocumentPosition = Session.get(sessionKey),
        CurrentCollection = Constellation.Collection(collectionName).find(Constellation.searchSelector(collectionName)).fetch();
      var newObject = Constellation.parse(newData);
      var oldObject = CurrentCollection[DocumentPosition];
    }

    if (newObject) {
      Meteor.call("Constellation_update", collectionName, newObject, Constellation.validateDocument(oldObject), function(error, result) {
        if (!error) {
          Session.set('Constellation_editMode', null);	
		  UndoRedo.add(collectionName, {
			action: 'update',
			document: oldObject,
			updatedDocument: newObject
		  });
        } else {
          Constellation.error('update')
        }
      });
    }
  },
  'click .Constellation_edit_cancel': function() {
    Session.set('Constellation_editMode', null);
  },
  'click .Constellation_m_signout': function() {
    Meteor.logout();
  }
});


Template.Constellation_docControls.helpers({
  disable_left: function() {
    var sessionKey = "Constellation_" + String(this);
    var CurrentDocument = Session.get(sessionKey);

    if (CurrentDocument <= 0) {
      return "Constellation_m_disabled";
    }

  },
  disable_right: function() {
    var sessionKey = "Constellation_" + String(this);
    var CurrentDocument = Session.get(sessionKey);
    var collectionName = String(this);
    var collectionVar = Constellation.Collection(collectionName);
    if (!(collectionVar && collectionVar._name  && collectionVar._collection)) { // Hacky way to make sure we haven't pulled an unfortunately named dom element
	  return;	
	}
    var collectionCount = collectionVar.find(Constellation.searchSelector(collectionName)).count() - 1;

    if (CurrentDocument === collectionCount) {
      return "Constellation_m_disabled";
    }

  },
  editing: function() {
    var editing = Session.get('Constellation_editMode');
    return editing;
  },
  editing_class: function() {
    var edit = Session.get('Constellation_editMode');
    if (edit) {
      return "Constellation_m_wrapper_expand"
    }
  },
  Constellation_menuContent_editing: function() {
    var editMode = Session.get("Constellation_editMode");

    if (editMode) {
      return "Constellation_menuContent_editing";
    }

  },
  account: function() {
    return Session.equals("Constellation_currentRow","constellation_user_account");
  },
  notEmpty: function () {
	var collectionName = String(this);
    var documentCount = Constellation.Collection(collectionName) && Constellation.Collection(collectionName).find(Constellation.searchSelector(collectionName)).count() || 0;
    if (documentCount >= 1) {
      return true;
    }
  }
});

Template.Constellation_search_button.events({ 
  'click .Constellation_m_search_left, click .Constellation_m_search_right' : function () {
	Session.set('Constellation_searching', !Session.get('Constellation_searching'));  
  }
});