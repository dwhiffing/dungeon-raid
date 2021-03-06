import Phaser from 'phaser'

const ANIMATION_DURATION = 140
const EXTRA = 3

// Enemy Sword Shield Potion Gold

export default class extends Phaser.Sprite {
  constructor ({ game }) {
    super(game, 0, 0, 'tile')
    this.anchor.setTo(0.5)
    this.visible = false
  }

  reset (index, type) {
    this.scale.setTo(window.ratio)
    const coords = this._getCoordsFromIndex(index)
    this.position = {
      x: coords.x * window.tileSize + window.tileSize / 2,
      y: coords.y * window.tileSize + window.tileSize / 2
    }
    this.coordinate = new Phaser.Point(coords.x, coords.y)
    this.angle = 0
    this.frame = type
    this.setIndex(index)
    this.visible = true
    this.picked = false
  }

  fall (index, holes) {
    this.setIndex(index)
    this.tween(this.y + holes * window.tileSize, ANIMATION_DURATION * holes)
    const { x, y } = this._getCoordsFromIndex(this.index)
    this.coordinate = new Phaser.Point(x, y)
  }

  respawn (index, type, holes) {
    const _y = Math.abs(holes - Math.floor(index / window.gridDim))
    this.reset(index % window.gridDim, type)
    this.position = {
      x: (index % window.gridDim) * window.tileSize + window.tileSize / 2,
      y: -_y * window.tileSize + window.tileSize / 2 - window.tileSize * EXTRA
    }
    const { x, y } = this._getCoordsFromIndex(index)
    this.coordinate = new Phaser.Point(x, y)
    this.setIndex(index)

    const duration =
      ANIMATION_DURATION * holes * (Math.abs(this.y - 1000) / 1000)

    return this.tween(this.y + (holes + EXTRA) * window.tileSize, duration)
  }

  setIndex (index) {
    this.index = index
  }

  pick () {
    this.picked = true
  }

  unpick () {
    this.picked = false
  }

  destroy () {
    let x = this.game.width / 2
    if (this.frame === 4) {
      x = 100
    }
    if (this.frame === 3) {
      x = this.game.width - 100
    }
    this.matchTween(x, -130).then(this._hide)
  }

  tween (y, duration) {
    return new Promise(resolve => {
      const tween = this.game.add
        .tween(this)
        .to({ y }, duration, Phaser.Easing.Linear.None, true)
      tween.onComplete.add(resolve)
    })
  }

  matchTween (x, y) {
    return new Promise(resolve => {
      const tween = this.game.add
        .tween(this)
        .to({ x, y }, 500, Phaser.Easing.Linear.None, true)
      this.game.add
        .tween(this.scale)
        .to({ x: 0.2, y: 0.2 }, 500, Phaser.Easing.Linear.None, true)
      tween.onComplete.add(resolve)
    })
  }

  _hide = () => {
    this.visible = false
  }

  _getCoordsFromIndex (index) {
    return { y: Math.floor(index / window.gridDim), x: index % window.gridDim }
  }
}
