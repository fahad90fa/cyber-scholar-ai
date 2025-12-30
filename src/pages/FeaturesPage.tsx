import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">Product Features</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover the powerful tools and resources CyberScholar provides to accelerate your cybersecurity journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature placeholders */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-primary/10 bg-card hover:border-primary/30 transition-colors">
                <h3 className="text-xl font-semibold mb-3">Feature {i}</h3>
                <p className="text-muted-foreground">Comprehensive description of the cybersecurity learning feature goes here.</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
