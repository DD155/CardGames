var isSplit = false; //var for if player can split
var isBustPlayer = false;
var isBustP4 = false;
var isBustP3 = false;
var isBustP2 = false; //vars for when hands over 21

/*
######################################################################################################################
                                                DECK FUNCTIONS
######################################################################################################################
*/


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

//Precondition: deck is not empty
//Postcondition: adds one card to the hand array
function deal(deck, playerObj, isPlayer, show) {
    if (deck.length < 1) return;

    if (isPlayer) {
        var s = "Player";
        var id = "playerHandBJ";
    }
    else {
        var s = "Enemy";
        var id = "enemyHand";
    }

    if (playerObj.blackjackCalculateValue() < 21) { //check if you can get another card
        playerObj.blackJackHand.push(deck.pop());
        loadImage(playerObj.blackJackHand, playerObj.blackJackHand.length - 1, id, show);
        document.getElementById("actionText").innerHTML += "<br />" + s + " hit.";
        if (playerObj.blackjackCalculateValue() > 21) { // player busts
            document.getElementById("actionText").innerHTML += "<br />" + s + " busted!";
            playerObj.Bust(true);
            setTimeout(() => { removeHandImgs(id); }, 2000);
        }
    }

    updateScroll();
}
/*
######################################################################################################################
                                                    CLASSES
######################################################################################################################
*/

class Player {
    constructor(health, attack, blackJackHand) {
        this.health = health;
        this.attack = attack;
        this.bust = false;
        this.split = false;
        this.blackJackHand = blackJackHand;
        this.hand = [];
    }

    set Health(value) {
        this.health = value;
    }

    set Bust(value) {
        this.bust = value;
    }

    points() {
        if (this.blackJackHand.length < 1) return; //precondition
        var sum = 0;
        var aces = 0;

        for (var i = 0; i < this.blackJackHand.length; i++) { //go through array to sum up values
            //face cards are worth 10 points
            if (this.blackJackHand[i][0] == 'J' || this.blackJackHand[i][0] == 'Q' || this.blackJackHand[i][0] == 'K') 
                sum += 10;
            else if (this.blackJackHand[i][0] == 'A') {//count ace as 11 for now
                sum += 11; aces++;
            } else sum += this.blackJackHand[i][0];
        }

        while (sum > 21 && aces > 0) { //if the sum has exceeded 21 due to aces, count them as 1 now.
            sum -= 10;
            aces--;
        }

        return sum;
    }
}



/* 
######################################################################################################################
                                                UTILITY FUNCTIONS 
######################################################################################################################
*/

