import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram } from "@fortawesome/free-brands-svg-icons";

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-4 mt-2">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:justify-between">
                    {/* Логотип */}
                    <div className="mb-4 md:mb-0 flex space-x-5">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 bg-white" />
                        <div>
                            <h1 className="text-3xl font-bold">Virtuoso Board</h1>
                            <p className="text-gray-400 mt-2">© 2024 Virtuoso Board. All rights reserved.</p>
                        </div>
                    </div>

                    {/* Посилання */}
                    <div className="flex flex-col md:flex-row md:space-x-8 mb-4 md:mb-0">
                        <a href="#about" className="hover:text-gray-400">About Us</a>
                        <a href="#features" className="hover:text-gray-400">Features</a>
                        <a href="#contact" className="hover:text-gray-400">Contact</a>
                        <a href="#privacy" className="hover:text-gray-400">Privacy Policy</a>
                    </div>

                    {/* Соціальні іконки */}
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" className="text-gray-400 hover:text-blue-600">
                            <FontAwesomeIcon icon={faFacebookF} size="lg" />
                        </a>
                        <a href="https://twitter.com" className="text-gray-400 hover:text-blue-400">
                            <FontAwesomeIcon icon={faTwitter} size="lg" />
                        </a>
                        <a href="https://linkedin.com" className="text-gray-400 hover:text-blue-700">
                            <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
                        </a>
                        <a href="https://instagram.com" className="text-gray-400 hover:text-pink-500">
                            <FontAwesomeIcon icon={faInstagram} size="lg" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;