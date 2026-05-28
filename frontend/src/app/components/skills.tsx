"use client"

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useAppData } from '@/context/AppContext'
import { AccountProps } from '@/type'
import { Award, Plus, Sparkles, X } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

const Skills: React.FC<AccountProps> = ({ user, isYourAccount }) => {
    const [skill, setSkill] = useState("")
    const { addskill, btnLoading, removeSkill } = useAppData()

    const addSkillHandler = () => {
        if (!skill.trim()) {
            toast.error("Please enter a skill")
            return
        }

        addskill(skill, setSkill)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addSkillHandler()
        }
    }

    return (
        <div className='max-w-5xl mx-auto px-4 py-6'>
            <Card className='shadow-lg border-2 overflow-hidden'>

                {/* Header */}
                <div className="bg-blue-500 p-6 border-b">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Award size={20} className='text-blue-600' />
                        </div>

                        <div>
                            <CardTitle className='text-2xl text-white'>
                                {isYourAccount
                                    ? "Your Skills"
                                    : `${user.name} Skills`}
                            </CardTitle>

                            {isYourAccount && (
                                <CardDescription className='text-sm mt-1 text-white'>
                                    Showcase your expertise and abilities
                                </CardDescription>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Skills */}
                {isYourAccount && (
                    <div className="flex gap-3 flex-col sm:flex-row p-6">
                        <div className="relative flex-1">
                            <Sparkles
                                size={18}
                                className='absolute left-3 top-1/2 -translate-y-1/2 opacity-50'
                            />

                            <Input
                                type='text'
                                placeholder='e.g. React, Node.js, Python...'
                                className='h-11 pl-10 bg-background'
                                value={skill}
                                onChange={e => setSkill(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                        </div>

                        <Button
                            onClick={addSkillHandler}
                            className='h-11 gap-2 px-6'
                            disabled={!skill.trim() || btnLoading}
                        >
                            <Plus size={18} />
                            Add Skill
                        </Button>
                    </div>
                )}

                {/* Skills Display */}
                <CardContent className='p-6'>
                    {user.skills && user.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {user.skills.map((e, i) => (
                                <div
                                    className="group relative inline-flex items-center gap-2 border-2 rounded-full hover:shadow-sm duration-200 transition-all pl-4 pr-3 py-2"
                                    key={i}
                                >
                                    <span className='font-medium text-sm'>
                                         {e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()}
                                    </span>

                                    {isYourAccount && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant={'destructive'}
                                                    className='h-6 w-6 rounded-full flex items-center justify-center transition-all hover:scale-110'
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Remove Skill?
                                                    </AlertDialogTitle>

                                                    <AlertDialogDescription>
                                                        Are you sure you want to remove{" "}
                                                        <span className='font-semibold'>
                                                            {e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()}
                                                        </span>{" "}
                                                        from your skills?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="
            bg-green-500 text-white border-0
              hover:bg-green-600
             dark:bg-green-600 dark:hover:bg-green-700
        transition-all duration-200
        ">
                                                        No
                                                    </AlertDialogCancel>

                                                    <AlertDialogAction className="
        bg-red-500 
        hover:bg-red-900
        dark:bg-red-600 dark:hover:bg-red-700
        transition-all duration-200
        "
                                                        onClick={() => removeSkill(e)}
                                                    >
                                                        Yes, Remove
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                        <div className="text-center py-12 ">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <Award size={32} className='opacity-40'
                                />
                            </div>
                            <CardDescription className='text-base'>{
                                isYourAccount ? "No Skill Added Yet Start Building Your Profile":"No Skills Add By user"
                                }</CardDescription>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default Skills