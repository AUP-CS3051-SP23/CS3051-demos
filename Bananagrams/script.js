// This cookies constant needs to be here and in server.js
const cookies = {
    playerid: "pid",
    drag: "drag"
}

let playerName = "";
let playerID = 0;
let gameName = "";
let gameID = 0;
let playerState = 0;
let updateInterval = null;
let updateFrequency = 3;
let useDragAndDrop = false;
let freeze = false;

window.onload = function () {
    useDragAndDrop = readCookie(cookies.drag) == "true";
    document.querySelector("#usedrag").checked = useDragAndDrop;
    const c = readCookie(cookies.playerid);
    const currentplayer = document.querySelector("#currentplayer");
    if (c.length > 0) {
        playerName = c.split("|")[1];
        currentplayer.innerHTML =
            `Click here to play as <span id='pn'>${playerName}</span>` +
            "<br>or enter a new name:<br>";
        playerID = c.split("|")[0];
    } else {
        currentplayer.style.display = "none";
    }
}

function playAs() {
    if (playerID > 0) {
        playerchoice.style.display = "none";
        document.querySelector("#player").innerHTML =
            `- ${playerName}`;
        fetch("/listGames", {
        })
            .then((response) => { return response.json(); })
            .then((data) => {
                const games = document.querySelector("#games");
                let s = "";
                for (let d in data) {
                    s += `<li onclick="joinGame(${data[d].game_id}, '${data[d].game_name}')">${data[d].game_name}</li>\n`;
                }
                games.innerHTML = s;
                document.querySelector("#gamechoice").style.display = "block";
            });
    } else {
        alert("No player identified");
    }
}

function newPlayer() {
    const playername = document.querySelector("#playername").value;
    if (playername.length < 1) {
        alert("Please enter a player name");
        return;
    }
    fetch("/newPlayer", {
        method: 'POST', // POST puts args in body
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pn: playername })
    })
        .then((response) => {
            if (response.ok) {
                playerID = readCookie(cookies.playerid).split("|")[0];
                playerName = readCookie(cookies.playerid).split("|")[1];
                playAs();
            }
        });
}

function newGame() {
    const gamename = document.querySelector("#gamename").value;
    if (gamename.length < 1) {
        alert("Please enter a game name");
        return;
    }
    fetch("/newGame", {
        method: 'POST', // POST puts args in body
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gn: gamename })
    })
        .then((response) => {
            if (!response.ok) {
                alert("Problem creating game");
            } else {
                return response.json();
            }
        }).then((response) => {
            joinGame(response.gid, gamename);
        });
}

function joinGame(gameid, gamename) {
    fetch("/joinGame", {
        method: 'POST', // POST puts args in body
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gid: gameid })
    })
        .then((response) => {
            if (response.ok) {
                document.querySelector("#introscreen").style.display = "none";
                document.querySelector("#gamecontainer").style.display = "block";
                gameID = gameid;
                gameName = gamename;
                document.querySelector("#gname").innerHTML = gameName;
                document.querySelector("#pname").innerHTML = playerName;
                restartPlay();
            }
        });
}

function restartPlay() {
    playerState = 0;
    removeTiles();
    startUpdates();
}

function peel() {
    fetch("/peel", {
        method: 'POST', // POST puts args in body
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gid: gameID, pgs: playerState })
    })
        .catch((error) => console.error("Error in peel", error))
        .then((response) => response.json())
        .then((data) => {
            if (data.peelblocked) {
                alert("Someone else peeled first!");
            }
            getUpdate();
        });
}

function getTiles(n) {
    fetch("/getNewTiles", {
        method: 'POST', // POST puts args in body
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gid: gameID, n: n })
    })
        .then((response) => {
            if (!response.ok) {
                return Promise.reject();
            }
            return response.json();
        })
        .then((data) => {
            addTiles(data);
        })
        .catch((error) => {
            console.error("Error in getTiles", error);
        });
}

