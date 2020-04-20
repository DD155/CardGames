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

function loadImage(hand, index, id, show) {
    var imageElement = new Image(100, 125);
    var imageLocation = "/CodingProjects/Web/Cards/resources/CardImages/";
    if (show)
        imageLocation += hand[index][0].toString() + hand[index][1] + ".png"; //new file location
    else imageLocation += "back.png";
    imageElement.src = imageLocation;
    imageElement.classList.add("cardImages"); //add class to use css on
    document.getElementById(id).appendChild(imageElement);
}

function loadHandImages(hand, id, show) {
    for (var i = 0; i < hand.length; i++) {
        loadImage(hand, i, id, show);
    }
}

//Precondition: deck is not empty
//Postcondition: adds one card to the hand array
function deal(deck, hand, id, show) {
    if (deck.length < 1) return;

    if (blackjackCalculateValue(hand) < 21) {
        hand.push(deck.pop());
        loadImage(hand, hand.length - 1, id, show);
        if (blackjackCalculateValue(hand) > 21) { alert("Game Over"); }
        if (blackjackCalculateValue(hand) == 21) alert("You have 21!");
    }

}

function blackjackCalculateValue(hand) {
    var sum = 0;
    var aces = 0;
    
    for (var i = 0; i < hand.length; i++) {
        if (hand[i][0] == 'J' || hand[i][0] == 'Q' || hand[i][0] == 'K')
            sum += 10;
        else if (hand[i][0] == 'A') {
            sum += 11; aces++;
        } else sum += hand[i][0];
    }

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    
    return sum;

}
function blackjackAI(deck, hand) {

}


function driverBlackjack() {
    //setTimeout(() => { document.getElementById("actionText").innerHTML = 'Welcome to the game! Currently dealing...'; }, 750);
    var testDeck = createDeck();
    shuffle(testDeck);

    //create hands for the players
    var hand1 = dealHand(testDeck, 2);
    var hand2 = dealHand(testDeck,2);
    var hand3 = dealHand(testDeck,2);
    var player = dealHand(testDeck, 2);

    //assign onclick event to the Hit button
    document.getElementById('dealButton').onclick = function () {
        deal(testDeck, player, 'playerHand', true);
    }

    //show images as they are being dealed
    setTimeout(() => { loadHandImages(hand1, "p1Hand", false); }, 1500);
    setTimeout(() => { loadHandImages(hand2, "p2Hand", false); }, 2000);
    setTimeout(() => { loadHandImages(hand3, "p3Hand", false); }, 2500);
    setTimeout(() => { loadHandImages(player, "playerHand", true); }, 3000);
    setTimeout(() => { document.getElementById("actionText").innerHTML += "<br />" +"The game has started. Good luck."; }, 3000);

   
}