import { Request, Response, Router } from 'express';
import { Option } from './Option';
import { Comparators } from '../message/Comparators';
import { Application } from '../Application';
import { saveConfig } from '../config/Config';

export class SettingsController {
    public path = '/settings';

    public router = Router();

    constructor(private app: Application) {
      this.router.get(this.path, this.render);
      this.router.post('/save', this.save);
    }

    render = (_: Request, response: Response): void => {
      response.render(
        'settings/settings',
        {
          config: this.app.getConfig(),
          tzs: this.getTzs(),
          languages: this.getLanguages(),
          rwySettings: this.getRwySettings(),
          circuitSettings: this.getCircuitsSettings(),
          appRunning: this.app.isRunning(),
        },
      );
    };

    save = (req: Request, response: Response): void => {
      const values = req.body;
      const cfg = saveConfig(values);
      this.app.stop();
      this.app.setConfig(cfg);
      this.app.run();
      response.redirect('/settings');
    };

    getTzs = (): Array<Option> => {
      const out = [];
      for (let i = -12; i <= 12; i += 1) {
        const label = i < 0 ? i.toString() : `+${i}`;
        const obj = {
          id: label,
          label,
          selected: this.app.getConfig().message.timezoneOffset === label,
        };
        out.push(obj);
      }

      return out;
    };

    getLanguages = (): Array<Option> => {
      const langs = [
        'de-DE', 'en-GB', 'en-IN', 'hi-IN', 'id-ID', 'ar-XA', 'cmn-CN', 'cmn-TW',
        'cs-CZ', 'da-DK', 'el-GR', 'en-AU', 'en-US', 'fi-FI', 'fil-PH', 'fr-CA', 'fr-FR', 'hu-HU', 'it-IT', 'ja-JP',
        'ko-KR', 'nb-NO', 'nl-NL', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'sk-SK', 'sv-SE', 'tr-TR', 'uk-UA', 'vi-VN',
        'es-ES', 'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'ta-IN', 'te-IN', 'th-TH',
      ];
      const out: Array<Option> = [];
      langs.forEach((v) => { out.push({ id: v, label: v, selected: this.app.getConfig().google.tts.language === v }); });

      return out;
    };

    getRwySettings = (): any => this.app.getConfig().message.rwy.map(
      (rwy) => ({ ...rwy, options: this.getComparators(rwy.comparator) }),
    );

    getCircuitsSettings = (): any => this.app.getConfig().message.circuits.map(
      (c) => ({ ...c, options: this.getComparators(c.comparator) }),
    );

    getComparators = (selected: string): Array<Option> => Object.values(Comparators).map((v) => ({
      id: v,
      label: v,
      selected: v === selected,
    }));
}
