import Hero from '@/components/hero';
import Features from '@/components/features';
import HowItWorks from '@/components/how-it-works';
import Install from '@/components/install';
import CTA from '@/components/cta';
import Footer from '@/components/footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <Install />
      <CTA />
      <Footer />
    </main>
  );
}