function addTiles(tiles, loadTiles = false, otherplayer = false) {
    if (tiles.length == 0) {
        return;
    }
    const hand = document.querySelector("#hand");
    for (let t = 0; t < tiles.length; t++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.innerHTML = tiles[t].letter.toUpperCase();
        tile.id = 't' + tiles[t].tile_id;
        tile.style.left = "";
        tile.style.top = "";
        hand.appendChild(tile);
        // New tiles go into the hand
        if (loadTiles) {
            // does the tile go on the board?
            if (tiles[t].status == 2) {
                placeTileOnBoard(tile, tiles[t].x, tiles[t].y);
            }
        }
        if (!otherplayer) {
            tile.addEventListener("click", moveTile);
            tile.addEventListener("mousedown", startTileDrag);
            if (!loadTiles) {
                flashTile(tile);
            }
        }
    }
    if (loadTiles && !otherplayer) {
        notDoneYet(null);
    } else {
        notDoneYet(true);
    }
}

function notDoneYet(notDone) {
    if (notDone == null) {
        notDone = !isSingleIsland();
    }
    document.querySelector("#peel").disabled = notDone;
    document.querySelector("#bananas").disabled = notDone;
}

function flashTile(tile) {
    function doFlash(n) {
        if (n > 0) {
            setTimeout(() => {
                tile.classList.add("tile-new");
                setTimeout(() => {
                    tile.classList.remove("tile-new");
                    doFlash(n - 1);
                }, 100);
            }, 100);
        }
    }
    doFlash(10);
}

function setDrag() {
    const checkbox = document.querySelector("#usedrag");
    useDragAndDrop = checkbox.checked;
    setCookie(cookies.drag, useDragAndDrop);
}

let tileToMove = null;
function moveTile(e) {
    if (useDragAndDrop || freeze) {
        return;
    }
    e.stopPropagation();
    if (tileToMove) {  // unselect previous tile
        tileToMove.classList.toggle("tile-selected");
        tileToMove.addEventListener("click", moveTile);
    }
    tileToMove = e.target;
    tileToMove.classList.toggle("tile-selected");
    tileToMove.removeEventListener("click", moveTile);
    document.querySelector("#board").addEventListener("click", placeTile);
    document.querySelector("#hand").addEventListener("click", placeTile);
    document.querySelector("#dump").addEventListener("click", placeTile);
}

function placeTile(e) {
    e.stopPropagation();
    let hand = document.querySelector("#hand");
    let board = document.querySelector("#board");
    hand.removeEventListener("click", placeTile);
    board.removeEventListener("click", placeTile);
    document.querySelector("#dump").removeEventListener("click", placeTile);
    dropTile(tileToMove, e.target.id, e.clientX, e.clientY);
    tileToMove.addEventListener("click", moveTile);
    tileToMove.classList.toggle("tile-selected");
    tileToMove = null;
}

function dropTile(tile, place, x, y) {
    switch (place) {
        case "dump":
            fetch("/dump", {
                method: 'POST', // POST puts args in body
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gid: gameID, tid: tile.id.slice(1) })
            })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject();
                    }
                    return response.json();
                })
                .then((data) => {
                    tile.remove();
                    addTiles(data.tiles);
                })
                .catch((error) => {
                    console.error("Error in dumpTiles", error);
                });
            break;
        case "hand":
            tile.style.position = "";
            hand.appendChild(tile);
            tile.style.left = "";
            tile.style.top = "";
            recordTilePosition(tile);
            notDoneYet(true);
            break;
        case "board":
            const bb = board.getBoundingClientRect();
            const wcs = window.getComputedStyle(document.documentElement)
            let tilesize = wcs.getPropertyValue('--tilesize');
            tilesize = parseInt(tilesize);
            const gridsize = parseInt(wcs.getPropertyValue('--gridsize'));
            tx = Math.floor((x - bb.left) / gridsize) * gridsize;
            ty = Math.floor((y - bb.top) / gridsize) * gridsize;
            placeTileOnBoard(tile, tx, ty);
            recordTilePosition(tile);
            notDoneYet(null);
    }
}

