const express = require('express'); //Set up the express module
const app = express();
const port = 8080;

const path = require('path') // bring in the path module to help locate files

// You need the body-parser package to help parse the body of a POST request
const bodyParser = require('body-parser'); // this pulls in body-parser
app.use(bodyParser.json());  // this tells the server to look for JSON requests

const { type } = require('os');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const sqlite3 = require('sqlite3').verbose();  // verbose() gives you better error codes. Remove when done debugging
// Open a new database connection to the database file
let db = new sqlite3.Database('games.db', function (error) {
    if (error) {
        console.error(err.message);
        return {};
    }
});

app.use(express.static("."));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// This cookies constant needs to be here and in script.js
const cookies = {
    playerid: "pid"
}

const defaultHandSize = 21;
const maxTiles = 1000; // max allowable tiles in a game

app.post('/newPlayer', function (req, res) {
    // pass in {pn: playername}
    // sets player cookie and returns confirmation
    newPlayer(req, res);
});

app.post('/newGame', function (req, res) {
    // pass in {gn: gamename}
    // return {gid: gameid}
    let gamename = req.body.gn;
    if (gamename.length < 1) {
        res.status(404).send("No game name provided");
    }
    newGame(gamename)
        .then((gameid) => {
            res.json({ gid: gameid });
        })
        .catch((err) => {
            res.status(500).send("DB error on newGame: " + err);
        });
});

app.get('/listGames', function (req, res) {
    // return [{game_id: gameid, game_name: gamename}, ...]
    db.all("SELECT game_id, game_name FROM games", (err, rows) => {
        if (err) {
            res.status(500).send("DB error on listGames: " + err);
        } else {
            res.json(rows);
        }
    });
});

app.post('/joinGame', function (req, res) {
    // pass in {gid: gameid}
    // return {confirmation in return code}
    let gameid = req.body.gid;
    db.run("UPDATE players SET game_id = ? WHERE player_id = ?", [gameid, playerID(req)], (err, data) => {
        if (err) {
            res.status(500).send("DB error on joinGame: " + err);
        } else {
            res.end();
        }
    });
});

app.post('/update', function (req, res) {
    playerUpdate(req, res);
});

app.post('/split', function (req, res) {
    // pass in {gid: gameid}
    // return confirmation in return code
    resetGame(req.body.gid)
        .then(() => {
            res.end();
        });
});

app.post('/getNewTiles', function (req, res) {
    // pass in {gid: gameid, n: number of tiles}
    // if game is running,
    // if enough tiles, return an array of {tileid: t, letter: l}
    // else return {}
    let gameid = req.body.gid;
    let n = req.body.n;
    if (n < 1) {
        n = defaultHandSize;
    }
    getNewTiles(gameid, playerID(req), n)
        .then((tiles) => {
            res.json(tiles);
        })
        .catch((err) => {
            res.status(500).send("DB error on getNewHand: " + err);
        });
});

app.post('/recordTilePosition', function (req, res) {
    // pass in {tid: tileid, x: x, y: y, status: status}
    // status is one of: "hand", "board"
    // return confirmation in return code
    recordTilePosition(req, res);
});

app.post('/peel', function (req, res) {
    peel(req, res);
});

app.post('/dump', function (req, res) {
    // pass in {g: gameid, u: userid, t: tileid}
    // if at least 3 tiles available, return an array of 3 tiles [{tileid: t, letter: l}, ..., ...}
    // else return {}
    dump(req, res);
});

app.post('/playerboard', function (req, res) {
    playerboard(req, res);
});


app.post('/bananas', function (req, res) {
    // pass in {g: gameid, u: userid}
    // return confirmation in return code
    endGame(req, res);
});

app.get('/cleardb', function (req, res) {
    clearDB(req, res);
});


//************ db code *****************/

function newPlayer(req, res) {
    let playername = req.body.pn;
    if (playername.length < 1) {
        res.status(404).send("No player name provided");
    }
    // ToDo: check if player already exists

    // Find the max player_id in the database and add 1
    db.all("SELECT MAX(player_id) AS max FROM players", (err, rows) => {
        if (err) {
            res.status(500).send("DB error on newPlayer: " + err);
        } else {
            const pid = rows == null ? 1 : rows[0].max + 1;
            db.run("INSERT INTO players ('player_id', 'player_name') VALUES (?, ?)",
                [pid, playername], (err, data) => {
                    if (err) {
                        res.status(500).send("DB insert error:", + err);
                    } else {
                        // set the playerid cookie and return
                        let playercookie = `${pid.toString()}|${playername}`;
                        res.cookie(cookies.playerid, playercookie, { encode: String });
                        res.end();
                    }
                });
        }
    });
}

function newGame(game_name) {
    return new Promise((resolve, reject) => {
        // get the largest game id
        let newid = 0;
        db.all("SELECT MAX(game_id) AS max FROM games", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // console.log("Got", err, rows);
                if (rows != undefined) {
                    newid = rows[0].max + maxTiles; // leave room for maxTiles tiles per game
                }
                // create a new game
                db.run("INSERT INTO games (game_id, game_name, game_state, winner) VALUES (?, ?, ?, ?)",
                    [newid, game_name, 0, null], (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(newid);
                        }
                    });
            }
        });
    });
}

