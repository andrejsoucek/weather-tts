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
    expect(msg).to.equal('<speak>Milovice Rádio dobrý den. '
        + 'Čas <say-as interpret-as="time" format="hm24Z">12:00 UTC</say-as>. '
        + 'Vítr klid. Dráha v používání <say-as interpret-as="characters">09</say-as>. '
        + 'Okruhy pravé. Teplota <say-as interpret-as="cardinal">20</say-as>'
        + ' stupňů. Základna oblačnosti <say-as interpret-as="cardinal">3000</say-as> stop. '
        + 'QNH <say-as interpret-as="characters">1020</say-as>.</speak>');
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
    expect(msg).to.equal('<speak>Milovice Rádio dobrý den. '
        + 'Čas <say-as interpret-as="time" format="hm24Z">12:00 UTC</say-as>. '
        + 'Vítr <say-as interpret-as="characters">220</say-as> stupňů <say-as interpret-as="characters">5</say-as> uzlů. '
        + 'Dráha v používání <say-as interpret-as="characters">27</say-as>. Okruhy levé. '
        + 'Teplota <say-as interpret-as="cardinal">20</say-as> stupňů. '
        + 'Základna oblačnosti <say-as interpret-as="cardinal">3000</say-as> stop. '
        + 'QNH <say-as interpret-as="characters">1020</say-as>.</speak>');
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
    expect(msg).to.equal('<speak>Milovice Rádio dobrý den. '
        + 'Čas <say-as interpret-as="time" format="hm24Z">12:00 UTC</say-as>. '
        + 'Vítr <say-as interpret-as="characters">220</say-as> stupňů <say-as interpret-as="characters">18</say-as> uzlů. '
        + 'Náraz <say-as interpret-as="characters">28</say-as>. '
        + 'Dráha v používání <say-as interpret-as="characters">27</say-as>. Okruhy levé. '
        + 'Teplota <say-as interpret-as="cardinal">20</say-as> stupňů. '
        + 'Základna oblačnosti <say-as interpret-as="cardinal">3000</say-as> stop. '
        + 'QNH <say-as interpret-as="characters">1020</say-as>.</speak>');
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
    expect(msg).to.equal(''
        + '<speak>Milovice Rádio dobrý den. Čas <say-as interpret-as="time" format="hm24Z">13:00 UTC</say-as>. '
        + 'Vítr <say-as interpret-as="characters">220</say-as> stupňů <say-as interpret-as="characters">5</say-as> uzlů. '
        + 'Náraz <say-as interpret-as="characters">9</say-as>. Dráha v používání <say-as interpret-as="characters">27</say-as>. '
        + 'Okruhy levé. Teplota <say-as interpret-as="cardinal">20</say-as> stupňů. '
        + 'Základna oblačnosti <say-as interpret-as="cardinal">3000</say-as> stop. '
        + 'QNH <say-as interpret-as="characters">1020</say-as>.</speak>');
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
    expect(msg).to.equal('<speak>Milovice Rádio dobrý den. Čas <say-as interpret-as="time" format="hm24Z">12:00 UTC</say-as>. '
        + 'Vítr <say-as interpret-as="characters">220</say-as> stupňů <say-as interpret-as="characters">5</say-as> uzlů. '
        + 'Náraz <say-as interpret-as="characters">9</say-as>. Dráha v používání <say-as interpret-as="characters">27</say-as>. '
        + 'Okruhy levé. Teplota <say-as interpret-as="cardinal">20</say-as> stupňů. '
        + 'Základna oblačnosti <say-as interpret-as="cardinal">3000</say-as> stop. '
        + 'QNH <say-as interpret-as="characters">1020</say-as>.</speak>');
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
    expect(msg).to.equal('<speak>Milovice Rádio dobrý den. Čas <say-as interpret-as="time" format="hm24Z">14:00 UTC</say-as>. '
        + 'Vítr <say-as interpret-as="characters">220</say-as> stupňů <say-as interpret-as="characters">5</say-as> uzlů. '
        + 'Náraz <say-as interpret-as="characters">9</say-as>. Dráha v používání <say-as interpret-as="characters">27</say-as>. '
        + 'Okruhy levé. Teplota <say-as interpret-as="cardinal">20</say-as> stupňů. '
        + 'Základna oblačnosti <say-as interpret-as="cardinal">3000</say-as> stop. '
        + 'QNH <say-as interpret-as="characters">1020</say-as>.</speak>');
  });
});
