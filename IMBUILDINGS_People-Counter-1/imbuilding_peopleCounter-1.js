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

// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function decode(payload, metadata) {
  let res = {};
  res.payload = payload;
  payloadHEX = base64ToHex(payload.data);
  res.payload.data = Decoder(getHex(payloadHEX), payload.fPort );
  return res;
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

function Decoder(bytes, fPort) {
  var d = {};

  	  var p = {
        bytes: bytes,
        fPort: fPort
      }
  
      if(!containsIMBHeader(p.bytes)){
        //When payload doesn't contain IMBuildings header
        //Assumes that payload is transmitted on specific fport
        //e.g. payload type 2 variant 6 on FPort 26, type 2 variant 7 on FPort 27 and so on...
        switch(p.fPort){
            case 26:
                if(p.bytes.length != 13){
                    return { errors: ['Unable to detect correct payload. Please check your device configuration']};
                }

                d.payload_type = 2;
                d.payload_variant = 6;
                break;
            case 27:
                if(p.bytes.length != 5){
                    return { errors: ['Unable to detect correct payload. Please check your device configuration']};
                }

                d.payload_type = 2;
                d.payload_variant = 7;
                break;
            case 28:
                if(p.bytes.length != 4){
                    return { errors: ['Unable to detect correct payload. Please check your device configuration']};
                }

                d.payload_type = 2;
                d.payload_variant = 8;

                break;
            default:
                return { errors: ['Unable to detect correct payload. Please check your device configuration']};
        }
    }else{
        d.payload_type = p.bytes[0];
        d.payload_variant = p.bytes[1];
        d.device_id = toHEXString(p.bytes, 2, 8)
    }

    switch(d.payload_variant){
        case 0x06:
            d.device_status = p.bytes[p.bytes.length - 13];
            d.battery_voltage = readUInt16BE(p.bytes, p.bytes.length - 12) / 100;
            d.counter_a = readUInt16BE(p.bytes, p.bytes.length - 10);
            d.counter_b = readUInt16BE(p.bytes, p.bytes.length - 8);
            d.sensor_status = p.bytes[p.bytes.length - 6];
            d.total_counter_a = readUInt16BE(p.bytes, p.bytes.length - 5);
            d.total_counter_b = readUInt16BE(p.bytes, p.bytes.length - 3);
            d.payload_counter = p.bytes[p.bytes.length - 1];
            break;
        case 0x07:
            d.sensor_status = p.bytes[p.bytes.length - 5];
            d.total_counter_a = readUInt16BE(p.bytes, p.bytes.length - 4);
            d.total_counter_b = readUInt16BE(p.bytes, p.bytes.length - 2);
            break;
        case 0x08:
            d.device_status = p.bytes[p.bytes.length - 4];
            d.battery_voltage = readUInt16BE(p.bytes, p.bytes.length - 3) / 100;
            d.sensor_status = p.bytes[p.bytes.length - 1];
            break;
    }
  
  return d;
}

function containsIMBHeader(p){
    if(p[0] == 0x02 && p[1] == 0x06 && p.length == 23) return true;
    if(p[0] == 0x02 && p[1] == 0x07 && p.length == 15) return true;
    if(p[0] == 0x02 && p[1] == 0x08 && p.length == 14) return true;

    return false;
}



//Helper functions
function bcd(dec) {
	return ((dec / 10) << 4) + (dec % 10);
}

function unbcd(bcd) {
	return ((bcd >> 4) * 10) + bcd % 16;
}

function toHEXString(payload, index, length){
    var HEXString = '';

    for(var i = 0; i < length; i++){
        if(payload[index + i] < 16){
            HEXString = HEXString + '0';
        }
        HEXString = HEXString + payload[index + i].toString(16);
    }

    return HEXString;
}

function readInt16BE(payload, index){
    var int16 = (payload[index] << 8) + payload[++index];

    if(int16 & 0x8000){
        int16 = - (0x10000 - int16);
    }

    return int16;
}

function readUInt16BE(payload, index){
    return (payload[index] << 8) + payload[++index];
}

function readInt8(payload, index){
    var int8 = payload[index];

    if(int8 & 0x80){
        int8 = - (0x100 - int8);
    }

    return int8;
}
    
