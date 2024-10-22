import remarkParse from 'remark-parse'
import { unified } from 'unified'
import fg from 'fast-glob'
import * as path from 'node:path'
import * as fs from 'node:fs'

/**
 * 主要目的是从 esbuild 测试文件中提取出原因描述（“Reason”），并根据这些原因汇总各个测试目录，以便分析。
 * @param source
 * @returns
 */
export function extractReason(source: string) {
  // 定义一个函数 extractReason，从传入的 Markdown 内容中提取所有 “Reason” 列表项。

  const processor = unified().use(remarkParse)
  // 使用 `unified` 和 `remark-parse` 解析 Markdown 文件，构造解析器。

  const parseTree = processor.parse(source)
  const tree: any = processor.runSync(parseTree)
  // 解析输入的 Markdown 文本，生成解析树（AST）。

  let i = 0
  let inReason = false
  let ret = []
  // 初始化变量 i 为迭代器，inReason 标识是否处于 "Reason" 部分，ret 存储提取出的内容。

  while (i < tree.children.length) {
    let child = tree.children[i]
    // 遍历解析树的子节点。

    if (inReason && child.type === 'list') {
      // 如果当前节点在 "Reason" 标题之后，且是一个列表，则提取该列表的内容。

      let childList = child.children
      for (let j = 0; j < child.children.length; j++) {
        let listItem = childList[j]
        let position = listItem.children[0].position
        let listContent = source.slice(
          position.start.offset,
          position.end.offset,
        )
        ret.push(listContent)
        // 遍历列表中的每一项，根据其位置提取原始内容，并存储到 ret 中。
      }
    }

    if (child.type === 'heading' && child.depth === 1) {
      // 如果遇到一级标题（`#`），检查标题内容是否为 "Reason"。

      let content = source.slice(
        child.position.start.offset,
        child.position.end.offset,
      )
      if (content.trim().slice(1).trim() === 'Reason') {
        inReason = true
        // 如果标题是 "Reason"，设置标识 inReason 为 true，标明进入了 "Reason" 部分。
      } else {
        inReason = false
        // 否则，设置 inReason 为 false。
      }
    }
    i++
  }
  return ret
  // 返回提取出的 "Reason" 列表项内容。
}

const workspaceDir = path.join(import.meta.dirname, '../..')
// 设置工作目录路径为上两级目录。

export type AggregateReasonEntries = [string, string[]][]
// 定义一个类型，表示 "Reason" 和其相关的目录数组。

export function aggregateReason(): AggregateReasonEntries {
  const entries = fg.globSync(['crates/rolldown/tests/esbuild/**/diff.md'], {
    dot: false,
    cwd: workspaceDir,
  })
  // 使用 fast-glob 查找 `esbuild` 测试目录下的所有 `diff.md` 文件。

  let reasonToCaseDirMap: Record<string, string[]> = {}
  // 定义一个对象，用于存储每个原因和对应的目录。

  for (let entry of entries) {
    const entryAbPath = path.resolve(workspaceDir, entry)
    let content = fs.readFileSync(entryAbPath, 'utf-8')
    // 读取每个找到的 `diff.md` 文件内容。

    let reasons = extractReason(content)
    // 使用 extractReason 函数提取文件中的 "Reason" 列表项。

    let dirname = path.relative(workspaceDir, path.dirname(entryAbPath))
    const posixPath = dirname.replaceAll('\\', '/')
    // 获取相对路径并将其转换为 POSIX 风格路径。

    for (let reason of reasons) {
      if (!reasonToCaseDirMap[reason]) {
        reasonToCaseDirMap[reason] = []
      }
      reasonToCaseDirMap[reason].push(posixPath)
      // 将提取到的每个 "Reason" 与其对应的目录相关联，存储到 map 中。
    }
  }

  let reverseMapEntries = Object.entries(reasonToCaseDirMap)
  // 将 reasonToCaseDirMap 转换为键值对数组。

  for (let [_, dirs] of reverseMapEntries) {
    dirs.sort()
    // 对每个原因对应的目录进行排序。
  }

  reverseMapEntries.sort((a, b) => {
    return b[1].length - a[1].length
  })
  // 根据每个原因关联的目录数量对键值对进行排序，数量多的排在前面。

  return reverseMapEntries
  // 返回排好序的结果。
}
