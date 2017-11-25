import Tile from '../sprites/Tile'

const TILE_SIZE = 70
const GRID_SIZE = 6

export default class TileService {
  constructor () {
    this.game = window.game

    this.tiles = []
    this.group = this.game.add.group()
    this.group.x = 0
    this.group.y = 125
    this.tileIndex = 0

    while (this.tiles.length < GRID_SIZE * GRID_SIZE) {
      this._createTile()
    }
  }

  pickTile (position, visited) {
    if (!this.group.getBounds().contains(position.x, position.y)) {
      return
    }
    let last
    const index = this._getIndexFromPosition(position.x, position.y)
    const tile = this.tiles[index]

    if (visited) {
      last = this.tiles[visited[visited.length - 1]]
      const last2 = this.tiles[visited[visited.length - 2]]
      if (last2 && tile.index === last2.index) {
        last.unpick()
        visited.pop()
        return
      }
    }

    if (!last || this._isValidMatch(tile, last)) {
      if (tile.picked) {
        return
      }
      tile.pick()
      return last ? [tile, last] : tile
    }
  }

  removeTile (index) {
    const tile = this.tiles[index]
    tile.destroy()
    this.tiles[index] = null
    return tile
  }

  clearPick () {
    this.tiles.forEach(t => t.unpick())
  }

  applyGravity (removedTiles, callback) {
    for (let index = this.tiles.length - 1; index >= 0; index--) {
      const holes = this._holesAtIndex(index + GRID_SIZE)
      const tile = this.tiles[index]
      if (holes > 0 && tile) {
        this.tiles[index] = null
        tile.index = index + GRID_SIZE * holes
        this.tiles[tile.index] = tile
        tile.fall(holes, callback)
      }
    }

    this._placeNewTiles(removedTiles, callback)
  }

  _placeNewTiles (removedTiles, callback) {
    for (let index = this.tiles.length - 1; index >= 0; index--) {
      if (this._holesAtIndex(index) > 0) {
        const tile = removedTiles.pop()
        const fallDistance = this._holesAtIndex(index % GRID_SIZE)
        tile.respawn(index, fallDistance, callback)
        this.tiles[index] = tile
      }
    }
  }

  _createTile () {
    const tile = new Tile({
      game: this.game,
      size: TILE_SIZE,
      index: this.tileIndex,
      x: this.tileIndex % GRID_SIZE,
      y: Math.floor(this.tileIndex / GRID_SIZE)
    })

    this.tiles[this.tileIndex] = tile
    this.group.add(tile)
    this.tileIndex += 1

    return tile
  }

  _getIndexFromPosition (x, y) {
    return (
      Math.floor((x - this.group.x) / TILE_SIZE) +
      Math.floor((y - this.group.y) / TILE_SIZE) * GRID_SIZE
    )
  }

  _holesAtIndex (_index) {
    let result = 0
    for (let index = _index; index < this.tiles.length; index += GRID_SIZE) {
      if (this.tiles[index] == null) {
        result++
      }
    }
    return result
  }

  _checkAdjacent (p1, p2) {
    return Math.abs(p1.x - p2.x) <= 1 && Math.abs(p1.y - p2.y) <= 1
  }

  _isValidMatch (tile, last) {
    return (
      this._checkAdjacent(tile.coordinate, last.coordinate) &&
      tile.frame === last.frame
    )
  }

  _logTiles (name, force) {
    console.log(this.tiles.map(this._logTile))
    console.log(this.tiles.map(this._logTile).slice(0, 6))
    console.log(this.tiles.map(this._logTile).slice(6, 12))
    console.log(this.tiles.map(this._logTile).slice(12, 18))
    console.log(this.tiles.map(this._logTile).slice(18, 24))
    console.log(this.tiles.map(this._logTile).slice(24, 30))
    console.log(this.tiles.map(this._logTile).slice(30, 36))
    console.log('=====================', name)
  }

  _logTile (t) {
    return t ? `${t.index}` : 'nil'
  }
}