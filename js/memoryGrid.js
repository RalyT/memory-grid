/* Current Data */
let userScore = 0;
let userHP = 5; 
let difficultyLevel = 1;
let leaderBoardList = [];

/* Sound Effects */
const sound_levelup = new Audio('./audio/level_up.wav');
const sound_leveldown = new Audio('./audio/level_down.wav');

/* Per Level basis data */
let tileList = [];
let currentCorrect = 0;
let currentIncorrect = 0;
let rotationDegree = 0;

/* Reference for game view */
let tileBoard = document.getElementById("tileBoard");

/* On DOM ready handler - Start sequence of program */
$(document).ready(function() {
    showStartView();
    hideGameView();
    hideSummaryView();
});

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
            tileHeight = 18;
            tileWidth = 23;
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
            tileHeight = 15;
            tileWidth = 18;
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
            tileHeight = 12.5;
            tileWidth = 14.5;
            break;
        case 9:
            tilesPerLevel = 49;
            numOfCorrectTiles = 7;
            tileHeight = 12;
            tileWidth = 12;
            break;
        default:    // Level 1 - 3x3
            tilesPerLevel = 9;
            break;
    }

    /* Resizing board for levels that are not perfect squares */
    document.getElementById("tileBoard").style.width = wideBoardWidth + '%';

   /* Holding onto a list of indices for tiles */
    listOfIndices = [];
    currentCorrect = numOfCorrectTiles;
    updateStats();

    while(numOfTiles != tilesPerLevel) {
        let $newTile = $("<div>", { class: "tile" });
        $newTile.append(
            $("<div>", {class: "tile-inner" }).append(
                $("<div>", {class: "tile-front"})
            ).append(
                $("<div>", {class: "tile-back"})
            )
        ).attr("index", numOfTiles);

        $newTile.css("width", tileWidth + '%');
        $newTile.css("height", tileHeight + '%');
        $("#tileBoard").append($newTile);
        listOfIndices.push(numOfTiles);
        numOfTiles++;
    }

    tileList = document.getElementsByClassName("tile");

    /* Set number of correct tiles to be true and shuffle tiles */
    for(let i = 0; i < numOfCorrectTiles; i++) {
        listOfIndices[i] = true;
    }
    shuffle(listOfIndices);
    revealTiles();
}

/* Reveals the current tiles on the board, and then hides them after 3 seconds */
function revealTiles() {
    for(let i = 0; i < tileList.length; i++) {

        if(listOfIndices[tileList[i].getAttribute("index")] === true) {
            $(tileList[i]).find(".tile-back").css("background-color", "#7BF784");
        } else {
            $(tileList[i]).find(".tile-back").css("background-color", "rgb(248, 140, 147)");
        }

        /* Temporarily Disabling the tiles */
        tileList[i].setAttribute("onclick", null);
    }
    flipAllTiles(tileList);
    setTimeout(hideTiles, 2500);
}

/* Hides the tiles and rotates the board */
function hideTiles() {
    /* First hides the tiles */
    flipAllTiles(tileList);

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
    flip(tile);
    setTimeout(function() {
        /* Correct Tile */
        if(listOfIndices[tile.getAttribute("index")] === true) {
            userScore++;
            currentCorrect--;
            tile.style.backgroundColor = "#7BF784";

        /* Incorrect Tile */
        } else {
            if(userHP > 0)
                userHP--;
            if(userScore > 0)
                userScore--;
            currentIncorrect++;
            tile.style.backgroundColor = "rgb(248, 140, 147)";
        }
        updateStats();
        checkLevelComplete();
    }, 800);
    /* Disables Tile */
    tile.onclick = null;
}

/* Checks if the current level is completed or if user has lost*/
function checkLevelComplete() {
    if(currentCorrect === 0) {
        evaluateDifficulty();
        revertBoard();
        loadLevel();
    } else if(userHP <= 0) {
     userHP = 0;
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
        url: 'http://www.ralytan.com/api/MemoryGame/scores',
        type: 'get',
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
            url: 'http://www.ralytan.com/api/MemoryGame/scores',
            type: 'get',
            data: { name_field: newName, 
                    score_field: userScore },
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
    userHP = 5;
    userScore = 0;
    difficultyLevel = 1;
    tileList = [];
    currentCorrect = 0;
    currentIncorrect = 0;
}

function updateStats() {
    $("#hpValue").html(userHP);
    $("#tileValue").html(currentCorrect);
    $("#scoreValue").html(userScore);
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

function flip(tile) {
    if(rotationDegree == 90 || rotationDegree == 270) {
        $(tile).toggleClass("tile-horz-flip");
        $(tile).find(".tile-inner").toggleClass("tile-horz-flip");
    } else {
        $(tile).toggleClass("tile-vert-flip");
        $(tile).find(".tile-inner").toggleClass("tile-vert-flip");
    }
}

function flipAllTiles(tileList) {
    for(let i = 0; i < tileList.length; i++) {
        flip(tileList[i]);
    }
}

function rotateBoard() {
    $("#tileBoard").addClass("rotatedBoard");
    $("#tileBoard").css("webkitTransform", "rotate(" + generateRandomDegree() + "deg)");
}

function revertBoard() {
    $("#tileBoard").removeClass("rotatedBoard");
    $("#tileBoard").css("webkitTransform", "rotate(0deg)");
}

function generateRandomDegree() {
    let randomDeg = 90;
    let diffAdjuster = 1;

    /* Increases degrees of rotation for higher levels */
    if(difficultyLevel > 4) {
        diffAdjuster = 2;
    } else if (difficultyLevel > 7) {
        diffAdjuster = 3;
    }

    let random = Math.floor(Math.random() * diffAdjuster);
    switch(random) {
        case(0):
            randomDeg = 90;
            break;
        case(1):
            randomDeg = 180;
            break;
        case(2):
            randomDeg = 270;
            break;
    }

    /* Random rotation direction */
    if(Math.floor(Math.random() * 2) == 1)
        randomDeg *= -1;

    rotationDegree = randomDeg;
    return randomDeg;
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