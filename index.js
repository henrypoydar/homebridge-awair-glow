
const Service, Characteristic;
// const request = require('request');

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory(
    "homebridge-awair-glow",
    "AwairGlow",
    AwairGlow
  );
};

function AwairGlow(log, config) {
  this.log = log;
  this.manufacturer = config["manufacturer"] || "Awair";
  this.deviceType = config["deviceType"] || "awair-glow";
  this.deviceId = config["deviceId"];
  this.token = config["token"];
  this.polling_interval = Number( config["polling_interval"] || 600 ); // Seconds, 10 mins
  this.url = config["url"] || (`http://dev-developer-apis.awair.is/v1/users/self/devices/${this.model}/${this.serial}/air-data/15-min-avg`);
}

AwairGlow.prototype = {

  updateState: function () {
    this.log("#updateState");
  },

  getState: function () {
    this.log("#getState");
  },

  getServices: function () {

    let informationService = new Service.AccessoryInformation();
    let airQualityService = new Service.AirQualitySensor();
    let temperatureService = new Service.TemperatureSensor();
    let humidityService = new Service.HumiditySensor();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.deviceType)
      .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
 
    airQualityService
      .setCharacteristic(Characteristic.AirQuality, "--")
      .setCharacteristic(Characteristic.VOCDensity, "--")
      .setCharacteristic(Characteristic.CarbonDioxideLevel, "--");
    
    temperatureService
      .setCharacteristic(Characteristic.CurrentTemperature, "--")
    
    humidityService
      .setCharacteristic(Characteristic.CurrentRelativeHumidity, "--")
 
    this.informationService = informationService;
    this.airQualityService = airQualityService;
    this.temperatureService = temperatureService;
    this.humidityService = humidityService;


    if (this.polling_interval > 0) {
      this.timer = setInterval(this.updateState.bind(this), this.polling_interval * 1000);
    }

    return [informationService, airQualityService, temperatureService, humidityService];
  }
};

