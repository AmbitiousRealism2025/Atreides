/**
 * Template Engine Tests
 */

import { jest } from '@jest/globals';
import {
  compile,
  render,
  getDefaultData,
  registerPartial
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
});
