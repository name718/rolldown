import * as path from 'node:path'
import * as fs from 'node:fs'
import { parseEsbuildSnap, parseRolldownSnap } from './snap-parser.js'
import { diffCase } from './diff'
import { DebugConfig, UnwrapPromise } from './types'
import { aggregateReason } from './aggregate-reason.js'

// esbuild 测试文件所在的绝对路径，esbuildTestDir 将指向项目的 rolldown 包的测试目录，可能用于测试文件的读取或操作。
const esbuildTestDir = path.join(
  import.meta.dirname,
  '../../crates/rolldown/tests/esbuild',
)

export function getEsbuildSnapFile(
  includeList: string[],
): Array<{ normalizedName: string; content: string }> {
  // 函数 getEsbuildSnapFile 接受一个字符串数组 includeList 作为参数
  // 返回一个包含文件名和文件内容的对象数组，每个对象包含 normalizedName 和 content 两个属性。

  let dirname = path.resolve(import.meta.dirname, './esbuild-snapshots/')
  // 使用 path.resolve 解析目录路径，将 'esbuild-snapshots/' 目录的路径存储在 dirname 变量中。
  // 该目录存储了与 esbuild 相关的快照文件。

  let fileList = fs.readdirSync(dirname)
  // 使用 fs.readdirSync 同步读取目录下的所有文件名，并将这些文件名存储在 fileList 变量中。

  let ret = fileList
    .filter((filename) => {
      // 对文件名进行过滤，如果 includeList 是空的，就不过滤；否则，只保留 includeList 中存在的文件名。
      return includeList.length === 0 || includeList.includes(filename)
    })
    .map((filename) => {
      // 对过滤后的文件名进行处理，将文件名解析并读取其内容。

      let name = path.parse(filename).name
      // 使用 path.parse 来解析文件名，去掉扩展名，并获取文件的基础名称。

      let [_, ...rest] = name.split('_')
      // 通过下划线分割文件名，忽略第一个部分（通常是无关的前缀），保留后面的部分。

      let normalizedName = rest.join('_')
      // 将剩余的部分重新用下划线连接，得到标准化后的文件名。

      let content = fs.readFileSync(path.join(dirname, filename), 'utf-8')
      // 使用 fs.readFileSync 同步读取文件内容，并将其存储为字符串形式。

      return { normalizedName, content }
      // 返回一个对象，包含标准化的文件名和文件内容。
    })

  return ret
  // 返回处理后的文件列表，包含文件名和文件内容。
}

type AggregateStats = {
  stats: Stats
  details: Record<string, Stats>
}

