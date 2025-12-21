'use client';

import { Drawer } from 'vaul';
import { FileUser, Download, X, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';

export function ResumeDrawer() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <Drawer.Root shouldScaleBackground>
            <Drawer.Trigger asChild>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <FileUser className="w-4 h-4" />
                    <span>Resume</span>
                </button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Drawer.Content
                    className={`bg-background flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isFullscreen ? 'h-[100dvh]' : 'h-[85dvh]'
                        }`}
                >
                    <div className="p-4 bg-background border-b border-border/50 rounded-t-[10px] flex items-center justify-between sticky top-0 z-10">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4 absolute top-3 left-1/2 -translate-x-1/2" />

                        <div className="flex items-center gap-2 mt-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileUser className="w-5 h-5" />
                                Resume
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 hover:bg-muted rounded-full transition-colors hidden md:block"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            <a
                                href="/remco-stoeten-frontend-engineer-resume.pdf"
                                download
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                                title="Download PDF"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                            <Drawer.Close asChild>
                                <button className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Close resume drawer">
                                    <X className="w-4 h-4" />
                                </button>
                            </Drawer.Close>
                        </div>
                    </div>

                    <div className="flex-1 bg-muted/20 p-4 h-full overflow-hidden">
                        <iframe
                            src="/remco-stoeten-frontend-engineer-resume.pdf"
                            className="w-full h-full rounded-lg border border-border bg-white"
                            title="Resume Protocol"
                        />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
