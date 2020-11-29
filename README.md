![master branch status](https://github.com/andrejsoucek/weather-tts/workflows/tests%20&%20lint/badge.svg?branch=master)
# Weather Text-to-Speech
## Prerequisites
1. [realtime.txt](https://cumuluswiki.org/a/Realtime.txt) output from a weather station (produced by Cumulus, CumulusMX or WeeWX).
1. [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) service.
1. Node 14
1. [mpg123](https://www.mpg123.de/) `apt-get install mpg123`

## Getting Started
### Using docker
1. Clone this repo.
1. Put your Google JSON auth key into the project root. Name it `auth.json`. To specify different directory set an ENV variable `GOOGLE_KEY_PATH`.
1. Build the container by running `make build`.
1. Start the container and launch the app by `make run`. The app will detect if the GPIO is accessible automatically.
1. If you want to force disable the GPIO input trigger run `make run-dev`. The app will react only to the enter key.
1. Tests can be run by `make test`. Lint by `make lint`
### Local installation
1. Clone this repo.
1. Specify path to the Google JSON auth key into an ENV variable `GOOGLE_APPLICATION_CREDENTIALS`.
1. Create config `cp config/config.example.yml config/config.yml`.
1. Compile by running `npm run build`.
1. Launch by `npm run start`. The app will detect if the GPIO is accessible automatically.
1. If you want to force disable the GPIO input trigger run `npm run manual`. The app will react only to the enter key.
1. Tests can be run by `npm run test`. Lint by `npm run lint`.

## Message template & placeholders
You can use preddefined placeholders in the message:
- <#TIME> - time in HH:MM format
- <#WIND> - wind speed, bearing and gust
- <#RWY> - runway in use
- <#CIRCUIT> - circuit direction
- <#TEMP> - temperature
- <#CLOUDBASE>
- <#QNH>
