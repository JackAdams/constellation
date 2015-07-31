// Undo Redo for Constellation

Template.Constellation_undoRedo.helpers({
  stack: function (type) {
    var key = UndoRedo.makeKey(String(this), (type === 'redo') ? 'undone' : 'done');
    var stack = ConstellationDict.getJSON(key);
    var latest = _.isArray(stack) && stack.length && stack[stack.length - 1]; // console.log("latest " + key + ":",latest);
    return (latest) ? {latest: latest, count: stack.length} : null; 
  }
});

Template.Constellation_undoRedo.events({
  'click .redo-button, click .undo-button' : function (evt, tmpl) {
    evt.stopPropagation();
    var type = (tmpl.$(evt.currentTarget).hasClass('redo-button')) ? 'redo' : 'undo';
    if (type === 'redo') {
      var redo = true;
      UndoRedo.undo(String(tmpl.data), redo);
    }
    else {
      UndoRedo.undo(String(tmpl.data));
    }
  }
});

if (!!EditableJSON) {
  EditableJSON.afterUpdate(function(collection, action, documentBefore, result) {
    /*console.log("doc before:",documentBefore);
    console.log("collection:",collection);
    console.log("action:",action);
    console.log("result:", result);
    console.log("doc after:", Constellation.Collection(collection).findOne({_id:this._id}));*/
    if (Constellation.Collection(collection)) {
      UndoRedo.add(collection, {
        action: 'update',
        document: documentBefore,
        updatedDocument: this
      });
    }
  });
}

UndoRedo = {};

UndoRedo.makeKey = function (collection, stack) {
  return 'Constellation_undoRedo.' + stack; // 'Constellation_undoRedo.' + collection + '.' + stack;
}

// Add an action to the "done" stack for a given collection

// data is an object of the form:
//   { action: "update", document: <DOCUMENT BEFORE UPDATE> }
//   { action: "insert", document: <DOCUMENT INSERTED> }
//   { action: "remove", document: <DOCUMENT BEFORE REMOVE> }

UndoRedo.add = function (collection, data) {
  data.timestamp = Date.now();
  data.collection = collection;
  data.id = Random.id();
  var doneStackKey = UndoRedo.makeKey(collection, 'done');
  var undoneStackKey = UndoRedo.makeKey(collection, 'undone');
  var doneStack = _.clone(ConstellationDict.getJSON(doneStackKey));
  if (!_.isArray(doneStack)) {
    doneStack = [];
  }
  doneStack.push(data);
  ConstellationDict.setJSON(doneStackKey, doneStack);
  // Clear the undone stack on every new action
  // ConstellationDict.setJSON(undoneStackKey, []);
}

