import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ActionType, AttackType } from './utils/enums'
import * as THREE from 'three'
import OrbitControls from './utils/three/OrbitControls'
import {
  debounce,
  applyShader,
  gltfAssetLoader,
  textureAssetLoader
} from './utils'
import Arena from '../models/Arena.gltf'
import VertexStudioMaterial from './utils/VextexStudioMaterial'
import monsterDecors from './utils/decors'
import TileTextureAnimator from './TileTextureAnimator'
import attacks from './attacks'
import "../css/index.css"

class Arena3D extends Component {
  constructor(props) {
    super(props)
    this.setMountNodeRef = element => {
      this.mount = element
    }
    window.addEventListener(
      "resize", this.onWindowsResize, false
    )
    // used to calculate the delta between frames
    this.prevTime = 0
  }

  render() {
    const { size, customStyles } = this.props

    return (
      <div
        style={{
          width: size.width,
          height: size.height,
          ...customStyles
        }}
        ref={this.setMountNodeRef}
      />
    )
  }

  async componentDidMount() {
    const {
      background,
      myMonster,
      enemyMonster,
      exposure,
      ambientIntensity,
      ambientColor,
      directIntensity,
      directColor
    } = this.props

    // default values
    const defaultBackground = { color: "#322e3a", alpha: 1 }
    const canvasBackground = { ...defaultBackground, ...background }

    // DOM element (canvas) dimensions
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    // add scene
    this.scene = new THREE.Scene()

    // add camera
    this.camera = new THREE.PerspectiveCamera(22, width / height, 0.25, 2000)

    // setting controls
    this.controls = new OrbitControls(this.camera, this.mount)
    this.controls.target.set(35, 95, 375)
    this.controls.enabled = true
    this.controls.update()

    // add renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setClearColor(canvasBackground.color, canvasBackground.alpha)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height)
    this.renderer.gammaOutput = true
    this.renderer.toneMappingExposure = exposure
    this.mount.appendChild(this.renderer.domElement)

    // add ambiental light
    this.light = new THREE.AmbientLight(ambientColor, ambientIntensity)
    this.light.position.set(0, 1, 0)
    this.scene.add(this.light)

    // add point light
    const pointLightSphere = new THREE.SphereBufferGeometry(20, 16, 8)
    this.pointLight = new THREE.PointLight(directColor, directIntensity, 6000)
    this.pointLight.add(new THREE.Mesh(
      pointLightSphere,
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    ))

    // make it child of the camera and add it to the scene
    this.camera.add(this.pointLight)
    this.scene.add(this.camera)

    try {

      // load Arena 3D model
      const arenaGltf = await gltfAssetLoader(Arena)
      this.configArena(arenaGltf)

      // load monsters 3D models
      const myMonsterGltf = await gltfAssetLoader(myMonster)
      const enemyMonsterGltf = await gltfAssetLoader(enemyMonster)
      this.configMonsters(myMonsterGltf, enemyMonsterGltf)

    } catch (error) { console.error(error) }

    // start scene
    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
    window.removeEventListener(
      "resize", this.onWindowsResize, false
    )
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.myMonsterCurrentAction !== nextProps.myMonsterCurrentAction ||
      this.props.enemyMonsterCurrentAction !== nextProps.enemyMonsterCurrentAction
    )
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = window.requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  animate = (time) => {
    this.frameId = window.requestAnimationFrame(this.animate)
    const delta = (time - this.prevTime) / 1000

    this.myMonsterMixer && this.myMonsterMixer.update(delta)
    this.enemyMonsterMixer && this.enemyMonsterMixer.update(delta)

    if (this.attackFXReady) {
      this.attackFX.update(1000 * delta);
    }

    this.controls.update()
    this.renderScene()
    this.prevTime = time
  }

  onWindowsResize = debounce(200)(() => {
    // DOM element (canvas) dimensions
    if (this.mount) {
      const width = this.mount.clientWidth
      const height = this.mount.clientHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    }
  })

  configArena = gltf => {
    this.arenaModel = gltf
    this.arenaObject = this.arenaModel.scene
    this.arenaObject.scale.set(1.5, 1.5, 1.5)
    this.arenaObject.position.y += -70
    this.arenaObject.position.z += 400

    this.arenaObject.updateMatrixWorld()

    this.scene.add(this.arenaObject)
  }

