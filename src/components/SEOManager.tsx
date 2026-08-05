import { useEffect } from 'react';
import { useLanguage } from './LanguageContext';

interface SEOManagerProps {
  currentView: string;
}

export default function SEOManager({ currentView }: SEOManagerProps) {
  const { t } = useLanguage();

  const getSEOConfig = (view: string) => {
    const baseTitle = t('seo.home_title', 'SDY Company C&I | Cambodia Premium Construction & Fit-Out');
    const baseDesc = t('seo.home_desc', 'Cambodia\'s premier interior fit-out contractor, furniture & door manufacturer, structural steel fabrication, and high-performance glass & aluminum works leader.');
    
    switch (view) {
      case 'home':
        return {
          title: baseTitle,
          description: baseDesc,
          ogType: 'website',
          keywords: 'SDY Cambodia, Interior Design Phnom Penh, Fit-Out Contractor, Door Manufacturer Cambodia, Steel Works, Glass Facade, Construction Cambodia',
        };
      case 'about':
        return {
          title: `${t('nav.about', 'About Us')} | SDY Company C&I`,
          description: t('seo.about_desc', 'Discover SDY\'s journey since 2018. Learn about our 4,500 sqm state-of-the-art manufacturing plant, core values, ISO 9001 certifications, and structural organization.'),
          ogType: 'article',
          keywords: 'SDY Factory, Organization Chart, ISO 9001, Quality Contractor Cambodia, Company History, Mission and Vision',
        };
      case 'services':
        return {
          title: `${t('nav.services', 'Services')} | SDY Company C&I`,
          description: t('seo.services_desc', 'Explore our 18 comprehensive capabilities including luxury interior fit-outs, commercial renovations, fire-rated doors, structural steel engineering, and facade cladding.'),
          ogType: 'website',
          keywords: 'Office Renovation, Custom Furniture, Wood Doors, Fire Rated Doors, Facade Engineering, Steel Structure Fabrication, Retail Shop Fit-out',
        };
      case 'projects':
        return {
          title: `${t('nav.projects', 'Projects')} | SDY Construction & Design`,
          description: t('seo.projects_desc', 'A portfolio of high-end commercial, hotel, retail, and residential projects completed across Cambodia including Vattanac Capital, Rosewood, and ABA Bank branches.'),
          ogType: 'website',
          keywords: 'Vattanac Capital, Rosewood Phnom Penh, Koh Pich Villa, TK Avenue, Commercial Portfolio Cambodia, Luxury Fit-out Projects',
        };
      case 'products':
        return {
          title: `${t('nav.products', 'Products')} | Premium Doors & Structural Systems`,
          description: t('seo.products_desc', 'Browse our engineered acoustic wood doors, UL-certified fire doors, glass pivot panels, custom office furniture, high-load steel structures, and curtain walls.'),
          ogType: 'website',
          keywords: 'Acoustic Door, Fire Rated Door, Slim Aluminum Window, Curtain Wall Facade, Bespoke Furniture, Double Glazed Glass, Cambodia Door Factory',
        };
      case 'contact':
        return {
          title: `${t('nav.contact', 'Contact')} | SDY Company C&I`,
          description: t('seo.contact_desc', 'Get in touch with Cambodia\'s premium fit-out and engineering team. Send inquiry forms, find Google Maps directions, phone coordinates, and WhatsApp, Telegram channels.'),
          ogType: 'website',
          keywords: 'SDY Contact, Office Location Phnom Penh, Telegram, Contact Form, Google Map SDY, Construction Quote',
        };
      case 'blogs':
        return {
          title: `${t('nav.blog', 'News')} | SDY Blog`,
          description: t('seo.blogs_desc', 'Read the latest trends on luxury green architecture, acoustic control systems, and building safety codes in the Cambodian construction industry.'),
          ogType: 'website',
          keywords: 'Architecture Blog Cambodia, Sustainable Construction, Soundproof Partition, UL Safety Doors',
        };
      case 'admin':
        return {
          title: `${t('nav.admin', 'Admin Panel')} | SDY Portal`,
          description: t('seo.admin_desc', 'Secure local database viewer, contact submission sheets, and real-time Google Sheets Apps Script integration interface.'),
          ogType: 'website',
          keywords: 'Database Portal, Webhook Sync',
        };
      default:
        return {
          title: baseTitle,
          description: baseDesc,
          ogType: 'website',
          keywords: 'SDY Company, Fit-Out, Cambodia',
        };
    }
  };

  const config = getSEOConfig(currentView);

  useEffect(() => {
    // Dynamically update document head elements for SEO indexing
    document.title = config.title;

    // Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', config.description);

    // Meta Keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', config.keywords);

    // Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', config.title);

    // Open Graph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', config.description);

    // Open Graph Type
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      document.head.appendChild(ogType);
    }
    ogType.setAttribute('content', config.ogType);

    // Inject JSON-LD Schema
    let schemaScript = document.getElementById('seo-jsonld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }

    schemaScript = document.createElement('script');
    schemaScript.id = 'seo-jsonld-schema';
    schemaScript.setAttribute('type', 'application/ld+json');

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://sdy-ci.com/#organization',
          'name': 'SDY Company C&I',
          'url': 'https://sdy-ci.com',
          'logo': 'https://sdy-ci.com/logo.png',
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+855-23-888-999',
            'contactType': 'sales',
            'areaServed': 'KH',
            'availableLanguage': ['Khmer', 'English']
          },
          'sameAs': [
            'https://www.facebook.com/sdycompanyci',
            'https://www.tiktok.com/@sdycompanyci',
            'https://www.youtube.com/@sdycompanyci'
          ]
        },
        {
          '@type': 'LocalBusiness',
          '@id': 'https://sdy-ci.com/#localbusiness',
          'name': 'SDY Company C&I',
          'image': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
          'telephone': '+855-23-888-999',
          'email': 'info@sdy-ci.com',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'National Road 3, Phnom Penh',
            'addressLocality': 'Phnom Penh',
            'addressCountry': 'KH'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': '11.5564',
            'longitude': '104.9282'
          }
        }
      ]
    };

    schemaScript.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(schemaScript);
  }, [config]);

  return null; // Side-effect only component
}

// Generate file templates for preview in SEO tab / Sitemap view
export function getRobotsTxt() {
  return `User-agent: *
Allow: /
Sitemap: https://sdy-ci.com/sitemap.xml
Host: https://sdy-ci.com`;
}

export function getSitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sdy-ci.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sdy-ci.com/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sdy-ci.com/services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sdy-ci.com/projects</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sdy-ci.com/products</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sdy-ci.com/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
}
