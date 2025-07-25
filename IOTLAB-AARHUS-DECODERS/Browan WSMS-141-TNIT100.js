/* https://github.com/browanofficial/lorawan-devices/blob/master/vendor/browan/industrialtracker.js
Browan version:1.0
Adjusted to OS2IoT by Alexander Ibsen, iotlab@aarhus.dk 
Last update july 2025 */

function bin16dec(bin) {
        var num = bin & 0xffff;
        if (0x8000 & num) num = -(0x010000 - num);
        return num;
      }
    function bin8dec(bin) {
        var num = bin & 0xff;
        if (0x80 & num) num = -(0x0100 - num);
        return num;
      }
    function base64ToBytes(str) {
        return atob(str)
          .split("")
          .map(function (c) {
            return c.charCodeAt(0);
          });
      }
    function hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
          bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
      }
    function decode(payload, metadata) {
        let res = {};
        let sensorId = payload.deviceInfo.devEui.slice(-8);
        
        res.id = "gps-tracker:" + sensorId + "-Browan";
        res.type=  "gps-tracker"   
        res.name =  {
            "type": "Property",
            "value": metadata.name
        }        
        var timestamp = new Date(payload.rxInfo[0].nsTime).toISOString();
        payload.bytes = base64ToBytes(payload.data);
        var decoded;
        decoded = decodeUplink(payload);
       // res.decoded = decoded;

        if (decoded.data.hasOwnProperty("MovingMode")) {
            res.movingMode = {
                "type": "Property",
                "value": decoded.data.MovingMode,
                "observedAt": timestamp
            };
        }

        if (decoded.data.hasOwnProperty("NoGNSSFix")) {
            res.noGNSSFix = {
                "type": "Property",
                "value": decoded.data.NoGNSSFix,
                "observedAt": timestamp
            };
        }

        if (decoded.data.hasOwnProperty("GNSSerror")) {
            res.gnsserror = {
                "type": "Property",
                "value": decoded.data.GNSSerror,
                "observedAt": timestamp
            };
        }

        if (decoded.data.hasOwnProperty("Battery")) {
            res.battery = {
                "type": "Property",
                "value": decoded.data.Battery,
                "observedAt": timestamp
            };
        }

        if (decoded.data.hasOwnProperty("Temp")) {
            res.temp = {
                "type": "Property",
                "value": decoded.data.Temp,
                "observedAt": timestamp
            };
        }

        if (decoded.data.hasOwnProperty("PositionEstimate")) {
            res.positionEstimate = {
                "type": "Property",
                "value": decoded.data.PositionEstimate,
                "observedAt": timestamp
            };
        }

        if (decoded.data.hasOwnProperty("Lat") && decoded.data.hasOwnProperty("Long")) {
            res.location = {
                "type": "GeoProperty",
                "value": {
                    "type": "Point",
                    "coordinates": [decoded.data.Lat, decoded.data.Long]
                },
                "observedAt": timestamp
            };
        }

        // Will be sent as the JSON: '{"some_field": "some value"}' after decoding.
        return [res];
      }
    


function twocomplement_Lat(inputNum, comtimes) {
  var count02 = (Math.pow(2, comtimes + 1)) - 1;
  var final_Lat;
  if ((inputNum >> comtimes) == 0) {
    final_Lat = inputNum;
    return final_Lat;
  }
  else {
    final_Lat = -(inputNum ^ count02) - 1;
    return final_Lat;
  }
}
function twocomplement_Long(firstbit, inputNum, comtimes) {
  var count02 = (Math.pow(2, comtimes + 1)) - 1;
  var final_Long;
  if (firstbit == 0) {
    final_Long = inputNum;
    return final_Long;
  }
  else {
    final_Long = -(inputNum ^ count02) - 1;
    return final_Long;
  }
}
function decodeUplink(input) {
  switch (input.fPort) {
    case 136:
      var status_low = ((input.bytes[0] - ((input.bytes[0] >> 4) * 16)) % 8) % 2;
      var status_low2 = (input.bytes[0] - ((input.bytes[0] >> 4) * 16)) >> 3;
      var status_hight = (input.bytes[0] >> 4);
      var int_battery = (25 + (input.bytes[1] - ((input.bytes[1] >> 4) * 16))) / 10;
      var int_Temp = input.bytes[2] - 32;
      var int_lat = (input.bytes[3] + input.bytes[4] * 256 + input.bytes[5] * 65536 + (input.bytes[6] - ((input.bytes[6] >> 4))) * 16777216);
      var int_long = (input.bytes[7] + input.bytes[8] * 256 + input.bytes[9] * 65536 + (input.bytes[10] - (((input.bytes[10] >> 5) << 1) * 16)) * 16777216);
      var bit_long = ((input.bytes[10] >> 4) % 2);
      var int_pestimate = Math.pow(2, ((input.bytes[10] >> 5) + 2));
      var Ftotal_lat = twocomplement_Lat(int_lat, 27);
      var Ftotal_long = twocomplement_Long(bit_long, int_long, 28);
      return {
        // Decoded data
        data: {
          MovingMode: status_low,
          NoGNSSFix: status_low2,
          GNSSerror: status_hight,
          Battery: int_battery,
          Temp: int_Temp,
          Lat: (Ftotal_lat / 1000000),
          Long: (Ftotal_long / 1000000),
          PositionEstimate: int_pestimate,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
