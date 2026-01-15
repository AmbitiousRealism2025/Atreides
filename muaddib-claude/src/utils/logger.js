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
  console.log(chalk.blue('i'), message, ...args);
}

/**
 * Log a success message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function success(message, ...args) {
  console.log(chalk.green('v'), message, ...args);
}

/**
 * Log a warning message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function warn(message, ...args) {
  console.log(chalk.yellow('!'), message, ...args);
}

/**
 * Log an error message
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments
 */
export function error(message, ...args) {
  console.error(chalk.red('x'), message, ...args);
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
  console.log(chalk.gray('-'.repeat(title.length)));
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
 * Format a list of items for display
 * @param {string[]} items - Array of items to display
 * @param {string} [bullet='-'] - Bullet character to use
 */
export function list(items, bullet = '-') {
  for (const item of items) {
    console.log(chalk.gray(`  ${bullet}`), item);
  }
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
  list
};
