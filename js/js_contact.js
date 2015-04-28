/*************************************************************************************************************************
JS FOR CONTACT_PAGE.PHP
- JavaScript code for handling the form check on the contact page
*************************************************************************************************************************/

var view = {
	init : function() {
		View.call(this); //make this inherit from View (see js_general.js)

		var self = this;

		/*************************************************************/
		//EVENT HANDLERS:

		$('#submit_contact_form').click(function(e) {
			if (!(self.checkForm('#contact_form'))) {
				e.preventDefault();
			} //if
		});

	} //init
} //view

$(document).ready(function() {
	view.init();
});