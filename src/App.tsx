import { useRef, useEffect, useState, type SVGProps } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import webMobileImage from './assets/web-mobile.webp';
import cmsNoCodeImage from './assets/CMS & No code.webp';
import arduinoIotImage from './assets/Arduino & Iot.webp';
import designBrandingImage from './assets/Design and Branding.webp';
import siteLogo from './assets/sitelogo.webp';

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

  body {
    background-color: black;
    color: white;
    margin: 0;
    overflow-x: hidden;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  @layer components {
    .liquid-glass { 
      background: rgba(255, 255, 255, 0.01); 
      background-blend-mode: luminosity; 
      backdrop-filter: blur(4px); 
      -webkit-backdrop-filter: blur(4px); 
      border: none; 
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1); 
      position: relative; 
      overflow: hidden; 
    }
    
    .liquid-glass::before { 
      content: ''; 
      position: absolute; 
      inset: 0; 
      border-radius: inherit; 
      padding: 1.4px; 
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.15) 80%, rgba(255, 255, 255, 0.45) 100%); 
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); 
      -webkit-mask-composite: xor; 
      mask-composite: exclude; 
      pointer-events: none; 
    }

    @media (min-width: 640px) {
      .footer-panel::before {
        display: none;
      }
    }
  }
`;

type BrandIconProps = SVGProps<SVGSVGElement>;
type Tech = {
  name: string;
  slug?: string;
  mark?: 'aws';
};

const Instagram = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect width="16" height="16" x="4" y="4" rx="4" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const Twitter = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.9 10.6 21.1 2h-1.7l-6.3 7.5L8.1 2H2.3l7.6 11.1L2.3 22h1.7l6.7-7.9 5.3 7.9h5.8l-7.9-11.4Zm-2.4 2.8-.8-1.1L4.6 3.3h2.7l4.9 7.2.8 1.1 6.4 9.3h-2.7l-5.2-7.5Z" />
  </svg>
);

const Github = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3 .8.1-.7.4-1.1.7-1.3-2.2-.3-4.6-1.1-4.6-5A3.9 3.9 0 0 1 6.9 7c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8V21c0 .3.2.6.8.5A10 10 0 0 0 12 2Z" />
  </svg>
);

const Linkedin = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M6.9 8.9H3.6V20h3.3V8.9ZM5.2 7.4a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM20.4 20v-6.1c0-3-1.6-4.4-3.8-4.4a3.3 3.3 0 0 0-3 1.7V8.9h-3.3V20h3.3v-5.5c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.6 1.8 3V20h3Z" />
  </svg>
);

const Youtube = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4h-.1s-3.8 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2 8.9 2 10.7v1.6c0 1.8.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.6.2 6.6.2s3.8 0 6.7-.3c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.5v-1.6c0-1.8-.2-3.5-.2-3.5ZM10 14.6V8.5l5.3 3.1-5.3 3Z" />
  </svg>
);

const Facebook = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M14.3 8.1V6.7c0-.7.5-.9.9-.9h2.3V2.2L14.4 2c-3.4 0-4.2 2.6-4.2 4.2v1.9H7.5V12h2.7v10h4.1V12h3.1l.5-3.9h-3.6Z" />
  </svg>
);

const TechLogo = ({ tech, className }: { tech: Tech; className: string }) => {
  if (tech.mark === 'aws') {
    return (
      <svg viewBox="0 0 64 64" aria-label={tech.name} className={className}>
        <text x="32" y="34" textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="800" fontFamily="Arial, sans-serif">AWS</text>
        <path d="M18 43c8 6 20 7 30 1" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M47 44l5-2-2 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return <img src={`https://cdn.simpleicons.org/${tech.slug}/white`} alt={tech.name} className={className} />;
};

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeState = useRef<'idle' | 'fadingIn' | 'fadingOut'>('idle');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let fadeAnimation: number | undefined;

    const animateOpacity = (start: number, end: number, duration: number, callback?: () => void) => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        video.style.opacity = String(start + progress * (end - start));
        if (progress < 1) {
          fadeAnimation = window.requestAnimationFrame(step);
        } else if (callback) {
          callback();
        }
      };
      fadeAnimation = window.requestAnimationFrame(step);
    };

    const handleCanPlay = () => {
      if (fadeState.current !== 'idle' && fadeState.current !== 'fadingOut') return;
      video.play().catch((e: unknown) => console.log("Auto-play prevented", e));
      fadeState.current = 'fadingIn';
      animateOpacity(0, 1, 500, () => {
        fadeState.current = 'idle';
      });
    };

    const handleTimeUpdate = () => {
      const remainingTime = video.duration - video.currentTime;
      if (remainingTime <= 0.55 && fadeState.current === 'idle') {
        fadeState.current = 'fadingOut';
        animateOpacity(1, 0, 500);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch((e: unknown) => console.log("Play prevented", e));
        fadeState.current = 'fadingIn';
        animateOpacity(0, 1, 500, () => {
          fadeState.current = 'idle';
        });
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      if (fadeAnimation) window.cancelAnimationFrame(fadeAnimation);
    };
  }, []);

  return (
    <section className="min-h-svh overflow-hidden relative flex flex-col">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover object-bottom"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
        muted
        autoPlay
        playsInline
        preload="auto"
        style={{ opacity: 0 }}
      />
      
      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 sm:py-6 w-full">
        <div className="liquid-glass rounded-2xl sm:rounded-full max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center gap-3">
          <div className="flex items-center min-w-0">
            <img src={siteLogo} alt="NxtGen" className="h-7 sm:h-8 w-auto shrink-0" />
            <div className="hidden md:flex gap-8 ml-8">
              {['Features', 'Services', 'About'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <a href="#contact-form" className="liquid-glass rounded-full px-4 sm:px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-12 text-center -translate-y-[6%] sm:-translate-y-[10%] lg:-translate-y-[20%]">
        <h1 className="text-[clamp(3.75rem,16vw,7rem)] md:text-8xl lg:text-9xl text-white tracking-tight leading-none sm:whitespace-nowrap font-['Instrument_Serif'] font-serif mb-6 sm:mb-8 max-w-[11ch] sm:max-w-none">
          Build what's <em className="italic font-['Instrument_Serif']">next</em>.
        </h1>
        
        <p className="text-white text-sm leading-relaxed px-1 sm:px-4 max-w-lg mt-6">
          Transforming ideas into scalable digital realities. We specialize in custom software, web apps, mobile solutions, and cutting-edge engineering.
        </p>
        
        <a href="#contact-form" className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors mt-6">
          Start a Project
        </a>
      </div>

      {/* Social Footer */}
      <div className="relative z-10 flex flex-wrap justify-center gap-3 sm:gap-4 px-4 pb-8 sm:pb-12 mt-auto">
        {[Instagram, Twitter, Github, Linkedin, Youtube, Facebook, Globe].map((Icon, idx) => (
          <a key={idx} href="#" aria-label={`Social placeholder ${idx + 1}`} className="liquid-glass rounded-full p-3 sm:p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        ))}
      </div>
    </section>
  );
};

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="bg-black pt-20 sm:pt-28 lg:pt-44 pb-8 sm:pb-12 lg:pb-14 px-4 sm:px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-sm tracking-widest uppercase mb-6"
        >
          About Us
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white leading-[1.08] tracking-tight"
        >
          Engineering <span className="font-['Instrument_Serif'] italic text-white/60">solutions </span> for <br className="hidden md:block"/> brands that <span className="font-['Instrument_Serif'] italic text-white/60">innovate, scale, and lead.</span>
        </motion.h2>
      </div>
    </section>
  );
};

const FeaturedVideoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-black pt-6 md:pt-10 pb-16 sm:pb-20 lg:pb-32 px-4 sm:px-6 overflow-hidden">
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.9 }}
        className="max-w-6xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden min-h-[520px] sm:min-h-0 sm:aspect-video relative"
      >
        <video 
          className="w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-10 flex flex-col lg:flex-row justify-between items-stretch lg:items-end gap-4 sm:gap-6">
          <div className="liquid-glass rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full lg:w-auto">
            <p className="text-white/50 text-xs tracking-widest uppercase mb-3">Our Approach</p>
            <p className="text-white text-sm md:text-base leading-relaxed">
              We believe in the power of cutting-edge technology. Every project starts with a complex problem, and every line of code opens a new door to digital transformation.
            </p>
          </div>
          <motion.a
            href="#services"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium shrink-0 w-full lg:w-auto hover:bg-white/5 transition-colors text-center"
          >
            Explore more
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black py-20 sm:py-28 lg:py-40 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white tracking-tight mb-10 sm:mb-16 lg:mb-24"
        >
          Innovation <span className="font-['Instrument_Serif'] italic text-white/40">x </span> Vision
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] relative bg-white/5"
          >
            <video 
              className="absolute inset-0 w-full h-full object-cover"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
              muted
              autoPlay
              loop
              playsInline
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col"
          >
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Tech meets Design</p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Every meaningful digital product begins at the intersection of robust engineering and remarkable user experience. We operate at that crossroads, turning complex requirements into seamless applications that reshape industries.
              </p>
            </div>
            
            <div className="w-full h-px bg-white/10 my-8" />
            
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Agile & Scalable</p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                We believe that the best software emerges when logic meets creativity. Our agile process is designed to uncover technical opportunities and translate them into scalable platforms that perform flawlessly long after launch.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      imageUrl: webMobileImage,
      tag: "Development",
      title: "Web & Mobile Apps",
      description: "Custom software development from the ground up. We build scalable, high-performance web applications and native mobile apps tailored to your business needs."
    },
    {
      imageUrl: cmsNoCodeImage,
      tag: "Platforms",
      title: "CMS & No-Code",
      description: "Empowering your digital presence with expertly crafted WordPress, Webflow, and GoHighLevel (GHL) solutions for rapid growth and easy management."
    },
    {
      imageUrl: arduinoIotImage,
      tag: "Hardware",
      title: "Arduino & IoT",
      description: "Bridging the physical and digital worlds. We design and program custom Arduino and IoT hardware solutions for automation, prototyping, and smart devices."
    },
    {
      imageUrl: designBrandingImage,
      tag: "Creative",
      title: "Design & Branding",
      description: "From striking brand identities to intuitive user interfaces, we obsess over every pixel to deliver visual experiences that feel effortless and look extraordinary."
    }
  ];

  return (
    <section id="services" ref={ref} className="bg-black py-20 sm:py-28 lg:py-40 px-4 sm:px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="flex justify-between items-end gap-6 mb-10 sm:mb-12"
        >
          <h2 className="text-3xl md:text-5xl text-white tracking-tight">What we do</h2>
          <p className="text-white/40 text-sm hidden md:block uppercase tracking-widest">Our services</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {cards.map((card, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.15 * (idx + 1) }}
              className="liquid-glass rounded-2xl sm:rounded-3xl overflow-hidden group flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden bg-white/5">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={card.imageUrl}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              </div>
              
              <div className="p-6 md:p-8 relative z-20 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <p className="uppercase tracking-widest text-white/40 text-xs">{card.tag}</p>
                  <div className="liquid-glass rounded-full p-2 w-max">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-white text-xl md:text-2xl tracking-tight">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ClientReviewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const reviews = [
    {
      quote: "NxtGen turned a messy product idea into a polished platform that felt fast, premium, and ready for real users.",
      client: "Arielle Santos",
      role: "Founder, LaunchPad Studio",
      metric: "3.8x",
      label: "faster launch"
    },
    {
      quote: "The team understood both engineering and brand experience. Every page, flow, and interaction felt intentional.",
      client: "Marco Reyes",
      role: "Operations Lead, Northline",
      metric: "92%",
      label: "workflow clarity"
    },
    {
      quote: "They gave our digital presence the kind of futuristic edge we wanted without making it hard to use.",
      client: "Danica Cruz",
      role: "Creative Director, Signal Haus",
      metric: "24/7",
      label: "stable rollout"
    }
  ];

  return (
    <section ref={ref} className="bg-black py-20 sm:py-28 lg:py-36 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 sm:mb-14"
        >
          <div>
            <p className="text-white/35 text-xs tracking-[0.28em] uppercase mb-4">Client Reviews</p>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-none">
              Built for teams that move next.
            </h2>
          </div>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md">
            Sample client feedback placeholders for now, styled to match the NxtGen launch experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {reviews.map((review, idx) => (
            <motion.article
              key={review.client}
              initial={{ opacity: 0, y: 36 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
              transition={{ duration: 0.7, delay: idx * 0.12 }}
              className="liquid-glass rounded-3xl p-6 sm:p-7 min-h-[320px] flex flex-col justify-between relative"
            >
              <div className="absolute top-5 right-5 text-white/10 text-5xl font-['Instrument_Serif']">"</div>
              <div>
                <div className="mb-8 flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-bold text-white">{review.metric}</span>
                  <span className="text-xs uppercase tracking-[0.22em] text-white/35">{review.label}</span>
                </div>
                <p className="text-white/75 text-base leading-relaxed">"{review.quote}"</p>
              </div>
              <div className="mt-10 pt-5 border-t border-white/10">
                <p className="text-white font-medium">{review.client}</p>
                <p className="text-white/40 text-sm mt-1">{review.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

const PremiumFooter = () => {
  const phrases = [
    "BUILDING DIGITAL EXPERIENCES",
    "ENGINEERING THE FUTURE",
    "DESIGNING WHAT'S NEXT",
    "TURNING IDEAS INTO PRODUCTS",
    "LET'S BUILD SOMETHING GREAT"
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = phrases[phraseIndex];

  const backendTech: Tech[] = [
    { name: "Laravel", slug: "laravel" }, { name: "PHP", slug: "php" },
    { name: "Node.js", slug: "nodedotjs" }, { name: "Python", slug: "python" },
    { name: "MySQL", slug: "mysql" }, { name: "PostgreSQL", slug: "postgresql" },
    { name: "Redis", slug: "redis" }, { name: "MongoDB", slug: "mongodb" },
    { name: "Supabase", slug: "supabase" }, { name: "Firebase", slug: "firebase" },
    { name: "GraphQL", slug: "graphql" }
  ];

  const frontendTech: Tech[] = [
    { name: "React", slug: "react" }, { name: "Next.js", slug: "nextdotjs" },
    { name: "Vue", slug: "vuedotjs" }, { name: "JavaScript", slug: "javascript" },
    { name: "TypeScript", slug: "typescript" }, { name: "Tailwind CSS", slug: "tailwindcss" },
    { name: "HTML5", slug: "html5" }, { name: "Vite", slug: "vite" },
    { name: "Figma", slug: "figma" }
  ];

  const infraTech: Tech[] = [
    { name: "AWS", mark: "aws" }, { name: "Cloudflare", slug: "cloudflare" },
    { name: "Vercel", slug: "vercel" }, { name: "Docker", slug: "docker" },
    { name: "GitHub", slug: "github" }, { name: "Git", slug: "git" },
    { name: "Linux", slug: "linux" }, { name: "Nginx", slug: "nginx" }
  ];

  const ideas = [
    "AI", "AUTOMATION", "PERFORMANCE", "SCALABILITY", 
    "DIGITAL PRODUCTS", "WEB EXPERIENCES", "DESIGN SYSTEMS", 
    "CREATIVE TECHNOLOGY", "INTERACTION", "OPTIMIZATION", 
    "SEO", "DIGITAL MARKETING"
  ];

  const devs = [
    "Michael de Leon",
    "Mc Denver Alba",
    "Bryl Fayosal",
    "Marc Paul Tuquilar"
  ];

  return (
    <footer className="bg-black pt-20 sm:pt-28 lg:pt-48 pb-10 overflow-hidden relative border-t border-white/10">

      {/* 1. Particle Fading Dispersal Typography */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-20 sm:mb-32 lg:mb-48 h-[220px] sm:h-[200px] lg:h-[220px] flex items-center justify-center text-center relative">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h2
              key={phraseIndex}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white absolute w-full max-w-[19rem] sm:max-w-3xl lg:max-w-6xl px-4 flex justify-center flex-wrap gap-x-[0.22em] gap-y-2 leading-[0.95]"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {currentPhrase.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-flex whitespace-nowrap">
                  {word.split("").map((char, charIndex) => {
                    const totalIndex = wordIndex * 5 + charIndex;
                    return (
                      <motion.span
                        key={charIndex}
                        variants={{
                          hidden: { 
                            opacity: 0, 
                            y: (totalIndex % 2 === 0 ? 25 : -25), 
                            x: ((totalIndex % 3) - 1) * 15,
                            filter: "blur(12px)",
                            scale: 0.85
                          },
                          visible: { 
                            opacity: 1, 
                            y: 0, 
                            x: 0,
                            filter: "blur(0px)",
                            scale: 1,
                            transition: { 
                              duration: 0.7, 
                              delay: totalIndex * 0.025,
                              ease: [0.16, 1, 0.3, 1] 
                            }
                          },
                          exit: { 
                            opacity: 0, 
                            y: (totalIndex % 2 === 0 ? -25 : 25), 
                            x: ((totalIndex % 3) - 1) * 20,
                            filter: "blur(12px)",
                            scale: 1.15,
                            transition: { 
                              duration: 0.5, 
                              delay: totalIndex * 0.015,
                              ease: [0.16, 1, 0.3, 1] 
                            }
                          }
                        }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </span>
              ))}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>

      {/* 2 & 3. Backend & Frontend Marquees */}
      <div className="flex flex-col gap-8 sm:gap-12 mb-20 sm:mb-32 lg:mb-48 border-y border-white/5 py-10 sm:py-16 bg-white/[0.01]">
        
        {/* Backend - Moves Left */}
        <div className="relative flex flex-col items-start w-full group">
          <div className="flex overflow-hidden w-full" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <motion.div 
              className="flex gap-10 sm:gap-12 lg:gap-14 items-center min-w-max pr-10 sm:pr-12 lg:pr-14"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 42 }}
            >
              {[...backendTech, ...backendTech].map((tech, i) => (
                <div key={i} className="flex items-center gap-4 sm:gap-5 text-white/50 hover:text-white transition-colors duration-500">
                  <TechLogo tech={tech} className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 opacity-80 group-hover:opacity-100 transition-opacity text-white" />
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">{tech.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Frontend - Moves Right */}
        <div className="relative flex flex-col items-start w-full group">
          <div className="flex overflow-hidden w-full" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <motion.div 
              className="flex gap-10 sm:gap-12 lg:gap-14 items-center min-w-max pr-10 sm:pr-12 lg:pr-14"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 38 }}
            >
              {[...frontendTech, ...frontendTech].map((tech, i) => (
                <div key={i} className="flex items-center gap-4 sm:gap-5 text-white/50 hover:text-white transition-colors duration-500">
                  <TechLogo tech={tech} className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 opacity-80 group-hover:opacity-100 transition-opacity text-white" />
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">{tech.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Engineering Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-32">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-white/40" />
          <p className="text-white/40 text-xs tracking-widest uppercase">Engineering & Design Team</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {devs.map((dev, idx) => (
            <div key={idx} className="liquid-glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/80 uppercase tracking-widest font-bold">
                {dev.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <p className="text-white/90 text-sm font-medium">{dev}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Ideas Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-32 lg:mb-48">
        <p className="text-white/30 text-xs tracking-widest uppercase mb-8 sm:mb-12 text-center">Ideas & Capabilities</p>
        <div className="flex flex-wrap justify-center text-center gap-x-5 sm:gap-x-8 gap-y-3 sm:gap-y-4 md:gap-y-8">
          {ideas.map((idea, i) => (
            <div key={i} className="group relative cursor-pointer">
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-['Instrument_Serif'] italic text-white/40 transition-all duration-500 group-hover:text-white group-hover:translate-x-2 sm:group-hover:translate-x-4 group-hover:-skew-x-6">
                {idea}
              </h3>
              <div className="absolute left-0 -bottom-2 w-0 h-px bg-white transition-all duration-500 group-hover:w-full opacity-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Infrastructure Marquee */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 sm:mb-32">
        <div className="liquid-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 flex flex-col gap-5 sm:gap-6 overflow-hidden">
          <div className="shrink-0 w-full text-left">
            <span className="text-white/50 text-xs tracking-widest uppercase">Infrastructure</span>
          </div>
          <div className="flex overflow-hidden w-full" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
            <motion.div 
              className="flex gap-9 sm:gap-11 lg:gap-12 items-center min-w-max pr-9 sm:pr-11 lg:pr-12"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 44 }}
            >
              {[...infraTech, ...infraTech].map((tech, i) => (
                <div key={i} className="flex items-center gap-4 text-white/55 hover:text-white transition-colors duration-500">
                  <TechLogo tech={tech} className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 opacity-85 transition-opacity text-white" />
                  <span className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">{tech.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* 7. Contact CTA */}
      <div id="contact" className="max-w-7xl mx-auto px-5 sm:px-6 mb-16 sm:mb-32 lg:mb-40 flex flex-col items-center text-center scroll-mt-24">
        <p className="text-white/45 text-xs sm:text-lg md:text-xl mb-3 uppercase tracking-[0.28em]">Have an idea?</p>
        <h2 className="text-5xl sm:text-5xl md:text-7xl lg:text-8xl leading-none font-['Instrument_Serif'] text-white mb-8 sm:mb-10">
          Let's build it.
        </h2>
        <motion.a
          href="#contact-form"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="liquid-glass rounded-full px-8 sm:px-10 py-4 sm:py-5 text-white font-medium hover:bg-white/5 transition-colors flex items-center gap-3 text-sm sm:text-lg mb-10"
        >
          START A PROJECT <ArrowRight className="w-5 h-5" />
        </motion.a>
        <form
          id="contact-form"
          onSubmit={(event) => event.preventDefault()}
          className="liquid-glass rounded-3xl w-full max-w-3xl p-5 sm:p-8 scroll-mt-24 text-left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
              Name
              <input
                type="text"
                name="name"
                placeholder="Your name"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/30 focus:border-white/35"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
              Email
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/30 focus:border-white/35"
              />
            </label>
          </div>
          <label className="mt-4 flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
            Project Details
            <textarea
              name="message"
              placeholder="Tell us what you want to build..."
              rows={5}
              className="resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
          </label>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs leading-relaxed text-white/35">Placeholder form for now. Connect this to email or a backend when ready.</p>
            <button type="submit" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90">
              Send Message
            </button>
          </div>
        </form>
      </div>

      {/* 8. Minimal Navigation & Location */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-x-16 sm:gap-y-14 lg:gap-12 text-sm text-white/55 mb-12 sm:mb-32">
        <div className="footer-panel liquid-glass rounded-2xl p-5 sm:p-0 sm:bg-transparent sm:backdrop-blur-0 sm:shadow-none sm:border-0 flex flex-col gap-4">
          <span className="text-white uppercase tracking-[0.22em] text-xs mb-1 sm:mb-3">Navigation</span>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="#services" className="hover:text-white transition-colors">Work</a>
          <a href="#about" className="hover:text-white transition-colors">Blog</a>
          <a href="#contact-form" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="footer-panel liquid-glass rounded-2xl p-5 sm:p-0 sm:bg-transparent sm:backdrop-blur-0 sm:shadow-none sm:border-0 flex flex-col gap-4">
          <span className="text-white uppercase tracking-[0.22em] text-xs mb-1 sm:mb-3">Social</span>
          <a href="#" className="hover:text-white transition-colors flex items-center justify-between sm:justify-start gap-2">Instagram <ArrowUpRight className="w-3 h-3"/></a>
          <a href="#" className="hover:text-white transition-colors flex items-center justify-between sm:justify-start gap-2">LinkedIn <ArrowUpRight className="w-3 h-3"/></a>
          <a href="#" className="hover:text-white transition-colors flex items-center justify-between sm:justify-start gap-2">Facebook <ArrowUpRight className="w-3 h-3"/></a>
          <a href="#" className="hover:text-white transition-colors flex items-center justify-between sm:justify-start gap-2">GitHub <ArrowUpRight className="w-3 h-3"/></a>
          <a href="#" className="hover:text-white transition-colors flex items-center justify-between sm:justify-start gap-2">YouTube <ArrowUpRight className="w-3 h-3"/></a>
        </div>
        <div className="footer-panel liquid-glass rounded-2xl p-5 sm:p-0 sm:bg-transparent sm:backdrop-blur-0 sm:shadow-none sm:border-0 flex flex-col gap-4 sm:col-span-2 lg:col-span-2 lg:text-right">
          <span className="text-white uppercase tracking-[0.22em] text-xs mb-1 sm:mb-3">Headquarters</span>
          <p className="leading-relaxed">
            Cauayan City,<br/>
            Cagayan Valley, Philippines
          </p>
          <div className="mt-auto pt-6 sm:pt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 lg:justify-end text-xs text-white/35">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>&copy; {new Date().getFullYear()} NxtGen Company.</span>
          </div>
        </div>
      </div>

      {/* 9. Final Brand Statement */}
      <div className="w-full overflow-hidden border-t border-white/5 pt-8 sm:pt-10 px-5 sm:px-6">
        <p className="text-center text-[clamp(4.4rem,22vw,18rem)] leading-none font-bold tracking-tight text-white/10 sm:text-white/5 whitespace-nowrap select-none" aria-hidden="true">
          NXTGEN
        </p>
      </div>
      
    </footer>
  );
};

export default function App() {
  return (
    <div className="bg-black text-white min-h-screen selection:bg-white/30 selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      <HeroSection />
      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
      <ClientReviewsSection />
      <PremiumFooter />
    </div>
  );
}
