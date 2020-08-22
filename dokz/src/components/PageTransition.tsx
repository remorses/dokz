/** @jsx jsx */
import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react'
import { jsx, css } from '@emotion/core'
import ColorScheme from 'color-scheme'
import throttle from 'lodash/throttle'
import { useCallback } from 'react'

const DURATION = 400

function step(s, max = DURATION, steps = 5) {
    return max - s * (max / steps)
}

export const makeStyles = (hue = 21) => {
    var scheme = new ColorScheme()
    const colors = scheme
        .from_hue(hue) // Start the scheme
        .scheme('analogic') // Use the 'triade' scheme, that is, colors
        // selected from 3 points equidistant around
        // the color wheel.
        .variation('light')
        .colors()
        .map((x) => '#' + x)
    // console.log(colors)
    return css`
        .top-layer {
            z-index: 4000;
            position: absolute;
            width: 100%;
            height: 100%;
            top: -100%;
            left: 0;
            bottom: auto;
            right: auto;
            background: ${colors[0]};
            transition: all ${DURATION}ms cubic-bezier(0.6, 0.05, 0.4, 1);
            /* opacity: 0.8; */
        }
        .top-layer.active {
            top: 100%;
        }
        .top-layer--2 {
            background: ${colors[1]};

            transition-delay: ${step(1)}ms;
        }
        .top-layer--3 {
            background: ${colors[2]};

            transition-delay: ${step(2)}ms;
        }
        .top-layer--4 {
            background: ${colors[3]};

            transition-delay: ${step(3)}ms;
        }
        .top-layer--5 {
            background: ${colors[4]};

            transition-delay: ${step(4)}ms;
        }
    `
}

export const PageTransition = ({ path }) => {
    // console.log(path)
    const [active, setActive] = useState(false)
    // const setActiveThrottled = useCallback(throttle(setActive, 40), [setActive])
    const styles = useMemo(() => makeStyles(50), [])
    useEffect(() => {
        // alert(path)
        setActive((x) => !x)
    }, [path])
    const base = active ? 'active ' : ''
    return (
        // @ts-ignore
        <div css={styles}>
            <div className={base + 'top-layer'} />
            <div className={base + 'top-layer top-layer--2'} />
            <div className={base + 'top-layer top-layer--3'} />
            <div className={base + 'top-layer top-layer--4'} />
            <div className={base + 'top-layer top-layer--5'} />
        </div>
    )
}
