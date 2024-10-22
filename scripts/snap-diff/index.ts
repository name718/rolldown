// cSpell:ignore packagejson
import { run } from './runner'
// 引入 runner 模块中的 run 方法，这个方法可能是执行测试或任务的核心逻辑。

const args = process.argv.slice(2)
// 从命令行获取参数，去掉前两个默认参数（node 和脚本路径），留下用户输入的实际参数。

const debug = args.includes('--debug')
// 检查是否有 --debug 参数，若有，则 debug 变量为 true，否则为 false，用于控制是否启用调试模式。

const verbose = args.includes('--verbose')
// 检查是否有 --verbose 参数，若有，则 verbose 变量为 true，否则为 false，用于控制是否启用详细输出模式。

const caseNames: string[] = []
// 初始化一个空数组 caseNames，用于存储需要运行的测试用例的名称，但此处还没有对其赋值或使用。

const includeList = [
  'snapshots_importstar.txt',
  'snapshots_default.txt',
  'snapshots_packagejson.txt',
  'snapshots_dce.txt',
  'snapshots_splitting.txt',
  'snapshots_lower.txt',
  'snapshots_glob.txt',
  'snapshots_importstar_ts.txt',
  'snapshots_ts.txt',
  'snapshots_loader.txt',
]
// 定义一个字符串数组 includeList，里面包含多个文件的名称，这些文件可能是测试快照（snapshots），用于指定需要加载或检查的测试数据。

run(includeList, { debug, verbose, caseNames })
// 调用 run 方法，传入 includeList 作为要运行的测试文件列表，并通过对象参数传递 debug、verbose 和 caseNames 选项，控制运行时的行为。
