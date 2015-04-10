<?php
/*************************************************************************************************************************
GENERAL TEST INFO FORM
- provides the general information form fields necessary for all types of tests (info that will go to 'tests' tabel in DB)
*************************************************************************************************************************/
	$db_con = new Db_Connection();
	$test_levels = $db_con->selectEntries(true, 'test_levels', array("order" => "level_number"));
	if (!isset($test_data)) {
		$test_data['test_name'] = '';
		$test_data['test_level_ID'] = '';
	} //if
?>
	<header>
		General Information
	</header>
	<section>
		<div class="css_table">
			<div class="css_tr">
				<div class="css_td">
					Test Name : 
				</div>
				<div class="css_td">
					<input type="text" name="test_name" id="test_name" size="50"<?php printAttr('value', $test_data['test_name']); ?>>
				</div>
			</div>
			<div class="css_tr">
				<div class="css_td">
					Difficulty : 
				</div>
				<div class="css_td">	
<?php
				if (sizeof($test_levels) > 0) {
?>
					<select name="test_level" id="test_level">
						<option value="">[SELECT]</option>
<?php
					foreach ($test_levels as $level) {
						$selected = ((isset($test_data['test_level_ID']) && ($test_data['test_level_ID'] == $level['level_ID'])) ? 'selected' : '');
?>
						<option value="<?php echo $level['level_ID']; ?>"<?php printAttr('selected', $selected); ?>><?php echo $level['level_label'];?></option>
<?php

					} //foreach
?>
					</select>
<?php
				} //if
				else {
?>
					<em>No test levels found in database.</em>
<?php
				} //else
?>
				</div>
			</div>
		</div>
	</section>
