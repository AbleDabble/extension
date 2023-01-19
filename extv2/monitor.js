(function () {
    class Board {
        constructor(arrows) {
            this.lines = [];
            this.arrows = arrows;
            this.moveCount = 0;
        }

        getXNumber(char) {
            let x = char.charCodeAt(0) - 97;
            x = 6.25 + x * 2 * 6.25;
            // if(x % 2 == 0) x = (x) * 2;
            return x;
        }

        getYNumber(char) {
            let y = (char - 8) * -1;
            y = 6.25 + y * 2 * 6.25;
            return y;
        }

        addBestLine(move, moveCount) {
            if (this.moveCount > moveCount) {
                return;
            }
            this.deleteLines();
            this.moveCount = moveCount;
            let moveArr = Array.from(move);
            let start = moveArr.slice(0, 2);
            let end = moveArr.slice(2);
            let start_x = this.getXNumber(start[0]);
            let start_y = this.getYNumber(start[1]);
            let end_x = this.getXNumber(end[0]);
            let end_y = this.getYNumber(end[1]);
            let line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );
            line.setAttribute("x1", "" + start_x);
            line.setAttribute("y1", "" + start_y);
            line.setAttribute("x2", "" + end_x);
            line.setAttribute("y2", "" + end_y);
            line.setAttribute("style", "stroke:rgb(255,0,0);stroke-width:2");
            line.setAttribute("id", "" + this.lines.length);
            this.lines.push(line);
            this.arrows.appendChild(line);
        }

        addLine(move, opacity) {
            let moveArr = Array.from(move);
            let start = moveArr.slice(0, 2);
            let end = moveArr.slice(2);
            let start_x = this.getXNumber(start[0]);
            let start_y = this.getYNumber(start[1]);
            let end_x = this.getXNumber(end[0]);
            let end_y = this.getYNumber(end[1]);
            let line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );
            line.setAttribute("x1", "" + start_x);
            line.setAttribute("y1", "" + start_y);
            line.setAttribute("x2", "" + end_x);
            line.setAttribute("y2", "" + end_y);
            line.setAttribute(
                "style",
                `stroke:rgb(0,0,255);stroke-width:1.5;opacity:${opacity}`
            );
            line.setAttribute("id", "" + this.lines.length);
            this.lines.push(line);
            this.arrows.appendChild(line);
        }

        addLines(moves, moveCount) {
            console.log(
                "move count",
                moveCount,
                "board move count",
                this.moveCount
            );
            // if(this.moveCount > moveCount){
            //     return
            // }
            console.log("continue to add best line");
            this.deleteLines();
            this.moveCount = moveCount;
            let currOpacity = 1;
            let reduction = 1 / moves.length;
            this.moveCount = moveCount;
            console.log("MOVES", moves);
            for (const move of moves) {
                this.addLine(move.Move, currOpacity);
                currOpacity -= reduction;
            }
        }

        deleteLines() {
            var lines = document.querySelectorAll("line");
            lines.forEach(function (line) {
                line.remove();
            });
        }
    }

    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    // Global variables
    window.moveList = null;
    window.board = null;
    window.useTime = false;
    window.time = 1000;

    /**
     * formats the move element into an array of 1 or 2 moves
     * @param {Node} move
     */
    function formatMove(move) {
        let children = [...move.childNodes];
        let moves = [];
        let badNodes = document.querySelectorAll('.move-info-icon');
        badNodes.forEach((badNode) => {
            badNode.remove();
        })
        children.forEach((node) => {
            if (node.nodeType != Node.ELEMENT_NODE) {
                return;
            }
            if (node.className.includes("node")) {
                let piece = "";
                if (node.childNodes.length > 1) {
                    console.log("move.textContent =", node.textContent);
                    console.log(node);
                    if (('' + node.textContent).includes("=")) {
                        moves.push(node.textContent + 'Q');
                        return;
                    }
                    
                    piece = node.childNodes[0].className
                        .split(" ")
                        .at(-1)
                        .toUpperCase();
                    if (piece.includes("KNIGHT")) {
                        piece = "N";
                    }
                    piece = Array.from(piece)[0];
                }
                moves.push(piece + node.textContent);
            }
        });
        // console.log("moves", moves);
        return moves;
    }

    /**
     * Calls the server and returns the best move following the settings provided
     * @param {Array} moves
     *
     */
    async function getBestMove(moves) {
        console.log(
            "Settings: \n\ttime",
            window.time,
            "\n\tuseTime",
            window.useTime
        );
        let body = JSON.stringify({
            moves: moves,
            time: window.time,
            useTime: window.useTime
        });
        let response = await fetch("http://127.0.0.1/bestmove/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body,
        })
        let json = await response.json();
        console.log(json);
        window.board.addBestLine(json.move, json.moveCount);
        await getEval();
            // .then((response) => {console.log(response); return response.json()})
            // .then((json) => {
            //     window.board.addBestLine(json.move, json.moveCount);
            //     console.log(json);
            //     console.log("Why called twice");
            // });
    }

    async function getEval(){
        let response = await fetch("http://127.0.0.1/eval/", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        let json = await response.json();
        console.log(json);
        let name = document.querySelector('.player-bottom > div:nth-child(3) > div:nth-child(1) > a:nth-child(1)');
        name.innerHTML = "" + json.type + " " + json.value
    }
    /**
     * Relocates move list
     */
    function resetMonitor() {
        window.moveList =
            document.getElementsByTagName("vertical-move-list")[0];
        console.log("moveList", window.moveList);
        window.observer = new window.MutationObserver(function (mutations) {
            let moves = [...window.moveList.childNodes];
            let formattedMoves = [];
            moves.forEach((move) => {
                let formattedMove = formatMove(move);
                formattedMoves = formattedMoves.concat(formattedMove);
            });
            console.log("Calling getBestMove");
            getBestMove(formattedMoves);
            // getEval();
        });

        // Start observer
        window.observer.observe(window.moveList, {
            subtree: true,
            attributes: true,
            childList: true,
        });

        // re-initialize board
        window.arrows = document.getElementsByClassName("arrows")[0];
        window.board = new Board(window.arrows);
    }

    function checkMoveList() {
        console.log("MoveList", window.moveList);
        console.log("Mutation observer", window.observer);
    }

    // functions to change settings
    function setDepth(depth) {
        fetch("http://127.0.0.1/depth/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ depth: depth }),
        })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
            });
    }

    function setTime(time) {
        fetch("http://127.0.0.1/time/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ time: time }),
        })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
            });
    }

    /**
     * Listen for messages from the background script.
     * Call "beastify()" or "reset()".
     */
    browser.runtime.onMessage.addListener((message) => {
        switch (message.command) {
            case "New Game":
                console.log("new game started");
                resetMonitor();
                break;
            case "Check Move List":
                checkMoveList();
                break;
            case "Depth":
                console.log(message.depth);
                setDepth(message.depth);
                break;
            case "Use Time":
                console.log("Use time", message.useTime);
                window.useTime = message.useTime;
                break;
            case "Time":
                console.log("Setting Time", message.time);
                window.time = message.time;
                break;
        }
    });
})();
