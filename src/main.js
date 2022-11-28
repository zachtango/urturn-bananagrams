import { Status, LETTERS, shuffle, letterCount, getWinners } from './util'
import {wordsRaw} from './words.js'

const words = new Set(wordsRaw);

const AVAILABLE = true

function onRoomStart() {
  const state = {
    status: Status.PreGame,
    usedWords: [],
    letters: [],
    winners: null,
    playerIdToWords: {},
    currPlayerIndex: 0,
    finishedPlayerIds: [],
    activePlayers: []
  }

  for(let i = 0; i < LETTERS.length; i++){
    state.letters.push([LETTERS[i], false])
  }
  
  shuffle(state.letters)

  return { state }
}

function onPlayerJoin(player, roomState) {
  const { players, state } = roomState

  state.activePlayers.push(player.id)
  state.playerIdToWords[player.id] = []

  if (players.length === 2) { 
    state.status = Status.InGame
  }
  state.status = Status.InGame//fixme
  // still waiting on another player so make no modifications
  return {state}
}

function onPlayerMove(player, move, roomState) {
  const { state, players, logger } = roomState

  if(!state.activePlayers.includes(player.id)){
    throw new Error("player not an active player")
  }

  // validate player moves
  if (state.status !== Status.InGame) {
    throw new Error("game is not in progress, can't make move!")
  }
  // console.log(move)
  const {word, index, finish} = move

  if(word && word.length >= 3){
    // console.log("WORD SUBMITTED")
    
    const lCount = letterCount(state.letters.filter(tuple => tuple[1] === AVAILABLE).map(tuple => tuple[0]))
    const wCount = letterCount(word)
    
    let flag = true

    for(const c in wCount){
      if( !lCount[c] || (lCount[c] < wCount[c]) ){
        flag = false
        break
      }
    }

    if( flag && words.has(word) ){
      let letters = [...state.letters]
      
      for(let i = 0; i < letters.length; i++){
        if(letters[i][0] && letters[i][1] === AVAILABLE && wCount[letters[i][0]] > 0){
          wCount[letters[i][0]] -= 1
          letters[i][0] = '';
        }
      }

      state.letters = letters

      state.playerIdToWords[player.id].push(word)
    }

  } else if((typeof index) === 'number') {
    if (state.activePlayers[state.currPlayerIndex] !== player.id) {
      throw new Error(`Its not this player's turn: ${player.username}`)
    }
    
    state.letters[index][1] = true
    state.currPlayerIndex = (state.currPlayerIndex + 1) % state.activePlayers.length
  } else if(finish) { // player can't think of any more words    
    
    state.activePlayers = state.activePlayers.filter(id => id !== player.id)
    state.currPlayerIndex %= state.activePlayers.length
    
    if(state.activePlayers.length === 0){
      // calculate winner
      const playerCharCounts = {}
      let maxCount = 0
      for(const id in state.playerIdToWords){
        let count = 0;
        for(const word of state.playerIdToWords[id]){
          count += word.length
        }
        maxCount = Math.max(maxCount, count)
        playerCharCounts[id] = count
      }

      state.winners = getWinners(playerCharCounts, players, maxCount)
      state.status = Status.EndGame
      // console.log(state.winners)
      return {state, finished: true, joinable: false}
    }
  } else{
    throw new Error("invalid move")
  }

  return { state }
}

function onPlayerQuit(player, roomState) {
  const { state, players, logger } = roomState

  if (players.length === 1) {
    const [winner] = players
    state.winner = winner
    state.status = Status.EndGame

    return { state, finished: true }
  }
  return {}
}

export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
}
