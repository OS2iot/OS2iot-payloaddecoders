/*
  ______ _       _______     _______ 
 |  ____| |     / ____\ \   / / ____|
 | |__  | |    | (___  \ \_/ / (___  
 |  __| | |     \___ \  \   / \___ \ 
 | |____| |____ ____) |  | |  ____) |
 |______|______|_____/   |_| |_____/ 
 
  ELSYS simple payload decoder. 
  Use it as it is or remove the bugs :)
  www.elsys.se
  peter@elsys.se
*/
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
      
function base64ToHex(str) {
const raw = atob(str);
let result = '';
for (let i = 0; i < raw.length; i++) {
const hex = raw.charCodeAt(i).toString(16);
result += (hex.length === 2 ? hex : '0' + hex);
}
return result.toUpperCase();
}

// https://www.elsys.se/en/elsys-payload/


const TYPE_TEMP = 0x01; //temp 2 bytes -3276.8°C -->3276.7°C
const TYPE_RH = 0x02; //Humidity 1 byte  0-100%
const TYPE_ACC = 0x03; //acceleration 3 bytes X,Y,Z -128 --> 127 +/-63=1G
const TYPE_LIGHT = 0x04; //Light 2 bytes 0-->65535 Lux
const TYPE_MOTION = 0x05; //No of motion 1 byte  0-255
const TYPE_CO2 = 0x06; //Co2 2 bytes 0-65535 ppm
const TYPE_VDD = 0x07; //VDD 2byte 0-65535mV
const TYPE_ANALOG1 = 0x08; //VDD 2byte 0-65535mV
const TYPE_GPS = 0x09; //3bytes lat 3bytes long binary
const TYPE_PULSE1 = 0x0A; //2bytes relative pulse count
const TYPE_PULSE1_ABS = 0x0B; //4bytes no 0->0xFFFFFFFF
const TYPE_EXT_TEMP1 = 0x0C; //2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL = 0x0D; //1bytes value 1 or 0
const TYPE_EXT_DISTANCE = 0x0E; //2bytes distance in mm
const TYPE_ACC_MOTION = 0x0F; //1byte number of vibration/motion
const TYPE_IR_TEMP = 0x10; //2bytes internal temp 2bytes external temp -3276.5C-->3276.5C
const TYPE_OCCUPANCY = 0x11; //1byte data
const TYPE_WATERLEAK = 0x12; //1byte data 0-255
const TYPE_GRIDEYE = 0x13; //65byte temperature data 1byte ref+64byte external temp
const TYPE_PRESSURE = 0x14; //4byte pressure data (hPa)
const TYPE_SOUND = 0x15; //2byte sound data (peak/avg)
const TYPE_PULSE2 = 0x16; //2bytes 0-->0xFFFF
const TYPE_PULSE2_ABS = 0x17; //4bytes no 0->0xFFFFFFFF
const TYPE_ANALOG2 = 0x18; //2bytes voltage in mV
const TYPE_EXT_TEMP2 = 0x19; //2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL2 = 0x1A; // 1bytes value 1 or 0
const TYPE_EXT_ANALOG_UV = 0x1B; // 4 bytes signed int (uV)
const TYPE_TVOC = 0x1C; // 2 bytes (ppb)
const TYPE_DEBUG = 0x3D; // 4bytes debug

function bin16dec(bin) {
var num = bin & 0xFFFF;
if (0x8000 & num)
    num = -(0x010000 - num);
return num;
}

function bin8dec(bin) {
var num = bin & 0xFF;
if (0x80 & num)
    num = -(0x0100 - num);
return num;
}

function hexToBytes(hex) {
for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
return bytes;
}

