// Browser entry for the engine (Career Ready, Nov 19 2026): registers the bundled OFL fonts under the
// face names design.cjs uses, installs the browser runtime, and draws one frame of a lesson.
import design from './design.cjs';
import recipes from './recipes.cjs';

const COURSE = { width: 1280, height: 720 };
let ready = null;

export function loadEngine() {
  if (ready) return ready;
  ready = (async () => {
    design.installBrowserRuntime();
    const faces = Object.values(design.FACES);
    await Promise.all(
      faces.map(async (face) => {
        const f = new FontFace(face, `url(/fonts/${face}.ttf)`);
        await f.load();
        document.fonts.add(f);
      }),
    );
    await document.fonts.ready;
    return true;
  })();
  return ready;
}

// content: the lesson as written (stable object); timed: the same lesson with start/end per scene.
export function drawFrame(g, content, timed, cast, t) {
  const world = recipes.buildWorld(content, cast);
  const out = world.draw(g, timed, t, COURSE);
  return out;
}

export const MIN_SPAN = recipes.MIN_SPAN;
export const GLYPHS = recipes.GLYPHS;
export { COURSE };
