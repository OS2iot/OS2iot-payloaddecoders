/**
 * Payload Decoder for OS2IoT
 *
 * Copyright 2022 Milesight IoT
 * @product WS302
 * 
 * Adjusted to support OS2IoT by iotlab@aarhus.dk 
 * Last update june 2024
 */

function Decoder(bytes, fPort) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // SOUND
        else if (channel_id === 0x05 && channel_type === 0x5b) {
            decoded.freq_weight = readFrequecyWeightType(bytes[i]);
            decoded.time_weight = readTimeWeightType(bytes[i]);
            decoded.la = readUInt16LE(bytes.slice(i + 1, i + 3)) / 10;
            decoded.laeq = readUInt16LE(bytes.slice(i + 3, i + 5)) / 10;
            decoded.lamax = readUInt16LE(bytes.slice(i + 5, i + 7)) / 10;
            i += 7;
        }
        // LoRaWAN Class Type
        else if (channel_id === 0xff && channel_type === 0x0f) {
            switch (bytes[i]) {
                case 0:
                    decoded.class_type = "class-a";
                    break;
                case 1:
                    decoded.class_type = "class-b";
                    break;
                case 2:
                    decoded.class_type = "class-c";
                    break;
            }
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}

function readFrequecyWeightType(bytes) {
    var type = "";
    
    var bits = bytes & 0x03;
    switch (bits) {
        case 0:
            type = "Z";
            break;
        case 1:
            type = "A";
            break;
        case 2:
            type = "C";
            break;
    }

    return type;
}

function readTimeWeightType(bytes) {
    var type = "";

    var bits = (bytes[0] >> 2) & 0x03;
    switch (bits) {
        case 0:
            type = "impulse";
            break;
        case 1:
            type = "fast";
            break;
        case 2:
            type = "slow";
            break;
    }

    return type;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}


function decode(payload, metadata) {
    let res = {};
    let sensorId = payload.devEUI.slice(-4);
    res.id = "soundlevel-sensor:" + sensorId + "-Milesight";
    res.type=  "soundlevel-sensor"
    let rawPayload = base64ToHex(payload.data);
    let decoded = Decoder(getHex(rawPayload), payload.fPort );
    let timestamp = payload.rxInfo[0].time;
    
    //res.decodedPayload = decoded

    res.name =  {
        "type": "Property",
        "value": metadata.name
    }
    
    if (decoded.hasOwnProperty("la"))
    {
        res.la =  {
                    "type": "Property",
                    "value": decoded.la,
                    "observedAt": timestamp
        }
    }

        if (decoded.hasOwnProperty("laeq"))
    {
        res.laeq =  {
                    "type": "Property",
                    "value": decoded.laeq,
                    "observedAt": timestamp
        }
    }

    if (decoded.hasOwnProperty("lamax"))
    {
        res.lamax =  {
                    "type": "Property",
                    "value": decoded.lamax,
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
   return [res];
}
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
