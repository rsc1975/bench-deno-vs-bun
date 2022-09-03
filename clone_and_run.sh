#!/bin/bash

echo Clean up...

rm -f public/*.json
rm -rf h3lp3r-bun h3lp3r-deno
killall deno bun

#Clone the 2 different branches (for each platform) of h3lp3r-api:

echo Cloning git repos...
git clone -b bun --single-branch https://github.com/rsc1975/h3lp3r-api.git h3lp3r-bun
git clone -b deno --single-branch https://github.com/rsc1975/h3lp3r-api.git h3lp3r-deno

echo Deno test load...
QUIET=true PORT=4004 deno run -A h3lp3r-deno/src/index.ts &

URL_BASE="http://localhost:4004" PLATFORM="deno" VERSION="$(deno --version)" node run_test.mjs

killall deno

echo Bun test load...
QUIET=true PORT=3003 bun run h3lp3r-bun/src/index.ts &

URL_BASE="http://localhost:3003" PLATFORM="bun" VERSION="$(bun --version)" node run_test.mjs

killall bun

echo End.