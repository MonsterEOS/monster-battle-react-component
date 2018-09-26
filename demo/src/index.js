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
    this.state = {
      myMonsterCurrentAction: ActionType.IDLE,
      enemyMonsterCurrentAction: ActionType.IDLE
    }
  }

  onChange = (event) => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value
    })
  }

  render() {
    const { myMonsterCurrentAction, enemyMonsterCurrentAction } = this.state

    return (
      <div style={{
        width: "100%",
        height: "90%",
        backgroundColor: "black",
        position: "absolute",
        margin: 0
      }}>
        <Arena3D
          myMonster={myMonster}
          enemyMonster={enemyMonster}
<<<<<<< HEAD
          myMonsterDecor={monsterDecors.neutral}
          enemyMonsterDecor={monsterDecors.neutral}
=======
>>>>>>> c5c300f0f225895e4b8e8f6dd5db819d825c7764
          myMonsterCurrentAction={myMonsterCurrentAction}
          enemyMonsterCurrentAction={enemyMonsterCurrentAction}
          size={{ width: "100%", height: "100%" }}
          background={{ alpha: 1 }}
        />
        My Monster &nbsp;
        <select
          name="myMonsterCurrentAction"
          value={myMonsterCurrentAction}
          onChange={this.onChange}
        >
          <option value={ActionType.ATTACK}>{ActionType.ATTACK}</option>
          <option value={ActionType.HIT_REACT}>{ActionType.HIT_REACT}</option>
        </select>
        <br />
        Enemy Monster &nbsp;
        <select
          name="enemyMonsterCurrentAction"
          value={enemyMonsterCurrentAction}
          onChange={this.onChange}
        >
          <option value={ActionType.ATTACK}>{ActionType.ATTACK}</option>
          <option value={ActionType.HIT_REACT}>{ActionType.HIT_REACT}</option>
        </select>
      </div>
    )
  }
}

render(
  <App />,
  document.querySelector('#demo')
)