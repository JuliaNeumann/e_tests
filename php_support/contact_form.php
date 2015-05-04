<?php
/*************************************************************************************************************************
START PAGE OF APPLICATION
- presents user with possibilities to start creating / editing tests
*************************************************************************************************************************/
	
	//Page Variables:
	$title = 'Contact';
	$header_text = 'Contact';
	$section = 'contact';
	$action = 'contact';
	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	$form_submitted = false;
	if (isset($_POST['submit_contact_form'])) {
		$form_submitted = true;
		if (mail('admin@etests_editor.com', $_POST['subject'], $_POST['message'])) { //fake mail, as app runs on local server -> saved to xampp/mailoutput
			$msg = "Your message has been sent successfully! Thank you for your feedback.";
		} //if
		else {
			$msg = "Sorry, your message could not be sent.";
		} //else
	} //if

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';

	if ($form_submitted) {
?>
	<div class="notification">
		<header>
			Sending completed
			<div class="delete_notification_button font-color-4">X</div>
		</header>
		<section>
			<?php echo $msg; ?>
		</section>
	</div>
<?php
	} //if
?>
	<header>
		Information
	</header>
	<section>
		This application was created as a Master thesis project by Julia Neumann in January - May 2015. All content was developed by the author (including all images used). The documentation of the application is available <a href="<?php echo ROOT_PATH; ?>documentation.pdf" target="_blank">here</a>. The only third-party code used is the <a href="http://jquery.com/" target="_blank">jQuery library</a> (version 1.11.2).<br>
		<h3 class="font-theme-color">About the Author</h3>
		<div class="css_table" id="personal_info">
			<div class="css_tr">
				<div class="css_td">
					Address : 
				</div>
				<div class="css_td">
					Julia Neumann, Poststraße 19, 07356 Bad Lobenstein (Germany)
				</div>
			</div>
			<div class="css_tr">
				<div class="css_td">
					Affiliation :
				</div>
				<div class="css_td">
					Philipps-University Marburg (MA student, program: "Linguistics and Web Technology")
				</div>
			</div>
			<div class="css_tr">
				<div class="css_td">
					Registration No. :
				</div>
				<div class="css_td">
					252844
				</div>
			</div>
			<div class="css_tr">
				<div class="css_td">
					E-mail : 
				</div>
				<div class="css_td">
					jn.julianeumann[at]gmail.com
				</div>
			</div>
		</div>
	</section>
	<header>
		Use this form to contact the author
	</header>
	<section>
		<div class="instructions">
			Feel free to contact the author with comments about technical issues, ideas for new test formats, or any other kind of feedback you would like to share.
		</div>
		<form id="contact_form" name="contact_form" action="<?php echo ROOT_PATH; ?>php_support/contact_form.php" method="post">
			<div class="css_table">
				<div class="css_tr">
					<div class="css_td">
						Subject : 
					</div>
					<div class="css_td">
						<input type="text" name="subject" id="subject">
					</div>
				</div>
				<div class="css_tr">
					<div class="css_td">
						Your Message : 
					</div>
					<div class="css_td">
						<textarea name="message" id="message" rows="10"></textarea>
					</div>
				</div>
			</div>
			<div class="right_aligned">
				<input type="submit" id="submit_contact_form" name="submit_contact_form" class="submit_button" value="Send">
			</div>
		</form>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>