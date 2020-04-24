var isSplit = false; //var for if player can split
var isBustPlayer = false, isBustP4 = false, isBustP3 = false, isBustP2 = false; //vars for when hands over 21


//Postcondition: Returns a 2D array that contains a deck of 52 cards in array form [rank, suit].
function createDeck() {
    var deck = [];
    var facesArr = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
    var suitsArr = ["D", "C", "H", "S"];
    for (var i = 0; i < 13; i++) {
        for (var j = 0; j < 4; j++) {
            deck.push([facesArr[i], suitsArr[j]]);
        }
    }
    return deck;
}

//Precondition: deck is not empty
//Postcondition: deck is shuffled
function shuffle(deck) {
    if (deck.length < 1) return;
    for (var i = 0; i < 250; i++) {
        var pos1 = Math.floor((Math.random() * deck.length));
        var pos2 = Math.floor((Math.random() * deck.length));
        var tmp = deck[pos1];

        deck[pos1] = deck[pos2];
        deck[pos2] = tmp;
    }
}

//Precondition: deck is not empty
//Postcondition: return an array that contains # "amount" of cards from deck
function dealHand(deck, amount) {
    if (deck.length < 1) return;
    var arr = [];
    for (var i = 0; i < amount; i++) {
        arr.push(deck.pop());
    }
    return arr;
}

//Postcondition: display image corresponding to the current card. "show" parameter checks is card is 
//face up or not
function loadImage(hand, index, id, show) {
    var imageElement = new Image(90, 115); 
    var imageLocation = "/CodingProjects/Web/Cards/resources/CardImages/";
    //change string depending on if the current card should be shown or not
    imageLocation += show ? hand[index][0].toString() + hand[index][1] + ".png" : "back.png"; 
    imageElement.src = imageLocation;
    imageElement.classList.add("cardImages"); //add class to use css on
    document.getElementById(id).appendChild(imageElement);
}

//Postcondition: loads all the images of the cards on the hand
function loadHandImages(hand, id, show) {
    for (var i = 0; i < hand.length; i++) 
        loadImage(hand, i, id, show);
}

//Precondition: deck is not empty
//Postcondition: adds one card to the hand array
function deal(deck, hand, id, show) {
    if (deck.length < 1) return;

    if (blackjackCalculateValue(hand) < 21) { //check if you can get another card
        hand.push(deck.pop());
        loadImage(hand, hand.length - 1, id, show);
        document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " hit.";
        if (blackjackCalculateValue(hand) > 21) { // player busts
            document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " busted!";
            changeBust(id, true);
            setTimeout(() => { removeHandImgs(id); }, 500);
        }
    }

    updateScroll();

}

//Postcondition: return a string from the corresponding id
function generateNameString(id) {
    switch (id) {
        case "playerHand":
        case "playerHandSplit":
            return "Player 1 (You)";
        case "p4Hand":
            return "Player 4";
        case "p3Hand":
            return "Player 3";
        case "p2Hand":
            return "Player 2";
        default:
            break;
    }
}

function changeBust(id, isBust) {
    switch (id) {
        case "playerHand":
        case "playerHandSplit":
            isBustPlayer = isBust;
        case "p4Hand":
            isBustP4 = isBust;
        case "p3Hand":
            isBustP3 = isBust;
        case "p2Hand":
            isBustP2 = isBust;
        default:
            break;
    }
}

//Precondition: hand size must be greater than 0.
function blackjackCalculateValue(hand) {
    if (hand.length < 1) return; //precondition
    var sum = 0;
    var aces = 0;

    for (var i = 0; i < hand.length; i++) { //go through array to sum up values
        if (hand[i][0] == 'J' || hand[i][0] == 'Q' || hand[i][0] == 'K') //face cards are worth 10 points
            sum += 10;
        else if (hand[i][0] == 'A') {//count ace as 11 for now
            sum += 11; aces++;
        } else sum += hand[i][0];
    }

    while (sum > 21 && aces > 0) { //if the sum has exceeded 21 due to aces, count them as 1 now.
        sum -= 10;
        aces--;
    }

    return sum;
}

//Postcondition: return a boolean depending on if the chance of getting the desired card is high enough
function chance(probability) {
    if (Math.random() * 13 <= probability) return true;
    return false;
}

