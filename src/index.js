import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import GLTFLoader from './utils/GLTFLoader'
import OrbitControls from './utils/OrbitControls'

class Arena3D extends Component {
  constructor(props) {
    super(props)
    this.setMountNodeRef = element => {
      this.mount = element
    }
    // used to calculate the delta between frames
    this.prevTime = 0
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

    window.addEventListener(
      "resize", this.onWindowsResize, false
    )

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
    this.controls.enabled = false
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
    this.pointLight = new THREE.PointLight(directColor, directIntensity, 4000)
    this.pointLight.add(new THREE.Mesh(
      pointLightSphere,
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    ))

    // make it child of the camera and add it to the scene
    this.camera.add(this.pointLight)
    this.scene.add(this.camera)

    // loading monsters with GLTF loader
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(
      myMonster,
      this.loadMonster,
      // TODO: add a loader.
      event => {
        const percentage = (event.loaded / event.total) * 100
        console.log(`Loading my monster 3D model... ${Math.round(percentage)}%`)
      },
      console.error.bind(console)
    )

    // start scene
    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.myMonster !== nextProps.myMonster ||
      this.props.enemyMonster !== nextProps.enemyMonster
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
    this.myEnemyMonsterMixer && this.myEnemyMonsterMixer.update(delta)
    this.controls.update()
    this.renderScene()
    this.prevTime = time
  }

  onWindowsResize = () => {
    // DOM element (canvas) dimensions
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  loadMonster = myGltf => {
    this.myMonsterModel = myGltf
    this.myMonsterObject = this.myMonsterModel.scene

    const myMonsterBox = new THREE.Box3().setFromObject(this.myMonsterObject)
    const myMonsterSize = myMonsterBox.getSize(new THREE.Vector3()).length()

    const { enemyMonster, cameraDistance } = this.props

    const gltfLoader = new GLTFLoader()

    gltfLoader.load(
      enemyMonster,
      enemyGltf => {
        this.myEnemyMonsterModel = enemyGltf
        this.myEnemyMonsterObject = this.myEnemyMonsterModel.scene

        const myEnemyMonsterBox = new THREE.Box3().setFromObject(this.myEnemyMonsterObject)
        const myEnemyMonsterSize = myEnemyMonsterBox.getSize(new THREE.Vector3()).length()

        const avgMonstersSize = (myMonsterSize + myEnemyMonsterSize) / 2

        // Axis and Grid helper
        // this.scene.add(new THREE.AxesHelper(avgMonstersSize * 4))
        this.scene.add(new THREE.GridHelper(avgMonstersSize * 8, 10))

        // clipping planes
        this.camera.near = avgMonstersSize / 100
        this.camera.far = avgMonstersSize * 100

        // distance my enemy monster from my monster
        const enemyDistance = 750
        this.myEnemyMonsterObject.position.z += enemyDistance

        // rotate in Y my monster by 180º
        this.myMonsterObject.rotation.y = Math.PI

        // updates global transform of the monsters
        this.myMonsterObject.updateMatrixWorld()
        this.myEnemyMonsterObject.updateMatrixWorld()

        // add scene
        this.scene.add(this.myMonsterObject)
        this.scene.add(this.myEnemyMonsterObject)

        // start animations
        this.myMonsterMixer = new THREE.AnimationMixer(this.myMonsterObject)
        this.myMonsterMixer.clipAction(
          THREE.AnimationClip.findByName(
            this.myMonsterModel.animations, 'Idle'
          )
        ).play()
        this.myEnemyMonsterMixer = new THREE.AnimationMixer(this.myEnemyMonsterObject)
        this.myEnemyMonsterMixer.clipAction(
          THREE.AnimationClip.findByName(
            this.myEnemyMonsterModel.animations, 'Idle'
          )
        ).play()

        // set camera initial position

        const rotationAngle = -160 * (Math.PI / 180)

        const rotationY = new THREE.Matrix4().makeRotationY(rotationAngle)
        this.baseCameratranslation = new THREE.Matrix4().makeTranslation(
          0, 250, cameraDistance
        )
        const transform = rotationY.multiply(this.baseCameratranslation)
        
        const rotationX = new THREE.Matrix4().makeRotationX(17 * Math.PI / 180)

        const finalTransform = rotationX.multiply(transform)

       // const rotateBack = new THREE.Matrix4().makeRotationY(160 * (Math.PI / 180))

        // Apply the matrix of transformations
        this.camera.applyMatrix(finalTransform)

        // update camera parameters
        this.camera.updateProjectionMatrix()
      },
      // TODO: add a loader.
      event => {
        const percentage = (event.loaded / event.total) * 100
        console.log(`Loading my enemy monster 3D model... ${Math.round(percentage)}%`)
      },
      console.error.bind(console)
    )
  }

  render() {
    const { size } = this.props

    if (this.mount) {
      this.changeStateAnimation()
    }

    return (
      <div
        style={{
          width: size.width,
          height: size.height
        }}
        ref={this.setMountNodeRef}
      />
    )
  }
}

Arena3D.propTypes = {
  myMonster: PropTypes.string.isRequired,
  enemyMonster: PropTypes.string.isRequired,
  cameraDistance: PropTypes.number,
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
  })
}

Arena3D.defaultProps = {
  cameraDistance: 1500,
  size: {
    width: "auto",
    height: "600px"
  },
  ambientIntensity: 0.15,
  ambientColor: 0xffffff,
  directIntensity: 1.7,
  directColor: 0xffffff,
  exposure: 1
}

export default Arena3D