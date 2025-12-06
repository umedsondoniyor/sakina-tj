import React from 'react';
import { Instagram } from 'lucide-react';

const SocialMediaSection = () => {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">Следите за новостями</p>
      <div className="flex space-x-4">
        <a
          href="https://www.instagram.com/sakina.tj?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
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