  configMonsters = async (myMonsterGltf, enemyMonsterGltf) => {
    const {
      cameraDistance,
      cameraRotation,
      cameraHeight,
      cameraHighAngle,
      enableGrid,
      enemyDistance
    } = this.props

    this.myMonsterModel = myMonsterGltf
    this.myMonsterObject = this.myMonsterModel.scene

    this.enemyMonsterModel = enemyMonsterGltf
    this.enemyMonsterObject = this.enemyMonsterModel.scene

    // 3D boxes from monsters to get a size from each
    const myMonsterBox = new THREE.Box3().setFromObject(this.myMonsterObject)
    this.myMonsterSize = myMonsterBox.getSize(new THREE.Vector3()).length()

    const enemyMonsterBox = new THREE.Box3().setFromObject(this.enemyMonsterObject)
    this.enemyMonsterSize = enemyMonsterBox.getSize(new THREE.Vector3()).length()

    // monsters average size
    const avgMonstersSize = (this.myMonsterSize + this.enemyMonsterSize) / 2

    // Grid helper
    enableGrid && this.scene.add(new THREE.GridHelper(avgMonstersSize * 8, 10))

    // clipping planes
    this.camera.near = 1450
    this.camera.far = avgMonstersSize * 100

    // distance of enemy monster from my monster
    this.enemyMonsterObject.position.z += enemyDistance

    // rotate in Y enemy monster by 180º
    this.enemyMonsterObject.rotation.y = Math.PI

    // updates global transform of the monsters
    this.myMonsterObject.updateMatrixWorld()
    this.enemyMonsterObject.updateMatrixWorld()

    // loading VertexStudioMaterial
    const vertexStudioMaterial = await VertexStudioMaterial()

    // applying shaders to both monsters
    applyShader(this.myMonsterObject, vertexStudioMaterial, this.props.myMonsterDecor)
    applyShader(this.enemyMonsterObject, vertexStudioMaterial, this.props.enemyMonsterDecor)

    // applying shaders to coliseum
    if (this.props.coliseumDecor) {
      applyShader(this.arenaObject, vertexStudioMaterial, this.props.coliseumDecor)
    }

    // add to scene
    this.scene.add(this.myMonsterObject)
    this.scene.add(this.enemyMonsterObject)

    // define animation mixers
    this.myMonsterMixer = new THREE.AnimationMixer(this.myMonsterObject)
    this.enemyMonsterMixer = new THREE.AnimationMixer(this.enemyMonsterObject)

    // set camera initial position

    const rotationAngle = cameraRotation * (Math.PI / 180)

    const rotationY = new THREE.Matrix4().makeRotationY(rotationAngle)
    const baseCameratranslation = new THREE.Matrix4()
      .makeTranslation(0, cameraHeight, cameraDistance)

    const transform = rotationY.multiply(baseCameratranslation)

    const rotationX = new THREE.Matrix4().makeRotationX(cameraHighAngle * Math.PI / 180)

    const finalTransform = rotationX.multiply(transform)

    // apply the matrix of transformations
    this.camera.applyMatrix(finalTransform)

    // update camera parameters
    this.camera.updateProjectionMatrix()

    // start idle animations
    this.myMonsterMixer
      .clipAction(THREE.AnimationClip.findByName(
        this.myMonsterModel.animations,
        ActionType.IDLE
      ))
      .play()

    this.enemyMonsterMixer
      .clipAction(THREE.AnimationClip.findByName(
        this.enemyMonsterModel.animations,
        ActionType.IDLE
      ))
      .play()
  }

  getAttackFX = async (attackType, repetitions) => {
    const attack = attacks(attackType)

    const spriteTexture = await textureAssetLoader(attack.src)

    // will animate the sprite sheets
    this.attackFX = new TileTextureAnimator(
      spriteTexture,
      attack.hTiles,
      attack.vTiles,
      attack.durationTile,
      repetitions
    )

    // material with the loaded texture
    const attackFxMaterial = new THREE.SpriteMaterial({
      map: spriteTexture,
      side: THREE.DoubleSide,
      transparent: true
    })

    // return plane that is always pointing toward the camera
    return new THREE.Sprite(attackFxMaterial)
  }

  playAttackFX = (monsterObject, monsterSize) => {
    this.getAttackFX(this.currentAttackType, 1)
      .then(attackFxPlane => {
        attackFxPlane.scale.set(
          monsterSize,
          monsterSize,
          1.0
        )
        attackFxPlane.position.set(
          monsterObject.position.x,
          monsterSize * 0.5,
          monsterObject.position.z
        )
        this.scene.add(attackFxPlane)
        this.attackFXReady = true
      })
  }

