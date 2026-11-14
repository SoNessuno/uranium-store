import { startBackground } from '../effects/background.js';
import { initLayout } from '../components/layout.js';
import { mountShowcase } from '../components/showcase.js';
import { $ } from '../core/dom.js';

startBackground();
const me = await initLayout();
await mountShowcase($('#grid'), $('#empty'), me, 3);
