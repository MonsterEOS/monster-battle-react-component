import React, { Component } from 'react'
import { render } from 'react-dom'
import { AttackType } from '../../src/utils/enums'
import myMonster from './assets/models/bear.gltf'
import enemyMonster from './assets/models/rocky.gltf'
import Arena3D from '../../src'
import "./index.css"

const MONSTERS = {
  MY_MONSTER: "myMonster",
  ENEMY_MONSTER: "enemyMonster"
}

class App extends Component {
  constructor(props) {
    super(props)
    this.arena = React.createRef()
    this.state = {
      attackButtonDisabled: false,
      [MONSTERS.MY_MONSTER]: {
        attackType: AttackType.NEUTRAL
      },
      [MONSTERS.ENEMY_MONSTER]: {
        attackType: AttackType.NEUTRAL
      }
    }
  }

  render() {
    const { attackButtonDisabled } = this.state

    return (
      <div className="arena-container">
        <Arena3D
          ref={this.arena}
          myMonster={myMonster}
          enemyMonster={enemyMonster}
          size={{ width: "100%", height: "100%" }}
          background={{ alpha: 1 }}
        />
        {this.buttons(attackButtonDisabled)}
      </div>
    )
  }

  enableAttackButtons = () =>
    this.setState({ ...this.state, attackButtonDisabled: false })

  onAttack = (from) => {
    const isMyTurn = from === MONSTERS.MY_MONSTER
    this.setState(
      { ...this.state, attackButtonDisabled: true },
      () => {
        this.arena.current
          .playAttackAnimation(
            isMyTurn,
            this.state[from].attackType
          )
          .then(this.enableAttackButtons)
      })
  }

  onAttackTypeChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: {
        attackType: event.target.value
      }
    })
  }

  buttons = (isDisabled) =>
    <div className="buttons-container">
      {this.monsterActions(MONSTERS.MY_MONSTER, "My Monster", isDisabled)}
      {this.monsterActions(MONSTERS.ENEMY_MONSTER, "Enemy Monster", isDisabled)}
    </div>

  monsterActions = (who, title, isDisabled) =>
    <div className="attack">
      <h4>{title}</h4>
      <select
        disabled={isDisabled}
        name={who}
        value={this.state[who].attackType}
        onChange={this.onAttackTypeChange}
      >
        {Object.keys(AttackType).map(
          attack =>
            <option key={attack} value={AttackType[attack]}>
              {AttackType[attack]}
            </option>
        )}
      </select>
      <button
        disabled={isDisabled}
        onClick={this.onAttack.bind(null, who)}
      >
        Attack
      </button>
    </div>
}

render(
  <App />,
  document.querySelector('#demo')
)