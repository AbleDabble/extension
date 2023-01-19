import chess

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from subprocess import Popen, PIPE, STDOUT
from stockfish import Stockfish
from pydantic import BaseModel
from typing import List, Union
import time
stockfish = Stockfish(path='../../stockfish/stockfish.exe', parameters={'Hash': 4096, 'Threads': 12, "Contempt": 10})
board = chess.Board()
app = FastAPI()
origins = [
    "*",
]

stockfish.set_elo_rating(2000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Move(BaseModel):
    move: str

class Moves(BaseModel):
    moves: List[str]
    time: Union[int, None]
    useTime: Union[bool, None]
class Depth(BaseModel):
    depth: int

@app.post("/bestmove/")
async def best_move(moves: Moves):
    global board
    board = chess.Board()
    for move in moves.moves:
        board.push_san(move)
    stockfish.set_fen_position(board.fen())
    if moves.useTime:
        start = time.time()
        move = stockfish.get_best_move_time(moves.time)
        print("Stockfish took", time.time() - start)
    else: 
        start = time.time()
        move = stockfish.get_best_move()
        print("Stockfish took", time.time() - start)
    print(move)
    return {"move": move, "moveCount": len(moves.moves)}

@app.post('/depth/')
async def set_depth(depth: Depth):
    stockfish.set_depth(depth.depth)
    return {"depth": depth.depth}

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

@app.get("/eval/")
async def get_eval():
    return stockfish.get_evaluation()
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
    top_moves = stockfish.get_top_moves(2)
    return top_moves
    
    