  playAttackAnimation = (isMyMonsterAttacking, attackType = AttackType.NEUTRAL) =>
    new Promise((resolve, reject) => {
      try {
        // define animation clip to be played for each monster
        const myMonsterAnimation = THREE.AnimationClip.findByName(
          this.myMonsterModel.animations,
          isMyMonsterAttacking ? ActionType.ATTACK : ActionType.HIT_REACT
        )

        const enemyMonsterAnimation = THREE.AnimationClip.findByName(
          this.enemyMonsterModel.animations,
          isMyMonsterAttacking ? ActionType.HIT_REACT : ActionType.ATTACK
        )

        // if any of the monsters lacks Attack or HitReact animation,
        // resolve inmediatly, leaving them at Idle state only.
        if (!myMonsterAnimation || !enemyMonsterAnimation) {
          resolve()
        }

        // define to play animations once
        this.myMonsterAction && this.myMonsterAction.stop()
        this.myMonsterAction = this.myMonsterMixer
          .clipAction(myMonsterAnimation)
          .setLoop(THREE.LoopOnce)
          .reset()

        this.enemyMonsterAction && this.enemyMonsterAction.stop()
        this.enemyMonsterAction = this.enemyMonsterMixer
          .clipAction(enemyMonsterAnimation)
          .setLoop(THREE.LoopOnce)
          .reset()

        // making the attack type global to reach it in the listener
        this.currentAttackType = attackType

        // define listener to play HitReact animation after the Attack
        isMyMonsterAttacking
          ? this.myMonsterMixer.addEventListener(
            "finished",
            this.myMonsterAttacking
          )
          : this.enemyMonsterMixer.addEventListener(
            "finished",
            this.enemyMonsterAttacking
          )

        // play Attack animation
        isMyMonsterAttacking
          ? this.myMonsterAction.play()
          : this.enemyMonsterAction.play()

        // defining listener to resolve promise
        isMyMonsterAttacking
          ? this.enemyMonsterMixer.addEventListener("finished", resolve)
          : this.myMonsterMixer.addEventListener("finished", resolve)
      } catch (error) {
        reject(error)
      }
    })

  myMonsterAttacking = () => {
    this.playAttackFX(this.enemyMonsterObject, this.enemyMonsterSize)
    // play HitReact animation
    this.enemyMonsterAction.play()
    this.myMonsterMixer.removeEventListener("finished", this.myMonsterAttacking)
  }

  enemyMonsterAttacking = () => {
    this.playAttackFX(this.myMonsterObject, this.myMonsterSize)
    // play HitReact animation
    this.myMonsterAction.play()
    this.enemyMonsterMixer.removeEventListener("finished", this.enemyMonsterAttacking)
  }
}

Arena3D.propTypes = {
  myMonster: PropTypes.string.isRequired,
  enemyMonster: PropTypes.string.isRequired,
  myMonsterDecor: PropTypes.object,
  enemyMonsterDecor: PropTypes.object,
  coliseumDecor: PropTypes.object,
  enemyDistance: PropTypes.number,
  cameraDistance: PropTypes.number,
  cameraRotation: PropTypes.number,
  cameraHeight: PropTypes.number,
  cameraHighAngle: PropTypes.number,
  ambientIntensity: PropTypes.number,
  ambientColor: PropTypes.number,
  directIntensity: PropTypes.number,
  directColor: PropTypes.number,
  size: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string
  }),
  background: PropTypes.shape({
    color: PropTypes.string,
    alpha: PropTypes.number
  }),
  enableGrid: PropTypes.bool,
  customStyles: PropTypes.object
}

Arena3D.defaultProps = {
  myMonsterDecor: monsterDecors.neutral,
  enemyMonsterDecor: monsterDecors.neutral,
  coliseumDecor: undefined,
  cameraDistance: 1700,
  cameraRotation: -175,
  cameraHeight: 350,
  cameraHighAngle: 15,
  enemyDistance: 900,
  size: {
    width: "auto",
    height: "600px"
  },
  ambientIntensity: 0.15,
  ambientColor: 0xffffff,
  directIntensity: 1.7,
  directColor: 0xffffff,
  exposure: 1,
  enableGrid: false,
  customStyles: {}
}

export default Arena3D