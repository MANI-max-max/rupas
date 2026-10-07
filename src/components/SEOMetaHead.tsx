import React, { useEffect } from 'react';
import { Product, AffiliatePlatform } from '../types';
import { Language } from '../translations';

interface SEOMetaHeadProps {
  products: Product[];
  selectedPlatform: AffiliatePlatform | 'all';
  lang: Language;
}

export const SEOMetaHead: React.FC<SEOMetaHeadProps> = ({
  products,
  selectedPlatform,
  lang,
}) => {
  useEffect(() => {
    // Dynamic Title based on selected platform
    let pageTitle = 'Rupas.Shop – Best Deals & Discounts on Amazon, Flipkart & Meesho';
    if (selectedPlatform === 'amazon') {
      pageTitle = 'Amazon Top Deals & Coupons (Up to 70% Off) – Rupas.Shop';
    } else if (selectedPlatform === 'flipkart') {
      pageTitle = 'Flipkart Big Billion Days & Best Deals – Rupas.Shop';
    } else if (selectedPlatform === 'meesho') {
      pageTitle = 'Meesho Lowest Price Online Shopping Deals – Rupas.Shop';
    }

    document.title = pageTitle;

    // Dynamic Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      `Discover handpicked trending deals, verified coupons, and highest discounts across Amazon, Flipkart, and Meesho. Save up to 70% with verified reviews.`
    );

    // Schema.org Structured Data ItemList injection
    let schemaScript = document.getElementById('dealhub-schema-products');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('id', 'dealhub-schema-products');
      document.head.appendChild(schemaScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.slice(0, 10).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: p.title,
          image: p.imageUrl,
          description: p.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: p.dealPrice,
            priceValidUntil: '2027-12-31',
            availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: p.affiliateUrl,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.rating,
            reviewCount: p.reviewCount,
          },
        },
      })),
    };

    schemaScript.textContent = JSON.stringify(structuredData);
  }, [products, selectedPlatform, lang]);

  return null;
};
