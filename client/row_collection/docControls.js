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
  ConstellationDict.set('Constellation_noInlineEditing', true);
  Constellation.inlineEditingTimer = Meteor.setTimeout(function () {
    ConstellationDict.set('Constellation_noInlineEditing', false);  
  },300);
}

Template.Constellation_docControls.events({
  'click .Constellation_m_new': function() {

    var CollectionName = ConstellationDict.get("Constellation_currentTab");
    var sessionKey = Constellation.sessKey(String(this));
    var DocumentPosition = ConstellationDict.get(sessionKey);
    var CurrentCollection = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName), {transform: null}).fetch();
    var CollectionCount = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName)).count();

    var CurrentDocument = CurrentCollection[DocumentPosition],
      DocumentID = CurrentDocument._id,
      sessionKey = Constellation.sessKey(String(this));

    var ValidatedCurrentDocument = Constellation.validateDocument(CurrentDocument);

    Meteor.call("Constellation_duplicate", CollectionName, ValidatedCurrentDocument._id, function(error, result) {
      if (!error) {

        var newDoc = Constellation.Collection(CollectionName).findOne(result, {transform: null});

        if (newDoc) {

          // Get position of new document
          var list = Constellation.Collection(CollectionName).find(Constellation.searchSelector(CollectionName), {transform: null}).fetch();
          var docID = result;

          docIndex = _.reduce(list, function(memo, obj, index) {
            if (obj._id == docID) {
              memo = index;
            }
            return memo;
          },0);

          ConstellationDict.set(sessionKey, docIndex);  
        
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
    ConstellationDict.set("Constellation_editMode", true);
  },
  'click .Constellation_m_delete': function() {

    var CollectionName = ConstellationDict.get("Constellation_currentTab"),
      sessionKey = Constellation.sessKey(String(this));
      DocumentPosition = ConstellationDict.get(sessionKey),
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
          ConstellationDict.set(sessionKey, newPosition);
        }

        if (ConstellationDict.get(sessionKey) === -1) {
          ConstellationDict.set(sessionKey, 0);
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
      var sessionKey = Constellation.sessKey(String(this));

      var CurrentDocument = ConstellationDict.get(sessionKey);
      var collectionName = String(this);
      var collectionVar = Constellation.Collection(collectionName);
      var collectionCount = collectionVar.find().count() - 1;

      if (CurrentDocument > collectionCount) {
        ConstellationDict.set(sessionKey, 0)
        return;
      }

      if (collectionCount === CurrentDocument) {
        // Go back to document 1 
        ConstellationDict.set(sessionKey, 0);
      } else {
        // Go to next document
        var ConstellationDocNumber = ConstellationDict.get(sessionKey) + 1;
        ConstellationDict.set(sessionKey, ConstellationDocNumber);
      }
      
    }
  },
  'click .Constellation_m_left': function(evt, tmpl) {

    // Verify that the button is not disabled
    if (!tmpl.$('.Constellation_m_left').hasClass('Constellation_m_disabled')) {

      // Disable inline editing for 0.3s for quick flick to next doc
      Constellation.resetInlineEditingTimer();
      
      // Grab the key
      sessionKey = Constellation.sessKey(String(this));

      // Get the document count
      var CurrentDocument = ConstellationDict.get(sessionKey);
      var collectionName  = String(this);
      var collectionVar   = Constellation.Collection(collectionName);
      var collectionCount = collectionVar.find().count() - 1;

      if (CurrentDocument > collectionCount) {
        ConstellationDict.set(sessionKey, collectionCount)
        return;
      }

      if (ConstellationDict.get(sessionKey) === 0) {
        // Set the key to last
        ConstellationDict.set(sessionKey, collectionCount)
      } else {
        var ConstellationDocNumber = ConstellationDict.get(sessionKey) - 1;
        ConstellationDict.set(sessionKey, ConstellationDocNumber);
      }
      
    }

  },
  'click .Constellation_edit_save': function(evt,tmpl) {

    // Get current document to get its current state
    // We need to send this to the server so we know which fields are up for change
    // when applying the diffing algorithm

    var collectionName = (ConstellationDict.equals("Constellation_currentTab", "constellation_plugin_user_account")) ? "users" : String(this);
    
    var newData = tmpl.$(evt.target).closest('.Constellation_row').find('.Constellation_documentViewer pre').text();

    if (ConstellationDict.equals("Constellation_currentTab", "constellation_plugin_user_account")) {
      var newObject = Constellation.parse(newData);
      var oldObject = Meteor.user();
      // console.log(targetCollection);
      // console.log(newData);
      // console.log(newObject);
    } else {
      var sessionKey = Constellation.sessKey(collectionName);
      var DocumentPosition = ConstellationDict.get(sessionKey);
      var CurrentCollection = Constellation.Collection(collectionName).find(Constellation.searchSelector(collectionName), {transform: null}).fetch();
      var newObject = Constellation.parse(newData);
      var oldObject = CurrentCollection[DocumentPosition];
    }

    if (newObject) {
      Meteor.call("Constellation_update", collectionName, newObject, Constellation.validateDocument(oldObject), function(error, result) {
        if (!error) {
          ConstellationDict.set('Constellation_editMode', null);    
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
    ConstellationDict.set('Constellation_editMode', null);
  },
  'click .Constellation_m_signout': function() {
    Meteor.logout();
  }
});


Template.Constellation_docControls.helpers({
  disable: function() {
    var sessionKey = Constellation.sessKey(String(this));
    var CurrentDocument = ConstellationDict.get(sessionKey);
    var collectionName = String(this);
    var collectionVar = Constellation.Collection(collectionName);
    var collectionCount = collectionVar.find().count();
    
    if (CurrentDocument >= 1) {
      return;
    }

    if (collectionCount === 1) {
      return "Constellation_m_disabled";
    }

  },
  editing: function() {
    var editing = ConstellationDict.get('Constellation_editMode');
    return editing;
  },
  editing_class: function() {
    var edit = ConstellationDict.get('Constellation_editMode');
    if (edit) {
      return "Constellation_m_wrapper_expand"
    }
  },
  Constellation_menuContent_editing: function() {
    var editMode = ConstellationDict.get("Constellation_editMode");

    if (editMode) {
      return "Constellation_menuContent_editing";
    }

  },
  account: function() {
    return ConstellationDict.equals("Constellation_currentTab","constellation_plugin_user_account");
  },
  notEmpty: function () {
    var collectionName = String(this);
    var documentCount = Constellation.Collection(collectionName) && Constellation.Collection(collectionName).find(Constellation.searchSelector(collectionName)).count() || 0;
    if (documentCount >= 1) {
      return true;
    }
  }
});