UndoRedo.undo = function (action, redo) {
  // var Collection = Constellation.Collection(collection);
  var collection = action.collection;
  var doneStackKey = UndoRedo.makeKey(collection, 'done');
  var undoneStackKey = UndoRedo.makeKey(collection, 'undone');
  var doneStack = ConstellationDict.getJSON(doneStackKey) || [];
  var undoneStack = ConstellationDict.getJSON(undoneStackKey) || [];
  // console.log("collection:",collection);console.log("doneStackKey:",doneStackKey);console.log("undoneStackKey:",undoneStackKey);console.log("doneStack:",doneStack);console.log("undoneStack:",undoneStack);
  var setStacks = function () {
    ConstellationDict.setJSON(doneStackKey, doneStack);
    ConstellationDict.setJSON(undoneStackKey, undoneStack);
  }
  // Get the latest thing on the done stack
  var currentStack = (redo) ? undoneStack : doneStack;
  var latestAction = action; // _.isArray(currentStack) && currentStack.length && currentStack.pop();
  /*if (!latestAction) {
    // Fix stack up and try again if there is another action available
    setStacks();
    if (currentStack.length) {
      UndoRedo.undo(collection, redo);
    }
    return;
  }*/
  var pullFromStack = function (stack, act) {
    var index = -1;
    var found = false;
    _.find(stack, function (a,i) {
      index = i;
      if (a.id === latestAction.id) {
        found = true;  
      }
      return a.id === latestAction.id;
    });
    /*console.log("latestAction:",latestAction);
    console.log("index:",index);
    console.log("Before:", _.clone(stack));*/
    if (found) {
      stack.splice(index, 1);
    }
    //console.log("After:",_.clone(stack));
    return found;
  };
  if (!pullFromStack(currentStack, action)) {
    // This should never happen
    return;  
  }
  var targetStack = (redo) ? doneStack : undoneStack;
  if (!_.isArray(targetStack)) {
    targetStack = [];  
  }
  targetStack.push(latestAction);
  if (redo) {
    doneStack = targetStack;
    undoneStack = currentStack;
  }
  else {
    doneStack = currentStack;
    undoneStack = targetStack;
  }
  var doc = latestAction.document;
  // Now really undo the latest action
  switch(latestAction.action) {
    case 'insert' :
      var call = (redo) ? 'Constellation_insert' : 'Constellation_remove';
      var param = (redo) ? doc : doc._id;
      if (Constellation.collectionIsLocal(collection)) {
        if (call === 'Constellation_remove') {
          var res = Constellation.removeDocument(collection, param);
        }
        else {
          var res = Constellation.insertDocument(collection, param);
        }
        UndoRedo.setDocumentNumber(collection, res || null);
        setStacks();
        break;
      }
      Meteor.call(call, collection, param, function (err, res) {
        UndoRedo.setDocumentNumber(collection, res || null);
        setStacks();
      });
      break;
    case 'update' :
      var currentDoc = Constellation.Collection(collection).findOne({_id: doc._id}, {transform: null}); // Collection
      /*console.log("redo:",redo);
      console.log("collection:",collection);
      console.log("latestAction:",latestAction);
      console.log("doc:",doc);
      console.log("currentDoc:",currentDoc);*/
      var cancel = false;
      if (!currentDoc) {
        // This document no longer exists, we need to remove the action from the stack
        cancel = true;
        alert('This document is not available for updates anymore');
        return;
      }
      else {
        // Document still exists - proceed as normal
        var docVersion = (redo) ? latestAction.updatedDocument : doc;
        var comparisonVersion = (redo) ? doc : latestAction.updatedDocument;
        var diffedVersionData = Constellation.diffUpdateData(currentDoc, docVersion, comparisonVersion);
        if (diffedVersionData.cancel) {
          alert('This document has undergone subsequent changes that conflict with this update.');
          // cancel = true;
          return;
        }
        else {
          // We're still good to make the update - this is the data we're going to return
          var diffedVersion = diffedVersionData.diffedDocument; 
        }
      }
      if (Constellation.collectionIsLocal(collection)) {
        Constellation.updateDocument(collection, diffedVersion, currentDoc);
        UndoRedo.setDocumentNumber(collection, doc._id);
        setStacks(); 
        break;
      }
      Meteor.call('Constellation_update', collection, diffedVersion, currentDoc, function (err, res) {
        UndoRedo.setDocumentNumber(collection, doc._id);
        setStacks(); 
      });
      break;
    case 'remove' :
      var call = (redo) ? 'Constellation_remove' : 'Constellation_insert';
      var param = (redo) ? doc._id : doc;
      if (Constellation.collectionIsLocal(collection)) {
        if (call === 'Constellation_remove') {
          var res = Constellation.removeDocument(collection, param);
        }
        else {
          var res = Constellation.insertDocument(collection, param);
        }
        UndoRedo.setDocumentNumber(collection, res || null);
        setStacks();
        break;
      }
      Meteor.call(call, collection, param, function (err, res) { // res is the _id of the inserted document
        UndoRedo.setDocumentNumber(collection, res || null);
        setStacks(); 
      });
      break;
  }
}

