import { Link } from 'react-router-dom';
import { BookOpen, Heart, Sparkles, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation(["footer", "common"]); // טעינת Namespaces
    const currentYear = new Date().getFullYear();
    const commonDir = t('common:dir') as 'rtl' | 'ltr';

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
                            {t("tagline")}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white mb-4">{t("quickLinksTitle")}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/home" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    {t("linkHome")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-books" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {t("linkMyBooks")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/favorites" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    {t("linkFavorites")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/recommendations" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    {t("linkRecommendations")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-white mb-4">{t("featuresTitle")}</h3>
                        <ul className="space-y-2">
                            <li className="text-slate-400">{t("featureDiscovery")}</li>
                            <li className="text-slate-400">{t("featureCollection")}</li>
                            <li className="text-slate-400">{t("featureAI")}</li>
                            <li className="text-slate-400">{t("featureLists")}</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        {t("copyright", { year: currentYear })}
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link
                            to="/privacy-policy"
                            className="text-slate-400 hover:text-green-400 transition-colors"
                        >
                            {t("privacyPolicy")}
                        </Link>
                        <Link
                            to="/terms-of-service"
                            className="text-slate-400 hover:text-green-400 transition-colors"
                        >
                           {t("termsOfService")}
                        </Link>
                        <Link
                            to="/contact"
                            className="text-slate-400 hover:text-green-400 transition-colors"
                        >
                            {t("contact")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
