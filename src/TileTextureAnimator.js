import * as THREE from 'three'

class TileTextureAnimator {
    constructor(texture, hTiles, vTiles, durationTile) {
        // current tile number
        this.currentTile = 0

        // internal time counter
        this.currentTime = 0

        //duration of every tile
        this.durationTile = durationTile

        // amount of horizontal and vertical tiles
        this.hTiles = hTiles
        this.vTiles = vTiles

        // total count of tiles
        this.totalTiles = this.hTiles * this.vTiles

        // texture (sprite sheet)
        this.texture = texture

        // corresponds to U in UV mapping
        this.texture.wrapS = THREE.RepeatWrapping

        // corresponds to V in UV mapping
        this.texture.wrapT = THREE.RepeatWrapping

        // how many times the texture is repeated across the surface, 
        // in each direction U and V
        this.texture.repeat.set(1 / this.hTiles, 1 / this.vTiles)
    }

    update(time) {
        this.currentTime += time

        while (this.currentTime > this.durationTile) {
            this.currentTime -= this.durationTile
            // move to next tile
            this.currentTile++

            // start again
            if (this.currentTile === this.totalTiles) {
                this.currentTile = 0
            }

            // offset texture on `x`
            const column = this.currentTile % this.hTiles
            this.texture.offset.x = column / this.hTiles

            // offset texture on `y`
            const row = Math.floor(this.currentTile / this.hTiles)
            this.texture.offset.y = row / this.vTiles
        }
    }
}

export default TileTextureAnimator