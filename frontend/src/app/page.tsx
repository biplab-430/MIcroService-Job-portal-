"use client"
import CarrerGuide from '@/components/carrer-guide'
import Hero from '@/components/hero'
import Loading from '@/components/loading'
import ResumeAnalyzer from '@/components/resume-analyzer'
import ResumeBuilder from '@/components/ResumeBuilder'
import { useAppData } from '@/context/AppContext'

const Home = () => {
  const { loading } = useAppData()
  
  if (loading) return <Loading />
  
  return (
    <div>
      <Hero />
      <CarrerGuide />
      <ResumeAnalyzer />
      {/* Your new Resume Builder section
      <ResumeBuilder /> */}
    </div>
  )
}

export default Home