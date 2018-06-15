# What is AML?

AML (Anything Modeling Language) is a declarative language to define metadata documents that can be parsed into graphs of information. These documents can be published and linked in the web or through any other type of API.

It can be used to describe common existing YAML/JSON metadata documents or to define the semantics and structure of completely new metadata formats.

AML metadata documents have the following advantages:

- Well defined formal semantics that can be reused across multiple types of metadata
- Explicit schema that can be used to automate parsing and validation
- Support for hyperlinks as a mechanism to connect and publish metadata documents
- Out of the box modularity, allowing to split the metadata graph into composable sets of documents
- Direct translation into a graph of data that can be stored, queried and published
- Support for W3C recommendations for the web and metadata


## Defining metadata documents

To define a new type of metadata document, a [AML Dialect](https://aml-org.github.io/aml-spec/dialects/) must be defined. Maps the structure of a YAML/JSON document to a graph of information and overlays the semantics for the nodes in the graph.
With that information an AML processor tool can parse and validate the instances of the metadata document and generate the output graph of information with the defined semantics.

This is an example of minimal AML Dialect defining a personal information metadata document:

*vcard.yaml*
``` yaml
#%Dialect 1.0

dialect: Person Card
version: 1.0

external:
  schema: http://schema.org/

nodeMappings:

  PersonNode:
    classTerm: schema.Person
    mapping:
      name:
        propertyTerm: schema.name
        range: string
      born:
        propertyTerm: schema.birthDate
        range: date

documents:
  root:
    encodes: PersonNode
```

With this information describing a very simple metadata document an AML processor can validate and parse metadata descriptions according to the defined "Person Card" format:

*chuck_berry.yaml*
``` yaml
#%Person Card 1.0

name: Chuck Berry
born: 1926-10-18
```

The outcome of parsing this example is [JSON-LD](https://json-ld.org/) document encoding a graph with the information about the people described in the "Person Card" documents:

``` json
{
  "@id": "#/",
  "@type": [
    "schema-org:Person",
    "file://vcard.yaml#/declarations/PersonNode",
    "meta:DialectDomainElement",
    "doc:DomainElement"
  ],
  "schema-org:birthDate": {
    "@type": "xsd:date",
    "@value": "1926-10-18"
  },
  "schema-org:name": "Chuck Berry"
}
```

This graph of information can be saved in JSON-LD compatible graph databases or it can be queried using a standard graph query language.

In this example the semantics of the information comes from the [Schema.org](https://schema.org/) project. Schema.org provides detailed definitions like [Person](https://schema.org/Person) that can be processed by machines and re-used across multiple metadata documents even if the syntactical details to describe a person varies.

AML dialects describing metadata documents can work with any of these existing vocabularies as long as the concepts in the vocabulary they can be identified by a URI.

AML also introduces the [AML Vocabulary](https://aml-org.github.io/aml-spec/vocabularies/) specification to describe new semantics that can be re-used across AML dialects.

For example, we could introduce our own "Personal Information" AML Vocabulary with our own definitions for classes of entities and properties:

*personal_info.yaml*
``` yaml
#%Vocabulary 1.0

vocabulary: Personal Information Management
base: http://myorg.com/vocabs/personal_info

classTerm:

  Person:
    description: Person being described

propertyTerms:

  birth_date:
    description: date of birth of a persong

  full_name:
    description: full name including surenames
```


AML Vocabularies can be used in AML Dialect definitions mixing them with external vocabularies.
