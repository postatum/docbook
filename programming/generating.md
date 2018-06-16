# Generating

The AML renderer can be found in the `Aml10Renderer` class. All generation methods are asynchronous, and either returns a promise/future as a result.

Using the renderer the parsed generated JSON-LD document parsed by AMF for a AML dialect instance can be parsed and the original AML document regenerated.

Before parsing a dialect instance, the dialect must be registered using the `AMF.registerDialect` function.

## Example

{% codetabs name="Java", type="java" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/java/aml_org/examples/Generating.java#generation-example)
{% language name="JavaScript", type="js" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/js/Generating.js#generation-example)
{%- endcodetabs %}
