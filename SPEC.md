# Specification

* [Export Path](#export-path)
* [Export Tree](#export-tree)
* [Bin Option Format](#bin-option-format)

#### Export Path
+ 📄 [source/parseScript.js](source/parseScript.js)
  - `parseCommand`, `parsePackageScript`, `warpBashSubShell`, `wrapJoinBashArgs`

#### Export Tree
- `parseCommand`, `parsePackageScript`, `warpBashSubShell`, `wrapJoinBashArgs`

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config -c [OPTIONAL] [ARGUMENT=1]
>       # from JSON: set to 'path/to/config.json'
>       # from ENV: set to 'env'
>   --help -h [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --version -v [OPTIONAL] [ARGUMENT=0+]
>       set to enable
>   --debug -D [OPTIONAL] [ARGUMENT=0+]
>       more debug log
>   --parse-script --s -s [OPTIONAL] [ARGUMENT=1+]
>   --run-script --r -r [OPTIONAL] [ARGUMENT=1+]
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export NPM_PARSE_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export NPM_PARSE_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export NPM_PARSE_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export NPM_PARSE_DEBUG="[OPTIONAL] [ARGUMENT=0+]"
>     export NPM_PARSE_PARSE_SCRIPT="[OPTIONAL] [ARGUMENT=1+]"
>     export NPM_PARSE_RUN_SCRIPT="[OPTIONAL] [ARGUMENT=1+]"
>   "
> JSON Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "debug": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "parseScript": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>     "runScript": [ "[OPTIONAL] [ARGUMENT=1+]" ],
>   }
> ```
