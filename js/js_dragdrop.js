/*************************************************************************************************************************
JS FOR DRAG&DROP TESTS
- contains JS necessary for creating & playing drag & drop tests
*************************************************************************************************************************/

//MODEL:
var dragdrop_test = { //test object to hold the test data produced / edited here

	init : function() {
		//PROPERTIES:
		this.containers = {counter: 0, objects: {}}; //holds container objects
		this.items = {counter: 0, objects: {}}; //holds item objects
		this.solutions = {}; //holds mappings item => container (numbers)

		E_Test.call(this, 'dragdrop'); //make this inherit from E_Test (see js_general.js)
	}, //init

	addContainerToModel : function(my_container_object) {
	//adds container to the model and returns it
		var container = new Container(this.containers.counter, my_container_object.container_text);
		
		if (my_container_object.container_ID) {
			container.db_id = my_container_object.container_ID;
		} //if
		else {
			container.newly_created = true;
		} //else

		this.containers.objects[this.containers.counter] = container;
		this.containers.counter++;
		return container;
	}, //addContainerToModel

	addItemToModel : function(my_item_object) {
	//adds item to the model and returns it
		var item = new Item(this.items.counter, my_item_object.item_text);
		if (my_item_object.item_ID) {
			item.db_id = my_item_object.item_ID;
		} //if
		else {
			item.newly_created = true;
		} //else
		if (my_item_object.item_container_ID) {
			item.item_container_ID = my_item_object.item_container_ID;
		} //if
		this.items.objects[this.items.counter] = item;
		this.items.counter++;
		return item;
	}, //addItemToModel

	setTestData : function() {
	//put all test data into one object literal for easy database submission
		this.test_data = {items : this.items, containers : this.containers, solutions : this.solutions};
	}, //setTestData

	setTestSolution : function() {
	//sets the solution property to reflect the correct or submitted solution
		for (i = 0; i < this.items.counter; i++) {
			var db_container_id = this.items.objects[i].item_container_ID;
			for (var j = 0; j < this.containers.counter; j++) {
				if (db_container_id == this.containers.objects[j].db_id) {
					this.solutions[i] = j;
				} //if
			} //for
		} //for
	}, //setTestSolution

	storeSolvedItem : function(my_item_id, my_container_id) {
	//stores which container an item has been dragged into
		dragdrop_test.solutions[my_item_id] = my_container_id;
		dragdrop_test.items.objects[my_item_id].edited = true;
	} //storeSolvedItem

} //dragdrop_test

//class declarations for items and containers:
function Container(my_current_id, my_text) {
//represents one container in which items can be dropped
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.container_text = my_text;
} //function Container

function Item(my_current_id, my_text) {
//represents one draggable item
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.item_text = my_text;
	this.item_container_ID = null;
} //function Item

/*************************************************************************************************************************/
//VIEW:

