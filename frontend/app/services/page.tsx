import type { Metadata } from 'next';
import WebsiteFooter from "@/components/homepage/footer/website-footer";
import MedicalTransportWithImage from "@/components/homepage/medical-transport/medical-transport-withImage";
import Navigation from "@/components/homepage/navigation";
import NonMedicalTransportWithImage from "@/components/homepage/non-medical-transport/non-medical-transport-with-image";
import EligibilitySection from "@/components/services/eligibility-section";
import FAQSection from "@/components/services/faq-section";
import ServicesCTASection from "@/components/services/services-cta-section";
import ServicesHero from "@/components/services/services-hero";
import { generatePageMetadata } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Our Services',
  description: 'Comprehensive medical and non-medical transportation services including doctor appointments, dialysis treatments, hospital transfers, airport transportation, and more. Professional, reliable, and compassionate care.',
  path: '/services',
  keywords: [
    'medical transportation services',
    'non-medical transportation',
    'wheelchair accessible transport',
    'dialysis transportation',
    'hospital transfer services',
    'airport transportation',
    'assisted living transportation',
  ],
});

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
    <Navigation />
    <ServicesHero />
    <MedicalTransportWithImage />
    <NonMedicalTransportWithImage />
    <EligibilitySection />
    <FAQSection />
    <ServicesCTASection />
    <WebsiteFooter />
    </main>
  );
}