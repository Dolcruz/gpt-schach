import { createAvatar } from '@dicebear/core';
import { avataaars, bottts } from '@dicebear/collection';

type Opts = Record<string, unknown>;

const base: Opts = {
  accessoriesProbability: 0,
  facialHairProbability: 0,
  eyes: ['default'],
  eyebrows: ['defaultNatural'],
  mouth: ['smile'],
};

/** Gezeichnete Porträts pro Bot – Aussehen passt zur Persönlichkeit */
const PEOPLE: Record<string, Opts & { bg: string }> = {
  kiki: { bg: 'f3d27a', top: ['bun'], hairColor: ['c93305'], skinColor: ['ffdbb4'], clothing: ['overall'], clothesColor: ['ff5c5c'], eyes: ['happy'], eyebrows: ['raisedExcitedNatural'], mouth: ['twinkle'] },
  heinz: {
    bg: 'c9b79c', top: ['sides'], hairColor: ['e8e1e1'], skinColor: ['edb98a'], clothing: ['collarAndSweater'], clothesColor: ['3c4f5c'],
    accessories: ['round'], accessoriesProbability: 100, facialHair: ['moustacheMagnum'], facialHairProbability: 100, facialHairColor: ['e8e1e1'], eyes: ['squint'], mouth: ['serious'],
  },
  lena: { bg: 'a9cbe8', top: ['straight01'], hairColor: ['b58143'], skinColor: ['ffdbb4'], clothing: ['hoodie'], clothesColor: ['5199e4'], mouth: ['smile'] },
  bruno: {
    bg: 'e39a8f', top: ['shortFlat'], hairColor: ['2c1b18'], skinColor: ['d08b5b'], clothing: ['shirtCrewNeck'], clothesColor: ['ff5c5c'],
    facialHair: ['beardMajestic'], facialHairProbability: 100, facialHairColor: ['2c1b18'], eyebrows: ['angryNatural'], eyes: ['squint'], mouth: ['screamOpen'],
  },
  gustav: {
    bg: 'b5d39a', top: ['theCaesarAndSidePart'], hairColor: ['724133'], skinColor: ['edb98a'], clothing: ['blazerAndShirt'], clothesColor: ['25557c'],
    facialHair: ['moustacheFancy'], facialHairProbability: 100, facialHairColor: ['724133'], eyes: ['wink'], mouth: ['tongue'],
  },
  weiss: {
    bg: 'c4bce0', top: ['shortWaved'], hairColor: ['ecdcbf'], skinColor: ['ffdbb4'], clothing: ['blazerAndSweater'], clothesColor: ['929598'],
    accessories: ['prescription02'], accessoriesProbability: 100, facialHair: ['beardMedium'], facialHairProbability: 100, facialHairColor: ['ecdcbf'], mouth: ['serious'], eyebrows: ['flatNatural'],
  },
  zoe: {
    bg: 'efb0cd', top: ['shavedSides'], hairColor: ['f59797'], skinColor: ['ffdbb4'], clothing: ['graphicShirt'], clothesColor: ['262e33'],
    accessories: ['sunglasses'], accessoriesProbability: 100, mouth: ['tongue'], eyebrows: ['upDownNatural'],
  },
  natascha: { bg: 'f0ae84', top: ['longButNotTooLong'], hairColor: ['c93305'], skinColor: ['edb98a'], clothing: ['blazerAndShirt'], clothesColor: ['262e33'], eyebrows: ['angryNatural'], mouth: ['smile'] },
  bunker: {
    bg: '9fb0bf', top: ['theCaesar'], hairColor: ['4a312c'], skinColor: ['ae5d29'], clothing: ['shirtVNeck'], clothesColor: ['3c4f5c'],
    facialHair: ['beardLight'], facialHairProbability: 100, facialHairColor: ['4a312c'], eyebrows: ['flatNatural'], mouth: ['serious'],
  },
  titan: {
    bg: '8f8a83', top: ['shortRound'], hairColor: ['2c1b18'], skinColor: ['d08b5b'], clothing: ['blazerAndSweater'], clothesColor: ['262e33'],
    accessories: ['wayfarers'], accessoriesProbability: 100, eyebrows: ['defaultNatural'], mouth: ['serious'],
  },
  mia: { bg: 'f6c1dc', top: ['curvy'], hairColor: ['d6b370'], skinColor: ['ffdbb4'], clothing: ['shirtScoopNeck'], clothesColor: ['ff488e'], eyes: ['happy'], eyebrows: ['raisedExcitedNatural'], mouth: ['smile'] },
  tim: { bg: 'b6dcf5', top: ['shortCurly'], hairColor: ['b58143'], skinColor: ['ffdbb4'], clothing: ['graphicShirt'], clothesColor: ['65c9ff'], eyes: ['wink'], eyebrows: ['upDownNatural'], mouth: ['tongue'] },
  gerda: {
    bg: 'd9c4e3', top: ['bun'], hairColor: ['e8e1e1'], skinColor: ['edb98a'], clothing: ['collarAndSweater'], clothesColor: ['ffafb9'],
    accessories: ['prescription01'], accessoriesProbability: 100, eyes: ['happy'], mouth: ['smile'],
  },
  kalle: { bg: 'f5cf8f', top: ['shaggyMullet'], hairColor: ['a55728'], skinColor: ['edb98a'], clothing: ['hoodie'], clothesColor: ['ffffb1'], eyes: ['surprised'], eyebrows: ['raisedExcitedNatural'], mouth: ['disbelief'] },
  sven: {
    bg: 'b3d7a3', top: ['shortFlat'], hairColor: ['d6b370'], skinColor: ['ffdbb4'], clothing: ['shirtCrewNeck'], clothesColor: ['a7ffc4'],
    facialHair: ['beardLight'], facialHairProbability: 100, facialHairColor: ['d6b370'], eyebrows: ['angryNatural'], mouth: ['serious'],
  },
  paula: { bg: 'e3c29b', top: ['frida'], hairColor: ['724133'], skinColor: ['d08b5b'], clothing: ['overall'], clothesColor: ['5199e4'], eyes: ['squint'], mouth: ['twinkle'] },
  gregor: {
    bg: 'efab8f', top: ['theCaesarAndSidePart'], hairColor: ['2c1b18'], skinColor: ['edb98a'], clothing: ['blazerAndShirt'], clothesColor: ['ff5c5c'],
    facialHair: ['moustacheFancy'], facialHairProbability: 100, facialHairColor: ['2c1b18'], eyes: ['wink'], eyebrows: ['raisedExcitedNatural'], mouth: ['smile'],
  },
  ingrid: {
    bg: 'a9c4dc', top: ['straightAndStrand'], hairColor: ['ecdcbf'], skinColor: ['ffdbb4'], clothing: ['blazerAndSweater'], clothesColor: ['25557c'],
    accessories: ['round'], accessoriesProbability: 100, eyebrows: ['flatNatural'], mouth: ['serious'],
  },
  kobra: {
    bg: '89a885', top: ['dreads01'], hairColor: ['2c1b18'], skinColor: ['614335'], clothing: ['hoodie'], clothesColor: ['262e33'],
    accessories: ['sunglasses'], accessoriesProbability: 100, eyebrows: ['flatNatural'], mouth: ['serious'],
  },
  coach: {
    bg: 'a3c97a', top: ['shortCurly'], hairColor: ['4a312c'], skinColor: ['edb98a'], clothing: ['blazerAndShirt'], clothesColor: ['25557c'],
    accessories: ['prescription01'], accessoriesProbability: 100, facialHair: ['beardLight'], facialHairProbability: 100, facialHairColor: ['4a312c'], mouth: ['smile'], eyebrows: ['defaultNatural'],
  },
};

const cache = new Map<string, string>();

export function avatarFor(id: string): string {
  let uri = cache.get(id);
  if (uri) return uri;
  if (id === 'max') {
    uri = createAvatar(bottts, { seed: 'stockfish-max', backgroundColor: ['5b7fa6'], baseColor: ['cfd8dc'] }).toDataUri();
  } else {
    const { bg, ...o } = PEOPLE[id] ?? PEOPLE.lena;
    uri = createAvatar(avataaars, { ...base, ...o, seed: id, backgroundColor: [bg as string], backgroundType: ['solid'] } as any).toDataUri();
  }
  cache.set(id, uri);
  return uri;
}
