var Service, Characteristic;
var request = require("request-promise");

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-awair-glow", "AwairGlow", AwairGlow);
};

function AwairGlow(log, config) {
  this.log = log;
  this.manufacturer = config["manufacturer"] || "Awair";
  this.deviceType = config["deviceType"] || "awair-glow";
  this.deviceId = config["deviceId"];
  this.token = config["token"];
  this.polling_interval = Number(config["polling_interval"] || 600); // Seconds, 10 mins
  this.url =
    config["url"] ||
    "http://developer-apis.awair.is/v1/users/self/devices/" +
      this.deviceType +
      "/" +
      this.deviceId +
      "/air-data/15-min-avg";
}

AwairGlow.prototype = {
  getData: function() {
    var options = {
      method: "GET",
      uri: this.url,
      json: true,
      headers: {
        Authorization: "Bearer " + this.token,
        "User-Agent": "Homebridge Plugin"
      }
    };

    var that = this;

    return request(options)
      .then(function(response) {
        var data = response.data;
        that.log("%d readings collected", data.length);
        var dataPoint = data[data.length - 1];

        that.airQualityService
          .setCharacteristic(Characteristic.AirQuality, that.convertScore(dataPoint.score))
          .setCharacteristic(
            Characteristic.VOCDensity,
            dataPoint.sensors[3].value
          )
          .setCharacteristic(
            Characteristic.CarbonDioxideLevel,
            dataPoint.sensors[2].value
          );
        that.temperatureService.setCharacteristic(
          Characteristic.CurrentTemperature,
          dataPoint.sensors[0].value
        );
        that.humidityService.setCharacteristic(
          Characteristic.CurrentRelativeHumidity,
          dataPoint.sensors[1].value
        );
      })
      .catch(function(err) {
        that.log("Error contacting Awair API: " + err);
      });
  },

  convertScore: function(score) {
    var pscore = parseFloat(score);
    if (!score) {
      return 0; // Error
    } else if (score >= 90) {
      return 1; // EXCELLENT
    } else if (score >= 80 && score < 90) {
      return 2; // GOOD
    } else if (score >= 60 && score < 80) {
      return 3; // FAIR
    } else if (score >= 50 && score < 60) {
      return 4; // INFERIOR
    } else if (score < 50) {
      return 5; // POOR
    } else {
      return 0; // Error
    }
  },

  getServices: function() {
    var informationService = new Service.AccessoryInformation();
    var airQualityService = new Service.AirQualitySensor();
    var temperatureService = new Service.TemperatureSensor();
    var humidityService = new Service.HumiditySensor();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.deviceType)
      .setCharacteristic(Characteristic.SerialNumber, this.deviceId);

    airQualityService
      .setCharacteristic(Characteristic.AirQuality, "--")
      .setCharacteristic(Characteristic.VOCDensity, "--")
      .setCharacteristic(Characteristic.CarbonDioxideLevel, "--");

    temperatureService.setCharacteristic(
      Characteristic.CurrentTemperature,
      "--"
    );

    humidityService.setCharacteristic(
      Characteristic.CurrentRelativeHumidity,
      "--"
    );

    this.informationService = informationService;
    this.airQualityService = airQualityService;
    this.temperatureService = temperatureService;
    this.humidityService = humidityService;

    if (this.polling_interval > 0) {
      this.timer = setInterval(
        this.getData.bind(this),
        this.polling_interval * 1000
      );
    }

    // Get tnitial state
    this.getData().bind(this);

    return [
      informationService,
      airQualityService,
      temperatureService,
      humidityService
    ];
  }
};
