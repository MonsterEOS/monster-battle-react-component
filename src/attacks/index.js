import * as THREE from 'three'
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
                durationTile: 40
            }
        case AttackType.EARTH:
            return {
                src: earth,
                hTiles: 6,
                vTiles: 7,
                durationTile: 40
            }
        default:
            return {
                src: neutral,
                hTiles: 4,
                vTiles: 5,
                durationTile: 40
            }
    }
}