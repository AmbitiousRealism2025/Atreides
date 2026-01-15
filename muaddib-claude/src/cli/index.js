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
import { initCommand } from './init.js';
import { installCommand } from './install.js';
import { updateCommand } from './update.js';

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
  program.addCommand(initCommand());
  program.addCommand(installCommand());
  program.addCommand(updateCommand());

  // Custom help formatting
  program.configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => chalk.yellow(cmd.name())
  });

  // Add examples to help
  program.addHelpText('after', `

${chalk.bold('Examples:')}
  ${chalk.gray('# Install global components')}
  $ muaddib install

  ${chalk.gray('# Update to latest version')}
  $ muaddib update

  ${chalk.gray('# Initialize a project')}
  $ muaddib init

  ${chalk.gray('# Initialize with minimal setup (CLAUDE.md only)')}
  $ muaddib init --minimal

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
