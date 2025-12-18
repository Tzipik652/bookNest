import React, { useState, useEffect, useRef, use } from 'react';
import { BookOpen, Sparkles, Target, Shield, Volume2, Lock, Eye, Star, Zap } from 'lucide-react';
import { Icon } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
interface Sparkle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}
const FallingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span className="inline-block">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) rotate(0deg)' : 'translateY(-30px) rotate(-10deg)',
            transitionDelay: `${i * 30}ms`
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

const PulsingBadge = ({ icon: Icon, text, delay = 0 }: { icon: React.ElementType; text: string; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={`inline-block bg-gradient-to-r from-green-600 via-emerald-400 to-green-600 bg-clip-text text-transparent transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundSize: '200% auto',
        animation: isVisible ? 'shine 3s linear infinite' : 'none'
      }}
    >
      {text}
    </span>
  );
};

const RotatingText = ({ words, className = '' }: { words: string[]; className?: string }) => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${className} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {words[index]}
    </span>
  );
};

const TypewriterText = ({ text, delay = 0, speed = 50 }: { text: string; delay?: number; speed?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, started]);

  return <span>{displayText}<span className="animate-pulse">|</span></span>;
};

const FloatingElement = ({ children, delay = 0, duration = 3 }: { children: React.ReactNode; delay?: number; duration?: number }) => {
  return (
    <div
      className="animate-float"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  );
};

const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      {children}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: React.ElementType; title: string; description: string; delay: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white p-6 rounded-lg shadow-lg transition-all duration-700 border-2 border-transparent ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      } ${isHovered ? 'shadow-2xl scale-105 -translate-y-2 border-green-600' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center transition-all duration-500 ${
            isHovered ? 'scale-110 rotate-12' : ''
          }`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative transition-all duration-700 ${
        isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-95 rotate-3'
      } ${isHovered ? 'scale-105 -translate-y-2' : ''}`}
    >
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
        <div
          className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-500 ${
            isHovered ? 'scale-125 rotate-180' : ''
          }`}
        >
          {number}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-700 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const ShinyText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md transition-all duration-700 border-2 border-green-600 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
    >
      <Icon className="w-5 h-5 text-green-600 animate-pulse" />
      <span className="text-slate-800 font-semibold">{text}</span>
    </div>
  );
};

export function BookNestLanding() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [sparkles, setSparkles] = useState<any>([]);
  const navigate= useNavigate();
  const {t} = useTranslation(["landing"]);
  useEffect(() => {
    setHeroVisible(true);
    
    const newSparkles = Array.from({ length: 20 }, (_, i: number) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes shine {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
            {sparkles.map((sparkle: Sparkle) => (
            <div // @ts-ignore
              key={sparkle.id}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-sparkle"
              style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`
              }}
            />
            ))}
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            <FallingText text={t("hero.title")} delay={200} />
            <RotatingText 
              words={t("hero.rotatingWords", { returnObjects: true }) as string[]}
              className="text-green-600"
            />
            <br />
          </h1>

          <p
            className={`text-xl md:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-700 ${
              heroVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <TypewriterText 
              text={t("hero.subtitle")}
              delay={1000}
              speed={30}
            />
          </p>

          <FloatingElement delay={0.9} duration={4}>
            <button
              className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 animate-gradient ${
                heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: '900ms' }}
              onClick={() => navigate("/login")}
              aria-label={t("hero.cta.main")}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              
           {t("hero.cta.main")}
              <span className="block text-sm font-normal mt-1 opacity-90">{t("hero.cta.sub")}</span>
            </button>
          </FloatingElement>

          <div className="absolute top-1/4 left-10 opacity-20">
            <FloatingElement delay={0} duration={3}>
              <BookOpen className="w-16 h-16 text-green-600" />
            </FloatingElement>
          </div>
          <div className="absolute bottom-1/4 right-10 opacity-20">
            <FloatingElement delay={1} duration={4}>
              <Star className="w-12 h-12 text-emerald-600" />
            </FloatingElement>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              <FallingText text={t("problem.title")} delay={0} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">{t("problem.description")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-600 to-transparent animate-pulse"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <FallingText text={t("features.title")} delay={0} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-center text-xl mb-16 max-w-2xl mx-auto text-green-100">
             {t("features.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon={Target}
              title={t("features.personalization.title")}
              description={t("features.personalization.description")}
              delay={200}
            />
            <FeatureCard
              icon={Sparkles}
              title={t("features.ai.title")}
              description={t("features.ai.description")}
              delay={400}
            />
            <FeatureCard
              icon={Shield}
              title={t("features.transparency.title")}
              description={t("features.transparency.description")}
              delay={600}
            />
            <FeatureCard
              icon={Zap}
              title={t("features.summaries.title")}
              description={t("features.summaries.description")}
              delay={800}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 text-center">
              <FallingText text={t("howItWorks.title")} delay={0} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-center text-xl text-slate-700 mb-16">
              {t("howItWorks.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title={t("howItWorks.steps.one.title")}
              description={t("howItWorks.steps.one.description")}
              delay={200}
            />
            <StepCard
              number="2"
              title={t("howItWorks.steps.two.title")}
              description={t("howItWorks.steps.two.description")}
              delay={400}
            />
            <StepCard
              number="3"
              title={t("howItWorks.steps.three.title")}
              description={t("howItWorks.steps.three.description")}
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-green-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              <FallingText text={t("trust.title")} delay={0} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto mb-8">
             {t("trust.description")} 
            </p>
          </ScrollReveal>
          <ScrollReveal delay={400}>
            <PulsingBadge icon={Shield} text={t("trust.badge")}  />
          </ScrollReveal>
        </div>
      </section>

      {/* Accessibility & Privacy Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 text-center">
              <FallingText text={t("accessibility.title")}  delay={0} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-center text-xl text-slate-700 mb-16 max-w-2xl mx-auto">
              <span className="font-bold text-emerald-600">{t("accessibility.subtitle")} </span>
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Eye}
              title={t("accessibility.items.accessibility.title")} 
              description={t("accessibility.items.accessibility.description")} 
              delay={200}
            />
            <FeatureCard
              icon={Volume2}
              title={t("accessibility.items.audio.title")}
              description={t("accessibility.items.audio.description")}
              delay={400}
            />
            <FeatureCard
              icon={Lock}
              title={t("accessibility.items.privacy.title")}
              description={t("accessibility.items.privacy.description")}
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <FallingText text={t("finalCta.title")} delay={0} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <FloatingElement delay={0} duration={4}>
              <button onClick={()=>navigate("/login")} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-6 rounded-full text-2xl font-bold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 mb-6"
                aria-label={t("finalCta.button")}>
               {t("finalCta.button")}
              </button>
            </FloatingElement>
          </ScrollReveal>
          <ScrollReveal delay={400}>
            <p className="text-green-100 text-lg">
             {t("finalCta.note")}
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
