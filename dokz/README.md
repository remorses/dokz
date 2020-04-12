<div align="center">
    <br/>
    <br/>
    <h1><pre>baby-i-am-faded</pre></h1>
    <p style='width: 400px;'>
    Animates react components when in view, uses `emotion` for the animations code, completely tree shakable, super tiny
    </p>
    <br/>
    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Faded_Zhu.jpg/220px-Faded_Zhu.jpg" />
    <br/>
    <br/>
    <br/>
</div>

## Features

-   🏷 **TypeScript support** - It is written in TypeScript to make it easier and faster to use the library
-   🍃 **Lightweight** - Very little footprint on your project and no other dependencies required
-   ⚙️ **Uses native APIs** - Intersection Observer and CSS Animations are now supported by all major browsers
-   🚀 **Fast** - Buttery smooth experience thanks to the use of native asynchronous APIs and hardware acceleration
-   🌳 **Tree-shakeable** - Only the parts you use will be included in your final bundle

## Demo

You can find a demo website [here](https://baby-i-am-faded.xmorse.now.sh).

## Install

`yarn add baby-i-am-faded @emotion/core`

## Usage

```tsx
import { Faded } from 'baby-i-am-faded'

export const App = () => (
    <Faded damping={0.8}>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)
```

## With other animation

```tsx
import { wobble } from 'baby-i-am-faded/esm/animations' // here are all the animate.css animaitons

export const WithWobble = () => (
    <Faded animation={wobble}>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)
```

## With custom animation

```tsx
import { keyframes } from '@emotion/core'

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translate3d(0px, -20px, 0px);
    }
    to {
        opacity: 1;
        transform: 'none';
    }
`
export const WithWobble = () => (
    <Faded animation={fadeInUp}>
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <Placeholder />
    </Faded>
)
```
