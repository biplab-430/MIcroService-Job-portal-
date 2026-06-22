"use client"
import { CarrerGuideResponse } from '@/type';
import axios from 'axios';
import { ArrowRight, BookOpen, Briefcase, LightbulbIcon, Loader, Sparkles, SparklesIcon, TargetIcon, TrendingUp, X } from 'lucide-react'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { utils_service } from '@/context/AppContext';
import toast from 'react-hot-toast';

const CarrerGuide = () => {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<CarrerGuideResponse | null>(null)

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSkill()
    }
  }

  const getcarrerGuidance = async () => {
    if (skills.length === 0) {
      toast.error("please Enter atleast one skill");
      return;
    }
    setLoading(true)
    try {
      const { data } = await axios.post(`${utils_service}/api/utilsService/career`, {
        skills: skills
      })
      setResponse(data);
      toast.success("Carrer Guidance Generated");
    } catch (error: any) {
      toast.error(error.response.data.message)

    } finally {
      setLoading(false)
    }
  }

  const resetDialog = () => {
    setSkills([]);
    setCurrentSkill("");
    setResponse(null)
    setOpen(false)
  }
  return (
    <div className='max-w-7xl mx-auto px-4 py-16 border-t border-border/30'>
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 animate-float">
          <Sparkles size={14} className='text-primary animate-pulse' />
          <span className='text-xs font-semibold uppercase tracking-wider text-primary'>AI-Powered Career Guidance</span>
        </div>
        <h2 className='text-3xl md:text-5xl font-black mb-4 tracking-tight text-foreground bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent'>Discover Your Career Path</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Get personalized job recommendations and step-by-step learning roadmaps based on your skills.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size={"lg"} className='gap-2.5 h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium shadow-md shadow-primary/10 transition-all hover:scale-[1.03] active:scale-[0.97] group'>
              <SparklesIcon size={16} className='text-white' />Get Career Guidance
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </DialogTrigger>

          <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-2xl'>
            {
              !response ?
                (<>
                  <DialogHeader>
                    <DialogTitle className='text-2xl font-bold flex items-center gap-2 text-foreground'>
                      <Sparkles className='text-primary' />
                      Tell Us About Your Skills
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Add your technical skills to receive personalized career recommendations and roadmaps.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <Label htmlFor='skill' className="text-sm font-semibold">Add Skills</Label>
                      <div className="flex gap-2">
                        <Input onKeyPress={handleKeyPress}
                          id="skill" placeholder="e.g., React, Node.js, Python, AWS..."
                          value={currentSkill}
                          onChange={e => setCurrentSkill(e.target.value)}
                          className='h-11 rounded-xl bg-background/50 focus-visible:ring-primary'
                        />
                        <Button onClick={addSkill} className='gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-medium transition-all px-6'>Add</Button>
                      </div>
                    </div>
                    {
                      skills.length > 0 && <div className="space-y-2">
                        <Label className="text-sm font-semibold">Your Skills ({skills.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {
                            skills.map((s) => (
                              <div className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary transition-all hover:bg-primary/15" key={s}>
                                <span className='text-xs font-semibold'>{s}</span>
                                <button className='h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/95 flex items-center justify-center transition-colors'
                                  onClick={() => { removeSkill(s) }}>
                                  <X size={12} />
                                </button>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    }
                    <Button onClick={getcarrerGuidance} disabled={loading || skills.length === 0}
                      className='w-full h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]'>{loading ? (<>
                        <Loader size={18} className='animate-spin' />Analyzing Your Skills...
                      </>) : (<>
                        <Sparkles size={18} />Generate Career Guidance
                      </>)}</Button>
                  </div>
                </>) : (
                <div className="animate-fade-in">
                  <DialogHeader className="mb-6">
                    <DialogTitle className='text-2xl font-bold flex items-center gap-2 text-foreground'>
                      <TargetIcon className='text-primary' />Your Personalized Career Guide
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 py-2">
                    {/* summary */}
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-xs">
                      <div className="flex items-start gap-3">
                        <LightbulbIcon size={20} className='text-primary mt-0.5 shrink-0 animate-pulse' />
                        <div>
                          <h3 className='font-bold text-base mb-1.5 text-foreground'>Career Summary</h3>
                          <p className='text-sm leading-relaxed text-muted-foreground'>{response.summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Job Options */}
                    <div>
                      <h3 className='text-lg font-bold mb-4 flex items-center gap-2 text-foreground'>
                        <Briefcase size={18} className='text-primary' />
                        Recommended Career Paths
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {
                          response.jobOptions.map((job, index) => (
                            <div className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 group/card" key={index}>
                              <h4 className="font-bold text-base text-foreground mb-2.5 group-hover/card:text-primary transition-colors">
                                {job.title}
                              </h4>
                              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                                <div>
                                  <span className='font-bold text-foreground mr-1.5'>
                                    Responsibilities:
                                  </span>
                                  <span>
                                    {job.responsibilities}
                                  </span>
                                </div>
                                <div>
                                  <span className='font-bold text-foreground mr-1.5'>Why This Role:</span>
                                  <span>{job.why}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* skills to learn */}
                    <div>
                      <h3 className='text-lg font-bold mb-4 flex items-center gap-2 text-foreground'>
                        <TrendingUp size={18} className='text-primary' />Skills To Enhance Your Career
                      </h3>
                      <div className="space-y-4">
                        {
                          response.skillsToLearn.map((category, index) => (
                            <div className="space-y-2.5" key={index}>
                              <h4 className="font-bold text-sm text-primary tracking-wide uppercase" >
                                {category.category}
                              </h4>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {category.skills.map((skill, sindex) => (
                                  <div className="p-4 rounded-xl bg-accent/40 border border-border/70 text-xs shadow-xs hover:border-primary/20 transition-all" key={sindex}>
                                    <p className='font-bold text-foreground text-sm mb-1.5'>{skill.title}</p>
                                    <p className="text-muted-foreground mb-1">
                                      <span className='font-semibold text-foreground mr-1'>Why:</span>
                                      {skill.why}
                                    </p>
                                    <p className="text-muted-foreground">
                                      <span className='font-semibold text-foreground mr-1'>How:</span>
                                      {skill.how}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* Learning approach */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {response.learningApproach.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl border border-primary/10 bg-primary/5 dark:bg-primary/5 shadow-xs"
                        >
                          <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-foreground">
                            <BookOpen size={18} className="text-primary" />
                            {item.title}
                          </h3>

                          <ul className="space-y-2 text-xs text-muted-foreground">
                            {item.points.map((point, index) => (
                              <li className='flex items-start gap-2' key={index}>
                                <span className='text-primary mt-0.5 font-bold'>•</span>
                                <span className='leading-relaxed'
                                  dangerouslySetInnerHTML={{__html:point}}/>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    
                    <Button onClick={resetDialog} variant={'outline'} className='w-full rounded-xl h-11 border border-border hover:bg-accent/40 text-sm font-semibold transition-all mt-4'>
                      Start New Analysis
                    </Button>
                  </div>
                </div>)
            }
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CarrerGuide;