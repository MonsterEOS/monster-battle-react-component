import React, { Fragment, Component } from 'react'
import { render } from 'react-dom'
import myMonster from './assets/models/Devil.gltf'
import enemyMonster from './assets/models/Rocky.gltf'
import Arena3D from '../../src'

class App extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Fragment>
        <h1>Arena3D</h1>
        <Arena3D
          myMonster={myMonster}
          enemyMonster={enemyMonster}
          size={{ height: "800px" }}
          background={{ alpha: 1 }}
          zoom={true}
        />
      </Fragment>
    )
  }
}

render(
  <App />,
  document.querySelector('#demo')
)