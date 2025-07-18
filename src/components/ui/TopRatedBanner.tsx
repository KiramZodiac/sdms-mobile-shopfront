import React from 'react';

const TopRatedBanner = () => {
  return (
    <div className="w-full overflow-hidden">
      <a
        href="/top-products"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
        data-track-onclick="eecPromo"
        data-ga4-promotion_id="sdm_top_rated"
        data-ga4-promotion_name="SDM Electronics - Shop Top Products"
        data-ga4-creative_slot="banner_top"
        data-ga4-creative_name="SDM_Electronics_Banner"
        data-track-onview="eecPromo"
      >
        <video
          src="/banner.mp4"
          className="w-full h-[50px] sm:h-[100px] md:h-[120px] lg:h-[130px] object-contain"
          autoPlay
          loop
          muted
          playsInline
          title="Top Products - SDM Electronics"
          poster="/fallback.jpg"
        />
      </a>
    </div>
  );
};

export default TopRatedBanner;
