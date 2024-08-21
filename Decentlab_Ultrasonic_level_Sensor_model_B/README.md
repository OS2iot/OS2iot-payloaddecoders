# IoT-device model
Decentlab, Ultrasonic level Sensor model B
## Transmission type
LoRaWAN

## Description
Er lavet specifikt til dansk projektion DVR90 og til brug på OS2IoT, ved brug af metadata-rækker under.  Som minimum skal bruger kun måle koten på sensoren og angive denne i OS2IoT for at få vandspejlskoten i payload. Ønsker bruger alligevel at få den lokale vandstand (altså hvor mange meter over bund er vandspejl) kan man supplere med dette - kræver at bundkote måles on site. Payload dekoderen er en version, idet at scenariet er at bundkote ikke altid er fysisk muligt at måle eller relevant.
Se billede for eksempel på metadatarækker.


## Source
https://github.com/decentlab/decentlab-decoders
## Based on
Ingen kommentarer der

## Author
https://github.com/MortenGuldager / https://github.com/Damorck

### Contact
mogul@mogul.dk / danny.morck@gate21.dk
