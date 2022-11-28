export const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});

export const shuffle = (array) => {
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
}

export const letterCount = (letters) => {
  const count = {}
  for(const c of letters){
    if(!count[c]){
      count[c] = 0;
    }

    count[c] += 1;
  }

  return count;
}

export const getWinners = (playerCharCounts, players, maxCount) => {
  /*
    playerCharCounts = [{
      id: str,
      charCount: num
    }]
  */

  const winners = []

  for(const player of players){
    if(playerCharCounts[player.id] === maxCount){
      winners.push({...player, charCount: maxCount})
    }
  }

  return winners
}

export const LETTERS = [
  'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
  'b', 'b', 'b', 'b',
  'c', 'c', 'c', 'c',
  'd', 'd', 'd', 'd',
  'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e',
  'f', 'f', 'f', 'f',
  'g', 'g', 'g', 'g',
  'h', 'h', 'h', 'h',
  'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i',
  'j', 'j', 'j', 'j',
  'k', 'k', 'k', 'k',
  'l', 'l', 'l', 'l',
  'm', 'm', 'm', 'm',
  'n', 'n', 'n', 'n',
  'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o',
  'p', 'p', 'p', 'p',
  'q', 'q', 'q', 'q',
  'r', 'r', 'r', 'r',
  's', 's', 's', 's',
  't', 't', 't', 't',
  'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 
  'v', 'v', 'v', 'v',
  'w', 'w', 'w', 'w',
  'x', 'x',
  'y', 'y',
  'z', 'z'
]