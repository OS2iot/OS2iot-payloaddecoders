
function base64ToBytes(str) {
    return atob(str)
        .split("")
        .map(function (c) {
        return c.charCodeAt(0);
        });
}

function base64ToHex(str) {
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
    result += ' ';
  }
  return result.toUpperCase();
}

/* https://www.decentlab.com/products/ultrasonic-distance-/-level-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 2,
     values: [{name: 'distance',
               displayName: 'Distance',
               convert: function (x) { return x[0]; },
               unit: 'mm'},
              {name: 'number_of_valid_samples',
               displayName: 'Number of valid samples',
               convert: function (x) { return x[1]; }}]},
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]}
  ],

  read_int: function (bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode: function (bytes) {

    var version = bytes[0];
    if (version != this.PROTOCOL_VERSION) {
      return {error: "protocol version " + version + " doesn't match v2"};
    }

    var deviceId = this.read_int(bytes, 1);
    var flags = this.read_int(bytes, 3);
    var result = {'protocol_version': version, 'device_id': deviceId};
    // decode payload
    var pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1)
        continue;

      var sensor = this.SENSORS[i];
      var x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j++) {
        x.push(this.read_int(bytes, pos));
        pos += 2;
      }

      // decode sensor values
      for (j = 0; j < sensor.values.length; j++) {
        var value = sensor.values[j];
        if ('convert' in value) {
          result[value.name] = {displayName: value.displayName,
                                value: value.convert.bind(this)(x)};
          if ('unit' in value)
            result[value.name]['unit'] = value.unit;
        }
      }
    }
    return result;
  }
};

function decode(payload, metadata) {
    let metameta = JSON.parse(metadata.metadata);
    metadata.metadata = metameta; // lets unfuck metadata first


    let bytes = base64ToBytes(payload.data);
    let decdec = decentlab_decoder.decode(bytes);
    let distance = decdec.distance.value / 1000;

    let decoded = {
        HEX : base64ToHex(payload.data),
        batteryVoltage: decdec.battery_voltage.value,
        distance: distance,
        number_of_valid_samples : decdec.number_of_valid_samples.value,
    };

    if ('sensorkote_DVR90' in metameta) {
        decoded.vandspejl_DVR90 = metameta.sensorkote_DVR90 - distance;

        if ('bundkote_DVR90' in metameta) {
            decoded.vanddybde = decoded.vandspejl_DVR90- metameta.bundkote_DVR90;
        }
    }


    return {
        payload:  payload,
        metadata: metadata,

        decoded:  decoded
    };
}