var view = {

	init : function() {
		//PROPERTIES:
		this.items_displayed = 0;
		this.containers_displayed = 0;
		this.current_container_height = 0;
		this.items_container = $('#items_container');
		this.containers_container = $('#container_row');
		this.item_template = $('script[data-template="item"]').html();
		this.container_template = $('script[data-template="container"]').html();

		View.call(this); //make this inherit from View (see js_general.js)

		var self = this;

		/*************************************************************/

		//EVENT HANDLERS:
		//switching between solved and unsolved view:
		$(document).on('click', '#show_solved', function() {
			self.showSolution();
			$(this).attr('id', 'show_unsolved').val('Show Unsolved Test');
			self.items_container.hide();
			self.unifyContainerHeights();
		});
		$(document).on('click', '#show_unsolved', function() {
			$('.item_box').each(function() {
				self.items_container.append($(this).css('display', 'inline'));
			});
			$(this).attr('id', 'show_solved').val('Show Solved Test');
			self.items_container.show();
			$('.container_box').css({'height': 'auto', 'padding-bottom': '30px'});
		});

		/*************************************************************/
		//adding new items & containers by button clicks:
		$('#add_item').click(function(e) {
			e.preventDefault();
			control.addItem({item_text: '[ITEM ' + (self.items_displayed + 1) + ']'});
		});
		$('#add_container').click(function(e) {
			e.preventDefault();
			control.addContainer({container_text: '[CONTAINER ' + (self.containers_displayed + 1) + ']'});
		});

		/*************************************************************/
		//deleting items & containers:
		$(document).on('mouseover', '.item_box, .label_box', function() {
			$(this).find('.delete_button').css('display', 'inline');
			if ($(this).css('display') == 'inline') {
				$(this).find('.delete_button').css({'float': 'initial'});
			} //if
		});
		$(document).on('mouseleave', '.item_box, .label_box', function() {
			$(this).find('.delete_button').css('display', 'none');
		});
		$(document).on('click', '.delete_button', function() {
			var current_id = $(this).parent().data('obj_id');
			if ($(this).parent().hasClass('label_box')) {
				//deletion of container:
				if ($('#container_box_' + current_id + ' > .item_box').length > 0) { //don't allow deleting if there are items inside container
					alert('You cannot delete a container with items inside. Move or delete the items first!');
				} //if
				else if (self.containers_displayed < 3) { //don't allow deletion if only two containers
					alert('Your test must contain at least two containers, so you cannot delete this container. Click on it to change its text instead.');
				} //else if
				else  if (confirm('Are you sure you want to delete this container?')){
					control.deleteContainer(current_id);
				} //else
			} //if
			else {
				//deletion of item:
				if (self.items_displayed < 3) { //don't allow deletion if only two items
					alert('Your test must contain at least two items, so you cannot delete this item. Click on it to change its text instead.');
				} //if
				else if (confirm('Are you sure you want to delete this item?')){
					control.deleteItem(current_id);
					$('#item_box_' + current_id).remove();
				} //else
			} //else
		});

		/*************************************************************/
		//change text of items/containers by clicking on them
		$(document).on('blur', '.editable_inputfield', function() {
			var new_text = $.trim($(this).val());
			if (new_text == '') {
				alert('Please enter some text!');
				$(this).focus();
				return;
			} //if
			var bool_container = false;
			var obj_id = $(this).closest('.non_editable').data("obj_id");
			if ($(this).parent().hasClass('container_label')) {
				//check whether a container with this name already exists:
				bool_container = true;
				new_text = new_text.toUpperCase(); //convert to upper case

				if (!control.checkContainerName(new_text, obj_id)) {
					alert('You already have a container with this label in your test. Choose another label!');
					$(this).focus();
					return;
				} //if
				control.changeContainer(obj_id, new_text);
			} //if
			else {
				control.changeItem(obj_id, new_text);
			} //else
			$(this).closest('.non_editable').html(new_text).removeClass('non_editable').addClass('editable');
			if (bool_container) {
				self.fixContainerLabelHeight(); //set all container labels to have same height
			} //if
		});

		/*************************************************************/
		//save test to database
		$(document).on('click', '#save_test', function(e) {
			e.preventDefault();

			//check submission for completeness & correctness:
			var error = false;
			if (!self.checkForm('#general_info_form')) { //see js_general.js
				error = true;
			} //if
			if (!control.checkTestName()) {
				error = true;
			} //if
			if ($('#items_container > .item_box').length > 0) { //all test items must be inside a container
				alert('Every item must be assigned to a container before you can save your test! Please drag all items into the containers first.');
				error = true;
			} //if

			//submission, if check yielded no errors:
			if (!error) {
				self.disableButtons(); //see js_general.js
				self.items_container.html('<em>Saving...</em>');
				control.saveTest();
			} //if
		});

		/*************************************************************/
		//check test (run mode)
		$('#check_test').click(function(e) {
			if ($('#items_container > .item_box').length > 0) { //all test items must be inside a container
				alert('Some items are still waiting to be dropped into a container! Please drag all items into the containers first.');
			} //if
			else {
				//translate current IDs to database IDs
				$('.instructions').html('<em>Checking ...</em>');
				self.disableButtons(); //see js_general.js
				$('.item_box').removeClass('incorrect_item border-color-5 font-color-5').addClass('border-theme-color').css('font-weight', 'normal').attr('draggable', false);
				control.checkRunTest();
			} //else
		});
	}, //init

	addContainerToView : function(my_container_object) {
	//displays the container it is given
		var container_html = this.container_template.replace(/{{id}}/g, my_container_object.current_id); //fill the template
		container_html = container_html.replace(/{{text}}/g, my_container_object.container_text);
		this.containers_container.append(container_html);
		this.containers_displayed++;

		if (action == 'new' || action == 'edit' || action == 'run') { //make this a container where items can be dropped
			var element = document.getElementById('container_' + my_container_object.current_id);
			element.addEventListener('drop', function(e) { control.dropItemIntoContainer(e, this); }); //needs to be done with plain JS, as jQuery does not pass necessary event data!
			element.addEventListener('dragover', function(e) { control.allowDrop(e, this); });
			element.addEventListener('dragenter', function(e) { control.allowDrop(e, this); });
			element.addEventListener('dragleave', function(e) { view.toggleDragBorder(e, this, true); });
		} //if
		if (action == 'new' || action == 'edit') { 
			this.enableInlineEditing('container', my_container_object.current_id);
			if (this.containers_displayed >= 4) { //don't allow creation of more than 4 containers
				$('#add_container').prop('disabled', true);
			} //if
		} //else if
		this.fixContainerTable();
	}, //addContainerToView

	addItemToContainer : function(my_item_id, my_container_id) {
	//appends an item to a container
		$('#item_box_' + my_item_id).css('display', 'block');
		if (action == 'new' || action == "edit") {
			$('#item_box_' + my_item_id + ' > .delete_button').css('float', 'right');
		} //if
		$('#container_box_' + my_container_id).append($('#item_box_' + my_item_id));
		if ((action == "run") && ($('#items_container > .item_box').length == 0)) { //all items in containers -> allow checking
			$('#check_test').attr('disabled', false);
		} //if
	}, //addItemToContainer

	addItemToView : function(my_item_object) {
	//displays the item it is given
		var item_html = this.item_template.replace(/{{id}}/g, my_item_object.current_id); //fill the template
		item_html = item_html.replace(/{{text}}/g, my_item_object.item_text);
		this.items_container.append(item_html);
		this.items_displayed++;

		if (action == 'new' || action == 'edit' || action == 'run') { //enable dragging
			$('#item_box_' + my_item_object.current_id).attr('draggable', 'true');
			var element = document.getElementById('item_box_' + my_item_object.current_id);
			element.addEventListener('dragstart', control.initDrag); //needs to be done with plain JS, as jQuery does not pass necessary event data!
			element.addEventListener('dragend', function(e) { view.resetOpacity(e.target.id) });
		} //if
		if (action == 'new' || action == 'edit') {
			this.enableInlineEditing('item', my_item_object.current_id);
		} //else if
	}, //addItemToView

	decreaseOpacity : function(my_element_id) {
	//decreases the opacity of the item with the HTML ID attribute given
		$('#' + my_element_id).css('opacity', '0.5');
	}, //decreaseOpacity

	deleteContainerFromView : function(my_container_id) {
	//removes the container with the ID from the view
		$('#container_cell_' + my_container_id).remove();
		this.containers_displayed--;
		this.fixContainerTable();
		if (this.containers_displayed < 4) { //allow creation of up to 4 containers
			$('#add_container').prop('disabled', false);
		} //if
	}, //deleteContainerFromView

	deleteItemFromView : function(my_item_id) {
	//removes the item with the ID from the view
		$('#item_box_' + my_item_id).remove();
		this.items_displayed--;
	}, //deleteContainerFromView

	displayIncorrectItem : function(my_item_id) {
	//marks the given item as incorrect
		$('#item_box_' + my_item_id).removeClass('border-theme-color').addClass('incorrect_item border-color-5 font-color-5').css('font-weight', 'bold');	
	}, //displayIncorrectItem

	enableInlineEditing: function(my_type, my_id) {
	//adds classes to items & containers that enable editing of their text
	//params: my_type = 'string' ('container' or 'item'), my_id = INT (current ID of container, used to build element ID attributes)
		switch (my_type) {
			case 'container':
				$('#label_' + my_id).addClass('editable');
				$('#label_box_' + my_id).append('&nbsp;<div class="delete_button font-color-1">X</div>');
				break;
			case 'item':
				$('#item_' + my_id).addClass('editable');
				$('#item_box_' + my_id).append('&nbsp;<div class="delete_button">X</div>');
				break;
			default:
				break;
		} //switch
	}, //enableInlineEditing

	fixContainerLabelHeight: function() {
	//fixes height of all container labels to height of the biggest, so they all have same height (even some might have linebreaks and others not) 
		$('.label_box').css('min-height', '1px');
		var current_height = 0;
		$('.label_box').each(function() {
			if ($(this).height() > current_height) {
				current_height = $(this).height();
			} //if
		});
		$('.label_box').css('min-height', current_height);
	}, //fixContainerLabelHeight

	fixContainerTable: function() {
	//fixes width of table cells, so they do not 'jump' when their content is modified
		var cell_width = 100 / parseInt(this.containers_displayed);
		$('.container_cell').css('width', cell_width + '%');
	}, //fixContainerTable

	resetOpacity : function(my_element_id) {
	//sets the opacity of the item with the HTML ID attribute given to normal
		$('#' + my_element_id).css('opacity', '1');
	}, //resetOpacity

	setDragImage : function(e, my_element_id) {
	//set the identified element as the drag image
		var img = document.getElementById(my_element_id);
		if (e.dataTransfer.setDragImage) { //check for support (not supported in IE, but IE displays drag image fine by default)
			e.dataTransfer.setDragImage(img, 0, 0); //set ghost image that is dragged along to be the item itself & to appear at mouse pointer
		} //if
	}, //setDragImage

	showSolution : function() {
	//changes display to solved version of the test
		$('.item_box').each(function() {
			var item_id = $(this).data('obj_id');
			view.addItemToContainer(item_id, control.getCorrectContainer(item_id));
		});	
	}, //showSolution

	toggleDragBorder : function(e, my_element, my_remove) {
	//handles changing of border color when item is dragged over element
	//params : e = eventdata, element = the element over which smth is dragged, my_remove = bool (indicating whether to remove or add border)	
		if (my_remove) {
			var new_class = "border-theme-color";
			var old_class = "border-color-1";
		} //if
		else {
			var new_class = "border-color-1";
			var old_class = "border-theme-color";
		}
		my_element.className = my_element.className.replace(old_class, new_class); //done with plain JS, as event listener passes element
	}, //toggleDragBorder

	unifyContainerHeights : function() {
	//set all containers to the height of the biggest
		var max_height = 0;	
		$('.container_box').each(function() {
			if ($(this).height() > max_height) {
				max_height = $(this).height();
			} //if
		});
		$('.container_box').height(max_height).css('padding-bottom', '2px');
	} //unifyContainerHeights

} //view


