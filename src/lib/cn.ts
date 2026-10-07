import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...klassen: ClassValue[]) {
  return twMerge(clsx(klassen));
}
