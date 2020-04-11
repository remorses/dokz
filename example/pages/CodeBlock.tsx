import React, { useState, CSSProperties } from 'react'
import lightTheme from 'prism-react-renderer/themes/nightOwlLight'
import darkTheme from 'prism-react-renderer/themes/nightOwl'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import * as ReactLanding from 'react-landing/src'
import * as ReactLandingDecorations from 'react-landing/src/decorations'
import { mdx } from '@mdx-js/react'
import * as Chakra from '@chakra-ui/core'
import * as ReactIcons from 'react-icons/md'
import FocusLock from 'react-focus-lock'
import { Flex, Stack, Divider } from '@chakra-ui/core'

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

const CopyButton = (props) => (
    <Button
        size='sm'
        // textTransform='uppercase'
        variantColor='teal'
        // fontSize='xs'
        {...props}
    />
)

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

const CodeBlock = ({
    className,
    live = true,
    isManual,
    render,
    children,
    ...props
}) => {
    const [editorCode, setEditorCode] = useState(children.trim())
    const language = className && className.replace(/language-/, '')
    const previewEnabled = language === 'jsx' && live === true
    const [showCode, setShowCode] = useState(!previewEnabled)
    const { onCopy, hasCopied } = useClipboard(editorCode)

    const { colorMode } = useColorMode()
    const themes = { light: lightTheme, dark: darkTheme }
    const theme = themes['dark']
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
        noInline: isManual,
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
                <CopyButton onClick={onCopy}>copy</CopyButton>
            </Stack>
            <Divider m='0' />
        </>
    )

    return (
        <LiveProvider {...liveProviderProps}>
            <Stack
                w='100%'
                border='1px solid'
                borderColor='gray.300'
                borderRadius='8px'
                overflow='hidden'
                shadow='lg'
            >
                {previewEnabled && editorBar}
                {!showCode && (
                    <Box
                        as={LivePreview}
                        fontFamily='body'
                        w='100%'
                        overflow='hidden'
                        {...props}
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
        </LiveProvider>
    )

    // return (
    //   <Highlight
    //     {...defaultProps}
    //     theme={theme}
    //     code={children.trim()}
    //     language={language}
    //   >
    //     {({ className, style, tokens, getLineProps, getTokenProps }) => (
    //       <pre className={className} style={{ ...style, ...highlightStyle }}>
    //         {tokens.map((line, i) => (
    //           <div key={i} {...getLineProps({ line, key: i })}>
    //             {line.map((token, key) => (
    //               <span key={key} {...getTokenProps({ token, key })} />
    //             ))}
    //           </div>
    //         ))}
    //       </pre>
    //     )}
    //   </Highlight>
    // );
}

CodeBlock.defaultProps = {
    mountStylesheet: false,
}

export default CodeBlock
