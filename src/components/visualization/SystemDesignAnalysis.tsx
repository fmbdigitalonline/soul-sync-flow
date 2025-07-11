import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Home, 
  Eye, 
  Palette,
  Layout,
  Sparkles,
  Star,
  Settings,
  TestTube,
  Users,
  Shield,
  Heart,
  MessageCircle,
  Brain,
  Target,
  User,
  FileText,
  Calendar,
  Search,
  Clock,
  Monitor
} from 'lucide-react';

interface PageAnalysis {
  name: string;
  path: string;
  icon: React.ElementType;
  followsDesignSystem: boolean;
  designPattern: 'MainLayout' | 'Standalone' | 'Custom' | 'Minimal';
  visualStyle: 'Cosmic/Gradient' | 'Clean/Minimal' | 'Functional/Plain' | 'Admin/Dashboard';
  components: string[];
  issues?: string[];
  notes?: string;
}

const SystemDesignAnalysis = () => {
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');
  const [filterBy, setFilterBy] = useState<'all' | 'consistent' | 'inconsistent'>('all');

  const pages: PageAnalysis[] = [
    {
      name: 'Homepage',
      path: '/',
      icon: Home,
      followsDesignSystem: true,
      designPattern: 'MainLayout',
      visualStyle: 'Cosmic/Gradient',
      components: ['MainLayout', 'CosmicCard', 'SoulOrbAvatar', 'RotatingText', 'PersonalizedQuoteDisplay'],
      notes: 'Perfect example of the design system - uses cosmic cards, gradients, and soul theme'
    },
    {
      name: 'Authentication',
      path: '/auth',
      icon: Shield,
      followsDesignSystem: false,
      designPattern: 'Standalone',
      visualStyle: 'Clean/Minimal',
      components: ['Card', 'SoulOrbAvatar', 'LanguageSelector'],
      issues: ['Uses plain Card instead of CosmicCard', 'Missing cosmic/gradient theme'],
      notes: 'Standalone auth page with minimal styling'
    },
    {
      name: 'Dreams',
      path: '/dreams',
      icon: Star,
      followsDesignSystem: true,
      designPattern: 'MainLayout',
      visualStyle: 'Cosmic/Gradient',
      components: ['MainLayout', 'CosmicCard', 'Tabs', 'ErrorBoundary'],
      notes: 'Fully follows the cosmic design system with proper layout'
    },
    {
      name: 'Spiritual Growth',
      path: '/spiritual-growth',
      icon: Heart,
      followsDesignSystem: true,
      designPattern: 'MainLayout',
      visualStyle: 'Cosmic/Gradient',
      components: ['MainLayout', 'CosmicCard', 'GrowthProgramInterface'],
      notes: 'Consistent with soul-themed design system'
    },
    {
      name: 'Soul Companion',
      path: '/companion',
      icon: MessageCircle,
      followsDesignSystem: true,
      designPattern: 'MainLayout',
      visualStyle: 'Cosmic/Gradient',
      components: ['MainLayout', 'CosmicCard', 'BlendInterface'],
      notes: 'Perfect implementation of the design system'
    },
    {
      name: 'Blueprint',
      path: '/blueprint',
      icon: Brain,
      followsDesignSystem: true,
      designPattern: 'MainLayout',
      visualStyle: 'Cosmic/Gradient',
      components: ['MainLayout', 'CosmicCard', 'Tabs', 'BlueprintViewer'],
      notes: 'Consistent cosmic design with proper theming'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      followsDesignSystem: true,
      designPattern: 'MainLayout',
      visualStyle: 'Cosmic/Gradient',
      components: ['MainLayout', 'CosmicCard', 'SoulOrbAvatar'],
      notes: 'Follows the design system consistently'
    },
    {
      name: 'Admin Dashboard',
      path: '/admin',
      icon: Monitor,
      followsDesignSystem: false,
      designPattern: 'MainLayout',
      visualStyle: 'Admin/Dashboard',
      components: ['MainLayout', 'Card', 'Tabs', 'AdminOverviewPanel'],
      issues: ['Uses functional dashboard style instead of cosmic theme', 'Plain cards instead of cosmic cards'],
      notes: 'Intentionally different - admin interface prioritizes functionality over aesthetics'
    },
    {
      name: 'Function Testing',
      path: '/test-functions',
      icon: TestTube,
      followsDesignSystem: false,
      designPattern: 'Custom',
      visualStyle: 'Functional/Plain',
      components: ['FunctionTester', 'Custom gradient backgrounds'],
      issues: ['Custom background gradient instead of using design system', 'Mixed styling approach'],
      notes: 'Testing interface with custom styling - partially follows theme'
    },
    {
      name: 'Test Environment',
      path: '/test-environment',
      icon: Settings,
      followsDesignSystem: true,
      designPattern: 'MainLayout',
      visualStyle: 'Cosmic/Gradient',
      components: ['MainLayout', 'TestingDashboard'],
      notes: 'Follows design system through MainLayout wrapper'
    },
    {
      name: '404 Not Found',
      path: '/404',
      icon: AlertTriangle,
      followsDesignSystem: true,
      designPattern: 'Standalone',
      visualStyle: 'Cosmic/Gradient',
      components: ['CosmicCard', 'GradientButton', 'StarField'],
      notes: 'Perfect example of standalone page following design system'
    }
  ];

  const filteredPages = pages.filter(page => {
    if (filterBy === 'consistent') return page.followsDesignSystem;
    if (filterBy === 'inconsistent') return !page.followsDesignSystem;
    return true;
  });

  const consistentCount = pages.filter(p => p.followsDesignSystem).length;
  const inconsistentCount = pages.length - consistentCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <CosmicCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              SoulSync Design System Analysis
            </h1>
            <p className="text-muted-foreground">
              Visual representation of which pages follow the cosmic/soul design theme
            </p>
          </div>
          <Palette className="h-12 w-12 text-primary" />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{consistentCount}</div>
            <div className="text-sm text-muted-foreground">Pages Following Design System</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{inconsistentCount}</div>
            <div className="text-sm text-muted-foreground">Pages Not Following Design System</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{Math.round((consistentCount / pages.length) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Design Consistency</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <div>
            <label className="text-sm font-medium">View Mode:</label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={viewMode === 'details' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('details')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Details
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Filter:</label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={filterBy === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('all')}
              >
                All Pages
              </Button>
              <Button
                variant={filterBy === 'consistent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('consistent')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Consistent
              </Button>
              <Button
                variant={filterBy === 'inconsistent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('inconsistent')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Inconsistent
              </Button>
            </div>
          </div>
        </div>
      </CosmicCard>

      {/* Design System Legend */}
      <CosmicCard className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Layout className="h-5 w-5 mr-2" />
          Design System Components & Patterns
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-green-600">✅ Consistent Elements</h4>
            <ul className="text-sm space-y-1">
              <li>• CosmicCard components</li>
              <li>• MainLayout wrapper</li>
              <li>• Gradient text effects</li>
              <li>• Soul color palette</li>
              <li>• SoulOrbAvatar</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">❌ Inconsistent Elements</h4>
            <ul className="text-sm space-y-1">
              <li>• Plain Card components</li>
              <li>• Custom backgrounds</li>
              <li>• Non-cosmic styling</li>
              <li>• Admin dashboard style</li>
              <li>• Functional over aesthetic</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-blue-600">🎨 Visual Styles</h4>
            <ul className="text-sm space-y-1">
              <li>• <Badge className="bg-purple-100 text-purple-800">Cosmic/Gradient</Badge></li>
              <li>• <Badge className="bg-gray-100 text-gray-800">Clean/Minimal</Badge></li>
              <li>• <Badge className="bg-blue-100 text-blue-800">Admin/Dashboard</Badge></li>
              <li>• <Badge className="bg-orange-100 text-orange-800">Functional/Plain</Badge></li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-purple-600">🏗️ Layout Patterns</h4>
            <ul className="text-sm space-y-1">
              <li>• <Badge variant="outline">MainLayout</Badge></li>
              <li>• <Badge variant="outline">Standalone</Badge></li>
              <li>• <Badge variant="outline">Custom</Badge></li>
              <li>• <Badge variant="outline">Minimal</Badge></li>
            </ul>
          </div>
        </div>
      </CosmicCard>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => {
          const IconComponent = page.icon;
          return (
            <Card key={page.path} className={`p-4 transition-all hover:shadow-lg ${
              page.followsDesignSystem 
                ? 'border-green-200 bg-green-50/50' 
                : 'border-red-200 bg-red-50/50'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5" />
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                  </div>
                  {page.followsDesignSystem ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {page.designPattern}
                  </Badge>
                  <Badge 
                    className={`text-xs ${
                      page.visualStyle === 'Cosmic/Gradient' ? 'bg-purple-100 text-purple-800' :
                      page.visualStyle === 'Clean/Minimal' ? 'bg-gray-100 text-gray-800' :
                      page.visualStyle === 'Admin/Dashboard' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {page.visualStyle}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground mb-2">
                  <strong>Path:</strong> {page.path}
                </div>
                
                {viewMode === 'details' && (
                  <>
                    <div className="text-sm mb-3">
                      <strong>Components:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {page.components.map((comp, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {page.issues && (
                      <div className="text-sm mb-3">
                        <strong className="text-red-600">Issues:</strong>
                        <ul className="list-disc list-inside mt-1 text-red-700">
                          {page.issues.map((issue, idx) => (
                            <li key={idx} className="text-xs">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {page.notes && (
                      <div className="text-sm">
                        <strong>Notes:</strong>
                        <p className="text-muted-foreground mt-1 text-xs">{page.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <CosmicCard className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Design Consistency Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-3">✅ Pages Following Design System</h4>
            <ul className="space-y-2 text-sm">
              {pages.filter(p => p.followsDesignSystem).map(page => (
                <li key={page.path} className="flex items-center gap-2">
                  <page.icon className="h-4 w-4" />
                  <span>{page.name}</span>
                  <Badge variant="outline" className="text-xs">{page.path}</Badge>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-600 mb-3">❌ Pages Needing Updates</h4>
            <ul className="space-y-2 text-sm">
              {pages.filter(p => !p.followsDesignSystem).map(page => (
                <li key={page.path} className="flex items-center gap-2">
                  <page.icon className="h-4 w-4" />
                  <span>{page.name}</span>
                  <Badge variant="outline" className="text-xs">{page.path}</Badge>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <h5 className="font-medium text-amber-800 mb-2">Quick Fixes:</h5>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Replace Card with CosmicCard components</li>
                <li>• Add gradient text effects for headings</li>
                <li>• Use soul color palette consistently</li>
                <li>• Implement MainLayout wrapper where missing</li>
                <li>• Add cosmic-themed backgrounds</li>
              </ul>
            </div>
          </div>
        </div>
      </CosmicCard>
    </div>
  );
};

export default SystemDesignAnalysis;