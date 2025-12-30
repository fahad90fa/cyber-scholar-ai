import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: December 30, 2025</p>
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p>Welcome to CyberScholar. We value your privacy and are committed to protecting your personal data.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, subscribe to our service, or communicate with us.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Data</h2>
              <p>We use the data we collect to provide, maintain, and improve our services, and to communicate with you.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
