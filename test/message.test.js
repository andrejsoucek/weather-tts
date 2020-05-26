const expect = require('chai').expect;
const message = require('../src/message');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const cfg = YAML.parse(fs.readFileSync(path.join(__dirname, './config.yml'), 'utf8'));

describe('Message', () => {
  it('runway 09, right circuits, no wind', () => {
    const msg = message.createFrom({
      time: '14:00:54',
      wspeed: '1.8',
      wgust: '1.8',
      bearing: '120',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 12 00 UTC. Vítr klid. Dráha v používání 0 9 . ' +
        'Okruhy pravé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
  it('runway 27, left circuits, wind no gusts in kts', () => {
    const msg = message.createFrom({
      time: '14:00:54',
      wspeed: '4.8',
      wgust: '4.8',
      bearing: '220',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 12 00 UTC. Vítr 5 uzlů, 220 stupňů. Dráha v používání 2 7 . ' +
        'Okruhy levé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
  it('runway 27, left circuits, wind with gusts in kts', () => {
    const msg = message.createFrom({
      time: '14:00:54',
      wspeed: '4.8',
      wgust: '8.8',
      bearing: '220',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 12 00 UTC. Vítr 5 uzlů, 220 stupňů. Nárazy 9 uzlů. ' +
        'Dráha v používání 2 7 . Okruhy levé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
});
