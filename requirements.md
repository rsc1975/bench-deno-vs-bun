# Tested in Ubuntu

List of commands to run the test on a clean Ubuntu 22.04

```bash

sudo apt update && sudo apt upgrade -y
sudo apt -y install git curl unzip wget psmisc

wget https://github.com/hatoo/oha/releases/download/v0.5.4/oha-linux-amd64 -O oha && chmod +x oha && ./oha --version
sudo mv ./oha /usr/local/bin/

curl -fsSL https://deno.land/x/install/install.sh | sh

curl https://bun.sh/install | bash

echo -e '
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

' >> .bashrc

. .bashrc

bun upgrade --canary

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs


git clone https://github.com/rsc1975/bench-deno-vs-bun.git
cd bench-deno-vs-bun && bun install

npm run start
npm run show

```