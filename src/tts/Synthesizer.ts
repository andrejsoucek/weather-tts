import * as fs from 'fs';
import * as util from 'util';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import path from 'path';
import { GoogleTTSClient } from './GoogleTTSClient';
import { Repository } from '../persistence/Repository';
import { Weather } from '../weather/Weather';
import { Config } from '../config/Config';
import { Message } from '../message/Message';
import { logger } from '../logger/Logger';
import { Player } from './Player';

export class Synthesizer {
  static async synthesizeAndPlay(weather: Weather, cfg: Config): Promise<void> {
    const msg = Message.createFrom(weather, cfg.message);
    logger.debug(msg);
    const output = path.join(__dirname, '..', 'output.mp3');
    await Synthesizer.synthesize(msg, output, cfg.google.tts.language);
    await Player.play(output);
  }

  private static async synthesize(text: string, outputPath: string, language: string): Promise<void> {
    const properties = {
      input: { text },
      voice: { languageCode: language },
      audioConfig: { audioEncoding: 'MP3' },
    } as google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
    const request = google.cloud.texttospeech.v1.SynthesizeSpeechRequest.create(properties);
    const response = await GoogleTTSClient.getInstance().synthesizeSpeech(request);

    await Repository.saveMessageStats(text.length);

    const writeFile = util.promisify(fs.writeFile);
    const audio = response[0];
    if (audio && audio.audioContent) {
      await writeFile(outputPath, audio.audioContent, 'binary');
    }
  }
}
