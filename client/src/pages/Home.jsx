import React from 'react'
import HeroSection from '../components/HeroSection'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclosiveOffers from '../components/ExclosiveOffers'
import Testmoial from '../components/Testmoial'
import NewsLetter from '../components/NewsLetter'


const Home = () => {
    return (
        <>
            <HeroSection />
            <FeaturedDestination />
            <ExclosiveOffers />
            <Testmoial />
            <NewsLetter />
        </>
    )
}

export default Home
