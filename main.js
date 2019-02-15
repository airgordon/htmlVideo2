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
    height: 563257
  }
];

function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
  h = h << 13 | h >>> 19;
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

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

  return fetch(`https://cors.io/?https://blockchain.info/block-height/${voting.height}?format=json`)
    .then(blob => blob.json())
    .then(data => {
      const {hash} = data.blocks[0];

      const rnd = xmur3(hash);
      const idx = rnd() % candidates.length;
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

fetch(`https://cors.io/?https://blockchain.info/latestblock`)
  .then(blob => blob.json())
  .then(data => data.height)
  .then((height) => Promise.all(votes.map((vote) => findVoteResult(height, vote))))
  .then(publishResults, notYet);
