# Git
## gitignore
> gitignore 模板网站：https://github.com/github/gitignore
## gitattribute
Gitattributes 用于设置文件的属性。和 gitignore 类似，gitattributes 是在目录内创建.gitattributes文本文件，用于设置文件的属性，一般用于设置行尾转换、字符编码等等一系列属性。正常情况下，Git 默认的设置都能够使我们达到要求，也能够自动识别文件，不需要单独使用gitattributes 进行指定。但是一些特殊情况下还是有必要的。
> 举一个比较常见的例子。Windows 下文本文件的行尾是 CRLF（即一个字节 13 加上一个字节10），而 Linux 下文本文件的行尾是 LF。如果无论什么系统均是逐个字节提交到 Git 仓库，则该Git 仓库很难达到跨操作系统的目的。因此，默认情况下，Windows 平台上的 Git 会进行行尾转换，把文本文件的 CRLF 转换为 LF 提交到 Git 仓库，而把 Git 仓库调入到当前目录时则把 LF 转换回 CRLF；而 Linux 平台下则不进行行尾转换。这样以保证 Git 仓库内的文本文件文件均为 LF 行尾。但是存在一种情况，我们在一些意外情况下使得 Linux 系统上也出现了 CRLF 结尾的文件（例如 Linux 远程共享了 Windows 系统的文件夹），这样由于 Linux 系统的 Git 不进行行尾转换，便使得 Git 仓库中出现了 CRLF 行尾的文件，污染了 Git 仓库。这可以通过```git config```，让 Linux系统上的 Git 开启行尾转换而解决。但是，我们在多人合作开发的时候，很难要求所有人都进行设置。因此，使用 gitattributes 便可以让所有人的 Git 忽略自己的默认设置，而使用```.gitattributes```则可以让 Git 自动识别文本文件并进行行尾转换。Gitattributes 一般的语法为：```<filename> <attributes>```。要达到上述目的，只需要在```.gitattributes```中写一行：
```
* text=auto
```
其中，``*``代表所有文件，``text=auto``是让 Git 自动判断文件是二进制文件还是文本文件并进行行尾转换。

## CI/CD
* CI 持续集成（Continuous Integration）自动构建，测试和集成共享存储库中的代码更改
* CD 持续交付（Continuous Delivery）自动将代码更改交付到生产就绪环境以供批准
* CD 持续部署（Continuous Deployment）自动将代码更改直接部署到客

### GitHub Actions
Github Actions是由Github创建的 CI/CD服务。它的目的是使所有软件开发工作流程的自动化变得容易。直接从GitHub构建，测试和部署代码。CI（持续集成）由很多操作组成，比如代码合并、运行测试、登录远程服务器，发布到第三方服务等等。GitHub 把这些操作就称为 actions。

很多操作在不同项目里面是类似的，完全可以共享。GitHub 允许开发者把每个操作写成独立的脚本文件，存放到代码仓库，使得其他开发者可以引用。

如果你需要某个 action，不必自己写复杂的脚本，直接引用他人写好的 action 即可，整个持续集成过程，就变成了一个 actions 的组合。这就是 GitHub Actions 最特别的地方。

GitHub 做了一个GitHub Marketplace，可以搜索到他人提交的 actions。另外，还有一个AwesomeActions的仓库，也可以找到不少 action。

> 提高生产力的app合集网站：https://github.com/marketplace

### workflow
- name：name 字段是 work flow 的名称。若忽略此字段，则默认会设置为 work flow 文件名。
- on：on 字段指定 work flow 的触发条件，通常是某些事件，比如示例中的触发事件是 push，即在代码 push 到仓库后被触发。on 字段也可以是事件的数组，多种事件触发，比如在 push 或pull_request 时触发，也可指定运行的分支。
- jobs：jobs 表示要执行的一项或多项任务。每一项任务必须关联一个 ID (job_id)，比如示例中的check-bats-version。job_id 里面的 name 字段是任务的名称。job_id 不能有空格，只能使用数字、英文字母和 - 或_符号，而 name 可以随意，若忽略 name 字段，则默认会设置为 job_id。当有多个任务时，可以指定任务的依赖关系，即运行顺序，否则是同时运行。
- runs-on：runs-on 字段指定任务运行所需要的虚拟服务器环境，是必填字段
- steps：steps 字段指定每个任务的运行步骤，可以包含一个或多个步骤。步骤开头使用 - 符号。每个步骤可以指定以下字段:
  * name：步骤名称。
  * uses：该步骤引用的action或 Docker 镜像。
  * run：该步骤运行的命令（例如bash命令）。
  * env：该步骤所需的环境变量。其中 uses 和 run 是必填字段，每个步骤只能有其一。同样名称也是可以忽略的。

```
name: learn-github-actions
on: [push]
jobs:  
    check-bats-version:    
        runs-on: ubuntu-latest    
        steps:      
            - uses: actions/checkout@v3      
            - uses: actions/setup-node@v3        
                with:          
                    node-version: '14'      
            - run: npm install -g bats      
            - run: bats -v
```