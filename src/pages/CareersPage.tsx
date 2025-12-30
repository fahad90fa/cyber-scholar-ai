import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">Join the Team</h1>
          <p className="text-lg text-muted-foreground mb-12">
            We are looking for passionate individuals to help us build the future of cybersecurity education.
          </p>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
            {["AI Engineer", "Full Stack Developer", "Cybersecurity Researcher", "Product Designer"].map((job) => (
              <div key={job} className="p-6 rounded-xl border border-primary/10 bg-card flex justify-between items-center hover:bg-primary/5 transition-colors cursor-pointer">
                <div>
                  <h3 className="text-xl font-semibold">{job}</h3>
                  <p className="text-muted-foreground">Remote • Full-time</p>
                </div>
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium">Apply</button>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default CareersPage;
