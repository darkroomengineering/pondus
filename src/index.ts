#!/usr/bin/env node
import { Command } from 'commander'
import pc from 'picocolors'
import { statsCommand } from './commands/stats'
import { orgCommand } from './commands/org'
import { configCommand } from './commands/config'
import { runInteractive } from './interactive'

const program = new Command()

program
	.name('pondus')
	.description('GitHub organization metrics and settings CLI')
	.version('1.0.0')
	.addHelpText(
		'after',
		`
${pc.bold('Examples:')}
  ${pc.dim('# Show commit statistics for an organization')}
  $ pondus stats commits myorg

  ${pc.dim('# Show commits for a specific date range')}
  $ pondus stats commits myorg --since 2025-01-01 --until 2025-06-30

  ${pc.dim('# Show organization info')}
  $ pondus org info myorg

  ${pc.dim('# List organization members')}
  $ pondus org members myorg

  ${pc.dim('# List organization teams')}
  $ pondus org teams myorg

  ${pc.dim('# Show Actions settings with runners and secrets')}
  $ pondus org actions myorg --runners --secrets

  ${pc.dim('# Check authentication status')}
  $ pondus config auth

  ${pc.dim('# Run in interactive mode')}
  $ pondus
`
	)

program.addCommand(statsCommand)
program.addCommand(orgCommand)
program.addCommand(configCommand)

program
	.command('interactive')
	.description('Run in interactive mode')
	.action(async () => {
		await runInteractive()
	})

// Interactive mode when no args
if (process.argv.length === 2) {
	runInteractive()
} else {
	program.parse()
}
