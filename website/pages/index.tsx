import { Box, Image, Stack } from '@chakra-ui/react'
import {
    Button,
    Footer,
    // Hero,
    Link,
    Heading,
    HowItWorks,
    LandingProvider,
    NavBar,
    PageContainer,
    Section,
    Subheading,
    TestimonialsTweets,
} from 'landing-blocks'
import { GradientCurtains } from 'landing-blocks/dist/decorations'
import React from 'react'
import { Logo } from '../components/Logo'
import isometric_check_icon from '../public/isometric_check_icon.png'
import isometric_code_icon from '../public/isometric_code_icon.png'
import isometric_text_icon from '../public/isometric_text_icon.png'
import NextLink from 'next/link'
import { Bullet } from 'landing-blocks'

const Page = () => (
    <Stack align='stretch' spacing='60px'>
        <NavBar
            logo={<Box as={Logo} width='30px' />}
            navs={[
                <a href='https://github.com/remorses/dokz'>Github</a>,
                // <a href='/docs'>Demo</a>,
                <a href='/docs'>Docs</a>,
                <a href='/blog'>Blog</a>,
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
        <Section bg='rgba(186, 212, 255, .06)'>
            <TestimonialsTweets
                heading='What people say about Dokz'
                subheading='Tweet something mentioning @dokzsite to be listed here!'
                tweets={[
                    'https://twitter.com/__morse/status/1266420689885630464?s=21',
                    'https://twitter.com/mrahmadawais/status/1266643258567950336?s=21',
                    'https://twitter.com/dokzsite/status/1250566800095444992?s=21',
                ]}
            />
        </Section>
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

const CtaButton = (props) => (
    <a href='/docs'>
        <Button {...props}>Quickstart</Button>
    </a>
)

const Hero = (props) => {
    return (
        <PageContainer
            floatingElement={
                <GradientCurtains
                    primary='white'
                    secondary='#48BB79'
                    position='absolute'
                    top='-200px'
                />
            }
            align='center'
            {...props}
        >
            <Stack align='center' spacing='40px'>
                {/* <Box maxW='400px' minW='300px' as={LogoFull} /> */}
                <Stack align='center' spacing='10px' textAlign='center'>
                    <Bullet>Dokz analytics coming soon</Bullet>
                    <Heading fontSize='42px'>Effortless documentation</Heading>
                    <Subheading lineHeight='2em' opacity={0.7}>
                        Build awesome documentation websites using Nextjs and
                        MDX
                        <br />
                        Soon with documentation analytics and management
                        service!
                    </Subheading>
                </Stack>

                <CtaButton />
                {/* <CtaButton /> */}
                <br />
                <br />
                <Image
                    borderRadius='lg'
                    overflow='hidden'
                    maxW='900px'
                    w='100%'
                    minW='300px'
                    shadow='xl'
                    src='/screen.jpg'
                />
            </Stack>
        </PageContainer>
    )
}

export default Page
