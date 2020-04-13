import { Wrapper } from 'dokz/src/components/Wrapper'
import App from 'next/app'
import React from 'react'
import {Box} from '@chakra-ui/core'

export default (props) => {
    return (
        <Wrapper>
            <div className='main'>
                <Post title='My first blog post'>
                    <P>Hello there</P>
                    <P>This is an example of a componentized blog post</P>
                </Post>

                <hr />

                <Post title='My second blog post'>
                    <P>Hello there</P>
                    <P>This is another example.</P>
                    <P>Wa-hoo!</P>
                </Post>

                <hr />

                <Post title='The final blog post'>
                    <P>C’est fin</P>
                </Post>
            </div>
        </Wrapper>
    )
}

const P = ({ children }) => <p>{children}</p>

const Post = ({ title, children }) => (
    <div className='main'>
        <h1>{title}</h1>
        {children}
    </div>
)
