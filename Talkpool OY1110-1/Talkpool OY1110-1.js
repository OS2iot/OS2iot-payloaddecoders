function base64ToBytes(str) {
    return atob(str)
          .split("")
          .map(function (c) {
            return c.charCodeAt(0);
          });
}

function decode(payload, metadata) {
    if (payload.fPort == 2) {
        buf = base64ToBytes(payload.data)
        let res = {
            raw : payload.data,
            temp: (((buf[0] << 4) | (buf[2] >>    4)) - 800)/10,
            hum:  (((buf[1] << 4) | (buf[2] &   0xf)) - 250)/10,
            name:metadata.name,
            location: metadata.location,
            commentOnLocation: metadata.commentOnLocation
        };
    
        return res;
    }
}
    