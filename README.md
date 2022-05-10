# OS2iot Payload decoders

You can use this repository to find and share payload decoders for use in [OS2iot](https://os2.eu/produkt/os2iot).

## Getting Started

In each folder you can find a JavaScript file with the payload decoder and a readme file with more information.

## Naming convention
To make sure we keep this repository nice and tidy, please follow these guidelines.

### Folder name
Please name the folder with the name of the IoT-device model name followed by a number based on the other folders related to the same IoT-device. For example:
```
ELSYS_ERS-1
ELSYS_ERS-2
Sensit_3.0-1
Sensit_3.0-2
```
### File names
* Please name the JavaScript file with the same name as the folder.
* Please name the readme file "readme".

## Description of payload decoders
In order to help others understand and use your payload decoder, please fill out the requested information about it.
* **IoT-device model**: Add the name of the IoT-device model
* **Transmission type**: Indicate if this is for LoRaWAN, Sigfox etc.
* **Description**: Descripe the purpose of the payload decoder
* **Source**: If possible add a link to the source of the payload decoder - for example https://www.elsys.se/en/elsys-payload/
* **Based on**: If your payload decoder is based on an excisting payload decoder, please provide details about it.
* **Author**: Add the name and/or GitHub user name of the person who is responsible for the payload decoder.
    * **Contact**: If wanted add a mail address so others can get in contact about the payload decoder.
 
## How to use the payload decoders
For now you can just copy/paste the content of the JavaScript file into the field "Payload decoder funktion" when creating a new payload decoder in OS2iot.

## Contributing

See [OS2iot-docs](https://github.com/OS2iot/OS2IoT-docs/blob/master/CONTRIBUTING.md) for how to contribute.

## License

The OS2iot project is licensed under the MPL-2.0 License - see the [LICENSE file](https://github.com/OS2iot/OS2IoT-frontend/blob/master/LICENSE) for details. Please be aware of this, if you contribute payload decoders to this repository.


