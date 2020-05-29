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
                {/* <Box maxW='400px' minW='300px' as={LogoFull} /> */}
                <Stack align='center' spacing='10px' textAlign='center'>
                    <Heading fontSize='42px'>Effortless documentation</Heading>
                    <Subheading lineHeight='2em' opacity={0.7}>
                        Dokz builds an awesome website around your Markdown documents <br/>
                        Using Nextjs and MDX
                    </Subheading>
                </Stack>
                <CtaButton />
                <br />
                <br />
                <Image
                    maxW='900px'
                    w='100%'
                    minW='300px'
                    src='/screen.png'
                />
            </Stack>
        </PageContainer>
    )
}

const Page = () => (
    <Stack spacing='40px'>
        <NavBar
            logo={<Box as={Logo} width='30px' />}
            navs={[
                <a href='https://github.com/remorses/dokz'>Github</a>,
                <a href='/docs'>Demo</a>,
                <a href='/docs'>Docs</a>,
                <CtaButton px='10px' />,
            ]}
        />
        <Hero
            // cta={<EmailForm />}
            direction='column'
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
            heading='The simplest way to write documentation'
            subheading='You can focus on writing markdown, dokz handles styling, sidebar, table of contents and much more'
            steps={[
                {
                    heading: 'Write markdown',
                    subheading:
                        'You can also include your own react components thanks to MDX',
                    image: <img src={isometric_text_icon} />,
                },
                {
                    heading: 'See changes in real time',
                    subheading:
                        'The website is based on Nextjs so you get all its niceties: live reloading, easy configuration and easy deploy',
                    image: <img src={isometric_check_icon} />,
                },
                {
                    heading: 'Deploy the website',
                    subheading:
                        'Dokz export a completely static website you can deploy everywhere',
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
        <Footer
            businessName='Made by @morse__'
            columns={{
                'Where you can find me': [
                    <a href='https://twitter.com/__morse' target='_blank'>
                        Twitter
                    </a>,
                    <a href='https://github.com/remorses/' target='_blank'>
                        Github
                    </a>,
                ],
                Dokz: [
                    <a href='https://github.com/remorses/dokz'>Github</a>,
                    <a href='/docs'>Docs</a>,
                ],
            }}
        />
    </Stack>
)

export default Page
