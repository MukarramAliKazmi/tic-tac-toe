const game = (function() {
  const gameBoard = {
    board: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ],
    markerCount: 0,
    getBoard: function() {
      return this.board;
    },
    setMarker: function(row, col, marker) {
      this.board[row][col] = marker;
      this.markerCount++;
    },
    resetBoard: function() {
      this.board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
      ];
      this.markerCount = 0;
    }
  };
  
  const gamePlayers = {
    players: {
      playerOne: {
        marker: "o",
        score: 0
      },
      playerTwo: {
        marker: "x",
        score: 0
      }
    },
    activePlayer: null,
    getPlayers: function() {
      return this.players;
    },
    getActivePlayer: function() {
      if (!this.activePlayer) {
        return this.activePlayer = this.players.playerOne;
      }
      return this.activePlayer;
    },
    switchActivePlayer: function() {
      if (this.activePlayer === this.players.playerOne) {
        return this.activePlayer = this.players.playerTwo;
      }
      return this.activePlayer = this.players.playerOne;
    },
    updateActivePlayerScore: function() {
      return this.activePlayer.score++;
    },
    resetPlayers: function() {
      this.players.playerOne.score = 0;
      this.players.playerTwo.score = 0;
      this.activePlayer = this.players.playerOne;
    }
  };

  const play = (row, col) => {
    const activePlayer = gamePlayers.getActivePlayer();
    gameBoard.setMarker(row, col, activePlayer.marker);
  };

  const checkWinner = () => {
    let diagonalOne = {
      type: "diagonalOne",
      pattern: "",
      coordinates: []
    };
    let diagonalTwo = {
      type: "diagonalTwo",
      pattern: "",
      coordinates: []
    };

    for (let i = 0; i < 3; i++) {
      let row = {
        type: "row",
        pattern: "",
        coordinates: []
      };
      let col = {
        type: "column",
        pattern: "",
        coordinates: []
      };
      
      for (let j = 0; j < 3; j++) {
        row.pattern += gameBoard.board[i][j];
        row.coordinates.push([i, j]);
        col.pattern += gameBoard.board[j][i];
        col.coordinates.push([j, i]);
      }

      if (row.pattern === "ooo" || row.pattern === "xxx") {
        return row;
      } else if (col.pattern === "ooo" || col.pattern === "xxx") {
        return col;
      }

      diagonalOne.pattern += gameBoard.board[i][i];
      diagonalOne.coordinates.push([i, i]);
      diagonalTwo.pattern += gameBoard.board[i][2-i];
      diagonalTwo.coordinates.push([i, 2-i]);
    }

    if (diagonalOne.pattern === "ooo" || diagonalOne.pattern === "xxx") {
      return diagonalOne;
    } else if (diagonalTwo.pattern === "ooo" || diagonalTwo.pattern === "xxx") {
      return diagonalTwo;
    }
  };

  const checkDraw = () => {
    if (gameBoard.markerCount === 9) {
      return true;
    }
  };

  const resetGame = () => {
    gameBoard.resetBoard();
    gamePlayers.resetPlayers();
  };

  const nextGame = () => {
    gameBoard.resetBoard();
  };

  return {
    getBoard                : () => gameBoard.getBoard(),
    getPlayers              : () => gamePlayers.getPlayers(),
    getActivePlayer         : () => gamePlayers.getActivePlayer(),
    switchActivePlayer      : () => gamePlayers.switchActivePlayer(),
    updateActivePlayerScore : () => gamePlayers.updateActivePlayerScore(),
    play,
    checkWinner,
    checkDraw,
    resetGame,
    nextGame
  };
})();