type Stats = {
  pass: number
  bypass: number
  failed: number
  total: number
}
export async function run(includeList: string[], debugConfig: DebugConfig) {
  let aggregatedStats: AggregateStats = {
    stats: {
      pass: 0,
      bypass: 0,
      failed: 0,
      total: 0,
    },
    details: {},
  }
  // ??用于读取和处理存储在 esbuild-snapshots 目录中的快照文件。
  let snapfileList = getEsbuildSnapFile(includeList)
  // esbuild snapshot_x.txt
  for (let snapFile of snapfileList) {
    if (debugConfig?.debug) {
      console.log('category:', snapFile.normalizedName)
    }
    let { normalizedName: snapCategory, content } = snapFile
    let parsedEsbuildSnap = parseEsbuildSnap(content)
    // singleEsbuildSnapshot
    let diffList = []
    for (let snap of parsedEsbuildSnap) {
      if (
        debugConfig.caseNames?.length > 0 &&
        !debugConfig.caseNames.includes(snap.name)
      ) {
        continue
      }
      if (debugConfig.debug) {
        console.log('processing', snap.name)
      }
      let rolldownTestPath = path.join(esbuildTestDir, snapCategory, snap.name)
      let rolldownSnap = getRolldownSnap(rolldownTestPath)
      let parsedRolldownSnap = parseRolldownSnap(rolldownSnap)
      let diffResult = await diffCase(
        snap,
        parsedRolldownSnap,
        rolldownTestPath,
        debugConfig,
      )
      // if the testDir has a `bypass.md`, we skip generate `diff.md`,
      // append the diff result to `bypass.md` instead
      let bypassMarkdownPath = path.join(rolldownTestPath, 'bypass.md')
      let diffMarkdownPath = path.join(rolldownTestPath, 'diff.md')
      if (fs.existsSync(bypassMarkdownPath) && typeof diffResult === 'object') {
        if (fs.existsSync(diffMarkdownPath)) {
          fs.rmSync(diffMarkdownPath, {})
        }
        updateBypassOrDiffMarkdown(bypassMarkdownPath, diffResult)
        diffResult = 'bypass'
      } else if (typeof diffResult === 'string') {
        if (fs.existsSync(bypassMarkdownPath)) {
          fs.rmSync(bypassMarkdownPath, {})
        }
        if (fs.existsSync(diffMarkdownPath)) {
          fs.rmSync(diffMarkdownPath, {})
        }
      } else {
        updateBypassOrDiffMarkdown(
          path.join(rolldownTestPath, 'diff.md'),
          diffResult,
        )
      }
      diffList.push({ diffResult, name: snap.name })
    }
    diffList.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    let summary = getSummaryMarkdownAndStats(diffList, snapCategory)
    fs.writeFileSync(
      path.join(import.meta.dirname, './summary/', `${snapCategory}.md`),
      summary.markdown,
    )
    aggregatedStats.details[snapCategory] = summary.stats
    aggregatedStats.stats.total += summary.stats.total
    aggregatedStats.stats.pass += summary.stats.pass
    aggregatedStats.stats.bypass += summary.stats.bypass
    aggregatedStats.stats.failed += summary.stats.failed
  }
  generateStatsMarkdown(aggregatedStats)
  generateAggregateMarkdown()
}

function generateAggregateMarkdown() {
  let entries = aggregateReason()
  // 调用 aggregateReason 函数，获取一个包含“原因”和对应目录的映射（假设为 Map）。

  let markdown = '# Aggregate Reason\n'
  // 初始化 markdown 字符串，以标题 "# Aggregate Reason" 开始。

  for (let [reason, caseDirs] of entries) {
    // 遍历 entries 中的每一个键值对，键是 reason（原因），值是 caseDirs（目录数组）。

    markdown += `## ${reason}\n`
    // 将每个原因作为 markdown 的二级标题添加到 markdown 字符串中。

    for (let dir of caseDirs) {
      // 遍历每个原因对应的目录。

      markdown += `- ${dir}\n`
      // 将每个目录以列表项的形式添加到 markdown 字符串中。
    }
  }

  fs.writeFileSync(
    path.resolve(import.meta.dirname, './stats/aggregated-reason.md'),
    markdown,
  )
  // 将生成的 markdown 内容写入文件 './stats/aggregated-reason.md'。
}

function getRolldownSnap(caseDir: string) {
  let artifactsPath = path.join(caseDir, 'artifacts.snap')
  if (fs.existsSync(artifactsPath)) {
    return fs.readFileSync(artifactsPath, 'utf-8')
  }
}

function getDiffMarkdown(
  diffResult: UnwrapPromise<ReturnType<typeof diffCase>>,
) {
  if (typeof diffResult === 'string') {
    throw new Error('diffResult should not be string')
  }
  let markdown = ''
  for (let d of diffResult) {
    markdown += `## ${d.esbuildName}\n`
    markdown += `### esbuild\n\`\`\`js\n${d.esbuild}\n\`\`\`\n`
    markdown += `### rolldown\n\`\`\`js\n${d.rolldown}\n\`\`\`\n`
    markdown += `### diff\n\`\`\`diff\n${d.diff}\n\`\`\`\n`
  }
  return markdown
}

