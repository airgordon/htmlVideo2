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
    return Promise.resolve(`${name}: ${blockToTimeMsg(voting.height - latestBlockHeight)} до результата`);
  }

  return fetch(`ttps://api.blockchair.com/bitcoin/raw/block/${voting.height}`)
    .then(blob => blob.json())
    .then(data => {
      const {hash} = data.decoded_raw_block;
      const hashInt = BigInt("0x" + hash)

      const idx = hashInt % BigInt(candidates.length);
      return `${name}: ${candidates[idx]}`;
    });
};

const publishResults = (data) => {
  main.innerText = data.join('\n');
};

const notYet = (err) => {
  console.error(err);
  main.innerText = "Всё пропало!";
};

fetch(`https://blockchain.info/latestblock?format=json&cors=true`)
  .then(blob => blob.json())
  .then(data => data.height)
  .then((height) => Promise.all(votes.map((vote) => findVoteResult(height, vote))))
  .then(publishResults, notYet);
