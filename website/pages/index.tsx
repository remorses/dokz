import React from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import isometric_text_icon from '../public/isometric_text_icon.png'
import isometric_check_icon from '../public/isometric_check_icon.png'
import isometric_code_icon from '../public/isometric_code_icon.png'


import {
    Hero,
    Heading,
    LandingProvider,
    Subheading,
    Divider,
    Col,
    Feature,
    HowItWorks,
    FeaturesList,
    NavBar,
    Footer,
    Banner,
    Pricing,
    TestimonialsTweets,
    EmailForm,
    Button,
} from 'react-landing'
import { GradientCurtains } from 'react-landing/dist/decorations'
import { Link, Box, ThemeProvider } from '@chakra-ui/core'
import { FiCheck } from 'react-icons/fi'
import { Logo } from '../components/Logo'

const Page = () => (
    <ThemeProvider>
        <LandingProvider black='#222' primary='#2D7FF9'>
            <NavBar
                logo={<Box as={Logo} width='30px' />}
                navs={[
                    <a>Features</a>,
                    <a>Use Cases</a>,
                    <a>Pricing</a>,
                    <a>About Us</a>,
                    <a>Login</a>,
                ]}
            />
            <Hero
                heading='Documentation sites from mdx'
                subheading='Compiles your markdown or mdx files down to a static Next.js site'
                image={<img width='500px' src='/airtable/hero.png' />}
                // cta={<EmailForm />}
                cta={
                    <NextLink href='/docs'>
                        <Button>Quickstart</Button>
                    </NextLink>
                }
                // fingerprint='Already using Airtable? Sign in'
            />
            <Feature
                heading='Generate Documentation sites from mdx'
                subheading='Compiles your markdown or mdx files down to a static Next.js site'
                image={<img src='/airtable/feature1.jpg' width='500px' />}
                flip
            />
            <HowItWorks
                steps={[
                    {
                        heading: 'Write markdown',
                        subheading:
                            'You can also include your own react components thanks to mdx',
                        image: <img src={isometric_text_icon} />,
                    },
                    {
                        heading: 'See website in real time',
                        subheading:
                            'You can also include your own react components thanks to mdx',
                        image: <img src={isometric_check_icon} />,
                    },
                    {
                        heading: 'Deploy',
                        subheading:
                            'You can also include your own react components thanks to mdx',
                        image: <img src={isometric_code_icon} />,
                    },
                ]}
            />
            <TestimonialsTweets
                heading="Don't you trust me?"
                subheading='Trust them'
                tweets={[
                    '933354946111705097',
                    '1246480107604078592',
                    'https://twitter.com/naval/status/806034795658522624?s=21',
                    // '933354946111705097',
                    // '933354946111705097',
                ]}
            />
            <Footer
                businessName='Dokz'
                columns={{
                    Developers: [
                        <a>Quickstart</a>,
                        <a>Documentation</a>,
                        <a>Samples</a>,
                    ],
                    Company: [
                        <a>Quickstart</a>,
                        <a>Documentation</a>,
                        <a>Samples</a>,
                    ],
                    Product: [
                        <a>Quickstart</a>,
                        <a>Documentation</a>,
                        <a>Samples</a>,
                    ],
                }}
            />
        </LandingProvider>
    </ThemeProvider>
)

export default Page
