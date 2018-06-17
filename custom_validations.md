# Custom validations

This tutorial shows you how to extend the validations capabilities of AML defined metadata writing custom validations that can be enforced by AMF.

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

This tutorial assumes you have a working version of the AMF comand-line as described in the [quickstart](quickstart.md) tutorial.

## Standard validation

AML Dialects encode a mapping from the AST of a YAML/JSON document to a metadata graph and a set of constraints over the shape of that graph. These constraints are formally defined in the AML specification using a W3C recommendation known as [SHACL](https://www.w3.org/TR/shacl/).

AMF or any other SHACL compliant processor can validate the graph of data parsed from a AML document using the set of SHACL constraints parsed from the associated AML Dialect.

The AML Dialect `Playlist 1.0` located at `aml/examples/music/dialect/playlist.yaml` defines a metadata document to encode musical playlists:

*playlist.yaml*
``` yaml
#%Dialect 1.0

dialect: Playlist
version: 1.0

uses:
  music: ../vocabulary/music.yaml
  curation: ../vocabulary/music_curation.yaml

external:
  schema-org: http://schema.org/

documents:
  root:
    encodes: PlaylistNode
    declares:
      composers: ComposerNode
      records: RecordNode

nodeMappings:

  PlaylistNode:
    classTerm: curation.Playlist
    idTemplate: https://api.spotify.com/v1/{author}/playlists/{spotifyId}
    mapping:
      spotifyId:
        propertyTerm: curation.spotifyId
        range: string
        mandatory: true
      author:
        propertyTerm: curation.author
        range: string
        mandatory: true
      title:
        propertyTerm: schema-org.name
        range: string
        mandatory: true
      description:
        propertyTerm: schema-org.description
        range: string
      date:
        propertyTerm: schema-org.dateCreated
        range: date
      items:
        propertyTerm: curation.contents
        range: SelectionNode
        mapKey: curation.position

  SelectionNode:
    classTerm: curation.PlaylistSelection
    mapping:
      track:
        propertyTerm: curation.selectedTrack
        range: TrackNode
        mandatory: true
      artist:
        propertyTerm: music.performer
        range: ArtistNode
        mandatory: true
      composer:
        propertyTerm: music.composer
        range: ComposerNode
        mandatory: false
      album:
        propertyTerm: curation.trackFrom
        range: RecordNode
        mandatory: true
      score:
        propertyTerm: curation.score
        range: integer

  TrackNode:
    classTerm: music.Track
    idTemplate: https://api.spotify.com/v1/tracks/{spotifyId}
    mapping:
      spotifyId:
        propertyTerm: curation.spotifyId
        range: string
        mandatory: true
      title:
        propertyTerm: schema-org.name
        range: string
        mandatory: true
      duration:
        propertyTerm: music.duration
        range: integer

  ArtistNode:
    classTerm: music.MusicArtist
    idTemplate: https://api.spotify.com/v1/artists/{spotifyId}
    mapping:
      spotifyId:
        propertyTerm: curation.spotifyId
        range: string
        mandatory: true
      name:
        propertyTerm: schema-org.name
        range: string

  ComposerNode:
    classTerm: music.MusicArtist
    idTemplate: https://api.spotify.com/v1/artists/{spotifyId}
    mapping:
      spotifyId:
        propertyTerm: curation.spotifyId
        range: string
        mandatory: true
      name:
        propertyTerm: schema-org.name
        range: string

  RecordNode:
    classTerm: music.Record
    idTemplate: https://api.spotify.com/v1/albums/{spotifyId}
    mapping:
      spotifyId:
        propertyTerm: curation.spotifyId
        range: string
        mandatory: true
      title:
        propertyTerm: schema-org.name
        range: string
        mandatory: true
      genre:
        propertyTerm: music.genre
        range: string
        allowMultiple: true
```
The dialect provides the semantics of the metadata using two AML Vocabularies for music and music curation, located at `aml/music/vocabulary/music.yaml` and `aml/music/vocabulary/music_curation.yaml`.

Using this dialect, we can describe document instances encoding playlist information like the one located in `aml/music/playlist1.yaml`.

*playlist1.yaml*

``` yaml
#%Playlist 1.0

title: Favs
description: Some classical compositions
author: antoniogarrote
spotifyId: 5Qzm0PDPxbNrLvIu0OVinc

date: 2017-11-10

composers:
  Mozart:
    spotifyId: 4NJhFmfw43RLBLjQvxDuRS
    name: Wolfgang Amadeus Mozart
  Monteverdi:
    spotifyId: 5iAhVgz6P8Nylxijb0C65v
    name: Claudio Monteverdi

items:
  1:
    track:
      spotifyId: 1fdylFrFz7xU6GFEKroIzk
      title: Sederunt Principes
      duration: 705
    artist:
      spotifyId: 0L8W3JzyTX29RLKZgc3bqS
      name: The Hiliard Ensemble
    composer:
      spotifyId: 2xeXoF8arRZILlw5MKR2f2
      name: Pérotin
    album:
      spotifyId: 2wTfPn8Xt2QdoAcq2VLeay
      title: Pérotin and the Ars Antiqua
      genre:
        - classical
  2:
    track:
      spotifyId: 1mEXZtRMEnjqdPTmZfNzU2
      title: |
        String Quintet in C Major G 324, Op 30, No 6
        "La Musica notturna delle strade di Madrid"
      duration: 134
    artist:
      spotifyId: 1FUwvrAST5IPF5fxqMz7vS
      name: Cuarteto Casals
    composer:
      spotifyId: 2l4vGfFV7e46yO8lxfxR76
      name: Luigi Boccherini
    album:
      spotifyId: 4zs23dPn7XEJcxu375o6xp
      title: La Musica Notturna delle Strade di Madrid
    score: 5
  3:
    track:
      spotifyId: 1nqyxZH4AX0o2S9th6kRZL
      title: Tapiola, Op 112
      duration: 1088
    artist:
      spotifyId: spotify:artist:0AONkUEodQkpkdO5Wul6hE
      name: Okko Kamu
    composer:
      spotifyId: 7jzR5qj8vFnSu5JHaXgFEr
      name: Jean Sibelius
    album:
      spotifyId: 1wXP5c5E2YLHqPCAkxjyTD
      title: Sibelius, The Tempest, The Bard, Tapiola
  4:
    track:
      spotifyId: 0OLYyVMzILepGc7FKVaLWf
      title: "Sinfonia Concertante in E flat K364/320d: III Presto"
    artist:
      spotifyId: 6pzfUmBsQAKxOhy0NSi8zn
      name: Anne-Sophie Mutter
    composer: Mozart
    album:
      spotifyId: 2etuXogtzIC3rFVC5XOrhS
      title: Mozart
  5:
    track:
      spotifyId: 3MpnuPOrFwNB1iCGr4JkVn
      title: "Duo belli occhi fur l'armi, onde traffitta"
      duration: 247
    artist:
      spotifyId: 3f26hJvBDQnllvH0aP4OSb
      name: Concerto Italiano
    composer: Monteverdi
    album:
      spotifyId: 5vkcLFWodr1G7ka2GS1YBg
      title: Madrigali Amorosi
  6:
    track:
      spotifyId: 3kaz90sTbwAzWM5nzRLXkJ
      title: Zefiro torna e di soavi accenti, SV 251
      duration: 367
    artist:
      spotifyId: 0vo2ovp2PVDLDsTExmkFpo
      name: Lautten Compagney
    composer:
      $ref: "#/composers/Monteverdi"
    album:
      spotifyId: 02G4mzoARL6iMAfn794ppX
      title: La Dolce Vita
  7:
    track:
      spotifyId: 1QKykbp9b0iNzXCJH6SNWj
      title: Jazz Suite No 2.2 Lyriz Waltz
      duration: 157
    artist:
      spotifyId: 4Kjr1MPMUfuH3QKXtAljNy
      name: Riccardo Chailly
    composer:
      spotifyId: 6s1pCNXcbdtQJlsnM1hRIA
      name: Dimitri Shostakovich
    album:
      spotifyId: 2EqstXogPyAqKnQV2Imr04
      title: Shostakovich The Jazz Album
```

AMF can be used to validate any AML document instance using the `validate` command:

``` bash
examples [master] $ java -jar amf.jar validate -ds file://aml/music/dialect/playlist.yaml -in "AML 1.0" -mime-in application/yaml file://aml/music/playlist1.yaml
{
  "@type": "http://www.w3.org/ns/shacl#ValidationReport",
  "http://www.w3.org/ns/shacl#conforms": true
}
```

## Validation profiles

Additional validation constraints can be defined over the parsed graph of metadata using a validation profile.

Validation profiles are documents defined after a AML Dialect for describing [validation profiles](https://github.com/aml-org/amf/blob/master/vocabularies/dialects/validation.raml).

Validation profile documents can be used to define declaratively constraints and set the severity level of these validations.
Additionally, programmatic constraints defined in JavaScript can also be defined.

An example of a validation profile is located at `aml/music/custom_validations/boring.yaml`. These profile add validation errors for every single song with a duration longer than 180 seconds:

*boring.yaml*

``` bash
#%Validation Profile 1.0

profile: Boring Playlists

description: Detect boring songs

prefixes:
  music: http://mulesoft.com/vocabularies/music#

violation:
  - too-long1

validations:

  too-long1:
    message: Songs that are too long are boring
    targetClass: music.Track
    propertyConstraints:
      music.duration:
        maxInclusive: 180

  too-long2:
    message: Songs that are too long are boring
    targetClass: music.Track
    functionConstraint:
      code: |
        function(track) {
          var duration = (track['http://mulesoft.com/vocabularies/music#duration'] || [])
          return (duration[0] < 180)
        }
```

As an example, the constraint has been declared in two different ways. `too-long1` defines the constrain declaratively, using the syntax defined in the `Validation Profile` dialect.
The validation `too-long2` is the equivalent validation but using custom JavaScript code to check the constraint.
Both constraints target nodes in the parsed graph, using the semantics defined in the `Music` AML Vocabulary: the class `music.Track` and the property `music.duration`.

This validation profile can be used in the AMF command line tool using the `--custom-validation-profile` argument:

``` bash
examples [master] $ java -jar amf.jar validate -ds file://aml/music/dialect/playlist.yaml --custom-validation-profile file://aml/music/custom_validations/boring.yaml -in "AML 1.0" -mime-in application/yaml file://aml/music/playlist1.yaml
{
  "@type": "http://www.w3.org/ns/shacl#ValidationReport",
  "http://www.w3.org/ns/shacl#conforms": false,
  "http://www.w3.org/ns/shacl#result": [
    {
      "@type": "http://www.w3.org/ns/shacl#ValidationResult",
      "http://www.w3.org/ns/shacl#resultSeverity": {
        "@id": "http://www.w3.org/ns/shacl#Violation"
      },
      "http://www.w3.org/ns/shacl#focusNode": {
        "@id": "https://api.spotify.com/v1/tracks/1fdylFrFz7xU6GFEKroIzk"
      },
      "http://www.w3.org/ns/shacl#resultPath": {
        "@id": "http://mulesoft.com/vocabularies/music#duration"
      },
      "http://www.w3.org/ns/shacl#resultMessage": "Songs that are too long are boring",
      "http://www.w3.org/ns/shacl#sourceShape": {
        "@id": "http://a.ml/vocabularies/data#too-long1"
      },
      "http://a.ml/vocabularies/amf/parser#lexicalPosition": {
        "@type": "http://a.ml/vocabularies/amf/parser#Position",
        "http://a.ml/vocabularies/amf/parser#start": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 21,
          "http://a.ml/vocabularies/amf/parser#column": 0
        },
        "http://a.ml/vocabularies/amf/parser#end": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 24,
          "http://a.ml/vocabularies/amf/parser#column": 0
        }
      }
    },
    {
      "@type": "http://www.w3.org/ns/shacl#ValidationResult",
      "http://www.w3.org/ns/shacl#resultSeverity": {
        "@id": "http://www.w3.org/ns/shacl#Violation"
      },
      "http://www.w3.org/ns/shacl#focusNode": {
        "@id": "https://api.spotify.com/v1/tracks/1nqyxZH4AX0o2S9th6kRZL"
      },
      "http://www.w3.org/ns/shacl#resultPath": {
        "@id": "http://mulesoft.com/vocabularies/music#duration"
      },
      "http://www.w3.org/ns/shacl#resultMessage": "Songs that are too long are boring",
      "http://www.w3.org/ns/shacl#sourceShape": {
        "@id": "http://a.ml/vocabularies/data#too-long1"
      },
      "http://a.ml/vocabularies/amf/parser#lexicalPosition": {
        "@type": "http://a.ml/vocabularies/amf/parser#Position",
        "http://a.ml/vocabularies/amf/parser#start": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 54,
          "http://a.ml/vocabularies/amf/parser#column": 0
        },
        "http://a.ml/vocabularies/amf/parser#end": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 57,
          "http://a.ml/vocabularies/amf/parser#column": 0
        }
      }
    },
    {
      "@type": "http://www.w3.org/ns/shacl#ValidationResult",
      "http://www.w3.org/ns/shacl#resultSeverity": {
        "@id": "http://www.w3.org/ns/shacl#Violation"
      },
      "http://www.w3.org/ns/shacl#focusNode": {
        "@id": "https://api.spotify.com/v1/tracks/3MpnuPOrFwNB1iCGr4JkVn"
      },
      "http://www.w3.org/ns/shacl#resultPath": {
        "@id": "http://mulesoft.com/vocabularies/music#duration"
      },
      "http://www.w3.org/ns/shacl#resultMessage": "Songs that are too long are boring",
      "http://www.w3.org/ns/shacl#sourceShape": {
        "@id": "http://a.ml/vocabularies/data#too-long1"
      },
      "http://a.ml/vocabularies/amf/parser#lexicalPosition": {
        "@type": "http://a.ml/vocabularies/amf/parser#Position",
        "http://a.ml/vocabularies/amf/parser#start": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 79,
          "http://a.ml/vocabularies/amf/parser#column": 0
        },
        "http://a.ml/vocabularies/amf/parser#end": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 82,
          "http://a.ml/vocabularies/amf/parser#column": 0
        }
      }
    },
    {
      "@type": "http://www.w3.org/ns/shacl#ValidationResult",
      "http://www.w3.org/ns/shacl#resultSeverity": {
        "@id": "http://www.w3.org/ns/shacl#Violation"
      },
      "http://www.w3.org/ns/shacl#focusNode": {
        "@id": "https://api.spotify.com/v1/tracks/3kaz90sTbwAzWM5nzRLXkJ"
      },
      "http://www.w3.org/ns/shacl#resultPath": {
        "@id": "http://mulesoft.com/vocabularies/music#duration"
      },
      "http://www.w3.org/ns/shacl#resultMessage": "Songs that are too long are boring",
      "http://www.w3.org/ns/shacl#sourceShape": {
        "@id": "http://a.ml/vocabularies/data#too-long1"
      },
      "http://a.ml/vocabularies/amf/parser#lexicalPosition": {
        "@type": "http://a.ml/vocabularies/amf/parser#Position",
        "http://a.ml/vocabularies/amf/parser#start": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 91,
          "http://a.ml/vocabularies/amf/parser#column": 0
        },
        "http://a.ml/vocabularies/amf/parser#end": {
          "@type": "http://a.ml/vocabularies/amf/parser#Location",
          "http://a.ml/vocabularies/amf/parser#line": 94,
          "http://a.ml/vocabularies/amf/parser#column": 0
        }
      }
    }
  ]
}
```
