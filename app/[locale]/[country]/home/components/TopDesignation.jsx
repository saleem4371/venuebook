"use client";

import { motion } from "framer-motion";

export default function TopDesignation({ users }) {
  return (
    <section className="my-10 px-4 md:px-16">
      <h2 className="text-2xl font-bold mb-6">Top Designations in India</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {users.map((user, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-lg p-4 text-center cursor-pointer hover:scale-105 transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <img
              src={user.image}
              alt={user.name}
              className="w-20 h-20 rounded-full mx-auto object-cover mb-2"
            />
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-500 text-sm">{user.designation}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
