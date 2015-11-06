var afterClearCollection = function (error, result, collectionName, sessionKey) {
  if (!error) {
	ConstellationDict.set(sessionKey, 0);
	console.log(result); 
  }
  else {
	Constellation.error('clearCollection');  
  }
}

Template.Constellation_collection_count.helpers({
  collectionCount: function () {

    var collectionName = String(this);
    var collectionVar = Constellation.Collection(collectionName);

    var count = collectionVar && collectionVar.find(Constellation.searchSelector(collectionName), {transform: null}).count() || 0;

    return count;

  },
  currentPosition: function () {

    var targetCollection = String(this);
    var sessionKey = Constellation.sessKey(targetCollection);

    var current = ConstellationDict.get(sessionKey);
    var count = (current || 0) + 1;

    return (_.isNaN(count)) ? '' : count;

  },
  autopublished: function () {
	var collectionName = String(this);
	if (ConstellationDict.get('Constellation_autopublish_all')) {
	  if ( !Package['constellation:autopublish'] || Constellation.collectionIsLocal(collectionName)) {
        return '';
	  }
      var notAutopublished = ConstellationDict.get('Constellation_not_autopublished') || [];
	  return (!_.contains(notAutopublished, collectionName)) ? 'Constellation_autopublished' : 'Constellation_not_autopublished';	
	}
	var autopublished = Package['constellation:autopublish'] && ConstellationDict.get('Constellation_autopublished');
	return (_.contains(autopublished, collectionName) && collectionName && !Constellation.collectionIsLocal(collectionName)) ? 'Constellation_autopublished' : '';
  },
  toggleAutopublish: function () {
	return Package["constellation:autopublish"] && !Constellation.collectionIsLocal(String(this));  
  }
});

Template.Constellation_collection_count.events({
  'click .Constellation_toggle_autopublish' : function (evt) {
	evt.stopPropagation();
	var autopublishedOrNot = ((ConstellationDict.get('Constellation_autopublish_all')) ? ConstellationDict.get('Constellation_not_autopublished') : ConstellationDict.get('Constellation_autopublished')) || [];
	if (_.contains(autopublishedOrNot, String(this))) {
	  autopublishedOrNot = _.without(autopublishedOrNot, String(this));
	}
	else {
	  autopublishedOrNot.push(String(this));
	}
	if (ConstellationDict.get('Constellation_autopublish_all')) {
	  ConstellationDict.set('Constellation_not_autopublished', autopublishedOrNot);
	}
	else {
	  ConstellationDict.set('Constellation_autopublished', autopublishedOrNot);
	}
  },
  'click .Constellation_clear_collection' : function (evt, tmpl) {
	evt.stopPropagation();
	var CollectionName = String(tmpl.data);
	var sessionKey = Constellation.sessKey(CollectionName);
	if (confirm("This will clear the whole '" + CollectionName + "' collection.\n\nThis cannot be undone.\n\nAre you sure?")) {
	  if (Constellation.collectionIsLocal(CollectionName)) {
		// Just make a duplicate on the client
		var error = null;
		var result = null;
		try {
		  result = Constellation.clearCollection(CollectionName);
		}
		catch (err) {
		  error = err;  
		}
		if (!error) {
		  afterClearCollection.call(null, error, result, CollectionName, sessionKey);
		}
		return;    
	  }
	  Meteor.call('Constellation_clear_collection', CollectionName, function (error, result) {
		afterClearCollection.call(null, error, result, CollectionName, sessionKey); 
	  });	
	}
  }
});


Template.Constellation_search_button.events({ 
  'click .Constellation_search_button' : function (evt) {
    evt.stopPropagation();
    ConstellationDict.set('Constellation_searching', !ConstellationDict.get('Constellation_searching'));  
  }
});