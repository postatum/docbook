#Quickstart

These pages show you how to get up and running as quickly designing metadata documents with AML, including installing all the tools you'll need.

After completing this first tutorial, follow the different guides in this section to learn additional features available in AML.

## Before you begin

Prerequisites:

- JVM: version 7 or higher
- SBT to build the AMF command-line

## Download the example

You can download the example from the AML project [examples repository](https://github.com/aml-org/examples) in Github.

```bash
git clone https://github.com/aml-org/examples.git
cd examples/quickstart
```

## Build and install the AMF command-line tool

Download AMF from its github repository and build AMF command-line (you will need [Scala SBT](https://www.scala-sbt.org/)):

```bash
git clone https://github.com/aml-org/amf.git
cd amf
sbt buildCommandLine
```

This will leave a versioned fat jar (amf-X.Y.Z-SNAPSHOT.jar) in the top level repository of the project.
Copy this jar file to the top level of the examples repository:

``` bash
cp ./amf-X.Y.Z-SNAPSHOT.jar ../examples/amf.jar
```

## Defining an AML Dialect for a new type of metadata documents

In this example we will define a new type of metadata documents to exchange information about geographical locations.

In order to do this we will define a new type of AML Dialect describing the structure of the document, located in the examples repository in the file `aml/quickstart/places.yaml`:


*places.yaml*
```yaml
#%Dialect 1.0

dialect: Places
version: 1.0

external:
  schema: http://schema.org/

nodeMappings:

  LocationNode:
    classTerm: schema.Place
    mapping:
      name:
        propertyTerm: schema.name
        mandatory: true
        range: string
      image:
        propertyTerm: schema.image
        range: uri
      location:
        mandatory: true
        propertyTerm: schema.geo
        range: CoordinateNode

  CoordinateNode:
    classTerm: schema.GeoCoordinates
    mapping:
      lat:
        propertyTerm: schema.latitude
        mandatory: true
        range: double
      long:
        propertyTerm: schema.longitude
        mandatory: true
        range: double

documents:
  root:
    encodes: LocationNode
```

The dialect is very simple. It just defines a document with a couple of nodes one for the place and another one for the geographical location of the place. We are using the [Schema.org](http://schema.org) vocabulary to provide the semantics of the metadata.

You can validate the validity of this AML Dialect using AMF. From the top level directory of the examples repository:

``` bash
examples [master] $ java -jar amf.jar validate -in "AML 1.0" -mime-in application/yaml file://aml/quickstart/places.yaml
{
  "@type": "http://www.w3.org/ns/shacl#ValidationReport",
  "http://www.w3.org/ns/shacl#conforms": true
}
```

## Parsing metadata documents

Now that we have a valid AML Dialect, we can start using it to parse metadata documents with information about different places.

For example we can try the `golden_gate.yaml` document:

*golden_gate.yaml*
``` yaml
#%Places 1.0

name: Golden Gate
image: https://en.wikipedia.org/wiki/Golden_Gate#/media/File:Golden_Gate_1.jpg
location:
  lat: 37.81
  long: 122.5
```

We can use AMF to parse and validate the example, passing as an argument the location of the dialect and dialect instance to be parsed:

``` bash
examples [master] $ java -jar amf.jar parse -ds file://aml/quickstart/places.yaml -in "AML 1.0" -mime-in application/yaml -ctx true file://aml/quickstart/golden_gate.yaml
```

The following JSON-LD document will be returned in the console:

``` jsonld
[
  {
    "@id": "#",
    "@type": [
      "meta:DialectInstance",
      "doc:Document",
      "doc:Fragment",
      "doc:Module",
      "doc:Unit"
    ],
    "meta:definedBy": [
      {
        "@id": "file://aml/quickstart/places.yaml#"
      }
    ],
    "doc:encodes": [
      {
        "@id": "#/",
        "@type": [
          "schema-org:Place",
          "file://aml/quickstart/places.yaml#/declarations/LocationNode",
          "meta:DialectDomainElement",
          "doc:DomainElement"
        ],
        "schema-org:name": [
          {
            "@value": "Golden Gate"
          }
        ],
        "schema-org:image": [
          {
            "@id": "https://en.wikipedia.org/wiki/Golden_Gate#/media/File:Golden_Gate_1.jpg"
          }
        ],
        "schema-org:geo": [
          {
            "@id": "#/location",
            "@type": [
              "schema-org:GeoCoordinates",
              "file://aml/quickstart/places.yaml#/declarations/CoordinateNode",
              "meta:DialectDomainElement",
              "doc:DomainElement"
            ],
            "schema-org:latitude": [
              {
                "@value": 37.81
              }
            ],
            "schema-org:longitude": [
              {
                "@value": 122.5
              }
            ]
          }
        ]
      }
    ],
    "@context": {
      "@base": "file://aml/quickstart/golden_gate.yaml",
      "doc": "http://a.ml/vocabularies/document#",
      "meta": "http://a.ml/vocabularies/meta#",
      "schema-org": "http://schema.org/"
    }
  }
]
```

[JSON-LD](https://json-ld.org/) is a [W3C standard](https://www.w3.org/TR/json-ld/) to store graphs of information with support for hyperlinks. JSON-LD is the native format for AMF parsed graph models.


## Validating metadata documents

If we try to parse an invalid document the parser will fail and will return an error message and list of errors with syntactic information about the location of the error.
As an example you can try to parse the `aml/quickstart/piccadilly_circus_error.yaml` document in the examples. In this document geographical coordinates are provided as strings instead of double values:

*piccadilly_circus_error.yaml*
``` yaml
#%Places 1.0

name: Piccadilly Circus
image: https://commons.wikimedia.org/wiki/File:Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg#/media/File:Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg
location:
  lat: "51.30 N"
  long: "0.8 W"
```

Parsing the document throws a textual error in the console:

``` bash
examples [master] $ java -jar amf.jar parse -ds file://aml/quickstart/places.yaml -in "AML 1.0" -mime-in application/yaml -ctx true file://aml/quickstart/piccadilly_circus_error.yaml
Model: file://aml/quickstart/piccadilly_circus_error.yaml#
Profile: AMF
Conforms? false
Number of results: 2

Level: Violation

- Source: http://a.ml/vocabularies/amf/parser#inconsistent-property-range-value
  Message: Cannot find expected range for property http://schema.org/latitude (lat). Found 'http://www.w3.org/2001/XMLSchema#string', expected 'http://www.w3.org/2001/XMLSchema#double'
  Level: Violation
  Target: file://aml/quickstart/piccadilly_circus_error.yaml#/location
  Property: http://schema.org/latitude
  Position: Some(LexicalInformation([(6,7)-(6,14)]))

- Source: http://a.ml/vocabularies/amf/parser#inconsistent-property-range-value
  Message: Cannot find expected range for property http://schema.org/longitude (long). Found 'http://www.w3.org/2001/XMLSchema#string', expected 'http://www.w3.org/2001/XMLSchema#double'
  Level: Violation
  Target: file://aml/quickstart/piccadilly_circus_error.yaml#/location
  Property: http://schema.org/longitude
  Position: Some(LexicalInformation([(7,8)-(7,13)]))
```

In order to get the error report as a machine-friendly graph encoded using JSON-LD, the `validate` AMF command must be used instead.
