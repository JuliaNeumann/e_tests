/*************************************************************************************************************************
CROSSWORD GENERATOR
*************************************************************************************************************************/
function Crossword(my_word_list) {
//class declaration for a Crossword object
//params: my_word_list = array of objects with properties "word" and "question" (sorted in some way)
	this.grid = {0 : {0 : '//'}};
	this.x_start = 0;
	this.x_stop = 0;
	this.y_start = 0;
	this.y_stop = 0;
	this.unplaced_words = [];
	for (var i = 0; i < my_word_list.length; i++) {
		this.unplaced_words.push(new Word(my_word_list[i].word, my_word_list[i].question));
	} //for
	this.placed_words = [];
	this.numbers = [];
	//place the first word & initialize grid:
	var first_word = this.unplaced_words.shift();
	this.orientation = Math.round(Math.random()); //randomly gets 0 or 1; orientation indiactes at which orientation the next word is to be placed
	var first_position = new Position(0,0, this.orientation, 0);
	first_word.placeThisWord(first_position);
	this.expandGrid(first_word);
	this.placed_words.push(first_word);
	var count_placed_words = 1;
	while (count_placed_words > 0) { //iteratively try placing remaining words, until function cannot place any of the remaining words anymore
		count_placed_words = this.placeWords();
	} //while
	this.cleanUpGrid(); //make the grid start at 0/0
	this.size = this.x_stop * this.y_stop;
	if (this.x_stop < this.y_stop) {
		this.grid_ratio = (this.x_stop/this.y_stop) / (this.size); //"scores" the grid for comparison of crosswords (should be as small as possible and at the same time as close to a square as possible)
	} //if
	else {
		this.grid_ratio = (this.y_stop/this.x_stop) / (this.size);
	} //else 
} //function Crossword

Crossword.prototype.reverseOrientation = function() {
//sets the orientation property of a crossword to its opposite
	this.orientation = (this.orientation == 0) ? 1 : 0;
} //reverseOrientation

Crossword.prototype.expandGrid = function(my_word) {
//modifies the grid to accomodate a new word
//params: my_word = Word object, with a valid map property
	if ((my_word instanceof Word) && (my_word.map.length > 0)) {
		for (var i = 0; i < my_word.map.length; i++) {
			var current_y = my_word.map[i].y;
			var current_x = my_word.map[i].x;
			if (current_y < this.y_start) { //row the word wants to use before existing first row -> create as many empty rows as needed
				for (var j = current_y; j < this.y_start; j++) {
					this.grid[j] = {};
					for (var k = this.x_start; k <= this.x_stop; k++) {
						this.grid[j][k] = '//';
					}//for
				} //for
				this.y_start = current_y;
			} //if
			else if (current_y > this.y_stop) {
				for (var j = (this.y_stop + 1); j <= current_y; j++) { //row the word wants to use after existing last row -> create as many empty rows as needed
					this.grid[j] = {};
					for (var k = this.x_start; k <= this.x_stop; k++) {
						this.grid[j][k] = '//';
					}//for
				} //for
				this.y_stop = current_y;
			} //else if
			if (current_x < this.x_start) { //column the word wants to use before existing first column -> create as many empty columns as needed
				for (var j = current_x; j < this.x_start; j++) {
					for (var k = this.y_start; k <= this.y_stop; k++) {
						this.grid[k][j] = '//';
					}//for
				} //for
				this.x_start = current_x;
			} //if
			else if (current_x > this.x_stop) {
				for (var j = (this.x_stop + 1); j <= current_x; j++) { //column the word wants to use after existing last column -> create as many empty columns as needed
					for (var k = this.y_start; k <= this.y_stop; k++) {
						this.grid[k][j] = '//';
					}//for
				} //for
				this.x_stop = current_x;
			} //else if
			if (this.grid[current_y][current_x] == '//' || this.grid[current_y][current_x] == my_word.map[i].letter) { //letter is to be added to an empty space in grid, or same letter already occupies this space -> everything good
				this.grid[current_y][current_x] = my_word.map[i].letter;
			} //if
			else {
				console.log('Error during grid building!!');
				return false;
			} //else
		} //for
	} //if
	return true;
} //expandGrid

