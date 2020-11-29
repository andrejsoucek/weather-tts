import * as fs from 'fs';
import * as util from 'util';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import path from 'path';
import { inject, injectable } from 'inversify';
import { GoogleTTSClient } from './GoogleTTSClient';
import { Repository } from '../persistence/Repository';
import { Weather } from '../weather/Weather';
import { Config } from '../config/Config';
import { Message } from '../message/Message';
import { logger } from '../logger/Logger';
import { Player } from './Player';
import { INVERSIFY_TYPES } from '../inversify.types';

@injectable()
export class Synthesizer {
  constructor(
      @inject(INVERSIFY_TYPES.Repository) private readonly repository: Repository,
      @inject(INVERSIFY_TYPES.Player) private readonly player: Player,
  ) {
  }

  async synthesizeAndPlay(weather: Weather, cfg: Config): Promise<void> {
    const msg = Message.createFrom(weather, cfg.message);
    logger.debug(msg);
    const output = path.join(__dirname, '..', 'output.mp3');
    await this.synthesize(msg, output, cfg.google.tts.language);
    await this.player.play(output);
  }

  private async synthesize(text: string, outputPath: string, language: string): Promise<void> {
    const properties = {
      input: { text },
      voice: { languageCode: language },
      audioConfig: { audioEncoding: 'MP3' },
    } as google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
    const request = google.cloud.texttospeech.v1.SynthesizeSpeechRequest.create(properties);
    const response = await GoogleTTSClient.getInstance().synthesizeSpeech(request);

    await this.repository.saveMessageStats(text.length);

    const writeFile = util.promisify(fs.writeFile);
    const audio = response[0];
    if (audio && audio.audioContent) {
      await writeFile(outputPath, audio.audioContent, 'binary');
    }
  }
}
