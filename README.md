# npm-parse

[![i:npm]][l:npm]
[![i:size]][l:size]
[![i:lint]][l:lint]

Reduce npm bloat

[i:npm]: https://img.shields.io/npm/v/npm-parse.svg
[l:npm]: https://www.npmjs.com/package/npm-parse
[i:size]: https://packagephobia.now.sh/badge?p=npm-parse
[l:size]: https://packagephobia.now.sh/result?p=npm-parse
[i:lint]: https://img.shields.io/badge/code_style-standard-yellow.svg
[l:lint]: https://standardjs.com

[//]: # (NON_PACKAGE_CONTENT)

- 📁 [source/](source/)
  - main source code, in output package will be: `npm-parse/library`
- 📄 [SPEC.md](SPEC.md)
  - list of all directly accessible codes, sort of an API lockfile


#### Usage

in the directory with `package.json` file

parse the script then run with `eval`, the most common usage:
```bash
eval "$(npx -q npm-parse -s "some-package-json-script-name")"
```

parse the script then run with `bash`, but no tty input (interact program like `top` will fail):
```bash
npx -q npm-parse -s "some-package-json-script-name" | bash -
```

check what the parsed script look like, with some debug log:
```bash
npx -q npm-parse -D -s "some-package-json-script-name"
```


#### Why

using `scripts` in `package.json` is convenient, but there's bloat

try `npm run layer-0` with this `package.json`:
```json
{
  "private": true,
  "name": "bloat-sample",
  "scripts": {
    "layer-0": "npm run layer-1",
    "layer-1": "npm run layer-2",
    "layer-2": "npm run layer-3",
    "layer-3": "npm run layer-4",
    "layer-4": "npm run layer-5",
    "layer-5": "npm run layer-6",
    "layer-6": "top",
    
    "layer-y0": "yarn run layer-y1",
    "layer-y1": "yarn run layer-y2",
    "layer-y2": "yarn run layer-y3",
    "layer-y3": "yarn run layer-y4",
    "layer-y4": "yarn run layer-y5",
    "layer-y5": "yarn run layer-y6",
    "layer-y6": "top",
    
    "layer-x0": "npm run layer-x1",
    "layer-x1": "yarn run layer-x2",
    "layer-x2": "npm run layer-x3",
    "layer-x3": "yarn run layer-x4",
    "layer-x4": "npm run layer-x5",
    "layer-x5": "yarn run layer-x6",
    "layer-x6": "npx npm-parse -h",
    
    "layer-combo": "npm run layer-0 && npm run layer-y0 && npm run layer-x0"
  }
}
```

do not exit the `top`, check the memory usage with `ps`, 
or best with `htop` (type `t` for tree mode), you'll see something like these: (npm@6.4.1/ubuntu@18.04.1)
```
 VIRT   RES   SHR S CPU% MEM%   TIME+  Command
 101M  7028  6012 S  0.0  1.4  0:00.04 │  └─ sshd: root@pts/0
22784  5200  3432 S  0.0  1.1  0:00.03 │     └─ -bash
 780M 40148 25520 S  0.0  8.1  0:00.38 │        └─ npm
 4632   872   800 S  0.0  0.2  0:00.00 │           ├─ sh -c npm run layer-1
 780M 40356 25776 S  0.0  8.2  0:00.30 │           │  └─ npm
 4632   788   716 S  0.0  0.2  0:00.00 │           │     ├─ sh -c npm run layer-2
 779M 40368 25836 S  0.0  8.2  0:00.30 │           │     │  └─ npm
 4632   872   800 S  0.0  0.2  0:00.00 │           │     │     ├─ sh -c npm run layer-3
 780M 40416 25764 S  0.0  8.2  0:00.30 │           │     │     │  └─ npm
 4632   832   760 S  0.0  0.2  0:00.00 │           │     │     │     ├─ sh -c npm run layer-4
 780M 40408 25752 S  0.0  8.2  0:00.30 │           │     │     │     │  └─ npm
 4632   832   760 S  0.0  0.2  0:00.00 │           │     │     │     │     ├─ sh -c npm run layer-5
 780M 40484 25804 S  0.0  8.2  0:00.31 │           │     │     │     │     │  └─ npm
 4632   868   796 S  0.0  0.2  0:00.00 │           │     │     │     │     │     ├─ sh -c npm run laye
 780M 40476 25796 S  0.0  8.2  0:00.30 │           │     │     │     │     │     │  └─ npm
 4632   780   708 S  0.0  0.2  0:00.00 │           │     │     │     │     │     │     ├─ sh -c top
41780  3860  3196 S  0.0  0.8  0:00.07 │           │     │     │     │     │     │     │  └─ top
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     ├─ npm
 780M 40476 25796 S  0.0  8.2  0:00.00 │           │     │     │     │     │     │     └─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     ├─ npm
 780M 40484 25804 S  0.0  8.2  0:00.00 │           │     │     │     │     │     └─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     ├─ npm
 780M 40408 25752 S  0.0  8.2  0:00.00 │           │     │     │     │     └─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     ├─ npm
 780M 40416 25764 S  0.0  8.2  0:00.00 │           │     │     │     └─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     ├─ npm
 779M 40368 25836 S  0.0  8.2  0:00.00 │           │     │     └─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     ├─ npm
 780M 40356 25776 S  0.0  8.2  0:00.00 │           │     └─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           ├─ npm
 780M 40148 25520 S  0.0  8.1  0:00.00 │           └─ npm
```

we have 7 `npm` wrapper for the `top` command in memory, 
the wrapper took about `120MB` of memory, 
while `top` itself use `4MB` (check the `RES` column)

and the shell (both `bash` and `sh`) use far less memory also 
(each took `4.5MB` and `0.8MB`)

try do the test with `yarn run layer-y0`, 
you'll get even bigger wrapper memory for about `260MB`

--- --- ---

but, 
directly run node script with `node`, or with `npx`, 
or global install and run do not have this big wrapper issue

for develop or package building, some extra memory is fine, 
even the occasional `npm upgrade box` is bearable

but in production, less dead memory is always good

--- --- ---

for above example, `npx npm-parse -s layer-0` will get you: 
```bash
npm --no-update-notifier run "layer-6"
```

and, `npx npm-parse -s layer-x0` will get you: 
```bash
npx npm-parse -h
```

better yet, `npx npm-parse -s layer-combo` will get you: 
```bash
(
  npm --no-update-notifier run "layer-6"
  npm --no-update-notifier run "layer-y6"
  npx npm-parse -h
)
```
