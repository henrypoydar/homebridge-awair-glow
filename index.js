
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




// AwairGlow.prototype = {

//   updateState: function () {
//      //Ensure previous call finished
//      if (this.waiting_response) {
//         this.log('Avoid updateState as previous response does not arrived yet');
//         return;
//      }
//      this.waiting_response = true;
//      this.last_value = new Promise((resolve, reject) => {
//         var ops = {
//            uri:    this.url,
//            method: this.http_method,
//            timeout: this.timeout
//         };
//         this.log('Requesting temperature on "' + ops.uri + '", method ' + ops.method);
//         if (this.auth) {
//            ops.auth = {
//               user: this.auth.user,
//               pass: this.auth.pass
//            };
//         }
//         request(ops, (error, res, body) => {
//            var value = null;
//            if (error) {
//               this.log('HTTP bad response (' + ops.uri + '): ' + error.message);
//            } else {
//               try {
//                  value = this.fieldName === '' ? body : JSON.parse(body)[this.fieldName];
//                  value = Number(value);
//                  if (isNaN(value)) {
//                     throw new Error('Received value is not a number: "' + value + '" ("' + body.substring(0, 100) + '")');
//                  } else if (value < this.minTemperature || value > this.maxTemperature) {
//                     var msg = 'Received value is out of bounds: "' + value + '". min=' + this.minTemperature +
//                               ', max= ' + this.maxTemperature;
//                     throw new Error(msg);
//                  }
//                  this.log('HTTP successful response: ' + value);
//                  if (this.units === FAHRENHEIT_UNITS) {
//                     value = (value - 32)/1.8;
//                     this.log('Converted Fahrenheit temperature to celsius: ' + value);
//                  }
//               } catch (parseErr) {
//                  this.log('Error processing received information: ' + parseErr.message);
//                  error = parseErr;
//               }
//            }
//            if (!error) {
//               resolve(value);
//            } else {
//               reject(error);
//            }
//            this.waiting_response = false;
//         });
//      }).then((value) => {
//         this.temperatureService
//            .getCharacteristic(Characteristic.CurrentTemperature).updateValue(value, null);
//         return value;
//      }, (error) => {
//         //For now, only to avoid the NodeJS warning about uncatched rejected promises
//         return error;
//      });
//   },

//   getState: function (callback) {
//      this.log('Call to getState: waiting_response is "' + this.waiting_response + '"' );
//      this.updateState(); //This sets the promise in last_value
//      this.last_value.then((value) => {
//         callback(null, value);
//         return value;
//      }, (error) => {
//         callback(error, null);
//         return error;
//      });
//   },

//   getServices: function () {
//      this.informationService = new Service.AccessoryInformation();
//      this.informationService
//      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
//      .setCharacteristic(Characteristic.Model, this.model)
//      .setCharacteristic(Characteristic.SerialNumber, this.serial);

//      this.temperatureService = new Service.TemperatureSensor(this.name);
//      this.temperatureService
//         .getCharacteristic(Characteristic.CurrentTemperature)
//         .on('get', this.getState.bind(this))
//         .setProps({
//             minValue: this.minTemperature,
//             maxValue: this.maxTemperature
//         });

//      if (this.update_interval > 0) {
//         this.timer = setInterval(this.updateState.bind(this), this.update_interval);
//      }

//      return [this.informationService, this.temperatureService];
//   }
// };