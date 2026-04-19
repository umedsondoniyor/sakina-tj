import { Instagram } from 'lucide-react';

interface SocialMediaSectionProps {
  heading?: string;
  instagramUrl?: string | null;
}

const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  heading = 'Следите за новостями',
  instagramUrl,
}) => {
  if (!instagramUrl?.trim()) {
    return null;
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">{heading}</p>
      <div className="flex space-x-4">
        <a
          href={instagramUrl}
          className="text-gray-400 hover:text-teal-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <Instagram size={24} />
        </a>
      </div>
    </div>
  );
};

export default SocialMediaSection;
