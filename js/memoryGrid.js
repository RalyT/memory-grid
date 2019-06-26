/* Current Data */
let userScore = 0;
let difficultyLevel = 1;
let leaderBoardList = [];

/* Sound Effects */
const sound_levelup = new Audio('../../../../Audio/level_up.wav');
const sound_leveldown = new Audio('../../../../Audio/level_down.wav');

/* Per Level basis data */
let tileList = [];
let currentCorrect = 0;
let currentIncorrect = 0;

/* Reference for game view */
let tileBoard = document.getElementById("tileBoard");

/* On window.load ready handler - Start sequence of program */
window.onload = function() {
    showStartView();
    hideGameView();
    hideSummaryView();
}

/* Starts the game */
function initializeGame() {
    getLeaderBoard();
    revertBoard();
    resetGameData();
    hideStartView();
    showGameView();
    hideSummaryView();
    enableSubmitBtn();

    loadLevel();
}

/* Loads the current level */
function loadLevel() {

    cleanTileBoard();

    /* Number of tiles on the board, and correct tiles */
    let numOfTiles = 0;
    let numOfCorrectTiles = 3;
    let tilesPerLevel = 0;

    /* Tile and Tileboard sizes */
    let tileWidth = 31;
    let tileHeight = 31;
    let wideBoardWidth = 50;

    /* Adjusts board size and number of tiles based on level */
    switch(difficultyLevel) {
        case 2:
            tilesPerLevel = 12;
            numOfCorrectTiles = 4;
            wideBoardWidth = 40;
            tileHeight = 23;
            tileWidth = 31;
            break;
        case 3:
            tilesPerLevel = 16;
            numOfCorrectTiles = 4;
            tileHeight = 23;
            tileWidth = 23;
            break;
        case 4:
            tilesPerLevel = 20;
            numOfCorrectTiles = 5;
            wideBoardWidth = 40;
            tileHeight = 23;
            tileWidth = 18;
            break;
        case 5:
            tilesPerLevel = 25;
            numOfCorrectTiles = 5;
            tileHeight = 18;
            tileWidth = 18;
            break;
        case 6:
            tilesPerLevel = 30;
            numOfCorrectTiles = 6;
            wideBoardWidth = 40;
            tileHeight = 18;
            tileWidth = 14;
            break;
        case 7:
            tilesPerLevel = 36;
            numOfCorrectTiles = 6;
            tileHeight = 14;
            tileWidth = 14;
            break;
        case 8:
            tilesPerLevel = 42;
            numOfCorrectTiles = 7;
            wideBoardWidth = 40;
            tileHeight = 14;
            tileWidth = 12;
            break;
        case 9:
            tilesPerLevel = 49;
            numOfCorrectTiles = 7;
            tileHeight = 12;
            tileWidth = 12;
            break;
        default:
            tilesPerLevel = 9;
            break;
    }

    /* Resizing board for levels that are not perfect squares */
    document.getElementById("tileBoard").style.width = wideBoardWidth + '%';

    /* Holding onto a list of index to randomize correct tiles */
    listOfIndices = [];
    currentCorrect = numOfCorrectTiles;
    updateStats();

    /* Building and attaching tiles to the board */
    while(numOfTiles != tilesPerLevel) {
        let newTile = document.createElement("div");
        newTile.setAttribute("index", numOfTiles);
        newTile.setAttribute("class", "tile");
        newTile.setAttribute("correct", "false");
        newTile.style.width = tileWidth + '%';
        newTile.style.height = tileHeight + '%';
        document.getElementById("tileBoard").appendChild(newTile);
        listOfIndices.push(numOfTiles);
        numOfTiles++;
    }

    tileList = document.getElementsByClassName("tile");

    /* Randomize and set correct tiles on the board */
    shuffle(listOfIndices);
    for(let i = 0; i < numOfCorrectTiles; i++) {
        tileList[listOfIndices[i]].setAttribute("correct", "true");
    }
    revealTiles();
}

