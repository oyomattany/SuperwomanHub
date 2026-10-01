import React, { useState } from 'react';
import { Perfume } from '../types';
import { formatPrice, generateSinglePerfumeWhatsAppUrl } from '../utils/format';
import { BRAND_CONFIG, BrandConfig } from '../config/brand';
import { X, ShoppingBag, MessageCircle, Plus, Minus } from 'lucide-react';

interface ProductDetailsModalProps {
  perfume: Perfume | null;
  onClose: () => void;
  onAddToCart: (perfume: Perfume, size: string, price: number | null, quantity: number) => void;
  brandConfig?: BrandConfig;
  onDirectOrder?: (perfume: Perfume, size: string, price: number | null, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  perfume,
  onClose,
  onAddToCart,
  brandConfig = BRAND_CONFIG,
  onDirectOrder,
}) => {
  if (!perfume) return null;

  // Selected size state (defaults to first size or "Standard")
  const [selectedSizeId, setSelectedSizeId] = useState<string>(
    perfume.sizes.length > 0 ? perfume.sizes[0].id : 'default'
  );
  const [quantity, setQuantity] = useState<number>(1);

  const currentSizeObj = perfume.sizes.find((s) => s.id === selectedSizeId);
  const displayPrice = currentSizeObj?.price ?? perfume.price;
  const selectedSizeName = currentSizeObj?.name || 'Standard Bottle';

  const handleAdd = () => {
    onAddToCart(perfume, selectedSizeName, displayPrice, quantity);
    onClose();
  };

  const whatsappDirectUrl = generateSinglePerfumeWhatsAppUrl(
    perfume,
    selectedSizeName,
    displayPrice,
    quantity,
    brandConfig
  );

  const handleDirectOrderClick = () => {
    if (onDirectOrder) {
      onDirectOrder(perfume, selectedSizeName, displayPrice, quantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#240A10]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#FAF7F2] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E8DDD2] overflow-hidden z-10 animate-scaleIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#5A1224] border border-[#E3D3C4] shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Large Product Image */}
          <div className="relative bg-[#F4ECE2] aspect-square md:aspect-auto h-72 md:h-full overflow-hidden flex flex-col items-center justify-center">
            <img
              src={perfume.image || '/product-placeholder.svg'}
              alt={`${perfume.name} Oil Perfume`}
              decoding="async"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== window.location.origin + '/product-placeholder.svg') {
                  target.src = '/product-placeholder.svg';
                }
              }}
            />
            <span className="absolute top-4 left-4 bg-[#FAF7F2]/95 backdrop-blur-xs text-[#5A1224] text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-[#E3D3C4]">
              {perfume.category}
            </span>
            <div className="absolute bottom-3 inset-x-3 bg-white/90 backdrop-blur-xs py-1.5 px-3 rounded-lg border border-[#E8DED4] text-center">
              <p className="text-[10px] text-[#6B5E57] uppercase tracking-wider font-medium">
                {perfume.image.includes('placeholder') ? 'Standard Roll-on Oil • Photo coming soon' : (perfume.vibe || '100% Pure Undiluted Fragrance Oil')}
              </p>
            </div>
          </div>

          {/* Product Info & Controls */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5 text-left">
            
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C59E3F] font-bold block">
                Oil Perfume
              </span>
              <h2
                className="text-2xl sm:text-3xl font-serif font-bold text-[#5A1224] leading-tight mt-0.5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {perfume.name}
              </h2>

              <p className="text-sm font-semibold text-[#5A1224] mt-2">
                {formatPrice(displayPrice)}
              </p>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-[#544D48] mt-3 leading-relaxed font-light">
                {perfume.description}
              </p>

              {perfume.vibe && (
                <p className="text-[11px] text-[#8C7A6B] mt-2 italic">
                  Aura: {perfume.vibe}
                </p>
              )}
            </div>

            {/* Available Size / Options */}
            {perfume.sizes.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3D3734] mb-2">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {perfume.sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSizeId(size.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        selectedSizeId === size.id
                          ? 'bg-[#5A1224] text-white shadow-xs'
                          : 'bg-white text-[#544D48] border border-[#D9C8BA] hover:bg-[#F5EAE1]'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#3D3734] mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center rounded-full border border-[#D9C8BA] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#5A1224] hover:bg-[#FAF7F2] transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-semibold text-[#2D2825]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#5A1224] hover:bg-[#FAF7F2] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions: Add to Cart & Order on WhatsApp */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3 px-4 rounded-full bg-[#5A1224] hover:bg-[#721830] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDirectOrderClick}
                className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-[#F9F4EE] text-[#5A1224] border border-[#D9C8BA] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
