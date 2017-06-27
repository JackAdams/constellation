if (!!Package["accounts-base"]) {
  
  Tracker.autorun(function () {
	var field = ConstellationDict.get(Constellation.searchKey('users', 'field')) || {name: '_id', type: 'string'};
	var searchValue = ConstellationDict.get(Constellation.searchKey('users', 'value'));
	if (ConstellationDict.get('Constellation_searching') && field.name === 'emails' && field.type === 'array' && searchValue && searchValue.length > 1) {
      Meteor.subscribe('Constellation_search_by_emails', searchValue);
	}
  });

}

Template.Constellation_search.helpers({
  fields: function () {
     // Take a sample of up to 10 documents
     var Collection = Constellation.Collection(String(this));
     if (!Collection) {
       // This prevents a bug that is caused by Blaze and array indexes and redraws with inconsistent data
       // In short, it thinks that "constellation_plugin_Config ..." is a collection name when a collection is hidden (or shown? -- can't remember) programatically
       // There are a couple of other fixes like this in docControls.js
       return [];
     }
     docs = Collection.find({}, {limit: 10}, {transform: null}).fetch();
     return _.reduce(docs, function (memo, doc) {
       _.each(doc, function (val, key) {
         if (!_.find(memo,function (field) { return field.name === key})) {
           memo.push({name: key, type: Constellation.guessType(val)}); 
         }
       });
       return memo;
     },[{name:'_id', type:'string'}]);
  },
  selected: function () {
    var field = ConstellationDict.get(Constellation.searchKey(String(Template.instance().data), 'field'));
    return field && this.name === field.name;
  },
  value: function () {
    var value = ConstellationDict.get(Constellation.searchKey(String(Template.instance().data), 'value'));
    return (!_.isUndefined(value)) ? value : '';  
  },
  searching: function () {
    return ConstellationDict.get('Constellation_searching');  
  }
});

Template.Constellation_search.events({
  'input .Constellation_search' : function (evt, tmpl) {
     var value = tmpl.$(evt.target).val();
     ConstellationDict.set(Constellation.searchKey(String(this), 'value'), value);
     var sessionKey = Constellation.sessKey(String(this));
     ConstellationDict.set(sessionKey, 0);
  },
  'change .Constellation_search_fields' : function (evt, tmpl) {
     var selected = tmpl.$('select').find(":selected");
     var data = Blaze.getData(selected[0]);
     ConstellationDict.set(Constellation.searchKey(String(this), 'field'), data);
     tmpl.$('input').attr('placeholder', data.type + ' value ...');
  }
});