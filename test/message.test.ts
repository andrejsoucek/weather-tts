import { expect } from 'chai';
import YAML from 'yaml';
import * as fs from 'fs';
import path from 'path';
import { describe, it } from 'mocha';
import { Message } from '../src/message/Message';
import { Weather } from '../src/weather/Weather';
import { Config } from '../src/config/Config';

const cfg = <Config>YAML.parse(fs.readFileSync(path.join(__dirname, 'config.yml'), 'utf8'));

describe('Message', () => {
  it('runway 09, right circuits, no wind', () => {
    const msg = Message.createFrom(<Weather>{
      date: '01/08/2020',
      time: '14:00:54',
      wspeed: '1.8',
      wgust: '1.8',
      bearing: '120',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 12 00 UTC. Vítr klid. Dráha v používání 0 9 . '
        + 'Okruhy pravé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
  it('runway 27, left circuits, wind no gusts in kts', () => {
    const msg = Message.createFrom(<Weather>{
      date: '01/08/2020',
      time: '14:00:54',
      wspeed: '4.8',
      wgust: '4.8',
      bearing: '220',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 12 00 UTC. Vítr 2 2 0 stupňů 5 uzlů . '
        + 'Dráha v používání 2 7 . Okruhy levé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
  it('runway 27, left circuits, wind with gusts in kts', () => {
    const msg = Message.createFrom(<Weather>{
      date: '01/08/2020',
      time: '14:00:54',
      wspeed: '18.3',
      wgust: '27.8',
      bearing: '220',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 12 00 UTC. Vítr 2 2 0 stupňů 1 8 uzlů. Náraz 2 8 . '
        + 'Dráha v používání 2 7 . Okruhy levé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
  it('prague timezone winter time', () => {
    const msg = Message.createFrom(<Weather>{
      date: '01/01/2020',
      time: '14:00:54',
      wspeed: '4.8',
      wgust: '8.8',
      bearing: '220',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 13 00 UTC. Vítr 2 2 0 stupňů 5 uzlů. Náraz 9 . '
        + 'Dráha v používání 2 7 . Okruhy levé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
  it('prague timezone summer time', () => {
    const msg = Message.createFrom(<Weather>{
      date: '01/08/2020',
      time: '14:00:54',
      wspeed: '4.8',
      wgust: '8.8',
      bearing: '220',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 12 00 UTC. Vítr 2 2 0 stupňů 5 uzlů. Náraz 9 . '
        + 'Dráha v používání 2 7 . Okruhy levé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
  it('no timezone shift', () => {
    cfg.message.timezone = 'UTC';
    const msg = Message.createFrom(<Weather>{
      date: '01/08/2020',
      time: '14:00:54',
      wspeed: '4.8',
      wgust: '8.8',
      bearing: '220',
      windunit: 'kts',
      temp: '20',
      cloudbasevalue: '3000',
      press: '1020',
    }, cfg.message);
    expect(msg).to.equal('Milovice Rádio dobrý den. Čas 14 00 UTC. Vítr 2 2 0 stupňů 5 uzlů. Náraz 9 . '
        + 'Dráha v používání 2 7 . Okruhy levé. Teplota 20 stupňů. Základna oblačnosti 3000 stop. QNH 1 0 2 0.');
  });
});
