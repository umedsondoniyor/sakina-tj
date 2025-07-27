import React from 'react';

const AppStoreLinks = () => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">Скачайте приложение</p>
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
        <a href="#" className="block">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
            alt="Download on the App Store"
            className="h-10"
          />
        </a>
        <a href="#" className="block">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Get it on Google Play"
            className="h-10"
          />
        </a>
      </div>
    </div>
  );
};

export default AppStoreLinks;