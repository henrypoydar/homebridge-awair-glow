var Service, Characteristic;

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
    "http://dev-developer-apis.awair.is/v1/users/self/devices/" +
      this.deviceType +
      "/" +
      this.deviceId +
      "/air-data/15-min-avg";
  this.data = null;
}

AwairGlow.prototype = {

  getData: function() {
    return request({
      method: "GET",
      uri: this.url,
      json: true,
      resolveWithFullResponse: true,
      headers: {
        Authorization: "Bearer " + this.token,
        "User-Agent": "Homebridge Plugin"
      }
    }).then(function(response) {
      // if (!repos) {
      //   repos = [];
      // }
      var data = response.body;
      this.log("Score: " + data[data.length - 1].score);
      this.log("Temperature: " + data[data.length - 1].sensors[0].value);
      this.log("Humidity: " + data[data.length - 1].sensors[1].value);
      this.log("CO2: " + data[data.length - 1].sensors[2].value);
      this.log("VOC: " + data[data.length - 1].sensors[3].value);
      // console.log(repos.length + " repos so far");
      // if (response.headers.link.split(",").filter(function(link){ return link.match(/rel="next"/) }).length > 0) {
      //   console.log("There is more.");
      //   var next = new RegExp(/<(.*)>/).exec(response.headers.link.split(",").filter(function(link){ return link.match(/rel="next"/) })[0])[1];
      //   return github.getUserRepos(next, repos);
    });
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

    // Intial state
    this.getaData.bind(this);

    return [
      informationService,
      airQualityService,
      temperatureService,
      humidityService
    ];
  }
};
