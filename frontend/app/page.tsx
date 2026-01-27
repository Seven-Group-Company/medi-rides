'use client';

import FleetAccessibilityShowcase from "@/components/homepage/fleet-section/fleet-accessibility-showcase";
import WebsiteFooter from "@/components/homepage/footer/website-footer";
import HeroSection from "@/components/homepage/hero-section";
import MedicalTransportOverview from "@/components/homepage/medical-transport/medical-transport-overview";
import Navigation from "@/components/homepage/navigation";
import NonMedicalTransportOverview from "@/components/homepage/non-medical-transport/non-medical-transport-overview";
import ServiceAreaMapSection from "@/components/homepage/service-area/service-area-map-section";
import CTABanner from "@/components/homepage/services/cta-banner";
import ServicesPage from "@/components/homepage/services/services-page";
import TestimonialsSection from "@/components/homepage/testimonials/testimonials-section";
import WhyChooseUsSection from "@/components/homepage/why-choose-us/why-choose-us-section";
import { generateBreadcrumbSchema, generateStructuredData } from "@/lib/structured-data";
import { SITE_CONFIG } from "@/lib/seo.config";




export default function Home() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_CONFIG.url },
  ]);

  return (
    <main className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredData(breadcrumbSchema)}
      />
      <Navigation />
      <HeroSection />
      <ServicesPage />
      <MedicalTransportOverview />
      <NonMedicalTransportOverview />
      <WhyChooseUsSection />
      <FleetAccessibilityShowcase />
      {/* <TestimonialsSection /> */}
      <ServiceAreaMapSection />
      <CTABanner />
      <WebsiteFooter />
    </main>
  );
}