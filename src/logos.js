// Logos are the companies' own brand assets, taken from their websites and
// optimised. SVGs are inlined as text, the two raster logos as bytes; both are
// served from /l/<file> with a long cache.
import hantke from './assets/hantke.svg';
import brink from './assets/brink.svg';
import seehafer from './assets/seehafer.svg';
import wernerBau from './assets/werner-bau.svg';
import wernerGeruestbau from './assets/werner-geruestbau.svg';
import mehlig from './assets/mehlig.svg';
import groundpassion from './assets/groundpassion.svg';
import gruppenwerk from './assets/gruppenwerk.svg';
import bsi from './assets/bsi.png';
import networking from './assets/networking.png';

const svg = (body) => ({ type: 'image/svg+xml; charset=utf-8', body });
const png = (body) => ({ type: 'image/png', body });

export const logos = {
  'hantke.svg': svg(hantke),
  'brink.svg': svg(brink),
  'seehafer.svg': svg(seehafer),
  'werner-bau.svg': svg(wernerBau),
  'werner-geruestbau.svg': svg(wernerGeruestbau),
  'mehlig.svg': svg(mehlig),
  'groundpassion.svg': svg(groundpassion),
  'gruppenwerk.svg': svg(gruppenwerk),
  'bsi.png': png(bsi),
  'networking.png': png(networking),
};
