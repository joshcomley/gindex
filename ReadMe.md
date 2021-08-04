`Gindex` maintains your `index.ts` and `public_api.ts` files for you.

To use:

`yarn add gindex -D`

Or:

`npm i gindex --saveDev`

Then call:

`node node_modules/gindex/bin/gindex [folder]`

In any given folder you can add an `.exportrc.json` file which supports the following properties:

| Property    | Type | Description |
| ----------- | ---| ----------- |
| from        | string | Where to export this folder from.<br/>If the folder is nested deep but you'd like to export it as `yourlib/xyz`, then you would set the `from` to `xyz`      |
| exclude     | string[] | List of files or folders to ignore        |