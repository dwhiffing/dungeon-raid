import items from '../data/items'
import upgrades from '../data/upgrades'
import skills from '../data/skills'

const datum = [items, upgrades, skills]
const titles = ['Shop!', 'Upgrade!', 'Level Up!']

// Barbarian - Can jump over tiles to hit more enemies/swords
// Paladin - Can bash with shield
// Thief - Gold speciality
// Druid - Potion speciality
// Wizard - Low damage to all enemies

export default class PlayerService {
  constructor () {
    this.game = window.game
    this.state = 0
  }

  init (gameService) {
    this.uiService = gameService.uiService
    this.tileService = gameService.tileService

    this.level = 1
    this._totalExperience = 0
    this._experience = 0

    this.strength = 1
    this.dexterity = 1
    this.vitality = 1
    this.luck = 1
    this.items = [3, 2, 1, 1]

    this._totalArmor = 0
    this._armor = this.maxArmor
    this._totalUpgrades = 0
    this._upgradeProgress = 0

    this._totalGold = 0
    this._gold = 0
    this._totalItems = 0

    this._totalPotions = 0
    this._health = this.maxHealth
  }

  set health (newHealth) {
    this._totalPotions += newHealth - this._health
    this._health = newHealth
    if (this._health > this.maxHealth) {
      this._health = this.maxHealth
    }
    if (this._health <= 0) {
      this.state = -1
      this._health = 0
    }

    this.uiService.update()
  }

  set armor (newArmor) {
    this._totalArmor += newArmor - this._armor
    if (newArmor > this._armor) {
      let incomingArmor = newArmor - this._armor
      let armor = this._armor
      this._armor += incomingArmor
      incomingArmor -= this.maxArmor - armor
      if (incomingArmor > 0) {
        this.upgrade += incomingArmor
        this._armor = this.maxArmor
      } else {
        this._armor = newArmor
      }
      return
    }

    let incomingDamage = this._armor - newArmor
    this._armor -= incomingDamage
    incomingDamage = 0

    if (this._armor < 0) {
      this._armor = 0
    }

    this.uiService.update()
  }

  set gold (newGold) {
    this._totalGold += newGold - this._gold
    this._gold = newGold

    if (newGold >= this.maxGold) {
      this._totalItems++
      this.state = 1
      this._gold = 0
    }

    this.uiService.update()
  }

  set upgrade (newUpgrade) {
    this._upgradeProgress = newUpgrade
    if (this._upgradeProgress >= this.maxUpgrade) {
      this._totalUpgrades++
      this.upgrades++
      this.state = 2
      this._upgradeProgress = 0
    }

    this.uiService.update()
  }

  set experience (newExperience) {
    this._totalExperience += newExperience - this._experience
    this._experience = newExperience
    if (this._experience >= this.maxExperience) {
      this._totalUpgrades++
      this.state = 3
      this._experience = 0
    }

    this.uiService.update()
  }

  get health () {
    return this._health
  }

  get armor () {
    return this._armor
  }

  get gold () {
    return this._gold
  }

  get upgrade () {
    return this._upgradeProgress
  }

  get experience () {
    return this._experience
  }

  get maxHealth () {
    return 50 + 10 * this.dexterity - 10
  }

  get maxArmor () {
    return this.items[1] + this.items[2] + this.items[3]
  }

  get maxGold () {
    return 50 + 1 * this.luck - 1
  }

  get maxUpgrade () {
    return 50 + 1 * this.dexterity - 1
  }

  get maxExperience () {
    return 50 + 1 * this.level - 1
  }

  get baseDamage () {
    return 4 + this.strength * 1
  }

  get weaponDamage () {
    return this.items[0]
  }

  updateResources (tiles) {
    let gold = 0
    let potion = 0
    let armor = 0
    let experience = 0
    let sword = 0

    tiles.forEach(tile => {
      if (tile.frame === 0) {
        return
      }
      this.tileService.destroyTile(tile.index)
      if (tile.frame === 4) {
        gold++
      } else if (tile.frame === 3) {
        potion++
      } else if (tile.frame === 2) {
        armor++
      } else if (tile.frame === 1) {
        sword++
      }
    })

    tiles.forEach(tile => {
      if (tile.frame === 0) {
        tile.unpick()
        let totalDamage = this.baseDamage + this.weaponDamage * sword

        if (tile.armor - totalDamage < 0) {
          totalDamage -= tile.armor
          tile.armor = 0
        } else {
          tile.armor -= totalDamage
          return
        }

        if (totalDamage > 0) {
          tile.hp -= totalDamage

          if (tile.hp <= 0) {
            experience++
            this.tileService.destroyTile(tile.index)
          }
        }

        tile.updateUI()
      }
    })

    this.gold += gold
    this.health += potion
    this.armor += armor
    this.experience += experience

    this.uiService.update()
  }

  getStats () {
    return {
      gold: this.gold,
      maxGold: this.maxGold,
      health: this.health,
      maxHealth: this.maxHealth,
      armor: this.armor,
      maxArmor: this.maxArmor,
      base: this.baseDamage,
      weapon: this.weaponDamage,
      upgrade: this.upgrade,
      maxUpgrade: this.maxUpgrade,
      experience: this.experience,
      maxExperience: this.maxExperience
    }
  }

  getMenuState () {
    const data = datum[this.state - 1]
    const title = titles[this.state - 1]
    return data && title ? { data, title } : null
  }

  // xp per kill
  // Bonus XP chance
  // Armor piercing
  // Armor per shield
  // Bonus armor chance
  // Armor durability
  // hp per potion
  // Bonus potion chance
  // gold per coin
  // Bonus coin chance
}
