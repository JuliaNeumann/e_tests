/*************************************************************************************************************************
JS FOR CONTACT_PAGE.PHP
- JavaScript code for handling the form check on the contact page
*************************************************************************************************************************/
$(document).ready(function() {

	$('#submit_contact_form').click(function(e) {
		if (!(checkForm('#contact_form', {}))) {
			e.preventDefault();
		} //if
	});

});
