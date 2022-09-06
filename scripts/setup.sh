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
deno check --unstable h3lp3r-deno/src/index.ts

echo End setup