import React, { Component } from 'react'
import { render } from 'react-dom'
import myMonster from './assets/models/bear.gltf'
import enemyMonster from './assets/models/rocky.gltf'
import Arena3D from '../../src'
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
    const isMyTurn = from === "myMonster"
    this.setState({
      attackButtonDisabled: true
    }, () => {
      this.arena
        .current
        .changeAnimationState(isMyTurn)
        .then(this.enableAttackButtons)
    })
  }

  enableAttackButtons = () =>
    this.setState({ attackButtonDisabled: false })

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
        {this.buttons(attackButtonDisabled)}
      </div>
    )
  }

  buttons = (isDisabled) =>
    <div className="buttons-container">
      <div>
        <span>My Monster</span>&nbsp;
        <button
          disabled={isDisabled}
          onClick={this.onAttack.bind(null, "myMonster")}
        >
          Attack
        </button>
      </div>
      <div>
        <span>Enemy Monster</span> &nbsp;
        <button
          disabled={isDisabled}
          onClick={this.onAttack.bind(null, "enemyMonster")}
        >
          Attack
        </button>
      </div>
    </div>
}

render(
  <App />,
  document.querySelector('#demo')
)