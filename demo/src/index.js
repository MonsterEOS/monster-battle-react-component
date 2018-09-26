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
      myMonsterCurrentAction: ActionType.IDLE,
      enemyMonsterCurrentAction: ActionType.IDLE,
      attackButtonDisabled: false,
    }
  }

  onAttack = (from) => {
    this.setState({
      ...this.state,
      attackButtonDisabled: true
    }, () => {

    })
  }

  render() {
    const {
      myMonsterCurrentAction,
      enemyMonsterCurrentAction,
      attackButtonDisabled
    } = this.state

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
          myMonsterCurrentAction={myMonsterCurrentAction}
          enemyMonsterCurrentAction={enemyMonsterCurrentAction}
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