import { CircleDot, Layers, Rocket } from "lucide-react"

export const faqs = [
    {
        id: 1,
        question: "What is a Digital Circuit Simulator?",
        answer:
            "A digital circuit simulator is a tool that allows you to design, build, and test digital logic circuits virtually. It helps you understand how logic gates work together to create complex digital systems without needing physical components.",
    },
    {
        id: 2,
        question: "How do I start building circuits?",
        answer:
            "Simply click 'Start Building' to access our circuit builder. Drag logic gates from the toolbar onto the canvas, connect them with wires, add input switches and output displays, then test your circuit by toggling the inputs.",
    },
    {
        id: 3,
        question: "What types of circuits can I build?",
        answer:
            "You can build basic logic circuits (AND, OR, NOT gates), arithmetic circuits (adders, subtractors), sequential circuits (flip-flops, counters), and complex systems. The simulator supports all standard digital logic components.",
    },
    {
        id: 4,
        question: "Is the simulator free to use?",
        answer:
            "Yes! Our digital circuit simulator is completely free to use. No registration required, no hidden fees. Simply open your browser and start building circuits immediately.",
    },
    {
        id: 5,
        question: "Can I save and share my circuits?",
        answer:
            "Currently, circuits are saved in your browser's local storage. You can export circuit designs and share them with others. Future updates will include cloud saving and sharing features.",
    },
    {
        id: 6,
        question: "Is this suitable for educational use?",
        answer:
            "Absolutely! Our simulator is perfect for students learning digital logic, computer science courses, and electronics education. Teachers can use it to demonstrate concepts and students can experiment hands-on.",
    },
]

export const services = [
    {
        id: 1,
        title: "Visual Circuit Design",
        description: "Build circuits with drag-and-drop logic gates, inputs, and outputs using our intuitive interface.",
        icon: CircleDot,
        color: "bg-[#7A7FEE]",
    },
    {
        id: 2,
        title: "Real-time Simulation",
        description: "Test your circuits instantly with live input toggles and see outputs change in real-time.",
        icon: Layers,
        color: "bg-[#7A7FEE]",
    },
    {
        id: 3,
        title: "Interactive Learning",
        description: "Learn digital logic through hands-on experimentation with guided examples and tutorials.",
        icon: Rocket,
        color: "bg-[#7A7FEE]",
    },
]