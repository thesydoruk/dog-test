import type { RawBreedList } from '@/domain/breedCatalog';
import { createDog } from '@/domain/dog';

const image = (slug: string, file: string) => `https://images.dog.ceo/breeds/${slug}/${file}.jpg`;

export const MAIN_DOG_URL = image('hound-afghan', 'n02088094_1003');

export const THUMBNAIL_URLS = [
  image('retriever-golden', 'n02099601_100'),
  image('pug', 'n02110958_1975'),
  image('husky', 'n02110185_1469'),
  image('poodle-standard', 'n02113799_2280'),
  image('terrier-yorkshire', 'n02094433_1199'),
  image('beagle', 'n02088364_11136'),
  image('corgi-cardigan', 'n02113186_1030'),
  image('bulldog-french', 'n02108915_1210'),
  image('labrador', 'n02099712_3503'),
  image('shiba', 'shiba-1'),
];

export const mainDog = createDog(MAIN_DOG_URL);
export const thumbnailDogs = THUMBNAIL_URLS.map(createDog);

/** A slice of `/breeds/list/all` in the API's raw shape. */
export const RAW_BREED_LIST: RawBreedList = {
  beagle: [],
  bulldog: ['boston', 'english', 'french'],
  hound: ['afghan', 'basset', 'blood'],
  pug: [],
};

/** What the `/breed/hound/afghan/images` family returns for the fixture breed. */
export const AFGHAN_HOUND_URLS = [
  MAIN_DOG_URL,
  image('hound-afghan', 'n02088094_1007'),
  image('hound-afghan', 'n02088094_1023'),
];
