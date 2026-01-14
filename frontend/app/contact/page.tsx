import ContactHeader from '@/components/contact/header';
import ContactInfo from '@/components/contact/contact-info';
import ContactForm from '@/components/contact/contact-form';
import Navigation from '@/components/homepage/navigation';
import WebsiteFooter from '@/components/homepage/footer/website-footer';
import EligibilitySection from '@/components/services/eligibility-section';
import FAQSection from '@/components/services/faq-section';

export default function ContactPage() {
    return (
        <main className="min-h-screen">
            <Navigation />
            <ContactHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Column: Contact Info */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Have questions about our services or need to schedule a ride?
                                Our team is ready to assist you.
                            </p>
                        </div>
                        <ContactInfo />
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-7">
                        <ContactForm />
                    </div>
                </div>
            </div>
            <EligibilitySection />
            <FAQSection />
            <WebsiteFooter />
        </main>
    );
}