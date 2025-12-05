"use client";

import { motion } from "framer-motion";
import { Smartphone, Bell, Camera, Zap, QrCode } from "lucide-react";

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
                            <a
                                href="/downloads/jays-phone-repair.apk"
                                download
                                className="group flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-300 hover:scale-105"
                            >
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs opacity-80">Download APK</div>
                                    <div className="text-sm font-semibold">Android App</div>
                                </div>
                            </a>

                            {/* iOS - Add to Home Screen (PWA) */}
                            <button
                                onClick={() => {
                                    alert('On iPhone:\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" - Done!\n\nThe app will appear on your home screen like any other app!');
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
            </div>
        </section>
    );
}
