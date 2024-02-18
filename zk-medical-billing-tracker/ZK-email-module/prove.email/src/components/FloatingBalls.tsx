"use client";

import { motion } from "framer-motion";

const FloatingBalls = () => {
  return (
    <div className="-z-10 isolate">
      <motion.div
        transition={{ repeat: Infinity, duration: 3 }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        className="absolute top-50 right-[10%] rounded-full h-64 w-64 bg-violet-400 blur-3xl opacity-20"
      />
      <motion.div
        transition={{ repeat: Infinity, duration: 3 }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        className="absolute top-[70%] right-1/2 rounded-full h-64 w-64 bg-blue-400 blur-3xl opacity-20"
      />
      <motion.div
        transition={{ repeat: Infinity, duration: 3 }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        className="absolute bottom-[60%] left-[10%] rounded-full h-64 w-64 bg-orange-400 blur-3xl opacity-20"
      />
    </div>
  );
};

export default FloatingBalls;
