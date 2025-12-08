import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Cybersecurity Learning</span>
          </motion.div>

          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight"
            variants={itemVariants}
          >
            Master Cybersecurity with{" "}
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              AI Guidance
            </span>
          </motion.h1>

          <motion.p 
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Learn cybersecurity concepts through interactive AI conversations, real-world scenarios, and hands-on training modules designed for every skill level.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            variants={itemVariants}
          >
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div 
            className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center"
            variants={itemVariants}
          >
            {[
              { value: "10K+", label: "Active Learners" },
              { value: "500+", label: "Learning Modules" },
              { value: "99%", label: "Completion Rate" },
              { value: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={statsVariants}
                whileHover={{ y: -5 }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute top-1/2 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      />
    </section>
  );
};

export default Hero;
