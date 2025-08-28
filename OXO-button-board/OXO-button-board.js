// OS2IoT / NGSI-LD specific code
// Alexander Ibsen & Kristian Risager Larsen, 2025-06

function base64ToBytes(str) {
    return atob(str)
        .split("")
        .map(function (c) {
        return c.charCodeAt(0);
        });
}

function getProperty(decodeddata, payload, propertyName, res)  {
      if (decodeddata.hasOwnProperty(propertyName))
      {
          res[propertyName] = {
              "type": "Property",
              "value": decodeddata[propertyName],
              "observedAt": new Date(payload.rxInfo[0].nsTime).toISOString()
          }
      }
  }

function decode(payload,metadata) {
    let res = {};
    let bytes = base64ToBytes(payload.data);
    //res.bytes = bytes; 
    let sensorId = payload.deviceInfo.devEui.slice(-6);
    res.id = "button-board:" + sensorId + "-OXO";
    res.type=  "button-board"
    // res.observedAt = new Date(payload.rxInfo[0].nsTime).toISOString();
    let decoded = decodeUplink({bytes});
    //res.decoded = decoded;


    getProperty(decoded.data, payload, "button", res)
    getProperty(decoded.data, payload, "bat", res)


    let metadataFields = metadata.metadata;
    metadataFields = JSON.parse(metadataFields);

    getProperty(metadataFields, payload, "location", res)
    getProperty(metadataFields, payload, "building", res)
    getProperty(metadataFields, payload, "floor", res)
    getProperty(metadataFields, payload, "room", res)
    
    return [res];
}

// Original code from OXON - https://oxon.ch
function decodeUplink({ bytes }) {
  const messageId = bytes[0];
  let data = {};
  const warnings = [];
  const errors = [];

  switch (messageId) {
    case 0x12:
      data = { message: 'Settings saved' };
      break;
    case 0x31:
      data = buttonboardStateUpdate(bytes);
      break;
    case 0x32:
      data = buttonboardBatchUpdate(bytes);
      break;
    case 0x40:
      data = buttonboardPowerSaveConfigs(bytes);
      break;
    default:
      warnings.push('Unknown message ID: 0x' + toHexString(messageId));
      break;
  }

  return {
    data,
    warnings,
    errors,
  };
}

function toHexString(byte) {
  return ('0' + (byte & 0xff).toString(16).toUpperCase()).slice(-2);
}

function getButtons(byte) {
  if (byte === 0) return 'None';
  const longPressed = !!(byte & 0x80);
  let reason = '';
  reason += longPressed ? 'Long press button ' : 'Button ';
  if (byte & 0x01) reason += '1, ';
  if (byte & 0x02) reason += '2, ';
  if (byte & 0x04) reason += '3, ';
  if (byte & 0x08) reason += '4, ';
  if (byte & 0x10) reason += '5, ';
  if (byte & 0x20) reason += '6, ';
  return reason.slice(0, -2);
}

/* ID 0x31 */
function buttonboardStateUpdate(bytes) {
  const button = getButtons(bytes[1]);
  const hbIRQ = !!bytes[2];
  const accIRQ = !!bytes[3];
  const appMode = bytes[4];
  const enBtns = getButtons(bytes[5]);
  const bat = bytes[6];
  const temp = bytes[7];
  let accX = bytes[8] * 256 + bytes[9];
  let accY = bytes[10] * 256 + bytes[11];
  let accZ = bytes[12] * 256 + bytes[13];
  accX = accX < 32767 ? (2 / 8191) * accX : (-2 / 8192) * (65536 - accX);
  accY = accY < 32767 ? (2 / 8191) * accY : (-2 / 8192) * (65536 - accY);
  accZ = accZ < 32767 ? (2 / 8191) * accZ : (-2 / 8192) * (65536 - accZ);
  accX = Math.round((accX + 2.7755575615628914e-17) * 1000) / 1000;
  accY = Math.round((accY + 2.7755575615628914e-17) * 1000) / 1000;
  accZ = Math.round((accZ + 2.7755575615628914e-17) * 1000) / 1000;
  const prodId = '0x' + toHexString(bytes[14]) + toHexString(bytes[15]) + toHexString(bytes[16]);

  const hwVers =
    'V' +
    bytes[17].toString(16) +
    '.' +
    (bytes[18] / 16).toString(16) +
    '.' +
    (bytes[18] % 16).toString(16);

  const fwVers =
    'V' +
    bytes[19].toString(16) +
    '.' +
    (bytes[20] / 16).toString(16) +
    '.' +
    (bytes[20] % 16).toString(16);

  const decoded = {
    button,
    hbIRQ,
    accIRQ,
    appMode,
    enBtns,
    bat,
    temp,
    accX,
    accY,
    accZ,
    prodId,
    hwVers,
    fwVers,
  };
  return decoded;
}

/* ID 0x32 */
function buttonboardBatchUpdate(bytes) {
  const buttonCounter1 = bytes[1] * 256 + bytes[2];
  const buttonCounter2 = bytes[3] * 256 + bytes[4];
  const buttonCounter3 = bytes[5] * 256 + bytes[6];
  const buttonCounter4 = bytes[7] * 256 + bytes[8];
  const buttonCounter5 = bytes[9] * 256 + bytes[10];
  const buttonCounter6 = bytes[11] * 256 + bytes[12];

  const decoded = {
    buttonCounter1: buttonCounter1,
    buttonCounter2: buttonCounter2,
    buttonCounter3: buttonCounter3,
    buttonCounter4: buttonCounter4,
    buttonCounter5: buttonCounter5,
    buttonCounter6: buttonCounter6,
  };
  return decoded;
}

/* ID 0x40 */
function buttonboardPowerSaveConfigs(bytes) {
  const batchTime = bytes[1] * 256 + bytes[2] + ' sec';
  const ledPowerSaveMode = !!bytes[3];
  const showSendStatus = !!(bytes[4] & 0x01);
  const showLoRaStatus = !!(bytes[4] & 0x02);

  const decoded = {
    batchTime,
    ledPowerSaveMode,
    showSendStatus,
    showLoRaStatus,
  };
  return decoded;
}
