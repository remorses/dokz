/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { Keyframes } from '@emotion/serialize'
import React, { forwardRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { isFragment } from 'react-is'
import { useCombinedRefs, cloneElement, fadeInUp } from './support'

export type FadedProps = {
    cascade?: boolean
    damping?: number
    duration?: number
    animation?: Keyframes
    threshold?: number
    triggerOnce?: boolean
    children?: any
}

export const Faded = forwardRef(
    (
        {
            cascade = false,
            damping = 0.3,
            duration = 400,
            threshold = 0.15,
            triggerOnce = false,
            animation = fadeInUp,
            children,
            ...rest
        }: FadedProps,
        ref1,
    ) => {
        const [ref, inView] = useInView({ threshold, triggerOnce })
        const combinedRef = useCombinedRefs(ref1, ref)
        function makeAnimated(nodes: React.ReactNode): React.ReactNode {
            if (!nodes) {
                return null
            }

            if (isFragment(nodes)) {
                return jsx(
                    'div',
                    {
                        css: getAnimationCss({ keyframes: animation }),
                    },
                    nodes,
                )
            }

            return React.Children.map(nodes, (node, index) => {
                const childElement = node as React.ReactElement
                const css = [childElement.props.css]
                if (inView) {
                    css.push(
                        getAnimationCss({
                            keyframes: animation,
                            delay: cascade ? index * duration * damping : 0,
                            duration,
                        }),
                    )
                } else {
                    css.push({ opacity: 0 })
                }
                return cloneElement(childElement, {
                    css,
                    // children: makeAnimated(childElement.props.children),
                })
            })
        }
        return (
            <div ref={combinedRef} {...rest}>
                {makeAnimated(children)}
            </div>
        )
    },
)

export function getAnimationCss({
    duration = 1000,
    delay = 0,
    timingFunction = 'ease',
    keyframes = fadeInUp,
    iterationCount = 1,
}) {
    return css`
        animation-duration: ${duration}ms;
        animation-timing-function: ${timingFunction};
        animation-delay: ${delay}ms;
        animation-name: ${keyframes};
        animation-direction: normal;
        animation-fill-mode: both;
        animation-iteration-count: ${iterationCount};
    `
}
