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
      <Arena3D
          myMonster={myMonster}
          enemyMonster={enemyMonster}
          size={{ width: "100vw", height: "50vw" }}
          background={{ alpha: 1 }}
        />
    )
  }
}

render(
  <App />,
  document.querySelector('#demo')
)