/*************************************************************************************************************************/
//CONTROL:

var control = {

	init: function(my_test_id) {
	//initialize loading of test and display, according to action
		Control.call(this); //make this inherit from Control (see js_general.js)

		view.init();
		dragdrop_test.init();

		switch (action) {
			case 'new':
				this.createDefaultTest(2,2);
				this.getTestNamesFromDb(0); //load test names from database for checking, see js_general.js
				break;
			case 'view':
				this.retrieveAndDisplayTest(my_test_id, true);
				break;
			case 'edit':
				this.retrieveAndDisplayTest(my_test_id, true);
				this.getTestNamesFromDb(my_test_id);
				break;
			case 'run':
				this.retrieveAndDisplayTest(my_test_id, false);
				break;
			default:
				break;
		} //switch
	}, //init

	addContainer : function(my_container_object) {
	//adds container to display and to test object
	//params: my_container_object = object (must have at least one property: container_text)
		var current_container = dragdrop_test.addContainerToModel(my_container_object);
		view.addContainerToView(current_container);
	}, //addContainer

	addItem : function(my_item_object) {
	//adds item to display and to test object
	//params: my_item_object = object (must have at least one property: item_text)
		var current_item = dragdrop_test.addItemToModel(my_item_object);
		view.addItemToView(current_item);
	}, //addItem

	allowDrop : function(e, my_element) {
	//allow dropping on containers (by preventing default, as elements can by default not be dropped into other elements)
		e.preventDefault();
		view.toggleDragBorder(e, my_element, false);
	}, //allowDrop

	changeContainer : function(my_container_id, my_new_text) {
	//sets text of a container in the model
		dragdrop_test.containers.objects[my_container_id].container_text = my_new_text; //update test object
		dragdrop_test.containers.objects[my_container_id].edited = true;
	}, //changeContainer

	changeItem : function(my_item_id, my_new_text) {
	//sets text of an item in the model
		dragdrop_test.items.objects[my_item_id].item_text = my_new_text; //update test object
		dragdrop_test.items.objects[my_item_id].edited = true;
	}, //changeItem

	checkContainerName : function(my_name, my_obj_id) {
	//checks whether a container with the given name (and not the given ID) exists, returns true if not
		for (var i = 0; i < dragdrop_test.containers.counter; i++) {
			if (i != my_obj_id) {
				var container = dragdrop_test.containers.objects[i];
				if ((container.container_text == my_name) && !container.deleted) { //another container with this text exists
					return false;
				} //if
			} //if
		} //for
		return true;
	}, //checkContainerName

	checkRunTest : function() {
	//checks a test submission made in run mode
		var temp_solution = {};
		for (i = 0; i < dragdrop_test.items.counter; i++) {
			var item_obj = dragdrop_test.items.objects[i];
			var container_obj = dragdrop_test.containers.objects[dragdrop_test.solutions[i]];
			temp_solution[item_obj.db_id] = container_obj.db_id;
		} //for
		$.getJSON(root_path + 'php_dragdrop/dragdrop_managetests.php', {check_test : temp_solution, check_test_id : dragdrop_test.db_id}, function(feedback) {
			view.displayScore(feedback.correct, dragdrop_test.items.counter);
			for (var i = 0; i < dragdrop_test.items.counter; i++) {
				var item_obj = dragdrop_test.items.objects[i];
				if (feedback[item_obj.db_id] == 0) { //mark incorrect items
					view.displayIncorrectItem(i);
				} //if
			} //for
		});
	}, //checkRunTest

	createDefaultTest : function(my_containers_number, my_items_number) {
	//prepare default items and containers for displaying empty drag&drop test, using the given numbers, then initialize storing and display
		var empty_items = {length: my_items_number};
		for (var i = 0; i < my_items_number; i++) {
			empty_items[i] = {item_text: '[ITEM ' + (i + 1) + ']'};
		} //for
		var empty_containers = {length: my_containers_number};
		for (var i = 0; i < my_containers_number; i++) {
			empty_containers[i] = {container_text: '[CONTAINER ' + (i + 1) + ']'};
		} //for

		this.setAndDisplayDragDropTest(empty_items, empty_containers);
	}, //createDefaultTest

	deleteContainer : function(my_container_id) {
	//deletes container from view and sets it to deleted in model
		view.deleteContainerFromView(my_container_id);
		dragdrop_test.containers.objects[my_container_id].deleted = true;
	}, //deleteContainer

	deleteItem : function(my_item_id) {
	//deletes item from view and sets it to deleted in model
		view.deleteItemFromView(my_item_id);
		dragdrop_test.items.objects[my_item_id].deleted = true;
	}, //deleteItem

	dropItemIntoContainer : function(e, my_element) {
	//specifies what happens when my_element is dropped on a container -> attach my_element to that container
		e.preventDefault();
		view.toggleDragBorder(e, my_element, true);

		var container_id = my_element.dataset.obj_id;
		var item = document.getElementById(e.dataTransfer.getData('text'));
		view.addItemToContainer(item.dataset.obj_id, container_id);
		dragdrop_test.storeSolvedItem(item.dataset.obj_id, container_id);
	}, //dropItemIntoContainer

	getCorrectContainer : function(my_item_id) {
	//returns the ID of the container into which the item belongs
		return dragdrop_test.solutions[my_item_id];
	}, //getCorrectContainer

	initDrag : function(e) {
	//specifies what happens when an element is dragged -> ID of that element as dragged data
		e.dataTransfer.setData('text', e.target.id); 
		view.decreaseOpacity(e.target.id);
		view.setDragImage(e, e.target.id);
	}, //initDrag

	retrieveAndDisplayTest : function(my_test_id, my_solution) {
	//retrieves data of a test from the database, displays it in div test_container
	//params: my_test_id = INT, my_solution = bool (indicating whether to retrieve solution or not)
		dragdrop_test.db_id = my_test_id;
		var self = this;
		$.getJSON(root_path + 'php_dragdrop/dragdrop_managetests.php', {test_id : my_test_id, solution : my_solution}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Test could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				self.setAndDisplayDragDropTest(feedback.items, feedback.containers);
				if (my_solution) { //in all modes other than run -> set solution of test object
					dragdrop_test.setTestSolution();
					if (action === "edit") { //in edit mode -> display solution right away
						view.showSolution();
					} //if
				} //if
			} //else
		});
	}, //retrieveAndDisplayTest

	setAndDisplayDragDropTest : function(my_items, my_containers) {
	//displays drag and drop test of given items and containers in test_container section, sets items and containers in dragdrop_test
	//params: lists of objects (each containing at least the text of the item/container)
		if (action == 'view' || action == 'run') {
			view.setHTMLContent(view.items_container.attr('id'), '');
		} //if
		//display items:
		for (var i = 0; i < my_items.length; i++) {
			this.addItem(my_items[i]);
		} //for
		//display containers:
		for (var i = 0; i < my_containers.length; i++) {
			this.addContainer(my_containers[i]);
		} //for
		view.fixContainerLabelHeight();
	}, //setAndDisplayDragDropTest

	saveTest : function() {
	//initializes saving of a test
		dragdrop_test.setTestData();
		dragdrop_test.saveTestAndRedirect(action);	
	} //saveTest

} //control


$(document).ready(function() {
	control.init(test_id);
});