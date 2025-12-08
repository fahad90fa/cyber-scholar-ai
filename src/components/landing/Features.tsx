import { Brain, BookOpen, Zap, Users, BarChart3, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Conversations",
      description: "Chat with our intelligent AI tutor that adapts to your learning pace and style."
    },
    {
      icon: BookOpen,
      title: "Structured Learning Modules",
      description: "Progressive modules from beginner to advanced cybersecurity concepts."
    },
    {
      icon: Zap,
      title: "Real-World Scenarios",
      description: "Learn through practical exercises and real-world cybersecurity challenges."
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join thousands of learners and share knowledge with the community."
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and certificates."
    },
    {
      icon: Shield,
      title: "Industry-Aligned Content",
      description: "Learn the skills employers are looking for in cybersecurity professionals."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Why Choose CyberScholar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to become a cybersecurity expert
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group p-6 rounded-xl border border-primary/10 bg-card hover:border-primary/30 hover:bg-card/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
