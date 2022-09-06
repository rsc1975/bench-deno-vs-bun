# Tested in Ubuntu

List of commands to run the test on a clean Ubuntu 22.04

```bash
echo "deb http://packages.azlux.fr/debian/ buster main" | sudo tee /etc/apt/sources.list.d/azlux.list
wget -qO - https://azlux.fr/repo.gpg.key | sudo apt-key add -

sudo apt update && sudo apt upgrade -y
sudo apt -y install git curl unzip oha

curl -fsSL https://deno.land/x/install/install.sh | sh

curl https://bun.sh/install | bash

vi .bashrc
```

Added the following lines to the end:

```txt
export DENO_INSTALL="/home/ubuntu/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

Execute the rest of commands

```bash
. .bashrc

bun upgrade --canary

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs


git clone https://github.com/rsc1975/bench-deno-vs-bun.git
cd bench-deno-vs-bun
bun install

npm run start
npm run show

```