// Precondition: deck is not empty, hand is not empty
// Postcondition: the AI has chosen to either hit or stay
// algorithm will be as follows:
// 1. calculate the sum of hand
// 2. based on sum, calculate remaining difference to 21. 
// 3. if difference >= 11, ALWAYS hit
// 4. else determine probability of getting the difference 
// e.g hand sum is 12, you can get 9 at most, which is 9/13 (2-9, ace)
// use this new probability to determine if AI will hit or not.
function blackjackAI(deck, hand, id, dealer) {
    if (deck < 1 || hand < 1) return; //precondition

    //TODO: implement choice for AI to split
    //TODO: implement choice for AI to double down

    var diff = 21 - blackjackCalculateValue(hand);;
    while (diff >= 11) { //always hit in this case
        deal(deck, hand, id, !dealer);
        diff -= blackjackCalculateValue(hand);
    }
    
    if (diff == 10) var probability = 3;
    else var probability = diff;

    if (chance(probability)) deal(deck, hand, id, !dealer);
    else {
        //TODO: call "stand" function
        console.log(id + "Stand.");
    }
}

//Precondition: check if the hand has 2 cards and if they are the same rank
function checkSplit(hand, isPlayer) {
    if (hand.length == 2 && hand[0][0] == hand[1][0]) {
        if (isPlayer) document.getElementById("splitButton").disabled = false;
        return true;
    }
    document.getElementById("splitButton").disabled = true;
    return false;
}

function removeHandImgs(id) {
    var img = document.getElementById(id)
    var child = img.lastElementChild;

    while (child) { //remove current hand image
        img.removeChild(child);
        child = img.lastElementChild;
    }
}

function split(hand, id) {
    var newHand = [[hand[0]], [hand[1]]]

    removeHandImgs(id);

    //create two areas for the images
    loadImage(newHand[0], 0, id, true);
    loadImage(newHand[1], 0, 'playerHandSplit', true);

    document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " split their hand.";

    //disable split button
    document.getElementById('splitButton').disabled = true;

    return newHand; //set hand as 3D array, containing two 2D arrays as two hands

}

//Postcondition: keep scrollbar on the bottom
function updateScroll() {
    document.getElementById('gameActions').scrollTop = document.getElementById('gameActions').scrollHeight;
}

function driverBlackjack() {
    var deck = createDeck();
    shuffle(deck);

    var betPlayer, betP2, betP3, betDealer;
    betPlayer = betP2 = betP3 = 50;
    betDealer = 100;

    document.getElementById("p4Bet").innerHTML = betDealer;
    document.getElementById("p3Bet").innerHTML = betP3;
    document.getElementById("p2Bet").innerHTML = betP2;
    document.getElementById("playerBet").innerHTML = betPlayer;

    //create hands for the players
    var hand1 = dealHand(deck, 2);
    var hand2 = dealHand(deck, 2);
    var hand3 = dealHand(deck, 2);
    
    //var player = dealHand(deck, 2);
    var player = [[2, "D"], [2, "C"]];

    //var isSplit = false;
    
    //show images as they are being dealed, left to right from dealer view
    setTimeout(() => { loadImage(hand1, 0, "p4Hand", true); }, 1500);
    setTimeout(() => { loadHandImages(hand2, "p3Hand", true); }, 2000);
    setTimeout(() => { loadHandImages(player, "playerHand", true); }, 2500);
    setTimeout(() => { loadHandImages(hand3, "p2Hand", true); }, 3000);
    //dealer has card face down
    setTimeout(() => { loadImage(hand1, 1, "p4Hand", false); }, 3500);
    setTimeout(() => { document.getElementById("actionText").innerHTML += "<br />" + "The game has started. Good luck."; }, 3500);

    //assign onclick event to the Hit button
    document.getElementById('dealButton').onclick = function () {
        //case when split is available
        if (isSplit && !isBustPlayer) deal(deck, player[1], 'playerHandSplit', true);
        else if (isSplit && isBustPlayer) deal(deck, player[0], 'playerHand', true);
        else deal(deck, player, 'playerHand', true);

        checkSplit(player, true);    

        blackjackAI(deck, hand1, "p4Hand", true);
        blackjackAI(deck, hand2, "p3Hand", false);
        blackjackAI(deck, hand3, "p2Hand", false);
    }

    //assign onclick event to the Split button
    document.getElementById('splitButton').onclick = function () {
        player = split(player, 'playerHand');
        isSplit = true;
        console.log(player);
        console.log(player[0]);
        console.log(player[1]);
    }

    //split button is disabled by default
    document.getElementById('splitButton').disabled = true;

    // check if eligible to split
    checkSplit(player, true);    

    console.log(player);
}