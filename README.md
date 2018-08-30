# Homebridge Plugin for the Awair Glow

[HomeBridge](http://github.com/nfarina/homebridge) accessory plugin for the [Awair Glow](https://getawair.com/pages/awair-glow) air quality monitor.

Use it to see the status and readings of your monitor in HomeKit. Includes an overall AQ score, temperature, humidity, CO2, and VOC readings.  

## Installation

Assumes you have Homebridge installed.

1. You will need an Access Token from Awair to get started. Visit https://developer.getawair.com/ to get one. This will give you free access to the "Hobbyist" tier, which will be good enough to run this plugin.

2. Get a list of your Awair devices so you can plug them in to the config: `curl -X GET  http://developer-apis.awair.is/v1/users/self/devices -H 'Authorization: Bearer {access-token}'`

3. Install this plugin: `[sudo] npm install -g homebridge-awair-glow`

4. Add an accessory entry to your Homebridge configuration for each Awair Glow you'd like to add. Here's the syntax:

```
  {
    "accessory": "AwairGlow",
    "name": "Awair Glow",
    "token": "xxx.xxx.xxx",
    "deviceId": "12345"
  }
```

## Development

Pull requests welcome. Useful information for further development:

### TODO

- [ ] Custom characteristic to push score
- [ ] Can't read VOC on iPhone
- [ ] Platform-ize
- [ ] Read device list and add accessories automagically

### Raw API Calls

    http://developer-apis.awair.is/v1/users/self/devices

    http://developer-apis.awair.is/v1/users/self/devices/:device_type/:device_id/air-data/15-min-avg

### API Response

See response.sample.json

## Resources

- Awair API: https://docs.developer.getawair.com/
- Homebridge: https://github.com/nfarina/homebridge
- Homebridge plugin development: http://blog.theodo.fr/2017/08/make-siri-perfect-home-companion-devices-not-supported-apple-homekit/
- List of Services and conventions: https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js
- Another Awair plugin: https://github.com/deanlyoung/homebridge-awair
- Reference AQ plugin: https://github.com/toto/homebridge-airrohr
- Refenerce temperature plugin: https://github.com/metbosch/homebridge-http-temperature

