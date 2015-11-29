function onload() {

var button = document.getElementById( 'button' );
var running = false;

var voices;
if ( 'speechSynthesis' in window ) {
	window.speechSynthesis.onvoiceschanged = get_voices;
	function get_voices() {
		if ( voices && voices.length > 0 ) return;
		voices = window.speechSynthesis.getVoices().filter(
				function( voice ) {
					return (
						voice.lang == "it-IT" && // italian
						voice.name.indexOf( 'Google' ) == -1 && // skip extra Chrome voices
						voice.voiceURI.indexOf( 'premium' ) == -1 // skip extra Safari voices*/
					);
				}
		);
		console.log( 'got ' + voices.length + ' voice(s)' );
		var select = document.getElementById( 'voce' );
		for ( var i = 0; i < voices.length; i++ ) {
			var option = document.createElement( 'option' );
			option.setAttribute( 'value', i );
			option.innerHTML = voices[ i ].name;
			select.appendChild( option );
		}
		button.addEventListener( 'click', toggle, false );
		button.className = 'pure-button button-start';
		console.log( 'voice, activated' );
	};
	get_voices();
} else {
	document.getElementById( 'select_voce' ).remove();
	button.addEventListener( 'click', toggle, false );
	button.className = 'pure-button button-start';

}

function toggle( event ) {
	if ( event ) event.preventDefault();
	var tabellina = document.getElementById( 'tabellina' );
	if ( button.className.indexOf( 'start' ) == -1 ) {
		stop();
		tabellina.innerHTML = '';
		button.className = 'pure-button button-start';
		button.value = 'Inizia!';
	} else {
		tabellina.innerHTML =
			'<span id="x"></span> X <span id="y"></span> = <span id="xy"></span>';
		button.className = 'pure-button button-stop';
		button.value = 'Fermati!';
		start();
	}
}

function shuffle( array ) {
	for ( var i = array.length - 1; i >= 0; i-- ) {
		var j = Math.floor( Math.random() * ( 1 + i ) );
		var t = array[ i ];
		array[ i ] = array[ j ];
		array[ j ] = t;
	}
}

function setup_progress( bidi ) {
	var progress = document.getElementById( 'progress' );
	if ( progress.firstChild ) progress.firstChild.remove();
	var table = document.createElement( 'table' );
	if ( bidi ) {
		for ( var i = 1; i <= 10; i++ ) {
			var tr = document.createElement( 'tr' );
			for ( var j = 1; j <= 10; j++ ) {
				var td = document.createElement( 'td' );
				td.setAttribute( 'id', 'rc-' + i + '-' + j );
				td.innerHTML = '&nbsp;';
				tr.appendChild( td );
			}
			table.appendChild( tr );
		}
	} else {
		var tr = document.createElement( 'tr' );
		for ( var j = 1; j <= 10; j++ ) {
			var td = document.createElement( 'td' );
			td.setAttribute( 'id', 'rc-' + pairs[ 0 ][ 0 ] + '-' + j );
			td.innerHTML = '&nbsp;';
			tr.appendChild( td );
		}
		table.appendChild( tr );
	}
	progress.appendChild( table );
}

function update_progress( x, y ) {
	var td = document.getElementById( 'rc-' + x + '-' + y );
	td.className = 'done';
}

var pairs = [];
var time_out_id;

function stop() {
	console.log( 'stop' );
	running = false;
	window.clearTimeout( time_out_id );
	pairs = [];
}

function start() {
	console.log( 'start' );
	running = true;

	var form = document.getElementById( 'form' );

	var quale = parseInt( form.quale.value );
	if ( quale == 0 ) {
		for ( var i = 1; i <= 10; i++ )
			for ( var j = 1; j <= 10; j++ )
				pairs.push( [ i, j ] );
		setup_progress( true );
	} else {
		for ( var j = 1; j <= 10; j++ )
			pairs.push( [ quale, j ] );
		setup_progress( false );
	}

	var come = parseInt( form.come.value );
	if ( come == -1 )
		pairs.reverse();
	else if ( come == 0 )
		shuffle( pairs );

	var pausa, velocita = parseInt( form.velocita.value );
	if ( velocita == 0 )
		pausa = 2000;
	else if ( velocita == 1 )
		pausa = 1000;
	else
		pausa = 500;
	console.log( 'pausa ' + pausa );

	var voce;
	if ( voices ) {
		voce = parseInt( form.voce.value );
		if ( voce == - 1 ) voce = Math.floor( Math.random() * voices.length );
	} else
		voce = -2;

	var term_x = document.getElementById( 'x' );
	var term_y = document.getElementById( 'y' );
	var term_xy = document.getElementById( 'xy' );

	var index = 0;
	function step() {
		if ( ! running ) return;
		if ( index >= pairs.length ) {
			toggle();
			return;
		}
		var x = pairs[ index ][ 0 ];
		var y = pairs[ index ][ 1 ];
		term_x.innerHTML = x;
		term_y.innerHTML = y;
		term_xy.innerHTML = '';
		update_progress( x, y );
		function result() {
			if ( ! running ) return;
			console.log( 'result' );
			time_out_id = window.setTimeout( function() {
				console.log( 'now' );
				term_xy.innerHTML = x * y;
				index++;
				if ( voce != -2 ) {
					var msg = new SpeechSynthesisUtterance( x * y );
					msg.voice = voices[ voce ];
					msg.onend = function( event ) {
						if ( ! running ) return;
						window.setTimeout( step, 500 );
					};
					window.speechSynthesis.speak( msg );
				} else window.setTimeout( step, 500 );
			}, pausa );
		}
		if ( voce != -2 ) {
			if ( ! running ) return;
			var msg = new SpeechSynthesisUtterance( x + ' per ' + y );
			msg.voice = voices[ voce ];
			msg.onend = function( event ) {
				if ( ! running ) return;
				result();
			};
			window.speechSynthesis.speak( msg );
		} else result();
	}
	step();
}

/* Twitter */
!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

}
