import '@logseq/libs';
import abcjs from 'abcjs';

const uniqueIdentifier = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '');

const getHash = (s) =>
  s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
/**
 * main entry
 */
async function main() {
  logseq.App.showMsg('hello, abc notation!');

  // logseq.provideStyle(`
  //   .abc-notation-btn {
  //      border: 1px solid var(--ls-border-color);
  //      white-space: initial;
  //      padding: 2px 4px;
  //      border-radius: 4px;
  //      user-select: none;
  //      cursor: default;
  //      display: flex;
  //      align-content: center;
  //   }

  //   .abc-notation-btn.is-start:hover {
  //     opacity: .8;
  //   }

  //   .abc-notation-btn.is-start:active {
  //     opacity: .6;
  //   }

  //   .abc-notation-btn.is-start {
  //     padding: 3px 6px;
  //     cursor: pointer;
  //   }

  //   .abc-notation-btn.is-pending {
  //     padding-left: 6px;
  //     width: 84px;
  //     background-color: #f6dbdb;
  //     border-color: #edbdbd;
  //     color: #cd3838;
  //   }

  //   .abc-notation-btn.is-done {
  //     width: auto;
  //     background-color: #defcf0;
  //     border-color: #9ddbc7;
  //     color: #0F9960;
  //   }
  // `);

  // entries
  logseq.Editor.registerSlashCommand('ABC Music Notation', async () => {
    console.log(`~~registered`);
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :music-abc_${uniqueIdentifier()}}}`,
    );

    const currBlock = await logseq.Editor.getCurrentBlock();

    await logseq.Editor.insertBlock(
      currBlock.uuid,
      `\`\`\`music-abc

\`\`\``,
      {sibling: false, before: false},
    );
  });

  console.log(`~~about to register macro`);

  const renderABCThing = async (type, payload, uuid, slot) => {
    console.log(`~~renderABCThing, `, type, uuid, payload);
    // await logseq.Editor.editBlock(payload.uuid);
    // await logseq.Editor.exitEditingMode();

    const abcBlock = await logseq.Editor.getBlock(uuid);
    const matchData = abcBlock.content.match(/```music-abc(.|\n)*?```/gm);

    let toDecode = matchData[0];
    toDecode = toDecode.replace('```music-abc', '').replace('```', '');

    const text = toDecode;

    const renderBlock = async (html: string = '') => {
      await logseq.Editor.updateBlock(
        payload.uuid,
        `<div style="background: white;">${html}</div>
{{renderer ${type}}}`,
      );
    };
    requestAnimationFrame(() => {
      abcjs.renderAbc('app', text);

      // console.log(`~~abcBlock`, abcBlock, text);

      // console.log(`~~renderblock`, type, uuid, payload);
      // const elem = document.createElement('div');
      // const tempRendererId = `rendererFor${type}`;
      // elem.id = tempRendererId;
      // abcjs.renderAbc('root', text);
      // document.getElementById('root').appendChild(elem);
      // elem.style.position = 'absolute';
      // elem.style.zIndex = '1000';
      // elem.style.top = '0';
      // elem.style.width = '400px';
      const html = document.getElementById('app').innerHTML;
      console.log('~~~~html', html.length);
      renderBlock(html);
    });
  };

  logseq.App.onMacroRendererSlotted(async (opts) => {
    const {slot, payload} = opts;
    console.log(`~~opts`, opts);

    const [type, text] = payload.arguments;
    console.log(`~~hi, onMacroRendererSlotted`, type, slot, payload);
    // const id = type.split('_')[1]?.trim();
    // const abcId = `abc_${id}`;

    if (!type.startsWith(':music-abc_')) return;

    const dataBlock = await logseq.Editor.getBlock(payload.uuid, {
      includeChildren: true,
    });

    console.log(`~~`, dataBlock);
    console.log(`~~child`, dataBlock.children[0]);
    console.log(`~~type`, type);
    console.log(`~~payload`, payload);
    console.log(`~~dataBlock.children[0].uuid['uuid']`, dataBlock);
    await renderABCThing(type, payload, dataBlock.children[0]?.uuid, slot);

    console.log(`~~slot id`, slot, text);

    // return logseq.provideUI({
    //   key: `music-abc-${getHash(text)}`,
    //   slot,
    //   reset: true,
    //   template: `<div style="width: 100px;height:100px;background:red;">${text}</div>`,
    // });

    // logseq.provideStyle(`
    //   .renderBtn {
    //     border: 1px solid black;
    //     border-radius: 8px;
    //     padding: 3px;
    //     font-size: 80%;
    //     background-color: white;
    //     color: black;
    //   }
    //   .renderBtn:hover {
    //     background-color: black;
    //     color: white;
    //   }
    // `);

    // logseq.App.onMacroRendererSlotted(({slot, payload}) => {
    //   console.log(`~~ `, slot, payload);
    //   const [type, text] = payload.arguments;
    //   if (!type?.startsWith('#+BEGIN_ABC\n')) return;
    //   console.log(`~~ onMacroRendererSlotted`, payload.arguments);

    //   if (text?.trim()) {
    //     return logseq.provideUI({
    //       key: `music-abc-${getHash(text)}`,
    //       slot,
    //       reset: true,
    //       template: `
    //         <div
    //         style="min-width: 10px; min-height: 10px; background: red;"
    //         class="abc-notation-btn"
    //         data-slot-id="${slot}"
    //         data-block-uuid="${payload.uuid}">
    //         ${abcjs.renderAbc(text)}
    //         </div>
    //       `,
    //     });
    //   }

    // reset slot ui
    // renderABC({slotId: slot, text});
  });
}

// bootstrap
logseq.ready(main).catch(console.error);
