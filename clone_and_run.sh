#!/bin/bash

echo Clean up...

rm -f public/*.json
rm -rf h3lp3r-bun h3lp3r-deno
killall deno bun

#Clone the 2 different branches (for each platform) of h3lp3r-api:

echo Cloning git repos...
git clone -b bun --single-branch https://github.com/rsc1975/h3lp3r-api.git h3lp3r-bun
cd h3lp3r-bun && bun install
cd ..
git clone -b deno --single-branch https://github.com/rsc1975/h3lp3r-api.git h3lp3r-deno
deno check h3lp3r-deno/src/index.ts


echo Deno test load init
QUIET=true PORT=4004 deno run -A --unstable h3lp3r-deno/src/index.ts &

URL_BASE="http://localhost:4004" PLATFORM="deno" VERSION="unstable $(deno --version)" node run_test.mjs

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