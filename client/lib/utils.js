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
      case "permission":
        // under consideration
        alert("This Meteor applications looks to be deployed in debug mode. Constellation cannot edit this document because it onlys works if the absolute URL begins with 'http://localhost:'")
      default:
        return "Request Credentials";
        break;
    }

  },
  'parse': function (data) {
    var newObject = null;
    
    try {

      var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

      var dateParser = function (key, value) {
        if (_.isString(value)) {
          var a = reISO.exec(value);
          if (a) {
            return new Date(value);
          }
        }
        return value;
      }

      newObject = JSON.parse(data, dateParser);
      
    }
    catch (error) {
        
      Constellation.error("json.parse");
      
    }

    return newObject;

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
    var selector = {};
    if (!ConstellationDict.get('Constellation_searching')) {
      return selector;    
    }
    var field = ConstellationDict.get(Constellation.searchKey(collectionName, 'field')) || {name: '_id', type: 'string'};
    var searchValue = ConstellationDict.get(Constellation.searchKey(collectionName, 'value')), matcher;
    if (typeof searchValue !== 'undefined' && searchValue !== '') {
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
            matcher = JSON.parse(searchValue) || {};
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
  collectionIsLocal : function (collectionName) {
    var collection = Constellation.Collection(collectionName);
    return collection && !collection._name;
  }
});