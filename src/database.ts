
import mongoose from "mongoose";
const username = 'chess_user';
const password = 'chess_user123';
mongoose.connect(`mongodb://${username}:${password}@mymongo:27017/chess-app-db`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const chessGameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true
  },
  winner: {
    type: String,
    required: false,
    default: ""
  },
  players: [
    {
      id: String,
      color: {
        type: String,
        required: true,
        enum: ['BLACK', 'WHITE']
      }
    }
  ],
  state: [
    {
      name: {
        type: String,
        enum: ['KING', 'QUEEN', 'BISHOP', 'ROOK', 'KNIGHT', 'PAWN'],
        required: true,
      },
      color: {
        type: String,
        required: true,
        enum: ['BLACK', 'WHITE']
      },
      position: {
        row: {
          type: Number,
          required: true,
          min: 0,
          max: 7
        },
        column: {
          type: Number,
          required: true,
          min: 0,
          max: 7
        }
      },
      isAlive: {
        type: Boolean,
        default: true
      }
    }
  ],
  movements: [
    {
      name: {
        type: String,
        enum: ['KING', 'QUEEN', 'BISHOP', 'ROOK', 'KNIGHT', 'PAWN'],
        required: true,
      },
      color: {
        type: String,
        required: true,
        enum: ['BLACK', 'WHITE']
      },
      start: {
        row: {
          type: Number,
          required: true,
          min: 0,
          max: 7
        },
        column: {
          type: Number,
          required: true,
          min: 0,
          max: 7
        }
      },
      end: {
        row: {
          type: Number,
          required: true,
          min: 0,
          max: 7
        },
        column: {
          type: Number,
          required: true,
          min: 0,
          max: 7
        }
      }
    }
  ]
});

export const ChessGame = mongoose.model("chess_game", chessGameSchema);
