"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function SubscribeSection() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email) return alert("Enter email");
    console.log(email);
  };

  return (
    <section className="w-full bg-gray-100 py-10 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="
          flex flex-col md:flex-row 
          items-center justify-between 
          gap-6
        ">
          
          {/* LEFT TEXT */}
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              Stay in the know
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Get updates on venue deals and event planning tips
            </p>
          </div>

          {/* RIGHT INPUT */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="
              w-full md:w-auto 
              flex items-center 
              bg-white rounded-lg shadow-sm overflow-hidden
            "
          >
            
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full md:w-72 
                px-4 py-2 
                text-sm 
                outline-none
              "
            />

            <button
              onClick={handleSubscribe}
              className="
                px-4 md:px-6 py-2 
                bg-gradient-to-r from-blue-500 to-purple-500 
                text-white text-sm font-medium 
                hover:opacity-90 transition
              "
            >
              Subscribe
            </button>

          </motion.div>

        </div>

      </div>
    </section>
  );
}