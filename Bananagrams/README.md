**What CSS and Javascript do you need to position tiles?**
  - Fixed position in the central portion of a CSS grid

**What is a way to represent a tile?**
- `<button is="tile23" class="tile">X</button>`,
- or `<div id="tile23">X</div>`
- Autogenerate the tile ids - tile1 to tile144, or tile0 to tile143
- CSS for the tile:
```css
html {
    --tilesize: 10px;
}
.tile {
    width: var(--tilesize);
    height: var(--tilesize);
    position: relative;  /* relative to the board ... an area in a grid */
}
```
```javascript
let tilesize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tilesize"));
```

**What code do you need to move tiles?**
```javascript
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


**What does your board look like?**
 - A space in a CSS Grid
 - An arrangement of `<div>`s in a grid

**Where are the different buttons?**
 - Split, Peel, Dump, Bananas

**Where is the player’s “hand” vs. the board?**
  - Above the board, to the side of the board, or below the board?

**How do you tell if a tile is in the bunch, a player’s hand (and which player), or on the board (and which player’s board)?**
  - Keep a field in the database or code it into "special" x,y coordinates

**What do you need to keep in the database?**
  - Tile table: state of the tile, x, y, letter, player_id, game_id
  - Player table: player_id, player_name, game_id
  - Games table: game_id, game_name, open/closed
  - NOTE: You will want to keep a copy of this in your browser javascript so you
  don't have to go to the database all the time. You can update the database
  when you need to, but you can also update the javascript copy when you need to.

**Get a new tile for a player:**
```sql
SELECT * FROM tiles WHERE game = game_for_player AND state_of_tile = in_bag;
```

**How do you identify a player?**
  - By their unique ID stored in a cookie

**How do you know what player is in what game and what tiles are in which game?**
  - Each player has an associated game id (another method needs to be used if a player can be in multiple games at once, but let's not worry about that for now)

**How do you initialize tiles for a game?**
Create 144 new tiles in the database with the new game_id

**How do you know what games have been created, are running?**
  - Either
    - Games table : gamename, id
  - Or
    - Just look at the player table

**How can you determine if all tiles on the board are “connected”?**
  - Depth-first searh on any tile, marking all connected
  - If any tiles are unmarked when done, then not all are connected.
  - Run this on "Peel" and "Banana"

**How do players get updates on the state of other players?**
  - Query the server at regular intervals: ``setInterval(getupdate, 10*1000)``
  - Keep a game "version" number and update if your version number is less than the game "version" number
    - For example
      - Sophia clicks "Peel"
      - Server returns new tile to Sophia and updates the game version  
      ```{version: 23, update: {peel:true, bananas: false}}```
      - Paul's interval triggers and he calls the server for an update and sends his version
      - Server respons with the update object  
        ```{version: 23, update: {peel:true, bananas: false}, newtile: {letter:"D", id:23423}}```
      - Paul is on version 22, and sees a peel. Paul requests a new tile.
      - **Alternatively**, send back the number of peels Paul missed (for example, if Paul was on version 21)

**What information do you need to draw any player’s board?**
  - Get the tile information from a specific player and call a fill-board function

**What functions will you need to write?**
  - For example: createNewGame() which calls createBunchofTiles()
