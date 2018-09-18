import React, { Fragment, Component } from 'react'
import { render } from 'react-dom'
import monster3D from './assets/models/Devil.gltf'
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
          typeId={5454543545454}
          path={monster3D}
          size={{ height: "600px" }}
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