import { zodToJsonSchema } from 'zod-to-json-schema'
import { inputCliOptionsSchema } from '../../options/input-options'
import { outputCliOptionsSchema } from '../../options/output-options'
import type { ObjectSchema } from './types'
import { z } from 'zod'

// 定义并验证 CLI 的输入选项，同时提供类型化和 JSON Schema 转换。
export const cliOptionsSchema = z
  .strictObject({
    config: z
      .string()
      .or(z.boolean())
      .describe('Path to the config file (default: `rolldown.config.js`)')
      .optional(),
    help: z.boolean().describe('Show help').optional(),
    version: z.boolean().describe('Show version number').optional(),
    watch: z
      .boolean()
      .describe('Watch files in bundle and rebuild on changes')
      .optional(),
  })
  .merge(inputCliOptionsSchema)
  .merge(outputCliOptionsSchema)

export type CliOptions = z.infer<typeof cliOptionsSchema>

export const schema = zodToJsonSchema(
  cliOptionsSchema,
) as unknown as ObjectSchema
