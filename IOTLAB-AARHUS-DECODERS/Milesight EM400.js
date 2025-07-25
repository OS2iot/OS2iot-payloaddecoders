/* Adjusted to OS2IoT by Alexander Ibsen, iotlab@aarhus.dk 
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
        let rawPayload = base64ToHex(payload.data);
        let decoded = Decoder(getHex(rawPayload), payload.fPort );
        let timestamp = new Date(payload.rxInfo[0].nsTime).toISOString();
        //res.decoded = decoded;
        let sensorId = payload.deviceInfo.devEui.slice(-5);
        res.id = "distance-sensor:" + sensorId + "-Milesight";
        res.type =  "distance-sensor"
        res.name =  {
          "type": "Property",
          "value": metadata.name
        }
        if (decoded.hasOwnProperty("temperature"))
        {
            res.temperature =  {

                        "type": "Property",
                        "value": decoded.temperature,
                        "observedAt": timestamp
            }
        }
            
        if (decoded.hasOwnProperty("distance"))
        {
            res.distance =  {

                        "type": "Property",
                        "value": decoded.distance,
                        "observedAt": timestamp
            }
        }   
        if (decoded.hasOwnProperty("position"))
        {
            res.position =  {

                        "type": "Property",
                        "value": decoded.position,
                        "observedAt": timestamp
            }
        } 
        res.location = {
          "type": "GeoProperty",
          "value": {
          "type": "Point",
          "coordinates":[Number(metadata.location.coordinates[0]), Number(metadata.location.coordinates[1])]
          }        
        }            
        return [res];
      }

/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product EM400-MUD
 */


// Chirpstack v3
function Decoder(bytes, fPort) {
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
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // DISTANCE
        else if (channel_id === 0x04 && channel_type === 0x82) {
            decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // POSITION
        else if (channel_id === 0x05 && channel_type === 0x00) {
            decoded.position = bytes[i] === 0 ? "normal" : "tilt";
            i += 1;
        }
        // TEMPERATURE WITH ABNORMAL
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_abnormal = bytes[i + 2] == 0 ? false : true;
            i += 3;
        }
        // DISTANCE WITH ALARMING
        else if (channel_id === 0x84 && channel_type === 0x82) {
            decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
            decoded.distance_alarming = bytes[i + 2] == 0 ? false : true;
            i += 3;
        } else {
            break;
        }
    }

    return decoded;
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
    
/** Helper functions **/

function decodeToString(payload) {
  return String.fromCharCode.apply(String, payload);
}

function decodeToJson(payload) {
  // covert payload to string.
  var str = decodeToString(payload);

  // parse string to JSON
  var data = JSON.parse(str);
  return data;
}

function base64ToHex(str) {
    const raw = atob(str);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
    }
return result.toUpperCase();
}

function getHex(val) {
  if (val.startsWith("0x") || val.startsWith("0X")) {
    val = val.substring(2); //get rid of starting '0x'
  }

  var numBytes = val.length / 2;
  var bytes = [];

  for (var i = 0; i < numBytes; i++) {
    bytes.push(parseInt(val.substring(i * 2, i * 2 + 2), 16));
  }

  return bytes;
}    
