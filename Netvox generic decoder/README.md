# IoT-device model
Netvox' range of IoT devices

## Transmission type
LoRaWAN

## Description
Decoding the bytes from the Netvox devices to meaningful data values. Tested using a Netvox R311WA seat occupancy sensor.

## Example output
```json
{
    "id": "urn:ngsi-ld:sensor:netvox-123456",
    "type": "R311WA",
    "status1": {
        "type": "Property",
        "value": 0,
        "observedAt": "2025-04-27T11:39:43.009Z"
    },
    "status2": {
        "type": "Property",
        "value": 0,
        "observedAt": "2025-04-27T11:39:43.009Z"
    },
    "location": {
        "type": "GeoProperty",
        "value": {
            "type": "Point",
            "coordinates": [
                56.1,
                10.2
            ]
        }
    }
}
```


## Source
-

## Based on
https://github.com/AlliotTechnologies/Alliot-decoders/blob/main/Netvox/decoder.js

## Author
Kristian Risager Larsen, IoT Lab, Aarhus Kommune

### Contact
Github name: kristianrl
Email: iotlab@aarhus.dk