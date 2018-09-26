import React, { Component } from 'react'
import { render } from 'react-dom'
import { ActionType } from '../../src/utils/enums'
import myMonster from './assets/models/Rocky.gltf'
import enemyMonster from './assets/models/Bear.gltf'
import Arena3D from '../../src'
import monsterDecors from '../../src/utils/decors'
import "./index.css"

class App extends Component {
  constructor(props) {
    super(props)
    this.arena = React.createRef()
    this.state = {
      attackButtonDisabled: false,
    }
  }

  onAttack = (from) => {
    this.setState({
      attackButtonDisabled: true
    }, () => {
      this.arena.current.changeAnimationState(
        from === "myMonster",
        () => this.setState({
          attackButtonDisabled: false
        })
      )
    })
  }

  render() {
    const { attackButtonDisabled } = this.state

    return (
      <div style={{
        width: "100%",
        height: "90%",
        backgroundColor: "black",
        position: "absolute",
        margin: 0
      }}>
        <Arena3D
          ref={this.arena}
          myMonster={myMonster}
          enemyMonster={enemyMonster}
          size={{ width: "100%", height: "100%" }}
          background={{ alpha: 1 }}
        />

        <div className="buttons-container">
          <div>
            <span>My Monster</span>&nbsp;
            <button
              disabled={attackButtonDisabled}
              onClick={this.onAttack.bind(null, "myMonster")}
            >
              Attack
            </button>
          </div>
          <div>
            <span>Enemy Monster</span> &nbsp;
            <button
              disabled={attackButtonDisabled}
              onClick={this.onAttack.bind(null, "enemyMonster")}
            >
              Attack
            </button>
          </div>
        </div>
      </div>
    )
  }
}

render(
  <App />,
  document.querySelector('#demo')
)