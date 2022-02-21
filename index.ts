import '@logseq/libs';
import {BlockEntity} from '@logseq/libs/dist/LSPlugin.user';
import abcjs from 'abcjs';
import crypto from 'crypto';
import {v4 as uuid} from 'uuid';

async function main() {
  logseq.Editor.registerSlashCommand('ABC Music Notation', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :music-abc_${uuid()}}}`,
    );

    const currBlock = await logseq.Editor.getCurrentBlock();
    await logseq.Editor.insertBlock(currBlock.uuid, '```music-abc\n\n```', {
      sibling: false,
      before: false,
    });
  });

  logseq.App.onMacroRendererSlotted(async (event) => {
    try {
      const {slot, payload} = event;
      const [type] = payload.arguments;

      // only handle music notation renderers
      if (!type.startsWith(':music-abc_')) return;

      const renderBlockId = payload.uuid;
      const renderBlock = await logseq.Editor.getBlock(renderBlockId);
      const renderBlockWithChildren = await logseq.Editor.getBlock(
        renderBlockId,
        {
          includeChildren: true,
        },
      );

      const dataBlockId = (renderBlockWithChildren.children[0] as BlockEntity)
        ?.uuid;
      const dataBlock = await logseq.Editor.getBlock(dataBlockId);
      const content = dataBlock.content.match(/```music-abc(.|\n)*?```/gm);

      // isolate the markup
      const abcText = content[0].replace('```music-abc', '').replace('```', '');

      abcjs.renderAbc('app', abcText);
      const abcSvg = document.getElementById('app').innerHTML;

      const hash = crypto
        .createHash('md5')
        .update(abcText || '')
        .digest('hex');
      logseq.provideUI({
        key: `music-abc-${hash}`,
        slot,
        reset: true,
        template: `<div style="background:white;">${abcSvg}</div>`,
      });

      // tell the renderer block to update, even though we aren't
      // changing the contents. This causes it to rerender.
      const rendererContent = renderBlock?.content;
      await logseq.Editor.updateBlock(renderBlockId, rendererContent);
    } catch (err) {
      console.error(`Music notation rendering failed`, err);
    }
  });
}

// bootstrap
logseq.ready(main).catch(console.error);
