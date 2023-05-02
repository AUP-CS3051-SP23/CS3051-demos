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
  - Tile table:\
  ```tile_id, state_of_tile, x, y, letter, player_id, game_id```
  - Player table:\
  ```player_id, player_name, game_id```
  - Games table:\
  ```game_id, game_name, open/closed, peel_count, winner_id```
  - NOTE: You will want to keep a copy of this in your browser javascript so you
  don't have to go to the database all the time. You can update the database
  when you need to, but you can also update the javascript copy when you need to.

**Get a new tile for a player:**
```sql
SELECT * FROM tiles WHERE game = game_for_player AND state_of_tile = in_bunch ORDER BY RAND() LIMIT 1;
/* you might represent in_bunch as 0 */
/* To get N tiles, change the LIMIT to N */
```

**How do you identify a player?**
  - By their unique ID stored in a cookie

**How do you know what player is in what game and what tiles are in which game?**
  - Each player has an associated game id (another method needs to be used if a player can be in multiple games at once, but let's not worry about that for now)

**How do you initialize tiles for a game?**
  - Create 144 new tiles in the database with the new game_id

**How do you know what games have been created, are running?**
  - Either
    - Games table : gamename, id
  - Or
    - Just look at the player table

**How can you determine if all tiles on the board are “connected”?**
  - Depth-first search on any tile, marking all connected
  - If any tiles are unmarked when done, then not all are connected.
  - Run this on "Peel" and "Banana"

**How do players get updates on the state of other players?**
  - Query the server at regular intervals: ``setInterval(getupdate, 10*1000)``
  - Keep a peel count for a game and update if your peel count is less than the game peel count
    - For example
      - Sophia clicks "Peel"
      - Server returns new tile to Sophia and updates the game peel count
      ```{count: 23, tile: {tileid: 2003, letter: "A"}}```
      - Sophia updates her peel count and adds the new tile to her hand
      - Paul's update interval triggers and he calls the server for an update with his current peel count
      - Server responds with the update object showing the current number of peels for that game (and if someone has called "Bananas")
        ```{count: 23, bananas: 0}```
      - Paul's own count is 21, so he knows he missed a two peels. He retrieves the number of tiles he needs and updates his peel count.

**What information do you need to draw any player’s board?**
  - Get the tile information from a specific player and call a fill-board function

**What server functions will you need to write?**
  - /newGame - create a new game and set of tiles
    - pass in the game name
    - return the game ID
  - /listGames - return a list of games
    - no arguments to pass in
    - return a list of game names and IDs
  - /newPlayer - add a player to the DB, return the player ID
    - pass in the player name
    - return the player ID
  - /joinGame - add a player to a game
    - pass in the player ID and the game ID
    - return confirmation (status 200)
  - /split - start a game (mark in the BD as in progress)
    - pass in the game ID
    - return confirmation (status 200)
  - /getNewHand - return 21 random tiles from a game to a player (optional)
    - pass in the player ID and the game ID
    - return an array of 21 tiles (tile_id, letter)
  - /getNewTiles - return N random tiles from a game to a player
    - pass in the player ID, the game ID, and the number of tiles needed
    - return a tile array\
    ```[{id: 2003, letter: "A"}, {id: 2014, letter: "D"}, ...]```
  - /placeTile - set the x, y, and status of a tile in the DB
    - pass in the tile ID, the x, the y, and the status
    - return confirmation (status 200)
  - /peel - return a random tile from a game to a player, signal to all players that a peel has happened
    - pass in the player ID and the game ID
    - return a tile (tile_id, letter)
  - /dump - mark the given tile as back in the bunch and return 3 new random tiles to the player
    - pass in the player ID, the game ID, and the tile ID
    - return a list of 3 tiles (tile_id, letter)
  - /getUpdate - return the current game state
    - pass in the player ID, the game ID
    - return the game state (peel count, bananas). If someone has called bananas, return the "winners" player ID so that the client can request the winners board.
  - /bananas - end the game, show the "winners" board
    - pass in the player ID and the game ID
    - return confirmation (status 200)
  - /getBoard - get the board of any player
    - pass in the player ID and the game ID
    - return a list of tiles (tile_id, letter, x, y)


**How do I mark tiles?**
```html
<div class="tile">A</div>
```
```javascript
let tiles = document.querySelectAll(".tiles");
let letter = tiles[n].innerHTML;
let xpos = tiles[n].style.left;
tiles[n].marker = true; or use setAttribute(), getAttribute()
let marked = document.querySelectAll(".tiles [marked=true]");
```