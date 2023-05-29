const letterDist = {
    a: 4, b: 4, c: 4, d: 1, e: 3
}
function freshTileSQL(gameId) {
    let s = "INSERT INTO tiles ('tile_id', 'game_id', 'letter', 'status') VALUES ";
    let tilenum = 0; // tile_id is the game_id plus the timenum to prevent conflicts across games
    for (const l of Object.keys(letterDist)) {
        for (let i = 0; i < Number(letterDist[l]); i++) {
            s += `(${tilenum}, ${gameId}, '${l}', 0),`;
            tilenum++;
        }
    }
    if (tilenum < 1) {
        return "";
    }
    return s.slice(0, -1); // remove the trailing comma
}

console.log(freshTileSQL(10));