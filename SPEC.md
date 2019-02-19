# Specification

* [Export Path](#export-path)
* [Export Tree](#export-tree)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/npmHack.js](source/npmHack.js)
  - `PATH_NODE_MODULES`, `getPathGlobalNodeModules`, `getPathNpmNodeModules`, `getTryRequireGlobal`, `npmCombo`, `npxLazy`
+ 📄 [source/parseScript.js](source/parseScript.js)
  - `parseCommand`, `parsePackageScript`, `warpBashSubShell`, `wrapJoinBashArgs`

#### Export Tree
- `PATH_NODE_MODULES`, `getPathGlobalNodeModules`, `getPathNpmNodeModules`, `getTryRequireGlobal`, `npmCombo`, `npxLazy`, `parseCommand`, `parsePackageScript`, `warpBashSubShell`, `wrapJoinBashArgs`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env"
>       from JS/JSON file: set to "path/to/config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help
>   --debug --D -D [OPTIONAL] [ARGUMENT=0+]
>       more debug log
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --parse-script --s -s [OPTIONAL] [ARGUMENT=1+]
>       parse and echo: $@=scriptName,...extraArgs
>   --parse-script-list --sl [OPTIONAL] [ARGUMENT=1+]
>       combine multi-script, but no extraArgs: $@=...scriptNameList
>   --run-script --r -r [OPTIONAL] [ARGUMENT=1+]
>       parse and run: $@=scriptName,...extraArgs
>   --run-script-list --rl [OPTIONAL] [ARGUMENT=1+]
>       combine multi-script, but no extraArgs: $@=...scriptNameList
>   --npm-combo --nc [OPTIONAL] [ARGUMENT=1+]
>       useful npm combo
>   --npx-lazy --npx --nl [OPTIONAL] [ARGUMENT=1+]
>       skip npx re-install if package version fit: $@=package@version,...extraArgs
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export NPM_PARSE_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export NPM_PARSE_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export NPM_PARSE_DEBUG="[OPTIONAL] [ARGUMENT=0+]"
>     export NPM_PARSE_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export NPM_PARSE_PARSE_SCRIPT="[OPTIONAL] [ARGUMENT=1+]"
>     export NPM_PARSE_PARSE_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+]"
>     export NPM_PARSE_RUN_SCRIPT="[OPTIONAL] [ARGUMENT=1+]"
>     export NPM_PARSE_RUN_SCRIPT_LIST="[OPTIONAL] [ARGUMENT=1+]"
>     export NPM_PARSE_NPM_COMBO="[OPTIONAL] [ARGUMENT=1+]"
>     export NPM_PARSE_NPX_LAZY="[OPTIONAL] [ARGUMENT=1+]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "debug": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "parseScript": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "parseScriptList": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "runScript": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "runScriptList": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "npmCombo": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "npxLazy": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>   }
> ```
