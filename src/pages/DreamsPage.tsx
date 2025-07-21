
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Target, Calendar, Star, Heart, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const dreamSchema = z.object({
  title: z.string().min(1, "Dream title is required"),
  description: z.string().min(1, "Dream description is required"),
  category: z.string().min(1, "Please select a category"),
  timeline: z.string().min(1, "Please select a timeline"),
});

type DreamFormData = z.infer<typeof dreamSchema>;

const DreamsPage = () => {
  const [dreams, setDreams] = useState<DreamFormData[]>([]);
  
  const form = useForm<DreamFormData>({
    resolver: zodResolver(dreamSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      timeline: '',
    },
  });

  const onSubmit = (data: DreamFormData) => {
    console.log('Dream submitted:', data);
    setDreams(prev => [...prev, data]);
    form.reset();
  };

  const categories = [
    { value: 'personal', label: 'Personal Growth' },
    { value: 'career', label: 'Career & Professional' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'financial', label: 'Financial Goals' },
    { value: 'creative', label: 'Creative Projects' },
    { value: 'spiritual', label: 'Spiritual Journey' },
    { value: 'travel', label: 'Travel & Adventure' },
  ];

  const timelines = [
    { value: '1-month', label: '1 Month' },
    { value: '3-months', label: '3 Months' },
    { value: '6-months', label: '6 Months' },
    { value: '1-year', label: '1 Year' },
    { value: '3-years', label: '3 Years' },
    { value: '5-years', label: '5+ Years' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-space-lg max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-space-xl">
          <h1 className="text-display-lg font-display text-text-main mb-space-sm">
            Dreams & Goals Creator
          </h1>
          <p className="text-body-base font-body text-text-muted max-w-2xl mx-auto">
            Share your deepest aspirations and let's discover what truly lights up your soul
          </p>
          <div className="mt-space-sm">
            <p className="text-label-md font-body text-primary">
              ✨ Your journey will be personalized based on your unique blueprint
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-surface border-border-default shadow-card">
            <CardHeader className="pb-space-md">
              <CardTitle className="text-heading-lg font-display text-text-main flex items-center gap-space-sm">
                <Plus className="h-5 w-5 text-primary" />
                Create Your Dream
              </CardTitle>
              <CardDescription className="text-body-base font-body text-text-muted">
                Define your dream with clarity and set yourself up for success
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-space-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-space-md">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-label-md font-body text-text-main">
                          What's Your Dream?
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your dream or aspiration..."
                            className="bg-surface border-border-default text-body-base font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-label-md font-body text-text-main">
                          Why Is This Important?
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe why this dream matters to you and what achieving it would mean..."
                            className="bg-surface border-border-default text-body-base font-body min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-label-md font-body text-text-muted">
                          Paint a vivid picture of what achieving this dream means to you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-label-md font-body text-text-main">
                            Category
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-surface border-border-default text-body-base font-body">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-label-md font-body text-text-main">
                            Timeline
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-surface border-border-default text-body-base font-body">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timelines.map((timeline) => (
                                <SelectItem key={timeline.value} value={timeline.value}>
                                  {timeline.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-space-md pt-space-md">
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark text-text-on-brand font-cormorant font-medium h-12"
                    >
                      <Target className="h-4 w-4 mr-space-sm" />
                      Create Journey
                    </Button>
                    
                    <div className="text-center text-label-md font-body text-text-muted">
                      Or explore with your dream guide
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-border-default text-text-main font-cormorant font-medium h-12"
                    >
                      <Heart className="h-4 w-4 mr-space-sm" />
                      Start Heart-Centered Discovery
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-text-main font-cormorant font-medium h-12"
                    >
                      <Eye className="h-4 w-4 mr-space-sm" />
                      View Journey
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Dreams List */}
          {dreams.length > 0 && (
            <Card className="bg-surface border-border-default shadow-card mt-space-xl">
              <CardHeader className="pb-space-md">
                <CardTitle className="text-heading-lg font-display text-text-main flex items-center gap-space-sm">
                  <Star className="h-5 w-5 text-secondary" />
                  Your Dreams
                </CardTitle>
                <CardDescription className="text-body-base font-body text-text-muted">
                  {dreams.length} dream{dreams.length === 1 ? '' : 's'} in progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-space-md">
                {dreams.map((dream, index) => (
                  <Card key={index} className="bg-surface-elevated border-border-muted shadow-card">
                    <CardContent className="p-space-md">
                      <div className="flex items-start justify-between mb-space-sm">
                        <h3 className="text-heading-md font-display text-text-main">
                          {dream.title}
                        </h3>
                        <span className="px-2 py-1 rounded-xl text-label-sm font-body bg-primary/10 text-primary">
                          {dream.timeline}
                        </span>
                      </div>
                      <p className="text-body-base font-body text-text-muted mb-space-sm">
                        {dream.description}
                      </p>
                      <div className="flex items-center justify-between text-label-md font-body text-text-muted">
                        <span className="capitalize">{dream.category}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dream.timeline}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamsPage;
