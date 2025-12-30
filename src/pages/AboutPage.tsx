import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">About CyberScholar</h1>
          <p className="text-lg text-muted-foreground mb-8">
            CyberScholar is an AI-powered platform dedicated to revolutionizing cybersecurity education.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p className="text-muted-foreground">
                To empower the next generation of cybersecurity professionals by providing accessible, intelligent, and hands-on learning tools.
              </p>
              <h2 className="text-2xl font-semibold">Our Vision</h2>
              <p className="text-muted-foreground">
                A world where everyone has the opportunity to master the skills needed to protect our digital future.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10">
              <h3 className="text-xl font-bold mb-4">Why CyberScholar?</h3>
              <ul className="space-y-3">
                <li className="flex gap-2">🛡️ AI-Driven Tutoring</li>
                <li className="flex gap-2">🔐 Realistic Simulations</li>
                <li className="flex gap-2">📈 Progress Tracking</li>
                <li className="flex gap-2">🌐 Community Focused</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
