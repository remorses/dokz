import { playgroundRegex } from '../src/plugin/rehype/playground'
import assert from 'assert'

it('playgroundRegex', () => {
    assert.notEqual('<Playground>'.search(playgroundRegex), -1)
    assert.notEqual('<Playground iframe>'.search(playgroundRegex), -1)
    assert.notEqual('<Playground iframe={true}>'.search(playgroundRegex), -1)
    assert.equal('<NotPlayground>'.search(playgroundRegex), -1)
    assert.equal('<PlaygroundNot>'.search(playgroundRegex), -1)
})
