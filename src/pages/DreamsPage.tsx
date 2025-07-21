
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Plus, Target, Calendar, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const dreamSchema = z.object({
  title: z.string().min(1, "Dream title is required"),
  description: z.string().min(1, "Dream description is required"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
  deadline: z.string().optional(),
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
      priority: '',
      deadline: '',
    },
  });

  const onSubmit = (data: DreamFormData) => {
    console.log('Dream submitted:', data);
    setDreams(prev => [...prev, data]);
    form.reset();
  };

  const categories = [
    { value: 'career', label: 'Career & Professional' },
    { value: 'personal', label: 'Personal Growth' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'financial', label: 'Financial Goals' },
    { value: 'creative', label: 'Creative Projects' },
    { value: 'spiritual', label: 'Spiritual Journey' },
    { value: 'travel', label: 'Travel & Adventure' },
  ];

  const priorities = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-space-lg max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-space-xl">
          <h1 className="text-display-lg font-display text-text-main mb-space-sm">
            Dreams & Goals Creator
          </h1>
          <p className="text-body-base font-body text-text-muted max-w-2xl mx-auto">
            Transform your aspirations into actionable goals. Create, organize, and track your dreams with purpose and intention.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
          {/* Dream Creation Form */}
          <Card className="bg-surface border-border-default">
            <CardHeader className="pb-space-md">
              <CardTitle className="text-heading-lg font-display text-text-main flex items-center gap-space-sm">
                <Plus className="h-5 w-5 text-primary" />
                Create New Dream
              </CardTitle>
              <CardDescription className="text-label-md font-body text-text-muted">
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
                          Dream Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your dream or goal..."
                            className="bg-surface border-border-default text-body-base font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-label-md font-body text-text-muted">
                          Give your dream a clear, inspiring title
                        </FormDescription>
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
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your dream in detail. What does success look like?"
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-label-md font-body text-text-main">
                            Priority
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-surface border-border-default text-body-base font-body">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-label-md font-body text-text-main">
                          Target Deadline (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-surface border-border-default text-body-base font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-label-md font-body text-text-muted">
                          Set a realistic timeline for your dream
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-text-on-brand font-cormorant font-medium"
                  >
                    <Target className="h-4 w-4 mr-space-sm" />
                    Create Dream
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Dreams List */}
          <Card className="bg-surface border-border-default">
            <CardHeader className="pb-space-md">
              <CardTitle className="text-heading-lg font-display text-text-main flex items-center gap-space-sm">
                <Star className="h-5 w-5 text-secondary" />
                Your Dreams
              </CardTitle>
              <CardDescription className="text-label-md font-body text-text-muted">
                {dreams.length === 0 
                  ? "Your dreams will appear here as you create them"
                  : `${dreams.length} dream${dreams.length === 1 ? '' : 's'} in progress`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-space-md">
              {dreams.length === 0 ? (
                <div className="text-center py-space-xl">
                  <div className="w-16 h-16 mx-auto mb-space-md bg-surface-elevated rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-text-muted" />
                  </div>
                  <p className="text-body-base font-body text-text-muted">
                    No dreams created yet. Start by creating your first dream!
                  </p>
                </div>
              ) : (
                <div className="space-y-space-md">
                  {dreams.map((dream, index) => (
                    <Card key={index} className="bg-surface-elevated border-border-muted">
                      <CardContent className="p-space-md">
                        <div className="flex items-start justify-between mb-space-sm">
                          <h3 className="text-heading-md font-display text-text-main">
                            {dream.title}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-body ${
                            dream.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                            dream.priority === 'medium' ? 'bg-warning/10 text-warning' :
                            'bg-success/10 text-success'
                          }`}>
                            {dream.priority} priority
                          </span>
                        </div>
                        <p className="text-body-base font-body text-text-muted mb-space-sm">
                          {dream.description}
                        </p>
                        <div className="flex items-center justify-between text-label-md font-body text-text-muted">
                          <span className="capitalize">{dream.category}</span>
                          {dream.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(dream.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DreamsPage;
