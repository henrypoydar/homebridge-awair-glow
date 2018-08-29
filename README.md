# Homebridge Plugin for the Awair Glow

## TODO

[] This plugin
[] Test env
[] This doc
[] Read device list and add accessories automagically
[] Platform-ize

## Awair API

### Raw API Calls

    http://dev-developer-apis.awair.is/v1/users/self/devices

    http://dev-developer-apis.awair.is/v1/users/self/devices/:device_type/:device_id/air-data/15-min-avg

### Response

See response.sample.json

## Resources

- Homebridge: https://github.com/nfarina/homebridge
- Homebridge plugin development: http://blog.theodo.fr/2017/08/make-siri-perfect-home-companion-devices-not-supported-apple-homekit/
- List of Services and conventions: https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js
- Another Awair plugin: https://github.com/deanlyoung/homebridge-awair
- Reference AQ plugin: https://github.com/toto/homebridge-airrohr
- Refenerce temperature plugin: https://github.com/metbosch/homebridge-http-temperature
