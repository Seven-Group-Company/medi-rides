import WebsiteFooter from "@/components/homepage/footer/website-footer";
import MedicalTransportWithImage from "@/components/homepage/medical-transport/medical-transport-withImage";
import Navigation from "@/components/homepage/navigation";
import NonMedicalTransportWithImage from "@/components/homepage/non-medical-transport/non-medical-transport-with-image";
import EligibilitySection from "@/components/services/eligibility-section";
import FAQSection from "@/components/services/faq-section";
import ServicesCTASection from "@/components/services/services-cta-section";
import ServicesHero from "@/components/services/services-hero";

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
    <Navigation />
    <ServicesHero />
    <MedicalTransportWithImage />
    <NonMedicalTransportWithImage />
    <EligibilitySection />
    {/* <PricingSection /> */}
    {/* <InsuranceSection /> */}
    {/* <RideExpectations /> */}
    <FAQSection />
    <ServicesCTASection />
    <WebsiteFooter />
    </main>
  );
}