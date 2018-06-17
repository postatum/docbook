# Quickstart

These pages show you how to get up and running as quickly designing metadata documents with AML, including installing all the tools you'll need.

## Before you begin

Prerequisites:

- JVM: version 7 or higher
- SBT to build the AMF command-line

## Download the example

You can download the example from the AML project [examples repository](https://github.com/aml-org/examples) in Github.

```bash
git clone https://github.com/aml-org/examples.git
cd examples
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

documents:
  root:
    encodes: LocationNode
```

The dialect is very simple. It just defines a document with a couple of nodes one for the place and another one for the geographical location of the place. We are using the [Schema.org](http://schema.org) vocabulary to provide the semantics of the metadata.

You can validate the validity of this AML Dialect using AMF. From the top level directory of the examples repository:

``` bash
examples [master] $ java -jar amf.jar validate -in "AML 1.0" -mime-in application/yaml file://aml/quickstart/dialects/places.yaml
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
```

We can use AMF to parse and validate the example, passing as an argument the location of the dialect and dialect instance to be parsed:

``` bash
examples [master] $ java -jar amf.jar parse -ds file://aml/quickstart/dialects/places.yaml -in "AML 1.0" -mime-in application/yaml -ctx true file://aml/quickstart/golden_gate.yaml
```

The following JSON-LD document will be returned in the console:

``` json
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
        "@id": "file://aml/quickstart/dialects/places.yaml#"
      }
    ],
    "doc:encodes": [
      {
        "@id": "#/",
        "@type": [
          "schema-org:Place",
          "file://aml/quickstart/dialects/places.yaml#/declarations/LocationNode",
          "meta:DialectDomainElement",
          "doc:DomainElement"
        ],
        "schema-org:image": [
          {
            "@id": "https://en.wikipedia.org/wiki/Golden_Gate#/media/File:Golden_Gate_1.jpg"
          }
        ],
        "schema-org:name": [
          {
            "@value": "Golden Gate"
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


## Using vocabularies for custom semantics

AML allows users to define the semantics for metadata documents in AML Vocabulary files.

The file `aml/quickstart/geolocation.yaml` contains a vocabulary defining a few terms for a custom geolocation vocabulary:

*geolocation.yaml*
``` yaml
#%Vocabulary 1.0

vocabulary: Geolocation

base: http://myorg.com/vocabs/geo#

classTerms:

  Point:
    description: Single coordinate pair

  Line:
    description: Pair of points

  Polygon:
    description: contains at least 4 coordinate points

propertyTerms:

  position:
    description: Geolocation of an element
    range: Point

  latitude:
    description: Geographical latitude

  longitude:
    description: Geographical longitude
```

We could modify our dialect to generate a new version that use the AML Vocabulary for geolocation we have just reviewed:


*places_2.yaml*
``` yaml
#%Dialect 1.0

dialect: Places
version: 1.1

uses:
  geo: ../vocabularies/geolocation.yaml

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
        propertyTerm: geo.position
        range: CoordinatesNode

  CoordinatesNode:
    classTerm: geo.Point
    mapping:
      lat:
        propertyTerm: geo.latitude
        mandatory: true
        range: double
      long:
        propertyTerm: geo.longitude
        mandatory: true
        range: double

documents:
  root:
    encodes: LocationNode
```

Now we can parse documents that include geographical coordinates like:

*golden_gate_2.yaml*
``` yaml
#%Places 1.1

name: Golden Gate
image: https://en.wikipedia.org/wiki/Golden_Gate#/media/File:Golden_Gate_1.jpg
location:
  lat: 37.81
  long: 122.5
```

And the geographical information will appear in the graph using the semantic terms defined in our geolocation vocabulary:

``` bash
examples [master] $ java -jar amf.jar parse -ds file://aml/quickstart/dialects/places_2.yaml -in "AML 1.0" -mime-in application/yaml -ctx true file://aml/quickstart/golden_gate_2.yaml
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
        "@id": "file://aml/quickstart/dialects/places_2.yaml#"
      }
    ],
    "doc:encodes": [
      {
        "@id": "#/",
        "@type": [
          "schema-org:Place",
          "file://aml/quickstart/dialects/places_2.yaml#/declarations/LocationNode",
          "meta:DialectDomainElement",
          "doc:DomainElement"
        ],
        "schema-org:image": [
          {
            "@id": "https://en.wikipedia.org/wiki/Golden_Gate#/media/File:Golden_Gate_1.jpg"
          }
        ],
        "schema-org:name": [
          {
            "@value": "Golden Gate"
          }
        ],
        "http://myorg.com/vocabs/geo#position": [
          {
            "@id": "#/location",
            "@type": [
              "http://myorg.com/vocabs/geo#Point",
              "file://aml/quickstart/dialects/places_2.yaml#/declarations/CoordinatesNode",
              "meta:DialectDomainElement",
              "doc:DomainElement"
            ],
            "http://myorg.com/vocabs/geo#longitude": [
              {
                "@value": 122.5
              }
            ],
            "http://myorg.com/vocabs/geo#latitude": [
              {
                "@value": 37.81
              }
            ]
          }
        ]
      }
    ],
    "@context": {
      "@base": "file://aml/quickstart/golden_gate_2.yaml",
      "doc": "http://a.ml/vocabularies/document#",
      "meta": "http://a.ml/vocabularies/meta#",
      "schema-org": "http://schema.org/"
    }
  }
]
```

## Validating metadata documents

If we try to parse an invalid document the parser will fail and will return an error message and list of errors with syntactic information about the location of the error.
As an example you can try to parse the `aml/quickstart/piccadilly_circus_error.yaml` document in the examples. In this document geographical coordinates are provided as strings instead of double values:

*piccadilly_circus_error.yaml*
``` yaml
#%Places 1.1

name: Piccadilly Circus
image: https://commons.wikimedia.org/wiki/File:Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg#/media/File:Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg
location:
  lat: "51.30 N"
  long: "0.8 W"
```

Parsing the document throws a textual error in the console:

``` bash
examples [master] $ java -jar amf.jar parse -ds file://aml/quickstart/dialects/places_2.yaml -in "AML 1.0" -mime-in application/yaml -ctx true file://aml/quickstart/piccadilly_circus_error.yaml
Model: file://aml/quickstart/piccadilly_circus_error.yaml#
Profile: AMF
Conforms? false
Number of results: 2

Level: Violation

- Source: http://a.ml/vocabularies/amf/parser#inconsistent-property-range-value
  Message: Cannot find expected range for property http://myorg.com/vocabs/geo#latitude (lat). Found 'http://www.w3.org/2001/XMLSchema#string', expected 'http://www.w3.org/2001/XMLSchema#double'
  Level: Violation
  Target: file://aml/quickstart/piccadilly_circus_error.yaml#/location
  Property: http://myorg.com/vocabs/geo#latitude
  Position: Some(LexicalInformation([(6,7)-(6,16)]))

- Source: http://a.ml/vocabularies/amf/parser#inconsistent-property-range-value
  Message: Cannot find expected range for property http://myorg.com/vocabs/geo#longitude (long). Found 'http://www.w3.org/2001/XMLSchema#string', expected 'http://www.w3.org/2001/XMLSchema#double'
  Level: Violation
  Target: file://aml/quickstart/piccadilly_circus_error.yaml#/location
  Property: http://myorg.com/vocabs/geo#longitude
  Position: Some(LexicalInformation([(7,8)-(7,15)]))
```

In order to get the error report as a machine-friendly graph encoded using JSON-LD, the `validate` AMF command must be used instead.
