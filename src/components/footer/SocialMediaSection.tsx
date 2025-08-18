import React from 'react';
import { Youtube } from 'lucide-react';

const SocialMediaSection = () => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">Следите за новостями</p>
      <div className="flex space-x-3">
        <a href="https://www.instagram.com/sakina.tj?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="text-gray-400 hover:text-gray-600" target="_blank">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm-3.692 16.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm4.95-8.15a1.05 1.05 0 110-2.1 1.05 1.05 0 010 2.1z"/>
          </svg>
        </a>
        {/* <a href="#" className="text-gray-400 hover:text-gray-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148a13.98 13.98 0 0 0 10.15 5.144 4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z"/>
          </svg>
        </a> */}
        {/* <a href="#" className="text-gray-400 hover:text-gray-600">
          <Youtube className="h-6 w-6" />
        </a> */}
      </div>
    </div>
  );
};

export default SocialMediaSection;