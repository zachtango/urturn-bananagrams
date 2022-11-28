/* eslint-disable */
import React, { useState, useEffect } from 'react'

import client, { events, makeMove } from '@urturn/client'

import './App.css'
import { useRef } from 'react'

const getStatusMsg = ({
  status, winners, finished, plrToMove, curPlr,
}) => {
  // console.log(plrToMove, curPlr)
  if (finished) {
    let s = ''
    
    for(const winner of winners){
      s += `${winner.username} `
    }

    s += `have the most characters in their word list (${winners[0].charCount})`

    return s
  } if (status === 'preGame') {
    return 'Waiting on for another player to join...'
  } if (status === 'inGame') {
    if (plrToMove.id === curPlr?.id) {
      return "It's ur turn, click on a square"
    }
    return `Waiting on other player ${plrToMove.username} to make their move...`
  }
  return 'Error: You should never see this. Contact developers!'
}

function App() {
  const [roomState, setRoomState] = useState(client.getRoomState() || {})
  useEffect(() => {
    const onStateChanged = (newRoomState) => {
      setRoomState(newRoomState)
    }
    events.on('stateChanged', onStateChanged)
    return () => {
      events.off('stateChanged', onStateChanged)
    }
  }, [])

  const [curPlr, setCurPlr] = useState()
  useEffect(() => {
    const setupCurPlr = async () => {
      const newCurPlr = await client.getLocalPlayer()
      setCurPlr(newCurPlr)
    }
    setupCurPlr()
  }, [])

  const [word, setWord] = useState('')

  const inputRef = useRef(null)

  const focusInput = () => inputRef.current.focus()

  const [recentErrorMsg, setRecentErrorMsg] = useState(null)

  const {
    state: {
      letters = [],
      status,
      winners,
      currPlayerIndex,
      playerIdToWords,
      activePlayers
    } = {},
  } = roomState
  const { players = [], finished } = roomState
  // console.log(players, status, currPlayerIndex)
  const generalStatus = getStatusMsg({
    status, winners, finished, plrToMove: status === 'inGame' ? players.find(p => p.id === activePlayers[currPlayerIndex]) : null, curPlr,
  })
  
  const boardLetters = letters.map((tuple, i) => {
    let t = tuple[1] ? 'shown' : 'hidden'

    return (
      <div className={`letter letter-${t} ${!tuple[0] ? 'empty' : ''}`}
        onClick={() => {
          if(!tuple[1]) makeMove({index: i})
          focusInput()
        }}
      >
        <span>{tuple[1] && tuple[0].toUpperCase()}</span>
      </div>
    )
  })

  const playerCards = players.map(player => (
    <div className='player-card'>
      <h4>{player.username}</h4>
      <h5>{activePlayers.includes(player.id) ? 'Status: In' : 'Status: Out'}</h5>
      {[...playerIdToWords[player.id]].map(w => <li>{w}</li>)}
    </div>
  ))

  return (
    <div className='App'>
      <h2 className='status'>{generalStatus}</h2>

      <div className='chat'>
        <h3>Enter word</h3>
        <form
          onSubmit={e => {
            e.preventDefault()
            
            if(word.length < 3) return

            setWord('')
            makeMove({word: word})
          }}
        >
          <input
            ref={inputRef}
            type='text'
            onChange={e => setWord(e.target.value)}
            value={word}
          />
        </form>
      </div>

      <div className='board'>
        {boardLetters}
      </div>

      <div className='players-board'>
        {playerCards}
      </div>

      <button onClick={() => makeMove({finish: true})}>Tap out (I can't think of any more words)</button>
    </div>
  )
}

export default App
