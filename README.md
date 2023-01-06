# shadow-storage

Repo for Storage xNFT which runs within backpack and is a UI for interacting with GenesysGo's Shadow-Drive - a decentralized storage network.

## Developing
Steps for developing:

### Set backpack dev environment up
see instructions @ https://github.com/coral-xyz/backpack

### Install

install dependencies.

```
yarn
```

patch shadow-drive package. There's a bug in the shadow-drive code that needs to be patched.

```
npx patch-package --patch-dir ./patches
```
### Run the dev server

Then, run the dev server with hot reloading

```
yarn dev
```

### Open the Simulator in Backpack

Now that you have your xNFT dev server running, open it in the Backpack simulator to see it run.

That's it!
