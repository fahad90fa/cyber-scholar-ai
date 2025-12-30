import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">Our Security Commitment</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We take your security and privacy seriously. Learn how we protect your data and ensure a safe learning environment.
          </p>
          <div className="space-y-8">
            <section className="p-8 rounded-xl border border-primary/10 bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-primary">Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                All data is encrypted both in transit and at rest using industry-standard protocols. We follow strict data access policies to ensure your personal information remains confidential.
              </p>
            </section>
            <section className="p-8 rounded-xl border border-primary/10 bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-primary">Compliance</h2>
              <p className="text-muted-foreground leading-relaxed">
                CyberScholar complies with global data protection regulations and adheres to best practices in educational technology security.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SecurityPage;
