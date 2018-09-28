import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ActionType } from './utils/enums'
import * as THREE from 'three'
import GLTFLoader from './utils/three/GLTFLoader'
import OrbitControls from './utils/three/OrbitControls'
import { debounce } from './utils'
import Arena from '../models/Arena.gltf'
import VertexStudioMaterial from './utils/VextexStudioMaterial'
import monsterDecors from './utils/decors'
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
    this.myMonsterAttacking = this.myMonsterAttacking.bind(this)
    this.enemyMonsterAttacking = this.enemyMonsterAttacking.bind(this)
  }

  componentDidMount() {
    const {
      background,
      myMonster,
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

    VertexStudioMaterial()
      .then(VertexStudioMaterial => {
        this.monsterMaterial = VertexStudioMaterial

        // GLTF loader
        const gltfLoader = new GLTFLoader()

        // loading Arena environment
        gltfLoader.load(
          Arena,
          arenaGltf => {
            this.arenaModel = arenaGltf
            this.arenaObject = this.arenaModel.scene
            this.arenaObject.scale.set(1.5, 1.5, 1.5)
            this.arenaObject.position.y += -70
            this.arenaObject.position.z += 400

            this.arenaObject.updateMatrixWorld()

            // loading monsters
            gltfLoader.load(
              myMonster,
              this.loadMonsters,
              // TODO: add a loader.
              event => {
                const percentage = (event.loaded / event.total) * 100
                console.log(`Loading my monster 3D model... ${Math.round(percentage)}%`)
              },
              console.error.bind(console)
            )
          }
        )
      })

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
      this.frameId = requestAnimationFrame(this.animate)
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

  loadMonsters = myGltf => {
    this.myMonsterModel = myGltf
    this.myMonsterObject = this.myMonsterModel.scene

    const myMonsterBox = new THREE.Box3().setFromObject(this.myMonsterObject)
    const myMonsterSize = myMonsterBox.getSize(new THREE.Vector3()).length()

    const {
      enemyMonster,
      cameraDistance,
      cameraRotation,
      cameraHeight,
      cameraHighAngle,
      enableGrid,
      enemyDistance
    } = this.props

    // loading enemyMonster with GLTF loader
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(
      enemyMonster,
      enemyGltf => {
        this.enemyMonsterModel = enemyGltf
        this.enemyMonsterObject = this.enemyMonsterModel.scene

        const enemyMonsterBox = new THREE.Box3().setFromObject(this.enemyMonsterObject)
        const enemyMonsterSize = enemyMonsterBox.getSize(new THREE.Vector3()).length()

        const avgMonstersSize = (myMonsterSize + enemyMonsterSize) / 2

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

        // applying shaders to both monsters
        this.myMonsterObject.traverse(child => {
          if (child.isMesh) {
            if (child.material[0]) {
              child.material.forEach((material, idx) => {
                if (material.map) {
                  child.material[idx] = this.monsterMaterial(
                    material.map,
                    this.props.myMonsterDecor
                  )
                }
              })
            }
            else {
              if (child.material.map) {
                child.material = this.monsterMaterial(
                  child.material.map,
                  this.props.myMonsterDecor
                )
              }
            }
          }
        })

        this.enemyMonsterObject.traverse(child => {
          if (child.isMesh) {
            if (child.material[0]) {
              child.material.forEach((material, idx) => {
                if (material.map) {
                  child.material[idx] = this.monsterMaterial(
                    material.map,
                    this.props.enemyMonsterDecor
                  )
                }
              })
            }
            else {
              if (child.material.map) {
                child.material = this.monsterMaterial(
                  child.material.map,
                  this.props.enemyMonsterDecor
                )
              }
            }
          }
        })

        // applying shaders to coliseum
        if (this.props.coliseumDecor) {
          this.arenaObject.traverse(child => {
            if (child.isMesh) {
              if (child.material[0]) {
                child.material.forEach((material, idx) => {
                  if (material.map) {
                    child.material[idx] = this.monsterMaterial(
                      material.map,
                      this.props.coliseumDecor
                    )
                  }
                })
              }
              else {
                if (child.material.map) {
                  child.material = this.monsterMaterial(
                    child.material.map,
                    this.props.coliseumDecor
                  )
                }
              }
            }
          })
        }

        // add to scene
        this.scene.add(this.myMonsterObject)
        this.scene.add(this.enemyMonsterObject)
        this.scene.add(this.arenaObject)

        // define animation mixers
        this.myMonsterMixer = new THREE.AnimationMixer(this.myMonsterObject)
        this.enemyMonsterMixer = new THREE.AnimationMixer(this.enemyMonsterObject)

        // set camera initial position

        const rotationAngle = cameraRotation * (Math.PI / 180)

        const rotationY = new THREE.Matrix4().makeRotationY(rotationAngle)
        this.baseCameratranslation = new THREE.Matrix4().makeTranslation(
          0, cameraHeight, cameraDistance
        )
        const transform = rotationY.multiply(this.baseCameratranslation)

        const rotationX = new THREE.Matrix4().makeRotationX(cameraHighAngle * Math.PI / 180)

        const finalTransform = rotationX.multiply(transform)

        // Apply the matrix of transformations
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
      },
      // TODO: add a loader.
      event => {
        const percentage = (event.loaded / event.total) * 100
        console.log(`Loading my enemy monster 3D model... ${Math.round(percentage)}%`)
      },
      console.error.bind(console)
    )
  }

  changeAnimationState = (isMyMonsterAttacking) => new Promise((resolve, reject) => {
    try {
      // define animation clip to play for each monster
      const myMonsterAnimation = THREE.AnimationClip.findByName(
        this.myMonsterModel.animations,
        isMyMonsterAttacking ? ActionType.ATTACK : ActionType.HIT_REACT
      )

      const enemyMonsterAnimation = THREE.AnimationClip.findByName(
        this.enemyMonsterModel.animations,
        isMyMonsterAttacking ? ActionType.HIT_REACT : ActionType.ATTACK
      )

      if (!myMonsterAnimation || !enemyMonsterAnimation) {
        resolve()
      }

      // define to play animation once
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

  myMonsterAttacking() {
    this.enemyMonsterAction.play()
    this.myMonsterMixer.removeEventListener("finished", this.myMonsterAttacking)
  }

  enemyMonsterAttacking() {
    this.myMonsterAction.play()
    this.enemyMonsterMixer.removeEventListener("finished", this.enemyMonsterAttacking)
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