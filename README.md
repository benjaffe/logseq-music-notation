## ABC Notation

Renders ABC Notation as Sheet Music

### Demo

![demo](./demo.gif)

##### Logseq.App

- `registerSlashCommand: (tag: string, action: BlockCommandCallback | Array<SlashCommandAction>) => boolean`
- `onMacroRendererSlotted: IUserSlotHook<{ payload: { arguments: Array<string>, uuid: string, [key: string]: any } }>`

> ⚠️ The current implementation may have performance issues,
> especially when there are too many running timer instances.
> That's because time ticker needs messaging frequently between
> host and plugin sandbox. We are exploring better solutions for
> the rendering of block content partly.

### Running the Sample

> 🏷 Minimal version of App [0.4.6](https://github.com/logseq/logseq/releases/tag/0.4.6) !

- `yarn && yarn build` in terminal to install dependencies.
- `Load unpacked plugin` in Logseq Desktop client.

### License

MIT
