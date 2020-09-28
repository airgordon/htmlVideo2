const main = document.getElementById("main");

const votes = [
  {
    name: 'голосование 1',
    candidates: ['airgordon', 'cat'],
    height: 563144
  },
  {
    name: 'голосование 2',
    candidates: ['airgordon', 'cat'],
    height: 563157
  },
  {
    name: 'голосование 3',
    candidates: ['airgordon', 'cat'],
    height: 563160
  },
  {
    name: 'голосование 4',
    candidates: ['airgordon', 'cat'],
    height: 563170
  },
  {
    name: 'голосование 5',
    candidates: ['airgordon', 'cat'],
    height: 649940
  },
  {
    name: 'голосование 6',
    candidates: ['airgordon', 'cat'],
    height: 749940
  }
];

const blockToTimeMsg = (x) => {
  if (x < 3)
    return `${20 * x} минут`;
  x = x / 3;
  if (x < 24)
    return `${x} часов`;
  x = x / 24;
  return `${x} дней`;
};

const findVoteResult = (latestBlockHeight, voting) => {
  const {candidates, name} = voting;

  if (voting.height > latestBlockHeight) {
    return  {...voting, ready: false, wait: voting.height - latestBlockHeight};
  }

  return fetch(`https://api.blockchair.com/bitcoin/raw/block/${voting.height}`)
    .then(blob => blob.json())
    .then(res => {
      const { data } = res;
      const block = data[voting.height];
      return vote(block, voting);
    });
};

const vote = (block, voting) => {
  const {candidates, name} = voting;
  
  const decBlock = block.decoded_raw_block;
  const { hash } = decBlock;
  const hashInt = BigInt("0x" + hash)

  const idx = hashInt % BigInt(candidates.length);
  return {...voting, ready: true, hash, winner: candidates[idx]}
}

const publishResults = (data) => {
  
  main.innerText = data.map(result => {
    if (result.ready) {
      return `${result.name}\nКандидаты: ${result.candidates}\nБлок: ${result.height} ${result.hash}\nПобедитель: ${result.winner}\n`
    } else {
      return `${result.name}\nКандидаты: ${result.candidates}\nБлок: ${result.height}\n${blockToTimeMsg(result.wait)} до результата\n`
    }
  })
  .join('\n');
};

const error = (err) => {
  console.error(err);
  main.innerText = "Всё пропало! " + JSON.stringify(err);
};

fetch(`https://blockchain.info/latestblock?format=json&cors=true`)
  .then(blob => blob.json())
  .then(data => data.height)
  .then((height) => Promise.all(votes.map((vote) => findVoteResult(height, vote))))
  .then(publishResults, error);
