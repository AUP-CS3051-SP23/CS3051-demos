let code = "";
let key = "213";

// This is the function that will be called when the user clicks a button
function press(val) {
    code += `${val}`;
    for (let i = 0; i < code.length; i++) {
        if (code[i] != key[i]) {
            code = `${val}`;
            break;
        }
    }
    door(code == key);
}

function door(open) {
    let b = document.querySelector("#bulb");
    let btns = document.querySelectorAll("button");
    if (open) {
        b.src = "open.jpg";
        for (let i = 0; i < btns.length; i++) {
            btns[i].style.backgroundColor = '#7F7';
        }
        setTimeout(()=>{door(false)}, 5 * 1000);
    } else {
        b.src = "closed.jpg";
        for (let i = 0; i < btns.length; i++) {
            btns[i].style.backgroundColor = '';
        }
    }
}