# IoT-device model
Elsys EMS (including variants)

## Transmission type
LoRaWAN

## Description
Transfer data from the accelerometer sensor. Data model is compatible with NGSI-LD. 

## Example output data
````JSON
    {
        "id": "accelerometer-sensor:1234-Elsys",
        "type": "accelerometer-sensor",
        "name": {
            "type": "Property",
            "value": "EMS 1234"
        },
        "location": {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [
                    0,
                    0
                ]
            }
        },
        "fCnt": {
            "type": "Property",
            "value": 1,
            "observedAt": "2024-07-02T12:00:28.504075Z"
        },
        "accx": {
            "type": "Property",
            "value": -1,
            "observedAt": "2024-07-02T12:00:28.504075Z"
        },
        "accy": {
            "type": "Property",
            "value": -1,
            "observedAt": "2024-07-02T12:00:28.504075Z"
        },
        "accz": {
            "type": "Property",
            "value": 63,
            "observedAt": "2024-07-02T12:00:28.504075Z"
        },
        "accMotion": {
            "type": "Property",
            "value": 1,
            "observedAt": "2024-07-02T12:00:28.504075Z"
        }
    }
```` 

## Source
https://www.elsys.se/en/elsys-payload/

## Based on
Elsys Generic

## Author
kristianrl (Github)

### Contact
Kristian Risager Larsen, IoT Lab, Aarhus Kommune
lrkr@aarhus.dk
iotlab@aarhus.dk - https://iot.aarhus.dk 
