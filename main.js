const main = document.getElementById("main");

const votes = [
  {
    name: 'Голосование 1',
    candidates: ['airgordon', 'cat'],
    height: 563144
  },
  {
    name: 'Голосование 2',
    candidates: ['airgordon', 'cat'],
    height: 563157
  },
  {
    name: 'Голосование 3',
    candidates: ['airgordon', 'cat'],
    height: 563160
  },
  {
    name: 'Голосование 4',
    candidates: ['airgordon', 'cat'],
    height: 563170
  },
  {
    name: 'Голосование 5',
    candidates: ['airgordon', 'cat'],
    height: 649940
  },
  {
    name: 'Голосование 6',
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

  return fetch(`https://api.blockchair.com/bitcoin/blocks?q=id(${voting.height})&fields=hash`)
    .then(blob => blob.json())
    .then(res => {
      const { data } = res;
      const block = data[0];
      return vote(block, voting);
    });
};

const vote = (block, voting) => {
  const {candidates, name} = voting;
  const { hash } = block;
  const hashInt = BigInt("0x" + hash)

  const idx = hashInt % BigInt(candidates.length);
  return {...voting, ready: true, hash, winner: candidates[idx]}
}

const publishResults = (data) => {
  
  data.forEach(result => {
    const record = document.createElement("div");
    
    const header = document.createElement("h4");
    header.innerText = result.name;
    record.appendChild(header);
    
    const candidates = document.createElement("p");
    candidates.innerText = `Кандидаты: ${result.candidates}`;
    record.appendChild(candidates);
    
    const block = document.createElement("p");
    block.innerText = result.ready ? `Блок: ${result.height} ${result.hash}` : `Блок: ${result.height}`;
    record.appendChild(block);
    
    if (result.ready) {
      const winner = document.createElement("p");
      winner.innerText = `Победитель: ${result.winner}`;
      record.appendChild(winner);
    } else {
      const wait = document.createElement("p");
      wait.innerText = `${blockToTimeMsg(result.wait)} до результата`;
      record.appendChild(wait);
    }
    
    main.appendChild(record);
  });
};

const handleError = (err) => {
  console.error(err);
  main.innerText = "Всё пропало! " + JSON.stringify(err);
};

fetch(`https://api.blockchair.com/bitcoin/stats`)
  .then(blob => blob.json())
  .then(res => res.data.best_block_height)
  .then((height) => Promise.all(votes.map((vote) => findVoteResult(height, vote))))
  .then(publishResults, handleError);
