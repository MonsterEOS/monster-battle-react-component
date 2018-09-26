import React, { Component } from 'react'
import { render } from 'react-dom'
import myMonster from './assets/models/Wolf.gltf'
import enemyMonster from './assets/models/Bear.gltf'
import Arena3D from '../../src'
import monsterDecors from '../../src/utils/decors'
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
          myMonsterDecor={monsterDecors.neutral}
          enemyMonsterDecor={monsterDecors.neutral}
          size={{ width: "100%", height: "100%" }}
          background={{ alpha: 1 }}
        />
      </div>
    )
  }
}

render(
  <App />,
  document.querySelector('#demo')
)