Crossword.prototype.testPrintGrid = function() {
//transfers the current grid to string, for testing purposes
	var grid_string = '';
	for (var i = this.y_start; i <= this.y_stop; i++) {
		grid_string += '<div class="cw_row">';
		for (var j = this.x_start; j <= this.x_stop; j++) {
			if (this.grid[i][j] == '//') {
				grid_string += '<div class="empty_field">&nbsp;</div>';
			} //if
			else {
				grid_string += '<div class="filled_field">';
				if (typeof this.numbers[i + '_' + j] !== "undefined") { //this is a start field with a number
					grid_string += '<sup>' + this.numbers[i + '_' + j] + '</sup>';
				}
				grid_string += this.grid[i][j] + '</div>'
			} //else
		} //for
		grid_string += '</div>';
	} //for
	//add the word list:
	grid_string += '<p id="word_list">';
	this.placed_words.sort(function(a,b) { //sort by orientation and number
		if (a.position.orientation != b.position.orientation) {
			return a.position.orientation - b.position.orientation;
		} //if
		else {
			return a.number - b.number;
		} //else
	});
	var across = false;
	var down = false;
	for (var i = 0; i < this.placed_words.length; i++) {
		if (this.placed_words[i].position.orientation == 0 && !across) { //add the headline for vertical words
			grid_string += '<h3>ACROSS</h3>';
			across = true;
		} //if
		else if (this.placed_words[i].position.orientation == 1 && !down) { //add the headline for horizontal words
			grid_string += '<h3>DOWN</h3>';
			down = true;
		} //else if
		grid_string += this.placed_words[i].number + ': ' + this.placed_words[i].question + '<br>';
	} //for
	grid_string += '</p>';
	return grid_string;
} //testPrintGrid

Crossword.prototype.cleanUpGrid = function() {
//adjusts the grid and positions of placed words to start at x = 0 and y = 0 (eliminates the negative values that are created while words are added)
//and adds numbers to the grid
	if (this.y_start < 0) {
		for (var i = 0; i < this.placed_words.length; i++) { //adjust all placed words
			this.placed_words[i].position.y -= this.y_start;
			for (var j = 0; j < this.placed_words[i].map.length; j++) {
				this.placed_words[i].map[j].y -= this.y_start;
			} //for
		} //for
		var new_grid = {};
		for (var i = this.y_start; i <= this.y_stop; i++) { //adjust the grid
			new_grid[i - this.y_start] = this.grid[i];
		} //
		this.grid = new_grid;
		this.y_stop -= this.y_start;
		this.y_start = 0;
	} //if
	if (this.x_start < 0) {
		for (var i = 0; i < this.placed_words.length; i++) { //adjust all placed words
			this.placed_words[i].position.x -= this.x_start;
			for (var j = 0; j < this.placed_words[i].map.length; j++) {
				this.placed_words[i].map[j].x -= this.x_start;
			} //for
		} //for
		var new_grid = {};
		for (var i = this.y_start; i <= this.y_stop; i++) { //adjust the grid
			new_grid[i] = {};
			for (var j = this.x_start; j <= this.x_stop; j++) {
				new_grid[i][j - this.x_start] = this.grid[i][j];
			} //for
		} //
		this.grid = new_grid;
		this.x_stop -= this.x_start;
		this.x_start = 0;
	} //if
	//number the words:
	this.placed_words.sort(function(a,b) { //sort by position
		if (a.position.y < b.position.y) {
			return -1;
		} //if
		else if (a.position.y > b.position.y) {
			return 1;
		} //else if
		else if (a.position.x < b.position.x) {
			return -1;
		} //if
		else if (a.position.x > b.position.x) {
			return 1;
		} //else if
		else {
			return 0;
		} //else
	});
	var counter = 1;
	for (var i = 0; i < this.placed_words.length; i++) {
		if (this.placed_words[i].number != null) { //number has been set already -> go on to next word
			continue;
		} //if
		var current_y = this.placed_words[i].position.y;
		var current_x = this.placed_words[i].position.x;
		this.placed_words[i].number = counter; //store the number for this word
		this.numbers[current_y + '_' + current_x] = counter; //store the number for the grid
		if ((typeof this.placed_words[i + 1] !== 'undefined') && (this.placed_words[i + 1].position.y == current_y) && (this.placed_words[i + 1].position.x == current_x)) { //next word starts at same position -> same number
			this.placed_words[i + 1].number = counter;
		} //if
		counter++;
	} //for
} //cleanUpGrid

