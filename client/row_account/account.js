Template.Constellation_current_account.helpers({
  
  currentAccount: function () {
    return ConstellationDict.get("Constellation_currentTab") && Meteor.user() && (Meteor.user().username || (Meteor.user().emails && Meteor.user().emails[0] && Meteor.user().emails[0].address)) || '';
  }
  
});

Template.Constellation_account_view.helpers({
  
  currentUserOrSwitchingAccount: function () {
    return (!!Package['accounts-base'] && Meteor.user()) || ConstellationDict.get('Constellation_switchingAccount');
  },
  accountCount: function () {
    return Meteor.users && Meteor.users.find().count();  
  }

});