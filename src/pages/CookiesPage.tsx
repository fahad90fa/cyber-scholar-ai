import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: December 30, 2025</p>
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What are cookies?</h2>
              <p>Cookies are small text files that are stored on your device when you visit a website.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How we use cookies</h2>
              <p>We use cookies to understand how you use our site and to improve your experience.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPage;
