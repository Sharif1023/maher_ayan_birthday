export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';
export interface MediaItem {
  id: string; type: MediaType; title: string; caption: string; description?: string | null;
  category?: string | null; url: string; mimeType: string; sizeBytes: number; sortOrder: number;
  featured: boolean; published: boolean; dateTaken?: string | null; timelineMilestoneId?: string | null;
  createdAt?: string;
}
export interface TimelineItem {
  id: string; month: number; title: string; description?: string | null; memoryDate?: string | null;
  sortOrder: number; published: boolean; media: MediaItem[];
}
export interface Wish { id: string; name: string; relationship?: string | null; message: string; status?: string; createdAt: string; }
export interface BirthdayContent {
  heroTitle: string; babyName: string; heroSubtitle: string; heroDescription: string;
  storyTitle: string; storyText: string; birthdayLetter: string; footerMessage: string;
}
export interface WebsiteSettings {
  visibility: 'PUBLIC' | 'PRIVATE' | 'PASSWORD_PROTECTED'; allowWishes: boolean;
  backgroundMusicEnabled: boolean; searchIndexingEnabled: boolean; siteTitle: string; metaDescription: string;
}
export interface MemoryItem { id: string; title: string; description?: string | null; category?: string | null; memoryDate?: string | null; sortOrder: number; featured: boolean; published: boolean; }
export interface BootstrapData {
  content: BirthdayContent | null; settings: WebsiteSettings | null; media: MediaItem[];
  timeline: TimelineItem[]; wishes: Wish[]; memories: MemoryItem[];
  backgroundMusic: MediaItem | null;
}
