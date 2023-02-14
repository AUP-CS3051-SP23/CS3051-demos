let fox = document.querySelector("#fox");
let chicken = document.querySelector("#chicken");
let corn = document.querySelector("#corn");
let boat = document.querySelector("#boat");
let boatPassenger = document.querySelector("#boatPassenger");
let east = document.querySelector("#east");
let west = document.querySelector("#west");
let message = document.querySelector("#message");

let passengers = [fox, chicken, corn];
for (let i = 0; i < passengers.length; i++) {
    passengers[i].addEventListener("click", function () {
        putInBoat(passengers[i]);
    });
}

function whichBank() {
    let bank = west;
    if (parseFloat(boat.style.left) > 50) {
        bank = east;
    }
    return bank;
}

function putInBoat(object) {
    if (object == null) {
        return;
    }
    let bank = whichBank();
    let where = object.parentElement;
    if (where === boatPassenger) {
        bank.appendChild(object);
    } else {
        if (where === bank) {
            if (boatPassenger.childElementCount > 0) {
                putInBoat(boatPassenger.firstElementChild);
            }
            boatPassenger.appendChild(object);
        }
    }
}

function launchBoat() {
    let direction = "east";
    if (parseFloat(boat.style.left) > 50) {
        direction = "west";
    }
    rowBoat(direction);
}

function rowBoat(direction) {
    let position = parseFloat(boat.style.left);
    if (isNaN(position)) { position = 1; }
    if (direction == "east") {
        boat.style.left = position + 1 + "%";
        if (position > 70) {
            putInBoat(boatPassenger.firstElementChild);
            checkConflict(west);
            checkWin();
            return;
        }
    } else {
        boat.style.left = position - 1 + "%";
        if (position < 1) {
            putInBoat(boatPassenger.firstElementChild);
            checkConflict(east);
            return;
        }
    }

    setTimeout(()=>{rowBoat(direction)}, 10);
}

function checkConflict(bank) {
    let fox = bank.querySelector("#fox");
    let chicken = bank.querySelector("#chicken");
    let corn = bank.querySelector("#corn");
    if (fox != null && chicken != null) {
        message.innerHTML = "Fox eats chicken!";
        return true;
    }
    if (chicken != null && corn != null) {
        message.innerHTML = "Chicken eats corn!";
        return true;
    }
    return false;
}

function checkWin() {
    if (east.childElementCount == 3) {
        message.innerHTML = "You did it!";
    }
}