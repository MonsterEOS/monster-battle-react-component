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
    window.addEventListener(
      "resize", this.onWindowsResize, false
    )
    // used to calculate the delta between frames
    this.prevTime = 0
  }

  componentDidMount() {
    const { background, path, exposure, ambientIntensity, ambientColor, directIntensity, directColor, zoom } = this.props

    // default values
    const defaultBackground = { color: "#322e3a", alpha: 1 }
    const canvasBackground = { ...defaultBackground, ...background }

    // DOM element (canvas) dimensions
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    // add scene
    this.scene = new THREE.Scene()

    // add camera
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.25, 1000)

    // setting controls
    this.controls = new OrbitControls(this.camera, this.mount)
    this.controls.target.set(0, 0, 0)
    this.controls.screenSpacePanning = true
    this.controls.enableZoom = zoom
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
    this.pointLight = new THREE.PointLight(directColor, directIntensity, 1000)
    this.pointLight.add(new THREE.Mesh(
      pointLightSphere,
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    ))

    // make it child of the camera and add it to the scene
    this.camera.add(this.pointLight)
    this.scene.add(this.camera)

    // loading monster with GLTF loader
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(
      path,
      this.loadMonster,
      // TODO: add a loader.
      event => {
        const percentage = (event.loaded / event.total) * 100
        console.log(`Loading 3D monster model... ${Math.round(percentage)}%`)
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
    return !(nextProps.action === this.props.action)
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

    this.monsterMixer && this.monsterMixer.update(delta)
    this.sleepingMixer && this.sleepingMixer.update(delta)
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

  loadMonster = gltf => {
    this.model = gltf
    this.monster = this.model.scene

    const { rotation, position, cameraPosition } = this.props
    const defaultValues = { x: 0, y: 0, z: 0 }
    const monsterRot = { ...defaultValues, ...rotation }
    const monsterPos = { ...defaultValues, ...position }
    const cameraPos = { ...defaultValues, ...cameraPosition }

    // center monster
    const box = new THREE.Box3().setFromObject(this.monster)
    const size = box.getSize(new THREE.Vector3()).length()
    const center = box.getCenter(new THREE.Vector3())

    // clipping planes
    this.camera.near = size / 100
    this.camera.far = size * 100

    // set monster initial position
    this.monster.position.x += (this.monster.position.x - center.x)
    this.monster.position.y += (this.monster.position.y - center.y)
    this.monster.position.z += (this.monster.position.z - center.z)

    // set monster position relative to initial position
    this.monster.position.x += monsterPos.x
    this.monster.position.y += monsterPos.y
    this.monster.position.z += monsterPos.z

    // set model initial rotation
    this.monster.rotation.x += monsterRot.x
    this.monster.rotation.y += monsterRot.y
    this.monster.rotation.z += monsterRot.z

    // updates global transform of the monster
    this.monster.updateMatrixWorld()

    // how far you can dolly out
    this.controls.maxDistance = size * 10

    // set camera initial position
    this.camera.lookAt(center)
    this.camera.position.z += size

    // set camera position relative to initial position
    this.camera.position.x += cameraPos.x
    this.camera.position.y += cameraPos.y
    this.camera.position.z += cameraPos.z

    // update camera parameters
    this.camera.updateProjectionMatrix()

    // backup camera to restore it later
    this.backupCamera = this.camera.clone()

    // add scene
    this.scene.add(this.monster)

    // start animation
    this.monsterMixer = new THREE.AnimationMixer(this.monster)
    this.monsterMixer.clipAction(
      this.model.animations[0]
    ).play()
  }

  applyPropertyUpdate = () => {
    const { autoRotate, autoRotateSpeed } = this.props

    // controls
    this.controls.autoRotate = autoRotate
    this.controls.autoRotateSpeed = autoRotateSpeed
  }

  render() {
    const { size } = this.props

    if (this.mount) {
      this.applyPropertyUpdate()
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
  path: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number
  }),
  rotation: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number
  }),
  autoRotate: PropTypes.bool,
  autoRotateSpeed: PropTypes.number,
  cameraPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number
  }),
  zoom: PropTypes.bool,
  ambientIntensity: PropTypes.number,
  ambientColor: PropTypes.number,
  directIntensity: PropTypes.number,
  directColor: PropTypes.number,
  exposure: PropTypes.number,
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
  size: {
    width: "auto",
    height: "600px"
  },
  autoRotate: false,
  autoRotateSpeed: -10,
  zoom: true,
  ambientIntensity: 0.15,
  ambientColor: 0xffffff,
  directIntensity: 1.7,
  directColor: 0xffffff,
  exposure: 1,
  darkeningColor: 0x000000
}

export default Arena3D