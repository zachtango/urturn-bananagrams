'use strict';

var fs = require('fs');
var path = require('path');

const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});

const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

const letterCount = (letters) => {
  const count = {};
  for(const c of letters){
    if(!count[c]){
      count[c] = 0;
    }

    count[c] += 1;
  }

  return count;
};

const getWinners = (playerCharCounts, players, maxCount) => {
  /*
    playerCharCounts = [{
      id: str,
      charCount: num
    }]
  */

  const winners = [];

  for(const player of players){
    if(playerCharCounts[player.id] === maxCount){
      winners.push({...player, charCount: maxCount});
    }
  }

  return winners
};

const LETTERS = [
  'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
  'b', 'b', 'b', 'b',
  'c', 'c', 'c', 'c',
  'd', 'd', 'd', 'd',
  'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e',
  'f', 'f', 'f', 'f',
  'g', 'g', 'g', 'g',
  'h', 'h', 'h', 'h',
  'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i',
  'j', 'j', 'j', 'j',
  'k', 'k', 'k', 'k',
  'l', 'l', 'l', 'l',
  'm', 'm', 'm', 'm',
  'n', 'n', 'n', 'n',
  'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o',
  'p', 'p', 'p', 'p',
  'q', 'q', 'q', 'q',
  'r', 'r', 'r', 'r',
  's', 's', 's', 's',
  't', 't', 't', 't',
  'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u',
  'v', 'v', 'v', 'v',
  'w', 'w', 'w', 'w',
  'x', 'x', 'x', 'x',
  'y', 'y', 'y', 'y',
  'z', 'z', 'z', 'z'
];

var expose = {__dirname};

var {__dirname: __dirname$1} = expose; // eslint-disable-line no-shadow

var wordlist = {};

['english', 'american', 'australian', 'british', 'canadian'].forEach(function (dialect) {
  var dialectKey = dialect === 'english' ? dialect : 'english/' + dialect;
  var dialectWords = [];
  [10, 20, 35, 40, 50, 55, 60, 70].forEach(function (frequency) {
    var frequencyKey = dialectKey + '/' + frequency;
    var filePath = path.join(__dirname$1, dialect + '-words-' + frequency + '.json');
    var frequencyWords = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    wordlist[frequencyKey] = frequencyWords;
    dialectWords.push(...frequencyWords);
  });
  wordlist[dialectKey] = dialectWords.sort();
});

const words = new Set(wordlist['english']);

const AVAILABLE = true;

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
  };

  for(let i = 0; i < LETTERS.length; i++){
    state.letters.push([LETTERS[i], false]);
  }
  
  shuffle(state.letters);

  return { state }
}

function onPlayerJoin(player, roomState) {
  const { players, state } = roomState;

  state.activePlayers.push(player.id);
  state.playerIdToWords[player.id] = [];

  if (players.length === 2) { 
    state.status = Status.InGame;
  }
  state.status = Status.InGame;//fixme
  // still waiting on another player so make no modifications
  return {state}
}

function onPlayerMove(player, move, roomState) {
  const { state, players, logger } = roomState;

  if(!state.activePlayers.includes(player.id)){
    throw new Error("player not an active player")
  }

  // validate player moves
  if (state.status !== Status.InGame) {
    throw new Error("game is not in progress, can't make move!")
  }

  const {word, index, finish} = move;

  if(word){
    console.log("WORD SUBMITTED");
    
    const lCount = letterCount(state.letters.filter(tuple => tuple[1] === AVAILABLE).map(tuple => tuple[0]));
    const wCount = letterCount(word);
    
    let flag = true;

    for(const c in wCount){
      if( !lCount[c] || (lCount[c] < wCount[c]) ){
        flag = false;
        break
      }
    }

    if( flag && words.has(word) ){
      let letters = [...state.letters];

      for(let i = 0; i < letters.length; i++){
        if(letters[i][1] === AVAILABLE && wCount[letters[i][0]] > 0){
          letters[i][0] = '';
          wCount[letters[i][0]] -= 1;
        }
      }

      state.letters = letters;

      state.playerIdToWords[player.id].push(word);
    }

  } else if(index) {
    if (state.activePlayers[state.currPlayerIndex] !== player.id) {
      throw new Error(`Its not this player's turn: ${player.username}`)
    }
    
    state.letters[index][1] = true;
    state.currPlayerIndex = (state.currPlayerIndex + 1) % state.activePlayers.length;
  } else if(finish) { // player can't think of any more words    
    
    state.activePlayers = state.activePlayers.filter(id => id !== player.id);
    
    if(state.activePlayers.length === 0){
      // calculate winner
      const playerCharCounts = {};
      let maxCount = 0;
      for(const id in state.playerIdToWords){
        let count = 0;
        for(const word of state.playerIdToWords[id]){
          count += word.length;
        }
        maxCount = Math.max(maxCount, count);
        playerCharCounts[id] = count;
      }

      state.winners = getWinners(playerCharCounts, players, maxCount);
      state.status = Status.EndGame;
      console.log(state.winners);
      return {state, finished: true, joinable: false}
    }
  } else {
    throw new Error("invalid move")
  }

  return { state }
}

function onPlayerQuit(player, roomState) {
  const { state, players, logger } = roomState;

  if (players.length === 1) {
    const [winner] = players;
    state.winner = winner;
    state.status = Status.EndGame;

    return { state, finished: true }
  }
  return {}
}

var main = {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};

module.exports = main;
