<?php
/*************************************************************************************************************************
PAGE HEADER
- provides document head for all pages, including necessary scripts, stylesheets etc.
*************************************************************************************************************************/
?>
<!DOCTYPE html>
<html  lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title><?php echo $title; ?></title>
        <!--[if lt IE 9]>
  			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]--><!-- enable HTML5 in old IE browsers -->
        <link rel="stylesheet" href="<?php echo ROOT_PATH; ?>css/styles_general.css" />
        <link rel="stylesheet" href="<?php echo ROOT_PATH; ?>css/styles_<?php echo $section; ?>.css" />
        <link rel="icon" type="image/ico" href="<?php echo ROOT_PATH; ?>images/favicon_grey.ico" />
        <script src="<?php echo ROOT_PATH; ?>js/jquery-1.11.2.min.js"></script>
        <script>
        	//global variables needed in all documents:
        	var root_path = '<?php echo ROOT_PATH; ?>';
        	var action = '<?php echo $action; ?>';
        	var section = '<?php echo $section; ?>';
        	var test_names;
        	var test_id = null;
<?php
			if (isset($test_id)) {
?>
				test_id = <?php echo $test_id; ?>;
<?php
			} //if
?>
        	$(document).ready(function() {
        		$('#content').show(); //content will only be visible with JS enabled
        	});
        </script>
        <script src="<?php echo ROOT_PATH; ?>js/js_general.js"></script>
        <script src="<?php echo ROOT_PATH; ?>js/js_<?php echo $section; ?>.js"></script>
	</head>
	<body>
		<noscript>
			<div id="js_warning">
				JavaScript is disabled in your browser!<br>
				As this application requires JavaScript, please enable it now and reload the page in order to use the application.
			</div>
		</noscript>
		<div id="content">
			<div id="wrapper">
				<div class="right_aligned" id="home_link_container">
<?php 
				if ($section != "index") {
?>
					<a href="<?php echo ROOT_PATH; ?>index.php" id="home_link">Home</a>
<?php
				} //if
?>	
				</div>
				<header id="title_header">
					<img src="<?php echo ROOT_PATH; ?>images/<?php echo $section; ?>_icon_white.png" id="page_icon" alt="Icon" width="35px" height="35px">
					<?php echo $header_text; ?>
				</header>