import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const LicensesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">Licenses & Certifications</h1>
          <p className="text-muted-foreground mb-12">Our compliance and open-source license information.</p>
          <div className="space-y-8">
            <section className="p-6 rounded-xl border border-primary/10 bg-card">
              <h2 className="text-xl font-bold mb-4">Open Source Software</h2>
              <p className="text-muted-foreground">CyberScholar is built using amazing open-source projects. We adhere to their respective licenses.</p>
            </section>
            <section className="p-6 rounded-xl border border-primary/10 bg-card">
              <h2 className="text-xl font-bold mb-4">Certifications</h2>
              <p className="text-muted-foreground">Information about our security and educational certifications.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LicensesPage;
