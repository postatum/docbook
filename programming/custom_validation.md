# Custom validations

AMF can be used to validate parsed AML models with custom validation profiles.
Before using the custom validation, a Validation Profile valid document instance must be registered using the `loadValidationProfile` function.

The name of the validation profile must be passed to the `validate` function for the custom validations to be applied

## Example

{% codetabs name="Java", type="java" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/java/aml_org/examples/CustomValidation.java#custom-validation-example)
{% language name="JavaScript", type="js" -%}
[example-raw](https://raw.githubusercontent.com/aml-org/examples/master/src/main/js/CustomValidation.js#custom-validation-example)
{%- endcodetabs %}
