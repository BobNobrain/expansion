import { pick } from '../../lib/random/utils';

const BASES = ['Stan', 'Ham', 'Heath', 'Crook', 'Ray', 'Pan', 'Aust', 'Pal', 'Wale', 'Mon', 'Rest', 'Kay'];
const SUFFIXES = ['wood', 'shire', 'burg', 'town', 'grad', 'bul', 'kong', 'ford', 'ton', 'shia'];
const PREFIXES = ['New', 'Great', 'Far', 'Big', 'Small', 'Old'];

export function getRandomCityName(): string {
    const base = pick(Math.random, BASES);
    const suffix = pick(Math.random, SUFFIXES);
    const name = base + suffix;

    if (Math.random() < 0.5) {
        return name;
    }

    const prefix = pick(Math.random, PREFIXES);
    return [prefix, name].join(' ');
}
