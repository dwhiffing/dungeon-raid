import Phaser from 'phaser'

const GRID_SIZE = 6
const TILE_SIZE = 70

export default class extends Phaser.Sprite {
  constructor ({ game }) {
    super(game, 0, 0, 'tile')
    this.anchor.setTo(0.5)
    this.visible = false
  }

  reset (index) {
    const coords = this._getCoordsFromIndex(index)
    this.position = {
      x: coords.x * TILE_SIZE + 30,
      y: coords.y * TILE_SIZE + 30
    }
    this.alpha = 0
    this.index = index
    this.visible = true
    this.tween().then(() => {
      this.visible = false
    })
  }

  destroy () {
    this.alpha = 0
    this.index = null
    this.visible = false
    this.x = 0
    this.y = 0
  }

  showDyingState (index) {
    const coords = this._getCoordsFromIndex(index)
    this.position = {
      x: coords.x * TILE_SIZE + 30,
      y: coords.y * TILE_SIZE + 30
    }
    this.alpha = 1
    this.tint = 0xff0000
    this.visible = true
  }

  tween () {
    return new Promise(resolve => {
      this.tint = 0xffffff
      const tween = this.game.add
        .tween(this)
        .to({ alpha: 1 }, 250, Phaser.Easing.Linear.None, true)
      const tween2 = this.game.add
        .tween(this)
        .to({ alpha: 0 }, 250, Phaser.Easing.Linear.None)
      tween.chain(tween2)
      tween2.onComplete.add(resolve)
    })
  }

  _getCoordsFromIndex (index) {
    return { y: Math.floor(index / GRID_SIZE), x: index % GRID_SIZE }
  }
}
