require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Canvas = require('canvas');
const request = require(`snekfetch`);
const cards = require('./cards');
const app = express();

const port = process.env.PORT || 8000;

app.use(morgan('tiny'));

app.listen(port, () => console.log(`Listening on ${port}`));

app.get('/image', async (req, res) => {
  if(!req.query.dealer || !req.query.player) return res.json({success: false, message: "You must provide a Dealer and Player Object"});
  let player = req.query.player.split(',');
  let dealer = req.query.dealer.split(',');
  // Loop over both player and dealer to change the array of items passed in into card objects with values and names
  let canvas = new Canvas.Canvas(1020, 720);
  let ctx = canvas.getContext('2d');

  let { body: bg } = (await request.get('https://cdn.dectom.dev/c844686b8.png'));
  let cbg = await Canvas.loadImage(bg);
  ctx.drawImage(cbg, 0, 0, canvas.width, canvas.height);

  for(let i in player) {
    player[i] = cards.find(card => card.name === player[i]);
    let {body:img} = (await request.get(`https://cdn.arcticstudios.org/cards/${player[i].name}.png`));
    player[i].img = await Canvas.loadImage(img);
    ctx.drawImage(player[i].img, (50 + parseInt(i) * player[i].length), 50, 41, 56)
  }
  for(let i in dealer) {
    dealer[i] = cards.find(card => card.name === dealer[i]);
    if(parseInt(req.query.turn) && dealer.length <= 2) {
      dealer[1] = { name: 'BLANK', value: 0 };
      continue;
    }
    let { body: img } = (await request.get(`https://cdn.arcticstudios.org/cards/${dealer[i].name}.png`));
    dealer[i].img = await Canvas.loadImage(img);
    ctx.drawImage(dealer[i].img, (50 + parseInt(i) * dealer[i].length), 125, 41, 56)
  }

  buffer = (await canvas.toBuffer());
  res.contentType('image/png');
  res.send(buffer);
});