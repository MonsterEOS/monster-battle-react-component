import { AttackType } from './utils/enums'
import animal from '../attacks/animal.png'
import earth from '../attacks/earth.png'
import fire from '../attacks/fire.png'
import light from '../attacks/light.png'
import metal from '../attacks/metal.png'
import neutral from '../attacks/neutral.png'
import poison from '../attacks/poison.png'
import undead from '../attacks/undead.png'
import water from '../attacks/water.png'
import wood from '../attacks/wood.png'

export default type => {
    switch (type) {
        case AttackType.ANIMAL:
            return {
                src: animal,
                hTiles: 5,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.EARTH:
            return {
                src: earth,
                hTiles: 7,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.45
            }
        case AttackType.FIRE:
            return {
                src: fire,
                hTiles: 7,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.LIGHT:
            return {
                src: light,
                hTiles: 7,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.45
            }
        case AttackType.METAL:
            return {
                src: metal,
                hTiles: 5,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.NEUTRAL:
            return {
                src: neutral,
                hTiles: 5,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.POISON:
            return {
                src: poison,
                hTiles: 7,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.45
            }
        case AttackType.UNDEAD:
            return {
                src: undead,
                hTiles: 5,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.45
            }
        case AttackType.WATER:
            return {
                src: water,
                hTiles: 7,
                vTiles: 7,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        case AttackType.WOOD:
            return {
                src: wood,
                hTiles: 5,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
        default:
            return {
                src: neutral,
                hTiles: 5,
                vTiles: 5,
                durationTile: 60,
                yPositionFactor: 0.35
            }
    }
}