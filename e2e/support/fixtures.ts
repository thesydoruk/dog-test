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

export const byBreed = (breed: string) => {
  const dog = THUMBNAILS.find((thumbnail) => thumbnail.breed === breed);
  if (!dog) throw new Error(`No fixture for ${breed}`);
  return dog;
};
