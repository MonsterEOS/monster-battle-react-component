import { AttackType } from '../utils/enums'
import animal from '../attacks/sprites/animal.png'
import earth from '../attacks/sprites/earth.png'
import fire from '../attacks/sprites/fire.png'
import light from '../attacks/sprites/light.png'
import metal from '../attacks/sprites/metal.png'
import neutral from '../attacks/sprites/neutral.png'
import poison from '../attacks/sprites/poison.png'
import undead from '../attacks/sprites/undead.png'
import water from '../attacks/sprites/water.png'
import wood from '../attacks/sprites/wood.png'

export default type => {
    switch (type) {
        case AttackType.ANIMAL:
            return {
                src: animal,
                hTiles: 4,
                vTiles: 4,
                durationTile: 60,
                yPositionFactor: 0.5
            }
        case AttackType.EARTH:
            return {
                src: earth,
                hTiles: 6,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.5
            }
        case AttackType.FIRE:
            return {
                src: fire,
                hTiles: 6,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.LIGHT:
            return {
                src: light,
                hTiles: 6,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.5
            }
        case AttackType.METAL:
            return {
                src: metal,
                hTiles: 4,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.NEUTRAL:
            return {
                src: neutral,
                hTiles: 4,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.POISON:
            return {
                src: poison,
                hTiles: 6,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.45
            }
        case AttackType.UNDEAD:
            return {
                src: undead,
                hTiles: 4,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.45
            }
        case AttackType.WATER:
            return {
                src: water,
                hTiles: 6,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.WOOD:
            return {
                src: wood,
                hTiles: 4,
                vTiles: 4,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        default:
            return {
                src: neutral,
                hTiles: 4,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
    }
}