/* Tabellinga */

let play_pause = document.getElementById('play_pause');
let reset = document.getElementById('reset');
let risposta = document.getElementById('risposta');
let form = document.getElementById('form');
let values = document.getElementById('values');

let voices;

let STATUS = { EMPTY: 0, STOP: 1, PLAY: 2, PAUSE: 3 };
let status = STATUS.EMPTY;

let time_out_id, term_x, term_y, term_xy, index, pausa_risposta, pausa_step, voce;
let pairs = [];

function setup_ui(found) {
	if (found && found.length > 0) {
		voices = found.filter(voice => voice.lang == 'it-IT')
		let select = document.getElementById('voce');
		for (let i = 0; i < voices.length; i++) {
			let option = document.createElement('option');
			option.setAttribute('value', i);
			option.innerHTML = voices[i].name;
			select.appendChild(option);
		}
	} else
		document.getElementById('select_voce').remove();
	play_pause.addEventListener('click', click_play_pause, false);
	reset.addEventListener('click', click_reset, false);
	status = STATUS.STOP;
	update_ui();
}

function update_ui() {
	switch (status) {
		case STATUS.EMPTY:
			risposta.innerHTML = '';
			values.style.display = 'inline';
			play_pause.innerHTML = '<i class="fa fa-spinner fa-pulse"></i>';
			play_pause.className = 'pure-button pure-button-disabled';
			reset.innerHTML = '<i class="fa fa-spinner fa-pulse"></i>';
			reset.className = 'pure-button pure-button-disabled';
			break;
		case STATUS.STOP:
			risposta.innerHTML = '';
			values.style.display = 'inline';
			play_pause.innerHTML = '<i class="fa fa-play"></i>';
			play_pause.className = 'pure-button button-start';
			reset.innerHTML = '<i class="fa fa-stop"></i>';
			reset.className = 'pure-button pure-button-disabled';
			break;
		case STATUS.PLAY:
			values.style.display = 'none';
			play_pause.innerHTML = '<i class="fa fa-pause"></i>';
			play_pause.className = 'pure-button button-start';
			reset.innerHTML = '<i class="fa fa-stop"></i>';
			reset.className = 'pure-button button-stop';
			break;
		case STATUS.PAUSE:
			values.style.display = 'none';
			play_pause.innerHTML = '<i class="fa fa-play"></i>';
			play_pause.className = 'pure-button button-start';
			reset.innerHTML = '<i class="fa fa-stop"></i>';
			reset.className = 'pure-button button-stop';
			break;
	}
}

function click_reset(event) {
	if (event) event.preventDefault();
	if (status != STATUS.STOP) {
		status = STATUS.STOP;
		stop();
		update_ui();
	}
}

function click_play_pause(event) {
	if (event) event.preventDefault();
	switch (status) {
		case STATUS.PLAY:
			status = STATUS.PAUSE;
			update_ui();
			break;
		case STATUS.PAUSE:
			status = STATUS.PLAY;
			update_ui();
			step();
			break;
		case STATUS.STOP:
			status = STATUS.PLAY;
			start();
			update_ui();
			break;
	}
}

function shuffle(array) {
	for (let i = array.length - 1; i >= 0; i--) {
		let j = Math.floor(Math.random() * (1 + i));
		let t = array[i];
		array[i] = array[j];
		array[j] = t;
	}
}

function setup_risposta() {
	risposta.innerHTML = '<div id="operazione"><span id="x"></span> X <span id="y"></span> = <span id="xy"></span></div><div id="progress"></div>';
	term_x = document.getElementById('x');
	term_y = document.getElementById('y');
	term_xy = document.getElementById('xy');
	let progress = document.getElementById('progress');
	let table = document.createElement('table');
	if (pairs.length > 10) {
		for (let i = 1; i <= 10; i++) {
			let tr = document.createElement('tr');
			for (let j = 1; j <= 10; j++) {
				let td = document.createElement('td');
				td.setAttribute('id', 'rc-' + i + '-' + j);
				td.innerHTML = '&nbsp;';
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
	} else {
		let tr = document.createElement('tr');
		for (let j = 1; j <= 10; j++) {
			let td = document.createElement('td');
			td.setAttribute('id', 'rc-' + pairs[0][0] + '-' + j);
			td.innerHTML = '&nbsp;';
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	progress.appendChild(table);
}

function stop() {
	console.log('stop');
	status = STATUS.STOP;
	pairs = [];
	window.clearTimeout(time_out_id);
	update_ui();
}

function speak(text, next) {
	if (status != STATUS.PLAY) return;
	if (voce == -2) next();
	else {
		window.speechSynthesis.cancel();
		let ssu = new SpeechSynthesisUtterance(text);
		ssu.voice = voices[voce];
		window.speechSynthesis.speak(ssu);
		function waitssu() {
			if (!(window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
				next();
				return;
			}
			window.setTimeout(waitssu, 200);
		}
		waitssu();
	}
}

function step() {
	if (status != STATUS.PLAY) return;
	console.log('step ' + index);

	if (index >= pairs.length) {
		stop();
		return;
	}

	let x = pairs[index][0];
	let y = pairs[index][1];
	term_x.innerHTML = x;
	term_y.innerHTML = y;
	term_xy.innerHTML = '';

	function result() {
		if (status != STATUS.PLAY) return;
		time_out_id = window.setTimeout(function () {
			let td = document.getElementById('rc-' + x + '-' + y)
			if (td) td.className = 'done';
			term_xy.innerHTML = x * y;
			index++;
			speak(x * y, function () { window.setTimeout(step, pausa_step); });
		}, pausa_risposta);
	}

	speak(x + ' per ' + y, result);
}

function start() {
	console.log('start');
	status = STATUS.PLAY;

	let quale = parseInt(form.quale.value);
	if (quale == 0)
		for (let i = 1; i <= 10; i++)
			for (let j = 1; j <= 10; j++)
				pairs.push([i, j]);
	else
		for (let j = 1; j <= 10; j++)
			pairs.push([quale, j]);

	let come = parseInt(form.come.value);
	if (come == -1)
		pairs.reverse();
	else if (come == 0)
		shuffle(pairs);

	let velocita = parseInt(form.velocita.value);
	if (velocita == 0)
		pausa_risposta = 2000;
	else if (velocita == 1)
		pausa_risposta = 1000;
	else
		pausa_risposta = 500;

	if (voices && voices.length > 0) {
		voce = parseInt(form.voce.value);
		if (voce == - 1) voce = Math.floor(Math.random() * voices.length);
	} else
		voce = -2;
	if (voce == -2) {
		pausa_risposta += 1000;
		pausa_step = 1000;
	} else {
		pausa_step = 500;
	}

	setup_risposta();

	index = 0;
	step();
}

const getVoices = () => {
	return new Promise(resolve => {
		let voices = speechSynthesis.getVoices()
		if (voices.length) resolve(voices)
		speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices())
	})
}
getVoices().then(setup_ui)