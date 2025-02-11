IoT-device model
Milesight EM320-TH

Transmission type
LoRaWAN

Description
Decode data from the sensor. Data model is compatible with NGSI-LD.

Example output data
{
        "id": "refrigerator-sensor:1234-Milesight",
        "type": "refrigerator-sensor",
        "name": {
            "type": "Property",
            "value": "EM320-1234"
        },
        "temperature": {
            "type": "Property",
            "value": 5.6,
            "observedAt": "2024-07-02T12:26:21.58737Z"
        },
        "humidity": {
            "type": "Property",
            "value": 94,
            "observedAt": "2024-07-02T12:26:21.58737Z"
        },
        "battery": {
            "type": "Property",
            "value": 98,
            "observedAt": "2024-07-02T12:26:21.58737Z"
        }
    }
Source
https://github.com/Milesight-IoT/SensorDecoders/tree/main/EM_Series/EM300_Series/EM320-TH

Based on
Milesights own decoder. Adjusted for OS2Iot

Author
miniib (Github)

Contact
Alexander Ibsen, alei@aarhus.dk
