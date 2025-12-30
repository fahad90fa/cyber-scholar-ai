import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const ModulesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">Learning Modules</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Explore our curated selection of cybersecurity learning modules, from beginner to advanced.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {["Reconnaissance", "Exploitation", "Payloads", "Network Security", "Web Hacking", "Cloud Security"].map((m) => (
              <div key={m} className="p-6 rounded-xl border border-primary/10 bg-card hover:border-primary/30 transition-colors">
                <h3 className="text-xl font-semibold mb-3">{m}</h3>
                <p className="text-muted-foreground">Detailed overview of the {m} module and what you will learn.</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ModulesPage;
