import React, { Component } from 'react'
import { render } from 'react-dom'
import myMonster from './assets/models/Rocky.gltf'
import enemyMonster from './assets/models/Bear.gltf'
import Arena3D from '../../src'
import "./index.css"

class App extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        position: "absolute",
        margin: 0
      }}>
        <Arena3D
          myMonster={myMonster}
          enemyMonster={enemyMonster}
          size={{ width: "100%", height: "100%" }}
          background={{ alpha: 1 }}
          zoom={true}
          enableGrid={true}
          cameraDistance={1700}
          cameraRotation={-175}
          cameraHeight={350}
          enemyDistance={950}
          cameraHighAngle={15}
        />
      </div>
    )
  }
}

render(
  <App />,
  document.querySelector('#demo')
)