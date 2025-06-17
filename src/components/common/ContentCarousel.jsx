import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentCard from './ContentCard';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

const ContentCarousel = ({ title, items, onItemSelect, size = 'medium' }) => {
  const [showControls, setShowControls] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const carouselRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', checkScroll);
      }
    };
  }, [items]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseEnter = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 1000);
  };

  useKeyboardNavigation({
    onArrowLeft: () => {
      if (focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
        scroll('left');
      }
    },
    onArrowRight: () => {
      if (focusedIndex < items.length - 1) {
        setFocusedIndex(focusedIndex + 1);
        scroll('right');
      }
    },
    onEnter: () => {
      if (items[focusedIndex]) {
        onItemSelect(items[focusedIndex]);
      }
    },
    enabled: true
  });

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {title && (
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      )}

      <div className="relative">
        {/* Botão Esquerdo */}
        {canScrollLeft && (
          <Button
            onClick={() => scroll('left')}
            variant="ghost"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Carrossel */}
        <div
          ref={carouselRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex-shrink-0 transition-transform duration-200 ${
                focusedIndex === index ? 'scale-105' : ''
              }`}
            >
              <ContentCard
                content={item}
                size={size}
                onSelect={() => {
                  setFocusedIndex(index);
                  onItemSelect(item);
                }}
                isFocused={focusedIndex === index}
              />
            </div>
          ))}
        </div>

        {/* Botão Direito */}
        {canScrollRight && (
          <Button
            onClick={() => scroll('right')}
            variant="ghost"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContentCarousel;

