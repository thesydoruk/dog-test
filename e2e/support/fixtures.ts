const image = (slug: string, file: string) => `https://images.dog.ceo/breeds/${slug}/${file}.jpg`;

export const MAIN_DOG = {
  url: image('hound-afghan', 'n02088094_1003'),
  breed: 'Afghan Hound',
};

export const THUMBNAILS = [
  { url: image('retriever-golden', 'n02099601_100'), breed: 'Golden Retriever' },
  { url: image('pug', 'n02110958_1975'), breed: 'Pug' },
  { url: image('husky', 'n02110185_1469'), breed: 'Husky' },
  { url: image('poodle-standard', 'n02113799_2280'), breed: 'Standard Poodle' },
  { url: image('terrier-yorkshire', 'n02094433_1199'), breed: 'Yorkshire Terrier' },
  { url: image('beagle', 'n02088364_11136'), breed: 'Beagle' },
  { url: image('corgi-cardigan', 'n02113186_1030'), breed: 'Cardigan Corgi' },
  { url: image('bulldog-french', 'n02108915_1210'), breed: 'French Bulldog' },
  { url: image('labrador', 'n02099712_3503'), breed: 'Labrador' },
  { url: image('spaniel-cocker-english', 'n02102318_1001'), breed: 'English Cocker Spaniel' },
] as const;

export const THUMBNAIL_BREEDS = THUMBNAILS.map((dog) => dog.breed);

/** A second set, served when a test asks for new dogs. */
export const ALT_THUMBNAILS = [
  { url: image('akita', 'Akita_hiro'), breed: 'Akita' },
  { url: image('boxer', 'n02108089_1'), breed: 'Boxer' },
  { url: image('dalmatian', 'cooper'), breed: 'Dalmatian' },
  { url: image('greyhound-italian', 'n02091032_1'), breed: 'Italian Greyhound' },
  { url: image('malamute', 'n02110063_1'), breed: 'Malamute' },
  { url: image('newfoundland', 'n02111277_1'), breed: 'Newfoundland' },
  { url: image('pomeranian', 'n02112018_1'), breed: 'Pomeranian' },
  { url: image('samoyed', 'n02111889_1'), breed: 'Samoyed' },
  { url: image('setter-irish', 'n02100877_1'), breed: 'Irish Setter' },
  { url: image('whippet', 'n02091134_1'), breed: 'Whippet' },
] as const;

export const byBreed = (breed: string) => {
  const dog = THUMBNAILS.find((thumbnail) => thumbnail.breed === breed);
  if (!dog) throw new Error(`No fixture for ${breed}`);
  return dog;
};