Crossword.prototype.checkFieldEmpty = function(my_field) {
//checks whether field with the given x and y coordinates is empty in the current grid, if so returns true, else false	
//params: my_field = object with properties x and y
	if ((typeof this.grid[my_field.y] !== "undefined") && (typeof this.grid[my_field.y][my_field.x] !== 'undefined') && (this.grid[my_field.y][my_field.x] !== '//')) { //field exists and is not empty
		return false;
	}//if
	return true;
} //checkFieldEmpty

Crossword.prototype.placeWords = function() {
//tries to place remaining unplaced words in the crossword, returns number of how many words it was able to place
	var counter_placed_words = 0;
	var counter = this.unplaced_words.length;
	for (var i = 0; i < counter; i++) {
		var current_word = this.unplaced_words.shift();
		this.reverseOrientation();
		this.findPossiblePositions(current_word);
		
		if (current_word.possible_positions.length == 0) { //no possible position -> try other orientation
			this.reverseOrientation();
			this.findPossiblePositions(current_word);
			if (current_word.possible_positions.length == 0) { //still no possible position -> back to unplaced words
				this.unplaced_words.push(current_word); 
				continue;
			} //if
		} //if
		current_word.possible_positions.sort(function(a, b) { //sort by number of intersections
			return b.intersections - a.intersections;
		});
		var best_position = current_word.possible_positions[0];
		current_word.placeThisWord(best_position);
		this.expandGrid(current_word);
		this.placed_words.push(current_word);
		counter_placed_words++;
	} //for
	return counter_placed_words;
} //placeWords

Crossword.prototype.findPossiblePositions = function(my_word_obj) {
//goes through the array of placed words and tries to find possible positions for the given word (applying the current orientation)
//params: my_word_obj = Word object (word to be placed)
	if (my_word_obj instanceof Word) { //position must be set correctly for this function to work
		for (var j = 0; j < this.placed_words.length; j++) {
			if (this.placed_words[j].position.orientation != this.orientation) { //only consider words that do not have the orientation at which the word is to be placed
				for (var k = 0; k < this.placed_words[j].text.length; k++) {
					var current_letter = this.placed_words[j].text.charAt(k);
					letter_loop: //label for the following loop
					for (var l = 0; l < my_word_obj.text.length; l++) {
						if (my_word_obj.text.charAt(l) == current_letter) {
							//get position of this letter in the grid:
							var letter_x = this.placed_words[j].map[k].x;
							var letter_y = this.placed_words[j].map[k].y;
							var start_x = (this.orientation == 0) ? (letter_x - l) : letter_x;
							var start_y = (this.orientation == 1) ? (letter_y - l) : letter_y; 
							var new_position = new Position(start_x, start_y, this.orientation, 0);
							var new_map = my_word_obj.calculateMap(new_position);
							for (var m = 0; m < new_map.length; m++) { //check this position for interferences and intersections
								if ((typeof this.grid[new_map[m].y] !== "undefined") && (typeof this.grid[new_map[m].y][new_map[m].x] !== 'undefined')) { //field in the grid exists already
									if (new_map[m].letter == this.grid[new_map[m].y][new_map[m].x]) { //letter exists at this position -> intersection
										new_position.intersections++;
									} //if
									else if (this.grid[new_map[m].y][new_map[m].x] !== '//') { //another letter exists at this position -> interference, discard this position
										continue letter_loop;
									} //else if
									else { //check neighbouring fields -> should be empty, if this is not an intersection
										var neighbour_1 = 	{x: ((this.orientation == 0) ? (new_map[m].x) : (new_map[m].x - 1)), 
															y: ((this.orientation == 0) ? (new_map[m].y - 1) : (new_map[m].y))};
										var neighbour_2 = 	{x: ((this.orientation == 0) ? (new_map[m].x) : (new_map[m].x + 1)), 
															y: ((this.orientation == 0) ? (new_map[m].y + 1) : (new_map[m].y))};
										if (!this.checkFieldEmpty(neighbour_1) || !this.checkFieldEmpty(neighbour_2)) {
											continue letter_loop;
										} //if
									} //else 
								} //if
								if (m == 0) { //nothing should appear before first letter
									var neighbour = {x: ((this.orientation == 0) ? (new_map[m].x - 1) : (new_map[m].x)), 
													y: ((this.orientation == 0) ? (new_map[m].y) : (new_map[m].y - 1))};
									if (!this.checkFieldEmpty(neighbour)) {
										continue letter_loop;
									} //if
								} //if
								else if (m == (new_map.length - 1)) { //nothing should appear after last letter
									var neighbour = {x: ((this.orientation == 0) ? (new_map[m].x + 1) : (new_map[m].x)), 
													y: ((this.orientation == 0) ? (new_map[m].y) : (new_map[m].y + 1))};
									if (!this.checkFieldEmpty(neighbour)) {
										continue letter_loop;
									} //if
								} //else if
								//could add count of how much grid is expanded here!
							}//for
							my_word_obj.possible_positions.push(new_position);
						} //if
					}// for
				} //for
			} //if
		} //for
	} //if
} //attachWordToPlacedWords

