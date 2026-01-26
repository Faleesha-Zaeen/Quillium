'use client'

import { motion } from 'framer-motion'

export const LoadingOrb = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 flex items-center justify-center">
          {/* Middle ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-purple-500/30 flex items-center justify-center"
          >
            {/* Inner orb */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                backgroundColor: ["rgba(0, 255, 255, 0.3)", "rgba(147, 51, 234, 0.3)", "rgba(0, 255, 255, 0.3)"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500/40 to-purple-500/40"
            />
          </motion.div>
        </div>

        {/* Orbiting particles */}
        {[0, 90, 180, 270].map((angle) => (
          <motion.div
            key={angle}
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              animate={{
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: angle / 360
              }}
              className="w-2 h-2 rounded-full bg-green-400 absolute"
              style={{
                transform: `rotate(${angle}deg) translateX(48px)`,
              }}
            />
          </motion.div>
        ))}

        {/* Pulse effect */}
        <motion.div
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full border-2 border-green-500/20"
        />
      </motion.div>
    </div>
  )
}