function resetGame(gameid) {
    let handsize = defaultHandSize;
    return new Promise((resolve, reject) => {
        db.run("UPDATE games SET game_state = ? WHERE game_id = ?", [handsize, gameid],
            (err, data) => {
                if (err) {
                    res.status(500).send("DB error on reset game: " + err);
                } else {
                    // reset the tiles of the game
                    resetTiles(gameid)
                        .then(() => { resolve(); });
                }
            });
    });
}

function dump(req, res) {
    let gameid = req.body.gid;
    let tileid = req.body.tid;
    db.run("UPDATE tiles SET status = 0, player_id=null WHERE tile_id = ?", tileid, (err, data) => {
        if (err) {
            res.status(500).send("DB error on dump: " + err);
        } else {
            getNewTiles(gameid, playerID(req), 3)
                .then((tiles) => {
                    res.json(tiles);
                })
                .catch((err) => {
                    res.status(500).send("DB error on dump: " + err);
                });
        }
    });
}

async function resetTiles(gameid) {
    if (gameid == undefined || gameid < 1) {
        return Promise.reject("Invalid game id");
    }
    return new Promise((resolve, reject) => {
        const sql = freshTileSQL(gameid);
        db.run(sql, (err, rows) => {
            if (err) {
                reject("FreshTiles: " + err);
            } else {
                resolve();
            }
        });
    });
}

const letterDist = {
    A: 13, B: 3, C: 3, D: 6, E: 18, F: 3, G: 4, H: 3, I: 12, J: 2, K: 2, L: 5, M: 3,
    N: 8, O: 11, P: 3, Q: 2, R: 9, S: 6, T: 9, U: 6, V: 3, W: 3, X: 2, Y: 3, Z: 2
}
function freshTileSQL(gameId) {
    let s = "REPLACE INTO tiles (tile_id, letter, status, x, y, player_id, game_id) VALUES ";
    let tilenum = gameId + 1; // tile_id is the game_id plus the timenum to prevent conflicts across games
    for (const l of Object.keys(letterDist)) {
        for (let i = 0; i < Number(letterDist[l]); i++) {
            s += `(${tilenum}, '${l}', 0, 0, 0, 0, ${gameId}),`;
            tilenum++;
        }
    }
    if (tilenum < 1) {
        return "";
    }
    // console.log(s.slice(0, -1));
    return s.slice(0, -1); // remove the trailing comma
}

function getNewTiles(gameid, playerid, n, getplayers = false) {
    return new Promise((resolve, reject) => {
        if (n < 1 || n >= maxTiles) {
            resolve([]);
            return;
        }
        // check if games is running (ignore for now)
        db.all("SELECT game_state FROM games WHERE game_id = ?", gameid, (err, rows) => {
            if (err) {
                reject("getNewTiles: " + err);
            }
            let fields = "";
            if (getplayers) {
                sql = ", x, y";
            }
            db.all("SELECT tile_id, letter" + sql + " FROM tiles WHERE game_id = ? AND status = 0 ORDER BY RANDOM() LIMIT ?",
                [gameid, n],
                (err, rows) => {
                    if (err) {
                        reject("getNewTiles: " + err);
                        return;
                    }
                    // are there enough tiles?
                    if (rows.length < n) {
                        resolve([]);
                        return
                    }
                    if (getplayers) {
                        db.all("SELECT player_id, player_name FROM players WHERE game_id = ?",
                            gameid, (err, players) => {
                                if (err) {
                                    reject("getNewTiles: " + err);
                                } else {
                                    assignTilesToPlayer(playerid, rows)
                                        .then(() => { resolve({ tiles: rows, players: players }) });
                                }
                            });
                    } else {
                        assignTilesToPlayer(playerid, rows)
                            .then(() => { resolve({ tiles: rows, players: [] }) });
                    }
                });
        });
    });
}

function assignTilesToPlayer(playerid, rows) {
    return new Promise((resolve, reject) => {
        let sql = "UPDATE tiles SET status = 1, player_id = ? WHERE tile_id IN (";
        for (const r of rows) {
            sql += `${r.tile_id},`;
        }
        sql = sql.slice(0, -1) + ")"; // remove the trailing comma
        db.run(sql, playerid, (err, data) => {
            if (err) {
                reject("assignPlayer: " + err);
            } else {
                resolve();
            }
        });
    });
}


