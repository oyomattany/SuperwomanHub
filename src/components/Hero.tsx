import React from 'react';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { BRAND_CONFIG, BrandConfig } from '../config/brand';
import { generateGeneralWhatsAppUrl } from '../utils/format';

interface HeroProps {
  onShopClick: () => void;
  heroImage?: string;
  brandConfig?: BrandConfig;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, heroImage, brandConfig = BRAND_CONFIG }) => {
  const whatsappUrl = generateGeneralWhatsAppUrl(
    `Hello ${brandConfig.businessName} 👋\nI would love to order oil perfumes from your collection!`,
    brandConfig
  );

  const displayImage = heroImage || brandConfig.heroImage || '/1789993107439.jpg';

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-12 sm:py-16 lg:py-20 border-b border-[#EADFD4]">
      {/* Subtle warm background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F8E4E7]/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FAF0DC]/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Subtle Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EAE1] border border-[#E3D3C4] text-[#5A1224] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C59E3F]" />
              <span>Premium Long-Lasting Oil Perfumes</span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#5A1224] leading-[1.12] tracking-tight font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {brandConfig.heroHeadline}
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-[#47403B] max-w-xl font-normal leading-relaxed">
              {brandConfig.supportingText}
            </p>

            {/* Oil perfume reassurance badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#6B5E57] pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59E3F]"></span>
                <span>Pure Concentrated Oils</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59E3F]"></span>
                <span>Affordable Everyday Luxury</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59E3F]"></span>
                <span>Handy Pocket & Roll-on Sizes</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onShopClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#5A1224] hover:bg-[#721830] text-[#FAF7F2] font-semibold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <span>Shop Perfumes</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F9F4EE] text-[#5A1224] border border-[#D9C8BA] font-semibold text-sm uppercase tracking-wider shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Premium Oil Perfume Photograph */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Frame */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-[#EBD9C8] to-[#FCEBED] rounded-3xl transform rotate-2 -z-10 opacity-70" />
              
              {/* Product Photograph Card */}
              <div className="relative overflow-hidden rounded-2xl shadow-xl border border-[#E3D3C4] bg-white aspect-[4/5] group">
                <img
                  src={displayImage}
                  alt="Superwoman's Hub Founder with Oil Perfume Collection"
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== window.location.origin + '/hero-founder.jpg') {
                      target.src = '/hero-founder.jpg';
                    }
                  }}
                />

                {/* Subtle Overlaid Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#FAF7F2]/90 backdrop-blur-md p-3.5 rounded-xl border border-[#EADFD4] shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-[#5A1224] font-bold">
                    Superwoman's Hub
                  </p>
                  <p className="text-[11px] text-[#544D48] font-light">
                    Authentic oil perfumes & curated fragrance collections.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
