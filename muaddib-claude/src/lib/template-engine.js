/**
 * Template Engine Module
 *
 * Core template rendering and validation for Muad'Dib CLI.
 * Handles input validation, template processing, and output verification.
 *
 * @module template-engine
 */

import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';

/**
 * Default maximum input length in characters
 * @type {number}
 */
const DEFAULT_MAX_INPUT_LENGTH = 100000;

/**
 * Validate that input data doesn't exceed the maximum allowed length.
 * Calculates the size of the serialized input data and throws an error
 * if it exceeds the configured limit.
 *
 * @param {*} data - Input data to validate (any JSON-serializable type)
 * @param {Object} options - Validation options
 * @param {number} [options.maxLength=100000] - Maximum allowed length in characters
 * @throws {Error} If input exceeds maxLength with descriptive message
 * @returns {boolean} True if validation passes
 *
 * @example
 * // Validate context before template rendering
 * try {
 *   validateInputLength(context, { maxLength: 50000 });
 * } catch (err) {
 *   console.error('Context too large:', err.message);
 * }
 */
export function validateInputLength(data, options = {}) {
  const { maxLength = DEFAULT_MAX_INPUT_LENGTH } = options;

  // Validate maxLength parameter
  if (typeof maxLength !== 'number' || maxLength < 1) {
    throw new Error(`maxLength must be a positive number, got: ${maxLength}`);
  }

  // Handle null/undefined as valid (empty) input
  if (data === null || data === undefined) {
    return true;
  }

  let serialized;
  try {
    serialized = typeof data === 'string' ? data : JSON.stringify(data);
  } catch (err) {
    throw new Error(`Input data is not serializable: ${err.message}`);
  }

  const inputLength = serialized.length;

  if (inputLength > maxLength) {
    // MED-5: Don't include data preview in error message to avoid sensitive data exposure
    throw new Error(
      `Input data exceeds maximum allowed length. ` +
      `Got ${inputLength.toLocaleString()} characters, maximum is ${maxLength.toLocaleString()}.`
    );
  }

  return true;
}

/**
 * Get the default maximum input length
 * @returns {number} The default maximum input length in characters
 */
export function getDefaultMaxInputLength() {
  return DEFAULT_MAX_INPUT_LENGTH;
}

/**
 * Validate that a string is valid JSON
 *
 * @param {string} content - String content to validate as JSON
 * @returns {{valid: boolean, error?: string, parsed?: object}} Validation result
 *
 * @example
 * const result = validateJson('{"key": "value"}');
 * if (!result.valid) {
 *   console.error('Invalid JSON:', result.error);
 * }
 */
export function validateJson(content) {
  if (typeof content !== 'string') {
    return {
      valid: false,
      error: 'Content must be a string'
    };
  }

  try {
    const parsed = JSON.parse(content);
    return {
      valid: true,
      parsed
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message
    };
  }
}

/**
 * Render a Handlebars template with context data.
 * Validates input length before rendering.
 *
 * @param {string} templateContent - Handlebars template string
 * @param {Object} context - Data context for template rendering
 * @param {Object} options - Rendering options
 * @param {number} [options.maxInputLength=100000] - Maximum input length
 * @param {boolean} [options.validateInput=true] - Whether to validate input length
 * @returns {string} Rendered template output
 * @throws {Error} If input validation fails or template rendering fails
 *
 * @example
 * const output = renderTemplate('Hello {{name}}!', { name: 'World' });
 * console.log(output); // 'Hello World!'
 */
export function renderTemplate(templateContent, context = {}, options = {}) {
  const {
    maxInputLength = DEFAULT_MAX_INPUT_LENGTH,
    validateInput = true
  } = options;

  // Validate template content
  if (typeof templateContent !== 'string') {
    throw new Error('Template content must be a string');
  }

  // Validate input length if enabled
  if (validateInput) {
    validateInputLength(context, { maxLength: maxInputLength });
  }

  try {
    const template = Handlebars.compile(templateContent);
    return template(context);
  } catch (err) {
    throw new Error(`Template rendering failed: ${err.message}`);
  }
}

/**
 * Load and render a template file with context data.
 *
 * @param {string} templatePath - Path to the template file
 * @param {Object} context - Data context for template rendering
 * @param {Object} options - Rendering options
 * @param {number} [options.maxInputLength=100000] - Maximum input length
 * @param {boolean} [options.validateInput=true] - Whether to validate input length
 * @returns {Promise<string>} Rendered template output
 * @throws {Error} If file read fails, input validation fails, or template rendering fails
 *
 * @example
 * const output = await renderTemplateFile('./templates/config.hbs', { name: 'project' });
 */
export async function renderTemplateFile(templatePath, context = {}, options = {}) {
  // Read template file
  let templateContent;
  try {
    templateContent = await fs.readFile(templatePath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read template file: ${templatePath} (${err.message})`);
  }

  return renderTemplate(templateContent, context, options);
}

/**
 * Register a Handlebars partial for use in templates.
 *
 * @param {string} name - Name of the partial
 * @param {string} content - Partial template content
 *
 * @example
 * registerPartial('header', '<header>{{title}}</header>');
 */
export function registerPartial(name, content) {
  Handlebars.registerPartial(name, content);
}

/**
 * Register a Handlebars helper function.
 *
 * @param {string} name - Name of the helper
 * @param {Function} fn - Helper function
 *
 * @example
 * registerHelper('uppercase', (str) => str.toUpperCase());
 */
export function registerHelper(name, fn) {
  Handlebars.registerHelper(name, fn);
}

/**
 * Render a JSON template and validate the output.
 * Combines template rendering with JSON validation.
 *
 * @param {string} templateContent - Handlebars template string
 * @param {Object} context - Data context for template rendering
 * @param {Object} options - Rendering options
 * @param {number} [options.maxInputLength=100000] - Maximum input length
 * @param {Object} [options.fallback=null] - Fallback object if JSON validation fails
 * @returns {{output: string, parsed: Object|null, usedFallback: boolean, error?: string}}
 *
 * @example
 * const result = renderJsonTemplate('{"name": "{{name}}"}', { name: 'test' });
 * if (result.usedFallback) {
 *   console.warn('Used fallback config due to:', result.error);
 * }
 */
export function renderJsonTemplate(templateContent, context = {}, options = {}) {
  const {
    maxInputLength = DEFAULT_MAX_INPUT_LENGTH,
    fallback = null
  } = options;

  let output;
  try {
    output = renderTemplate(templateContent, context, { maxInputLength });
  } catch (err) {
    if (fallback !== null) {
      return {
        output: JSON.stringify(fallback, null, 2),
        parsed: fallback,
        usedFallback: true,
        error: err.message
      };
    }
    throw err;
  }

  const validation = validateJson(output);

  if (!validation.valid) {
    if (fallback !== null) {
      return {
        output: JSON.stringify(fallback, null, 2),
        parsed: fallback,
        usedFallback: true,
        error: validation.error
      };
    }
    throw new Error(`Rendered template is not valid JSON: ${validation.error}`);
  }

  return {
    output,
    parsed: validation.parsed,
    usedFallback: false
  };
}

export default {
  validateInputLength,
  getDefaultMaxInputLength,
  validateJson,
  renderTemplate,
  renderTemplateFile,
  registerPartial,
  registerHelper,
  renderJsonTemplate
};
