import React, { useState, useEffect } from 'react';
import './App.css';

const Level = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  EXPERT: 3,
  ADVANCED: 4
};

const State = {
  LOSE: -1,
  ONGOING: 0,
  WIN: 1
};

const App = () => {
  const [board, setBoard] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [flags, setFlags] = useState([]);
  const [unflipped, setUnflipped] = useState(0);
  const [remainingFlags, setRemainingFlags] = useState(0);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [mines, setMines] = useState(0);
  const [level, setLevel] = useState(0);
  const [begin, setBegin] = useState(0);
  const [end, setEnd] = useState(0);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [gameState, setGameState] = useState(State.ONGOING);

  useEffect(() => {
    if (gameState !== State.ONGOING) {
      if (gameState === State.WIN) {
        alert('You Win!');
      } else if (gameState === State.LOSE) {
        alert('You Lose!');
      }
    }
  }, [gameState]);

  const newGame = (r, c, m, l) => {
    setRows(r);
    setCols(c);
    setMines(m);
    setLevel(l);
    setBoard(Array.from({ length: r }, () => Array(c).fill(0)));
    setTiles(Array.from({ length: r }, () => Array(c).fill(false)));
    setFlags(Array.from({ length: r }, () => Array(c).fill(false)));
    setUnflipped(r * c);
    setRemainingFlags(m);
    setMinesOnBoard(r, c, m);
    setBegin(performance.now() / 1000);
    setGameState(State.ONGOING);
  };

  const increment = (board, j, k) => {
    if (j < 0 || j >= rows || k < 0 || k >= cols) return;
    board[j][k]++;
  };

  const setMinesOnBoard = (r, c, m) => {
    const newBoard = Array.from({ length: r }, () => Array(c).fill(0));
    const rng = Math.random;

    for (let i = 0; i < m; i++) {
      while (true) {
        const j = Math.floor(rng() * r);
        const k = Math.floor(rng() * c);

        if (newBoard[j][k] !== -1) {
          newBoard[j][k] = -1;
          for (let m = -1; m <= 1; m++) {
            for (let n = -1; n <= 1; n++) {
              const newRow = j + m;
              const newCol = k + n;
              if (newRow >= 0 && newRow < r && newCol >= 0 && newCol < c && newBoard[newRow][newCol] !== -1) {
                increment(newBoard, newRow, newCol);
              }
            }
          }
          break;
        }
      }
    }
    setBoard(newBoard);
  };

  const flip = (j, k) => {
    const checklist = [[j, k]];
    const color = Array.from({ length: rows }, () => Array(cols).fill(false));
    const newTiles = tiles.slice();
    let newUnflipped = unflipped;
    let newRemainingFlags = remainingFlags;

    color[j][k] = true;

    while (checklist.length > 0) {
      const [currentJ, currentK] = checklist.shift();

      if (board[currentJ][currentK] === 0) {
        for (let m = -1; m <= 1; m++) {
          for (let n = -1; n <= 1; n++) {
            if ((m === 0 && n === 0) || currentJ + m < 0 || currentJ + m >= rows || currentK + n < 0 || currentK + n >= cols)
              continue;
            if (!newTiles[currentJ + m][currentK + n] && !color[currentJ + m][currentK + n]) {
              checklist.push([currentJ + m, currentK + n]);
              color[currentJ + m][currentK + n] = true;
            }
          }
        }
      }

      newUnflipped--;
      newTiles[currentJ][currentK] = true;

      if (flags[currentJ][currentK]) {
        flags[currentJ][currentK] = false;
        newRemainingFlags++;
      }
    }
    setUnflipped(newUnflipped);
    setTiles(newTiles);
    setRemainingFlags(newRemainingFlags);
  };

  const makeMove = (j, k) => {
    if (board[j][k] === -1) {
      showMines();
      setGameState(State.LOSE);
      return;
    }

    if (tiles[j][k]) {
      alert('Tile Already Flipped');
      return;
    }

    flip(j, k);

    if (unflipped === mines) {
      setEnd(performance.now() / 1000);
      flagTiles();
      setGameState(State.WIN);
      showTime();
      highscore();
    }
  };

  const setFlag = (j, k) => {
    if (!tiles[j][k] && remainingFlags > 0) {
      const newFlags = flags.slice();
      newFlags[j][k] = true;
      setFlags(newFlags);
      setRemainingFlags(remainingFlags - 1);
    }
  };

  const unsetFlag = (j, k) => {
    if (flags[j][k]) {
      const newFlags = flags.slice();
      newFlags[j][k] = false;
      setFlags(newFlags);
      setRemainingFlags(remainingFlags + 1);
    }
  };

  const highscore = () => {
    const highscores = [{ score, name }];
    let filename = '';

    switch (level) {
      case Level.BEGINNER:
        filename = 'beginner_highscore';
        break;
      case Level.INTERMEDIATE:
        filename = 'intermediate_highscore';
        break;
      case Level.EXPERT:
        filename = 'expert_highscore';
        break;
      case Level.ADVANCED:
        filename = 'advanced_highscore';
        break;
      default:
        filename = 'highscore';
        break;
    }

    const existingScores = JSON.parse(localStorage.getItem(filename)) || [];

    existingScores.forEach(entry => {
      highscores.push({ score: entry.score, name: entry.name });
    });

    highscores.sort((a, b) => a.score - b.score);

    localStorage.setItem(filename, JSON.stringify(highscores));
    alert(highscores.map((entry, index) => `${index + 1}. ${entry.name} ${entry.score}`).join('\n'));
  };

  const showMines = () => {
    const newTiles = tiles.slice();
    board.forEach((row, j) => {
      row.forEach((cell, k) => {
        if (cell === -1) newTiles[j][k] = true;
      });
    });
    setTiles(newTiles);
  };

  const flagTiles = () => {
    const newFlags = flags.slice();
    tiles.forEach((row, j) => {
      row.forEach((tile, k) => {
        if (!tile) newFlags[j][k] = true;
      });
    });
    setFlags(newFlags);
  };

  const showTime = () => {
    const elapsed = end - begin;
    setScore(elapsed);
    alert(`Elapsed Time: ${elapsed}`);
  };

  const handleTileClick = (j, k) => {
    if (gameState !== State.ONGOING) return;
    makeMove(j, k);
  };

  const handleFlagClick = (j, k) => {
    if (gameState !== State.ONGOING) return;
    if (flags[j][k]) {
      unsetFlag(j, k);
    } else {
      setFlag(j, k);
    }
  };

  const handleNewGame = (level) => {
    let r, c, m;
    switch (level) {
      case Level.BEGINNER:
        r = 8;
        c = 8;
        m = 10;
        break;
      case Level.INTERMEDIATE:
        r = 12;
        c = 12;
        m = 20;
        break;
      case Level.EXPERT:
        r = 16;
        c = 16;
        m = 40;
        break;
      case Level.ADVANCED:
        r = 20;
        c = 20;
        m = 80;
        break;
      default:
        return;
    }
    newGame(r, c, m, level);
  };

  return (
    <div className="App">
      <h1>Minesweeper</h1>
      {gameState === State.ONGOING ? (
        <div>
          <h2>Time Elapsed: {(performance.now() / 1000) - begin}</h2>
          <h2>Flags Remaining: {remainingFlags}</h2>
        </div>
      ) : null}
      <div>
        <button onClick={() => handleNewGame(Level.BEGINNER)}>Beginner</button>
        <button onClick={() => handleNewGame(Level.INTERMEDIATE)}>Intermediate</button>
        <button onClick={() => handleNewGame(Level.EXPERT)}>Expert</button>
        <button onClick={() => handleNewGame(Level.ADVANCED)}>Advanced</button>
      </div>
      <div className="board">
        {board.map((row, j) => (
          <div key={j} className="row">
            {row.map((cell, k) => (
              <div key={k} className="cell">
                <button
                  className={flags[j][k] ? 'flag' : tiles[j][k] ? 'flipped' : ''}
                  onClick={() => handleTileClick(j, k)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleFlagClick(j, k);
                  }}
                >
                  {flags[j][k] ? 'F' : tiles[j][k] ? (cell === -1 ? '💣' : cell) : ''}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
