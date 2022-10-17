function Decoder(bytes) {
  var decoded = {};

  var offset = 0;
  if (offset + 1 <= bytes.length) {
    var status = bytes[offset++]; // bitmask indicating the presence of the other fields
    if (status & 0x80 && offset + 1 < bytes.length) {
      // Temperature information (degree Celsius)
      var temperature = bytes[offset];
      if (temperature > 127) {
        temperature = temperature - 256;
      }
      decoded.temperature = temperature;
      offset += 1;
    }
    if (status & 0x40) {
      // Transmission triggered by the accelerometer
      decoded.trigger = "accelerometer";
    }
    if (status & 0x20) {
      // Transmission triggered by pressing the pushbutton
      decoded.trigger = "pushbutton";
    }
    if (status & 0x10 && offset + 9 <= bytes.length) {
      // GPS information
      var latDeg10   = bytes[offset] >> 4;
      var latDeg1    = bytes[offset] & 0x0f;
      var latMin10   = bytes[offset + 1] >> 4;
      var latMin1    = bytes[offset + 1] & 0x0f;
      var latMin01   = bytes[offset + 2] >> 4;
      var latMin001  = bytes[offset + 2] & 0x0f;
      var latMin0001 = bytes[offset + 3] >> 4;
      var latSign    = bytes[offset + 3] & 0x01 ? -1 : 1;
      decoded.latitude = latSign * (latDeg10 * 10 + latDeg1 + (latMin10 * 10 + latMin1 + latMin01 * 0.1 + latMin001 * 0.01 + latMin0001 * 0.001) / 60);
      var lonDeg100 = bytes[offset + 4] >> 4;
      var lonDeg10  = bytes[offset + 4] & 0x0f;
      var lonDeg1   = bytes[offset + 5] >> 4;
      var lonMin10  = bytes[offset + 5] & 0x0f;
      var lonMin1   = bytes[offset + 6] >> 4;
      var lonMin01  = bytes[offset + 6] & 0x0f;
      var lonMin001 = bytes[offset + 7] >> 4;
      var lonSign   = bytes[offset + 7] & 0x01 ? -1 : 1;
      decoded.longitude = lonSign * (lonDeg100 * 100 + lonDeg10 * 10 + lonDeg1 + (lonMin10 * 10 + lonMin1 + lonMin01 * 0.1 + lonMin001 * 0.01) / 60);
      decoded.altitude = 0; // altitude information not available
      decoded.sats = bytes[offset + 8] & 0x0f; // number of satellites
      offset += 9;
    }
    if (status & 0x08 && offset + 1 <= bytes.length) {
      // Uplink frame counter
      decoded.uplink = bytes[offset];
      offset += 1;
    }
    if (status & 0x04 && offset + 1 <= bytes.length) {
      // Downlink frame counter
      decoded.downlink = bytes[offset];
      offset += 1;
    }
    if (status & 0x02 && offset + 2 <= bytes.length) {
      // Battery level information (mV)
      decoded.battery = bytes[offset] << 8 | bytes[offset + 1];
      offset += 2;
    }
    if (status & 0x01 && offset + 2 <= bytes.length) {
      // RSSI (dBm) and SNR (dB) information
      decoded.rssi = - bytes[offset];
      var snr = bytes[offset + 1];
      if (snr > 127) {
        snr = snr - 256;
      }
      decoded.snr = snr;
      offset += 2;
    }
  }

  return decoded;
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

function decode(payload, metadata) {
  let res = {};
  res.payload = payload;
  payloadHEX = base64ToHex(payload.data);
  res.payload.data = Decoder(getHex(payloadHEX));
  return res;
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
