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
    var imageElement = new Image(100, 125); 
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
        if (blackjackCalculateValue(hand) > 21)  alert("Game Over"); 
        if (blackjackCalculateValue(hand) == 21) alert("You have 21!");
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

// TODO
// Precondition: deck is not empty, hand is not empty
// Postcondition: the AI has chosen to either hit or stay
// algorithm will be as follows:
// 1. calculate the sum of hand
// 2. based on sum, calculate remaining difference to 21. 
// 3. if difference >= 11, ALWAYS hit
// 4. else determine probability of getting the difference 
// e.g hand sum is 12, you can get 9 at most, which is 9/13 (2-9, ace)
// use this new probability to determine if AI will hit or not.
function blackjackAI(deck, hand) {
    if (deck < 1 || hand < 1) return;
}

function driverBlackjack() {
    var deck = createDeck();
    shuffle(deck);

    //create hands for the players
    var hand1 = dealHand(deck, 2);
    var hand2 = dealHand(deck, 2);
    var hand3 = dealHand(deck, 2);
    var player = dealHand(deck, 2);

    //assign onclick event to the Hit button
    document.getElementById('dealButton').onclick = function () {
        deal(deck, player, 'playerHand', true);
    }

    //show images as they are being dealed
    setTimeout(() => { loadHandImages(hand1, "p1Hand", false); }, 1500);
    setTimeout(() => { loadHandImages(hand2, "p2Hand", false); }, 2000);
    setTimeout(() => { loadHandImages(hand3, "p3Hand", false); }, 2500);
    setTimeout(() => { loadHandImages(player, "playerHand", true); }, 3000);
    setTimeout(() => { document.getElementById("actionText").innerHTML += "<br />" + "The game has started. Good luck."; }, 3000);
}