Template.Constellation_account_view.helpers({
  
  currentUserOrSwitchingAccount: function () {
    return Package['accounts-base'] && Meteor.user() || ConstellationDict.get('Constellation_switchingAccount');
  },
  accountCount: function () {
    return Meteor.users && Meteor.users.find().count();  
  }

});
