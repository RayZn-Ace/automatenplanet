import { motion } from "framer-motion";
import { Users } from "lucide-react";

const teamMembers = [
  { name: "Dennis P.", role: "Geschäftsführung" },
  { name: "Ufuk C.", role: "Vertrieb" },
  { name: "Kay E.", role: "Technik & Service" },
  { name: "Raphael K.", role: "Logistik" },
];

const Team = () => {
  return (
    <section id="team" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Unser <span className="text-secondary">Team</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Die Menschen hinter AutomatPlanet – Ihr Ansprechpartner für alle Fragen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm p-8 hover:border-secondary/40 transition-all"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-bold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
