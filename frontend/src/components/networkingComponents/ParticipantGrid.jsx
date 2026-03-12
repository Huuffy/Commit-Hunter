import { motion } from "framer-motion";
import ParticipantCard from "./ParticipantCard";

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" },
    },
};

function ParticipantGrid({ participants }) {
    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {participants.map((user) => (
                <motion.div key={user._id} variants={itemVariants}>
                    <ParticipantCard user={user} />
                </motion.div>
            ))}
        </motion.div>
    );
}

export default ParticipantGrid;
