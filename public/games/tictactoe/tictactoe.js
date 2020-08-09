"use strict";

var HIGHLIGHTED_BOX, BOMBED_BOX, DANGER_BOX;
var SIZE=3;
var SCORE=0;
var MISSED=0;
var LEVEL=0;
var INTERVAL_TIMER = null;

/**
 * On click of start game - construct the grid and display a 3 sec count down
 * Reset score to 0
 */
function startGameAsX() {
    document.getElementById('startgameform').style.display = 'none';
    //TODO: add animation while removing the above section
    //SIZE = +document.getElementById('gridsize').value;
    _constructGrid();
    document.getElementsByClassName('gamegridcontainer')[0].style.display = 'flex';
}

function startGameAsO() {
    document.getElementById('startgameform').style.display = 'none';
    //TODO: add animation while removing the above section
    //SIZE = +document.getElementById('gridsize').value;
    _constructGrid();
    document.getElementsByClassName('gamegridcontainer')[0].style.display = 'flex';
}

/**
 * Construting nxn grid using Grid layout in CSS
 */
function _constructGrid() {
    const gamegrid = document.getElementsByClassName("gamegrid")[0];
    
    for (let i=0; i<9; i++) {
        let el = document.createElement("DIV");
        el.setAttribute('class', 'gamebox');
        el.setAttribute('id', 'gameboxid_'+i);
        el.setAttribute('onclick', '_boxClickListener(this)');
        gamegrid.appendChild(el);
    }
    const gridstyle=`
        grid-template-columns: repeat(${SIZE}, auto);
        grid-template-rows: repeat(${SIZE}, auto);
    `;
    gamegrid.setAttribute('style', gridstyle);

    //_startCountDownTimer();
}

/**
 * 3 sec countdown timer to give player some time before the game starts
 */
function _startCountDownTimer() {
    _overlayDisplay(false);
    var overlay = document.getElementById('countdownoverlay');
    var count = 3;
    overlay.querySelector('h1').innerHTML = count;
    var countdowntimer = setInterval(()=>{
        overlay.querySelector('h1').innerHTML = --count;
    }, 1000);
    setTimeout(()=>{
        overlay.style.display = 'none';
        clearInterval(countdowntimer);
        _startGame();
    }, 3000);
}

/**
 * After the 3 sec countdown timer where the game acutally starts.
 * Call highlightgrid function inside interval timer
 */
function _startGame() {
    var tiles=10;
    SCORE=0; MISSED=0;
    INTERVAL_TIMER = setInterval(()=>{
        
        if(MISSED>3) {
            _gameOver();
            
        } else {
            if(tiles--==0) {
                tiles=10;
                LEVEL++;
            }
            switch (LEVEL) {
                case 0:
                    _level_0();
                    break;
                case 1:
                    _level_1();
                    break;
                case 2:
                    _level_2();
                    break;
                case 3:
                    clearInterval(INTERVAL_TIMER);
                    _gameOver();
                    break;
            }
        }
    }, 1000);
}

/**
 * Defining base level of the game. 10 sec
 */
function _level_0() {
    _highlightGrid();
}

/**
 * Defining level 1 up for the next ten sec
 */
function _level_1() {
    _highlightGrid();
    _dangerGrid();
}

/**
 * Defining level 2 up for the last 10 sec
 */
function _level_2() {
    _highlightGrid();
    _bombGrid();
    _dangerGrid();
}

function _highlightGrid() {
    let row, col;
    row = _randomIntGenerator(0, SIZE);
    col = _randomIntGenerator(0, SIZE);
    HIGHLIGHTED_BOX = row*col;

    const boxnum = HIGHLIGHTED_BOX;
    const el_0 = document.getElementsByClassName('highlight');
    el_0.length && el_0[0].classList.remove('highlight');
    const el_1 = document.getElementsByClassName('gamegrid')[0]
        .querySelectorAll('div')[boxnum];
    el_1.classList.add('highlight');
}

function _bombGrid() {
    let row, col;
    row = _randomIntGenerator(0, SIZE);
    col = _randomIntGenerator(0, SIZE);
    BOMBED_BOX = row*col;

    const boxnum = BOMBED_BOX;
    if (BOMBED_BOX!==HIGHLIGHTED_BOX){
        const el_0 = document.getElementsByClassName('bomb');
        el_0.length && el_0[0].classList.remove('bomb');
        const el_1 = document.getElementsByClassName('gamegrid')[0]
            .querySelectorAll('div')[boxnum];
        el_1.classList.add('bomb');
    }
}

