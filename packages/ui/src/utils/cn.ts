import clsx, { type ClassValue } from 'clsx'

/**
 * Utility for merging class names conditionally
 * Follows Darkroom pattern of using clsx
 */
export function cn(...inputs: ClassValue[]): string {
	return clsx(inputs)
}
