import { Link } from 'react-router-dom';
import { BookOpen, Heart, Sparkles, Home } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-slate-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-8 w-8 text-green-400" />
                            <span className="text-white text-2xl">BookNest</span>
                        </div>
                        <p className="text-slate-400 max-w-md">
                            Your personal book management and discovery platform. Organize your collection, discover new reads, and get AI-powered recommendations.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/home" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-books" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    My Books
                                </Link>
                            </li>
                            <li>
                                <Link to="/favorites" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    Favorites
                                </Link>
                            </li>
                            <li>
                                <Link to="/recommendations" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    AI Recommendations
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-white mb-4">Features</h3>
                        <ul className="space-y-2">
                            <li className="text-slate-400">Book Discovery</li>
                            <li className="text-slate-400">Personal Collection</li>
                            <li className="text-slate-400">AI Recommendations</li>
                            <li className="text-slate-400">Reading Lists</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        © {currentYear} BookNest. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link
                            to="/privacy-policy"
                            className="text-slate-400 hover:text-green-400 transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms-of-service"
                            className="text-slate-400 hover:text-green-400 transition-colors"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            to="/contact"
                            className="text-slate-400 hover:text-green-400 transition-colors"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
