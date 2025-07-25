/*
Payload Decoder
@product VS330
Adjusted to OS2IoT by Alexander Ibsen, iotlab@aarhus.dk 
Last update july 2025 */
 */

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

    for (i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // DISTANCE
        else if (channel_id === 0x02 && channel_type === 0x82) {
            decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // OCCUPANCY
        else if (channel_id === 0x03 && channel_type === 0x8e) {
            decoded.occupancy = bytes[i] === 0 ? "vacant" : "occupied";
            i += 1;
        }
        // CALIBRATION
        else if (channel_id === 0x04 && channel_type === 0x8e) {
            decoded.calibration = bytes[i] === 0 ? "failed" : "success";
            i += 1;
        } else {
            break;
        }
    }
    return decoded;
}

// bytes to number
function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}


function decode(payload, metadata) {
    let res = {};
    
    let sensorId = payload.deviceInfo.devEui.slice(-5);

    res.id = "occupancy-sensor:" + sensorId + "-MilesightVS330";
    res.type=  "occupancy-sensor"
    let rawPayload = base64ToHex(payload.data);
    let decoded = Decoder(getHex(rawPayload), payload.fPort);
    let timestamp = new Date(payload.rxInfo[0].nsTime).toISOString();
    
    //res.decodedPayload = decoded;

    res.name =  {
        "type": "Property",
        "value": metadata.name
    }


    if (decoded.hasOwnProperty("battery"))
        {
            res.battery =  {
    
                        "type": "Property",
                        "value": decoded.battery,
                        "observedAt": timestamp
            }
        }

    if (decoded.hasOwnProperty("distance"))
    {
        res.distance = {
            "type": "Property",
            "value": decoded.distance,
            "observedAt" : timestamp
        }
    }


    if (decoded.hasOwnProperty("occupancy"))
        {
            res.occupancy =  {
        
                        "type": "Property",
                        "value": decoded.occupancy,
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
      return (value & 0xffffffff) >>> 0;
  }
  
  function readInt32LE(bytes) {
      var ref = readUInt32LE(bytes);
      return ref > 0x7fffffff ? ref - 0x100000000 : ref;
  }
  
