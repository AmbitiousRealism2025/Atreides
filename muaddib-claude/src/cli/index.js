/**
 * CLI Router - Commander.js based command routing
 *
 * Main entry point for the Muad'Dib CLI.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import commands
import { doctorCommand } from './doctor.js';

// Get package version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get package.json data
 * @returns {object}
 */
function getPackageJson() {
  try {
    return JSON.parse(
      readFileSync(join(__dirname, '../../package.json'), 'utf8')
    );
  } catch {
    return { version: '0.0.0' };
  }
}

/**
 * Main CLI entry point
 */
export async function run() {
  const packageJson = getPackageJson();
  const program = new Command();

  // Program metadata
  program
    .name('muaddib')
    .description(chalk.cyan("Muad'Dib - OmO-style orchestration for Claude Code"))
    .version(packageJson.version, '-v, --version', 'Output the current version')
    .helpOption('-h, --help', 'Display help for command');

  // Register commands
  program.addCommand(doctorCommand());

  // Custom help formatting
  program.configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => chalk.yellow(cmd.name())
  });

  // Add examples to help
  program.addHelpText('after', `

${chalk.bold('Examples:')}
  ${chalk.gray('# Check installation health')}
  $ muaddib doctor

  ${chalk.gray('# Clean up old backup files')}
  $ muaddib doctor --cleanup-backups

${chalk.bold('Documentation:')}
  ${chalk.blue('https://github.com/AmbitiousRealism2025/muad-dib')}
`);

  // Error handling
  program.showHelpAfterError('(add --help for additional information)');

  // Parse and execute
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
