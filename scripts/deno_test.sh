echo Deno test load init

QUIET=true PORT=4004 deno run -A --unstable h3lp3r-deno/src/index.ts &
sleep 1

URL_BASE="http://localhost:4004" PLATFORM="deno" VERSION="unstable $(deno --version)" deno run -A --unstable run_test.ts

killall deno

echo Deno test load end
