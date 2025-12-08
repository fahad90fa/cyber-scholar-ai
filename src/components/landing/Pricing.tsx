import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      description: "Perfect for beginners",
      price: "0",
      features: [
        "Access to basics modules",
        "50 AI conversations/month",
        "Community support",
        "Progress tracking",
        "Basic certificates"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      description: "For serious learners",
      price: "29",
      features: [
        "All Free features",
        "Unlimited AI conversations",
        "Advanced modules",
        "Real-world projects",
        "Priority support",
        "Advanced certificates",
        "Practice labs",
        "Monthly webinars"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      description: "For teams & organizations",
      price: "Custom",
      features: [
        "All Pro features",
        "Team management",
        "Custom curriculum",
        "Dedicated support",
        "SSO integration",
        "Advanced analytics",
        "API access",
        "On-premises option"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your cybersecurity journey
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className={`relative rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? "border-primary/50 bg-card ring-2 ring-primary/20 md:scale-105 shadow-xl shadow-primary/10"
                  : "border-primary/10 bg-card hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <motion.div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Most Popular
                </motion.div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground ml-2">/month</span>
                  )}
                </div>

                <Link to="/register" className="block mb-8">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </Link>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div 
                      key={featureIndex} 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: featureIndex * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
