/**
 * Logger utility for Muad'Dib CLI
 *
 * Provides chalk-based colored console output for consistent messaging.
 */

import chalk from 'chalk';

/**
 * Log an info message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function info(message, ...args) {
  console.log(chalk.blue('ℹ'), message, ...args);
}

/**
 * Log a success message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function success(message, ...args) {
  console.log(chalk.green('✓'), message, ...args);
}

/**
 * Log a warning message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function warn(message, ...args) {
  console.log(chalk.yellow('⚠'), message, ...args);
}

/**
 * Log an error message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function error(message, ...args) {
  console.error(chalk.red('✗'), message, ...args);
}

/**
 * Log a step in a process
 * @param {number} step - Step number
 * @param {number} total - Total steps
 * @param {string} message - The message to log
 */
export function step(step, total, message) {
  console.log(chalk.cyan(`[${step}/${total}]`), message);
}

/**
 * Log a heading/title
 * @param {string} title - The title to display
 */
export function title(title) {
  console.log();
  console.log(chalk.bold.white(title));
  console.log(chalk.gray('─'.repeat(title.length)));
}

/**
 * Log a debug message (only if DEBUG env var is set)
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function debug(message, ...args) {
  if (process.env.DEBUG || process.env.MUADDIB_DEBUG) {
    console.log(chalk.gray('[debug]'), message, ...args);
  }
}

/**
 * Log a dimmed/secondary message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function dim(message, ...args) {
  console.log(chalk.dim(message), ...args);
}

/**
 * Create a spinner-like indicator for long operations
 * @param {string} message - The message to display
 * @returns {object} - Object with stop() method
 */
export function spinner(message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(chalk.cyan(frames[i]) + ' ' + message);

  const interval = setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(chalk.cyan(frames[i]) + ' ' + message);
  }, 80);

  return {
    stop: (finalMessage) => {
      clearInterval(interval);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      if (finalMessage) {
        console.log(finalMessage);
      }
    },
    succeed: (finalMessage) => {
      clearInterval(interval);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      success(finalMessage || message);
    },
    fail: (finalMessage) => {
      clearInterval(interval);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      error(finalMessage || message);
    }
  };
}

/**
 * Format a list of items for display
 * @param {string[]} items - Array of items to display
 * @param {string} [bullet='•'] - Bullet character to use
 */
export function list(items, bullet = '•') {
  for (const item of items) {
    console.log(chalk.gray(`  ${bullet}`), item);
  }
}

/**
 * Display a boxed message
 * @param {string} message - The message to box
 * @param {string} [type='info'] - Type: 'info', 'success', 'warn', 'error'
 */
export function box(message, type = 'info') {
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warn: chalk.yellow,
    error: chalk.red
  };
  const color = colors[type] || colors.info;
  const lines = message.split('\n');
  const maxLen = Math.max(...lines.map(l => l.length));
  const top = color('┌' + '─'.repeat(maxLen + 2) + '┐');
  const bottom = color('└' + '─'.repeat(maxLen + 2) + '┘');

  console.log(top);
  for (const line of lines) {
    console.log(color('│') + ' ' + line.padEnd(maxLen) + ' ' + color('│'));
  }
  console.log(bottom);
}

export default {
  info,
  success,
  warn,
  error,
  step,
  title,
  debug,
  dim,
  spinner,
  list,
  box
};
