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
	if (ConstellationDict.get('Constellation_autopublish_all')) {
      var notAutopublished = ConstellationDict.get('Constellation_not_autopublished') || [];
	  return (!_.contains(notAutopublished, String(this))) ? 'Constellation_autopublished' : 'Constellation_not_autopublished';	
	}
	var autopublished = Package['constellation:autopublish'] && ConstellationDict.get('Constellation_autopublished');
	return (_.contains(autopublished, String(this))) ? 'Constellation_autopublished' : '';
  },
  toggleAutopublish: function () {
	return Package["constellation:autopublish"];  
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
  }
});


Template.Constellation_search_button.events({ 
  'click .Constellation_search_button' : function (evt) {
    evt.stopPropagation();
    ConstellationDict.set('Constellation_searching', !ConstellationDict.get('Constellation_searching'));  
  }
});