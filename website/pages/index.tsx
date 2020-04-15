import React from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import isometric_text_icon from '../public/isometric_text_icon.png'
import isometric_check_icon from '../public/isometric_check_icon.png'
import isometric_code_icon from '../public/isometric_code_icon.png'
import hero_image from '../public/landing_illustration.svg'
import { LogoFull, LandingIllustration } from '../svgs/'
import {
    // Hero,
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
    PageContainer,
    SectionTitle,
} from 'react-landing'
import { GradientCurtains } from 'react-landing/dist/decorations'
import { Link, Box, ThemeProvider, Image, Stack } from '@chakra-ui/core'
import { FiCheck, FiCode, FiFileText } from 'react-icons/fi'
import { Logo } from '../components/Logo'

const CtaButton = (props) => (
    <NextLink href='/docs'>
        <Button {...props}>Quickstart</Button>
    </NextLink>
)

const Hero = (props) => {
    return (
        <PageContainer
            floatingElement={
                <GradientCurtains position='absolute' top='-100px' />
            }
            align='center'
            {...props}
        >
            <Stack align='center' spacing='40px'>
                <Box maxW='400px' minW='300px' as={LogoFull} />
                <Stack align='center' spacing='10px' textAlign='center'>
                    <Heading fontSize='42px'>From markdown to websites</Heading>
                    <Subheading opacity={0.7}>
                        Compiles your markdown or mdx files down to a static
                        Next.js site
                    </Subheading>
                </Stack>
                <CtaButton />
                <br />
                <br />
                <Box
                    opacity={0.7}
                    maxW='900px'
                    minW='300px'
                    as={LandingIllustration}
                />
            </Stack>
        </PageContainer>
    )
}

const Page = () => (
    <ThemeProvider>
        <LandingProvider
            fontFamily='Roboto, Arial'
            black='#222'
            primary='#2D7FF9'
        >
            <NavBar
                logo={<Box as={Logo} width='30px' />}
                navs={[
                    <a>Features</a>,
                    <a>Use Cases</a>,
                    <a>Pricing</a>,
                    <a>About Us</a>,
                    <a>Login</a>,
                    <CtaButton px='10px' />,
                ]}
            />
            <Hero
                heading='Documentation sites from mdx'
                subheading='Compiles your markdown or mdx files down to a static Next.js site'
                image={<Image minW='400px' width='700px' src={hero_image} />}
                // cta={<EmailForm />}
                direction='column'
                cta={
                    <NextLink href='/docs'>
                        <Button>Quickstart</Button>
                    </NextLink>
                }
                // fingerprint='Already using Airtable? Sign in'
            />
            {/* <FeaturesList
                centerText
                dark
                bg='gray.900'
                features={[
                    {
                        heading: 'Mdx support',
                        subheading: 'You can use your iwn react components',
                        icon: <Box color='primary' size='60px' as={FiCode} />,
                    },
                    {
                        heading: 'Mdx support',
                        subheading: 'follows the dircetory file system',
                        icon: (
                            <Box
                                style={{ strokeWidth: '1px' }}
                                color='primary'
                                size='60px'
                                as={FiFileText}
                            />
                        ),
                    },
                    {
                        heading: 'Mdx support',
                        subheading: 'follows the dircetory file system',
                        icon: (
                            <Box
                                style={{ strokeWidth: '1px' }}
                                color='primary'
                                size='60px'
                                as={FiFileText}
                            />
                        ),
                    },
                ]}
            /> */}

            <HowItWorks
                heading='The best way to write documentation'
                subheading='The power of react and the simplicity of markdown'
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
            {/* <TestimonialsTweets
                heading="Don't you trust me?"
                subheading='Trust them'
                tweets={[
                    '933354946111705097',
                    '1246480107604078592',
                    'https://twitter.com/naval/status/806034795658522624?s=21',
                    // '933354946111705097',
                    // '933354946111705097',
                ]}
            /> */}
            <Footer businessName='Dokz' columns={{}} />
        </LandingProvider>
    </ThemeProvider>
)

export default Page
