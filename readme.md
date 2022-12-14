# Bechmark Bun vs Deno

### Latest test results: https://deno-vs-bun.fly.dev/ 

This repo tries to compare the performance of two modern Javascript runtimes like Deno and Bun as a platform for a REST API app.

## Requirements

If you want to launch the test yourself, you'll need pre-installed in your machine:

* Linux (you can use WSL inside Windows or any VM) 
* [GIT](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Deno CLI](https://deno.land/manual@v1.25.1/getting_started/installation)
* [Bun  CLI](https://bun.sh/)
* [Node runtime](https://nodejs.org/en/) (Just to launch the test and prepare resulting data, `autocannon` only supports `node`)

See [requirements.md](./requirements.md) file for details about how to install everything.

We are going to use a third party app [h3lp3r-api](https://github.com/rsc1975/h3lp3r-api) as the subject in the load test, the repo has 2 branch `deno` and `bun` with an equivalent implementation for each platform, both implementations use [Hono framework](https://honojs.dev/).

To launch the test we need a lib like [oha](https://github.com/hatoo/oha), this tool will generate the json data that our script will agregate and prepare to show it in a friendly chart. 

## Getting started

Execute bash script: `clone_and_run.sh` or 
```bash
npm run start
```

Launch a http-server on `./public` folder with:
```bash
npm run show
```

Access with a browser to the url: http://127.0.0.1:8080/

## Script code


```bash
# clone_and_run.sh
echo Clean up...

rm -f public/*.json
rm -rf h3lp3r-bun h3lp3r-deno
killall deno bun

#Clone the 2 different branches (for each platform) of h3lp3r-api:

echo Cloning git repos...
git clone -b bun --single-branch https://github.com/rsc1975/h3lp3r-api.git h3lp3r-bun
git clone -b deno --single-branch https://github.com/rsc1975/h3lp3r-api.git h3lp3r-deno

echo Deno test load init
QUIET=true PORT=4004 deno run -A --unstable h3lp3r-deno/src/index.ts &

URL_BASE="http://localhost:4004" PLATFORM="deno" VERSION="$(deno --version)" node run_test.mjs

killall deno

echo Deno test load end

echo Waiting 10 seconds to launch Bun test...
sleep 10

echo Bun test load init
QUIET=true PORT=3003 bun run h3lp3r-bun/src/index.ts &

URL_BASE="http://localhost:3003" PLATFORM="bun" VERSION="$(bun --version)" node run_test.mjs

killall bun

echo Bun test load end
echo End.
```

