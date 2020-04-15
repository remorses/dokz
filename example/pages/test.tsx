import { DokzProvider, Wrapper } from 'dokz/src'
import App from 'next/app'
import React from 'react'

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

                <style jsx>{`
                    .main {
                        margin: auto;
                        max-width: 420px;
                        padding: 10px;
                    }
                    hr {
                        width: 100px;
                        border-width: 0;
                        margin: 20px auto;
                        text-align: center;
                    }
                    hr::before {
                        content: '***';
                        color: #ccc;
                    }
                `}</style>
            </div>
        </Wrapper>
    )
}

const P = ({ children }) => (
    <p>
      {children}
      <style jsx>{`
        p {
          font: 13px Helvetica, Arial;
          margin: 10px 0;
        }
      `}</style>
    </p>
  )

const Post = ({ title, children }) => (
  <div className="main">
    <h1>{title}</h1>
    {children}
    <style jsx>{`
      .main {
        font: 15px Helvetica, Arial;
        border: 1px solid #eee;
        padding: 0 10px;
      }
      h1 {
        font-size: 16px;
        font-weight: bold;
        margin: 10px 0;
      }
    `}</style>
  </div>
)