# Parsing

The AML parser can be found in the `Aml10Parser` class. All parsing methods are asynchronous, and either returns a promise/future as a result.

Before parsing a dialect instance, the dialect must be registered using the `AMF.registerDialect` function.

## Example

{% codetabs name="Java", type="java" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/java/aml_org/examples/Parsing.java#parsing-example)
{% language name="JavaScript", type="js" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/js/Parsing.js#parsing-example)
{%- endcodetabs %}
