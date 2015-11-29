function onload() {

var play_pause = document.getElementById( 'play_pause' );
var reset = document.getElementById( 'reset' );
var risposta = document.getElementById( 'risposta' );
var form = document.getElementById( 'form' );

var voices;

var STATUS = { EMPTY: 0, STOP: 1, PLAY: 2, PAUSE: 3 }; 
var status = STATUS.EMPTY;

var time_out_id, term_x, term_y, term_xy, index, pausa_risposta, pausa_step, voce;
var pairs = [];

if ( 'speechSynthesis' in window ) {
	if ( 'onvoiceschanged' in window.speechSynthesis )
		window.speechSynthesis.onvoiceschanged = get_voices;
	else
		get_voices();
	function get_voices( direct ) {
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
		console.log( 'got ' + voices.length + ' voice(s), direct ' + direct );
		setup_ui();
	};
} else
	setup_ui();

function setup_ui() {
	if ( voices && voices.length > 0 ) {
		var select = document.getElementById( 'voce' );
		for ( var i = 0; i < voices.length; i++ ) {
			var option = document.createElement( 'option' );
			option.setAttribute( 'value', i );
			option.innerHTML = voices[ i ].name;
			select.appendChild( option );
		}
	} else
		document.getElementById( 'select_voce' ).remove();
	play_pause.addEventListener( 'click', click_play_pause, false );
	reset.addEventListener( 'click', click_reset, false );
	status = STATUS.STOP;
	update_ui();
}

function update_ui() {
	switch ( status ) {
		case STATUS.EMPTY:
			risposta.innerHTML = '';
			form.style.visibility = 'visible';
			play_pause.innerHTML = '<i class="fa fa-spinner fa-pulse"></i>';
			play_pause.className = 'pure-button pure-button-disabled';
			reset.innerHTML = '<i class="fa fa-spinner fa-pulse"></i>';
			reset.className = 'pure-button pure-button-disabled';
		break;
		case STATUS.STOP:
			risposta.innerHTML = '';
			form.style.visibility = 'visible';
			play_pause.innerHTML = '<i class="fa fa-play"></i>';
			play_pause.className = 'pure-button button-start';
			reset.innerHTML = '<i class="fa fa-stop"></i>';
			reset.className = 'pure-button pure-button-disabled';
		break;
		case STATUS.PLAY:
			form.style.visibility = 'hidden';
			play_pause.innerHTML = '<i class="fa fa-pause"></i>';
			play_pause.className = 'pure-button button-start';
			reset.innerHTML = '<i class="fa fa-stop"></i>';
			reset.className = 'pure-button button-stop';
		break;
		case STATUS.PAUSE:
			form.style.visibility = 'hidden';
			play_pause.innerHTML = '<i class="fa fa-play"></i>';
			play_pause.className = 'pure-button button-start';
			reset.innerHTML = '<i class="fa fa-stop"></i>';
			reset.className = 'pure-button button-stop';
		break;
	}
}

function click_reset( event ) {
	if ( event ) event.preventDefault();
	if ( status != STATUS.STOP ) {
		status = STATUS.STOP;
		stop();
		update_ui();
	}
}

function click_play_pause( event ) {
	if ( event ) event.preventDefault();
	switch ( status ) {
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

function shuffle( array ) {
	for ( var i = array.length - 1; i >= 0; i-- ) {
		var j = Math.floor( Math.random() * ( 1 + i ) );
		var t = array[ i ];
		array[ i ] = array[ j ];
		array[ j ] = t;
	}
}

function setup_risposta() {
	risposta.innerHTML = '<div id="operazione"><span id="x"></span> X <span id="y"></span> = <span id="xy"></span></div><div id="progress"></div>';
	term_x = document.getElementById( 'x' );
	term_y = document.getElementById( 'y' );
	term_xy = document.getElementById( 'xy' );
	var progress = document.getElementById( 'progress' );
	var table = document.createElement( 'table' );
	if ( pairs.length > 10 ) {
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

function stop() {
	console.log( 'stop' );
	status = STATUS.STOP;
	pairs = [];
	window.clearTimeout( time_out_id );
}

function speak( text, next ) {
	if ( status != STATUS.PLAY ) return;
	if ( voce == -2 ) next();
	else {
		window.speechSynthesis.cancel();
		var ssu = new SpeechSynthesisUtterance( text );
		ssu.voice = voices[ voce ];
		window.speechSynthesis.speak( ssu );
		function waitssu() {
			if ( ! window.speechSynthesis.speaking ) {
				next();
				return;
			}
			window.setTimeout( waitssu, 200 );
		}
		waitssu();
	}
}

function step() {
	if ( status != STATUS.PLAY ) return;
	console.log( 'step ' + index );

	if ( index >= pairs.length ) {
		click_play_pause();
		return;
	}

	var x = pairs[ index ][ 0 ];
	var y = pairs[ index ][ 1 ];
	term_x.innerHTML = x;
	term_y.innerHTML = y;
	term_xy.innerHTML = '';

	function result() {
		if ( status != STATUS.PLAY ) return;
		time_out_id = window.setTimeout( function() {
			var td = document.getElementById( 'rc-' + x + '-' + y )
			if ( td ) td.className = 'done';
			term_xy.innerHTML = x * y;
			index++;
			speak( x * y, function() { window.setTimeout( step, pausa_step ); } );
		}, pausa_risposta );
	}

	speak( x + ' per ' + y, result );
}

function start() {
	console.log( 'start' );
	status = STATUS.PLAY;

	var quale = parseInt( form.quale.value );
	if ( quale == 0 )
		for ( var i = 1; i <= 10; i++ )
			for ( var j = 1; j <= 10; j++ )
				pairs.push( [ i, j ] );
	else
		for ( var j = 1; j <= 10; j++ )
			pairs.push( [ quale, j ] );

	var come = parseInt( form.come.value );
	if ( come == -1 )
		pairs.reverse();
	else if ( come == 0 )
		shuffle( pairs );

	var velocita = parseInt( form.velocita.value );
	if ( velocita == 0 )
		pausa_risposta = 2000;
	else if ( velocita == 1 )
		pausa_risposta = 1000;
	else
		pausa_risposta = 500;

	if ( voices && voices.length > 0 ) {
		voce = parseInt( form.voce.value );
		if ( voce == - 1 ) voce = Math.floor( Math.random() * voices.length );
	} else
		voce = -2;
	if ( voce == -2 ) {
		pausa_risposta += 1000;
		pausa_step = 1000;
	} else {
		pausa_step = 500;
	}

	setup_risposta();

	index = 0;
	step();
}

/* Twitter */
!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

/* Google Analytics */

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga( 'create', 'UA-377250-22', 'auto', { 'storage': 'none' } );
ga( 'send', 'pageview' );

}