function generateStatsMarkdown(aggregateStats: AggregateStats) {
  const { stats, details } = aggregateStats
  let markdown = ''

  markdown += `# Compatibility metric\n`
  markdown += `- total: ${stats.total}\n`
  markdown += `- passed: ${stats.total - stats.failed}\n`
  markdown += `- passed ratio: ${(((stats.total - stats.failed) / stats.total) * 100).toFixed(2)}%\n`

  markdown += `# Compatibility metric details\n`
  Object.entries(details).forEach(([category, stats]) => {
    markdown += `## ${category}\n`
    markdown += `- total: ${stats.total}\n`
    markdown += `- passed: ${stats.total - stats.failed}\n`
    markdown += `- passed ratio: ${(((stats.total - stats.failed) / stats.total) * 100).toFixed(2)}%\n`
  })
  fs.writeFileSync(
    path.resolve(import.meta.dirname, './stats/stats.md'),
    markdown,
  )
}

type Summary = {
  markdown: string
  stats: Stats
}

function getSummaryMarkdownAndStats(
  diffList: Array<{
    diffResult: UnwrapPromise<ReturnType<typeof diffCase>>
    name: string
  }>,
  snapshotCategory: string,
): Summary {
  let bypassList = []
  let failedList = []
  let passList = []
  for (let diff of diffList) {
    if (diff.diffResult === 'bypass') {
      bypassList.push(diff)
    } else if (diff.diffResult === 'same') {
      passList.push(diff)
    } else {
      failedList.push(diff)
    }
  }
  let markdown = `# Failed Cases\n`
  for (let diff of failedList) {
    let testDir = path.join(esbuildTestDir, snapshotCategory, diff.name)
    let relativePath = path.relative(
      path.join(import.meta.dirname, 'summary'),
      testDir,
    )
    const posixPath = relativePath.replaceAll('\\', '/')
    if (diff.diffResult === 'missing') {
      markdown += `## ${diff.name}\n`
      markdown += `  missing\n`
      continue
    }
    if (diff.diffResult !== 'same') {
      markdown += `## [${diff.name}](${posixPath}/diff.md)\n`
      markdown += `  diff\n`
    }
  }

  markdown += `# Passed Cases\n`
  for (let diff of passList) {
    let testDir = path.join(esbuildTestDir, snapshotCategory, diff.name)
    let relativePath = path.relative(
      path.join(import.meta.dirname, 'summary'),
      testDir,
    )
    const posixPath = relativePath.replaceAll('\\', '/')
    markdown += `## [${diff.name}](${posixPath})\n`
  }

  markdown += `# Bypassed Cases\n`
  for (let diff of bypassList) {
    let testDir = path.join(esbuildTestDir, snapshotCategory, diff.name)
    let relativePath = path.relative(
      path.join(import.meta.dirname, 'summary'),
      testDir,
    )
    const posixPath = relativePath.replaceAll('\\', '/')
    markdown += `## [${diff.name}](${posixPath}/bypass.md)\n`
  }

  return {
    markdown,
    stats: {
      pass: passList.length,
      bypass: bypassList.length,
      failed: failedList.length,
      total: diffList.length,
    },
  }
}

function updateBypassOrDiffMarkdown(
  markdownPath: string,
  diffResult: UnwrapPromise<ReturnType<typeof diffCase>>,
) {
  let bypassContent = ''
  if (fs.existsSync(markdownPath)) {
    bypassContent = fs.readFileSync(markdownPath, 'utf-8')
  }

  let res = /# Diff/.exec(bypassContent)
  if (res) {
    bypassContent = bypassContent.slice(0, res.index)
  }
  let diffMarkdown = getDiffMarkdown(diffResult)
  bypassContent = bypassContent.trimEnd()
  bypassContent += '\n# Diff\n'
  bypassContent += diffMarkdown
  fs.writeFileSync(markdownPath, bypassContent.trim())
}