function DecodeElsysPayload(data) {
var obj = new Object();
for (i = 0; i < data.length; i++) {
    //console.log(data[i]);
    switch (data[i]) {
    case TYPE_TEMP: //Temperature
        var temp = (data[i + 1] << 8) | (data[i + 2]);
        temp = bin16dec(temp);
        obj.temperature = temp / 10;
        i += 2;
        break
    case TYPE_RH: //Humidity
        var rh = (data[i + 1]);
        obj.humidity = rh;
        i += 1;
        break
    case TYPE_ACC: //Acceleration
        obj.x = bin8dec(data[i + 1]);
        obj.y = bin8dec(data[i + 2]);
        obj.z = bin8dec(data[i + 3]);
        i += 3;
        break
    case TYPE_LIGHT: //Light
        obj.light_level = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_MOTION: //Motion sensor(PIR)
        obj.motion = (data[i + 1]);
        i += 1;
        break
    case TYPE_CO2: //CO2
        obj.co2 = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_VDD: //Battery level
        obj.vdd = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_ANALOG1: //Analog input 1
        obj.analog1 = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_GPS: //gps
        i++;
        obj.lat = (data[i + 0] | data[i + 1] << 8 | data[i + 2] << 16 | (data[i + 2] & 0x80 ? 0xFF << 24 : 0)) / 10000;
        obj.long = (data[i + 3] | data[i + 4] << 8 | data[i + 5] << 16 | (data[i + 5] & 0x80 ? 0xFF << 24 : 0)) / 10000;
        i += 5;
        break
    case TYPE_PULSE1: //Pulse input 1
        obj.pulse1 = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_PULSE1_ABS: //Pulse input 1 absolute value
        var pulseAbs = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
        obj.pulseAbs = pulseAbs;
        i += 4;
        break
    case TYPE_EXT_TEMP1: //External temp
        var temp = (data[i + 1] << 8) | (data[i + 2]);
        temp = bin16dec(temp);
        obj.externalTemperature = temp / 10;
        i += 2;
        break
    case TYPE_EXT_DIGITAL: //Digital input
        obj.digital = (data[i + 1]);
        i += 1;
        break
    case TYPE_EXT_DISTANCE: //Distance sensor input
        obj.distance = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_ACC_MOTION: //Acc motion
        obj.accMotion = (data[i + 1]);
        i += 1;
        break
    case TYPE_IR_TEMP: //IR temperature
        var iTemp = (data[i + 1] << 8) | (data[i + 2]);
        iTemp = bin16dec(iTemp);
        var eTemp = (data[i + 3] << 8) | (data[i + 4]);
        eTemp = bin16dec(eTemp);
        obj.irInternalTemperature = iTemp / 10;
        obj.irExternalTemperature = eTemp / 10;
        i += 4;
        break
    case TYPE_OCCUPANCY: //Body occupancy
        obj.occupancy = (data[i + 1]);
        i += 1;
        break
    case TYPE_WATERLEAK: //Water leak
        obj.waterleak = (data[i + 1]);
        i += 1;
        break
    case TYPE_GRIDEYE: //Grideye data
        var ref = data[i+1];
        i++;
        obj.grideye = [];
        for(var j = 0; j < 64; j++) {
            obj.grideye[j] = ref + (data[1+i+j] / 10.0);
        }
        i += 64;
        break
    case TYPE_PRESSURE: //External Pressure
        var temp = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
        obj.pressure = temp / 1000;
        i += 4;
        break
    case TYPE_SOUND: //Sound
        obj.soundPeak = data[i + 1];
        obj.soundAvg = data[i + 2];
        i += 2;
        break
    case TYPE_PULSE2: //Pulse 2
        obj.pulse2 = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_PULSE2_ABS: //Pulse input 2 absolute value
        obj.pulseAbs2 = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
        i += 4;
        break
    case TYPE_ANALOG2: //Analog input 2
        obj.analog2 = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    case TYPE_EXT_TEMP2: //External temp 2
        var temp = (data[i + 1] << 8) | (data[i + 2]);
        temp = bin16dec(temp);
        if(typeof obj.externalTemperature2 === "number") {
            obj.externalTemperature2 = [obj.externalTemperature2];
        } 
        if(typeof obj.externalTemperature2 === "object") {
            obj.externalTemperature2.push(temp / 10);
        } else {
            obj.externalTemperature2 = temp / 10;
        }
        i += 2;
        break
    case TYPE_EXT_DIGITAL2: //Digital input 2
        obj.digital2 = (data[i + 1]);
        i += 1;
        break
    case TYPE_EXT_ANALOG_UV: //Load cell analog uV
        obj.analogUv = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
        i += 4;
        break
    case TYPE_TVOC:
        obj.tvoc = (data[i + 1] << 8) | (data[i + 2]);
        i += 2;
        break
    default: //somthing is wrong with data
        i = data.length;
        break
    }
}
return obj;
}




  function decode(payload, metadata) {
    let res = {};
    
    let sensorId = payload.devEUI.slice(-4);

    res.id = "accelerometer-sensor:" + sensorId + "-Elsys";
    res.type=  "accelerometer-sensor"
    
    let rawPayload = base64ToHex(payload.data)        
    let decoded = DecodeElsysPayload(hexToBytes(rawPayload))

    let timestamp = payload.rxInfo[0].time;


    res.name =  {
        "type": "Property",
        "value": metadata.name
    }
    // res.decodedPayload = decoded

    if (decoded.hasOwnProperty("occupancy"))
    {
        res.occupancy =  {
                    "type": "Property",
                    "value": decoded.occupancy,
                    "observedAt": timestamp
        }
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

    if (decoded.hasOwnProperty("light_level"))
    {
        res.light_level =  {
                    "type": "Property",
                    "value": decoded.light_level,
                    "observedAt": timestamp
        }
    }

    if (decoded.hasOwnProperty("motion"))
    {
        res.motion =  {
                    "type": "Property",
                    "value": decoded.motion,
                    "observedAt": timestamp
        }
    }        

    if (decoded.hasOwnProperty("co2"))
    {
        res.co2 =  {
                    "type": "Property",
                    "value": decoded.co2,
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

    // added: fcount - Kristian Risager Larsen, iotlab@aarhus.dk 2024-06
    if (payload.hasOwnProperty("fCnt"))
    {
        res.fCnt =  {
                    "type": "Property",
                    "value": payload.fCnt,
                    "observedAt": timestamp
        }
    }

    // added: accelerometer output - Kristian Risager Larsen, iotlab@aarhus.dk 2024-06
    if (decoded.hasOwnProperty("x"))
    {
        res.accx =  {
            "type": "Property",
            "value": decoded.x,
            "observedAt": timestamp
        }
    }
    
    if (decoded.hasOwnProperty("y"))
    {
        res.accy =  {
            "type": "Property",
            "value": decoded.y,
            "observedAt": timestamp
        }
    }

    if (decoded.hasOwnProperty("z"))
    {
        res.accz =  {
            "type": "Property",
            "value": decoded.z,
            "observedAt": timestamp
        }
    }

    if (decoded.hasOwnProperty("accMotion"))
    {
        res.accMotion =  {
            "type": "Property",
            "value": decoded.accMotion,
            "observedAt": timestamp
        }
    }     

    return [res];
  }
