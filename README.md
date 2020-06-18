# Weather Text-to-Speech
## Prerequisites
1. [realtime.txt](https://cumuluswiki.org/a/Realtime.txt) output from a weather station (produced by Cumulus, CumulusMX or WeeWX).
1. [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) service.
1. Node 10
1. [mpg123](https://www.mpg123.de/) `apt-get install mpg123`

## Getting Started
2. Clone this repo.
2. Create config `cp config/config.example.yml config/config.yml`.
2. Edit the config for your needs.
2. Compile `tsc`.
2. Launch `node build/src/main.js` or `node .`.

## Message template & placeholders
You can use preddefined placeholders in the message:
- <#TIME> - time in HH:MM format
- <#WIND> - wind speed, bearing and gust
- <#RWY>  - runway in use
- <#CIRCUIT> - circuit direction
- <#TEMP> - temperature
- <#CLOUDBASE>
- <#QNH>
