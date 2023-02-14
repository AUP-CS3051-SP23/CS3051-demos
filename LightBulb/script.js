function doSomething() {
    let b = document.querySelector("button");

    if (b.innerText === "Switch Off") {
        // turn off
        b.innerText = "Switch On";
        document.querySelector("#bulb").src = "off.png";
    } else {
        b.innerText = "Switch Off";
        document.querySelector("#bulb").src = "on.png";
    }
}
