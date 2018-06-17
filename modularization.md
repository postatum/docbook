# Modularization

This tutorial shows you how to define and edit reusable, modular metadata documents that can be linked together as a graph of metadata using AML.

## Before you begin

Prerequisites:

- JVM: version 7 or higher
- SBT to build the AMF command-line


## Download the example

You can download the example from the AML project [examples repository](https://github.com/aml-org/examples) in Github.

```bash
git clone https://github.com/aml-org/examples.git
cd examples/modular
```

## Build and install the AMF command-line tool

This tutorial assumes you have a working version of the AMF comand-line as described in the [quickstart](quickstart.md) tutorial.


## Initial stand-alone AML dialect

In this tutorial, you will split a stand-alone, monolithic AML metadata document into a set of modular documents that can be edited, published and linked independently.

We will start with the initial version of the dialect, found in `aml/modular/dialect/database_configuration.yaml`, a very simple AML Dialect describing configuration metadata file with information to connect to different databases.

*database_configuration.yaml*
``` yaml
#%Dialect 1.0

dialect: DB Config
version: 1.0

uses:
  infra: ../vocabulary/infra.yaml
  cfg: ../vocabulary/config.yaml

external:
  schema-org: http://schema.org/
  dbconfig: http://mycompany.com/dialects/dbconfig#


nodeMappings:

  DatabaseConfigNode:
    classTerm: cfg.ConfigurationItem
    mapping:
      server:
        propertyTerm: cfg.configured
        range: DatabaseServerNode
      dbs:
        propertyTerm: dbconfig.dbs
        mapKey: cfg.environment
        range: DatabaseNode

  DatabaseNode:
    classTerm: infra.Database
    mapping:
      environment:
        propertyTerm: cfg.environment
        range: string
        enum:
          - development
          - production
          - testing
          - qa
      name:
        propertyTerm: schema-org.name
        range: string
        mandatory: true
      username:
        propertyTerm: cfg.username
        range: string

  DatabaseServerNode:
    classTerm: infra.DatabaseServer
    mapping:
      host:
        mandatory: true
        propertyTerm: infra.endpoint
        range: string
      port:
        mandatory: true
        propertyTerm: infra.port
        range: integer
      driver:
        mandatory: true
        propertyTerm: infra.driver
        range: string

documents:
  root:
    encodes: DatabaseConfigNode
```

This AML dialect uses two vocabularies, one to describe infrastructure and the other to describe configurations, located in `aml/modular/vocabulary/config.yaml` and `aml/modular/vocabulary/infra.yaml`.

Since this AML dialect defines a single, monolithic type of document, the `documents` section of the dialect includes only a `root` entry encoding the root node of the document.

Using this dialect definition, we can edit standalone configuration documents, like the configuration document located at `aml/modular/db1.yaml`:

*db1.yaml*
``` yaml
#%DBConfig 1.0

server:
  host: localhost
  port: 5001
  driver: mysql

dbs:
  dev:
    name: accounts_dev
    username: jsmith
  test:
    name: accounts_test
    username: jsmith
```


## Defining reusable fragments

In many situations, entities defined in a document can be reused in multiple documents. AML allows you to define reusable entities in their own independent metadata documents, known as fragments, that can be linked from all these documents. The graph of information parsed from all these documents will point to the same node URI in the generated metadata graph.

To declare a fragment, the `documents` section of the AML dialect must include a `fragments` entry with a mapping from the name of the fragment to the node encoded in the fragment.

Version 1.1 of the DB Config dialect introduces a fragment to declare databases servers. It can be found in the `aml/modular/dialect/database_configuration_2.yaml`.

*database_configuration_2.yaml*

``` yaml
#%Dialect 1.0

dialect: DB Config
version: 1.1

...

documents:
  root:
    encodes: DatabaseConfigNode
  fragments:
    encodes:
      DatabaseServer: DatabaseServerNode
```

In this case, we define a fragment named `DatabaseServer` encoding a `DatabaseServerNode`.

With this dialect definition, we can create fragments declaring metadata about database servers with the semantics of the `Infrastructure` vocabulary, for example in the `aml/modular/server.yaml`:

*server.yaml*

``` yaml
#%DatabaseServer / DB Config 1.1

host: localhost
port: 5001
driver: mysql
```

These fragments can be linked from the configuration document, using the `!include` linking directive:

*db2.yaml*
``` yaml
#%DB Config 1.1

server: !include server.yaml

dbs:
  dev:
    name: accounts_dev
    username: jsmith
  test:
    name: accounts_test
    username: jsmith
```

## Libraries of reusable entities

Another common use case is to define related collections of metadata entities that can be reused across different documents.

AML supports these modular collections through the definition of metadata libraries.
Libraries are defined in the `documents` section using the `libraries` property. This node keeps a map of declarations for the library, including name of the declaration and type of declared nodes.

The version 1.2 of the `DB Config` dialect, located at `aml/modular/dialect/database_configuration_3.yaml` includes the declaration of libraries of servers:

*database_configuration_3.yaml*
``` yaml
#%Dialect 1.0

dialect: DB Config
version: 1.2

...

documents:
  root:
    encodes: DatabaseConfigNode
  fragments:
    encodes:
      DatabaseServer: DatabaseServerNode
  library:
    declares:
      servers: DatabaseServerNode
```
After these dialect definitions, metadata documents containing libraries of servers can be defined, like the one located at `aml/modular/servers_library.yaml`:

*servers_library.yaml*

``` yaml
#%Library / DB Config 1.2

servers:

  local_mysql:
    host: localhost
    port: 5001
    driver: mysql

  local_postgres:
    host: localhost
    port: 5432
    driver: postgres

  production_mysql:
    host: db.myapp.com
    port: 9501
    driver: mysql
```

These libraries can be referenced from configuration document using library reference aliases, as in `aml/modular/db3.yaml`:

*db3.yaml*

``` yaml
#%DB Config 1.2

uses:
  servers: servers_library.yaml

server: servers.local_mysql

dbs:
  dev:
    name: accounts_dev
    username: jsmith
  test:
    name: accounts_test
    username: jsmith
```

Instead of library reference aliases, `$ref` linking directives can also be used, as shown in this example JSON representation of the same metadata:

*db3.json*

``` json
{
    "$dialect": "DB Config 1.2",
    "server": { "$ref": "servers_library.yaml#/servers/local_mysql"},
    "dbs": {
        "dev": {
            "name": "accounts_dev",
            "username": "jsmith"
        },
        "test": {
            "name": "accounts_test",
            "username": "jsmith"
        }
    }
}
```

## Parsing and resolving with AMF

AMF can be used to parse modular metadata documents containing links.
By default, AMF will produce a JSON-LD document encoding a graph that explicitly links documents using the `doc:link-target` property. Linked documents will be eagerly followed and added to the `doc:references` list.

Different types of documents in the graph will be marked with different semantics.

- Fragments will be marked with the `doc:Fragment` class.
- Libraries will be marked with the `doc:Module` class.

For example, to parse version 1.1 of the database document using a fragment, AMF can be used:

``` bash
examples [master] $ java -jar amf.jar parse -ds file://aml/modular/dialect/database_configuration_2.yaml -in "AML 1.0" -mime-in application/yaml -ctx true file://aml/modular/db2.yaml
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
        "@id": "file://aml/modular/dialect/database_configuration_2.yaml#"
      }
    ],
    "doc:encodes": [
      {
        "@id": "#/",
        "@type": [
          "http://mycompany.com/vocabularies/config#ConfigurationItem",
          "file://aml/modular/dialect/database_configuration_2.yaml#/declarations/DatabaseConfigNode",
          "meta:DialectDomainElement",
          "doc:DomainElement"
        ],
        "http://mycompany.com/vocabularies/config#configured": [
          {
            "@id": "#/server",
            "@type": [
              "http://mycompany.com/vocabularies/infra#DatabaseServer",
              "file://aml/modular/dialect/database_configuration_2.yaml#/declarations/DatabaseServerNode",
              "meta:DialectDomainElement",
              "doc:DomainElement"
            ],
            "doc:link-target": [
              {
                "@id": "file://aml/modular/server.yaml#/"
              }
            ],
            "doc:link-label": [
              {
                "@value": "server.yaml"
              }
            ]
          }
        ],
        "http://mycompany.com/dialects/dbconfig#dbs": [
         ...
        ]
      }
    ],
    "doc:references": [
      {
        "@id": "file://aml/modular/server.yaml#",
        "@type": [
          "meta:DialectInstanceFragment",
          "doc:Fragment",
          "doc:Unit"
        ],
        "meta:definedBy": [
          {
            "@id": "file://aml/modular/dialect/database_configuration_2.yaml#"
          }
        ],
        "doc:encodes": [
          {
            "@id": "file://aml/modular/server.yaml#/",
            "@type": [
              "http://mycompany.com/vocabularies/infra#DatabaseServer",
              "file://aml/modular/dialect/database_configuration_2.yaml#/declarations/DatabaseServerNode",
              "meta:DialectDomainElement",
              "doc:DomainElement"
            ],
            "http://mycompany.com/vocabularies/infra#driver": [
              {
                "@value": "mysql"
              }
            ],
            "http://mycompany.com/vocabularies/infra#endpoint": [
              {
                "@value": "localhost"
              }
            ],
            "http://mycompany.com/vocabularies/infra#port": [
              {
                "@value": 5001
              }
            ]
          }
        ]
      }
    ],
    "@context": {
      "@base": "file://aml/modular/db2.yaml",
      "doc": "http://a.ml/vocabularies/document#",
      "meta": "http://a.ml/vocabularies/meta#",
      "schema-org": "http://schema.org/"
    }
  }
]
```
Sometimes, we want to work with the final graph of metadata in which all explicit links have been replaced by standard JSON-LD links. In the process, all the `doc:references` relationships disappear and a single unit is generated. This process is known as `resolution` in AMF.

You can trigger the resolution process in AMF programmatically or by passing the `--resolve true` argument to the command line tool:

``` bash
examples [master] $ java -jar amf.jar parse -ds file://aml/modular/dialect/database_configuration_2.yaml -in "AML 1.0" -mime-in application/yaml -ctx true --resolve true file://aml/modular/db2.yaml
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
        "@id": "file://aml/modular/dialect/database_configuration_2.yaml#"
      }
    ],
    "doc:encodes": [
      {
        "@id": "#/",
        "@type": [
          "http://mycompany.com/vocabularies/config#ConfigurationItem",
          "file://aml/modular/dialect/database_configuration_2.yaml#/declarations/DatabaseConfigNode",
          "meta:DialectDomainElement",
          "doc:DomainElement"
        ],
        "http://mycompany.com/vocabularies/config#configured": [
          {
            "@id": "file://aml/modular/server.yaml#/",
            "@type": [
              "http://mycompany.com/vocabularies/infra#DatabaseServer",
              "file://aml/modular/dialect/database_configuration_2.yaml#/declarations/DatabaseServerNode",
              "meta:DialectDomainElement",
              "doc:DomainElement"
            ],
            "http://mycompany.com/vocabularies/infra#driver": [
              {
                "@value": "mysql"
              }
            ],
            "http://mycompany.com/vocabularies/infra#endpoint": [
              {
                "@value": "localhost"
              }
            ],
            "http://mycompany.com/vocabularies/infra#port": [
              {
                "@value": 5001
              }
            ]
          }
        ],
        "http://mycompany.com/dialects/dbconfig#dbs": [
          {
            "@id": "#/dbs/dev",
            "@type": [
              "http://mycompany.com/vocabularies/infra#Database",
              "file://aml/modular/dialect/database_configuration_2.yaml#/declarations/DatabaseNode",
              "meta:DialectDomainElement",
              "doc:DomainElement"
            ],
            "schema-org:name": [
              {
                "@value": "accounts_dev"
              }
            ],
            "http://mycompany.com/vocabularies/config#username": [
              {
                "@value": "jsmith"
              }
            ],
            "http://mycompany.com/vocabularies/config#environment": [
              {
                "@value": "dev"
              }
            ]
          },
          {
            "@id": "#/dbs/test",
            "@type": [
              "http://mycompany.com/vocabularies/infra#Database",
              "file://aml/modular/dialect/database_configuration_2.yaml#/declarations/DatabaseNode",
              "meta:DialectDomainElement",
              "doc:DomainElement"
            ],
            "schema-org:name": [
              {
                "@value": "accounts_test"
              }
            ],
            "http://mycompany.com/vocabularies/config#username": [
              {
                "@value": "jsmith"
              }
            ],
            "http://mycompany.com/vocabularies/config#environment": [
              {
                "@value": "test"
              }
            ]
          }
        ]
      }
    ],
    "@context": {
      "@base": "file://aml/modular/db2.yaml",
      "doc": "http://a.ml/vocabularies/document#",
      "meta": "http://a.ml/vocabularies/meta#",
      "schema-org": "http://schema.org/"
    }
  }
]
```
