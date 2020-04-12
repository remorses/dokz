import React, { useState, CSSProperties } from 'react'
import { FiCopy } from 'react-icons/fi'
import lightTheme from 'prism-react-renderer/themes/nightOwlLight'
import darkTheme from 'prism-react-renderer/themes/nightOwl'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import * as ReactLanding from 'react-landing'
import * as ReactLandingDecorations from 'react-landing/dist/decorations'
import { mdx } from '@mdx-js/react'
import * as Chakra from '@chakra-ui/core'
import * as ReactIcons from 'react-icons/md'
import FocusLock from 'react-focus-lock'
import { Flex, Stack, Divider } from '@chakra-ui/core'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { Resizable } from 're-resizable'

const { Box, Button, useClipboard, useColorMode } = Chakra

export const liveEditorStyle: CSSProperties = {
    fontSize: 14,
    overflowX: 'auto',
    margin: 0,
    fontFamily: 'Menlo,monospace',
    overflow: 'hidden',
    padding: '20px',
}

// const highlightStyle = {
//   padding: 20,
//   fontSize: 14,
//   overflow: "auto",
//   lineHeight: "1.5",
//   fontFamily: "Menlo,monospace",
// };

export const liveErrorStyle: CSSProperties = {
    fontFamily: 'Menlo, monospace',
    fontSize: 14,
    padding: '1em',
    overflowX: 'auto',
    color: 'white',
    backgroundColor: 'red',
}

const StarIcon = (props) => {
    return (
        <Box
            m='2px'
            as='svg'
            fill='current'
            size='3'
            viewBox='0 0 24 24'
            {...props}
        >
            <path d='M23.555 8.729a1.505 1.505 0 0 0-1.406-.98h-6.087a.5.5 0 0 1-.472-.334l-2.185-6.193a1.5 1.5 0 0 0-2.81 0l-.005.016-2.18 6.177a.5.5 0 0 1-.471.334H1.85A1.5 1.5 0 0 0 .887 10.4l5.184 4.3a.5.5 0 0 1 .155.543l-2.178 6.531a1.5 1.5 0 0 0 2.31 1.684l5.346-3.92a.5.5 0 0 1 .591 0l5.344 3.919a1.5 1.5 0 0 0 2.312-1.683l-2.178-6.535a.5.5 0 0 1 .155-.543l5.194-4.306a1.5 1.5 0 0 0 .433-1.661z'></path>
        </Box>
    )
}

export const Code = ({ children, className, live, ...rest }) => {
    // console.log({rest, live})
    const code = children.trim()
    const language = className && className.replace(/language-/, '')
    const { onCopy, hasCopied } = useClipboard(code)

    if (live) {
        return (
            <Playground
                className={className}
                live
                children={children}
                {...rest}
            />
        )
    }
    return (
        <Highlight
            {...defaultProps}
            theme={darkTheme}
            code={code}
            language={language}
        >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <Box
                    p='20px'
                    borderRadius='8px'
                    as='pre'
                    className={className}
                    style={{ ...style }}
                    position='relative'
                >
                    <CopyButton
                        onClick={onCopy}
                        position='absolute'
                        top='10px'
                        right='10px'
                    />
                    {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line, key: i })}>
                            {line.map((token, key) => (
                                <span
                                    key={key}
                                    {...getTokenProps({ token, key })}
                                />
                            ))}
                        </div>
                    ))}
                </Box>
            )}
        </Highlight>
    )
}

const CopyButton = (props) => {
    return (
        <Box
            cursor='pointer'
            m='0'
            style={{
                strokeWidth: '1px',
            }}
            size='18px'
            as={FiCopy}
            {...props}
        />
    )
}

export const Playground = ({
    className,
    live = true,
    children,
    mountStylesheet = false,
    previewEnabled = true,
    ...props
}) => {
    const [editorCode, setEditorCode] = useState(children.trim())
    const language = className && className.replace(/language-/, '')
    const [showCode, setShowCode] = useState(!previewEnabled)
    const { onCopy, hasCopied } = useClipboard(editorCode)
    const { colorMode } = useColorMode()
    const themes = { light: lightTheme, dark: darkTheme }
    const theme = themes['dark']
    const [width, setWidth] = React.useState('100%')
    const resizableProps = getResizableProps(width, setWidth)
    const liveProviderProps = {
        theme,
        language,
        code: editorCode,
        transformCode: (code) => '/** @jsx mdx */' + code,
        scope: {
            ...Chakra,
            ...ReactIcons,
            mdx,
            StarIcon,
            FocusLock,
            ...ReactLanding,
            ...ReactLandingDecorations,
        },
        // noInline: true,
        ...props,
    }

    const handleCodeChange = (newCode) => setEditorCode(newCode.trim())

    const editorBar = (
        <>
            <Stack
                spacing='20px'
                h='auto'
                w='100%'
                isInline
                flexDir='row'
                align='center'
                p='10px'
            >
                <Box h='1' flex='1' />
                <Button
                    variant={!showCode ? 'solid' : 'unstyled'}
                    onClick={() => setShowCode(false)}
                    size='sm'
                >
                    preview
                </Button>
                <Button
                    variant={showCode ? 'solid' : 'unstyled'}
                    onClick={() => setShowCode(true)}
                    size='sm'
                >
                    Code
                </Button>
                <CopyButton style={{ strokeWidth: '2px' }} onClick={onCopy} />
            </Stack>
            <Divider m='0' />
        </>
    )

    return (
        <Resizable
            {...resizableProps}
            handleComponent={{ right: <HandleComponent height='100%' /> }}
        >
            <LiveProvider {...liveProviderProps}>
                <Stack
                    w='100%'
                    borderWidth='1px'
                    // borderColor='inherit'
                    borderRadius='8px'
                    overflow='hidden'
                    shadow='lg'
                    spacing='0px'
                    isInline
                >
                    <Stack spacing='0px' flex='1'>
                        {previewEnabled && editorBar}
                        {!showCode && (
                            <Box
                                as={LivePreview}
                                fontFamily='body'
                                p='0px'
                                w='100%'
                                overflow='hidden'
                                // {...props}
                            />
                        )}
                        {showCode && (
                            <LiveEditor
                                onChange={handleCodeChange}
                                style={liveEditorStyle}
                            />
                        )}
                        <LiveError style={liveErrorStyle} />
                    </Stack>
                </Stack>
            </LiveProvider>
        </Resizable>
    )
}

const HandleComponent = (props) => {
    const { colorMode } = useColorMode()
    return (
        <Stack
            width='20px'
            py='10px'
            align='center'
            justify='center'
            borderWidth='1px'
            // borderColor='gray.300'
            bg={{ light: 'gray.100', dark: 'gray.800' }[colorMode]}
            borderRadius='0 4px 4px 0'
            {...props}
        >
            <Box
                width='8px'
                height='40px'
                borderLeft='2px solid'
                borderRight='2px solid'
                borderColor='gray.300'
            />
        </Stack>
    )
}

const getResizableProps = (width, setWidth) => ({
    minWidth: 260,
    maxWidth: '100%',
    size: {
        width: width,
        height: 'auto',
    },
    style: {
        margin: 0,
        marginRight: 'auto',
    },
    enable: {
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
    },
    onResizeStop: (e, direction, ref) => {
        setWidth(ref.style.width)
    },
})