function _dangerGrid() {
    let row, col;
    row = _randomIntGenerator(0, SIZE);
    col = _randomIntGenerator(0, SIZE);
    DANGER_BOX = row*col;

    const boxnum = DANGER_BOX;
    if (DANGER_BOX!==HIGHLIGHTED_BOX){
        const el_0 = document.getElementsByClassName('danger');
        el_0.length && el_0[0].classList.remove('danger');
        const el_1 = document.getElementsByClassName('gamegrid')[0]
            .querySelectorAll('div')[boxnum];
        el_1.classList.add('danger');
    }
}

function _boxClickListener(scope) {
    let clickedbox = +scope.id.split('_')[1];
    //These are the places where an observable can help
    if(clickedbox===HIGHLIGHTED_BOX) {
        document.getElementById('scoreval').innerHTML = ++SCORE;
    } else if (clickedbox===DANGER_BOX) {
        SCORE-=2;
        MISSED++;
        document.getElementById('scoreval').innerHTML = SCORE;
    } else if (clickedbox===BOMBED_BOX) {
        _gameOver();
    } else {
        MISSED++;
    }
    document.getElementById('missedval').innerHTML = MISSED;
    //TODO: increment missed even when NOT clicked. right now only when clicked
    
}

/**
 * On click of back button. Go back to initial form.
 */
function backtoform() {
    _resetGameStates();

    //destroy the grid elements and reset other elements
    document.getElementsByClassName('gamegrid')[0].innerHTML = '';

    //hide gamegridcontainer and overlay (if present)
    let overlay = document.getElementById('countdownoverlay');
    (overlay.style.display !== 'none') && (overlay.style.display = 'none');
    document.getElementById('gamegridcontainer').style.display = 'none';
    //unhide the form
    document.getElementById('startgameform').style.display = 'block';
}

/**
 * Restart game. Dont go back to form. Reset score. Reset timer state. 
 * Start game again.
 */
function restartgame() {
    _resetGameStates();
    _startCountDownTimer();
}

function _gameOver() {
    clearInterval(INTERVAL_TIMER);

    //recalculating highscore
    var prevHighScore = window.localStorage.getItem('tiletaphighscore');
    if(!prevHighScore) {
        _setHighScore(SCORE);
    } else {
        _setHighScore(SCORE > prevHighScore ? SCORE : prevHighScore);
    }

    _overlayDisplay(true);
    let overlay = document.getElementById('countdownoverlay');
    overlay.querySelector('h2').innerHTML = 'Score: '+SCORE;
}

function _resetGameStates() {
    INTERVAL_TIMER && clearInterval(INTERVAL_TIMER);
    SCORE = 0; MISSED = 0; LEVEL = 0;
    document.getElementById('scoreval').innerHTML = 0;
    document.getElementById('missedval').innerHTML = 0;

    let el = document.getElementsByClassName('bomb');
    el.length && el[0].classList.remove('bomb');

    el = document.getElementsByClassName('danger');
    el.length && el[0].classList.remove('danger');

    el = document.getElementsByClassName('highlight');
    el.length && el[0].classList.remove('highlight');
}

function _overlayDisplay(scorecardflag) {
    var overlay = document.getElementById('countdownoverlay');
    overlay.style.display = 'block';

    overlay.querySelector('h1').style.display = scorecardflag ? 'none' : 'block';
    overlay.querySelector('div').style.display = scorecardflag? 'flex' : 'none';
}

function resetHighScore() {
    _setHighScore(0);
}

function _setHighScore(newScore) {
    window.localStorage.setItem('tiletaphighscore', +newScore);
    document.getElementById('highScore').innerHTML = newScore;
    document.getElementById('highscoreval').innerHTML = newScore;
}
/**
 * Trying  to write generic fn
 * @param {Number} min - our case always 0
 * @param {Number} max - our case equal to matrix size
 */
//TODO: implement - generate non consecutive random numbers
//If you want to escape consecutive integer problem - change the color of the box everytime you generate a num
//So generate random colors also (or pick random color from an existing array)
function _randomIntGenerator(min, max) {
    //return val will be [min, max)
    //so if matrix is 8x8 => min = 0, max=8 => [0, 7]
    return Math.floor(Math.random()*(max-min) + min);
}