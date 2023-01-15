class Board {
    contructor(arrows) {
        this.lines = [];
        this.arrows = arrows;
        console.log("Board has been constructed");
    }

    getXNumber(char){
        return char.charCodeAt(0) - 96;
    }

    getYNumber(char){
        return (char - 9) * -1;
    }

    addLine(move) {
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
        this.lines.push(line);
        this.arrows.appendChild(line);
    }

    deleteLines(){
        this.lines.forEach(function(line) {
            line.remove()
        });
        this.lines = [];
    }

}

