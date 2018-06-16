# Resolution

AMF can be used to resolve parsed AML models. The generic resolution logic is available in the class `Resolver`.

The type of model to be resolved must be passed as an argument to the constructor. For any AML Dialect, `"AML 1.0"` must be passed as the argument.

## Example

{% codetabs name="Java", type="java" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/java/aml_org/examples/Resolving.java#resolving-example)
{% language name="JavaScript", type="js" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/js/Resolving.js#resolving-example)
{%- endcodetabs %}
