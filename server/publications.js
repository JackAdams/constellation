if (!!Package["accounts-base"]) {
  
  Meteor.publish('Constellation_search_by_emails', function (searchValue) {
    check(searchValue, String);
    return Meteor.users.find({"emails.0.address": {$regex: searchValue, $options: 'i'}});
  });

}