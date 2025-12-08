import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = ["features", "how-it-works", "pricing", "faq"];

  return (
    <motion.nav 
      className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-primary/10 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-6 h-6 text-primary" />
            </motion.div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              CyberScholar
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link}
                href={`#${link}`}
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ y: -2 }}
              >
                {link.replace("-", " ").charAt(0).toUpperCase() + link.replace("-", " ").slice(1)}
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </motion.div>
            </Link>
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </motion.div>
            </Link>
          </div>

          <motion.button
            className="md:hidden p-2"
            onClick={toggleMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </motion.button>
        </div>

        {isOpen && (
          <motion.div 
            className="md:hidden pb-4 space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link}`}
                className="block px-4 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {link.replace("-", " ").charAt(0).toUpperCase() + link.replace("-", " ").slice(1)}
              </a>
            ))}
            <div className="pt-4 flex gap-2 px-4">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
