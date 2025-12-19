"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "@/lib/design-system";
import { 
  Type, 
  Palette, 
  Square, 
  Droplets,
  Circle,
  RectangleHorizontal,
  Hash,
  Pilcrow,
  ALargeSmall,
  WrapText
} from "lucide-react";

export function DesignSystemDemo() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Design System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A consistent design language for Jay's Shop application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Palette
            </CardTitle>
            <CardDescription>Primary and secondary color schemes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Primary Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border" 
                    style={{ backgroundColor: COLORS.primary }}
                  ></div>
                  <div>
                    <p className="font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground">{COLORS.primary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border flex items-center justify-center"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <p className="font-medium">Primary FG</p>
                    <p className="text-xs text-muted-foreground">{COLORS.primaryForeground}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Background Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border" 
                    style={{ backgroundColor: COLORS.background }}
                  ></div>
                  <div>
                    <p className="font-medium">Background</p>
                    <p className="text-xs text-muted-foreground">{COLORS.background}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border" 
                    style={{ backgroundColor: COLORS.foreground, color: COLORS.background }}
                  >
                    <span className="text-xs flex items-center justify-center h-full">Text</span>
                  </div>
                  <div>
                    <p className="font-medium">Foreground</p>
                    <p className="text-xs text-muted-foreground">{COLORS.foreground}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Status Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border" 
                    style={{ backgroundColor: COLORS.success }}
                  ></div>
                  <div>
                    <p className="font-medium">Success</p>
                    <p className="text-xs text-muted-foreground">{COLORS.success}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border" 
                    style={{ backgroundColor: COLORS.warning }}
                  ></div>
                  <div>
                    <p className="font-medium">Warning</p>
                    <p className="text-xs text-muted-foreground">{COLORS.warning}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border" 
                    style={{ backgroundColor: COLORS.error }}
                  ></div>
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-xs text-muted-foreground">{COLORS.error}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border" 
                    style={{ backgroundColor: COLORS.info }}
                  ></div>
                  <div>
                    <p className="font-medium">Info</p>
                    <p className="text-xs text-muted-foreground">{COLORS.info}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
            <CardDescription>Font sizes, weights, and styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Headings</h3>
              <div className="space-y-4">
                <div>
                  <h1 className={`${TYPOGRAPHY.sizes.h1} font-bold`}>Heading 1</h1>
                  <p className="text-xs text-muted-foreground mt-1">{TYPOGRAPHY.sizes.h1}</p>
                </div>
                <div>
                  <h2 className={`${TYPOGRAPHY.sizes.h2} font-bold`}>Heading 2</h2>
                  <p className="text-xs text-muted-foreground mt-1">{TYPOGRAPHY.sizes.h2}</p>
                </div>
                <div>
                  <h3 className={`${TYPOGRAPHY.sizes.h3} font-bold`}>Heading 3</h3>
                  <p className="text-xs text-muted-foreground mt-1">{TYPOGRAPHY.sizes.h3}</p>
                </div>
                <div>
                  <h4 className={`${TYPOGRAPHY.sizes.h4} font-bold`}>Heading 4</h4>
                  <p className="text-xs text-muted-foreground mt-1">{TYPOGRAPHY.sizes.h4}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Body Text</h3>
              <div className="space-y-4">
                <div>
                  <p className={`${TYPOGRAPHY.sizes.body}`}>Regular body text</p>
                  <p className="text-xs text-muted-foreground mt-1">{TYPOGRAPHY.sizes.body}</p>
                </div>
                <div>
                  <p className={`${TYPOGRAPHY.sizes.small}`}>Small text</p>
                  <p className="text-xs text-muted-foreground mt-1">{TYPOGRAPHY.sizes.small}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Font Weights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`${TYPOGRAPHY.weights.regular}`}>Regular (400)</p>
                </div>
                <div>
                  <p className={`${TYPOGRAPHY.weights.medium}`}>Medium (500)</p>
                </div>
                <div>
                  <p className={`${TYPOGRAPHY.weights.semibold}`}>Semibold (600)</p>
                </div>
                <div>
                  <p className={`${TYPOGRAPHY.weights.bold}`}>Bold (700)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spacing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WrapText className="h-5 w-5" />
              Spacing
            </CardTitle>
            <CardDescription>Consistent spacing scale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(SPACING.raw).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-20 font-medium capitalize">{key}</div>
                  <div className="flex-1">
                    <div 
                      className="h-6 bg-primary/20 rounded" 
                      style={{ width: value }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground w-16">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Radius Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5" />
              Border Radius
            </CardTitle>
            <CardDescription>Rounded corner variations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(RADIUS.raw).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-20 font-medium capitalize">{key}</div>
                  <div className="flex-1">
                    <div 
                      className="h-12 w-12 bg-primary/20 border" 
                      style={{ borderRadius: value }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground w-16">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Buttons Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Buttons
            </CardTitle>
            <CardDescription>Interactive elements with consistent styling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Button Sizes</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}