Template.Constellation_account_view.helpers({
  
  currentUserOrSwitchingAccount: function () {
	return Meteor.user() || ConstellationDict.get('Constellation_switchingAccount');
  }

});