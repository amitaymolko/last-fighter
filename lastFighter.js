class Helpers {
    static getLevel(index) {
        let level = 0
        let number = 0
        for (let i = 0; i < 100; i++) {
            number += i
            if (index >= number) {
                level++
            } else {
                return level
            }

        }
        return level
    }
}

class LastFighterMove {
    constructor(_type, _index, _newIndex, _overIndex) {
        this.type = _type        
        this.index = _index   
        this.newIndex = _newIndex        
        this.overIndex = _overIndex        
    }
}

class LastFighterSpot {
  
    constructor(_index, _taken) {
        this.index = _index
        this.taken = _taken
    }

    getLevel() {
        return Helpers.getLevel(this.index)
    }

    getParentLeftIndex() { // 0
        const index = this.index - this.getLevel()
        return index >= 0 && Helpers.getLevel(index) == this.getLevel() - 1 ? index : -1
    }

    getParentRightIndex() { // 1
        const index =  this.index - this.getLevel() + 1
        return index >= 0 && Helpers.getLevel(index) == this.getLevel() - 1 ? index : -1
    }

    getSiblingLeftIndex() { // 2
        const index = this.index - 1
        return index >= 0 && Helpers.getLevel(index) == this.getLevel() ? index : -1
    }

    getSiblingRightIndex() { // 3
        const index = this.index + 1
        return index >= 0 && Helpers.getLevel(index) == this.getLevel() ? index : -1
    }

    getChildLeftIndex() { // 4
        return this.index + this.getLevel()
    }

    getChildRightIndex() { // 5
        return this.index + this.getLevel() + 1
    }
}

class LastFighter {
    constructor(_levels = 5) {
        this.levels = _levels
        this.pieces = []
        this.moves = []
        var number = 0
        for (let i = 0; i <= _levels; i++) {
            number += i
        }
        for (let j = 0; j < number; j++) {
            const spot = new LastFighterSpot(j, true)
            this.pieces.push(spot)
        }
    }

    getAllPossibleMoves() {
        let moves = []
        for (let index = 0; index < this.pieces.length; index++) {
            moves = moves.concat(this.getPossibleMoves(index))
        }
        return moves
    }

    getPossibleMoves(_index) {
        const parentLeftIndex = this.pieces[_index].getParentLeftIndex()
        const parentRightIndex = this.pieces[_index].getParentRightIndex()
        const siblingLeftIndex = this.pieces[_index].getSiblingLeftIndex()
        const siblingRightIndex = this.pieces[_index].getSiblingRightIndex()
        let childLeftIndex = this.pieces[_index].getChildLeftIndex()
        let childRightIndex = this.pieces[_index].getChildRightIndex()
        
        childLeftIndex = (Helpers.getLevel(childLeftIndex) <= this.levels) ? childLeftIndex : -1
        childRightIndex = (Helpers.getLevel(childRightIndex) <= this.levels) ? childRightIndex  : -1
        
        const moves = []
        
        if (parentLeftIndex > 1 && this.pieces[parentLeftIndex].getParentLeftIndex() >= 0) {
            const newIndex = this.pieces[parentLeftIndex].getParentLeftIndex()
            const movePossible = this.pieces[parentLeftIndex].taken && !this.pieces[newIndex].taken
            if (movePossible) {
                moves.push(new LastFighterMove(0, _index, newIndex, parentLeftIndex))
            }
        }

        if (parentRightIndex >= 1 && this.pieces[parentRightIndex].getParentRightIndex() >= 0) {
            const newIndex = this.pieces[parentRightIndex].getParentRightIndex()
            const movePossible = this.pieces[parentRightIndex].taken && !this.pieces[newIndex].taken
            if (movePossible) {
                moves.push(new LastFighterMove(1, _index, newIndex, parentRightIndex))
            }
        }

        if (siblingLeftIndex > 1 && this.pieces[siblingLeftIndex].getSiblingLeftIndex() >= 0) {
            const newIndex = this.pieces[siblingLeftIndex].getSiblingLeftIndex()
            const movePossible = this.pieces[siblingLeftIndex].taken && !this.pieces[newIndex].taken
            if (movePossible) {
                moves.push(new LastFighterMove(2, _index, newIndex, siblingLeftIndex))
            }
        }

        if (siblingRightIndex > 1 && this.pieces[siblingRightIndex].getSiblingRightIndex() >= 0) {
            const newIndex = this.pieces[siblingRightIndex].getSiblingRightIndex()
            const movePossible = this.pieces[siblingRightIndex].taken && !this.pieces[newIndex].taken
            if (movePossible) {
                moves.push(new LastFighterMove(3, _index, newIndex, siblingRightIndex))
            }
        }

        if (childLeftIndex >= 1 && this.pieces[childLeftIndex].getChildLeftIndex() >= 0 && Helpers.getLevel(this.pieces[childLeftIndex].getChildLeftIndex()) <= this.levels) {
            const newIndex = this.pieces[childLeftIndex].getChildLeftIndex()               
            const movePossible = this.pieces[childLeftIndex].taken && !this.pieces[newIndex].taken
            if (movePossible) {
                moves.push(new LastFighterMove(4, _index, newIndex, childLeftIndex))
            }
        }

        if (childRightIndex > 1 && this.pieces[childRightIndex].getChildRightIndex() >= 0 && Helpers.getLevel(this.pieces[childRightIndex].getChildRightIndex()) <= this.levels) {
            const newIndex = this.pieces[childRightIndex].getChildRightIndex()
            
            const movePossible = this.pieces[childRightIndex].taken && !this.pieces[newIndex].taken
            if (movePossible) {
                moves.push(new LastFighterMove(5, _index, newIndex, childRightIndex))
            }
        }
        return moves
    }

    makeMove(_move) {
        const moves = this.getPossibleMoves(_move.index)
        for (const move of moves) {
            if (move.type == _move.type) {
                this.pieces[move.index].taken = false
                this.pieces[move.newIndex].taken = true
                this.pieces[move.overIndex].taken = false
                this.moves.push(move)
                return 
            }
        }
        
        throw "Invalid move!"
    }

    undoLastMove() {
        const lastMove = this.moves.pop()
        this.pieces[lastMove.index].taken = true
        this.pieces[lastMove.newIndex].taken = false
        this.pieces[lastMove.overIndex].taken = true
    }

    countTaken() {
        let count = 0
        for (const piece of this.pieces) {
            if(piece.taken) {
                ++count
            }
        }
        return count
    }
    
    findSolution() {
        if (this.countTaken() == 1) {
            return true
        }
        const moves = this.getAllPossibleMoves()
        
        for (const move of moves) {
            this.makeMove(move)
            if (this.findSolution()) {
                return true
            }
            this.undoLastMove()
        }
        return false
    }
}

let game = new LastFighter(5)
// for (let index = 0; index < game.pieces.length; index++) {
//     game = new LastFighter(5)
//     game.pieces[index].taken = false
//     game.findSolution()
//     console.log('index', index)
//     console.log('game.pieces', game.pieces)
//     console.log('game.moves', game.moves)
// }

game.pieces[7].taken = false
game.findSolution()

console.log('game.pieces', game.pieces)
console.log('game.moves', game.moves)