function Word(my_word, my_question) {
//class declaration for word objects
//params: my_word = string, my_question = string
	this.question = my_question;
	this.text = my_word;
	this.position = null;
	this.map = [];
	this.possible_positions = [];
	this.orphaned = true;
	this.number = null;
} //function Word

Word.prototype.calculateMap = function(my_position) {
//calculates & returns the positions of all letters of a word, based on given position
//params: my_position = Position object
	if (my_position instanceof Position) { //position must be set correctly for this function to work
		var current_x = my_position.x;
		var current_y = my_position.y;
		var new_map = [];
		for (var i = 0; i < this.text.length; i++) {
			new_map.push({letter : this.text.charAt(i), x : current_x, y : current_y});
			(my_position.orientation == 0) ? current_x++ : current_y++;
		} //for
		return new_map;
	} //if
} //calculateMap

Word.prototype.placeThisWord = function(my_position) {
//sets the position and map properties of the word
//params: my_position = Position object
	if (my_position instanceof Position) { //position must be set correctly for this function to work
		this.position = my_position;
		this.map = this.calculateMap(my_position);
	} //if
} //placeThisWord

function Position(my_x, my_y, my_orientation, my_intersections) {
//class declaration for a position of a word
//params: my_x/y = Int (determining position in the grid), my_orientation = Int (1 for horizontally or 0 for vertically), my_intersections = Int (number of crossings with other words)
	this.x = my_x;
	this.y = my_y;
	this.orientation = my_orientation;
	this.intersections = my_intersections;
} //function Position

function generateCrossword(my_word_list) {
//main function: initializes generation of possible crossword arrangements, returns the best one
//params: my_word_list = array of strings (sorted in some way)
	//convert all words to upper case:
	for (var i = 0; i < my_word_list.length; i++) {
		my_word_list[i].word = my_word_list[i].word.toUpperCase();
	} //for
	var possible_crosswords = []; //holds created crosswords for comparison

	//first try: words sorted by length (seems to be most promising, so try this every time)
	my_word_list.sort(function(a, b) {
		return b.word.length - a.word.length;
	});
	possible_crosswords.push(new Crossword(my_word_list));

	//more tries with random order of words:
	var start = new Date().getTime(); //get timestamp
	while ((new Date().getTime() - start) < 5000) { //execute this loop for five seconds
		my_word_list = shuffleArray(my_word_list);
		possible_crosswords.push(new Crossword(my_word_list));
	} //while

	console.log(possible_crosswords.length);

	possible_crosswords.sort(function(a, b) { //find the best crossword, according to several criteria
		//1st priority: as little unplaced words as possible
		if (a.unplaced_words.length < b.unplaced_words.length) {
			return -1;
		} //if
		else if (a.unplaced_words.length > b.unplaced_words.length) {
			return 1;
		} //else if
		//2nd priority: grid_ratio as good as possible
		else if (a.grid_ratio > b.grid_ratio) {
			return -1;
		} //else if
		else if (a.grid_ratio < b.grid_ratio) {
			return 1;
		} //else if
		//3rd priority: size as small possible
		else if (a.size < b.size) {
			return -1;
		} //else if
		else if (a.size > b.size) {
			return 1;
		} //else if
		else {
			return 0;
		} //else
	});

	console.log(possible_crosswords);
	return possible_crosswords[0]; //return the best crossword
} //function generateCrossword

function shuffleArray(my_array) {
//returns shuffled version of the given array
//params: my_array = indexed array
	var counter = my_array.length;
	var shuffled_array = [];
	for (var i = counter; i > 0; i--) {
		var new_index = Math.floor(Math.random() * my_array.length); //pick random index
		shuffled_array.push(my_array.splice(new_index, 1)[0]); //remove the item from original array, add it to the shuffled array
	} //for
	return shuffled_array;
} //function shuffleArray

//WEB WORKER CODE:
onmessage = function (task) {
	var best_crossword = generateCrossword(task.data);
	var result_grid = best_crossword.testPrintGrid();
	postMessage(result_grid);
}