//Postcondition: display image corresponding to the current card. "show" parameter checks is card is 
//face up or not
function loadImage(hand, index, id, show) {
    var imageElement = new Image(90, 115);
    var imageLocation = "resources/CardImages/";
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

function removeHandImgs(id) {
    var img = document.getElementById(id)
    var child = img.lastElementChild;

    while (child) { //remove current hand image
        img.removeChild(child);
        child = img.lastElementChild;
    }
}

//Postcondition: keep scrollbar on the bottom
function updateScroll() {
    document.getElementById('gameActions').scrollTop = document.getElementById('gameActions').scrollHeight;
}

//Postcondition: return a boolean depending on if the chance of getting the desired card is high enough
function chance(probability) {
    if (Math.random() * 13 <= probability) return true;
    return false;
}


/*
######################################################################################################################
                                                BLACKJACK FUNCTIONS
######################################################################################################################
*/

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

/*
// Precondition: deck is not empty, hand is not empty
// Postcondition: the AI has chosen to either hit or stay
// algorithm will be as follows:
// 1. calculate the sum of hand
// 2. based on sum, calculate remaining difference to 21. 
// 3. if difference >= 11, ALWAYS hit
// 4. else determine probability of getting the difference 
// e.g hand sum is 12, you can get 9 at most, which is 9/13 (2-9, ace)
// use this new probability to determine if AI will hit or not.
function blackjackAI(deck, hand, id) {
    if (deck < 1 || hand < 1) return; //precondition

    //TODO: implement choice for AI to split
    //TODO: implement choice for AI to double down

    var diff = 21 - blackjackCalculateValue(hand);;
    while (diff >= 11) { //always hit in this case
        deal(deck, hand, id, true);
        diff -= blackjackCalculateValue(hand);
    }

    if (diff == 10) var probability = 3;
    else var probability = diff;

    if (chance(probability)) deal(deck, hand, id, true);
    else {
        document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " stands.";
    }
}
*
//1. When the dealer has served every player, the dealers face-down card is turned up.
//2. If the total is 17 or more, it must stand. If the total is 16 or under, they must take a card.
//3. The dealer must continue to take cards until the total is 17 or more, at which point the dealer must stand.
//4. If the dealer has an ace, and counting it as 11 would bring the total to 17 or more (but not over 21)
//the dealer must count the ace as 11 and stand.
//5. If the dealer has a natural, players must pay dealer bets. 
function dealerAI(deck, hand) {
    //show hand
    removeHandImgs("enemyHand");
    loadHandImages(hand, 'enemyHand', true);
    document.getElementById("actionText").innerHTML += '<br />' + "The dealer reveals their hand.";
    if (blackjackCalculateValue(hand) > 21) {
        isBustP4 = true;
        document.getElementById("actionText").innerHTML += '<br />' + "The dealer busted!";
        return;
    }

    //hit
    if (blackjackCalculateValue(hand) >= 17) return; //dealer MUST stand if total is 17 or higher
    else {
        while (blackjackCalculateValue(hand) < 17) {
            deal(deck, hand, false, true);
        }
    }


}

*/
//Precondition: check if the hand has 2 cards and if they are the same rank
function checkSplit(hand, isPlayer) {
    if (hand.length == 2 && hand[0][0] == hand[1][0]) {
        if (isPlayer) document.getElementById("splitButton").disabled = false;
        return true;
    }
    document.getElementById("splitButton").disabled = true;
    return false;
}

/*
function haveNatural(hand, bet, id) {
    if (blackjackCalculateValue(hand) == 21) {
        document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " has a natural!";
        document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " got paid $" + ((bet * 1.5) - bet) + ".";
        document.getElementById(id).innerHTML = bet * 1.5;
    }
}
*/
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


function driverBlackjack() {
    var deck = createDeck();
    shuffle(deck);


    //create hands for the players
    var hand1 = dealHand(deck, 2);
    //var hand1 = [['K', 'C'], ['Q', 'C'], [3, "S"]];
    var player = new Player(30, 5, dealHand(deck, 2));

    console.log(player.health);

    //show images as they are being dealed, left to right from dealer view
    setTimeout(() => { loadImage(hand1, 0, "enemyHand", true); }, 1500);
    setTimeout(() => { loadHandImages(player.blackJackHand, "playerHandBJ", true); }, 2500);
    //dealer has card face down
    setTimeout(() => { loadImage(hand1, 1, "enemyHand", false); }, 3500);
    setTimeout(() => { document.getElementById("actionText").innerHTML += "<br />" + "The game has started. Good luck."; }, 3500);


    //assign onclick event to the Hit button
    document.getElementById('hitButton').onclick = function () {
        //case when split is available
        //if (isSplit && !player.bust) deal(deck, player, 'playerHandSplit', true);
        //else if (isSplit && player.bust) deal(deck, player, 'playerHandBJ', true);
        //else deal(deck, player, true, true);

        deal(deck, player, true, true);

        if (isBustPlayer) {
            document.getElementById('hitButton').disabled = true;
            document.getElementById('standButton').disabled = true;


        } else
            checkSplit(player.blackJackHand, true);
    }


    //assign onclick to Stand button
    document.getElementById('standButton').onclick = function () {
        var text = document.getElementById("actionText");
        text.innerHTML += "<br />" + "Player (You) stands.";

        //dealerAI(deck, hand1);
        
        document.getElementById('hitButton').disabled = true;
        document.getElementById('standButton').disabled = true;

    }

    //assign onclick event to the Split button
    document.getElementById('splitButton').onclick = function () {
        player.blackJackHand = split(player.blackJackHand, 'playerHandBJ');
        isSplit = true;
    }

    //split button is disabled by default
    document.getElementById('splitButton').disabled = true;

    // check if eligible to split
    checkSplit(player.blackJackHand, true);






}