import chess

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from subprocess import Popen, PIPE, STDOUT
from stockfish import Stockfish
from pydantic import BaseModel
stockfish = Stockfish(path='../../stockfish/stockfish.exe', parameters={'Hash': 4096, 'Threads': 12})
board = chess.Board()
app = FastAPI()
origins = [
    "*",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Move(BaseModel):
    move: str


@app.post("/newgame/")
async def new_game():
    global board
    board = chess.Board()

@app.post("/move/")
async def make_move(move: Move):
    print(move.move)
    global board
    board.push_san(move.move)
    return {'complete': 'true'}

@app.get('/move/')
async def get_move():
    global board
    fen = board.fen()
    stockfish.set_fen_position(fen)
    best_move = stockfish.get_best_move()
    return {'best_move': best_move}

@app.get('/moves/')
async def get_moves():
    global board
    stockfish.set_fen_position(board.fen())
    top_moves = stockfish.get_top_moves(3)
    return top_moves
    
    
