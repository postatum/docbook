# Using the W3C Stack

This tutorial shows you how to use the W3C stack of technologies for Linked Data to work with metadata defined using AML.

## Before you begin

Prerequisites:

- JVM: version 7 or higher
- SBT to build the AMF command-line
- Local installation of [Apache Jena](https://jena.apache.org/)

## Download the example

You can download the example from the AML project [examples repository](https://github.com/aml-org/examples) in Github.

```bash
git clone https://github.com/aml-org/examples.git
cd examples
```

## Build and install the AMF command-line tool

This tutorial assumes you have a working version of the AMF comand-line as described in the [quickstart](quickstart.md) tutorial.

## Install Apache Jena

[Apache Jena](https://jena.apache.org/) is a popular Java library to work with semantic and linked data. It can be used as a programming library but also contains a number of command line tools that we will use in this tutorial.

Installing Jena is beyond the scope of this tutorial. Please, consult the site of Jena for your platform. For example, in Mac OS systems, Jena can be installed using [Homebrew](https://brew.sh/)

``` bash
music [master] $ brew install jena
```

## Running a query over the graph of metadata

AML documents can be parsed using AMF into a graph of metadata.

This graph is encoded as a JSON-LD document. In this tutorial, we will use Jena to execute a query over this graph of information.

We will generate the resolved graph of information parsing one of the playlist documents in the music example using AMF:

``` bash
java -jar amf.jar parse -ds file://aml/music/dialect/playlist.yaml -in "AML 1.0" -mime-in application/yaml -ctx true --resolve true aml/music/playlist1.yaml > playlist1.json
```

Jena query command line, needs to get the input data as a set of assertions in the [Turtle](https://www.w3.org/TR/turtle/) format. We will use Jena `riot` command line to transform our JSON-LD output file into Turtle and store it in the `playlist.ttl` file:

``` bash
examples [master] $ riot --syntax=JSON-LD playlist1.json --output=TTL > playlist.ttl
```

Now we can run a query over the graph after loading it in Jena. The query is going to be expressed in the standard [SPARQL](https://www.w3.org/TR/sparql11-query/) graph query language.

We will list 10 songs ordered by song duration and retrieving also the name of the song:

``` bash
examples [master] $ sparql --data=playlist.ttl "

 PREFIX music: <http://mulesoft.com/vocabularies/music#>
 PREFIX schema: <http://schema.org/>
 select * {
    ?song music:duration ?duration ;
    schema:name ?name .
  }
  ORDER BY DESC(?duration)
  LIMIT 10
"
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| song                                                       | duration | name                                                                                            |
===========================================================================================================================================================================
| <https://api.spotify.com/v1/tracks/1nqyxZH4AX0o2S9th6kRZL> | 1088     | "Tapiola, Op 112"                                                                               |
| <https://api.spotify.com/v1/tracks/1fdylFrFz7xU6GFEKroIzk> | 705      | "Sederunt Principes"                                                                            |
| <https://api.spotify.com/v1/tracks/3kaz90sTbwAzWM5nzRLXkJ> | 367      | "Zefiro torna e di soavi accenti, SV 251"                                                       |
| <https://api.spotify.com/v1/tracks/3MpnuPOrFwNB1iCGr4JkVn> | 247      | "Duo belli occhi fur l'armi, onde traffitta"                                                    |
| <https://api.spotify.com/v1/tracks/1QKykbp9b0iNzXCJH6SNWj> | 157      | "Jazz Suite No 2.2 Lyriz Waltz"                                                                 |
| <https://api.spotify.com/v1/tracks/1mEXZtRMEnjqdPTmZfNzU2> | 134      | "String Quintet in C Major G 324, Op 30, No 6\n\"La Musica notturna delle strade di Madrid\"\n" |
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
```

## Making the graph grow

The graph parsed from AML metadata documents can be grown by just adding assertions parsed from the graph.

Let's add another playlist to our graph of metadata, parsing the `aml/music/playlist2.yaml` file:

``` bash
java -jar amf.jar parse -ds file://aml/music/dialect/playlist.yaml -in "AML 1.0" -mime-in application/yaml -ctx true --resolve true aml/music/playlist2.yaml > playlist2.json
```

Now we will use Jena to transform the JSON-LD document into additional assertions to our playlist.ttl graph:

``` bash
examples [master] $ riot --syntax=JSON-LD playlist2.json --output=TTL >> playlist.ttl
```

If we run the same query, we will find additional songs:

``` bash
examples [master] $ sparql --data=playlist.ttl "

  PREFIX music: <http://mulesoft.com/vocabularies/music#>
  PREFIX schema: <http://schema.org/>
  select * {
     ?song music:duration ?duration ;
     schema:name ?name .
   }
   ORDER BY DESC(?duration)
   LIMIT 10
 "
------------------------------------------------------------------------------------------------------------------------
| song                                                       | duration | name                                         |
========================================================================================================================
| <https://api.spotify.com/v1/tracks/1nqyxZH4AX0o2S9th6kRZL> | 1088     | "Tapiola, Op 112"                            |
| <https://api.spotify.com/v1/tracks/1fdylFrFz7xU6GFEKroIzk> | 705      | "Sederunt Principes"                         |
| <https://api.spotify.com/v1/tracks/3kaz90sTbwAzWM5nzRLXkJ> | 367      | "Zefiro torna e di soavi accenti, SV 251"    |
| <https://api.spotify.com/v1/tracks/7aZGReAQ235D3r9iiao5U5> | 348      | "Get Down"                                   |
| <https://api.spotify.com/v1/tracks/17wXLFsvZVX14x9SntU58w> | 321      | "Think (About it)"                           |
| <https://api.spotify.com/v1/tracks/7b8s4Z0abQQ4x4jpct4GjR> | 301      | "Cissy Strut"                                |
| <https://api.spotify.com/v1/tracks/4r9FfsM0ScLb5GM9gsJwI7> | 258      | "California Soul"                            |
| <https://api.spotify.com/v1/tracks/3MpnuPOrFwNB1iCGr4JkVn> | 247      | "Duo belli occhi fur l'armi, onde traffitta" |
| <https://api.spotify.com/v1/tracks/0d32aUh8S5sa4dYypUKWLh> | 158      | "Unwind Yourself"                            |
| <https://api.spotify.com/v1/tracks/1QKykbp9b0iNzXCJH6SNWj> | 157      | "Jazz Suite No 2.2 Lyriz Waltz"              |
------------------------------------------------------------------------------------------------------------------------
```

We can use use the relationship between playlists and songs in the graph to introduce that information in the query:

``` bash
examples [master] $ sparql --data=playlist.ttl "

  PREFIX music: <http://mulesoft.com/vocabularies/music#>
  PREFIX curation: <http://mulesoft.com/vocabularies/music_curation#>
  PREFIX schema: <http://schema.org/>

  select ?playlist ?name ?duration {
     ?playlist curation:contents/curation:selectedTrack ?song .
     ?song schema:name ?name ;
           music:duration ?duration .
   }
  ORDER BY desc(?duration)
"
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| playlist                                                                         | name                                                                                            | duration |
=================================================================================================================================================================================================
| <https://api.spotify.com/v1/antoniogarrote/playlists/5Qzm0PDPxbNrLvIu0OVinc>     | "Tapiola, Op 112"                                                                               | 1088     |
| <https://api.spotify.com/v1/antoniogarrote/playlists/5Qzm0PDPxbNrLvIu0OVinc>     | "Sederunt Principes"                                                                            | 705      |
| <https://api.spotify.com/v1/antoniogarrote/playlists/5Qzm0PDPxbNrLvIu0OVinc>     | "Zefiro torna e di soavi accenti, SV 251"                                                       | 367      |
| <https://api.spotify.com/v1/gattonerogattonero/playlists/5avfEocRttdTTESa8aTAGK> | "Get Down"                                                                                      | 348      |
| <https://api.spotify.com/v1/gattonerogattonero/playlists/5avfEocRttdTTESa8aTAGK> | "Think (About it)"                                                                              | 321      |
| <https://api.spotify.com/v1/gattonerogattonero/playlists/5avfEocRttdTTESa8aTAGK> | "Cissy Strut"                                                                                   | 301      |
| <https://api.spotify.com/v1/gattonerogattonero/playlists/5avfEocRttdTTESa8aTAGK> | "California Soul"                                                                               | 258      |
| <https://api.spotify.com/v1/antoniogarrote/playlists/5Qzm0PDPxbNrLvIu0OVinc>     | "Duo belli occhi fur l'armi, onde traffitta"                                                    | 247      |
| <https://api.spotify.com/v1/gattonerogattonero/playlists/5avfEocRttdTTESa8aTAGK> | "Unwind Yourself"                                                                               | 158      |
| <https://api.spotify.com/v1/antoniogarrote/playlists/5Qzm0PDPxbNrLvIu0OVinc>     | "Jazz Suite No 2.2 Lyriz Waltz"                                                                 | 157      |
| <https://api.spotify.com/v1/antoniogarrote/playlists/5Qzm0PDPxbNrLvIu0OVinc>     | "String Quintet in C Major G 324, Op 30, No 6\n\"La Musica notturna delle strade di Madrid\"\n" | 134      |
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
```
