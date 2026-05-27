import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name: 'Моя книга', short_name: 'Моя книга', start_url: '/', display: 'standalone', background_color: '#f8fafc', theme_color: '#1e293b', icons: [] }; }
