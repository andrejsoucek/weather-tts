import { TextToSpeechClient } from '@google-cloud/text-to-speech/build/src';
import * as v1 from '@google-cloud/text-to-speech/build/src/v1';

export class GoogleTTSClient {
    private static client: v1.TextToSpeechClient;

    private constructor() {
    }

    static getInstance(): v1.TextToSpeechClient {
      if (this.client === undefined) {
        this.client = new TextToSpeechClient();
      }

      return this.client;
    }
}
