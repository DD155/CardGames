/*
######################################################################################################################
                                                    CLASSES
######################################################################################################################
*/

class Player {
    constructor(health, atk, name, blackJackHand) {
        this.name = name;
        this.health = health;
        this.atk = atk;
        this.bust = false;
        this.split = false;
        this.blackJackHand = blackJackHand;
        this.hand = [];
    }

    set changeHealth(value) {
        this.health = value;
    }

    set changeBust(value) {
        this.bust = value;
    }

    //Precondition: Hand must not be empty
    //Postcondition: Returns the amount of points the current hand is worth
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

    deal(deck, id, show) {
        if (deck.length < 1) return;

        if (this.points() < 21) { //check if you can get another card
            this.blackJackHand.push(deck.pop());
            loadImage(this.blackJackHand, this.blackJackHand.length - 1, id, show);
            document.getElementById("actionText").innerHTML += "<br />" + this.name + " hit.";
            if (this.points() > 21) { // player busts
                document.getElementById("actionText").innerHTML += "<br />" + this.name + " busted!";
                this.changeBust = true;
                setTimeout(() => { removeHandImgs(id); }, 2000);
            }
        }

        updateScroll();
    }
}

class Enemy extends Player {
    constructor(health, atk, name, blackJackHand) {
        super(health, atk, name, blackJackHand);
    }

    //Precondition: Change bust value to true and take damage from busting.
    enemyBust() {
        var dmg = (super.points() - 21);
        super.changeBust = true;
        super.changeHealth = (this.health - dmg); //lose health based on how much they were from 21
        document.getElementById("enemyHP").innerHTML = this.health;
        document.getElementById("actionText").innerHTML += '<br />' + this.name + " took " + dmg + " damage.";
    }

    enemyDeal(deck) {
        //reveal the hand
        removeHandImgs("enemyHand");
        loadHandImages(this.blackJackHand, 'enemyHand', true);
        document.getElementById("actionText").innerHTML += '<br />' + this.name + " reveals their hand.";

        if (super.points() > 21) { // logic for if the dealer busts
            document.getElementById("actionText").innerHTML += '<br />' + this.name + " busted!";
            this.enemyBust();
            return;
        }

        //hit
        if (super.points() >= 17) return; //dealer MUST stand if total is 17 or higher
        else {
            while (super.points() < 17) {//keep hitting until 17 or higher
                super.deal(deck, 'enemyHand', true);
            }

            //check again after dealing
            if (super.points() > 21) {
                this.enemyBust();
            }
        }
        updateScroll();
    }

}


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

    //create the player and the enemy
    var player = new Player(30, 5, "Player", dealHand(deck, 2));
    var enemy = new Enemy(45, 3, "Skeleton", dealHand(deck, 2));

    //set text 
    document.getElementById('enemyHP').innerHTML = enemy.health;
    document.getElementById('enemyName').innerHTML = enemy.name;
    document.getElementById('playerName').innerHTML = player.name;

    //show images as they are being dealed, left to right from dealer view
    setTimeout(() => { loadImage(enemy.blackJackHand, 0, "enemyHand", true); }, 1500);
    setTimeout(() => { loadHandImages(player.blackJackHand, "playerHandBJ", true); }, 2500);
    //dealer has card face down
    setTimeout(() => { loadImage(enemy.blackJackHand, 1, "enemyHand", false); }, 3500);
    setTimeout(() => { document.getElementById("actionText").innerHTML += "<br />" + "The game has started. Good luck."; }, 3500);

    //assign onclick event to the Hit button
    document.getElementById('hitButton').onclick = function () {
        //case when split is available
        //if (isSplit && !player.bust) deal(deck, player, 'playerHandSplit', true);
        //else if (isSplit && player.bust) deal(deck, player, 'playerHandBJ', true);
        //else deal(deck, player, true, true);

        player.deal(deck, 'playerHandBJ', true);

        if (player.bust) {
            document.getElementById('hitButton').disabled = true;
            document.getElementById('standButton').disabled = true;
        } else
            checkSplit(player.blackJackHand, true);
    }

    //assign onclick to Stand button
    document.getElementById('standButton').onclick = function () {
        var text = document.getElementById("actionText");
        text.innerHTML += "<br />" + "Player (You) stands.";

        enemy.enemyDeal(deck);

        var enemyDmg = Math.abs(Math.floor((0.4 * (21 - enemy.points()) + enemy.atk)));
        var playerDmg = Math.abs(Math.floor((0.4 * (21 - player.points()) + player.atk)));

        //case for taking damage
        if (enemy.points() > player.points() && !enemy.bust) { // enemy attacks
            player.changeHealth = player.health - enemyDmg;
            document.getElementById("playerHP").innerHTML = player.health;
            document.getElementById("actionText").innerHTML += "<br />" + "You were attacked for " + enemyDmg + " damage."
        } else if (player.points() > enemy.points() && !player.bust) { //case where you attack
            enemy.changeHealth = enemy.health - playerDmg;
            document.getElementById("enemyHP").innerHTML = enemy.health;
            document.getElementById("actionText").innerHTML += "<br />" + "You attacked for " + playerDmg + " damage."
        } else if (player.points() == enemy.points()) { //case where hands are equal
            document.getElementById("actionText").innerHTML += "<br />" + "You and the enemy were equally matched!"
        }

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