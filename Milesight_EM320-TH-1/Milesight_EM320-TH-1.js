/**
 * Payload Decoder for OS2IoT
 * 
 * Copyright 2022 Milesight IoT
 * @product EM320-TH
 * 
 * Adjusted to support OS2IoT by iotlab@aarhus.dk 
 * Last update june 2024
 */
function Decoder(bytes, fPort) {
    var decoded = {};

    for (var i = 0; i < bytes.length;) {
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
        // TEMPERATURE & HUMIDITY HISTROY
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var point = {};
            point.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            point.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
            point.humidity = bytes[i + 6] / 2;
            decoded.history = decoded.history || [];
            decoded.history.push(point);
            i += 7;
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

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xFFFFFFFF);
}

    function decode(payload, metadata) {
        let res = {};
        let sensorId = payload.devEUI.slice(-4);
        res.id = "refrigerator-sensor:" + sensorId + "-Milesight";
        res.type=  "refrigerator-sensor"
        let rawPayload = base64ToHex(payload.data);
        let decoded = Decoder(getHex(rawPayload), payload.fPort );
        let timestamp = payload.rxInfo[0].time;
        
        //res.decodedPayload = decoded

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

        if (decoded.hasOwnProperty("humidity"))
        {
            res.humidity =  {

                        "type": "Property",
                        "value": decoded.humidity,
                        "observedAt": timestamp
            }
        }
        if (decoded.hasOwnProperty("battery"))
        {
            res.battery =  {

                        "type": "Property",
                        "value": decoded.battery,
                        "observedAt": timestamp
            }
        }        

       return [res];
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
