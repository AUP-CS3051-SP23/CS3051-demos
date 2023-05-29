CREATE TABLE tiles (
	tile_id INTEGER,
	letter TEXT,
	status INTEGER,
	x INTEGER,
	y INTEGER,
	player_id INTEGER,
	game_id INTEGER,
	CONSTRAINT tiles_PK PRIMARY KEY (tile_id)
);

CREATE TABLE players (
	player_id INTEGER,
	player_name TEXT,
	game_id INTEGER,
	player_state INTEGER,
	CONSTRAINT players_PK PRIMARY KEY (player_id)
);

CREATE TABLE games (
	game_id INTEGER,
	game_name INTEGER,
	game_state INTEGER,
	winner INTEGER,
	CONSTRAINT games_PK PRIMARY KEY (game_id)
);
