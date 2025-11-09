import React, { useEffect, useRef, useState } from 'react';
import { SparklesIcon, CalendarIcon, DocumentTextIcon, CheckIcon, ChevronDownIcon, TrendingUpIcon, UsersIcon, EyeIcon } from './icons/Icons';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onPrivacyClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick, onPrivacyClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const sectionsRef = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        // Set loaded state immediately for faster render
        setIsLoaded(true);

        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({ 
                x: event.clientX / window.innerWidth,
                y: event.clientY / window.innerHeight 
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });

        const observeElements = () => {
            sectionsRef.current.forEach(section => {
                if (section) observer.observe(section);
            });
        };

        // Delay observer to ensure elements are rendered
        const timeoutId = setTimeout(observeElements, 100);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, []);
    
    const addToRefs = (el: HTMLElement | null) => {
        if (el && !sectionsRef.current.includes(el)) {
            sectionsRef.current.push(el);
        }
    };
    
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-purple-50 text-gray-900 font-sans overflow-x-hidden">
        <style>{`
            .section-animate {
                opacity: 0;
                transform: translateY(40px);
                transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .section-animate.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            .hero-gradient {
                background: linear-gradient(135deg, 
                    rgba(139, 69, 199, 0.1) 0%, 
                    rgba(59, 130, 246, 0.1) 50%, 
                    rgba(16, 185, 129, 0.1) 100%);
                position: relative;
                overflow: hidden;
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .floating-orb {
                border-radius: 50%;
                filter: blur(40px);
                animation: float 6s ease-in-out infinite;
            }
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
            }
            .text-shimmer {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .hover-lift {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .hover-lift:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            /* React Bits inspired effects */
            .hero-spotlight {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse 50% 80% at 20% 40%, rgba(120, 119, 198, 0.3), transparent),
                           radial-gradient(ellipse 50% 80% at 80% 50%, rgba(255, 119, 198, 0.15), transparent),
                           radial-gradient(ellipse 50% 80% at 40% 80%, rgba(120, 219, 255, 0.15), transparent);
                opacity: 0;
                animation: spotlight 8s ease-in-out infinite;
            }
            @keyframes spotlight {
                0%, 100% { opacity: 0; transform: scale(1) rotate(0deg); }
                50% { opacity: 1; transform: scale(1.1) rotate(1deg); }
            }
            
            .grid-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
                background-size: 50px 50px;
                mask: radial-gradient(ellipse 100% 100% at center, black 40%, transparent 70%);
                -webkit-mask: radial-gradient(ellipse 100% 100% at center, black 40%, transparent 70%);
                animation: grid-move 20s linear infinite;
            }
            @keyframes grid-move {
                0% { transform: translate(0, 0); }
                100% { transform: translate(50px, 50px); }
            }
            
            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, #8b5cf6, #06b6d4);
                border-radius: 50%;
                opacity: 0;
                animation: particle-float 6s ease-in-out infinite;
            }
            @keyframes particle-float {
                0%, 100% { opacity: 0; transform: translateY(0px) rotate(0deg); }
                50% { opacity: 1; transform: translateY(-100px) rotate(180deg); }
            }
            
            .text-gradient-animated {
                background: linear-gradient(45deg, #667eea 0%, #764ba2 25%, #667eea 50%, #764ba2 75%, #667eea 100%);
                background-size: 400% 400%;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient-shift 4s ease-in-out infinite;
            }
            @keyframes gradient-shift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            .cta-glow {
                position: relative;
                overflow: hidden;
            }
            .cta-glow::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: shimmer 2s infinite;
            }
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .morphing-blob {
                position: absolute;
                border-radius: 50%;
                filter: blur(20px);
                animation: blob-morph 8s ease-in-out infinite;
            }
            @keyframes blob-morph {
                0%, 100% { 
                    border-radius: 50% 50% 50% 50%; 
                    transform: rotate(0deg) scale(1); 
                }
                25% { 
                    border-radius: 60% 40% 30% 70%; 
                    transform: rotate(90deg) scale(1.1); 
                }
                50% { 
                    border-radius: 30% 60% 70% 40%; 
                    transform: rotate(180deg) scale(0.9); 
                }
                75% { 
                    border-radius: 70% 30% 50% 50%; 
                    transform: rotate(270deg) scale(1.05); 
                }
            }
            
            .typing-cursor {
                display: inline-block;
                background-color: #667eea;
                margin-left: 0.1rem;
                width: 3px;
                animation: typing-blink 1.2s infinite;
            }
            @keyframes typing-blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .parallax-text {
                transform: translateZ(0);
                animation: parallax-float 6s ease-in-out infinite;
            }
            @keyframes parallax-float {
                0%, 100% { transform: translateY(0px) translateZ(0); }
                50% { transform: translateY(-10px) translateZ(0); }
            }
            
            .magnetic-button {
                transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
            }
            .magnetic-button:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4);
            }
        `}</style>
        
        <div className="relative w-full min-h-screen">
            {/* Dynamic floating orbs */}
            <div 
                className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-blue-500 floating-orb opacity-20 pointer-events-none"
                style={{
                    transform: `translate(${mousePosition.x * 100}px, ${mousePosition.y * 50}px)`
                }}
            />
            <div 
                className="fixed bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-pink-400 to-orange-500 floating-orb opacity-15 pointer-events-none"
                style={{
                    transform: `translate(${-mousePosition.x * 150}px, ${-mousePosition.y * 75}px)`
                }}
            />
            <div 
                className="fixed top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-600 floating-orb opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                    transform: `translate(calc(-50% + ${mousePosition.x * 200}px), calc(-50% + ${mousePosition.y * 100}px))`
                }}
            />

            {/* Enhanced Hero Section with React Bits Effects */}
            <header 
              ref={addToRefs} 
              className="section-animate relative h-screen flex flex-col justify-between text-center px-4 py-8 hero-gradient overflow-hidden"
            >
                {/* Animated Background Effects - Lower Z-index */}
                <div className="hero-spotlight z-0"></div>
                <div className="grid-background z-0"></div>
                
                {/* Morphing Blobs - Behind content */}
                <div className="morphing-blob w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 absolute -top-20 -left-20 z-0"></div>
                <div className="morphing-blob w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 absolute -bottom-20 -right-20 z-0" style={{ animationDelay: '4s' }}></div>
                <div className="morphing-blob w-64 h-64 bg-gradient-to-br from-green-400/10 to-emerald-400/10 absolute top-1/3 left-1/4 z-0" style={{ animationDelay: '2s' }}></div>

                {/* Floating Particles - Behind content */}
                {Array.from({ length: 15 }, (_, i) => (
                    <div 
                        key={i}
                        className="particle absolute z-0"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 6}s`,
                            animationDuration: `${4 + Math.random() * 4}s`
                        }}
                    ></div>
                ))}

                {/* Navigation - Top Section */}
                <nav className="relative z-50 w-full">
                    <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                <SparklesIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <span className="text-lg md:text-xl font-bold text-gradient-animated">Socially</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={onLoginClick}
                                className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={onSignupClick}
                                className="magnetic-button px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg shadow-lg text-sm"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero Content - Center Section */}
                <div className="relative z-40 flex-1 flex flex-col justify-center max-w-5xl mx-auto py-4">
                    {/* Animated Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-lg border border-white/30 rounded-full text-xs font-medium text-gray-700 mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mx-auto">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-2 animate-pulse"></div>
                        <SparklesIcon className="w-3 h-3 text-purple-600 mr-1 animate-bounce" />
                        AI-Powered Content Creation
                        <div className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-xs text-purple-700 font-bold">NEW</div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none">
                        <span className="block text-gray-900">Transform Your</span>
                        <span className="text-gradient-animated block">LinkedIn Presence</span>
                        <span className="typing-cursor"></span>
                    </h1>
                    
                    <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 mb-2 leading-relaxed font-light px-4 -mt-6">
                        Create, schedule, and optimize LinkedIn content that drives 
                        <span className="text-gradient-animated font-medium"> real engagement </span> 
                        and grows your professional network.
                    </p>
                    
                    <p className="max-w-3xl mx-auto text-base md:text-lg text-gray-500 mb-6 px-4">
                        Join thousands of professionals who've boosted their LinkedIn presence with AI-powered content strategy.
                    </p>

                    {/* Enhanced CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 px-4">
                        <button 
                            onClick={onLoginClick}
                            className="group cta-glow magnetic-button w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white text-lg font-bold rounded-2xl shadow-2xl min-w-[240px] relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Launch App
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                                </svg>
                            </span>
                        </button>
                        <button 
                            onClick={onSignupClick}
                            className="magnetic-button w-full sm:w-auto px-8 py-3 bg-white/90 backdrop-blur-lg border-2 border-white/50 text-gray-700 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl min-w-[240px] group"
                        >
                            <span className="flex items-center justify-center">
                                <EyeIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                Start Free Trial
                            </span>
                        </button>
                    </div>
                </div>

                {/* Social Proof - Bottom Section */}
                <div className="relative z-40 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-gray-600 px-4 pb-4">
                    <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <UsersIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-lg font-bold text-gray-900">10K+</div>
                            <div className="text-xs text-gray-500">Users</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                            <EyeIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-lg font-bold text-gray-900">50M+</div>
                            <div className="text-xs text-gray-500">Impressions</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <TrendingUpIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-lg font-bold text-gray-900">300%</div>
                            <div className="text-xs text-gray-500">Growth</div>
                        </div>
                    </div>
                </div>

                {/* Decorative Floating Elements - Lower Z-index */}
                <div className="absolute top-20 md:top-24 left-8 md:left-12 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl opacity-20 morphing-blob z-10" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-24 md:bottom-32 right-8 md:right-16 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-25 morphing-blob z-10" style={{ animationDelay: '3s' }}></div>
                <div className="absolute top-1/3 right-8 md:right-24 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl opacity-30 morphing-blob z-10" style={{ animationDelay: '5s' }}></div>
                <div className="absolute bottom-1/3 left-8 md:left-24 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg opacity-25 morphing-blob z-10" style={{ animationDelay: '2s' }}></div>
            </header>

            <main className="relative z-10">
                {/* Features Section */}
                <section ref={addToRefs} className="section-animate py-24 px-4 bg-white/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-medium text-purple-700 mb-6">
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Powerful Features
                            </div>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Everything You Need to
                                <span className="text-shimmer block">Succeed on LinkedIn</span>
                            </h2>
                            <p className="max-w-3xl mx-auto text-xl text-gray-600">
                                Transform your LinkedIn strategy with AI-powered tools designed for modern professionals
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {[{
                                icon: DocumentTextIcon,
                                title: 'AI Content Creation',
                                desc: 'Generate engaging posts, articles, and comments that resonate with your audience using advanced AI.',
                                gradient: 'from-purple-500 to-pink-500'
                            }, {
                                icon: CalendarIcon,
                                title: 'Smart Scheduling',
                                desc: 'Optimize posting times with AI-driven analytics and maintain consistent presence effortlessly.',
                                gradient: 'from-blue-500 to-cyan-500'
                            }, {
                                icon: TrendingUpIcon,
                                title: 'Analytics & Growth',
                                desc: 'Track performance, understand your audience, and accelerate your professional growth.',
                                gradient: 'from-green-500 to-emerald-500'
                            }].map((feature, index) => (
                                <div key={feature.title} className="hover-lift glass-card rounded-2xl p-8 text-center group">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Feature Showcase */}
                        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                    Create Content That 
                                    <span className="text-shimmer block">Converts</span>
                                </h3>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Our AI understands what works on LinkedIn. Generate posts that drive engagement, 
                                    build relationships, and grow your professional network.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        'Generate posts in your unique voice and style',
                                        'Optimize for maximum engagement and reach',
                                        'Schedule across multiple time zones'
                                    ].map((benefit, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                                <CheckIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={onLoginClick}
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    Try It Now
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="relative">
                                <div className="glass-card rounded-2xl p-8 hover-lift">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
                                            <div>
                                                <div className="h-3 bg-gray-300 rounded w-24 mb-1"></div>
                                                <div className="h-2 bg-gray-200 rounded w-16"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-3 bg-gray-300 rounded w-full"></div>
                                            <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                                            <div className="h-3 bg-gray-300 rounded w-3/5"></div>
                                        </div>
                                        <div className="mt-4 flex space-x-2">
                                            <div className="h-8 bg-blue-100 rounded px-3 flex items-center">
                                                <div className="h-2 bg-blue-400 rounded w-8"></div>
                                            </div>
                                            <div className="h-8 bg-green-100 rounded px-3 flex items-center">
                                                <div className="h-2 bg-green-400 rounded w-6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-20 animate-pulse"></div>
                                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-25 animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section ref={addToRefs} className="section-animate py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full text-sm font-medium text-green-700 mb-6">
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Simple Pricing
                            </div>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Plans That Scale
                                <span className="text-shimmer block">With Your Growth</span>
                            </h2>
                            <p className="max-w-3xl mx-auto text-xl text-gray-600">
                                Start free, upgrade when ready. No hidden fees, cancel anytime.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[{
                                plan: 'Starter', 
                                price: 'Free', 
                                desc: 'Perfect for individuals getting started with LinkedIn growth.',
                                features: ['5 AI Posts/month', 'Basic Scheduling', 'Community Support', 'Basic Analytics'],
                                buttonText: 'Start Free',
                                gradient: 'from-gray-500 to-gray-600'
                            }, {
                                plan: 'Professional', 
                                price: '$29', 
                                desc: 'Ideal for creators and professionals serious about growth.',
                                features: ['Unlimited AI Posts', 'Advanced Scheduling', 'Priority Support', 'Advanced Analytics', 'Content Calendar', 'Team Collaboration'],
                                popular: true,
                                buttonText: 'Start 14-Day Trial',
                                gradient: 'from-purple-600 to-blue-600'
                            }, {
                                plan: 'Enterprise', 
                                price: '$79', 
                                desc: 'Built for teams and agencies managing multiple accounts.',
                                features: ['Everything in Pro', 'Multiple Brand Accounts', 'API Access', 'Custom Integrations', 'Dedicated Support', 'White-label Options'],
                                buttonText: 'Contact Sales',
                                gradient: 'from-orange-500 to-red-600'
                            }].map((tier) => (
                                <div key={tier.plan} className={`relative hover-lift glass-card rounded-3xl p-8 ${tier.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}>
                                    {tier.popular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                                                Most Popular
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.plan}</h3>
                                        <div className="mb-4">
                                            <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                                            {tier.price !== 'Free' && <span className="text-xl text-gray-500">/month</span>}
                                        </div>
                                        <p className="text-gray-600">{tier.desc}</p>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <CheckIcon className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button 
                                        onClick={tier.popular ? onSignupClick : onLoginClick}
                                        className={`w-full py-4 font-semibold rounded-xl transition-all duration-300 ${
                                            tier.popular 
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:-translate-y-1' 
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tier.buttonText}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            <p className="text-gray-600 mb-4">All plans include a 30-day money-back guarantee</p>
                            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                    <span>No setup fees</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                    <span>Cancel anytime</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section ref={addToRefs} className="section-animate py-24 px-4 bg-white/50">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full text-sm font-medium text-orange-700 mb-6">
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Questions & Answers
                            </div>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Frequently Asked
                                <span className="text-shimmer block">Questions</span>
                            </h2>
                            <p className="max-w-2xl mx-auto text-xl text-gray-600">
                                Everything you need to know about Socially and how it works.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[{
                                q: "How does the AI content generation work?",
                                a: "Our AI analyzes millions of high-performing LinkedIn posts to understand what resonates with professional audiences. Simply provide a topic, and it generates engaging, personalized content that matches your voice and industry best practices."
                            }, {
                                q: "Can I connect multiple LinkedIn accounts?",
                                a: "Yes! Our Enterprise plan supports multiple LinkedIn profiles and company pages. Perfect for agencies, social media managers, and teams managing multiple brand accounts from one unified dashboard."
                            }, {
                                q: "What happens if I exceed my post limit?",
                                a: "On the Starter plan, you get 5 AI-generated posts per month. If you reach your limit, you can still create and schedule posts manually, or upgrade to Professional for unlimited AI content generation."
                            }, {
                                q: "Is there a free trial available?",
                                a: "Absolutely! Start with our free Starter plan, or try Professional with a 14-day free trial. No credit card required to get started. Experience the full power of AI-driven LinkedIn growth risk-free."
                            }, {
                                q: "How secure is my LinkedIn data?",
                                a: "Security is our top priority. We use enterprise-grade encryption, comply with GDPR/CCPA regulations, and never store your LinkedIn credentials. Your data is processed securely and deleted after use."
                            }, {
                                q: "Can I cancel my subscription anytime?",
                                a: "Yes, you can cancel anytime directly from your account settings. You'll retain access to premium features until the end of your current billing cycle, and there are no cancellation fees."
                            }].map((faq, index) => (
                                <div key={index} className="glass-card rounded-2xl overflow-hidden hover-lift">
                                    <details className="group">
                                        <summary className="flex items-center justify-between p-8 cursor-pointer">
                                            <h3 className="text-xl font-semibold text-gray-900 pr-8">{faq.q}</h3>
                                            <ChevronDownIcon className="h-6 w-6 text-gray-500 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                                        </summary>
                                        <div className="px-8 pb-8 text-gray-600 leading-relaxed">
                                            <p>{faq.a}</p>
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                 
                {/* Final CTA */}
                <section ref={addToRefs} className="section-animate py-24 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="glass-card rounded-3xl p-12 hover-lift">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-medium text-purple-700 mb-8">
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Ready to Get Started?
                            </div>
                            
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Start Your LinkedIn
                                <span className="text-shimmer block">Growth Journey Today</span>
                            </h2>
                            
                            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
                                Join thousands of professionals who are already transforming their LinkedIn presence with AI-powered content strategy. No credit card required to start.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                                <button 
                                    onClick={onSignupClick}
                                    className="group px-10 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white text-xl font-semibold rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 min-w-[250px]"
                                >
                                    <span className="flex items-center justify-center">
                                        Start Free Trial
                                        <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                                        </svg>
                                    </span>
                                </button>
                                <button 
                                    onClick={onLoginClick}
                                    className="px-10 py-5 bg-white border-2 border-gray-200 text-gray-700 text-xl font-semibold rounded-2xl hover:border-purple-300 hover:text-purple-600 hover:-translate-y-1 transition-all duration-300 min-w-[250px]"
                                >
                                    View Demo
                                </button>
                            </div>

                            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Free 14-day trial</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">No credit card required</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Cancel anytime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modern Footer */}
            <footer className="py-12 px-4 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-6 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-shimmer">Socially</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                            <div className="flex items-center space-x-6 text-gray-600">
                                <button onClick={onPrivacyClick} className="hover:text-gray-900 transition-colors">
                                    Privacy Policy
                                </button>
                                <span>Terms of Service</span>
                                <span>Contact</span>
                            </div>
                            <div className="text-gray-500">
                                &copy; {new Date().getFullYear()} Socially. All rights reserved.
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default LandingPage;