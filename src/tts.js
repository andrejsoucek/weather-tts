const TTS = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const client = new TTS.TextToSpeechClient();

/**
 *
 * @param {string} text
 * @param {string} outputPath
 * @return {Promise<void>}
 */
async function synthesize(text, outputPath) {
  const request = {
    input: {text: text},
    voice: {languageCode: 'cs-CZ'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(outputPath, response.audioContent, 'binary');
}

exports.synthesize = synthesize;
