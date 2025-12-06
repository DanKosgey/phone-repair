"use client";

import { motion } from "framer-motion";
import { Smartphone, Bell, Camera, Zap, QrCode, Download, Info, Copy, Check } from "lucide-react";
import { useState } from "react";

export function DownloadAppSection() {
    const features = [
        {
            icon: Bell,
            title: "Push Notifications",
            description: "Get instant updates on your repair status",
        },
        {
            icon: Camera,
            title: "Camera Integration",
            description: "View photos of your repair progress",
        },
        {
            icon: Zap,
            title: "Fast & Secure",
            description: "Lightning-fast performance with secure authentication",
        },
        {
            icon: Smartphone,
            title: "Offline Mode",
            description: "Access your repair history even offline",
        },
    ];

    const [showAndroidInfo, setShowAndroidInfo] = useState(false);
    const [showIOSInfo, setShowIOSInfo] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Function to copy text to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedUrl(text);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                        <Smartphone className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-primary">Download Our App</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Take Us With You
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Track your repairs, browse products, and stay updated on the go with our mobile app
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="grid sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Download buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-wrap gap-4 pt-6"
                        >
                            {/* Android - Direct APK Download */}
                            <div className="relative">
                                <a
                                    href="/downloads/jays-phone-repair.apk"
                                    download
                                    className="group flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-300 hover:scale-105"
                                >
                                    <Download className="w-8 h-8" />
                                    <div className="text-left">
                                        <div className="text-xs opacity-80">Download APK</div>
                                        <div className="text-sm font-semibold">Android App</div>
                                    </div>
                                </a>
                                <button
                                    onClick={() => setShowAndroidInfo(!showAndroidInfo)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs"
                                >
                                    <Info className="w-3 h-3" />
                                </button>
                                
                                {showAndroidInfo && (
                                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-border rounded-lg p-4 shadow-lg z-20">
                                        <p className="text-sm text-muted-foreground">
                                            Download the APK file directly to your Android device. You may need to enable "Install from unknown sources" in your device settings.
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value="https://yourdomain.com/downloads/jays-phone-repair.apk" 
                                                className="flex-1 text-xs p-2 border rounded"
                                            />
                                            <button 
                                                onClick={() => copyToClipboard("https://yourdomain.com/downloads/jays-phone-repair.apk")}
                                                className="p-2 bg-primary text-white rounded hover:bg-primary/90"
                                            >
                                                {copiedUrl === "https://yourdomain.com/downloads/jays-phone-repair.apk" ? 
                                                    <Check className="w-4 h-4" /> : 
                                                    <Copy className="w-4 h-4" />
                                                }
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => setShowAndroidInfo(false)}
                                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* iOS - PWA Installation */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        alert('To install on iPhone:\n1. Open this website in Safari browser\n2. Tap the Share button (square with arrow)\n3. Scroll down and tap "Add to Home Screen"\n4. Tap "Add" - Done!\n\nThe app will appear on your home screen like any other app!');
                                    }}
                                    className="group flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-300 hover:scale-105"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-xs opacity-80">Install on</div>
                                        <div className="text-sm font-semibold">iPhone (PWA)</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setShowIOSInfo(!showIOSInfo)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs"
                                >
                                    <Info className="w-3 h-3" />
                                </button>
                                
                                {showIOSInfo && (
                                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-border rounded-lg p-4 shadow-lg z-20">
                                        <p className="text-sm text-muted-foreground">
                                            On iPhone, open this website in Safari browser, then tap the Share button and select "Add to Home Screen" to install the app.
                                        </p>
                                        <button 
                                            onClick={() => setShowIOSInfo(false)}
                                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Web Version */}
                            <a
                                href="/app"
                                className="group flex items-center gap-3 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 hover:scale-105"
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H19V9Z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs opacity-80">Open in</div>
                                    <div className="text-sm font-semibold">Web Browser</div>
                                </div>
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Right side - Phone mockup with QR code */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative flex justify-center items-center"
                    >
                        <div className="relative">
                            {/* Phone mockup */}
                            <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl">
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                                    {/* Status bar */}
                                    <div className="h-8 bg-primary flex items-center justify-between px-6 text-white text-xs">
                                        <span>9:41</span>
                                        <div className="flex gap-1">
                                            <div className="w-4 h-3 border border-white rounded-sm" />
                                            <div className="w-4 h-3 border border-white rounded-sm" />
                                            <div className="w-4 h-3 border border-white rounded-sm" />
                                        </div>
                                    </div>

                                    {/* App content preview */}
                                    <div className="p-4 space-y-4">
                                        <div className="text-center py-6">
                                            <h3 className="text-2xl font-bold text-primary mb-2">Jay&apos;s Phone Repair</h3>
                                            <p className="text-sm text-gray-600">Welcome back!</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-primary/10 rounded-xl p-4 text-center">
                                                <div className="text-2xl mb-2">🔍</div>
                                                <div className="text-xs font-semibold">Track Repair</div>
                                            </div>
                                            <div className="bg-secondary/10 rounded-xl p-4 text-center">
                                                <div className="text-2xl mb-2">🛍️</div>
                                                <div className="text-xs font-semibold">Shop</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-semibold px-2">Recent Repairs</div>
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-primary">#TKT-001</span>
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded">COMPLETED</span>
                                                </div>
                                                <div className="text-xs font-medium mb-1">iPhone 13 Pro</div>
                                                <div className="text-[10px] text-gray-500">Screen replacement</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating QR code */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="absolute -right-12 top-1/2 -translate-y-1/2 bg-white p-4 rounded-2xl shadow-2xl border border-border"
                            >
                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-24 h-24 text-gray-400" />
                                </div>
                                <p className="text-xs text-center mt-2 font-semibold">Scan to Download</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Additional information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                        Download and install the app directly on your device. No app store required!
                    </p>
                </motion.div>
            </div>
        </section>
    );
}