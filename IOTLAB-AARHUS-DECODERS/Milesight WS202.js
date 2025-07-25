/*Adjusted to OS2IoT by Alexander Ibsen, iotlab@aarhus.dk 
Last update july 2025 */

function decode(payload, metadata) {
  const res = {};
  const sensorId = payload.deviceInfo.devEui.slice(-4);
  res.id = `pir-sensor:${sensorId}-Milesight`;
  res.type = "pir-sensor";
  const rawPayload = base64ToHex(payload.data);
  const decoded = Decoder(getHex(rawPayload), payload.fPort);
  const timestamp = new Date(payload.rxInfo[0].nsTime).toISOString();
  //res.decoded = decoded;
  
  res.name = {
    type: "Property",
    value: metadata.name
  };

  if (decoded.pir !== undefined) {
    res.pir = {
      type: "Property",
      value: decoded.pir,
      observedAt: timestamp
    };
  }
  
  if (decoded.daylight !== undefined) {
    res.daylight = {
      type: "Property",
      value: decoded.daylight,
      observedAt: timestamp
    };
  }
  if (decoded.battery !== undefined) {
    res.battery = {
      type: "Property",
      value: decoded.battery,
      observedAt: timestamp
    };
  }
  res.location = {
    type: "GeoProperty",
    value: {
      type: "Point",
      coordinates: [
        Number(metadata.location.coordinates[0]),
        Number(metadata.location.coordinates[1])
      ]
    }
  };

  return [res];
}

function Decoder(bytes, fPort) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // PIR
        else if (channel_id === 0x03 && channel_type === 0x00) {
            decoded.pir = bytes[i] === 0 ? "normal" : "trigger";
            i += 1;
        }
        // DAYLIGHT
        else if (channel_id === 0x04 && channel_type === 0x00) {
            decoded.daylight = bytes[i] === 0 ? "dark" : "light";
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}

// Helper functions...

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
    val = val.substring(2);
  }

  const numBytes = val.length / 2;
  const bytes = [];

  for (let i = 0; i < numBytes; i++) {
    bytes.push(parseInt(val.substring(i * 2, i * 2 + 2), 16));
  }

  return bytes;
}