let tileX0;
let tileY0;
let left0;
let top0;
let tileWasIn;
function startTileDrag(e) {
    if (!useDragAndDrop || freeze) {
        return;
    }
    e.stopPropagation();
    if (tileToMove) {  // unselect previous tile
        tileToMove.classList.toggle("tile-selected");
        tileToMove.addEventListener("mousemove", dragTile);
    }
    tileToMove = e.target;
    tileWasIn = tileToMove.parentElement.id;
    const br = tileToMove.getBoundingClientRect()
    tileX0 = e.clientX - br.left;
    tileY0 = e.clientY - br.top;
    left0 = e.clientX;
    top0 = e.clientY;
    tileToMove.style.left = (e.clientX - tileX0) + "px";
    tileToMove.style.top = (e.clientY - tileY0) + "px";
    tileToMove.style.position = "fixed";
    tileToMove.classList.toggle("tile-selected");
    tileToMove.removeEventListener("mousedown", moveTile);
    document.addEventListener("mousemove", dragTile);
    document.addEventListener("mouseup", endTileDrag);
}

function dragTile(e) {
    e.stopPropagation();
    if (tileToMove) {
        tileToMove.style.left = (e.clientX - tileX0) + "px";
        tileToMove.style.top = (e.clientY - tileY0) + "px";
    }
}

function endTileDrag(e) {   // drop tile
    e.stopPropagation();
    if (tileToMove) {
        tileToMove.classList.toggle("tile-selected");
        tileToMove.addEventListener("mousedown", moveTile);
        let target = "";
        let x = e.clientX;
        let y = e.clientY;
        let elems = document.elementsFromPoint(x, y);
        for (i = 0; i < elems.length; i++) {
            switch (elems[i].id) {
                case "dump":
                    target = "dump";
                    break;
                case "board":
                    target = "board";
                    break;
                case "hand":
                    target = "hand";
                    break;
                default:
                    if (elems[i].id != tileToMove.id &&
                        elems[i].classList.contains("tile") &&
                        elems[i].parentElement.id == "board") {

                        target = tileWasIn;
                        x = left0;
                        y = top0;
                        i = elems.length;  // break out of loop
                    }
            }
        }
        dropTile(tileToMove, target, x, y);
        tileToMove = null;
        tileWasIn = null;
    }
    document.removeEventListener("mousemove", dragTile);
    document.removeEventListener("mouseup", endTileDrag);
}

function placeTileOnBoard(tile, x, y) {
    const board = document.querySelector("#board");
    board.appendChild(tile);
    tile.style.position = "absolute";
    let tx = x;
    let ty = y;
    tile.style.left = tx + "px";
    tile.style.top = ty + "px";
    // ToDo: check if there is a tile already in that position
    // return true if yes, false if no
}

function split() {
    fetch("/split", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gid: gameID })
    })
        .then((response) => {
            if (!response.ok) {
                return Promise.reject();
            }
            restartPlay();
            getUpdate();
            return;
        });
}

function getUpdate() {
    fetch("/update", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gid: gameID, pgs: playerState })
    })
        .catch((error) => console.error("Error in update", error))
        .then((response) => response.json())
        .then((data) => {
            if (data.winner) {
                alert(data.winner + " called BANANA!");
                stopUpdates();
                freeze = true;
            } else {
                if (data.split) {
                    restartPlay();
                }
                playerState = data.gs;
                addTiles(data.tiles);
                if (data.players && data.players.length > 0) {
                    listPlayers(data.players);
                }
            }
        });
}

function listPlayers(players) {
    const pl = document.querySelector("#players");
    pl.innerHTML = "";
    for (i = 0; i < players.length; i++) {
        const p = document.createElement("div");
        p.innerHTML = players[i].player_name;
        p.dataset.pid = players[i].player_id;
        pl.appendChild(p);
        p.addEventListener("click", loadPlayerBoard);
    }
}