function peel(req, res) {
    // pass in {g: gameid, pgs: playerGameState}
    // if userGameState matches current game state,
    //   increment the game state and return:
    //   {peelblocked: false}
    // else someone else peeled, so return:
    //   {peelblocked: true}

    let gameid = req.body.gid;
    let playerGameState = Number(req.body.pgs);
    if (playerGameState == null) {
        res.status(404).send("No user game state provided");
        return;
    }
    db.get("SELECT game_state, winner FROM games WHERE game_id = ?", gameid, (err, row) => {
        if (err) {
            res.status(500).send("DB error on peel: " + err);
        } else {
            if (row == null) {
                res.status(404).send(`Game ${gameid} not found`);
            } else if (row.winner != null) {
                db.get("SELECT player_name FROM players WHERE player_id = ?", row.winner, (err, row) => {
                    if (err) {
                        res.status(500).send("DB error on finding winner's name: " + err);
                    } else {
                        res.json({ winner: row.player_name });
                    }
                });
            } else {
                let gs = row.game_state;
                // console.log(`Peel: game ${gameid} user state ${playerGameState} db state ${gs}`);
                if (playerGameState == gs) {
                    db.run("UPDATE games SET game_state = game_state + 1 WHERE game_id = ?", gameid,
                        (err, data) => {
                            if (err) {
                                res.status(500).send("DB error on peel: " + err);
                            } else {
                                res.json({ peelblocked: false });
                            }
                        });
                } else {
                    res.json({ peelblocked: true });
                }
            }
        }
    });
}

function playerUpdate(req, res) {
    // pass in {gid: gameid, pid: playerid, pgs: playergamestate}
    // returns gamestate and any tiles the player has to peel
    // return {gs: gamestate, tiles: [{tileid: t, letter: l}, ...]}
    // return winner: playerid if there is a winner
    // return split: true if the this is the first draw for the player
    const gameid = req.body.gid;
    let playerGameState = Number(req.body.pgs);
    if (playerGameState == null) {
        res.status(404).send("No user game state provided");
        return;
    }
    db.get("SELECT game_state, winner FROM games WHERE game_id = ?", gameid, (err, row) => {
        if (err) {
            res.status(500).send("DB error on update: " + err);
        } else {
            if (row == null) {
                res.status(404).send(`Game ${gameid} not found`);
            } else if (row.game_state < 0) {
                res.json({ gs: 0, tiles: [] });
            } else if (row.winner != null) {
                db.get("SELECT player_name FROM players WHERE player_id = ?", row.winner, (err, row) => {
                    if (err) {
                        res.status(500).send("DB error on finding winner's name: " + err);
                    } else {
                        res.json({ winner: row.player_name });
                    }
                });
            } else {
                let gs = row.game_state;
                // console.log(`update: game:${gameid} player:${playerID(req)} player state:${playerGameState} game state:${gs}`);
                if (playerGameState < gs) {
                    getNewTiles(gameid, playerID(req), gs - playerGameState, playerGameState < 1)
                        .then((result) => {
                            let r = { gs: gs, tiles: result.tiles, players: result.players };
                            if (playerGameState < 1) { r.split = true };
                            res.json(r);
                        });
                } else {
                    res.json({ gs: gs, tiles: [] });
                }
            }
        }
    });
}

function playerboard(req, res) {
    const gameid = req.body.gid;
    const playerid = req.body.pid;
    db.all("SELECT tile_id, letter, x, y, status FROM tiles WHERE game_id = ? AND player_id = ?", [gameid, playerid],
        (err, rows) => {
            if (err) {
                res.status(500).send("DB error on playerboard: " + err);
            } else {
                res.json({ tiles: rows });
            }
        });
}

function recordTilePosition(req, res) {
    const tileid = req.body.tid;
    const status = req.body.status == "board" ? 2 : 1;
    const x = status > 1 ? req.body.x : null;
    const y = status > 1 ? req.body.y : null;
    db.run("UPDATE tiles SET x = ?, y = ?, status = ? WHERE tile_id = ?",
        [x, y, status, tileid], (err, data) => {
            if (err) {
                res.status(500).send("DB error on recordTilePosition: " + err);
            } else {
                res.end();
            }
        });
}

function endGame(req, res) {
    const gameid = req.body.gid;
    const playerid = playerID(req);
    db.run("UPDATE games SET winner=? WHERE game_id = ?", [playerid, gameid],
        (err, rows) => {
            if (err) {
                res.status(500).send("DB error on endGame: " + err);
            } else {
                res.end();
            }
        });
}

function clearDB(req, res) {
    db.run("DELETE FROM tiles", (err, data) => {
        if (err) {
            res.status(500).send("DB error on clearDB: " + err);
        } else {
            db.run("DELETE FROM games", (err, data) => {
                if (err) {
                    res.status(500).send("DB error on clearDB: " + err);
                } else {
                    db.run("DELETE FROM players", (err, data) => {
                        if (err) {
                            res.status(500).send("DB error on clearDB: " + err);
                        } else {
                            res.end();
                        }
                    });
                }
            });
        }
    });
}

function playerID(req) {
    return req.cookies[cookies.playerid].split("|")[0];
}

function playerName(req) {
    return req.cookies[cookies.playerid].split("|")[1];
}


// newGame("Mygame")
// resetTiles(2000)
//     .then(()=>{console.log("Done");})
//     .catch((err)=>{console.log("Failed", err)});

let server = app.listen(port, function () {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});
