import React from 'react'
import {
    ThemeProvider,
    CSSReset,
    Box,
    ColorModeProvider,
    Stack,
} from '@chakra-ui/core'
import { Faded } from '../src'
import { wobble, bounceInRight } from '../src/animations'

export default {
    title: 'All',
    component: Faded,
    decorators: [
        (storyFn) => (
            <ThemeProvider>
                <Box maxW='600px' p='30px' border='1px solid red'>
                    <CSSReset />
                    {storyFn()}
                </Box>
            </ThemeProvider>
        ),
    ],
}

const Placeholder = ({ ...props }) => {
    return <Box m='20px' bg='gray.200' width='300px' h='40px' {...props} />
}

export const List = () => (
    <Faded cascade>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)

export const Faster = () => (
    <Faded duration={200} cascade>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)

export const Damped = () => (
    <Faded damping={0.8} cascade>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)

export const usingAs = () => (
    // @ts-ignore
    <Stack as={Faded} damping={.9} cascade>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Stack>
)

export const WithWobble = () => (
    // @ts-ignore
    <Faded animation={wobble} as={Faded} cascade>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)

export const WithBounce = () => (
    // @ts-ignore
    <Faded animation={bounceInRight} as={Faded}  cascade>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)
