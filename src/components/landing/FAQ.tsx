import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Do I need prior experience in cybersecurity?",
      answer: "Not at all! CyberScholar is designed for beginners. Our modules start from the fundamentals and progress at your own pace. Our AI tutor adapts to your knowledge level."
    },
    {
      question: "How does the AI tutoring work?",
      answer: "Our AI tutor uses conversational learning to explain concepts, answer questions, and provide real-world examples. It understands your progress and tailors explanations to your learning style."
    },
    {
      question: "Can I access the course content offline?",
      answer: "Free and Pro plans support basic offline access. For full offline support and downloadable materials, we recommend our Pro plan which includes all course materials."
    },
    {
      question: "Are certificates recognized by employers?",
      answer: "Yes! Our certificates are recognized by leading cybersecurity organizations and major tech companies. They validate real skills learned through our comprehensive curriculum."
    },
    {
      question: "What if I want to cancel my subscription?",
      answer: "You can cancel your Pro subscription at any time with no penalty. You'll retain access to free tier content, and you can reactivate your Pro plan whenever you want."
    },
    {
      question: "How long does it take to complete a course?",
      answer: "Learning duration varies based on your pace and prior knowledge. Most learners complete beginner modules in 4-6 weeks, intermediate in 8-10 weeks, and advanced in 12-16 weeks."
    },
    {
      question: "Do you offer team/enterprise plans?",
      answer: "Absolutely! We offer customized enterprise plans with team management, advanced analytics, and dedicated support. Contact our sales team for more information."
    },
    {
      question: "Is my data secure on CyberScholar?",
      answer: "We take security seriously. All your data is encrypted in transit and at rest. We comply with GDPR, CCPA, and follow industry-standard security practices."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about CyberScholar
          </p>
        </motion.div>

        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border border-primary/10 rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-card hover:bg-card/50 transition-colors text-left"
                whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.05)" }}
              >
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 bg-card border-t border-primary/10"
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
