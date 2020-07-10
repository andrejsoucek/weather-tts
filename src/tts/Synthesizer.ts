import * as fs from 'fs';
import * as util from 'util';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import { GoogleTTSClient } from './GoogleTTSClient';

export class Synthesizer {
  static async synthesize(text: string, outputPath: string, language: string): Promise<void> {
    const properties = {
      input: { text },
      voice: { languageCode: language },
      audioConfig: { audioEncoding: 'MP3' },
    } as google.cloud.texttospeech.v1beta1.ISynthesizeSpeechRequest;
    const request = google.cloud.texttospeech.v1.SynthesizeSpeechRequest.create(properties);

    const response = await GoogleTTSClient.getInstance().synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    const audio = response[0];
    if (audio && audio.audioContent) {
      await writeFile(outputPath, audio.audioContent, 'binary');
    }
  }
}
