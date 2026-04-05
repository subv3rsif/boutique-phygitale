import '@testing-library/jest-dom/vitest'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local for tests
config({ path: resolve(process.cwd(), '.env.local') })