/* Reveals the current tiles on the board, and then hides them after 3 seconds */
function revealTiles() {
    for(let i = 0; i < tileList.length; i++) {
        if(tileList[i].getAttribute("correct") === "true") {
            tileList[i].style.backgroundColor = "#7BF784";
        } else {
            tileList[i].style.backgroundColor = "rgb(248, 140, 147)";
        }
        /* Temporarily Disabling the tiles */
        tileList[i].setAttribute("onclick", null);
    }
    setTimeout(hideTiles, 3000);
}

/* Hides the tiles and rotates the board */
function hideTiles() {
    /* First hides the tiles */
    for(let i = 0; i < tileList.length; i++) {
        tileList[i].style.backgroundColor = "#000";
    }

    /* Rotate the board */
    rotateBoard();

    /* Allows the tiles to be clickable again after 2s rotation */
    setTimeout(function() {
        for(let i = 0; i < tileList.length; i++) {
            tileList[i].setAttribute("onclick", "checkTile(this)");
        }
    }, 2000);
}

/* Checks and reveals if a chosen tile is correct or not */
function checkTile(tile) {
    /* Correct Tile */
    if(tile.getAttribute("correct") == "true") {
        userScore++;
        currentCorrect--;
        tile.style.backgroundColor = "#7BF784";

    /* Incorrect Tile */
    } else {
        userScore--;
        currentIncorrect++;
        tile.style.backgroundColor = "rgb(248, 140, 147)";
    }
    /* Disables Tile */
    tile.onclick = null;
    updateStats();
    checkLevelComplete();
}

/* Checks if the current level is completed or if user has lost*/
function checkLevelComplete() {
    if(currentCorrect === 0) {
        evaluateDifficulty();
        revertBoard();
        loadLevel();
    } else if(userScore < 0) {
        userScore = 0;
        terminateGame();
    }
}

/* Adaptive Difficulty - Determines Difficulty of the next level */
/* Level decreases if user selects 2 or more incorrect tiles     */
function evaluateDifficulty() {
    if(currentIncorrect > 1) {
        if(difficultyLevel > 1) {
            difficultyLevel--;
            sound_leveldown.play();
        }
    } else {
        if(difficultyLevel < 7) {
            difficultyLevel++;
            sound_levelup.play();
        }
    }
    /* Reset for the next level */
    currentCorrect = 0;
    currentIncorrect = 0;
}

/* Ends the game and displays results */
function terminateGame() {
    showSummaryView();
    hideStartView();
    hideGameView();

    displayResults();
}

/* Calculates the user's ranking */
function calculateRanking() {
    for(let i = 0; i < leaderBoardList.length; i++) {
        if(userScore >= leaderBoardList[i].score) {
            document.getElementById("playerRank").innerHTML = (i+1); 
            break;
        }
    }
}

/* Display the summary results and leaderboard */
function displayResults() {

    document.getElementById("finalScore").innerHTML = userScore;
    calculateRanking();
    cleanLeadderBoard();
    let displayBoard = document.getElementById("leaderBoard");
    for(let i = 0; i < 5; i++) {
        let newEntry = document.createElement("h3");
        newEntry.innerHTML = (i + 1) +". " +
                            leaderBoardList[i].name + " - " + 
                            leaderBoardList[i].score + " points";
        switch(i) {
            case 0: 
                newEntry.style.color = "#ffcf4d";
                break;
            case 1:
                newEntry.style.color = "#B4B7BA";
                break;
            case 2:
                newEntry.style.color = "#C48F65";
                break;
        }
        displayBoard.appendChild(newEntry);
    }
}

/* AJAX functions for communicating with the server    */
/*                                                     */
/*                                                     */
function getLeaderBoard() {
    $.ajax({
        url: '/COMP4711/labs/3/MemoryGame/index.html',
        type: 'PUT',
        dataType: 'json',
        success: function(result) {
            for(let i = 0; i < result.length; i++) {
                leaderBoardList.push(result[i]);
            }
            // console.log(result);
        }
    });
}

