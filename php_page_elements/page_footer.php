<?php
/*************************************************************************************************************************
PAGE FOOTER
- provides document footer for all pages, including copyright info
*************************************************************************************************************************/
?>	
				<div class="push"></div> <!-- makes footer stay at bottom of page -->
			</div> <!-- wrapper div -->
			<footer id="page_footer">
				<img src="<?php echo ROOT_PATH; ?>images/index_icon_white.png" id="app_icon" alt="Icon" width="20px" height="20px">
				<a href="<?php echo ROOT_PATH; ?>php_support/contact_form.php" id="contact_link" target="_blank">Julia Neumann</a> 2015, MA Thesis Project 'E-Test Editor'
				<div id="color_chooser" title="Choose your color!">
					<button class="color_button" id="button_orange"></button>
					<button class="color_button" id="button_turquoise"></button>
					<button class="color_button" id="button_blue"></button>
					<button class="color_button" id="button_lila"></button>
				</div>
			</footer>
<?php 
			if ($section !== 'index' && $section !== 'contact') {
				@include_once(INCLUDE_PATH . 'php_' . $section . '/' . $section . '_templates.php');
			} //if
?>
		</div> <!-- content div -->
	</body>
</html>