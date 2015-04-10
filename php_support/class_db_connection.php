<?php
/*************************************************************************************************************************
CLASS DECLARATION "DB_CONNECTION"
- class for creating database connection objects that can handle interactions with the database
*************************************************************************************************************************/

class Db_Connection {

	private $db_object, $connected, $error_msg;


	function __construct 	($my_db_ip = 'localhost', $my_db_user = 'e_tests_user', $my_db_pwd = 'NDvZp8HfDCRjpfwF', $my_db_name = 'e_tests') {
	//creates a new database object with mysqli (by default connects to e_tests database)
		$this->connected = false; //keeps track of whether there is a valid DB connection or not
		$this->error_msg = ''; //to be filled with database errors on their occurence
		$this->db_object = new mysqli($my_db_ip, $my_db_user, $my_db_pwd, $my_db_name);
		if ($this->db_object->connect_error) {
		  die('Database connection failed (' . $this->db_object->connect_errno . ') ' . $this->db_object->connect_error);
		}
		else {
			$this->connected = true;
		}
	} //function __construct


	/*************************************************************************************************************************
	METHODS FOR DB-INTERACTION
	*************************************************************************************************************************/

	function selectEntries ($my_close_connection, $my_table, $my_arguments = array()) {
	//executes a SELECT query, returns array of results on success, else dies with error message
	//params: $my_close_connection = true|false; $my_table = 'tablename, tablename, ...'; $my_arguments = array (see defaults below) 
		if ($this->connected) { //only allow query if valid DB connection
			//set default values:
			$my_arguments = array_merge(array( //replaces default values with values given, if necessary
				"select" => '*', //possible value: 'column, column, ...'
				"where" => null, //possible value: 'column = value, ...'
				"and" => null, //possible value: 'column = value, ...'
				"order" => null, //possible value: 'column, column, ...'
				"resulttype" => MYSQLI_ASSOC //possible values: MYSQLI_ASSOC|MYSQLI_NUM|MYSQLI_BOTH
			), $my_arguments);

			//build and execute query:
			$select_query = "SELECT " . $my_arguments["select"] . " FROM $my_table";
			if ($my_arguments["where"]) {
				$select_query .= " WHERE " . $my_arguments["where"];
			} //if
			if ($my_arguments["and"]) {
				$select_query .= " AND " . $my_arguments["and"];
			} //if
			if ($my_arguments["order"]) {
				$select_query .= " ORDER BY " . $my_arguments["order"];
			} //if

			$select_result = $this->db_object->query($select_query); //execute query
			$results = array();
				
			if ($select_result === false) { //query unsuccessful
				$this->raiseError('Error during SELECT query: ' . $this->db_object->error);
			} //if
			else {
				if ($select_result->num_rows > 0) {
					for ($i = 0; $i < $select_result->num_rows; $i++) {
						$results[] = $select_result->fetch_array($my_arguments["resulttype"]); 
					} //for
				} //if	
				$select_result->free();
			} //else
			if ($my_close_connection) { //if desired: close database connection once query is finished
				$this->closeConnection();
			} //if
			return $results;
		} //if
		else {
			$this->raiseError('No valid database connection for executing a SELECT query found!');
		} //else
	} //function selectEntries

	/*************************************************************************************************************************/

	function insertEntry($my_close_connection, $my_table, $my_values) {
	//executes a INSERT query, returns ID of inserted entry on success 
	//params: $my_close_connection = true|false; $my_table = 'tablename'; $my_values = associative array of field-value pairs
		if ($this->connected) { //only allow query if valid DB connection
			//prepare values for insertion
			$counter = 1;
			$db_fields = '';
			$cleaned_values = '';
			foreach ($my_values as $field => $value) {
				$db_fields .= $field;
				$cleaned_values .= "'" . $this->cleanValue($value) . "'";
				if ($counter < sizeof($my_values)) {
					$db_fields .= ',';
					$cleaned_values .= ',';
				} //if
				$counter++;
			} //foreach
			//build and execute query:
			$insert_query = "INSERT INTO $my_table ($db_fields) VALUES ($cleaned_values)";
			if ($this->db_object->query($insert_query) === false) {
				$this->raiseError('Error during INSERT query: ' . $this->db_object->error);
			} //if
			else {
				$inserted_id = $this->db_object->insert_id;
				if ($my_close_connection) { //if desired: close database connection once query is finished
					$this->closeConnection();
				} //if
				return $inserted_id;
			} //else
		} //if
		else {
			$this->raiseError('No valid database connection for executing a INSERT query found!');
		} //else
	} //function insertEntry()

	/*************************************************************************************************************************/

