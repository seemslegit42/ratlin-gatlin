
/**
 * @file services/stringUtils.ts
 * @description Utility functions for string manipulation and formatting.
 * Used for sanitizing inputs, formatting display text, and generating slugs.
 */

/**
 * Truncates a string to a specified length and adds an ellipsis.
 * @param str The string to truncate.
 * @param length The maximum length including the ellipsis.
 * @returns The truncated string.
 */
export const truncate = (str: string, length: number = 20): string => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length - 3) + '...';
};

/**
 * Capitalizes the first letter of a string.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string into a URL-friendly slug.
 * @param str The string to slugify.
 * @returns The slugified string.
 */
export const slugify = (str: string): string => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

/**
 * Formats a number as a currency string.
 * @param amount The number to format.
 * @param currency The currency code (default: USD).
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Generates a concise summary from a longer text block.
 * @param text The full text.
 * @param sentenceCount Number of sentences to keep.
 * @returns The summary text.
 */
export const summarize = (text: string, sentenceCount: number = 1): string => {
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, sentenceCount).join(' ');
};
