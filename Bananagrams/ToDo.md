** ToDo **

- Refreshing the player list on update (put the playerid into the player list in parentheses)
- Check to see if a player is in a game already
- When rejoining a game, load the players tiles if the player is already in the game
  - Button to rejoin a game
- Dropping tile in a crack doesn't catch the tile underneath
  - put a test into the DropTile function
- Put gameid into a cookie
- Remove games that have been inactive for a while and are finished or no players
- Remove players that have no games

- Don't allow dragging a tile off the possible target areas
- Make some DB actions automatic
  - GetTiles (get tile and assign to player atomically)
- Switch for clicking tiles to move or dragging tiles (for demo purposes)
- Check that gameID is valid before using it in db calls
- When arriving at the base URL.
  - If the user has a name and game in cookies, ask if they want to rejoin it.
    - When rejoining a game, load the players tiles
  - If they have a name in cookies, ask if they want to use it or create a new one.
  - If no game cookie, ask if they want to create a new game or join an existing game.
    - If the cookie'd user id no longer exists, then create a new user with that name.
  - When creating a new game, provide a game code (URL) so others can join.
    - When joining a game through a URL, ask for the players name (as above)
    - Put the game URL in the location bar when joining a game, so page refresh works


Unwind recursive function to check for a single island
    // This function can be unwound with a loop using two arrays.
    // The first array is the tiles to be visited, the second array
    // is the tiles that have been visited.
    // The visited array is initialized with the first tile.
    // The tobevisited array is initialized with the rest of the tiles
    // on the board.
    // For each tile in the visited array, move all adjacent tiles from
    // the tobevisited array to the visited array and remove the tile from
    // the visited array. Repeat until either array is empty.
    // If the tobevisited array is not empty, the board is not a single island.
