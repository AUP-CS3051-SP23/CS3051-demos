What CSS and Javascript do you need to position tiles?
  - Fixed position in the central portion of a CSS grid

What is a way to represent a tile?
- `<button is="tile23" class="tile">X</button>`,
- or `<div id="tile23">X</div>`
- Autogenerate the tile ids - tile1 to tile144, or tile0 to tile143
- CSS for the tile:
```
html {
    --tilesize: 10px;
}
.tile {
    width: var(--tilesize);
    height: var(--tilesize);
    position: relative;  /* relative to the board ... an area in a grid */
}
let tilesize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tilesize"));
```

What code do you need to move tiles?
```
for (let t=0; t<144; t++) {
    t.addEventListener("click", movetile);
}

function movetile(event) {
    let tile = event.target;
    // look for the next click
    // get mouse position of that click from the event
    let mx = event.clientX;
    let my = event.clientY;
    tile.style.left = Math.floor(mx / tilesize) * tilesize;
}
```
Alternative
 - Make a grid of divs in a grid arrangement as the board
and a line of divs for you "hand"
 - and just set the right div to the right letter
 - To move, I click on a board or a hand position,
   get the div I clicked on,
 - If there's a letter there then click on a new point on the board,
   get that div and set that `innerHTML` to the letter,
- (Optional: set a class that makes a div look like a tile
or look like an empty spot on the board)


What does your board look like?
 - a space in a CSS Grid
 - An arrangement of `<div>`s in a grid

Where are the different buttons?
 - Split, Peel, Dump, Bananas

Where is the player’s “hand” vs. the board?

How do you tell if a tile is in the bunch, a player’s hand (and which player), or on the board (and which player’s board)?

What do you need to keep in the database?

How do you identify a player?

How do you know what player is in what game and what tiles are in which game?

How do you initialize tiles for a game?

How do you know what games have been created, are running?

How can you determine if all tiles on the board are “connected”?

How do players get updates on the state of other players?

What information do you need to draw any player’s board?

What functions will you write?

For example: createNewGame() which calls createBunchofTiles()
