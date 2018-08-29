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
        that.log("%d readings", data.length);
        that.log("Score: " + data[data.length - 1].score);
        that.log("Temperature: " + data[data.length - 1].sensors[0].value);
        that.log("Humidity: " + data[data.length - 1].sensors[1].value);
        that.log("CO2: " + data[data.length - 1].sensors[2].value);
        that.log("VOC: " + data[data.length - 1].sensors[3].value);
      })
      .catch(function(err) {
        that.log("Error contacting Awair API: " + err)
        // API call failed...
      });
    //   .then(function(response) {
    //   // if (!repos) {
    //   //   repos = [];
    //   // }
    //   var data = response.body;
    //   this.log("Score: " + data[data.length - 1].score);
    //   this.log("Temperature: " + data[data.length - 1].sensors[0].value);
    //   this.log("Humidity: " + data[data.length - 1].sensors[1].value);
    //   this.log("CO2: " + data[data.length - 1].sensors[2].value);
    //   this.log("VOC: " + data[data.length - 1].sensors[3].value);
    //   // console.log(repos.length + " repos so far");
    //   // if (response.headers.link.split(",").filter(function(link){ return link.match(/rel="next"/) }).length > 0) {
    //   //   console.log("There is more.");
    //   //   var next = new RegExp(/<(.*)>/).exec(response.headers.link.split(",").filter(function(link){ return link.match(/rel="next"/) })[0])[1];
    //    //   return github.getUserRepos(next, repos);
    // });
  },

  // getState: function () {
  //   this.log("#getState");
  // },

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
