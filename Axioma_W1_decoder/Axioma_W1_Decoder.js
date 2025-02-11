//Function to decode status messages for Axioma payloads
//Originally by Alexandre Alapetite, github.com/Alkarex for node-red
//Adjusted by Alexander Ibsen, alei@aarhus.dk for OS2IoT and NGSI-LD format

function statusAxiomaShort(s) {
    const messages = [];
    switch (s) {
        case 0x00: messages.push('OK'); break;
        case 0x04: messages.push('Low battery'); break;
        case 0x08: messages.push('Permanent error'); break;
        case 0x10: messages.push('Dry'); break;
        case 0x70: messages.push('Backflow'); break;
        case 0xD0: messages.push('Manipulation'); break;
        case 0xB0: messages.push('Burst'); break;
        case 0x30: messages.push('Leakage'); break;
        case 0x90: messages.push('Low temperature'); break;
    }
    return messages;
}

// Function to decode Axioma Short payload (base64)
function decodeAxiomaShort(raw64) {
    const b = new Uint8Array(atob(raw64).split('').map(char => char.charCodeAt(0)));
    let epoch, state, volume, pastPeriod;
    let pastVolumes = [];
    let i = 0;
    let error;

    try {
        epoch = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); i += 4;
        state = b[i]; i += 1;
        volume = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); i += 4;

        while (i + 8 <= b.length) {
            pastVolumes.push(b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)); i += 4;
        }

        pastPeriod = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); i += 4;
    } catch (ex) {
        error = true;
    }

    return {
        date: state == 0 ? new Date(epoch * 1000).toISOString() : undefined,
        state: state,
        stateMessages: statusAxiomaShort(state),
        volume: state == 0 && volume ? volume / 1000.0 : undefined,
        pastVolumes: state == 0 && pastVolumes.length > 0 ? pastVolumes.map(v => v / 1000.0) : undefined,
        pastPeriod: state == 0 && pastPeriod ? pastPeriod : undefined,
        error: error ? error : undefined,
    };
}

// Function to decode status messages for Axioma Extended payloads
function statusAxiomaExtended(s) {
    const messages = [];
    if (s === 0x00) {
        messages.push('OK');
    } else {
        if (s & 0x04) messages.push('Low battery');
        if (s & 0x08) messages.push('Permanent error');
        if (s & 0x10) messages.push('Temporary error');
        if (s === 0x10) messages.push('Dry');
        if ((s & 0x60) === 0x60) messages.push('Backflow');
        if ((s & 0xA0) === 0xA0) messages.push('Burst');
        if ((s & 0x20) && !(s & 0x40) && !(s & 0x80)) messages.push('Leakage');
        if ((s & 0x80) && !(s & 0x20)) messages.push('Low temperature');
    }
    return messages;
}

// Function to decode Axioma Extended payload (base64)
function decodeAxiomaExtended(raw64) {
    const b = new Uint8Array(atob(raw64).split('').map(char => char.charCodeAt(0)));
    let epoch, state, volume, logEpoch, logVolume;
    let deltaVolumes = [];
    let i = 0;
    let error;

    try {
        epoch = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); i += 4;
        state = b[i]; i += 1;
        volume = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); i += 4;
        logEpoch = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); i += 4;
        logVolume = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); i += 4;

        while (i + 2 <= b.length) {
            deltaVolumes.push(b[i] | (b[i + 1] << 8)); i += 2;
        }
    } catch (ex) {
        error = true;
    }

    return {
        date: state == 0 ? new Date(epoch * 1000).toISOString() : undefined,
        state: state,
        stateMessages: statusAxiomaExtended(state),
        volume: state == 0 && volume ? volume / 1000.0 : undefined,
        logDate: state == 0 && logEpoch ? new Date(logEpoch * 1000).toISOString() : undefined,
        logVolume: state == 0 && logVolume ? logVolume / 1000.0 : undefined,
        deltaVolumes: state == 0 && deltaVolumes.length > 0 ? deltaVolumes.map(v => v / 1000.0) : undefined,
        error: error ? error : undefined,
    };
}

// Function to auto-detect whether the payload is "Short" or "Extended"
function autoDecode(raw64) {
    let rawLength;
    try {
        rawLength = atob(raw64).length;
    } catch (ex) {
        rawLength = 0;
    }

    if (rawLength > 42) {
        return decodeAxiomaExtended(raw64);
    } else if (rawLength <= 9) {
        return decodeAxiomaShort(raw64);
    } else {
        let sniffAxiomaExtended;
        try {
            sniffAxiomaExtended = decodeAxiomaExtended(raw64);
            const maxValidDateDifferenceMs = 1000 * 86400 * 15;
            const date1 = new Date(sniffAxiomaExtended.date);
            const date2 = new Date(sniffAxiomaExtended.logDate);
            if (Math.abs(date1.getTime() - date2.getTime()) > maxValidDateDifferenceMs) {
                return decodeAxiomaShort(raw64);
            }
        } catch (ex) {
            return decodeAxiomaShort(raw64);
        }
        return sniffAxiomaExtended;
    }
}

// Example input and usage in the browser
function processPayload(raw64) {
    try {
        const result = autoDecode(raw64);
        return result;
    } catch (ex) {
        return { error: ex.message };
    }
}

function decode(payload, metadata) {
    let decoded = processPayload(payload.data);

        let res = {};
        
        let sensorId = payload.deviceInfo.devEui.slice(-6);
        //res.decoded = decoded;
        res.id = "water-meter:" + sensorId+"-axioma";
        res.type=  "water-meter"        
        //res.decodedPayload = decoded
        res.name =  {

            "type": "Property",
            "value": metadata.name
        }
        if (decoded.hasOwnProperty("logVolume") && decoded.logVolume !== undefined) {
            res.logVolume = {
                "type": "Property",
                "value": decoded.logVolume,
                "observedAt": decoded.logDate
            };
        }
        if (decoded.hasOwnProperty("state") && decoded.state !== undefined)
        {
            res.state =  {

                        "type": "Property",
                        "value": decoded.state,
                        "observedAt": decoded.logDate
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
