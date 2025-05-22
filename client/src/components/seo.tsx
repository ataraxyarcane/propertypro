import { Helmet } from "react-helmet";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
}

export default function SEO({
  title,
  description = "Property management system for landlords and tenants",
  canonical,
  ogType = "website",
  ogImage,
}: SEOProps) {
  const siteTitle = "PropertyPro";
  const fullTitle = `${title} | ${siteTitle}`;
  const currentUrl = canonical || window.location.href;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      {ogImage && <meta property="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
