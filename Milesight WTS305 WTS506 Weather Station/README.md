# IoT-device model
Milesight WTS305 Weather Station
[Milesight WTS506 Weather Station](https://www.milesight.com/iot/product/lorawan-sensor/wts506)

## Transmission type
LoRaWAN

## Description
If the sensor parts are not connected, the data will look like this:

```js
{
  "battery": 10,
  "temperature": -0.1,
  "humidity": 127.5,
  "wind_direction": -0.1,
  "pressure": 6553.5,
  "wind_speed": 6553.5
}
```

## Source
https://github.com/Milesight-IoT/SensorDecoders/tree/main/WTS_series

## Based on
https://github.com/Milesight-IoT/SensorDecoders/tree/main/WTS_series

https://github.com/sj-doyle/NGSI-LD-Entities/blob/master/definitions/Weather-Observed.md



## Author
* Kristian Risager Larsen, Aarhus Kommune
* GitHub user: kristianrl 

### Contact
iotlab@aarhus.dk
