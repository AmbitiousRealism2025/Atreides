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
    // Note: Handlebars escapes HTML entities in output, so &#123; becomes &amp;#123;
    // This is actually correct security behavior - double escaping prevents XSS

    it('should prevent template injection via user input', () => {
      const maliciousInput = '{{constructor.constructor("return this")()}}';
      const result = render('Hello {{name}}!', { name: maliciousInput });
      // The malicious code should be escaped, not executed as a template
      // Verify the template braces were sanitized (appear as HTML entities)
      expect(result).toContain('&amp;#123;');
      expect(result).not.toContain('[object Function]');
    });

    it('should prevent helper injection in user data', () => {
      const maliciousInput = '{{#each items}}{{this}}{{/each}}';
      const result = render('Message: {{message}}', { message: maliciousInput });
      // The helper syntax should be escaped (HTML entities are further escaped by Handlebars)
      expect(result).toContain('&amp;#123;');
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
      // Should be escaped by default (HTML entities escaped again by Handlebars)
      expect(result).toContain('&amp;#123;');
      expect(result).toContain('dangerous');
    });

    it('should prevent prototype access attacks', () => {
      const maliciousInput = '{{constructor.constructor}}';
      const result = render('Test: {{val}}', { val: maliciousInput });
      expect(result).not.toContain('[object Function]');
      expect(result).toContain('&amp;#123;');
    });

    // Additional template injection prevention tests
    describe('SSTI (Server-Side Template Injection) prevention', () => {
      it('should prevent __proto__ pollution attempts', () => {
        const maliciousInput = '{{__proto__}}';
        const result = render('Value: {{input}}', { input: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('__proto__');
        expect(result).not.toContain('[object Object]');
      });

      it('should prevent process.env access attempts', () => {
        const maliciousInput = '{{process.env.SECRET}}';
        const result = render('Data: {{data}}', { data: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('process.env.SECRET');
      });

      it('should prevent require() injection attempts', () => {
        const maliciousInput = '{{require("child_process").execSync("id")}}';
        const result = render('Output: {{cmd}}', { cmd: maliciousInput });
        expect(result).toContain('&amp;#123;');
        // Template syntax is escaped, not executed
        expect(result).toContain('child_process');
      });

      it('should prevent this.constructor access', () => {
        const maliciousInput = '{{this.constructor.constructor}}';
        const result = render('Test: {{val}}', { val: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('this.constructor.constructor');
      });

      it('should prevent global object access attempts', () => {
        const maliciousInput = '{{global.process.exit(1)}}';
        const result = render('Action: {{action}}', { action: maliciousInput });
        expect(result).toContain('&amp;#123;');
      });
    });

    describe('triple brace (raw output) injection prevention', () => {
      it('should escape triple braces in user input', () => {
        const maliciousInput = '{{{<script>alert("xss")</script>}}}';
        const result = render('Content: {{content}}', { content: maliciousInput });
        // Triple braces should be escaped, script tags should not execute
        expect(result).toContain('&amp;#123;');
        // The script tag content is there but escaped/not executable
        expect(result).not.toMatch(/<script>/);
      });

      it('should escape nested triple braces', () => {
        const maliciousInput = '{{{{{nested}}}}}';
        const result = render('Value: {{val}}', { val: maliciousInput });
        // All braces should be escaped
        expect(result).not.toMatch(/\{\{\{/);
        expect(result).not.toMatch(/\}\}\}/);
      });
    });

    describe('block helper injection prevention', () => {
      it('should prevent #if injection', () => {
        const maliciousInput = '{{#if true}}injected{{/if}}';
        const result = render('Output: {{output}}', { output: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).not.toBe('Output: injected');
      });

      it('should prevent #unless injection', () => {
        const maliciousInput = '{{#unless false}}malicious{{/unless}}';
        const result = render('Data: {{data}}', { data: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('#unless');
      });

      it('should prevent #with injection', () => {
        const maliciousInput = '{{#with root}}{{secretKey}}{{/with}}';
        const result = render('Context: {{ctx}}', { ctx: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('#with');
      });

      it('should prevent custom helper injection attempts', () => {
        const maliciousInput = '{{uppercase "test"}}';
        const result = render('Text: {{text}}', { text: maliciousInput });
        // Helper should not be executed, just escaped
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('uppercase');
        expect(result).not.toBe('Text: TEST');
      });
    });

    describe('comment bypass prevention', () => {
      it('should escape Handlebars comment syntax in user input', () => {
        const maliciousInput = '{{!-- hidden code --}}visible';
        const result = render('Content: {{content}}', { content: maliciousInput });
        // Comment syntax should be escaped
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('!--');
      });

      it('should escape inline comments', () => {
        const maliciousInput = '{{! comment }}';
        const result = render('Data: {{data}}', { data: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('! comment');
      });
    });

    describe('partial injection prevention', () => {
      it('should prevent partial include injection', () => {
        const maliciousInput = '{{> evil-partial}}';
        const result = render('Include: {{include}}', { include: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('evil-partial');
      });

      it('should prevent dynamic partial injection', () => {
        const maliciousInput = '{{> (lookup . "partialName")}}';
        const result = render('Dynamic: {{dyn}}', { dyn: maliciousInput });
        expect(result).toContain('&amp;#123;');
      });
    });

    describe('deep nested object sanitization', () => {
      it('should sanitize deeply nested malicious strings', () => {
        const deeplyNested = {
          level1: {
            level2: {
              level3: {
                level4: {
                  payload: '{{constructor}}'
                }
              }
            }
          }
        };
        const sanitized = sanitizeTemplateData(deeplyNested);
        expect(sanitized.level1.level2.level3.level4.payload).toBe(
          '&#123;&#123;constructor&#125;&#125;'
        );
      });

      it('should sanitize mixed array and object structures', () => {
        const mixed = {
          items: [
            { name: '{{item1}}', values: ['{{val1}}', '{{val2}}'] },
            { name: '{{item2}}', nested: { deep: '{{deep}}' } }
          ]
        };
        const sanitized = sanitizeTemplateData(mixed);
        expect(sanitized.items[0].name).toContain('&#123;&#123;');
        expect(sanitized.items[0].values[0]).toContain('&#123;&#123;');
        expect(sanitized.items[1].nested.deep).toContain('&#123;&#123;');
      });
    });

    describe('multiple injection vectors', () => {
      it('should handle multiple injection attempts in same string', () => {
        const multipleAttempts = '{{a}}{{b}}{{c}}';
        const result = render('Test: {{val}}', { val: multipleAttempts });
        // All braces should be escaped (output contains HTML-escaped entities)
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('&amp;#125;');
        expect(result).not.toMatch(/\{\{[abc]\}\}/);
      });

      it('should handle mixed triple and double braces', () => {
        const mixedBraces = '{{{raw}}} and {{escaped}}';
        const result = render('Content: {{content}}', { content: mixedBraces });
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('raw');
        expect(result).toContain('escaped');
      });
    });

    describe('edge cases', () => {
      it('should handle empty strings', () => {
        const result = render('Empty: {{val}}', { val: '' });
        expect(result).toBe('Empty: ');
      });

      it('should handle strings with only braces', () => {
        const result = render('Braces: {{val}}', { val: '{{}}' });
        // Braces are sanitized to HTML entities, then escaped by Handlebars
        expect(result).toContain('&amp;#123;');
        expect(result).toContain('&amp;#125;');
      });

      it('should handle unbalanced braces', () => {
        const result = render('Unbalanced: {{val}}', { val: '{{{' });
        expect(result).toContain('&amp;#123;');
      });

      it('should preserve single braces', () => {
        const result = render('Single: {{val}}', { val: '{not template}' });
        expect(result).toBe('Single: {not template}');
      });

      it('should handle numeric values correctly', () => {
        const result = sanitizeTemplateData({ num: 42, float: 3.14 });
        expect(result.num).toBe(42);
        expect(result.float).toBe(3.14);
      });

      it('should handle boolean values correctly', () => {
        const result = sanitizeTemplateData({ yes: true, no: false });
        expect(result.yes).toBe(true);
        expect(result.no).toBe(false);
      });

      it('should handle Date objects by converting to empty object', () => {
        // Note: sanitizeTemplateData iterates over Object.keys, so Date becomes {}
        // This is expected behavior - if Date objects need preservation,
        // they should be formatted to strings before passing to templates
        const date = new Date('2024-01-15');
        const result = sanitizeTemplateData({ date });
        expect(typeof result.date).toBe('object');
      });

      it('should handle function values (pass through)', () => {
        const fn = () => 'test';
        const result = sanitizeTemplateData({ fn });
        expect(typeof result.fn).toBe('function');
      });
    });

    describe('security regression tests', () => {
      it('should prevent CVE-style prototype pollution', () => {
        // Attempt to pollute Object prototype via template
        const maliciousData = {
          '__proto__': { 'polluted': true },
          'constructor': { 'prototype': { 'polluted': true } }
        };
        const sanitized = sanitizeTemplateData(maliciousData);
        // Verify prototype wasn't actually polluted
        expect({}.polluted).toBeUndefined();
        expect(Object.prototype.polluted).toBeUndefined();
      });

      it('should handle toString/valueOf override attempts', () => {
        const maliciousInput = '{{toString.constructor("return this")()}}';
        const result = render('Test: {{val}}', { val: maliciousInput });
        expect(result).toContain('&amp;#123;');
        expect(result).not.toContain('[object');
      });

      it('should prevent template recursion attempts', () => {
        // Even with sanitize: false, double-rendering shouldn't occur
        const recursiveAttempt = '{{input}}';
        const result = render('Output: {{outer}}', {
          outer: recursiveAttempt,
          input: 'should-not-appear'
        });
        expect(result).toContain('&amp;#123;');
        expect(result).not.toContain('should-not-appear');
      });
    });
  });
});