	function updateEntry($my_close_connection, $my_table, $my_values, $my_arguments) {
	//executes a DELETE query, returns true on success, else dies with error message
	//params: $my_close_connection = true|false; $my_table = 'tablename, tablename, ...'; $my_values = associative array of field-value pairs; $my_arguments = array (see defaults below) 
		if ($this->connected) { //only allow query if valid DB connection
			$my_arguments = array_merge(array( //replaces default values with values given, if necessary
				"where" => null, //possible value: 'column = value, ...'
				"and" => null //possible value: 'column = value, ...'
			), $my_arguments);
			//prepare values for insertion
			$counter = 1;
			$cleaned_values = '';
			foreach ($my_values as $field => $value) {
				$cleaned_values .= $field . "=";
				$cleaned_values .= "'" . $this->cleanValue($value) . "'";
				if ($counter < sizeof($my_values)) {
					$cleaned_values .= ',';
				} //if
				$counter++;
			} //foreach
			//build and execute query:
			$update_query = "UPDATE $my_table SET $cleaned_values";
			if ($my_arguments["where"]) {
				$update_query .= " WHERE " . $my_arguments["where"];
			} //if
			if ($my_arguments["and"]) {
				$update_query .= " AND " . $my_arguments["and"];
			} //if
			if ($this->db_object->query($update_query) === false) {
				$this->raiseError('Error during UPDATE query: ' . $this->db_object->error);
			} //if
			else {
				if ($my_close_connection) { //if desired: close database connection once query is finished
					$this->closeConnection();
				} //if
				return true;
			} //else
		} //if
		else {
			$this->raiseError('No valid database connection for executing an UPDATE query found!');
		} //else

	} //function updateEntry

	/*************************************************************************************************************************/

	function deleteEntries($my_close_connection, $my_table, $my_arguments) { 
	//executes a DELETE query, returns true on success, else dies with error message
	//params: $my_close_connection = true|false; $my_table = 'tablename, tablename, ...'; $my_arguments = array (see defaults below) 
		if ($this->connected) { //only allow query if valid DB connection
			//set default values:
			$my_arguments = array_merge(array( //replaces default values with values given, if necessary
				"where" => null, //possible value: 'column = value, ...'
				"and" => null //possible value: 'column = value, ...'
			), $my_arguments);
			
			$delete_query = "DELETE FROM $my_table ";

			if ($my_arguments["where"]) {
				$delete_query .= " WHERE " . $my_arguments["where"];
			} //if
			if ($my_arguments["and"]) {
				$delete_query .= " AND " . $my_arguments["and"];
			} //if


			if ($this->db_object->query($delete_query) === false) {
				$this->raiseError('Error during DELETE query: ' . $this->db_object->error);
			} //if
			else {
				if ($my_close_connection) { //if desired: close database connection once query is finished
					$this->closeConnection();
				} //if
				return true;
			} //else
		} //if
		else {
			$this->raiseError('No valid database connection for executing a DELETE query found!');
		} //else
	} //function deleteEntries()
	
	/*************************************************************************************************************************/

	function cleanValue($my_value) {
	//returns a version of a string that is save for database insertion (quotes escaped, HTML entity encoded etc.)
		if ($this->connected) {
			$my_value = strip_tags(trim($my_value)); //remove white spaces & tags
			$my_value = htmlentities($my_value, ENT_QUOTES|ENT_HTML5, "UTF-8", false); //encode HTML entities
			
			if (get_magic_quotes_gpc()) { // Magic Quotes are enabled -> strip slashes to avoid double escaping  
				$my_value = stripslashes($my_value);
			} //if
			
			$my_value = $this->db_object->real_escape_string($my_value); //escape for save DB insertion
			
			return $my_value;
		} //if
		else {
			$this->raiseError('No valid database connection for cleaning up a value found!');
		} //else
	} //function cleanValue()


	/*************************************************************************************************************************/

	function closeConnection() {
	//closes down an existing database connection
		if ($this->connected) {
			$this->db_object->close();
			$this->connected = false;
		} //if
	} //function closeConnection

	/*************************************************************************************************************************/
	function raiseError($my_error_msg) {
	//helper function to be called on occurrence of an error -> stores that error in a property of the object and terminates script execution
		if ($this->error_msg !== '') {
			$this->error_msg .= '; ';
		} //if
		$this->error_msg .= $my_error_msg;
		die($my_error_msg);
	} //function raiseError

	/*************************************************************************************************************************/
	function getErrorMessage() {
	//helper function, returns error message of the object
		return $this->error_msg;
	} //function raiseError	

} //class Db_connection
?>