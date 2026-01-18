import type { CliEntry } from '../types'
import { EnvGeneratorDemo } from '@/components/playground/demos/env-generator'
import { PortKillerDemo } from '@/components/playground/demos/port-killer'

export const cliEntries: CliEntry[] = [
    {
        id: 'env-generator',
        title: 'env-generator',
        description: 'Generate .env files from .env.example with prompts',
        category: 'cli',
        language: 'bash',
        tags: ['CLI', 'DevOps', 'Automation'],
        github: 'https://github.com/remcostoeten/env-generator',
        preview: EnvGeneratorDemo,
        code: `#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createInterface } from 'readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const prompt = (q: string) => new Promise<string>(r => rl.question(q, r))

async function generateEnv() {
  if (!existsSync('.env.example')) {
    console.log('No .env.example found')
    process.exit(1)
  }
  
  const template = readFileSync('.env.example', 'utf-8')
  const lines = template.split('\\n')
  const result: string[] = []
  
  for (const line of lines) {
    if (!line.includes('=') || line.startsWith('#')) {
      result.push(line)
      continue
    }
    const [key] = line.split('=')
    const value = await prompt(\`\${key}: \`)
    result.push(\`\${key}=\${value}\`)
  }
  
  writeFileSync('.env', result.join('\\n'))
  console.log('✓ .env generated')
  rl.close()
}`,
    },
    {
        id: 'port-killer',
        title: 'port-killer',
        description: 'Kill processes running on specified ports',
        category: 'cli',
        language: 'bash',
        tags: ['CLI', 'DevOps', 'Utility'],
        github: 'https://github.com/remcostoeten/port-killer',
        preview: PortKillerDemo,
        code: `#!/usr/bin/env node
import { execSync } from 'child_process'

const ports = process.argv.slice(2).map(Number).filter(Boolean)

if (ports.length === 0) {
  console.log('Usage: port-killer <port> [port2] [port3]...')
  process.exit(1)
}

for (const port of ports) {
  try {
    const pid = execSync(\`lsof -ti:\${port}\`).toString().trim()
    if (pid) {
      execSync(\`kill -9 \${pid}\`)
      console.log(\`✓ Killed process \${pid} on port \${port}\`)
    }
  } catch {
    console.log(\`○ No process on port \${port}\`)
  }
}`,
    },
]
