// OS2IOT - Kristian Risager Larsen, Aarhus Kommune, 2025-06

/* If the sensor parts are not connected, the data will look like this:

{
  "battery": 10,
  "temperature": -0.1,
  "humidity": 127.5,
  "wind_direction": -0.1,
  "pressure": 6553.5,
  "wind_speed": 6553.5
}

*/


    function decode(payload, metadata) {
        let res = {};
        //res.some_field = "some value"

        let timestamp = new Date(payload.rxInfo[0].nsTime).toISOString();

        payload.bytes = base64ToBytes(payload.data)

        decoded = milesightDeviceDecode(payload.bytes)

        let sensorId = payload.deviceInfo.devEui.slice(-6);

        // https://github.com/sj-doyle/NGSI-LD-Entities/blob/master/definitions/Weather-Observed.md

        res.id = "WeatherObserved:" + sensorId + "-Milesight";
        res.type=  "WeatherObserved"


        // debug
        //res.decoded = decoded;

        decoded = decoded[0];

        

        if (decoded.hasOwnProperty("battery")) {
            res.battery =  {
                "type": "Property",
                "value": decoded.battery,
                "observedAt": timestamp
            }
        }

        if (decoded.hasOwnProperty("temperature")) {
            res.temperature =  {
                "type": "Property",
                "value": decoded.temperature,
                "observedAt": timestamp,
                "unitCode": "CEL"
            }
        }


        if (decoded.hasOwnProperty("humidity")) {
            res.relativeHumidity =  {
                "type": "Property",
                "value": decoded.humidity,
                "observedAt": timestamp,
                "unitCode": "C62"
            }
        }


        if (decoded.hasOwnProperty("wind_direction")) {
            res.windDirection =  {
                "type": "Property",
                "value": decoded.wind_direction,
                "observedAt": timestamp,
                "unitCode": "DD"
            }
        }

        if (decoded.hasOwnProperty("wind_speed")) {
            res.windSpeed =  {
                "type": "Property",
                "value": decoded.wind_speed,
                "observedAt": timestamp,
                "unitCode": "MTS"
            }
        }

        if (decoded.hasOwnProperty("pressure")) {
            res.atmosphericPressure =  {
                "type": "Property",
                "value": decoded.pressure,
                "observedAt": timestamp,
                "unitCode": "hPa"
            }
        }

        /*res.location = {
                "type": "GeoProperty",
                "value": {
                    "type": "Point",
                    "coordinates":[Number(metadata.location.coordinates[0]), Number(metadata.location.coordinates[1])]
                }        
        }*/

        return [res];
      }
      

// helper functions
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
      
      
/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product WTS305 / WTS506
 */
// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

// Chirpstack v3
function Decode(fPort, bytes) {
    return milesightDeviceDecode(bytes);
}

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            // ℃
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;

            // ℉
            // decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10 * 1.8 + 32;
            // i +=2;
        }
        // HUMIDITY
        else if (channel_id === 0x04 && channel_type === 0x68) {
            decoded.humidity = bytes[i] / 2;
            i += 1;
        }
        // Wind Direction, unit degree
        else if (channel_id === 0x05 && channel_type === 0x84) {
            decoded.wind_direction = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // Barometric Pressure, unit hPa
        else if (channel_id === 0x06 && channel_type === 0x73) {
            decoded.pressure = readUInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // Wind Speed, unit m/s
        else if (channel_id === 0x07 && channel_type === 0x92) {
            decoded.wind_speed = readUInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // rainfall_total, unit mm, Frame counter to define whether device enters the new rainfall accumulation phase, it will plus 1 every upload, range: 0~255
        else if (channel_id === 0x08 && channel_type === 0x77) {
            decoded.rainfall_total = readUInt16LE(bytes.slice(i, i + 2)) / 100;
            decoded.rainfall_counter = bytes[i + 2];
            i += 3;
        } else {
            break;
        }
    }

    return [decoded];
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}


