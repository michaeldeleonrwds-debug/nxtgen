import type { TeamMember } from '../admin/api';

export const teamAvatarPresets: Record<string, { image: string; bio: string; skills: string[]; quote: string }> = {
  'michael de leon': {
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'Architecting distributed platforms, cloud-native backend engines, and reactive frontend experiences. Focused on low-latency systems and database performance.',
    skills: ['System Architecture', 'React & TypeScript', 'MariaDB / MySQL', 'Apache & Linux', 'PHP 8.5+ & Node.js'],
    quote: 'Architecture is not just how components connect, but how gracefully they endure scale.',
  },
  'mc denver alba': {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'Crafting pixel-perfection, micro-interactions, and headless CMS integrations. Specializes in accessible interface choreography and component scalability.',
    skills: ['Design Systems', 'Framer Motion', 'Tailwind CSS', 'Headless CMS', 'Next.js & Vite'],
    quote: 'The interface is the product. Every millisecond of motion should feel organic.',
  },
  'bryl fayosal': {
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'Leading DevOps automation, container pipelines, and edge network delivery. Bridges raw microcontroller telemetry with high-availability cloud servers.',
    skills: ['DevOps & Docker', 'Edge Caching & CDN', 'IoT & Telemetry', 'Cloud Security', 'MariaDB Clusters'],
    quote: 'Zero-downtime is a baseline commitment, not an aspirational goal.',
  },
  'marc paul tuquilar': {
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'Defining the sensory visual tone, brand narratives, and futuristic design languages. Merging 3D aesthetics with intuitive interaction mechanics.',
    skills: ['Visual Identity', 'Design Tokens', 'Product Strategy', '3D / WebGL Concepts', 'Figma Prototyping'],
    quote: 'Great engineering becomes timeless when elevated by intentional visual rhythm.',
  },
};

export const resolveTeamMemberMedia = (member: TeamMember) => {
  const key = member.name.trim().toLowerCase();
  const preset = teamAvatarPresets[key];

  return {
    avatar: member.image_url || preset?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=101010&color=ffffff&bold=true&size=512`,
    bio: member.bio || preset?.bio || 'Core engineer at NXTGen Studio, crafting high-performance digital systems and future-facing user interfaces.',
    skills: preset?.skills || ['React', 'TypeScript', 'Software Architecture', 'Cloud Systems'],
    quote: preset?.quote || 'Engineering high-performance software for brands that move next.',
  };
};
