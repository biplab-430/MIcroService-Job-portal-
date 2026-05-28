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
    <div className='max-w-7xl mx-auto px-4 py-16'>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950 mb-4">
          <Sparkles size={16} className='text-blue-600' />
          <span className='text-sm font-medium'>AI-Power Carrer Guidance</span>
        </div>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>Discover Your Carrer Path</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">Get Personalized Job Recommendation and learnibg Roadmaps based on your skills😜</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size={"lg"} className='gap-2 h-12 px-8'>
              <SparklesIcon size={18} className='text-blue-600' />Get Carrer Guidance
              <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
            {
              !response ?
                (<>
                  <DialogHeader>
                    <DialogTitle className='text-2xl flex items-center gap-2'>
                      <Sparkles className='text-blue-600' />
                      Tell Us about Your Skills
                    </DialogTitle>
                    <DialogDescription>
                      Add Your technical Skills To Receive Personalized Carrer Recomendations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2 ">
                      <Label htmlFor='skill' >Add Skills</Label>
                      <div className="flex gap-2">
                        <Input onKeyPress={handleKeyPress}
                          id="skill" placeholder="e.g. ,React Node.js,python...."
                          value={currentSkill}
                          onChange={e => setCurrentSkill(e.target.value)}
                          className='h-11'
                        />
                        <Button onClick={addSkill} className='gap-2'>Add</Button>
                      </div>
                    </div>
                    {
                      skills.length > 0 && <div className="space-y-2">
                        <Label>Your Skills ({skills.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {
                            skills.map((s) => (
                              <div className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-blue-100 dark:bg-amber-900/30 border border-blue-200 dark:border-blue-800" key={s}>
                                <span className='text-sm font-medium'>{s}</span>
                                <button className='h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center'
                                  onClick={() => { removeSkill(s) }}>
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    }
                    <Button onClick={getcarrerGuidance} disabled={loading || skills.length === 0}
                      className='w-full h-11 gap-2'>{loading ? (<>
                        <Loader size={18} className='animate-spin' />Analyzing Your Skills....
                      </>) : (<>
                        <Sparkles size={18} />Generate carrer Guidance
                      </>)}</Button>
                  </div>
                </>) : (<>
                  <DialogHeader>
                    <DialogTitle className='text-2xl flex items-center gap-2 '>
                      <TargetIcon className='text-blue-600' />Your Personalized carrer Guide
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* summary */}
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <LightbulbIcon size={20} className='text-blue-600 mt-1 shrink-0 ' />
                        <div className="">
                          <h3 className='font-semibold mb-2'>Carrer Summary</h3>
                          <p className='text-sm leading-relaxed opacity-90'>{response.summary}</p>
                        </div>
                      </div>
                    </div>
                    {/* Job Options */}
                    <div className="">
                      <h3 className='text-lg font-semibold mb-3 flex items-center gap-2 '>
                        <Briefcase size={20} className='text-blue-600' />
                        Recommended Carrer Paths
                      </h3>
                      <div className="space-y-3">
                        {
                          response.jobOptions.map((job, index) => (
                            <div className="p-4 rounded-lg border hover:border-blue-500 transition-colors" key={index}>
                              <h4 className="font-semibold text-base mb-2 ">
                                {
                                  job.title
                                }
                              </h4>
                              <div className="space-y-2 text-sm ">
                                <div >
                                  <span className='font-medium opacity-70'>
                                    Responsibilities:
                                  </span>
                                  <span className='opacity-80'>
                                    {job.responsibilities}
                                  </span>
                                </div>
                                <span className='font-medium opacity-70'>Why This Role:</span>
                                <span className='opacity-80'>{job.why}</span>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    {/* skills to learn */}
                    <div className="">
                      <h3 className='text-lg font-semibold mb-3 flex items-center'>
                        <TrendingUp size={20} className='text-blue-600' />Skils To Enhance your Carrier
                      </h3>
                      <div className="space-y-4">
                        {
                          response.skillsToLearn.map((category, index) => (
                            <div className="space-y-2" key={index}>
                              <h4 className="font-semibold text-sm text-blue-600 " >
                                {category.category}
                              </h4>
                              <div className="space-y-2">
                                {category.skills.map((skill, sindex) => (
                                  <div className="p-3 rounded-lg bg-secondary border text-sm" key={sindex}>
                                    <p className='font-medium mb-1 '>{skill.title}</p>

                                    <p className="text-xs opacity-70 mb-1">
                                      <span className='font-medium'>why:</span>
                                      {skill.why}
                                    </p>

                                    <p className="text-xs opacity-70 mb-1">
                                      <span className='font-medium'>how:</span>
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
                    {response.learningApproach.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border bg-blue-950/20 dark:bg-red-950/20"
                      >
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <BookOpen size={20} className="text-blue-700" />
                          {item.title}
                        </h3>

                        <ul className="space-y-2 ">
                          {item.points.map((point, index) => (
                            <li className='text-sm flex items-start gap-2' key={index}>
                              <span className='text-blue-600 mt-0.5'>•</span>
                              <span className='opacity-90'
                              dangerouslySetInnerHTML={{__html:point}}/>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Button onClick={resetDialog} variant={'outline'} className='w-full'>
                      Start New Analysis
                    </Button>
                  </div>
                </>)
            }
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CarrerGuide;