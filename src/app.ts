import express from "express";
import cors from "cors";
import { ChessGame } from "./database";
var mongoose = require('mongoose');

const app = express();
import http from "http";
const server = new http.Server(app);
import { Server } from "socket.io";

const port = 4001;

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

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

server.listen(port, () => {
  console.log(`Server runnig on PORT ${port}`);
});

var io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//Whenever someone connects this gets executed
io.on("connection", function (socket) {
  console.log("A user connected");

  socket.on("currentState", (data) => {
    console.log("data received", data);

    ChessGame.find({ gameId: data["gameId"] }, function (err, docs) {
      if (err) {
        socket.emit("currentStateResp", []);
      } else {
        if (docs.length >= 1) {
          socket.emit("currentStateResp", docs[0]["state"]);
        } else {
          socket.emit("currentStateResp", []);
        }
      }
    });
  });

  socket.on("move", (data) => {
    console.log("moved", JSON.stringify(data, null, 2));

    ChessGame.updateOne(
      { gameId: data["gameId"] },
      {
        $push: {
          movements: {
            name: data["piece"]["name"],
            color: data["piece"]["color"],
            start: {
              row: data["previousPosition"]["row"],
              column: data["previousPosition"]["column"],
            },
            end: {
              row: data["piece"]["position"]["row"],
              column: data["piece"]["position"]["column"],
            },
          },
        },
      },
      function (err, doc) {
        if (err) {
          console.log("failed to update record", err);
        }
        console.log("movement saved");

        const where = {
          gameId: data["gameId"],
          "state._id": mongoose.Types.ObjectId(data["piece"]["_id"]),
          // "state.color": data["piece"]["color"],
          // "state.position": {
          //   row: data["previousPosition"]["row"],
          //   column: data["previousPosition"]["column"],
          // },
        };

        const update = {
          $set: {
            "state.$.position": {
              row: data["piece"]["position"]["row"],
              column: data["piece"]["position"]["column"],
            },
          },
        };

        console.log('where', JSON.stringify(where, null, 2))
        console.log('update', JSON.stringify(update, null, 2))

        

        ChessGame.updateOne(where, update, function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log("Updated Docs : ", docs);
          }
        });

      //   ChessGame.findOneAndUpdate(
      //      {  "gameId": data["gameId"], },
      //      { $set: { "state.$[elem].position.row" : data["piece"]["position"]["row"], "state.$[elem].position.column" : data["piece"]["position"]["column"] } },
      //      [ { "elem.name": data["piece"]["name"].toUpperCase(), "elem.color": data["piece"]["color"], "elem.position.row": data["previousPosition"]["row"], "elem.position.column": data["previousPosition"]["column"] } ]
      //  )
      }
    );
  });

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function () {
    console.log("A user disconnected");
  });
});

// const a = {
//    "gameId": "vnfpcxaueh",
//    "state.name": "PAWN",
//    "state.color": "WHITE",
//    "state.position": {
//      "row": 6,
//      "column": 3
//    }
// }

// const b = {
//      "$set": {
//        "state.$.position": {
//          "row": 5,
//          "column": 3
//        }
//      }
//    }

//    db.getCollection("chess_games").findAndModify({
//     query: {  "gameId": "a3tm4m7s5f", },
//     update: { $set: { "grades.$[elem].row" : 2, "grades.$[elem].column" : 1 } },
//     arrayFilters: [ { "elem.name": "PAWN", "elem.color": "BLACK", "elem.position.row": 1, "elem.position.column": 1 } ]
//  })