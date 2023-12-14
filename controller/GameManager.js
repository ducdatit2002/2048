function GameManager(size, InputManager, Actuator, StorageManager) {
    this.size           = size; // Size of the grid
    this.inputManager   = new InputManager;
    this.storageManager = new StorageManager;
    this.actuator       = new Actuator;
    this.startTiles     = 2;
  
    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("undo", this.undo.bind(this));
    this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
    this.setup();
  }
  
  // Restart the game
  GameManager.prototype.restart = function () {
    this.storageManager.clearLastMoves(); // Changes 
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    this.setup();
  };
  
  // Changes undo move
  GameManager.prototype.undo = function () {
    var data = this.storageManager.getLastMove(true);
    if (data !== null) {
      this.storageManager.setGameState(data);
      this.actuator.continueGame();
      this.setup();
    }
  };
  
  // Keep playing after winning (allows going over 2048)
  GameManager.prototype.keepPlaying = function () {
    this.keepPlaying = true;
    this.actuator.continueGame(); // Clear the game won/lost message
  };
  
  // Return true if the game is lost, or has won and the user hasn't kept playing
  GameManager.prototype.isGameTerminated = function () {
    return this.over || (this.won && !this.keepPlaying);
  };
  
  // Set up the game
  GameManager.prototype.setup = function () {
    var previousState = this.storageManager.getGameState();
  
    // Reload the game from a previous game if present
    if (previousState) {
      this.grid        = new Grid(previousState.grid.size,
                                  previousState.grid.cells); // Reload grid
      this.score       = previousState.score;
      this.over        = previousState.over;
      this.won         = previousState.won;
      this.keepPlaying = previousState.keepPlaying;
    } else {
      this.grid        = new Grid(this.size);
      this.score       = 0;
      this.over        = false;
      this.won         = false;
      this.keepPlaying = false;
  
      // Add the initial tiles
      this.addStartTiles();
    }
  
    // Update the actuator
    this.actuate();
  };

   // Set up the initial tiles to start the game with
  GameManager.prototype.addStartTiles = function () {
    for (var i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  };
  
  // Adds a tile in a random position
  GameManager.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4;
      var tile = new Tile(this.grid.randomAvailableCell(), value);
  
      this.grid.insertTile(tile);
    }
  };
  
  // Sends the updated grid to the actuator
  GameManager.prototype.actuate = function () {
    if (this.storageManager.getBestScore() < this.score) {
      this.storageManager.setBestScore(this.score);
    }
  
    // Clear the state when the game is over (game over only, not win)
    if (this.over) {
      this.storageManager.clearGameState();
    } else {
      this.storageManager.setGameState(this.serialize());
    }
  
    // Changes  Handle Undo Button
    var data = this.storageManager.getLastMove(false);
    if (data !== null) {
      document.getElementsByClassName("undo-button")[0].classList.remove("disabled");
    } else {
      document.getElementsByClassName("undo-button")[0].classList.add("disabled");
    }
  
    this.actuator.actuate(this.grid, {
      score:      this.score,
      over:       this.over,
      won:        this.won,
      bestScore:  this.storageManager.getBestScore(),
      terminated: this.isGameTerminated()
    });
  
  };