function saveNewScore() {
    let newName = document.getElementById("playerName").value;
    if(playerName != "") {
        $.ajax({
            url: '/COMP4711/labs/3/MemoryGame/index.html',
            type: 'POST',
            data: { name_field: newName, score_field: userScore },
            dataType: 'html',
            success: function(result) {
                // console.log("Success: " + result);
            }
        });
        disableSubmitBtn();
    }
}

/* Functions for controlling which views are displayed */
/*                                                     */
/*                                                     */
function showStartView() {
    let startView = document.getElementById("startView");
    startView.style.removeProperty('display');
    startView.style.display = "block";
}

function hideStartView() {
    let startView = document.getElementById("startView");
    startView.style.removeProperty('display');
    startView.style.display = "none";
}

function showGameView() {
    $("#boardContent .spacer").remove(); // Case: restarting the game and spacer already exists
    $("#boardContent").prepend($("<div class='spacer'></div>"))
    let gameView = document.getElementById("gameView");
    let tileBoard = document.getElementById("tileBoard");
    gameView.style.removeProperty('display');
    tileBoard.style.removeProperty('display');
    gameView.style.display = "block";
    tileBoard.style.display = "block";
}

function hideGameView() {
    let gameView = document.getElementById("gameView");
    let tileBoard = document.getElementById("tileBoard");
    gameView.style.removeProperty('display');
    tileBoard.style.removeProperty('display');
    gameView.style.display = "none";
    tileBoard.style.display = "none";
}

function showSummaryView() {
    let summaryView = document.getElementById("summaryView");
    let summaryResults = document.getElementById("summaryResults");
    summaryView.style.removeProperty('display');
    summaryResults.style.removeProperty('display');
    summaryView.style.display = "block";
    summaryResults.style.display = "block";
}

function hideSummaryView() {
    let summaryView = document.getElementById("summaryView");
    let summaryResults = document.getElementById("summaryResults");
    summaryView.style.removeProperty('display');
    summaryResults.style.removeProperty('display');
    summaryView.style.display = "none";
    summaryResults.style.display = "none";
    document.getElementById("playerName").value = "";
}

/*              Helper Functions                    */
/*                                                  */
/*                                                  */
function resetGameData() {
    userScore = 0;
    difficultyLevel = 1;
    tileList = [];
    currentCorrect = 0;
    currentIncorrect = 0;
}

function updateStats() {
    document.getElementById("scoreValue").innerHTML = userScore;
    document.getElementById("tileValue").innerHTML = currentCorrect;
}

function cleanTileBoard() {
    let myBoard = document.getElementById("tileBoard");
    while (myBoard.firstChild) {
        myBoard.removeChild(myBoard.firstChild);
    }
}

function cleanLeadderBoard() {
    let myLeaderBoard = document.getElementById("leaderBoard");
    while (myLeaderBoard.firstChild) {
        myLeaderBoard.removeChild(myLeaderBoard.firstChild);
    }
}

function rotateBoard() {
    document.getElementById("tileBoard").setAttribute("class", "rotatedBoard");
}

function revertBoard() {
    document.getElementById("tileBoard").classList.remove("rotatedBoard");
}

function disableSubmitBtn() {
    let submitBtn = document.getElementById("submitScoreBtn");
    submitBtn.setAttribute("onclick", null);
    submitBtn.innerHTML = "Submitted!";
    submitBtn.style.backgroundColor = "rgba(204, 204, 204, 0.666)";
}

function enableSubmitBtn() {
    let submitBtn = document.getElementById("submitScoreBtn");
    submitBtn.setAttribute("onclick", "saveNewScore()");
    submitBtn.innerHTML = "Submit Score";
    submitBtn.style.backgroundColor = "white";
}

function confirmTerminate() {
    if(confirm("Are you sure you want to end the game?")) {
        terminateGame();
    } else {
        return;
    }
}

/* Durstenfeld Shuffle algorithm */
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}