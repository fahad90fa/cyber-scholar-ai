import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-6">CyberScholar Blog</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Insights, updates, and tutorials from the world of cybersecurity and AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <article key={i} className="p-8 rounded-xl border border-primary/10 bg-card hover:border-primary/30 transition-all group">
                <div className="text-sm text-primary font-medium mb-3">Tutorial • 2 days ago</div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">How to start with Reconnaissance</h3>
                <p className="text-muted-foreground mb-6">A deep dive into the first steps of ethical hacking and reconnaissance techniques.</p>
                <button className="text-foreground font-semibold flex items-center gap-2 hover:gap-3 transition-all">Read More →</button>
              </article>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
