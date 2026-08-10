require('dotenv').config();
const mongoose = require('mongoose');

const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');

const projects = [
    {
        title: 'AI Landing Page Generator',
        slug: 'ai-landing-page-generator',
        description: 'A 12-agent AutoGen system that generates full landing pages from a prompt.',
        longDescription: 'Multi-agent architecture using AutoGen where specialized agents handle copywriting, layout, design, and code generation collaboratively to produce a complete landing page.',
        techStack: ['Python', 'AutoGen', 'Azure OpenAI', 'DALL-E 3'],
        category: 'AI/ML',
        githubUrl: '',
        liveUrl: '',
        featured: true,
    },
    {
        title: 'RentChat',
        slug: 'rentchat',
        description: 'RAG-based chatbot for lease documents, deployed on Render.',
        longDescription: 'Conversational assistant that lets users query their lease agreements in natural language, built with a RAG pipeline over embedded lease documents.',
        techStack: ['FastAPI', 'LangChain', 'Pinecone', 'PyTorch'],
        category: 'AI/ML',
        githubUrl: '',
        liveUrl: '',
        featured: true,
    },
    {
        title: 'SafeGuard AI',
        slug: 'safeguard-ai',
        description: 'IoT-based field safety design concept for industrial environments.',
        longDescription: 'Conceptual design combining IoT sensors with AI-driven alerting for real-time field safety monitoring.',
        techStack: ['IoT', 'Embedded Systems', 'AI'],
        category: 'Hardware',
        githubUrl: '',
        liveUrl: '',
        featured: true,
    },
];

const blogs = [
    {
        title: 'Debugging PyTorch Memory Issues on Render',
        slug: 'debugging-pytorch-memory-render',
        content: '## The Problem\n\nDeploying RentChat to Render surfaced some tricky memory issues...\n\n(full write-up coming soon)',
        tags: ['deployment', 'pytorch', 'debugging'],
        published: false,
    },
];

const skills = [
    { name: 'Python', category: 'AI/ML', proficiency: 5 },
    { name: 'PyTorch', category: 'AI/ML', proficiency: 4 },
    { name: 'LangChain', category: 'AI/ML', proficiency: 4 },
    { name: 'Node.js', category: 'Web', proficiency: 4 },
    { name: 'Express', category: 'Web', proficiency: 4 },
    { name: 'MongoDB', category: 'Web', proficiency: 4 },
    { name: 'React', category: 'Web', proficiency: 2 },
    { name: 'C (Embedded)', category: 'Embedded', proficiency: 4 },
    { name: 'PIC18F452', category: 'Embedded', proficiency: 3 },
    { name: 'Git', category: 'Tools', proficiency: 4 },
];

const experience = [
    {
        role: 'Generative AI Intern',
        organization: 'SpectoVX Assistive Technology Pvt. Ltd.',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-01'),
        description: 'Built AI Landing Page Generator, RentChat, and SafeGuard AI. Produced full academic report and 19-slide presentation.',
        type: 'Internship',
    },
    {
        role: 'AI/ML Intern',
        organization: 'UPNyX Innovative Solutions',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-12-01'),
        description: 'AI/ML internship focused on applied machine learning projects.',
        type: 'Internship',
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Connected to MongoDB for seeding');

        await Project.deleteMany({});
        await Blog.deleteMany({});
        await Skill.deleteMany({});
        await Experience.deleteMany({});
        console.log('  Cleared existing data');

        await Project.insertMany(projects);
        await Blog.insertMany(blogs);
        await Skill.insertMany(skills);
        await Experience.insertMany(experience);
        console.log(' Seeded projects, blogs, skills, experience');

        await mongoose.disconnect();
        console.log(' Done — disconnected');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();