import { put, del, list } from '@vercel/blob';
import type { PutBlobResult, ListBlobResult } from '@vercel/blob';

export const FOLDERS = {
  HISTORY: 'history',
  CITATIONS: 'citations',
  RESEARCH: 'research'
} as const;

interface StorageOptions {
  access: 'public';
  addRandomSuffix?: boolean;
  token?: string;
}

export async function uploadFile(
  path: string,
  content: string | Blob | ArrayBuffer,
  options: StorageOptions = { access: 'public' }
): Promise<PutBlobResult> {
  try {
    const blob = await put(path, content, {
      access: options.access,
      addRandomSuffix: options.addRandomSuffix,
      token: options.token,
    });
    return blob;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function getFile(url: string): Promise<Response> {
  try {
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(validUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error('Error getting file:', error);
    throw error;
  }
} 