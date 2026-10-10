// High-definition photorealistic human character textures
import saraFace from '../../assets/images/sara_real_face_1791601156419.jpg';
import sakuraFace from '../../assets/images/sakura_real_face_1791601175584.jpg';
import seraphinaFace from '../../assets/images/seraphina_real_face_1791601194088.jpg';
import midnightFace from '../../assets/images/midnight_real_face_1791601217394.jpg';
import rubyFace from '../../assets/images/ruby_real_face_1791601240001.jpg';

export interface AvatarMeta {
  id: string;
  name: string;
  bengaliName: string;
  tag: string;
  description: string;
  imageUrl: string;
  eyeColor: string;
  skinTone: string;
  hairColor: string;
  accentColor: string;
}

export const REAL_HUMAN_AVATARS: Record<string, AvatarMeta> = {
  'sara-cyberpunk': {
    id: 'sara-cyberpunk',
    name: 'Sara (সারা)',
    bengaliName: 'সারা',
    tag: 'Realistic Companion',
    description: 'Beautiful Bengali companion with warm kind eyes, radiant smile, and loving heart.',
    imageUrl: saraFace,
    eyeColor: '#78350f',
    skinTone: '#fed7aa',
    hairColor: '#18181b',
    accentColor: '#ec4899',
  },
  'avatar-4': {
    id: 'avatar-4',
    name: 'Sakura / Zara (সাকুরা)',
    bengaliName: 'সাকুরা',
    tag: 'Graceful Elegance',
    description: 'Graceful, affectionate companion with soft gentle features and silk attire.',
    imageUrl: sakuraFace,
    eyeColor: '#451a03',
    skinTone: '#ffedd5',
    hairColor: '#1c1917',
    accentColor: '#ef4444',
  },
  'avatar-2': {
    id: 'avatar-2',
    name: 'Seraphina (সেরাফিনা)',
    bengaliName: 'সেরাফিনা',
    tag: 'Warm & Cozy',
    description: 'Warm, natural companion with hazel eyes, gentle smile, and comfort.',
    imageUrl: seraphinaFace,
    eyeColor: '#0284c7',
    skinTone: '#fef3c7',
    hairColor: '#451a03',
    accentColor: '#38bdf8',
  },
  'kafka-midnight': {
    id: 'kafka-midnight',
    name: 'Midnight (মিডনাইট)',
    bengaliName: 'মিডনাইট',
    tag: 'Confident Chic',
    description: 'Confident, stylish woman with captivating gaze and modern charm.',
    imageUrl: midnightFace,
    eyeColor: '#312e81',
    skinTone: '#fae8ff',
    hairColor: '#4c1d95',
    accentColor: '#a855f7',
  },
  'ruby-royal': {
    id: 'ruby-royal',
    name: 'Ruby (রুবি)',
    bengaliName: 'রুবি',
    tag: 'Royal Glamour',
    description: 'Radiant, glamorous woman with striking auburn hair and radiant smile.',
    imageUrl: rubyFace,
    eyeColor: '#065f46',
    skinTone: '#fed7aa',
    hairColor: '#991b1b',
    accentColor: '#f59e0b',
  },
};

export const getAvatarMeta = (id: string): AvatarMeta => {
  if (REAL_HUMAN_AVATARS[id]) return REAL_HUMAN_AVATARS[id];
  if (id === 'zara-kimono') return REAL_HUMAN_AVATARS['avatar-4'];
  if (id === 'seraphina-casual') return REAL_HUMAN_AVATARS['avatar-2'];
  return REAL_HUMAN_AVATARS['sara-cyberpunk'];
};
