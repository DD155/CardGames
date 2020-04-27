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
function deal(deck, hand, id, show) {
    if (deck.length < 1) return;

    if (blackjackCalculateValue(hand) < 21) { //check if you can get another card
        hand.push(deck.pop());
        loadImage(hand, hand.length - 1, id, show);
        document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " hit.";
        if (blackjackCalculateValue(hand) > 21) { // player busts
            document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " busted!";
            changeBust(id, true);
            setTimeout(() => { removeHandImgs(id); }, 2000);
        }
    }

    updateScroll();
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

//Postcondition: return a string from the corresponding id
function generateNameString(id) {
    switch (id[1]) {
        case "l":
            return "Player 1 (You)";
        case "4":
            return "Dealer";
        case "3":
            return "Player 3";
        case "2":
            return "Player 2";
        default:
            break;
    }
}

function changeBust(id, isBust) {
    if (id[1] == 'l')
        isBustPlayer = isBust;
    else if (id[1] == '4')
        isBustP4 = isBust;
    else if (id[1] == '3')
        isBustP3 = isBust;
    else isBustP2 = isBust;
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

//1. When the dealer has served every player, the dealers face-down card is turned up.
//2. If the total is 17 or more, it must stand. If the total is 16 or under, they must take a card.
//3. The dealer must continue to take cards until the total is 17 or more, at which point the dealer must stand.
//4. If the dealer has an ace, and counting it as 11 would bring the total to 17 or more (but not over 21)
//the dealer must count the ace as 11 and stand.
//5. If the dealer has a natural, players must pay dealer bets. 
function dealerAI(deck, hand) {
    //show hand
    removeHandImgs("p4Hand"); 
    loadHandImages(hand, 'p4Hand', true);
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
            deal(deck, hand, "p4Hand", true);
        }
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

function haveNatural(hand, bet, id) {
    if (blackjackCalculateValue(hand) == 21) {
        document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " has a natural!";
        document.getElementById("actionText").innerHTML += "<br />" + generateNameString(id) + " got paid $" + ((bet * 1.5) - bet) + ".";
        document.getElementById(id).innerHTML = bet * 1.5;
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


function driverBlackjack() {
    var deck = createDeck();
    shuffle(deck);

    //set bets for players
    var betPlayer, betP2, betP3, betDealer;
    betPlayer = betP2 = betP3 = 50;
    betDealer = 0;

    document.getElementById("p4Total").innerHTML = betDealer;
    document.getElementById("p3Bet").innerHTML = betP3;
    document.getElementById("p2Bet").innerHTML = betP2;
    document.getElementById("playerBet").innerHTML = betPlayer;

    //create hands for the players
    var hand1 = dealHand(deck, 2);
    //var hand1 = [['K', 'C'], ['Q', 'C'], [3, "S"]];
    var hand2 = dealHand(deck, 2);
    var hand3 = dealHand(deck, 2);
    var player = dealHand(deck, 2);

    //show images as they are being dealed, left to right from dealer view
    setTimeout(() => { loadImage(hand1, 0, "p4Hand", true); }, 1500);
    setTimeout(() => { loadHandImages(hand2, "p3Hand", true); }, 2000);
    setTimeout(() => { loadHandImages(player, "playerHand", true); }, 2500);
    setTimeout(() => { loadHandImages(hand3, "p2Hand", true); }, 3000);
    //dealer has card face down
    setTimeout(() => { loadImage(hand1, 1, "p4Hand", false); }, 3500);
    setTimeout(() => { document.getElementById("actionText").innerHTML += "<br />" + "The game has started. Good luck."; }, 3500);

    //check for 21
    setTimeout(() => { haveNatural(hand2, betP2, "p3Bet");  }, 4000);
    setTimeout(() => { haveNatural(hand3, betP3, "p2Bet"); }, 4000);
    setTimeout(() => { haveNatural(player, betPlayer, "playerBet"); }, 4000);

    //assign onclick event to the Hit button
    document.getElementById('hitButton').onclick = function () {
        //case when split is available
        if (isSplit && !isBustPlayer) deal(deck, player[1], 'playerHandSplit', true);
        else if (isSplit && isBustPlayer) deal(deck, player[0], 'playerHand', true);
        else deal(deck, player, 'playerHand', true);

        checkSplit(player, true);    

        //blackjackAI(deck, hand1, "p4Hand", true);
        //blackjackAI(deck, hand2, "p3Hand", false);
        //blackjackAI(deck, hand3, "p2Hand", false);
    }


    //assign onclick to Stand button
    document.getElementById('standButton').onclick = function () {
        var text = document.getElementById("actionText");
        text.innerHTML += "<br />" + "Player (You) stands.";

        blackjackAI(deck, hand2, "p3Hand");
        blackjackAI(deck, hand3, "p2Hand");

        dealerAI(deck, hand1);
        if (isBustP4) { //if dealer busts, all players receive double their bet
            if (!isBustPlayer) {
                text.innerHTML += "<br />" + "Player (You) doubled their cash!";
                document.getElementById("playerTotal").innerHTML = Number(document.getElementById("playerBet").innerHTML) * 2;
            }
            if (!isBustP2) {
                text.innerHTML += "<br />" + "Player 2 doubled their cash!";
                document.getElementById("p2Total").innerHTML = Number(document.getElementById("p2Bet").innerHTML) * 2;
            }
            if (!isBustP3) {
                text.innerHTML += "<br />" + "Player 3 doubled their cash!";
                document.getElementById("p3Total").innerHTML = Number(document.getElementById("p3Bet").innerHTML) * 2;
            }
        } else { //calculate the results and pay the dealer/player accordingly
            var dealerBet = document.getElementById("p4Total");
            if (blackjackCalculateValue(hand1) < blackjackCalculateValue(hand2) && !isBustP3) {
                text.innerHTML += '<br />' + "Dealer pays Player 3 double their bet.";
                document.getElementById("p3Total").innerHTML = Number(document.getElementById("p3Bet").innerHTML) * 2;              
            } else {
                text.innerHTML += '<br />' + "Dealer takes Player 3's money.";
                dealerBet.innerHTML = Number(dealerBet.innerHTML) + Number(document.getElementById("p3Bet").innerHTML);
                document.getElementById("p3Total").innerHTML -= Number(document.getElementById("p3Bet").innerHTML);
            }
            if (blackjackCalculateValue(hand1) < blackjackCalculateValue(hand3) && !isBustP2) {
                text.innerHTML += '<br />' + "Dealer pays Player 2 double their bet.";
                document.getElementById("p2Total").innerHTML = Number(document.getElementById("p2Bet").innerHTML) * 2;
            } else {
                text.innerHTML += '<br />' + "Dealer takes Player 2's money.";
                dealerBet.innerHTML = Number(dealerBet.innerHTML) + Number(document.getElementById("p2Bet").innerHTML);
                document.getElementById("p2Total").innerHTML -= Number(document.getElementById("p2Bet").innerHTML);
            }
            if (blackjackCalculateValue(hand1) < blackjackCalculateValue(player) && !isBustPlayer) {
                text.innerHTML += '<br />' + "Dealer pays Player 1 (You) double their bet.";
                document.getElementById("playerTotal").innerHTML = Number(document.getElementById("playerBet").innerHTML) * 2; 
            } else {
                text.innerHTML += '<br />' + "Dealer takes Player's (You) money.";
                dealerBet.innerHTML = Number(dealerBet.innerHTML) + Number(document.getElementById("playerBet").innerHTML);
                document.getElementById("playerTotal").innerHTML -= Number(document.getElementById("playerBet").innerHTML);
            }
        }

        document.getElementById('hitButton').disabled = true;
        document.getElementById('standButton').disabled = true;

    }

    //assign onclick event to the Split button
    document.getElementById('splitButton').onclick = function () {
        player = split(player, 'playerHand');
        isSplit = true;
    }

    //split button is disabled by default
    document.getElementById('splitButton').disabled = true;

    // check if eligible to split
    checkSplit(player, true);


}