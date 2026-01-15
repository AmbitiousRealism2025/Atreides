/**
 * Template Engine for Muad'Dib CLI
 *
 * Handlebars-based template rendering with custom helpers and partials.
 */

import Handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';
import { readFile, listFiles, exists } from './file-manager.js';
import { PACKAGE_TEMPLATES_DIR, PACKAGE_ROOT } from '../utils/paths.js';
import { debug } from '../utils/logger.js';

// Read package version at module load
let packageVersion = '1.0.0';
try {
  const packageJson = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'));
  packageVersion = packageJson.version || '1.0.0';
} catch {
  // Fallback to default version if package.json can't be read
}

// Create a separate Handlebars instance to avoid polluting global
const hbs = Handlebars.create();

// Track registered partials
const registeredPartials = new Set();

/**
 * Register custom Handlebars helpers
 */
function registerHelpers() {
  // Conditional helper: {{#if-eq a b}}
  hbs.registerHelper('if-eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  // Not equal: {{#if-ne a b}}
  hbs.registerHelper('if-ne', function (a, b, options) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });

  // Greater than: {{#if-gt a b}}
  hbs.registerHelper('if-gt', function (a, b, options) {
    return a > b ? options.fn(this) : options.inverse(this);
  });

  // Contains: {{#if-contains array value}}
  hbs.registerHelper('if-contains', function (array, value, options) {
    if (!Array.isArray(array)) return options.inverse(this);
    return array.includes(value) ? options.fn(this) : options.inverse(this);
  });

  // Current date: {{current-date}}
  hbs.registerHelper('current-date', function () {
    return new Date().toISOString().split('T')[0];
  });

  // Current timestamp: {{current-timestamp}}
  hbs.registerHelper('current-timestamp', function () {
    return new Date().toISOString();
  });

  // JSON stringify: {{json-stringify obj}}
  hbs.registerHelper('json-stringify', function (obj) {
    return JSON.stringify(obj, null, 2);
  });

  // Uppercase: {{uppercase str}}
  hbs.registerHelper('uppercase', function (str) {
    return str ? str.toUpperCase() : '';
  });

  // Lowercase: {{lowercase str}}
  hbs.registerHelper('lowercase', function (str) {
    return str ? str.toLowerCase() : '';
  });

  // Capitalize: {{capitalize str}}
  hbs.registerHelper('capitalize', function (str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Kebab case: {{kebab-case str}}
  hbs.registerHelper('kebab-case', function (str) {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  });

  // Each with index: {{#each-index array}}{{@index}} {{this}}{{/each-index}}
  hbs.registerHelper('each-index', function (array, options) {
    if (!Array.isArray(array)) return '';
    return array.map((item, index) =>
      options.fn(item, { data: { index, first: index === 0, last: index === array.length - 1 } })
    ).join('');
  });

  // Repeat: {{#repeat n}}content{{/repeat}}
  hbs.registerHelper('repeat', function (n, options) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += options.fn(this);
    }
    return result;
  });

  // Default value: {{default value fallback}}
  hbs.registerHelper('default', function (value, defaultValue) {
    return value !== undefined && value !== null && value !== '' ? value : defaultValue;
  });

  // Join array: {{join array separator}}
  hbs.registerHelper('join', function (array, separator) {
    if (!Array.isArray(array)) return '';
    return array.join(separator || ', ');
  });

  // Indent: {{indent content spaces}}
  hbs.registerHelper('indent', function (content, spaces) {
    if (!content) return '';
    const indent = ' '.repeat(spaces || 2);
    return content.split('\n').map(line => indent + line).join('\n');
  });

  debug('Registered Handlebars helpers');
}

/**
 * Load and register all partials from the partials directory
 * @param {string} [partialsDir] - Path to partials directory
 * @returns {Promise<void>}
 */
export async function loadPartials(partialsDir) {
  const dir = partialsDir || join(PACKAGE_TEMPLATES_DIR, 'partials');

  if (!await exists(dir)) {
    debug(`No partials directory found at: ${dir}`);
    return;
  }

  const partialFiles = await listFiles(dir, { extensions: ['.hbs'] });

  for (const filePath of partialFiles) {
    const name = filePath.split('/').pop().replace('.hbs', '');
    if (!registeredPartials.has(name)) {
      const content = await readFile(filePath);
      hbs.registerPartial(name, content);
      registeredPartials.add(name);
      debug(`Registered partial: ${name}`);
    }
  }
}

/**
 * Register a single partial
 * @param {string} name - Partial name
 * @param {string} content - Partial content
 */
export function registerPartial(name, content) {
  hbs.registerPartial(name, content);
  registeredPartials.add(name);
  debug(`Registered partial: ${name}`);
}

/**
 * Compile a template string
 * @param {string} template - The template string
 * @returns {HandlebarsTemplateDelegate}
 */
export function compile(template) {
  return hbs.compile(template);
}

/**
 * Render a template string with data
 * @param {string} template - The template string
 * @param {object} data - Data to render with
 * @returns {string}
 */
export function render(template, data = {}) {
  const compiled = compile(template);
  return compiled(data);
}

/**
 * Load and render a template file
 * @param {string} templatePath - Path to the template file
 * @param {object} data - Data to render with
 * @returns {Promise<string>}
 */
export async function renderFile(templatePath, data = {}) {
  const template = await readFile(templatePath);
  return render(template, data);
}

/**
 * Load and render a template by name from the templates directory
 * @param {string} templateName - Template name (with or without .hbs extension)
 * @param {object} data - Data to render with
 * @param {string} [templatesDir] - Optional templates directory
 * @returns {Promise<string>}
 */
export async function renderTemplate(templateName, data = {}, templatesDir) {
  const dir = templatesDir || PACKAGE_TEMPLATES_DIR;
  const name = templateName.endsWith('.hbs') ? templateName : `${templateName}.hbs`;
  const templatePath = join(dir, name);

  // Ensure partials are loaded
  await loadPartials(join(dir, 'partials'));

  return renderFile(templatePath, data);
}

/**
 * Get default template data with common values
 * @param {object} [overrides] - Values to override defaults
 * @returns {object}
 */
export function getDefaultData(overrides = {}) {
  return {
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    year: new Date().getFullYear(),
    version: packageVersion,
    ...overrides
  };
}

/**
 * List available templates
 * @param {string} [templatesDir] - Templates directory
 * @returns {Promise<string[]>}
 */
export async function listTemplates(templatesDir) {
  const dir = templatesDir || PACKAGE_TEMPLATES_DIR;
  const files = await listFiles(dir, { extensions: ['.hbs'] });
  return files.map(f => f.split('/').pop().replace('.hbs', ''));
}

/**
 * Check if a template exists
 * @param {string} templateName - Template name
 * @param {string} [templatesDir] - Templates directory
 * @returns {Promise<boolean>}
 */
export async function templateExists(templateName, templatesDir) {
  const dir = templatesDir || PACKAGE_TEMPLATES_DIR;
  const name = templateName.endsWith('.hbs') ? templateName : `${templateName}.hbs`;
  return exists(join(dir, name));
}

// Initialize helpers on module load
registerHelpers();

export default {
  loadPartials,
  registerPartial,
  compile,
  render,
  renderFile,
  renderTemplate,
  getDefaultData,
  listTemplates,
  templateExists
};
