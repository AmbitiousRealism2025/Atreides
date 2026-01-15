/**
 * Template Engine Tests
 */

import { jest } from '@jest/globals';
import {
  compile,
  render,
  getDefaultData,
  registerPartial,
  sanitizeTemplateData
} from '../src/lib/template-engine.js';

describe('Template Engine', () => {
  describe('compile', () => {
    it('should compile a simple template', () => {
      const template = compile('Hello {{name}}!');
      expect(typeof template).toBe('function');
    });

    it('should compile templates with helpers', () => {
      const template = compile('{{uppercase name}}');
      expect(typeof template).toBe('function');
    });
  });

  describe('render', () => {
    it('should render a simple template with data', () => {
      const result = render('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should render with default helper', () => {
      const result = render('Value: {{default value "fallback"}}', {});
      expect(result).toBe('Value: fallback');
    });

    it('should render with uppercase helper', () => {
      const result = render('{{uppercase text}}', { text: 'hello' });
      expect(result).toBe('HELLO');
    });

    it('should render with lowercase helper', () => {
      const result = render('{{lowercase text}}', { text: 'HELLO' });
      expect(result).toBe('hello');
    });

    it('should render with capitalize helper', () => {
      const result = render('{{capitalize text}}', { text: 'hello' });
      expect(result).toBe('Hello');
    });

    it('should render with kebab-case helper', () => {
      const result = render('{{kebab-case text}}', { text: 'myVariableName' });
      expect(result).toBe('my-variable-name');
    });

    it('should render with if-eq helper', () => {
      const template = '{{#if-eq val "test"}}YES{{else}}NO{{/if-eq}}';
      expect(render(template, { val: 'test' })).toBe('YES');
      expect(render(template, { val: 'other' })).toBe('NO');
    });

    it('should render with join helper', () => {
      const result = render('{{join items ", "}}', { items: ['a', 'b', 'c'] });
      expect(result).toBe('a, b, c');
    });

    it('should render with current-date helper', () => {
      const result = render('{{current-date}}', {});
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getDefaultData', () => {
    it('should return default data with date fields', () => {
      const data = getDefaultData();
      expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(typeof data.year).toBe('number');
    });

    it('should include version from package.json', () => {
      const data = getDefaultData();
      expect(data.version).toBeDefined();
      expect(typeof data.version).toBe('string');
    });

    it('should allow overrides', () => {
      const data = getDefaultData({ customField: 'value' });
      expect(data.customField).toBe('value');
    });

    it('should allow overriding default fields', () => {
      const data = getDefaultData({ version: '2.0.0' });
      expect(data.version).toBe('2.0.0');
    });
  });

  describe('registerPartial', () => {
    it('should register and use a partial', () => {
      registerPartial('test-greeting', 'Hello {{name}}!');
      const result = render('{{> test-greeting}}', { name: 'Test' });
      expect(result).toBe('Hello Test!');
    });
  });

  describe('sanitizeTemplateData', () => {
    it('should escape double braces in strings', () => {
      const result = sanitizeTemplateData('{{malicious}}');
      expect(result).toBe('&#123;&#123;malicious&#125;&#125;');
    });

    it('should escape triple braces in strings', () => {
      const result = sanitizeTemplateData('{{{unescaped}}}');
      expect(result).toBe('&#123;&#123;&#123;unescaped&#125;&#125;&#125;');
    });

    it('should recursively sanitize object values', () => {
      const input = {
        name: '{{constructor}}',
        nested: {
          value: '{{__proto__}}'
        }
      };
      const result = sanitizeTemplateData(input);
      expect(result.name).toBe('&#123;&#123;constructor&#125;&#125;');
      expect(result.nested.value).toBe('&#123;&#123;__proto__&#125;&#125;');
    });

    it('should recursively sanitize array values', () => {
      const input = ['{{a}}', '{{b}}', { item: '{{c}}' }];
      const result = sanitizeTemplateData(input);
      expect(result[0]).toBe('&#123;&#123;a&#125;&#125;');
      expect(result[1]).toBe('&#123;&#123;b&#125;&#125;');
      expect(result[2].item).toBe('&#123;&#123;c&#125;&#125;');
    });

    it('should preserve non-string values unchanged', () => {
      const input = {
        number: 42,
        boolean: true,
        nullValue: null,
        array: [1, 2, 3]
      };
      const result = sanitizeTemplateData(input);
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.nullValue).toBe(null);
      expect(result.array).toEqual([1, 2, 3]);
    });

    it('should handle null input', () => {
      expect(sanitizeTemplateData(null)).toBe(null);
    });

    it('should handle undefined input', () => {
      expect(sanitizeTemplateData(undefined)).toBe(undefined);
    });
  });

  describe('template injection prevention', () => {
    it('should prevent template injection via user input', () => {
      const maliciousInput = '{{constructor.constructor("return this")()}}';
      const result = render('Hello {{name}}!', { name: maliciousInput });
      // The malicious code should be escaped, not executed
      expect(result).not.toContain('constructor');
      expect(result).toContain('&#123;&#123;');
    });

    it('should prevent helper injection in user data', () => {
      const maliciousInput = '{{#each items}}{{this}}{{/each}}';
      const result = render('Message: {{message}}', { message: maliciousInput });
      // The helper syntax should be escaped
      expect(result).toContain('&#123;&#123;');
      expect(result).not.toContain('<each>');
    });

    it('should allow disabling sanitization when needed', () => {
      const trustedTemplate = '{{name}}';
      const result = render('Result: {{template}}', { template: trustedTemplate }, { sanitize: false });
      // Without sanitization, the braces are preserved
      expect(result).toBe('Result: {{name}}');
    });

    it('should sanitize by default', () => {
      const result = render('Output: {{input}}', { input: '{{dangerous}}' });
      // Should be escaped by default
      expect(result).toContain('&#123;&#123;dangerous&#125;&#125;');
    });

    it('should prevent prototype access attacks', () => {
      const maliciousInput = '{{constructor.constructor}}';
      const result = render('Test: {{val}}', { val: maliciousInput });
      expect(result).not.toContain('[object Function]');
      expect(result).toContain('&#123;&#123;');
    });
  });
});
