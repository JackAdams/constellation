// Internal utility methods
// `Constellation` gets exported along with `API`
// so these are all available outside of the package via Package["constellation:console"].Constellation

_.extend(Constellation, {
    
  'colorize': function (json) {
    if (_.isUndefined(json)) {
      return '';
    }
    // colorized the JSON objects
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
      var cls = 'Constellation_number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'Constellation_key';
        } else {
          cls = 'Constellation_string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'Constellation_boolean';
      } else if (/null/.test(match)) {
        cls = 'Constellation_null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  },
  'error': function (data) {

    switch (data) {
      case "json.parse":
        alert("There is an error with your JSON syntax.\n\nNote: keys and string values need double quotes.");
        break;
      case "duplicate":
        alert("There was an error duplicating your document. Check you're not duplicating keys for fields with unique indexes.");
        break;
      case "remove":
        alert("There was an error removing your document.");
        break;
      case "insert":
        alert("There was an error inserting your document.");
        break;
      case "update":
        alert("There was an error updating your document. Please review your changes and try again.");
        break;
      case "clearCollection":
        alert("There was an error clearing the collection.");
        break;
      default:
        return "An error occurred.";
        break;
    }

  },
  'toggleFullScreen' : function () {
    ConstellationDict.set('Constellation_fullscreen', !ConstellationDict.get('Constellation_fullscreen'));  
  },
  'sessKey' : function (collectionName) {
    return 'Constellation_collection_' + collectionName;  
  },
  'searchKey' : function (collectionName, type) {
    // type is "field" or "value"
    return 'Constellation_' + collectionName + '_' + type;
  },
  'searchSelector' : function (collectionName, exact) {
    var selector = {}, matcher;
    if (!ConstellationDict.get('Constellation_searching')) {
      return selector;    
    }
    var field = ConstellationDict.get(Constellation.searchKey(collectionName, 'field')) || {name: '_id', type: 'string'};
    var searchValue = ConstellationDict.get(Constellation.searchKey(collectionName, 'value'));
    
    if (typeof searchValue !== 'undefined' && searchValue !== '') {
      // Special case email searches
      if (collectionName === 'users' && field.name === 'emails' && field.type === 'array') {
        selector["emails.0.address"] = {$regex: searchValue, $options: 'i'};
        return selector;
      }
      if (exact) {
        matcher = searchValue;
      }
      else {
        switch (field.type) {
          case 'string' :
            matcher = {$regex: searchValue, $options: 'i'};
            break;
          case 'object' :
          case 'array' :
            try {
              matcher = JSON.parse(searchValue);
            }
            catch (err) {
              matcher = (field.type === 'array') ? [] : {};    
            }
            break;
          case 'date' :
            matcher = new Date(searchValue);
            break;
          case 'null' :
            matcher = (searchValue === 'null') ? null : searchValue;
            break;
          case 'boolean' :
            matcher = Boolean(searchValue);
            break;
          case 'number' :
            matcher = parseInt(searchValue);
            break;
          default :
            matcher = undefined;
        }
      }
      selector[field.name] = matcher;
    }
    return selector;
  },
  'guessType' : function (value) {
    if (_.isArray(value)) {
      return 'array';
    }
    if (_.isDate(value)) {
      return 'date';    
    }
    if (_.isObject(value)) {
      return 'object';
    }
    if (_.isString(value)) {
      return 'string';
    }
    if (_.isBoolean(value)) {
      return 'boolean'; 
    }
    if (_.isNumber(value)) {
      return 'number';  
    }
    if (_.isNull(value)) {
      return 'null';  
    }
    return 'undefined';
  },
  'collectionIsLocal' : function (collectionName) {
    var collection = Constellation.Collection(collectionName);
    return collection && !collection._name;
  },
  'resemblesId' : function (text) {
    if (!_.isString(text)) {
      return false;
    }
    var pattern = new RegExp('^[0-9a-zA-Z]{3,25}$');
    return pattern.exec(text) !== null;
  },
  'findDocumentFromId' : function (value) {
    Meteor.call('Constellation_findCollectionForDocumentId', value, function (err, res) {
      if (res) {
        var collectionName = res.collectionName;
        var documentId = value;
        var collection = Constellation.Collection(collectionName);
        if (collection) {
          // Check if the doc is present
          if (collection.findOne({_id: documentId})) {
            // Go to the right panel and the right document
            UndoRedo.setDocumentNumber(collectionName, documentId);    
          }
          else {
            // Need to switch on autopublish
            var standardText = "This document from the '" + collectionName + "' collection isn't published:\n\n" + JSON.stringify(res.document, null, 2) + "\n\n";
            if (Package['constellation:autopublish']) {
              if (confirm(standardText + "Switch on autopublish and try again?")) {
                var autopublished = ConstellationDict.get('Constellation_autopublished') || [];
                var notAutopublished = ConstellationDict.get('Constellation_not_autopublished') || [];
                if (!_.contains(autopublished, collectionName)) {
                  autopublished.push(collectionName);
                }
                ConstellationDict.set('Constellation_autopublished', autopublished);
                ConstellationDict.set('Constellation_not_autopublished', _.without(notAutopublished, collectionName));
                Tracker.flush();
                Tracker.autorun(function (c) {
                  if (ConstellationDict.get('Constellation_autopublish_subscription_ready')) {
                    UndoRedo.setDocumentNumber(collectionName, documentId);
                    c.stop();
                  }
                });
              }
            }
            else {
              alert(standardText + "meteor add constellation:console-autopublish\n\nwill allow you to switch autopublish on and off from the Constellation UI"); 
            }
          }
        }
      }
    });  
  },
  'foreignKeyLinkEvents' : {
    'click, mouseenter' : function (evt, tmpl) {
      var value = tmpl.$(evt.target).text();
      if (value && value.length > 2) {
        value = value.substr(1, value.length - 2);    
      }
      if (!!Constellation && _.isString(value) && Constellation.resemblesId(value)) {
        if (evt.type === 'click') {
          Constellation.findDocumentFromId(value);
        }
        else {
          tmpl.$(evt.target).css('text-decoration', 'underline');  
        }
      }
    },
    'mouseleave' : function (evt, tmpl) {
      tmpl.$(evt.target).css('text-decoration', 'none');
    }
  }
});