import { Camera, Image as ImageIcon } from 'lucide-react';

export default function MediaPlaceholder({ label = "Add Maher's photo in Admin", compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div className={`media-placeholder ${compact ? 'media-placeholder-compact' : ''}`}>
      <div className="placeholder-art"><span className="placeholder-sun" /><span className="placeholder-hill placeholder-hill-one" /><span className="placeholder-hill placeholder-hill-two" /><span className="placeholder-cloud">☁</span><span className="placeholder-star">✦</span></div>
      <div className="placeholder-label"><Camera size={15} /><span>{label}</span></div>
    </div>
  );
}

export function MediaImage({ src, alt, className = '' }: { src?: string | null; alt: string; className?: string }) {
  if (!src) return <div className={`media-image-fallback ${className}`}><ImageIcon size={24} /><span>Memory photo</span></div>;
  return <img className={className} src={src} alt={alt} loading="lazy" />;
}
