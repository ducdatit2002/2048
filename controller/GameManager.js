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