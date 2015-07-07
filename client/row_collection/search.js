Template.Constellation_search.helpers({
  fields: function () {
	 // Take a sample of up to 10 documents
	 var Collection = Constellation.Collection(String(this));
	 docs = Collection.find({}, {limit: 10}).fetch();
	 return _.reduce(docs, function (memo, doc) {
	   _.each(doc, function (val,key) {
		 if (!_.find(memo,function (field) { return field.name === key})) {
		   memo.push({name: key, type: Constellation.guessType(val)}); 
		 }
	   });
	   return memo;
	 },[{name:'_id',type:'string'}]);
  },
  selected: function () {
	var field = Session.get(Constellation.searchKey(String(Template.instance().data), 'field'));
	return field && this.name === field.name;
  },
  value: function () {
	var value = Session.get(Constellation.searchKey(String(Template.instance().data), 'value'));
	return (!_.isUndefined(value)) ? value : '';  
  },
  searching: function () {
	return Session.get('Constellation_searching');  
  }
});

Template.Constellation_search.events({
  'input .Constellation_search' : function (evt, tmpl) {
	 var value = tmpl.$(evt.target).val();
	 Session.set(Constellation.searchKey(String(this), 'value'), value);
	 var sessionKey = "Constellation_" + String(this);
     Session.set(sessionKey, 0);
  },
  'change .Constellation_search_fields' : function (evt, tmpl) {
	 var selected = tmpl.$('select').find(":selected");
	 var data = Blaze.getData(selected[0]);
	 Session.set(Constellation.searchKey(String(this), 'field'), data);
	 tmpl.$('input').attr('placeholder', data.type + ' value ...');
  }
});