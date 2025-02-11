# IoT-device model
Axioma W1

## Transmission type
LoRaWAN

## Description
Decode data from the sensor. Data model is compatible with NGSI-LD. Made for OS2IoT

## Example output data
````JSON
    {
        "id": "water-meter:111111-axioma",
        "type": "water-meter",
        "name": {
            "type": "Property",
            "value": "Vand, bassin - Skole"
        },
        "logVolume": {
            "type": "Property",
            "value": 139.55,
            "observedAt": "2025-02-10T18:00:03.000Z"
        },
        "state": {
            "type": "Property",
            "value": 0,
            "observedAt": "2025-02-10T18:00:03.000Z"
        },
        "location": {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [
                    12.123444,
                    53.134211
                ]
            }
        }
    }
```` 

## Source
No Source

## Based on
https://gist.github.com/Alkarex/4b5d1fef2ff84d483e2793ed009ef607

## Author
miniib (Github)

### Contact
Alexander Ibsen, alei@aarhus.dk
