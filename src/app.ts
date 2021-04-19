import express from "express";
import cors from "cors";
import { ChessGame } from "./database";

const app = express();
const port = 4001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("First route");
});

async function isUniqueGameId(gameId): Promise<boolean> {
  // check in database if exits return false otherwise true
  let results = await ChessGame.find({ gameId: gameId });
  console.log("results", results);
  return results.length === 0;
}

function getInitialPosition() {
  const initialPosition = [];
  const pieces = [
    "ROOK",
    "KNIGHT",
    "BISHOP",
    "QUEEN",
    "KING",
    "BISHOP",
    "KNIGHT",
    "ROOK",
  ];

  for (let i = 0; i < pieces.length; i++) {
    initialPosition.push({
      color: "WHITE",
      name: pieces[i],
      position: {
        row: 7,
        column: i,
      },
    });

    initialPosition.push({
      color: "WHITE",
      name: "PAWN",
      position: {
        column: i,
        row: 6,
      },
    });

    initialPosition.push({
      color: "BLACK",
      name: pieces[i],
      position: {
        row: 0,
        column: i,
      },
    });

    initialPosition.push({
      color: "BLACK",
      name: "PAWN",
      position: {
        column: i,
        row: 1,
      },
    });
  }

  return initialPosition;
}

app.get("/getUniqueGameId", async (req, res) => {
  let user = req.query.user;

  let gameId = Math.random().toString(36).slice(-10);

  while (!(await isUniqueGameId(gameId))) {
    console.log("generating new game id");
    gameId = Math.random().toString(36).slice(-10);
  }

  try {
    const initialState = getInitialPosition();

    let myChessGame = new ChessGame({
      gameId: gameId,
      players: [
        {
          id: user,
          color: "WHITE",
        },
      ],
      state: initialState,
      movements: [],
    });

    myChessGame.save(function (err) {
      if (err) {
        res.send({
          message: "Cann't create new game",
          status: false,
        });
      }
      res.send({
        status: true,
        gameId: gameId,
        state: initialState,
      });
    });
  } catch (e) {
    console.log(e);
    res.stats(500).send({
      message: "Internal server error",
      status: false,
    });
  }
});

app.listen(port, () => {
  console.log(`Server runnig on PORT ${port}`);
});
