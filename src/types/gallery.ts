export interface Artwork {
  id: string;
  imgPath: string;
  title: string;
  description: string;
  audioPath?: string;
  file?: File;
  audio?: File;
}

export interface Gallery {
  id: string;
  name: string;
  artworks: Artwork[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ShareData {
  name: string;
  artworks: Array<{
    title: string;
    description: string;
    imgData: string;
    audioData?: string;
  }>;
}