function loadPlayerBoard(e) {
    const pid = e.target.dataset.pid;
    fetch("/playerboard", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gid: gameID, pid: Number(pid) })
    })
        .catch((error) => console.error("Error in update", error))
        .then((response) => response.json())
        .then((data) => {
            removeTiles();
            addTiles(data.tiles, true, pid != playerID);
            if (pid == playerID) {
                startUpdates();
            } else {
                stopUpdates();
            }
        });
}

function isSingleIsland() {
    // check if the board is a single island
    // returns true if it is, false otherwise
    if (document.querySelectorAll("#hand .tile").length > 0) {
        return false;
    }
    const wcs = window.getComputedStyle(document.documentElement)
    const gridsize = parseInt(wcs.getPropertyValue('--gridsize'));
    const tiles = document.querySelectorAll(".tile");
    if (tiles.length === 0) {
        return false;
    }
    for (let t = 0; t < tiles.length; t++) {
        tiles[t].dataset.visited = 0;
    }

    function walktiles(tile) {
        // walk the board starting from tile
        // return true if all tiles are visited, false otherwise
        tile.dataset.visited = 1;
        const tx = parseInt(tile.style.left);
        const ty = parseInt(tile.style.top);
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i].dataset.visited == '0') {
                const ix = parseInt(tiles[i].style.left);
                const iy = parseInt(tiles[i].style.top);
                // tile to the right
                if ((tx + gridsize) === ix && ty === iy) {
                    walktiles(tiles[i]);
                }
                // tile to the bottom
                if ((ty + gridsize) === iy && tx === ix) {
                    walktiles(tiles[i]);
                }
                // tile to the left
                if ((tx - gridsize) === ix && ty === iy) {
                    walktiles(tiles[i]);
                }
                // tile to the top
                if ((ty - gridsize) === iy && tx === ix) {
                    walktiles(tiles[i]);
                }
            }
        }
    }

    walktiles(tiles[0]);

    let rvalue = true;
    for (let t = 0; t < tiles.length; t++) {
        if (tiles[t].dataset.visited == '0') {
            rvalue = false;
        }
        tiles[t].dataset.visited = 0;
    }
    return rvalue;
}

function recordTilePosition(tile) {
    const pid = tile.parentElement.id;
    if (pid == "board" || pid == "hand") {
        fetch("/recordTilePosition", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tid: tile.id.slice(1),
                x: isNaN(parseInt(tile.style.left)) ? null : parseInt(tile.style.left),
                y: isNaN(parseInt(tile.style.top)) ? null : parseInt(tile.style.top),
                status: pid
            })
        });
    }
}

function removeTiles() {
    for (let t of document.querySelectorAll(".tile")) {
        t.remove();
    }
}

function bananas() {
    fetch("/bananas", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gid: gameID })
    });
}

function startUpdates() {
    if (updateInterval == null) {
        updateInterval = setInterval(getUpdate, updateFrequency * 1000);
    }
}

function stopUpdates() {
    clearInterval(updateInterval);
    updateInterval = null;
}

function clearDB() {
    fetch("/clearDB");
    document.querySelector("#currentplayer").innerHTML = "";
    setCookie(cookies.playerid, "");
    playerID = 0;
}

/* Cookie functions */

function setCookie(cname, cvalue) {
    // set a session cookie
    if (cvalue === undefined) {
        console.error("stqC.setCookie value for", name, "is undefined");
        return;
    }
    document.cookie = cname + "=" + cvalue + ";path=/"; // path=/ means cookie is valid for all pages
}

// Read cookies
// from http://stackoverflow.com/questions/5639346/
function readCookie(name) {
    let c = "";
    let b = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    if (b) {
        c = b.pop();
        if (typeof c === "undefined") { c = ""; }
    }
    return c;
}
