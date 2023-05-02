

let letterDist = {
    a: 3,
    b: 4,
    c: 2
}

let index = 1000;
for (let letter of Object.keys(letterDist)) {
    console.log(letter, letterDist[letter]);
    for (let l=0; l<letterDist[letter]; l++) {
        console.log(index, letter);
        index++
    }
}