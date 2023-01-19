class Board {
    constructor(arrows) {
        this.lines = [];
        this.arrows = arrows;
        this.moveCount = 0;
    }

    getXNumber(char){
        let x = char.charCodeAt(0) - 97;
        x = 6.25 + x * 2 * 6.25
        // if(x % 2 == 0) x = (x) * 2;
        return x;
    }

    getYNumber(char){
        let y = (char - 8) * -1
        y = 6.25 + y * 2 * 6.25
        return y;
    }

    addBestLine(move, moveCount) {
        if(this.moveCount > moveCount){
            return;
        }
        this.deleteLines();
        this.moveCount = moveCount;
        let moveArr = Array.from(move)
        let start = moveArr.slice(0, 2);
        let end = moveArr.slice(2);
        let start_x = this.getXNumber(start[0]);
        let start_y = this.getYNumber(start[1]);
        let end_x = this.getXNumber(end[0]);
        let end_y = this.getYNumber(end[1]);
        let line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', '' + start_x)
        line.setAttribute('y1', '' + start_y)
        line.setAttribute('x2', '' + end_x)
        line.setAttribute('y2', '' + end_y)
        line.setAttribute('style', 'stroke:rgb(255,0,0);stroke-width:2')
        line.setAttribute('id', '' + this.lines.length);
        this.lines.push(line);
        this.arrows.appendChild(line);
    }

    addLine(move, opacity){
        let moveArr = Array.from(move)
        let start = moveArr.slice(0, 2);
        let end = moveArr.slice(2);
        let start_x = this.getXNumber(start[0]);
        let start_y = this.getYNumber(start[1]);
        let end_x = this.getXNumber(end[0]);
        let end_y = this.getYNumber(end[1]);
        let line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', '' + start_x)
        line.setAttribute('y1', '' + start_y)
        line.setAttribute('x2', '' + end_x)
        line.setAttribute('y2', '' + end_y)
        line.setAttribute('style', `stroke:rgb(0,0,255);stroke-width:1.5;opacity:${opacity}`)
        line.setAttribute('id', '' + this.lines.length);
        this.lines.push(line);
        this.arrows.appendChild(line);
    }

    addLines(moves, moveCount){
        console.log("move count", moveCount, "board move count", this.moveCount);
        // if(this.moveCount > moveCount){
        //     return
        // }
        console.log("continue to add best line");
        this.deleteLines();
        this.moveCount = moveCount;
        let currOpacity = 1;
        let reduction = 1/moves.length;
        this.moveCount = moveCount;
        console.log("MOVES", moves);
        for(const move of moves){
            this.addLine(move.Move, currOpacity);
            currOpacity -= reduction;
        };
    }

    deleteLines(){
        for(let i = 0; i < this.lines.length; i++){
            let line = document.getElementById('' + i);
            line.remove();
        }
        this.lines = [];
    }
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

MutationObserver = window.MutationObserver;

/**
 * Returns the LAN formatted move as a string
 * @param {Node} move 
 * @returns {string}
 */
function format(move){
    let piece = '';
    if(move.childNodes.length > 1){
        console.log("move.textContent =", move.textContent);
        if(move.textContent.includes('=')){
            return move.textContent + 'Q';
        }
        piece = move.childNodes[0].className.split(' ').at(-1).toUpperCase();
        if(piece.includes('KNIGHT')){
            piece = 'N'
        }
        piece = Array.from(piece)[0];
    }
    return piece + move.textContent;
}

window.moveCount = 0;

function newGame(){
    fetch('http://127.0.0.1/newgame/', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
    });
}
newGame();

function getBestMoves(moveCount){
    fetch('http://127.0.0.1/moves/', {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    }).then(response => response.json()).then(value => {
        board.addLines(value, moveCount)
    });
}



const arrows = document.getElementsByClassName('arrows')[0];
const board = new Board(arrows);
// board.addLine('d1h5');
console.log("GAME IS ACTIVE");
async function getBestMove(move, moveCount){
    fetch('http://127.0.0.1/move/', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({'move': move})
    }).then(() => getBestMoves(window.moveCount));
    // .then(() => {
    //     fetch('http://127.0.0.1/move/', {
    //         method: 'get',
    //         headers: {
    //             'Content-Type':'application/json'
    //         },
    //     }).then(response => response.json()).then(value => {
    //         console.log("BEST_MOVE", value);
    //         board.addBestLine(value.best_move, moveCount);
    //     });
    // })
}

// browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     console.log("tabUpdated")
// })

window.moveList = document.getElementsByTagName('vertical-move-list')[0];
console.log(window.moveList);
// let url = window.location;
browser.runtime.onMessage.addListener(function(message){
    console.log("New game detected")
    if(message == 'new'){
        window.moveList = document.getElementsByTagName('vertical-move-list')[0];
    }
})

console.log("runtime listener added");
let observer = new MutationObserver(function(mutations){
    if(window.moveList.childNodes.length == 0){
        console.log("NEW GAME FOUND");
        newGame();
    }
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(addedNode){
            window.moveCount += 1;
            console.log(addedNode);
            try{
                if(addedNode.className.includes('node')){
                    let move = format(addedNode);
                    getBestMove(move, window.moveCount)
                    // .then(() => 
                    //     getBestMoves(window.moveCount)
                    // );
                    
                }
                
            }catch(error){
                console.log(error);
            }
        })
    });
});

// get move list
// let moveList = document.querySelector('vertical-move-list.move-list-move-list');
observer.observe(window.moveList, {
    subtree: true,
    attributes: true,
    childList: true,
});