UndoRedo.redo = function (collection) {
  var redo = true;
  UndoRedo.undo(collection, redo);
}

// Sets the appropriate session variable to the correct document number

UndoRedo.setDocumentNumber = function (collection, _id) {
  var sessionKey = Constellation.sessKey(collection);
  if (_id) {
    var Collection = Constellation.Collection(collection);
    var documents = Collection.find(Constellation.searchSelector(collection)).fetch();
    var docNumber = 0;
    _.find(documents, function (doc, index) {
      if (doc._id === _id) {
        docNumber = index;    
      }
    });
  }
  else {
    // Just decrement the docNumber
    var docNumber = ConstellationDict.get(sessionKey);
    if (docNumber) {
      docNumber--;
    }
    else {
      docNumber = 0;    
    }
  }
  ConstellationDict.set(sessionKey, docNumber);
  if (!ConstellationDict.equals("Constellation_currentTab", "constellation_actions_record")) {
    ConstellationDict.set("Constellation_currentTab", collection);
  }
}

// Diffing function
// This function takes three data points into account:

// 1) the dbDoc as it currently published (the canonical real-time version) -- note: unpublished fields will be missing
// 2) the oldData that was on the client before the update (latest historical version)
// 3) the newData that was on the client after the update (previous historical version)

// This function overwrites fields in the canonical version on this basis:
// 1) The field being overwritten must be have different values in the oldData and newData
// 2) The field's value must be the same in oldData and dbDoc -- otherwise return {cancel: true}

Constellation.diffUpdateData = function (dbDoc, newData, oldData) {

  var finalData = {};
  var cancel = false;

  var dbDocFields = _.keys(dbDoc);
  var newDataFields = _.keys(newData);
    // oldDataFields = _.keys(oldData);
    
    // console.log("dbDocFields",dbDocFields); console.log("newDataFields",newDataFields); // console.log("oldDataFields",oldDataFields);
    // console.log("dbDoc",dbDoc); console.log("newData",newData); console.log("oldData",oldData);

  var oldAndNewFields = _.union(dbDocFields, newDataFields);

  _.each(oldAndNewFields, function(field) { // console.log("Field: ", field);
    // console.log("Old data:",oldData[field]);console.log("New data:",newData[field]);
    if (_.isEqual(oldData[field], newData[field])) { // console.log("Equal");
      
      // Just use the canonical version of this field
      if (!_.isUndefined(dbDoc[field])) { // console.log("Not undefined");
         
        finalData[field] = dbDoc[field];
           
      }
      else {
        
        // This field comes from a stale doc version and is not relevant
        return;
        
      }
          
    }
    else {
      // console.log("Not equal");
      // Okay, game on. This is a field that needs to get the newDoc value
    
      if (_.isObject(newData[field]) && !_.isArray(newData[field]) && !_.isDate(newData[field])) {
        // console.log("Is object:", newData[field]);
        // Recurse into subdocuments
        var diffedSubdocument = Constellation.diffUpdateData(dbDoc[field] || {}, newData[field], oldData[field] || {});
		// console.log("Diffed subdocument:", diffedSubdocument);
		if (!diffedSubdocument.cancel) {
          finalData[field] = diffedSubdocument.diffedDocument;
		}
		else {
		  // Allow subdocuments to cancel
		  cancel = true;	
		}
        
      }
      else {
        // console.log("Not object:", newData[field]);
        // Check that the oldData and dbDoc fields have the same value
        // If they don't, something has mutated the doc since this transaction
      
        if (_.isEqual(oldData[field], dbDoc[field])) {
          // console.log("No conflict:", oldData[field], dbDoc[field]);
          finalData[field] = newData[field];
          
        }
        else {
          // console.log("Cancelled");
          cancel = true;
            
        }
        
      }
      
    }

  });
  // console.log("Final data:",finalData);
  return {diffedDocument: finalData, cancel: cancel};

};