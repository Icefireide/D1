function runTest() {
  LPTE.emit({
    meta: {
      namespace: 'module-valorant-state',
      type: 'run-test',
      version: 1
    }
  })
}

function setRound(round) {
  LPTE.emit({
    meta: {
      namespace: 'module-valorant-state',
      type: 'set-round',
      version: 1
    },
    round
  })
}

function clearGames() {
  LPTE.emit({
    meta: {
      namespace: 'module-valorant-state',
      type: 'clear-round',
      version: 1
    }
  })
}

function setMvp() {
  LPTE.emit({
    meta: {
      namespace: 'module-valorant-state',
      type: 'set-mvp',
      version: 1
    },
    subject: document.querySelector('#mvp').value
  })
}

const setStatus = (componentName, component) => {
  // Status
  if (component._available) {
    document.querySelector(`#${componentName}-status`).innerHTML =
      '<span class="green">Live</span>'
    document.querySelector(`#${componentName}-available`).innerHTML = new Date(
      component._created
    ).toLocaleString()

    document.querySelector(`#${componentName}-update`).innerHTML = new Date(
      component._updated
    ).toLocaleString()
  } else {
    document.querySelector(`#${componentName}-status`).innerHTML =
      '<span class="orange">Not Live</span>'
    if (component._deleted) {
      document.querySelector(`#${componentName}-unavailable`).innerHTML =
        new Date(component._deleted).toLocaleString()
    }
  }
}

const updateUi = (state) => {
  document.querySelector('#loopState').innerHTML = state.loopState

  // Flow
  setStatus('valo-match-info', state.matchInfo)
  setStatus('valo-pre-game', state.preGame)
  /* setStatus('valo-in-game', state.inGame) */
  setStatus('valo-post-game', state.postGame)

  document.querySelector('#mvp').value = state.mvp?.subject
}

const updateMvpList = (state) => {
  if (state.postGame._available) {
    var save = new Option()
    document.querySelector('#mvp').innerHTML = ''
    document.querySelector('#mvp').appendChild(save)
    for (const player of state.postGame.players) {
      if (player.teamId !== 'Neutral') {
        document
          .querySelector('#mvp')
          .appendChild(new Option(player.gameName, player.subject))
      }
    }
  }

  document.querySelector('#mvp').value = state.mvp?.subject
}

const updateRounds = (rounds) => {
  for (i = 0; i < 5; i++) {
    const currentBtn = document.querySelector(`#r${i + 1}`)
    const roundsLength = Object.keys(rounds).length

    if (i + 1 <= roundsLength) {
      currentBtn.classList.add('btn-primary')
      currentBtn.classList.remove('btn-secondary')
    } else if (i + 1 === roundsLength + 1) {
      currentBtn.setAttribute('disabled', false)
      currentBtn.classList.remove('btn-primary')
      currentBtn.classList.add('btn-secondary')
    } else {
      currentBtn.setAttribute('disabled', true)
      currentBtn.classList.remove('btn-primary')
      currentBtn.classList.add('btn-secondary')
    }
  }
}

LPTE.onready(async () => {
  const response = await LPTE.request({
    meta: {
      namespace: 'module-valorant-state',
      type: 'request',
      version: 1
    }
  })

  updateUi(response.state)
  updateMvpList(response.state)

  const roundsResponse = await LPTE.request({
    meta: {
      namespace: 'module-valorant-state',
      type: 'get-rounds',
      version: 1
    }
  })
  updateRounds(roundsResponse.rounds)

  LPTE.on('valorant-state-pre-game', 'create', (e) => {
    updateUi(e.state)
  })

  LPTE.on('valorant-state-pre-game', 'update', (e) => {
    updateUi(e.state)
  })

  LPTE.on('valorant-state-game', 'create', (e) => {
    updateUi(e.state)
  })

  LPTE.on('valorant-state-post-game', 'create', (e) => {
    updateUi(e.state)
    updateMvpList(e.state)
  })

  LPTE.on('valorant-state-rounds', 'update', (e) => {
    updateRounds(e.rounds)
  })

  LPTE.on('valorant-state-mvp', 'update', (e) => {
    document.querySelector('#mvp').value = e.mvp?.subject
  })
})
