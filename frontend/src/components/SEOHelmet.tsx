import { Helmet } from "react-helmet-async";
import { JsonLd } from "react-schemaorg";
import { WebApplication, SoftwareApplication } from "schema-dts";

interface SEOHelmetProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  pageName?: string;
  keywords?: string[];
  imageUrl?: string;
}

export const SEOHelmet = ({
  title = "CNC Machining Cost Calculator | Precision Manufacturing Cost Analysis",
  description = "Calculate accurate CNC machining costs with our specialized manufacturing cost analysis tool. Get instant price estimation for precision machining projects.",
  canonicalUrl = window.location.href,
  pageName = "",
  keywords = [
    "CNC machining cost calculator",
    "Manufacturing cost estimation",
    "CNC cost analysis",
    "Precision machining pricing",
    "Industrial cost calculation",
    "CNC manufacturing costs",
    "Machining price estimation",
    "Manufacturing pricing tools",
  ],
  imageUrl = `${window.location.origin}/logo.png`,
}: SEOHelmetProps) => {
  const pageTitle = pageName ? `${pageName} | CNC Cost Calculator` : title;

  return (
    <>
      <Helmet>
        {/* Basic Metadata */}
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(", ")} />
        <link rel="canonical" href={canonicalUrl} />

        {/* OpenGraph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={imageUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>

      {/* Structured Data */}
      <JsonLd<WebApplication>
        item={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "CNC Cost Calculator",
          applicationCategory: "BusinessApplication",
          operatingSystem: "All",
          description: description,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "CNC machining cost estimation",
            "3D model analysis",
            "Manufacturing price calculation",
            "Material cost analysis",
          ],
        }}
      />

      <JsonLd<SoftwareApplication>
        item={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "CNC Cost Calculator",
          applicationCategory: "BusinessApplication",
          operatingSystem: "All",
          description: description,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />
    </>
  );
};
