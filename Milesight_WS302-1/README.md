# IoT-device model
Milesight WS302

## Transmission type
LoRaWAN

## Description
Decode data from the soundlevel sensor. Data model is compatible with NGSI-LD. 

## Example output data
````JSON
{
      "id": "soundlevel-sensor:1234-Milesight",
      "type": "soundlevel-sensor",
      "name": {
          "type": "Property",
          "value": "Milesight Sound Sensor"
      },
      "la": {
          "type": "Property",
          "value": 56.9,
          "observedAt": "2024-07-02T12:53:44.111111Z"
      },
      "laeq": {
          "type": "Property",
          "value": 46.4,
          "observedAt": "2024-07-02T12:53:44.111111Z"
      },
      "lamax": {
          "type": "Property",
          "value": 70.3,
          "observedAt": "2024-07-02T12:53:44.111111Z"
      },
      "battery": {
          "type": "Property",
          "value": 65,
          "observedAt": "2024-07-02T12:53:44.111111Z"
      }
}
```` 

## Source
https://github.com/Milesight-IoT/SensorDecoders/tree/main/WS_Series/WS302

## Based on
Milesights own decoder. Adjusted for OS2Iot

## Author
miniib (Github)

### Contact
Alexander Ibsen, alei@aarhus.dk