const gameController = (function() {
  const dom = {
    getAllNodes       : () => document.querySelectorAll(".node"),
    getNodeByNumber   : (num) => document.querySelector(`[data-number="${num}"]`),
    getWinnerOne      : () => document.getElementById("winner-one"),
    getWinnerTwo      : () => document.getElementById("winner-two"),
    getDraw           : () => document.getElementById("draw"),
    getPlayerOne      : () => document.getElementById("player-one"),
    getPlayerTwo      : () => document.getElementById("player-two"),
    getPlayerOneScore : () => document.getElementById("player-one-score"),
    getPlayerTwoScore : () => document.getElementById("player-two-score"),
    getResetButtons   : () => document.querySelectorAll(".reset"),
    getNextButtons    : () => document.querySelectorAll(".next"),
    getNavResetButton : () => document.getElementById("nav-reset-button")
  };

  const utils = {
    getRowColByNum: (num) => [Math.floor(num/3), num%3],
    getNumByRowCol: (row, col) => 3 * row + col
  };

  const handlers = {
    onNodeClick: function(e) {
      e.target.style.pointerEvents = "none";

      const number = Number(e.target.dataset.number);
      const [row, col] = utils.getRowColByNum(number);

      game.play(row, col);

      renderers.renderBoard();
      renderers.renderNavResetButton();
      
      const winner = game.checkWinner();
      if (winner) {
        events.removeNodeClick();
        game.updateActivePlayerScore();
        renderers.renderScore();
        return renderers.renderWinner(winner);
      } else if (game.checkDraw()) {
        events.removeNodeClick();
        return renderers.renderDraw();
      }

      game.switchActivePlayer();
      renderers.renderActivePlayer();
    },
    onResetButtonClick: function() {
      game.resetGame();
      renderers.renderReset();
    },
    onNextButtonClick: function() {
      game.nextGame();
      renderers.renderNextGame();
    }
  };

  const renderers = {
    renderBoard: function() {
      const board = game.getBoard();

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const node = board[i][j];
          const num = utils.getNumByRowCol(i, j);
          const domNode = dom.getNodeByNumber(num);

          if (node && !domNode.innerHTML) {
            domNode.innerHTML = `<img src="./img/${node}.svg" alt="${node} icon" />`;          
          }
        }
      }
    },
    renderResetBoard: function() {
      const nodes = dom.getAllNodes();
      for (n of nodes) {
        n.innerHTML = "";
        n.className = "node";
        n.setAttribute("style", "");
      }
    },
    renderNavResetButton: function() {
      const resetButton = dom.getNavResetButton();
      resetButton.classList.add("reveal-nav-reset-button");
      resetButton.classList.remove("nav-reset-button");
      resetButton.classList.remove("hide-nav-reset-button")
    },
    resetNavResetButton: function() {
      const resetButton = dom.getNavResetButton();
      resetButton.classList.add("hide-nav-reset-button");
      resetButton.classList.remove("reveal-nav-reset-button");
    },
    renderActivePlayer: function() {
      const activePlayer = game.getActivePlayer();
      const playerOne = dom.getPlayerOne();
      const playerTwo = dom.getPlayerTwo();

      if (activePlayer.marker === "o") {
        playerOne.classList.add("player-selected");
        playerTwo.classList.remove("player-selected");
      } else {
        playerTwo.classList.add("player-selected");
        playerOne.classList.remove("player-selected");
      }
    },
    renderWinner: function(winner) {
      for (coordinate of winner.coordinates) {
        const num = utils.getNumByRowCol(...coordinate);
        const node = dom.getNodeByNumber(num);
        const activePlayer = game.getActivePlayer();

        node.classList.add(winner.type);
        
        if (activePlayer.marker === "o") {
          const winnerOne = dom.getWinnerOne();
          node.classList.add("line-light");
          winnerOne.classList.add("reveal-winner");
          winnerOne.style.pointerEvents = "auto";
        } else {
          const winnerTwo = dom.getWinnerTwo();
          node.classList.add("line-dark");
          winnerTwo.classList.add("reveal-winner");
          winnerTwo.style.pointerEvents = "auto";
        }
      }
    },
    renderResetWinner: function() {
      const winnerOne = dom.getWinnerOne();
      const winnerTwo = dom.getWinnerTwo();

      winnerOne.classList.remove("reveal-winner");
      winnerOne.style.pointerEvents = "none";
      winnerTwo.classList.remove("reveal-winner");
      winnerTwo.style.pointerEvents = "none";
    },
    renderDraw: function() {
      const draw = dom.getDraw();
      draw.classList.add("reveal-winner");
      draw.style.pointerEvents = "auto";
    },
    renderResetDraw: function() {
      const draw = dom.getDraw();
      draw.classList.remove("reveal-winner");
      draw.style.pointerEvents = "none";
    },
    renderScore: function() {
      const playerOneScore = dom.getPlayerOneScore();
      const playerTwoScore = dom.getPlayerTwoScore();
      const players = game.getPlayers();
      
      playerOneScore.innerHTML = players.playerOne.score;
      playerTwoScore.innerHTML = players.playerTwo.score;
    },
    renderResetScore: function() {
      const playerOneScore = dom.getPlayerOneScore();
      const playerTwoScore = dom.getPlayerTwoScore();

      playerOneScore.innerHTML = "";
      playerTwoScore.innerHTML = "";
    },
    renderReset: function() {
      this.renderResetBoard();
      this.renderResetScore();
      this.renderActivePlayer();
      this.renderResetWinner();
      this.renderResetDraw();
      this.resetNavResetButton();
      
      init();
    },
    renderNextGame: function() {
      this.renderResetBoard();
      this.renderResetWinner();
      this.renderResetDraw();
      this.resetNavResetButton();

      init();
    }
  };

  const events = {
    nodeClick: function() {
      const nodes = dom.getAllNodes();
      nodes.forEach(node => node.addEventListener("click", handlers.onNodeClick));
    },
    removeNodeClick: function() {
      const nodes = dom.getAllNodes();
      nodes.forEach(node => node.removeEventListener("click", handlers.onNodeClick));
    },
    resetButtonClick: function() {
      const resetButtons = dom.getResetButtons();
      resetButtons.forEach(button => button.addEventListener("click", handlers.onResetButtonClick));
    },
    nextButtonClick: function() {
      const nextButtons = dom.getNextButtons();
      nextButtons.forEach(button => button.addEventListener("click", handlers.onNextButtonClick));
    }
  };

  const init = () => {
    events.nodeClick();
    events.resetButtonClick();
    events.nextButtonClick();
  };

  init();
})();
