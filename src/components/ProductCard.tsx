import React from 'react';
import { Perfume } from '../types';
import { formatPrice } from '../utils/format';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  perfume: Perfume;
  onSelect: (perfume: Perfume) => void;
  onAddToCart: (perfume: Perfume, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  perfume,
  onSelect,
  onAddToCart,
}) => {
  return (
    <div
      onClick={() => onSelect(perfume)}
      className="group bg-white rounded-2xl border border-[#E8DDD2] overflow-hidden shadow-2xs hover:shadow-lg hover:border-[#5A1224]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#FAF5EE] overflow-hidden">
        <img
          src={perfume.image || '/product-placeholder.svg'}
          alt={perfume.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== window.location.origin + '/product-placeholder.svg') {
              target.src = '/product-placeholder.svg';
            }
          }}
        />

        {/* Category Pill */}
        <span className="absolute top-2.5 left-2.5 bg-[#FAF7F2]/90 backdrop-blur-xs text-[#5A1224] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#E6D9CD]">
          {perfume.category}
        </span>

        {/* Featured Tag */}
        {perfume.featured && (
          <span className="absolute top-2.5 right-2.5 bg-[#5A1224] text-[#E5C365] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs border border-[#C59E3F]/40">
            Featured
          </span>
        )}
      </div>

      {/* Details Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between text-left">
        <div>
          <h3
            className="text-base sm:text-lg font-serif font-semibold text-[#2D2825] group-hover:text-[#5A1224] transition-colors leading-snug"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {perfume.name}
          </h3>

          <p className="text-[11px] text-[#6B5E57] line-clamp-2 mt-1 leading-relaxed">
            {perfume.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-3.5 pt-3 border-t border-[#F2E8DC] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B] block">
              Starting from
            </span>
            <span className="text-sm sm:text-base font-semibold text-[#5A1224]">
              {formatPrice(perfume.price)}
            </span>
          </div>

          <button
            onClick={(e) => onAddToCart(perfume, e)}
            aria-label={`Add ${perfume.name} to cart`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#5A1224] text-[#5A1224] hover:text-white border border-[#D9C8BA] hover:border-[#5A1224] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
