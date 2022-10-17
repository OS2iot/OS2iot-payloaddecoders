        /**

	In this editor, you can define your custom javascript code to parse the incoming payload.	
	
	The following variables are available:
	
	payload     : hex string of the payload
	p	     : array of bytes represented as string of 2 hex digits 
	v        : array of bytes represented as integers
	msg.EUI  : device EUI
	msg.fcnt : message frame counter
	msg.port : message port field
	msg.ts   : message timestamp as number (epoch)
	
	Last line of your script will be printed to the payload payload column.

*/
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
const TYPE_OCCUPANCY = 0x11; //1byte payload
const TYPE_WATERLEAK = 0x12; //1byte payload 0-255
const TYPE_GRIDEYE = 0x13; //65byte temperature payload 1byte ref+64byte external temp
const TYPE_PRESSURE = 0x14; //4byte pressure payload (hPa)
const TYPE_SOUND = 0x15; //2byte sound payload (peak/avg)
const TYPE_PULSE2 = 0x16; //2bytes 0-->0xFFFF
const TYPE_PULSE2_ABS = 0x17; //4bytes no 0->0xFFFFFFFF
const TYPE_ANALOG2 = 0x18; //2bytes voltage in mV
const TYPE_EXT_TEMP2 = 0x19; //2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL2 = 0x1A; // 1bytes value 1 or 0
const TYPE_EXT_ANALOG_UV = 0x1B; // 4 bytes signed int (uV)
const TYPE_DEBUG = 0x3D; // 4bytes debug

function bin16dec(bin) {
    var num=bin&0xFFFF;
    if (0x8000 & num)
        num = - (0x010000 - num);
    return num;
}
function bin8dec(bin) {
    var num=bin&0xFF;
    if (0x80 & num) 
        num = - (0x0100 - num);
    return num;
}
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function DecodeElsysPayload(payload){
    var obj ={};
    for(i=0;i<payload.length;i++){
        switch (payload[i]) {
        case TYPE_TEMP: //Temperature
            var temp = (payload[i + 1] << 8) | (payload[i + 2]);
            temp = bin16dec(temp);
            obj.temperature = temp / 10;
            i += 2;
            break
        case TYPE_RH: //Humidity
            var rh = (payload[i + 1]);
            obj.humidity = rh;
            i += 1;
            break
        case TYPE_ACC: //Acceleration
            obj.x = bin8dec(payload[i + 1]);
            obj.y = bin8dec(payload[i + 2]);
            obj.z = bin8dec(payload[i + 3]);
            i += 3;
            break
        case TYPE_LIGHT: //Light
            obj.light = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_MOTION: //Motion sensor(PIR)
            obj.motion = (payload[i + 1]);
            i += 1;
            break
        case TYPE_CO2: //CO2
            obj.co2 = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_VDD: //Battery level
            obj.vdd = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_ANALOG1: //Analog input 1
            obj.analog1 = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_GPS: //gps
            i++;
            obj.lat = (payload[i + 0] | payload[i + 1] << 8 | payload[i + 2] << 16 | (payload[i + 2] & 0x80 ? 0xFF << 24 : 0)) / 10000;
            obj.long = (payload[i + 3] | payload[i + 4] << 8 | payload[i + 5] << 16 | (payload[i + 5] & 0x80 ? 0xFF << 24 : 0)) / 10000;
            i += 5;
            break
        case TYPE_PULSE1: //Pulse input 1
            obj.pulse1 = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_PULSE1_ABS: //Pulse input 1 absolute value
            var pulseAbs = (payload[i + 1] << 24) | (payload[i + 2] << 16) | (payload[i + 3] << 8) | (payload[i + 4]);
            obj.pulseAbs = pulseAbs;
            i += 4;
            break
        case TYPE_EXT_TEMP1: //External temp
            var temp = (payload[i + 1] << 8) | (payload[i + 2]);
            temp = bin16dec(temp);
            obj.externalTemperature = temp / 10;
            i += 2;
            break
        case TYPE_EXT_DIGITAL: //Digital input
            obj.digital = (payload[i + 1]);
            i += 1;
            break
        case TYPE_EXT_DISTANCE: //Distance sensor input
            obj.distance = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_ACC_MOTION: //Acc motion
            obj.accMotion = (payload[i + 1]);
            i += 1;
            break
        case TYPE_IR_TEMP: //IR temperature
            var iTemp = (payload[i + 1] << 8) | (payload[i + 2]);
            iTemp = bin16dec(iTemp);
            var eTemp = (payload[i + 3] << 8) | (payload[i + 4]);
            eTemp = bin16dec(eTemp);
            obj.irInternalTemperature = iTemp / 10;
            obj.irExternalTemperature = eTemp / 10;
            i += 4;
            break
        case TYPE_OCCUPANCY: //Body occupancy
            obj.occupancy = (payload[i + 1]);
            i += 1;
            break
        case TYPE_WATERLEAK: //Water leak
            obj.waterleak = (payload[i + 1]);
            i += 1;
            break
        case TYPE_GRIDEYE: //Grideye payload
            var ref = payload[i+1];
            i++;
            obj.grideye = [];
            for(var j = 0; j < 64; j++) {
                obj.grideye[j] = ref + (payload[1+i+j] / 10.0);
            }
            i += 64;
            break
        case TYPE_PRESSURE: //External Pressure
            var temp = (payload[i + 1] << 24) | (payload[i + 2] << 16) | (payload[i + 3] << 8) | (payload[i + 4]);
            obj.pressure = temp / 1000;
            i += 4;
            break
        case TYPE_SOUND: //Sound
            obj.soundPeak = payload[i + 1];
            obj.soundAvg = payload[i + 2];
            i += 2;
            break
        case TYPE_PULSE2: //Pulse 2
            obj.pulse2 = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_PULSE2_ABS: //Pulse input 2 absolute value
            obj.pulseAbs2 = (payload[i + 1] << 24) | (payload[i + 2] << 16) | (payload[i + 3] << 8) | (payload[i + 4]);
            i += 4;
            break
        case TYPE_ANALOG2: //Analog input 2
            obj.analog2 = (payload[i + 1] << 8) | (payload[i + 2]);
            i += 2;
            break
        case TYPE_EXT_TEMP2: //External temp 2
            var temp = (payload[i + 1] << 8) | (payload[i + 2]);
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
            obj.digital2 = (payload[i + 1]);
            i += 1;
            break
        case TYPE_EXT_ANALOG_UV: //Load cell analog uV
            obj.analogUv = (payload[i + 1] << 24) | (payload[i + 2] << 16) | (payload[i + 3] << 8) | (payload[i + 4]);
            i += 4;
            break
        default: //somthing is wrong with payload
            i = payload.length;
            break
        }
    }
    return obj;
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
       res = payload;
       res.metadata = metadata;
       let dataInHex = base64ToHex(payload.data).toString();
       res.data = DecodeElsysPayload(hexToBytes(dataInHex));
       return res;
    }
