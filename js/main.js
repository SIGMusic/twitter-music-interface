
// Hardcoded sequences for testing. Use array of 16 0's for production
var sequence = {
	melody: [],//[-1, 5, 8, 3, 4, 2, 1, 0, 1, 6, 7, 7, 2, 8, -1, 1],
	bass: [],//[-1, 5, 8, 3, 4, 2, 1, 0, 1, 6, 7, 7, 2, 8, -1, 1],
	bassdrum: [],//[1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
	snare: [],//[0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1],
	hihat: [],//[1,1,1,1, 1,0,1,0, 1,1,1,1, 0,1,0,1, 1,1,1,1, 1,0,1,0, 1,1,1,1, 0,1,0,1],
}

var renderers = {
	melody: null,
	bass: null,
	bassdrum: null,
	snare: null,
	hihat: null,
}

// List all the parameters here. Default values should probably be 0.
var parameters = {
	'Param 1': 0,
	'Param 2': 0,
	'Param 3': 0,
	'Param 4': 0,
}


function setParams(data) {
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			parameters[key] = data[key];
			updateParam(key);
		}
	}
}

function setSequence(data) {
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			sequence[key] = data[key];
			renderSequence(key);
		}
	}
}

function renderSequence(name) {
	if (renderers[name])
		renderers[name].render(sequence[name]);
}

function renderAll() {
	for (var key in renderers) {
		if (renderers.hasOwnProperty(key))
			renderSequence(key);
	}
}

function updateParam(name) {
	$('[data-param="' + name + '"] .value span')
		.text(parameters[name])
		.css('width', (parameters[name] * 100) + '%');
}


function SequenceRenderer(canvas, colors) {
	/**
	 * The canvas to render to
	 */
	this.canvas = canvas;
	
	/**
	 * The colors to use when rendering
	 * @type Object
	 * @property {color} background The background color
	 * @property {color} grid The color of the grid
	 * @property {color} downbeat The color of the grid for downbeats
	 * @property {color} note The color of notes
	 */
	this.colors = colors || {
		background: '#fff',
		grid: '#f2f2f2',
		downbeat: '#ccc',
		note: '#555',
	}
	
	/**
	 * The width of the note line
	 */
	this.noteWidth = 5;
	/**
	 * The number of possible pitches in the sequence
	 */
	this.pitches = 8;
	/**
	 * The number of steps between downbeats
	 */
	this.division = 4;
	/**
	 * The number of beats per grid line
	 */
	this.subdivision = 1;
	
	/**
	 * Renders a sequence to the canvas
	 * @param {number[]} sequence The sequence of pitches to render
	 */
	this.render = function(sequence) {
			
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		
		var c = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;
		
		var hstep = w / sequence.length;
		var vstep = h / this.pitches;
		
		this.renderGrid(c, w, h, hstep, vstep);
		this.renderNotes(c, w, h, hstep, vstep, sequence);
	}
	
	this.renderGrid = function(c, w, h, hstep, vstep) {
		c.fillStyle = this.colors.background;
		c.fillRect(0, 0, w, h);
		
		var i = 0;
		
		hstep *= this.subdivision;
		
		// draw vertical blocks
		for (var x = 0; x <= w; x += 2*hstep) {
			if (i == 0)
				c.fillStyle = this.colors.downbeat;
			else
				c.fillStyle = this.colors.grid;
			
			c.fillRect(x, 0, hstep, h);
			i = (i + 1) % (this.division / 2);
		}
		
		// draw horizontal lines?
		/*
		c.lineWidth = 1;
		c.lineCap = 'butt';
		c.strokeStyle = this.colors.grid;
		c.beginPath();
		for (var y = 0; y <= h; y += vstep) {
			c.moveTo(0, Math.round(y));
			c.lineTo(w, Math.round(y));
		}
		c.stroke();
		*/
	}
	
	this.renderNotes = function(c, w, h, hstep, vstep, sequence) {
		// draw notes
		c.lineWidth = this.noteWidth;
		c.lineCap = 'round';
		c.strokeStyle = this.colors.note;
		c.beginPath();
		
		var lastPitch = -1;
		for (var i = 0; i < sequence.length; i++) {
			if (sequence[i] <= 0) {
				lastPitch = -1;
				continue;
			}
			
			var x1 = i * hstep + this.noteWidth/2;
			var x2 = (i + 1) * hstep - this.noteWidth/2;
			var y = h - ((sequence[i] - 0.5) * vstep);
			
			if (sequence[i] != lastPitch)
				c.moveTo(x1, y);
			c.lineTo(x2, y);
			
			lastPitch = sequence[i];
		}
		c.stroke();
	}
	
}

function RhythmRenderer(canvas, colors) {
	var r = new SequenceRenderer(canvas, colors);
	r.pitches = 1;
	r.noteWidth = 9;
	
	r.renderNotes = function(c, w, h, hstep, vstep, sequence) {
		
		c.lineWidth = r.noteWidth;
		c.lineCap = 'round';
		c.strokeStyle = r.colors.note;
		c.beginPath();
		
		for (var i = 0; i < sequence.length; i++) {
			if (sequence[i] <= 0) 
				continue;
			
			var x1 = i * hstep + 0.85*r.noteWidth;
			var x2 = (i + 1) * hstep - 0.85*r.noteWidth;
			var y = h - ((sequence[i] - 0.5) * vstep);
			
			c.moveTo(x1, y);
			c.lineTo(x2, y);
		}
		c.stroke();
	}
	
	return r;
}



function buildParams() {
	var table = $('#params');
	
	for (var key in parameters) {
		if (!parameters.hasOwnProperty(key))
			continue;
		
		table.append(
			$('<tr>').attr('data-param', key).append(
				$('<td>').addClass('name').text(key),
				$('<td>').addClass('value').append(
					$('<span>')
						.text(parameters[key])
						.css('width', (parameters[key] * 100) + '%')
				)
			)
		);
	}
}



// Initialize the page

$(window).resize(renderAll);

$(document).ready(function() {
	
	var firstUpdate = true;
	
	if (window.io === undefined) {
		console.error('Could not connect to Node server.');
		return;
	}
	
	socket = io.connect('http://localhost:8080/');
	
	socket.on('tweets', function(data) {
		console.log(data instanceof Array);
		if (!$.isArray(data))
			data = [data];
		
		console.log(data);
		
		for (var i = 0; i < data.length; i++) {
			console.log(i, data[i]);
			addTweet(data[i], firstUpdate);
		}
		
		firstUpdate = false;
	})
	
	socket.on('notes', function(data) {
		setSequence(data);
	})
	
	socket.on('params', function(data) {
		setParams(data);
	})
	
	renderers.melody = new SequenceRenderer($('#melody').get(0));
	renderers.bass = new SequenceRenderer($('#bass').get(0));
	renderers.snare = new RhythmRenderer($('#snare').get(0));
	renderers.bassdrum = new RhythmRenderer($('#bassdrum').get(0));
	renderers.hihat = new RhythmRenderer($('#hihat').get(0));
	renderers.hihat.subdivision = 2;
	
	renderAll();
	
	buildParams();
	
//	var testTweet = {
//		avatar: 'https://twimg0-a.akamaihd.net/profile_images/426806419/Kana_reasonably_small.png',
//		name: 'Joel Spadin',
//		username: 'ChaosinaCan',
//		text: '@sigumusicuiuc, blah blah blah blah blah. Testing testing, blah blah blah blah blah. Testing testing, blah blah blah blah blah. 140 reached'
//	}
//	
//	for (var i = 0; i < 5; i++)
//		addTweet(testTweet, i != 4);
})

